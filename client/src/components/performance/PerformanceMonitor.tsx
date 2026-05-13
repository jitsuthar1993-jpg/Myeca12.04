import { useEffect } from "react";

type MetricPayload = {
  name: string;
  value: number;
  path: string;
  ts: number;
};

function sendMetric(payload: MetricPayload) {
  try {
    navigator.sendBeacon?.("/api/errors/log", JSON.stringify({
      kind: "performance_metric",
      ...payload,
    }));
  } catch {
    // Metrics should never affect the user journey.
  }
}

export default function PerformanceMonitor() {
  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return undefined;

    const path = window.location.pathname;
    const observers: PerformanceObserver[] = [];

    const observe = (entryTypes: string[], onEntry: (entry: PerformanceEntry) => void) => {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(onEntry);
        });
        observer.observe({ entryTypes });
        observers.push(observer);
      } catch {
        // Some browsers do not support every performance entry type.
      }
    };

    observe(["paint"], (entry) => {
      if (entry.name === "first-contentful-paint") {
        sendMetric({ name: "FCP", value: entry.startTime, path, ts: Date.now() });
      }
    });

    observe(["largest-contentful-paint"], (entry) => {
      sendMetric({ name: "LCP", value: entry.startTime, path, ts: Date.now() });
    });

    observe(["layout-shift"], (entry) => {
      const layoutShift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
      if (!layoutShift.hadRecentInput && typeof layoutShift.value === "number") {
        sendMetric({ name: "CLS", value: layoutShift.value, path, ts: Date.now() });
      }
    });

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navigation) {
      sendMetric({
        name: "TTFB",
        value: navigation.responseStart - navigation.requestStart,
        path,
        ts: Date.now(),
      });
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return null;
}
