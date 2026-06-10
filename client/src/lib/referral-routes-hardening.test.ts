import express from "express";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("../../../server/middleware/auth.js");
  vi.doUnmock("../../../server/data-admin.js");
  vi.doUnmock("../../../server/services/referral-email.js");
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

async function withReferralServer(
  run: (helpers: {
    request: (
      path: string,
      user: { id: string; email: string },
      body?: Record<string, unknown>,
    ) => Promise<{ status: number; json: any }>;
    seedService: (id: string, data: Record<string, unknown>) => void;
  }) => Promise<void>,
) {
  process.env = { ...originalEnv, NODE_ENV: "development" };
  const services = new Map<string, Record<string, unknown>>();

  vi.doMock("../../../server/middleware/auth.js", () => ({
    authenticateToken: (req: any, _res: any, next: any) => {
      req.user = {
        id: req.headers["x-test-user-id"],
        email: req.headers["x-test-user-email"],
        role: "user",
      };
      next();
    },
  }));
  vi.doMock("../../../server/data-admin.js", () => ({
    adminDb: {
      collection: (name: string) => ({
        doc: (id: string) => ({
          get: async () => ({
            id,
            exists: name === "user_services" && services.has(id),
            data: () => services.get(id),
          }),
        }),
      }),
    },
  }));
  vi.doMock("../../../server/services/referral-email.js", () => ({
    sendReferralInvitation: vi.fn(async () => ({ success: true })),
    sendReferralReminder: vi.fn(async () => ({ success: true })),
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
    await run({
      request: async (path, user, body) => {
        const response = await fetch(`http://127.0.0.1:${address.port}/api/referrals${path}`, {
          method: body ? "POST" : "GET",
          headers: {
            "Content-Type": "application/json",
            "x-test-user-id": user.id,
            "x-test-user-email": user.email,
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
        return { status: response.status, json: await response.json() };
      },
      seedService: (id, data) => services.set(id, { ...data }),
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

describe("referral route hardening", () => {
  it("keeps referral email copy aligned with post-completion account credit", () => {
    const source = readFileSync("server/services/referral-email.ts", "utf8");
    const page = readFileSync("client/src/pages/referrals.page.tsx", "utf8");
    const registerPage = readFileSync("client/src/pages/auth/register.page.tsx", "utf8");

    expect(source).toMatch(/post-completion account credit/i);
    expect(source).not.toMatch(/exclusive referral discount|claim your discount|get \$\{data\.discount\} off/i);
    expect(page).toMatch(/account credit/i);
    expect(page).not.toMatch(/redeem to bank|verified payouts|liquid rewards|payout workflow/i);
    expect(registerPage).toMatch(/captureCampaignAttribution/);
    expect(registerPage).toMatch(/referralCode/);
  });

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
          description: expect.stringMatching(/post-completion account credit/i),
          terms: expect.arrayContaining([
            expect.stringMatching(/successful service completion/i),
          ]),
        },
      });
      expect(JSON.stringify(result.json.program)).toMatch(/10% of net collected revenue/i);
      expect(JSON.stringify(result.json.program)).not.toMatch(/cashback|15% off|first consultation free/i);
    },
    15_000,
  );

  it(
    "links credit only from the referred user's paid and completed service record",
    async () => {
      await withReferralServer(async ({ request, seedService }) => {
        const referrer = { id: "referrer-1", email: "referrer@example.com" };
        const referee = { id: "referee-1", email: "referee@example.com" };
        const created = await request("/", referrer, {
          refereeName: "Referee",
          refereeEmail: referee.email,
          serviceType: "itr_filing",
        });
        expect(created.status).toBe(200);

        const referralCode = created.json.referral.referralCode;
        seedService("service-1", {
          userId: referee.id,
          status: "pending",
          paymentStatus: "paid",
          netCollectedRevenue: 2_000,
          hasStackedDiscount: false,
          metadata: { attribution: { referralCode } },
        });

        const incomplete = await request("/link-service", referee, { userServiceId: "service-1" });
        expect(incomplete.status).toBe(400);

        seedService("service-1", {
          userId: referee.id,
          status: "completed",
          paymentStatus: "paid",
          netCollectedRevenue: 2_000,
          hasStackedDiscount: false,
          metadata: { attribution: { referralCode } },
        });

        const spoofed = await request("/link-service", referee, {
          referralCode,
          userServiceId: "service-1",
          netCollectedRevenue: 99_999,
          serviceCompleted: true,
        });
        expect(spoofed.status).toBe(400);

        const linked = await request("/link-service", referee, { userServiceId: "service-1" });
        expect(linked.status).toBe(200);
        expect(linked.json.reward).toMatchObject({
          amount: 200,
          type: "account_credit",
          userServiceId: "service-1",
        });

        const shared = await request("/generate-link", referrer, { serviceType: "itr_filing" });
        expect(shared.status).toBe(200);
        seedService("service-2", {
          userId: "referee-2",
          status: "completed",
          paymentStatus: "paid",
          netCollectedRevenue: 3_000,
          hasStackedDiscount: false,
          metadata: { attribution: { referralCode: shared.json.referralCode } },
        });

        const sharedLinked = await request(
          "/link-service",
          { id: "referee-2", email: "second-referee@example.com" },
          { userServiceId: "service-2" },
        );
        expect(sharedLinked.status).toBe(200);
        expect(sharedLinked.json.reward.amount).toBe(300);
      });
    },
    15_000,
  );
});
