import { describe, expect, it } from "vitest";
import { classifySpaFallbackPath } from "./spa-fallback-policy";

describe("SPA fallback public route policy", () => {
  it("keeps published static routes on the app shell", () => {
    expect(classifySpaFallbackPath("/calculators/income-tax")).toMatchObject({
      known: true,
      status: 200,
      reason: "exact-route",
    });
  });

  it("keeps published blog and learning details on the app shell", () => {
    expect(classifySpaFallbackPath("/blog/ay-2026-27-crypto-vda-tax-records-checklist").known).toBe(true);
    expect(classifySpaFallbackPath("/learn/guide/salary-tax-calculator-guide-ay-2026-27").known).toBe(true);
  });

  it("continues to reject hostile unknown routes", () => {
    expect(classifySpaFallbackPath("/random-product-gxrcld")).toMatchObject({
      known: false,
      status: 404,
    });
  });
});
