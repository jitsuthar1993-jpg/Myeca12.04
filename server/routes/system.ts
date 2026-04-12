import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { sanitize } from "../middleware/sanitize.js";
import { audit } from "../middleware/audit.js";

const router = Router();
const cfgDir = join(process.cwd(), "config");
const cfgFile = join(cfgDir, "system.json");

const configSchema = z.object({
  siteName: z.string().min(1).default("SmartTax"),
  allowRegistrations: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
  supportEmail: z.string().email().default("support@example.com"),
  security: z.object({
    passwordMinLen: z.number().min(8).default(8),
    requireUppercase: z.boolean().default(true),
    requireLowercase: z.boolean().default(true),
    requireNumber: z.boolean().default(true),
    requireSpecial: z.boolean().default(true),
  }).default({
    passwordMinLen: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
  }),
});

function ensureCfg() {
  if (!existsSync(cfgDir)) mkdirSync(cfgDir, { recursive: true });
  if (!existsSync(cfgFile)) {
    const defaultCfg = configSchema.parse({});
    writeFileSync(cfgFile, JSON.stringify(defaultCfg, null, 2));
  }
}

router.get("/config", requireAuth, requireAdmin, (_req, res) => {
  try {
    ensureCfg();
    const json = JSON.parse(readFileSync(cfgFile, "utf-8"));
    res.json({ success: true, config: json });
  } catch (error) {
    console.error("Get config error:", error);
    res.status(500).json({ error: "Failed to load configuration" });
  }
});

router.put("/config", requireAuth, requireAdmin, sanitize, audit("update","systemConfig"), (req, res) => {
  try {
    ensureCfg();
    const updated = configSchema.parse(req.body);
    writeFileSync(cfgFile, JSON.stringify(updated, null, 2));
    res.json({ success: true, config: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Update config error:", error);
    res.status(500).json({ error: "Failed to update configuration" });
  }
});

export default router;