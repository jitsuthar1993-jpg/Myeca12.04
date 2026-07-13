import { describe, expect, it } from "vitest";
import { calculateWithdrawalPlan } from "./withdrawal-planner";

describe("calculateWithdrawalPlan", () => {
  it("applies nominal periodic interest before each withdrawal", () => {
    const result = calculateWithdrawalPlan(1200, 12, 100, "monthly", 1);
    expect(result.schedule[0]).toMatchObject({ interestAccrued: 12, withdrawal: 100, endingBalance: 1112 });
  });

  it("caps the final withdrawal and records the first shortfall", () => {
    const result = calculateWithdrawalPlan(100, 0, 60, "monthly", 1);
    expect(result.schedule.map(({ withdrawal }) => withdrawal)).toEqual([60, 40]);
    expect(result).toMatchObject({ depleted: true, depletionPeriod: 2, totalWithdrawn: 100 });
  });

  it("does not report depletion when no withdrawal was requested", () => {
    expect(calculateWithdrawalPlan(0, 0, 0, "monthly", 1)).toMatchObject({ depleted: false, endingBalance: 0 });
  });

  it.each([
    [Number.NaN, 7, 100, "monthly", 1],
    [1000, -1, 100, "monthly", 1],
    [1000, 7, -1, "monthly", 1],
    [1000, 7, 100, "weekly", 1],
    [1000, 7, 100, "monthly", 1.5],
  ])("rejects invalid input %#", (principal, rate, withdrawal, frequency, years) => {
    expect(() => calculateWithdrawalPlan(principal as number, rate as number, withdrawal as number, frequency as "monthly", years as number)).toThrow();
  });
});
