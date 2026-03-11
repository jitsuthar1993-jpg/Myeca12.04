import { Router } from "express";
import { db } from "../db.js";
import { blogPosts, categories, dailyUpdates, users } from "../../shared/schema.js";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

// Get active daily updates
router.get("/updates/active", async (req, res) => {
  try {
    const activeUpdates = await db.select()
      .from(dailyUpdates)
      .where(eq(dailyUpdates.isActive, true))
      .orderBy(desc(dailyUpdates.createdAt));
      
    res.json({ success: true, updates: activeUpdates });
  } catch (error) {
    console.error("Public fetch active updates error:", error);
    res.status(500).json({ error: "Failed to fetch active updates" });
  }
});

// Get all published blogs
router.get("/blogs", async (req, res) => {
  try {
    const posts = await db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      status: blogPosts.status,
      tags: blogPosts.tags,
      featuredImage: blogPosts.featuredImage,
      createdAt: blogPosts.createdAt,
      author: {
        firstName: users.firstName,
        lastName: users.lastName,
      },
      category: categories.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .leftJoin(categories, eq(blogPosts.categoryId, categories.id))
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.createdAt));
      
    res.json({ success: true, posts });
  } catch (error) {
    console.error("Public fetch blogs error:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// Get a single published blog by slug
router.get("/blogs/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const [post] = await db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      content: blogPosts.content,
      excerpt: blogPosts.excerpt,
      status: blogPosts.status,
      tags: blogPosts.tags,
      featuredImage: blogPosts.featuredImage,
      createdAt: blogPosts.createdAt,
      author: {
        firstName: users.firstName,
        lastName: users.lastName,
      },
      category: categories.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .leftJoin(categories, eq(blogPosts.categoryId, categories.id))
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
    .limit(1);

    if (!post) return res.status(404).json({ error: "Blog post not found" });

    res.json({ success: true, post });
  } catch (error) {
    console.error("Public fetch single blog error:", error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const allCategories = await db.select().from(categories).orderBy(categories.name);
    res.json({ success: true, categories: allCategories });
  } catch (error) {
    console.error("Public fetch categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
