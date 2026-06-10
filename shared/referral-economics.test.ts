import { describe, expect, it } from "vitest";
import { calculateReferralAccountCredit } from "./referral-economics";

describe("seasonal referral economics", () => {
  it("creates no credit before the referred service is completed", () => {
    expect(
      calculateReferralAccountCredit({
        netCollectedRevenue: 2_000,
        serviceCompleted: false,
      }),
    ).toBe(0);
  });

  it("caps post-completion account credit at 10% of net collected revenue", () => {
    expect(
      calculateReferralAccountCredit({
        netCollectedRevenue: 2_499,
        serviceCompleted: true,
      }),
    ).toBe(249);
  });

  it("creates no credit when another discount or referral benefit was stacked", () => {
    expect(
      calculateReferralAccountCredit({
        netCollectedRevenue: 5_000,
        serviceCompleted: true,
        hasStackedDiscount: true,
      }),
    ).toBe(0);
  });
});
