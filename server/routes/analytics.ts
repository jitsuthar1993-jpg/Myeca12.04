import { Router } from "express";

const router = Router();

// Analytics routes - NO AUTHENTICATION OR DATABASE - MOCK DATA
router.get("/overview", async (_req, res) => {
  try {
    // Mock analytics data
    const userStats = {
      totalUsers: 1248,
      activeUsers: 1156,
      pendingUsers: 92,
      admins: 3,
      caProfessionals: 45
    };

    const profileStats = {
      totalProfiles: 1180
    };

    const returnStats = {
      totalReturns: 3421,
      filedReturns: 2890,
      draftReturns: 531,
      verifiedReturns: 2654
    };

    const docStats = {
      totalDocuments: 5234
    };

    const contentStats = {
      totalPosts: 156,
      publishedPosts: 142
    };

    res.json({ success: true, stats: { userStats, profileStats, returnStats, docStats, contentStats } });
  } catch (error: any) {
    console.error("Analytics overview error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;