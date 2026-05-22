import fs from "fs";
import path from "path";
import { SEO_CONFIG } from "../../client/src/config/seo.config";
import { getGeneratedPublicRoutes } from "../../client/src/data/missing-pages";
import { TAX_GUIDES } from "../../client/src/data/tax-guides";
import { defaultBlogPosts } from "../data/default-blog-content.js";
import {
  buildSitemapXml,
  getIndexablePublicRoutes,
  routePriority,
  toAbsoluteUrl,
} from "../../shared/seo-public.js";

const PUBLIC_DIR = path.resolve(process.cwd(), "client", "public");
const SITEMAP_PATH = path.join(PUBLIC_DIR, "sitemap.xml");

function generateSitemap() {
  console.log("Generating sitemap...");

  const blogRoutes = defaultBlogPosts
    .filter((post) => post.status === "published")
    .map((post) => `/blog/${post.slug}`);
  const guideRoutes = TAX_GUIDES.map((guide) => `/learn/guide/${guide.slug}`);
  const blogDateMap = new Map(defaultBlogPosts.map((post) => [`/blog/${post.slug}`, post.updatedAt || post.publishedAt]));
  const urls = getIndexablePublicRoutes(
    [
      ...Object.keys(SEO_CONFIG).filter((url) => !SEO_CONFIG[url].noindex),
      ...getGeneratedPublicRoutes(),
    ],
    [...blogRoutes, ...guideRoutes],
  );
  
  const sitemapContent = buildSitemapXml(urls.map((url) => ({
    loc: toAbsoluteUrl(url),
    lastmod: blogDateMap.get(url)?.split("T")[0] || new Date().toISOString().split("T")[0],
    changefreq: url === "/" ? "daily" : url.startsWith("/blog/") ? "monthly" : "weekly",
    priority: routePriority(url),
  })));

  try {
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }
    fs.writeFileSync(SITEMAP_PATH, sitemapContent);
    console.log(`Sitemap generated successfully at ${SITEMAP_PATH}`);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    process.exit(1);
  }
}

generateSitemap();
