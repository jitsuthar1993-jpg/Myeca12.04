import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadStaticMdxBlogPosts } from "../../../server/data/static-blog-content";

const FIRST_SERVICE_BLOG_SLUGS = [
  "msme-udyam-registration-subsidy-readiness-guide",
  "startup-india-dpiit-recognition-benefits-documents-checklist",
  "startup-india-seed-fund-scheme-application-readiness-guide",
  "government-schemes-msme-startup-eligibility-document-checklist",
  "fssai-registration-state-central-license-food-businesses",
  "fssai-renewal-modification-annual-return-checklist",
  "trade-license-registration-shops-restaurants-local-businesses",
  "iso-certification-readiness-guide-small-businesses",
  "company-registration-private-limited-llp-opc-checklist",
  "trademark-registration-india-search-class-filing-objection",
  "digital-signature-certificate-din-business-filings",
  "annual-roc-compliance-calendar-companies-llps",
  "gst-registration-query-reply-certificate-first-compliance",
  "gstr-1-gstr-3b-filing-rhythm-small-businesses",
  "tds-return-filing-checklist-employers-vendors",
  "labour-law-epfo-esic-compliance-starter-checklist",
  "business-audit-assurance-readiness-checklist",
  "business-document-vault-registrations-certificates-renewals",
  "startup-services-first-90-days-compliance-roadmap",
  "startup-tax-benefits-80iac-angel-tax-incentive-readiness",
] as const;

const ADDITIONAL_SERVICE_BLOG_SLUGS = [
  "pan-card-application-correction-business-pan-readiness",
  "tan-registration-tds-deductor-readiness-checklist",
  "professional-tax-registration-return-state-compliance-checklist",
  "foreign-remittance-form-15ca-15cb-document-readiness",
  "esi-epfo-registration-employer-payroll-readiness-guide",
  "bookkeeping-starter-monthly-accounts-compliance-checklist",
  "virtual-cfo-mis-cash-flow-compliance-reporting-guide",
  "investment-advisory-risk-profile-suitability-readiness",
  "funding-documentation-data-room-investor-readiness-guide",
  "partnership-deed-founder-agreement-legal-document-checklist",
] as const;

const SERVICE_BLOG_SLUGS = [
  ...FIRST_SERVICE_BLOG_SLUGS,
  ...ADDITIONAL_SERVICE_BLOG_SLUGS,
] as const;

const VALID_SERVICE_BLOG_CATEGORIES = new Set([
  "business-compliance",
  "government-schemes",
  "mye-ca-guides",
]);

const OFFICIAL_SOURCE_HOSTS = [
  "foscos.fssai.gov.in",
  "www.fssai.gov.in",
  "udyamregistration.gov.in",
  "seedfund.startupindia.gov.in",
  "www.startupindia.gov.in",
  "tutorial.gst.gov.in",
  "www.gst.gov.in",
  "ipindia.gov.in",
  "www.ipindia.gov.in",
  "www.mca.gov.in",
  "labour.gov.in",
  "www.labour.gov.in",
  "registration.shramsuvidha.gov.in",
  "www.bis.gov.in",
  "www.indiacode.nic.in",
  "www.india.gov.in",
  "www.incometax.gov.in",
  "services.india.gov.in",
  "ctax.karnataka.gov.in",
  "www.esic.gov.in",
  "esic.gov.in",
  "www.epfindia.gov.in",
  "epfindia.gov.in",
  "investor.sebi.gov.in",
  "www.sebi.gov.in",
];

function coverPath(slug: string) {
  return path.resolve(process.cwd(), "client", "public", "assets", "blog", "text-covers", `${slug}.svg`);
}

describe("non-income-tax service blog cluster", () => {
  const posts = loadStaticMdxBlogPosts();
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));
  const postIds = new Set(posts.map((post) => post.id));

  it("publishes the full service-led cluster with complete metadata", () => {
    expect(SERVICE_BLOG_SLUGS).toHaveLength(30);

    for (const slug of SERVICE_BLOG_SLUGS) {
      const post = postsBySlug.get(slug);
      expect(post, `Missing service blog post ${slug}`).toBeTruthy();
      if (!post) continue;

      expect(post.status).toBe("published");
      expect(post.publishedAt).toBe("2026-05-27T00:00:00.000Z");
      expect(new Date(post.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(post.publishedAt).getTime());
      expect(VALID_SERVICE_BLOG_CATEGORIES.has(post.categoryId), `${slug} category`).toBe(true);
      expect(post.audience).toBe("businesses");
      expect(post.serviceSlug, `${slug} serviceSlug`).toMatch(/^[a-z0-9-]+$/);
      expect(post.ctaHref, `${slug} ctaHref`).toMatch(/^\/(services|startup|expert-consultation|business)/);
      expect(post.contentType, `${slug} contentType`).toBe("how-to");
      expect(post.howToSteps.length, `${slug} steps`).toBeGreaterThanOrEqual(4);
      expect(post.faqItems.length, `${slug} FAQs`).toBeGreaterThanOrEqual(3);
      expect(post.keyHighlights.length, `${slug} highlights`).toBeGreaterThanOrEqual(3);
      expect(post.sourceLinks.length, `${slug} sourceLinks`).toBeGreaterThanOrEqual(1);
      expect(post.relatedPostIds.length, `${slug} related posts`).toBeGreaterThanOrEqual(2);
      expect(post.coverImage).toBe(`/assets/blog/text-covers/${slug}.svg`);
      expect(fs.existsSync(coverPath(slug)), `${slug} cover file`).toBe(true);
    }
  });

  it("keeps service posts tied to official sources and existing related posts", () => {
    for (const slug of SERVICE_BLOG_SLUGS) {
      const post = postsBySlug.get(slug);
      expect(post, `Missing service blog post ${slug}`).toBeTruthy();
      if (!post) continue;

      for (const source of post.sourceLinks) {
        const host = new URL(source.url).host;
        expect(OFFICIAL_SOURCE_HOSTS, `${slug} official source host ${host}`).toContain(host);
      }

      for (const relatedPostId of post.relatedPostIds) {
        expect(postIds.has(relatedPostId), `${slug} related post ${relatedPostId}`).toBe(true);
      }

      expect(post.content, `${slug} conservative wording`).not.toMatch(
        /\b(guaranteed approval|approval guaranteed|approved in \d|assured subsidy|official partner|government partner)\b/i,
      );
    }
  });
});
