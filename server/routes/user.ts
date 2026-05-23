import { Router, Response } from "express";
import { z } from "zod";
import { adminDb } from "../data-admin.js";
import { optionalAuth, requireAnyAuth, AuthRequest } from "../middleware/auth.js";
import { validateRequest } from "../middleware/security.js";
import { safeError } from "../utils/error-response.js";
import { setCachedUser } from "../utils/user-cache.js";
import { getUserOwnedSnapshot, recordBelongsToUser } from "../utils/access-control.js";
import { notifyAdmins, notifyUser } from "../utils/workflow-notifications.js";

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
  metadata: z.object({
    requestDescription: z.string().trim().max(3000).optional(),
    source: z.string().trim().max(120).optional(),
    requestedAt: z.string().trim().max(80).optional(),
    originalServicePath: z.string().trim().max(300).nullable().optional(),
    businessName: z.string().trim().max(160).optional(),
    contactNumber: z.string().trim().max(30).optional(),
  }).strict().optional(),
}).strict();

const updateUserServiceMetadataSchema = z.object({
  metadata: z.object({
    userNote: z.string().trim().max(3000).optional(),
  }).strict().optional(),
});

const consultationRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email(),
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

const itrDraftSchema = z.object({
  assessmentYear: z.string().trim().min(1).max(20).default("2026-27"),
  filingPath: z.enum(["self", "ca"]).nullable().optional(),
  recommendedForm: z.string().trim().max(20).nullable().optional(),
  sourceSelections: z.record(z.boolean()).optional(),
  filingFacts: z.record(z.any()).optional(),
  profileDraft: z.record(z.any()).optional(),
  estimateSummary: z.record(z.any()).optional(),
  documentChecklist: z.array(z.record(z.any())).optional(),
  workspaceState: z.record(z.any()).optional(),
}).strict();

const submitItrReviewSchema = z.object({
  userNote: z.string().trim().max(3000).optional(),
}).strict();

function normalizeUserService(doc: any): Record<string, any> & { id: string } {
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

function asTime(value: unknown) {
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : null;
  const time = date?.getTime() ?? 0;
  return Number.isNaN(time) ? 0 : time;
}

function isPendingStatus(status: unknown) {
  const normalized = String(status || "").toLowerCase();
  return ["draft", "pending", "in_progress", "link_requested", "requested", "new"].includes(normalized);
}

async function getOwnedUserService(serviceId: string, userId: string) {
  return getUserOwnedSnapshot("user_services", serviceId, userId);
}

async function findLatestTaxReturn(userId: string, status?: string) {
  const snapshot = await adminDb.collection("tax_returns")
    .where("userId", "==", userId)
    .get();

  const docs = snapshot.docs
    .filter((doc) => !status || doc.data()?.status === status)
    .sort((a, b) => asTime(b.data()?.updatedAt || b.data()?.createdAt) - asTime(a.data()?.updatedAt || a.data()?.createdAt));

  return docs[0] || null;
}

function serializeTaxReturn(doc: any) {
  return { id: doc.id, ...(doc.data() as Record<string, any>) };
}

async function linkDraftDocumentsToService(userId: string, taxReturnId: string, userServiceId: string, now: Date) {
  const snapshot = await adminDb.collection("documents")
    .where("userId", "==", userId)
    .where("taxReturnId", "==", taxReturnId)
    .get();

  await Promise.all(snapshot.docs.map((doc: any) => {
    const data = doc.data() as Record<string, any>;
    if (data.status && data.status !== "active") return Promise.resolve();
    if (data.userServiceId === userServiceId && data.serviceId === userServiceId) return Promise.resolve();
    return doc.ref.update({
      userServiceId,
      serviceId: userServiceId,
      updatedAt: now,
    });
  }));
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
    const userReturns = returnsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const pendingTasks =
      activeServices.filter((service) => isPendingStatus(service.status) || isPendingStatus(service.paymentStatus)).length +
      userReturns.filter((entry: any) => isPendingStatus(entry.status)).length;
    const recentActivity = [
      ...activeServices.map((service) => ({
        id: `service-${service.id}`,
        action: `Service ${service.serviceTitle || service.serviceId || "request"} is ${service.status || "pending"}`,
        timestamp: service.updatedAt || service.createdAt || null,
        type: "service",
      })),
      ...userReturns.map((entry: any) => ({
        id: `return-${entry.id}`,
        action: `Tax return ${entry.status || "updated"}`,
        timestamp: entry.updatedAt || entry.createdAt || null,
        type: "tax_return",
      })),
    ]
      .filter((entry) => entry.timestamp)
      .sort((a, b) => asTime(b.timestamp) - asTime(a.timestamp))
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalReturns: returnsSnapshot.size,
        documentsUploaded: docsSnapshot.size,
        profiles: profilesSnapshot.size,
        pendingTasks,
        savedAmount: 0,
      },
      activeServices,
      recentActivity,
      taxReturns: userReturns.slice(0, 5)
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

router.get("/itr/draft", requireAnyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const draft = await findLatestTaxReturn(user.id, "draft");
    res.json({ success: true, draft: draft ? serializeTaxReturn(draft) : null });
  } catch (error) {
    return safeError(res, error, "Failed to load ITR draft");
  }
});

router.put("/itr/draft", requireAnyAuth, validateRequest(itrDraftSchema), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const draft = itrDraftSchema.parse(req.body);
    const existing = await findLatestTaxReturn(user.id, "draft");
    const now = new Date();
    const payload = {
      ...draft,
      userId: user.id,
      status: "draft",
      updatedAt: now,
      createdAt: existing?.data()?.createdAt || now,
    };

    const ref = existing?.ref || await adminDb.collection("tax_returns").add(payload);
    if (existing?.ref) {
      await existing.ref.update(payload);
    }

    const saved = await ref.get();
    res.json({ success: true, draft: serializeTaxReturn(saved) });
  } catch (error) {
    return safeError(res, error, "Failed to save ITR draft");
  }
});

router.post("/itr/submit-review", requireAnyAuth, validateRequest(submitItrReviewSchema), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const draft = await findLatestTaxReturn(user.id, "draft");
    if (!draft) {
      return res.status(404).json({ success: false, message: "No ITR draft found to submit." });
    }

    const draftData = draft.data() as Record<string, any>;
    const note = submitItrReviewSchema.parse(req.body).userNote || "";
    const now = new Date();

    let serviceRef = draftData.userServiceId
      ? adminDb.collection("user_services").doc(draftData.userServiceId)
      : null;
    let serviceDoc = serviceRef ? await serviceRef.get() : null;

    if (!serviceDoc?.exists) {
      serviceRef = await adminDb.collection("user_services").add({
        userId: user.id,
        serviceId: "itr-filing",
        serviceTitle: "ITR Filing Review",
        serviceCategory: "Income Tax",
        profileId: null,
        paymentAmount: null,
        paymentStatus: "pending",
        assignedCaId: user.assignedCaId || null,
        status: "pending",
        metadata: {
          source: "itr_filing_workspace",
          linkedTaxReturnId: draft.id,
          recommendedForm: draftData.recommendedForm || null,
          assessmentYear: draftData.assessmentYear || "2026-27",
          documentChecklist: draftData.documentChecklist || [],
          ...(note ? { userNote: note } : {}),
        },
        createdAt: now,
        updatedAt: now,
      });
      serviceDoc = await serviceRef.get();
    } else if (serviceRef) {
      const current = serviceDoc.data() as Record<string, any>;
      await serviceRef.update({
        metadata: {
          ...(current.metadata || {}),
          source: "itr_filing_workspace",
          linkedTaxReturnId: draft.id,
          recommendedForm: draftData.recommendedForm || null,
          assessmentYear: draftData.assessmentYear || "2026-27",
          documentChecklist: draftData.documentChecklist || [],
          ...(note ? { userNote: note } : {}),
        },
        status: current.status === "completed" ? current.status : "pending",
        updatedAt: now,
      });
      serviceDoc = await serviceRef.get();
    }

    await draft.ref.update({
      ...draftData,
      status: "ca_review",
      filingPath: draftData.filingPath || "ca",
      userServiceId: serviceRef.id,
      submittedForReviewAt: now,
      updatedAt: now,
    });
    await linkDraftDocumentsToService(user.id, draft.id, serviceRef.id, now);

    const updatedTaxReturn = await draft.ref.get();
    const updatedService = await serviceRef.get();
    const notificationMetadata = {
      taxReturnId: draft.id,
      userServiceId: serviceRef.id,
      userId: user.id,
    };

    await Promise.all([
      notifyAdmins({
        title: "ITR review submitted",
        message: "A user submitted an MY ITR draft for CA review.",
        type: "info",
        metadata: notificationMetadata,
      }),
      notifyUser(updatedService.data()?.assignedCaId, {
        title: "New assigned ITR case",
        message: "A new ITR filing review case is assigned to you.",
        type: "info",
        metadata: notificationMetadata,
      }),
    ]);

    res.json({
      success: true,
      taxReturn: serializeTaxReturn(updatedTaxReturn),
      service: normalizeUserService(updatedService),
    });
  } catch (error) {
    return safeError(res, error, "Failed to submit ITR draft for review");
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
    const savedService = normalizeUserService(await docRef.get());

    await Promise.all([
      notifyAdmins({
        title: "New service request",
        message: `${savedService.serviceTitle || "A service request"} was created from the user workspace.`,
        type: "info",
        metadata: { userServiceId: docRef.id, userId: user.id },
      }),
      notifyUser(savedService.assignedCaId, {
        title: "New assigned service case",
        message: `${savedService.serviceTitle || "A service request"} is assigned to you.`,
        type: "info",
        metadata: { userServiceId: docRef.id, userId: user.id },
      }),
    ]);

    res.json({
      success: true,
      message: "Service activated successfully",
      id: docRef.id,
      service: savedService
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
    await Promise.all([
      notifyAdmins({
        title: "Service note updated",
        message: "A user added an update to a service case.",
        type: "info",
        metadata: { userServiceId: req.params.id, userId: user.id },
      }),
      notifyUser(current.assignedCaId || current.metadata?.assignedCaId, {
        title: "Client service note updated",
        message: "A client added an update to an assigned service case.",
        type: "info",
        metadata: { userServiceId: req.params.id, userId: user.id },
      }),
    ]);
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
      phone: request.phone || null,
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
    await Promise.all([
      notifyAdmins({
        title: "Payment link requested",
        message: `${request.serviceTitle} needs a payment link.`,
        type: "info",
        metadata: { userServiceId: req.body.userServiceId, paymentLinkRequestId: requestRef.id, userId: user.id },
      }),
      notifyUser(serviceData.assignedCaId, {
        title: "Client requested payment link",
        message: `${request.serviceTitle} has a payment-link request.`,
        type: "info",
        metadata: { userServiceId: req.body.userServiceId, paymentLinkRequestId: requestRef.id, userId: user.id },
      }),
    ]);

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
