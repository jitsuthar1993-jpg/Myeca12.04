import "dotenv/config";
import { defaultBlogCategories, defaultBlogPosts } from "../data/default-blog-content";
import { adminDb } from "../neon-admin";

async function upsertById(collection: string, id: string, data: Record<string, any>) {
  await adminDb.collection(collection).doc(id).set({
    ...data,
    id,
    updatedAt: new Date(),
  }, { merge: true });
}

async function seed() {
  const now = new Date();

  await Promise.all([
    upsertById("categories", "direct-tax", {
      name: "Direct Tax",
      slug: "direct-tax",
      createdAt: now,
    }),
    upsertById("categories", "gst", {
      name: "GST",
      slug: "gst",
      createdAt: now,
    }),
    upsertById("categories", "tax-planning", {
      name: "Tax Planning",
      slug: "tax-planning",
      createdAt: now,
    }),
    upsertById("site_settings", "default", {
      appName: "MyeCA.in",
      appUrl: process.env.APP_URL || "http://localhost:5000",
      createdAt: now,
    }),
    ...defaultBlogCategories.map((category) =>
      upsertById("categories", category.id, {
        ...category,
        createdAt: now,
      }),
    ),
    ...defaultBlogPosts.map((post) =>
      upsertById("blog_posts", post.id, {
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
        publishedAt: new Date(post.publishedAt),
      }),
    ),
  ]);

  console.log(`Seeded Neon defaults and ${defaultBlogPosts.length} in-depth blog posts.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
