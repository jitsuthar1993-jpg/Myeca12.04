import { chromium, devices, type Browser, type Page } from "playwright";
import {
  CORE_WEB_VITAL_THRESHOLDS,
  classifyCoreWebVital,
  formatCoreWebVitalValue,
  medianCoreWebVitalValue,
  type CoreWebVitalName,
} from "../shared/core-web-vitals.js";

const defaultBaseUrl = "https://myeca.in";
const defaultRoutes = [
  "/",
  "/blog",
  "/itr/form-selector",
  "/services/itr-for-salaried",
  "/calculators/income-tax",
  "/learn/guide/salary-tax-calculator-guide-ay-2026-27",
  "/itr-season-2026",
] as const;

type MetricResult = {
  detail: string;
  label: string;
  ok: boolean;
  required?: boolean;
};

type CoreWebVitalsSnapshot = {
  cls: number | null;
  inp: number | null;
  lcp: number | null;
};

type RouteAudit = {
  metrics: CoreWebVitalsSnapshot;
  reachable: MetricResult;
  samples: CoreWebVitalsSnapshot[];
};

const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.MYECA_CWV_BASE_URL || defaultBaseUrl);
const routes = parseRoutes(process.argv[3] || process.env.MYECA_CWV_ROUTES || defaultRoutes.join(","));
const sampleDelayMs = parseDelay(process.env.MYECA_CWV_SAMPLE_DELAY_MS, 1_200);

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function parseRoutes(value: string) {
  return value
    .split(",")
    .map((route) => route.trim())
    .filter(Boolean)
    .map((route) => (route.startsWith("/") ? route : `/${route}`));
}

function parseDelay(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function routeUrl(route: string) {
  return route === "/" ? baseUrl : `${baseUrl}${route}`;
}

function printResult(result: MetricResult) {
  const status = result.ok ? "PASS" : result.required === false ? "WARN" : "FAIL";
  console.log(`${status} ${result.label}: ${result.detail}`);
}

function metricResult(
  route: string,
  name: CoreWebVitalName,
  value: number | null,
  required = true,
  sampleCount = 1,
): MetricResult {
  if (value == null || !Number.isFinite(value)) {
    return {
      label: `${route} ${name}`,
      ok: false,
      required,
      detail: sampleCount > 1 ? `metric unavailable across ${sampleCount} samples` : "metric unavailable",
    };
  }

  const status = classifyCoreWebVital(name, value);
  const formattedValue = formatCoreWebVitalValue(name, value);
  const budget = formatCoreWebVitalValue(name, CORE_WEB_VITAL_THRESHOLDS[name].good);
  const sampleDetail = sampleCount > 1 ? ` median of ${sampleCount} samples` : "";

  return {
    label: `${route} ${name}`,
    ok: status === "pass",
    detail: `${formattedValue}${sampleDetail} (good budget <= ${budget})`,
  };
}

async function installMetricObservers(page: Page) {
  await page.addInitScript(() => {
    const metrics = {
      cls: 0,
      inp: null as number | null,
      lcp: null as number | null,
    };
    const observers: PerformanceObserver[] = [];

    Object.defineProperty(window, "__MYECA_CWV", {
      configurable: true,
      value: metrics,
      writable: true,
    });
    Object.defineProperty(window, "__MYECA_CWV_OBSERVERS", {
      configurable: true,
      value: observers,
      writable: true,
    });

    const supportedEntryTypes = PerformanceObserver.supportedEntryTypes ?? [];
    const observe = (options: PerformanceObserverInit, onEntry: (entry: PerformanceEntry) => void) => {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(onEntry);
        });
        observer.observe(options);
        observers.push(observer);
      } catch {
        // Unsupported entry types are handled as unavailable metrics below.
      }
    };

    if (supportedEntryTypes.includes("largest-contentful-paint")) {
      observe({ type: "largest-contentful-paint", buffered: true }, (entry) => {
        metrics.lcp = entry.startTime;
      });
    }

    if (supportedEntryTypes.includes("layout-shift")) {
      observe({ type: "layout-shift", buffered: true }, (entry) => {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!layoutShift.hadRecentInput && typeof layoutShift.value === "number") {
          metrics.cls += layoutShift.value;
        }
      });
    }

    if (supportedEntryTypes.includes("event")) {
      observe({ type: "event", buffered: true, durationThreshold: 16 } as PerformanceObserverInit, (entry) => {
        if (typeof entry.duration === "number") {
          metrics.inp = Math.max(metrics.inp ?? 0, entry.duration);
        }
      });
    }
  });
}

async function runSyntheticInteraction(page: Page) {
  await page.evaluate(() => {
    document.getElementById("__MYECA_CWV_PROBE")?.remove();

    const probe = document.createElement("button");
    probe.id = "__MYECA_CWV_PROBE";
    probe.type = "button";
    probe.textContent = "CWV";
    probe.setAttribute("aria-hidden", "true");
    Object.assign(probe.style, {
      border: "0",
      height: "1px",
      left: "0",
      opacity: "0.001",
      padding: "0",
      pointerEvents: "auto",
      position: "fixed",
      top: "0",
      width: "1px",
      zIndex: "2147483647",
    });
    probe.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    document.body.appendChild(probe);
  });

  await page.locator("#__MYECA_CWV_PROBE").click({ force: true, timeout: 3_000 }).catch(() => undefined);
  await page.keyboard.press("Tab").catch(() => undefined);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    document.getElementById("__MYECA_CWV_PROBE")?.remove();
  }).catch(() => undefined);
}

async function readMetrics(page: Page): Promise<CoreWebVitalsSnapshot> {
  const observed = await page.evaluate(() => {
    const windowWithMetrics = window as typeof window & {
      __MYECA_CWV?: CoreWebVitalsSnapshot;
    };
    const metrics = windowWithMetrics.__MYECA_CWV;
    return {
      cls: metrics?.cls ?? 0,
      inp: metrics?.inp ?? null,
      lcp: metrics?.lcp ?? null,
    };
  });

  const bufferedLcp = await page.evaluate(() =>
    new Promise<number | null>((resolve) => {
      try {
        let value: number | null = null;
        const observer = new PerformanceObserver((list) => {
          value = list.getEntries().at(-1)?.startTime ?? value;
        });
        observer.observe({ type: "largest-contentful-paint", buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(value);
        }, 250);
      } catch {
        resolve(null);
      }
    }),
  );

  const bufferedCls = await page.evaluate(() =>
    new Promise<number>((resolve) => {
      try {
        let value = 0;
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (!layoutShift.hadRecentInput && typeof layoutShift.value === "number") {
              value += layoutShift.value;
            }
          });
        });
        observer.observe({ type: "layout-shift", buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(value);
        }, 250);
      } catch {
        resolve(0);
      }
    }),
  );

  const bufferedInp = await page.evaluate(() =>
    new Promise<number | null>((resolve) => {
      try {
        let value = 0;
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (typeof entry.duration === "number") {
              value = Math.max(value, entry.duration);
            }
          });
        });
        observer.observe({ type: "event", buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
        setTimeout(() => {
          observer.disconnect();
          resolve(value || null);
        }, 250);
      } catch {
        resolve(null);
      }
    }),
  );

  return {
    cls: Math.max(observed.cls, bufferedCls),
    inp: Math.max(observed.inp ?? 0, bufferedInp ?? 0) || null,
    lcp: observed.lcp ?? bufferedLcp,
  };
}

async function waitForMetrics(page: Page): Promise<CoreWebVitalsSnapshot> {
  const deadline = Date.now() + 8_000;
  let metrics = await readMetrics(page);

  while (metrics.lcp == null && Date.now() < deadline) {
    await page.waitForTimeout(250);
    metrics = await readMetrics(page);
  }

  return metrics;
}

async function collectRouteSample(browser: Browser, route: string): Promise<RouteAudit> {
  const context = await browser.newContext({
    ...devices["Pixel 5"],
  });
  const page = await context.newPage();

  try {
    await installMetricObservers(page);
    const response = await page.goto(routeUrl(route), {
      timeout: 45_000,
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => undefined);
    await page.waitForTimeout(2_500);
    const preInteractionMetrics = await waitForMetrics(page);
    await runSyntheticInteraction(page);

    const postInteractionMetrics = await readMetrics(page);
    const metrics = {
      cls: Math.max(preInteractionMetrics.cls ?? 0, postInteractionMetrics.cls ?? 0),
      inp: postInteractionMetrics.inp ?? preInteractionMetrics.inp,
      lcp: preInteractionMetrics.lcp,
    };
    if (process.env.MYECA_CWV_DEBUG === "1") {
      const timeline = await page.evaluate(() => ({
        bodyText: document.body.innerText.slice(0, 120),
        paintEntries: performance.getEntriesByType("paint").map((entry) => ({
          name: entry.name,
          startTime: entry.startTime,
        })),
        supportedEntryTypes: PerformanceObserver.supportedEntryTypes ?? [],
      }));
      console.error(JSON.stringify({ route, url: page.url(), metrics, timeline }, null, 2));
    }

    return {
      metrics,
      reachable: {
        label: `${route} reachable`,
        ok: response?.ok() ?? false,
        detail: response ? `${response.status()} ${response.statusText()}` : "no response",
      },
      samples: [metrics],
    };
  } finally {
    await context.close();
  }
}

async function auditRoute(browser: Browser, route: string) {
  const audit = await collectRouteSample(browser, route);
  const needsRetry =
    audit.reachable.ok &&
    (classifyCoreWebVital("LCP", audit.metrics.lcp ?? Number.POSITIVE_INFINITY) === "fail" ||
      classifyCoreWebVital("CLS", audit.metrics.cls ?? Number.POSITIVE_INFINITY) === "fail");

  if (needsRetry) {
    while (audit.samples.length < 3) {
      await wait(sampleDelayMs);
      const retry = await collectRouteSample(browser, route);
      audit.samples.push(...retry.samples);
    }

    audit.metrics = {
      cls: medianCoreWebVitalValue(audit.samples.map((sample) => sample.cls)),
      inp: medianCoreWebVitalValue(audit.samples.map((sample) => sample.inp)),
      lcp: medianCoreWebVitalValue(audit.samples.map((sample) => sample.lcp)),
    };
  }

  const sampleCount = audit.samples.length;
  const inpResult = metricResult(route, "INP", audit.metrics.inp, false, sampleCount);

  return [
    audit.reachable,
    metricResult(route, "LCP", audit.metrics.lcp, true, sampleCount),
    metricResult(route, "CLS", audit.metrics.cls, true, sampleCount),
    {
      ...inpResult,
      detail:
        audit.metrics.inp == null
          ? `synthetic INP unavailable${sampleCount > 1 ? ` across ${sampleCount} samples` : ""}; confirm field INP in CrUX, Vercel Speed Insights, or Search Console`
          : inpResult.detail,
    },
  ];
}

async function main() {
  const routeResults: MetricResult[] = [];
  const browser = await chromium.launch({ headless: true });

  try {
    for (const [index, route] of routes.entries()) {
      if (index > 0) await wait(sampleDelayMs);
      routeResults.push(...await auditRoute(browser, route));
    }
  } finally {
    await browser.close();
  }

  console.log(`Core Web Vitals mobile lab audit for ${baseUrl}`);
  routeResults.forEach(printResult);

  const failures = routeResults.filter((result) => result.required !== false && !result.ok);
  if (failures.length > 0) {
    console.error(`\nCore Web Vitals audit failed: ${failures.length} required check(s) need attention.`);
    process.exit(1);
  }

  console.log("\nCore Web Vitals audit passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
