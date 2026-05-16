import { Response, Router } from "express";
import { authenticateToken, type AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";
import { z } from "zod";

const router = Router();
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

const workflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  trigger: z.object({
    type: z.enum(["schedule", "event", "manual", "condition"]),
    config: z.record(z.any()),
  }),
  actions: z.array(z.object({
    type: z.enum(["email", "notification", "document", "compliance_check", "reminder", "report"]),
    config: z.record(z.any()),
  })),
  enabled: z.boolean().default(true),
  profileId: z.string().optional().nullable(),
  serviceId: z.string().optional().nullable(),
});

const templates = [
  {
    id: "tax_filing_reminder",
    name: "Tax Filing Reminder",
    description: "Automated reminders for tax filing deadlines",
    category: "Tax",
    trigger: { type: "schedule", config: { frequency: "monthly", date: 25 } },
    actions: [
      { type: "email", config: { template: "tax_reminder" } },
      { type: "notification", config: { priority: "high" } },
    ],
  },
  {
    id: "compliance_monitor",
    name: "Compliance Monitor",
    description: "Monitor compliance deadlines and send alerts",
    category: "Compliance",
    trigger: { type: "schedule", config: { frequency: "daily", time: "09:00" } },
    actions: [
      { type: "compliance_check", config: { types: ["gst", "tds", "income_tax"] } },
      { type: "notification", config: { priority: "medium" } },
      { type: "report", config: { type: "compliance_summary" } },
    ],
  },
  {
    id: "document_expiry",
    name: "Document Expiry Alert",
    description: "Alert when important documents are about to expire",
    category: "Documents",
    trigger: { type: "condition", config: { check: "document_expiry", days_before: 30 } },
    actions: [
      { type: "email", config: { template: "document_expiry" } },
      { type: "notification", config: { priority: "high" } },
    ],
  },
  {
    id: "refund_tracker",
    name: "Refund Status Tracker",
    description: "Track and notify about tax refund status",
    category: "Tax",
    trigger: { type: "schedule", config: { frequency: "weekly", day: "monday" } },
    actions: [
      { type: "compliance_check", config: { type: "refund_status" } },
      { type: "email", config: { template: "refund_update" } },
    ],
  },
];

function calculateNextRun(trigger: any): Date | null {
  if (trigger.type !== "schedule") return null;

  const now = new Date();
  const { frequency } = trigger.config;

  if (frequency === "daily") {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (trigger.config.time) {
      const [hours, minutes] = trigger.config.time.split(":");
      tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    return tomorrow;
  }

  if (frequency === "weekly") {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  }

  if (frequency === "monthly") {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (trigger.config.date) nextMonth.setDate(trigger.config.date);
    return nextMonth;
  }

  if (frequency === "quarterly") {
    const nextQuarter = new Date(now);
    nextQuarter.setMonth(nextQuarter.getMonth() + 3);
    return nextQuarter;
  }

  return null;
}

function requireUser(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return req.user;
}

function parsePagination(query: AuthRequest["query"]) {
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
  const limit = Math.max(1, Math.min(MAX_PAGE_SIZE, parseInt(String(query.limit ?? DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
  return { page, limit, offset: (page - 1) * limit };
}

async function getOwnedWorkflow(userId: string, workflowId: string): Promise<any | null> {
  const doc = await adminDb.collection("workflows").doc(workflowId).get();
  if (!doc.exists) return null;
  const workflow: any = { id: doc.id, ...(doc.data() as Record<string, any>) };
  return workflow.userId === userId ? workflow : null;
}

router.get("/templates", authenticateToken, (_req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    backendStatus: "demo",
    templates,
  });
});

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const workflowData = workflowSchema.parse(req.body);
    const now = new Date();
    const workflow = {
      userId: user.id,
      ...workflowData,
      createdAt: now,
      updatedAt: now,
      status: "active",
      lastRun: null,
      nextRun: calculateNextRun(workflowData.trigger),
      runs: 0,
    };

    const ref = await adminDb.collection("workflows").add(workflow);
    res.json({ success: true, backendStatus: "mixed", workflow: { id: ref.id, ...workflow } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: "Failed to create workflow" });
  }
});

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const { page, limit, offset } = parsePagination(req.query);
  const baseQuery = adminDb.collection("workflows").where("userId", "==", user.id);
  const countSnapshot = await (baseQuery as any).count().get();
  const total = countSnapshot.data().count;
  const snapshot = await (baseQuery as any)
    .offset(offset)
    .limit(limit)
    .get();
  const workflows = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((workflow: any) => workflow.status !== "deleted");

  res.json({ success: true, backendStatus: "mixed", workflows, total, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const workflow = await getOwnedWorkflow(user.id, req.params.id);
  if (!workflow || workflow.status === "deleted") {
    return res.status(404).json({ error: "Workflow not found" });
  }

  res.json({ success: true, workflow });
});

router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const workflow = await getOwnedWorkflow(user.id, req.params.id);
    if (!workflow) return res.status(404).json({ error: "Workflow not found" });

    const updateData = workflowSchema.partial().parse(req.body);
    const finalUpdate = {
      ...updateData,
      updatedAt: new Date(),
      nextRun: updateData.trigger ? calculateNextRun(updateData.trigger) : workflow.nextRun,
    };

    await adminDb.collection("workflows").doc(req.params.id).update(finalUpdate);
    res.json({ success: true, workflow: { ...workflow, ...finalUpdate } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: "Failed to update workflow" });
  }
});

router.post("/:id/toggle", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const workflow = await getOwnedWorkflow(user.id, req.params.id);
  if (!workflow) return res.status(404).json({ error: "Workflow not found" });

  const finalUpdate = { enabled: !workflow.enabled, updatedAt: new Date() };
  await adminDb.collection("workflows").doc(req.params.id).update(finalUpdate);
  res.json({ success: true, workflow: { ...workflow, ...finalUpdate } });
});

router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const workflow = await getOwnedWorkflow(user.id, req.params.id);
  if (!workflow) return res.status(404).json({ error: "Workflow not found" });

  await adminDb.collection("workflows").doc(req.params.id).update({
    status: "deleted",
    deletedAt: new Date(),
    updatedAt: new Date(),
  });

  res.json({ success: true, message: "Workflow deleted successfully" });
});

router.get("/:id/history", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const workflow = await getOwnedWorkflow(user.id, req.params.id);
  if (!workflow) return res.status(404).json({ error: "Workflow not found" });

  res.json({ success: true, history: workflow.history ?? [] });
});

export default router;
