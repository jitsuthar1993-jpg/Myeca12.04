import { adminDb, type NeonAdminDb } from "../neon-admin.js";
import { defaultBlogCategories, defaultBlogPosts } from "../data/default-blog-content.js";
import {
  type BlogCategory,
  type BlogFaqItem,
  type BlogPostEditorInput,
  DEFAULT_BLOG_CTA,
  estimateReadingTimeMinutes,
  normalizeBlogContent,
  normalizeBlogCta,
  normalizeFaqItems,
  normalizeStringArray,
  serializeTags,
  slugifyHeading,
  toIsoDate,
} from "../../shared/blog.js";

export interface StoredBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: "draft" | "published";
  categoryId: string | null;
  category: BlogCategory | null;
  coverImage: string | null;
  authorId: string | null;
  authorName: string;
  authorRole: string | null;
  authorBio: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  keyHighlights: string[];
  faqItems: BlogFaqItem[];
  relatedPostIds: string[];
  ctaLabel: string | null;
  ctaHref: string | null;
  isFeatured: boolean;
  readingTimeMinutes: number;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  tags: string[];
}

type CategoryLookup = {
  byId: Map<string, BlogCategory>;
  aliases: Map<string, BlogCategory>;
};

function trimNullable(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeStatus(value: unknown): "draft" | "published" {
  return typeof value === "string" && value.trim().toLowerCase() === "published" ? "published" : "draft";
}

function parseNumeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function getUserSnapshot(userId: string | null | undefined) {
  if (!userId) return null;
  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) return null;
  const data = userDoc.data() ?? {};
  const firstName = typeof data.firstName === "string" ? data.firstName.trim() : "";
  const lastName = typeof data.lastName === "string" ? data.lastName.trim() : "";
  return {
    id: userDoc.id,
    name: [firstName, lastName].filter(Boolean).join(" ").trim() || "MyeCA Editorial Team",
    role: typeof data.role === "string" ? data.role : null,
  };
}

export async function getCategoryLookup(db: NeonAdminDb = adminDb): Promise<CategoryLookup> {
  const byId = new Map<string, BlogCategory>();
  const aliases = new Map<string, BlogCategory>();

  const addCategory = (docId: string, data: Record<string, unknown>) => {
    const category: BlogCategory = {
      id: docId,
      name: typeof data.name === "string" && data.name.trim() ? data.name.trim() : "General",
      slug:
        typeof data.slug === "string" && data.slug.trim()
          ? data.slug.trim()
          : slugifyHeading(typeof data.name === "string" ? data.name : "general"),
      description: trimNullable(data.description),
    };

    byId.set(category.id, category);
    aliases.set(category.id.toLowerCase(), category);
    aliases.set(category.slug.toLowerCase(), category);
    aliases.set(category.name.toLowerCase(), category);

    if (data.id !== undefined && data.id !== null) {
      aliases.set(String(data.id).toLowerCase(), category);
    }
  };

  defaultBlogCategories.forEach((category) => addCategory(category.id, category));

  try {
    const snapshot = await db.collection("categories").orderBy("name").get();
    snapshot.docs.forEach((doc) => addCategory(doc.id, doc.data() as Record<string, unknown>));
  } catch (error) {
    console.warn("Falling back to default blog categories:", error);
  }

  return { byId, aliases };
}

export function resolveCategory(categoryId: unknown, lookup: CategoryLookup): BlogCategory | null {
  if (categoryId === null || categoryId === undefined) return null;
  const key = String(categoryId).trim().toLowerCase();
  if (!key) return null;
  return lookup.aliases.get(key) ?? null;
}

export function normalizeStoredBlogPostRecord(
  docId: string,
  data: Record<string, unknown>,
  lookup: CategoryLookup,
): StoredBlogPost {
  const legacyPublished =
    data.isPublished === true ||
    data.published === true ||
    (data.status === undefined && data.publishedAt !== undefined && data.publishedAt !== null);
  const category = resolveCategory(data.categoryId ?? data.categoryName ?? data.category, lookup);
  const authorLegacy =
    typeof data.author === "object" && data.author
      ? data.author as { firstName?: string; lastName?: string }
      : null;
  const legacyAuthorName = [authorLegacy?.firstName, authorLegacy?.lastName]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ")
    .trim();

  const content = typeof data.content === "string" ? data.content : "";
  const normalizedContent = normalizeBlogContent(content).html;
  const readingTimeMinutes =
    parseNumeric(data.readingTimeMinutes) ??
    parseNumeric(data.readingTime) ??
    estimateReadingTimeMinutes(content);
  const keyHighlights = normalizeStringArray(data.keyHighlights as Array<string | null | undefined> | null | undefined);
  const faqItems = normalizeFaqItems(data.faqItems as Array<Partial<BlogFaqItem> | null | undefined> | null | undefined);
  const relatedPostIds = normalizeStringArray(data.relatedPostIds as Array<string | null | undefined> | null | undefined);
  const tags = serializeTags(data.tags as string[] | string | null | undefined);

  return {
    id: docId,
    title: typeof data.title === "string" ? data.title : "Untitled Post",
    slug: typeof data.slug === "string" ? data.slug : docId,
    excerpt: trimNullable(data.excerpt),
    content: normalizedContent,
    status: normalizeStatus(data.status ?? (legacyPublished ? "published" : undefined)),
    categoryId: category?.id ?? null,
    category,
    coverImage: trimNullable(data.coverImage) ?? trimNullable(data.featuredImage),
    authorId: trimNullable(data.authorId),
    authorName:
      (trimNullable(data.authorName) ??
        trimNullable(data.author as string | null | undefined) ??
        legacyAuthorName) ||
      "MyeCA Editorial Team",
    authorRole: trimNullable(data.authorRole),
    authorBio: trimNullable(data.authorBio),
    seoTitle: trimNullable(data.seoTitle),
    seoDescription: trimNullable(data.seoDescription) ?? trimNullable(data.metaDescription) ?? trimNullable(data.excerpt),
    keyHighlights,
    faqItems,
    relatedPostIds,
    ctaLabel: trimNullable(data.ctaLabel),
    ctaHref: trimNullable(data.ctaHref),
    isFeatured: Boolean(data.isFeatured),
    readingTimeMinutes,
    publishedAt: toIsoDate(data.publishedAt) ?? null,
    createdAt: toIsoDate(data.createdAt) ?? null,
    updatedAt: toIsoDate(data.updatedAt) ?? null,
    tags,
  };
}

export async function listAllBlogPosts(db: NeonAdminDb = adminDb): Promise<StoredBlogPost[]> {
  const lookup = await getCategoryLookup(db);
  let storedPosts: StoredBlogPost[] = [];

  try {
    const snapshot = await db.collection("blog_posts").get();
    storedPosts = snapshot.docs.map((doc) => normalizeStoredBlogPostRecord(doc.id, doc.data() as Record<string, unknown>, lookup));
  } catch (error) {
    console.warn("Falling back to default blog posts:", error);
  }

  const storedSlugs = new Set(storedPosts.map((post) => post.slug));
  const fallbackPosts = defaultBlogPosts
    .filter((post) => !storedSlugs.has(post.slug))
    .map((post) => normalizeStoredBlogPostRecord(post.id, post as unknown as Record<string, unknown>, lookup));

  return [...storedPosts, ...fallbackPosts];
}

export async function getBlogPostById(id: string, db: NeonAdminDb = adminDb): Promise<StoredBlogPost | null> {
  const lookup = await getCategoryLookup(db);

  try {
    const doc = await db.collection("blog_posts").doc(id).get();
    if (doc.exists) return normalizeStoredBlogPostRecord(doc.id, doc.data() as Record<string, unknown>, lookup);
  } catch (error) {
    console.warn(`Falling back while loading blog post '${id}':`, error);
  }

  const fallback = defaultBlogPosts.find((post) => post.id === id || post.slug === id);
  return fallback ? normalizeStoredBlogPostRecord(fallback.id, fallback as unknown as Record<string, unknown>, lookup) : null;
}

export async function buildBlogPostWriteData(
  input: BlogPostEditorInput,
  options?: {
    existing?: StoredBlogPost | null;
    authUserId?: string | null;
    db?: NeonAdminDb;
  },
) {
  const db = options?.db ?? adminDb;
  const lookup = await getCategoryLookup(db);
  const existing = options?.existing ?? null;
  const category = resolveCategory(input.categoryId, lookup);
  const userSnapshot = await getUserSnapshot(input.authorId ?? options?.authUserId ?? existing?.authorId);
  const normalizedContent = normalizeBlogContent(input.content).html;
  const now = new Date();
  const status = normalizeStatus(input.status);
  const hasPublishedAt = trimNullable(input.publishedAt) || existing?.publishedAt;
  const publishedAt =
    status === "published"
      ? toIsoDate(hasPublishedAt) ?? now.toISOString()
      : null;
  const authorName = trimNullable(input.authorName) ?? userSnapshot?.name ?? existing?.authorName ?? "MyeCA Editorial Team";
  const authorRole = trimNullable(input.authorRole) ?? userSnapshot?.role ?? existing?.authorRole ?? null;

  return {
    title: input.title.trim(),
    slug: input.slug.trim(),
    excerpt: trimNullable(input.excerpt),
    content: normalizedContent,
    status,
    categoryId: category?.id ?? null,
    coverImage: trimNullable(input.coverImage),
    authorId: trimNullable(input.authorId) ?? options?.authUserId ?? existing?.authorId ?? null,
    authorName,
    authorRole,
    authorBio: trimNullable(input.authorBio),
    seoTitle: trimNullable(input.seoTitle) ?? trimNullable(input.title),
    seoDescription: trimNullable(input.seoDescription) ?? trimNullable(input.excerpt),
    keyHighlights: normalizeStringArray(input.keyHighlights),
    faqItems: normalizeFaqItems(input.faqItems),
    relatedPostIds: normalizeStringArray(input.relatedPostIds),
    ctaLabel: trimNullable(input.ctaLabel),
    ctaHref: trimNullable(input.ctaHref),
    isFeatured: Boolean(input.isFeatured),
    readingTimeMinutes: input.readingTimeMinutes ?? estimateReadingTimeMinutes(normalizedContent),
    publishedAt: publishedAt ? new Date(publishedAt) : null,
    createdAt: existing?.createdAt ? new Date(existing.createdAt) : now,
    updatedAt: now,
    tags: normalizeStringArray(input.tags),
  };
}

export function sortPublishedPosts(posts: StoredBlogPost[]): StoredBlogPost[] {
  return [...posts]
    .filter((post) => post.status === "published")
    .sort((left, right) => {
      if (left.isFeatured !== right.isFeatured) {
        return Number(right.isFeatured) - Number(left.isFeatured);
      }

      const leftPublished = left.publishedAt ? new Date(left.publishedAt).getTime() : 0;
      const rightPublished = right.publishedAt ? new Date(right.publishedAt).getTime() : 0;
      if (leftPublished !== rightPublished) {
        return rightPublished - leftPublished;
      }

      const leftUpdated = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
      const rightUpdated = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
      return rightUpdated - leftUpdated;
    });
}

export function toPublicBlogSummary(post: StoredBlogPost) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    coverImage: post.coverImage,
    authorName: post.authorName,
    authorRole: post.authorRole,
    readingTimeMinutes: post.readingTimeMinutes,
    isFeatured: post.isFeatured,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    tags: post.tags,
  };
}

export function buildPublicBlogDetail(post: StoredBlogPost, allPublishedPosts: StoredBlogPost[]) {
  const normalized = normalizeBlogContent(post.content);
  const explicitRelated = post.relatedPostIds
    .map((id) => allPublishedPosts.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is StoredBlogPost => Boolean(candidate))
    .filter((candidate) => candidate.id !== post.id);

  const categoryFallback = allPublishedPosts.filter((candidate) => {
    if (candidate.id === post.id) return false;
    if (!post.categoryId || !candidate.categoryId) return false;
    return candidate.categoryId === post.categoryId;
  });

  const relatedPosts = [...explicitRelated];
  for (const candidate of categoryFallback) {
    if (relatedPosts.some((existing) => existing.id === candidate.id)) continue;
    relatedPosts.push(candidate);
    if (relatedPosts.length >= 3) break;
  }

  const cta = normalizeBlogCta(post.ctaLabel, post.ctaHref);

  return {
    ...toPublicBlogSummary(post),
    content: normalized.html,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    authorBio: post.authorBio,
    faqItems: post.faqItems,
    keyHighlights: post.keyHighlights,
    relatedPosts: relatedPosts.slice(0, 3).map(toPublicBlogSummary),
    toc: normalized.toc,
    ctaLabel: cta.ctaLabel,
    ctaHref: cta.ctaHref,
  };
}

export function getDefaultBlogCta() {
  return DEFAULT_BLOG_CTA;
}
