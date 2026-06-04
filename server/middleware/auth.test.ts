// @vitest-environment node
import express, { type Request, type Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => ({
  userRecord: null as Record<string, any> | null,
  authResult: null as { userId: string; email?: string } | null,
}));

vi.mock("../services/user-accounts.js", () => ({
  findOrCreateUserProfile: async () => ({
    exists: !!mockState.userRecord,
    id: "user_1",
    data: () => mockState.userRecord,
  }),
}));

const userCache = vi.hoisted(() => new Map<string, any>());
vi.mock("../utils/user-cache.js", () => ({
  getCachedUser: (id: string) => userCache.get(id),
  setCachedUser: (id: string, value: any) => {
    userCache.set(id, value);
  },
  invalidateCachedUser: (id: string) => {
    userCache.delete(id);
  },
}));

vi.mock("../lib/supabase.js", () => ({
  // Read mockState at call time so each test can drive the auth result.
  getSupabaseAuthClient: () => ({
    auth: {
      getUser: async () => {
        if (!mockState.authResult) return { data: { user: null }, error: null };
        return {
          data: {
            user: {
              id: mockState.authResult.userId,
              email: mockState.authResult.email,
            },
          },
          error: null,
        };
      },
    },
  }),
}));

vi.mock("../../shared/temporary-test-users.js", () => ({
  getTemporaryTestUserByToken: () => null,
}));

vi.mock("../utils/error-response.js", () => ({
  safeError: (res: Response, _error: unknown, message: string) =>
    res.status(500).json({ success: false, error: message }),
}));

vi.mock("./request-id.js", () => ({
  getRequestId: () => "req_test",
  requestIdMiddleware: (_req: Request, _res: Response, next: any) => next(),
}));

const { requireAuth, requireAdmin, optionalAuth } = await import("./auth.js");

function buildApp(handler: any, ...middleware: any[]) {
  const app = express();
  app.get("/test", ...middleware, handler);
  return app;
}

async function request(app: express.Express, path = "/test", token = "Bearer test-token") {
  return new Promise<{ status: number; body: any }>((resolve) => {
    const req = { method: "GET", url: path, headers: { authorization: token } } as any;
    const chunks: Buffer[] = [];
    const res = {
      statusCode: 200,
      _status: 200,
      _headers: {} as Record<string, string>,
      setHeader(name: string, value: string) {
        this._headers[name] = value;
      },
      getHeader(name: string) {
        return this._headers[name];
      },
      status(code: number) {
        this._status = code;
        this.statusCode = code;
        return this;
      },
      json(payload: any) {
        resolve({ status: this._status, body: payload });
        return this;
      },
      end() {
        resolve({ status: this._status, body: undefined });
      },
      write(chunk: any) {
        chunks.push(Buffer.from(chunk));
        return true;
      },
    } as any;
    app.handle(req, res, () => resolve({ status: 200, body: undefined }));
  });
}

describe("requireAuth", () => {
  beforeEach(() => {
    userCache.clear();
    mockState.userRecord = { role: "user", status: "active" };
    mockState.authResult = { userId: "user_1", email: "u@example.com" };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no auth token resolves", async () => {
    mockState.authResult = null;
    const app = buildApp((_req: any, res: any) => res.json({ ok: true }), requireAuth);
    const { status, body } = await request(app);
    expect(status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("allows authenticated active users", async () => {
    const app = buildApp((_req: any, res: any) => res.json({ ok: true }), requireAuth);
    const { status, body } = await request(app);
    expect(status).toBe(200);
    expect(body).toEqual({ ok: true });
  });

  it("treats a missing status field as active (back-compat)", async () => {
    mockState.userRecord = { role: "user" };
    const app = buildApp((_req: any, res: any) => res.json({ ok: true }), requireAuth);
    const { status } = await request(app);
    expect(status).toBe(200);
  });

  for (const blocked of ["inactive", "suspended", "rejected", "INACTIVE", "Suspended"]) {
    it(`rejects users with status "${blocked}"`, async () => {
      mockState.userRecord = { role: "user", status: blocked };
      const app = buildApp((_req: any, res: any) => res.json({ ok: true }), requireAuth);
      const { status, body } = await request(app);
      expect(status).toBe(403);
      expect(body.error).toMatch(/not active/i);
    });
  }

  it("allows pending users through requireAuth (they will hit a product gate elsewhere)", async () => {
    mockState.userRecord = { role: "user", status: "pending" };
    const app = buildApp((_req: any, res: any) => res.json({ ok: true }), requireAuth);
    const { status } = await request(app);
    expect(status).toBe(200);
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    userCache.clear();
    mockState.authResult = { userId: "user_1", email: "u@example.com" };
  });

  it("rejects non-admin users with 403", async () => {
    mockState.userRecord = { role: "user", status: "active" };
    const app = buildApp((_req: any, res: any) => res.json({ ok: true }), requireAdmin);
    const { status } = await request(app);
    expect(status).toBe(403);
  });

  it("rejects suspended admins", async () => {
    mockState.userRecord = { role: "admin", status: "suspended" };
    const app = buildApp((_req: any, res: any) => res.json({ ok: true }), requireAdmin);
    const { status, body } = await request(app);
    expect(status).toBe(403);
    expect(body.error).toMatch(/not active/i);
  });

  it("allows active admins", async () => {
    mockState.userRecord = { role: "admin", status: "active" };
    const app = buildApp((_req: any, res: any) => res.json({ ok: true }), requireAdmin);
    const { status } = await request(app);
    expect(status).toBe(200);
  });
});

describe("optionalAuth", () => {
  beforeEach(() => {
    userCache.clear();
    mockState.userRecord = { role: "user", status: "active" };
    mockState.authResult = { userId: "user_1" };
  });

  it("attaches the user when auth resolves", async () => {
    const app = buildApp(
      (req: any, res: any) => res.json({ userId: req.user?.id ?? null }),
      optionalAuth,
    );
    // findOrCreateUserProfile returns id: "user_1" from the mock
    const { status, body } = await request(app);
    expect(status).toBe(200);
    expect(body.userId).toBe("user_1");
  });

  it("continues anonymously when no auth header is present", async () => {
    mockState.authResult = null;
    const app = buildApp(
      (req: any, res: any) => res.json({ userId: req.user?.id ?? null }),
      optionalAuth,
    );
    const { status, body } = await request(app, "/test", "");
    expect(status).toBe(200);
    expect(body.userId).toBeNull();
  });
});
