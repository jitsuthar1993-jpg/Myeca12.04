import { describe, expect, it } from "vitest";
import {
  ITR_ACQUISITION_AD_GROUPS,
  ITR_ACQUISITION_NEGATIVE_KEYWORDS,
  ITR_ACQUISITION_PAID_MEDIA_PLAN,
  ITR_ACQUISITION_SUPPORTING_ROUTES,
  buildItrCampaignUrl,
} from "../data/itr-acquisition";

describe("ITR acquisition campaign controls", () => {
  it("keeps /which-itr-form-to-file as the primary paid conversion route", () => {
    expect(ITR_ACQUISITION_PAID_MEDIA_PLAN.primaryRoute).toBe("/which-itr-form-to-file");
    expect(ITR_ACQUISITION_PAID_MEDIA_PLAN.primaryCta).toBe("Check my ITR scope");
    expect(ITR_ACQUISITION_SUPPORTING_ROUTES).toEqual([
      "/form16-parser",
      "/calculators/income-tax",
      "/calculators/regime-comparator",
      "/capital-gains-import",
      "/itr-season-2026",
      "/expert-consultation",
    ]);
  });

  it("allocates the aggressive first-month paid budget with scaling controls", () => {
    expect(ITR_ACQUISITION_PAID_MEDIA_PLAN.monthlyBudgetInr).toBe(200000);
    expect(ITR_ACQUISITION_PAID_MEDIA_PLAN.channels).toEqual([
      { channel: "Google Search", allocationPercent: 75, budgetInr: 150000 },
      { channel: "Retargeting", allocationPercent: 20, budgetInr: 40000 },
      { channel: "Controlled experiments", allocationPercent: 5, budgetInr: 10000 },
    ]);
    expect(ITR_ACQUISITION_PAID_MEDIA_PLAN.scaleControls).toContain("paid CPA below allowable CPA");
    expect(ITR_ACQUISITION_PAID_MEDIA_PLAN.scaleControls).toContain("fulfillment capacity above 1.5x forecast demand");
  });

  it("defines high-intent ad groups without unsafe claims", () => {
    const adGroupNames = ITR_ACQUISITION_AD_GROUPS.map((group) => group.name);

    expect(adGroupNames).toEqual([
      "ITR filing online",
      "CA assisted ITR filing",
      "file ITR with Form 16",
      "AIS mismatch ITR",
      "capital gains ITR",
      "ITR-2 filing",
      "ITR-3 filing",
      "NRI ITR filing",
    ]);

    ITR_ACQUISITION_AD_GROUPS.forEach((group) => {
      expect(group.keywords.length, group.name).toBeGreaterThanOrEqual(3);
      expect(group.ads, group.name).toHaveLength(3);
      expect(JSON.stringify(group.ads)).not.toMatch(/guaranteed refund|notice avoidance|fastest processing|government/i);
    });
  });

  it("standardizes campaign URLs and negative keywords", () => {
    expect(buildItrCampaignUrl("/which-itr-form-to-file", "google", "paid_search", "itr-selector-start")).toBe(
      "/which-itr-form-to-file?utm_campaign=itr-season-2026&utm_source=google&utm_medium=paid_search&utm_content=itr-selector-start",
    );
    expect(ITR_ACQUISITION_NEGATIVE_KEYWORDS).toEqual([
      "free only",
      "government login",
      "jobs",
      "PDF download",
      "refund guarantee",
      "US tax",
      "non India",
      "GST only",
    ]);
  });
});
