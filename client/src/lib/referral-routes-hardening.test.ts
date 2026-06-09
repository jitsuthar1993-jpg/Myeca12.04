import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("../../../server/middleware/auth.js");
  process.env = { ...originalEnv };
});

async function requestReferralOverview() {
  vi.doMock("../../../server/middleware/auth.js", () => ({
    authenticateToken: (req: any, _res: any, next: any) => {
      req.user = { id: "user-1", email: "user@example.com", role: "user" };
      next();
    },
  }));

  const { default: referralsRouter } = await import("../../../server/routes/referrals.js");
  const app = express();
  app.use(express.json());
  app.use("/api/referrals", referralsRouter);

  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Unable to start test server");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/referrals/overview`);
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

describe("referral route hardening", () => {
  it(
    "marks local referral storage responses as demo-backed metadata",
    async () => {
      process.env = { ...originalEnv, NODE_ENV: "development" };

      const result = await requestReferralOverview();

      expect(result.status).toBe(200);
      expect(result.json).toMatchObject({
        success: true,
        backendStatus: "demo",
        program: {
          programName: "MyeCA Referral Rewards",
        },
      });
    },
    15_000,
  );
});
