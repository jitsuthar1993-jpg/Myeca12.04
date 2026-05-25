import fs from "node:fs";
import path from "node:path";
import { loadStaticBlogPosts } from "../server/data/static-blog-content.js";
import { routeChangefreq, routePriority, toAbsoluteUrl } from "../shared/seo-public.js";

const distDir = path.resolve(process.cwd(), "dist", "public");
const targetStaticRoutes = ["/", "/itr-filing", "/gst-filing", "/blog", "/about", "/contact"] as const;
const requiredAgents = ["GPTBot", "Google-Extended", "PerplexityBot", "ClaudeBot", "anthropic-ai"];

type JsonThing = Record<string, any>;

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function htmlPath(route: string) {
  if (route === "/") return path.join(distDir, "index.html");
  return path.join(distDir, ...route.split("/").filter(Boolean), "index.html");
}

function readRouteHtml(route: string) {
  const filePath = htmlPath(route);
  assert(fs.existsSync(filePath), `Missing generated HTML for ${route}: ${filePath}`);
  return fs.readFileSync(filePath, "utf8");
}

function findTitle(html: string) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
}

function findMeta(html: string, name: string) {
  const tag = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]*>`, "i"))?.[0] ?? "";
  return tag.match(/content=["']([^"']*)["']/i)?.[1] ?? "";
}

function findCanonical(html: string) {
  const tag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] ?? "";
  return tag.match(/href=["']([^"']*)["']/i)?.[1] ?? "";
}

function visibleText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseJsonLd(html: string) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]) as JsonThing);
}

function flattenSchemaTypes(blocks: JsonThing[]) {
  return blocks.flatMap((block) => {
    const graph = Array.isArray(block["@graph"]) ? block["@graph"] : [];
    return [block, ...graph].map((item) => item?.["@type"]).filter(Boolean);
  });
}

function walkStrings(value: unknown, visitor: (value: string, key: string) => void, key = "") {
  if (typeof value === "string") {
    visitor(value, key);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, visitor, `${key}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([childKey, childValue]) => walkStrings(childValue, visitor, childKey));
  }
}

function assertAbsoluteSchemaUrls(blocks: JsonThing[], route: string) {
  blocks.forEach((block) => {
    walkStrings(block, (value, key) => {
      if (!/url|@id|item|target|image|logo/i.test(key)) return;
      assert(!value.startsWith("/"), `${route} schema has relative URL in ${key}: ${value}`);
    });
  });
}

function sitemapBlock(sitemap: string, loc: string) {
  return sitemap.match(new RegExp(`<url>\\s*<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>[\\s\\S]*?<\\/url>`))?.[0] ?? "";
}

function validateHtmlRoute(route: string, options: { strictMeta?: boolean; expectedTypes?: string[] } = {}) {
  const html = readRouteHtml(route);
  const title = findTitle(html);
  const description = findMeta(html, "description");
  const canonical = findCanonical(html);
  const text = visibleText(html);
  const jsonLd = parseJsonLd(html);
  const types = flattenSchemaTypes(jsonLd);

  assert(canonical === toAbsoluteUrl(route), `${route} canonical mismatch: ${canonical}`);
  assert(jsonLd.length > 0, `${route} missing JSON-LD`);
  assert(text.length > 250, `${route} generated body is too thin for crawler-visible content`);
  assert(html.includes('data-static-route="'), `${route} missing static SEO body marker`);
  assert(!/loading\s+myeca/i.test(text), `${route} still exposes only the loading shell`);
  assert(!/Rs\.|INR/.test(html), `${route} contains forbidden price text`);
  assertAbsoluteSchemaUrls(jsonLd, route);

  if (options.strictMeta) {
    assert(title.length >= 55 && title.length <= 60, `${route} title length ${title.length} outside 55-60`);
    assert(description.length >= 150 && description.length <= 155, `${route} description length ${description.length} outside 150-155`);
  } else {
    assert(title.length >= 30 && title.length <= 80, `${route} title length ${title.length} outside broad range`);
    assert(description.length >= 120 && description.length <= 170, `${route} description length ${description.length} outside broad range`);
  }

  options.expectedTypes?.forEach((type) => {
    assert(types.includes(type), `${route} missing ${type} schema`);
  });

  const articleBlocks = jsonLd.flatMap((block) => Array.isArray(block["@graph"]) ? block["@graph"] : [block])
    .filter((block) => block?.["@type"] === "Article");
  articleBlocks.forEach((article) => {
    assert(article.inLanguage === "en-IN", `${route} Article schema missing inLanguage en-IN`);
  });
}

function main() {
  const posts = loadStaticBlogPosts().filter((post) => post.status === "published");
  const samplePost = posts.find((post) => post.contentType === "how-to" && post.howToSteps.length) ?? posts[0];
  assert(samplePost, "No static blog posts available for validation");

  validateHtmlRoute("/", { strictMeta: true, expectedTypes: ["Organization", "WebSite", "AccountingService"] });
  validateHtmlRoute("/itr-filing", { strictMeta: true, expectedTypes: ["Service"] });
  validateHtmlRoute("/gst-filing", { strictMeta: true, expectedTypes: ["Service"] });
  validateHtmlRoute("/blog", { strictMeta: true, expectedTypes: ["WebPage"] });
  validateHtmlRoute("/about", { strictMeta: true, expectedTypes: ["WebPage"] });
  validateHtmlRoute("/contact", { strictMeta: true, expectedTypes: ["WebPage", "AccountingService"] });
  validateHtmlRoute(`/blog/${samplePost.slug}`, {
    expectedTypes: samplePost.contentType === "how-to" ? ["Article", "FAQPage", "HowTo"] : ["Article", "FAQPage"],
  });

  const sitemapPath = path.join(distDir, "sitemap.xml");
  const robotsPath = path.join(distDir, "robots.txt");
  assert(fs.existsSync(sitemapPath), "Missing dist/public/sitemap.xml");
  assert(fs.existsSync(robotsPath), "Missing dist/public/robots.txt");
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const robots = fs.readFileSync(robotsPath, "utf8");
  const sitemapRoutes = [...targetStaticRoutes, `/blog/${samplePost.slug}`];

  sitemapRoutes.forEach((route) => {
    const loc = toAbsoluteUrl(route);
    const block = sitemapBlock(sitemap, loc);
    assert(block, `Sitemap missing ${loc}`);
    assert(block.includes(`<priority>${routePriority(route)}</priority>`), `Sitemap priority mismatch for ${route}`);
    assert(block.includes(`<changefreq>${routeChangefreq(route)}</changefreq>`), `Sitemap changefreq mismatch for ${route}`);
  });

  requiredAgents.forEach((agent) => {
    assert(robots.includes(`User-agent: ${agent}`), `robots.txt missing ${agent}`);
  });
  ["/api/", "/admin/", "/_next/"].forEach((route) => {
    assert(robots.includes(`Disallow: ${route}`), `robots.txt missing Disallow: ${route}`);
  });
  assert(robots.includes("Sitemap: https://myeca.in/sitemap.xml"), "robots.txt missing sitemap URL");
  assert(robots.includes("Host: https://myeca.in"), "robots.txt missing host");

  console.log(`Static SEO validation passed for ${sitemapRoutes.length} routes and ${posts.length} MDX blog posts.`);
}

main();
