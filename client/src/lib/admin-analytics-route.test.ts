import express from "express";
import { describe, expect, it, vi } from "vitest";

const collectionSizes = vi.hoisted(() => ({
  users: [
    { status: "active", role: "admin" },
    { status: "pending", role: "user" },
    { status: "active", role: "ca" },
  ],
  profiles: [{}],
  tax_returns: [{ status: "filed" }, { status: "draft" }, { status: "review" }],
  documents: [{}, {}],
  blog_posts: [{ status: "published" }, { status: "draft" }],
}));

const gaReport = vi.hoisted(() => ({
  getGoogleAnalyticsDashboard: vi.fn(async () => ({
    status: "error",
    dateRange: { range: "90d", startDate: "90daysAgo", endDate: "today" },
    summary: { activeUsers: 0 },
    topPages: [],
    trafficSources: [],
    devices: [],
    locations: [],
    events: [],
    keyEvents: [],
    lastFetchedAt: null,
    error: "GA quota exceeded",
  })),
  parseGoogleAnalyticsRange: vi.fn((value: unknown) => (value === "90d" ? "90d" : "30d")),
}));

vi.mock("../../../server/data-admin.js", () => ({
  adminDb: {
    collection: (name: keyof typeof collectionSizes) => {
      const makeQuery = (clauses: Array<{ field: string; value: unknown }> = []) => {
        const rows = () => (collectionSizes[name] || [])
          .filter((row) => clauses.every((clause) => (row as any)[clause.field] === clause.value));

        return {
          where: (field: string, op: string, value: unknown) => {
            if (op !== "==") throw new Error(`Unsupported test operator ${op}`);
            return makeQuery([...clauses, { field, value }]);
          },
          count: () => ({
            get: async () => ({
              data: () => ({ count: rows().length }),
            }),
          }),
          get: async () => ({
            size: rows().length,
            docs: rows().map((row) => ({ data: () => row })),
          }),
        };
      };

      return makeQuery();
    },
  },
}));

vi.mock("../../../server/middleware/auth.js", () => ({
  requireAuth: (_req: any, _res: any, next: any) => next(),
  requireAdmin: (_req: any, _res: any, next: any) => next(),
}));

vi.mock("../../../server/services/google-analytics-reporting.js", () => gaReport);

const { default: analyticsRouter } = await import("../../../server/routes/analytics.js");

describe("admin analytics route", () => {
  it("keeps database stats available when GA4 reporting fails", async () => {
    const { json } = await request("/api/analytics/overview?range=90d");

    expect(gaReport.getGoogleAnalyticsDashboard).toHaveBeenCalledWith({ range: "90d" });
    expect(json).toMatchObject({
      success: true,
      source: "database",
      googleAnalytics: {
        status: "error",
        error: "GA quota exceeded",
      },
      stats: {
        userStats: {
          totalUsers: 3,
          activeUsers: 2,
          pendingUsers: 1,
          admins: 1,
          caProfessionals: 1,
        },
        profileStats: { totalProfiles: 1 },
        returnStats: {
          totalReturns: 3,
          filedReturns: 1,
          draftReturns: 1,
          pendingReturns: 1,
        },
        docStats: { totalDocuments: 2 },
        contentStats: {
          totalPosts: 2,
          publishedPosts: 1,
        },
      },
    });
  });
});

async function request(path: string) {
  const app = express();
  app.use(express.json());
  app.use("/api/analytics", analyticsRouter);

  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Unable to start test server");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`);
    const json = await response.json();
    return { response, json };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}
