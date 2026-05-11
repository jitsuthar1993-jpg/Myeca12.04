import { Router, Response } from "express";
import { z } from "zod";
import { adminDb } from "../data-admin.js";
import { requireAnyAuth, AuthRequest } from "../middleware/auth.js";
import { validateRequest } from "../middleware/security.js";
import { safeError } from "../utils/error-response.js";
import { setCachedUser } from "../utils/user-cache.js";
import { recordBelongsToUser } from "../utils/access-control.js";

const router = Router();
const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phoneNumber: z.string().trim().max(20).optional().nullable(),
});

const createUserServiceSchema = z.object({
  serviceId: z.string().trim().min(1).max(100),
  serviceTitle: z.string().trim().min(1).max(255),
  serviceCategory: z.string().trim().min(1).max(100),
  profileId: z.string().trim().min(1).optional().nullable(),
  paymentAmount: z.union([z.number(), z.string().trim().min(1)]).optional(),
  paymentStatus: z.string().trim().max(50).optional(),
  status: z.string().trim().max(50).optional(),
  assignedCaId: z.string().trim().min(1).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

function normalizeUserService(doc: any) {
  const data = doc.data() as Record<string, any>;
  const metadata = (data.metadata || {}) as Record<string, any>;
  const assignedCa = metadata.assignedCa || {};

  return {
    id: doc.id,
    ...data,
    assignedCaId: data.assignedCaId || metadata.assignedCaId || assignedCa.id || null,
    assignedCaName: data.assignedCaName || metadata.assignedCaName || assignedCa.name || null,
    assignedCaEmail: data.assignedCaEmail || metadata.assignedCaEmail || assignedCa.email || null,
  };
}

router.get("/user/dashboard", requireAnyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found in request" });
    }

    const [returnsSnapshot, docsSnapshot, servicesSnapshot, profilesSnapshot] = await Promise.all([
      adminDb.collection("tax_returns")
        .where("userId", "==", user.id)
        .get(),
      adminDb.collection("documents")
        .where("userId", "==", user.id)
        .where("status", "==", "active")
        .get(),
      adminDb.collection("user_services")
        .where("userId", "==", user.id)
        .get(),
      adminDb.collection("profiles")
        .where("userId", "==", user.id)
        .get(),
    ]);

    const activeServices = servicesSnapshot.docs.map(normalizeUserService);

    const recentActivity = [
      { id: 1, action: "Logged in", timestamp: new Date(), type: "auth" },
      { id: 2, action: "Viewed dashboard", timestamp: new Date(), type: "view" }
    ];

    const userReturns = returnsSnapshot.docs.slice(0, 5).map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      stats: {
        totalReturns: returnsSnapshot.size,
        documentsUploaded: docsSnapshot.size,
        profiles: profilesSnapshot.size,
        pendingTasks: 1,
        savedAmount: 0,
      },
      activeServices,
      recentActivity,
      taxReturns: userReturns
    });
  } catch (error) {
    return safeError(res, error, "Failed to retrieve dashboard data.");
  }
});

router.get("/profile", requireAnyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { password, ...safeUser } = user;

    res.json({
      success: true,
      data: { user: safeUser }
    });
  } catch (error) {
    return safeError(res, error, "Failed to retrieve profile.");
  }
});

router.put("/profile", requireAnyAuth, validateRequest(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const { firstName, lastName, phoneNumber } = req.body;

    const userRef = adminDb.collection("users").doc(authUser.id);
    await userRef.update({
      firstName,
      lastName,
      phoneNumber: phoneNumber?.trim() || null,
      updatedAt: new Date()
    });

    const updatedDoc = await userRef.get();
    const safeUser = { id: updatedDoc.id, ...(updatedDoc.data() as any) };
    setCachedUser(authUser.id, safeUser);

    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: { user: safeUser }
    });
  } catch (error) {
    return safeError(res, error, "Failed to update profile.");
  }
});

router.get("/user-services", requireAnyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const snapshot = await adminDb.collection("user_services")
      .where("userId", "==", user.id)
      .get();

    const services = snapshot.docs.map(normalizeUserService);
    res.json(services);
  } catch (error) {
    return safeError(res, error, "Failed to fetch user services");
  }
});

router.post("/user-services", requireAnyAuth, validateRequest(createUserServiceSchema), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { serviceId, serviceTitle, serviceCategory, profileId, paymentAmount, paymentStatus, status, assignedCaId, metadata } = req.body;

    if (profileId && !(await recordBelongsToUser("profiles", profileId, user.id))) {
      return res.status(400).json({ success: false, message: "Linked profile does not belong to this user." });
    }

    const newService = {
      userId: user.id,
      serviceId,
      serviceTitle,
      serviceCategory,
      profileId: profileId || null,
      paymentAmount: paymentAmount ?? null,
      paymentStatus: paymentStatus ?? null,
      assignedCaId: assignedCaId || user.assignedCaId || null,
      status: status || "pending",
      metadata: metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await adminDb.collection("user_services").add(newService);

    res.json({
      success: true,
      message: "Service activated successfully",
      id: docRef.id
    });
  } catch (error) {
    return safeError(res, error, "Failed to create user service");
  }
});

export default router;
