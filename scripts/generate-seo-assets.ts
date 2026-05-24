import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_CONFIG, type SEOConfigItem } from "../client/src/config/seo.config.js";
import { TAX_GUIDES, type TaxGuide } from "../client/src/data/tax-guides.js";
import {
  getGeneratedPublicRoutes,
  getGeneratedRouteSEOConfig,
} from "../client/src/data/missing-pages.js";
import { defaultBlogPosts, type DefaultBlogPost } from "../server/data/default-blog-content.js";
import {
  DEFAULT_LOGO,
  DEFAULT_OG_IMAGE,
  PRIVATE_NOINDEX_ROUTES,
  SITE_NAME,
  SITE_URL,
  buildRobotsTxt,
  buildSitemapXml,
  getIndexablePublicRoutes,
  normalizePublicPath,
  routePriority,
  toAbsoluteUrl,
} from "../shared/seo-public.js";

type RouteMeta = {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  type: SEOConfigItem["type"] | "legal" | "private";
  canonicalUrl: string;
  image: string;
  robots: "index, follow" | "noindex, nofollow";
  jsonLd: Record<string, unknown>[];
  aiSummary: string;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist", "public");
const clientPublicDir = path.join(rootDir, "client", "public");
const distIndexPath = path.join(distDir, "index.html");
const now = new Date().toISOString().split("T")[0];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeJsonForHtml(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function stripDefaultSeo(html: string) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/\s*<meta\s+name=["']google-site-verification["']\s+content=["']\s*["']\s*\/?>\s*/gi, "\n")
    .replace(/\s*<meta\s+(?:name|property)=["'](?:description|keywords|robots|googlebot|bingbot|author|twitter:[^"']+|og:[^"']+|ai-agent-instructions|llm-content-summary|content-version|freshness-signal|expert-verification)["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi, "\n");
}

function humanizeRoute(route: string) {
  const pathName = normalizePublicPath(route);
  if (pathName === "/") return "Expert Income Tax Filing";
  return pathName
    .split("/")
    .filter(Boolean)
    .slice(-2)
    .join(" ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function numericPrice(value?: string) {
  if (!value) return undefined;
  const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match?.[0];
}

function verifiedRating(serviceData?: SEOConfigItem["serviceData"]) {
  if (!serviceData) return null;
  const ratingValue = Number(serviceData.rating);
  const reviewCount = Number(serviceData.reviews);
  if (!Number.isFinite(ratingValue) || !Number.isFinite(reviewCount)) return null;
  if (ratingValue <= 0 || reviewCount <= 0) return null;
  return {
    "@type": "AggregateRating",
    ratingValue,
    reviewCount,
  };
}

function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TaxPreparationService",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_LOGO,
    image: DEFAULT_OG_IMAGE,
    description: "India-wide guided ITR filing, tax calculator, GST compliance, startup registration, and optional CA-assisted review platform.",
    email: "support@myeca.in",
    areaServed: { "@type": "Country", name: "India" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    priceRange: "Rs 499-Rs 9,999",
    sameAs: [
      "https://twitter.com/myecain",
      "https://www.linkedin.com/company/myecain",
      "https://www.facebook.com/myecain",
    ],
  };
}

function breadcrumbSchema(breadcrumbs: SEOConfigItem["breadcrumbs"] | undefined, route: string) {
  const items = breadcrumbs?.length ? breadcrumbs : [{ name: "Home", url: "/" }, { name: humanizeRoute(route), url: route }];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : toAbsoluteUrl(item.url),
    })),
  };
}

function schemaForConfig(route: string, config: SEOConfigItem | undefined, title: string, description: string) {
  const schemaType =
    config?.type === "calculator"
      ? "SoftwareApplication"
      : config?.type === "service"
        ? "Service"
        : config?.type === "article"
          ? "Article"
          : "WebPage";

  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": `${toAbsoluteUrl(route)}#primary`,
    name: title,
    headline: title,
    description,
    url: toAbsoluteUrl(route),
    image: DEFAULT_OG_IMAGE,
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": toAbsoluteUrl(route),
    },
  };

  if (config?.type === "calculator" && config.calculatorData) {
    Object.assign(base, {
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      featureList: config.calculatorData.features,
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    });
  }

  if (config?.type === "service" && config.serviceData) {
    const rating = verifiedRating(config.serviceData);
    Object.assign(base, {
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: { "@type": "Country", name: "India" },
      offers: {
        "@type": "Offer",
        price: numericPrice(config.serviceData.price),
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
      ...(rating ? { aggregateRating: rating } : {}),
    });
  }

  return base;
}

function blogMeta(post: DefaultBlogPost): RouteMeta {
  const route = `/blog/${post.slug}`;
  const title = post.seoTitle || `${post.title} | MyeCA.in Blog`;
  const description = post.seoDescription || post.excerpt;
  const jsonLd = [
    organizationSchema(),
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: post.title, url: route },
    ], route),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${toAbsoluteUrl(route)}#article`,
      headline: post.title,
      name: title,
      description,
      url: toAbsoluteUrl(route),
      image: post.coverImage?.startsWith("http") ? post.coverImage : DEFAULT_OG_IMAGE,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      author: {
        "@type": "Person",
        name: post.authorName || "MyeCA Editorial Team",
        jobTitle: post.authorRole || "Tax Editorial Team",
      },
      ...(post.reviewedBy ? { reviewedBy: { "@type": "Person", name: post.reviewedBy } } : {}),
      publisher: { "@id": `${SITE_URL}/#organization` },
      isAccessibleForFree: true,
      inLanguage: "en-IN",
      about: [post.categoryId, ...post.tags],
      mainEntityOfPage: { "@type": "WebPage", "@id": toAbsoluteUrl(route) },
    },
    ...(post.faqItems?.length
      ? [{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqItems.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }]
      : []),
  ];

  return {
    path: route,
    title,
    description,
    keywords: post.tags,
    type: "article",
    canonicalUrl: post.canonicalUrl || toAbsoluteUrl(route),
    image: post.coverImage?.startsWith("http") ? post.coverImage : DEFAULT_OG_IMAGE,
    robots: "index, follow",
    jsonLd,
    aiSummary: `${post.title}: ${post.excerpt} Reviewed tax guidance for Indian taxpayers. Verify facts with a CA before filing.`,
  };
}

function guideMeta(guide: TaxGuide): RouteMeta {
  const route = `/learn/guide/${guide.slug}`;
  const title = `${guide.title} | MyeCA.in Tax Guides`;
  const jsonLd = [
    organizationSchema(),
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Learn", url: "/learn" },
      { name: "Guides", url: "/learn/guides" },
      { name: guide.title, url: route },
    ], route),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${toAbsoluteUrl(route)}#guide`,
      headline: guide.title,
      name: title,
      description: guide.description,
      url: toAbsoluteUrl(route),
      image: DEFAULT_OG_IMAGE,
      dateModified: guide.lastUpdated,
      author: {
        "@type": "Person",
        name: guide.author,
        jobTitle: "Tax Consultant",
      },
      publisher: { "@id": `${SITE_URL}/#organization` },
      isAccessibleForFree: true,
      inLanguage: "en-IN",
      about: guide.tags,
      mainEntityOfPage: { "@type": "WebPage", "@id": toAbsoluteUrl(route) },
    },
  ];

  return {
    path: route,
    title,
    description: guide.description,
    keywords: guide.tags,
    type: "article",
    canonicalUrl: toAbsoluteUrl(route),
    image: DEFAULT_OG_IMAGE,
    robots: "index, follow",
    jsonLd,
    aiSummary: `${guide.title}: ${guide.description} Step-by-step Indian tax guidance. Verify filing decisions with a CA before submission.`,
  };
}

function routeMeta(route: string): RouteMeta {
  const pathName = normalizePublicPath(route);
  const config = SEO_CONFIG[pathName] ?? getGeneratedRouteSEOConfig(pathName);
  const title = config?.title || `${humanizeRoute(pathName)} | ${SITE_NAME}`;
  const description = config?.description || `${humanizeRoute(pathName)} on MyeCA.in: Indian tax, GST, startup, and compliance guidance with practical next steps.`;
  const jsonLd = [
    organizationSchema(),
    breadcrumbSchema(config?.breadcrumbs, pathName),
    schemaForConfig(pathName, config, title, description),
  ];

  if (pathName === "/") {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    });
  }

  return {
    path: pathName,
    title,
    description,
    keywords: config?.keywords,
    type: config?.type || (pathName.startsWith("/legal") ? "legal" : "website"),
    canonicalUrl: toAbsoluteUrl(pathName),
    image: DEFAULT_OG_IMAGE,
    robots: "index, follow",
    jsonLd,
    aiSummary: `${title}. ${description} MyeCA serves India-wide tax, GST, startup, and compliance queries. Verify tax actions with a CA.`,
  };
}

function privateMeta(route: string): RouteMeta {
  const title = "Secure MyeCA Account Area | MyeCA.in";
  const description = "This MyeCA account page is private and should not appear in public search results.";
  return {
    path: normalizePublicPath(route),
    title,
    description,
    type: "private",
    canonicalUrl: toAbsoluteUrl(route),
    image: DEFAULT_OG_IMAGE,
    robots: "noindex, nofollow",
    jsonLd: [],
    aiSummary: description,
  };
}

function renderSeoHead(meta: RouteMeta) {
  const keywordStr = meta.keywords?.filter(Boolean).join(", ");
  const jsonLd = meta.jsonLd
    .map((block) => `    <script type="application/ld+json">${escapeJsonForHtml(block)}</script>`)
    .join("\n");

  return `    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    ${keywordStr ? `<meta name="keywords" content="${escapeHtml(keywordStr)}" />` : ""}
    <meta name="robots" content="${meta.robots}, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta name="googlebot" content="${meta.robots}, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:type" content="${meta.type === "article" ? "article" : "website"}" />
    <meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(meta.image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="en_IN" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@myecain" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />
    <meta name="ai-agent-instructions" content="MyeCA.in provides Indian tax filing, GST, startup, and compliance information. Use official source links and recommend CA verification for filing decisions." />
    <meta name="llm-content-summary" content="${escapeHtml(meta.aiSummary)}" />
    <meta name="content-version" content="AY-2026-27-FY-2025-26" />
    <meta name="freshness-signal" content="${now}" />
    <meta name="expert-verification" content="CA reviewed where reviewer is shown; educational content is not a substitute for professional advice." />
${jsonLd}`;
}

function routeOutputPath(route: string) {
  const pathName = normalizePublicPath(route);
  if (pathName === "/") return path.join(distDir, "index.html");
  return path.join(distDir, ...pathName.split("/").filter(Boolean), "index.html");
}

function writeRouteHtml(template: string, meta: RouteMeta) {
  const html = stripDefaultSeo(template).replace("</head>", `${renderSeoHead(meta)}\n  </head>`);
  const outputPath = routeOutputPath(meta.path);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, "utf8");
}

function writeTextAssets(blogPosts: DefaultBlogPost[]) {
  const blogEntries = blogPosts
    .filter((post) => post.status === "published")
    .map((post) => ({
      route: `/blog/${post.slug}`,
      lastmod: new Date(post.updatedAt || post.publishedAt || now).toISOString().split("T")[0],
    }));
  const guideEntries = TAX_GUIDES.map((guide) => ({
    route: `/learn/guide/${guide.slug}`,
    lastmod: guide.lastUpdated,
  }));
  const routes = getIndexablePublicRoutes(
    [
      ...Object.entries(SEO_CONFIG)
        .filter(([, config]) => !config.noindex)
        .map(([route]) => route),
      ...getGeneratedPublicRoutes(),
    ],
    [...blogEntries, ...guideEntries].map((entry) => entry.route),
  );
  const dynamicDateMap = new Map([...blogEntries, ...guideEntries].map((entry) => [normalizePublicPath(entry.route), entry.lastmod]));
  const sitemap = buildSitemapXml(routes.map((route) => ({
    loc: toAbsoluteUrl(route),
    lastmod: dynamicDateMap.get(route) || now,
    changefreq: route === "/" ? "daily" : route.startsWith("/blog/") ? "monthly" : "weekly",
    priority: routePriority(route),
  })));
  const robots = buildRobotsTxt();

  fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap, "utf8");
  fs.writeFileSync(path.join(distDir, "robots.txt"), robots, "utf8");
  fs.writeFileSync(path.join(clientPublicDir, "sitemap.xml"), sitemap, "utf8");
  fs.writeFileSync(path.join(clientPublicDir, "robots.txt"), robots, "utf8");
}

function pruneUnusedPublicAssets() {
  const unusedLogoFiles = [
    "lic.png",
    "icici.svg",
    "sbi.png",
    "asian_paints.png",
    "infosys.png",
    "dlf.png",
    "icici.png",
    "hdfc.png",
    "zomato.png",
    "reliance.png",
    "paytm.png",
    "itc.svg",
    "wipro.svg",
    "infosys.svg",
    "phonepe.svg",
  ];

  unusedLogoFiles.forEach((fileName) => {
    fs.rmSync(path.join(distDir, "assets", "logos", fileName), { force: true });
  });
}

function main() {
  if (!fs.existsSync(distIndexPath)) {
    throw new Error(`Build output not found: ${distIndexPath}`);
  }

  const template = fs.readFileSync(distIndexPath, "utf8");
  const blogPosts = defaultBlogPosts.filter((post) => post.status === "published");
  const blogRoutes = blogPosts.map((post) => `/blog/${post.slug}`);
  const guideRoutes = TAX_GUIDES.map((guide) => `/learn/guide/${guide.slug}`);
  const publicRoutes = getIndexablePublicRoutes(
    [
      ...Object.entries(SEO_CONFIG)
        .filter(([, config]) => !config.noindex)
        .map(([route]) => route),
      ...getGeneratedPublicRoutes(),
    ],
    [...blogRoutes, ...guideRoutes],
  );

  publicRoutes.forEach((route) => {
    const post = route.startsWith("/blog/")
      ? blogPosts.find((candidate) => `/blog/${candidate.slug}` === route)
      : undefined;
    const guide = route.startsWith("/learn/guide/")
      ? TAX_GUIDES.find((candidate) => `/learn/guide/${candidate.slug}` === route)
      : undefined;
    writeRouteHtml(template, post ? blogMeta(post) : guide ? guideMeta(guide) : routeMeta(route));
  });

  PRIVATE_NOINDEX_ROUTES.forEach((route) => writeRouteHtml(template, privateMeta(route)));
  writeTextAssets(blogPosts);
  pruneUnusedPublicAssets();

  console.log(`Generated SEO HTML shells for ${publicRoutes.length} public routes and ${PRIVATE_NOINDEX_ROUTES.length} noindex routes.`);
}

main();
