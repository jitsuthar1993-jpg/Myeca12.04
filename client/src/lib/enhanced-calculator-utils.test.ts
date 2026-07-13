import { describe, expect, it } from "vitest";
import { calculateEnhancedFD, calculateEnhancedPPF, calculateEnhancedSIP } from "@/lib/enhanced-calculator-utils";

describe("calculateEnhancedPPF", () => {
  it("returns a projection without inventing a tax saving", () => {
    const result = calculateEnhancedPPF(150000, 15, 7.1);
    expect(result.taxSaved).toBe(0);
    expect(result.maturityValue).toBe(result.totalInvestment + result.interestEarned);
  });

  it("rejects invalid contribution, tenure, and rate inputs", () => {
    expect(() => calculateEnhancedPPF(150001, 15, 7.1)).toThrow();
    expect(() => calculateEnhancedPPF(150000, 15.5, 7.1)).toThrow();
    expect(() => calculateEnhancedPPF(150000, 15, Number.NaN)).toThrow();
  });
});

describe("calculateEnhancedFD", () => {
  it("calculates a finite quarterly-compounded projection", () => {
    const result = calculateEnhancedFD(100000, 6.5, 5, 4, 30);

    expect(result).toMatchObject({ principal: 100000, maturityValue: 138042, interest: 38042 });
    expect(result.postTaxReturns).toBe(result.maturityValue - result.taxOnInterest);
    expect(result.yearlyBreakdown).toHaveLength(5);
  });

  it("supports a zero-rate deposit", () => {
    expect(calculateEnhancedFD(100000, 0, 5, 4, 30)).toMatchObject({
      maturityValue: 100000,
      interest: 0,
      taxOnInterest: 0,
      postTaxReturns: 100000,
    });
  });

  it("rejects invalid and unsupported assumptions", () => {
    expect(() => calculateEnhancedFD(-1, 6.5, 5, 4, 30)).toThrow("FD inputs cannot be negative");
    expect(() => calculateEnhancedFD(100000, 6.5, 0, 4, 30)).toThrow("FD tenure must be a positive integer");
    expect(() => calculateEnhancedFD(100000, 6.5, 1.5, 4, 30)).toThrow("FD tenure must be a positive integer");
    expect(() => calculateEnhancedFD(100000, Number.NaN, 5, 4, 30)).toThrow("FD inputs must be finite numbers");
    expect(() => calculateEnhancedFD(100000, 101, 5, 4, 30)).toThrow("FD inputs exceed the supported planning range");
    expect(() => calculateEnhancedFD(100000, 6.5, 5, 3, 30)).toThrow("FD compounding frequency is unsupported");
  });
});

describe("calculateEnhancedSIP", () => {
  it("returns contributions with no gain at zero return", () => {
    const result = calculateEnhancedSIP(5000, 10, 0);

    expect(result).toMatchObject({ totalInvestment: 600000, maturityValue: 600000, wealthGain: 0 });
    expect(result.yearlyBreakdown).toHaveLength(10);
    expect(result.yearlyBreakdown.at(-1)?.value).toBe(600000);
  });

  it("preserves the default positive-return projection contract", () => {
    const result = calculateEnhancedSIP(5000, 10, 12);

    expect(result.totalInvestment).toBe(600000);
    expect(result.maturityValue).toBe(1161695);
    expect(result.wealthGain).toBe(result.maturityValue - result.totalInvestment);
    expect(result.yearlyBreakdown.at(-1)?.value).toBe(result.maturityValue);
    expect(result.yearlyBreakdown[1].value).toBeGreaterThan(result.yearlyBreakdown[0].value);
    for (const year of result.yearlyBreakdown) {
      expect(year.value).toBe(year.investment + year.interestEarned);
    }
    expect(result.yearlyBreakdown[0]).toMatchObject({ year: 1, investment: 60000, value: 64047, interestEarned: 4047 });
  });

  it("returns a finite zero projection for a zero contribution", () => {
    expect(calculateEnhancedSIP(0, 10, 12)).toMatchObject({ totalInvestment: 0, maturityValue: 0, wealthGain: 0 });
  });

  it("rejects invalid and unsupported inputs", () => {
    expect(() => calculateEnhancedSIP(-1, 10, 12)).toThrow("SIP inputs cannot be negative");
    expect(() => calculateEnhancedSIP(5000, 0, 12)).toThrow("SIP years must be a positive integer");
    expect(() => calculateEnhancedSIP(5000, 1.5, 12)).toThrow("SIP years must be a positive integer");
    expect(() => calculateEnhancedSIP(5000, 10, Number.NaN)).toThrow("SIP inputs must be finite numbers");
    expect(() => calculateEnhancedSIP(Number.MAX_VALUE, 10, 12)).toThrow("SIP inputs exceed the supported planning range");
    expect(() => calculateEnhancedSIP(5000, 101, 12)).toThrow("SIP inputs exceed the supported planning range");
  });
});
