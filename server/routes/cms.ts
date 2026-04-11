import { Router, Response } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin, requireTeamMember, AuthRequest } from "../middleware/auth";
import { adminDb } from "../neon-admin";
import { sanitize } from "../middleware/sanitize";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const router = Router();

// Configure multer storage
const multerStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadDir = "public/uploads/blog";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  }
});

// Validation schemas
const createPostSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().optional().nullable(),
  categoryId: z.number().optional().nullable(),
});

const updatePostSchema = createPostSchema.partial();

// List posts with filters
router.get("/posts", requireAuth, requireTeamMember, async (req: AuthRequest, res: Response) => {
  try {
    const { q, status } = req.query as { q?: string; status?: string };
    
    // Fetch all posts to allow in-memory filtering and sorting without composite indexes
    const snapshot = await adminDb.collection("blog_posts").get();
    let posts = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt || new Date())
      };
    });

    // Apply status filter
    if (status && (status === "draft" || status === "published")) {
      posts = posts.filter((p: any) => p.status === status);
    }

    // Apply search filter
    if (q) {
      const qLower = q.toLowerCase();
      posts = posts.filter((p: any) =>
        (p.title?.toLowerCase() || "").includes(qLower) ||
        (p.slug?.toLowerCase() || "").includes(qLower)
      );
    }

    // Sort by createdAt descending
    posts.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    res.json({ success: true, posts });
  } catch (error) {
    console.error("CMS list posts error:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Get single post
router.get("/posts/:id", requireAuth, requireTeamMember, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await adminDb.collection("blog_posts").doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: "Post not found" });
    res.json({ success: true, post: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error("CMS get post error:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// Helper: resolve denormalized author/category names for blog_posts
async function resolveDenormalizedFields(authorId?: string, categoryId?: number | null) {
  let authorName: string | undefined;
  let categoryName: string | undefined;

  if (authorId) {
    const authorDoc = await adminDb.collection("users").doc(authorId).get();
    if (authorDoc.exists) {
      const d = authorDoc.data()!;
      authorName = [d.firstName, d.lastName].filter(Boolean).join(" ") || "Team MyeCA";
    }
  }
  if (categoryId != null) {
    const catSnapshot = await adminDb.collection("categories")
      .where("id", "==", categoryId)
      .limit(1)
      .get();
    if (!catSnapshot.empty) {
      categoryName = catSnapshot.docs[0]?.data()?.name || categoryName;
    }
  }
  return { authorName, categoryName };
}

// Create post
router.post("/posts", requireAuth, requireTeamMember, sanitize, async (req: AuthRequest, res: Response) => {
  try {
    const payload = createPostSchema.parse(req.body);
    const authUser = req.auth;

    // Denormalize author/category names into the document
    const { authorName, categoryName } = await resolveDenormalizedFields(authUser?.userId, payload.categoryId);

    const postRef = adminDb.collection("blog_posts").doc();
    const newPost = {
      ...payload,
      authorId: authUser?.userId,
      authorName: authorName || "Team MyeCA",
      categoryName: categoryName || "General",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await postRef.set(newPost);
    res.json({ success: true, post: { id: postRef.id, ...newPost } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("CMS create post error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Update post
router.put("/posts/:id", requireAuth, requireTeamMember, sanitize, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload = updatePostSchema.parse(req.body);

    const postRef = adminDb.collection("blog_posts").doc(id);
    const doc = await postRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Post not found" });

    const existingData = doc.data()!;

    // Re-denormalize if category changed
    const denorm: Record<string, string> = {};
    if (payload.categoryId !== undefined && payload.categoryId !== existingData.categoryId) {
      const { categoryName } = await resolveDenormalizedFields(undefined, payload.categoryId);
      if (categoryName) denorm.categoryName = categoryName;
    }

    const updateData = {
      ...payload,
      ...denorm,
      updatedAt: new Date(),
    };

    await postRef.update(updateData);
    res.json({ success: true, post: { id, ...existingData, ...updateData } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("CMS update post error:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// Delete post
router.delete("/posts/:id", requireAuth, requireTeamMember, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const postRef = adminDb.collection("blog_posts").doc(id);
    const doc = await postRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Post not found" });

    await postRef.delete();
    res.json({ success: true });
  } catch (error) {
    console.error("CMS delete post error:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// --- Upload ---
router.post("/upload", requireAuth, requireTeamMember, upload.single("image"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    const filePath = req.file.path;
    const fileName = req.file.filename;
    const uploadDir = path.dirname(filePath);
    const thumbDir = path.join(uploadDir, "thumbnails");
    const thumbPath = path.join(thumbDir, fileName);

    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
    }

    // Process image: Compress original and create thumbnail
    const image = sharp(filePath);
    
    // New filename with WebP extension
    const webpFileName = fileName.replace(path.extname(fileName), '.webp');
    const webpPath = path.join(uploadDir, webpFileName);

    // 1. Generate Thumbnail
    await sharp(filePath)
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 70 })
      .toFile(thumbPath.replace(path.extname(thumbPath), '.webp'));

    // 2. Convert Original to WebP
    await sharp(filePath)
      .resize(1920, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(webpPath);

    // Clean up original uploaded file if it wasn't already webp
    if (path.extname(filePath).toLowerCase() !== '.webp') {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Failed to delete original upload:", err);
      }
    }

    const publicUrl = `/uploads/blog/${webpFileName}`;
    const thumbUrl = `/uploads/blog/thumbnails/${webpFileName}`;

    res.json({ 
      success: true, 
      url: publicUrl,
      thumbnailUrl: thumbUrl
    });
  } catch (error: any) {
    console.error("CMS upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload image" });
  }
});

// --- Media ---
router.get("/media", requireAuth, requireTeamMember, async (_req: AuthRequest, res: Response) => {
  try {
    const uploadDir = "public/uploads/blog";
    if (!fs.existsSync(uploadDir)) {
      return res.json({ success: true, files: [] });
    }
    
    const files = fs.readdirSync(uploadDir)
      .filter(file => /\.(webp)$/i.test(file)) // Only WebP after refactor
      .map(file => {
        const stats = fs.statSync(path.join(uploadDir, file));
        return {
          name: file,
          url: `/uploads/blog/${file}`,
          thumbnailUrl: fs.existsSync(path.join(uploadDir, "thumbnails", file)) 
            ? `/uploads/blog/thumbnails/${file}`
            : `/uploads/blog/${file}`,
          size: stats.size,
          mtime: stats.mtime
        };
      })
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    res.json({ success: true, files });
  } catch (error) {
    console.error("CMS media list error:", error);
    res.status(500).json({ error: "Failed to list media files" });
  }
});

// --- Categories ---
const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
});

router.get("/categories", requireAuth, requireTeamMember, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await adminDb.collection("categories").orderBy("name").get();
    const allCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, categories: allCategories });
  } catch (error) {
    console.error("CMS list categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/categories", requireAuth, requireTeamMember, sanitize, async (req: AuthRequest, res: Response) => {
  try {
    const payload = createCategorySchema.parse(req.body);
    const catRef = adminDb.collection("categories").doc();
    await catRef.set(payload);
    res.json({ success: true, category: { id: catRef.id, ...payload } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    console.error("CMS create category error:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// --- Daily Updates ---
const createDailyUpdateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  isActive: z.boolean().default(true),
  expiresAt: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  }, z.date()).optional(),
});
const updateDailyUpdateSchema = createDailyUpdateSchema.partial();

router.get("/updates", requireAuth, requireTeamMember, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await adminDb.collection("daily_updates").orderBy("createdAt", "desc").get();
    const allUpdates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, updates: allUpdates });
  } catch (error) {
    console.error("CMS list updates error:", error);
    res.status(500).json({ error: "Failed to fetch updates" });
  }
});

router.post("/updates", requireAuth, requireTeamMember, sanitize, async (req: AuthRequest, res: Response) => {
  try {
    const payload = createDailyUpdateSchema.parse(req.body);
    const updateRef = adminDb.collection("daily_updates").doc();
    const newUpdate = {
      ...payload,
      createdAt: new Date(),
    };
    await updateRef.set(newUpdate);
    res.json({ success: true, update: { id: updateRef.id, ...newUpdate } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    console.error("CMS create update error:", error);
    res.status(500).json({ error: "Failed to create update" });
  }
});

router.put("/updates/:id", requireAuth, requireTeamMember, sanitize, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload = updateDailyUpdateSchema.parse(req.body);
    const updateRef = adminDb.collection("daily_updates").doc(id);
    const doc = await updateRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Update not found" });

    await updateRef.update(payload);
    res.json({ success: true, update: { id, ...doc.data(), ...payload } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    console.error("CMS update update error:", error);
    res.status(500).json({ error: "Failed to update" });
  }
});

router.delete("/updates/:id", requireAuth, requireTeamMember, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await adminDb.collection("daily_updates").doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error("CMS delete update error:", error);
    res.status(500).json({ error: "Failed to delete update" });
  }
});

export default router;
