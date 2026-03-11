import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { join } from "path";
import { existsSync, mkdirSync, copyFileSync, readdirSync } from "fs";
import { audit } from "../middleware/audit.js";

const router = Router();
const dbFile = join(process.cwd(), "dev.db");
const backupsDir = join(process.cwd(), "backups");

function ensureBackupsDir() {
  if (!existsSync(backupsDir)) mkdirSync(backupsDir, { recursive: true });
}

// List backups
router.get("/backups", requireAuth, requireAdmin, (_req, res) => {
  try {
    ensureBackupsDir();
    const files = readdirSync(backupsDir).filter(f => f.endsWith(".db"));
    res.json({ success: true, files });
  } catch (error) {
    console.error("List backups error:", error);
    res.status(500).json({ error: "Failed to list backups" });
  }
});

// Create backup
router.post("/backup", requireAuth, requireAdmin, audit("backup","database"), (_req, res) => {
  try {
    ensureBackupsDir();
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = join(backupsDir, `dev-${ts}.db`);
    copyFileSync(dbFile, backupFile);
    res.json({ success: true, file: backupFile });
  } catch (error) {
    console.error("Backup error:", error);
    res.status(500).json({ error: "Failed to create backup" });
  }
});

// Restore backup
router.post("/restore", requireAuth, requireAdmin, audit("restore","database"), (req, res) => {
  try {
    const { file } = req.body as { file: string };
    if (!file || !existsSync(file)) {
      return res.status(400).json({ error: "Backup file not found" });
    }
    copyFileSync(file, dbFile);
    res.json({ success: true, message: "Database restored" });
  } catch (error) {
    console.error("Restore error:", error);
    res.status(500).json({ error: "Failed to restore database" });
  }
});

export default router;