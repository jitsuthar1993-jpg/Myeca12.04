import { BetaAnalyticsDataClient } from "@google-analytics/data";

export type GoogleAnalyticsRange = "7d" | "30d" | "90d";
export type GoogleAnalyticsStatus = "not_configured" | "ready" | "error";

export type GoogleAnalyticsSummary = {
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  eventCount: number;
  keyEvents: number;
  engagementRate: number;
  averageSessionDuration: number;
};

export type GoogleAnalyticsReport = {
  status: GoogleAnalyticsStatus;
  dateRange: {
    range: GoogleAnalyticsRange;
    startDate: string;
    endDate: "today";
  };
  summary: GoogleAnalyticsSummary;
  topPages: Array<{
    path: string;
    title: string;
    pageViews: number;
    activeUsers: number;
    engagementRate: number;
  }>;
  trafficSources: Array<{
    channel: string;
    sourceMedium: string;
    sessions: number;
    activeUsers: number;
    keyEvents: number;
  }>;
  devices: Array<{
    category: string;
    browser: string;
    activeUsers: number;
    sessions: number;
  }>;
  locations: Array<{
    country: string;
    city: string;
    activeUsers: number;
    sessions: number;
  }>;
  events: Array<{
    eventName: string;
    eventCount: number;
    activeUsers: number;
    keyEvents: number;
  }>;
  keyEvents: Array<{
    eventName: string;
    keyEvents: number;
    eventCount: number;
    activeUsers: number;
  }>;
  lastFetchedAt: string | null;
  error?: string;
};

export type GoogleAnalyticsServerConfig = {
  propertyId: string;
  clientEmail: string;
  privateKey: string;
};

type MetricValue = { value?: string | null };
type DimensionValue = { value?: string | null };
type ReportRow = {
  dimensionValues?: DimensionValue[] | null;
  metricValues?: MetricValue[] | null;
};
type ReportResponse = {
  rows?: ReportRow[] | null;
};
type AnalyticsDataClient = {
  runReport: (request: {
    property: string;
    dateRanges: Array<{ startDate: string; endDate: string }>;
    dimensions?: Array<{ name: string }>;
    metrics: Array<{ name: string }>;
    limit?: number;
    orderBys?: Array<Record<string, unknown>>;
  }) => Promise<[ReportResponse, ...unknown[]]>;
};

const RANGE_START_DATES: Record<GoogleAnalyticsRange, string> = {
  "7d": "7daysAgo",
  "30d": "30daysAgo",
  "90d": "90daysAgo",
};

const ZERO_SUMMARY: GoogleAnalyticsSummary = {
  activeUsers: 0,
  newUsers: 0,
  sessions: 0,
  pageViews: 0,
  eventCount: 0,
  keyEvents: 0,
  engagementRate: 0,
  averageSessionDuration: 0,
};

export function parseGoogleAnalyticsRange(value: unknown): GoogleAnalyticsRange {
  return value === "7d" || value === "90d" ? value : "30d";
}

export function normalizeGoogleAnalyticsPrivateKey(value: string) {
  return value.trim().replace(/\\n/g, "\n");
}

export function getGoogleAnalyticsServerConfig(env: NodeJS.ProcessEnv = process.env): GoogleAnalyticsServerConfig | null {
  const propertyId = String(env.GOOGLE_ANALYTICS_PROPERTY_ID || "").trim().replace(/^properties\//, "");
  const clientEmail = String(env.GOOGLE_ANALYTICS_CLIENT_EMAIL || "").trim();
  const rawPrivateKey = String(env.GOOGLE_ANALYTICS_PRIVATE_KEY || "").trim();

  if (!propertyId || !clientEmail || !rawPrivateKey) {
    return null;
  }

  return {
    propertyId,
    clientEmail,
    privateKey: normalizeGoogleAnalyticsPrivateKey(rawPrivateKey),
  };
}

export async function getGoogleAnalyticsDashboard({
  range = "30d",
  env = process.env,
  now = () => new Date(),
  createClient = createGoogleAnalyticsClient,
}: {
  range?: GoogleAnalyticsRange;
  env?: NodeJS.ProcessEnv;
  now?: () => Date;
  createClient?: (config: GoogleAnalyticsServerConfig) => AnalyticsDataClient;
} = {}): Promise<GoogleAnalyticsReport> {
  const dateRange = buildDateRange(range);
  const config = getGoogleAnalyticsServerConfig(env);
  if (!config) {
    return emptyReport("not_configured", dateRange);
  }

  try {
    const client = createClient(config);
    const property = `properties/${config.propertyId}`;
    const [
      summaryResponse,
      pagesResponse,
      sourcesResponse,
      devicesResponse,
      locationsResponse,
      eventsResponse,
    ] = await Promise.all([
      runGaReport(client, property, dateRange, [], [
        "activeUsers",
        "newUsers",
        "sessions",
        "screenPageViews",
        "eventCount",
        "keyEvents",
        "engagementRate",
        "averageSessionDuration",
      ]),
      runGaReport(client, property, dateRange, ["pagePathPlusQueryString", "pageTitle"], [
        "screenPageViews",
        "activeUsers",
        "engagementRate",
      ]),
      runGaReport(client, property, dateRange, ["sessionDefaultChannelGroup", "sessionSourceMedium"], [
        "sessions",
        "activeUsers",
        "keyEvents",
      ]),
      runGaReport(client, property, dateRange, ["deviceCategory", "browser"], ["activeUsers", "sessions"]),
      runGaReport(client, property, dateRange, ["country", "city"], ["activeUsers", "sessions"]),
      runGaReport(client, property, dateRange, ["eventName"], ["keyEvents", "eventCount", "activeUsers"]),
    ]);

    const events = mapEvents(eventsResponse);
    return {
      status: "ready",
      dateRange,
      summary: mapSummary(summaryResponse),
      topPages: mapTopPages(pagesResponse),
      trafficSources: mapTrafficSources(sourcesResponse),
      devices: mapDevices(devicesResponse),
      locations: mapLocations(locationsResponse),
      events,
      keyEvents: events
        .filter((event) => event.keyEvents > 0)
        .map((event) => ({
          eventName: event.eventName,
          keyEvents: event.keyEvents,
          eventCount: event.eventCount,
          activeUsers: event.activeUsers,
        })),
      lastFetchedAt: now().toISOString(),
    };
  } catch (error) {
    return {
      ...emptyReport("error", dateRange),
      error: error instanceof Error ? error.message : "Failed to fetch Google Analytics data",
      lastFetchedAt: now().toISOString(),
    };
  }
}

function createGoogleAnalyticsClient(config: GoogleAnalyticsServerConfig): AnalyticsDataClient {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: config.clientEmail,
      private_key: config.privateKey,
    },
  }) as unknown as AnalyticsDataClient;
}

function buildDateRange(range: GoogleAnalyticsRange): GoogleAnalyticsReport["dateRange"] {
  return {
    range,
    startDate: RANGE_START_DATES[range],
    endDate: "today",
  };
}

function emptyReport(
  status: GoogleAnalyticsStatus,
  dateRange: GoogleAnalyticsReport["dateRange"],
): GoogleAnalyticsReport {
  return {
    status,
    dateRange,
    summary: { ...ZERO_SUMMARY },
    topPages: [],
    trafficSources: [],
    devices: [],
    locations: [],
    events: [],
    keyEvents: [],
    lastFetchedAt: null,
  };
}

async function runGaReport(
  client: AnalyticsDataClient,
  property: string,
  dateRange: GoogleAnalyticsReport["dateRange"],
  dimensions: string[],
  metrics: string[],
) {
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    limit: dimensions.length > 0 ? 10 : 1,
    orderBys: [
      {
        metric: {
          metricName: metrics[0],
        },
        desc: true,
      },
    ],
  });
  return response;
}

function firstRow(response: ReportResponse) {
  return response.rows?.[0];
}

function metric(row: ReportRow | undefined, index: number) {
  const value = row?.metricValues?.[index]?.value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dimension(row: ReportRow, index: number, fallback = "(not set)") {
  const value = row.dimensionValues?.[index]?.value?.trim();
  return value || fallback;
}

function sanitizePath(value: string) {
  const path = value.split(/[?#]/)[0] || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function mapSummary(response: ReportResponse): GoogleAnalyticsSummary {
  const row = firstRow(response);
  return {
    activeUsers: metric(row, 0),
    newUsers: metric(row, 1),
    sessions: metric(row, 2),
    pageViews: metric(row, 3),
    eventCount: metric(row, 4),
    keyEvents: metric(row, 5),
    engagementRate: metric(row, 6),
    averageSessionDuration: metric(row, 7),
  };
}

function rows(response: ReportResponse) {
  return response.rows || [];
}

function mapTopPages(response: ReportResponse): GoogleAnalyticsReport["topPages"] {
  return rows(response).map((row) => ({
    path: sanitizePath(dimension(row, 0, "/")),
    title: dimension(row, 1, "Untitled"),
    pageViews: metric(row, 0),
    activeUsers: metric(row, 1),
    engagementRate: metric(row, 2),
  }));
}

function mapTrafficSources(response: ReportResponse): GoogleAnalyticsReport["trafficSources"] {
  return rows(response).map((row) => ({
    channel: dimension(row, 0),
    sourceMedium: dimension(row, 1),
    sessions: metric(row, 0),
    activeUsers: metric(row, 1),
    keyEvents: metric(row, 2),
  }));
}

function mapDevices(response: ReportResponse): GoogleAnalyticsReport["devices"] {
  return rows(response).map((row) => ({
    category: dimension(row, 0),
    browser: dimension(row, 1),
    activeUsers: metric(row, 0),
    sessions: metric(row, 1),
  }));
}

function mapLocations(response: ReportResponse): GoogleAnalyticsReport["locations"] {
  return rows(response).map((row) => ({
    country: dimension(row, 0),
    city: dimension(row, 1),
    activeUsers: metric(row, 0),
    sessions: metric(row, 1),
  }));
}

function mapEvents(response: ReportResponse): GoogleAnalyticsReport["events"] {
  return rows(response).map((row) => ({
    eventName: dimension(row, 0),
    keyEvents: metric(row, 0),
    eventCount: metric(row, 1),
    activeUsers: metric(row, 2),
  }));
}
