import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config.js";
import { nanoid } from "nanoid";
import { SEO_CONFIG } from "../client/src/config/seo.config.js";
import { buildPublicBlogDetail, listPublishedBlogPosts, sortPublishedPosts } from "./services/blog.js";

const viteLogger = createLogger();
const BLOG_SEO_CACHE_TTL = 5 * 60 * 1000;
let blogSeoCache: { generatedAt: number; posts: Awaited<ReturnType<typeof listPublishedBlogPosts>> } | null = null;

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function replaceOrInsertMeta(content: string, selector: RegExp, tag: string) {
  if (selector.test(content)) return content.replace(selector, tag);
  return content.replace("</head>", `${tag}\n</head>`);
}

function toAbsoluteSiteUrl(value: string | null | undefined) {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;
  if (value.startsWith("/")) return `https://myeca.in${value}`;
  return null;
}

async function getPublishedBlogPostsForSeo() {
  if (blogSeoCache && Date.now() - blogSeoCache.generatedAt < BLOG_SEO_CACHE_TTL) {
    return blogSeoCache.posts;
  }

  const posts = sortPublishedPosts(await listPublishedBlogPosts());
  blogSeoCache = { posts, generatedAt: Date.now() };
  return posts;
}

async function getBlogSeoData(cleanPath: string) {
  const match = /^\/blog\/([^/?#]+)$/.exec(cleanPath);
  if (!match) return null;

  const slug = decodeURIComponent(match[1]);
  const posts = await getPublishedBlogPostsForSeo();
  const post = posts.find((candidate) => candidate.slug === slug);
  if (!post) return null;

  const detail = buildPublicBlogDetail(post, posts);
  const canonical = detail.canonicalUrl || `https://myeca.in/blog/${detail.slug}`;
  const title = detail.seoTitle || `${detail.title} | MyeCA.in Knowledge Hub`;
  const description = detail.seoDescription || detail.excerpt || `Read ${detail.title} on MyeCA.in.`;
  const keywords = detail.tags.join(", ");
  const image = toAbsoluteSiteUrl(detail.coverImage) || "https://myeca.in/og-image.jpg";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: detail.title,
    name: title,
    description,
    url: canonical,
    image,
    datePublished: detail.publishedAt ?? undefined,
    dateModified: detail.updatedAt ?? detail.publishedAt ?? undefined,
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    author: {
      "@type": "Person",
      name: detail.authorName,
      jobTitle: detail.authorRole ?? "Tax Filing Desk",
    },
    reviewedBy: detail.reviewedBy
      ? {
          "@type": "Person",
          name: detail.reviewedBy,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "MyeCA.in - Expert Tax Filing Services",
      logo: {
        "@type": "ImageObject",
        url: "https://myeca.in/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    about: [detail.category?.name, ...detail.tags].filter(Boolean),
    citation: detail.sourceLinks?.map((source) => source.url) ?? [],
  };

  const faqJsonLd = detail.faqItems.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: detail.faqItems.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  return {
    title,
    description,
    keywords,
    canonical,
    image,
    type: "article",
    noindex: false,
    jsonLd: faqJsonLd ? [articleJsonLd, faqJsonLd] : [articleJsonLd],
  };
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        // process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        process.cwd(),
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static assets with appropriate cache headers
  app.use(express.static(distPath, {
    maxAge: 0,
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath);
      const base = path.basename(filePath);
      const rel = filePath.replace(distPath, "").replace(/\\/g, "/");

      // HTML should not be cached to ensure latest app shell
      if (base === "index.html") {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        return;
      }

      // Service worker should not be cached to allow immediate updates
      if (base === "service-worker.js" || base === "sw.js") {
        res.setHeader("Cache-Control", "no-cache");
        return;
      }

      // Long cache for hashed assets and fonts
      const isHashedAsset = /-[a-f0-9]{8,}\./i.test(base) || rel.includes("/assets/");
      const isFont = ext === ".woff2" || ext === ".woff" || ext === ".ttf" || ext === ".otf";
      if (isHashedAsset || isFont) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return;
      }

      // Default cache for other static files
      if (ext === ".js" || ext === ".css" || ext === ".json") {
        res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      } else if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".svg" || ext === ".webp") {
        res.setHeader("Cache-Control", "public, max-age=604800");
      } else {
        res.setHeader("Cache-Control", "public, max-age=3600");
      }
    }
  }));

  // Fall through to index.html if the file doesn't exist
  app.use("*", async (req, res) => {
    const distPath = path.resolve(process.cwd(), "dist", "public");
    const indexPath = path.resolve(distPath, "index.html");
    
    if (!fs.existsSync(indexPath)) {
      return res.status(404).send("Index file not found");
    }

    try {
      let content = await fs.promises.readFile(indexPath, "utf-8");
      const url = req.originalUrl;
      const userAgent = req.headers["user-agent"] || "";
      const isBot = /bot|googlebot|crawler|spider|robot|crawling|bingbot|duckduckbot|yandexbot|slurp|facebot|ia_archiver/i.test(userAgent);

      // Simple SEO Injection for Bots
      if (isBot) {
        log(`Bot detected: ${userAgent} on ${url}`, "seo");
        
        const cleanPath = url.split("?")[0];
        const blogSeo = await getBlogSeoData(cleanPath);
        const fallbackSeo = SEO_CONFIG[cleanPath] || SEO_CONFIG["/"];
        const seo = blogSeo || {
          title: fallbackSeo.title,
          description: fallbackSeo.description,
          keywords: fallbackSeo.keywords.join(", "),
          canonical: `https://myeca.in${cleanPath === "/" ? "/" : cleanPath}`,
          image: "https://myeca.in/og-image.jpg",
          type: fallbackSeo.type === "article" ? "article" : "website",
          noindex: Boolean(fallbackSeo.noindex),
          jsonLd: [],
        };
        
        const title = seo.title;
        const description = seo.description;
        const keywords = seo.keywords;
        const canonical = seo.canonical;
        const escapedTitle = escapeHtmlAttribute(title);
        const escapedDescription = escapeHtmlAttribute(description);
        const escapedKeywords = escapeHtmlAttribute(keywords);
        const escapedCanonical = escapeHtmlAttribute(canonical);
        const escapedImage = escapeHtmlAttribute(seo.image);

        content = content.replace(/<title>.*?<\/title>/, `<title>${escapedTitle}</title>`);
        content = replaceOrInsertMeta(content, /<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${escapedDescription}" />`);
        content = replaceOrInsertMeta(content, /<link rel="canonical" href=".*?"\s*\/?>/, `<link rel="canonical" href="${escapedCanonical}" />`);
        
        // Inject Open Graph and other meta tags
        const metaTags = `
          <meta name="keywords" content="${escapedKeywords}" />
          <meta property="og:title" content="${escapedTitle}" />
          <meta property="og:description" content="${escapedDescription}" />
          <meta property="og:url" content="${escapedCanonical}" />
          <meta property="og:type" content="${seo.type}" />
          <meta property="og:image" content="${escapedImage}" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${escapedTitle}" />
          <meta name="twitter:description" content="${escapedDescription}" />
          <meta name="twitter:image" content="${escapedImage}" />
          <meta name="robots" content="${seo.noindex ? 'noindex, nofollow' : 'index, follow'}" />
          ${seo.jsonLd.map((block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`).join("\n")}
        `;
        content = content.replace("</head>", `${metaTags}</head>`);
      }

      res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).send(content);
    } catch (err) {
      log(`Error serving index.html: ${err}`, "express");
      res.sendFile(indexPath);
    }
  });
}
