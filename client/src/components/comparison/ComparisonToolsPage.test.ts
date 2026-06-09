import { describe, expect, it } from "vitest";

import {
  calculateBasicSalaryTax,
  getSuggestedRegime,
} from "./ComparisonToolsPage";

describe("ComparisonToolsPage tax comparison", () => {
  it("uses the AY 2026-27 new-regime resident rebate for the basic salary estimate", () => {
    expect(calculateBasicSalaryTax(1_000_000, "new")).toBe(0);
    expect(calculateBasicSalaryTax(1_000_000, "old")).toBe(106_600);
  });

  it("suggests the regime with the lower calculated tax", () => {
    expect(getSuggestedRegime(106_600, 0)).toBe("new");
    expect(getSuggestedRegime(0, 10_000)).toBe("old");
    expect(getSuggestedRegime(5_000, 5_000)).toBe("same");
  });
});
