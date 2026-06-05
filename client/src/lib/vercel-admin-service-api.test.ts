// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => ({
  store: new Map<string, Map<string, Record<string, any>>>(),
  counter: 0,
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
  return {
    id,
    ref: makeDocRef("", id, records),
    exists: records.has(id),
    data: () => records.get(id),
  };
}

function makeDocRef(collectionName: string, id: string, records = collectionStore(collectionName)) {
  return {
    id,
    get: async () => makeSnapshot(id, records),
    set: async (data: Record<string, any>, options?: { merge?: boolean }) => {
      records.set(id, options?.merge ? { ...(records.get(id) || {}), ...data } : { ...data });
    },
    update: async (data: Record<string, any>) => {
      records.set(id, { ...(records.get(id) || {}), ...data });
    },
  };
}

function makeQuery(collectionName: string, clauses: Array<{ field: string; value: unknown }> = [], maxRows?: number) {
  return {
    where(field: string, op: string, value: unknown) {
      if (op !== "==") throw new Error(`Unsupported test operator ${op}`);
      return makeQuery(collectionName, [...clauses, { field, value }], maxRows);
    },
    limit(limit: number) {
      return makeQuery(collectionName, clauses, limit);
    },
    async get() {
      const records = collectionStore(collectionName);
      const docs = Array.from(records.entries())
        .filter(([, data]) => clauses.every((clause) => data[clause.field] === clause.value))
        .slice(0, maxRows)
        .map(([id]) => makeSnapshot(id, records));
      return { docs, size: docs.length, empty: docs.length === 0, data: () => ({ count: docs.length }) };
    },
    count() {
      return this;
    },
  };
}

vi.mock("../../../server/data-admin.js", () => ({
  adminDb: {
    collection: (name: string) => ({
      ...makeQuery(name),
      doc: (id?: string) => makeDocRef(name, id || `${name}_${++mockState.counter}`),
    }),
  },
}));

vi.mock("../../../server/lib/supabase.js", () => {
  const getUser = async () => ({
    data: {
      user: {
        id: "admin_1",
        email: "admin@example.com",
        app_metadata: { role: "admin" },
        user_metadata: { firstName: "Admin", lastName: "User" },
        email_confirmed_at: "2026-06-05T00:00:00.000Z",
        created_at: "2026-06-05T00:00:00.000Z",
      },
    },
    error: null,
  });

  return {
    getPublicSupabaseAuthClient: () => ({ auth: { getUser } }),
    getSupabaseAuthClient: () => ({ auth: { getUser } }),
  };
});

vi.mock("@vercel/blob", () => ({ del: vi.fn(), get: vi.fn(), put: vi.fn() }));
vi.mock("sharp", () => ({ default: vi.fn() }));

const { default: handler } = await import("../../../api/index.js");

function seed(collection: string, id: string, data: Record<string, any>) {
  collectionStore(collection).set(id, { ...data });
}

function makeReq(path: string, options: { method?: string; body?: unknown } = {}) {
  return {
    method: options.method || "GET",
    url: path,
    headers: { host: "myeca.in", authorization: "Bearer token_admin_1" },
    body: options.body,
  };
}

function makeRes() {
  const headers = new Map<string, string>();
  const res: any = {
    locals: {},
    statusCode: 200,
    body: undefined,
    setHeader: (key: string, value: string) => headers.set(key, value),
    getHeader: (key: string) => headers.get(key),
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    send(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

async function callApi(path: string, options: { method?: string; body?: unknown } = {}) {
  const res = makeRes();
  await handler(makeReq(path, options), res);
  return res;
}

beforeEach(() => {
  mockState.store.clear();
  mockState.counter = 0;
  seed("users", "admin_1", { role: "admin", email: "admin@example.com", firstName: "Admin" });
  seed("users", "customer_1", { role: "user", email: "customer@example.com", firstName: "Customer" });
});

describe("Vercel admin service APIs", () => {
  it("loads the code-defined service catalog instead of returning 404", async () => {
    const res = await callApi("/api/admin/services");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      category: "tax-filing",
      isActive: true,
    });
    expect(res.body.map((service: { id: string }) => service.id)).not.toEqual(
      expect.arrayContaining(["advance-tax", "income-tax-calculator", "all-calculators", "tax-regime-calculator"]),
    );
  });

  it("lists and updates user service cases for admins", async () => {
    seed("user_services", "case_1", {
      userId: "customer_1",
      serviceId: "itr-filing",
      serviceTitle: "ITR Filing",
      serviceCategory: "Tax",
      status: "pending",
      metadata: { requestDescription: "Please help" },
      createdAt: "2026-06-05T08:00:00.000Z",
    });

    const listed = await callApi("/api/admin/user-services?limit=100");
    expect(listed.statusCode).toBe(200);
    expect(listed.body.cases[0]).toMatchObject({
      id: "case_1",
      userName: "Customer",
      userEmail: "customer@example.com",
      status: "pending",
    });

    const updated = await callApi("/api/admin/user-services/case_1", {
      method: "PATCH",
      body: { status: "in_progress", adminNote: "Assigned for review" },
    });
    expect(updated.statusCode).toBe(200);
    expect(collectionStore("user_services").get("case_1")).toMatchObject({
      status: "in_progress",
      metadata: {
        requestDescription: "Please help",
        adminNote: "Assigned for review",
      },
    });
  });

  it("includes pending user service requests in admin dashboard stats", async () => {
    seed("user_services", "case_1", {
      userId: "customer_1",
      serviceTitle: "GST Registration",
      status: "pending",
      paymentAmount: 999,
      createdAt: "2026-06-05T08:00:00.000Z",
    });

    const res = await callApi("/api/admin/stats");

    expect(res.statusCode).toBe(200);
    expect(res.body.data.services).toMatchObject({ total: 1, active: 1 });
    expect(res.body.data.workList).toContainEqual(expect.objectContaining({
      id: "case_1",
      type: "service",
      title: "GST Registration",
      userName: "Customer",
      status: "pending",
      price: 999,
    }));
  });
});
