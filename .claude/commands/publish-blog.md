# MyeCA Blog Publisher

Write a complete, SEO-optimized blog post for myeca.in, show it for review, then publish it to the live database with a single confirmation.

## Input
The user provides a topic. Examples:
- "Section 87A rebate for FY 2025-26"
- "How to file ITR-4 for freelancers"
- "Crypto taxation in India 2025"

## Workflow

---

### Step 1 — Research
Use WebSearch to find accurate, current information:
- Latest IT Act sections, rules, and rates
- Official sources: incometax.gov.in, gst.gov.in, cbic.gov.in
- Practical examples with ₹ amounts
- Common taxpayer questions

---

### Step 2 — Write the Blog Post

Produce the full blog in this structure:

**Metadata block** (output this first, clearly labelled):
```
TITLE:   <clear title including year e.g. "Complete Guide for FY 2025-26">
SLUG:    <url-friendly-lowercase-with-hyphens>
CATEGORY: <one of: Direct Tax | GST | Tax Planning | General>
EXCERPT: <2-sentence summary for search snippets>
TAGS:    <comma list of 4-6 keywords>
READ TIME: <estimate at 200 wpm>
```

**Content** (markdown, 1000–1500 words):
- Opening paragraph (no `#` heading — title renders separately)
- `> ` blockquotes for 2-3 key highlights at the top
- `## ` for main sections, `### ` for subsections
- Tables (`| Col | Col |`) for slabs, comparisons, due dates
- `- ` bullet lists for requirements and feature lists
- `1. ` numbered lists for sequential steps
- `**bold**` for key terms, amounts, and dates
- `## Frequently Asked Questions` section at end with 4-6 Q&As
- Link to relevant calculator where applicable e.g. `[HRA Calculator](/calculators/hra)`
- Use ₹ for all rupee amounts
- Cite specific Income Tax Act sections (e.g. Section 80C, Section 10(13A))

---

### Step 3 — Display for Review

Show the complete blog post (metadata + content) formatted in the terminal.

Then output this exact block so the user knows what to do next:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Blog draft complete. Review the content above.

Reply with:
  upload   → publish this post to myeca.in now
  edit     → provide revision notes and regenerate
  cancel   → discard and stop
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Wait for the user's reply before proceeding.**

---

### Step 4 — On "upload"

1. Write the blog JSON to `blog-draft.json` in the project root:

```json
{
  "title": "<TITLE>",
  "slug": "<SLUG>",
  "content": "<full markdown content>",
  "excerpt": "<EXCERPT>",
  "category": "<CATEGORY>",
  "tags": ["tag1", "tag2", "tag3"],
  "featuredImage": "<relevant emoji>",
  "readingTimeMinutes": <number>,
  "seoTitle": "<TITLE> | MyeCA.in",
  "seoDescription": "<EXCERPT>",
  "audience": "individuals",
  "status": "published"
}
```

2. Run the upload script:

```bash
npx dotenv -e .env -- tsx server/scripts/publish-blog.ts blog-draft.json
```

3. Delete `blog-draft.json` after a successful upload.

4. Confirm success:
```
✅ Published: https://myeca.in/blog/<slug>
The post will appear on the blog index within ~5 minutes (API cache TTL).
```

---

### Step 5 — On "edit"

Apply the user's revision notes to the blog content and loop back to Step 3.

---

### Step 6 — On "cancel"

Confirm the draft was discarded. Delete `blog-draft.json` if it exists.

---

## Notes

- The blog detail page parses these markdown patterns: `## `, `### `, `> ` blockquotes, `| ` tables, `- ` / `* ` bullets, `1. ` numbered lists, `**bold**` inline.
- API cache TTL is 5 minutes — new posts appear on `/blog` after that.
- The upload script (`server/scripts/publish-blog.ts`) upserts: running it twice on the same slug updates the existing post.
- The `.env` file must have `DATABASE_URL` or `POSTGRES_URL` set for the upload to work.
- Categories must already exist in the `categories` table; "General" is the safe fallback.
