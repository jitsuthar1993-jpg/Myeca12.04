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
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const json = await response.json();
    return { response, json };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

beforeEach(resetStore);

describe("document routes", () => {
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
