import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadStaticMdxBlogPosts } from "../../../server/data/static-blog-content";

const INCOME_TAX_LAW_BLOG_SLUGS = [
  "income-tax-act-2025-effective-april-2026-overview",
  "ay-2026-27-return-under-1961-act-vs-tax-year-2026-27-under-2025-act",
  "tax-year-2026-27-vs-assessment-year-ay-2026-27-explained",
  "income-tax-act-2025-new-tax-regime-section-202-guide",
  "finance-act-2025-new-regime-slabs-ay-2026-27",
  "section-87a-rebate-12-lakh-special-rate-income-ay-2026-27",
  "income-tax-rules-2026-new-forms-transition-checklist",
  "form-15ca-15cb-to-form-145-146-remittance-transition",
  "form-15g-15h-to-form-121-income-tax-act-2025-guide",
  "form-10e-to-form-39-salary-arrears-relief-transition",
  "pan-tan-new-forms-income-tax-rules-2026-guide",
  "tds-under-income-tax-act-2025-sections-392-393",
  "tcs-under-income-tax-act-2025-section-394-guide",
  "tds-march-april-2026-transition-payroll-vendors",
  "tds-credit-ais-form-168-transition-ay-2026-27",
  "advance-tax-tax-year-2026-27-new-act-checklist",
  "self-assessment-tax-challan-2025-act-payment-guide",
  "old-tax-dues-refunds-recovery-income-tax-act-2025",
  "carry-forward-losses-income-tax-act-2025-transition",
  "capital-loss-carry-forward-new-income-tax-act-2025",
  "mat-amt-credit-income-tax-act-2025-transition-guide",
  "deductions-section-123-schedule-xv-80c-transition",
  "due-date-condition-deductions-section-122-income-tax-act-2025",
  "reassessment-sections-279-286-income-tax-act-2025-guide",
  "pending-assessment-appeal-under-old-act-after-april-2026",
  "capital-gains-exemption-section-54-transition-income-tax-act-2025",
  "two-self-occupied-house-property-finance-act-2025-guide",
  "updated-return-48-months-finance-act-2025-guide",
  "tds-tcs-threshold-rationalisation-finance-act-2025-checklist",
  "income-tax-act-2025-business-freelancer-compliance-roadmap",
] as const;

const VALID_INCOME_TAX_CATEGORIES = new Set([
  "income-tax",
  "itr-filing",
  "tax-regime",
  "tax-planning",
  "refunds-notices",
  "capital-gains",
  "foreign-assets-nri-tax",
  "business-freelancers",
]);

const OFFICIAL_SOURCE_HOSTS = [
  "www.incometax.gov.in",
  "incometax.gov.in",
  "www.incometaxindia.gov.in",
  "incometaxindia.gov.in",
];

function coverPath(slug: string) {
  return path.resolve(process.cwd(), "client", "public", "assets", "blog", "text-covers", `${slug}.svg`);
}

describe("new income tax law blog cluster", () => {
  const posts = loadStaticMdxBlogPosts();
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));
  const postIds = new Set(posts.map((post) => post.id));

  it("publishes 30 new-law posts with complete metadata and covers", () => {
    expect(INCOME_TAX_LAW_BLOG_SLUGS).toHaveLength(30);

    for (const slug of INCOME_TAX_LAW_BLOG_SLUGS) {
      const post = postsBySlug.get(slug);
      expect(post, `Missing income tax law blog post ${slug}`).toBeTruthy();
      if (!post) continue;

      expect(post.status).toBe("published");
      expect(post.publishedAt).toBe("2026-05-27T00:00:00.000Z");
      expect(
        Date.parse(post.updatedAt),
        `${slug} updatedAt must not predate publication`,
      ).toBeGreaterThanOrEqual(Date.parse(post.publishedAt));
      expect(VALID_INCOME_TAX_CATEGORIES.has(post.categoryId), `${slug} category`).toBe(true);
      expect(post.contentType, `${slug} contentType`).toMatch(/^(how-to|explainer)$/);
      expect(post.audience, `${slug} audience`).toMatch(/^(individuals|businesses|both)$/);
      expect(
        post.faqItems.every((faq) => faq.question.trim() && faq.answer.trim()),
        `${slug} visible FAQs`,
      ).toBe(true);
      expect(post.howToSteps.length, `${slug} steps`).toBeGreaterThanOrEqual(4);
      expect(post.keyHighlights.length, `${slug} highlights`).toBeGreaterThanOrEqual(3);
      expect(post.relatedPostIds.length, `${slug} related posts`).toBeGreaterThanOrEqual(2);
      expect(post.sourceLinks.length, `${slug} sourceLinks`).toBeGreaterThanOrEqual(2);
      expect(post.coverImage).toBe(`/assets/blog/text-covers/${slug}.svg`);
      expect(fs.existsSync(coverPath(slug)), `${slug} cover file`).toBe(true);
      expect(post.ctaHref, `${slug} ctaHref`).toMatch(/^\/(itr|calculators|expert-consultation|services|business)/);
    }
  });

  it("keeps new-law posts source-backed, related internally, and conservatively worded", () => {
    for (const slug of INCOME_TAX_LAW_BLOG_SLUGS) {
      const post = postsBySlug.get(slug);
      expect(post, `Missing income tax law blog post ${slug}`).toBeTruthy();
      if (!post) continue;

      for (const source of post.sourceLinks) {
        const host = new URL(source.url).host;
        expect(OFFICIAL_SOURCE_HOSTS, `${slug} official source host ${host}`).toContain(host);
      }

      for (const relatedPostId of post.relatedPostIds) {
        expect(postIds.has(relatedPostId), `${slug} related post ${relatedPostId}`).toBe(true);
      }

      expect(post.content, `${slug} conservative wording`).not.toMatch(
        /\b(guaranteed|guarantee|assured refund|notice-proof|government partner|official partner)\b/i,
      );
    }
  });
});
