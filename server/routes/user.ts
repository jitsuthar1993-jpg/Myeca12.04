import { Router, Response } from "express";
import { z } from "zod";
import { adminDb } from "../data-admin.js";
import { optionalAuth, requireAnyAuth, AuthRequest } from "../middleware/auth.js";
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
  paymentAmount: z.union([z.number(), z.string().trim().min(1)]).optional().nullable(),
  paymentStatus: z.string().trim().max(50).optional(),
  status: z.string().trim().max(50).optional(),
  assignedCaId: z.string().trim().min(1).optional().nullable(),
  metadata: z.object({
    requestDescription: z.string().trim().max(3000).optional(),
    source: z.string().trim().max(120).optional(),
    requestedAt: z.string().trim().max(80).optional(),
    originalServicePath: z.string().trim().max(300).nullable().optional(),
    businessName: z.string().trim().max(160).optional(),
    contactNumber: z.string().trim().max(30).optional(),
  }).strict().optional(),
});

const updateUserServiceMetadataSchema = z.object({
  metadata: z.object({
    userNote: z.string().trim().max(3000).optional(),
  }).strict().optional(),
});

const consultationRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(30),
  email: z.string().trim().email().optional().or(z.literal("")),
  gstin: z.string().trim().max(20).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  service: z.string().trim().min(1).max(160),
  turnover: z.string().trim().max(80).optional().or(z.literal("")),
  preferredTime: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(3000),
  source: z.string().trim().max(120).optional(),
});

const paymentLinkRequestSchema = z.object({
  userServiceId: z.string().trim().min(1),
  note: z.string().trim().max(1000).optional(),
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

async function getOwnedUserService(serviceId: string, userId: string) {
  const doc = await adminDb.collection("user_services").doc(serviceId).get();
  if (!doc.exists) return null;
  const data = doc.data() as Record<string, any>;
  if (data.userId !== userId) return null;
  return doc;
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

router.get("/user-services/:id", requireAnyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const service = await getOwnedUserService(req.params.id, user.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const documentsSnapshot = await adminDb.collection("documents")
      .where("userId", "==", user.id)
      .where("userServiceId", "==", req.params.id)
      .where("status", "==", "active")
      .get();

    res.json({
      success: true,
      service: normalizeUserService(service),
      documents: documentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    });
  } catch (error) {
    return safeError(res, error, "Failed to fetch user service");
  }
});

router.post("/user-services", requireAnyAuth, validateRequest(createUserServiceSchema), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { serviceId, serviceTitle, serviceCategory, profileId, paymentAmount, metadata } = req.body;

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
      paymentStatus: "pending",
      assignedCaId: user.assignedCaId || null,
      status: "pending",
      metadata: metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await adminDb.collection("user_services").add(newService);

    res.json({
      success: true,
      message: "Service activated successfully",
      id: docRef.id,
      service: normalizeUserService(await docRef.get())
    });
  } catch (error) {
    return safeError(res, error, "Failed to create user service");
  }
});

router.patch("/user-services/:id", requireAnyAuth, validateRequest(updateUserServiceMetadataSchema), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const service = await getOwnedUserService(req.params.id, user.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const current = service.data() as Record<string, any>;
    const currentMetadata = (current.metadata || {}) as Record<string, any>;
    const incomingMetadata = (req.body.metadata || {}) as Record<string, any>;
    const metadata = {
      ...currentMetadata,
      ...incomingMetadata,
      userUpdatedAt: new Date(),
    };

    await service.ref.update({ metadata, updatedAt: new Date() });
    const updated = await service.ref.get();
    res.json({ success: true, service: normalizeUserService(updated) });
  } catch (error) {
    return safeError(res, error, "Failed to update user service");
  }
});

router.post("/consultation-requests", optionalAuth, validateRequest(consultationRequestSchema), async (req: AuthRequest, res: Response) => {
  try {
    const request = consultationRequestSchema.parse(req.body);
    const newRequest = {
      ...request,
      email: request.email || null,
      gstin: request.gstin || null,
      company: request.company || null,
      turnover: request.turnover || null,
      preferredTime: request.preferredTime || "Call now",
      source: request.source || "expert_consultation",
      userId: req.user?.id || null,
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection("consultation_requests").add(newRequest);
    res.json({
      success: true,
      id: docRef.id,
      message: "Callback request received",
    });
  } catch (error) {
    return safeError(res, error, "Failed to create consultation request");
  }
});

router.post("/payments/request-link", requireAnyAuth, validateRequest(paymentLinkRequestSchema), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const service = await getOwnedUserService(req.body.userServiceId, user.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const serviceData = service.data() as Record<string, any>;
    const request = {
      userId: user.id,
      userServiceId: req.body.userServiceId,
      serviceTitle: serviceData.serviceTitle || serviceData.serviceId || "Service",
      paymentAmount: serviceData.paymentAmount ?? null,
      status: "requested",
      note: req.body.note || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const requestRef = await adminDb.collection("payment_link_requests").add(request);
    const metadata = {
      ...(serviceData.metadata || {}),
      paymentLinkRequestedAt: new Date(),
      paymentLinkRequestId: requestRef.id,
    };
    await service.ref.update({
      metadata,
      paymentStatus: serviceData.paymentStatus === "paid" ? "paid" : "link_requested",
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      id: requestRef.id,
      message: "Payment link request recorded",
    });
  } catch (error) {
    return safeError(res, error, "Failed to request payment link");
  }
});

export default router;
