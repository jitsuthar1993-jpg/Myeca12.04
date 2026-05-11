import { Response, Router } from "express";
import { authenticateToken, type AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";
import { z } from "zod";

const router = Router();

const reportRequestSchema = z.object({
  type: z.enum(["tax_summary", "refund_status", "compliance", "business_overview", "client_activity"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(["pdf", "excel", "csv"]).default("pdf"),
  filters: z.record(z.any()).optional(),
});

const templates = [
  {
    id: "tax_summary",
    name: "Tax Summary Report",
    description: "Comprehensive tax filing summary with deductions and refunds",
    icon: "FileText",
    color: "blue",
  },
  {
    id: "refund_status",
    name: "Refund Status Report",
    description: "Track all pending and processed refunds",
    icon: "DollarSign",
    color: "green",
  },
  {
    id: "compliance",
    name: "Compliance Report",
    description: "Monthly compliance status and upcoming deadlines",
    icon: "Shield",
    color: "purple",
  },
  {
    id: "business_overview",
    name: "Business Overview",
    description: "Complete business performance metrics and insights",
    icon: "TrendingUp",
    color: "orange",
  },
  {
    id: "client_activity",
    name: "Client Activity Report",
    description: "Detailed client engagement and service usage",
    icon: "Users",
    color: "yellow",
  },
];

function requireUser(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return req.user;
}

router.post("/generate", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const { type, startDate, endDate, format, filters } = reportRequestSchema.parse(req.body);
    const now = new Date();
    const reportData = {
      type,
      name: `${templates.find((template) => template.id === type)?.name ?? type} - ${now.toISOString().slice(0, 10)}`,
      generatedAt: now,
      userId: user.id,
      status: "completed",
      format,
      filters: filters ?? {},
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      data: await generateReportData(user.id, type, { startDate, endDate, filters }),
      createdAt: now,
      updatedAt: now,
    };

    const ref = await adminDb.collection("reports").add(reportData);
    res.json({ success: true, report: { id: ref.id, ...reportData } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: "Failed to generate report" });
  }
});

router.get("/templates", authenticateToken, (_req: AuthRequest, res: Response) => {
  res.json({ success: true, templates });
});

router.get("/history", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const snapshot = await adminDb.collection("reports")
    .where("userId", "==", user.id)
    .get();

  const reports = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => new Date(b.generatedAt ?? b.createdAt ?? 0).getTime() - new Date(a.generatedAt ?? a.createdAt ?? 0).getTime());

  res.json({ success: true, reports });
});

async function generateReportData(userId: string, type: string, options: any) {
  const [returnsSnapshot, docsSnapshot, servicesSnapshot] = await Promise.all([
    adminDb.collection("tax_returns").where("userId", "==", userId).get(),
    adminDb.collection("documents").where("userId", "==", userId).where("status", "==", "active").get(),
    adminDb.collection("user_services").where("userId", "==", userId).get(),
  ]);

  const returns = returnsSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }));
  const documents = docsSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }));
  const services = servicesSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }));

  if (type === "refund_status") {
    return {
      refunds: returns.map((entry: any) => ({
        id: entry.id,
        assessmentYear: entry.assessmentYear,
        refundAmount: entry.refundAmount ?? 0,
        status: entry.status ?? "draft",
      })),
    };
  }

  if (type === "compliance") {
    return {
      activeServices: services.filter((service: any) => service.status !== "completed" && service.status !== "cancelled"),
      documentsUploaded: documents.length,
      filters: options.filters ?? {},
    };
  }

  if (type === "client_activity") {
    return {
      servicesUsed: services.length,
      documentsUploaded: documents.length,
      filings: returns.length,
    };
  }

  return {
    returns,
    documentsUploaded: documents.length,
    activeServices: services,
    period: {
      startDate: options.startDate ?? null,
      endDate: options.endDate ?? null,
    },
  };
}

export default router;
