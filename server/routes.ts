import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import { adminDb } from "./neon-admin.js";
import { authLimiter, adminLimiter, uploadLimiter } from "./middleware/rate-limits.js";
import documentsRouter from "./routes/documents.js";
import referralsRouter from "./routes/referrals.js";
import notificationsRouter from "./routes/notifications.js";
import teamsRouter from "./routes/teams.js";
import workflowsRouter from "./routes/workflows.js";
import reportsRouter from "./routes/reports.js";
import cmsRouter from "./routes/cms.js";
import analyticsRouter from "./routes/analytics.js";
import systemRouter from "./routes/system.js";
import userRouter from "./routes/user.js";
import profilesRouter from "./routes/profiles.js";
import adminRouter from "./routes/admin.js";
import auditRouter from "./routes/audit.js";
import publicRouter from "./routes/public.js";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // --- Technical & SEO Assets (Top Priority) ---

  // Sitemap cache: regenerate at most once per 24 hours
  let sitemapCache: { xml: string; generatedAt: number } | null = null;
  const SITEMAP_TTL = 24 * 60 * 60 * 1000; // 24 hours

  // Dynamic Sitemap Generation (cached)
  app.get("/sitemap.xml", async (_req: Request, res: Response) => {
    // Return cached sitemap if still valid
    if (sitemapCache && Date.now() - sitemapCache.generatedAt < SITEMAP_TTL) {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.status(200).send(sitemapCache.xml);
    }

    let posts: any[] = [];
    try {
      if (adminDb) {
        try {
          const snapshot = await adminDb.collection("blog_posts")
            .where("status", "==", "published")
            .get();
          posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        } catch (dbErr) {
          console.error("[SITEMAP] DB error (skipping blogs):", dbErr);
        }
      }
    } catch (generalErr) {
      console.error("[SITEMAP] Setup error:", generalErr);
    }

    const baseUrl = "https://myeca.in";
    const staticRoutes = [
      "", "/services", "/all-services", "/about", "/contact",
      "/calculators", "/learn", "/blog", "/legal/privacy-policy",
      "/legal/terms-of-service", "/legal/refund-policy"
    ];

    try {
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.map(route => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route === "" ? "daily" : "weekly"}</changefreq>
    <priority>${route === "" ? "1.0" : "0.8"}</priority>
  </url>`).join('')}
  ${posts.map((post: any) => {
    let dateStr = new Date().toISOString().split('T')[0];
    try {
      const dateVal = post.updatedAt?.toDate?.() || post.updatedAt || post.createdAt?.toDate?.() || post.createdAt || new Date();
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) dateStr = d.toISOString().split('T')[0];
    } catch (e) {}
    return `
  <url>
    <loc>${baseUrl}/blog/${post.slug || post.id}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }).join('')}
</urlset>`;

      const trimmedSitemap = sitemap.trim();
      sitemapCache = { xml: trimmedSitemap, generatedAt: Date.now() };
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(trimmedSitemap);
    } catch (error: any) {
      console.error("[SITEMAP] Final error:", error.message);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/openapi.json", (_req: Request, res: Response) => {
    try {
      // Return the public-facing API spec as JSON
      const openapi = {
        openapi: "3.0.0",
        info: {
          title: "MyeCA API",
          version: "1.0.0",
          description: "Public API for MyeCA.in technical integrations"
        },
        paths: {
          "/api/health": {
            get: {
              summary: "Health Check",
              responses: { "200": { description: "API is healthy" } }
            }
          }
        },
        servers: [{ url: "https://myeca.in" }]
      };
      res.status(200).json(openapi);
    } catch (error: any) {
      res.status(500).send("Error serving openapi.json");
    }
  });

  app.get("/llms.txt", (_req: Request, res: Response) => {
    try {
      const filePath = path.resolve(process.cwd(), "public", "llms.txt");
      res.setHeader('Content-Type', 'text/plain');
      res.status(200).sendFile(filePath);
    } catch (error) {
      res.status(404).send("llms.txt not found");
    }
  });

  app.get("/robots.txt", (_req: Request, res: Response) => {
    const robots = `User-agent: *
Allow: /
Sitemap: https://myeca.in/sitemap.xml
Disallow: /admin/
Disallow: /ca/
Disallow: /api/`;
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(robots);
  });





  // --- End Technical Assets ---

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Error logging endpoint
  app.post("/api/errors/log", express.text({ type: "*/*", limit: "200kb" }), (req: Request, res: Response) => {
    // #region agent log
    const logPath = path.resolve(process.cwd(), "debug-ac3226.log");
    let parsed: unknown = undefined;
    const raw = typeof req.body === "string" ? req.body : "";
    if (raw) {
      try { parsed = JSON.parse(raw); } catch { parsed = { raw: raw.slice(0, 2000) }; }
    }
    const payload = {
      sessionId: "ac3226",
      runId: "baseline",
      hypothesisId: "E",
      location: "server/routes.ts:/api/errors/log",
      message: "client_error_log",
      data: parsed ?? { note: "empty_body" },
      timestamp: Date.now(),
    };
    fs.promises.appendFile(logPath, JSON.stringify(payload) + "\n", "utf8").catch((e) => { try { console.error("debug-ac3226.log append failed:", e); } catch { } });
    // #endregion
    res.status(200).json({ status: "logged" });
  });
  
  // Auth endpoints for User management (Clerk + Neon)
  const authRouter = (await import("./routes/auth")).default;
  app.use("/api/v1/auth", authLimiter, authRouter);

  // Mount feature routers
  app.use("/api/documents", uploadLimiter, documentsRouter);
  app.use("/api/referrals", referralsRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/teams", teamsRouter);
  app.use("/api/workflows", workflowsRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/cms", cmsRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/system", systemRouter);
  app.use("/api/audit", auditRouter);
  
  // User-facing routes
  app.use("/api", userRouter);
  app.use("/api/profiles", profilesRouter);
  app.use("/api/public", publicRouter);

  // Admin routes
  app.use("/api/admin", adminLimiter, adminRouter);

  // CA routes
  const caRouter = (await import("./routes/ca")).default;
  app.use("/api/ca", caRouter);

  return httpServer;
}
