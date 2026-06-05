import { describe, expect, it } from "vitest";
import {
  DEMO_WORKSPACE_COLLECTIONS,
  DEMO_WORKSPACE_SEED_ID,
  buildDemoWorkspaceSeed,
  summarizeDemoWorkspaceSeed,
} from "../../../server/scripts/demo-workspace-data";

describe("demo workspace data seed", () => {
  it("builds a deterministic tagged client workspace dataset", () => {
    const seed = buildDemoWorkspaceSeed(new Date("2026-05-24T09:00:00.000Z"));

    expect(seed.users.map((record) => record.id)).toEqual([
      "temporary_test_admin",
      "temporary_test_ca",
      "temporary_test_user",
      "demo-client-rohan",
      "demo-client-meera",
    ]);
    expect(seed.profiles).toHaveLength(3);
    expect(seed.user_services).toHaveLength(4);
    expect(seed.tax_returns).toHaveLength(3);
    expect(seed.documents.length).toBeGreaterThanOrEqual(3);
    expect(seed.consultation_requests).toHaveLength(2);
    expect(seed.payment_link_requests).toHaveLength(2);

    for (const collection of DEMO_WORKSPACE_COLLECTIONS) {
      for (const record of seed[collection]) {
        expect(record.id).toMatch(/^(demo-|temporary_test_)/);
        expect(record.data.demoSeed).toBe(DEMO_WORKSPACE_SEED_ID);
        expect(record.data.isDummyData).toBe(true);
      }
    }
  });

  it("summarizes the seeded records for operator output", () => {
    const seed = buildDemoWorkspaceSeed(new Date("2026-05-24T09:00:00.000Z"));

    expect(summarizeDemoWorkspaceSeed(seed)).toEqual({
      users: 5,
      profiles: 3,
      user_services: 4,
      tax_returns: 3,
      documents: 5,
      consultation_requests: 2,
      payment_link_requests: 2,
      notifications: 3,
    });
  });
});
