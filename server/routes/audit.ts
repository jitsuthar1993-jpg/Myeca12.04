import { Router } from "express";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";

const router = Router();
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 500;
const SEARCH_SCAN_LIMIT = 5000;
const DEFAULT_DOWNLOAD_LIMIT = 5000;
const MAX_DOWNLOAD_LIMIT = 10000;

function parsePagination(query: AuthRequest["query"]) {
  const limit = Math.max(1, Math.min(MAX_PAGE_SIZE, parseInt(String(query.limit ?? DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
  const offset = Math.max(0, parseInt(String(query.offset ?? "0"), 10) || 0);
  const page = Math.floor(offset / limit) + 1;
  return { limit, offset, page };
}

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
    const { q } = req.query as { q?: string };
    const { limit, offset, page } = parsePagination(req.query);

    if (!q) {
      const collection = adminDb.collection("audit_logs");
      const countSnapshot = await (collection as any).count().get();
      const total = countSnapshot.data().count;
      const snapshot = await (collection as any)
        .orderBy("createdAt", "desc")
        .offset(offset)
        .limit(limit)
        .get();

      return res.json({
        success: true,
        logs: snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
        total,
        pagination: { page, limit, offset, total, pages: Math.ceil(total / limit) },
      });
    }

    const snapshot = await adminDb.collection("audit_logs")
      .orderBy("createdAt", "desc")
      .limit(SEARCH_SCAN_LIMIT)
      .get();
    const ql = q.toLowerCase();
    const entries = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((entry) => JSON.stringify(entry).toLowerCase().includes(ql));
    const total = entries.length;
    res.json({
      success: true,
      logs: entries.slice(offset, offset + limit),
      total,
      pagination: { page, limit, offset, total, pages: Math.ceil(total / limit), searched: Math.min(SEARCH_SCAN_LIMIT, snapshot.docs.length) },
    });
  } catch (error) {
    console.error("Audit logs fetch error:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

router.get("/download", requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit = Math.max(
      1,
      Math.min(MAX_DOWNLOAD_LIMIT, parseInt(String(req.query.limit ?? DEFAULT_DOWNLOAD_LIMIT), 10) || DEFAULT_DOWNLOAD_LIMIT),
    );
    const snapshot = await adminDb.collection("audit_logs").orderBy("createdAt", "desc").limit(limit).get();
    const text = snapshot.docs
      .map((doc) => JSON.stringify({ id: doc.id, ...doc.data() }))
      .join("\n");

    res.header("Content-Type", "text/plain");
    res.header("Content-Disposition", "attachment; filename=\"audit.jsonl\"");
    res.header("X-Export-Limit", String(limit));
    res.send(text);
  } catch (error) {
    console.error("Audit logs download error:", error);
    res.status(500).json({ error: "Failed to download audit logs" });
  }
});

export default router;
