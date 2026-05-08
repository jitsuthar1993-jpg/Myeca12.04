import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { z } from "zod";


const router = Router();

// Notification schema
const notificationSchema = z.object({
  userId: z.union([z.number(), z.string()]),
  title: z.string(),
  message: z.string(),
  type: z.enum(["info", "success", "warning", "error", "tax_update", "deadline"]),
  category: z.enum(["tax_update", "deadline_reminder", "service_update", "system", "payment"]),
  read: z.boolean().default(false),
  actionUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().default(() => new Date())
});
type Notification = z.infer<typeof notificationSchema> & { id: number };

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: 1,
    userId: "system",
    title: "AY 2026-27 Filing Prep",
    message: "Prepare Form 16, AIS, Form 26AS, bank interest, and investment records before filing your AY 2026-27 ITR.",
    type: "deadline" as const,
    category: "deadline_reminder" as const,
    read: false,
    actionUrl: "/itr/form-selector",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    id: 2,
    userId: "system",
    title: "Refund Tracking Reminder",
    message: "Refund credit depends on e-verification, CPC processing, and bank validation. Track status from your filing dashboard.",
    type: "success" as const,
    category: "payment" as const,
    read: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    id: 3,
    userId: "system",
    title: "AY 2026-27 Regime Review",
    message: "Review Old vs New Regime using FY 2025-26 income and deductions before final filing.",
    type: "tax_update" as const,
    category: "tax_update" as const,
    read: true,
    actionUrl: "/calculators/tax-regime",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  }
];

// Get all notifications for a user
router.get("/", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { unread } = req.query;

  let notifications = mockNotifications.map(n => ({ ...n, userId }));

  if (unread === "true") {
    notifications = notifications.filter(n => !n.read);
  }

  res.json({
    success: true,
    notifications,
    unreadCount: notifications.filter(n => !n.read).length
  });
});

// Mark a notification as read
router.patch("/:id/read", authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const notificationIndex = mockNotifications.findIndex(n => n.id === parseInt(id));

  if (notificationIndex === -1) {
    return res.status(404).json({ error: "Notification not found" });
  }

  mockNotifications[notificationIndex].read = true;

  res.json({
    success: true,
    message: "Notification marked as read"
  });
});

// Mark all notifications as read
router.patch("/read-all", authenticateToken, (req: Request, res: Response) => {
  mockNotifications.forEach(n => n.read = true);

  res.json({
    success: true,
    message: "All notifications marked as read"
  });
});

// Delete a notification
router.delete("/:id", authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const notificationIndex = mockNotifications.findIndex(n => n.id === parseInt(id));

  if (notificationIndex === -1) {
    return res.status(404).json({ error: "Notification not found" });
  }

  mockNotifications.splice(notificationIndex, 1);

  res.json({
    success: true,
    message: "Notification deleted"
  });
});

// Create a test notification (for development)
router.post("/test", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  const testNotification = {
    id: mockNotifications.length + 1,
    userId,
    title: "Test Notification",
    message: "This is a test notification created at " + new Date().toLocaleString(),
    type: "info" as const,
    category: "system" as const,
    actionUrl: "/notifications",
    read: false,
    createdAt: new Date()
  };

  mockNotifications.push(testNotification);

  res.json({
    success: true,
    notification: testNotification
  });
});

export default router;
