import { describe, expect, it } from "vitest";
import {
  blogMeta,
  buildStaticRouteLinks,
  mergeBlogPostsForPrerender,
  routeMeta,
} from "../../../scripts/generate-seo-assets";
import type { DefaultBlogPost } from "../../../server/data/default-blog-content";
import { buildArticleSchema } from "@shared/seo-schema";
import { renderStaticRouteBody } from "@shared/static-seo-content";

function blogPost(overrides: Partial<DefaultBlogPost> = {}): DefaultBlogPost {
  return {
    id: "static-post",
    title: "Static post",
    slug: "same-slug",
    excerpt: "Static excerpt for a useful tax post.",
    content: "<p>Static body content for Indian tax readers.</p>",
    status: "published",
    categoryId: "itr-filing",
    coverImage: "/assets/blog/text-covers/static-post.svg",
    authorId: "mye-ca-editorial",
    authorName: "MyeCA Editorial Team",
    authorRole: "CA-led tax editorial team",
    authorBio: "Reviewed Indian tax guidance.",
    seoTitle: "Static SEO title for same slug | MyeCA.in",
    seoDescription: "Static SEO description for the same slug and Indian tax filing readers.",
    keyHighlights: ["Static highlight"],
    faqItems: [{ question: "Static question?", answer: "Static answer." }],
    relatedPostIds: [],
    ctaLabel: "Talk to a Tax Expert",
    ctaHref: "/expert-consultation",
    isFeatured: false,
    readingTimeMinutes: 4,
    publishedAt: "2026-05-01T00:00:00.000Z",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    tags: ["itr filing"],
    audience: "both",
    reviewedBy: null,
    reviewedAt: null,
    sourceLinks: [],
    serviceSlug: null,
    calculatorSlug: null,
    canonicalUrl: null,
    ...overrides,
  };
}

describe("full SEO plan contracts", () => {
  it("prefers database-published blog posts over static posts with the same slug", () => {
    const staticPost = blogPost();
    const databasePost = blogPost({
      id: "db-post",
      title: "Database post",
      seoTitle: "Database SEO title for same slug | MyeCA.in",
      updatedAt: "2026-05-29T00:00:00.000Z",
    });

    const merged = mergeBlogPostsForPrerender([staticPost], [databasePost]);

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("db-post");
    expect(merged[0].title).toBe("Database post");
  });

  it("emits calculator FAQ schema and matching visible FAQ content", () => {
    const meta = routeMeta("/calculators/income-tax");
    const faqSchema = meta.jsonLd.find((block) => block["@type"] === "FAQPage") as
      | { mainEntity?: Array<{ name: string }> }
      | undefined;

    expect(faqSchema?.mainEntity?.length).toBeGreaterThanOrEqual(3);
    expect(faqSchema?.mainEntity?.[0].name).toMatch(/income tax/i);

    const body = renderStaticRouteBody(meta.body!);
    expect(body).toContain("<h2>Frequently asked questions</h2>");
    expect(body).toContain(faqSchema!.mainEntity![0].name);
  });

  it("uses absolute blog cover URLs and only emits verified reviewer credentials", () => {
    const unverified = blogMeta(blogPost({ reviewedBy: "CA Reviewer" }));
    const unverifiedArticle = unverified.jsonLd.find((block) => block["@type"] === "Article");
    expect(JSON.stringify(unverifiedArticle)).not.toContain("hasCredential");

    const verified = blogMeta(blogPost({
      reviewedBy: "CA Reviewer",
      reviewerName: "CA Reviewer",
      reviewerCredentialId: "M.No. 123456",
      reviewerCredentialName: "Chartered Accountant",
      reviewerCredentialAuthority: "Institute of Chartered Accountants of India",
    }));
    const verifiedArticle = verified.jsonLd.find((block) => block["@type"] === "Article") as Record<string, any>;

    expect(verified.image).toBe("https://myeca.in/assets/blog/text-covers/static-post.svg");
    expect(verifiedArticle.reviewedBy).toMatchObject({
      "@type": "Person",
      name: "CA Reviewer",
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Chartered Accountant",
        identifier: "M.No. 123456",
      },
    });
  });

  it("renders article byline reviewer details without inventing credential text", () => {
    const body = renderStaticRouteBody({
      route: "/blog/example",
      title: "Example tax article",
      description: "Example article description.",
      kind: "blog-post",
      authorName: "MyeCA Editorial Team",
      reviewedBy: "CA Reviewer",
      reviewedAt: "2026-05-29T00:00:00.000Z",
    });

    expect(body).toContain("Written by MyeCA Editorial Team");
    expect(body).toContain("Reviewed by CA Reviewer");
    expect(body).not.toContain("M.No.");
  });

  it("deduplicates topical internal links while preserving at least three useful routes", () => {
    const links = buildStaticRouteLinks("/calculators/income-tax", [
      { label: "Income tax calculator", href: "/calculators/income-tax" },
      { label: "Choose ITR form", href: "/itr/form-selector" },
    ]);

    expect(new Set(links.map((link) => link.href)).size).toBe(links.length);
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links.map((link) => link.href)).toEqual(expect.arrayContaining(["/itr/form-selector"]));
  });

  it("builds verified Person reviewer schema only when credential fields are present", () => {
    const article = buildArticleSchema({
      url: "https://myeca.in/blog/example",
      headline: "Example",
      description: "Example description.",
      image: "/assets/blog/text-covers/example.svg",
      reviewer: {
        name: "CA Reviewer",
        credentialName: "Chartered Accountant",
        credentialId: "M.No. 123456",
        credentialAuthority: "Institute of Chartered Accountants of India",
      },
    });

    expect(article.reviewedBy).toMatchObject({
      "@type": "Person",
      name: "CA Reviewer",
      hasCredential: {
        identifier: "M.No. 123456",
      },
    });
  });
});
