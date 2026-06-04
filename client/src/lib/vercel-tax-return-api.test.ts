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

function makeQuery(collectionName: string, clauses: Array<{ field: string; value: unknown }> = []) {
  return {
    where(field: string, op: string, value: unknown) {
      if (op !== "==") throw new Error(`Unsupported test operator ${op}`);
      return makeQuery(collectionName, [...clauses, { field, value }]);
    },
    limit() {
      return this;
    },
    async get() {
      const records = collectionStore(collectionName);
      const docs = Array.from(records.entries())
        .filter(([, data]) => clauses.every((clause) => data[clause.field] === clause.value))
        .map(([id]) => makeSnapshot(id, records));
      return {
        docs,
        size: docs.length,
        empty: docs.length === 0,
        data: () => ({ count: docs.length }),
      };
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
  const getUser = async (token: string) => ({
    data: {
      user: {
        id: token.replace(/^token_/, "") || "user_1",
        email: "user@example.com",
        app_metadata: { role: "user" },
        user_metadata: { firstName: "Test", lastName: "User" },
        email_confirmed_at: "2026-06-04T00:00:00.000Z",
        created_at: "2026-06-04T00:00:00.000Z",
      },
    },
    error: null,
  });

  return {
    getPublicSupabaseAuthClient: () => ({ auth: { getUser } }),
    getSupabaseAuthClient: () => ({ auth: { getUser } }),
  };
});

vi.mock("@vercel/blob", () => ({
  del: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}));

vi.mock("sharp", () => ({
  default: vi.fn(),
}));

const { default: handler } = await import("../../../api/index.js");

function resetStore() {
  mockState.store.clear();
  mockState.counter = 0;
  process.env.PII_ENCRYPTION_KEY = "test-pii-key-for-vercel-tax-return-api";
}

function seed(collection: string, id: string, data: Record<string, any>) {
  collectionStore(collection).set(id, { ...data });
}

function makeReq(path: string, options: { method?: string; body?: unknown } = {}) {
  return {
    method: options.method || "GET",
    url: path,
    headers: {
      host: "myeca12-04.vercel.app",
      authorization: "Bearer token_user_1",
    },
    body: options.body,
  };
}

function makeRes() {
  const headers = new Map<string, string>();
  const res: any = {
    locals: {},
    statusCode: 200,
    body: undefined,
    headers,
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
    redirect(code: number, destination: string) {
      this.statusCode = code;
      this.body = destination;
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

beforeEach(resetStore);

describe("Vercel tax-return API dispatch", () => {
  it("lists the signed-in user's tax return drafts through api/index", async () => {
    seed("tax_returns", "return_1", {
      id: "return_1",
      userId: "user_1",
      assessmentYear: "2026-27",
      status: "draft",
      reviewStatus: "draft",
      formData: JSON.stringify({
        taxpayer: { type: "individual", residentialStatus: "resident" },
        income: { salary: 900000 },
      }),
      updatedAt: "2026-06-04T10:00:00.000Z",
    });

    const res = await callApi("/api/tax-returns");

    expect(res.statusCode).toBe(200);
    expect(res.body.taxReturns).toHaveLength(1);
    expect(res.body.taxReturns[0]).toMatchObject({
      id: "return_1",
      userId: "user_1",
      assessmentYear: "2026-27",
      itrType: "ITR-1",
      status: "draft",
    });
  });

  it("creates an AY 2026-27 tax return draft through api/index", async () => {
    const res = await callApi("/api/tax-returns", {
      method: "POST",
      body: {
        assessmentYear: "2026-27",
        draft: {
          taxpayer: { type: "individual", residentialStatus: "resident", pan: "ABCDE1234F" },
          income: { salary: 900000, otherSources: 40000 },
          taxPaid: { tds: 65000 },
        },
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.taxReturn).toMatchObject({
      id: "tax_returns_1",
      userId: "user_1",
      assessmentYear: "2026-27",
      itrType: "ITR-1",
      status: "draft",
      reviewStatus: "draft",
    });
    expect(res.body.taxReturn.formData.taxpayer.pan).toBe("ABCDE1234F");

    const stored = collectionStore("tax_returns").get("tax_returns_1");
    const storedDraft = JSON.parse(String(stored?.formData || "{}"));
    expect(storedDraft.taxpayer.pan).toMatch(/^enc:v1:/);
  });
});
