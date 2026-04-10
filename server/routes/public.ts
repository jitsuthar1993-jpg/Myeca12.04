import { Router } from "express";
import { adminDb } from "../firebase-admin";
import memoize from "memoizee";

const router = Router();

// Cache headers for public blog content
const CACHE_HEADER = "public, max-age=300, stale-while-revalidate=600";

// --- Helper: resolve author/category from denormalized or legacy data ---
async function resolveAuthorAndCategory(data: FirebaseFirestore.DocumentData) {
  // Use denormalized fields if available (written at save time by CMS)
  let author = data.authorName
    ? { firstName: data.authorName.split(" ")[0] || "Team", lastName: data.authorName.split(" ").slice(1).join(" ") || "MyeCA" }
    : { firstName: "Team", lastName: "MyeCA" };
  let category = data.categoryName || "General";

  // Fallback: fetch from related collections for legacy posts without denormalized fields
  if (!data.authorName && data.authorId) {
    const authorDoc = await adminDb.collection("users").doc(data.authorId).get();
    if (authorDoc.exists) {
      const authorData = authorDoc.data()!;
      author = {
        firstName: authorData.firstName || "Team",
        lastName: authorData.lastName || "MyeCA",
      };
    }
  }
  if (!data.categoryName && data.categoryId) {
    const catSnapshot = await adminDb.collection("categories")
      .where("id", "==", data.categoryId)
      .limit(1)
      .get();
    if (!catSnapshot.empty) {
      category = catSnapshot.docs[0].data().name;
    }
  }

  return { author, category };
}

// --- Memoized Data Fetchers ---
// Caches results for 5 minutes (300,000 ms) to reduce DB load
const getCachedActiveUpdates = memoize(
  async () => {
    const snapshot = await adminDb.collection("daily_updates")
      .where("isActive", "==", true)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  { promise: true, maxAge: 300000 }
);

const getCachedBlogs = memoize(
  async (options: { page?: number; limit?: number; category?: string; search?: string } = {}) => {
    const { page = 1, limit = 12, category, search } = options;

    // Query only published posts directly from Firestore
    let query: FirebaseFirestore.Query = adminDb.collection("blog_posts")
      .where("status", "==", "published")
      .orderBy("createdAt", "desc");

    // Fetch with a generous buffer for client-side filtering (category/search)
    // If no filters, fetch only what's needed for the page
    const fetchLimit = (category || search) ? 200 : limit * page + 1;
    query = query.limit(fetchLimit);

    const snapshot = await query.get();

    // Batch resolve author/category (uses denormalized fields when available)
    const allPosts = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const { author, category: cat } = await resolveAuthorAndCategory(data);

      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        tags: data.tags,
        featuredImage: data.featuredImage,
        createdAt: data.createdAt,
        author,
        category: cat,
      };
    }));

    // Apply optional filters
    let filtered = allPosts;
    if (category && category !== "All") {
      filtered = filtered.filter(p => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt || "").toLowerCase().includes(q)
      );
    }

    // Paginate
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginatedPosts = filtered.slice(start, start + limit);
    const hasMore = start + limit < total;

    return { posts: paginatedPosts, total, page, hasMore };
  },
  {
    promise: true,
    maxAge: 300000,
    normalizer: (args: any[]) => JSON.stringify(args[0] || {}),
  }
);

const getCachedBlogBySlug = memoize(
  async (slug: string) => {
    const snapshot = await adminDb.collection("blog_posts")
      .where("slug", "==", slug)
      .where("status", "==", "published")
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    const { author, category } = await resolveAuthorAndCategory(data);

    return {
      id: doc.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      tags: data.tags,
      featuredImage: data.featuredImage,
      createdAt: data.createdAt,
      categoryId: data.categoryId,
      author,
      category,
    };
  },
  { promise: true, maxAge: 300000 }
);

const getCachedCategories = memoize(
  async () => {
    const snapshot = await adminDb.collection("categories").orderBy("name").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  { promise: true, maxAge: 300000 }
);

// Get active daily updates
router.get("/updates/active", async (req, res) => {
  try {
    const activeUpdates = await getCachedActiveUpdates();
    res.json({ success: true, updates: activeUpdates });
  } catch (error) {
    console.error("Public fetch active updates error:", error);
    res.status(500).json({ error: "Failed to fetch active updates" });
  }
});

// Get published blogs with pagination and optional filters
router.get("/blogs", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await getCachedBlogs({ page, limit, category, search });
    res.set("Cache-Control", CACHE_HEADER);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Public fetch blogs error:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// Get a single published blog by slug
router.get("/blogs/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const post = await getCachedBlogBySlug(slug);

    if (!post) return res.status(404).json({ error: "Blog post not found" });

    res.set("Cache-Control", CACHE_HEADER);
    res.json({ success: true, post });
  } catch (error) {
    console.error("Public fetch single blog error:", error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

// Get related posts for a blog (by same category, excluding current)
router.get("/blogs/:slug/related", async (req, res) => {
  try {
    const slug = req.params.slug;
    const post = await getCachedBlogBySlug(slug);
    if (!post) return res.status(404).json({ error: "Blog post not found" });

    // Fetch a small set of published posts to find related ones
    const result = await getCachedBlogs({ page: 1, limit: 20 });
    const related = result.posts
      .filter((p: any) => p.slug !== slug && p.category === post.category)
      .slice(0, 3);

    res.set("Cache-Control", CACHE_HEADER);
    res.json({ success: true, posts: related });
  } catch (error) {
    console.error("Public fetch related blogs error:", error);
    res.status(500).json({ error: "Failed to fetch related posts" });
  }
});

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const allCategories = await getCachedCategories();
    res.set("Cache-Control", CACHE_HEADER);
    res.json({ success: true, categories: allCategories });
  } catch (error) {
    console.error("Public fetch categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
