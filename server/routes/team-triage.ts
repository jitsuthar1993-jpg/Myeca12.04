import { Response, Router } from "express";
import { z } from "zod";
import { requireAuth, requireTeamMember, type AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";
import { notifyAdmins, notifyRole } from "../utils/workflow-notifications.js";
import { recordWorkflowEvent } from "../utils/workflow-events.js";
import { safeError } from "../utils/error-response.js";

const router = Router();

const triageStatusSchema = z.enum(["new", "contacted", "needs_info", "escalated_admin", "escalated_ca", "closed"]);
const updateTriageSchema = z.object({
  status: triageStatusSchema,
  internalNote: z.string().trim().max(2000).optional(),
}).strict();

function asTime(value: unknown) {
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : null;
  const time = date?.getTime() ?? 0;
  return Number.isNaN(time) ? 0 : time;
}

function normalizeConsultation(doc: any) {
  const data = doc.data() as Record<string, unknown>;
  return {
    id: doc.id,
    sourceType: "consultation_request",
    name: data.name,
    email: data.email,
    phone: data.phone,
    service: data.service,
    source: data.source,
    formId: data.formId ?? null,
    serviceIntent: data.serviceIntent ?? null,
    preferredTime: data.preferredTime,
    message: data.message,
    status: data.status || "new",
    internalNote: data.internalNote ?? null,
    triagedBy: data.triagedBy ?? null,
    triagedAt: data.triagedAt ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

async function listConsultationTriageItems() {
  const snapshot = await adminDb.collection("consultation_requests").get();
  return snapshot.docs
    .map(normalizeConsultation)
    .filter((item) => !["converted", "closed"].includes(String(item.status)))
    .sort((a, b) => asTime(b.createdAt) - asTime(a.createdAt));
}

router.get("/", requireAuth, requireTeamMember, async (_req: AuthRequest, res: Response) => {
  try {
    const items = await listConsultationTriageItems();
    res.json({ success: true, items, total: items.length });
  } catch (error) {
    return safeError(res, error, "Failed to load team triage queue");
  }
});

router.patch("/consultation_requests/:id", requireAuth, requireTeamMember, async (req: AuthRequest, res: Response) => {
  try {
    const updates = updateTriageSchema.parse(req.body || {});
    const ref = adminDb.collection("consultation_requests").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "Triage item not found" });
    }

    const now = new Date();
    await ref.update({
      status: updates.status,
      ...(updates.internalNote ? { internalNote: updates.internalNote } : {}),
      triagedBy: req.user?.id || req.auth?.userId || null,
      triagedAt: now,
      updatedAt: now,
    });

    await recordWorkflowEvent({
      type: "intake_triaged",
      title: "Intake triaged",
      message: updates.internalNote || `Team marked intake as ${updates.status.replace(/_/g, " ")}.`,
      sourceType: "consultation_request",
      sourceId: req.params.id,
      targetRole: updates.status === "escalated_ca" ? "ca" : updates.status === "escalated_admin" ? "admin" : "team_member",
      actorUserId: req.user?.id || req.auth?.userId || null,
      actorRole: req.user?.role || null,
      priority: updates.status === "needs_info" ? "high" : "medium",
      metadata: { status: updates.status },
    });

    if (updates.status === "escalated_admin") {
      await notifyAdmins({
        title: "Team escalated intake",
        message: updates.internalNote || "A team triage item needs admin review.",
        type: "warning",
        metadata: { consultationRequestId: req.params.id },
      });
    }

    if (updates.status === "escalated_ca") {
      await notifyRole("ca", {
        title: "Team escalated intake",
        message: updates.internalNote || "A team triage item may need CA review.",
        type: "info",
        metadata: { consultationRequestId: req.params.id },
      });
    }

    const updated = await ref.get();
    res.json({ success: true, item: normalizeConsultation(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors[0]?.message || "Invalid triage update" });
    }
    return safeError(res, error, "Failed to update team triage item");
  }
});

export default router;
