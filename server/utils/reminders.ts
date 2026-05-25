import { adminDb } from "../data-admin.js";
import { sendWorkflowEmail } from "../services/email.js";
import { createNotification } from "./workflow-notifications.js";
import { recordWorkflowEvent } from "./workflow-events.js";

type ReminderChannel = "in_app" | "email";
type ReminderPriority = "low" | "medium" | "high" | "urgent";
type ReminderStatus = "pending" | "sent" | "cancelled";
type ReminderTarget = {
  id: string;
  email?: unknown;
  status?: unknown;
};

export type ReminderInput = {
  title: string;
  message: string;
  targetRole: "admin" | "team_member" | "ca" | "user";
  targetUserId?: string | null;
  caseId?: string | null;
  sourceType: "consultation_request" | "user_service" | "tax_return" | "document" | "payment_link_request" | "reminder";
  sourceId: string;
  dueAt?: Date | string | null;
  priority?: ReminderPriority;
  channels?: ReminderChannel[];
  metadata?: Record<string, unknown>;
};

export type ReminderRecord = ReminderInput & {
  id: string;
  status: ReminderStatus;
  channels: ReminderChannel[];
  lastDelivery?: {
    inApp?: "sent" | "failed" | "skipped";
    email?: "sent" | "failed" | "skipped";
    emailError?: string;
  };
  createdAt?: unknown;
  updatedAt?: unknown;
};

function asTime(value: unknown) {
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : null;
  const time = date?.getTime() ?? 0;
  return Number.isNaN(time) ? 0 : time;
}

function normalizeDueAt(value?: Date | string | null) {
  if (!value) return new Date();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function serializeReminder(doc: any): ReminderRecord {
  return {
    id: doc.id,
    ...(doc.data() as Record<string, unknown>),
  } as ReminderRecord;
}

async function listActiveUsersByRole(role: string) {
  const snapshot = await adminDb.collection("users").where("role", "==", role).get();
  return snapshot.docs
    .map((doc: any) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }) as ReminderTarget)
    .filter((user) => String(user.status || "active").toLowerCase() !== "inactive");
}

async function resolveReminderTargets(reminder: ReminderRecord): Promise<ReminderTarget[]> {
  if (reminder.targetUserId) {
    const doc = await adminDb.collection("users").doc(reminder.targetUserId).get();
    return doc.exists ? [({ id: doc.id, ...(doc.data() as Record<string, unknown>) } as ReminderTarget)] : [];
  }

  return listActiveUsersByRole(reminder.targetRole);
}

export async function createReminder(input: ReminderInput) {
  if (!input.sourceId) return null;

  const now = new Date();
  const payload = {
    ...input,
    caseId: input.caseId || null,
    targetUserId: input.targetUserId || null,
    dueAt: normalizeDueAt(input.dueAt),
    priority: input.priority || "medium",
    channels: input.channels?.length ? input.channels : (["in_app", "email"] as ReminderChannel[]),
    metadata: input.metadata || {},
    status: "pending" as ReminderStatus,
    createdAt: now,
    updatedAt: now,
  };

  const ref = await adminDb.collection("reminders").add(payload);
  return { id: ref.id, ...payload };
}

export async function listReminders(filters: {
  status?: string | null;
  targetRole?: string | null;
  targetUserId?: string | null;
  caseId?: string | null;
} = {}) {
  const snapshot = await adminDb.collection("reminders").get();
  return snapshot.docs
    .map(serializeReminder)
    .filter((reminder) => !filters.status || reminder.status === filters.status)
    .filter((reminder) => !filters.targetRole || reminder.targetRole === filters.targetRole)
    .filter((reminder) => !filters.targetUserId || reminder.targetUserId === filters.targetUserId)
    .filter((reminder) => !filters.caseId || reminder.caseId === filters.caseId)
    .sort((a, b) => asTime(a.dueAt) - asTime(b.dueAt));
}

export async function processDueReminders(options: { now?: Date | string } = {}) {
  const now = normalizeDueAt(options.now || new Date());
  const due = (await listReminders({ status: "pending" })).filter((reminder) => asTime(reminder.dueAt) <= now.getTime());
  let processed = 0;
  const results: Array<{ id: string; status: ReminderStatus; email?: string; inApp?: string }> = [];

  for (const reminder of due) {
    const targets = await resolveReminderTargets(reminder);
    const existingDelivery = reminder.lastDelivery || {};
    const lastDelivery: ReminderRecord["lastDelivery"] = { ...existingDelivery };

    if (reminder.channels.includes("in_app") && existingDelivery.inApp !== "sent") {
      await Promise.all(targets.map((target) =>
        createNotification({
          userId: target.id,
          title: reminder.title,
          message: reminder.message,
          type: reminder.priority === "high" || reminder.priority === "urgent" ? "warning" : "info",
          metadata: {
            reminderId: reminder.id,
            caseId: reminder.caseId || null,
            sourceType: reminder.sourceType,
            sourceId: reminder.sourceId,
          },
        }),
      ));
      lastDelivery.inApp = targets.length ? "sent" : "skipped";
    }

    if (reminder.channels.includes("email") && existingDelivery.email !== "sent") {
      const emailTargets = targets.filter((target) => typeof target.email === "string" && target.email);
      if (!emailTargets.length) {
        lastDelivery.email = "skipped";
      } else {
        const emailResults = await Promise.all(emailTargets.map((target) =>
          sendWorkflowEmail(String(target.email), {
            subject: reminder.title,
            title: reminder.title,
            message: reminder.message,
            actionUrl: typeof reminder.metadata?.actionUrl === "string" ? reminder.metadata.actionUrl : undefined,
          }),
        ));
        const failed = emailResults.find((result) => !result.success);
        lastDelivery.email = failed ? "failed" : "sent";
        if (failed?.error) lastDelivery.emailError = failed.error;
      }
    }

    const complete =
      (!reminder.channels.includes("in_app") || lastDelivery.inApp === "sent" || lastDelivery.inApp === "skipped") &&
      (!reminder.channels.includes("email") || lastDelivery.email === "sent" || lastDelivery.email === "skipped");
    const status: ReminderStatus = complete ? "sent" : "pending";

    const reminderUpdate: Record<string, unknown> = {
      status,
      lastDelivery,
      updatedAt: new Date(),
    };
    if (complete) reminderUpdate.sentAt = now;

    await adminDb.collection("reminders").doc(reminder.id).update(reminderUpdate);

    await recordWorkflowEvent({
      type: status === "sent" ? "reminder_sent" : "reminder_delivery_failed",
      title: reminder.title,
      message: reminder.message,
      sourceType: "reminder",
      sourceId: reminder.id,
      caseId: reminder.caseId || null,
      targetRole: reminder.targetRole,
      targetUserId: reminder.targetUserId || null,
      priority: reminder.priority,
      metadata: { sourceType: reminder.sourceType, sourceId: reminder.sourceId, lastDelivery },
    });

    processed += complete ? 1 : 0;
    results.push({ id: reminder.id, status, email: lastDelivery.email, inApp: lastDelivery.inApp });
  }

  return { processed, attempted: due.length, results };
}
