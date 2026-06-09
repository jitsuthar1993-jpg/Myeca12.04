import fs from "node:fs";
import path from "node:path";
import { defaultBlogPosts, type DefaultBlogPost } from "../server/data/default-blog-content.js";
import { itrSeason2026BlogPosts } from "../server/data/itr-season-2026-content.js";

const outputDir = path.resolve(process.cwd(), "content", "blog");

function legacyNormalizeCurrencyText(value: string) {
  return value.replace(/\bINR\b/g, "₹").replace(/\bRs\.?\s*/gi, "₹");
}

function normalizeCurrencyText(value: string) {
  return value.replace(/\bINR\b/g, "\u20B9").replace(/\bRs\.?\s*(?=\d)/gi, "\u20B9");
}

function inferContentType(post: DefaultBlogPost) {
  const value = `${post.title} ${post.slug} ${post.tags.join(" ")}`.toLowerCase();
  if (value.includes("vs ") || value.includes("comparison") || value.includes("compare")) return "comparison";
  if (value.includes("latest") || value.includes("update")) return "news";
  if (/(how|guide|checklist|filing|registration|return|notice|gst|itr|step)/.test(value)) return "how-to";
  return "explainer";
}

function inferSteps(post: DefaultBlogPost) {
  if (inferContentType(post) !== "how-to") return undefined;

  const action = post.categoryId === "business-compliance" ? "GST or compliance action" : "ITR filing action";
  return [
    `Confirm the relevant FY/AY or tax period for this ${action}.`,
    "Collect source documents, portal downloads, and supporting evidence.",
    "Reconcile the figures with AIS, Form 26AS, GSTR data, books, or working files as applicable.",
    "Prepare the filing, reply, or review note and resolve mismatches before submission.",
    "Submit, verify, and preserve acknowledgements, challans, and final computation records.",
  ];
}

function frontmatterFor(post: DefaultBlogPost) {
  const primaryKeyword = normalizeCurrencyText(post.tags[0] || post.categoryId || post.slug);
  const contentType = inferContentType(post);
  const steps = inferSteps(post);

  return {
    title: normalizeCurrencyText(post.title),
    description: normalizeCurrencyText(post.seoDescription || post.excerpt),
    slug: post.slug,
    publishedAt: post.publishedAt,
    modifiedAt: post.updatedAt || post.publishedAt,
    primaryKeyword,
    secondaryKeywords: post.tags.filter((tag) => tag !== primaryKeyword).map(normalizeCurrencyText),
    contentType,
    faqs: post.faqItems.map((faq) => ({
      question: normalizeCurrencyText(faq.question),
      answer: normalizeCurrencyText(faq.answer),
    })),
    ...(steps ? { steps, totalTime: "P1D" } : {}),
    id: post.id,
    excerpt: normalizeCurrencyText(post.excerpt),
    categoryId: post.categoryId,
    coverImage: post.coverImage,
    authorId: post.authorId,
    authorName: post.authorName,
    authorRole: post.authorRole,
    authorBio: post.authorBio,
    seoTitle: normalizeCurrencyText(post.seoTitle),
    seoDescription: normalizeCurrencyText(post.seoDescription),
    keyHighlights: post.keyHighlights.map(normalizeCurrencyText),
    relatedPostIds: post.relatedPostIds,
    ctaLabel: post.ctaLabel,
    ctaHref: post.ctaHref,
    isFeatured: post.isFeatured,
    readingTimeMinutes: post.readingTimeMinutes,
    createdAt: post.createdAt,
    tags: post.tags.map(normalizeCurrencyText),
    audience: post.audience ?? "both",
    targetAudience: post.targetAudience ?? null,
    userIntent: post.userIntent ?? "informational",
    keyTopics: post.keyTopics?.length ? post.keyTopics.map(normalizeCurrencyText) : post.keyHighlights.map(normalizeCurrencyText),
    qualityStatus: post.qualityStatus ?? "needs_revision",
    editorialApprovedBy: post.editorialApprovedBy ?? null,
    editorialApprovedAt: post.editorialApprovedAt ?? null,
    reviewedBy: post.reviewedBy ?? null,
    reviewedAt: post.reviewedAt ?? null,
    reviewerName: post.reviewerName ?? null,
    reviewerRole: post.reviewerRole ?? null,
    reviewerCredentialName: post.reviewerCredentialName ?? null,
    reviewerCredentialId: post.reviewerCredentialId ?? null,
    reviewerCredentialAuthority: post.reviewerCredentialAuthority ?? null,
    sourceLinks: post.sourceLinks ?? [],
    serviceSlug: post.serviceSlug ?? null,
    calculatorSlug: post.calculatorSlug ?? null,
    canonicalUrl: post.canonicalUrl ?? null,
  };
}

fs.mkdirSync(outputDir, { recursive: true });

const exportPosts = process.argv.includes("--itr-season") ? itrSeason2026BlogPosts : defaultBlogPosts;

for (const post of exportPosts.filter((candidate) => candidate.status === "published")) {
  const filePath = path.join(outputDir, `${post.slug}.mdx`);
  const frontmatter = JSON.stringify(frontmatterFor(post), null, 2);
  fs.writeFileSync(filePath, `---\n${frontmatter}\n---\n\n${normalizeCurrencyText(post.content.trim())}\n`, "utf8");
}

console.log(`Exported ${exportPosts.length} blog posts to ${outputDir}`);
