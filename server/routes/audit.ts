import { Router } from "express";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../neon-admin.js";

const router = Router();

router.post("/logs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const entry = {
      userId: req.auth?.userId || null,
      email: req.auth?.email || null,
      action: req.body?.action || "audit_event",
      category: req.body?.category || "general",
      metadata: req.body?.metadata || {},
      status: req.body?.status || "success",
      ip: req.ip,
      userAgent: req.get("user-agent") || null,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await adminDb.collection("audit_logs").add(entry);
    res.status(201).json({ success: true, id: ref.id });
  } catch (error) {
    console.error("Audit log create error:", error);
    res.status(500).json({ error: "Failed to create audit log" });
  }
});

router.get("/logs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { limit = "100", offset = "0", q } = req.query as { limit?: string; offset?: string; q?: string };
    const lim = Math.max(1, Math.min(1000, parseInt(limit)));
    const off = Math.max(0, parseInt(offset));

    const snapshot = await adminDb.collection("audit_logs").orderBy("createdAt", "desc").get();
    let entries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (q) {
      const ql = q.toLowerCase();
      entries = entries.filter((entry) =>
        JSON.stringify(entry).toLowerCase().includes(ql)
      );
    }

    const total = entries.length;
    res.json({ success: true, logs: entries.slice(off, off + lim), total });
  } catch (error) {
    console.error("Audit logs fetch error:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

router.get("/download", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const snapshot = await adminDb.collection("audit_logs").orderBy("createdAt", "desc").get();
    const text = snapshot.docs
      .map((doc) => JSON.stringify({ id: doc.id, ...doc.data() }))
      .join("\n");

    res.header("Content-Type", "text/plain");
    res.header("Content-Disposition", "attachment; filename=\"audit.jsonl\"");
    res.send(text);
  } catch (error) {
    console.error("Audit logs download error:", error);
    res.status(500).json({ error: "Failed to download audit logs" });
  }
});

export default router;
