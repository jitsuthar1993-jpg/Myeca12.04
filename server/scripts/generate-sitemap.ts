import fs from "fs";
import path from "path";
import { SEO_CONFIG } from "../../client/src/config/seo.config";
import { defaultBlogPosts } from "../data/default-blog-content.js";

const BASE_URL = "https://myeca.in";
const PUBLIC_DIR = path.resolve(process.cwd(), "client", "public");
const SITEMAP_PATH = path.join(PUBLIC_DIR, "sitemap.xml");

function generateSitemap() {
  console.log("Generating sitemap...");

  const highValueRoutes = [
    "/itr/form-selector",
    "/itr/form-recommender",
    "/itr/filing",
    "/form16-parser",
    "/ais-viewer",
    "/tds-refund-tracker",
    "/calculators/income-tax",
    "/calculators/regime-comparator",
    "/calculators/capital-gains",
    "/calculators/advance-tax",
    "/calculators/gst",
    "/calculators/salary",
    "/calculators/gratuity",
    "/calculators/epf",
    "/calculators/rd",
    "/calculators/lumpsum",
    "/calculators/swp",
    "/calculators/inflation",
    "/calculators/loan-eligibility",
    "/calculators/home-loan",
    "/calculators/car-loan",
    "/calculators/personal-loan",
    "/calculators/education-loan",
    "/calculators/sip-enhanced",
    "/calculators/fd-enhanced",
    "/services/notice-compliance",
    "/expert-consultation",
  ];
  const blogRoutes = defaultBlogPosts
    .filter((post) => post.status === "published")
    .map((post) => `/blog/${post.slug}`);
  const urls = Array.from(new Set([
    ...Object.keys(SEO_CONFIG).filter((url) => !SEO_CONFIG[url].noindex),
    ...highValueRoutes,
    ...blogRoutes,
  ]));
  
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => {
    const priority = url === "/" ? "1.0" : url.startsWith("/services") || url.startsWith("/calculators") ? "0.8" : "0.5";
    return `  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

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
