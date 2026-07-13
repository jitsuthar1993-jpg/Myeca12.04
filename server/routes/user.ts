import { Router, Response } from "express";
import { z } from "zod";
import { adminDb } from "../data-admin.js";
import { countByUserAndStatus } from "../db/queries.js";
import { schema } from "../db.js";
import { optionalAuth, requireAnyAuth, AuthRequest } from "../middleware/auth.js";
import { validateRequest } from "../middleware/security.js";
import { safeError } from "../utils/error-response.js";
import { setCachedUser } from "../utils/user-cache.js";
import { getUserOwnedSnapshot, recordBelongsToUser } from "../utils/access-control.js";
import { notifyLeadAutomation } from "../services/lead-automation.js";
import { createReminder, listReminders } from "../utils/reminders.js";
import { listWorkflowEvents, recordWorkflowEvent } from "../utils/workflow-events.js";
import { notifyAdmins, notifyRole, notifyUser } from "../utils/workflow-notifications.js";
import { campaignAttributionSchema, normalizeCampaignAttribution } from "../../shared/campaign-attribution.js";
import {
  enqueueWhatsAppTemplateForUser,
  recordWhatsAppConsentFromConsultation,
} from "../services/whatsapp-client-workflow.js";

const router = Router();
const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional().nullable().default(""),
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
    formId: z.string().trim().max(120).optional(),
    serviceIntent: z.string().trim().max(160).optional(),
    requestedAt: z.string().trim().max(80).optional(),
    originalServicePath: z.string().trim().max(300).nullable().optional(),
    businessName: z.string().trim().max(160).optional(),
    contactNumber: z.string().trim().max(30).optional(),
    conversionSource: z.string().trim().max(120).optional(),
    recommendedPlanId: z.enum(["salary", "expert-assisted", "complex-scope"]).optional(),
    assessmentYear: z.string().trim().max(20).optional(),
    incomeProfile: z
      .array(z.enum(["salary", "multiple-form16", "capital-gains", "business-freelance", "nri-foreign", "notice"]))
      .max(8)
      .optional(),
    assistanceLevel: z.enum(["guided", "ca-assisted", "not-sure"]).optional(),
    ctaVariant: z.string().trim().max(120).optional(),
    attribution: campaignAttributionSchema.optional(),
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
  formId: z.string().trim().max(120).optional(),
  serviceIntent: z.string().trim().max(160).optional(),
  attribution: campaignAttributionSchema.optional(),
  leadContext: z.object({
    caseType: z.string().trim().min(1).max(80),
    checklistLabel: z.string().trim().min(1).max(120),
    sourceUrl: z.string().trim().min(1).max(500),
    consentTimestamp: z.string().datetime({ offset: true }),
    utmFields: z.object({
      utmCampaign: z.string().trim().max(120).optional(),
      utmSource: z.string().trim().max(120).optional(),
      utmMedium: z.string().trim().max(120).optional(),
      utmContent: z.string().trim().max(120).optional(),
    }).strict().optional(),
  }).strict().optional(),
  leadPayload: z.object({
    name: z.string().trim().min(1).max(120),
    phone_or_email: z.string().trim().min(1).max(190),
    service_interest: z.string().trim().min(1).max(160),
    source_url: z.string().trim().min(1).max(500),
    utm_fields: z.object({
      utm_campaign: z.string().trim().max(120).optional(),
      utm_source: z.string().trim().max(120).optional(),
      utm_medium: z.string().trim().max(120).optional(),
      utm_content: z.string().trim().max(120).optional(),
    }).strict().optional(),
    case_type: z.string().trim().min(1).max(80),
    consent_timestamp: z.string().datetime({ offset: true }),
  }).strict().optional(),
  channelConsent: z.object({
    whatsapp: z.object({
      optedIn: z.boolean(),
      phone: z.string().trim().max(30).optional(),
      consentText: z.string().trim().max(300).optional(),
      consentTimestamp: z.string().datetime({ offset: true }),
    }).strict().optional(),
  }).strict().optional(),
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
  attribution: campaignAttributionSchema.optional(),
}).strict();

const submitItrReviewSchema = z.object({
  userNote: z.string().trim().max(3000).optional(),
}).strict();

type ITRDraftPayload = z.infer<typeof itrDraftSchema>;

function normalizeCaFilingData<T extends Record<string, any>>(data: T): T {
  const workspaceState =
    data.workspaceState && typeof data.workspaceState === "object" && !Array.isArray(data.workspaceState)
      ? { ...data.workspaceState, selectedFilingPath: "ca" }
      : data.workspaceState;

  return {
    ...data,
    filingPath: "ca",
    ...(workspaceState ? { workspaceState } : {}),
  };
}

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

type DashboardNextAction = {
  id: string;
  label: string;
  detail: string;
  href: string;
  source: "reminder" | "payment" | "document" | "ca" | "service" | "filing" | "empty";
  tone: "amber" | "blue" | "emerald" | "slate";
};

function internalHref(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.startsWith("/auth/") || trimmed === "/login" || trimmed === "/register") return fallback;
  return trimmed;
}

function serviceTitle(service: Record<string, any>) {
  return service.serviceTitle || service.serviceId || "Service request";
}

function paymentNeedsAttention(service: Record<string, any>) {
  const serviceStatus = String(service.status || "").toLowerCase();
  if (["completed", "filed", "cancelled", "closed"].includes(serviceStatus)) return false;

  const status = String(service.paymentStatus || "pending").toLowerCase();
  return !["paid", "not_required", "not required", "waived", "completed"].includes(status);
}

function clientResponseNeeded(status: unknown) {
  return ["changes_requested", "client_response_needed", "action_required"].includes(String(status || "").toLowerCase());
}

function buildDashboardNextActions({
  services,
  returns,
  documentsUploaded,
  reminders,
}: {
  services: Array<Record<string, any>>;
  returns: Array<Record<string, any>>;
  documentsUploaded: number;
  reminders: Array<Record<string, any>>;
}): DashboardNextAction[] {
  const actions: DashboardNextAction[] = [];
  const reminder = reminders[0];

  if (reminder) {
    const fallbackHref = reminder.caseId ? `/dashboard/services/${reminder.caseId}` : "/dashboard";
    actions.push({
      id: `reminder-${reminder.id}`,
      label: reminder.title || "Reminder pending",
      detail: reminder.message || "Review the pending reminder in your workspace.",
      href: internalHref(reminder.metadata?.actionUrl, fallbackHref),
      source: "reminder",
      tone: reminder.priority === "high" || reminder.priority === "urgent" ? "amber" : "blue",
    });
  }

  const paymentService = services.find(paymentNeedsAttention);
  if (paymentService) {
    actions.push({
      id: `payment-${paymentService.id}`,
      label: "Payment pending",
      detail: `${serviceTitle(paymentService)} needs payment before the next fulfillment step.`,
      href: "/payments",
      source: "payment",
      tone: "amber",
    });
  }

  const responseService = services.find((service) => clientResponseNeeded(service.status));
  if (responseService) {
    actions.push({
      id: `response-${responseService.id}`,
      label: "CA response needed",
      detail: `${serviceTitle(responseService)} is waiting for your reply or document update.`,
      href: `/dashboard/services/${responseService.id}`,
      source: "ca",
      tone: "amber",
    });
  }

  const draftReturn = returns.find((entry) => isPendingStatus(entry.status) || entry.status === "changes_requested");
  if (draftReturn) {
    actions.push({
      id: `filing-${draftReturn.id}`,
      label: "Continue ITR draft",
      detail: "Resume the saved return and complete the remaining filing steps.",
      href: `/itr/filing/${draftReturn.id}`,
      source: "filing",
      tone: "blue",
    });
  }

  if (documentsUploaded === 0) {
    actions.push({
      id: "document-upload",
      label: "Upload documents",
      detail: "Add Form 16, AIS, Form 26AS, or other reusable records to your vault.",
      href: "/documents",
      source: "document",
      tone: "blue",
    });
  }

  const activeService = services.find((service) => isPendingStatus(service.status) || clientResponseNeeded(service.status));
  if (activeService) {
    actions.push({
      id: `service-${activeService.id}`,
      label: "Track active case",
      detail: `${serviceTitle(activeService)} is currently ${activeService.status || "pending"}.`,
      href: `/dashboard/services/${activeService.id}`,
      source: "service",
      tone: "slate",
    });
  }

  if (!actions.length) {
    actions.push({
      id: "workspace-clear",
      label: "Workspace is up to date",
      detail: "No pending payments, reminders, or active filing tasks are waiting right now.",
      href: "/dashboard/services",
      source: "empty",
      tone: "emerald",
    });
  }

  return actions.slice(0, 4);
}

async function getOwnedUserService(serviceId: string, userId: string) {
  return getUserOwnedSnapshot("user_services", serviceId, userId);
}

async function runServiceSideEffect(label: string, task: () => Promise<unknown>) {
  try {
    await task();
  } catch (error) {
    console.warn(`[WORKFLOW] ${label} failed; primary service record was already saved.`, error);
  }
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
  return { id: doc.id, ...normalizeCaFilingData(doc.data() as Record<string, any>) };
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

    const returnsRef = adminDb.collection("tax_returns").where("userId", "==", user.id) as any;
    const docsRef = adminDb.collection("documents")
      .where("userId", "==", user.id)
      .where("status", "==", "active") as any;
    const profilesRef = adminDb.collection("profiles").where("userId", "==", user.id) as any;
    const servicesRef = adminDb.collection("user_services").where("userId", "==", user.id) as any;

    // Use SQL aggregates for the simple totals and only fetch the rows the response actually
    // ships back. The previous implementation read every tax return, document, service, and
    // profile row for the user just to call .size and .slice(0, 5) — wasted work for any user
    // with more than a handful of records.
    // Pending counts use the Drizzle helper countByUserAndStatus which issues a single
    // `WHERE userId = ? AND status IN (...)` query — replacing the per-status fan-out the
    // adminDb shim required because it only supports `==`.
    const [
      totalReturnsAgg,
      totalDocsAgg,
      totalProfilesAgg,
      pendingReturnsCount,
      pendingServicesCount,
      recentReturnsSnapshot,
      activeServicesSnapshot,
      pendingReminders,
    ] = await Promise.all([
      returnsRef.count().get(),
      docsRef.count().get(),
      profilesRef.count().get(),
      countByUserAndStatus(schema.taxReturns, user.id, ["draft", "pending", "in_progress"]),
      countByUserAndStatus(schema.userServices, user.id, ["pending", "in_progress", "requested", "new"]),
      returnsRef.orderBy("updatedAt", "desc").limit(5).get(),
      servicesRef.orderBy("updatedAt", "desc").limit(50).get(),
      listReminders({ targetUserId: user.id, status: "pending" }),
    ]);

    const activeServices = activeServicesSnapshot.docs.map(normalizeUserService);
    const userReturns = recentReturnsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    const pendingTasks = pendingReturnsCount + pendingServicesCount;
    const documentsUploaded = totalDocsAgg.data().count;
    const nextActions = buildDashboardNextActions({
      services: activeServices,
      returns: userReturns,
      documentsUploaded,
      reminders: pendingReminders as Array<Record<string, any>>,
    });

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
        totalReturns: totalReturnsAgg.data().count,
        documentsUploaded,
        profiles: totalProfilesAgg.data().count,
        pendingTasks,
        savedAmount: 0,
      },
      nextActions,
      activeServices,
      recentActivity,
      taxReturns: userReturns,
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
      firstName: firstName.trim(),
      lastName: typeof lastName === "string" ? lastName.trim() : "",
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

    const draft = normalizeCaFilingData(itrDraftSchema.parse(req.body) as ITRDraftPayload);
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

    const draftData = normalizeCaFilingData(draft.data() as Record<string, any>);
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
        serviceTitle: "CA ITR Filing Review",
        serviceCategory: "Income Tax",
        profileId: null,
        paymentAmount: null,
        paymentStatus: "pending",
        assignedCaId: user.assignedCaId || null,
        status: "pending",
        metadata: {
          source: "itr_filing_workspace",
          ...(draftData.attribution ? { attribution: normalizeCampaignAttribution(draftData.attribution) } : {}),
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
          ...(draftData.attribution ? { attribution: normalizeCampaignAttribution(draftData.attribution) } : {}),
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
      filingPath: "ca",
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

    await recordWorkflowEvent({
      type: "itr_review_submitted",
      title: "MY ITR submitted for review",
      message: "A user submitted an MY ITR draft for CA review.",
      sourceType: "tax_return",
      sourceId: draft.id,
      caseId: serviceRef.id,
      userId: user.id,
      targetRole: updatedService.data()?.assignedCaId ? "ca" : "admin",
      targetUserId: updatedService.data()?.assignedCaId || null,
      actorUserId: user.id,
      actorRole: user.role || "user",
      priority: "high",
      metadata: notificationMetadata,
    });
    await createReminder({
      title: "Review submitted MY ITR case",
      message: "A user submitted an MY ITR draft and is waiting for expert review.",
      targetRole: updatedService.data()?.assignedCaId ? "ca" : "admin",
      targetUserId: updatedService.data()?.assignedCaId || null,
      caseId: serviceRef.id,
      sourceType: "tax_return",
      sourceId: draft.id,
      priority: "high",
      metadata: { actionUrl: `/dashboard/services/${serviceRef.id}` },
    });

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
    await runServiceSideEffect("queue WhatsApp ITR review submitted update", () => enqueueWhatsAppTemplateForUser({
      userId: user.id,
      templateName: "review_submitted",
      sourceType: "tax_return",
      sourceId: draft.id,
      caseId: serviceRef.id,
      variables: {
        assessment_year: draftData.assessmentYear || "2026-27",
      },
    }));

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

    const [documentsSnapshot, activity, reminders] = await Promise.all([
      adminDb.collection("documents")
        .where("userId", "==", user.id)
        .where("userServiceId", "==", req.params.id)
        .where("status", "==", "active")
        .get(),
      listWorkflowEvents({ caseId: req.params.id, userId: user.id }),
      listReminders({ caseId: req.params.id, targetUserId: user.id }),
    ]);

    res.json({
      success: true,
      service: normalizeUserService(service),
      documents: documentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      activity,
      reminders,
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
      metadata: metadata
        ? {
            ...metadata,
            ...(metadata.attribution ? { attribution: normalizeCampaignAttribution(metadata.attribution) } : {}),
          }
        : {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await adminDb.collection("user_services").add(newService);
    const savedService = normalizeUserService(await docRef.get());

    await Promise.all([
      runServiceSideEffect("record service workflow event", () => recordWorkflowEvent({
        type: "service_requested",
        title: "Service request created",
        message: `${savedService.serviceTitle || "A service request"} was created from the user workspace.`,
        sourceType: "user_service",
        sourceId: docRef.id,
        caseId: docRef.id,
        userId: user.id,
        targetRole: savedService.assignedCaId ? "ca" : "team_member",
        targetUserId: savedService.assignedCaId || null,
        actorUserId: user.id,
        actorRole: user.role || "user",
        priority: "medium",
        metadata: {
          source: metadata?.source || "user_services",
          formId: metadata?.formId || null,
          serviceIntent: metadata?.serviceIntent || serviceId,
        },
      })),
      runServiceSideEffect("record service case creation", () => recordWorkflowEvent({
        type: "service_case_created",
        title: "Service case created",
        message: `${savedService.serviceTitle || "A service case"} was created.`,
        sourceType: "user_service",
        sourceId: docRef.id,
        caseId: docRef.id,
        userId: user.id,
        targetRole: savedService.assignedCaId ? "ca" : "team_member",
        targetUserId: savedService.assignedCaId || null,
        actorUserId: user.id,
        actorRole: user.role || "user",
        priority: "medium",
        metadata: {
          attribution: savedService.metadata?.attribution || null,
          serviceIntent: metadata?.serviceIntent || serviceId,
        },
      })),
      runServiceSideEffect("create service reminder", () => createReminder({
        title: "New service intake",
        message: `${savedService.serviceTitle || "A service request"} needs triage or expert handoff.`,
        targetRole: savedService.assignedCaId ? "ca" : "team_member",
        targetUserId: savedService.assignedCaId || null,
        caseId: docRef.id,
        sourceType: "user_service",
        sourceId: docRef.id,
        priority: "medium",
        metadata: { actionUrl: `/dashboard/services/${docRef.id}` },
      })),
      runServiceSideEffect("notify service stakeholders", () => Promise.all([
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
        notifyRole("team_member", {
          title: "New service intake",
          message: `${savedService.serviceTitle || "A service request"} was created from the user workspace.`,
          type: "info",
          metadata: { userServiceId: docRef.id, userId: user.id },
        }),
      ])),
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
    await recordWorkflowEvent({
      type: "case_note_added",
      title: "User added a case note",
      message: incomingMetadata.userNote || "A user added an update to a service case.",
      sourceType: "user_service",
      sourceId: req.params.id,
      caseId: req.params.id,
      userId: user.id,
      targetRole: current.assignedCaId || current.metadata?.assignedCaId ? "ca" : "admin",
      targetUserId: current.assignedCaId || current.metadata?.assignedCaId || null,
      actorUserId: user.id,
      actorRole: user.role || "user",
      priority: "medium",
    });
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
      ...(request.attribution ? { attribution: normalizeCampaignAttribution(request.attribution) } : {}),
      userId: req.user?.id || null,
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection("consultation_requests").add(newRequest);
    await recordWorkflowEvent({
      type: "form_submitted",
      title: "Public intake form submitted",
      message: `${request.name} submitted ${request.service}.`,
      sourceType: "consultation_request",
      sourceId: docRef.id,
      userId: req.user?.id || null,
      targetRole: "team_member",
      actorUserId: req.user?.id || null,
      actorRole: req.user?.role || null,
      priority: "medium",
      metadata: {
        source: newRequest.source,
        formId: request.formId || null,
        serviceIntent: request.serviceIntent || request.service,
        attribution: newRequest.attribution || null,
        leadContext: request.leadContext || null,
        leadPayload: request.leadPayload || null,
      },
    });
    await createReminder({
      title: "New intake request",
      message: `${request.name} asked for ${request.service}.`,
      targetRole: "team_member",
      sourceType: "consultation_request",
      sourceId: docRef.id,
      priority: "medium",
      metadata: {
        source: newRequest.source,
        formId: request.formId || null,
        serviceIntent: request.serviceIntent || request.service,
        attribution: newRequest.attribution || null,
        leadContext: request.leadContext || null,
        leadPayload: request.leadPayload || null,
      },
    });
    await notifyRole("team_member", {
      title: "New intake request",
      message: `${request.name} asked for ${request.service}.`,
      type: "info",
      metadata: { consultationRequestId: docRef.id, source: newRequest.source },
    });
    await runServiceSideEffect("queue WhatsApp lead acknowledgement", () => recordWhatsAppConsentFromConsultation({
      requestId: docRef.id,
      name: request.name,
      phone: request.phone || null,
      userId: req.user?.id || null,
      channelConsent: request.channelConsent || null,
    }));
    void notifyLeadAutomation({ id: docRef.id, ...newRequest }).catch((error) => {
      console.warn("[LEAD_AUTOMATION]", error);
    });
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
      attribution: normalizeCampaignAttribution(serviceData.metadata?.attribution) ?? null,
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
    await recordWorkflowEvent({
      type: "payment_link_requested",
      title: "Payment link requested",
      message: `${request.serviceTitle} needs a payment link.`,
      sourceType: "payment_link_request",
      sourceId: requestRef.id,
      caseId: req.body.userServiceId,
      userId: user.id,
      targetRole: "admin",
      actorUserId: user.id,
      actorRole: user.role || "user",
      priority: "high",
      metadata: { note: request.note || null },
    });
    await createReminder({
      title: "Payment link requested",
      message: `${request.serviceTitle} needs a payment link.`,
      targetRole: "admin",
      caseId: req.body.userServiceId,
      sourceType: "payment_link_request",
      sourceId: requestRef.id,
      priority: "high",
      metadata: { actionUrl: "/admin/requests" },
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
