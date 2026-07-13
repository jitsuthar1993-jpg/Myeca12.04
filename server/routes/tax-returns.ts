import { Router, Response } from "express";
import { z } from "zod";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";
import { errorResponse, safeError } from "../utils/error-response.js";
import {
  ITR_REVIEW_STATUSES,
  buildItrDraftJsonExport,
  buildItrReviewPacket,
  buildItrVerificationReport,
  computeItrTaxLiability,
  calculateItrTotalDeductions,
  calculateItrTotalIncome,
  calculateItrTotalTaxPaid,
  getItrDocumentChecklist,
  normalizeItrDraft,
  recommendItrForm,
  type ItrFilingDraft,
} from "../../shared/itr-filing.js";
import { decryptPII, encryptPII } from "../utils/encryption.js";
import {
  canAccessUserData,
  isAdmin,
  isCa,
  getUserOwnedRecords,
  recordBelongsToUser,
} from "../utils/access-control.js";
import { recordWorkflowEvent } from "../utils/workflow-events.js";
import { campaignAttributionSchema, normalizeCampaignAttribution } from "../../shared/campaign-attribution.js";
import { enqueueWhatsAppTemplateForUser } from "../services/whatsapp-client-workflow.js";

const router = Router();

const createTaxReturnSchema = z.object({
  assessmentYear: z.string().trim().min(1).default("2026-27"),
  profileId: z.string().trim().min(1).nullable().optional(),
  owner: z.enum(["self", "member"]).optional(),
  draft: z.unknown().optional(),
  attribution: campaignAttributionSchema.optional(),
}).superRefine((data, ctx) => {
  if (data.owner === "member" && !data.profileId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["profileId"],
      message: "Select the saved member to file for.",
    });
  }
});

const updateTaxReturnSchema = z.object({
  assessmentYear: z.string().trim().min(1).optional(),
  profileId: z.string().trim().min(1).nullable().optional(),
  draft: z.unknown().optional(),
  attribution: campaignAttributionSchema.optional(),
});

const linkDocumentSchema = z.object({
  documentId: z.string().trim().min(1),
  checklistItemId: z.string().trim().min(1),
});

const reviewStatusSchema = z.object({
  status: z.enum(ITR_REVIEW_STATUSES),
  notes: z.string().trim().max(2000).optional().default(""),
  acknowledgmentNumber: z.string().trim().max(80).optional(),
  refundAmount: z.number().optional().nullable(),
  filedAt: z.string().trim().optional(),
});

const CA_REVIEW_STATUSES = new Set([
  "ca_review",
  "changes_requested",
  "approved_for_filing",
  "filed",
  "e_verified",
  "refund_or_demand_tracking",
]);

const SENSITIVE_TAXPAYER_FIELDS = [
  "pan",
  "aadhaar",
  "bankAccount",
  "bankAccountConfirm",
] as const;

function transformSensitiveTaxpayerFields(
  draftInput: ItrFilingDraft,
  transform: (value?: string | null) => string | null | undefined,
) {
  const draft = normalizeItrDraft(draftInput);
  const taxpayer = { ...draft.taxpayer };

  for (const field of SENSITIVE_TAXPAYER_FIELDS) {
    taxpayer[field] = transform(taxpayer[field]) ?? "";
  }

  return {
    ...draft,
    taxpayer,
  };
}

function secureDraftForStorage(draftInput: ItrFilingDraft) {
  return transformSensitiveTaxpayerFields(draftInput, encryptPII);
}

function decryptDraftForResponse(draftInput: ItrFilingDraft) {
  const rawDraft = draftInput && typeof draftInput === "object"
    ? { ...(draftInput as Record<string, any>) }
    : {};
  const taxpayer = rawDraft.taxpayer && typeof rawDraft.taxpayer === "object"
    ? { ...rawDraft.taxpayer }
    : {};

  for (const field of SENSITIVE_TAXPAYER_FIELDS) {
    taxpayer[field] = decryptPII(taxpayer[field]) ?? "";
  }

  return normalizeItrDraft({
    ...rawDraft,
    taxpayer,
  });
}

function secureReviewPacketForStorage(packet: ReturnType<typeof buildItrReviewPacket>) {
  return {
    ...packet,
    draft: secureDraftForStorage(packet.draft),
  };
}

function decryptReviewPacketForResponse(packet: ReturnType<typeof buildItrReviewPacket>) {
  return {
    ...packet,
    draft: decryptDraftForResponse(packet.draft),
  };
}

function parseStoredDraft(data: Record<string, any>): ItrFilingDraft {
  let parsed: unknown;

  if (data.formData && typeof data.formData === "string") {
    try {
      parsed = JSON.parse(data.formData);
    } catch {
      parsed = {};
    }
  } else if (data.formData && typeof data.formData === "object") {
    parsed = data.formData;
  } else {
    parsed = {};
  }

  return decryptDraftForResponse(parsed as ItrFilingDraft);
}

function serializeTaxReturn(id: string, data: Record<string, any>) {
  const draft = parseStoredDraft(data);
  const recommendation = data.recommendation ?? recommendItrForm(draft);
  const calculatedTax = data.calculatedTax ?? computeItrTaxLiability(draft);
  const reviewPacket = data.reviewPacket
    ? decryptReviewPacketForResponse(data.reviewPacket)
    : null;

  return {
    id,
    userId: data.userId,
    profileId: data.profileId ?? null,
    assessmentYear: data.assessmentYear ?? draft.assessmentYear,
    itrType: data.itrType ?? recommendation.form,
    status: data.status ?? "draft",
    reviewStatus: data.reviewStatus ?? data.status ?? "draft",
    formData: draft,
    recommendation,
    reviewPacket,
    taxSummary: data.taxSummary ?? buildTaxSummary(draft),
    calculatedTax,
    refundAmount: data.refundAmount ?? null,
    acknowledgmentNumber: data.acknowledgmentNumber ?? null,
    filedAt: data.filedAt ?? null,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
    attribution: normalizeCampaignAttribution(data.attribution) ?? null,
  };
}

function buildTaxSummary(draft: ItrFilingDraft) {
  return {
    totalIncome: calculateItrTotalIncome(draft),
    totalDeductions: calculateItrTotalDeductions(draft),
    totalTaxPaid: calculateItrTotalTaxPaid(draft),
    taxLiability: computeItrTaxLiability(draft),
  };
}

function routeError(res: Response, error: unknown, fallback: string) {
  if (error instanceof z.ZodError) {
    return errorResponse(res, 400, error.errors[0]?.message || fallback);
  }

  const status = typeof (error as any)?.status === "number" ? (error as any).status : undefined;
  if (status) {
    return errorResponse(res, status, (error as Error).message || fallback);
  }

  return safeError(res, error, fallback);
}

async function runWhatsAppSideEffect(label: string, task: () => Promise<unknown>) {
  try {
    await task();
  } catch (error) {
    console.warn(`[WHATSAPP] ${label} failed; primary tax-return flow was already saved.`, error);
  }
}

function reviewStatusTemplate(status: string) {
  switch (status) {
    case "changes_requested":
      return "changes_requested";
    case "filed":
      return "e_verification_reminder";
    case "e_verified":
    case "refund_or_demand_tracking":
      return "filing_completed";
    default:
      return null;
  }
}

async function resolveTargetUserId(req: AuthRequest) {
  const authUserId = req.auth?.userId;
  if (!authUserId) return null;
  return authUserId;
}

const OPEN_DRAFT_STATUSES = new Set(["draft", "changes_requested"]);

function splitFullName(name: unknown) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

function fillEmptyTaxpayerFields(
  taxpayer: ItrFilingDraft["taxpayer"],
  prefill: Partial<Record<string, string>>,
) {
  const next: Record<string, unknown> = { ...taxpayer };
  for (const [field, value] of Object.entries(prefill)) {
    if (!value) continue;
    const current = next[field];
    if (typeof current !== "string" || !current.trim()) {
      next[field] = value;
    }
  }
  return next as ItrFilingDraft["taxpayer"];
}

async function findSelfProfile(userId: string): Promise<Record<string, any> | null> {
  const snapshot = await adminDb.collection("profiles").where("userId", "==", userId).get();
  const profiles: Record<string, any>[] = snapshot.docs.map(
    (doc) => ({ ...(doc.data() as Record<string, any>), id: doc.id }),
  );
  return profiles.find((profile) =>
    String(profile.relation ?? "").toLowerCase() === "self" && profile.isActive !== false
  ) ?? null;
}

type OwnerPrefill = {
  filingOwner: ItrFilingDraft["filingOwner"];
  taxpayer: Partial<Record<string, string>>;
};

async function buildOwnerPrefill(
  req: AuthRequest,
  userId: string,
  data: { owner?: "self" | "member"; profileId?: string | null },
): Promise<OwnerPrefill | null> {
  if (!data.owner) return null;

  if (data.owner === "member" && data.profileId) {
    const profileDoc = await adminDb.collection("profiles").doc(data.profileId).get();
    const profile = profileDoc.exists ? (profileDoc.data() as Record<string, any>) : null;
    if (!profile) return null;
    const { firstName, lastName } = splitFullName(profile.name);
    return {
      filingOwner: {
        mode: "other",
        personId: profileDoc.id,
        relationship: String(profile.relation ?? ""),
        displayName: String(profile.name ?? ""),
      },
      taxpayer: {
        firstName,
        lastName,
        pan: decryptPII(profile.pan) ?? "",
        aadhaar: decryptPII(profile.aadhaar) ?? "",
        dateOfBirth: typeof profile.dateOfBirth === "string" ? profile.dateOfBirth : "",
      },
    };
  }

  const user = (req.user ?? {}) as Record<string, any>;
  const selfProfile = await findSelfProfile(userId);
  return {
    filingOwner: { mode: "self", personId: "", relationship: "", displayName: "" },
    taxpayer: {
      firstName: String(user.firstName ?? ""),
      lastName: String(user.lastName ?? ""),
      email: String(user.email ?? ""),
      mobile: String(user.phoneNumber ?? "").replace(/\D/g, "").slice(-10),
      pan: selfProfile ? decryptPII(selfProfile.pan) ?? "" : "",
      aadhaar: selfProfile ? decryptPII(selfProfile.aadhaar) ?? "" : "",
      dateOfBirth: selfProfile && typeof selfProfile.dateOfBirth === "string" ? selfProfile.dateOfBirth : "",
    },
  };
}

function storedFilingOwnerMode(record: Record<string, any>) {
  try {
    const raw = typeof record.formData === "string" ? JSON.parse(record.formData) : record.formData;
    return raw?.filingOwner?.mode === "other" ? "other" : "self";
  } catch {
    return "self";
  }
}

async function findResumableTaxReturn(
  userId: string,
  assessmentYear: string,
  data: { owner?: "self" | "member"; profileId?: string | null },
) {
  if (!data.owner) return null;
  const records = await getUserOwnedRecords("tax_returns", userId);
  return records.find((record) => {
    if (String(record.assessmentYear ?? "") !== assessmentYear) return false;
    if (!OPEN_DRAFT_STATUSES.has(String(record.status ?? "draft"))) return false;
    if (data.owner === "member") return record.profileId === data.profileId;
    return !record.profileId && storedFilingOwnerMode(record) === "self";
  }) ?? null;
}

async function assertProfileCanBeLinked(userId: string, profileId?: string | null) {
  if (!profileId) return;
  if (await recordBelongsToUser("profiles", profileId, userId)) return;

  const error = new Error("Linked profile does not belong to this user.");
  (error as Error & { status?: number }).status = 400;
  throw error;
}

async function getAccessibleTaxReturn(req: AuthRequest, id: string) {
  const doc = await adminDb.collection("tax_returns").doc(id).get();
  if (!doc.exists) return null;
  return doc.data()?.userId === req.auth?.userId ? doc : null;
}

async function getReviewAccessibleTaxReturn(req: AuthRequest, id: string) {
  const doc = await adminDb.collection("tax_returns").doc(id).get();
  if (!doc.exists) return null;
  const userId = doc.data()?.userId;
  if (userId === req.auth?.userId) return doc;
  if ((isAdmin(req.user) || isCa(req.user)) && await canAccessUserData(req.user, userId)) return doc;
  return null;
}

function isReviewActor(req: AuthRequest) {
  return isAdmin(req.user) || isCa(req.user);
}

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = await resolveTargetUserId(req);
    if (!userId) return errorResponse(res, 401, "Unauthorized");

    const records = await getUserOwnedRecords("tax_returns", userId);
    const taxReturns = records
      .map((record) => serializeTaxReturn(String(record.id), record))
      .sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));

    res.json({ success: true, taxReturns });
  } catch (error) {
    return routeError(res, error, "Failed to list tax returns");
  }
});

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = await resolveTargetUserId(req);
    if (!userId) return errorResponse(res, 401, "Unauthorized");

    const data = createTaxReturnSchema.parse(req.body);
    await assertProfileCanBeLinked(userId, data.profileId);

    const resumable = await findResumableTaxReturn(userId, data.assessmentYear, data);
    if (resumable) {
      const serialized = serializeTaxReturn(String(resumable.id), resumable);
      return res.json({
        success: true,
        taxReturn: serialized,
        recommendation: serialized.recommendation,
        resumed: true,
      });
    }

    const baseDraft = normalizeItrDraft({
      ...(typeof data.draft === "object" && data.draft ? data.draft : {}),
      assessmentYear: data.assessmentYear,
    });
    const ownerPrefill = await buildOwnerPrefill(req, userId, data);
    const draft = ownerPrefill
      ? normalizeItrDraft({
          ...baseDraft,
          filingOwner: ownerPrefill.filingOwner,
          taxpayer: fillEmptyTaxpayerFields(baseDraft.taxpayer, ownerPrefill.taxpayer),
        })
      : baseDraft;
    const recommendation = recommendItrForm(draft);
    const taxSummary = buildTaxSummary(draft);
    const calculatedTax = computeItrTaxLiability(draft);
    const now = new Date();
    const taxReturnRef = adminDb.collection("tax_returns").doc();
    const taxReturn = {
      id: taxReturnRef.id,
      userId,
      profileId: data.profileId ?? null,
      assessmentYear: draft.assessmentYear,
      itrType: recommendation.form,
      status: "draft",
      reviewStatus: "draft",
      formData: JSON.stringify(secureDraftForStorage(draft)),
      recommendation,
      documentChecklist: getItrDocumentChecklist(draft),
      taxSummary,
      calculatedTax,
      attribution: normalizeCampaignAttribution(data.attribution) ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await taxReturnRef.set(taxReturn);
    res.json({
      success: true,
      taxReturn: serializeTaxReturn(taxReturnRef.id, taxReturn),
      recommendation,
    });
  } catch (error) {
    return routeError(res, error, "Failed to create tax return");
  }
});

router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await getAccessibleTaxReturn(req, req.params.id);
    if (!doc) return errorResponse(res, 404, "Tax return not found");

    res.json({
      success: true,
      taxReturn: serializeTaxReturn(doc.id, doc.data() as Record<string, any>),
    });
  } catch (error) {
    return routeError(res, error, "Failed to fetch tax return");
  }
});

router.post("/:id/documents", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const taxReturnDoc = await getAccessibleTaxReturn(req, req.params.id);
    if (!taxReturnDoc) return errorResponse(res, 404, "Tax return not found");

    const { documentId, checklistItemId } = linkDocumentSchema.parse(req.body);
    const documentDoc = await adminDb.collection("documents").doc(documentId).get();
    if (!documentDoc.exists) return errorResponse(res, 404, "Document not found");

    const taxReturn = taxReturnDoc.data() as Record<string, any>;
    const document = documentDoc.data() as Record<string, any>;
    if (document.userId !== taxReturn.userId) {
      return errorResponse(res, 403, "Document does not belong to this tax return owner");
    }

    const existingDraft = parseStoredDraft(taxReturn);
    const allowedChecklistItemIds = new Set(getItrDocumentChecklist(existingDraft).map((item) => item.id));
    if (!allowedChecklistItemIds.has(checklistItemId)) {
      return errorResponse(res, 400, "Unknown tax-return checklist item");
    }
    const draft = normalizeItrDraft({
      ...existingDraft,
      documents: {
        ...existingDraft.documents,
        [checklistItemId]: documentId,
      },
      documentDeferrals: Object.fromEntries(
        Object.entries(existingDraft.documentDeferrals).filter(([id]) => id !== checklistItemId),
      ),
    });
    const recommendation = recommendItrForm(draft);
    const taxSummary = buildTaxSummary(draft);
    const calculatedTax = computeItrTaxLiability(draft);
    const updateData = {
      formData: JSON.stringify(secureDraftForStorage(draft)),
      recommendation,
      itrType: recommendation.form,
      documentChecklist: getItrDocumentChecklist(draft),
      taxSummary,
      calculatedTax,
      updatedAt: new Date(),
    };

    await documentDoc.ref?.update({ taxReturnId: taxReturnDoc.id, updatedAt: new Date() });
    await taxReturnDoc.ref?.update(updateData);

    res.json({
      success: true,
      taxReturn: serializeTaxReturn(taxReturnDoc.id, { ...taxReturn, ...updateData }),
      document: {
        id: documentDoc.id,
        name: document.name ?? document.originalName ?? "document",
        taxReturnId: taxReturnDoc.id,
      },
      recommendation,
    });
  } catch (error) {
    return routeError(res, error, "Failed to link document to tax return");
  }
});

router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await getAccessibleTaxReturn(req, req.params.id);
    if (!doc) return errorResponse(res, 404, "Tax return not found");

    const existing = doc.data() as Record<string, any>;
    const data = updateTaxReturnSchema.parse(req.body);
    await assertProfileCanBeLinked(existing.userId, data.profileId);

    const existingDraft = parseStoredDraft(existing);
    const draft = data.draft === undefined
      ? normalizeItrDraft({ ...existingDraft, assessmentYear: data.assessmentYear ?? existingDraft.assessmentYear })
      : normalizeItrDraft({
          ...existingDraft,
          ...(typeof data.draft === "object" && data.draft ? data.draft : {}),
          assessmentYear: data.assessmentYear ?? existingDraft.assessmentYear,
        });
    const recommendation = recommendItrForm(draft);
    const taxSummary = buildTaxSummary(draft);
    const calculatedTax = computeItrTaxLiability(draft);
    const updateData = {
      ...(data.profileId !== undefined ? { profileId: data.profileId } : {}),
      ...(data.attribution !== undefined ? { attribution: normalizeCampaignAttribution(data.attribution) ?? null } : {}),
      assessmentYear: draft.assessmentYear,
      itrType: recommendation.form,
      formData: JSON.stringify(secureDraftForStorage(draft)),
      recommendation,
      documentChecklist: getItrDocumentChecklist(draft),
      taxSummary,
      calculatedTax,
      updatedAt: new Date(),
    };

    await doc.ref?.update(updateData);
    const updated = { ...existing, ...updateData };

    res.json({
      success: true,
      taxReturn: serializeTaxReturn(doc.id, updated),
      recommendation,
    });
  } catch (error) {
    return routeError(res, error, "Failed to update tax return");
  }
});

router.post("/:id/recommendation", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await getAccessibleTaxReturn(req, req.params.id);
    if (!doc) return errorResponse(res, 404, "Tax return not found");

    const draft = parseStoredDraft(doc.data() as Record<string, any>);
    const recommendation = recommendItrForm(draft);
    const calculatedTax = computeItrTaxLiability(draft);
    await doc.ref?.update({
      recommendation,
      itrType: recommendation.form,
      taxSummary: buildTaxSummary(draft),
      calculatedTax,
      updatedAt: new Date(),
    });

    res.json({ success: true, recommendation, calculatedTax });
  } catch (error) {
    return routeError(res, error, "Failed to generate tax return recommendation");
  }
});

router.post("/:id/submit-review", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await getAccessibleTaxReturn(req, req.params.id);
    if (!doc) return errorResponse(res, 404, "Tax return not found");

    const existing = doc.data() as Record<string, any>;
    const draft = parseStoredDraft(existing);
    const verificationReport = buildItrVerificationReport(draft);
    if (verificationReport.summary.critical > 0) {
      return res.status(422).json({
        success: false,
        error: "Resolve critical verification issues before submitting for CA review.",
        verificationReport,
      });
    }

    const recommendation = recommendItrForm(draft);
    const reviewPacket = buildItrReviewPacket(draft, doc.id);
    const taxSummary = buildTaxSummary(draft);
    const calculatedTax = computeItrTaxLiability(draft);
    let userServiceId = existing.userServiceId as string | undefined;
    if (!userServiceId) {
      const serviceRef = adminDb.collection("user_services").doc();
      await serviceRef.set({
        userId: existing.userId,
        serviceId: "itr-filing",
        serviceTitle: "CA ITR Filing Review",
        serviceCategory: "Income Tax",
        profileId: existing.profileId ?? null,
        paymentAmount: null,
        paymentStatus: "pending",
        status: "pending",
        metadata: {
          source: "itr_filing_workspace",
          linkedTaxReturnId: doc.id,
          assessmentYear: existing.assessmentYear ?? draft.assessmentYear,
          recommendedForm: recommendation.form,
          attribution: normalizeCampaignAttribution(existing.attribution) ?? null,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userServiceId = serviceRef.id;
      await recordWorkflowEvent({
        type: "service_case_created",
        title: "ITR review service case created",
        message: "A service case was created from the submitted ITR review packet.",
        sourceType: "user_service",
        sourceId: serviceRef.id,
        caseId: serviceRef.id,
        userId: existing.userId,
        targetRole: "team_member",
        actorUserId: existing.userId,
        actorRole: "user",
        priority: "high",
        metadata: {
          linkedTaxReturnId: doc.id,
          attribution: normalizeCampaignAttribution(existing.attribution) ?? null,
        },
      });
    }
    const updateData = {
      status: "ready_for_review",
      reviewStatus: "ready_for_review",
      itrType: recommendation.form,
      recommendation,
      reviewPacket: secureReviewPacketForStorage(reviewPacket),
      taxSummary,
      calculatedTax,
      userServiceId,
      updatedAt: new Date(),
    };

    await doc.ref?.update(updateData);
    const updated = { ...existing, ...updateData };
    await runWhatsAppSideEffect("queue review submitted template", () => enqueueWhatsAppTemplateForUser({
      userId: existing.userId,
      templateName: "review_submitted",
      sourceType: "tax_return",
      sourceId: doc.id,
      caseId: userServiceId || null,
      variables: {
        assessment_year: existing.assessmentYear ?? draft.assessmentYear ?? "2026-27",
      },
    }));

    res.json({
      success: true,
      taxReturn: serializeTaxReturn(doc.id, updated),
      reviewPacket,
    });
  } catch (error) {
    return routeError(res, error, "Failed to submit tax return for CA review");
  }
});

router.patch("/:id/review-status", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!isReviewActor(req)) return errorResponse(res, 403, "Only a CA or admin can update review status");

    const doc = await getReviewAccessibleTaxReturn(req, req.params.id);
    if (!doc) return errorResponse(res, 404, "Tax return not found");

    const data = reviewStatusSchema.parse(req.body);
    if (!CA_REVIEW_STATUSES.has(data.status)) {
      return errorResponse(res, 400, "Use submit-review to move a draft into ready_for_review");
    }

    const existing = doc.data() as Record<string, any>;
    const now = new Date();
    const statusHistory = Array.isArray(existing.reviewStatusHistory) ? existing.reviewStatusHistory : [];
    const updateData = {
      status: data.status,
      reviewStatus: data.status,
      ...(data.acknowledgmentNumber !== undefined ? { acknowledgmentNumber: data.acknowledgmentNumber } : {}),
      ...(data.refundAmount !== undefined ? { refundAmount: data.refundAmount } : {}),
      ...(data.filedAt !== undefined ? { filedAt: data.filedAt ? new Date(data.filedAt) : null } : {}),
      reviewStatusHistory: [
        ...statusHistory,
        {
          status: data.status,
          notes: data.notes,
          actorId: req.auth?.userId ?? req.user?.id ?? null,
          actorRole: req.user?.role ?? null,
          createdAt: now,
        },
      ],
      updatedAt: now,
    };

    await doc.ref?.update(updateData);
    const templateName = reviewStatusTemplate(data.status);
    if (templateName) {
      await runWhatsAppSideEffect("queue review status template", () => enqueueWhatsAppTemplateForUser({
        userId: existing.userId,
        templateName,
        sourceType: "tax_return",
        sourceId: doc.id,
        caseId: existing.userServiceId || null,
        variables: {
          assessment_year: existing.assessmentYear ?? "2026-27",
          review_status: data.status.replace(/_/g, " "),
        },
      }));
    }

    res.json({
      success: true,
      taxReturn: serializeTaxReturn(doc.id, { ...existing, ...updateData }),
    });
  } catch (error) {
    return routeError(res, error, "Failed to update tax return review status");
  }
});

router.get("/:id/review-packet", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await getReviewAccessibleTaxReturn(req, req.params.id);
    if (!doc) return errorResponse(res, 404, "Tax return not found");

    const data = doc.data() as Record<string, any>;
    const reviewPacket = data.reviewPacket
      ? decryptReviewPacketForResponse(data.reviewPacket)
      : buildItrReviewPacket(parseStoredDraft(data), doc.id);

    res.json({ success: true, reviewPacket });
  } catch (error) {
    return routeError(res, error, "Failed to build tax return review packet");
  }
});

router.get("/:id/export-json", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await getReviewAccessibleTaxReturn(req, req.params.id);
    if (!doc) return errorResponse(res, 404, "Tax return not found");

    const data = doc.data() as Record<string, any>;
    const exportPayload = buildItrDraftJsonExport(parseStoredDraft(data), doc.id);

    res.json(exportPayload);
  } catch (error) {
    return routeError(res, error, "Failed to export tax return JSON");
  }
});

export default router;
