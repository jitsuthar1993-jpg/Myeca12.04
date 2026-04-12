import { adminDb } from "../neon-admin.js";
import { blogPosts } from "../../client/src/data/blogPosts.js";
import { buildBlogPostWriteData, getCategoryLookup } from "../services/blog.js";
import { estimateReadingTimeMinutes, slugifyHeading } from "../../shared/blog.js";

async function ensureCategory(categoryName: string) {
  const lookup = await getCategoryLookup();
  const existing = Array.from(lookup.byId.values()).find((category) => category.name.toLowerCase() === categoryName.toLowerCase());
  if (existing) return existing.id;

  const categoryRef = adminDb.collection("categories").doc();
  const category = {
    name: categoryName,
    slug: slugifyHeading(categoryName),
    description: null,
  };

  await categoryRef.set(category);
  return categoryRef.id;
}

function parseReadingTime(value?: string) {
  if (!value) return null;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}

async function run() {
  const existingSnapshot = await adminDb.collection("blog_posts").get();
  const existingSlugs = new Set(existingSnapshot.docs.map((doc) => String(doc.data().slug ?? "")));

  for (const post of blogPosts) {
    if (existingSlugs.has(post.slug)) {
      console.log(`Skipped existing slug: ${post.slug}`);
      continue;
    }

    const categoryId = await ensureCategory(post.category || "Insights");
    const writeData = await buildBlogPostWriteData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      status: "published",
      categoryId,
      coverImage: (post as { featuredImage?: string }).featuredImage ?? post.image ?? null,
      authorName: post.author || null,
      authorRole: null,
      authorBio: null,
      seoTitle: post.title,
      seoDescription: post.excerpt,
      keyHighlights: [],
      faqItems: [],
      relatedPostIds: [],
      ctaLabel: null,
      ctaHref: null,
      isFeatured: false,
      readingTimeMinutes: parseReadingTime(post.readTime) ?? estimateReadingTimeMinutes(post.content),
      publishedAt: post.date ? new Date(post.date).toISOString() : null,
      tags: post.tags ?? [],
    });

    await adminDb.collection("blog_posts").add(writeData);
    console.log(`Imported: ${post.slug}`);
  }

  console.log("Static blog import complete.");
}

run().catch((error) => {
  console.error("Static blog import failed:", error);
  process.exit(1);
});
