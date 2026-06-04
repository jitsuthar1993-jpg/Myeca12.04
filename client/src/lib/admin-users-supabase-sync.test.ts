import express from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => ({
  store: new Map<string, Map<string, Record<string, any>>>(),
  supabaseUsers: [] as Record<string, any>[],
  supabaseError: null as Error | null,
  serviceRoleKey: "service-secret-key",
  listUsersCalls: [] as Array<{ page?: number; perPage?: number }>,
}));

function collectionStore(name: string) {
  let records = mockState.store.get(name);
  if (!records) {
    records = new Map<string, Record<string, any>>();
    mockState.store.set(name, records);
  }
  return records;
}

function normalizeDateValue(value: unknown) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(String(value)).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function makeSnapshot(collectionName: string, id: string) {
  const records = collectionStore(collectionName);
  return {
    id,
    exists: records.has(id),
    data: () => records.get(id),
  };
}

function makeDocRef(collectionName: string, id: string) {
  const records = collectionStore(collectionName);
  return {
    id,
    get: async () => makeSnapshot(collectionName, id),
    set: async (data: Record<string, any>, options?: { merge?: boolean }) => {
      records.set(id, options?.merge ? { ...(records.get(id) || {}), ...data } : { ...data });
    },
    update: async (data: Record<string, any>) => {
      records.set(id, { ...(records.get(id) || {}), ...data });
    },
  };
}

function applyClauses(records: Array<[string, Record<string, any>]>, clauses: Array<{ field: string; value: unknown }>) {
  return records.filter(([, data]) => clauses.every((clause) => data[clause.field] === clause.value));
}

function makeQuery(collectionName: string, clauses: Array<{ field: string; value: unknown }> = []) {
  return {
    where(field: string, op: string, value: unknown) {
      if (op !== "==") throw new Error(`Unsupported test operator ${op}`);
      return makeQuery(collectionName, [...clauses, { field, value }]);
    },
    orderBy() {
      return this;
    },
    offset(offsetRows: number) {
      return {
        ...this,
        limit: (maxRows: number) => ({
          ...this,
          get: async () => {
            const entries = applyClauses(Array.from(collectionStore(collectionName).entries()), clauses)
              .sort((a, b) => normalizeDateValue(b[1].createdAt) - normalizeDateValue(a[1].createdAt))
              .slice(offsetRows, offsetRows + maxRows);
            return {
              docs: entries.map(([id]) => makeSnapshot(collectionName, id)),
              size: entries.length,
            };
          },
        }),
      };
    },
    limit(maxRows: number) {
      return {
        ...this,
        get: async () => {
          const entries = applyClauses(Array.from(collectionStore(collectionName).entries()), clauses).slice(0, maxRows);
          return {
            docs: entries.map(([id]) => makeSnapshot(collectionName, id)),
            size: entries.length,
          };
        },
      };
    },
    count() {
      return {
        get: async () => ({
          data: () => ({ count: applyClauses(Array.from(collectionStore(collectionName).entries()), clauses).length }),
        }),
      };
    },
    async get() {
      const entries = applyClauses(Array.from(collectionStore(collectionName).entries()), clauses);
      return {
        docs: entries.map(([id]) => makeSnapshot(collectionName, id)),
        size: entries.length,
      };
    },
  };
}

vi.mock("../../../server/data-admin.js", () => ({
  adminDb: {
    collection: (name: string) => ({
      ...makeQuery(name),
      doc: (id: string) => makeDocRef(name, id),
    }),
  },
}));

vi.mock("../../../server/lib/supabase.js", () => ({
  getSupabaseUrl: () => "https://project.supabase.co",
  getSupabaseServiceRoleKey: () => mockState.serviceRoleKey,
  getSupabaseAdminClient: () => ({
    auth: {
      admin: {
        listUsers: async (params?: { page?: number; perPage?: number }) => {
          mockState.listUsersCalls.push(params || {});
          if (mockState.supabaseError) {
            return { data: { users: [] }, error: mockState.supabaseError };
          }
          const page = params?.page ?? 1;
          const perPage = params?.perPage ?? 1000;
          const start = (page - 1) * perPage;
          return {
            data: { users: mockState.supabaseUsers.slice(start, start + perPage) },
            error: null,
          };
        },
      },
    },
  }),
}));

vi.mock("../../../server/middleware/auth.js", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.auth = { userId: "admin_1", email: "admin@example.com" };
    req.user = { id: "admin_1", role: "admin", email: "admin@example.com" };
    next();
  },
  requireAdmin: (_req: any, _res: any, next: any) => next(),
}));

const { syncSupabaseUserDirectory } = await import("../../../server/services/supabase-user-directory.js");
const { default: adminRouter } = await import("../../../server/routes/admin.js");

function resetState() {
  mockState.store.clear();
  mockState.supabaseUsers = [];
  mockState.supabaseError = null;
  mockState.serviceRoleKey = "service-secret-key";
  mockState.listUsersCalls = [];
}

function seed(collection: string, id: string, data: Record<string, any>) {
  collectionStore(collection).set(id, { id, ...data });
}

async function request(path: string) {
  const app = express();
  app.use(express.json());
  app.use("/api/admin", adminRouter);

  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Unable to start test server");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`);
    const json = await response.json();
    return { response, json };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

beforeEach(resetState);

describe("admin Supabase user directory sync", () => {
  it("creates app directory rows for Supabase Auth users without leaking the service key", async () => {
    mockState.supabaseUsers = [
      {
        id: "auth_1",
        email: "expert@example.com",
        created_at: "2026-06-01T10:00:00.000Z",
        updated_at: "2026-06-02T10:00:00.000Z",
        email_confirmed_at: "2026-06-01T10:05:00.000Z",
        last_sign_in_at: "2026-06-03T10:00:00.000Z",
        app_metadata: { role: "ca", provider: "email", providers: ["email"] },
        user_metadata: { full_name: "Neha Sharma" },
        is_anonymous: false,
      },
    ];

    const result = await syncSupabaseUserDirectory({ perPage: 100 });
    const stored = collectionStore("users").get("auth_1");

    expect(result).toMatchObject({
      status: "synced",
      supabaseUsers: 1,
      created: 1,
      updated: 0,
    });
    expect(stored).toMatchObject({
      id: "auth_1",
      email: "expert@example.com",
      firstName: "Neha",
      lastName: "Sharma",
      role: "ca",
      status: "active",
      isVerified: true,
      authProvider: "email",
      authProviders: ["email"],
      isAnonymous: false,
    });
    expect(JSON.stringify(stored)).not.toContain("service-secret-key");
    expect(mockState.listUsersCalls[0]).toEqual({ page: 1, perPage: 100 });
  });

  it("returns an error sync state without deleting existing directory rows when Supabase Auth fails", async () => {
    seed("users", "user_1", {
      email: "existing@example.com",
      firstName: "Existing",
      lastName: "User",
      role: "user",
      status: "active",
      createdAt: "2026-05-01T10:00:00.000Z",
    });
    mockState.supabaseError = new Error("Auth API unavailable");

    const result = await syncSupabaseUserDirectory({ perPage: 100 });

    expect(result).toMatchObject({
      status: "error",
      created: 0,
      updated: 0,
      error: "Auth API unavailable",
    });
    expect(collectionStore("users").get("user_1")?.email).toBe("existing@example.com");
  });

  it("syncs Supabase Auth users before returning the admin user directory", async () => {
    seed("users", "user_1", {
      email: "existing@example.com",
      firstName: "Existing",
      lastName: "User",
      role: "user",
      status: "active",
      createdAt: "2026-05-01T10:00:00.000Z",
    });
    mockState.supabaseUsers = [
      {
        id: "auth_2",
        email: "invited@example.com",
        created_at: "2026-06-01T10:00:00.000Z",
        updated_at: "2026-06-01T10:00:00.000Z",
        email_confirmed_at: null,
        app_metadata: { provider: "email", providers: ["email"] },
        user_metadata: { first_name: "Invited", last_name: "Member" },
      },
    ];

    const { response, json } = await request("/api/admin/users?page=1&limit=10");

    expect(response.status).toBe(200);
    expect(json.data.sync).toMatchObject({ status: "synced", created: 1, supabaseUsers: 1 });
    expect(json.data.pagination.total).toBe(2);
    expect(json.data.users.map((user: any) => user.email)).toContain("invited@example.com");
  });

  it("keeps the admin user directory usable when Supabase Auth sync fails", async () => {
    seed("users", "user_1", {
      email: "existing@example.com",
      firstName: "Existing",
      lastName: "User",
      role: "user",
      status: "active",
      createdAt: "2026-05-01T10:00:00.000Z",
    });
    mockState.supabaseError = new Error("Auth API unavailable");

    const { response, json } = await request("/api/admin/users?page=1&limit=10");

    expect(response.status).toBe(200);
    expect(json.data.sync).toMatchObject({ status: "error", error: "Auth API unavailable" });
    expect(json.data.users).toHaveLength(1);
    expect(json.data.users[0].email).toBe("existing@example.com");
  });
});
