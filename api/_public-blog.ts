import { defaultBlogCategories, type DefaultBlogPost } from "../server/data/default-blog-content.js";
import { loadStaticBlogPosts } from "../server/data/static-blog-content.js";
import { normalizeBlogContent, normalizeBlogCta } from "../shared/blog.js";

const CACHE_HEADER = "public, s-maxage=300, stale-while-revalidate=3600";

function normalizeKey(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function categoryFor(post: DefaultBlogPost) {
  return defaultBlogCategories.find((category) => category.id === post.categoryId) ?? null;
}

function splitAuthorName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Team",
    lastName: parts.slice(1).join(" ") || "MyeCA",
  };
}

function publicSummary(post: DefaultBlogPost) {
  const category = categoryFor(post);
  const authorName = post.authorName || "MyeCA Editorial Team";
  const authorParts = splitAuthorName(authorName);

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category,
    coverImage: post.coverImage,
    featuredImage: post.coverImage,
    image: post.coverImage,
    categoryName: category?.name ?? "General",
    categoryId: category?.id ?? null,
    authorName,
    authorRole: post.authorRole,
    readingTimeMinutes: post.readingTimeMinutes,
    readTime: `${post.readingTimeMinutes} min read`,
    isFeatured: post.isFeatured,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    createdAt: post.createdAt,
    tags: post.tags,
    audience: post.audience ?? "both",
    reviewedBy: post.reviewedBy ?? null,
    reviewedAt: post.reviewedAt ?? null,
    serviceSlug: post.serviceSlug ?? null,
    calculatorSlug: post.calculatorSlug ?? null,
    canonicalUrl: post.canonicalUrl ?? null,
    author: {
      ...authorParts,
      name: authorName,
      role: post.authorRole,
    },
  };
}

function sortPosts(posts: DefaultBlogPost[]) {
  return [...posts]
    .filter((post) => post.status === "published")
    .sort((left, right) => {
      if (left.isFeatured !== right.isFeatured) {
        return Number(right.isFeatured) - Number(left.isFeatured);
      }

      return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
    });
}

function staticBlogPosts() {
  return loadStaticBlogPosts() as DefaultBlogPost[];
}

function categoryTokens(post: DefaultBlogPost) {
  const category = categoryFor(post);
  return [category?.id, category?.slug, category?.name].map(normalizeKey).filter(Boolean);
}

function matchesCategory(post: DefaultBlogPost, category: string | null) {
  const filter = normalizeKey(category);
  if (!filter || filter === "all") return true;
  return categoryTokens(post).includes(filter);
}

function matchesAudience(post: DefaultBlogPost, audience: string | null) {
  const filter = normalizeKey(audience);
  if (!filter || filter === "all") return true;
  if ((post.audience ?? "both") === "both") return true;
  return post.audience === filter;
}

function matchesSearch(post: DefaultBlogPost, search: string | null) {
  const query = normalizeKey(search);
  if (!query) return true;
  const category = categoryFor(post);
  const haystack = [
    post.title,
    post.excerpt,
    post.authorName,
    category?.name,
    ...post.tags,
  ].join(" ").toLowerCase();
  return haystack.includes(query);
}

export function setPublicCache(res: any) {
  res.setHeader("Cache-Control", CACHE_HEADER);
}

export function listPublicCategories() {
  return [...defaultBlogCategories].sort((left, right) => left.name.localeCompare(right.name));
}

export function listPublicBlogs(url: URL) {
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "12", 10) || 12));
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");
  const audience = url.searchParams.get("audience");

  const filtered = sortPosts(staticBlogPosts()).filter(
    (post) => matchesCategory(post, category) && matchesAudience(post, audience) && matchesSearch(post, search),
  );
  const start = (page - 1) * limit;

  return {
    success: true,
    posts: filtered.slice(start, start + limit).map(publicSummary),
    total: filtered.length,
    page,
    hasMore: start + limit < filtered.length,
  };
}

export function getPublicBlogBySlug(slug: string) {
  const posts = sortPosts(staticBlogPosts());
  const post = posts.find((candidate) => candidate.slug === slug);
  if (!post) return null;

  const normalized = normalizeBlogContent(post.content);
  const cta = normalizeBlogCta(post.ctaLabel, post.ctaHref);
  const relatedPosts = posts
    .filter((candidate) => candidate.id !== post.id)
    .filter((candidate) => post.relatedPostIds.includes(candidate.id) || candidate.categoryId === post.categoryId)
    .slice(0, 3)
    .map(publicSummary);

  return {
    ...publicSummary(post),
    content: normalized.html,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    authorBio: post.authorBio,
    faqItems: post.faqItems,
    keyHighlights: post.keyHighlights,
    relatedPosts,
    toc: normalized.toc,
    ctaLabel: cta.ctaLabel,
    ctaHref: cta.ctaHref,
    sourceLinks: post.sourceLinks ?? [],
  };
}

export function requestUrl(req: any) {
  return new URL(req.url ?? "/", `https://${req.headers?.host ?? "myeca12-04.vercel.app"}`);
}
