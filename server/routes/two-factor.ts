import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import { z } from "zod";

const router = Router();

// Store 2FA secrets (in production, store in database)
const twoFactorSecrets = new Map<number, { secret: string; enabled: boolean; recoveryCodes: string[] }>();

// Generate recovery codes
function generateRecoveryCodes(): string[] {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    codes.push(speakeasy.generateSecret({ length: 8 }).base32.substring(0, 8));
  }
  return codes;
}

// Enable 2FA
router.post("/enable", authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `MyeCA.in (${(req as any).user.email})`,
    issuer: "MyeCA.in"
  });
  
  // Generate recovery codes
  const recoveryCodes = generateRecoveryCodes();
  
  // Store secret (temporarily)
  twoFactorSecrets.set(userId, {
    secret: secret.base32,
    enabled: false,
    recoveryCodes
  });
  
  // Generate QR code
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);
  
  res.json({
    success: true,
    secret: secret.base32,
    qrCode: qrCodeUrl,
    recoveryCodes
  });
});

// Verify 2FA setup
router.post("/verify", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }
  
  const userSecret = twoFactorSecrets.get(userId);
  if (!userSecret) {
    return res.status(400).json({ error: "2FA not initialized" });
  }
  
  const verified = speakeasy.totp.verify({
    secret: userSecret.secret,
    encoding: "base32",
    token,
    window: 2
  });
  
  if (verified) {
    userSecret.enabled = true;
    res.json({
      success: true,
      message: "2FA enabled successfully"
    });
  } else {
    res.status(400).json({ error: "Invalid token" });
  }
});

// Disable 2FA
router.post("/disable", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { password } = req.body;
  
  // In production, verify password here
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  
  twoFactorSecrets.delete(userId);
  
  res.json({
    success: true,
    message: "2FA disabled successfully"
  });
});

// Verify 2FA token during login
router.post("/verify-login", (req: Request, res: Response) => {
  const { userId, token, recoveryCode } = req.body;
  
  const userSecret = twoFactorSecrets.get(parseInt(userId));
  if (!userSecret || !userSecret.enabled) {
    return res.status(400).json({ error: "2FA not enabled" });
  }
  
  // Check recovery code first
  if (recoveryCode) {
    const codeIndex = userSecret.recoveryCodes.indexOf(recoveryCode);
    if (codeIndex !== -1) {
      // Remove used recovery code
      userSecret.recoveryCodes.splice(codeIndex, 1);
      return res.json({
        success: true,
        message: "Recovery code verified"
      });
    }
    return res.status(400).json({ error: "Invalid recovery code" });
  }
  
  // Verify TOTP token
  const verified = speakeasy.totp.verify({
    secret: userSecret.secret,
    encoding: "base32",
    token,
    window: 2
  });
  
  if (verified) {
    res.json({
      success: true,
      message: "2FA verification successful"
    });
  } else {
    res.status(400).json({ error: "Invalid token" });
  }
});

// Get 2FA status
router.get("/status", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userSecret = twoFactorSecrets.get(userId);
  
  res.json({
    success: true,
    enabled: userSecret?.enabled || false
  });
});

export default router;