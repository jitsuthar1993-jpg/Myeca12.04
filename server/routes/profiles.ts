import { Router, Request, Response } from "express";
import { z } from "zod";
import { insertProfileSchema } from "../../shared/schema";
import { authenticateToken } from "../middleware/auth";
import { storage } from "../storage";

const router = Router();

// GET /api/profiles - list profiles for current user
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const profiles = await storage.getProfilesByUserId(user.id);
  res.json(profiles);
});

// POST /api/profiles - create a new profile for current user
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate body (omit userId, set it from token)
    const bodySchema = insertProfileSchema.omit({ userId: true });
    const data = bodySchema.parse(req.body);

    const created = await storage.createProfile({
      ...data,
      userId: user.id,
    } as any);

    res.json(created);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Failed to create profile" });
  }
});

// PATCH /api/profiles/:id - update an existing profile
router.patch("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    const userProfiles = await storage.getProfilesByUserId(user.id);
    const target = userProfiles.find(p => p.id === id);
    if (!target) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const updateSchema = insertProfileSchema.omit({ userId: true }).partial();
    const updateData = updateSchema.parse(req.body);

    const updated = await storage.updateProfile(id, updateData as any);
    if (!updated) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;