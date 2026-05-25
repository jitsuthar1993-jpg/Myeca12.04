import { describe, expect, it } from "vitest";
import {
  CORE_WEB_VITAL_THRESHOLDS,
  classifyCoreWebVital,
  formatCoreWebVitalValue,
} from "@shared/core-web-vitals";

describe("core web vitals budgets", () => {
  it("uses Google good-threshold budgets for LCP, INP, and CLS", () => {
    expect(CORE_WEB_VITAL_THRESHOLDS).toMatchObject({
      LCP: { good: 2500, unit: "ms" },
      INP: { good: 200, unit: "ms" },
      CLS: { good: 0.1, unit: "score" },
    });
  });

  it("classifies metric values against the good thresholds", () => {
    expect(classifyCoreWebVital("LCP", 2400)).toBe("pass");
    expect(classifyCoreWebVital("INP", 250)).toBe("fail");
    expect(classifyCoreWebVital("CLS", 0.1)).toBe("pass");
    expect(classifyCoreWebVital("CLS", 0.11)).toBe("fail");
  });

  it("formats milliseconds and CLS score values for audit output", () => {
    expect(formatCoreWebVitalValue("LCP", 1234.56)).toBe("1235ms");
    expect(formatCoreWebVitalValue("INP", 42.2)).toBe("42ms");
    expect(formatCoreWebVitalValue("CLS", 0.06789)).toBe("0.068");
  });
});
