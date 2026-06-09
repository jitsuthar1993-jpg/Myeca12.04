import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  openaiClient ??= new OpenAI({ apiKey });
  return openaiClient;
}

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
  primaryKeyword: string;
  secondaryKeywords: string[];
  keyTopics: string[];
  sourceLinks: Array<{ label: string; url: string }>;
}

const SYSTEM_PROMPT = `You prepare source-aware editorial drafts for MyeCA.in, an Indian tax filing and compliance platform. The draft must be useful, specific, and ready for a human editor to fact-check. Never claim that a CA reviewed the draft and never invent a person, credential, deadline, tax rate, or official URL.

RESPONSE FORMAT - return ONLY valid JSON, no markdown fences:
{
  "title": "Clear, problem-specific title",
  "slug": "url-friendly-lowercase-hyphens-no-special-chars",
  "category": "one of: Direct Tax | GST | Tax Planning | General",
  "excerpt": "Two-sentence summary suitable for search snippets",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "featuredImage": "single relevant emoji",
  "audience": "individuals | businesses | both",
  "primaryKeyword": "the exact primary search phrase",
  "secondaryKeywords": ["supporting phrase 1", "supporting phrase 2"],
  "keyTopics": ["decision or risk 1", "records to verify", "next step"],
  "sourceLinks": [{"label": "official source name", "url": "known official URL"}],
  "content": "full blog in markdown (see rules below)"
}

CONTENT RULES (markdown):
- NO # heading at start (title renders separately)
- Open with the reader's specific problem, decision, or risk; avoid generic scene-setting
- Distinguish facts that need official verification from practical guidance
- Use ## for main sections and ### for subsections
- Use tables only when they make a real comparison or deadline easier to understand
- Include a realistic example only when assumptions are stated
- Include records to verify, limitations, risk caveats, and a useful next step
- Include FAQs only when they answer distinct search intent; do not force a fixed count
- Use descriptive internal links, never the label "Related MyeCA guide"
- Link only known MyeCA routes and known official sources
- Do not use headings such as "Official source baseline" or "Final takeaway"
- Treat FY 2026-27 / AY 2027-28 as current on 6 June 2026; flag time-sensitive facts for human verification`;

export async function generateBlog(topic: string): Promise<GeneratedBlog> {
  const openai = getOpenAIClient();
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
  const openai = getOpenAIClient();
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
