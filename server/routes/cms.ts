import { Router, Response } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin, requireTeamMember, AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../neon-admin.js";
import { sanitize } from "../middleware/sanitize.js";
import multer from "multer";
import sharp from "sharp";
import { put, list } from "@vercel/blob";
import { blogPostEditorSchema, blogPostUpdateSchema, type BlogPostEditorInput } from "../../shared/blog.js";
import {
  buildBlogPostWriteData,
  getCategoryLookup,
  normalizeStoredBlogPostRecord,
  type StoredBlogPost,
} from "../services/blog.js";
import { clearPublicBlogCaches } from "./public.js";

const router = Router();

// Configure multer to use memory storage (buffer) for Vercel Blob uploads
const upload = multer({
  storage: multer.memoryStorage(),
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

function storedPostToEditorInput(post: StoredBlogPost): BlogPostEditorInput {
  return blogPostEditorSchema.parse({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    status: post.status,
    categoryId: post.categoryId,
    coverImage: post.coverImage,
    authorId: post.authorId,
    authorName: post.authorName,
    authorRole: post.authorRole,
    authorBio: post.authorBio,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    keyHighlights: post.keyHighlights,
    faqItems: post.faqItems,
    relatedPostIds: post.relatedPostIds,
    ctaLabel: post.ctaLabel,
    ctaHref: post.ctaHref,
    isFeatured: post.isFeatured,
    readingTimeMinutes: post.readingTimeMinutes,
    publishedAt: post.publishedAt,
    tags: post.tags,
  });
}

// List posts with filters
router.get("/posts", requireAuth, requireTeamMember, async (req: AuthRequest, res: Response) => {
  try {
    const { q, status } = req.query as { q?: string; status?: string };

    const lookup = await getCategoryLookup();

    // Fetch all posts to allow in-memory filtering and sorting without composite indexes
    const snapshot = await adminDb.collection("blog_posts").get();
    let posts = snapshot.docs.map((doc: any) =>
      normalizeStoredBlogPostRecord(doc.id, doc.data() as Record<string, unknown>, lookup),
    );

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
      const dateA = new Date(a.createdAt || a.updatedAt || 0);
      const dateB = new Date(b.createdAt || b.updatedAt || 0);
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
    const lookup = await getCategoryLookup();
    const post = normalizeStoredBlogPostRecord(doc.id, doc.data() as Record<string, unknown>, lookup);
    res.json({ success: true, post });
  } catch (error) {
    console.error("CMS get post error:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// Create post
router.post("/posts", requireAuth, requireTeamMember, sanitize, async (req: AuthRequest, res: Response) => {
  try {
    const payload = blogPostEditorSchema.parse(req.body);
    const authUser = req.auth;

    const postRef = adminDb.collection("blog_posts").doc();
    const writeData = await buildBlogPostWriteData(payload, { authUserId: authUser?.userId });

    await postRef.set(writeData);
    clearPublicBlogCaches();

    const lookup = await getCategoryLookup();
    const post = normalizeStoredBlogPostRecord(postRef.id, writeData as Record<string, unknown>, lookup);
    res.json({ success: true, post });
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
    const payload = blogPostUpdateSchema.parse(req.body);

    const postRef = adminDb.collection("blog_posts").doc(id);
    const doc = await postRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Post not found" });

    const lookup = await getCategoryLookup();
    const existing = normalizeStoredBlogPostRecord(id, doc.data() as Record<string, unknown>, lookup);
    const completePayload = blogPostEditorSchema.parse({
      ...storedPostToEditorInput(existing),
      ...payload,
    });
    const writeData = await buildBlogPostWriteData(completePayload, {
      existing,
      authUserId: req.auth?.userId,
    });

    await postRef.update(writeData);
    clearPublicBlogCaches();

    const updatedLookup = await getCategoryLookup();
    const post = normalizeStoredBlogPostRecord(id, writeData as Record<string, unknown>, updatedLookup);
    res.json({ success: true, post });
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
    clearPublicBlogCaches();
    res.json({ success: true });
  } catch (error) {
    console.error("CMS delete post error:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// --- Upload (Vercel Blob) ---
router.post("/upload", requireAuth, requireTeamMember, upload.single("image"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // Compress and convert to WebP in memory
    const webpBuffer = await sharp(req.file.buffer)
      .resize(1920, null, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toBuffer();

    const thumbnailBuffer = await sharp(req.file.buffer)
      .resize(300, 300, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 70 })
      .toBuffer();

    // Upload both to Vercel Blob
    const [mainBlob, thumbBlob] = await Promise.all([
      put(`blog-images/${uniqueSuffix}.webp`, webpBuffer, {
        access: "public",
        contentType: "image/webp",
      }),
      put(`blog-images/thumbnails/${uniqueSuffix}.webp`, thumbnailBuffer, {
        access: "public",
        contentType: "image/webp",
      }),
    ]);

    res.json({
      success: true,
      url: mainBlob.url,
      thumbnailUrl: thumbBlob.url,
    });
  } catch (error: any) {
    console.error("CMS upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload image" });
  }
});

// --- Media (Vercel Blob) ---
router.get("/media", requireAuth, requireTeamMember, async (_req: AuthRequest, res: Response) => {
  try {
    const { blobs } = await list({ prefix: "blog-images/", limit: 100 });

    // Filter out thumbnails for the main listing
    const mainImages = blobs.filter((b) => !b.pathname.includes("/thumbnails/"));

    const files = mainImages.map((blob) => {
      const baseName = blob.pathname.split("/").pop() || blob.pathname;
      const thumbBlob = blobs.find(
        (b) => b.pathname === `blog-images/thumbnails/${baseName}`,
      );
      return {
        name: baseName,
        url: blob.url,
        thumbnailUrl: thumbBlob?.url || blob.url,
        size: blob.size,
        mtime: new Date(blob.uploadedAt),
      };
    }).sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

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
    clearPublicBlogCaches();
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
