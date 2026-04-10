import { Router } from "express";
import path, { join } from "path";
import { existsSync, mkdirSync, copyFileSync, readdirSync } from "fs";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { audit } from "../middleware/audit.js";
import { safeError } from "../utils/error-response.js";

const router = Router();
const dbFile = join(process.cwd(), "dev.db");
const backupsDir = join(process.cwd(), "backups");

function ensureBackupsDir() {
  if (!existsSync(backupsDir)) mkdirSync(backupsDir, { recursive: true });
}

router.get("/backups", requireAuth, requireAdmin, (_req, res) => {
  try {
    ensureBackupsDir();
    const files = readdirSync(backupsDir).filter(f => f.endsWith(".db"));
    res.json({ success: true, files });
  } catch (error) {
    return safeError(res, error, "Failed to list backups");
  }
});

router.post("/backup", requireAuth, requireAdmin, audit("backup", "database"), (_req, res) => {
  try {
    ensureBackupsDir();
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = join(backupsDir, `dev-${ts}.db`);
    copyFileSync(dbFile, backupFile);
    res.json({ success: true, file: path.basename(backupFile) });
  } catch (error) {
    return safeError(res, error, "Failed to create backup");
  }
});

router.post("/restore", requireAuth, requireAdmin, audit("restore", "database"), (req, res) => {
  try {
    const { file } = req.body as { file: string };
    const safeFileName = path.basename(file || "");
    const resolvedPath = path.resolve(backupsDir, safeFileName);
    const resolvedBackupsDir = path.resolve(backupsDir);

    if (!safeFileName || !resolvedPath.startsWith(`${resolvedBackupsDir}${path.sep}`) || !existsSync(resolvedPath)) {
      return res.status(400).json({ error: "Backup file not found" });
    }

    copyFileSync(resolvedPath, dbFile);
    res.json({ success: true, message: "Database restored" });
  } catch (error) {
    return safeError(res, error, "Failed to restore database");
  }
});

export default router;
