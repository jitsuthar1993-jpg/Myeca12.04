// @vitest-environment node
// Regression tests for the two High-severity fixes in the serverless API (api/index.ts):
//   1. /sync must not derive role/email from a client-supplied body.email (privilege escalation).
//   2. /api/notifications and /api/user/activity must be scoped to the caller (IDOR).
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

// The authenticated caller is always user_1 with the verified email user@example.com / role "user".
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

vi.mock("@vercel/blob", () => ({ del: vi.fn(), get: vi.fn(), put: vi.fn() }));
vi.mock("sharp", () => ({ default: vi.fn() }));

const { default: handler } = await import("../../../api/index.js");

function resetStore() {
  mockState.store.clear();
  mockState.counter = 0;
  process.env.PII_ENCRYPTION_KEY = "test-pii-key-for-vercel-api-security";
}

function seed(collection: string, id: string, data: Record<string, any>) {
  collectionStore(collection).set(id, { ...data });
}

function invitationDocId(email: string) {
  return `admin_invitation_${Buffer.from(email).toString("base64url")}`;
}

function makeReq(path: string, options: { method?: string; body?: unknown } = {}) {
  return {
    method: options.method || "GET",
    url: path,
    headers: { host: "myeca.in", authorization: "Bearer token_user_1" },
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

describe("Vercel API authorization hardening", () => {
  it("scopes /api/notifications to the caller (no IDOR)", async () => {
    seed("notifications", "n1", { userId: "user_1", title: "Mine" });
    seed("notifications", "n2", { userId: "user_2", title: "Someone else's" });

    const res = await callApi("/api/notifications");

    expect(res.statusCode).toBe(200);
    const ids = res.body.notifications.map((n: any) => n.id);
    expect(ids).toContain("n1");
    expect(ids).not.toContain("n2");
  });

  it("scopes /api/user/activity to the caller (no IDOR)", async () => {
    seed("activity_logs", "a1", { userId: "user_1", action: "login" });
    seed("activity_logs", "a2", { userId: "user_2", action: "login" });

    const res = await callApi("/api/user/activity");

    expect(res.statusCode).toBe(200);
    const ids = res.body.data.activities.map((a: any) => a.id);
    expect(ids).toContain("a1");
    expect(ids).not.toContain("a2");
  });

  it("ignores a client-supplied email on /sync (no privilege escalation)", async () => {
    // A privileged invitation exists for an email the attacker tries to claim in the body.
    const invitedAdminEmail = "admin-invite@example.com";
    seed("site_settings", invitationDocId(invitedAdminEmail), {
      email: invitedAdminEmail,
      role: "admin",
      status: "invited",
    });

    const res = await callApi("/api/v1/auth/sync", {
      method: "POST",
      body: { email: invitedAdminEmail, firstName: "Mallory" },
    });

    expect(res.statusCode).toBe(200);
    // Role + stored email must come from the verified session, never the request body.
    expect(res.body.user.role).toBe("user");
    expect(res.body.user.email).toBe("user@example.com");

    const stored = collectionStore("users").get("user_1");
    expect(stored?.role).toBe("user");
    expect(stored?.email).toBe("user@example.com");
  });
});
