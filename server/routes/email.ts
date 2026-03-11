import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Email templates
const emailTemplates = {
  welcome: {
    subject: "Welcome to MyeCA.in - Your Tax Filing Journey Begins!",
    template: `
      <h2>Welcome {{name}}!</h2>
      <p>Thank you for joining MyeCA.in, India's most trusted tax filing platform.</p>
      <p>Here's what you can do:</p>
      <ul>
        <li>File your ITR in minutes</li>
        <li>Get expert CA assistance</li>
        <li>Track your refunds</li>
        <li>Access financial calculators</li>
      </ul>
      <p>Get started by <a href="{{loginUrl}}">logging in to your account</a>.</p>
    `
  },
  passwordReset: {
    subject: "Reset Your MyeCA.in Password",
    template: `
      <h2>Password Reset Request</h2>
      <p>Hi {{name}},</p>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <p><a href="{{resetUrl}}" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  },
  taxFiled: {
    subject: "ITR Filed Successfully - Acknowledgment Inside",
    template: `
      <h2>Congratulations {{name}}!</h2>
      <p>Your Income Tax Return for AY {{assessmentYear}} has been filed successfully.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Acknowledgment Number: {{acknowledgmentNumber}}</li>
        <li>Filed On: {{filedDate}}</li>
        <li>Total Income: ₹{{totalIncome}}</li>
        <li>Tax Payable/Refund: ₹{{taxAmount}}</li>
      </ul>
      <p>You can download your acknowledgment from your dashboard.</p>
    `
  },
  twoFactorEnabled: {
    subject: "Two-Factor Authentication Enabled",
    template: `
      <h2>2FA Successfully Enabled</h2>
      <p>Hi {{name}},</p>
      <p>Two-factor authentication has been enabled on your MyeCA.in account.</p>
      <p>Your account is now more secure. You'll need your authenticator app to log in.</p>
      <p>If you didn't enable this, please contact support immediately.</p>
    `
  },
  loginAlert: {
    subject: "New Login to Your MyeCA.in Account",
    template: `
      <h2>New Login Detected</h2>
      <p>Hi {{name}},</p>
      <p>A new login to your account was detected:</p>
      <ul>
        <li>Time: {{loginTime}}</li>
        <li>Location: {{location}}</li>
        <li>Device: {{device}}</li>
      </ul>
      <p>If this wasn't you, please <a href="{{securityUrl}}">secure your account</a> immediately.</p>
    `
  }
};

// Email sending function (mock implementation)
async function sendEmail(to: string, subject: string, html: string) {
  // In production, integrate with SendGrid, AWS SES, or other email service
  console.log("Sending email to:", to);
  console.log("Subject:", subject);
  console.log("Content:", html);
  
  // Simulate async email sending
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, messageId: `msg_${Date.now()}` });
    }, 1000);
  });
}

// Send test email
router.post("/send-test", authenticateToken, async (req: Request, res: Response) => {
  const { templateId, email } = req.body;
  const user = (req as any).user;
  
  if (!templateId || !emailTemplates[templateId as keyof typeof emailTemplates]) {
    return res.status(400).json({ error: "Invalid template ID" });
  }
  
  const template = emailTemplates[templateId as keyof typeof emailTemplates];
  const emailContent = template.template
    .replace(/{{name}}/g, user.name || user.email)
    .replace(/{{email}}/g, user.email)
    .replace(/{{loginUrl}}/g, "https://myeca.in/login")
    .replace(/{{resetUrl}}/g, "https://myeca.in/reset-password?token=test")
    .replace(/{{assessmentYear}}/g, "2025-26")
    .replace(/{{acknowledgmentNumber}}/g, "ITR2025" + Math.random().toString(36).substring(7).toUpperCase())
    .replace(/{{filedDate}}/g, new Date().toLocaleDateString())
    .replace(/{{totalIncome}}/g, "500000")
    .replace(/{{taxAmount}}/g, "15000")
    .replace(/{{loginTime}}/g, new Date().toLocaleString())
    .replace(/{{location}}/g, "Mumbai, India")
    .replace(/{{device}}/g, "Chrome on Windows")
    .replace(/{{securityUrl}}/g, "https://myeca.in/settings/security");
  
  try {
    await sendEmail(email || user.email, template.subject, emailContent);
    res.json({
      success: true,
      message: "Test email sent successfully"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Get email templates
router.get("/templates", authenticateToken, (req: Request, res: Response) => {
  const templates = Object.entries(emailTemplates).map(([id, template]) => ({
    id,
    subject: template.subject,
    description: getTemplateDescription(id)
  }));
  
  res.json({
    success: true,
    templates
  });
});

// Get template preview
router.get("/templates/:id/preview", authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const template = emailTemplates[id as keyof typeof emailTemplates];
  
  if (!template) {
    return res.status(404).json({ error: "Template not found" });
  }
  
  const user = (req as any).user;
  const preview = template.template
    .replace(/{{name}}/g, user.name || user.email)
    .replace(/{{email}}/g, user.email)
    .replace(/{{loginUrl}}/g, "#")
    .replace(/{{resetUrl}}/g, "#")
    .replace(/{{assessmentYear}}/g, "2025-26")
    .replace(/{{acknowledgmentNumber}}/g, "ITR2025SAMPLE")
    .replace(/{{filedDate}}/g, new Date().toLocaleDateString())
    .replace(/{{totalIncome}}/g, "500000")
    .replace(/{{taxAmount}}/g, "15000")
    .replace(/{{loginTime}}/g, new Date().toLocaleString())
    .replace(/{{location}}/g, "Mumbai, India")
    .replace(/{{device}}/g, "Chrome on Windows")
    .replace(/{{securityUrl}}/g, "#");
  
  res.json({
    success: true,
    subject: template.subject,
    html: preview
  });
});

function getTemplateDescription(id: string): string {
  const descriptions: Record<string, string> = {
    welcome: "Sent when a new user registers",
    passwordReset: "Sent when user requests password reset",
    taxFiled: "Sent after successful ITR filing",
    twoFactorEnabled: "Sent when 2FA is enabled",
    loginAlert: "Sent for suspicious login attempts"
  };
  return descriptions[id] || "";
}

export default router;