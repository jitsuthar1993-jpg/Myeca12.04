import { adminDb, type DataAdminDb } from "../data-admin.js";
import { defaultBlogCategories } from "../data/default-blog-content.js";
import { loadStaticBlogPosts } from "../data/static-blog-content.js";
import {
  type BlogCategory,
  type BlogFaqItem,
  type BlogAudience,
  type BlogSourceLink,
  type BlogPostEditorInput,
  type PublicContentQualityStatus,
  type PublicUserIntent,
  DEFAULT_BLOG_CTA,
  estimateReadingTimeMinutes,
  normalizeBlogContent,
  normalizeBlogCta,
  normalizeFaqItems,
  normalizeSourceLinks,
  normalizeStringArray,
  serializeTags,
  slugifyHeading,
  toIsoDate,
} from "../../shared/blog.js";
import { shouldIndexPublicContent } from "../../shared/public-content-quality.js";

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
  audience: BlogAudience;
  targetAudience: string | null;
  primaryKeyword: string | null;
  secondaryKeywords: string[];
  userIntent: PublicUserIntent;
  keyTopics: string[];
  qualityStatus: PublicContentQualityStatus;
  editorialApprovedBy: string | null;
  editorialApprovedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewerName: string | null;
  reviewerRole: string | null;
  reviewerCredentialName: string | null;
  reviewerCredentialId: string | null;
  reviewerCredentialAuthority: string | null;
  sourceLinks: BlogSourceLink[];
  serviceSlug: string | null;
  calculatorSlug: string | null;
  canonicalUrl: string | null;
}

export type BlogInventorySource = "cms" | "static";

export type BlogInventoryPost = StoredBlogPost & {
  source: BlogInventorySource;
  canEdit: boolean;
  canDelete: boolean;
};

type CategoryLookup = {
  byId: Map<string, BlogCategory>;
  aliases: Map<string, BlogCategory>;
};

const DB_FALLBACK_TIMEOUT_MS = 2500;

function withTimeout<T>(promise: Promise<T>, label: string, timeoutMs = DB_FALLBACK_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

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

function normalizeAudience(value: unknown): BlogAudience {
  return value === "individuals" || value === "businesses" || value === "both" ? value : "both";
}

function normalizeUserIntent(value: unknown): PublicUserIntent {
  return value === "transactional" || value === "navigational" || value === "commercial"
    ? value
    : "informational";
}

function normalizeQualityStatus(value: unknown): PublicContentQualityStatus {
  return value === "approved" || value === "hold" ? value : "needs_revision";
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

export async function getCategoryLookup(db: DataAdminDb = adminDb): Promise<CategoryLookup> {
  const lookup = getDefaultCategoryLookup();

  try {
    const snapshot = await withTimeout(
      db.collection("categories").orderBy("name").get(),
      "Loading blog categories",
    );
    snapshot.docs.forEach((doc) => addCategoryToLookup(lookup, doc.id, doc.data() as Record<string, unknown>));
  } catch (error) {
    console.warn("Falling back to default blog categories:", error);
  }

  return lookup;
}

function addCategoryToLookup(lookup: CategoryLookup, docId: string, data: Record<string, unknown>) {
  const category: BlogCategory = {
    id: docId,
    name: typeof data.name === "string" && data.name.trim() ? data.name.trim() : "General",
    slug:
      typeof data.slug === "string" && data.slug.trim()
        ? data.slug.trim()
        : slugifyHeading(typeof data.name === "string" ? data.name : "general"),
    description: trimNullable(data.description),
  };

  lookup.byId.set(category.id, category);
  lookup.aliases.set(category.id.toLowerCase(), category);
  lookup.aliases.set(category.slug.toLowerCase(), category);
  lookup.aliases.set(category.name.toLowerCase(), category);

  if (data.id !== undefined && data.id !== null) {
    lookup.aliases.set(String(data.id).toLowerCase(), category);
  }
}

export function getDefaultCategoryLookup(): CategoryLookup {
  const byId = new Map<string, BlogCategory>();
  const aliases = new Map<string, BlogCategory>();
  const lookup = { byId, aliases };

  defaultBlogCategories.forEach((category) => addCategoryToLookup(lookup, category.id, category));

  return lookup;
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
  const sourceLinks = normalizeSourceLinks(data.sourceLinks as Array<Partial<BlogSourceLink> | null | undefined> | null | undefined);

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
    audience: normalizeAudience(data.audience),
    targetAudience: trimNullable(data.targetAudience),
    primaryKeyword: trimNullable(data.primaryKeyword),
    secondaryKeywords: normalizeStringArray(data.secondaryKeywords as Array<string | null | undefined> | null | undefined),
    userIntent: normalizeUserIntent(data.userIntent),
    keyTopics: normalizeStringArray(data.keyTopics as Array<string | null | undefined> | null | undefined),
    qualityStatus: normalizeQualityStatus(data.qualityStatus),
    editorialApprovedBy: trimNullable(data.editorialApprovedBy),
    editorialApprovedAt: toIsoDate(data.editorialApprovedAt) ?? null,
    reviewedBy: trimNullable(data.reviewedBy),
    reviewedAt: toIsoDate(data.reviewedAt) ?? null,
    reviewerName: trimNullable(data.reviewerName),
    reviewerRole: trimNullable(data.reviewerRole),
    reviewerCredentialName: trimNullable(data.reviewerCredentialName),
    reviewerCredentialId: trimNullable(data.reviewerCredentialId),
    reviewerCredentialAuthority: trimNullable(data.reviewerCredentialAuthority),
    sourceLinks,
    serviceSlug: trimNullable(data.serviceSlug),
    calculatorSlug: trimNullable(data.calculatorSlug),
    canonicalUrl: trimNullable(data.canonicalUrl),
  };
}

export async function listAllBlogPosts(db: DataAdminDb = adminDb): Promise<StoredBlogPost[]> {
  const lookup = await getCategoryLookup(db);
  let storedPosts: StoredBlogPost[] = [];

  try {
    const snapshot = await withTimeout(
      db.collection("blog_posts").get(),
      "Loading all blog posts",
    );
    storedPosts = snapshot.docs.map((doc) => normalizeStoredBlogPostRecord(doc.id, doc.data() as Record<string, unknown>, lookup));
  } catch (error) {
    console.warn("Unable to load all blog posts:", error);
  }

  return storedPosts;
}

export async function listBlogInventoryPosts(db: DataAdminDb = adminDb): Promise<BlogInventoryPost[]> {
  const lookup = await getCategoryLookup(db);
  let storedPosts: StoredBlogPost[] = [];

  try {
    const snapshot = await withTimeout(
      db.collection("blog_posts").get(),
      "Loading blog post inventory",
    );
    storedPosts = snapshot.docs.map((doc) => normalizeStoredBlogPostRecord(doc.id, doc.data() as Record<string, unknown>, lookup));
  } catch (error) {
    console.warn("Unable to load blog post inventory:", error);
  }

  return mergeBlogInventoryPosts(listDefaultBlogPosts(lookup), storedPosts);
}

/** Optimized: only fetch published posts from DB instead of all posts */
export async function listPublishedBlogPosts(
  db: DataAdminDb = adminDb,
  options: { strict?: boolean } = {},
): Promise<StoredBlogPost[]> {
  const lookup = await getCategoryLookup(db);
  let storedPosts: StoredBlogPost[] = [];

  try {
    const snapshot = await withTimeout(
      db.collection("blog_posts").where("status", "==", "published").get(),
      "Loading published blog posts",
    );
    storedPosts = snapshot.docs.map((doc) => normalizeStoredBlogPostRecord(doc.id, doc.data() as Record<string, unknown>, lookup));
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    console.warn("Unable to load published blog posts:", error);
  }

  return mergePublishedBlogPosts(listDefaultPublishedBlogPosts(), storedPosts);
}

export function listDefaultPublishedBlogPosts(): StoredBlogPost[] {
  return listDefaultBlogPosts()
    .filter(isPubliclyVisibleBlogPost);
}

function listDefaultBlogPosts(lookup: CategoryLookup = getDefaultCategoryLookup()): StoredBlogPost[] {
  return loadStaticBlogPosts()
    .map((post) => normalizeStoredBlogPostRecord(post.id, post as unknown as Record<string, unknown>, lookup));
}

export function getStaticBlogPostById(id: string): StoredBlogPost | null {
  const key = id.trim().toLowerCase();
  if (!key) return null;

  return listDefaultBlogPosts()
    .find((post) => post.id.toLowerCase() === key || post.slug.toLowerCase() === key) ?? null;
}

function toBlogInventoryPost(post: StoredBlogPost, source: BlogInventorySource): BlogInventoryPost {
  const isCmsPost = source === "cms";

  return {
    ...post,
    source,
    canEdit: isCmsPost,
    canDelete: isCmsPost,
  };
}

function mergeBlogInventoryPosts(
  staticPosts: StoredBlogPost[],
  databasePosts: StoredBlogPost[],
): BlogInventoryPost[] {
  const bySlug = new Map<string, BlogInventoryPost>();

  staticPosts.forEach((post) => bySlug.set((post.slug || post.id).toLowerCase(), toBlogInventoryPost(post, "static")));
  databasePosts.forEach((post) => bySlug.set((post.slug || post.id).toLowerCase(), toBlogInventoryPost(post, "cms")));

  return sortBlogInventoryPosts([...bySlug.values()]);
}

export function mergePublishedBlogPosts(
  staticPosts: StoredBlogPost[],
  databasePosts: StoredBlogPost[],
): StoredBlogPost[] {
  const bySlug = new Map<string, StoredBlogPost>();

  staticPosts
    .filter(isPubliclyVisibleBlogPost)
    .forEach((post) => bySlug.set(post.slug || post.id, post));

  databasePosts
    .filter(isPubliclyVisibleBlogPost)
    .forEach((post) => bySlug.set(post.slug || post.id, post));

  return sortPublishedPosts([...bySlug.values()]);
}

export async function getBlogPostById(id: string, db: DataAdminDb = adminDb): Promise<StoredBlogPost | null> {
  const lookup = await getCategoryLookup(db);

  try {
    const doc = await withTimeout(
      db.collection("blog_posts").doc(id).get(),
      `Loading blog post '${id}'`,
    );
    if (doc.exists) return normalizeStoredBlogPostRecord(doc.id, doc.data() as Record<string, unknown>, lookup);
  } catch (error) {
    console.warn(`Unable to load blog post '${id}':`, error);
  }

  return null;
}

export async function buildBlogPostWriteData(
  input: BlogPostEditorInput,
  options?: {
    existing?: StoredBlogPost | null;
    authUserId?: string | null;
    db?: DataAdminDb;
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
    audience: normalizeAudience(input.audience),
    targetAudience: trimNullable(input.targetAudience),
    primaryKeyword: trimNullable(input.primaryKeyword),
    secondaryKeywords: normalizeStringArray(input.secondaryKeywords),
    userIntent: normalizeUserIntent(input.userIntent),
    keyTopics: normalizeStringArray(input.keyTopics),
    qualityStatus: normalizeQualityStatus(input.qualityStatus),
    editorialApprovedBy: trimNullable(input.editorialApprovedBy),
    editorialApprovedAt: input.editorialApprovedAt ? new Date(input.editorialApprovedAt) : null,
    reviewedBy: trimNullable(input.reviewedBy),
    reviewedAt: input.reviewedAt ? new Date(input.reviewedAt) : null,
    reviewerName: trimNullable(input.reviewerName),
    reviewerRole: trimNullable(input.reviewerRole),
    reviewerCredentialName: trimNullable(input.reviewerCredentialName),
    reviewerCredentialId: trimNullable(input.reviewerCredentialId),
    reviewerCredentialAuthority: trimNullable(input.reviewerCredentialAuthority),
    sourceLinks: normalizeSourceLinks(input.sourceLinks),
    serviceSlug: trimNullable(input.serviceSlug),
    calculatorSlug: trimNullable(input.calculatorSlug),
    canonicalUrl: trimNullable(input.canonicalUrl),
  };
}

export function sortPublishedPosts(posts: StoredBlogPost[]): StoredBlogPost[] {
  return [...posts]
    .filter(isPubliclyVisibleBlogPost)
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

export function isPubliclyVisibleBlogPost(
  post: Pick<StoredBlogPost, "status" | "qualityStatus">,
): boolean {
  return post.status === "published" && shouldIndexPublicContent(post.qualityStatus);
}

export function sortBlogInventoryPosts<T extends StoredBlogPost>(posts: T[]): T[] {
  return [...posts].sort((left, right) => {
    if (left.isFeatured !== right.isFeatured) {
      return Number(right.isFeatured) - Number(left.isFeatured);
    }

    const leftTime = Math.max(
      left.updatedAt ? new Date(left.updatedAt).getTime() : 0,
      left.publishedAt ? new Date(left.publishedAt).getTime() : 0,
      left.createdAt ? new Date(left.createdAt).getTime() : 0,
    );
    const rightTime = Math.max(
      right.updatedAt ? new Date(right.updatedAt).getTime() : 0,
      right.publishedAt ? new Date(right.publishedAt).getTime() : 0,
      right.createdAt ? new Date(right.createdAt).getTime() : 0,
    );
    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return left.title.localeCompare(right.title);
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
    serviceSlug: post.serviceSlug,
    calculatorSlug: post.calculatorSlug,
    canonicalUrl: post.canonicalUrl,
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
    sourceLinks: post.sourceLinks,
  };
}

export function getDefaultBlogCta() {
  return DEFAULT_BLOG_CTA;
}
