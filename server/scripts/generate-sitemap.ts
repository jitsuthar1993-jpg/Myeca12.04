import fs from "fs";
import path from "path";
import { SEO_CONFIG } from "../../client/src/config/seo.config";

const BASE_URL = "https://myeca.in";
const PUBLIC_DIR = path.resolve(process.cwd(), "client", "public");
const SITEMAP_PATH = path.join(PUBLIC_DIR, "sitemap.xml");

function generateSitemap() {
  console.log("Generating sitemap...");

  const urls = Object.keys(SEO_CONFIG);
  
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
