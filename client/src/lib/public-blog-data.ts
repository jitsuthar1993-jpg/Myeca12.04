import type { QueryClient } from "@tanstack/react-query";
import type { BlogCategory, PublicBlogDetail, PublicBlogSummary } from "@shared/blog";

export type PublicBlogSummaryCompat = PublicBlogSummary & {
  featuredImage?: string | null;
  image?: string | null;
  categoryName?: string | null;
  categoryId?: string | null;
  createdAt?: string | null;
  readTime?: string | null;
  author?: {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    role?: string | null;
  } | null;
};

export type PublicBlogDetailCompat = Omit<PublicBlogDetail, "relatedPosts"> &
  PublicBlogSummaryCompat & {
    relatedPosts: PublicBlogSummaryCompat[];
  };

export type PublicBlogListResponse = {
  posts: PublicBlogSummaryCompat[];
  total?: number;
  page?: number;
  hasMore?: boolean;
};

export type PublicBlogDetailResponse = {
  post: PublicBlogDetailCompat | null;
};

export type PublicBlogCategoryResponse = {
  categories: Array<
    BlogCategory | { id?: string; name?: string; slug?: string; description?: string | null }
  >;
};

export type PublicBlogListParams = {
  page?: number;
  limit?: number;
  category?: string | null;
  search?: string | null;
  audience?: string | null;
};

export type NormalizedPublicBlogListParams = {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  audience?: string;
};

export const DEFAULT_PUBLIC_BLOG_CATEGORIES: Array<Pick<BlogCategory, "id" | "name" | "slug">> = [
  { id: "itr-filing", name: "ITR Filing", slug: "itr-filing" },
  { id: "income-tax", name: "Income Tax", slug: "income-tax" },
  { id: "tax-regime", name: "Tax Regime", slug: "tax-regime" },
  { id: "tax-planning", name: "Tax Planning", slug: "tax-planning" },
  { id: "capital-gains", name: "Capital Gains", slug: "capital-gains" },
  {
    id: "foreign-assets-nri-tax",
    name: "Foreign Assets & NRI Tax",
    slug: "foreign-assets-nri-tax",
  },
  { id: "refunds-notices", name: "Refunds & Notices", slug: "refunds-notices" },
  { id: "business-freelancers", name: "Business & Freelancers", slug: "business-freelancers" },
  { id: "gst", name: "GST", slug: "gst" },
];

function positiveInteger(value: number | undefined, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value));
}

function normalizeOptionalFilter(value: string | null | undefined) {
  const normalized = (value ?? "").trim().toLowerCase();
  return normalized && normalized !== "all" ? normalized : undefined;
}

function normalizeSearch(value: string | null | undefined) {
  const normalized = (value ?? "").trim().toLowerCase();
  return normalized || undefined;
}

function normalizeSlug(slug: string | null | undefined) {
  return (slug ?? "").trim();
}

export function normalizePublicBlogListParams(
  params: PublicBlogListParams = {},
): NormalizedPublicBlogListParams {
  const normalized: NormalizedPublicBlogListParams = {
    page: positiveInteger(params.page, 1),
    limit: Math.min(50, positiveInteger(params.limit, 12)),
  };
  const category = normalizeOptionalFilter(params.category);
  const audience = normalizeOptionalFilter(params.audience);
  const search = normalizeSearch(params.search);

  if (category) normalized.category = category;
  if (audience) normalized.audience = audience;
  if (search) normalized.search = search;

  return normalized;
}

export const publicBlogQueryKeys = {
  all: ["/api/public/blogs"] as const,
  lists: () => [...publicBlogQueryKeys.all, "list"] as const,
  list: (params: PublicBlogListParams = {}) =>
    [...publicBlogQueryKeys.lists(), normalizePublicBlogListParams(params)] as const,
  detail: (slug: string | null | undefined) =>
    [...publicBlogQueryKeys.all, "detail", normalizeSlug(slug)] as const,
  categories: ["/api/public/categories"] as const,
};

export function buildPublicBlogListUrl(params: PublicBlogListParams = {}) {
  const normalized = normalizePublicBlogListParams(params);
  const searchParams = new URLSearchParams({
    page: String(normalized.page),
    limit: String(normalized.limit),
  });

  if (normalized.category) searchParams.set("category", normalized.category);
  if (normalized.audience) searchParams.set("audience", normalized.audience);
  if (normalized.search) searchParams.set("search", normalized.search);

  return `/api/public/blogs?${searchParams.toString()}`;
}

export function buildPublicBlogDetailUrl(slug: string) {
  return `/api/public/blogs/${encodeURIComponent(normalizeSlug(slug))}`;
}

export async function fetchPublicBlogs(params: PublicBlogListParams = {}) {
  const res = await fetch(buildPublicBlogListUrl(params));
  if (!res.ok) throw new Error("Failed to fetch blogs");
  return (await res.json()) as PublicBlogListResponse;
}

export async function fetchPublicBlogCategories() {
  const res = await fetch("/api/public/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return (await res.json()) as PublicBlogCategoryResponse;
}

export async function fetchPublicBlogDetail(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return null;

  const res = await fetch(buildPublicBlogDetailUrl(normalizedSlug));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch blog post");
  const data = (await res.json()) as PublicBlogDetailResponse;
  return data.post;
}

export function prefetchPublicBlogIndex(queryClient: QueryClient) {
  return Promise.all([
    queryClient.prefetchQuery({
      queryKey: publicBlogQueryKeys.list({ page: 1, limit: 13 }),
      queryFn: () => fetchPublicBlogs({ page: 1, limit: 13 }),
    }),
    queryClient.prefetchQuery({
      queryKey: publicBlogQueryKeys.categories,
      queryFn: fetchPublicBlogCategories,
    }),
  ]);
}

export function prefetchPublicBlogDetail(queryClient: QueryClient, slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return Promise.resolve();

  return queryClient.prefetchQuery({
    queryKey: publicBlogQueryKeys.detail(normalizedSlug),
    queryFn: () => fetchPublicBlogDetail(normalizedSlug),
  });
}
