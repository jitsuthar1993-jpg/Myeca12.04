import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type BlogAudience,
  type BlogFaqItem,
  type BlogSourceLink,
  estimateReadingTimeMinutes,
  normalizeFaqItems,
  normalizeSourceLinks,
  normalizeStringArray,
  toIsoDate,
} from "../../shared/blog.js";
import { defaultBlogPosts, type DefaultBlogPost } from "./default-blog-content.js";

export type StaticBlogContentType = "how-to" | "explainer" | "news" | "comparison";

export type StaticMdxBlogPost = DefaultBlogPost & {
  primaryKeyword: string;
  secondaryKeywords: string[];
  contentType: StaticBlogContentType;
  howToSteps: string[];
  totalTime: string | null;
};

type StaticBlogFrontmatter = {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  modifiedAt?: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  contentType: StaticBlogContentType;
  faqs: BlogFaqItem[];
  steps: string[];
  totalTime?: string | null;
  id?: string;
  excerpt?: string;
  categoryId?: string;
  coverImage?: string | null;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  authorBio?: string;
  seoTitle?: string;
  seoDescription?: string;
  keyHighlights: string[];
  relatedPostIds: string[];
  ctaLabel?: string;
  ctaHref?: string;
  isFeatured?: boolean;
  readingTimeMinutes?: number;
  createdAt?: string;
  tags: string[];
  audience?: BlogAudience;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  sourceLinks: BlogSourceLink[];
  serviceSlug?: string | null;
  calculatorSlug?: string | null;
  canonicalUrl?: string | null;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", "..");
const contentBlogDir = path.join(rootDir, "content", "blog");
const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeCurrencyText(value: string) {
  return value.replace(/\bINR\b/g, "₹").replace(/\bRs\.?\s*/gi, "₹");
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function readPositiveNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;
}

function normalizeContentType(value: unknown): StaticBlogContentType {
  return value === "how-to" || value === "explainer" || value === "news" || value === "comparison"
    ? value
    : "explainer";
}

function parseFrontmatter(rawFrontmatter: string, fileName: string): StaticBlogFrontmatter {
  const parsed = JSON.parse(rawFrontmatter) as unknown;
  if (!isRecord(parsed)) {
    throw new Error(`Invalid MDX frontmatter object in ${fileName}`);
  }

  const title = readString(parsed.title);
  const description = readString(parsed.description);
  const slug = readString(parsed.slug);
  const publishedAt = toIsoDate(parsed.publishedAt) ?? "";
  const primaryKeyword = readString(parsed.primaryKeyword);

  if (!title || !description || !slug || !publishedAt || !primaryKeyword) {
    throw new Error(`Missing required MDX blog frontmatter fields in ${fileName}`);
  }

  return {
    ...(parsed as StaticBlogFrontmatter),
    title,
    description,
    slug,
    publishedAt,
    modifiedAt: toIsoDate(parsed.modifiedAt) ?? publishedAt,
    primaryKeyword,
    secondaryKeywords: normalizeStringArray(parsed.secondaryKeywords as Array<string | null | undefined> | null | undefined),
    contentType: normalizeContentType(parsed.contentType),
    faqs: normalizeFaqItems(parsed.faqs as Array<{ question?: string; answer?: string } | null | undefined> | null | undefined),
    steps: normalizeStringArray(parsed.steps as Array<string | null | undefined> | null | undefined),
    keyHighlights: normalizeStringArray(parsed.keyHighlights as Array<string | null | undefined> | null | undefined),
    relatedPostIds: normalizeStringArray(parsed.relatedPostIds as Array<string | null | undefined> | null | undefined),
    tags: normalizeStringArray(parsed.tags as Array<string | null | undefined> | null | undefined),
    sourceLinks: normalizeSourceLinks(parsed.sourceLinks as Array<{ label?: string; url?: string } | null | undefined> | null | undefined),
  };
}

function frontmatterToPost(meta: StaticBlogFrontmatter, body: string): StaticMdxBlogPost {
  const tags = normalizeStringArray([meta.primaryKeyword, ...(meta.secondaryKeywords ?? []), ...(meta.tags ?? [])]);
  const keyHighlights = meta.keyHighlights?.length ? meta.keyHighlights : tags.slice(0, 5);
  const readingTimeMinutes = readPositiveNumber(meta.readingTimeMinutes, estimateReadingTimeMinutes(body));
  const publishedAt = meta.publishedAt;
  const updatedAt = meta.modifiedAt || publishedAt;

  return {
    id: readString(meta.id, meta.slug),
    title: normalizeCurrencyText(meta.title),
    slug: meta.slug,
    excerpt: normalizeCurrencyText(readString(meta.excerpt, meta.description)),
    content: normalizeCurrencyText(body.trim()),
    status: "published",
    categoryId: readString(meta.categoryId, "itr-filing"),
    coverImage: meta.coverImage ?? null,
    authorId: readString(meta.authorId, "mye-ca-editorial"),
    authorName: readString(meta.authorName, "MyeCA Editorial Team"),
    authorRole: readString(meta.authorRole, "CA-led tax editorial team"),
    authorBio: readString(meta.authorBio, "Reviewed Indian tax and compliance guidance from the MyeCA editorial desk."),
    seoTitle: normalizeCurrencyText(readString(meta.seoTitle, `${meta.title} | MyeCA.in Blog`)),
    seoDescription: normalizeCurrencyText(readString(meta.seoDescription, meta.description)),
    keyHighlights: keyHighlights.map(normalizeCurrencyText),
    faqItems: meta.faqs
      .map((faq) => ({
        question: normalizeCurrencyText(faq.question ?? ""),
        answer: normalizeCurrencyText(faq.answer ?? ""),
      }))
      .filter((faq) => faq.question && faq.answer),
    relatedPostIds: normalizeStringArray(meta.relatedPostIds ?? []),
    ctaLabel: readString(meta.ctaLabel, "Talk to a Tax Expert"),
    ctaHref: readString(meta.ctaHref, "/expert-consultation"),
    isFeatured: readBoolean(meta.isFeatured),
    readingTimeMinutes,
    publishedAt,
    createdAt: toIsoDate(meta.createdAt) ?? publishedAt,
    updatedAt,
    tags: tags.map(normalizeCurrencyText),
    audience: meta.audience === "individuals" || meta.audience === "businesses" || meta.audience === "both" ? meta.audience : "both",
    reviewedBy: readNullableString(meta.reviewedBy),
    reviewedAt: toIsoDate(meta.reviewedAt),
    sourceLinks: meta.sourceLinks
      .map((source) => ({ label: source.label ?? "", url: source.url ?? "" }))
      .filter((source) => source.label && source.url),
    serviceSlug: readNullableString(meta.serviceSlug),
    calculatorSlug: readNullableString(meta.calculatorSlug),
    canonicalUrl: readNullableString(meta.canonicalUrl),
    primaryKeyword: meta.primaryKeyword,
    secondaryKeywords: meta.secondaryKeywords ?? [],
    contentType: meta.contentType,
    howToSteps: normalizeStringArray(meta.steps ?? []),
    totalTime: readNullableString(meta.totalTime),
  };
}

export function loadStaticMdxBlogPosts(): StaticMdxBlogPost[] {
  if (!fs.existsSync(contentBlogDir)) return [];

  return fs.readdirSync(contentBlogDir)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => {
      const filePath = path.join(contentBlogDir, fileName);
      const raw = fs.readFileSync(filePath, "utf8");
      const match = raw.match(FRONTMATTER_RE);
      if (!match) {
        throw new Error(`Missing JSON frontmatter block in ${filePath}`);
      }

      return frontmatterToPost(parseFrontmatter(match[1], filePath), match[2]);
    });
}

export function loadStaticBlogPosts(): StaticMdxBlogPost[] {
  const mdxPosts = loadStaticMdxBlogPosts();
  if (mdxPosts.length) return mdxPosts;

  return defaultBlogPosts.map((post) => ({
    ...post,
    primaryKeyword: post.tags[0] ?? post.categoryId,
    secondaryKeywords: post.tags.slice(1),
    contentType: "explainer" as const,
    howToSteps: [],
    totalTime: null,
  }));
}
