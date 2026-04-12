# Blog Writing Skill

Write a comprehensive, SEO-optimized blog post for the MyeCA.in tax platform and seed it into Neon.

## Input
The user provides a topic (e.g., "income tax slabs 2025", "how to file GST returns", "section 80C guide").

## Workflow

### Step 1: Research the Topic
Use WebSearch to find current, accurate information about the topic. Focus on:
- Latest Indian tax laws, rules, and rates for the current financial year
- Official government sources (incometax.gov.in, gst.gov.in, epfindia.gov.in)
- Practical examples and calculations
- Common FAQs real taxpayers ask

### Step 2: Write the Blog Post
Create a comprehensive blog post with this structure:

**Title**: Clear, descriptive, includes the year (e.g., "Complete Guide for FY 2025-26")
**Slug**: URL-friendly version of the title (lowercase, hyphens, no special chars)
**Category**: One of "Direct Tax", "GST", "Tax Planning", "General"
**Excerpt**: 2 concise sentences summarizing the article
**Read Time**: Estimate based on ~200 words/minute
**Tags**: JSON array of 4-6 relevant keywords

**Content Format** (markdown):
- Start with a brief introduction paragraph (no # heading — the title is rendered separately)
- Use `> ` blockquotes for key highlights at the top
- Use `## ` for main sections, `### ` for subsections
- Use tables with `| Column | Column |` format for comparisons, slabs, and reference data
- Use `- ` bullet lists for features, requirements, and step lists
- Use `1. ` numbered lists for sequential steps
- Use `**bold**` for emphasis on key terms, amounts, and dates
- Include a `## Frequently Asked Questions` section at the end with 4-6 Q&As
- Target 1000-1500 words for thorough coverage
- Write in clear, professional English accessible to non-experts
- Use Indian Rupee symbol (₹) for amounts
- Reference specific sections of the Income Tax Act where applicable

### Step 3: Seed into Neon
Create/update the file `server/scripts/seed-blog-temp.ts` with this template:

```typescript
import "dotenv/config";
import { adminDb } from "../neon-admin.js";

async function seed() {
  const slug = "YOUR_SLUG";

  // Check if exists
  const existing = await adminDb.collection("blog_posts").where("slug", "==", slug).limit(1).get();
  if (!existing.empty) {
    console.log("Blog already exists with this slug. Updating...");
    await existing.docs[0].ref.update({
      title: "YOUR_TITLE",
      content: `YOUR_CONTENT`,
      excerpt: "YOUR_EXCERPT",
      tags: JSON.stringify(["tag1", "tag2"]),
      readTime: "X min read",
      updatedAt: new Date(),
    });
    console.log("Updated!");
  } else {
    // Get category
    const catSnap = await adminDb.collection("categories").where("name", "==", "CATEGORY").limit(1).get();
    const categoryId = catSnap.empty ? 1 : catSnap.docs[0].data().id;

    // Get author
    const authorSnap = await adminDb.collection("users").where("role", "==", "admin").limit(1).get();
    const authorId = authorSnap.empty ? "" : authorSnap.docs[0].id;

    await adminDb.collection("blog_posts").add({
      title: "YOUR_TITLE",
      slug: slug,
      content: `YOUR_CONTENT`,
      excerpt: "YOUR_EXCERPT",
      authorId: authorId,
      categoryId: categoryId,
      status: "published",
      tags: JSON.stringify(["tag1", "tag2"]),
      featuredImage: "EMOJI",
      readTime: "X min read",
      createdAt: new Date(),
      publishedAt: new Date(),
    });
    console.log("Inserted!");
  }
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
```

### Step 4: Run the Seed Script
Execute: `npx tsx server/scripts/seed-blog-temp.ts`

### Step 5: Verify
Navigate to `/blog` in the preview and confirm the new post appears. Click into it to verify content renders correctly (tables, blockquotes, lists, headings).

## Important Notes
- The blog detail page at `client/src/pages/blog/[slug].page.tsx` has a custom `formatContent()` parser that handles: `## `, `### `, `> ` blockquotes (grouped), `| ` tables, `- ` and `* ` bullet lists, numbered lists (`1. `), and `**bold**` inline formatting
- The API caches blog data for 5 minutes (`maxAge: 300000` in `server/routes/public.ts`), so new posts may take a few minutes to appear
- Blog posts are stored in the Neon-backed `blog_posts` collection
- Categories are in the `categories` collection and referenced by `categoryId`
- Authors are in the `users` collection and referenced by `authorId`
