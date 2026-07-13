import { describe, expect, it } from "vitest";
import { createVerifiedAdvanceTaxRuleset, TAX_PERIOD_DATASETS } from "@/data/calculator-rule-datasets";
import { projectAdvanceTax } from "./advance-tax-projection";

describe("projectAdvanceTax", () => {
  it("projects installments only from the matching verified legacy dataset", () => {
    const result = projectAdvanceTax({
      dataset: TAX_PERIOD_DATASETS.legacyAy2026_27,
      period: { kind: "financial-assessment-year", financialYear: "2025-26", assessmentYear: "2026-27" },
      totalTax: 100_000,
      tdsAndTcs: 20_000,
      paidInstallments: [10_000, 20_000, 0, 0],
      selfAssessmentPaid: 5_000,
    });

    expect(result).toMatchObject({
      status: "available",
      netTaxLiability: 80_000,
      meetsAdvanceTaxThreshold: true,
      totalAdvanceTaxPaid: 30_000,
      balanceTax: 45_000,
    });
    if (result.status === "available") {
      expect(result.installments.map(({ cumulativeAmount, paidTillQuarter, shortfall }) => ({ cumulativeAmount, paidTillQuarter, shortfall }))).toEqual([
        { cumulativeAmount: 12_000, paidTillQuarter: 10_000, shortfall: 2_000 },
        { cumulativeAmount: 36_000, paidTillQuarter: 30_000, shortfall: 6_000 },
        { cumulativeAmount: 60_000, paidTillQuarter: 30_000, shortfall: 30_000 },
        { cumulativeAmount: 80_000, paidTillQuarter: 30_000, shortfall: 50_000 },
      ]);
    }
  });

  it("rejects the partial Tax Year 2026-27 dataset without producing amounts", () => {
    const result = projectAdvanceTax({
      dataset: TAX_PERIOD_DATASETS.taxYear2026_27,
      period: { kind: "tax-year", taxYear: "2026-27" },
      totalTax: 100_000,
      tdsAndTcs: 0,
      paidInstallments: [0, 0, 0, 0],
      selfAssessmentPaid: 0,
    });

    expect(result).toEqual({
      status: "unavailable",
      reason: "The selected tax-period dataset is not verified for advance-tax calculation.",
    });
    expect(result).not.toHaveProperty("netTaxLiability");
    expect(result).not.toHaveProperty("installments");
  });

  it("rejects a period mismatch and invalid monetary inputs", () => {
    expect(projectAdvanceTax({
      dataset: TAX_PERIOD_DATASETS.legacyAy2026_27,
      period: { kind: "financial-assessment-year", financialYear: "2024-25", assessmentYear: "2026-27" },
      totalTax: 100_000,
      tdsAndTcs: 0,
      paidInstallments: [0, 0, 0, 0],
      selfAssessmentPaid: 0,
    })).toMatchObject({ status: "unavailable", reason: expect.stringContaining("does not match") });

    expect(projectAdvanceTax({
      dataset: TAX_PERIOD_DATASETS.legacyAy2026_27,
      period: { kind: "financial-assessment-year", financialYear: "2025-26", assessmentYear: "2026-27" },
      totalTax: Number.NaN,
      tdsAndTcs: 0,
      paidInstallments: [0, 0, 0, 0],
      selfAssessmentPaid: 0,
    })).toEqual({ status: "unavailable", reason: "Projection inputs must be finite, non-negative amounts." });
  });

  it("projects a future verified Tax Year dataset through the same contract", () => {
    const verifiedTaxYearRules = createVerifiedAdvanceTaxRuleset({
      period: TAX_PERIOD_DATASETS.taxYear2026_27.period,
      governingAct: TAX_PERIOD_DATASETS.taxYear2026_27.governingAct,
      advanceTax: TAX_PERIOD_DATASETS.legacyAy2026_27.advanceTax,
      checkedOn: TAX_PERIOD_DATASETS.taxYear2026_27.checkedOn,
      officialSources: TAX_PERIOD_DATASETS.taxYear2026_27.officialSources,
    });

    const result = projectAdvanceTax({
      dataset: verifiedTaxYearRules,
      period: { kind: "tax-year", taxYear: "2026-27" },
      totalTax: 50_000,
      tdsAndTcs: 10_000,
      paidInstallments: [6_000, 12_000, 0, 0],
      selfAssessmentPaid: 0,
    });

    expect(result).toMatchObject({
      status: "available",
      netTaxLiability: 40_000,
      totalAdvanceTaxPaid: 18_000,
      balanceTax: 22_000,
    });
  });

  it("rejects a mismatched period kind even when its year text matches", () => {
    const verifiedTaxYearRules = createVerifiedAdvanceTaxRuleset({
      period: TAX_PERIOD_DATASETS.taxYear2026_27.period,
      governingAct: TAX_PERIOD_DATASETS.taxYear2026_27.governingAct,
      advanceTax: TAX_PERIOD_DATASETS.legacyAy2026_27.advanceTax,
      checkedOn: TAX_PERIOD_DATASETS.taxYear2026_27.checkedOn,
      officialSources: TAX_PERIOD_DATASETS.taxYear2026_27.officialSources,
    });

    expect(projectAdvanceTax({
      dataset: verifiedTaxYearRules,
      period: { kind: "financial-assessment-year", financialYear: "2025-26", assessmentYear: "2026-27" },
      totalTax: 50_000,
      tdsAndTcs: 0,
      paidInstallments: [0, 0, 0, 0],
      selfAssessmentPaid: 0,
    })).toMatchObject({ status: "unavailable", reason: expect.stringContaining("does not match") });
  });

  it("does not mutate the supplied dataset, period, or installment amounts", () => {
    const datasetBefore = structuredClone(TAX_PERIOD_DATASETS.legacyAy2026_27);
    const period = { kind: "financial-assessment-year" as const, financialYear: "2025-26", assessmentYear: "2026-27" };
    const installments = [1_000, 2_000, 3_000, 4_000] as const;

    projectAdvanceTax({
      dataset: TAX_PERIOD_DATASETS.legacyAy2026_27,
      period,
      totalTax: 50_000,
      tdsAndTcs: 0,
      paidInstallments: installments,
      selfAssessmentPaid: 0,
    });

    expect(TAX_PERIOD_DATASETS.legacyAy2026_27).toEqual(datasetBefore);
    expect(period).toEqual({ kind: "financial-assessment-year", financialYear: "2025-26", assessmentYear: "2026-27" });
    expect(installments).toEqual([1_000, 2_000, 3_000, 4_000]);
  });

  it("treats the exact statutory threshold as meeting the threshold", () => {
    const result = projectAdvanceTax({
      dataset: TAX_PERIOD_DATASETS.legacyAy2026_27,
      period: TAX_PERIOD_DATASETS.legacyAy2026_27.period,
      totalTax: 10_000,
      tdsAndTcs: 0,
      paidInstallments: [0, 0, 0, 0],
      selfAssessmentPaid: 0,
    });

    expect(result).toMatchObject({ status: "available", meetsAdvanceTaxThreshold: true });
  });

  it("does not create installment obligations below the statutory threshold", () => {
    const result = projectAdvanceTax({
      dataset: TAX_PERIOD_DATASETS.legacyAy2026_27,
      period: TAX_PERIOD_DATASETS.legacyAy2026_27.period,
      totalTax: 9_000,
      tdsAndTcs: 0,
      paidInstallments: [0, 0, 0, 0],
      selfAssessmentPaid: 0,
    });

    expect(result).toMatchObject({ status: "available", meetsAdvanceTaxThreshold: false });
    if (result.status === "available") {
      expect(result.installments.map(({ cumulativeAmount, shortfall }) => ({ cumulativeAmount, shortfall })))
        .toEqual(Array.from({ length: 4 }, () => ({ cumulativeAmount: 0, shortfall: 0 })));
    }
  });

  it("rejects an object that copies a verified ruleset without constructor provenance", () => {
    const spoofedRules = { ...TAX_PERIOD_DATASETS.legacyAy2026_27 };

    expect(projectAdvanceTax({
      dataset: spoofedRules,
      period: spoofedRules.period,
      totalTax: 50_000,
      tdsAndTcs: 0,
      paidInstallments: [0, 0, 0, 0],
      selfAssessmentPaid: 0,
    })).toEqual({
      status: "unavailable",
      reason: "The selected tax-period dataset is not verified for advance-tax calculation.",
    });
  });
});
