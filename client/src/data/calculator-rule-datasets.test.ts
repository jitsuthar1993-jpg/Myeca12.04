import { describe, expect, it } from "vitest";
import { createVerifiedAdvanceTaxRuleset, HSN_REFERENCE_DATASET, PENALTY_RULE_DATASET, TAX_PERIOD_DATASETS } from "./calculator-rule-datasets";

describe("calculator rule datasets", () => {
  it("keeps every dataset effective-dated and source-linked", () => {
    const officialHosts = new Set([
      "cbic-gst.gov.in",
      "www.incometax.gov.in",
      "www.incometaxindia.gov.in",
      "www.mca.gov.in",
      "www.rbi.org.in",
    ]);

    for (const dataset of [HSN_REFERENCE_DATASET, PENALTY_RULE_DATASET, ...Object.values(TAX_PERIOD_DATASETS)]) {
      expect(dataset.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${dataset.checkedOn}T00:00:00Z`).toISOString().slice(0, 10)).toBe(dataset.checkedOn);
      expect(dataset.officialSources.length).toBeGreaterThan(0);
      for (const source of dataset.officialSources) {
        const url = new URL(source.url);
        expect(url.protocol).toBe("https:");
        expect(officialHosts.has(url.hostname)).toBe(true);
      }
    }
  });

  it("requires provision-level evidence before advance-tax rules are verified", () => {
    const verifiedRules = TAX_PERIOD_DATASETS.legacyAy2026_27;
    expect(verifiedRules.status).toBe("verified");
    expect(verifiedRules.officialSources).toHaveLength(2);
    expect(verifiedRules.officialSources.map((source) => source.title.toLowerCase())).toEqual([
      expect.stringContaining("section 208"),
      expect.stringContaining("section 211"),
    ]);
  });

  it("does not expose unverified HSN rates or statutory penalty calculations", () => {
    expect(HSN_REFERENCE_DATASET.status).toBe("reference-only");
    expect(HSN_REFERENCE_DATASET.entries.every((entry) => !("rate" in entry))).toBe(true);
    expect(PENALTY_RULE_DATASET.status).toBe("unavailable");
    expect(PENALTY_RULE_DATASET.rules).toHaveLength(0);
  });

  it("separates legacy AY filing rules from the current Tax Year contract", () => {
    expect(TAX_PERIOD_DATASETS.legacyAy2026_27).toMatchObject({
      status: "verified",
      period: { kind: "financial-assessment-year", financialYear: "2025-26", assessmentYear: "2026-27" },
    });
    expect(TAX_PERIOD_DATASETS.taxYear2026_27).toMatchObject({
      status: "partial",
      period: { kind: "tax-year", taxYear: "2026-27" },
    });
    expect(TAX_PERIOD_DATASETS.taxYear2026_27).not.toHaveProperty("assessmentYear");
  });

  it.each([
    ["non-HTTPS source", { officialSources: [{ title: "Section 208", url: "http://www.incometaxindia.gov.in/w/section-208-62" }] }],
    ["unofficial source host", { officialSources: [{ title: "Section 208", url: "https://example.com/section-208" }] }],
    ["invalid checked date", { checkedOn: "2026-02-30" }],
    ["invalid period metadata", { period: { kind: "tax-year", taxYear: "" } }],
    ["empty governing Act", { governingAct: " " }],
    ["negative threshold", { advanceTax: { ...TAX_PERIOD_DATASETS.legacyAy2026_27.advanceTax, threshold: -1 } }],
    ["wrong installment count", { advanceTax: { threshold: 10_000, installments: TAX_PERIOD_DATASETS.legacyAy2026_27.advanceTax.installments.slice(0, 3) } }],
    ["empty due date", { advanceTax: { threshold: 10_000, installments: TAX_PERIOD_DATASETS.legacyAy2026_27.advanceTax.installments.map((rule, index) => index === 1 ? { ...rule, dueDate: "" } : rule) } }],
    ["non-increasing percentages", { advanceTax: { threshold: 10_000, installments: TAX_PERIOD_DATASETS.legacyAy2026_27.advanceTax.installments.map((rule, index) => index === 2 ? { ...rule, cumulativePercent: 45 } : rule) } }],
    ["non-finite percentage", { advanceTax: { threshold: 10_000, installments: TAX_PERIOD_DATASETS.legacyAy2026_27.advanceTax.installments.map((rule, index) => index === 2 ? { ...rule, cumulativePercent: Number.NaN } : rule) } }],
    ["percentage above 100", { advanceTax: { threshold: 10_000, installments: TAX_PERIOD_DATASETS.legacyAy2026_27.advanceTax.installments.map((rule, index) => index === 2 ? { ...rule, cumulativePercent: 101 } : rule) } }],
    ["final percentage below 100", { advanceTax: { threshold: 10_000, installments: TAX_PERIOD_DATASETS.legacyAy2026_27.advanceTax.installments.map((rule, index) => index === 3 ? { ...rule, cumulativePercent: 99 } : rule) } }],
  ])("rejects malformed verified rules: %s", (_label, override) => {
    const valid = TAX_PERIOD_DATASETS.legacyAy2026_27;
    expect(() => createVerifiedAdvanceTaxRuleset({
      period: valid.period,
      governingAct: valid.governingAct,
      advanceTax: valid.advanceTax,
      checkedOn: valid.checkedOn,
      officialSources: valid.officialSources,
      ...override,
    } as Parameters<typeof createVerifiedAdvanceTaxRuleset>[0])).toThrow(TypeError);
  });
});
