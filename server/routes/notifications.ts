import { Response, Router } from "express";
import { authenticateToken, type AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";

const router = Router();

function requireUser(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return req.user;
}

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

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

export default router;
