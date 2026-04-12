import { z } from "zod";

export const blogStatusSchema = z.enum(["draft", "published"]);

export const blogFaqItemSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

export const blogTocItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  level: z.union([z.literal(2), z.literal(3)]),
});

export const blogCategorySchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  description: z.string().trim().optional().nullable(),
});

export const blogPostEditorSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().optional().nullable(),
  content: z.string().min(1),
  status: blogStatusSchema.default("draft"),
  categoryId: z.string().trim().optional().nullable(),
  coverImage: z.string().trim().optional().nullable(),
  authorId: z.string().trim().optional().nullable(),
  authorName: z.string().trim().optional().nullable(),
  authorRole: z.string().trim().optional().nullable(),
  authorBio: z.string().trim().optional().nullable(),
  seoTitle: z.string().trim().optional().nullable(),
  seoDescription: z.string().trim().optional().nullable(),
  keyHighlights: z.array(z.string().trim()).optional().default([]),
  faqItems: z.array(blogFaqItemSchema).optional().default([]),
  relatedPostIds: z.array(z.string().trim()).optional().default([]),
  ctaLabel: z.string().trim().optional().nullable(),
  ctaHref: z.string().trim().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  readingTimeMinutes: z.number().int().positive().optional().nullable(),
  publishedAt: z.string().trim().optional().nullable(),
  tags: z.array(z.string().trim()).optional().default([]),
});

export const blogPostUpdateSchema = blogPostEditorSchema.partial();

export const publicBlogSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  category: blogCategorySchema.nullable(),
  coverImage: z.string().nullable(),
  authorName: z.string(),
  authorRole: z.string().nullable(),
  readingTimeMinutes: z.number().int().positive(),
  isFeatured: z.boolean(),
  publishedAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  tags: z.array(z.string()),
});

export const publicBlogDetailSchema = publicBlogSummarySchema.extend({
  content: z.string(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  authorBio: z.string().nullable(),
  faqItems: z.array(blogFaqItemSchema),
  keyHighlights: z.array(z.string()),
  relatedPosts: z.array(publicBlogSummarySchema),
  toc: z.array(blogTocItemSchema),
  ctaLabel: z.string(),
  ctaHref: z.string(),
});

export type BlogFaqItem = z.infer<typeof blogFaqItemSchema>;
export type BlogTocItem = z.infer<typeof blogTocItemSchema>;
export type BlogCategory = z.infer<typeof blogCategorySchema>;
export type BlogPostEditorInput = z.infer<typeof blogPostEditorSchema>;
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>;
export type PublicBlogSummary = z.infer<typeof publicBlogSummarySchema>;
export type PublicBlogDetail = z.infer<typeof publicBlogDetailSchema>;

export const DEFAULT_BLOG_CTA = {
  label: "Talk to a Tax Expert",
  href: "/expert-consultation",
};

const HTML_TAG_RE = /<\/?[a-z][\s\S]*>/i;
const SCRIPT_TAG_RE = /<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi;
const STYLE_TAG_RE = /<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi;
const EVENT_HANDLER_RE = /\son[a-z]+\s*=\s*(['"]).*?\1/gi;
const JS_PROTOCOL_RE = /(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi;

export function stripHtml(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttribute(input: string): string {
  return escapeHtml(input).replace(/`/g, "&#96;");
}

function formatInlineMarkdown(input: string): string {
  const escaped = escapeHtml(input);

  return escaped
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, (_match, text, href) => {
      return `<a href="${escapeHtmlAttribute(href)}">${text}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function closeList(listType: "ul" | "ol" | null, output: string[]): "ul" | "ol" | null {
  if (listType) {
    output.push(`</${listType}>`);
  }
  return null;
}

function flushParagraph(paragraphLines: string[], output: string[]) {
  if (!paragraphLines.length) return;
  output.push(`<p>${formatInlineMarkdown(paragraphLines.join(" "))}</p>`);
  paragraphLines.length = 0;
}

function flushTable(tableRows: string[][] | null, output: string[]) {
  if (!tableRows || !tableRows.length) return;

  const [header, ...rows] = tableRows;
  output.push("<table><thead><tr>");
  header.forEach((cell) => output.push(`<th>${formatInlineMarkdown(cell)}</th>`));
  output.push("</tr></thead>");

  if (rows.length) {
    output.push("<tbody>");
    rows.forEach((row) => {
      output.push("<tr>");
      row.forEach((cell) => output.push(`<td>${formatInlineMarkdown(cell)}</td>`));
      output.push("</tr>");
    });
    output.push("</tbody>");
  }

  output.push("</table>");
}

function isTableRow(line: string): boolean {
  return /^\|.+\|$/.test(line.trim());
}

function parseTableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function markdownToHtml(input: string): string {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];
  const paragraphLines: string[] = [];
  let currentList: "ul" | "ol" | null = null;
  let currentTable: string[][] | null = null;

  const flushBlocks = () => {
    flushParagraph(paragraphLines, output);
    currentList = closeList(currentList, output);
    flushTable(currentTable, output);
    currentTable = null;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      flushBlocks();
      continue;
    }

    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(line);
    if (headingMatch) {
      flushBlocks();
      const level = Math.min(4, headingMatch[1].length);
      output.push(`<h${level}>${formatInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (isTableRow(line)) {
      flushParagraph(paragraphLines, output);
      currentList = closeList(currentList, output);

      const nextLine = lines[index + 1]?.trim() ?? "";
      if (!currentTable) {
        currentTable = [];
      }

      const cells = parseTableCells(line);
      const isSeparator = /^[:\-|\s]+$/.test(nextLine);

      currentTable.push(cells);
      if (isSeparator) {
        index += 1;
      }
      continue;
    }

    if (line.startsWith("> ")) {
      flushBlocks();
      output.push(`<blockquote><p>${formatInlineMarkdown(line.slice(2))}</p></blockquote>`);
      continue;
    }

    const orderedListMatch = /^\d+\.\s+(.+)$/.exec(line);
    if (orderedListMatch) {
      flushParagraph(paragraphLines, output);
      flushTable(currentTable, output);
      currentTable = null;
      if (currentList !== "ol") {
        currentList = closeList(currentList, output);
        output.push("<ol>");
        currentList = "ol";
      }
      output.push(`<li>${formatInlineMarkdown(orderedListMatch[1])}</li>`);
      continue;
    }

    const unorderedListMatch = /^[-*]\s+(.+)$/.exec(line);
    if (unorderedListMatch) {
      flushParagraph(paragraphLines, output);
      flushTable(currentTable, output);
      currentTable = null;
      if (currentList !== "ul") {
        currentList = closeList(currentList, output);
        output.push("<ul>");
        currentList = "ul";
      }
      output.push(`<li>${formatInlineMarkdown(unorderedListMatch[1])}</li>`);
      continue;
    }

    flushTable(currentTable, output);
    currentTable = null;
    currentList = closeList(currentList, output);
    paragraphLines.push(line);
  }

  flushBlocks();

  return output.join("");
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(SCRIPT_TAG_RE, "")
    .replace(STYLE_TAG_RE, "")
    .replace(EVENT_HANDLER_RE, "")
    .replace(JS_PROTOCOL_RE, "$1=$2#$2")
    .trim();
}

export function ensureHtmlContent(input: string): string {
  const normalized = input.trim();
  if (!normalized) return "";
  const html = HTML_TAG_RE.test(normalized) ? normalized : markdownToHtml(normalized);
  return sanitizeHtml(html);
}

export function slugifyHeading(input: string): string {
  return stripHtml(input)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "section";
}

export function estimateReadingTimeMinutes(input: string): number {
  const text = stripHtml(ensureHtmlContent(input));
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function normalizeStringArray(values: Array<string | null | undefined> | null | undefined): string[] {
  return (values ?? [])
    .map((value) => (value ?? "").trim())
    .filter(Boolean);
}

export function normalizeFaqItems(values: Array<Partial<BlogFaqItem> | null | undefined> | null | undefined): BlogFaqItem[] {
  return (values ?? [])
    .map((value): BlogFaqItem | null => {
      const question = (value?.question ?? "").trim();
      const answer = (value?.answer ?? "").trim();
      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is BlogFaqItem => item !== null);
}

export function normalizeBlogCta(ctaLabel?: string | null, ctaHref?: string | null) {
  return {
    ctaLabel: ctaLabel?.trim() || DEFAULT_BLOG_CTA.label,
    ctaHref: ctaHref?.trim() || DEFAULT_BLOG_CTA.href,
  };
}

export function normalizeBlogContent(input: string): { html: string; toc: BlogTocItem[] } {
  const html = ensureHtmlContent(input);
  const toc: BlogTocItem[] = [];
  const usedIds = new Map<string, number>();

  const normalizedHtml = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_match, level, attrs, innerHtml) => {
    const text = stripHtml(innerHtml);
    const baseId = slugifyHeading(text);
    const nextIndex = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, nextIndex + 1);
    const id = nextIndex === 0 ? baseId : `${baseId}-${nextIndex + 1}`;
    const cleanAttrs = attrs.replace(/\sid\s*=\s*(['"]).*?\1/gi, "").trim();
    toc.push({ id, text, level: Number(level) as 2 | 3 });
    const attrText = cleanAttrs ? ` ${cleanAttrs}` : "";
    return `<h${level}${attrText} id="${id}">${innerHtml}</h${level}>`;
  });

  return { html: normalizedHtml, toc };
}

export function serializeTags(tags: string[] | string | null | undefined): string[] {
  if (Array.isArray(tags)) return normalizeStringArray(tags);
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return normalizeStringArray(parsed);
      }
    } catch {
      return normalizeStringArray(tags.split(","));
    }
  }
  return [];
}

export function toIsoDate(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === "object" && value && "toDate" in value && typeof (value as { toDate?: unknown }).toDate === "function") {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}
