import { adminDb } from "../neon-admin.js";
import type { Request } from "express";

export async function logActivity(
  userId: string,
  action: string,
  entity: string,
  entityId: string | null, // Changed to string
  oldData: any,
  newData: any,
  req: Request
) {
  try {
    await adminDb.collection("activity_logs").add({
      userId,
      action,
      entity,
      entityId,
      oldData: oldData || null,
      newData: newData || null,
      ipAddress: req.ip || req.socket.remoteAddress || null,
      userAgent: req.headers["user-agent"] || null,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Activity logging error:", error);
    // Don't throw - logging failures shouldn't break the main operation
  }
}
