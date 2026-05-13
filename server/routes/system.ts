import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { sanitize } from "../middleware/sanitize.js";
import { audit } from "../middleware/audit.js";
import { adminDb } from "../data-admin.js";

const router = Router();
const SETTINGS_COLLECTION = "site_settings";
const SYSTEM_CONFIG_DOC = "system_config";

const configSchema = z.object({
  siteName: z.string().trim().min(1).max(120).default("MyeCA.in"),
  siteDescription: z.string().trim().max(300).default("Expert Income Tax Filing & ITR e-Filing in India"),
  allowRegistrations: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
  supportEmail: z.string().trim().email().default("support@myeca.in"),
  contactPhone: z.string().trim().max(40).optional().default(""),
  email: z.object({
    enabled: z.boolean().default(true),
    smtpHost: z.string().trim().max(160).optional().default(""),
    smtpPort: z.string().trim().max(10).optional().default("587"),
    smtpUser: z.string().trim().max(160).optional().default(""),
  }).default({ enabled: true, smtpHost: "", smtpPort: "587", smtpUser: "" }),
  payments: z.object({
    enabled: z.boolean().default(true),
    mode: z.enum(["test", "live"]).default("test"),
    razorpayKeyId: z.string().trim().max(160).optional().default(""),
  }).default({ enabled: true, mode: "test", razorpayKeyId: "" }),
  security: z.object({
    passwordMinLen: z.number().int().min(8).max(20).default(8),
    requirePrivilegedMfa: z.boolean().default(false),
    sessionTimeoutMinutes: z.number().int().min(15).max(15).default(15),
  }).default({ passwordMinLen: 8, requirePrivilegedMfa: false, sessionTimeoutMinutes: 15 }),
  tax: z.object({
    currentAssessmentYear: z.string().trim().max(20).default("2025-26"),
    itrFilingEnabled: z.boolean().default(true),
    maxFileSizeMb: z.number().int().min(1).max(100).default(10),
    autoSaveDrafts: z.boolean().default(true),
  }).default({ currentAssessmentYear: "2025-26", itrFilingEnabled: true, maxFileSizeMb: 10, autoSaveDrafts: true }),
  system: z.object({
    rateLimitPerMinute: z.number().int().min(10).max(1000).default(100),
    apiTimeoutSeconds: z.number().int().min(5).max(120).default(30),
    cacheEnabled: z.boolean().default(true),
    debugMode: z.boolean().default(false),
    emailNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(false),
    pushNotifications: z.boolean().default(true),
    adminAlerts: z.boolean().default(true),
  }).default({
    rateLimitPerMinute: 100,
    apiTimeoutSeconds: 30,
    cacheEnabled: true,
    debugMode: false,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true,
  }),
});

type SystemConfig = z.infer<typeof configSchema>;

function defaultConfig(): SystemConfig {
  return configSchema.parse({});
}

function withoutSensitiveFields(value: Record<string, any>) {
  const next = { ...value };
  if (next.email) {
    const { smtpPassword: _smtpPassword, ...email } = next.email;
    next.email = email;
  }
  if (next.payments) {
    const { razorpayKeySecret: _razorpayKeySecret, ...payments } = next.payments;
    next.payments = payments;
  }
  return next;
}

async function loadSystemConfig() {
  const doc = await adminDb.collection(SETTINGS_COLLECTION).doc(SYSTEM_CONFIG_DOC).get();
  if (!doc.exists) return defaultConfig();
  return configSchema.parse({ ...defaultConfig(), ...(doc.data() ?? {}) });
}

router.get("/config", requireAuth, requireAdmin, async (_req, res) => {
  try {
    res.json({ success: true, config: await loadSystemConfig() });
  } catch (error) {
    console.error("Get config error:", error);
    res.status(500).json({ error: "Failed to load configuration" });
  }
});

router.put("/config", requireAuth, requireAdmin, sanitize, audit("update", "systemConfig"), async (req, res) => {
  try {
    const existing = await loadSystemConfig();
    const updated = configSchema.parse({
      ...existing,
      ...withoutSensitiveFields(req.body ?? {}),
      updatedAt: undefined,
    });

    await adminDb.collection(SETTINGS_COLLECTION).doc(SYSTEM_CONFIG_DOC).set({
      ...updated,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    res.json({ success: true, config: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message ?? "Invalid configuration" });
    }
    console.error("Update config error:", error);
    res.status(500).json({ error: "Failed to update configuration" });
  }
});

export default router;
