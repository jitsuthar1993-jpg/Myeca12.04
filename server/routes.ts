import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import { adminDb } from "./data-admin.js";
import { apiRateLimiter, authLimiter, adminLimiter, uploadLimiter } from "./middleware/rate-limits.js";
import documentsRouter from "./routes/documents.js";
import referralsRouter from "./routes/referrals.js";
import notificationsRouter from "./routes/notifications.js";
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
import { listPublishedBlogPosts, sortPublishedPosts } from "./services/blog.js";
import {
  buildRobotsTxt,
  buildSitemapXml,
  getIndexablePublicRoutes,
  routePriority,
  toAbsoluteUrl,
} from "../shared/seo-public.js";

const openApiRef = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const openApiArray = (schema: Record<string, unknown>) => ({ type: "array", items: schema });
const openApiJsonResponse = (description: string, schema: Record<string, unknown>) => ({
  description,
  content: {
    "application/json": {
      schema,
    },
  },
});
const openApiJsonRequest = (schema: Record<string, unknown>) => ({
  required: true,
  content: {
    "application/json": {
      schema,
    },
  },
});
const openApiMultipartRequest = (schema: Record<string, unknown>) => ({
  required: true,
  content: {
    "multipart/form-data": {
      schema,
    },
  },
});

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
      const routes = getIndexablePublicRoutes([], blogRoutes);
      const trimmedSitemap = buildSitemapXml(routes.map((route) => ({
        loc: toAbsoluteUrl(route),
        lastmod: blogDateMap.get(route) || new Date().toISOString().split("T")[0],
        changefreq: route === "/" ? "daily" : route.startsWith("/blog/") ? "monthly" : "weekly",
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
              responses: { "200": openApiJsonResponse("API is healthy", openApiRef("HealthResponse")) }
            }
          },
          "/api/errors/log": {
            post: {
              tags: ["observability"],
              summary: "Accept sanitized client-side error and performance logs",
              responses: { "200": { description: "Log accepted" }, "429": { description: "Rate limited" } }
            }
          },
          "/api/feedback": {
            post: {
              tags: ["feedback"],
              summary: "Submit public product feedback",
              requestBody: openApiJsonRequest(openApiRef("FeedbackCreateRequest")),
              responses: {
                "201": openApiJsonResponse("Feedback accepted", openApiRef("FeedbackCreateResponse")),
                "400": { description: "Invalid feedback payload" },
                "429": { description: "Rate limited" }
              }
            }
          },
          "/api/public/updates/active": {
            get: {
              tags: ["public"],
              summary: "List active public site updates",
              responses: { "200": openApiJsonResponse("Active public updates", openApiRef("PublicUpdateListResponse")) }
            }
          },
          "/api/public/blogs": {
            get: {
              tags: ["public", "blog"],
              summary: "List published blog posts",
              responses: { "200": openApiJsonResponse("Published blog summaries", openApiRef("BlogListResponse")) }
            }
          },
          "/api/public/blogs/{slug}": {
            get: {
              tags: ["public", "blog"],
              summary: "Get a published blog post by slug",
              parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
              responses: { "200": openApiJsonResponse("Published blog post", openApiRef("BlogPostResponse")), "404": { description: "Post not found" } }
            }
          },
          "/api/public/blogs/{slug}/related": {
            get: {
              tags: ["public", "blog"],
              summary: "List related published blog posts",
              parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
              responses: { "200": { description: "Related blog posts" } }
            }
          },
          "/api/public/categories": {
            get: {
              tags: ["public", "blog"],
              summary: "List public blog categories",
              responses: { "200": { description: "Public categories" } }
            }
          },
          "/api/v1/auth/me": {
            get: {
              tags: ["auth"],
              summary: "Get the current authenticated user",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Current user profile", openApiRef("UserResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/v1/auth/sync": {
            post: {
              tags: ["auth"],
              summary: "Create or update the current user's application profile",
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "User profile synced" }, "201": { description: "User profile created" }, "401": { description: "Unauthorized" } }
            }
          },
          "/api/v1/auth/logout-event": {
            post: {
              tags: ["auth", "audit"],
              summary: "Record a user logout, timeout, or expired-session event",
              security: [{ bearerAuth: [] }],
              responses: { "201": { description: "Logout event recorded" }, "401": { description: "Unauthorized" } }
            }
          },
          "/api/2fa/status": {
            get: {
              tags: ["auth", "security"],
              summary: "Get two-factor authentication status for the current user",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("2FA status", openApiRef("TwoFactorStatusResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/2fa/enable": {
            post: {
              tags: ["auth", "security"],
              summary: "Start TOTP two-factor authentication enrollment",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("TOTP secret, QR code, and backup codes", openApiRef("TwoFactorEnableResponse")), "401": { description: "Unauthorized" }, "503": { description: "Server-side encryption not configured" } }
            }
          },
          "/api/2fa/verify": {
            post: {
              tags: ["auth", "security"],
              summary: "Verify TOTP setup and enable two-factor authentication",
              requestBody: openApiJsonRequest(openApiRef("TwoFactorVerifyRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("2FA enabled", openApiRef("MessageResponse")), "400": { description: "Invalid token" }, "401": { description: "Unauthorized" } }
            }
          },
          "/api/2fa/disable": {
            post: {
              tags: ["auth", "security"],
              summary: "Disable two-factor authentication for the current user",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("2FA disabled", openApiRef("MessageResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/user/dashboard": {
            get: {
              tags: ["user"],
              summary: "Get dashboard summary for the current user",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Dashboard summary", openApiRef("UserDashboardResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/profile": {
            get: {
              tags: ["user"],
              summary: "Get the current user's profile",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("User profile", openApiRef("ProfileResponse")), "401": { description: "Unauthorized" } }
            },
            put: {
              tags: ["user"],
              summary: "Update the current user's profile",
              requestBody: openApiJsonRequest(openApiRef("ProfileUpdateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Updated profile", openApiRef("ProfileResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/user-services": {
            get: {
              tags: ["user", "services"],
              summary: "List services activated by the current user",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("User services", openApiArray(openApiRef("UserService"))), "401": { description: "Unauthorized" } }
            },
            post: {
              tags: ["user", "services"],
              summary: "Create a service activation request",
              requestBody: openApiJsonRequest(openApiRef("UserServiceCreateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Service request created", openApiRef("CreatedResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/user-services/{id}": {
            get: {
              tags: ["user", "services"],
              summary: "Get a service case owned by the current user",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Service case detail", openApiRef("UserServiceDetailResponse")), "401": { description: "Unauthorized" }, "404": { description: "Service not found" } }
            },
            patch: {
              tags: ["user", "services"],
              summary: "Update current user's editable service metadata",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              requestBody: openApiJsonRequest(openApiRef("UserServiceMetadataUpdateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Service case updated", openApiRef("UserServiceResponse")), "400": { description: "Invalid metadata" }, "401": { description: "Unauthorized" }, "404": { description: "Service not found" } }
            }
          },
          "/api/consultation-requests": {
            post: {
              tags: ["consultation"],
              summary: "Create a consultation callback request",
              requestBody: openApiJsonRequest(openApiRef("ConsultationRequestCreateRequest")),
              responses: { "200": openApiJsonResponse("Consultation request created", openApiRef("CreatedResponse")), "400": { description: "Invalid request" } }
            }
          },
          "/api/payments/request-link": {
            post: {
              tags: ["payments", "services"],
              summary: "Request a payment link for a user service",
              requestBody: openApiJsonRequest(openApiRef("PaymentLinkRequestCreateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Payment link request recorded", openApiRef("CreatedResponse")), "400": { description: "Invalid request" }, "401": { description: "Unauthorized" }, "404": { description: "Service not found" } }
            }
          },
          "/api/profiles": {
            get: {
              tags: ["profiles"],
              summary: "List saved profiles for the current user",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Profiles", openApiArray(openApiRef("SavedProfile"))), "401": { description: "Unauthorized" } }
            },
            post: {
              tags: ["profiles"],
              summary: "Create a saved profile",
              requestBody: openApiJsonRequest(openApiRef("SavedProfileCreateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Profile created", openApiRef("SavedProfile")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/profiles/{id}": {
            patch: {
              tags: ["profiles"],
              summary: "Update a saved profile",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              requestBody: openApiJsonRequest(openApiRef("SavedProfileUpdateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Profile updated", openApiRef("SavedProfile")), "400": { description: "Invalid profile payload" }, "404": { description: "Profile not found" } }
            }
          },
          "/api/documents": {
            get: {
              tags: ["documents"],
              summary: "List documents for the authenticated user",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Document list", openApiRef("DocumentListResponse")), "401": { description: "Unauthorized" } }
            },
            post: {
              tags: ["documents"],
              summary: "Upload a document",
              requestBody: openApiJsonRequest(openApiRef("DocumentCreateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Uploaded document", openApiRef("DocumentResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/documents/upload": {
            post: {
              tags: ["documents"],
              summary: "Upload a document file",
              requestBody: openApiMultipartRequest(openApiRef("DocumentFileUploadRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Uploaded document", openApiRef("DocumentResponse")), "400": { description: "Invalid upload" }, "401": { description: "Unauthorized" } }
            }
          },
          "/api/documents/register": {
            post: {
              tags: ["documents"],
              summary: "Register document metadata after direct storage upload",
              requestBody: openApiJsonRequest(openApiRef("DocumentRegisterRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Document registered", openApiRef("DocumentResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/documents/stats/summary": {
            get: {
              tags: ["documents"],
              summary: "Get document vault summary statistics",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Document statistics", openApiRef("DocumentStatsResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/documents/{id}": {
            get: {
              tags: ["documents"],
              summary: "Get a document by id",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Document", openApiRef("DocumentResponse")), "404": { description: "Not found" } }
            },
            patch: {
              tags: ["documents"],
              summary: "Update document metadata",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              requestBody: openApiJsonRequest(openApiRef("DocumentUpdateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Document updated", openApiRef("DocumentResponse")), "404": { description: "Not found" } }
            },
            delete: {
              tags: ["documents"],
              summary: "Delete a document",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Document deleted" }, "404": { description: "Not found" } }
            }
          },
          "/api/documents/{id}/download": {
            get: {
              tags: ["documents"],
              summary: "Download a document",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Document file or signed download URL" }, "404": { description: "Not found" } }
            }
          },
          "/api/reports/generate": {
            post: {
              tags: ["reports"],
              summary: "Generate a report for the authenticated user",
              requestBody: openApiJsonRequest(openApiRef("ReportGenerateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Generated report", openApiRef("ReportResponse")), "400": { description: "Invalid report request" }, "401": { description: "Unauthorized" } }
            }
          },
          "/api/reports/templates": {
            get: {
              tags: ["reports"],
              summary: "List available report templates",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Report templates", openApiRef("ReportTemplateListResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/reports/history": {
            get: {
              tags: ["reports"],
              summary: "List generated report history",
              parameters: [
                { name: "page", in: "query", required: false, schema: { type: "integer", minimum: 1, default: 1 } },
                { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } }
              ],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Report history", openApiRef("ReportHistoryResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/referrals": {
            get: {
              tags: ["referrals"],
              summary: "List referral data for the authenticated user",
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Referral data" }, "401": { description: "Unauthorized" } }
            }
          },
          "/api/referrals/stats": {
            get: {
              tags: ["referrals"],
              summary: "Get referral statistics for the authenticated user",
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Referral statistics" }, "401": { description: "Unauthorized" } }
            }
          },
          "/api/referrals/overview": {
            get: {
              tags: ["referrals"],
              summary: "Get referral overview for the authenticated user",
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Referral overview" }, "401": { description: "Unauthorized" } }
            }
          },
          "/api/referrals/rewards": {
            get: {
              tags: ["referrals"],
              summary: "List referral rewards",
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Referral rewards" }, "401": { description: "Unauthorized" } }
            }
          },
          "/api/referrals/generate-link": {
            post: {
              tags: ["referrals"],
              summary: "Generate a referral link",
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Generated referral link" }, "401": { description: "Unauthorized" } }
            }
          },
          "/api/referrals/leaderboard": {
            get: {
              tags: ["referrals"],
              summary: "Get referral leaderboard entries",
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Referral leaderboard" }, "401": { description: "Unauthorized" } }
            }
          },
          "/api/referrals/analytics": {
            get: {
              tags: ["referrals"],
              summary: "Get referral analytics",
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Referral analytics" }, "401": { description: "Unauthorized" } }
            }
          },
          "/api/notifications": {
            get: {
              tags: ["notifications"],
              summary: "List notifications for the authenticated user",
              parameters: [{ name: "unread", in: "query", required: false, schema: { type: "boolean" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Notifications", openApiRef("NotificationListResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/notifications/{id}/read": {
            patch: {
              tags: ["notifications"],
              summary: "Mark a notification as read",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Notification marked as read", openApiRef("MessageResponse")), "404": { description: "Notification not found" } }
            }
          },
          "/api/notifications/read-all": {
            patch: {
              tags: ["notifications"],
              summary: "Mark all notifications as read",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("All notifications marked as read", openApiRef("MessageResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/notifications/{id}": {
            delete: {
              tags: ["notifications"],
              summary: "Delete a notification",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Notification deleted", openApiRef("MessageResponse")), "404": { description: "Notification not found" } }
            }
          },
          "/api/teams": {
            get: {
              tags: ["teams"],
              summary: "List teams and memberships",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Teams data", openApiRef("TeamListResponse")), "401": { description: "Unauthorized" } }
            },
            post: {
              tags: ["teams"],
              summary: "Create a team",
              requestBody: openApiJsonRequest(openApiRef("TeamCreateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "201": openApiJsonResponse("Team created", openApiRef("TeamResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/teams/{teamId}": {
            get: {
              tags: ["teams"],
              summary: "Get team details",
              parameters: [{ name: "teamId", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Team details", openApiRef("TeamResponse")), "404": { description: "Team not found" } }
            }
          },
          "/api/teams/{teamId}/invite": {
            post: {
              tags: ["teams"],
              summary: "Invite a team member",
              parameters: [{ name: "teamId", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "201": { description: "Invite created" }, "404": { description: "Team not found" } }
            }
          },
          "/api/teams/{teamId}/tasks": {
            get: {
              tags: ["teams"],
              summary: "List team tasks",
              parameters: [{ name: "teamId", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Team tasks" }, "404": { description: "Team not found" } }
            },
            post: {
              tags: ["teams"],
              summary: "Create a team task",
              parameters: [{ name: "teamId", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "201": { description: "Task created" }, "404": { description: "Team not found" } }
            }
          },
          "/api/teams/{teamId}/notes": {
            get: {
              tags: ["teams"],
              summary: "List team notes",
              parameters: [{ name: "teamId", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Team notes" }, "404": { description: "Team not found" } }
            },
            post: {
              tags: ["teams"],
              summary: "Create a team note",
              parameters: [{ name: "teamId", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "201": { description: "Note created" }, "404": { description: "Team not found" } }
            }
          },
          "/api/teams/{teamId}/activity": {
            get: {
              tags: ["teams"],
              summary: "List team activity",
              parameters: [{ name: "teamId", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Team activity" }, "404": { description: "Team not found" } }
            }
          },
          "/api/workflows/templates": {
            get: {
              tags: ["workflows"],
              summary: "List workflow templates",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Workflow templates", openApiRef("WorkflowTemplateListResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/workflows": {
            get: {
              tags: ["workflows"],
              summary: "List user workflows",
              parameters: [
                { name: "page", in: "query", required: false, schema: { type: "integer", minimum: 1, default: 1 } },
                { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 100, default: 50 } }
              ],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Workflow data", openApiRef("WorkflowListResponse")), "401": { description: "Unauthorized" } }
            },
            post: {
              tags: ["workflows"],
              summary: "Create a workflow",
              requestBody: openApiJsonRequest(openApiRef("WorkflowCreateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "201": openApiJsonResponse("Workflow created", openApiRef("WorkflowResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/workflows/{id}": {
            get: {
              tags: ["workflows"],
              summary: "Get a workflow by id",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Workflow", openApiRef("WorkflowResponse")), "404": { description: "Workflow not found" } }
            },
            patch: {
              tags: ["workflows"],
              summary: "Update a workflow",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              requestBody: openApiJsonRequest(openApiRef("WorkflowUpdateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Workflow updated", openApiRef("WorkflowResponse")), "404": { description: "Workflow not found" } }
            },
            delete: {
              tags: ["workflows"],
              summary: "Delete a workflow",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Workflow deleted" }, "404": { description: "Workflow not found" } }
            }
          },
          "/api/workflows/{id}/toggle": {
            post: {
              tags: ["workflows"],
              summary: "Toggle workflow active state",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Workflow toggled" }, "404": { description: "Workflow not found" } }
            }
          },
          "/api/workflows/{id}/history": {
            get: {
              tags: ["workflows"],
              summary: "List workflow run history",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Workflow history" }, "404": { description: "Workflow not found" } }
            }
          },
          "/api/analytics/overview": {
            get: {
              tags: ["analytics", "admin"],
              summary: "Get admin analytics overview",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Analytics overview", openApiRef("AnalyticsOverviewResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/analytics/mobile-performance": {
            post: {
              tags: ["analytics"],
              summary: "Accept mobile performance telemetry",
              responses: { "200": { description: "Performance event accepted" } }
            }
          },
          "/api/cms/posts": {
            get: {
              tags: ["cms", "blog"],
              summary: "List CMS blog posts",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("CMS posts", openApiRef("CmsPostListResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            },
            post: {
              tags: ["cms", "blog"],
              summary: "Create a CMS blog post",
              requestBody: openApiJsonRequest(openApiRef("CmsPostWriteRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Post created", openApiRef("CmsPostResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/cms/posts/{id}": {
            get: {
              tags: ["cms", "blog"],
              summary: "Get a CMS blog post by id",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("CMS post", openApiRef("CmsPostResponse")), "404": { description: "Post not found" } }
            },
            put: {
              tags: ["cms", "blog"],
              summary: "Update a CMS blog post",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              requestBody: openApiJsonRequest(openApiRef("CmsPostUpdateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Post updated", openApiRef("CmsPostResponse")), "400": { description: "Invalid post payload" }, "404": { description: "Post not found" } }
            },
            delete: {
              tags: ["cms", "blog"],
              summary: "Delete a CMS blog post",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Post deleted", openApiRef("MessageResponse")), "404": { description: "Post not found" } }
            }
          },
          "/api/cms/upload": {
            post: {
              tags: ["cms", "blog"],
              summary: "Upload a CMS image",
              requestBody: openApiMultipartRequest(openApiRef("CmsImageUploadRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Image uploaded", openApiRef("CmsImageUploadResponse")), "400": { description: "Invalid upload" } }
            }
          },
          "/api/cms/categories": {
            get: {
              tags: ["cms", "blog"],
              summary: "List CMS categories",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("CMS categories", openApiRef("CategoryListResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            },
            post: {
              tags: ["cms", "blog"],
              summary: "Create a CMS category",
              requestBody: openApiJsonRequest(openApiRef("CategoryCreateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Category created", openApiRef("CategoryResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/cms/media": {
            get: {
              tags: ["cms", "blog"],
              summary: "List uploaded CMS media",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("CMS media", openApiRef("MediaListResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/cms/updates": {
            get: {
              tags: ["cms"],
              summary: "List CMS site updates",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("CMS updates", openApiRef("PublicUpdateListResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            },
            post: {
              tags: ["cms"],
              summary: "Create a CMS site update",
              requestBody: openApiJsonRequest(openApiRef("PublicUpdateCreateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Update created", openApiRef("PublicUpdateResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/cms/updates/{id}": {
            put: {
              tags: ["cms"],
              summary: "Update a CMS site update",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              requestBody: openApiJsonRequest(openApiRef("PublicUpdateUpdateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Update changed", openApiRef("PublicUpdateResponse")), "400": { description: "Invalid update payload" }, "404": { description: "Update not found" } }
            },
            delete: {
              tags: ["cms"],
              summary: "Delete a CMS site update",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Update deleted", openApiRef("MessageResponse")), "404": { description: "Update not found" } }
            }
          },
          "/api/admin/users": {
            get: {
              tags: ["admin"],
              summary: "List users for administrators",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("User list", openApiRef("AdminUserListResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/admin/stats": {
            get: {
              tags: ["admin"],
              summary: "Get admin dashboard statistics",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Admin statistics", openApiRef("AdminStatsResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/admin/users/{id}/role": {
            patch: {
              tags: ["admin"],
              summary: "Update a user's role",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Role updated" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/admin/users/{id}/assign-ca": {
            patch: {
              tags: ["admin"],
              summary: "Assign a CA to a user",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "CA assignment updated" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/audit/logs": {
            get: {
              tags: ["audit", "admin"],
              summary: "List audit logs",
              parameters: [
                { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 500, default: 100 } },
                { name: "offset", in: "query", required: false, schema: { type: "integer", minimum: 0, default: 0 } },
                { name: "q", in: "query", required: false, schema: { type: "string" } }
              ],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Audit logs", openApiRef("AuditLogListResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            },
            post: {
              tags: ["audit"],
              summary: "Create an audit log entry",
              requestBody: openApiJsonRequest(openApiRef("AuditLogCreateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "201": openApiJsonResponse("Audit log created", openApiRef("CreatedResponse")), "401": { description: "Unauthorized" } }
            }
          },
          "/api/audit/download": {
            get: {
              tags: ["audit", "admin"],
              summary: "Download audit logs",
              parameters: [{ name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 10000, default: 5000 } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": { description: "Audit log export" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/system/config": {
            get: {
              tags: ["admin", "system"],
              summary: "Get persisted platform configuration",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("System configuration", openApiRef("SystemConfigResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            },
            put: {
              tags: ["admin", "system"],
              summary: "Update persisted platform configuration",
              requestBody: openApiJsonRequest(openApiRef("SystemConfigUpdateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("System configuration updated", openApiRef("SystemConfigResponse")), "400": { description: "Invalid configuration" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/admin/requests/consultations": {
            get: {
              tags: ["admin", "consultation"],
              summary: "List consultation callback requests",
              parameters: [
                { name: "status", in: "query", required: false, schema: { type: "string", enum: ["all", "new", "contacted", "converted", "closed"] } },
                { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 100, default: 50 } }
              ],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Consultation requests", openApiRef("AdminConsultationRequestListResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/admin/requests/consultations/{id}": {
            patch: {
              tags: ["admin", "consultation"],
              summary: "Update a consultation request status or note",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              requestBody: openApiJsonRequest(openApiRef("AdminConsultationRequestUpdateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Consultation request updated", openApiRef("AdminConsultationRequestResponse")), "400": { description: "Invalid update" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Request not found" } }
            }
          },
          "/api/admin/requests/payment-links": {
            get: {
              tags: ["admin", "payments"],
              summary: "List payment-link requests",
              parameters: [
                { name: "status", in: "query", required: false, schema: { type: "string", enum: ["all", "requested", "link_sent", "paid", "cancelled"] } },
                { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 100, default: 50 } }
              ],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Payment-link requests", openApiRef("AdminPaymentLinkRequestListResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/admin/requests/payment-links/{id}": {
            patch: {
              tags: ["admin", "payments"],
              summary: "Update a payment-link request and linked service payment status",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              requestBody: openApiJsonRequest(openApiRef("AdminPaymentLinkRequestUpdateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Payment-link request updated", openApiRef("AdminPaymentLinkRequestResponse")), "400": { description: "Invalid update" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Request not found" } }
            }
          },
          "/api/admin/feedback": {
            get: {
              tags: ["admin", "feedback"],
              summary: "List feedback submissions",
              parameters: [
                { name: "page", in: "query", required: false, schema: { type: "integer", minimum: 1, default: 1 } },
                { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 100, default: 50 } },
                { name: "status", in: "query", required: false, schema: { type: "string", enum: ["pending", "in-progress", "resolved", "closed"] } },
                { name: "type", in: "query", required: false, schema: { type: "string", enum: ["bug", "feature", "general", "complaint"] } }
              ],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Feedback submissions", openApiRef("FeedbackListResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/admin/feedback/stats": {
            get: {
              tags: ["admin", "feedback"],
              summary: "Get feedback dashboard statistics",
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Feedback statistics", openApiRef("FeedbackStatsResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } }
            }
          },
          "/api/admin/feedback/{id}": {
            put: {
              tags: ["admin", "feedback"],
              summary: "Update feedback status, priority, or response",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              requestBody: openApiJsonRequest(openApiRef("FeedbackUpdateRequest")),
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Feedback updated", openApiRef("FeedbackResponse")), "400": { description: "Invalid update" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Feedback not found" } }
            },
            delete: {
              tags: ["admin", "feedback"],
              summary: "Delete a feedback submission",
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
              security: [{ bearerAuth: [] }],
              responses: { "200": openApiJsonResponse("Feedback deleted", openApiRef("MessageResponse")), "401": { description: "Unauthorized" }, "403": { description: "Forbidden" }, "404": { description: "Feedback not found" } }
            }
          }
        },
        components: {
          securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
          },
          schemas: {
            HealthResponse: {
              type: "object",
              required: ["status"],
              properties: {
                status: { type: "string", example: "ok" },
                timestamp: { type: "string", format: "date-time" }
              }
            },
            CreatedResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                id: { type: "string" }
              }
            },
            MessageResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" }
              }
            },
            Pagination: {
              type: "object",
              properties: {
                page: { type: "integer", minimum: 1 },
                limit: { type: "integer", minimum: 1 },
                offset: { type: "integer", minimum: 0 },
                total: { type: "integer", minimum: 0 },
                pages: { type: "integer", minimum: 0 }
              }
            },
            User: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string", format: "email" },
                displayName: { type: "string" },
                role: { type: "string", enum: ["user", "ca", "admin", "super_admin"] },
                createdAt: { type: "string", format: "date-time" }
              }
            },
            UserResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                user: openApiRef("User")
              }
            },
            UserDashboardResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                stats: {
                  type: "object",
                  properties: {
                    totalReturns: { type: "integer", minimum: 0 },
                    documentsUploaded: { type: "integer", minimum: 0 },
                    profiles: { type: "integer", minimum: 0 },
                    pendingTasks: { type: "integer", minimum: 0 },
                    savedAmount: { type: "number" }
                  }
                },
                activeServices: openApiArray(openApiRef("UserService")),
                recentActivity: openApiArray({ type: "object", additionalProperties: true }),
                taxReturns: openApiArray({ type: "object", additionalProperties: true })
              }
            },
            ProfileResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    user: openApiRef("User")
                  }
                }
              }
            },
            ProfileUpdateRequest: {
              type: "object",
              required: ["firstName", "lastName"],
              properties: {
                firstName: { type: "string", minLength: 1, maxLength: 100 },
                lastName: { type: "string", minLength: 1, maxLength: 100 },
                phoneNumber: { type: "string", maxLength: 20, nullable: true }
              }
            },
            UserService: {
              type: "object",
              properties: {
                id: { type: "string" },
                userId: { type: "string" },
                serviceId: { type: "string" },
                serviceTitle: { type: "string" },
                serviceCategory: { type: "string" },
                profileId: { type: "string", nullable: true },
                status: { type: "string" },
                paymentStatus: { type: "string", nullable: true },
                assignedCaId: { type: "string", nullable: true },
                assignedCaName: { type: "string", nullable: true },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" }
              }
            },
            UserServiceCreateRequest: {
              type: "object",
              required: ["serviceId", "serviceTitle", "serviceCategory"],
              properties: {
                serviceId: { type: "string" },
                serviceTitle: { type: "string" },
                serviceCategory: { type: "string" },
                profileId: { type: "string", nullable: true },
                paymentAmount: { oneOf: [{ type: "number" }, { type: "string" }] },
                paymentStatus: { type: "string" },
                status: { type: "string" },
                assignedCaId: { type: "string", nullable: true },
                metadata: { type: "object", additionalProperties: true }
              }
            },
            UserServiceMetadataUpdateRequest: {
              type: "object",
              properties: {
                metadata: { type: "object", additionalProperties: true }
              }
            },
            UserServiceResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                service: openApiRef("UserService")
              }
            },
            UserServiceDetailResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                service: openApiRef("UserService"),
                documents: openApiArray(openApiRef("Document"))
              }
            },
            ConsultationRequestCreateRequest: {
              type: "object",
              required: ["name", "phone", "service", "message"],
              properties: {
                name: { type: "string", minLength: 1, maxLength: 120 },
                phone: { type: "string", minLength: 1, maxLength: 30 },
                email: { type: "string", format: "email" },
                gstin: { type: "string", maxLength: 20 },
                company: { type: "string", maxLength: 160 },
                service: { type: "string", minLength: 1, maxLength: 160 },
                turnover: { type: "string", maxLength: 80 },
                preferredTime: { type: "string", maxLength: 80 },
                message: { type: "string", minLength: 1, maxLength: 3000 },
                source: { type: "string", maxLength: 120 }
              }
            },
            PaymentLinkRequestCreateRequest: {
              type: "object",
              required: ["userServiceId"],
              properties: {
                userServiceId: { type: "string", minLength: 1 },
                note: { type: "string", maxLength: 1000 }
              }
            },
            AdminConsultationRequest: {
              type: "object",
              properties: {
                id: { type: "string" },
                userId: { type: "string", nullable: true },
                name: { type: "string" },
                phone: { type: "string" },
                email: { type: "string", nullable: true },
                service: { type: "string" },
                preferredTime: { type: "string" },
                message: { type: "string" },
                status: { type: "string", enum: ["new", "contacted", "converted", "closed"] },
                internalNote: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" }
              }
            },
            AdminConsultationRequestUpdateRequest: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["new", "contacted", "converted", "closed"] },
                internalNote: { type: "string", maxLength: 2000 }
              }
            },
            AdminConsultationRequestResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                request: openApiRef("AdminConsultationRequest")
              }
            },
            AdminConsultationRequestListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                requests: openApiArray(openApiRef("AdminConsultationRequest")),
                total: { type: "integer", minimum: 0 }
              }
            },
            AdminPaymentLinkRequest: {
              type: "object",
              properties: {
                id: { type: "string" },
                userId: { type: "string" },
                userServiceId: { type: "string" },
                serviceTitle: { type: "string" },
                paymentAmount: { oneOf: [{ type: "number" }, { type: "string" }], nullable: true },
                status: { type: "string", enum: ["requested", "link_sent", "paid", "cancelled"] },
                note: { type: "string", nullable: true },
                adminNote: { type: "string" },
                paymentLink: { type: "string", format: "uri" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" }
              }
            },
            AdminPaymentLinkRequestUpdateRequest: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["requested", "link_sent", "paid", "cancelled"] },
                adminNote: { type: "string", maxLength: 2000 },
                paymentLink: { type: "string", format: "uri", maxLength: 1000 }
              }
            },
            AdminPaymentLinkRequestResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                request: openApiRef("AdminPaymentLinkRequest")
              }
            },
            AdminPaymentLinkRequestListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                requests: openApiArray(openApiRef("AdminPaymentLinkRequest")),
                total: { type: "integer", minimum: 0 }
              }
            },
            SavedProfile: {
              type: "object",
              properties: {
                id: { type: "string" },
                userId: { type: "string" },
                name: { type: "string" },
                relation: { type: "string" },
                pan: { type: "string", description: "Masked PAN" },
                aadhaar: { type: "string", description: "Masked Aadhaar" },
                dateOfBirth: { type: "string", nullable: true },
                address: { type: "string", nullable: true },
                isActive: { type: "boolean" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" }
              }
            },
            SavedProfileCreateRequest: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", minLength: 1, maxLength: 100 },
                relation: { type: "string", maxLength: 50, default: "self" },
                pan: { type: "string", pattern: "^[A-Z]{5}[0-9]{4}[A-Z]$" },
                aadhaar: { type: "string", pattern: "^[0-9]{12}$" },
                dateOfBirth: { type: "string" },
                address: { type: "string", maxLength: 500 },
                isActive: { type: "boolean", default: true }
              }
            },
            SavedProfileUpdateRequest: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 1, maxLength: 100 },
                relation: { type: "string", maxLength: 50 },
                pan: { type: "string", pattern: "^[A-Z]{5}[0-9]{4}[A-Z]$" },
                aadhaar: { type: "string", pattern: "^[0-9]{12}$" },
                dateOfBirth: { type: "string" },
                address: { type: "string", maxLength: 500 },
                isActive: { type: "boolean" }
              }
            },
            TwoFactorStatusResponse: {
              type: "object",
              properties: {
                enabled: { type: "boolean" }
              }
            },
            TwoFactorEnableResponse: {
              type: "object",
              properties: {
                secret: { type: "string" },
                qrCode: { type: "string", description: "Data URL QR code image" },
                manualEntryKey: { type: "string" },
                backupCodes: openApiArray({ type: "string" })
              }
            },
            TwoFactorVerifyRequest: {
              type: "object",
              properties: {
                token: { type: "string" },
                code: { type: "string" }
              }
            },
            BlogPost: {
              type: "object",
              properties: {
                id: { type: "string" },
                slug: { type: "string" },
                title: { type: "string" },
                excerpt: { type: "string" },
                category: { type: "string" },
                publishedAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" }
              }
            },
            BlogListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                posts: openApiArray(openApiRef("BlogPost")),
                pagination: openApiRef("Pagination")
              }
            },
            BlogPostResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                post: openApiRef("BlogPost")
              }
            },
            Category: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                slug: { type: "string" },
                description: { type: "string", nullable: true }
              }
            },
            CategoryCreateRequest: {
              type: "object",
              required: ["name", "slug"],
              properties: {
                name: { type: "string", minLength: 2, maxLength: 100 },
                slug: { type: "string", minLength: 2, maxLength: 100 }
              }
            },
            CategoryResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                category: openApiRef("Category")
              }
            },
            CategoryListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                categories: openApiArray(openApiRef("Category"))
              }
            },
            CmsPostWriteRequest: {
              type: "object",
              required: ["title", "slug", "content", "status"],
              properties: {
                title: { type: "string" },
                slug: { type: "string" },
                excerpt: { type: "string" },
                content: { type: "string" },
                status: { type: "string", enum: ["draft", "published"] },
                categoryId: { type: "string", nullable: true },
                coverImage: { type: "string", nullable: true },
                authorName: { type: "string" },
                seoTitle: { type: "string" },
                seoDescription: { type: "string" },
                tags: openApiArray({ type: "string" })
              }
            },
            CmsPostUpdateRequest: {
              type: "object",
              properties: {
                title: { type: "string" },
                slug: { type: "string" },
                excerpt: { type: "string" },
                content: { type: "string" },
                status: { type: "string", enum: ["draft", "published"] },
                categoryId: { type: "string", nullable: true },
                coverImage: { type: "string", nullable: true },
                authorName: { type: "string" },
                seoTitle: { type: "string" },
                seoDescription: { type: "string" },
                tags: openApiArray({ type: "string" })
              }
            },
            CmsPostResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                post: openApiRef("BlogPost")
              }
            },
            CmsPostListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                posts: openApiArray(openApiRef("BlogPost"))
              }
            },
            CmsImageUploadRequest: {
              type: "object",
              required: ["image"],
              properties: {
                image: { type: "string", format: "binary" }
              }
            },
            CmsImageUploadResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                url: { type: "string" },
                thumbnailUrl: { type: "string" }
              }
            },
            MediaFile: {
              type: "object",
              properties: {
                name: { type: "string" },
                url: { type: "string" },
                thumbnailUrl: { type: "string" },
                size: { type: "integer", minimum: 0 },
                mtime: { type: "string", format: "date-time" }
              }
            },
            MediaListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                files: openApiArray(openApiRef("MediaFile"))
              }
            },
            Document: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                type: { type: "string" },
                category: { type: "string" },
                status: { type: "string" },
                size: { type: "integer", minimum: 0 },
                url: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" }
              }
            },
            DocumentCreateRequest: {
              type: "object",
              required: ["name", "type"],
              properties: {
                name: { type: "string" },
                type: { type: "string" },
                category: { type: "string" },
                metadata: { type: "object", additionalProperties: true }
              }
            },
            DocumentFileUploadRequest: {
              type: "object",
              required: ["file"],
              properties: {
                file: { type: "string", format: "binary" },
                name: { type: "string" },
                category: { type: "string" },
                tags: { oneOf: [openApiArray({ type: "string" }), { type: "string" }] },
                description: { type: "string", nullable: true },
                year: { type: "string", nullable: true },
                profileId: { type: "string", nullable: true },
                serviceId: { type: "string", nullable: true },
                userServiceId: { type: "string", nullable: true },
                taxReturnId: { type: "string", nullable: true }
              }
            },
            DocumentRegisterRequest: {
              type: "object",
              required: ["name", "url", "category"],
              properties: {
                name: { type: "string" },
                url: { type: "string", format: "uri" },
                category: { type: "string" },
                year: { type: "string", nullable: true },
                description: { type: "string", nullable: true },
                storagePath: { type: "string" },
                profileId: { type: "string", nullable: true },
                serviceId: { type: "string", nullable: true },
                userServiceId: { type: "string", nullable: true },
                taxReturnId: { type: "string", nullable: true },
                size: { type: "integer", minimum: 0 },
                mimeType: { type: "string" }
              }
            },
            DocumentUpdateRequest: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string" },
                category: { type: "string" },
                status: { type: "string" },
                metadata: { type: "object", additionalProperties: true }
              }
            },
            DocumentResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                document: openApiRef("Document")
              }
            },
            DocumentListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                documents: openApiArray(openApiRef("Document")),
                pagination: openApiRef("Pagination")
              }
            },
            DocumentStatsResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                stats: {
                  type: "object",
                  properties: {
                    total: { type: "integer", minimum: 0 },
                    byCategory: { type: "object", additionalProperties: { type: "integer" } },
                    byYear: { type: "object", additionalProperties: { type: "integer" } },
                    totalSize: { type: "integer", minimum: 0 }
                  }
                }
              }
            },
            Report: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string" },
                title: { type: "string" },
                status: { type: "string" },
                downloadUrl: { type: "string" },
                createdAt: { type: "string", format: "date-time" }
              }
            },
            ReportGenerateRequest: {
              type: "object",
              required: ["type"],
              properties: {
                type: { type: "string" },
                format: { type: "string", enum: ["pdf", "excel", "csv"] },
                startDate: { type: "string" },
                endDate: { type: "string" },
                filters: { type: "object", additionalProperties: true }
              }
            },
            ReportResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                report: openApiRef("Report")
              }
            },
            ReportHistoryResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                reports: openApiArray(openApiRef("Report")),
                pagination: openApiRef("Pagination")
              }
            },
            ReportTemplate: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string" },
                icon: { type: "string" },
                color: { type: "string" }
              }
            },
            ReportTemplateListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                templates: openApiArray(openApiRef("ReportTemplate"))
              }
            },
            Team: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                role: { type: "string" },
                membersCount: { type: "integer", minimum: 0 },
                createdAt: { type: "string", format: "date-time" }
              }
            },
            TeamCreateRequest: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string" },
                description: { type: "string" }
              }
            },
            TeamResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                team: openApiRef("Team")
              }
            },
            TeamListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                teams: openApiArray(openApiRef("Team"))
              }
            },
            WorkflowTemplate: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string" },
                steps: { type: "integer", minimum: 0 }
              }
            },
            Workflow: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                status: { type: "string" },
                templateId: { type: "string" },
                isActive: { type: "boolean" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" }
              }
            },
            WorkflowCreateRequest: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string" },
                templateId: { type: "string" },
                config: { type: "object", additionalProperties: true }
              }
            },
            WorkflowUpdateRequest: {
              type: "object",
              properties: {
                name: { type: "string" },
                isActive: { type: "boolean" },
                config: { type: "object", additionalProperties: true }
              }
            },
            WorkflowResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                workflow: openApiRef("Workflow")
              }
            },
            WorkflowListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                workflows: openApiArray(openApiRef("Workflow"))
              }
            },
            WorkflowTemplateListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                templates: openApiArray(openApiRef("WorkflowTemplate"))
              }
            },
            AnalyticsOverviewResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    users: { type: "object", additionalProperties: { type: "number" } },
                    documents: { type: "object", additionalProperties: { type: "number" } },
                    reports: { type: "object", additionalProperties: { type: "number" } },
                    referrals: { type: "object", additionalProperties: { type: "number" } },
                    workflows: { type: "object", additionalProperties: { type: "number" } }
                  }
                }
              }
            },
            AdminStatsResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                stats: { type: "object", additionalProperties: true }
              }
            },
            AdminUserListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                users: openApiArray(openApiRef("User")),
                pagination: openApiRef("Pagination")
              }
            },
            AuditLog: {
              type: "object",
              properties: {
                id: { type: "string" },
                userId: { type: "string" },
                email: { type: "string", format: "email" },
                action: { type: "string" },
                category: { type: "string" },
                status: { type: "string" },
                createdAt: { type: "string", format: "date-time" }
              }
            },
            AuditLogCreateRequest: {
              type: "object",
              required: ["action"],
              properties: {
                action: { type: "string" },
                category: { type: "string" },
                status: { type: "string" },
                metadata: { type: "object", additionalProperties: true }
              }
            },
            AuditLogListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                logs: openApiArray(openApiRef("AuditLog")),
                pagination: openApiRef("Pagination")
              }
            },
            Feedback: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string", enum: ["bug", "feature", "general", "complaint"] },
                category: { type: "string", nullable: true },
                subject: { type: "string" },
                message: { type: "string" },
                rating: { type: "integer", minimum: 1, maximum: 5 },
                email: { type: "string", format: "email" },
                name: { type: "string" },
                status: { type: "string", enum: ["pending", "in-progress", "resolved", "closed"] },
                priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                source: { type: "string" },
                response: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" }
              }
            },
            FeedbackCreateRequest: {
              type: "object",
              required: ["type", "subject", "message"],
              properties: {
                type: { type: "string", enum: ["bug", "feature", "general", "complaint"] },
                category: { type: "string", maxLength: 80 },
                subject: { type: "string", minLength: 5, maxLength: 200 },
                message: { type: "string", minLength: 20, maxLength: 5000 },
                rating: { type: "integer", minimum: 1, maximum: 5 },
                email: { type: "string", format: "email" },
                name: { type: "string", maxLength: 120 },
                userId: { type: "string", maxLength: 120 },
                browserInfo: { type: "object", additionalProperties: true }
              }
            },
            FeedbackCreateResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                feedback: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    status: { type: "string" },
                    priority: { type: "string" },
                    createdAt: { type: "string", format: "date-time" }
                  }
                }
              }
            },
            FeedbackResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                feedback: openApiRef("Feedback")
              }
            },
            FeedbackListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                feedback: openApiArray(openApiRef("Feedback")),
                total: { type: "integer", minimum: 0 },
                page: { type: "integer", minimum: 1 },
                limit: { type: "integer", minimum: 1 }
              }
            },
            FeedbackStatsResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                total: { type: "integer", minimum: 0 },
                byStatus: { type: "object", additionalProperties: { type: "integer" } },
                byType: { type: "object", additionalProperties: { type: "integer" } },
                avgRating: { type: "number" }
              }
            },
            FeedbackUpdateRequest: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["pending", "in-progress", "resolved", "closed"] },
                priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                response: { type: "string", maxLength: 5000 }
              }
            },
            PublicUpdate: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                isActive: { type: "boolean" },
                expiresAt: { type: "string", format: "date-time" },
                createdAt: { type: "string", format: "date-time" }
              }
            },
            PublicUpdateCreateRequest: {
              type: "object",
              required: ["title", "description"],
              properties: {
                title: { type: "string", minLength: 3, maxLength: 200 },
                description: { type: "string", minLength: 1 },
                priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM" },
                isActive: { type: "boolean", default: true },
                expiresAt: { type: "string", format: "date-time" }
              }
            },
            PublicUpdateUpdateRequest: {
              type: "object",
              properties: {
                title: { type: "string", minLength: 3, maxLength: 200 },
                description: { type: "string", minLength: 1 },
                priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                isActive: { type: "boolean" },
                expiresAt: { type: "string", format: "date-time" }
              }
            },
            PublicUpdateResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                update: openApiRef("PublicUpdate")
              }
            },
            PublicUpdateListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                updates: openApiArray(openApiRef("PublicUpdate"))
              }
            },
            Notification: {
              type: "object",
              properties: {
                id: { type: "string" },
                userId: { type: "string" },
                title: { type: "string" },
                message: { type: "string" },
                type: { type: "string", enum: ["info", "success", "warning", "error", "tax_update", "deadline"] },
                category: { type: "string" },
                read: { type: "boolean" },
                actionUrl: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" }
              }
            },
            NotificationListResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                notifications: openApiArray(openApiRef("Notification")),
                unreadCount: { type: "integer", minimum: 0 }
              }
            },
            SystemConfig: {
              type: "object",
              properties: {
                siteName: { type: "string" },
                siteDescription: { type: "string" },
                allowRegistrations: { type: "boolean" },
                maintenanceMode: { type: "boolean" },
                supportEmail: { type: "string", format: "email" },
                tax: { type: "object", additionalProperties: true },
                security: { type: "object", additionalProperties: true }
              }
            },
            SystemConfigResponse: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                config: openApiRef("SystemConfig")
              }
            },
            SystemConfigUpdateRequest: {
              type: "object",
              properties: {
                siteName: { type: "string" },
                siteDescription: { type: "string" },
                allowRegistrations: { type: "boolean" },
                maintenanceMode: { type: "boolean" },
                supportEmail: { type: "string", format: "email" },
                tax: { type: "object", additionalProperties: true },
                security: { type: "object", additionalProperties: true }
              }
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
