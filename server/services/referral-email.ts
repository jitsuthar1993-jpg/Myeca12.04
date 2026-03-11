import QRCode from "qrcode";

interface ReferralEmailData {
  referrerName: string;
  referrerEmail: string;
  refereeName: string;
  refereeEmail: string;
  referralCode: string;
  referralLink: string;
  serviceType: string;
  message?: string;
  discount: string;
  expiryDate: string;
}

async function generateQRCode(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#3b82f6',
        light: '#ffffff'
      }
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    return '';
  }
}

async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<void> {
  if (process.env.SENDGRID_API_KEY) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM || 'noreply@myeca.in',
      subject,
      html,
      text
    });
  } else {
    // Console log in development
    console.log('📧 Email would be sent:', { to, subject, preview: text?.substring(0, 100) });
  }
}

export async function sendReferralInvitation(data: ReferralEmailData) {
  try {
    const qrCode = await generateQRCode(data.referralLink);
    
    // Send email to referee (the person being referred)
    const refereeEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f8f9fa; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .code-box { background: white; border: 2px dashed #3b82f6; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 24px; font-weight: bold; color: #3b82f6; letter-spacing: 2px; }
          .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .qr-code { text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>You've Been Invited to MyeCA.in!</h1>
          <p>Your trusted friend ${data.referrerName} thinks you'll love our tax services</p>
        </div>
        
        <div class="content">
          <p>Hi ${data.refereeName},</p>
          
          <p>${data.referrerName} has referred you to MyeCA.in, India's premier platform for professional tax filing and business services.</p>
          
          ${data.message ? `<p><strong>Personal message from ${data.referrerName}:</strong><br>"${data.message}"</p>` : ''}
          
          <div class="benefits">
            <h2>🎁 Your Exclusive Benefits:</h2>
            <ul>
              <li><strong>${data.discount} discount</strong> on ${data.serviceType.replace(/_/g, ' ')}</li>
              <li>Expert CA assistance throughout the process</li>
              <li>Maximum refund guarantee</li>
              <li>100% secure and confidential</li>
            </ul>
          </div>
          
          <div class="code-box">
            <p>Use this referral code at checkout:</p>
            <div class="code">${data.referralCode}</div>
            <p style="color: #666; font-size: 14px;">Valid until ${new Date(data.expiryDate).toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.referralLink}" class="button">Start Your Tax Filing</a>
          </div>
          
          <div class="qr-code">
            <p>Or scan this QR code:</p>
            <img src="${qrCode}" alt="QR Code" style="border: 1px solid #ddd; padding: 10px;">
          </div>
        </div>
        
        <div class="footer">
          <p>This referral link is unique to you and expires on ${new Date(data.expiryDate).toLocaleDateString()}.</p>
          <p>© 2025 MyeCA.in - Your Trusted Tax Partner</p>
        </div>
      </body>
      </html>
    `;

    await sendEmail(
      data.refereeEmail,
      `${data.referrerName} has invited you to save on tax filing!`,
      refereeEmailHtml,
      `Hi ${data.refereeName}, ${data.referrerName} has referred you to MyeCA.in. Use code ${data.referralCode} to get ${data.discount} off. Visit: ${data.referralLink}`
    );

    // Send confirmation email to referrer
    const referrerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f8f9fa; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Referral Sent Successfully!</h1>
          <p>Thank you for spreading the word about MyeCA.in</p>
        </div>
        
        <div class="content">
          <p>Hi ${data.referrerName},</p>
          
          <p>Great news! We've sent your referral invitation to ${data.refereeName} (${data.refereeEmail}).</p>
          
          <div class="info-box">
            <h2>📊 Referral Details:</h2>
            <ul>
              <li><strong>Referral Code:</strong> ${data.referralCode}</li>
              <li><strong>Service:</strong> ${data.serviceType.replace(/_/g, ' ')}</li>
              <li><strong>Their Discount:</strong> ${data.discount}</li>
              <li><strong>Your Reward:</strong> Will be credited after successful conversion</li>
              <li><strong>Valid Until:</strong> ${new Date(data.expiryDate).toLocaleDateString()}</li>
            </ul>
          </div>
          
          <p>Track this and all your referrals in your dashboard at any time.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/referrals" style="display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px;">View My Referrals</a>
          </div>
        </div>
        
        <div class="footer">
          <p>Keep referring and earning! There's no limit to how many friends you can refer.</p>
          <p>© 2025 MyeCA.in - Your Trusted Tax Partner</p>
        </div>
      </body>
      </html>
    `;

    await sendEmail(
      data.referrerEmail,
      `Referral sent to ${data.refereeName} - MyeCA.in`,
      referrerEmailHtml,
      `Hi ${data.referrerName}, your referral to ${data.refereeName} has been sent successfully. They can use code ${data.referralCode} to get ${data.discount} off. Track your referrals at: ${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/referrals`
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to send referral emails:", error);
    throw error;
  }
}

export async function sendReferralReminder(data: ReferralEmailData) {
  const reminderHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f8f9fa; }
        .urgency-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Don't Miss Out on Your Tax Savings!</h1>
        <p>Your referral discount is expiring soon</p>
      </div>
      
      <div class="content">
        <p>Hi ${data.refereeName},</p>
        
        <p>Just a friendly reminder that your exclusive referral discount from ${data.referrerName} is still available, but not for long!</p>
        
        <div class="urgency-box">
          <h2>⏰ Time is Running Out!</h2>
          <p><strong>Your ${data.discount} discount expires on ${new Date(data.expiryDate).toLocaleDateString()}</strong></p>
          <p>Use code: <strong style="font-size: 20px; color: #d97706;">${data.referralCode}</strong></p>
        </div>
        
        <p>Don't wait until the last minute to file your taxes. Our expert CAs are ready to help you maximize your refund.</p>
        
        <div style="text-align: center;">
          <a href="${data.referralLink}" class="button">Claim Your Discount Now</a>
        </div>
      </div>
      
      <div class="footer">
        <p>This is a reminder email. Your referral was originally sent by ${data.referrerName}.</p>
        <p>© 2025 MyeCA.in - Your Trusted Tax Partner</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail(
    data.refereeEmail,
    `⏰ Your tax filing discount expires soon - MyeCA.in`,
    reminderHtml,
    `Hi ${data.refereeName}, reminder that your referral discount from ${data.referrerName} expires on ${new Date(data.expiryDate).toLocaleDateString()}. Use code ${data.referralCode} to save ${data.discount}. Visit: ${data.referralLink}`
  );
}

export async function sendReferralConversionNotification(referrerEmail: string, referrerName: string, refereeName: string, rewardAmount: number, serviceType: string) {
  const conversionHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f8f9fa; }
        .reward-box { background: #d1fae5; border: 2px solid #10b981; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .reward-amount { font-size: 36px; font-weight: bold; color: #059669; }
        .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Congratulations! You've Earned a Reward!</h1>
        <p>Your referral was successful</p>
      </div>
      
      <div class="content">
        <p>Hi ${referrerName},</p>
        
        <p>Fantastic news! ${refereeName} has successfully used your referral and completed their ${serviceType.replace(/_/g, ' ')}.</p>
        
        <div class="reward-box">
          <p>You've earned:</p>
          <div class="reward-amount">₹${rewardAmount}</div>
          <p>This reward has been added to your account</p>
        </div>
        
        <p>Your reward is now available in your account and can be redeemed at any time. Keep referring to earn more!</p>
        
        <div style="text-align: center;">
          <a href="${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/referrals" class="button">View My Rewards</a>
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for being a valued member of the MyeCA.in community!</p>
        <p>© 2025 MyeCA.in - Your Trusted Tax Partner</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail(
    referrerEmail,
    `🎉 You've earned ₹${rewardAmount} - Referral successful!`,
    conversionHtml,
    `Hi ${referrerName}, great news! ${refereeName} has successfully used your referral. You've earned ₹${rewardAmount}. View your rewards at: ${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/referrals`
  );
}