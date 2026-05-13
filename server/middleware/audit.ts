import type { Request, Response, NextFunction } from "express";
import { adminDb } from "../data-admin.js";

function cleanPath(req: Request) {
  return (req.originalUrl || req.url || "").split("?")[0].slice(0, 200);
}

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 300) : "Unknown audit logging error";
}

export function audit(action: string, entity: string, idProvider?: (req: Request) => number | string | null) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const now = new Date();
      const auth = (req as any).auth;
      const user = (req as any).user;
      const entityId = idProvider ? idProvider(req) : null;

      const entry = {
        userId: auth?.userId ?? user?.id ?? null,
        email: auth?.email ?? user?.email ?? null,
        action,
        category: "system",
        entity,
        entityId: entityId == null ? null : String(entityId).slice(0, 120),
        metadata: {
          path: cleanPath(req),
          method: req.method,
        },
        status: "success",
        ip: req.ip || (req.socket as any)?.remoteAddress || null,
        userAgent: String(req.headers["user-agent"] || "").slice(0, 300) || null,
        createdAt: now,
        updatedAt: now,
      };

      void adminDb.collection("audit_logs").add(entry).catch((error) => {
        console.error("[audit-log]", { message: safeErrorMessage(error), action, entity });
      });
    } catch (error) {
      console.error("[audit-log]", { message: safeErrorMessage(error), action, entity });
    }

    next();
  };
}
