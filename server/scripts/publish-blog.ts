// @ts-nocheck
/**
 * Reads blog JSON from the path passed as $1, inserts/updates in Neon.
 * Usage: npx dotenv -e .env -- tsx server/scripts/publish-blog.ts <path-to-blog.json>
 */
import "dotenv/config";
import { readFileSync } from "fs";
import { adminDb } from "../neon-admin.js";

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("Usage: tsx server/scripts/publish-blog.ts <path-to-blog.json>");
    process.exit(1);
  }

  const blog = JSON.parse(readFileSync(jsonPath, "utf-8"));

  const {
    title,
    slug,
    content,
    excerpt = null,
    category = "General",
    tags = [],
    featuredImage = "📝",
    readingTimeMinutes = null,
    seoTitle = null,
    seoDescription = null,
    audience = null,
    status = "published",
  } = blog;

  if (!title || !slug || !content) {
    console.error("Blog JSON must have title, slug, and content.");
    process.exit(1);
  }

  // Resolve category
  const catSnap = await adminDb
    .collection("categories")
    .where("name", "==", category)
    .limit(1)
    .get();
  const categoryId = catSnap.empty ? null : catSnap.docs[0].id;

  // Resolve admin author
  const authorSnap = await adminDb
    .collection("users")
    .where("role", "==", "admin")
    .limit(1)
    .get();
  const authorId = authorSnap.empty ? null : authorSnap.docs[0].id;
  const authorName = authorSnap.empty
    ? "MyeCA Editorial"
    : (authorSnap.docs[0].data()?.firstName ?? "MyeCA Editorial");

  const now = new Date();

  // Upsert
  const existing = await adminDb
    .collection("blog_posts")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (!existing.empty) {
    await existing.docs[0].ref.update({
      title,
      content,
      excerpt,
      tags: JSON.stringify(tags),
      seoTitle,
      seoDescription,
      audience,
      status,
      updatedAt: now,
    });
    console.log(`✅ Updated existing post: ${slug}`);
    console.log(`🔗 https://myeca.in/blog/${slug}`);
  } else {
    await adminDb.collection("blog_posts").add({
      title,
      slug,
      content,
      excerpt,
      authorId,
      authorName,
      categoryId,
      status,
      tags: JSON.stringify(tags),
      featuredImage,
      readingTimeMinutes,
      seoTitle,
      seoDescription,
      audience,
      createdAt: now,
      publishedAt: now,
      updatedAt: now,
    });
    console.log(`✅ Published new post: ${slug}`);
    console.log(`🔗 https://myeca.in/blog/${slug}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Upload failed:", err.message);
  process.exit(1);
});
