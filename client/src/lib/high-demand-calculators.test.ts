import { describe, expect, it } from "vitest";
import {
  calculateEPF,
  calculateGST,
  calculateGratuity,
  calculateInflation,
  calculateLoanEligibility,
  calculateLumpsum,
  calculateRD,
  calculateSWP,
  calculateSalary,
} from "@/lib/high-demand-calculators";

describe("high demand calculator helpers", () => {
  it("calculates GST exclusive and inclusive values with split taxes", () => {
    expect(calculateGST({ amount: 1000, rate: 18, mode: "exclusive", supplyType: "intra" })).toMatchObject({
      baseAmount: 1000,
      taxAmount: 180,
      totalAmount: 1180,
      cgst: 90,
      sgst: 90,
      igst: 0,
    });

    expect(calculateGST({ amount: 1180, rate: 18, mode: "inclusive", supplyType: "inter" })).toMatchObject({
      baseAmount: 1000,
      taxAmount: 180,
      totalAmount: 1180,
      cgst: 0,
      sgst: 0,
      igst: 180,
    });
  });

  it("estimates salary in-hand from CTC components", () => {
    const result = calculateSalary({
      annualCtc: 1200000,
      basicPercent: 40,
      hraPercent: 50,
      variablePay: 120000,
      employeePfPercent: 12,
      employerPfPercent: 12,
      professionalTaxMonthly: 200,
    });

    expect(result.monthlyBasic).toBe(40000);
    expect(result.monthlyEmployeePf).toBe(4800);
    expect(result.monthlyEmployerPf).toBe(4800);
    expect(result.monthlyGross).toBe(85200);
    expect(result.monthlyInHand).toBeGreaterThan(70000);
  });

  it("rounds gratuity years and applies the 15/26 formula", () => {
    expect(calculateGratuity(52000, 6, 7)).toMatchObject({
      roundedYears: 7,
      eligible: true,
      gratuity: 210000,
    });

    expect(calculateGratuity(52000, 4, 11)).toMatchObject({
      roundedYears: 5,
      eligible: false,
      gratuity: 0,
      formulaAmount: 150000,
    });
  });

  it("projects EPF with employee, employer, EPS and interest components", () => {
    const result = calculateEPF({
      monthlyBasic: 50000,
      employeePercent: 12,
      employerPercent: 12,
      annualRate: 8.25,
      years: 1,
      openingBalance: 0,
    });

    expect(result.employeeContribution).toBe(6000);
    expect(result.employerContribution).toBe(6000);
    expect(result.epsContribution).toBe(1250);
    expect(result.monthlyEpfContribution).toBe(10751);
    expect(result.maturityAmount).toBeGreaterThan(result.totalContribution);
  });

  it("calculates RD maturity with quarterly compounding", () => {
    const result = calculateRD(10000, 7, 12);
    expect(result.totalInvestment).toBe(120000);
    expect(result.maturityAmount).toBeGreaterThan(120000);
    expect(result.totalInterest).toBe(result.maturityAmount - result.totalInvestment);
  });

  it("calculates lumpsum, SWP, inflation and loan eligibility outputs", () => {
    expect(calculateLumpsum(100000, 12, 5, 6)).toMatchObject({
      investedAmount: 100000,
      maturityAmount: 176234,
    });

    expect(calculateSWP(1000000, 8, 10000, 5)).toMatchObject({
      sustainable: true,
    });

    expect(calculateInflation(100000, 6, 10)).toMatchObject({
      futureCost: 179085,
    });

    expect(calculateLoanEligibility(100000, 20000, 50, 9, 20)).toMatchObject({
      maxTotalEmi: 50000,
      eligibleEmi: 30000,
    });
  });
});
