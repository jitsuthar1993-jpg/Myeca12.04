import { Router, Response } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin, requireTeamMember, AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";
import { sanitize } from "../middleware/sanitize.js";
import multer from "multer";
import sharp from "sharp";
import { put, list } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { blogPostEditorSchema, blogPostUpdateSchema, type BlogCategory, type BlogPostEditorInput } from "../../shared/blog.js";
import { assertBlogPublishable, ContentQualityError } from "../../shared/public-content-quality.js";
import { defaultBlogCategories } from "../data/default-blog-content.js";
import {
  buildBlogPostWriteData,
  getCategoryLookup,
  getBlogPostById,
  getStaticBlogPostById,
  listBlogInventoryPosts,
  normalizeStoredBlogPostRecord,
  type StoredBlogPost,
} from "../services/blog.js";
import { clearPublicBlogCaches } from "./public.js";
import { errorResponse, safeError } from "../utils/error-response.js";

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
    audience: post.audience,
    targetAudience: post.targetAudience,
    primaryKeyword: post.primaryKeyword,
    secondaryKeywords: post.secondaryKeywords,
    userIntent: post.userIntent,
    keyTopics: post.keyTopics,
    qualityStatus: post.qualityStatus,
    editorialApprovedBy: post.editorialApprovedBy,
    editorialApprovedAt: post.editorialApprovedAt,
    reviewedBy: post.reviewedBy,
    reviewedAt: post.reviewedAt,
    reviewerName: post.reviewerName,
    reviewerRole: post.reviewerRole,
    reviewerCredentialName: post.reviewerCredentialName,
    reviewerCredentialId: post.reviewerCredentialId,
    reviewerCredentialAuthority: post.reviewerCredentialAuthority,
    sourceLinks: post.sourceLinks,
    serviceSlug: post.serviceSlug,
    calculatorSlug: post.calculatorSlug,
    canonicalUrl: post.canonicalUrl,
  });
}

function withCmsInventoryFlags(post: StoredBlogPost) {
  return {
    ...post,
    source: "cms" as const,
    canEdit: true,
    canDelete: true,
  };
}

// List posts with filters
router.get("/posts", requireAuth, requireTeamMember, async (req: AuthRequest, res: Response) => {
  try {
    const { q, status } = req.query as { q?: string; status?: string };

    let posts = await listBlogInventoryPosts();
    if (status === "draft" || status === "published") {
      posts = posts.filter((post) => post.status === status);
    }

    if (q) {
      const qLower = q.toLowerCase();
      posts = posts.filter((p: any) =>
        (p.title?.toLowerCase() || "").includes(qLower) ||
        (p.slug?.toLowerCase() || "").includes(qLower),
      );
    }

    res.json({ success: true, posts });
  } catch (error) {
    return safeError(res, error, "Failed to fetch posts");
  }
});

router.post("/posts/:id/import", requireAuth, requireTeamMember, async (req: AuthRequest, res: Response) => {
  try {
    const staticPost = getStaticBlogPostById(req.params.id);
    if (!staticPost) return errorResponse(res, 404, "Static post not found");

    const existingSnapshot = await adminDb.collection("blog_posts")
      .where("slug", "==", staticPost.slug)
      .limit(1)
      .get();
    const lookup = await getCategoryLookup();
    const existingDoc = existingSnapshot.docs[0];

    if (existingDoc) {
      const post = normalizeStoredBlogPostRecord(existingDoc.id, existingDoc.data() as Record<string, unknown>, lookup);
      return res.json({ success: true, imported: false, post: withCmsInventoryFlags(post) });
    }

    const postRef = adminDb.collection("blog_posts").doc();
    const writeData = await buildBlogPostWriteData({
      ...storedPostToEditorInput(staticPost),
      status: "draft",
      qualityStatus: "needs_revision",
      editorialApprovedBy: null,
      editorialApprovedAt: null,
      publishedAt: null,
    }, {
      authUserId: req.auth?.userId,
    });

    await postRef.set(writeData);
    clearPublicBlogCaches();

    const post = normalizeStoredBlogPostRecord(postRef.id, writeData as Record<string, unknown>, lookup);
    return res.json({ success: true, imported: true, post: withCmsInventoryFlags(post) });
  } catch (error) {
    if (error instanceof ContentQualityError) {
      return res.status(400).json({ error: error.message, issues: error.issues });
    }
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, error.errors[0].message);
    }
    return safeError(res, error, "Failed to import post");
  }
});

// Get single post
router.get("/posts/:id", requireAuth, requireTeamMember, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = await getBlogPostById(id);
    if (!post) return errorResponse(res, 404, "Post not found");
    res.json({ success: true, post });
  } catch (error) {
    return safeError(res, error, "Failed to fetch post");
  }
});

// Create post
router.post("/posts", requireAuth, requireTeamMember, sanitize, async (req: AuthRequest, res: Response) => {
  try {
    const payload = blogPostEditorSchema.parse(req.body);
    assertBlogPublishable(payload);
    const authUser = req.auth;

    const postRef = adminDb.collection("blog_posts").doc();
    const writeData = await buildBlogPostWriteData(payload, { authUserId: authUser?.userId });

    await postRef.set(writeData);
    clearPublicBlogCaches();

    const lookup = await getCategoryLookup();
    const post = normalizeStoredBlogPostRecord(postRef.id, writeData as Record<string, unknown>, lookup);
    res.json({ success: true, post });
  } catch (error) {
    if (error instanceof ContentQualityError) {
      return res.status(400).json({ error: error.message, issues: error.issues });
    }
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, error.errors[0].message);
    }
    return safeError(res, error, "Failed to create post");
  }
});

// Update post
router.put("/posts/:id", requireAuth, requireTeamMember, sanitize, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload = blogPostUpdateSchema.parse(req.body);

    const postRef = adminDb.collection("blog_posts").doc(id);
    const doc = await postRef.get();
    if (!doc.exists) return errorResponse(res, 404, "Post not found");

    const lookup = await getCategoryLookup();
    const existing = normalizeStoredBlogPostRecord(id, doc.data() as Record<string, unknown>, lookup);

    const completePayload = blogPostEditorSchema.parse({
      ...storedPostToEditorInput(existing),
      ...payload,
    });
    assertBlogPublishable(completePayload);
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
    if (error instanceof ContentQualityError) {
      return res.status(400).json({ error: error.message, issues: error.issues });
    }
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, error.errors[0].message);
    }
    return safeError(res, error, "Failed to update post");
  }
});

// Delete post
router.delete("/posts/:id", requireAuth, requireTeamMember, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const postRef = adminDb.collection("blog_posts").doc(id);
    const doc = await postRef.get();
    if (!doc.exists) return errorResponse(res, 404, "Post not found");

    await postRef.delete();
    clearPublicBlogCaches();
    res.json({ success: true });
  } catch (error) {
    return safeError(res, error, "Failed to delete post");
  }
});

// --- Upload (Vercel Blob) ---
router.post("/upload", requireAuth, requireTeamMember, upload.single("image"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return errorResponse(res, 400, "No file uploaded");

    const uniqueSuffix = `${Date.now()}-${randomUUID()}`;

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
    return safeError(res, error, error.message || "Failed to upload image");
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
    return safeError(res, error, "Failed to list media files");
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
    const byId = new Map<string, BlogCategory>(defaultBlogCategories.map((category) => [category.id, { ...category }]));
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as Partial<BlogCategory>;
      const name = typeof data.name === "string" && data.name.trim() ? data.name.trim() : "General";
      const slug = typeof data.slug === "string" && data.slug.trim()
        ? data.slug.trim()
        : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      byId.set(doc.id, {
        id: doc.id,
        name,
        slug,
        description: typeof data.description === "string" ? data.description : null,
      });
    });
    const allCategories = Array.from(byId.values())
      .sort((left, right) => left.name.localeCompare(right.name));
    res.json({ success: true, categories: allCategories });
  } catch (error) {
    return safeError(res, error, "Failed to fetch categories");
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
    if (error instanceof z.ZodError) return errorResponse(res, 400, error.errors[0].message);
    return safeError(res, error, "Failed to create category");
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
    return safeError(res, error, "Failed to fetch updates");
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
    if (error instanceof z.ZodError) return errorResponse(res, 400, error.errors[0].message);
    return safeError(res, error, "Failed to create update");
  }
});

router.put("/updates/:id", requireAuth, requireTeamMember, sanitize, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload = updateDailyUpdateSchema.parse(req.body);
    const updateRef = adminDb.collection("daily_updates").doc(id);
    const doc = await updateRef.get();
    if (!doc.exists) return errorResponse(res, 404, "Update not found");

    await updateRef.update(payload);
    res.json({ success: true, update: { id, ...doc.data(), ...payload } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(res, 400, error.errors[0].message);
    return safeError(res, error, "Failed to update");
  }
});

router.delete("/updates/:id", requireAuth, requireTeamMember, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await adminDb.collection("daily_updates").doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    return safeError(res, error, "Failed to delete update");
  }
});

export default router;
