import { describe, expect, it } from "vitest";
import { calculateIncomeTax } from "@/lib/tax-calculations";
import { getSectionReference } from "@/lib/tax-law-reference";

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
