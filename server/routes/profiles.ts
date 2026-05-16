import { Router, Response } from "express";
import { z } from "zod";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";
import { decryptPII, encryptPII, maskAadhaar, maskPan } from "../utils/encryption.js";
import { errorResponse, safeError } from "../utils/error-response.js";
import { assertCanAccessUserData, getAccessibleSnapshot, getUserOwnedRecords } from "../utils/access-control.js";

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

function normalizeUserId(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function resolveTargetUserId(req: AuthRequest) {
  const authUserId = req.auth?.userId;
  if (!authUserId) return null;
  const requestedUserId = normalizeUserId(req.body?.userId ?? req.query?.userId);
  if (!requestedUserId || requestedUserId === authUserId) return authUserId;
  await assertCanAccessUserData(req.user, requestedUserId);
  return requestedUserId;
}

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  const auth = req.auth;
  if (!auth?.userId) {
    return errorResponse(res, 401, "Unauthorized");
  }

  try {
    const userId = await resolveTargetUserId(req);
    if (!userId) return errorResponse(res, 401, "Unauthorized");
    const records = await getUserOwnedRecords("profiles", userId);
    const profiles = records.map((profile) => serializeProfile(String(profile.id), profile));
    res.json(profiles);
  } catch (error) {
    return safeError(res, error, "Failed to fetch profiles");
  }
});

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth?.userId) {
      return errorResponse(res, 401, "Unauthorized");
    }

    const userId = await resolveTargetUserId(req);
    if (!userId) return errorResponse(res, 401, "Unauthorized");
    const data = profileCreateSchema.parse(req.body);
    const profileRef = adminDb.collection("profiles").doc();
    const newProfile = {
      ...data,
      userId,
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
      return errorResponse(res, 400, error.errors[0].message);
    }
    return safeError(res, error, "Failed to create profile");
  }
});

router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth?.userId) {
      return errorResponse(res, 401, "Unauthorized");
    }

    const { id } = req.params;
    const profileRef = adminDb.collection("profiles").doc(id);
    const doc = await getAccessibleSnapshot("profiles", id, req.user);

    if (!doc) {
      return errorResponse(res, 404, "Profile not found");
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
      return errorResponse(res, 400, error.errors[0].message);
    }
    return safeError(res, error, "Failed to update profile");
  }
});

export default router;
