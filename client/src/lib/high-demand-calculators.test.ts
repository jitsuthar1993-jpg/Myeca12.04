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

  it("keeps rounded intra-state tax components reconciled", () => {
    const result = calculateGST({ amount: 3, rate: 18, mode: "exclusive", supplyType: "intra" });
    expect(result.cgst + result.sgst).toBe(result.taxAmount);
    expect(result.baseAmount + result.taxAmount).toBe(result.totalAmount);
    const inclusive = calculateGST({ amount: 0.49, rate: 18, mode: "inclusive", supplyType: "inter" });
    expect(inclusive.baseAmount + inclusive.taxAmount).toBe(inclusive.totalAmount);
  });

  it("rejects invalid GST assumptions", () => {
    expect(() => calculateGST({ amount: -1, rate: 18, mode: "exclusive", supplyType: "intra" })).toThrow("GST inputs cannot be negative");
    expect(() => calculateGST({ amount: 1000, rate: Number.NaN, mode: "exclusive", supplyType: "intra" })).toThrow("GST inputs must be finite numbers");
    expect(() => calculateGST({ amount: 1000, rate: 41, mode: "exclusive", supplyType: "intra" })).toThrow("GST inputs exceed the supported planning range");
    expect(() => calculateGST({ amount: 1000, rate: 18, mode: "invalid" as "exclusive", supplyType: "intra" })).toThrow("GST calculation mode is unsupported");
    expect(() => calculateGST({ amount: 1000, rate: 18, mode: "exclusive", supplyType: "invalid" as "intra" })).toThrow("GST calculation mode is unsupported");
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
    expect(result.monthlyEpfContribution).toBe(10750);
    expect(result.maturityAmount).toBeGreaterThan(result.totalContribution);
  });

  it("calculates RD maturity with quarterly compounding", () => {
    const result = calculateRD(10000, 7, 12);
    expect(result.totalInvestment).toBe(120000);
    expect(result.maturityAmount).toBeGreaterThan(120000);
    expect(result.totalInterest).toBe(result.maturityAmount - result.totalInvestment);
  });

  it("supports a zero-rate RD without creating interest", () => {
    expect(calculateRD(10000, 0, 12)).toEqual({
      totalInvestment: 120000,
      maturityAmount: 120000,
      totalInterest: 0,
    });
  });

  it("rejects invalid and unsupported RD assumptions", () => {
    expect(() => calculateRD(-1, 7, 12)).toThrow("RD inputs cannot be negative");
    expect(() => calculateRD(10000, Number.NaN, 12)).toThrow("RD inputs must be finite numbers");
    expect(() => calculateRD(10000, 7, 6.5)).toThrow("RD tenure must be a positive integer");
    expect(() => calculateRD(10000, 101, 12)).toThrow("RD inputs exceed the supported planning range");
    expect(() => calculateRD(100_000_001, 7, 12)).toThrow("RD inputs exceed the supported planning range");
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

  it("handles zero-return and inflation assumptions for lumpsum projections", () => {
    expect(calculateLumpsum(100000, 0, 5, 0)).toEqual({
      investedAmount: 100000,
      maturityAmount: 100000,
      wealthGain: 0,
      inflationAdjustedValue: 100000,
    });
    expect(calculateLumpsum(100000, 0, 5, 6).inflationAdjustedValue).toBeLessThan(100000);
  });

  it("rejects invalid and unsupported lumpsum assumptions", () => {
    expect(() => calculateLumpsum(-1, 12, 5, 6)).toThrow("Lumpsum inputs cannot be negative");
    expect(() => calculateLumpsum(100000, Number.NaN, 5, 6)).toThrow("Lumpsum inputs must be finite numbers");
    expect(() => calculateLumpsum(100000, 12, 1.5, 6)).toThrow("Lumpsum period must be a positive integer");
    expect(() => calculateLumpsum(100000, 101, 5, 6)).toThrow("Lumpsum inputs exceed the supported planning range");
  });

  it("models a bounded negative-return scenario", () => {
    const result = calculateLumpsum(100000, -10, 2, 0);
    expect(result).toMatchObject({ maturityAmount: 81000, wealthGain: -19000, inflationAdjustedValue: 81000 });
  });

  it("models SWP depletion and zero-return timing", () => {
    expect(calculateSWP(100000, 0, 10000, 1)).toEqual({ remainingCorpus: 0, totalWithdrawn: 100000, depletionMonth: 11, sustainable: false });
    expect(calculateSWP(120000, 0, 10000, 1)).toEqual({ remainingCorpus: 0, totalWithdrawn: 120000, depletionMonth: null, sustainable: true });
  });

  it("treats expected return as an effective annual assumption", () => {
    const result = calculateSWP(100000, 12, 0, 1);
    expect(result).toMatchObject({ remainingCorpus: 112000, totalWithdrawn: 0, sustainable: true });
  });

  it("handles zero inflation without changing cost or purchasing power", () => {
    expect(calculateInflation(100000, 0, 10)).toEqual({ currentCost: 100000, futureCost: 100000, futurePurchasingPower: 100000, purchasingPowerLoss: 0 });
  });

  it("rejects invalid and unsupported inflation assumptions", () => {
    expect(() => calculateInflation(-1, 6, 10)).toThrow("Inflation inputs cannot be negative");
    expect(() => calculateInflation(100000, Number.NaN, 10)).toThrow("Inflation inputs must be finite numbers");
    expect(() => calculateInflation(100000, 6, 1.5)).toThrow("Inflation period must be a positive integer");
    expect(() => calculateInflation(100000, 101, 10)).toThrow("Inflation inputs exceed the supported planning range");
  });

  it("returns zero loan eligibility when existing obligations consume FOIR capacity", () => {
    expect(calculateLoanEligibility(100000, 50000, 50, 9, 20)).toEqual({ maxTotalEmi: 50000, eligibleEmi: 0, eligibleLoanAmount: 0, totalInterest: 0, totalPayment: 0 });
  });

  it("rejects invalid and unsupported loan eligibility assumptions", () => {
    expect(() => calculateLoanEligibility(-1, 0, 50, 9, 20)).toThrow("Loan eligibility inputs cannot be negative");
    expect(() => calculateLoanEligibility(100000, 0, Number.NaN, 9, 20)).toThrow("Loan eligibility inputs must be finite numbers");
    expect(() => calculateLoanEligibility(100000, 0, 50, 9, 1.5)).toThrow("Loan tenure must be a positive integer");
    expect(() => calculateLoanEligibility(100000, 0, 101, 9, 20)).toThrow("Loan eligibility inputs exceed the supported planning range");
  });

  it("uses the statutory gratuity service-year threshold", () => {
    expect(calculateGratuity(52000, 5, 6).roundedYears).toBe(5);
    expect(calculateGratuity(52000, 5, 7).roundedYears).toBe(6);
  });

  it("rejects invalid gratuity inputs", () => {
    expect(() => calculateGratuity(-1, 5, 0)).toThrow("Gratuity inputs cannot be negative");
    expect(() => calculateGratuity(52000, Number.NaN, 0)).toThrow("Gratuity inputs must be finite numbers");
    expect(() => calculateGratuity(52000, 5, 12)).toThrow("Gratuity service months must be from 0 to 11");
  });

  it("does not divert more EPS than the employer contribution", () => {
    expect(calculateEPF({ monthlyBasic: 10000, employeePercent: 12, employerPercent: 5, annualRate: 0, years: 1, openingBalance: 0 }).epsContribution).toBe(500);
    expect(calculateEPF({ monthlyBasic: 10000, employeePercent: 12, employerPercent: 0, annualRate: 0, years: 1, openingBalance: 0 }).epsContribution).toBe(0);
  });

  it("rejects invalid and unsupported SWP assumptions", () => {
    expect(() => calculateSWP(-1, 8, 10000, 5)).toThrow("SWP inputs cannot be negative");
    expect(() => calculateSWP(100000, Number.NaN, 10000, 5)).toThrow("SWP inputs must be finite numbers");
    expect(() => calculateSWP(100000, 8, 10000, 1.5)).toThrow("SWP period must be a positive integer");
    expect(() => calculateSWP(100000, -100, 10000, 5)).toThrow("SWP inputs exceed the supported planning range");
  });
});
