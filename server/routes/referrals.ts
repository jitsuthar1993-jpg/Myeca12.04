import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { z } from "zod";
import { sendReferralInvitation, sendReferralReminder } from "../services/referral-email.js";
import { adminDb } from "../data-admin.js";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import QRCode from "qrcode";
import crypto from "crypto";
import { calculateReferralAccountCredit } from "../../shared/referral-economics.js";
import { normalizeReferralCode } from "../../shared/campaign-attribution.js";

const router = Router();

// Referral schemas
const createReferralSchema = z.object({
  refereeEmail: z.string().email(),
  refereeName: z.string().min(1).max(100),
  message: z.string().optional(),
  serviceType: z.enum(["itr_filing", "gst_registration", "company_registration", "all_services"]).optional()
});

const generateReferralLinkSchema = z.object({
  serviceType: z.enum(["itr_filing", "gst_registration", "company_registration", "all_services"]).optional().default("all_services"),
}).strict();

const linkReferralServiceSchema = z.object({
  referralCode: z.string().trim().min(1).max(120).optional(),
  userServiceId: z.string().trim().min(1).max(160),
}).strict();

// Local development in-memory storage. Production uses the persistent adminDb collections.
const referrals = new Map<number, any>();
const rewards = new Map<number, any>();
const usePersistentStore = process.env.NODE_ENV === "production";
const referralBackendStatus = usePersistentStore ? "mixed" : "demo";

function withBackendStatus<T extends Record<string, unknown>>(payload: T) {
  return {
    backendStatus: referralBackendStatus,
    ...payload
  };
}

function getUserId(req: Request) {
  return String((req as any).user?.id || "");
}

function getDefaultStats(userId: string) {
  return {
    userId,
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalRewards: 0,
    availableRewards: 0,
    redeemedRewards: 0
  };
}

function toTime(value: unknown) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function createRecordId(prefix: string) {
  return usePersistentStore ? `${prefix}_${crypto.randomUUID()}` : undefined;
}

async function getAllReferrals() {
  if (!usePersistentStore) return Array.from(referrals.values());
  const snapshot = await adminDb.collection("referrals").get();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((referral: any) => referral.referrerId || referral.recordType === "referral");
}

async function getUserReferrals(userId: string, status?: unknown, limit = 50) {
  const source = usePersistentStore
    ? (await adminDb.collection("referrals").where("referrerId", "==", userId).get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    : Array.from(referrals.values()).filter((referral) => String(referral.referrerId) === userId);

  const filtered = status ? source.filter((referral) => referral.status === status) : source;
  return filtered
    .sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt))
    .slice(0, Math.max(1, limit));
}

async function findExistingReferral(userId: string, refereeEmail: string) {
  const normalizedEmail = refereeEmail.trim().toLowerCase();
  const userReferrals = await getUserReferrals(userId, undefined, 1000);
  return userReferrals.find((referral) => String(referral.refereeEmail || "").toLowerCase() === normalizedEmail);
}

async function findReferralByCode(referralCode: string) {
  if (!usePersistentStore) {
    const entry = Array.from(referrals.entries()).find(([, referral]) => referral.referralCode === referralCode);
    return entry ? { key: entry[0], referral: entry[1] } : null;
  }

  const snapshot = await adminDb.collection("referrals").where("referralCode", "==", referralCode).get();
  const doc = snapshot.docs[0];
  return doc ? { key: doc.id, referral: { id: doc.id, ...doc.data() } } : null;
}

async function findReferralByLinkedServiceId(userServiceId: string) {
  if (!usePersistentStore) {
    const entry = Array.from(referrals.entries()).find(([, referral]) => referral.linkedUserServiceId === userServiceId);
    return entry ? { key: entry[0], referral: entry[1] } : null;
  }

  const snapshot = await adminDb.collection("referrals").where("linkedUserServiceId", "==", userServiceId).get();
  const doc = snapshot.docs[0];
  return doc ? { key: doc.id, referral: { id: doc.id, ...doc.data() } } : null;
}

async function getReferralById(referralId: string) {
  if (!usePersistentStore) {
    const numericId = Number(referralId);
    const referral = referrals.get(numericId);
    return referral ? { key: numericId, referral } : null;
  }

  const doc = await adminDb.collection("referrals").doc(referralId).get();
  return doc.exists ? { key: doc.id, referral: { id: doc.id, ...doc.data() } } : null;
}

async function saveReferral(referral: any) {
  if (!usePersistentStore) {
    referrals.set(Number(referral.id), referral);
    return referral;
  }

  await adminDb.collection("referrals").doc(String(referral.id)).set({ recordType: "referral", ...referral });
  return referral;
}

async function getUserRewards(userId: string, status?: unknown) {
  const source = usePersistentStore
    ? (await adminDb.collection("referrals").where("recordType", "==", "referral_reward").where("userId", "==", userId).get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    : Array.from(rewards.values()).filter((reward) => String(reward.userId) === userId);

  const filtered = status && status !== "all" ? source.filter((reward) => reward.status === status) : source;
  return filtered.sort((a, b) => toTime(b.earnedAt) - toTime(a.earnedAt));
}

async function getRewardById(rewardId: string) {
  if (!usePersistentStore) {
    const numericId = Number(rewardId);
    const reward = rewards.get(numericId);
    return reward ? { key: numericId, reward } : null;
  }

  const doc = await adminDb.collection("referrals").doc(rewardId).get();
  return doc.exists ? { key: doc.id, reward: { id: doc.id, ...doc.data() } } : null;
}

async function saveReward(reward: any) {
  if (!usePersistentStore) {
    rewards.set(Number(reward.id), reward);
    return reward;
  }

  await adminDb.collection("referrals").doc(String(reward.id)).set({ recordType: "referral_reward", ...reward });
  return reward;
}

async function getStatsForUser(userId: string) {
  const [userReferrals, userRewards] = await Promise.all([
    getUserReferrals(userId, undefined, 1000),
    getUserRewards(userId)
  ]);
  const stats = getDefaultStats(userId);
  stats.totalReferrals = userReferrals.length;
  stats.successfulReferrals = userReferrals.filter((referral) => referral.status === "converted").length;
  stats.pendingReferrals = userReferrals.filter((referral) => referral.status === "pending").length;
  stats.totalRewards = userRewards.reduce((sum, reward) => sum + Number(reward.amount || 0), 0);
  stats.availableRewards = userRewards
    .filter((reward) => reward.status === "available")
    .reduce((sum, reward) => sum + Number(reward.amount || 0), 0);
  stats.redeemedRewards = userRewards
    .filter((reward) => reward.status === "redeemed")
    .reduce((sum, reward) => sum + Number(reward.amount || 0), 0);
  return stats;
}

function getAppBaseUrl() {
  const url =
    process.env.APP_URL ||
    process.env.VITE_APP_URL ||
    (process.env.NODE_ENV === "production" ? "https://myeca.in" : "http://localhost:5000");

  return url.replace(/\/+$/, "");
}

// Get referral program overview
router.get("/overview", authenticateToken, (req: Request, res: Response) => {
  const programDetails = {
    programName: "MyeCA Referral Rewards",
    description: "Earn post-completion account credit by referring clients to our tax and compliance services",
    benefits: [
      {
        service: "ITR Filing",
        referrerReward: "Account credit capped at 10% of net collected revenue",
        refereeDiscount: "No discount stacking"
      },
      {
        service: "GST Registration",
        referrerReward: "Account credit capped at 10% of net collected revenue",
        refereeDiscount: "No discount stacking"
      },
      {
        service: "Company Registration",
        referrerReward: "Account credit capped at 10% of net collected revenue",
        refereeDiscount: "No discount stacking"
      },
      {
        service: "Business Consultation",
        referrerReward: "Account credit capped at 10% of net collected revenue",
        refereeDiscount: "No discount stacking"
      }
    ],
    terms: [
      "Account credit is created only after payment and successful service completion are verified",
      "Account credit is capped at 10% of net collected revenue and is not a cash payout",
      "Referral codes are valid for 90 days from generation",
      "Maximum 10 referrals per month per user",
      "Account credit cannot be stacked with another discount and expires after 90 days if unused",
      "Self-referrals are not allowed"
    ],
    howItWorks: [
      "Generate your unique referral code",
      "Share the code with friends and clients",
      "They use your code when booking services",
      "Account credit is created only after the referred service is completed",
      "Track account credit in the dashboard"
    ]
  };
  
  res.json(withBackendStatus({
    success: true,
    program: programDetails
  }));
});

// Get user referral stats
router.get("/stats", authenticateToken, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const stats = await getStatsForUser(userId);

  res.json(withBackendStatus({
    success: true,
    stats
  }));
});

// Get user's referrals
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { status, limit = 50 } = req.query;
  const userReferrals = await getUserReferrals(userId, status, parseInt(String(limit), 10) || 50);

  res.json(withBackendStatus({
    success: true,
    referrals: userReferrals,
    total: userReferrals.length
  }));
});

// Create new referral
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const referralData = createReferralSchema.parse(req.body);
    const currentUserEmail = String((req as any).user?.email || "").trim().toLowerCase();
    if (currentUserEmail && referralData.refereeEmail.trim().toLowerCase() === currentUserEmail) {
      return res.status(400).json({ error: "You cannot refer your own email address" });
    }
    
    // Check if email already referred by this user
    const existingReferral = await findExistingReferral(userId, referralData.refereeEmail);
    
    if (existingReferral) {
      return res.status(400).json({ 
        error: "You have already referred this email address" 
      });
    }
    
    // Generate unique referral code
    const referralCode = `REF-MYECA-${String(Date.now()).slice(-6)}`;
    
    const referralId = createRecordId("ref") || referrals.size + 1;
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
    
    await saveReferral(referral);
    
    // Send referral invitation emails
    try {
      const user = (req as any).user;
      const userName = user.firstName || user.email;
      const userEmail = user.email;
      
      // Generate referral link
      const baseUrl = getAppBaseUrl();
      const referralLink = `${baseUrl}/auth/register?ref=${referralCode}&service=${referralData.serviceType || 'all_services'}`;
      
      // Get discount based on service type
      await sendReferralInvitation({
        referrerName: userName,
        referrerEmail: userEmail,
        refereeName: referralData.refereeName,
        refereeEmail: referralData.refereeEmail,
        referralCode,
        referralLink,
        serviceType: referralData.serviceType || 'all_services',
        message: referralData.message,
        benefitTerms: "The referrer may receive post-completion account credit capped at 10% of net collected revenue; no discount stacking",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });
    } catch (emailError) {
      console.error("Failed to send referral email:", emailError);
      // Continue even if email fails
    }
    
    res.json(withBackendStatus({
      success: true,
      referral,
      message: "Referral created successfully. Share your referral code with the client."
    }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Failed to create referral" });
  }
});

// Get user's rewards
router.get("/rewards", authenticateToken, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { status = "all" } = req.query;
  const userRewards = await getUserRewards(userId, status);

  res.json(withBackendStatus({
    success: true,
    rewards: userRewards,
    total: userRewards.length
  }));
});

// Redeem reward
router.post("/rewards/:rewardId/redeem", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const rewardId = req.params.rewardId;
    const rewardRecord = await getRewardById(rewardId);
    const reward = rewardRecord?.reward;
    
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
    await saveReward(reward);
    
    res.json(withBackendStatus({
      success: true,
      reward,
      message: `Reward of Rs ${reward.amount} has been redeemed successfully`
    }));
  } catch (error) {
    res.status(500).json({ error: "Failed to redeem reward" });
  }
});

// Generate referral link
router.post("/generate-link", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { serviceType } = generateReferralLinkSchema.parse(req.body);
    const referralCode = `REF-${userId}-${Date.now().toString(36).toUpperCase()}`;
    const baseUrl = getAppBaseUrl();
    const referralLink = `${baseUrl}/auth/register?ref=${referralCode}&service=${serviceType}`;
    const referralId = createRecordId("ref") || referrals.size + 1;

    await saveReferral({
      id: referralId,
      referrerId: userId,
      refereeEmail: null,
      refereeName: null,
      serviceType,
      referralCode,
      status: "pending",
      source: "shared_referral_link",
      createdAt: new Date(),
      rewardEarned: null,
      conversionDate: null,
    });

    let qrCode: string | null = null;
    let qrCodeAvailable = true;
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
      qrCodeAvailable = false;
    }

    res.json(withBackendStatus({
      success: true,
      referralCode,
      referralLink,
      qrCode,
      qrCodeAvailable
    }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid referral link details" });
    }
    res.status(500).json({ error: "Failed to generate referral link" });
  }
});

// Leaderboard
router.get("/leaderboard", authenticateToken, async (req: Request, res: Response) => {
  const { period = "month", limit = 10 } = req.query;
  const statsByUser = new Map<string, { userId: string; successfulReferrals: number; totalRewards: number }>();
  const allReferrals = await getAllReferrals();

  allReferrals.forEach((referral) => {
    const userId = String(referral.referrerId || "");
    if (!userId) return;
    const current = statsByUser.get(userId) || { userId, successfulReferrals: 0, totalRewards: 0 };
    if (referral.status === "converted") {
      current.successfulReferrals += 1;
      current.totalRewards += Number(referral.rewardEarned || 0);
    }
    statsByUser.set(userId, current);
  });

  const leaderboard = Array.from(statsByUser.values())
    .sort((a, b) => (b.successfulReferrals || 0) - (a.successfulReferrals || 0))
    .slice(0, parseInt(String(limit), 10) || 10)
    .map((stats, index) => ({
      rank: index + 1,
      userId: stats.userId,
      userName: `Referrer ${stats.userId}`,
      successfulReferrals: stats.successfulReferrals || 0,
      totalRewards: stats.totalRewards || 0,
      avatar: null
    }));
  
  res.json(withBackendStatus({
    success: true,
    leaderboard,
    period
  }));
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
            const existingReferral = await findExistingReferral(String(userId), row.email);
            
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
            
            const referralId = createRecordId("ref") || referrals.size + 1;
            const referral = {
              id: referralId,
              referrerId: String(userId),
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
            
            await saveReferral(referral);
            imported.push(referral);

            // Send email if requested
            if (req.body.sendEmails === 'true') {
              const baseUrl = getAppBaseUrl();
              const referralLink = `${baseUrl}/auth/register?ref=${referralCode}&service=${serviceType}`;
              
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
                  benefitTerms: "The referrer may receive post-completion account credit capped at 10% of net collected revenue; no discount stacking",
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

        res.json(withBackendStatus({
          success: true,
          summary: {
            total: results.length,
            imported: imported.length,
            failed: errors.length
          },
          imported,
          errors
        }));
      })
      .on('error', (error) => {
        res.status(500).json({ error: "Failed to parse CSV file" });
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to process bulk import" });
  }
});

// Get referral analytics
router.get("/analytics", authenticateToken, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const userReferrals = await getUserReferrals(userId, undefined, 1000);
  
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
  
  res.json(withBackendStatus({
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
  }));
});

// Link referral to service purchase
router.post("/link-service", authenticateToken, async (req: Request, res: Response) => {
  try {
    const data = linkReferralServiceSchema.parse(req.body);
    const userId = getUserId(req);
    const currentUserEmail = String((req as any).user?.email || "").trim().toLowerCase();

    const serviceDoc = await adminDb.collection("user_services").doc(data.userServiceId).get();
    const service = serviceDoc.exists ? serviceDoc.data() as Record<string, any> : null;
    if (!service || String(service.userId || "") !== userId) {
      return res.status(404).json({ error: "Completed paid service not found" });
    }
    if (service.status !== "completed" || service.paymentStatus !== "paid") {
      return res.status(400).json({ error: "Referral credit is available only after a paid service is completed." });
    }

    const referralCode = normalizeReferralCode(
      data.referralCode ?? service.metadata?.attribution?.referralCode ?? service.attribution?.referralCode,
    );
    if (!referralCode) {
      return res.status(400).json({ error: "A persisted referral code is required for this service." });
    }

    const referralRecord = await findReferralByCode(referralCode);
    const foundReferral = referralRecord?.referral;
    const referralId = referralRecord?.key;
    if (!foundReferral || foundReferral.status !== "pending") {
      return res.status(404).json({ error: "Valid referral not found" });
    }
    if (String(foundReferral.referrerId || "") === userId) {
      return res.status(400).json({ error: "A referrer cannot convert their own referral." });
    }
    const invitedEmail = String(foundReferral.refereeEmail || "").trim().toLowerCase();
    if (invitedEmail && currentUserEmail && invitedEmail !== currentUserEmail) {
      return res.status(404).json({ error: "Valid referral not found" });
    }

    const existingServiceLink = await findReferralByLinkedServiceId(data.userServiceId);
    if (existingServiceLink) {
      return res.status(409).json({ error: "This service is already linked to a referral." });
    }

    const netCollectedRevenue = Number(service.netCollectedRevenue);
    const hasStackedDiscount = service.hasStackedDiscount === true;
    if (!Number.isFinite(netCollectedRevenue) || netCollectedRevenue <= 0) {
      return res.status(400).json({ error: "Net collected revenue must be recorded before referral credit is created." });
    }
    
    const rewardAmount = calculateReferralAccountCredit({
      netCollectedRevenue,
      serviceCompleted: true,
      hasStackedDiscount,
    });
    if (!rewardAmount) {
      return res.status(400).json({ error: "This completed service does not qualify for referral credit." });
    }
    
    // Update referral status
    foundReferral.status = "converted";
    foundReferral.conversionDate = new Date();
    foundReferral.rewardEarned = rewardAmount;
    foundReferral.linkedUserServiceId = data.userServiceId;
    foundReferral.netCollectedRevenue = netCollectedRevenue;
    if (!foundReferral.refereeEmail && currentUserEmail) foundReferral.refereeEmail = currentUserEmail;
    if (!foundReferral.refereeName && currentUserEmail) foundReferral.refereeName = currentUserEmail;
    await saveReferral(foundReferral);
    
    // Create reward for referrer
    const rewardId = createRecordId("reward") || rewards.size + 1;
    const newReward = {
      id: rewardId,
      userId: foundReferral.referrerId,
      referralId,
      userServiceId: data.userServiceId,
      type: "account_credit",
      amount: rewardAmount,
      description: `Post-completion referral account credit for ${foundReferral.refereeName}`,
      status: "available",
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      earnedAt: new Date()
    };
    await saveReward(newReward);
    
    // Conversion notification needs a persisted referrer profile/email lookup before sending.
    
    res.json(withBackendStatus({
      success: true,
      message: "Referral linked to service successfully",
      reward: newReward
    }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid referral conversion details" });
    }
    res.status(500).json({ error: "Failed to link referral to service" });
  }
});

// Send reminder email
router.post("/:referralId/send-reminder", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const referralRecord = await getReferralById(req.params.referralId);
    const referral = referralRecord?.referral;
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
    const referralLink = `${baseUrl}/auth/register?ref=${referral.referralCode}&service=${referral.serviceType}`;
    
    await sendReferralReminder({
      referrerName: userName,
      referrerEmail: userEmail,
      refereeName: referral.refereeName,
      refereeEmail: referral.refereeEmail,
      referralCode: referral.referralCode,
      referralLink,
      serviceType: referral.serviceType,
      message: referral.message || '',
      benefitTerms: "The referrer may receive post-completion account credit capped at 10% of net collected revenue; no discount stacking",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    res.json(withBackendStatus({
      success: true,
      message: "Reminder email sent successfully"
    }));
  } catch (error) {
    res.status(500).json({ error: "Failed to send reminder email" });
  }
});

export default router;
