import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin, requireSuperAdmin } from "../middleware/auth.js";
import { db } from "../db.js";
import { blogPosts, users, categories, dailyUpdates } from "../../shared/schema.js";
import { eq, desc, like } from "drizzle-orm";
import { sanitize } from "../middleware/sanitize";
import { audit } from "../middleware/audit.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
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
  storage: storage,
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
  featuredImage: z.string().url().optional(),
  categoryId: z.number().optional(),
});

const updatePostSchema = createPostSchema.partial();

// List posts with filters
router.get("/posts", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { q, status } = req.query as { q?: string; status?: string };
    let query = db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));

    // Basic filters
    if (status && (status === "draft" || status === "published")) {
      query = db.select().from(blogPosts).where(eq(blogPosts.status, status as any)).orderBy(desc(blogPosts.createdAt)) as any;
    }

    const posts = await query;
    const filtered = q
      ? posts.filter(p =>
          (p.title?.toLowerCase() || "").includes(q.toLowerCase()) ||
          (p.slug?.toLowerCase() || "").includes(q.toLowerCase())
        )
      : posts;

    res.json({ success: true, posts: filtered });
  } catch (error) {
    console.error("CMS list posts error:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Get single post
router.get("/posts/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ success: true, post });
  } catch (error) {
    console.error("CMS get post error:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// Create post
router.post("/posts", requireAuth, requireAdmin, sanitize, audit("create","blogPost"), async (req: any, res) => {
  try {
    const payload = createPostSchema.parse(req.body);
    const tokenUser = req.user;
    let authorDbId: number | null = null;

    if (tokenUser?.email) {
      const existingDbUser = await db.select().from(users).where(eq(users.email, tokenUser.email)).limit(1);
      if (existingDbUser.length > 0) {
        authorDbId = (existingDbUser[0] as any).id as number;
      } else if (tokenUser?.id != null) {
        const [createdDbUser] = await db
          .insert(users)
          .values({
            // Ensure a DB record exists for the token user to satisfy FK in dev
            id: tokenUser.id as number,
            email: tokenUser.email,
            password: "placeholder",
            firstName: (tokenUser as any).firstName ?? "Admin",
            lastName: (tokenUser as any).lastName ?? "User",
            role: tokenUser.role ?? "admin",
            status: "active",
            isVerified: true as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any)
          .returning();
        authorDbId = (createdDbUser as any).id as number;
      }
    }

    const [created] = await db
      .insert(blogPosts)
      .values({
        title: payload.title.trim(),
        slug: payload.slug.trim(),
        content: payload.content,
        excerpt: payload.excerpt || null,
        authorId: authorDbId ?? (tokenUser?.id as number),
        status: payload.status,
        tags: payload.tags ? JSON.stringify(payload.tags) : null,
        featuredImage: payload.featuredImage || null,
        categoryId: payload.categoryId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
      .returning();

    res.json({ success: true, post: created });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("CMS create post error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Update post
router.put("/posts/:id", requireAuth, requireAdmin, sanitize, audit("update","blogPost", req=>parseInt((req as any).params.id)), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const payload = updatePostSchema.parse(req.body);

    const [existing] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Post not found" });

    const user = (req as any).user;
    if (user.role === 'author') {
      if (existing.authorId !== user.id) {
        return res.status(403).json({ error: "Authors can only edit their own posts" });
      }
      if (payload.status === 'published' && existing.status !== 'published') {
        return res.status(403).json({ error: "Authors cannot publish posts directly. Please save as draft for review." });
      }
    }

    const [updated] = await db
      .update(blogPosts)
      .set({
        title: payload.title?.trim() ?? existing.title,
        slug: payload.slug?.trim() ?? existing.slug,
        content: payload.content ?? existing.content,
        excerpt: payload.excerpt ?? existing.excerpt,
        status: payload.status ?? existing.status,
        tags: payload.tags ? JSON.stringify(payload.tags) : existing.tags,
        featuredImage: payload.featuredImage ?? existing.featuredImage,
        categoryId: payload.categoryId !== undefined ? payload.categoryId : (existing as any).categoryId,
        updatedAt: new Date(),
      } as any)
      .where(eq(blogPosts.id, id))
      .returning();

    res.json({ success: true, post: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("CMS update post error:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// Delete post
router.delete("/posts/:id", requireAuth, requireAdmin, audit("delete","blogPost", req=>parseInt((req as any).params.id)), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Post not found" });

    const user = (req as any).user;
    if (user.role === 'author' && existing.authorId !== user.id) {
      return res.status(403).json({ error: "Authors can only delete their own posts" });
    }

    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("CMS delete post error:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// --- Upload ---
router.post("/upload", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
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
    const metadata = await image.metadata();

    // 1. Generate Thumbnail (max 300x300, 70% quality)
    await sharp(filePath)
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 70 })
      .toFile(thumbPath.replace(path.extname(thumbPath), '.webp'));

    // 2. Compress Original (max width 1920, 80% quality)
    // We'll replace the original with a compressed version if it's large
    if ((metadata.width || 0) > 1920 || (req.file.size > 1024 * 1024)) {
      const buffer = await sharp(filePath)
        .resize(1920, null, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();
      fs.writeFileSync(filePath, buffer);
    }

    const publicUrl = `/uploads/blog/${fileName}`;
    const thumbUrl = `/uploads/blog/thumbnails/${fileName.replace(path.extname(fileName), '.webp')}`;

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
router.get("/media", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const uploadDir = "public/uploads/blog";
    if (!fs.existsSync(uploadDir)) {
      return res.json({ success: true, files: [] });
    }
    
    const files = fs.readdirSync(uploadDir)
      .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .map(file => {
        const stats = fs.statSync(path.join(uploadDir, file));
        return {
          name: file,
          url: `/uploads/blog/${file}`,
          thumbnailUrl: fs.existsSync(path.join(uploadDir, "thumbnails", file.replace(path.extname(file), '.webp'))) 
            ? `/uploads/blog/thumbnails/${file.replace(path.extname(file), '.webp')}`
            : `/uploads/blog/${file}`,
          size: stats.size,
          atime: stats.atime,
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

// Bulk Delete Media - Restricted to Super Admin
router.post("/media/bulk-delete", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { filenames } = req.body as { filenames: string[] };
    if (!filenames || !Array.isArray(filenames)) {
      return res.status(400).json({ error: "Invalid filenames list" });
    }

    const results = {
      deleted: [] as string[],
      failed: [] as { name: string; error: string }[]
    };

    for (const filename of filenames) {
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        results.failed.push({ name: filename, error: "Invalid filename" });
        continue;
      }
      
      const filePath = path.join("public/uploads/blog", filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          results.deleted.push(filename);
        } catch (err: any) {
          results.failed.push({ name: filename, error: err.message });
        }
      } else {
        results.failed.push({ name: filename, error: "File not found" });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error("CMS bulk delete error:", error);
    res.status(500).json({ error: "Failed to perform bulk delete" });
  }
});

// Restricted to Super Admin
router.delete("/media/:filename", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const filename = req.params.filename;
    // Basic security check to prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ error: "Invalid filename" });
    }
    
    const filePath = path.join("public/uploads/blog", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    console.error("CMS media delete error:", error);
    res.status(500).json({ error: "Failed to delete media file" });
  }
});

// --- Categories ---
const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
});

router.get("/categories", requireAuth, requireAdmin, async (req, res) => {
  try {
    const allCategories = await db.select().from(categories).orderBy(categories.name);
    res.json({ success: true, categories: allCategories });
  } catch (error) {
    console.error("CMS list categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/categories", requireAuth, requireAdmin, sanitize, audit("create", "category"), async (req, res) => {
  try {
    const payload = createCategorySchema.parse(req.body);
    const [created] = await db.insert(categories).values(payload).returning();
    res.json({ success: true, category: created });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    console.error("CMS create category error:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Restricted to Super Admin
router.delete("/categories/:id", requireAuth, requireSuperAdmin, audit("delete", "category"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(categories).where(eq(categories.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("CMS delete category error:", error);
    res.status(500).json({ error: "Failed to delete category" });
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

router.get("/updates", requireAuth, requireAdmin, async (req, res) => {
  try {
    const allUpdates = await db.select().from(dailyUpdates).orderBy(desc(dailyUpdates.createdAt));
    res.json({ success: true, updates: allUpdates });
  } catch (error) {
    console.error("CMS list updates error:", error);
    res.status(500).json({ error: "Failed to fetch updates" });
  }
});

router.post("/updates", requireAuth, requireAdmin, sanitize, audit("create", "dailyUpdate"), async (req, res) => {
  try {
    const payload = createDailyUpdateSchema.parse(req.body);
    const [created] = await db.insert(dailyUpdates).values({
      ...payload,
      createdAt: new Date(),
    }).returning();
    res.json({ success: true, update: created });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    console.error("CMS create update error:", error);
    res.status(500).json({ error: "Failed to create update" });
  }
});

router.put("/updates/:id", requireAuth, requireAdmin, sanitize, audit("update", "dailyUpdate"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const payload = updateDailyUpdateSchema.parse(req.body);
    const [existing] = await db.select().from(dailyUpdates).where(eq(dailyUpdates.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Update not found" });

    const [updated] = await db.update(dailyUpdates).set({
      ...payload,
    }).where(eq(dailyUpdates.id, id)).returning();
    
    res.json({ success: true, update: updated });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    console.error("CMS update update error:", error);
    res.status(500).json({ error: "Failed to update" });
  }
});

router.delete("/updates/:id", requireAuth, requireAdmin, audit("delete", "dailyUpdate"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(dailyUpdates).where(eq(dailyUpdates.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("CMS delete update error:", error);
    res.status(500).json({ error: "Failed to delete update" });
  }
});

export default router;