import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const router = Router();
const auditFile = join(process.cwd(), "logs", "audit.jsonl");

router.get("/logs", requireAuth, requireAdmin, (req, res) => {
  try {
    const { limit = "100", offset = "0", q } = req.query as { limit?: string; offset?: string; q?: string };
    const lim = Math.max(1, Math.min(1000, parseInt(limit)));
    const off = Math.max(0, parseInt(offset));

    if (!existsSync(auditFile)) {
      return res.json({ success: true, logs: [], total: 0 });
    }
    const text = readFileSync(auditFile, "utf-8");
    const lines = text.split(/\r?\n/).filter(Boolean);
    let entries = lines.map(l => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean) as any[];

    if (q) {
      const ql = q.toLowerCase();
      entries = entries.filter(e =>
        Object.values(e).some(v =>
          typeof v === "string" ? v.toLowerCase().includes(ql) : String(v ?? "").toLowerCase().includes(ql)
        )
      );
    }

    const total = entries.length;
    const slice = entries.slice(off, off + lim);
    res.json({ success: true, logs: slice, total });
  } catch (error) {
    console.error("Audit logs fetch error:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

router.get("/download", requireAuth, requireAdmin, (_req, res) => {
  try {
    if (!existsSync(auditFile)) {
      return res.status(404).json({ error: "No audit logs found" });
    }
    const text = readFileSync(auditFile, "utf-8");
    res.header("Content-Type", "text/plain");
    res.header("Content-Disposition", "attachment; filename=\"audit.jsonl\"" );
    res.send(text);
  } catch (error) {
    console.error("Audit logs download error:", error);
    res.status(500).json({ error: "Failed to download audit logs" });
  }
});

export default router;