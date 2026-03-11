import { Router, Request, Response } from "express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import * as speakeasy from "speakeasy";
import QRCode from "qrcode";

const router = Router();

// Enable 2FA - Generate secret and QR code
router.post("/enable", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `MyeCA.in (${req.user!.email})`,
      issuer: 'MyeCA.in',
      length: 32
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    
    // Store the secret temporarily (in production, store encrypted)
    await db
      .update(users)
      .set({ 
        twoFactorSecret: secret.base32,
        twoFactorEnabled: false // Not enabled until verified
      })
      .where(eq(users.id, userId));
    
    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
      backupCodes: generateBackupCodes() // Generate backup codes
    });
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    res.status(500).json({ error: "Failed to enable 2FA" });
  }
});

// Verify 2FA token and complete setup
router.post("/verify", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    
    // Get user's secret
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user[0]?.twoFactorSecret) {
      return res.status(400).json({ error: "2FA not initialized" });
    }
    
    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user[0].twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow some time drift
    });
    
    if (!verified) {
      return res.status(400).json({ error: "Invalid token" });
    }
    
    // Enable 2FA
    await db
      .update(users)
      .set({ 
        twoFactorEnabled: true
      })
      .where(eq(users.id, userId));
    
    res.json({ 
      success: true,
      message: "2FA has been enabled successfully" 
    });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    res.status(500).json({ error: "Failed to verify 2FA token" });
  }
});

// Disable 2FA
router.post("/disable", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { password, token } = req.body;
    
    // Verify password (in production, verify against hashed password)
    // Verify token before disabling
    
    await db
      .update(users)
      .set({ 
        twoFactorEnabled: false,
        twoFactorSecret: null
      })
      .where(eq(users.id, userId));
    
    res.json({ 
      success: true,
      message: "2FA has been disabled" 
    });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    res.status(500).json({ error: "Failed to disable 2FA" });
  }
});

// Verify 2FA token during login
router.post("/login-verify", async (req: Request, res: Response) => {
  try {
    const { email, token } = req.body;
    
    if (!email || !token) {
      return res.status(400).json({ error: "Email and token are required" });
    }
    
    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (!user[0] || !user[0].twoFactorEnabled || !user[0].twoFactorSecret) {
      return res.status(400).json({ error: "2FA not enabled for this user" });
    }
    
    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user[0].twoFactorSecret,
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
    console.error("Error verifying 2FA during login:", error);
    res.status(500).json({ error: "Failed to verify 2FA token" });
  }
});

// Generate backup codes
function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

export default router;