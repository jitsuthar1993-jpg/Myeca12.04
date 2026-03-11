import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Advanced features demo data
router.get("/demo", authenticateToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    features: {
      aiOptimizer: {
        enabled: true,
        lastOptimization: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        savings: 45000,
        recommendations: 5
      },
      twoFactor: {
        enabled: false,
        methods: ["authenticator", "sms"]
      },
      notifications: {
        enabled: true,
        unreadCount: 3,
        channels: ["email", "sms", "push"]
      },
      emailService: {
        enabled: true,
        templatesCount: 5,
        lastSent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      multiLanguage: {
        enabled: true,
        languages: ["en", "hi", "ta", "te", "bn"],
        currentLanguage: "en"
      }
    },
    stats: {
      platformScore: 10.0,
      performanceBoost: "45%",
      userReach: "5x",
      securityScore: "99.9%"
    }
  });
});

export default router;