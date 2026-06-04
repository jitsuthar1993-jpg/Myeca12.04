import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getGoogleAnalyticsDashboard,
  getGoogleAnalyticsServerConfig,
  normalizeGoogleAnalyticsPrivateKey,
  parseGoogleAnalyticsRange,
} from "../../../server/services/google-analytics-reporting.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("Google Analytics reporting service", () => {
  it("returns not_configured when server credentials are missing", async () => {
    process.env = {} as NodeJS.ProcessEnv;

    const report = await getGoogleAnalyticsDashboard({ range: "30d" });

    expect(report).toMatchObject({
      status: "not_configured",
      dateRange: {
        range: "30d",
        startDate: "30daysAgo",
        endDate: "today",
      },
      summary: {
        activeUsers: 0,
        newUsers: 0,
        sessions: 0,
        pageViews: 0,
        eventCount: 0,
        keyEvents: 0,
        engagementRate: 0,
        averageSessionDuration: 0,
      },
      topPages: [],
      trafficSources: [],
      devices: [],
      locations: [],
      events: [],
      keyEvents: [],
    });
  });

  it("normalizes escaped service-account private keys without exposing secrets in config", () => {
    const privateKey = "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n";

    expect(normalizeGoogleAnalyticsPrivateKey(privateKey)).toBe(
      "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
    );
    expect(
      getGoogleAnalyticsServerConfig({
        GOOGLE_ANALYTICS_PROPERTY_ID: "123456789",
        GOOGLE_ANALYTICS_CLIENT_EMAIL: "ga-reader@example.iam.gserviceaccount.com",
        GOOGLE_ANALYTICS_PRIVATE_KEY: privateKey,
      } as NodeJS.ProcessEnv),
    ).toEqual({
      propertyId: "123456789",
      clientEmail: "ga-reader@example.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
    });
  });

  it("maps GA4 rows into a detailed dashboard shape", async () => {
    const runReport = vi.fn(async (request: { metrics: Array<{ name: string }>; dimensions?: Array<{ name: string }> }) => {
      const metricNames = request.metrics.map((metric) => metric.name);
      const dimensionNames = request.dimensions?.map((dimension) => dimension.name) || [];

      if (dimensionNames.length === 0) {
        return [response([], metricNames, [["42", "12", "60", "144", "500", "8", "0.75", "91.5"]])];
      }
      if (dimensionNames.includes("pagePathPlusQueryString")) {
        return [response(dimensionNames, metricNames, [["/services?lead=private", "Services", "80", "25", "0.8"]])];
      }
      if (dimensionNames.includes("sessionDefaultChannelGroup")) {
        return [response(dimensionNames, metricNames, [["Organic Search", "google / organic", "30", "21", "5"]])];
      }
      if (dimensionNames.includes("deviceCategory")) {
        return [response(dimensionNames, metricNames, [["mobile", "Chrome", "28", "35"]])];
      }
      if (dimensionNames.includes("country")) {
        return [response(dimensionNames, metricNames, [["India", "Pune", "19", "24"]])];
      }
      if (dimensionNames.includes("eventName") && metricNames.includes("keyEvents")) {
        return [response(dimensionNames, metricNames, [["lead_submit", "7", "10", "5"], ["scroll", "0", "40", "20"]])];
      }

      return [response(dimensionNames, metricNames, [])];
    });

    const report = await getGoogleAnalyticsDashboard({
      range: "7d",
      now: () => new Date("2026-06-04T10:00:00.000Z"),
      createClient: () => ({ runReport }),
      env: configuredEnv(),
    });

    expect(parseGoogleAnalyticsRange("90d")).toBe("90d");
    expect(parseGoogleAnalyticsRange("invalid")).toBe("30d");
    expect(runReport).toHaveBeenCalledTimes(6);
    expect(report).toMatchObject({
      status: "ready",
      lastFetchedAt: "2026-06-04T10:00:00.000Z",
      summary: {
        activeUsers: 42,
        newUsers: 12,
        sessions: 60,
        pageViews: 144,
        eventCount: 500,
        keyEvents: 8,
        engagementRate: 0.75,
        averageSessionDuration: 91.5,
      },
      topPages: [{ path: "/services", title: "Services", pageViews: 80, activeUsers: 25, engagementRate: 0.8 }],
      trafficSources: [{ channel: "Organic Search", sourceMedium: "google / organic", sessions: 30, activeUsers: 21, keyEvents: 5 }],
      devices: [{ category: "mobile", browser: "Chrome", activeUsers: 28, sessions: 35 }],
      locations: [{ country: "India", city: "Pune", activeUsers: 19, sessions: 24 }],
      keyEvents: [{ eventName: "lead_submit", keyEvents: 7, eventCount: 10, activeUsers: 5 }],
    });
  });

  it("returns a GA-only error state when the API request fails", async () => {
    const report = await getGoogleAnalyticsDashboard({
      range: "30d",
      createClient: () => ({
        runReport: vi.fn(async () => {
          throw new Error("GA quota exceeded");
        }),
      }),
      env: configuredEnv(),
    });

    expect(report.status).toBe("error");
    expect(report.error).toBe("GA quota exceeded");
    expect(report.summary.activeUsers).toBe(0);
  });
});

function configuredEnv() {
  return {
    GOOGLE_ANALYTICS_PROPERTY_ID: "123456789",
    GOOGLE_ANALYTICS_CLIENT_EMAIL: "ga-reader@example.iam.gserviceaccount.com",
    GOOGLE_ANALYTICS_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
  } as NodeJS.ProcessEnv;
}

function response(
  dimensionNames: string[],
  metricNames: string[],
  rows: string[][],
) {
  return {
    dimensionHeaders: dimensionNames.map((name) => ({ name })),
    metricHeaders: metricNames.map((name) => ({ name })),
    rows: rows.map((values) => ({
      dimensionValues: values.slice(0, dimensionNames.length).map((value) => ({ value })),
      metricValues: values.slice(dimensionNames.length).map((value) => ({ value })),
    })),
  };
}
