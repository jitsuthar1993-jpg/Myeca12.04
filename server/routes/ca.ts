import { Router, Response } from "express";
import { z } from "zod";
import { requireAuth, requireCA, AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";
import { canAccessUserData, isAdmin } from "../utils/access-control.js";
import { buildServiceCaseDetail, buildServiceCaseQueue } from "../utils/case-queue.js";
import { createReminder } from "../utils/reminders.js";
import { recordWorkflowEvent } from "../utils/workflow-events.js";
import { enqueueWhatsAppTemplateForUser } from "../services/whatsapp-client-workflow.js";
import { whatsappTemplateForCaseStatus } from "../../shared/whatsapp-status.js";
import { notifyAdmins, notifyUser } from "../utils/workflow-notifications.js";

async function runWhatsAppSideEffect(label: string, task: () => Promise<unknown>) {
  try {
    await task();
  } catch (error) {
    console.warn("[WHATSAPP] " + label + " failed; primary CA case update was already saved.", error);
  }
}

const router = Router();
const updateCaseSchema = z.object({
  status: z.enum(["pending", "in_progress", "client_response_needed", "completed", "closed"]).optional(),
  caNote: z.string().trim().max(2000).optional(),
  reminderMessage: z.string().trim().max(1000).optional(),
  reminderDueAt: z.string().datetime().optional(),
}).strict();

async function getAccessibleClients(req: AuthRequest) {
  const actor = req.user;
  if (!actor) return [];

  const snapshot = isAdmin(actor)
    ? await adminDb.collection("users").get()
    : await adminDb.collection("users").where("assignedCaId", "==", actor.id).get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }))
    .filter((client: any) => client.role === "user" || !client.role);
}

async function getUserFilings(userId: string) {
  const directSnapshot = await adminDb.collection("tax_returns")
    .where("userId", "==", userId)
    .get();
  const filings: any[] = directSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }));
  const seen = new Set(filings.map((filing) => filing.id));

  const profileSnapshot = await adminDb.collection("profiles")
    .where("userId", "==", userId)
    .get();
  const profiles: any[] = profileSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }));

  for (const profile of profiles) {
    const legacySnapshot = await adminDb.collection("tax_returns")
      .where("profileId", "==", profile.id)
      .get();

    legacySnapshot.docs.forEach((doc) => {
      if (seen.has(doc.id)) return;
      seen.add(doc.id);
      filings.push({
        id: doc.id,
        ...(doc.data() as Record<string, any>),
        userId,
        profileName: profile.name,
      });
    });
  }

  return filings;
}

router.get("/clients", requireAuth, requireCA, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const clients = await getAccessibleClients(req);
    const clientsWithStats = await Promise.all(
      clients.map(async (client: any) => {
        const filings = await getUserFilings(client.id);
        return {
          ...client,
          filingCount: filings.length,
          pendingCount: filings.filter((f: any) => f.status === "draft" || f.status === "pending").length,
        };
      }),
    );

    res.json({
      success: true,
      data: {
        clients: clientsWithStats,
        total: clientsWithStats.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching CA clients:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch clients" });
  }
});

router.get("/clients/:userId/documents", requireAuth, requireCA, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { userId } = req.params;
    if (!(await canAccessUserData(req.user, userId))) {
      return res.status(403).json({ error: "This client is not assigned to you." });
    }

    const userDoc = await adminDb.collection("users").doc(userId).get();
    const client = userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
    const docsSnapshot = await adminDb.collection("documents")
      .where("userId", "==", userId)
      .where("status", "==", "active")
      .get();

    const clientDocs = docsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: { documents: clientDocs, client } });
  } catch (error: any) {
    console.error("Error fetching client documents:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch documents" });
  }
});

router.get("/cases", requireAuth, requireCA, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const cases = await buildServiceCaseQueue(isAdmin(req.user) ? {} : { assignedCaId: req.user.id });
    res.json({
      success: true,
      data: {
        cases,
        total: cases.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching CA cases:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch cases" });
  }
});

router.get("/cases/:id", requireAuth, requireCA, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const serviceCase = await buildServiceCaseDetail(req.params.id);
    if (!serviceCase) {
      return res.status(404).json({ success: false, error: "Case not found" });
    }

    if (!isAdmin(req.user) && serviceCase.assignedCaId !== req.user.id) {
      return res.status(403).json({ success: false, error: "This case is not assigned to you." });
    }

    res.json({ success: true, data: { case: serviceCase } });
  } catch (error: any) {
    console.error("Error fetching CA case:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch case" });
  }
});

router.patch("/cases/:id", requireAuth, requireCA, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const updates = updateCaseSchema.parse(req.body || {});
    const serviceCase = await buildServiceCaseDetail(req.params.id);
    if (!serviceCase) {
      return res.status(404).json({ success: false, error: "Case not found" });
    }

    if (!isAdmin(req.user) && serviceCase.assignedCaId !== req.user.id) {
      return res.status(403).json({ success: false, error: "This case is not assigned to you." });
    }

    const serviceRef = adminDb.collection("user_services").doc(req.params.id);
    const current = (await serviceRef.get()).data() as Record<string, any>;
    const metadata = {
      ...(current.metadata || {}),
      ...(updates.caNote ? { caNote: updates.caNote, caNoteUpdatedAt: new Date() } : {}),
    };
    const payload: Record<string, any> = { metadata, updatedAt: new Date() };
    if (updates.status) payload.status = updates.status;
    await serviceRef.update(payload);
    const whatsappTemplate = whatsappTemplateForCaseStatus(updates.status);
    if (whatsappTemplate && serviceCase.userId) {
      await runWhatsAppSideEffect("queue case status update", () => enqueueWhatsAppTemplateForUser({
        userId: String(serviceCase.userId),
        templateName: whatsappTemplate,
        sourceType: "user_service",
        sourceId: req.params.id,
        caseId: req.params.id,
        variables: {
          service_name: serviceCase.serviceTitle || "your MyeCA case",
          case_status: updates.status,
        },
      }));
    }

    await recordWorkflowEvent({
      type: updates.status === "completed" ? "filing_completed" : "case_ca_updated",
      title: updates.status === "completed" ? "Service case completed" : "CA updated case",
      message: updates.caNote || (updates.status === "completed"
        ? "The assigned CA marked the service case complete."
        : `Case status updated to ${updates.status || current.status || "updated"}.`),
      sourceType: "user_service",
      sourceId: req.params.id,
      caseId: req.params.id,
      userId: serviceCase.userId as string,
      targetRole: updates.status === "client_response_needed" ? "user" : "admin",
      targetUserId: updates.status === "client_response_needed" ? String(serviceCase.userId || "") : null,
      actorUserId: req.user.id,
      actorRole: req.user.role || "ca",
      priority: updates.status === "client_response_needed" ? "high" : "medium",
      metadata: { status: updates.status ?? null },
    });

    await Promise.all([
      notifyAdmins({
        title: "CA updated service case",
        message: updates.caNote || "A CA updated an assigned service case.",
        type: "info",
        metadata: { userServiceId: req.params.id, userId: serviceCase.userId || null },
      }),
      updates.status === "client_response_needed"
        ? notifyUser(String(serviceCase.userId || ""), {
            title: "Action needed on your case",
            message: updates.caNote || "Your CA needs more information on your service case.",
            type: "warning",
            metadata: { actionUrl: `/dashboard/services/${req.params.id}`, userServiceId: req.params.id },
          })
        : Promise.resolve(),
      updates.reminderMessage && serviceCase.userId
        ? createReminder({
            title: "Action needed on your case",
            message: updates.reminderMessage,
            targetRole: "user",
            targetUserId: String(serviceCase.userId),
            caseId: req.params.id,
            sourceType: "user_service",
            sourceId: req.params.id,
            dueAt: updates.reminderDueAt || null,
            priority: "high",
            metadata: { actionUrl: `/dashboard/services/${req.params.id}` },
          })
        : Promise.resolve(),
    ]);

    const updated = await buildServiceCaseDetail(req.params.id);
    res.json({ success: true, data: { case: updated } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors[0]?.message || "Invalid case update" });
    }
    console.error("Error updating CA case:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update case" });
  }
});

router.get("/clients/:userId/filings", requireAuth, requireCA, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { userId } = req.params;
    if (!(await canAccessUserData(req.user, userId))) {
      return res.status(403).json({ error: "This client is not assigned to you." });
    }

    const userDoc = await adminDb.collection("users").doc(userId).get();
    const client = userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
    const filings = await getUserFilings(userId);

    res.json({ success: true, data: { filings, client } });
  } catch (error: any) {
    console.error("Error fetching client filings:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch filings" });
  }
});

router.get("/stats", requireAuth, requireCA, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const clients = await getAccessibleClients(req);
    let totalFilings = 0;
    let pendingFilings = 0;

    for (const client of clients) {
      const filings = await getUserFilings((client as any).id);
      totalFilings += filings.length;
      pendingFilings += filings.filter((f: any) => f.status === "draft" || f.status === "pending").length;
    }

    res.json({
      success: true,
      data: {
        totalClients: clients.length,
        totalFilings,
        pendingFilings,
        completedFilings: totalFilings - pendingFilings,
      },
    });
  } catch (error: any) {
    console.error("Error fetching CA stats:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch stats" });
  }
});

export default router;
