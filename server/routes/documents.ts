import { Response, Router } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { adminDb } from "../firebase-admin";

const router = Router();

// Configure multer for document uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = (req as AuthRequest).auth?.userId || 'anonymous';
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents', userId);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Map of allowed MIME types to their permitted file extensions
const ALLOWED_MIME_EXTENSIONS: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/jpg': ['.jpg', '.jpeg'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedExtensions = ALLOWED_MIME_EXTENSIONS[file.mimetype];
    if (!allowedExtensions) {
      return cb(new Error('Invalid file type. Only PDF, images, Word, and Excel files are allowed.'));
    }
    // Also validate that the extension matches the declared MIME type
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error(`File extension '${ext}' does not match the declared file type.`));
    }
    cb(null, true);
  },
});

// Document schema
const documentSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  description: z.string().nullable().optional(),
  year: z.string().nullable().optional()
});

// Upload document
router.post("/upload", authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { name, category, tags, description, year } = req.body;
    
    // Validate metadata
    const metadata = documentSchema.parse({
      name: name || req.file.originalname,
      category: category || "other",
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      description,
      year
    });
    
    // Compress image if applicable
    let finalSize = req.file.size;
    let finalPath = req.file.path;

    if (req.file.mimetype.startsWith('image/')) {
      try {
        const compressedPath = req.file.path + '-compressed.jpg';
        await sharp(req.file.path)
          .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(compressedPath);
        
        // Replace original with compressed
        fs.unlinkSync(req.file.path);
        fs.renameSync(compressedPath, req.file.path);
        
        const stats = fs.statSync(req.file.path);
        finalSize = stats.size;
      } catch (compressError) {
        console.error("Compression error:", compressError);
        // Fallback to original file
      }
    }
    
    // Create document record in Firestore
    const docRef = adminDb.collection("documents").doc();
    const newDoc = {
      userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype.startsWith('image/') ? 'image/jpeg' : req.file.mimetype,
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
      document: { id: docRef.id, ...newDoc }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

// Register document (after direct Firebase Storage upload)
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

    const body = req.body;
    const data = schema.parse(body);

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
      mimeType: data.mimeType || 'application/octet-stream',
      status: "active",
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isExternal: true
    };

    await adminDb.collection("documents").doc(docId).set(newDoc);
    res.json({ success: true, document: { id: docId, ...newDoc } });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    console.error("Register error:", error);
    res.status(500).json({ error: "Failed to register document" });
  }
});

// Get user documents
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { category, year, search } = req.query;
    
    let query: any = adminDb.collection("documents")
      .where("userId", "==", userId)
      .where("status", "==", "active");

    if (category && category !== 'all') {
        query = query.where("category", "==", category);
    }

    if (year && year !== 'all') {
        query = query.where("year", "==", year);
    }

    const snapshot = await query.get();
    let docs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

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
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// Get document details
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
      document: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

// Update document metadata
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
      document: { id, ...doc.data(), ...finalUpdate }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Failed to update document" });
  }
});

// Delete document
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
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// Get document statistics
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
      // Count by category
      stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
      
      // Count by year
      if (doc.year) {
        stats.byYear[doc.year] = (stats.byYear[doc.year] || 0) + 1;
      }
      
      // Sum total size
      stats.totalSize += doc.size || 0;
    });
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export default router;