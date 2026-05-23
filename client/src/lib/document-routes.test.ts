import express from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => ({
  store: new Map<string, Map<string, Record<string, any>>>(),
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
    }),
  },
}));

vi.mock("../../../server/middleware/auth.js", () => ({
  authenticateToken: (req: any, _res: any, next: any) => {
    req.auth = { userId: "user_1", email: "user_1@example.com" };
    req.user = { id: "user_1", email: "user_1@example.com", role: "user" };
    next();
  },
}));

vi.mock("@vercel/blob", () => ({
  del: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}));

const { put } = await import("@vercel/blob");
const { default: documentsRouter } = await import("../../../server/routes/documents.js");

function resetStore() {
  mockState.store.clear();
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
    const isFormData = (options.body as any)?.constructor?.name === "FormData";
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
    });
    const raw = await response.text();
    const json = raw ? JSON.parse(raw) : {};
    return { response, json };
  } finally {
    server.closeAllConnections?.();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

beforeEach(resetStore);

describe("document routes", () => {
  it("persists upload compression metadata and service/tax-return links", async () => {
    vi.mocked(put).mockResolvedValue({
      pathname: "documents/user_1/doc_1/form16.pdf",
      url: "https://blob.example.com/form16.pdf",
      downloadUrl: "https://blob.example.com/form16.pdf?download=1",
    } as any);
    seed("user_services", "service_1", {
      userId: "user_1",
      serviceTitle: "ITR Filing",
    });
    seed("tax_returns", "return_1", {
      userId: "user_1",
      status: "ca_review",
    });

    const boundary = "----myeca-upload-test";
    const multipartBody = [
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="form16.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4\nsample\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="name"\r\n\r\nForm 16\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nform16\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="userServiceId"\r\n\r\nservice_1\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="taxReturnId"\r\n\r\nreturn_1\r\n`,
      `--${boundary}--\r\n`,
    ].join("");

    const uploaded = await request("/api/documents/upload", {
      method: "POST",
      body: multipartBody,
      headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    });

    expect(uploaded.response.status).toBe(200);
    expect(uploaded.json.document).toMatchObject({
      name: "Form 16",
      userServiceId: "service_1",
      taxReturnId: "return_1",
      originalSize: 15,
      storedSize: 15,
      compressionType: "pdf",
      compressionStatus: "skipped",
    });
    expect(collectionStore("documents").get(uploaded.json.document.id)).toMatchObject({
      originalSize: 15,
      storedSize: 15,
      compressionType: "pdf",
      compressionStatus: "skipped",
      userServiceId: "service_1",
      taxReturnId: "return_1",
    });
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
