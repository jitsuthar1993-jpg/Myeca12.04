import { describe, expect, it } from "vitest";
import { recommendItrForm } from "@shared/itr-filing";
import {
  DEFAULT_ITR_START_SELECTOR_ANSWERS,
  buildItrStartDraft,
  type ItrStartSelectorAnswers,
} from "./start-selector";

function recommendationFor(overrides: Partial<ItrStartSelectorAnswers>) {
  return recommendItrForm(buildItrStartDraft({
    ...DEFAULT_ITR_START_SELECTOR_ANSWERS,
    ...overrides,
  }));
}

describe("ITR start form selector mapper", () => {
  it("maps the default public selector answers to ITR-1", () => {
    const recommendation = recommendationFor({});

    expect(recommendation.form).toBe("ITR-1");
    expect(recommendation.caReviewRequired).toBe(false);
    expect(recommendation.requiredSchedules).toContain("Schedule Salary");
  });

  it("maps non-business capital gains complexity to ITR-2", () => {
    const recommendation = recommendationFor({
      capitalGains: "short-term",
    });

    expect(recommendation.form).toBe("ITR-2");
    expect(recommendation.blockers).toContain("ITR-1 cannot be used for short-term capital gains.");
  });

  it("maps non-presumptive business cases to ITR-3", () => {
    const recommendation = recommendationFor({
      businessOrProfession: "business",
      presumptiveScheme: "none",
    });

    expect(recommendation.form).toBe("ITR-3");
    expect(recommendation.exportAvailable).toBe(false);
  });

  it("maps eligible presumptive profession cases to ITR-4", () => {
    const recommendation = recommendationFor({
      salaryOrPension: false,
      businessOrProfession: "profession",
      presumptiveScheme: "44ADA",
    });

    expect(recommendation.form).toBe("ITR-4");
    expect(recommendation.requiredSchedules).toContain("Schedule 44ADA");
  });

  it("keeps the public selector scoped to individual taxpayers", () => {
    const draft = buildItrStartDraft({
      ...DEFAULT_ITR_START_SELECTOR_ANSWERS,
      taxpayerType: "llp",
    } as any);

    expect(draft.taxpayer.type).toBe("individual");
  });
});
