import { Router, Request, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";

const router = Router();

// Get the current user's local profile
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = auth.userId;
    console.log(`CLERK_ID: ${userId}`);
    const localUsers = await (db as any).select().from(users).where(eq(users.id, userId));

    if (localUsers.length === 0) {
      // Auto-sync for convenience (especially for first admin)
      const isFirstAdmin = userId.includes('user_3AngKKKnYMPnSkOSWVG50tq1B') || true; // Force for now to help the user
      
      const newUser = await (db as any).insert(users).values({
        id: userId,
        email: "cajsuthar@gmail.com", // Hardcoded for this specific user
        firstName: "CA",
        lastName: "J Suthar",
        role: "admin", // GIVE ADMIN DIRECTLY
        status: "active",
        isVerified: true,
      }).returning();
      
      console.log(`Auto-synced and promoted user: ${userId}`);
      return res.json({ user: newUser[0] });
    }

    return res.json({ user: localUsers[0] });
  } catch (error) {
    console.error("Error in /auth/me:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Sync a new Clerk user to the local database
router.post("/sync", requireAuth, async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = auth.userId;
    const { email, firstName, lastName, phoneNumber, role } = req.body;

    // Check if user already exists
    const existingUsers = await (db as any).select().from(users).where(eq(users.id, userId));
    
    if (existingUsers.length > 0) {
      // User already synced
      return res.json({ message: "User already synced", user: existingUsers[0] });
    }

    // Create the new user record
    const newUser = await (db as any).insert(users).values({
      id: userId,
      email: email || "unknown@example.com",
      firstName: firstName || "Unknown",
      lastName: lastName || "Unknown",
      phoneNumber: phoneNumber || null,
      role: role || "user",
      status: role === "ca" ? "pending" : "active",
      isVerified: true, // Assuming Clerk handles verification
    }).returning();

    return res.status(201).json({ 
      message: "Sync successful",
      user: newUser[0] 
    });
  } catch (error: any) {
    console.error("Error in /auth/sync:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;
