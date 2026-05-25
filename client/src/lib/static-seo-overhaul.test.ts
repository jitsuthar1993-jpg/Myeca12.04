import { describe, expect, it } from "vitest";
import { SEO_CONFIG } from "../config/seo.config";
import { getGeneratedPublicRoutes } from "../data/missing-pages";
import { generateMetadata } from "./seo";
import {
  buildAccountingServiceSchema,
  buildArticleSchema,
  buildHomepageGraph,
  buildHowToSchema,
  buildServiceSchema,
} from "@shared/seo-schema";
import {
  buildRobotsTxt,
  getIndexablePublicRoutes,
  routeChangefreq,
  routePriority,
} from "@shared/seo-public";
import { renderStaticRouteBody } from "@shared/static-seo-content";
import { loadStaticMdxBlogPosts } from "../../../server/data/static-blog-content";

describe("static SEO overhaul", () => {
  it("generates Next-compatible metadata defaults for public pages", () => {
    const metadata = generateMetadata({
      title: "ITR Filing Services AY 2026-27 | myeca.in",
      description:
        "File ITR for FY 2025-26 and AY 2026-27 with CA-led review, secure document handling, refund checks, and guided filing support.",
      slug: "/itr-filing",
      type: "website",
    });

    expect(metadata.metadataBase?.toString()).toBe("https://myeca.in/");
    expect(metadata.alternates?.canonical).toBe("https://myeca.in/itr-filing");
    expect(metadata.openGraph).toMatchObject({
      siteName: "myeca.in",
      locale: "en_IN",
      url: "https://myeca.in/itr-filing",
    });
    expect(metadata.openGraph?.images?.[0]).toMatchObject({
      url: "https://myeca.in/og-default.png",
      width: 1200,
      height: 630,
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: ["https://myeca.in/og-default.png"],
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("indexes exact public ITR and GST filing aliases without exposing private workspace routes", () => {
    const routes = getIndexablePublicRoutes(
      [
        ...Object.entries(SEO_CONFIG)
          .filter(([, config]) => !config.noindex)
          .map(([route]) => route),
        ...getGeneratedPublicRoutes(),
      ],
      [],
    );

    expect(routes).toEqual(expect.arrayContaining(["/itr-filing", "/gst-filing"]));
    expect(routes).not.toContain("/itr/filing");
    expect(routePriority("/")).toBe("1.0");
    expect(routePriority("/itr-filing")).toBe("0.9");
    expect(routePriority("/gst-filing")).toBe("0.9");
    expect(routePriority("/blog")).toBe("0.8");
    expect(routePriority("/blog/example")).toBe("0.7");
    expect(routePriority("/contact")).toBe("0.6");
    expect(routeChangefreq("/")).toBe("weekly");
    expect(routeChangefreq("/blog")).toBe("daily");
    expect(routeChangefreq("/blog/example")).toBe("monthly");
    expect(routeChangefreq("/contact")).toBe("yearly");
  });

  it("allows AI crawlers while preserving private disallow rules", () => {
    const robots = buildRobotsTxt();

    ["GPTBot", "Google-Extended", "PerplexityBot", "ClaudeBot", "anthropic-ai"].forEach((agent) => {
      expect(robots).toContain(`User-agent: ${agent}`);
    });
    expect(robots).toContain("Disallow: /api/");
    expect(robots).toContain("Disallow: /admin/");
    expect(robots).toContain("Disallow: /_next/");
    expect(robots).toContain("Sitemap: https://myeca.in/sitemap.xml");
    expect(robots).toContain("Host: https://myeca.in");
  });

  it("builds homepage and local business schema for Bikaner CA-led services", () => {
    const graph = buildHomepageGraph();
    const localBusiness = buildAccountingServiceSchema("https://myeca.in/contact");

    expect(graph["@graph"].map((node) => node["@type"])).toEqual(["Organization", "WebSite"]);
    expect(JSON.stringify(graph)).toContain("Bikaner");
    expect(JSON.stringify(graph)).toContain("Hindi");
    expect(JSON.stringify(graph)).toContain("SearchAction");
    expect(localBusiness).toMatchObject({
      "@type": "AccountingService",
      name: "myeca.in — CA Tax Filing Services",
      priceRange: "₹₹",
      geo: {
        "@type": "GeoCoordinates",
        latitude: 28.0229,
        longitude: 73.3119,
      },
    });
    expect(JSON.stringify(localBusiness)).toContain("Institute of Chartered Accountants of India");
  });

  it("builds service, article, FAQ, and HowTo schema from content data", () => {
    const service = buildServiceSchema({
      url: "https://myeca.in/gst-filing",
      name: "GST Filing Services",
      description: "Monthly GST filing support for Indian businesses.",
    });
    const article = buildArticleSchema({
      url: "https://myeca.in/blog/example",
      headline: "Example AY 2026-27 Guide",
      description: "Example guide description.",
      publishedAt: "2026-05-05T00:00:00.000Z",
      modifiedAt: "2026-05-06T00:00:00.000Z",
      image: "https://myeca.in/og-default.png",
    });
    const howTo = buildHowToSchema({
      url: "https://myeca.in/blog/example",
      name: "How to file ITR",
      description: "Follow the steps before filing.",
      totalTime: "PT30M",
      steps: ["Collect Form 16", "Check AIS", "Submit return"],
    });

    expect(service).toMatchObject({
      "@type": "Service",
      serviceType: "Tax Filing",
      provider: { "@type": "Organization", name: "myeca.in" },
      areaServed: { "@type": "Country", name: "India" },
      offers: { "@type": "Offer", availability: "https://schema.org/InStock" },
    });
    expect(article).toMatchObject({
      "@type": "Article",
      author: { "@type": "Organization", name: "Team myeca.in" },
      publisher: {
        "@type": "Organization",
        name: "myeca.in",
      },
      inLanguage: "en-IN",
    });
    expect(howTo).toMatchObject({
      "@type": "HowTo",
      totalTime: "PT30M",
    });
    expect(howTo.step).toHaveLength(3);
  });

  it("renders crawlable static body content instead of only the React loading shell", () => {
    const body = renderStaticRouteBody({
      route: "/itr-filing",
      title: "ITR Filing Services AY 2026-27",
      description:
        "File ITR for FY 2025-26 and AY 2026-27 with CA-led review, secure document handling, refund checks, and guided filing support.",
      kind: "service",
      highlights: ["CA-led review", "AIS and Form 26AS checks", "Refund guidance"],
    });

    expect(body).toContain("<main");
    expect(body).toContain("ITR Filing Services AY 2026-27");
    expect(body).toContain("FY 2025-26");
    expect(body).toContain("CA-led review");
    expect(body).not.toContain("skel");
  });

  it("loads blog posts from static MDX frontmatter with FAQ and HowTo data", () => {
    const posts = loadStaticMdxBlogPosts();

    expect(posts.length).toBeGreaterThanOrEqual(35);
    expect(posts.every((post) => post.title && post.slug && post.publishedAt && post.primaryKeyword)).toBe(true);
    expect(posts.every((post) => post.faqItems.length > 0)).toBe(true);
    expect(posts.some((post) => post.contentType === "how-to" && post.howToSteps.length > 0 && post.totalTime)).toBe(true);
  });
});
