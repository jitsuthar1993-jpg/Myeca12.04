import { Router, Response } from "express";
import { requireAuth, requireCA, AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";
import { canAccessUserData, isAdmin } from "../utils/access-control.js";

const router = Router();

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
