import { Router, Response } from "express";
import { adminDb } from "../data-admin.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import * as speakeasy from "speakeasy";
import QRCode from "qrcode";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { decryptPII, encryptPII } from "../utils/encryption.js";
import { apiRateLimiter } from "../middleware/rate-limits.js";

const router = Router();

const tokenSchema = z.object({
  token: z.string().optional(),
  code: z.string().optional(),
});

function readToken(body: unknown) {
  const parsed = tokenSchema.parse(body);
  return String(parsed.token ?? parsed.code ?? "").replace(/\s+/g, "");
}

function protectMfaValue(value: string) {
  if (process.env.PII_ENCRYPTION_KEY) {
    return encryptPII(value);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("PII_ENCRYPTION_KEY is required before enabling two-factor authentication");
  }

  return value;
}

function revealMfaValue(value?: string | null) {
  if (!value) return null;
  try {
    return decryptPII(value);
  } catch (error) {
    console.warn("Unable to decrypt stored 2FA value", error);
    return null;
  }
}

function getStoredTotpSecret(userData: Record<string, any> | undefined) {
  return revealMfaValue(userData?.twoFactorSecret);
}

function getProtectedBackupCodes(codes: string[]) {
  return protectMfaValue(JSON.stringify(codes));
}

router.get("/status", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

    const userDoc = await adminDb.collection("users").doc(auth.userId).get();
    const userData = userDoc.data();
    const hasSecret = Boolean(getStoredTotpSecret(userData));

    res.json({
      enabled: Boolean(userData?.twoFactorEnabled && hasSecret),
    });
  } catch (error) {
    console.error("Error loading 2FA status:", error);
    res.status(500).json({ error: "Failed to load 2FA status" });
  }
});

// Enable 2FA - Generate secret and QR code
router.post("/enable", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || !auth.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const userId = auth.userId;
    
    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `MyeCA.in (${auth.email || 'User'})`,
      issuer: 'MyeCA.in',
      length: 32
    });
    
    const backupCodes = generateBackupCodes();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    
    await adminDb.collection("users").doc(userId).set({
      twoFactorSecret: protectMfaValue(secret.base32),
      twoFactorEnabled: false,
      twoFactorBackupCodes: getProtectedBackupCodes(backupCodes),
      twoFactorPendingAt: new Date().toISOString(),
    }, { merge: true });
    
    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
      backupCodes,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("PII_ENCRYPTION_KEY")) {
      return res.status(503).json({ error: "Two-factor authentication setup requires server-side encryption to be configured" });
    }
    console.error("Error enabling 2FA:", error);
    res.status(500).json({ error: "Failed to enable 2FA" });
  }
});

// Verify 2FA token and complete setup
router.post("/verify", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || !auth.userId) return res.status(401).json({ error: "Unauthorized" });
    const token = readToken(req.body);
    
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    
    // Get user's secret
    const userDoc = await adminDb.collection("users").doc(auth.userId).get();
    const userData = userDoc.data();
    
    const storedSecret = getStoredTotpSecret(userData);
    if (!storedSecret) {
      return res.status(400).json({ error: "2FA not initialized" });
    }
    
    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: storedSecret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow some time drift
    });
    
    if (!verified) {
      return res.status(400).json({ error: "Invalid token" });
    }
    
    // Enable 2FA
    await adminDb.collection("users").doc(auth.userId).set({
      twoFactorEnabled: true,
      twoFactorEnabledAt: new Date().toISOString(),
    }, { merge: true });
    
    res.json({ 
      success: true,
      message: "2FA has been enabled successfully" 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid verification payload" });
    }
    console.error("Error verifying 2FA:", error);
    res.status(500).json({ error: "Failed to verify 2FA token" });
  }
});

// Disable 2FA
router.post("/disable", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || !auth.userId) return res.status(401).json({ error: "Unauthorized" });
    
    await adminDb.collection("users").doc(auth.userId).set({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      twoFactorDisabledAt: new Date().toISOString(),
    }, { merge: true });
    
    res.json({ 
      success: true,
      message: "2FA has been disabled" 
    });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    res.status(500).json({ error: "Failed to disable 2FA" });
  }
});

// Verify 2FA token during login for legacy app-owned TOTP flows.
router.post("/login-verify", apiRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    const token = readToken(req.body);
    
    if (!email || !token) {
      return res.status(400).json({ error: "Email and token are required" });
    }
    
    // Get user by email
    const snapshot = await adminDb.collection("users").where("email", "==", email).get();
    if (snapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userData = snapshot.docs[0].data();
    
    const storedSecret = getStoredTotpSecret(userData);
    if (!userData.twoFactorEnabled || !storedSecret) {
      return res.status(400).json({ error: "2FA not enabled for this user" });
    }
    
    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: storedSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });
    
    if (!verified) {
      return res.status(400).json({ error: "Invalid 2FA token" });
    }
    
    res.json({ 
      success: true,
      message: "2FA verification successful" 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid verification payload" });
    }
    console.error("Error verifying 2FA during login:", error);
    res.status(500).json({ error: "Failed to verify 2FA token" });
  }
});

// Generate backup codes
function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(6).toString("base64url").slice(0, 8).toUpperCase();
    codes.push(code);
  }
  return codes;
}

export default router;
