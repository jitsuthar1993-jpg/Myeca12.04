import { db } from "../db";
import { activityLogs } from "@shared/schema";
import type { Request } from "express";

export async function logActivity(
  userId: number,
  action: string,
  entity: string,
  entityId: number | null,
  oldData: any,
  newData: any,
  req: Request
) {
  try {
    await db.insert(activityLogs).values({
      userId,
      action,
      entity,
      entityId,
      oldData: oldData ? JSON.stringify(oldData) : null,
      newData: newData ? JSON.stringify(newData) : null,
      ipAddress: req.ip || req.socket.remoteAddress || null,
      userAgent: req.headers["user-agent"] || null,
    });
  } catch (error) {
    console.error("Activity logging error:", error);
    // Don't throw - logging failures shouldn't break the main operation
  }
}