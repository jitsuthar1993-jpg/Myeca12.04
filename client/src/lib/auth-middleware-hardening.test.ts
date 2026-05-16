import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TEMPORARY_TEST_USERS } from "../../../shared/temporary-test-users.js";

const originalEnv = { ...process.env };

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("../../../server/lib/supabase.js");
  vi.doUnmock("../../../server/services/user-accounts.js");
  process.env = { ...originalEnv };
});

async function runRequireAuthWithToken(token: string) {
  vi.doMock("../../../server/lib/supabase.js", () => ({
    getSupabaseAuthClient: () => ({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: null }, error: new Error("invalid token") })),
      },
    }),
  }));
  vi.doMock("../../../server/services/user-accounts.js", () => ({
    findOrCreateUserProfile: vi.fn(async (auth: { userId: string; email?: string }) => ({
      id: auth.userId,
      exists: true,
      data: () => ({
        id: auth.userId,
        email: auth.email,
        role: "user",
      }),
    })),
  }));

  const { requireAuth } = await import("../../../server/middleware/auth.js");
  const app = express();
  app.use((req, res, next) => {
    res.locals.requestId = "auth-test-request";
    res.setHeader("X-Request-Id", "auth-test-request");
    next();
  });
  app.get("/private", requireAuth, (_req, res) => res.json({ success: true }));

  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Unable to start test server");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/private`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      status: response.status,
      json: await response.json(),
    };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

describe("auth middleware hardening", () => {
  it("rejects temporary test auth tokens in production", async () => {
    process.env = { ...originalEnv, NODE_ENV: "production" };

    const result = await runRequireAuthWithToken(TEMPORARY_TEST_USERS[0].token);

    expect(result.status).toBe(401);
    expect(result.json).toMatchObject({
      success: false,
      error: "Unauthorized",
      requestId: "auth-test-request",
    });
  });

  it("keeps temporary test auth tokens available outside production", async () => {
    process.env = { ...originalEnv, NODE_ENV: "development" };

    const result = await runRequireAuthWithToken(TEMPORARY_TEST_USERS[0].token);

    expect(result.status).toBe(200);
    expect(result.json).toMatchObject({ success: true });
  });
});
