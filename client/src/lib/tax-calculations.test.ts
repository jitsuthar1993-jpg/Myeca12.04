import { describe, expect, it } from "vitest";
import { calculateEMI, calculateIncomeTax } from "@/lib/tax-calculations";
import { computeIndividualIncomeTax } from "@/lib/income-tax-engine";
import { getSectionReference } from "@/lib/tax-law-reference";

describe("calculateEMI", () => {
  it("calculates a finite zero-interest repayment schedule", () => {
    const result = calculateEMI(1200000, 0, 10);

    expect(result.emi).toBe(10000);
    expect(result.totalPayment).toBe(1200000);
    expect(result.totalInterest).toBe(0);
    expect(result.monthlyBreakdown[0]).toMatchObject({ interestPaid: 0, principalPaid: 10000 });
  });

  it("returns a zero result for a zero principal", () => {
    expect(calculateEMI(0, 8.5, 20)).toMatchObject({ emi: 0, totalPayment: 0, totalInterest: 0 });
  });

  it("rejects invalid tenure and non-finite inputs", () => {
    expect(() => calculateEMI(1000000, 8.5, 0)).toThrow("Tenure must be greater than zero");
    expect(() => calculateEMI(Number.NaN, 8.5, 20)).toThrow("EMI inputs must be finite numbers");
    expect(() => calculateEMI(1000000, Number.MAX_VALUE, 20)).toThrow("Rate must be 100 or less");
    expect(() => calculateEMI(1000000, 8.5, 1.01)).toThrow("Tenure must resolve to whole months");
  });

  it("preserves the standard positive-rate amortization contract", () => {
    const result = calculateEMI(800000, 9.5, 7);

    expect(result.emi).toBe(13075);
    expect(result.totalPayment).toBe(result.totalInterest + 800000);
    expect(result.monthlyBreakdown).toHaveLength(60);
    expect(result.monthlyBreakdown[0].interestPaid).toBeGreaterThan(0);
    expect(result.monthlyBreakdown[1].remainingBalance).toBeLessThan(result.monthlyBreakdown[0].remainingBalance);
  });
});

describe("calculateIncomeTax AY 2026-27", () => {
  it("applies new-regime slabs, standard deduction, and Section 87A rebate", () => {
    const cases = [
      { grossIncome: 475000, expectedTax: 0 },
      { grossIncome: 875000, expectedTax: 0 },
      { grossIncome: 1275000, expectedTax: 0 },
      { grossIncome: 1285000, expectedTax: 10400 },
      { grossIncome: 2075000, expectedTax: 208000 },
      { grossIncome: 2475000, expectedTax: 312000 },
      { grossIncome: 3075000, expectedTax: 499200 },
    ];

    for (const testCase of cases) {
      expect(
        calculateIncomeTax({
          income: testCase.grossIncome,
          regime: "new",
          deductions: 0,
          assessmentYear: "2026-27",
        }).taxPayable,
      ).toBe(testCase.expectedTax);
    }
  });

  it("returns detailed new-regime computation including marginal relief and cess", () => {
    const calculation = calculateIncomeTax({
      income: 1285000,
      regime: "new",
      deductions: 0,
      assessmentYear: "2026-27",
      salaryIncome: 1285000,
    });

    expect(calculation.standardDeduction).toBe(75000);
    expect(calculation.eligibleDeductions).toBe(0);
    expect(calculation.taxableIncome).toBe(1210000);
    expect(calculation.taxBeforeRebate).toBe(61500);
    expect(calculation.rebate87A).toBe(0);
    expect(calculation.marginalRelief).toBe(51500);
    expect(calculation.taxBeforeCess).toBe(10000);
    expect(calculation.cess).toBe(400);
    expect(calculation.taxPayable).toBe(10400);
    expect(calculation.slabBreakdown).toEqual([
      expect.objectContaining({ taxableAmount: 400000, tax: 0 }),
      expect.objectContaining({ taxableAmount: 400000, tax: 20000 }),
      expect.objectContaining({ taxableAmount: 400000, tax: 40000 }),
      expect.objectContaining({ taxableAmount: 10000, tax: 1500 }),
      expect.objectContaining({ taxableAmount: 0, tax: 0 }),
      expect.objectContaining({ taxableAmount: 0, tax: 0 }),
      expect.objectContaining({ taxableAmount: 0, tax: 0 }),
    ]);
  });

  it("applies old-regime rebate and age-based slabs", () => {
    expect(
      calculateIncomeTax({
        income: 550000,
        regime: "old",
        deductions: 50000,
        assessmentYear: "2026-27",
        age: 30,
      }).taxPayable,
    ).toBe(0);

    expect(
      calculateIncomeTax({
        income: 600000,
        regime: "old",
        deductions: 50000,
        assessmentYear: "2026-27",
        age: 30,
      }).taxPayable,
    ).toBe(0);

    expect(
      calculateIncomeTax({
        income: 650000,
        regime: "old",
        deductions: 50000,
        assessmentYear: "2026-27",
        age: 65,
      }).taxPayable,
    ).toBe(20800);

    expect(
      calculateIncomeTax({
        income: 1100000,
        regime: "old",
        deductions: 50000,
        assessmentYear: "2026-27",
        age: 82,
      }).taxPayable,
    ).toBe(104000);
  });

  it("returns detailed old-regime computation with eligible deductions", () => {
    const calculation = calculateIncomeTax({
      income: 650000,
      regime: "old",
      deductions: 50000,
      assessmentYear: "2026-27",
      age: 65,
      salaryIncome: 650000,
    });

    expect(calculation.standardDeduction).toBe(50000);
    expect(calculation.eligibleDeductions).toBe(50000);
    expect(calculation.taxableIncome).toBe(550000);
    expect(calculation.taxBeforeRebate).toBe(20000);
    expect(calculation.rebate87A).toBe(0);
    expect(calculation.cess).toBe(800);
    expect(calculation.taxPayable).toBe(20800);
    expect(calculation.slabBreakdown).toEqual([
      expect.objectContaining({ taxableAmount: 300000, tax: 0 }),
      expect.objectContaining({ taxableAmount: 200000, tax: 10000 }),
      expect.objectContaining({ taxableAmount: 50000, tax: 10000 }),
      expect.objectContaining({ taxableAmount: 0, tax: 0 }),
    ]);
  });

  it("keeps Section 87A rebate away from special-rate income", () => {
    const calculation = computeIndividualIncomeTax({
      assessmentYear: "2026-27",
      regime: "new",
      profile: { residentialStatus: "resident", age: 30 },
      income: {
        salary: 875000,
        cryptoAndWinnings: 100000,
      },
    });

    expect(calculation.normalTaxableIncome).toBe(800000);
    expect(calculation.normalSlabTax).toBe(20000);
    expect(calculation.specialRateTax).toBe(30000);
    expect(calculation.rebate87A).toBe(20000);
    expect(calculation.taxBeforeCess).toBe(30000);
    expect(calculation.cess).toBe(1200);
    expect(calculation.taxPayable).toBe(31200);
  });

  it("does not apply Section 87A rebate to non-residents", () => {
    const calculation = computeIndividualIncomeTax({
      assessmentYear: "2026-27",
      regime: "new",
      profile: { residentialStatus: "nonResident", age: 30 },
      income: { salary: 875000 },
    });

    expect(calculation.rebate87A).toBe(0);
    expect(calculation.taxPayable).toBe(20800);
  });

  it("applies surcharge marginal relief and Health & Education Cess", () => {
    const calculation = computeIndividualIncomeTax({
      assessmentYear: "2026-27",
      regime: "new",
      profile: { residentialStatus: "resident", age: 30 },
      income: { salary: 5100000 },
    });

    expect(calculation.taxableIncome).toBe(5025000);
    expect(calculation.taxAfterRebate).toBe(1087500);
    expect(calculation.surchargeBeforeRelief).toBe(108750);
    expect(calculation.surchargeMarginalRelief).toBe(91250);
    expect(calculation.surcharge).toBe(17500);
    expect(calculation.cess).toBe(44200);
    expect(calculation.taxPayable).toBe(1149200);
  });

  it("applies tax credits against gross tax and reports refund", () => {
    const calculation = computeIndividualIncomeTax({
      assessmentYear: "2026-27",
      regime: "new",
      profile: { residentialStatus: "resident", age: 30 },
      income: { salary: 1500000 },
      taxCredits: { tdsTcs: 150000 },
    });

    expect(calculation.grossTaxLiability).toBe(97500);
    expect(calculation.taxCredits).toBe(150000);
    expect(calculation.taxPayable).toBe(0);
    expect(calculation.refundDue).toBe(52500);
  });
});

describe("Income-tax Act 2025 section references", () => {
  it("maps high-impact 1961 Act sections to 2025 Act equivalents", () => {
    expect(getSectionReference("80C")?.newAct).toBe("Section 123");
    expect(getSectionReference("115BAC")?.newAct).toBe("Section 202");
    expect(getSectionReference("87A")?.newAct).toBe("Section 156");
    expect(getSectionReference("192")?.newAct).toBe("Section 392");
    expect(getSectionReference("10(13A)")?.newAct).toBe("Schedule III, Table 11");
  });
});
