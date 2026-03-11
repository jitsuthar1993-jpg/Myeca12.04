// Email service for sending various notification emails
import nodemailer from "nodemailer";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Email templates
export const EMAIL_TEMPLATES = {
  welcome: {
    subject: "Welcome to MyeCA.in - Your Tax Filing Journey Begins!",
    html: (data: { userName: string }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to MyeCA.in!</h1>
        </div>
        <div style="padding: 40px; background-color: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${data.userName}! 👋</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Thank you for joining MyeCA.in - India's most trusted platform for expert tax filing services.
          </p>
          <div style="background-color: white; padding: 30px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">What's Next?</h3>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li>Complete your profile to get personalized tax advice</li>
              <li>Upload your documents for faster processing</li>
              <li>Connect with our expert CAs for assistance</li>
              <li>Track your refund status in real-time</li>
            </ul>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://myeca.in/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="padding: 20px; background-color: #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 5px 0;">© 2025 MyeCA.in. All rights reserved.</p>
          <p style="margin: 5px 0;">Need help? Contact us at support@myeca.in</p>
        </div>
      </div>
    `,
    text: (data: { userName: string }) => `
      Welcome to MyeCA.in!
      
      Hello ${data.userName}!
      
      Thank you for joining MyeCA.in - India's most trusted platform for expert tax filing services.
      
      What's Next?
      - Complete your profile to get personalized tax advice
      - Upload your documents for faster processing
      - Connect with our expert CAs for assistance
      - Track your refund status in real-time
      
      Visit your dashboard: https://myeca.in/dashboard
      
      Need help? Contact us at support@myeca.in
      
      © 2025 MyeCA.in. All rights reserved.
    `
  },
  
  passwordReset: {
    subject: "Reset Your MyeCA.in Password",
    html: (data: { userName: string; resetLink: string }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        <div style="padding: 40px; background-color: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${data.userName},</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this, please ignore this email. The link will expire in 1 hour for security reasons.
          </p>
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="color: #991b1b; font-size: 14px; margin: 0;">
              <strong>Security Tip:</strong> Never share your password with anyone. MyeCA.in staff will never ask for your password.
            </p>
          </div>
        </div>
      </div>
    `,
    text: (data: { userName: string; resetLink: string }) => `
      Password Reset Request
      
      Hello ${data.userName},
      
      We received a request to reset your password. Visit the link below to create a new password:
      
      ${data.resetLink}
      
      If you didn't request this, please ignore this email. The link will expire in 1 hour.
      
      Security Tip: Never share your password with anyone.
    `
  },
  
  taxFilingConfirmation: {
    subject: "ITR Filed Successfully - Acknowledgment Inside",
    html: (data: { userName: string; acknowledgmentNumber: string; filingDate: string; assessmentYear: string }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">ITR Filed Successfully! ✅</h1>
        </div>
        <div style="padding: 40px; background-color: #f9fafb;">
          <h2 style="color: #1f2937;">Congratulations ${data.userName}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your Income Tax Return for AY ${data.assessmentYear} has been successfully filed.
          </p>
          <div style="background-color: white; padding: 30px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
            <h3 style="color: #1f2937; margin-top: 0;">Filing Details</h3>
            <table style="width: 100%; color: #4b5563;">
              <tr>
                <td style="padding: 8px 0;"><strong>Acknowledgment Number:</strong></td>
                <td style="padding: 8px 0; color: #059669; font-weight: bold;">${data.acknowledgmentNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Filing Date:</strong></td>
                <td style="padding: 8px 0;">${data.filingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Assessment Year:</strong></td>
                <td style="padding: 8px 0;">${data.assessmentYear}</td>
              </tr>
            </table>
          </div>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h4 style="color: #1f2937; margin-top: 0;">What Happens Next?</h4>
            <ol style="color: #4b5563; line-height: 1.8; margin: 0;">
              <li>e-Verify your return within 120 days</li>
              <li>Track your refund status on our dashboard</li>
              <li>Keep this acknowledgment for your records</li>
            </ol>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://myeca.in/dashboard" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
              e-Verify Now
            </a>
            <a href="https://myeca.in/track-refund" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Track Refund
            </a>
          </div>
        </div>
      </div>
    `,
    text: (data: { userName: string; acknowledgmentNumber: string; filingDate: string; assessmentYear: string }) => `
      ITR Filed Successfully!
      
      Congratulations ${data.userName}!
      
      Your Income Tax Return for AY ${data.assessmentYear} has been successfully filed.
      
      Filing Details:
      - Acknowledgment Number: ${data.acknowledgmentNumber}
      - Filing Date: ${data.filingDate}
      - Assessment Year: ${data.assessmentYear}
      
      What Happens Next?
      1. e-Verify your return within 120 days
      2. Track your refund status on our dashboard
      3. Keep this acknowledgment for your records
      
      e-Verify Now: https://myeca.in/dashboard
      Track Refund: https://myeca.in/track-refund
    `
  },
  
  refundProcessed: {
    subject: "Great News! Your Tax Refund is Processed",
    html: (data: { userName: string; refundAmount: string; processDate: string }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Refund Processed! 💰</h1>
        </div>
        <div style="padding: 40px; background-color: #f9fafb;">
          <h2 style="color: #1f2937;">Great news, ${data.userName}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your income tax refund has been processed by the Income Tax Department.
          </p>
          <div style="background-color: #d1fae5; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #065f46; font-size: 14px; margin: 0;">Refund Amount</p>
            <h2 style="color: #065f46; font-size: 36px; margin: 10px 0;">${data.refundAmount}</h2>
            <p style="color: #065f46; font-size: 14px; margin: 0;">Processed on ${data.processDate}</p>
          </div>
          <p style="color: #4b5563; font-size: 16px;">
            The amount will be credited to your registered bank account within 5-7 working days.
          </p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-top: 20px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong>Note:</strong> If you don't receive the refund within 7 days, please check with your bank or contact us for assistance.
            </p>
          </div>
        </div>
      </div>
    `,
    text: (data: { userName: string; refundAmount: string; processDate: string }) => `
      Refund Processed!
      
      Great news, ${data.userName}!
      
      Your income tax refund has been processed by the Income Tax Department.
      
      Refund Amount: ${data.refundAmount}
      Processed on: ${data.processDate}
      
      The amount will be credited to your registered bank account within 5-7 working days.
      
      Note: If you don't receive the refund within 7 days, please check with your bank or contact us for assistance.
    `
  },
  
  twoFactorEnabled: {
    subject: "Two-Factor Authentication Enabled Successfully",
    html: (data: { userName: string; enabledAt: string; device?: string }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">2FA Enabled 🔒</h1>
        </div>
        <div style="padding: 40px; background-color: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${data.userName},</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Two-factor authentication has been successfully enabled on your MyeCA.in account.
          </p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #4b5563; margin: 0;"><strong>Enabled at:</strong> ${data.enabledAt}</p>
            ${data.device ? `<p style="color: #4b5563; margin: 10px 0 0 0;"><strong>Device:</strong> ${data.device}</p>` : ''}
          </div>
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 6px; margin-top: 20px;">
            <h4 style="color: #1e40af; margin-top: 0;">Security Tips:</h4>
            <ul style="color: #1e40af; margin: 0;">
              <li>Keep your authenticator app backup codes safe</li>
              <li>Never share your 2FA codes with anyone</li>
              <li>Use 2FA on all your important accounts</li>
            </ul>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            If you didn't enable 2FA, please contact us immediately at security@myeca.in
          </p>
        </div>
      </div>
    `,
    text: (data: { userName: string; enabledAt: string; device?: string }) => `
      2FA Enabled Successfully
      
      Hello ${data.userName},
      
      Two-factor authentication has been successfully enabled on your MyeCA.in account.
      
      Enabled at: ${data.enabledAt}
      ${data.device ? `Device: ${data.device}` : ''}
      
      Security Tips:
      - Keep your authenticator app backup codes safe
      - Never share your 2FA codes with anyone
      - Use 2FA on all your important accounts
      
      If you didn't enable 2FA, please contact us immediately at security@myeca.in
    `
  },
  
  loginAlert: {
    subject: "New Login to Your MyeCA.in Account",
    html: (data: { userName: string; loginTime: string; device: string; location: string; ipAddress: string }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Login Detected</h1>
        </div>
        <div style="padding: 40px; background-color: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${data.userName},</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            We detected a new login to your MyeCA.in account.
          </p>
          <div style="background-color: white; padding: 25px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; margin-top: 0;">Login Details</h3>
            <table style="width: 100%; color: #4b5563;">
              <tr>
                <td style="padding: 8px 0;"><strong>Time:</strong></td>
                <td style="padding: 8px 0;">${data.loginTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Device:</strong></td>
                <td style="padding: 8px 0;">${data.device}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Location:</strong></td>
                <td style="padding: 8px 0;">${data.location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>IP Address:</strong></td>
                <td style="padding: 8px 0;">${data.ipAddress}</td>
              </tr>
            </table>
          </div>
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; margin-top: 20px;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>Was this you?</strong> If you don't recognize this login, please secure your account immediately by changing your password.
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://myeca.in/security" style="background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Secure My Account
            </a>
          </div>
        </div>
      </div>
    `,
    text: (data: { userName: string; loginTime: string; device: string; location: string; ipAddress: string }) => `
      New Login Detected
      
      Hello ${data.userName},
      
      We detected a new login to your MyeCA.in account.
      
      Login Details:
      - Time: ${data.loginTime}
      - Device: ${data.device}
      - Location: ${data.location}
      - IP Address: ${data.ipAddress}
      
      Was this you? If you don't recognize this login, please secure your account immediately by changing your password.
      
      Secure My Account: https://myeca.in/security
    `
  }
};

// Email configuration
const getTransporter = () => {
  // Check if we're using SendGrid
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  
  // Check if we're using SMTP
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // Fallback to console logging in development
  if (process.env.NODE_ENV === 'development') {
    return {
      sendMail: async (options: any) => {
        console.log('📧 Email would be sent:', {
          to: options.to,
          subject: options.subject,
          preview: options.text?.substring(0, 100) + '...'
        });
        return { messageId: 'dev-' + Date.now() };
      }
    };
  }
  
  throw new Error('No email configuration found. Please set up SendGrid or SMTP.');
};

// Send email function
export async function sendEmail(
  template: keyof typeof EMAIL_TEMPLATES,
  data: any
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getTransporter();
    const emailTemplate = EMAIL_TEMPLATES[template];
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@myeca.in',
      to: data.to,
      subject: emailTemplate.subject,
      html: emailTemplate.html(data),
      text: emailTemplate.text ? emailTemplate.text(data) : undefined
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get available email templates
export function getEmailTemplates() {
  return Object.keys(EMAIL_TEMPLATES).map(key => ({
    id: key,
    name: key.replace(/([A-Z])/g, ' $1').trim(),
    subject: EMAIL_TEMPLATES[key as keyof typeof EMAIL_TEMPLATES].subject
  }));
}

// Send bulk emails (for notifications)
export async function sendBulkEmails(
  recipients: string[],
  template: keyof typeof EMAIL_TEMPLATES,
  baseData: any
): Promise<{ sent: number; failed: number; errors: string[] }> {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (const recipient of recipients) {
    const result = await sendEmail(template, { ...baseData, to: recipient });
    if (result.success) {
      sent++;
    } else {
      failed++;
      errors.push(`Failed to send to ${recipient}: ${result.error}`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { sent, failed, errors };
}