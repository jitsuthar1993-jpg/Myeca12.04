import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import { apiRateLimiter, authLimiter, adminLimiter, uploadLimiter } from "./middleware/rate-limits.js";
import documentsRouter from "./routes/documents.js";
import referralsRouter from "./routes/referrals.js";
import notificationsRouter from "./routes/notifications.js";
import remindersRouter from "./routes/reminders.js";
import workflowEventsRouter from "./routes/workflow-events.js";
import teamTriageRouter from "./routes/team-triage.js";
import feedbackRouter from "./routes/feedback.js";
import twoFactorRouter from "./routes/2fa.js";
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
import blogWebhooksRouter from "./routes/blog-webhooks.js";
import whatsappRouter from "./routes/whatsapp.js";
import { buildOpenApiSpec } from "./openapi.js";
import { listPublishedBlogPosts, sortPublishedPosts } from "./services/blog.js";
import { SEO_CONFIG } from "../client/src/config/seo.config.js";
import { TAX_GUIDES } from "../client/src/data/tax-guides.js";
import { getGeneratedPublicRoutes } from "../client/src/data/missing-pages.js";
import {
  buildRobotsTxt,
  buildSitemapXml,
  getIndexablePublicRoutes,
  routeChangefreq,
  routePriority,
  toAbsoluteUrl,
} from "../shared/seo-public.js";

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

    let posts: Array<{ slug: string; id: string; updatedAt: string | null; createdAt: string | null; publishedAt: string | null }> = [];
    try {
      posts = sortPublishedPosts(await listPublishedBlogPosts()).map((post) => ({
        id: post.id,
        slug: post.slug,
        updatedAt: post.updatedAt,
        createdAt: post.createdAt,
        publishedAt: post.publishedAt,
      }));
    } catch (generalErr) {
      console.error("[SITEMAP] Blog loading error (skipping blogs):", generalErr);
    }

    try {
      const blogDateMap = new Map<string, string>();
      const blogRoutes = posts.map((post) => {
        const route = `/blog/${post.slug || post.id}`;
        const dateVal = post.updatedAt || post.publishedAt || post.createdAt || new Date();
        const d = new Date(dateVal);
        blogDateMap.set(route, Number.isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0]);
        return route;
      });
      const guideRoutes = TAX_GUIDES.map((guide) => `/learn/guide/${guide.slug}`);
      const seoConfigRoutes = Object.entries(SEO_CONFIG)
        .filter(([, config]) => !config.noindex)
        .map(([route]) => route);
      const routes = getIndexablePublicRoutes(
        [...seoConfigRoutes, ...getGeneratedPublicRoutes()],
        [...blogRoutes, ...guideRoutes],
      );
      const trimmedSitemap = buildSitemapXml(routes.map((route) => ({
        loc: toAbsoluteUrl(route),
        lastmod: blogDateMap.get(route) || new Date().toISOString().split("T")[0],
        changefreq: routeChangefreq(route),
        priority: routePriority(route),
      }))).trim();
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
      res.status(200).json(buildOpenApiSpec());
    } catch {
      res.status(500).send("Error serving openapi.json");
    }
  });
  app.get(["/llms.txt", "/llms-full.txt"], (req: Request, res: Response) => {
    try {
      const isFull = req.path.includes("-full");
      const fileName = isFull ? "llms-full.txt" : "llms.txt";
      
      // Try multiple possible locations for the file
      const searchPaths = [
        path.resolve(process.cwd(), "client", "public", fileName),
        path.resolve(process.cwd(), "public", fileName),
        path.resolve(process.cwd(), "dist", "public", fileName),
      ];

      let filePath = "";
      for (const p of searchPaths) {
        if (fs.existsSync(p)) {
          filePath = p;
          break;
        }
      }

      if (filePath) {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.status(200).sendFile(filePath);
      }
      
      res.status(404).send(`${fileName} not found`);
    } catch (error) {
      res.status(500).send("Error serving LLM text file");
    }
  });

  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(buildRobotsTxt());
  });





  // --- End Technical Assets ---

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Error logging endpoint
  app.post("/api/errors/log", apiRateLimiter, express.text({ type: "*/*", limit: "5kb" }), (req: Request, res: Response) => {
    let parsed: Record<string, unknown> | undefined = undefined;
    const raw = typeof req.body === "string" ? req.body : "";
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = { raw: raw.slice(0, 500) };
      }
    }
    const payload = {
      message: "client_error_log",
      path: typeof parsed?.url === "string" ? parsed.url.split("?")[0].slice(0, 200) : undefined,
      kind: typeof parsed?.kind === "string" ? parsed.kind.slice(0, 80) : undefined,
      errorMessage: typeof parsed?.message === "string" ? parsed.message.slice(0, 300) : typeof parsed?.msg === "string" ? parsed.msg.slice(0, 300) : undefined,
      timestamp: new Date().toISOString(),
    };
    console.warn("[client-error]", payload);
    res.status(200).json({ status: "logged" });
  });
  
  // Auth endpoints for User management (Supabase + Supabase)
  const authRouter = (await import("./routes/auth")).default;
  app.use("/api/v1/auth", authLimiter, authRouter);

  // Mount feature routers
  app.use("/api/documents", uploadLimiter, documentsRouter);
  app.use("/api/referrals", referralsRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/reminders", remindersRouter);
  app.use("/api/workflow-events", workflowEventsRouter);
  app.use("/api/team/triage", teamTriageRouter);
  app.use(feedbackRouter);
  app.use("/api/2fa", twoFactorRouter);
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
  app.use("/api/webhooks", blogWebhooksRouter);
  app.use("/api/whatsapp", whatsappRouter);
  
  // CA routes
  const caRouter = (await import("./routes/ca")).default;
  app.use("/api/ca", caRouter);

  return httpServer;
}
