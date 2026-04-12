import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { z } from "zod";
import { sendReferralInvitation, sendReferralReminder, sendReferralConversionNotification } from "../services/referral-email.js";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import QRCode from "qrcode";

const router = Router();

// Referral schemas
const createReferralSchema = z.object({
  refereeEmail: z.string().email(),
  refereeName: z.string().min(1).max(100),
  message: z.string().optional(),
  serviceType: z.enum(["itr_filing", "gst_registration", "company_registration", "all_services"]).optional()
});

const redeemRewardSchema = z.object({
  rewardId: z.number(),
  type: z.enum(["discount", "cashback", "service_credit"])
});

// Mock storage
const referrals = new Map<number, any>();
const rewards = new Map<number, any>();
const referralStats = new Map<number, any>();

function getAppBaseUrl() {
  const url =
    process.env.APP_URL ||
    process.env.VITE_APP_URL ||
    (process.env.NODE_ENV === "production" ? "https://myeca.in" : "http://localhost:5000");

  return url.replace(/\/+$/, "");
}

// Initialize demo data
referrals.set(1, {
  id: 1,
  referrerId: 1,
  refereeEmail: "client1@example.com",
  refereeName: "John Client",
  referralCode: "REF-MYECA-001",
  status: "pending",
  serviceType: "itr_filing",
  createdAt: new Date("2025-01-20"),
  rewardEarned: null,
  conversionDate: null
});

referrals.set(2, {
  id: 2,
  referrerId: 1,
  refereeEmail: "client2@example.com",
  refereeName: "Jane Business",
  referralCode: "REF-MYECA-002",
  status: "converted",
  serviceType: "gst_registration",
  createdAt: new Date("2025-01-15"),
  rewardEarned: 500,
  conversionDate: new Date("2025-01-18")
});

rewards.set(1, {
  id: 1,
  userId: 1,
  type: "cashback",
  amount: 500,
  description: "Referral reward for Jane Business conversion",
  status: "available",
  expiryDate: new Date("2025-04-18"),
  earnedAt: new Date("2025-01-18")
});

referralStats.set(1, {
  userId: 1,
  totalReferrals: 5,
  successfulReferrals: 3,
  pendingReferrals: 2,
  totalRewards: 1500,
  availableRewards: 800,
  redeemedRewards: 700
});

// Get referral program overview
router.get("/overview", authenticateToken, (req: Request, res: Response) => {
  const programDetails = {
    programName: "MyeCA Referral Rewards",
    description: "Earn rewards by referring clients to our tax and compliance services",
    benefits: [
      {
        service: "ITR Filing",
        referrerReward: "₹300 cashback",
        refereeDiscount: "15% off first filing"
      },
      {
        service: "GST Registration",
        referrerReward: "₹500 cashback",
        refereeDiscount: "₹1000 discount"
      },
      {
        service: "Company Registration",
        referrerReward: "₹1000 cashback",
        refereeDiscount: "₹2000 discount"
      },
      {
        service: "Business Consultation",
        referrerReward: "₹800 cashback",
        refereeDiscount: "First consultation free"
      }
    ],
    terms: [
      "Rewards are credited within 7 days of successful service completion",
      "Referral codes are valid for 90 days from generation",
      "Maximum 10 referrals per month per user",
      "Rewards expire after 6 months if not redeemed",
      "Self-referrals are not allowed"
    ],
    howItWorks: [
      "Generate your unique referral code",
      "Share the code with friends and clients",
      "They use your code when booking services",
      "Both you and your referral get rewards",
      "Track your earnings in the dashboard"
    ]
  };
  
  res.json({
    success: true,
    program: programDetails
  });
});

// Get user referral stats
router.get("/stats", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const stats = referralStats.get(userId) || {
    userId,
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalRewards: 0,
    availableRewards: 0,
    redeemedRewards: 0
  };
  
  res.json({
    success: true,
    stats
  });
});

// Get user's referrals
router.get("/", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { status, limit = 50 } = req.query;
  
  let userReferrals: any[] = [];
  referrals.forEach(referral => {
    if (referral.referrerId === userId) {
      userReferrals.push(referral);
    }
  });
  
  // Filter by status if provided
  if (status) {
    userReferrals = userReferrals.filter(r => r.status === status);
  }
  
  // Sort by creation date (newest first)
  userReferrals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Limit results
  userReferrals = userReferrals.slice(0, parseInt(limit as string));
  
  res.json({
    success: true,
    referrals: userReferrals,
    total: userReferrals.length
  });
});

// Create new referral
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const referralData = createReferralSchema.parse(req.body);
    
    // Check if email already referred by this user
    const existingReferral = Array.from(referrals.values()).find(r => 
      r.referrerId === userId && r.refereeEmail === referralData.refereeEmail
    );
    
    if (existingReferral) {
      return res.status(400).json({ 
        error: "You have already referred this email address" 
      });
    }
    
    // Generate unique referral code
    const referralCode = `REF-MYECA-${String(Date.now()).slice(-6)}`;
    
    const referralId = referrals.size + 1;
    const referral = {
      id: referralId,
      referrerId: userId,
      ...referralData,
      referralCode,
      status: "pending",
      createdAt: new Date(),
      rewardEarned: null,
      conversionDate: null
    };
    
    referrals.set(referralId, referral);
    
    // Update user stats
    const stats = referralStats.get(userId) || {
      userId,
      totalReferrals: 0,
      successfulReferrals: 0,
      pendingReferrals: 0,
      totalRewards: 0,
      availableRewards: 0,
      redeemedRewards: 0
    };
    
    stats.totalReferrals++;
    stats.pendingReferrals++;
    referralStats.set(userId, stats);
    
    // Send referral invitation emails
    try {
      const user = (req as any).user;
      const userName = user.firstName || user.email;
      const userEmail = user.email;
      
      // Generate referral link
      const baseUrl = getAppBaseUrl();
      const referralLink = `${baseUrl}/signup?ref=${referralCode}&service=${referralData.serviceType || 'all_services'}`;
      
      // Get discount based on service type
      const discounts: Record<string, string> = {
        itr_filing: "₹200 OFF",
        gst_registration: "₹500 OFF",
        company_registration: "₹1000 OFF",
        all_services: "Up to ₹1000 OFF"
      };
      
      await sendReferralInvitation({
        referrerName: userName,
        referrerEmail: userEmail,
        refereeName: referralData.refereeName,
        refereeEmail: referralData.refereeEmail,
        referralCode,
        referralLink,
        serviceType: referralData.serviceType || 'all_services',
        message: referralData.message,
        discount: discounts[referralData.serviceType || 'all_services'] || "Special Discount",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });
    } catch (emailError) {
      console.error("Failed to send referral email:", emailError);
      // Continue even if email fails
    }
    
    res.json({
      success: true,
      referral,
      message: "Referral created successfully. Share your referral code with the client."
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Failed to create referral" });
  }
});

// Get user's rewards
router.get("/rewards", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { status = "all" } = req.query;
  
  let userRewards: any[] = [];
  rewards.forEach(reward => {
    if (reward.userId === userId) {
      userRewards.push(reward);
    }
  });
  
  // Filter by status
  if (status !== "all") {
    userRewards = userRewards.filter(r => r.status === status);
  }
  
  // Sort by earned date (newest first)
  userRewards.sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
  
  res.json({
    success: true,
    rewards: userRewards,
    total: userRewards.length
  });
});

// Redeem reward
router.post("/rewards/:rewardId/redeem", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const rewardId = parseInt(req.params.rewardId);
    
    const reward = rewards.get(rewardId);
    
    if (!reward || reward.userId !== userId) {
      return res.status(404).json({ error: "Reward not found" });
    }
    
    if (reward.status !== "available") {
      return res.status(400).json({ error: "Reward is not available for redemption" });
    }
    
    // Check if reward is expired
    if (new Date() > new Date(reward.expiryDate)) {
      return res.status(400).json({ error: "Reward has expired" });
    }
    
    // Mark reward as redeemed
    reward.status = "redeemed";
    reward.redeemedAt = new Date();
    rewards.set(rewardId, reward);
    
    // Update user stats
    const stats = referralStats.get(userId);
    if (stats) {
      stats.availableRewards -= reward.amount;
      stats.redeemedRewards += reward.amount;
      referralStats.set(userId, stats);
    }
    
    res.json({
      success: true,
      reward,
      message: `Reward of ₹${reward.amount} has been redeemed successfully`
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to redeem reward" });
  }
});

// Generate referral link
router.post("/generate-link", authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { serviceType = "all_services" } = req.body;
  
  const referralCode = `REF-${userId}-${Date.now().toString(36).toUpperCase()}`;
  const baseUrl = getAppBaseUrl();
  
  const referralLink = `${baseUrl}/signup?ref=${referralCode}&service=${serviceType}`;
  
  // Generate actual QR code
  let qrCode = "";
  try {
    qrCode = await QRCode.toDataURL(referralLink, {
      width: 200,
      margin: 2,
      color: {
        dark: '#3b82f6',
        light: '#ffffff'
      }
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    // Fallback to placeholder
    qrCode = `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
          QR Code for: ${referralCode}
        </text>
      </svg>
    `).toString('base64')}`;
  }
  
  res.json({
    success: true,
    referralCode,
    referralLink,
    qrCode
  });
});

// Leaderboard
router.get("/leaderboard", authenticateToken, (req: Request, res: Response) => {
  const { period = "month", limit = 10 } = req.query;
  
  // Mock leaderboard data
  const leaderboard = [
    {
      rank: 1,
      userId: 1,
      userName: "Admin User",
      successfulReferrals: 15,
      totalRewards: 7500,
      avatar: null
    },
    {
      rank: 2,
      userId: 2,
      userName: "CA Expert",
      successfulReferrals: 12,
      totalRewards: 6000,
      avatar: null
    },
    {
      rank: 3,
      userId: 3,
      userName: "Tax Consultant",
      successfulReferrals: 8,
      totalRewards: 4000,
      avatar: null
    }
  ];
  
  res.json({
    success: true,
    leaderboard: leaderboard.slice(0, parseInt(limit as string)),
    period
  });
});

// Referral analytics
router.get("/analytics", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  const analytics = {
    monthlyTrends: [
      { month: "Jan 2025", referrals: 5, conversions: 3, rewards: 1500 },
      { month: "Dec 2024", referrals: 3, conversions: 2, rewards: 1000 },
      { month: "Nov 2024", referrals: 4, conversions: 3, rewards: 1200 }
    ],
    serviceBreakdown: [
      { service: "ITR Filing", referrals: 6, conversionRate: 80 },
      { service: "GST Registration", referrals: 4, conversionRate: 75 },
      { service: "Company Registration", referrals: 2, conversionRate: 100 }
    ],
    conversionFunnel: {
      invitesSent: 12,
      signups: 8,
      serviceBookings: 6,
      conversionRate: 50
    }
  };
  
  res.json({
    success: true,
    analytics
  });
});

// Configure multer for CSV file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Bulk import referrals from CSV
router.post("/bulk-import", authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = (req as any).user.id;
    const user = (req as any).user;
    const userName = user.firstName || user.email;
    const userEmail = user.email;
    
    const results: any[] = [];
    const errors: any[] = [];
    const imported: any[] = [];
    
    // Parse CSV from buffer
    const stream = Readable.from(req.file.buffer);
    
    stream
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        // Process each row
        for (const row of results) {
          try {
            // Validate required fields
            if (!row.email || !row.name) {
              errors.push({
                row: results.indexOf(row) + 1,
                error: "Missing required fields: email and name",
                data: row
              });
              continue;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email)) {
              errors.push({
                row: results.indexOf(row) + 1,
                error: "Invalid email format",
                data: row
              });
              continue;
            }

            // Check if already referred
            const existingReferral = Array.from(referrals.values()).find(r => 
              r.referrerId === userId && r.refereeEmail === row.email
            );
            
            if (existingReferral) {
              errors.push({
                row: results.indexOf(row) + 1,
                error: "Email already referred",
                data: row
              });
              continue;
            }

            // Create referral
            const referralCode = `REF-MYECA-${String(Date.now()).slice(-6)}-${imported.length}`;
            const serviceType = row.service || 'all_services';
            
            const referralId = referrals.size + 1;
            const referral = {
              id: referralId,
              referrerId: userId,
              refereeEmail: row.email,
              refereeName: row.name,
              referralCode,
              message: row.message || '',
              serviceType,
              status: "pending",
              createdAt: new Date(),
              rewardEarned: null,
              conversionDate: null
            };
            
            referrals.set(referralId, referral);
            imported.push(referral);

            // Send email if requested
            if (req.body.sendEmails === 'true') {
              const baseUrl = getAppBaseUrl();
              const referralLink = `${baseUrl}/signup?ref=${referralCode}&service=${serviceType}`;
              
              const discounts: Record<string, string> = {
                itr_filing: "₹200 OFF",
                gst_registration: "₹500 OFF",
                company_registration: "₹1000 OFF",
                all_services: "Up to ₹1000 OFF"
              };
              
              try {
                await sendReferralInvitation({
                  referrerName: userName,
                  referrerEmail: userEmail,
                  refereeName: row.name,
                  refereeEmail: row.email,
                  referralCode,
                  referralLink,
                  serviceType,
                  message: row.message || '',
                  discount: discounts[serviceType] || "Special Discount",
                  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                });
              } catch (emailError) {
                console.error(`Failed to send email to ${row.email}:`, emailError);
              }
            }
          } catch (error) {
            errors.push({
              row: results.indexOf(row) + 1,
              error: "Processing error",
              data: row
            });
          }
        }

        // Update user stats
        const stats = referralStats.get(userId) || {
          userId,
          totalReferrals: 0,
          successfulReferrals: 0,
          pendingReferrals: 0,
          totalRewards: 0,
          availableRewards: 0,
          redeemedRewards: 0
        };
        
        stats.totalReferrals += imported.length;
        stats.pendingReferrals += imported.length;
        referralStats.set(userId, stats);

        res.json({
          success: true,
          summary: {
            total: results.length,
            imported: imported.length,
            failed: errors.length
          },
          imported,
          errors
        });
      })
      .on('error', (error) => {
        res.status(500).json({ error: "Failed to parse CSV file" });
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to process bulk import" });
  }
});

// Get referral analytics
router.get("/analytics", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  // Get user's referrals
  const userReferrals = Array.from(referrals.values()).filter(r => r.referrerId === userId);
  
  // Calculate conversion funnel
  const total = userReferrals.length;
  const pending = userReferrals.filter(r => r.status === "pending").length;
  const converted = userReferrals.filter(r => r.status === "converted").length;
  const expired = userReferrals.filter(r => r.status === "expired").length;
  
  // Calculate by service type
  const byService: Record<string, any> = {};
  userReferrals.forEach(r => {
    if (!byService[r.serviceType]) {
      byService[r.serviceType] = {
        total: 0,
        converted: 0,
        pending: 0,
        expired: 0,
        revenue: 0
      };
    }
    byService[r.serviceType].total++;
    byService[r.serviceType][r.status]++;
    if (r.rewardEarned) {
      byService[r.serviceType].revenue += r.rewardEarned;
    }
  });
  
  // Calculate monthly trends
  const monthlyTrends: Record<string, any> = {};
  userReferrals.forEach(r => {
    const month = new Date(r.createdAt).toISOString().slice(0, 7);
    if (!monthlyTrends[month]) {
      monthlyTrends[month] = {
        referrals: 0,
        conversions: 0,
        revenue: 0
      };
    }
    monthlyTrends[month].referrals++;
    if (r.status === "converted") {
      monthlyTrends[month].conversions++;
      monthlyTrends[month].revenue += r.rewardEarned || 0;
    }
  });
  
  res.json({
    success: true,
    analytics: {
      conversionFunnel: {
        total,
        pending,
        converted,
        expired,
        conversionRate: total > 0 ? (converted / total) * 100 : 0
      },
      byService,
      monthlyTrends,
      topPerformingServices: Object.entries(byService)
        .sort(([,a], [,b]) => b.revenue - a.revenue)
        .slice(0, 3)
        .map(([service, data]) => ({ service, ...data }))
    }
  });
});

// Link referral to service purchase
router.post("/link-service", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { referralCode, serviceId, purchaseAmount } = req.body;
    
    // Find referral by code
    let foundReferral: any = null;
    let referralId = 0;
    
    referrals.forEach((r, id) => {
      if (r.referralCode === referralCode && r.status === "pending") {
        foundReferral = r;
        referralId = id;
      }
    });
    
    if (!foundReferral) {
      return res.status(404).json({ error: "Valid referral not found" });
    }
    
    // Calculate reward based on service type
    const rewardRates: Record<string, number> = {
      itr_filing: 300,
      gst_registration: 500,
      company_registration: 1000,
      all_services: 300
    };
    
    const rewardAmount = rewardRates[foundReferral.serviceType] || 300;
    
    // Update referral status
    foundReferral.status = "converted";
    foundReferral.conversionDate = new Date();
    foundReferral.rewardEarned = rewardAmount;
    referrals.set(referralId, foundReferral);
    
    // Create reward for referrer
    const rewardId = rewards.size + 1;
    const newReward = {
      id: rewardId,
      userId: foundReferral.referrerId,
      referralId,
      type: "cashback",
      amount: rewardAmount,
      description: `Referral reward for ${foundReferral.refereeName}`,
      status: "available",
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      earnedAt: new Date()
    };
    rewards.set(rewardId, newReward);
    
    // Update referrer stats
    const stats = referralStats.get(foundReferral.referrerId);
    if (stats) {
      stats.pendingReferrals--;
      stats.successfulReferrals++;
      stats.totalRewards += rewardAmount;
      stats.availableRewards += rewardAmount;
      referralStats.set(foundReferral.referrerId, stats);
    }
    
    // Send conversion notification email
    try {
      // Get referrer details
      const referrer = { email: 'user@example.com', firstName: 'User' }; // In real app, fetch from DB
      await sendReferralConversionNotification(
        referrer.email,
        referrer.firstName,
        foundReferral.refereeName,
        rewardAmount,
        foundReferral.serviceType
      );
    } catch (emailError) {
      console.error("Failed to send conversion notification:", emailError);
    }
    
    res.json({
      success: true,
      message: "Referral linked to service successfully",
      reward: newReward
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to link referral to service" });
  }
});

// Send reminder email
router.post("/:referralId/send-reminder", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const referralId = parseInt(req.params.referralId);
    
    const referral = referrals.get(referralId);
    if (!referral || referral.referrerId !== userId) {
      return res.status(404).json({ error: "Referral not found" });
    }
    
    if (referral.status !== "pending") {
      return res.status(400).json({ error: "Can only send reminders for pending referrals" });
    }
    
    const user = (req as any).user;
    const userName = user.firstName || user.email;
    const userEmail = user.email;
    
    const baseUrl = getAppBaseUrl();
    const referralLink = `${baseUrl}/signup?ref=${referral.referralCode}&service=${referral.serviceType}`;
    
    const discounts: Record<string, string> = {
      itr_filing: "₹200 OFF",
      gst_registration: "₹500 OFF",
      company_registration: "₹1000 OFF",
      all_services: "Up to ₹1000 OFF"
    };
    
    await sendReferralReminder({
      referrerName: userName,
      referrerEmail: userEmail,
      refereeName: referral.refereeName,
      refereeEmail: referral.refereeEmail,
      referralCode: referral.referralCode,
      referralLink,
      serviceType: referral.serviceType,
      message: referral.message || '',
      discount: discounts[referral.serviceType] || "Special Discount",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    res.json({
      success: true,
      message: "Reminder email sent successfully"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to send reminder email" });
  }
});

export default router;
