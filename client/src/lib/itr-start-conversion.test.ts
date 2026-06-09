import { describe, expect, it } from "vitest";
import {
  buildItrServiceMetadata,
  getItrStartRecommendation,
  type ItrStartAnswers,
} from "./itr-start-conversion";

const baseAnswers: ItrStartAnswers = {
  assessmentYear: "2026-27",
  incomeProfiles: ["salary"],
  assistanceLevel: "guided",
};

describe("ITR start conversion recommendation", () => {
  it("recommends the Rs 499 salary plan for simple guided salary cases", () => {
    const recommendation = getItrStartRecommendation(baseAnswers);

    expect(recommendation.planId).toBe("salary");
    expect(recommendation.ctaLabel).toBe("Start Salary ITR - Rs 499");
    expect(recommendation.paymentAmount).toBe(499);
  });

  it("recommends the Rs 999 CA-assisted plan for users who want review help", () => {
    const recommendation = getItrStartRecommendation({
      ...baseAnswers,
      assistanceLevel: "ca-assisted",
    });

    expect(recommendation.planId).toBe("expert-assisted");
    expect(recommendation.ctaLabel).toBe("Start CA-Assisted ITR - Rs 999");
    expect(recommendation.paymentAmount).toBe(999);
  });

  it("routes complex profiles to scope review without a fixed payment amount", () => {
    for (const profile of ["capital-gains", "business-freelance", "nri-foreign", "notice"] as const) {
      const recommendation = getItrStartRecommendation({
        ...baseAnswers,
        incomeProfiles: ["salary", profile],
      });

      expect(recommendation.planId).toBe("complex-scope");
      expect(recommendation.ctaLabel).toBe("Get Scope Review");
      expect(recommendation.paymentAmount).toBeNull();
    }
  });

  it("builds privacy-safe service metadata without sensitive tax values", () => {
    const recommendation = getItrStartRecommendation(baseAnswers);
    const metadata = buildItrServiceMetadata(
      baseAnswers,
      recommendation,
      "homepage_hero",
      "primary_start"
    );

    expect(metadata).toMatchObject({
      source: "itr_start_funnel",
      originalServicePath: "/which-itr-form-to-file",
      conversionSource: "homepage_hero",
      recommendedPlanId: "salary",
      assessmentYear: "2026-27",
      incomeProfile: ["salary"],
      assistanceLevel: "guided",
      ctaVariant: "primary_start",
    });
    expect(Object.keys(metadata).join(" ")).not.toMatch(/pan|phone|email|incomeAmount|taxable|document/i);
  });
});
