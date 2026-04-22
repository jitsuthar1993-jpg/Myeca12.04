import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config.js";
import { nanoid } from "nanoid";
import { SEO_CONFIG } from "../client/src/config/seo.config.js";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
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
        
        // Find best match in SEO_CONFIG
        const cleanPath = url.split("?")[0];
        const seo = SEO_CONFIG[cleanPath] || SEO_CONFIG["/"];
        
        const title = seo.title;
        const description = seo.description;
        const keywords = seo.keywords.join(", ");

        content = content.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
        content = content.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`);
        
        // Inject Open Graph and other meta tags
        const metaTags = `
          <meta name="keywords" content="${keywords}" />
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:url" content="https://myeca.in${url}" />
          <meta property="og:type" content="${seo.type === 'article' ? 'article' : 'website'}" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="robots" content="${seo.noindex ? 'noindex, nofollow' : 'index, follow'}" />
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
