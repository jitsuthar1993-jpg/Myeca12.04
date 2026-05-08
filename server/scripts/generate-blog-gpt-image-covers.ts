import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { defaultBlogPosts } from "../data/default-blog-content.js";

type BlogCoverPost = (typeof defaultBlogPosts)[number];

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BITMAP_DIR = path.join(ROOT_DIR, "client/public/assets/blog/gpt-covers");
const WRAPPER_DIR = path.join(ROOT_DIR, "client/public/assets/blog/text-covers");

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : null;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/[*_>#|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(value: string, maxLength: number) {
  const normalized = stripMarkdown(value);
  if (normalized.length <= maxLength) return normalized;
  return normalized.slice(0, maxLength + 1).replace(/\s+\S*$/, "").trim();
}

function inferVisualBrief(post: BlogCoverPost) {
  const text = [post.title, post.excerpt, post.categoryId, ...post.keyHighlights, ...post.tags, post.content]
    .join(" ")
    .toLowerCase();
  const category = post.categoryId;

  if (post.slug === "when-will-itr-filing-start-ay-2026-27") {
    return "A taxpayer choosing between ITR-1, ITR-2, ITR-3 and ITR-4 forms after collecting Form 16, AIS and Form 26AS.";
  }
  if (category === "refunds-notices" && /refund|tds|form 16a|form 26as|bank account/.test(text)) {
    return "Income tax refund workflow with TDS certificate, Form 26AS, verified bank account and e-verification status.";
  }
  if (category === "refunds-notices") {
    return "Income tax notice response desk with notice PDF, mismatch checklist, evidence file and reply deadline.";
  }
  if (category === "tax-regime" || /old regime|new regime|87a|rebate|deduction|hra|80c|nps/.test(text)) {
    return "Old versus new tax regime comparison with balanced scales, deduction proofs, salary sheet and final filing choice.";
  }
  if (category === "capital-gains" || /capital gain|mutual fund|equity|broker|crypto|f&o|intraday|trading/.test(text)) {
    return "Capital gains and trading income review with market chart, broker statement, transaction report and tax classification notes.";
  }
  if (category === "foreign-assets-nri-tax" || /foreign|nri|schedule fa|form 67|foreign tax|rsu|espp/.test(text)) {
    return "Foreign asset tax disclosure workspace with overseas account statement, Schedule FA, Form 67 and exchange-rate working.";
  }
  if (category === "business-compliance" || /gst|gstr|itc|invoice|gst registration|ecommerce/.test(text)) {
    return "GST compliance workspace with invoices, GSTR-2B reconciliation, registration documents and a clean monthly filing checklist.";
  }
  if (/notice|defective|143\(1\)|demand|rectification|mismatch/.test(text)) {
    return "Income tax notice response desk with notice PDF, mismatch checklist, evidence file and reply deadline.";
  }
  if (category === "mye-ca-guides" && /document|vault|proof|record|folder|upload/.test(text)) {
    return "Tax document vault with organized folders for Form 16, AIS, bank statements, GST records and notice files.";
  }
  if (category === "tax-planning" || /calendar|planning|advance tax|march|april/.test(text)) {
    return "Year-round tax planning calendar with monthly checkpoints, deduction proofs, advance tax and filing reminders.";
  }
  return "Clean Indian tax filing workspace with documents, calculator notes, checklist cards and a CA-reviewed filing path.";
}

function visibleTitle(post: BlogCoverPost) {
  const title = post.title.toLowerCase();
  if (post.slug === "when-will-itr-filing-start-ay-2026-27") return "ITR Filing Start";
  if (/form 16a|tds refund/.test(title)) return "Form 16A TDS Refund";
  if (/ais|form 26as/.test(title)) return "AIS + Form 26AS";
  if (/old regime|new regime|tax regime/.test(title)) return "Old vs New Regime";
  if (/zero tax|87a|rebate/.test(title)) return "Section 87A Rebate";
  if (/capital gains|shares|mutual funds/.test(title)) return "Capital Gains ITR";
  if (/f&o|intraday|trading/.test(title)) return "Trading Income";
  if (/gst/.test(title)) return "GST Compliance";
  if (/document vault/.test(title)) return "Tax Document Vault";
  if (/tax planning|calendar/.test(title)) return "Tax Planning Calendar";
  if (/mistakes/.test(title)) return "ITR Filing Mistakes";

  return post.title
    .replace(/\b(?:AY|FY)\s*\d{4}[-\u2013]\d{2}\b/gi, "")
    .replace(/[?!.]+$/g, "")
    .replace(/^(?:how|when|why|what|which|where)\s+(?:will|can|does|do|is|are|should)\s+/i, "")
    .replace(/^(?:how|when|why|what|which|should|can|does|do|is|are|will)\s+/i, "")
    .replace(/^(?:i|my|you|your)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 7)
    .join(" ");
}

function buildPrompt(post: BlogCoverPost) {
  const overview = compactText(
    [
      post.excerpt,
      post.keyHighlights.slice(0, 3).join(". "),
      stripMarkdown(post.content).slice(0, 700),
    ].join(" "),
    900,
  );

  return [
    "Use case: infographic-diagram",
    "Asset type: MyeCA blog cover image for a web blog card",
    `Primary request: Create an editorial illustrated cover based on this blog overview: ${overview}`,
    `Subject: ${inferVisualBrief(post)}`,
    "Style/medium: premium flat editorial illustration, clean vector-like digital art, polished tax explainer graphic",
    "Composition/framing: landscape 16:9-ish composition, central visual metaphor, clear safe margins, readable at small blog-card size",
    "Lighting/mood: calm, trustworthy, professional, clear and uncluttered",
    "Color palette: warm cream background, deep navy ink, restrained teal/green and amber accents, white document cards",
    `Text (verbatim): "${visibleTitle(post)}"`,
    "Constraints: include only the exact short title text; keep the text large and readable; no small paragraphs; no watermark; no logos other than a tiny MyeCA.in text mark if needed",
    "Avoid: photorealism, clutter, tiny unreadable text, extra brand names, generic stock-photo look, dark background, gradients, distorted words",
  ].join("\n");
}

function renderWrapperSvg(post: BlogCoverPost, bitmapFileName: string) {
  const title = escapeXml(post.title);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">GPT Image generated MyeCA blog cover for ${title}</desc>
  <image href="../gpt-covers/${escapeXml(bitmapFileName)}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>
</svg>
`;
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function generateCover(openai: OpenAI, post: BlogCoverPost) {
  const bitmapFileName = `${post.slug}.webp`;
  const bitmapPath = path.join(BITMAP_DIR, bitmapFileName);
  const wrapperPath = path.join(WRAPPER_DIR, `${post.slug}.svg`);

  if (!force && (await fileExists(bitmapPath))) {
    await fs.writeFile(wrapperPath, renderWrapperSvg(post, bitmapFileName), "utf8");
    console.log(`Skipped existing bitmap, refreshed wrapper: ${post.slug}`);
    return;
  }

  const response = await openai.images.generate({
    model: "gpt-image-2",
    prompt: buildPrompt(post),
    size: "1536x1024",
    quality: "medium",
    output_format: "webp",
    n: 1,
  });

  const image = response.data?.[0]?.b64_json;
  if (!image) throw new Error(`No image returned for ${post.slug}`);

  await fs.writeFile(bitmapPath, Buffer.from(image, "base64"));
  await fs.writeFile(wrapperPath, renderWrapperSvg(post, bitmapFileName), "utf8");
  console.log(`Generated GPT Image cover: ${post.slug}`);
}

async function run() {
  const posts = Number.isFinite(limit) && limit ? defaultBlogPosts.slice(0, limit) : defaultBlogPosts;
  await fs.mkdir(BITMAP_DIR, { recursive: true });
  await fs.mkdir(WRAPPER_DIR, { recursive: true });

  if (dryRun) {
    console.log(`Dry run: would generate ${posts.length} GPT Image covers with gpt-image-2.`);
    for (const post of posts.slice(0, 5)) {
      console.log(`\n--- ${post.slug} ---\n${buildPrompt(post)}`);
    }
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env before running live GPT Image generation.");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  for (const post of posts) {
    await generateCover(openai, post);
  }

  console.log(`Done. Processed ${posts.length} GPT Image blog covers.`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
