import { Response, Router } from "express";
import { z } from "zod";
import multer from "multer";
import sharp from "sharp";
import { del, get, put } from "@vercel/blob";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../neon-admin.js";
import { safeError } from "../utils/error-response.js";

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
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, images, Word, and Excel files are allowed."));
    }
  }
});

const documentSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  description: z.string().nullable().optional(),
  year: z.string().nullable().optional()
});

function serializeDocument(docId: string, data: Record<string, any>) {
  return {
    id: docId,
    userId: data.userId,
    fileName: data.fileName ?? null,
    originalName: data.originalName ?? data.name ?? "document",
    name: data.name,
    mimeType: data.mimeType,
    size: data.size ?? 0,
    category: data.category,
    tags: data.tags ?? [],
    description: data.description ?? null,
    year: data.year ?? null,
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

router.post("/upload", authenticateToken, upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { name, category, tags, description, year } = req.body;
    const metadata = documentSchema.parse({
      name: name || req.file.originalname,
      category: category || "other",
      tags: tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [],
      description,
      year
    });

    let fileBuffer = req.file.buffer;
    let finalSize = req.file.size;
    let mimeType = req.file.mimetype;

    if (req.file.mimetype.startsWith("image/")) {
      try {
        fileBuffer = await sharp(req.file.buffer)
          .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        finalSize = fileBuffer.length;
        mimeType = "image/jpeg";
      } catch (compressError) {
        console.error("Compression error:", compressError);
      }
    }

    const docRef = adminDb.collection("documents").doc();
    const fileName = `${Date.now()}-${safePathSegment(req.file.originalname)}`;
    const pathname = `documents/${userId}/${docRef.id}/${fileName}`;
    const blob = await put(pathname, fileBuffer, {
      access: "private",
      contentType: mimeType,
    });

    const newDoc = {
      userId,
      fileName,
      originalName: req.file.originalname,
      mimeType,
      size: finalSize,
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
    res.json({
      success: true,
      document: serializeDocument(docRef.id, newDoc)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return safeError(res, error, "Failed to upload document");
  }
});

router.post("/register", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId || !req.auth) return res.status(401).json({ error: "Unauthorized" });

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
      size: z.number().optional(),
      mimeType: z.string().optional()
    });

    const data = schema.parse(req.body);
    const docId = adminDb.collection("documents").doc().id;
    const newDoc = {
      userId,
      name: data.name,
      url: data.url,
      category: data.category,
      year: data.year || null,
      description: data.description || null,
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
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    return safeError(res, error, "Failed to register document");
  }
});

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { category, year, search } = req.query;
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
    return safeError(res, error, "Failed to fetch documents");
  }
});

router.get("/stats/summary", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
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
    return safeError(res, error, "Failed to fetch statistics");
  }
});

router.get("/:id/download", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    const docRef = adminDb.collection("documents").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Document not found" });
    }

    const documentData = doc.data()!;
    if (documentData.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(documentData.originalName || documentData.name || "document")}"`,
    );
    res.setHeader("Content-Type", documentData.mimeType || "application/octet-stream");

    const blobUrl = documentData.blobUrl || documentData.url;
    if (!blobUrl) {
      return res.status(404).json({ error: "Document file not found" });
    }

    const blob = await get(blobUrl, { access: "private" });
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return res.status(404).json({ error: "Document file not found" });
    }

    const file = await streamToBuffer(blob.stream);
    return res.send(file);
  } catch (error) {
    return safeError(res, error, "Failed to download document");
  }
});

router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    const docRef = adminDb.collection("documents").doc(id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.userId !== userId) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({
      success: true,
      document: serializeDocument(doc.id, doc.data() as Record<string, any>)
    });
  } catch (error) {
    return safeError(res, error, "Failed to fetch document");
  }
});

router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    const docRef = adminDb.collection("documents").doc(id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.userId !== userId) {
      return res.status(404).json({ error: "Document not found" });
    }

    const updateData = documentSchema.partial().parse(req.body);
    const finalUpdate = {
      ...updateData,
      updatedAt: new Date()
    };

    await docRef.update(finalUpdate);
    res.json({
      success: true,
      document: serializeDocument(id, { ...(doc.data() as Record<string, any>), ...finalUpdate })
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return safeError(res, error, "Failed to update document");
  }
});

router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    const docRef = adminDb.collection("documents").doc(id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.userId !== userId) {
      return res.status(404).json({ error: "Document not found" });
    }

    const documentData = doc.data()!;
    if (documentData.blobUrl || documentData.url) {
      await del(documentData.blobUrl || documentData.url).catch((error) => {
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
    return safeError(res, error, "Failed to delete document");
  }
});

export default router;
