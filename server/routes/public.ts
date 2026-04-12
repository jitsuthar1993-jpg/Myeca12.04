import { Router } from "express";
import memoize from "memoizee";
import { defaultBlogCategories } from "../data/default-blog-content.js";
import { adminDb } from "../neon-admin.js";
import {
  buildPublicBlogDetail,
  listAllBlogPosts,
  sortPublishedPosts,
  toPublicBlogSummary,
} from "../services/blog.js";
import type { BlogCategory, PublicBlogDetail, PublicBlogSummary } from "@shared/blog";

const router = Router();

const CACHE_HEADER = "public, max-age=300, stale-while-revalidate=600";

type PublicBlogSummaryCompat = PublicBlogSummary & {
  featuredImage: string | null;
  image: string | null;
  categoryName: string;
  categoryId: string | null;
  createdAt: string | null;
  readTime: string;
  author: {
    firstName: string;
    lastName: string;
    name: string;
    role: string | null;
  };
};

type PublicBlogDetailCompat = Omit<PublicBlogDetail, "relatedPosts"> &
  PublicBlogSummaryCompat & {
    relatedPosts: PublicBlogSummaryCompat[];
  };

function normalizeKey(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function splitAuthorName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Team",
    lastName: parts.slice(1).join(" ") || "MyeCA",
  };
}

function categoryName(category: BlogCategory | null | undefined) {
  return category?.name?.trim() || "General";
}

function categoryTokens(category: BlogCategory | null | undefined) {
  return [category?.id, category?.slug, category?.name].map(normalizeKey).filter(Boolean);
}

function withSummaryCompat(post: PublicBlogSummary): PublicBlogSummaryCompat {
  const authorParts = splitAuthorName(post.authorName || "MyeCA Editorial Team");
  const createdAt = post.publishedAt ?? post.updatedAt ?? null;

  return {
    ...post,
    featuredImage: post.coverImage,
    image: post.coverImage,
    categoryName: categoryName(post.category),
    categoryId: post.category?.id ?? null,
    createdAt,
    readTime: `${post.readingTimeMinutes} min read`,
    author: {
      ...authorParts,
      name: post.authorName || "MyeCA Editorial Team",
      role: post.authorRole,
    },
  };
}

function withDetailCompat(post: PublicBlogDetail): PublicBlogDetailCompat {
  return {
    ...post,
    ...withSummaryCompat(post),
    relatedPosts: post.relatedPosts.map(withSummaryCompat),
  };
}

function matchesCategory(post: PublicBlogSummary, categoryFilter: string | undefined) {
  const filter = normalizeKey(categoryFilter);
  if (!filter || filter === "all") return true;
  return categoryTokens(post.category).includes(filter);
}

function matchesSearch(post: PublicBlogSummary, search: string | undefined) {
  const query = normalizeKey(search);
  if (!query) return true;
  const haystack = [
    post.title,
    post.excerpt ?? "",
    post.authorName,
    categoryName(post.category),
    ...post.tags,
  ].join(" ").toLowerCase();
  return haystack.includes(query);
}

const getCachedActiveUpdates = memoize(
  async () => {
    const snapshot = await adminDb.collection("daily_updates")
      .where("isActive", "==", true)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
  { promise: true, maxAge: 300000 },
);

const getCachedBlogs = memoize(
  async (options: { page?: number; limit?: number; category?: string; search?: string } = {}) => {
    const { page = 1, limit = 12, category, search } = options;
    const publishedPosts = sortPublishedPosts(await listAllBlogPosts());
    const summaries = publishedPosts.map(toPublicBlogSummary);

    const filtered = summaries.filter((post) => matchesCategory(post, category) && matchesSearch(post, search));
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginatedPosts = filtered.slice(start, start + limit).map(withSummaryCompat);

    return {
      posts: paginatedPosts,
      total,
      page,
      hasMore: start + limit < total,
    };
  },
  {
    promise: true,
    maxAge: 300000,
    normalizer: (args: Array<{ page?: number; limit?: number; category?: string; search?: string } | undefined>) =>
      JSON.stringify(args[0] ?? {}),
  },
);

const getCachedBlogBySlug = memoize(
  async (slug: string) => {
    const publishedPosts = sortPublishedPosts(await listAllBlogPosts());
    const post = publishedPosts.find((candidate) => candidate.slug === slug);
    if (!post) return null;
    return withDetailCompat(buildPublicBlogDetail(post, publishedPosts));
  },
  { promise: true, maxAge: 300000 },
);

const getCachedCategories = memoize(
  async () => {
    let categories: Array<{ id: string; name: string; slug: string; description: string | null }> = [];

    try {
      const snapshot = await adminDb.collection("categories").orderBy("name").get();
      categories = snapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        const name = typeof data.name === "string" && data.name.trim() ? data.name.trim() : "General";
        const slug = typeof data.slug === "string" && data.slug.trim()
          ? data.slug.trim()
          : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        return {
          id: doc.id,
          name,
          slug,
          description: typeof data.description === "string" ? data.description : null,
        };
      });
    } catch (error) {
      console.warn("Falling back to default public categories:", error);
    }

    const seen = new Set(categories.map((category) => category.id.toLowerCase()));
    defaultBlogCategories.forEach((category) => {
      if (seen.has(category.id.toLowerCase())) return;
      categories.push(category);
      seen.add(category.id.toLowerCase());
    });

    return categories.sort((left, right) => left.name.localeCompare(right.name));
  },
  { promise: true, maxAge: 300000 },
);

router.get("/updates/active", async (_req, res) => {
  try {
    const activeUpdates = await getCachedActiveUpdates();
    res.json({ success: true, updates: activeUpdates });
  } catch (error) {
    console.error("Public fetch active updates error:", error);
    res.status(500).json({ error: "Failed to fetch active updates" });
  }
});

router.get("/blogs", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 12));
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const result = await getCachedBlogs({ page, limit, category, search });
    res.set("Cache-Control", CACHE_HEADER);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Public fetch blogs error:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

router.get("/blogs/:slug", async (req, res) => {
  try {
    const post = await getCachedBlogBySlug(req.params.slug);
    if (!post) return res.status(404).json({ error: "Blog post not found" });

    res.set("Cache-Control", CACHE_HEADER);
    return res.json({ success: true, post });
  } catch (error) {
    console.error("Public fetch single blog error:", error);
    return res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

router.get("/blogs/:slug/related", async (req, res) => {
  try {
    const post = await getCachedBlogBySlug(req.params.slug);
    if (!post) return res.status(404).json({ error: "Blog post not found" });

    const relatedFromDetail = post.relatedPosts ?? [];
    const related = relatedFromDetail.length > 0
      ? relatedFromDetail
      : (await getCachedBlogs({ page: 1, limit: 20 })).posts
          .filter((candidate) => candidate.slug !== post.slug)
          .filter((candidate) => categoryTokens(candidate.category).some((token) => categoryTokens(post.category).includes(token)))
          .slice(0, 3);

    res.set("Cache-Control", CACHE_HEADER);
    return res.json({ success: true, posts: related });
  } catch (error) {
    console.error("Public fetch related blogs error:", error);
    return res.status(500).json({ error: "Failed to fetch related posts" });
  }
});

router.get("/categories", async (_req, res) => {
  try {
    const categories = await getCachedCategories();
    res.set("Cache-Control", CACHE_HEADER);
    res.json({ success: true, categories });
  } catch (error) {
    console.error("Public fetch categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
