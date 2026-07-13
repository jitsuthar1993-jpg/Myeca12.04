import { describe, expect, it } from "vitest";
import { evaluateBinaryOperation, evaluateUnaryOperation } from "./general.page";
import { calculateLoanPayment } from "./loan-calculator.page";

describe("general calculator engine", () => {
  it("rejects undefined arithmetic results", () => {
    expect(evaluateBinaryOperation(10, "/", 0)).toEqual({ ok: false, error: "Cannot divide by zero" });
    expect(evaluateUnaryOperation("sqrt", -1)).toEqual({ ok: false, error: "Square root requires a non-negative number" });
    expect(evaluateUnaryOperation("inv", 0)).toEqual({ ok: false, error: "Cannot divide by zero" });
  });

  it("returns finite arithmetic results", () => {
    expect(evaluateBinaryOperation(2, "+", 3)).toEqual({ ok: true, value: 5 });
    expect(evaluateUnaryOperation("sqr", 4)).toEqual({ ok: true, value: 16 });
  });
});

describe("loan calculator engine", () => {
  it("supports a zero-interest loan", () => {
    expect(calculateLoanPayment({ principal: 120000, annualRate: 0, months: 12 })).toMatchObject({
      emi: 10000,
      totalPayment: 120000,
      totalInterest: 0,
    });
  });

  it("rejects invalid and non-finite inputs", () => {
    expect(() => calculateLoanPayment({ principal: -1, annualRate: 8, months: 12 })).toThrow("Principal");
    expect(() => calculateLoanPayment({ principal: 1000, annualRate: Number.NaN, months: 12 })).toThrow("rate");
    expect(() => calculateLoanPayment({ principal: 1000, annualRate: 8, months: 12.5 })).toThrow("whole number");
  });
});
