import { Router, Response } from "express";
import { requireAuth, requireCA, AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../neon-admin.js";

const router = Router();

// GET /api/ca/clients — List all users assigned to the logged-in CA
router.get("/clients", requireAuth, requireCA, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || !auth.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const caId = auth.userId;

    // Get all users assigned to this CA
    const snapshot = await adminDb.collection("users")
      .where("assignedCaId", "==", caId)
      .get();
    
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get filing counts for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client: any) => {
        // Get all profiles for this client
        const profileSnapshot = await adminDb.collection("profiles")
          .where("userId", "==", client.id)
          .get();
        
        const clientProfiles = profileSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        let filingCount = 0;
        let pendingCount = 0;
        
        for (const profile of clientProfiles) {
          // This compatibility adapter can count server-side later; for now keep existing behavior.
          // but for now we follow the existing logic logic
          const filingsSnapshot = await adminDb.collection("tax_returns")
            .where("profileId", "==", profile.id)
            .get();
          
          const filings = filingsSnapshot.docs.map(doc => doc.data());
          filingCount += filings.length;
          pendingCount += filings.filter((f: any) => f.status === "draft" || f.status === "pending").length;
        }

        return {
          ...client,
          filingCount,
          pendingCount,
        };
      })
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

// GET /api/ca/clients/:userId/documents — View assigned user's documents
router.get("/clients/:userId/documents", requireAuth, requireCA, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || !auth.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const caId = auth.userId;
    const { userId } = req.params;

    // Verify this user is assigned to this CA
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const client = userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;

    if (!client || (client as any).assignedCaId !== caId) {
      return res.status(403).json({ error: "This client is not assigned to you." });
    }

    const docsSnapshot = await adminDb.collection("documents")
      .where("userId", "==", userId)
      .get();
    
    const clientDocs = docsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      data: { documents: clientDocs, client },
    });
  } catch (error: any) {
    console.error("Error fetching client documents:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch documents" });
  }
});

// GET /api/ca/clients/:userId/filings — View assigned user's tax returns
router.get("/clients/:userId/filings", requireAuth, requireCA, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || !auth.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const caId = auth.userId;
    const { userId } = req.params;

    // Verify this user is assigned to this CA
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const client = userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;

    if (!client || (client as any).assignedCaId !== caId) {
      return res.status(403).json({ error: "This client is not assigned to you." });
    }

    // Get all profiles for this user
    const profileSnapshot = await adminDb.collection("profiles")
      .where("userId", "==", userId)
      .get();
    
    const clientProfiles = profileSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get all filings across profiles
    const filings: any[] = [];
    for (const profile of clientProfiles) {
      const filingsSnapshot = await adminDb.collection("tax_returns")
        .where("profileId", "==", profile.id)
        .get();
      
      const profileFilings = filingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        profileName: (profile as any).name,
      }));
      filings.push(...profileFilings);
    }

    res.json({
      success: true,
      data: { filings, client },
    });
  } catch (error: any) {
    console.error("Error fetching client filings:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch filings" });
  }
});

// GET /api/ca/stats — CA dashboard statistics
router.get("/stats", requireAuth, requireCA, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || !auth.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const caId = auth.userId;

    const clientsSnapshot = await adminDb.collection("users")
      .where("assignedCaId", "==", caId)
      .get();
    
    const clients = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let totalFilings = 0;
    let pendingFilings = 0;

    for (const client of clients) {
      const profileSnapshot = await adminDb.collection("profiles")
        .where("userId", "==", (client as any).id)
        .get();

      const clientProfiles = profileSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      for (const profile of clientProfiles) {
        const filingsSnapshot = await adminDb.collection("tax_returns")
          .where("profileId", "==", profile.id)
          .get();
        
        const filings = filingsSnapshot.docs.map(doc => doc.data());
        totalFilings += filings.length;
        pendingFilings += filings.filter((f: any) => f.status === "draft" || f.status === "pending").length;
      }
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
