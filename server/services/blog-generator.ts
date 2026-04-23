import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface GeneratedBlog {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage: string;
  readingTimeMinutes: number;
  seoTitle: string;
  seoDescription: string;
  audience: "individuals" | "businesses" | "both";
}

const SYSTEM_PROMPT = `You are an expert Indian tax blog writer for MyeCA.in — a CA-assisted income tax e-filing platform. Write factual, SEO-optimized blog posts for Indian taxpayers.

RESPONSE FORMAT — return ONLY valid JSON, no markdown fences:
{
  "title": "Clear title with year e.g. Complete Guide for FY 2025-26",
  "slug": "url-friendly-lowercase-hyphens-no-special-chars",
  "category": "one of: Direct Tax | GST | Tax Planning | General",
  "excerpt": "Two-sentence summary suitable for search snippets",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "featuredImage": "single relevant emoji",
  "audience": "individuals | businesses | both",
  "content": "full blog in markdown (see rules below)"
}

CONTENT RULES (markdown):
- NO # heading at start (title renders separately)
- Open with a short 2-3 sentence intro paragraph
- Use > blockquotes for 2-3 key highlights near the top
- ## for main sections, ### for subsections
- | tables for slabs, comparisons, deadlines
- - bullets for feature/requirement lists
- 1. numbered lists for sequential steps
- **bold** for key terms, rupee amounts, and dates
- End with ## Frequently Asked Questions with 4-6 Q&As
- Link relevant calculators inline: [HRA Calculator](/calculators/hra)
- Target 1000-1400 words
- Use ₹ for all rupee amounts
- Cite Income Tax Act sections e.g. Section 80C, Section 10(13A)
- FY 2025-26 / AY 2026-27 is the current financial year`;

export async function generateBlog(topic: string): Promise<GeneratedBlog> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Write a comprehensive blog post on this topic for myeca.in: "${topic}"`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(raw) as GeneratedBlog;

  // Derive reading time: ~200 wpm
  const wordCount = parsed.content?.split(/\s+/).length ?? 0;
  parsed.readingTimeMinutes = Math.max(3, Math.round(wordCount / 200));
  parsed.seoTitle = `${parsed.title} | MyeCA.in`;
  parsed.seoDescription = parsed.excerpt;

  return parsed;
}

export async function refineBlog(
  existing: GeneratedBlog,
  editNotes: string
): Promise<GeneratedBlog> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Here is an existing blog post (JSON):\n${JSON.stringify(existing)}\n\nApply these edits and return the full updated blog as JSON:\n${editNotes}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(raw) as GeneratedBlog;

  const wordCount = parsed.content?.split(/\s+/).length ?? 0;
  parsed.readingTimeMinutes = Math.max(3, Math.round(wordCount / 200));
  parsed.seoTitle = `${parsed.title} | MyeCA.in`;
  parsed.seoDescription = parsed.excerpt;

  return parsed;
}
