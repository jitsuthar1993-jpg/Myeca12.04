import { Response, Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { adminDb, adminStorage } from "../firebase-admin";
import { safeError } from "../utils/error-response";

const router = Router();
const uploadsRoot = path.join(process.cwd(), "uploads");

const multerStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const userId = (req as AuthRequest).auth?.userId || "anonymous";
    const uploadDir = path.join(process.cwd(), "uploads", "documents", userId);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: multerStorage,
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

function toAbsoluteUploadPath(filePath?: string) {
  if (!filePath) {
    return null;
  }

  const resolvedPath = path.resolve(filePath);
  const normalizedRoot = `${uploadsRoot}${path.sep}`;

  if (resolvedPath === uploadsRoot || resolvedPath.startsWith(normalizedRoot)) {
    return resolvedPath;
  }

  return null;
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

    let finalSize = req.file.size;
    if (req.file.mimetype.startsWith("image/")) {
      try {
        const compressedPath = req.file.path + "-compressed.jpg";
        await sharp(req.file.path)
          .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(compressedPath);

        fs.unlinkSync(req.file.path);
        fs.renameSync(compressedPath, req.file.path);

        const stats = fs.statSync(req.file.path);
        finalSize = stats.size;
      } catch (compressError) {
        console.error("Compression error:", compressError);
      }
    }

    const docRef = adminDb.collection("documents").doc();
    const newDoc = {
      userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype.startsWith("image/") ? "image/jpeg" : req.file.mimetype,
      size: finalSize,
      uploadPath: req.file.path,
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
      url: z.string().url(),
      category: z.string(),
      year: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      storagePath: z.string(),
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
      storagePath: data.storagePath,
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

    const docs = snapshot.docs.map(doc => doc.data());
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

    if (documentData.isExternal && documentData.storagePath) {
      const [signedUrl] = await adminStorage.bucket().file(documentData.storagePath).getSignedUrl({
        action: "read",
        expires: Date.now() + 5 * 60 * 1000,
      });

      return res.redirect(signedUrl);
    }

    const resolvedPath = toAbsoluteUploadPath(documentData.uploadPath);
    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      return res.status(404).json({ error: "Document file not found" });
    }

    return res.sendFile(resolvedPath);
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
