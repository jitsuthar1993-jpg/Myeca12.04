import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db";
import { documents as documentsTable } from "@shared/schema";
import { eq, and, or, like, sql } from "drizzle-orm";

const router = Router();

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = (req as any).user.id;
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents', userId.toString());
    
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

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, Word, and Excel files are allowed.'));
    }
  }
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
router.post("/upload", authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const userId = (req as any).user.id;
    const { name, category, tags, description, year } = req.body;
    
    // Validate metadata
    const metadata = documentSchema.parse({
      name: name || req.file.originalname,
      category: category || "other",
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      description,
      year
    });
    
    // Create document record in DB
    const [newDoc] = await db.insert(documentsTable).values({
      userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadPath: req.file.path,
      name: metadata.name,
      category: metadata.category,
      tags: metadata.tags ? JSON.stringify(metadata.tags) : null,
      description: metadata.description || null,
      year: metadata.year || null,
      status: "active",
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any).returning();
    
    res.json({
      success: true,
      document: newDoc
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

// Get user documents
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { category, year, search } = req.query;
    
    let query = db.select().from(documentsTable).where(
      and(
        eq(documentsTable.userId, userId),
        eq(documentsTable.status, "active")
      )
    );

    const conditions = [
        eq(documentsTable.userId, userId),
        eq(documentsTable.status, "active")
    ];

    if (category && category !== 'all') {
        conditions.push(eq(documentsTable.category, category as string));
    }

    if (year && year !== 'all') {
        conditions.push(eq(documentsTable.year, year as string));
    }

    if (search) {
        const searchTerm = `%${search}%`;
        conditions.push(or(
            like(documentsTable.name, searchTerm),
            like(documentsTable.description, searchTerm)
        ) as any);
    }

    const docs = await db.select().from(documentsTable).where(and(...conditions));
    
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
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const documentId = parseInt(req.params.id);
    
    const [doc] = await db.select().from(documentsTable).where(
      and(
        eq(documentsTable.id, documentId),
        eq(documentsTable.userId, userId)
      )
    );
    
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    res.json({
      success: true,
      document: doc
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

// Update document metadata
router.patch("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const documentId = parseInt(req.params.id);
    
    // Validate update data
    const updateData = documentSchema.partial().parse(req.body);
    
    const [updatedDoc] = await db.update(documentsTable).set({
      ...updateData,
      tags: updateData.tags ? JSON.stringify(updateData.tags) : undefined,
      updatedAt: new Date()
    } as any).where(
      and(
        eq(documentsTable.id, documentId),
        eq(documentsTable.userId, userId)
      )
    ).returning();
    
    if (!updatedDoc) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    res.json({
      success: true,
      document: updatedDoc
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Failed to update document" });
  }
});

// Delete document
router.delete("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const documentId = parseInt(req.params.id);
    
    const [deletedDoc] = await db.update(documentsTable).set({
      status: "deleted",
      deletedAt: new Date(),
      updatedAt: new Date()
    }).where(
      and(
        eq(documentsTable.id, documentId),
        eq(documentsTable.userId, userId)
      )
    ).returning();
    
    if (!deletedDoc) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    res.json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// Get document statistics
router.get("/stats/summary", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const activeDocs = await db.select().from(documentsTable).where(
      and(
        eq(documentsTable.userId, userId),
        eq(documentsTable.status, "active")
      )
    );
    
    const stats = {
      total: activeDocs.length,
      byCategory: {} as Record<string, number>,
      byYear: {} as Record<string, number>,
      totalSize: 0
    };
    
    activeDocs.forEach(doc => {
      // Count by category
      stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
      
      // Count by year
      if (doc.year) {
        stats.byYear[doc.year] = (stats.byYear[doc.year] || 0) + 1;
      }
      
      // Sum total size
      stats.totalSize += doc.size;
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