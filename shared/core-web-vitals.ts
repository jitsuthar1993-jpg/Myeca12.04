export const CORE_WEB_VITAL_THRESHOLDS = {
  LCP: { good: 2500, unit: "ms" },
  INP: { good: 200, unit: "ms" },
  CLS: { good: 0.1, unit: "score" },
} as const;

export type CoreWebVitalName = keyof typeof CORE_WEB_VITAL_THRESHOLDS;
export type CoreWebVitalStatus = "pass" | "fail";

export function classifyCoreWebVital(name: CoreWebVitalName, value: number): CoreWebVitalStatus {
  return value <= CORE_WEB_VITAL_THRESHOLDS[name].good ? "pass" : "fail";
}

export function formatCoreWebVitalValue(name: CoreWebVitalName, value: number) {
  if (CORE_WEB_VITAL_THRESHOLDS[name].unit === "ms") {
    return `${Math.round(value)}ms`;
  }

  return value.toFixed(3);
}
