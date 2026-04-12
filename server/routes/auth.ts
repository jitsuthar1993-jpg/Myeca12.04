import { Router, Response } from "express";
import { z } from "zod";
import { adminDb } from "../neon-admin.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { validateRequest } from "../middleware/security.js";
import {
  findOrCreateUserProfile,
  getBootstrapRoleForEmail,
  getProvisionedRoleForEmail,
  syncRoleClaims,
} from "../services/user-accounts.js";
import { safeError } from "../utils/error-response.js";
import { getCachedUser, setCachedUser } from "../utils/user-cache.js";

const router = Router();
const syncUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  phoneNumber: z.string().trim().max(20).optional().nullable(),
});

const logoutEventSchema = z.object({
  reason: z.enum(["manual", "timeout", "session_expired"]),
});

router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    let userData = getCachedUser(auth.userId);

    if (!userData) {
      const userDoc = await findOrCreateUserProfile(auth);
      userData = userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;

      if (userData) {
        setCachedUser(auth.userId, userData);
      }
    }

    if (!userData) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const user: any = { ...userData };
    if (user.assignedCaId) {
      const caDoc = await adminDb.collection("users").doc(user.assignedCaId).get();
      if (caDoc.exists) {
        const caData = caDoc.data()!;
        user.assignedCaName = `${caData.firstName} ${caData.lastName}`;
        user.assignedCaEmail = caData.email;
      }
    }

    return res.json({ user });
  } catch (error) {
    return safeError(res, error);
  }
});

router.post("/sync", requireAuth, validateRequest(syncUserSchema), async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = auth.userId;
    const { email, firstName, lastName, phoneNumber } = req.body;
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const currentData = userDoc.data()!;
      const role =
        (await getProvisionedRoleForEmail(email || currentData.email || auth.email)) ??
        currentData.role ??
        getBootstrapRoleForEmail(auth.email) ??
        "user";
      const updatedData = {
        ...currentData,
        email: email || currentData.email,
        firstName: firstName || currentData.firstName,
        lastName: lastName || currentData.lastName,
        phoneNumber: phoneNumber || currentData.phoneNumber,
        role,
        updatedAt: new Date(),
      };

      await userRef.update(updatedData);
      await syncRoleClaims(userId, role);
      setCachedUser(userId, updatedData);
      return res.json({ message: "User synced", user: { id: userId, ...updatedData } });
    }

    const role = (await getProvisionedRoleForEmail(email || auth.email)) ?? getBootstrapRoleForEmail(email || auth.email) ?? "user";
    const newUser = {
      id: userId,
      email: email || auth.email || null,
      firstName: firstName || "User",
      lastName: lastName || "",
      phoneNumber: phoneNumber || null,
      role,
      status: "active",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await userRef.set(newUser);
    await syncRoleClaims(userId, role);
    setCachedUser(userId, newUser);
    return res.status(201).json({
      message: "Sync successful",
      user: newUser,
    });
  } catch (error) {
    return safeError(res, error);
  }
});

router.post("/logout-event", requireAuth, validateRequest(logoutEventSchema), async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { reason } = req.body;
    await adminDb.collection("audit_logs").doc().set({
      userId: auth.userId,
      email: auth.email ?? null,
      action: reason === "timeout" ? "logout_timeout" : `logout_${reason}`,
      category: "authentication",
      status: "success",
      metadata: {
        reason,
        ip: req.ip,
        userAgent: req.get("user-agent") ?? null,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    return safeError(res, error, "Failed to record logout event");
  }
});

export default router;
