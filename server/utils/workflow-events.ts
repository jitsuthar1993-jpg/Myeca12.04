import { adminDb } from "../data-admin.js";
import { isAdmin, isCa, isTeamMember, type AppUserRecord } from "./access-control.js";

export type WorkflowSourceType =
  | "consultation_request"
  | "user_service"
  | "tax_return"
  | "document"
  | "payment_link_request"
  | "reminder";

export type WorkflowEventInput = {
  type: string;
  title: string;
  message?: string;
  sourceType: WorkflowSourceType;
  sourceId: string;
  caseId?: string | null;
  userId?: string | null;
  targetRole?: "admin" | "team_member" | "ca" | "user" | null;
  targetUserId?: string | null;
  actorUserId?: string | null;
  actorRole?: string | null;
  priority?: "low" | "medium" | "high" | "urgent";
  metadata?: Record<string, unknown>;
  createdAt?: Date;
};

export type WorkflowEventRecord = WorkflowEventInput & {
  id: string;
  createdAt: unknown;
  updatedAt: unknown;
};

function asTime(value: unknown) {
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : null;
  const time = date?.getTime() ?? 0;
  return Number.isNaN(time) ? 0 : time;
}

function serializeEvent(doc: any): WorkflowEventRecord {
  return {
    id: doc.id,
    ...(doc.data() as Record<string, unknown>),
  } as WorkflowEventRecord;
}

export async function recordWorkflowEvent(input: WorkflowEventInput) {
  if (!input.sourceId) return null;

  const now = input.createdAt || new Date();
  const payload = {
    ...input,
    message: input.message || input.title,
    caseId: input.caseId || null,
    userId: input.userId || null,
    targetRole: input.targetRole || null,
    targetUserId: input.targetUserId || null,
    actorUserId: input.actorUserId || null,
    actorRole: input.actorRole || null,
    priority: input.priority || "medium",
    metadata: input.metadata || {},
    createdAt: now,
    updatedAt: now,
  };

  const ref = await adminDb.collection("workflow_events").add(payload);
  return { id: ref.id, ...payload };
}

export async function listWorkflowEvents(filters: {
  caseId?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  userId?: string | null;
  targetRole?: string | null;
  targetUserId?: string | null;
} = {}) {
  const snapshot = await adminDb.collection("workflow_events").get();
  return snapshot.docs
    .map(serializeEvent)
    .filter((event) => !filters.caseId || event.caseId === filters.caseId)
    .filter((event) => !filters.sourceType || event.sourceType === filters.sourceType)
    .filter((event) => !filters.sourceId || event.sourceId === filters.sourceId)
    .filter((event) => !filters.userId || event.userId === filters.userId)
    .filter((event) => !filters.targetRole || event.targetRole === filters.targetRole)
    .filter((event) => !filters.targetUserId || event.targetUserId === filters.targetUserId)
    .sort((a, b) => asTime(b.createdAt) - asTime(a.createdAt));
}

export function canViewWorkflowEvent(actor: AppUserRecord | null | undefined, event: WorkflowEventRecord) {
  if (!actor) return false;
  if (isAdmin(actor)) return true;
  if (isTeamMember(actor)) {
    return event.targetRole === "team_member" || event.sourceType === "consultation_request";
  }
  if (isCa(actor)) {
    return event.targetUserId === actor.id || event.targetRole === "ca";
  }
  return event.userId === actor.id || event.targetUserId === actor.id;
}
