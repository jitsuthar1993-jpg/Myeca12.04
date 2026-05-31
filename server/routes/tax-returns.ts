import { Router, Response } from "express";
import { z } from "zod";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";
import { errorResponse, safeError } from "../utils/error-response.js";
import {
  ITR_REVIEW_STATUSES,
  buildItrDraftJsonExport,
  buildItrReviewPacket,
  calculateItrTotalDeductions,
  calculateItrTotalIncome,
  calculateItrTotalTaxPaid,
  getItrDocumentChecklist,
  normalizeItrDraft,
  recommendItrForm,
  type ItrFilingDraft,
} from "../../shared/itr-filing.js";
import {
  canAccessUserData,
  isAdmin,
  isCa,
  getUserOwnedRecords,
  recordBelongsToUser,
} from "../utils/access-control.js";

const router = Router();

const createTaxReturnSchema = z.object({
  assessmentYear: z.string().trim().min(1).default("2026-27"),
  profileId: z.string().trim().min(1).nullable().optional(),
  draft: z.unknown().optional(),
});

const updateTaxReturnSchema = z.object({
  assessmentYear: z.string().trim().min(1).optional(),
  profileId: z.string().trim().min(1).nullable().optional(),
  draft: z.unknown().optional(),
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

function parseStoredDraft(data: Record<string, any>): ItrFilingDraft {
  if (data.formData && typeof data.formData === "string") {
    try {
      return normalizeItrDraft(JSON.parse(data.formData));
    } catch {
      return normalizeItrDraft({});
    }
  }

  if (data.formData && typeof data.formData === "object") {
    return normalizeItrDraft(data.formData);
  }

  return normalizeItrDraft({});
}

function serializeTaxReturn(id: string, data: Record<string, any>) {
  const draft = parseStoredDraft(data);
  const recommendation = data.recommendation ?? recommendItrForm(draft);

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
    reviewPacket: data.reviewPacket ?? null,
    taxSummary: data.taxSummary ?? buildTaxSummary(draft),
    calculatedTax: data.calculatedTax ?? null,
    refundAmount: data.refundAmount ?? null,
    acknowledgmentNumber: data.acknowledgmentNumber ?? null,
    filedAt: data.filedAt ?? null,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

function buildTaxSummary(draft: ItrFilingDraft) {
  return {
    totalIncome: calculateItrTotalIncome(draft),
    totalDeductions: calculateItrTotalDeductions(draft),
    totalTaxPaid: calculateItrTotalTaxPaid(draft),
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

async function resolveTargetUserId(req: AuthRequest) {
  const authUserId = req.auth?.userId;
  if (!authUserId) return null;
  return authUserId;
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

    const draft = normalizeItrDraft({
      ...(typeof data.draft === "object" && data.draft ? data.draft : {}),
      assessmentYear: data.assessmentYear,
    });
    const recommendation = recommendItrForm(draft);
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
      formData: JSON.stringify(draft),
      recommendation,
      documentChecklist: getItrDocumentChecklist(draft),
      taxSummary: buildTaxSummary(draft),
      calculatedTax: null,
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
    const draft = normalizeItrDraft({
      ...existingDraft,
      documents: {
        ...existingDraft.documents,
        [checklistItemId]: documentId,
      },
    });
    const recommendation = recommendItrForm(draft);
    const updateData = {
      formData: JSON.stringify(draft),
      recommendation,
      itrType: recommendation.form,
      documentChecklist: getItrDocumentChecklist(draft),
      taxSummary: buildTaxSummary(draft),
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
    const updateData = {
      ...(data.profileId !== undefined ? { profileId: data.profileId } : {}),
      assessmentYear: draft.assessmentYear,
      itrType: recommendation.form,
      formData: JSON.stringify(draft),
      recommendation,
      documentChecklist: getItrDocumentChecklist(draft),
      taxSummary: buildTaxSummary(draft),
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
    await doc.ref?.update({ recommendation, itrType: recommendation.form, updatedAt: new Date() });

    res.json({ success: true, recommendation });
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
    const recommendation = recommendItrForm(draft);
    const reviewPacket = buildItrReviewPacket(draft, doc.id);
    const updateData = {
      status: "ready_for_review",
      reviewStatus: "ready_for_review",
      itrType: recommendation.form,
      recommendation,
      reviewPacket,
      updatedAt: new Date(),
    };

    await doc.ref?.update(updateData);
    const updated = { ...existing, ...updateData };

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
    const reviewPacket = data.reviewPacket ?? buildItrReviewPacket(parseStoredDraft(data), doc.id);

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
