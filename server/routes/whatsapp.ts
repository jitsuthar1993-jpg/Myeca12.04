import { Router, type Request, type Response } from "express";
import twilio from "twilio";
import { generateBlog, refineBlog, type GeneratedBlog } from "../services/blog-generator.js";
import { adminDb } from "../neon-admin.js";
import { buildBlogPostWriteData, getCategoryLookup, normalizeStoredBlogPostRecord } from "../services/blog.js";
import { clearPublicBlogCaches } from "./public.js";

const router = Router();

// ── Conversation state (in-memory, keyed by WhatsApp sender number) ──────────
type ConvState =
  | { phase: "idle" }
  | { phase: "generating"; topic: string }
  | { phase: "review"; blog: GeneratedBlog }
  | { phase: "publishing" };

const sessions = new Map<string, ConvState>();

// ── Twilio client (lazy — only constructed when env vars are present) ─────────
function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio credentials not configured");
  return twilio(sid, token);
}

function twilioNumber() {
  return process.env.TWILIO_WHATSAPP_NUMBER ?? "whatsapp:+14155238886";
}

// ── Send a WhatsApp message (splits >4000 chars across multiple messages) ─────
async function sendWA(to: string, text: string) {
  const client = getTwilioClient();
  const chunks: string[] = [];

  // WhatsApp message limit is 4096 chars; leave buffer for safety
  const LIMIT = 3800;
  for (let i = 0; i < text.length; i += LIMIT) {
    chunks.push(text.slice(i, i + LIMIT));
  }

  for (const chunk of chunks) {
    await client.messages.create({
      from: twilioNumber(),
      to,
      body: chunk,
    });
  }
}

// ── Format blog preview for WhatsApp (plain text, not markdown) ───────────────
function formatPreview(blog: GeneratedBlog): string {
  const tags = blog.tags.join(", ");
  const preview = blog.content.slice(0, 800) + (blog.content.length > 800 ? "…" : "");

  return [
    `${blog.featuredImage} *${blog.title}*`,
    ``,
    `📂 Category: ${blog.category}`,
    `🏷 Tags: ${tags}`,
    `⏱ Read time: ${blog.readingTimeMinutes} min`,
    ``,
    `📝 _Excerpt_`,
    blog.excerpt,
    ``,
    `📄 _Content preview_`,
    preview,
    ``,
    `────────────────────────`,
    `Reply with:`,
    `  *upload* — publish to myeca.in`,
    `  *edit: [your notes]* — revise and resend`,
    `  *full* — see the full blog text`,
    `  *cancel* — discard this draft`,
  ].join("\n");
}

// ── Publish blog via blog webhook (reuses existing auth + cache-clear logic) ──
async function publishBlog(blog: GeneratedBlog): Promise<string> {
  const lookup = await getCategoryLookup();

  const existing = await adminDb
    .collection("blog_posts")
    .where("slug", "==", blog.slug)
    .limit(1)
    .get();

  const existingDoc = existing.docs[0];
  const existingNorm = existingDoc
    ? normalizeStoredBlogPostRecord(existingDoc.id, existingDoc.data() as Record<string, unknown>, lookup)
    : null;

  const writeData = await buildBlogPostWriteData(
    {
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt ?? null,
      status: "published",
      tags: blog.tags,
      categoryId: null,
      coverImage: null,
      authorId: null,
      authorName: "MyeCA Editorial",
      authorRole: null,
      authorBio: null,
      seoTitle: blog.seoTitle ?? null,
      seoDescription: blog.seoDescription ?? null,
      keyHighlights: [],
      faqItems: [],
      relatedPostIds: [],
      ctaLabel: null,
      ctaHref: null,
      isFeatured: false,
      readingTimeMinutes: blog.readingTimeMinutes ?? null,
      publishedAt: new Date().toISOString(),
      audience: blog.audience ?? null,
      reviewedBy: null,
      reviewedAt: null,
      sourceLinks: [],
      serviceSlug: null,
      calculatorSlug: null,
      canonicalUrl: null,
    },
    { existing: existingNorm, authUserId: null }
  );

  const ref = existingDoc
    ? adminDb.collection("blog_posts").doc(existingDoc.id)
    : adminDb.collection("blog_posts").doc();

  if (existingDoc) {
    await ref.update(writeData);
  } else {
    await ref.set(writeData);
  }

  clearPublicBlogCaches();
  return `https://myeca.in/blog/${blog.slug}`;
}

// ── Validate Twilio signature (optional but recommended in production) ─────────
function validateTwilioSignature(req: Request): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return true; // Skip validation if not configured

  const signature = req.headers["x-twilio-signature"] as string;
  if (!signature) return false;

  const url = `${process.env.APP_URL ?? "https://myeca.in"}/api/whatsapp/webhook`;
  return twilio.validateRequest(authToken, signature, url, req.body as Record<string, string>);
}

// ── Main webhook POST handler ─────────────────────────────────────────────────
router.post("/webhook", async (req: Request, res: Response) => {
  // Twilio expects a 200 TwiML response; we send empty TwiML and reply async
  res.set("Content-Type", "text/xml");
  res.send("<Response></Response>");

  const from: string = req.body?.From ?? "";
  const body: string = (req.body?.Body ?? "").trim();

  if (!from || !body) return;

  // Optional Twilio signature check
  if (!validateTwilioSignature(req)) {
    console.warn("[WhatsApp] Invalid Twilio signature from", from);
    return;
  }

  const lower = body.toLowerCase();
  const state = sessions.get(from) ?? { phase: "idle" };

  try {
    // ── CANCEL ──────────────────────────────────────────────────────────────
    if (lower === "cancel") {
      sessions.delete(from);
      await sendWA(from, "❌ Draft discarded. Send a new topic anytime to write another blog.");
      return;
    }

    // ── FULL PREVIEW ────────────────────────────────────────────────────────
    if (lower === "full" && state.phase === "review") {
      await sendWA(from, state.blog.content);
      return;
    }

    // ── UPLOAD ──────────────────────────────────────────────────────────────
    if (lower === "upload" && state.phase === "review") {
      sessions.set(from, { phase: "publishing" });
      await sendWA(from, "⏳ Publishing to myeca.in...");

      const url = await publishBlog(state.blog);

      sessions.delete(from);
      await sendWA(
        from,
        `✅ *Published!*\n\n${url}\n\nThe post will appear on the blog index within ~5 minutes (cache refreshes automatically).\n\nSend another topic to write a new blog!`
      );
      return;
    }

    // ── EDIT ────────────────────────────────────────────────────────────────
    if (lower.startsWith("edit:") && state.phase === "review") {
      const notes = body.slice(5).trim();
      if (!notes) {
        await sendWA(from, "Please include your revision notes after 'edit:' e.g.\n*edit: add a table for old vs new regime*");
        return;
      }

      await sendWA(from, "✍️ Revising the blog...");
      const revised = await refineBlog(state.blog, notes);
      sessions.set(from, { phase: "review", blog: revised });
      await sendWA(from, formatPreview(revised));
      return;
    }

    // ── UPLOAD/EDIT sent but no draft in session ───────────────────────────
    if ((lower === "upload" || lower.startsWith("edit:")) && state.phase !== "review") {
      await sendWA(from, "No draft in progress. Send a blog topic first e.g.\n*Section 87A rebate FY 2025-26*");
      return;
    }

    // ── STILL GENERATING ────────────────────────────────────────────────────
    if (state.phase === "generating" || state.phase === "publishing") {
      await sendWA(from, "⏳ Still working on the previous request, please wait...");
      return;
    }

    // ── NEW TOPIC ────────────────────────────────────────────────────────────
    sessions.set(from, { phase: "generating", topic: body });
    await sendWA(
      from,
      `✍️ Writing a blog on:\n*"${body}"*\n\nThis usually takes 20-30 seconds...`
    );

    const blog = await generateBlog(body);
    sessions.set(from, { phase: "review", blog });
    await sendWA(from, formatPreview(blog));

  } catch (err: any) {
    console.error("[WhatsApp] Error:", err?.message ?? err);
    sessions.delete(from);
    await sendWA(
      from,
      "❌ Something went wrong while generating the blog. Please try again.\n\nIf the issue persists, check that OPENAI_API_KEY is set in the server environment."
    ).catch(() => {});
  }
});

export default router;
