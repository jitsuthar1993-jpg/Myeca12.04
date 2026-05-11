import { Response, Router } from "express";
import { authenticateToken, type AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";
import { z } from "zod";

const router = Router();

const notificationSchema = z.object({
  title: z.string(),
  message: z.string(),
  type: z.enum(["info", "success", "warning", "error", "tax_update", "deadline"]),
  category: z.enum(["tax_update", "deadline_reminder", "service_update", "system", "payment"]),
  read: z.boolean().default(false),
  actionUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const defaultNotifications = [
  {
    key: "ay-2026-27-filing-prep",
    title: "AY 2026-27 Filing Prep",
    message: "Prepare Form 16, AIS, Form 26AS, bank interest, and investment records before filing your AY 2026-27 ITR.",
    type: "deadline" as const,
    category: "deadline_reminder" as const,
    actionUrl: "/itr/form-selector",
  },
  {
    key: "refund-tracking-reminder",
    title: "Refund Tracking Reminder",
    message: "Refund credit depends on e-verification, CPC processing, and bank validation. Track status from your filing dashboard.",
    type: "success" as const,
    category: "payment" as const,
  },
  {
    key: "ay-2026-27-regime-review",
    title: "AY 2026-27 Regime Review",
    message: "Review Old vs New Regime using FY 2025-26 income and deductions before final filing.",
    type: "tax_update" as const,
    category: "tax_update" as const,
    actionUrl: "/calculators/tax-regime",
  },
];

function requireUser(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return req.user;
}

async function seedDefaultNotifications(userId: string) {
  await Promise.all(defaultNotifications.map(async (template, index) => {
    const id = `${userId}:${template.key}`;
    const doc = await adminDb.collection("notifications").doc(id).get();
    if (doc.exists) return;

    await adminDb.collection("notifications").doc(id).set({
      ...template,
      userId,
      read: false,
      createdAt: new Date(Date.now() - (index + 2) * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }));
}

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  await seedDefaultNotifications(user.id);
  const { unread } = req.query;
  const snapshot = await adminDb.collection("notifications")
    .where("userId", "==", user.id)
    .get();

  let notifications = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((notification: any) => notification.status !== "deleted");

  if (unread === "true") {
    notifications = notifications.filter((notification: any) => !notification.read);
  }

  notifications.sort((a: any, b: any) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

  res.json({
    success: true,
    notifications,
    unreadCount: notifications.filter((notification: any) => !notification.read).length,
  });
});

router.patch("/:id/read", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const doc = await adminDb.collection("notifications").doc(req.params.id).get();
  if (!doc.exists || doc.data()?.userId !== user.id) {
    return res.status(404).json({ error: "Notification not found" });
  }

  await adminDb.collection("notifications").doc(req.params.id).update({ read: true, updatedAt: new Date() });
  res.json({ success: true, message: "Notification marked as read" });
});

router.patch("/read-all", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const snapshot = await adminDb.collection("notifications")
    .where("userId", "==", user.id)
    .get();

  await Promise.all(snapshot.docs.map((doc) =>
    adminDb.collection("notifications").doc(doc.id).update({ read: true, updatedAt: new Date() }),
  ));

  res.json({ success: true, message: "All notifications marked as read" });
});

router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const doc = await adminDb.collection("notifications").doc(req.params.id).get();
  if (!doc.exists || doc.data()?.userId !== user.id) {
    return res.status(404).json({ error: "Notification not found" });
  }

  await adminDb.collection("notifications").doc(req.params.id).update({
    status: "deleted",
    deletedAt: new Date(),
    updatedAt: new Date(),
  });

  res.json({ success: true, message: "Notification deleted" });
});

router.post("/test", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const data = notificationSchema.parse({
    title: req.body.title || "Test Notification",
    message: req.body.message || "This is a test notification created at " + new Date().toLocaleString(),
    type: req.body.type || "info",
    category: req.body.category || "system",
    actionUrl: req.body.actionUrl || "/notifications",
    metadata: req.body.metadata || {},
  });

  const notification = {
    ...data,
    userId: user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const ref = await adminDb.collection("notifications").add(notification);

  res.json({ success: true, notification: { id: ref.id, ...notification } });
});

export default router;
