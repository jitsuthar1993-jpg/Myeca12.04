import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

// Workflow schema
const workflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  trigger: z.object({
    type: z.enum(["schedule", "event", "manual", "condition"]),
    config: z.record(z.any())
  }),
  actions: z.array(z.object({
    type: z.enum(["email", "notification", "document", "compliance_check", "reminder", "report"]),
    config: z.record(z.any())
  })),
  enabled: z.boolean().default(true)
});

// Mock workflow storage
const userWorkflows = new Map<number, any[]>();

// Get workflow templates
router.get("/templates", authenticateToken, (req: Request, res: Response) => {
  const templates = [
    {
      id: "tax_filing_reminder",
      name: "Tax Filing Reminder",
      description: "Automated reminders for tax filing deadlines",
      category: "Tax",
      trigger: { type: "schedule", config: { frequency: "monthly", date: 25 } },
      actions: [
        { type: "email", config: { template: "tax_reminder" } },
        { type: "notification", config: { priority: "high" } }
      ]
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
        { type: "report", config: { type: "compliance_summary" } }
      ]
    },
    {
      id: "document_expiry",
      name: "Document Expiry Alert",
      description: "Alert when important documents are about to expire",
      category: "Documents",
      trigger: { type: "condition", config: { check: "document_expiry", days_before: 30 } },
      actions: [
        { type: "email", config: { template: "document_expiry" } },
        { type: "notification", config: { priority: "high" } }
      ]
    },
    {
      id: "refund_tracker",
      name: "Refund Status Tracker",
      description: "Track and notify about tax refund status",
      category: "Tax",
      trigger: { type: "schedule", config: { frequency: "weekly", day: "monday" } },
      actions: [
        { type: "compliance_check", config: { type: "refund_status" } },
        { type: "email", config: { template: "refund_update" } }
      ]
    },
    {
      id: "quarterly_report",
      name: "Quarterly Business Report",
      description: "Generate and send quarterly business reports",
      category: "Reports",
      trigger: { type: "schedule", config: { frequency: "quarterly", day: 1 } },
      actions: [
        { type: "report", config: { type: "quarterly_business" } },
        { type: "email", config: { template: "report_ready", attach_report: true } }
      ]
    }
  ];
  
  res.json({
    success: true,
    templates
  });
});

// Create workflow
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const workflowData = workflowSchema.parse(req.body);
    
    if (!userWorkflows.has(userId)) {
      userWorkflows.set(userId, []);
    }
    
    const workflows = userWorkflows.get(userId)!;
    
    const workflow = {
      id: workflows.length + 1,
      userId,
      ...workflowData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
      lastRun: null,
      nextRun: calculateNextRun(workflowData.trigger),
      runs: 0
    };
    
    workflows.push(workflow);
    
    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Failed to create workflow" });
  }
});

// Get user workflows
router.get("/", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const workflows = userWorkflows.get(userId) || [];
  
  res.json({
    success: true,
    workflows: workflows.filter(w => w.status !== "deleted"),
    total: workflows.length
  });
});

// Get workflow details
router.get("/:id", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const workflowId = parseInt(req.params.id);
  
  const workflows = userWorkflows.get(userId) || [];
  const workflow = workflows.find(w => w.id === workflowId);
  
  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }
  
  res.json({
    success: true,
    workflow
  });
});

// Update workflow
router.patch("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const workflowId = parseInt(req.params.id);
    
    const workflows = userWorkflows.get(userId) || [];
    const workflowIndex = workflows.findIndex(w => w.id === workflowId);
    
    if (workflowIndex === -1) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    
    const updateData = workflowSchema.partial().parse(req.body);
    
    workflows[workflowIndex] = {
      ...workflows[workflowIndex],
      ...updateData,
      updatedAt: new Date(),
      nextRun: updateData.trigger ? calculateNextRun(updateData.trigger) : workflows[workflowIndex].nextRun
    };
    
    res.json({
      success: true,
      workflow: workflows[workflowIndex]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Failed to update workflow" });
  }
});

// Toggle workflow enabled state
router.post("/:id/toggle", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const workflowId = parseInt(req.params.id);
  
  const workflows = userWorkflows.get(userId) || [];
  const workflowIndex = workflows.findIndex(w => w.id === workflowId);
  
  if (workflowIndex === -1) {
    return res.status(404).json({ error: "Workflow not found" });
  }
  
  workflows[workflowIndex].enabled = !workflows[workflowIndex].enabled;
  workflows[workflowIndex].updatedAt = new Date();
  
  res.json({
    success: true,
    workflow: workflows[workflowIndex]
  });
});

// Delete workflow
router.delete("/:id", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const workflowId = parseInt(req.params.id);
  
  const workflows = userWorkflows.get(userId) || [];
  const workflowIndex = workflows.findIndex(w => w.id === workflowId);
  
  if (workflowIndex === -1) {
    return res.status(404).json({ error: "Workflow not found" });
  }
  
  workflows[workflowIndex].status = "deleted";
  workflows[workflowIndex].deletedAt = new Date();
  
  res.json({
    success: true,
    message: "Workflow deleted successfully"
  });
});

// Get workflow run history
router.get("/:id/history", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const workflowId = parseInt(req.params.id);
  
  // Mock run history
  const history = [
    {
      id: 1,
      workflowId,
      startedAt: new Date("2025-01-24T10:00:00"),
      completedAt: new Date("2025-01-24T10:00:05"),
      status: "success",
      actionsRun: 3,
      logs: ["Email sent", "Notification created", "Report generated"]
    },
    {
      id: 2,
      workflowId,
      startedAt: new Date("2025-01-23T10:00:00"),
      completedAt: new Date("2025-01-23T10:00:04"),
      status: "success",
      actionsRun: 3,
      logs: ["Email sent", "Notification created", "Report generated"]
    }
  ];
  
  res.json({
    success: true,
    history
  });
});

// Helper function to calculate next run time
function calculateNextRun(trigger: any): Date | null {
  if (trigger.type !== "schedule") return null;
  
  const now = new Date();
  const { frequency } = trigger.config;
  
  switch (frequency) {
    case "daily":
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (trigger.config.time) {
        const [hours, minutes] = trigger.config.time.split(":");
        tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      return tomorrow;
      
    case "weekly":
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
      
    case "monthly":
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      if (trigger.config.date) {
        nextMonth.setDate(trigger.config.date);
      }
      return nextMonth;
      
    case "quarterly":
      const nextQuarter = new Date(now);
      nextQuarter.setMonth(nextQuarter.getMonth() + 3);
      return nextQuarter;
      
    default:
      return null;
  }
}

export default router;