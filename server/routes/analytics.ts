import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { adminDb } from "../data-admin.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { safeError } from "../utils/error-response.js";

const router = Router();

const mobilePerformanceSchema = z.object({
  timestamp: z.string().optional(),
  url: z.string().optional(),
  metrics: z.record(z.string(), z.unknown()).optional(),
  warnings: z.array(z.string()).optional(),
}).passthrough();

function statusCount(docs: Array<{ data: () => Record<string, any> }>, completedStatuses: string[]) {
  const completed = new Set(completedStatuses);
  let done = 0;
  let draft = 0;
  let pending = 0;

  docs.forEach((doc) => {
    const status = String((doc.data() as any).status || "").toLowerCase();
    if (completed.has(status)) {
      done += 1;
    } else if (status === "draft") {
      draft += 1;
    } else {
      pending += 1;
    }
  });

  return { done, draft, pending };
}

router.get("/overview", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [
      usersSnapshot,
      profilesSnapshot,
      returnsSnapshot,
      documentsSnapshot,
      postsSnapshot,
    ] = await Promise.all([
      adminDb.collection("users").get(),
      adminDb.collection("profiles").get(),
      adminDb.collection("tax_returns").get(),
      adminDb.collection("documents").get(),
      adminDb.collection("blog_posts").get(),
    ]);

    const users = usersSnapshot.docs.map((doc) => doc.data() as Record<string, any>);
    const activeUsers = users.filter((user) => String(user.status || "active").toLowerCase() === "active");
    const pendingUsers = users.filter((user) => String(user.status || "").toLowerCase() === "pending");
    const admins = users.filter((user) => String(user.role || "").toLowerCase() === "admin");
    const caProfessionals = users.filter((user) => String(user.role || "").toLowerCase() === "ca");

    const returnCounts = statusCount(returnsSnapshot.docs, ["filed", "completed", "verified"]);
    const publishedPosts = postsSnapshot.docs.filter(
      (doc) => String((doc.data() as any).status || "").toLowerCase() === "published",
    );

    res.json({
      success: true,
      source: "database",
      stats: {
        userStats: {
          totalUsers: usersSnapshot.size,
          activeUsers: activeUsers.length,
          pendingUsers: pendingUsers.length,
          admins: admins.length,
          caProfessionals: caProfessionals.length,
        },
        profileStats: {
          totalProfiles: profilesSnapshot.size,
        },
        returnStats: {
          totalReturns: returnsSnapshot.size,
          filedReturns: returnCounts.done,
          draftReturns: returnCounts.draft,
          pendingReturns: returnCounts.pending,
        },
        docStats: {
          totalDocuments: documentsSnapshot.size,
        },
        contentStats: {
          totalPosts: postsSnapshot.size,
          publishedPosts: publishedPosts.length,
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
