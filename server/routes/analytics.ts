import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { adminDb } from "../data-admin.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { getGoogleAnalyticsDashboard, parseGoogleAnalyticsRange } from "../services/google-analytics-reporting.js";
import { safeError } from "../utils/error-response.js";

const router = Router();

const mobilePerformanceSchema = z.object({
  timestamp: z.string().optional(),
  url: z.string().optional(),
  metrics: z.record(z.string(), z.unknown()).optional(),
  warnings: z.array(z.string()).optional(),
}).passthrough();

router.get("/overview", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const range = parseGoogleAnalyticsRange(req.query.range);
    const googleAnalyticsPromise = getGoogleAnalyticsDashboard({ range });

    // Use SQL count() aggregates instead of loading entire collections to compute totals.
    // Each of these previously deserialised every row in the table just to take .length.
    const usersRef = adminDb.collection("users") as any;
    const returnsRef = adminDb.collection("tax_returns") as any;

    const [
      totalUsersAgg,
      activeUsersAgg,
      pendingUsersAgg,
      adminsAgg,
      caProfessionalsAgg,
      totalProfilesAgg,
      totalReturnsAgg,
      filedReturnsAgg,
      verifiedReturnsAgg,
      completedReturnsAgg,
      draftReturnsAgg,
      totalDocsAgg,
      totalPostsAgg,
      publishedPostsAgg,
      googleAnalytics,
    ] = await Promise.all([
      usersRef.count().get(),
      usersRef.where("status", "==", "active").count().get(),
      usersRef.where("status", "==", "pending").count().get(),
      usersRef.where("role", "==", "admin").count().get(),
      usersRef.where("role", "==", "ca").count().get(),
      adminDb.collection("profiles").count().get(),
      returnsRef.count().get(),
      returnsRef.where("status", "==", "filed").count().get(),
      returnsRef.where("status", "==", "verified").count().get(),
      returnsRef.where("status", "==", "completed").count().get(),
      returnsRef.where("status", "==", "draft").count().get(),
      adminDb.collection("documents").count().get(),
      adminDb.collection("blog_posts").count().get(),
      adminDb.collection("blog_posts").where("status", "==", "published").count().get(),
      googleAnalyticsPromise,
    ]);

    const totalUsers = totalUsersAgg.data().count;
    const totalReturns = totalReturnsAgg.data().count;
    const filedDone = filedReturnsAgg.data().count + verifiedReturnsAgg.data().count + completedReturnsAgg.data().count;
    const draftReturns = draftReturnsAgg.data().count;

    res.json({
      success: true,
      source: "database",
      googleAnalytics,
      stats: {
        userStats: {
          totalUsers,
          activeUsers: activeUsersAgg.data().count,
          pendingUsers: pendingUsersAgg.data().count,
          admins: adminsAgg.data().count,
          caProfessionals: caProfessionalsAgg.data().count,
        },
        profileStats: {
          totalProfiles: totalProfilesAgg.data().count,
        },
        returnStats: {
          totalReturns,
          filedReturns: filedDone,
          draftReturns,
          pendingReturns: Math.max(0, totalReturns - filedDone - draftReturns),
        },
        docStats: {
          totalDocuments: totalDocsAgg.data().count,
        },
        contentStats: {
          totalPosts: totalPostsAgg.data().count,
          publishedPosts: publishedPostsAgg.data().count,
        },
      },
    });
  } catch (error: any) {
    return safeError(res, error, "Failed to fetch analytics overview");
  }
});

router.post("/mobile-performance", (req: Request, res: Response) => {
  const parsed = mobilePerformanceSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid performance payload" });
  }

  const payload = parsed.data;
  console.info("mobile_performance", {
    path: typeof payload.url === "string" ? payload.url.split("?")[0].slice(0, 200) : undefined,
    warningCount: Array.isArray(payload.warnings) ? payload.warnings.length : 0,
    metricKeys: payload.metrics ? Object.keys(payload.metrics).slice(0, 20) : [],
    timestamp: new Date().toISOString(),
  });

  return res.status(204).end();
});

export default router;
