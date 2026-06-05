import express from "express";
import type { IncomingHttpHeaders } from "node:http";
import FormData from "form-data";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => ({
  store: new Map<string, Map<string, Record<string, any>>>(),
  blobs: new Map<string, { buffer: Buffer; contentType: string }>(),
  authUser: { id: "user_1", email: "user_1@example.com", role: "user" },
}));

function collectionStore(name: string) {
  let records = mockState.store.get(name);
  if (!records) {
    records = new Map<string, Record<string, any>>();
    mockState.store.set(name, records);
  }
  return records;
}

function makeSnapshot(id: string, records: Map<string, Record<string, any>>) {
  const ref = makeDocRef("", id, records);
  return {
    id,
    ref,
    exists: records.has(id),
    data: () => records.get(id),
  };
}

function makeDocRef(collectionName: string, id: string, records = collectionStore(collectionName)) {
  return {
    id,
    get: async () => makeSnapshot(id, records),
    set: async (data: Record<string, any>) => {
      records.set(id, { ...data });
    },
    update: async (data: Record<string, any>) => {
      records.set(id, { ...(records.get(id) || {}), ...data });
    },
  };
}

function makeQuery(collectionName: string, clauses: Array<{ field: string; value: unknown }> = []) {
  return {
    where(field: string, op: string, value: unknown) {
      if (op !== "==") throw new Error(`Unsupported test operator ${op}`);
      return makeQuery(collectionName, [...clauses, { field, value }]);
    },
    async get() {
      const records = collectionStore(collectionName);
      const docs = Array.from(records.entries())
        .filter(([, data]) => clauses.every((clause) => data[clause.field] === clause.value))
        .map(([id]) => makeSnapshot(id, records));
      return { docs, size: docs.length };
    },
  };
}

vi.mock("../../../server/data-admin.js", () => ({
  adminDb: {
    collection: (name: string) => ({
      ...makeQuery(name),
      doc: (id?: string) => makeDocRef(name, id || `${name}_generated`),
      add: async (data: Record<string, any>) => {
        const records = collectionStore(name);
        const id = `${name}_${records.size + 1}`;
        records.set(id, { ...data });
        return { id };
      },
    }),
  },
}));

vi.mock("../../../server/middleware/auth.js", () => ({
  authenticateToken: (req: any, _res: any, next: any) => {
    req.auth = { userId: mockState.authUser.id, email: mockState.authUser.email };
    req.user = { ...mockState.authUser };
    next();
  },
}));

vi.mock("../../../server/services/document-storage.js", () => ({
  deletePrivateDocument: vi.fn(async (blobUrl: string) => {
    mockState.blobs.delete(blobUrl);
  }),
  getPrivateDocument: vi.fn(async (blobUrl: string) => {
    const blob = mockState.blobs.get(blobUrl);
    if (!blob) return { statusCode: 404 };

    return {
      statusCode: 200,
      stream: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array(blob.buffer));
          controller.close();
        },
      }),
    };
  }),
  putPrivateDocument: vi.fn(async (pathname: string, body: Buffer, options: { contentType: string }) => {
    const url = `https://private.vercel-storage.com/${pathname}`;
    mockState.blobs.set(url, {
      buffer: Buffer.from(body),
      contentType: options.contentType,
    });

    return {
      pathname,
      url,
      downloadUrl: `${url}?download=1`,
    };
  }),
}));

const { put } = await import("@vercel/blob");
const { default: documentsRouter } = await import("../../../server/routes/documents.js");

function resetStore() {
  mockState.store.clear();
  mockState.blobs.clear();
  mockState.authUser = { id: "user_1", email: "user_1@example.com", role: "user" };
}

function seed(collection: string, id: string, data: Record<string, any>) {
  collectionStore(collection).set(id, { ...data });
}

async function request(path: string, options: RequestInit = {}) {
  const app = express();
  app.use(express.json());
  app.use("/api/documents", documentsRouter);

  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Unable to start test server");

  try {
    const isMultipartForm = typeof (options.body as any)?.submit === "function";
    if (isMultipartForm) {
      return await submitMultipart(address.port, path, options.body as FormData);
    }

    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      ...options,
      headers: {
        Connection: "close",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await response.json();
      return { response, json, body: null };
    }

    const body = await response.arrayBuffer();
    return { response, json: null, body };
  } finally {
    server.closeAllConnections?.();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

beforeEach(resetStore);

function headerReader(headers: IncomingHttpHeaders) {
  return {
    get(name: string) {
      const value = headers[name.toLowerCase()];
      if (Array.isArray(value)) return value.join(", ");
      return value ?? null;
    },
  };
}

function submitMultipart(port: number, path: string, form: FormData) {
  return new Promise<{ response: any; json: any; body: ArrayBuffer | null }>((resolve, reject) => {
    form.submit(
      {
        host: "127.0.0.1",
        port,
        path,
        method: "POST",
        headers: {
          Connection: "close",
        },
      },
      (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        response.on("error", reject);
        response.on("end", () => {
          const body = Buffer.concat(chunks);
          const contentType = String(response.headers["content-type"] || "");
          const json = contentType.includes("application/json") ? JSON.parse(body.toString("utf8")) : null;

          resolve({
            response: {
              status: response.statusCode || 0,
              headers: headerReader(response.headers),
            },
            json,
            body: json ? null : body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
          });
        });
      },
    );
  });
}

function setAuthUser(user: { id: string; email: string; role: string }) {
  mockState.authUser = user;
}

type UploadFile = {
  buffer: Buffer;
  name: string;
  type: string;
};

function makeUploadForm(file: UploadFile, fields: Record<string, string> = {}) {
  const form = new FormData();
  form.append("file", file.buffer, {
    contentType: file.type,
    filename: file.name,
    knownLength: file.buffer.length,
  });
  form.append("name", fields.name || file.name);
  form.append("category", fields.category || "tax");

  Object.entries(fields).forEach(([key, value]) => {
    if (key !== "name" && key !== "category") form.append(key, value);
  });

  return form;
}

function pdfFile(name = "form-16.pdf") {
  return {
    buffer: Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]),
    name,
    type: "application/pdf",
  };
}

describe("document routes", () => {
  it("uploads, lists, downloads, and soft-deletes an allowed private document", async () => {
    seed("user_services", "service_1", {
      userId: "user_1",
      serviceTitle: "ITR Filing",
    });

    const upload = await request("/api/documents/upload", {
      method: "POST",
      body: makeUploadForm(pdfFile(), {
        name: "Form 16",
        category: "form16",
        serviceId: "service_1",
        tags: JSON.stringify(["itr", "salary"]),
      }) as any,
    });

    expect(upload.response.status).toBe(200);
    expect(upload.json.document).toMatchObject({
      userId: "user_1",
      name: "Form 16",
      category: "form16",
      mimeType: "application/pdf",
      serviceId: "service_1",
      userServiceId: "service_1",
    });

    const documentId = upload.json.document.id;
    const stored = collectionStore("documents").get(documentId);
    expect(stored?.blobUrl).toMatch(/^https:\/\/private\.vercel-storage\.com\/documents\/user_1\//);

    const listed = await request("/api/documents");
    expect(listed.response.status).toBe(200);
    expect(listed.json.documents).toHaveLength(1);
    expect(listed.json.documents[0]).toMatchObject({ id: documentId, name: "Form 16" });

    const downloaded = await request(`/api/documents/${documentId}/download`);
    expect(downloaded.response.status).toBe(200);
    expect(downloaded.response.headers.get("content-type")).toContain("application/pdf");
    expect(Array.from(new Uint8Array(downloaded.body!))).toEqual([0x25, 0x50, 0x44, 0x46, 0x2d]);

    const deleted = await request(`/api/documents/${documentId}`, { method: "DELETE" });
    expect(deleted.response.status).toBe(200);
    expect(collectionStore("documents").get(documentId)).toMatchObject({ status: "deleted" });
    expect(mockState.blobs.size).toBe(0);

    const emptyList = await request("/api/documents");
    expect(emptyList.json.documents).toEqual([]);
  });

  it("rejects unsupported uploads and files larger than 10 MB", async () => {
    const textUpload = await request("/api/documents/upload", {
      method: "POST",
      body: makeUploadForm({
        buffer: Buffer.from([1, 2, 3]),
        name: "notes.txt",
        type: "text/plain",
      }) as any,
    });

    expect(textUpload.response.status).toBe(400);
    expect(textUpload.json.error).toContain("Invalid file type");

    const oversized = await request("/api/documents/upload", {
      method: "POST",
      body: makeUploadForm(
        {
          buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
          name: "large.pdf",
          type: "application/pdf",
        },
      ) as any,
    });

    expect(oversized.response.status).toBe(413);
    expect(oversized.json.error).toContain("10 MB");
  });

  it("compresses image uploads through the private storage adapter", async () => {
    const onePixelPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      "base64",
    );

    const upload = await request("/api/documents/upload", {
      method: "POST",
      body: makeUploadForm(
        {
          buffer: onePixelPng,
          name: "receipt.png",
          type: "image/png",
        },
        {
          name: "Receipt",
          category: "receipts",
        },
      ) as any,
    });

    expect(upload.response.status).toBe(200);
    expect(upload.json.document).toMatchObject({
      name: "Receipt",
      mimeType: "image/jpeg",
    });

    const stored = collectionStore("documents").get(upload.json.document.id);
    expect(stored?.size).toBeGreaterThan(0);
    expect(mockState.blobs.get(stored?.blobUrl)?.contentType).toBe("image/jpeg");
  });

  it("keeps registered metadata linked to the owning user and trusted blob URL", async () => {
    seed("profiles", "profile_1", { userId: "user_1" });
    seed("user_services", "service_1", { userId: "user_1" });

    const registered = await request("/api/documents/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Registered PDF",
        url: "https://private.vercel-storage.com/documents/user_1/doc/manual.pdf",
        category: "itr",
        profileId: "profile_1",
        serviceId: "service_1",
        size: 512,
        mimeType: "application/pdf",
      }),
    });

    expect(registered.response.status).toBe(200);
    expect(registered.json.document).toMatchObject({
      userId: "user_1",
      profileId: "profile_1",
      serviceId: "service_1",
      userServiceId: "service_1",
      isExternal: true,
    });
  });

  it("enforces owner-only downloads and reports missing blob objects", async () => {
    seed("documents", "doc_cross", {
      userId: "user_2",
      name: "Other user document",
      category: "tax",
      status: "active",
      blobUrl: "https://private.vercel-storage.com/documents/user_2/doc/file.pdf",
      mimeType: "application/pdf",
      createdAt: new Date("2026-05-15T08:00:00.000Z"),
      updatedAt: new Date("2026-05-15T08:00:00.000Z"),
    });
    seed("documents", "doc_missing_blob", {
      userId: "user_1",
      name: "Missing blob",
      category: "tax",
      status: "active",
      blobUrl: "https://private.vercel-storage.com/documents/user_1/doc/missing.pdf",
      mimeType: "application/pdf",
      createdAt: new Date("2026-05-15T08:00:00.000Z"),
      updatedAt: new Date("2026-05-15T08:00:00.000Z"),
    });

    setAuthUser({ id: "user_1", email: "user_1@example.com", role: "user" });

    const forbidden = await request("/api/documents/doc_cross/download");
    expect(forbidden.response.status).toBe(403);

    const missing = await request("/api/documents/doc_missing_blob/download");
    expect(missing.response.status).toBe(404);
    expect(missing.json.error).toBe("Document file not found");
  });

  it("keeps serviceId and userServiceId aligned when updating document links", async () => {
    seed("user_services", "service_1", {
      userId: "user_1",
      serviceTitle: "ITR Filing",
    });
    seed("documents", "doc_1", {
      userId: "user_1",
      name: "Form 16",
      category: "form16",
      status: "active",
      userServiceId: null,
      serviceId: null,
      createdAt: new Date("2026-05-15T08:00:00.000Z"),
      updatedAt: new Date("2026-05-15T08:00:00.000Z"),
    });

    const linked = await request("/api/documents/doc_1", {
      method: "PATCH",
      body: JSON.stringify({ serviceId: "service_1" }),
    });

    expect(linked.response.status).toBe(200);
    expect(collectionStore("documents").get("doc_1")).toMatchObject({
      serviceId: "service_1",
      userServiceId: "service_1",
    });

    const cleared = await request("/api/documents/doc_1", {
      method: "PATCH",
      body: JSON.stringify({ userServiceId: null }),
    });

    expect(cleared.response.status).toBe(200);
    expect(collectionStore("documents").get("doc_1")).toMatchObject({
      serviceId: "service_1",
      userServiceId: null,
    });
  });
});
