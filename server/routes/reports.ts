import { Response, Router } from "express";
import { authenticateToken, type AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";
import { z } from "zod";

const router = Router();
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const REPORT_DATA_LIMIT = 500;

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

function parsePagination(query: AuthRequest["query"]) {
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
  const limit = Math.max(1, Math.min(MAX_PAGE_SIZE, parseInt(String(query.limit ?? DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
  return { page, limit, offset: (page - 1) * limit };
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
    res.json({ success: true, backendStatus: "mixed", report: { id: ref.id, ...reportData } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: "Failed to generate report" });
  }
});

router.get("/templates", authenticateToken, (_req: AuthRequest, res: Response) => {
  res.json({ success: true, backendStatus: "demo", templates });
});

router.get("/history", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const { page, limit, offset } = parsePagination(req.query);
    const baseQuery = adminDb.collection("reports").where("userId", "==", user.id);
    let reports: any[];
    let total: number;

    try {
      const countSnapshot = await (baseQuery as any).count().get();
      total = countSnapshot.data().count;
      const snapshot = await (baseQuery as any)
        .orderBy("generatedAt", "desc")
        .offset(offset)
        .limit(limit)
        .get();
      reports = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch {
      const snapshot = await (baseQuery as any).limit(Math.min(500, offset + limit)).get();
      const allReports = snapshot.docs
        .map((doc: any) => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => new Date(b.generatedAt ?? b.createdAt ?? 0).getTime() - new Date(a.generatedAt ?? a.createdAt ?? 0).getTime());
      total = allReports.length;
      reports = allReports.slice(offset, offset + limit);
    }

    res.json({
      success: true,
      backendStatus: "mixed",
      reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report history" });
  }
});

async function generateReportData(userId: string, type: string, options: any) {
  const [returnsSnapshot, docsSnapshot, servicesSnapshot] = await Promise.all([
    adminDb.collection("tax_returns").where("userId", "==", userId).limit(REPORT_DATA_LIMIT).get(),
    adminDb.collection("documents").where("userId", "==", userId).where("status", "==", "active").limit(REPORT_DATA_LIMIT).get(),
    adminDb.collection("user_services").where("userId", "==", userId).limit(REPORT_DATA_LIMIT).get(),
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
