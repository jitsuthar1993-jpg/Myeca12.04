import { Router, type Request, type Response } from "express";
import twilio from "twilio";
import { generateBlog, refineBlog, type GeneratedBlog } from "../services/blog-generator.js";
import { adminDb } from "../data-admin.js";
import { buildBlogPostWriteData, getCategoryLookup, normalizeStoredBlogPostRecord } from "../services/blog.js";
import { clearPublicBlogCaches } from "./public.js";

const router = Router();

// â”€â”€ Conversation state (in-memory, keyed by WhatsApp sender number) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type ConvState =
  | { phase: "idle" }
  | { phase: "generating"; topic: string }
  | { phase: "review"; blog: GeneratedBlog }
  | { phase: "publishing" };

const sessions = new Map<string, ConvState>();

// â”€â”€ Twilio client (lazy â€” only constructed when env vars are present) â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio credentials not configured");
  return twilio(sid, token);
}

function twilioNumber() {
  return process.env.TWILIO_WHATSAPP_NUMBER ?? "whatsapp:+14155238886";
}

// â”€â”€ Send a WhatsApp message (splits >4000 chars across multiple messages) â”€â”€â”€â”€â”€
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

// â”€â”€ Format blog preview for WhatsApp (plain text, not markdown) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function formatPreview(blog: GeneratedBlog): string {
  const tags = blog.tags.join(", ");
  const preview = blog.content.slice(0, 800) + (blog.content.length > 800 ? "â€¦" : "");

  return [
    `${blog.featuredImage} *${blog.title}*`,
    ``,
    `ðŸ“‚ Category: ${blog.category}`,
    `ðŸ· Tags: ${tags}`,
    `â± Read time: ${blog.readingTimeMinutes} min`,
    ``,
    `ðŸ“ _Excerpt_`,
    blog.excerpt,
    ``,
    `ðŸ“„ _Content preview_`,
    preview,
    ``,
    `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€`,
    `Reply with:`,
    `  *upload* â€” publish to myeca.in`,
    `  *edit: [your notes]* â€” revise and resend`,
    `  *full* â€” see the full blog text`,
    `  *cancel* â€” discard this draft`,
  ].join("\n");
}

// â”€â”€ Publish blog via blog webhook (reuses existing auth + cache-clear logic) â”€â”€
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

// â”€â”€ Validate Twilio signature (optional but recommended in production) â”€â”€â”€â”€â”€â”€â”€â”€â”€
function validateTwilioSignature(req: Request): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return true; // Skip validation if not configured

  const signature = req.headers["x-twilio-signature"] as string;
  if (!signature) return false;

  const url = `${process.env.APP_URL ?? "https://myeca.in"}/api/whatsapp/webhook`;
  return twilio.validateRequest(authToken, signature, url, req.body as Record<string, string>);
}

// â”€â”€ Main webhook POST handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    // â”€â”€ CANCEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (lower === "cancel") {
      sessions.delete(from);
      await sendWA(from, "âŒ Draft discarded. Send a new topic anytime to write another blog.");
      return;
    }

    // â”€â”€ FULL PREVIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (lower === "full" && state.phase === "review") {
      await sendWA(from, state.blog.content);
      return;
    }

    // â”€â”€ UPLOAD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (lower === "upload" && state.phase === "review") {
      sessions.set(from, { phase: "publishing" });
      await sendWA(from, "â³ Publishing to myeca.in...");

      const url = await publishBlog(state.blog);

      sessions.delete(from);
      await sendWA(
        from,
        `âœ… *Published!*\n\n${url}\n\nThe post will appear on the blog index within ~5 minutes (cache refreshes automatically).\n\nSend another topic to write a new blog!`
      );
      return;
    }

    // â”€â”€ EDIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (lower.startsWith("edit:") && state.phase === "review") {
      const notes = body.slice(5).trim();
      if (!notes) {
        await sendWA(from, "Please include your revision notes after 'edit:' e.g.\n*edit: add a table for old vs new regime*");
        return;
      }

      await sendWA(from, "âœï¸ Revising the blog...");
      const revised = await refineBlog(state.blog, notes);
      sessions.set(from, { phase: "review", blog: revised });
      await sendWA(from, formatPreview(revised));
      return;
    }

    // â”€â”€ UPLOAD/EDIT sent but no draft in session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if ((lower === "upload" || lower.startsWith("edit:")) && state.phase !== "review") {
      await sendWA(from, "No draft in progress. Send a blog topic first e.g.\n*Section 87A rebate FY 2025-26*");
      return;
    }

    // â”€â”€ STILL GENERATING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (state.phase === "generating" || state.phase === "publishing") {
      await sendWA(from, "â³ Still working on the previous request, please wait...");
      return;
    }

    // â”€â”€ NEW TOPIC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    sessions.set(from, { phase: "generating", topic: body });
    await sendWA(
      from,
      `âœï¸ Writing a blog on:\n*"${body}"*\n\nThis usually takes 20-30 seconds...`
    );

    const blog = await generateBlog(body);
    sessions.set(from, { phase: "review", blog });
    await sendWA(from, formatPreview(blog));

  } catch (err: any) {
    console.error("[WhatsApp] Error:", err?.message ?? err);
    sessions.delete(from);
    await sendWA(
      from,
      "âŒ Something went wrong while generating the blog. Please try again.\n\nIf the issue persists, check that OPENAI_API_KEY is set in the server environment."
    ).catch(() => {});
  }
});

export default router;
