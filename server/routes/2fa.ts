import { Router, Response } from "express";
import { adminDb } from "../neon-admin.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import * as speakeasy from "speakeasy";
import QRCode from "qrcode";

const router = Router();

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
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    
    // Store the secret temporarily (in production, store encrypted)
    await adminDb.collection("users").doc(userId).update({
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false // Not enabled until verified
    });
    
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
router.post("/verify", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || !auth.userId) return res.status(401).json({ error: "Unauthorized" });
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    
    // Get user's secret
    const userDoc = await adminDb.collection("users").doc(auth.userId).get();
    const userData = userDoc.data();
    
    if (!userData?.twoFactorSecret) {
      return res.status(400).json({ error: "2FA not initialized" });
    }
    
    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: userData.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow some time drift
    });
    
    if (!verified) {
      return res.status(400).json({ error: "Invalid token" });
    }
    
    // Enable 2FA
    await adminDb.collection("users").doc(auth.userId).update({
      twoFactorEnabled: true
    });
    
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
router.post("/disable", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || !auth.userId) return res.status(401).json({ error: "Unauthorized" });
    
    await adminDb.collection("users").doc(auth.userId).update({
      twoFactorEnabled: false,
      twoFactorSecret: null
    });
    
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
router.post("/login-verify", async (req: AuthRequest, res: Response) => {
  try {
    const { email, token } = req.body;
    
    if (!email || !token) {
      return res.status(400).json({ error: "Email and token are required" });
    }
    
    // Get user by email
    const snapshot = await adminDb.collection("users").where("email", "==", email).get();
    if (snapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userData = snapshot.docs[0].data();
    
    if (!userData.twoFactorEnabled || !userData.twoFactorSecret) {
      return res.status(400).json({ error: "2FA not enabled for this user" });
    }
    
    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: userData.twoFactorSecret,
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
