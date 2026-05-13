import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { adminDb } from "../data-admin.js";
import { requireAdmin, type AuthRequest } from "../middleware/auth.js";
import { apiRateLimiter } from "../middleware/rate-limits.js";

const router = Router();
const FEEDBACK_COLLECTION = "activity_logs";
const FEEDBACK_RECORD_TYPE = "feedback";

const optionalText = (maxLength: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maxLength).optional(),
  );

const optionalRating = z.preprocess((value) => {
  if (value === 0 || value === "0" || value === "" || value == null) return undefined;
  return typeof value === "string" ? Number(value) : value;
}, z.number().int().min(1).max(5).optional());

const feedbackSchema = z.object({
  type: z.enum(["bug", "feature", "general", "complaint"]),
  category: optionalText(80),
  subject: z.string().trim().min(5).max(200),
  message: z.string().trim().min(20).max(5000),
  rating: optionalRating,
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().email().max(254).optional(),
  ),
  name: optionalText(120),
  userId: optionalText(120),
  browserInfo: z
    .object({
      userAgent: optionalText(500),
      platform: optionalText(120),
      language: optionalText(40),
      screenResolution: optionalText(40),
    })
    .optional(),
});

const feedbackUpdateSchema = z.object({
  status: z.enum(["pending", "in-progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  response: optionalText(5000),
});

type FeedbackRecord = z.infer<typeof feedbackSchema> & {
  id: string;
  recordType: typeof FEEDBACK_RECORD_TYPE;
  status: "pending" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  source: "public-feedback-form";
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  createdAt: string;
  updatedAt: string;
};

function getClientIp(req: Request) {
  const forwardedFor = req.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || req.ip || req.socket.remoteAddress || undefined;
}

function defaultPriority(feedback: z.infer<typeof feedbackSchema>): FeedbackRecord["priority"] {
  if (feedback.type === "complaint") return "high";
  if (feedback.type === "bug") return "medium";
  if (typeof feedback.rating === "number" && feedback.rating <= 2) return "high";
  return "low";
}

function normalizeFeedback(snapshot: { id: string; data: () => Record<string, any> | undefined }) {
  const data = snapshot.data() ?? {};
  if (data.recordType !== FEEDBACK_RECORD_TYPE) return null;

  return {
    ...data,
    id: String(data.id ?? snapshot.id),
    status: data.status ?? "pending",
    priority: data.priority ?? "low",
    createdAt: data.createdAt ?? new Date(0).toISOString(),
    updatedAt: data.updatedAt ?? data.createdAt ?? new Date(0).toISOString(),
  } as FeedbackRecord;
}

async function listFeedbackRecords(filters: { status?: string; type?: string }) {
  let query: any = adminDb.collection(FEEDBACK_COLLECTION).where("recordType", "==", FEEDBACK_RECORD_TYPE);

  if (filters.status) {
    query = query.where("status", "==", filters.status);
  }

  if (filters.type) {
    query = query.where("type", "==", filters.type);
  }

  const snapshot = await query.get();
  return snapshot.docs
    .map(normalizeFeedback)
    .filter((feedback): feedback is FeedbackRecord => Boolean(feedback))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function getFeedbackRecord(id: string) {
  const doc = await adminDb.collection(FEEDBACK_COLLECTION).doc(id).get();
  return doc.exists ? normalizeFeedback(doc) : null;
}

function parsePositiveInt(value: unknown, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(1, Math.floor(parsed)));
}

router.post("/api/feedback", apiRateLimiter, async (req: Request, res: Response) => {
  try {
    const feedback = feedbackSchema.parse(req.body);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const record: FeedbackRecord & { clientIp?: string } = {
      id,
      recordType: FEEDBACK_RECORD_TYPE,
      source: "public-feedback-form",
      status: "pending",
      priority: defaultPriority(feedback),
      ...feedback,
      clientIp: getClientIp(req),
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.collection(FEEDBACK_COLLECTION).doc(id).set(record);

    res.status(201).json({
      success: true,
      feedback: {
        id,
        status: record.status,
        priority: record.priority,
        createdAt: record.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid feedback payload", issues: error.issues });
    }
    console.error("[feedback] submit failed", error);
    res.status(500).json({ message: "Unable to submit feedback" });
  }
});

router.get("/api/admin/feedback", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parsePositiveInt(req.query.page, 1, 1000);
    const limit = parsePositiveInt(req.query.limit, 50, 100);
    const status = typeof req.query.status === "string" && req.query.status !== "all" ? req.query.status : undefined;
    const type = typeof req.query.type === "string" && req.query.type !== "all" ? req.query.type : undefined;
    const feedback = await listFeedbackRecords({ status, type });
    const offset = (page - 1) * limit;

    res.json({
      success: true,
      feedback: feedback.slice(offset, offset + limit),
      total: feedback.length,
      page,
      limit,
    });
  } catch (error) {
    console.error("[feedback] list failed", error);
    res.status(500).json({ message: "Unable to load feedback" });
  }
});

router.get("/api/admin/feedback/stats", requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const feedback = await listFeedbackRecords({});
    const byStatus = { pending: 0, "in-progress": 0, resolved: 0, closed: 0 };
    const byType = { bug: 0, feature: 0, general: 0, complaint: 0 };
    let ratingTotal = 0;
    let ratingCount = 0;

    feedback.forEach((item) => {
      byStatus[item.status] = (byStatus[item.status] ?? 0) + 1;
      byType[item.type] = (byType[item.type] ?? 0) + 1;
      if (typeof item.rating === "number") {
        ratingTotal += item.rating;
        ratingCount += 1;
      }
    });

    res.json({
      success: true,
      total: feedback.length,
      byStatus,
      byType,
      avgRating: ratingCount ? ratingTotal / ratingCount : 0,
    });
  } catch (error) {
    console.error("[feedback] stats failed", error);
    res.status(500).json({ message: "Unable to load feedback stats" });
  }
});

router.put("/api/admin/feedback/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const current = await getFeedbackRecord(id);
    if (!current) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const updates = feedbackUpdateSchema.parse(req.body);
    const responsePayload: Partial<FeedbackRecord> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.response) {
      responsePayload.respondedAt = new Date().toISOString();
      responsePayload.respondedBy = req.auth?.userId ?? req.user?.id;
      responsePayload.status = updates.status ?? "resolved";
    }

    await adminDb.collection(FEEDBACK_COLLECTION).doc(id).update(responsePayload);
    const feedback = await getFeedbackRecord(id);

    res.json({ success: true, feedback });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid feedback update", issues: error.issues });
    }
    console.error("[feedback] update failed", error);
    res.status(500).json({ message: "Unable to update feedback" });
  }
});

router.delete("/api/admin/feedback/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const current = await getFeedbackRecord(id);
    if (!current) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    await adminDb.collection(FEEDBACK_COLLECTION).doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error("[feedback] delete failed", error);
    res.status(500).json({ message: "Unable to delete feedback" });
  }
});

export default router;
