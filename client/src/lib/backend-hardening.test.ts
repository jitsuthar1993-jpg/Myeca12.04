import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { validateEnv } from "../../../server/lib/env-validation.js";
import { getAllowedOrigins, isAllowedOrigin } from "../../../server/lib/origin-policy.js";
import { getServerListenConfig } from "../../../server/lib/listen-config.js";
import { getSupabaseAnonKey, getSupabaseUrl } from "../../../server/lib/supabase.js";
import { buildOpenApiSpec } from "../../../server/openapi.js";
import { requestIdMiddleware } from "../../../server/middleware/request-id.js";
import { errorResponse, safeError } from "../../../server/utils/error-response.js";

const originalEnv = { ...process.env };

function productionEnv(overrides: NodeJS.ProcessEnv = {}) {
  return {
    NODE_ENV: "production",
    DATABASE_URL: "postgres://user:pass@example.com:5432/db",
    VITE_SUPABASE_URL: "https://example.supabase.co",
    VITE_SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    BLOB_READ_WRITE_TOKEN: "blob-token",
    SESSION_SECRET: "s".repeat(32),
    PII_ENCRYPTION_KEY: "p".repeat(32),
    APP_URL: "https://myeca.in",
    VITE_APP_URL: "https://myeca.in",
    ...overrides,
  } as NodeJS.ProcessEnv;
}

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...originalEnv };
});

describe("backend hardening utilities", () => {
  it("fails fast for missing required production env vars", () => {
    const env = productionEnv({ DATABASE_URL: "" });

    expect(() => validateEnv(env)).toThrow(/DATABASE_URL/);
  });

  it("allows production startup when required env vars are configured", () => {
    expect(() => validateEnv(productionEnv())).not.toThrow();
  });

  it("keeps local binding by default but allows container binding through HOST", () => {
    expect(getServerListenConfig({ PORT: "5000" } as NodeJS.ProcessEnv)).toEqual({
      host: "127.0.0.1",
      port: 5000,
    });

    expect(getServerListenConfig({ HOST: "0.0.0.0", PORT: "8080" } as NodeJS.ProcessEnv)).toEqual({
      host: "0.0.0.0",
      port: 8080,
    });
  });

  it("adds explicit staging origins without allowing arbitrary production origins", () => {
    const env = productionEnv({
      ALLOWED_ORIGINS: "https://edge-staging.myeca.in, https://preview.myeca.in/",
    });

    expect(getAllowedOrigins(env)).toEqual([
      "https://myeca.in",
      "https://www.myeca.in",
      "https://edge-staging.myeca.in",
      "https://preview.myeca.in",
    ]);
    expect(isAllowedOrigin("https://edge-staging.myeca.in", { env })).toBe(true);
    expect(isAllowedOrigin("https://evil.example", { env })).toBe(false);
  });

  it("does not use hardcoded Supabase fallback config in production", () => {
    process.env = {
      NODE_ENV: "production",
    } as NodeJS.ProcessEnv;

    expect(() => getSupabaseUrl()).toThrow(/SUPABASE_URL/);
    expect(() => getSupabaseAnonKey()).toThrow(/SUPABASE_ANON_KEY/);
  });

  it("does not keep placeholder JWT secrets in the security configuration", () => {
    const source = readFileSync("server/config/security-config.ts", "utf8");

    expect(source).not.toContain("your-super-secret");
    expect(source).not.toContain("SmartTaxCalculator");
    expect(source).toContain("primarySecret: process.env.JWT_PRIMARY_SECRET");
    expect(source).toContain("secondarySecret: process.env.JWT_SECONDARY_SECRET");
  });

  it("attaches request ids to headers and standardized error responses", async () => {
    const app = express();
    app.use(requestIdMiddleware);
    app.get("/boom", (_req, res) => safeError(res, new Error("test failure"), "Test failure"));
    app.get("/missing", (_req, res) => errorResponse(res, 404, "Missing"));

    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Unable to start test server");

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/boom`, {
        headers: { "X-Request-Id": "test-request-id" },
      });
      const json = await response.json();

      expect(response.headers.get("x-request-id")).toBe("test-request-id");
      expect(json).toMatchObject({
        success: false,
        error: "Test failure",
        requestId: "test-request-id",
      });

      const missingResponse = await fetch(`http://127.0.0.1:${address.port}/missing`, {
        headers: { "X-Request-Id": "direct-error-id" },
      });
      const missingJson = await missingResponse.json();

      expect(missingResponse.status).toBe(404);
      expect(missingResponse.headers.get("x-request-id")).toBe("direct-error-id");
      expect(missingJson).toMatchObject({
        success: false,
        error: "Missing",
        requestId: "direct-error-id",
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  it("documents mounted critical routes without advertising dead route groups", () => {
    const spec = buildOpenApiSpec();

    for (const path of [
      "/api/health",
      "/api/v1/auth/me",
      "/api/documents",
      "/api/admin/users",
      "/api/cms/posts",
      "/api/referrals",
      "/api/teams",
      "/api/workflows",
      "/api/reports/history",
    ]) {
      expect(spec.paths[path as keyof typeof spec.paths], `/openapi.json is missing ${path}`).toBeTruthy();
    }

    for (const path of ["/api/chat", "/api/email", "/api/advanced-features"]) {
      expect(spec.paths[path as keyof typeof spec.paths], `/openapi.json should not advertise ${path}`).toBeFalsy();
    }

    expect(spec.paths["/api/workflows/templates"].get["x-backend-status"]).toBe("demo");
  });
});
