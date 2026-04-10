import { Router, Response } from "express";
import { z } from "zod";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { adminDb } from "../firebase-admin";
import { decryptPII, encryptPII, maskAadhaar, maskPan } from "../utils/encryption";
import { safeError } from "../utils/error-response";

const router = Router();
const profileCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  relation: z.string().trim().min(1).max(50).default("self"),
  pan: z.string().trim().toUpperCase().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/).optional().or(z.literal("")),
  aadhaar: z.string().trim().regex(/^[0-9]{12}$/).optional().or(z.literal("")),
  dateOfBirth: z.string().trim().max(50).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
});

const profileUpdateSchema = profileCreateSchema.partial();

function serializeProfile(docId: string, data: Record<string, any>) {
  const pan = decryptPII(data.pan);
  const aadhaar = decryptPII(data.aadhaar);

  return {
    id: docId,
    ...data,
    pan: maskPan(pan),
    aadhaar: maskAadhaar(aadhaar),
  };
}

function normalizeOptionalString(value?: string | null) {
  if (typeof value !== "string") {
    return value ?? null;
  }

  return value.trim() ? value.trim() : null;
}

function omitUndefined<T extends Record<string, any>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as Partial<T>;
}

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  const auth = req.auth;
  if (!auth?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const snapshot = await adminDb.collection("profiles")
      .where("userId", "==", auth.userId)
      .get();

    const profiles = snapshot.docs.map((doc) => serializeProfile(doc.id, doc.data() as Record<string, any>));
    res.json(profiles);
  } catch (error) {
    return safeError(res, error, "Failed to fetch profiles");
  }
});

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const data = profileCreateSchema.parse(req.body);
    const profileRef = adminDb.collection("profiles").doc();
    const newProfile = {
      ...data,
      userId: auth.userId,
      pan: data.pan ? encryptPII(data.pan) : null,
      aadhaar: data.aadhaar ? encryptPII(data.aadhaar) : null,
      dateOfBirth: normalizeOptionalString(data.dateOfBirth),
      address: normalizeOptionalString(data.address),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await profileRef.set(newProfile);
    res.json(serializeProfile(profileRef.id, newProfile));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return safeError(res, error, "Failed to create profile");
  }
});

router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const profileRef = adminDb.collection("profiles").doc(id);
    const doc = await profileRef.get();

    if (!doc.exists || doc.data()?.userId !== auth.userId) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const updateData = profileUpdateSchema.parse(req.body);
    const existingData = doc.data()!;
    const finalUpdate = {
      ...updateData,
      pan: updateData.pan
        ? encryptPII(updateData.pan)
        : updateData.pan === ""
          ? existingData.pan ?? null
          : undefined,
      aadhaar: updateData.aadhaar
        ? encryptPII(updateData.aadhaar)
        : updateData.aadhaar === ""
          ? existingData.aadhaar ?? null
          : undefined,
      dateOfBirth:
        updateData.dateOfBirth !== undefined
          ? normalizeOptionalString(updateData.dateOfBirth)
          : undefined,
      address:
        updateData.address !== undefined
          ? normalizeOptionalString(updateData.address)
          : undefined,
      updatedAt: new Date(),
    };

    await profileRef.update(omitUndefined(finalUpdate));
    const updatedDoc = await profileRef.get();
    res.json(serializeProfile(updatedDoc.id, updatedDoc.data() as Record<string, any>));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return safeError(res, error, "Failed to update profile");
  }
});

export default router;
