import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { adminDb } from "../neon-admin.js";
import { sanitize } from "../middleware/sanitize.js";
import { blogPostEditorSchema, type BlogPostEditorInput } from "../../shared/blog.js";
import {
  buildBlogPostWriteData,
  getCategoryLookup,
  normalizeStoredBlogPostRecord,
} from "../services/blog.js";
import { clearPublicBlogCaches } from "./public.js";

const router = Router();

const blogWebhookSchema = blogPostEditorSchema;

function getWebhookSecret() {
  return process.env.BLOG_IMPORT_SECRET?.trim() || process.env.BLOG_WEBHOOK_SECRET?.trim() || "";
}

function readSecretHeader(req: Request) {
  const header = req.get("x-blog-import-secret") || req.get("x-webhook-secret");
  return typeof header === "string" ? header.trim() : "";
}

router.post("/blog-post", sanitize, async (req: Request, res: Response) => {
  try {
    const expectedSecret = getWebhookSecret();
    if (!expectedSecret) {
      return res.status(500).json({ error: "Blog import secret is not configured" });
    }

    const providedSecret = readSecretHeader(req);
    if (!providedSecret || providedSecret !== expectedSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = blogWebhookSchema.parse(req.body) as BlogPostEditorInput;
    const lookup = await getCategoryLookup();

    const existingSnapshot = await adminDb.collection("blog_posts")
      .where("slug", "==", payload.slug)
      .limit(1)
      .get();

    const existingDoc = existingSnapshot.docs[0];
    const existing = existingDoc
      ? normalizeStoredBlogPostRecord(existingDoc.id, existingDoc.data() as Record<string, unknown>, lookup)
      : null;

    const writeData = await buildBlogPostWriteData(payload, {
      existing,
      authUserId: null,
    });

    const postRef = existingDoc
      ? adminDb.collection("blog_posts").doc(existingDoc.id)
      : adminDb.collection("blog_posts").doc();

    if (existingDoc) {
      await postRef.update(writeData);
    } else {
      await postRef.set(writeData);
    }

    clearPublicBlogCaches();

    const updatedLookup = await getCategoryLookup();
    const post = normalizeStoredBlogPostRecord(postRef.id, writeData as Record<string, unknown>, updatedLookup);

    return res.json({
      success: true,
      action: existingDoc ? "updated" : "created",
      post,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }

    console.error("Blog webhook error:", error);
    return res.status(500).json({ error: "Failed to import blog post" });
  }
});

export default router;
