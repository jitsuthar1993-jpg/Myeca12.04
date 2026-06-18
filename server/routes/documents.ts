import { Response, Router } from "express";
import { z } from "zod";
import type { NextFunction } from "express";
import multer from "multer";
import sharp from "sharp";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";
import { errorResponse, safeError } from "../utils/error-response.js";
import { createReminder } from "../utils/reminders.js";
import { recordWorkflowEvent } from "../utils/workflow-events.js";
import { notifyAdmins, notifyUser } from "../utils/workflow-notifications.js";
import {
  deletePrivateDocument,
  getPrivateDocument,
  putPrivateDocument,
} from "../services/document-storage.js";
import {
  assertCanAccessUserData,
  canAccessUserData,
  getAccessibleSnapshot,
  recordBelongsToUser,
} from "../utils/access-control.js";
import { fileBufferMatchesDeclaredType } from "../lib/file-signature.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error("Invalid file type. Only PDF, images, Word, and Excel files are allowed.");
      (error as Error & { status?: number }).status = 400;
      cb(error);
    }
  }
});

const documentSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  description: z.string().nullable().optional(),
  year: z.string().nullable().optional(),
  profileId: z.string().trim().min(1).nullable().optional(),
  serviceId: z.string().trim().min(1).nullable().optional(),
  userServiceId: z.string().trim().min(1).nullable().optional(),
  taxReturnId: z.string().trim().min(1).nullable().optional(),
});

function serializeDocument(docId: string, data: Record<string, any>) {
  return {
    id: docId,
    userId: data.userId,
    profileId: data.profileId ?? null,
    serviceId: data.serviceId ?? null,
    userServiceId: data.userServiceId ?? null,
    taxReturnId: data.taxReturnId ?? null,
    fileName: data.fileName ?? null,
    originalName: data.originalName ?? data.name ?? "document",
    name: data.name,
    mimeType: data.mimeType,
    size: data.size ?? 0,
    originalSize: data.originalSize ?? data.size ?? 0,
    storedSize: data.storedSize ?? data.size ?? 0,
    compressionType: data.compressionType ?? "none",
    compressionStatus: data.compressionStatus ?? "not_applicable",
    category: data.category,
    tags: data.tags ?? [],
    description: data.description ?? null,
    year: data.year ?? null,
    metadata: data.metadata ?? null,
    status: data.status,
    version: data.version ?? 1,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    isExternal: Boolean(data.isExternal),
    downloadPath: `/api/documents/${docId}/download`,
  };
}

function safePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 160);
}

function sanitizeGeneratedHtml(value: string) {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)=("|')javascript:[^"']*\2/gi, "");
}

function buildGeneratedWordHtml(htmlContent: string, title: string) {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${title.replace(/[<>&"']/g, "")}</title>
</head>
<body>
${sanitizeGeneratedHtml(htmlContent)}
</body>
</html>`;
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}

function normalizeLink(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function validateDocumentLinks(userId: string, links: {
  profileId?: string | null;
  userServiceId?: string | null;
  taxReturnId?: string | null;
}) {
  const checks = [
    { collection: "profiles", id: links.profileId, label: "profile" },
    { collection: "user_services", id: links.userServiceId, label: "service" },
    { collection: "tax_returns", id: links.taxReturnId, label: "tax return" },
  ];

  for (const check of checks) {
    if (check.id && !(await recordBelongsToUser(check.collection, check.id, userId))) {
      if (check.collection === "tax_returns") {
        const taxReturn = await adminDb.collection("tax_returns").doc(check.id).get();
        const profileId = taxReturn.data()?.profileId;
        if (taxReturn.exists && typeof profileId === "string" && await recordBelongsToUser("profiles", profileId, userId)) {
          continue;
        }
      }
      const error = new Error(`Linked ${check.label} does not belong to this user.`);
      (error as Error & { status?: number }).status = 400;
      throw error;
    }
  }
}

async function resolveTargetUserId(req: AuthRequest) {
  const authUserId = req.auth?.userId;
  if (!authUserId) return null;

  const requestedUserId = normalizeLink(req.body?.userId ?? req.query?.userId);
  if (!requestedUserId || requestedUserId === authUserId) return authUserId;

  await assertCanAccessUserData(req.user, requestedUserId);
  return requestedUserId;
}

function documentRouteError(res: Response, error: unknown, fallback: string) {
  const status = typeof (error as any)?.status === "number" ? (error as any).status : undefined;
  if (status) {
    return errorResponse(res, status, (error as Error).message || fallback);
  }
  return safeError(res, error, fallback);
}

function uploadSingleDocument(req: AuthRequest, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (error: unknown) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return errorResponse(res, 413, "File size must be 10 MB or smaller");
    }

    const status = typeof (error as any)?.status === "number" ? (error as any).status : 400;
    return errorResponse(res, status, (error as Error).message || "Failed to upload document");
  });
}

router.post("/upload", authenticateToken, uploadSingleDocument, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "No file uploaded");
    }

    // Validate real content against the declared type — multer only checks the client mimetype.
    if (!fileBufferMatchesDeclaredType(req.file.buffer, req.file.mimetype)) {
      return errorResponse(res, 400, "File content does not match its declared type.");
    }

    const userId = await resolveTargetUserId(req);
    if (!userId) {
      return errorResponse(res, 401, "Not authenticated");
    }

    const { name, category, tags, description, year, profileId, serviceId, userServiceId, taxReturnId } = req.body;
    const metadata = documentSchema.parse({
      name: name || req.file.originalname,
      category: category || "other",
      tags: tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [],
      description,
      year,
      profileId: normalizeLink(profileId),
      serviceId: normalizeLink(serviceId),
      userServiceId: normalizeLink(userServiceId || serviceId),
      taxReturnId: normalizeLink(taxReturnId),
    });
    await validateDocumentLinks(userId, metadata);

    let fileBuffer = req.file.buffer;
    const originalSize = req.file.size;
    let finalSize = req.file.size;
    let mimeType = req.file.mimetype;
    let compressionType: "image" | "pdf" | "none" = "none";
    let compressionStatus: "compressed" | "skipped" | "failed" | "not_applicable" = "not_applicable";

    if (req.file.mimetype.startsWith("image/")) {
      compressionType = "image";
      try {
        const compressed = await sharp(req.file.buffer)
          .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        if (compressed.length < req.file.size) {
          fileBuffer = compressed;
          finalSize = fileBuffer.length;
          mimeType = "image/jpeg";
          compressionStatus = "compressed";
        } else {
          compressionStatus = "skipped";
        }
      } catch (compressError) {
        console.error("Compression error:", compressError);
        compressionStatus = "failed";
      }
    } else if (req.file.mimetype === "application/pdf") {
      compressionType = "pdf";
      compressionStatus = "skipped";
    }

    const docRef = adminDb.collection("documents").doc();
    const fileName = `${Date.now()}-${safePathSegment(req.file.originalname)}`;
    const pathname = `documents/${userId}/${docRef.id}/${fileName}`;
    const blob = await putPrivateDocument(pathname, fileBuffer, {
      contentType: mimeType,
    });

    const newDoc = {
      userId,
      fileName,
      originalName: req.file.originalname,
      mimeType,
      size: finalSize,
      originalSize,
      storedSize: finalSize,
      compressionType,
      compressionStatus,
      profileId: metadata.profileId ?? null,
      serviceId: metadata.serviceId ?? null,
      userServiceId: metadata.userServiceId ?? null,
      taxReturnId: metadata.taxReturnId ?? null,
      uploadPath: blob.pathname,
      blobUrl: blob.url,
      downloadUrl: blob.downloadUrl,
      name: metadata.name,
      category: metadata.category,
      tags: metadata.tags || [],
      description: metadata.description || null,
      year: metadata.year || null,
      status: "active",
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await docRef.set(newDoc);
    await recordWorkflowEvent({
      type: "document_uploaded",
      title: "Document uploaded",
      message: `${metadata.name} was uploaded to a user workspace.`,
      sourceType: "document",
      sourceId: docRef.id,
      caseId: metadata.userServiceId ?? null,
      userId,
      targetRole: metadata.userServiceId ? "ca" : "admin",
      actorUserId: req.user?.id || req.auth?.userId || null,
      actorRole: req.user?.role || null,
      priority: "medium",
      metadata: {
        documentId: docRef.id,
        userServiceId: metadata.userServiceId ?? null,
        taxReturnId: metadata.taxReturnId ?? null,
        category: metadata.category,
      },
    });
    if (metadata.userServiceId) {
      const service = await adminDb.collection("user_services").doc(metadata.userServiceId).get();
      await createReminder({
        title: "Review uploaded document",
        message: `${metadata.name} was attached to an assigned case.`,
        targetRole: service.data()?.assignedCaId ? "ca" : "admin",
        targetUserId: service.data()?.assignedCaId || null,
        caseId: metadata.userServiceId,
        sourceType: "document",
        sourceId: docRef.id,
        priority: "medium",
        metadata: { actionUrl: `/dashboard/services/${metadata.userServiceId}` },
      });
    }
    await Promise.all([
      notifyAdmins({
        title: "Document uploaded",
        message: `${metadata.name} was uploaded to a user workspace.`,
        type: "info",
        metadata: {
          documentId: docRef.id,
          userId,
          userServiceId: metadata.userServiceId ?? null,
          taxReturnId: metadata.taxReturnId ?? null,
        },
      }),
      (async () => {
        if (!metadata.userServiceId) return;
        const service = await adminDb.collection("user_services").doc(metadata.userServiceId).get();
        await notifyUser(service.data()?.assignedCaId, {
          title: "Client document uploaded",
          message: `${metadata.name} was attached to an assigned case.`,
          type: "info",
          metadata: {
            documentId: docRef.id,
            userId,
            userServiceId: metadata.userServiceId,
            taxReturnId: metadata.taxReturnId ?? null,
          },
        });
      })(),
    ]);
    res.json({
      success: true,
      document: serializeDocument(docRef.id, newDoc)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, error.errors[0].message);
    }
    return documentRouteError(res, error, "Failed to upload document");
  }
});

router.post("/register", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = await resolveTargetUserId(req);
    if (!userId || !req.auth) return errorResponse(res, 401, "Unauthorized");

    const schema = z.object({
      name: z.string(),
      url: z.string().url().refine(
        (url) => {
          return url.startsWith("https://") && (url.includes(".vercel-storage.com") || url.includes("public.blob.vercel-storage.com"));
        },
        { message: "Only trusted Vercel Blob URLs are allowed" }
      ),
      category: z.string(),
      year: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      storagePath: z.string().optional(),
      profileId: z.string().optional().nullable(),
      serviceId: z.string().optional().nullable(),
      userServiceId: z.string().optional().nullable(),
      taxReturnId: z.string().optional().nullable(),
      size: z.number().optional(),
      mimeType: z.string().optional()
    });

    const data = schema.parse(req.body);
    await validateDocumentLinks(userId, {
      profileId: normalizeLink(data.profileId),
      userServiceId: normalizeLink(data.userServiceId || data.serviceId),
      taxReturnId: normalizeLink(data.taxReturnId),
    });
    const docId = adminDb.collection("documents").doc().id;
    const newDoc = {
      userId,
      name: data.name,
      url: data.url,
      category: data.category,
      year: data.year || null,
      description: data.description || null,
      profileId: normalizeLink(data.profileId),
      serviceId: normalizeLink(data.serviceId),
      userServiceId: normalizeLink(data.userServiceId || data.serviceId),
      taxReturnId: normalizeLink(data.taxReturnId),
      storagePath: data.storagePath || data.url,
      blobUrl: data.url,
      size: data.size || 0,
      mimeType: data.mimeType || "application/octet-stream",
      status: "active",
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isExternal: true
    };

    await adminDb.collection("documents").doc(docId).set(newDoc);
    res.json({ success: true, document: serializeDocument(docId, newDoc) });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(res, 400, error.errors[0].message);
    return documentRouteError(res, error, "Failed to register document");
  }
});

router.post("/generated", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = await resolveTargetUserId(req);
    if (!userId || !req.auth) return errorResponse(res, 401, "Unauthorized");

    const schema = z.object({
      name: z.string().trim().min(1).max(255),
      generatorType: z.string().trim().min(1).max(120),
      htmlContent: z.string().trim().min(1).max(1_500_000),
      description: z.string().trim().max(500).optional().nullable(),
      year: z.string().trim().max(20).optional().nullable(),
      profileId: z.string().trim().min(1).optional().nullable(),
      serviceId: z.string().trim().min(1).optional().nullable(),
      userServiceId: z.string().trim().min(1).optional().nullable(),
      taxReturnId: z.string().trim().min(1).optional().nullable(),
    });

    const data = schema.parse(req.body);
    await validateDocumentLinks(userId, {
      profileId: normalizeLink(data.profileId),
      userServiceId: normalizeLink(data.userServiceId || data.serviceId),
      taxReturnId: normalizeLink(data.taxReturnId),
    });

    const docRef = adminDb.collection("documents").doc();
    const originalName = `${safePathSegment(data.name.toLowerCase()) || "generated-document"}.doc`;
    const fileName = `${Date.now()}-${originalName}`;
    const pathname = `documents/${userId}/${docRef.id}/${fileName}`;
    const wordHtml = buildGeneratedWordHtml(data.htmlContent, data.name);
    const fileBuffer = Buffer.from(wordHtml, "utf8");
    const blob = await putPrivateDocument(pathname, fileBuffer, {
      contentType: "application/msword",
    });

    const newDoc = {
      userId,
      name: data.name,
      fileName,
      originalName,
      mimeType: "application/msword",
      size: fileBuffer.length,
      originalSize: fileBuffer.length,
      storedSize: fileBuffer.length,
      compressionType: "none",
      compressionStatus: "not_applicable",
      profileId: normalizeLink(data.profileId),
      serviceId: normalizeLink(data.serviceId),
      userServiceId: normalizeLink(data.userServiceId || data.serviceId),
      taxReturnId: normalizeLink(data.taxReturnId),
      uploadPath: blob.pathname,
      blobUrl: blob.url,
      downloadUrl: blob.downloadUrl,
      category: "generated_document",
      tags: ["generated", data.generatorType],
      description: data.description || "Saved from the MyeCA document generator.",
      year: data.year || null,
      status: "active",
      version: 1,
      metadata: {
        source: "document_generator",
        generatorType: data.generatorType,
        editablePath: `/documents/generator/${data.generatorType}`,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isExternal: false,
    };

    await docRef.set(newDoc);
    await recordWorkflowEvent({
      type: "document_generated",
      title: "Generated document saved",
      message: `${data.name} was saved from the document generator.`,
      sourceType: "document",
      sourceId: docRef.id,
      caseId: newDoc.userServiceId ?? null,
      userId,
      targetRole: "admin",
      actorUserId: req.user?.id || req.auth?.userId || null,
      actorRole: req.user?.role || null,
      priority: "low",
      metadata: {
        documentId: docRef.id,
        generatorType: data.generatorType,
        category: newDoc.category,
      },
    });

    res.json({ success: true, document: serializeDocument(docRef.id, newDoc) });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(res, 400, error.errors[0].message);
    return documentRouteError(res, error, "Failed to save generated document");
  }
});

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = await resolveTargetUserId(req);
    if (!userId) return errorResponse(res, 401, "Unauthorized");

    const { category, year, search, taxReturnId } = req.query;
    let query: any = adminDb.collection("documents")
      .where("userId", "==", userId)
      .where("status", "==", "active");

    if (category && category !== "all") {
      query = query.where("category", "==", category);
    }

    if (year && year !== "all") {
      query = query.where("year", "==", year);
    }

    const snapshot = await query.get();
    let docs = snapshot.docs.map((doc: any) => serializeDocument(doc.id, doc.data()));

    if (taxReturnId && typeof taxReturnId === "string") {
      docs = docs.filter((d: any) => d.taxReturnId === taxReturnId);
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      docs = docs.filter((d: any) =>
        d.name?.toLowerCase().includes(searchTerm) ||
        d.description?.toLowerCase().includes(searchTerm)
      );
    }

    res.json({
      success: true,
      documents: docs,
      total: docs.length
    });
  } catch (error) {
    return documentRouteError(res, error, "Failed to fetch documents");
  }
});

router.get("/stats/summary", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = await resolveTargetUserId(req);
    const snapshot = await adminDb.collection("documents")
      .where("userId", "==", userId)
      .where("status", "==", "active")
      .get();

    const docs = snapshot.docs
      .map((doc) => doc.data())
      .filter((doc): doc is Record<string, any> => Boolean(doc));
    const stats = {
      total: docs.length,
      byCategory: {} as Record<string, number>,
      byYear: {} as Record<string, number>,
      totalSize: 0
    };

    docs.forEach(doc => {
      stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
      if (doc.year) {
        stats.byYear[doc.year] = (stats.byYear[doc.year] || 0) + 1;
      }
      stats.totalSize += doc.size || 0;
    });

    res.json({ success: true, stats });
  } catch (error) {
    return documentRouteError(res, error, "Failed to fetch statistics");
  }
});

router.get("/:id/download", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = adminDb.collection("documents").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Document not found");
    }

    const documentData = doc.data()!;
    if (!(await canAccessUserData(req.user, documentData.userId))) {
      return errorResponse(res, 403, "Access denied");
    }

    const blobUrl = documentData.blobUrl || documentData.url;
    if (!blobUrl) {
      return errorResponse(res, 404, "Document file not found");
    }

    const blob = await getPrivateDocument(blobUrl);
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return errorResponse(res, 404, "Document file not found");
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(documentData.originalName || documentData.name || "document")}"`,
    );
    res.setHeader("Content-Type", documentData.mimeType || "application/octet-stream");

    const file = await streamToBuffer(blob.stream);
    return res.send(file);
  } catch (error) {
    return documentRouteError(res, error, "Failed to download document");
  }
});

router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await getAccessibleSnapshot("documents", id, req.user);

    if (!doc) {
      return errorResponse(res, 404, "Document not found");
    }

    res.json({
      success: true,
      document: serializeDocument(doc.id, doc.data() as Record<string, any>)
    });
  } catch (error) {
    return documentRouteError(res, error, "Failed to fetch document");
  }
});

router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = adminDb.collection("documents").doc(id);
    const doc = await getAccessibleSnapshot("documents", id, req.user);

    if (!doc) {
      return errorResponse(res, 404, "Document not found");
    }

    const updateData = documentSchema.partial().parse(req.body);
    const documentUserId = doc.data()?.userId;
    await validateDocumentLinks(documentUserId, {
      profileId: updateData.profileId,
      userServiceId: updateData.userServiceId || updateData.serviceId,
      taxReturnId: updateData.taxReturnId,
    });
    const hasUserServiceId = Object.prototype.hasOwnProperty.call(updateData, "userServiceId");
    const hasServiceId = Object.prototype.hasOwnProperty.call(updateData, "serviceId");
    const normalizedUserServiceId = hasUserServiceId ? updateData.userServiceId : updateData.serviceId;
    const finalUpdate = {
      ...updateData,
      ...(hasUserServiceId || hasServiceId ? { userServiceId: normalizedUserServiceId ?? null } : {}),
      updatedAt: new Date()
    };

    await docRef.update(finalUpdate);
    res.json({
      success: true,
      document: serializeDocument(id, { ...(doc.data() as Record<string, any>), ...finalUpdate })
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, error.errors[0].message);
    }
    return documentRouteError(res, error, "Failed to update document");
  }
});

router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = adminDb.collection("documents").doc(id);
    const doc = await getAccessibleSnapshot("documents", id, req.user);

    if (!doc) {
      return errorResponse(res, 404, "Document not found");
    }

    const documentData = doc.data()!;
    if (documentData.blobUrl || documentData.url) {
      await deletePrivateDocument(documentData.blobUrl || documentData.url).catch((error) => {
        console.warn("[BLOB] Failed to delete blob:", error);
      });
    }

    await docRef.update({
      status: "deleted",
      deletedAt: new Date(),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (error) {
    return documentRouteError(res, error, "Failed to delete document");
  }
});

export default router;
