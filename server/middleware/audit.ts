import type { Request, Response, NextFunction } from "express";
import { appendFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const logsDir = join(process.cwd(), "logs");
const auditFile = join(logsDir, "audit.jsonl");

function ensureLogs() {
  if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true });
}

export function audit(action: string, entity: string, idProvider?: (req: Request) => number | string | null) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      ensureLogs();
      const entry = {
        ts: new Date().toISOString(),
        userId: (req as any).user?.id ?? null,
        action,
        entity,
        entityId: idProvider ? idProvider(req) : null,
        ip: req.ip || (req.socket as any)?.remoteAddress || null,
        ua: req.headers["user-agent"] || null,
        path: req.originalUrl,
        method: req.method,
      };
      appendFileSync(auditFile, JSON.stringify(entry) + "\n");
    } catch (err) {
      // Logging failures should not block main flow
      console.error("Audit log error:", err);
    }
    next();
  };
}