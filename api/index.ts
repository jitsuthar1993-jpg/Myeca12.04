import { readFileSync } from "node:fs";
import path from "node:path";
import {
  countCollection,
  listCollection,
  methodAllowed,
  requireApiUser,
  requireTemporaryRole,
  sendJson,
} from "./_test-api.js";
import { adminDb } from "../server/data-admin.js";
import {
  getBootstrapRoleForEmail,
  getProvisionedRoleForEmail,
  syncRoleClaims,
} from "../server/services/user-accounts.js";
import {
  getPublicBlogBySlug,
  listPublicBlogs,
  listPublicCategories,
  requestUrl,
  setPublicCache,
} from "./_public-blog.js";
import { SEO_CONFIG } from "../client/src/config/seo.config.js";
import { getIncomeTaxFormAsset } from "../shared/income-tax-form-assets.js";
import {
  buildRobotsTxt,
  buildSitemapXml,
  getIndexablePublicRoutes,
  routePriority,
  toAbsoluteUrl,
} from "../shared/seo-public.js";

const PUBLIC_CACHE = "public, s-maxage=300, stale-while-revalidate=3600";
const PRIVATE_CACHE = "private, no-cache";

function routeFor(req: any) {
  const url = requestUrl(req);
  const route = url.searchParams.get("route");
  if (route) return { name: route, url };

  const pathname = url.pathname.replace(/\/$/, "") || "/";
  const apiRoutes: Record<string, string> = {
    "/api/health": "health",
    "/api/user/dashboard": "user-dashboard",
    "/api/user/activity": "user-activity",
    "/api/user-services": "user-services",
    "/api/notifications": "notifications",
    "/api/admin/stats": "admin-stats",
    "/api/admin/users": "admin-users",
    "/api/ca/stats": "ca-stats",
    "/api/ca/clients": "ca-clients",
    "/api/cms/posts": "cms-posts",
    "/api/cms/categories": "cms-categories",
    "/api/public/blogs": "public-blogs",
    "/api/public/categories": "public-categories",
    "/api/v1/auth/me": "auth-me",
    "/api/v1/auth/sync": "auth-sync",
    "/api/v1/auth/logout-event": "auth-logout-event",
    "/api/errors/log": "client-error-log",
    "/sitemap.xml": "sitemap",
    "/robots.txt": "robots",
    "/openapi.json": "openapi",
    "/llms.txt": "llms",
    "/llms-full.txt": "llms-full",
  };

  const blogMatch = pathname.match(/^\/api\/public\/blogs\/([^/]+)$/);
  if (blogMatch) {
    url.searchParams.set("slug", decodeURIComponent(blogMatch[1]));
    return { name: "public-blog", url };
  }

  const downloadMatch = pathname.match(/^\/downloads\/income-tax-forms\/([^/]+)$/);
  if (downloadMatch) {
    url.searchParams.set("slug", decodeURIComponent(downloadMatch[1]));
    return { name: "income-tax-form-download", url };
  }

  return { name: apiRoutes[pathname] ?? "not-found", url };
}

function sendText(res: any, status: number, body: string, contentType: string, cacheControl = PUBLIC_CACHE) {
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", cacheControl);
  return res.status(status).send(body);
}

function requestBody(req: any) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function redirectToIncomeTaxForm(req: any, res: any, url: URL) {
  const slug = url.searchParams.get("slug") ?? "";
  const asset = getIncomeTaxFormAsset(slug);
  if (!asset) {
    return sendJson(res, 404, { error: "Income tax form asset not found" });
  }

  const baseUrl = process.env.INCOME_TAX_FORMS_BLOB_BASE_URL?.replace(/\/$/, "");
  const destination = baseUrl
    ? `${baseUrl}/income-tax-forms/${asset.fileName}`
    : asset.officialUrl;

  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
  return res.redirect(302, destination);
}

function sitemapXml() {
  const blogResponse = listPublicBlogs(new URL("https://myeca.in/api/public/blogs?limit=50"));
  const blogRoutes = blogResponse.posts.map((post: any) => `/blog/${post.slug || post.id}`);
  const blogDateMap = new Map(
    blogResponse.posts.map((post: any) => [
      `/blog/${post.slug || post.id}`,
      new Date(post.updatedAt || post.publishedAt || post.createdAt || Date.now()).toISOString().split("T")[0],
    ]),
  );
  const routes = getIndexablePublicRoutes(
    Object.entries(SEO_CONFIG)
      .filter(([, config]) => !config.noindex)
      .map(([route]) => route),
    blogRoutes,
  );

  return buildSitemapXml(routes.map((route) => ({
    loc: toAbsoluteUrl(route),
    lastmod: blogDateMap.get(route) || new Date().toISOString().split("T")[0],
    changefreq: route === "/" ? "daily" : route.startsWith("/blog/") ? "monthly" : "weekly",
    priority: routePriority(route),
  })));
}

function robotsTxt() {
  return buildRobotsTxt();
}

function openApiSpec() {
  return {
    openapi: "3.0.0",
    info: {
      title: "MyeCA API",
      version: "1.0.0",
      description: "Public API for MyeCA.in technical integrations",
    },
    paths: {
      "/api/health": {
        get: {
          summary: "Health Check",
          responses: { "200": { description: "API is healthy" } },
        },
      },
    },
    servers: [{ url: "https://myeca.in" }],
  };
}

function llmsText(full = false) {
  const fileName = full ? "llms-full.txt" : "llms.txt";
  const filePath = path.resolve(process.cwd(), "client", "public", fileName);
  return readFileSync(filePath, "utf8");
}

export default async function handler(req: any, res: any) {
  const { name, url } = routeFor(req);

  if (name === "health") {
    res.setHeader("Cache-Control", "no-store");
    return sendJson(res, 200, { status: "ok" });
  }

  if (name === "client-error-log") {
    res.setHeader("Cache-Control", "no-store");
    return sendJson(res, 200, { status: "logged" });
  }

  if (name === "sitemap") return sendText(res, 200, sitemapXml(), "application/xml", "public, s-maxage=86400");
  if (name === "robots") return sendText(res, 200, robotsTxt(), "text/plain", "public, s-maxage=86400");
  if (name === "openapi") return sendJson(res, 200, openApiSpec());
  if (name === "llms") return sendText(res, 200, llmsText(false), "text/plain", "public, s-maxage=3600");
  if (name === "llms-full") return sendText(res, 200, llmsText(true), "text/plain", "public, s-maxage=3600");
  if (name === "income-tax-form-download") return redirectToIncomeTaxForm(req, res, url);

  if (name === "public-categories") {
    setPublicCache(res);
    return sendJson(res, 200, listPublicCategories());
  }

  if (name === "public-blogs") {
    const slug = url.searchParams.get("slug");
    if (slug) {
      const post = getPublicBlogBySlug(slug);
      if (!post) return sendJson(res, 404, { error: "Blog post not found" });
      setPublicCache(res);
      return sendJson(res, 200, { success: true, post });
    }

    setPublicCache(res);
    return sendJson(res, 200, listPublicBlogs(url));
  }

  if (name === "public-blog") {
    const post = getPublicBlogBySlug(url.searchParams.get("slug") ?? "");
    if (!post) return sendJson(res, 404, { error: "Blog post not found" });
    setPublicCache(res);
    return sendJson(res, 200, { success: true, post });
  }

  res.setHeader("Cache-Control", PRIVATE_CACHE);

  if (name === "auth-me") {
    if (!methodAllowed(req, res, ["GET"])) return;
    const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;
    return sendJson(res, 200, { user });
  }

  if (name === "auth-sync") {
    if (!methodAllowed(req, res, ["POST"])) return;
    const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;

    const body = requestBody(req);
    const userRef = adminDb.collection("users").doc(user.id);
    const role =
      (await getProvisionedRoleForEmail(body.email || user.email)) ??
      user.role ??
      getBootstrapRoleForEmail(body.email || user.email) ??
      "user";
    const updatedUser = {
      ...user,
      email: body.email || user.email || null,
      firstName: body.firstName || user.firstName || "User",
      lastName: body.lastName || user.lastName || "",
      phoneNumber: body.phoneNumber ?? (user as any).phoneNumber ?? null,
      role,
      status: user.status || "active",
      isVerified: (user as any).isVerified ?? true,
      updatedAt: new Date(),
      createdAt: (user as any).createdAt ?? new Date(),
    };

    await userRef.set(updatedUser, { merge: true });
    await syncRoleClaims(user.id, role);
    return sendJson(res, 200, { message: "User synced", user: updatedUser });
  }

  if (name === "auth-logout-event") {
    if (!methodAllowed(req, res, ["POST"])) return;
    const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;
    const body = requestBody(req);
    await adminDb.collection("audit_logs").doc().set({
      userId: user.id,
      email: user.email ?? null,
      action: body.reason === "timeout" ? "logout_timeout" : `logout_${body.reason || "manual"}`,
      category: "authentication",
      status: "success",
      metadata: {
        reason: body.reason || "manual",
        userAgent: req.headers?.["user-agent"] ?? null,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return sendJson(res, 201, { success: true });
  }

  if (!methodAllowed(req, res, ["GET"])) return;

  if (name === "user-dashboard") {
    const user = await requireTemporaryRole(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;

    const [totalReturns, documentsUploaded, services] = await Promise.all([
      countCollection("tax_returns"),
      countCollection("documents"),
      listCollection("user_services", 50),
    ]);

    return sendJson(res, 200, {
      success: true,
      stats: { totalReturns, documentsUploaded, pendingTasks: 0, savedAmount: 0 },
      activeServices: services,
      recentActivity: [],
      taxReturns: [],
    });
  }

  if (name === "user-services") {
    const user = await requireTemporaryRole(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;
    return sendJson(res, 200, await listCollection("user_services", 100));
  }

  if (name === "notifications") {
    const user = await requireTemporaryRole(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;
    return sendJson(res, 200, { success: true, notifications: await listCollection("notifications", 100) });
  }

  if (name === "user-activity") {
    const user = await requireTemporaryRole(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;
    return sendJson(res, 200, {
      success: true,
      data: { activities: await listCollection("activity_logs", 100) },
    });
  }

  if (name === "admin-stats") {
    const user = await requireTemporaryRole(req, res, ["admin"]);
    if (!user) return;

    const [usersTotal, userServicesTotal, taxReturnsTotal] = await Promise.all([
      countCollection("users"),
      countCollection("user_services"),
      countCollection("tax_returns"),
    ]);

    return sendJson(res, 200, {
      success: true,
      data: {
        users: { total: usersTotal, active: usersTotal, inactive: 0, newThisMonth: usersTotal, growthPercent: 0 },
        calculations: { total: 0, thisMonth: 0, saved: 0, trend: "stable" },
        revenue: { total: 0, thisMonth: 0, growthPercent: 0 },
        services: { total: userServicesTotal, active: taxReturnsTotal, popular: [] },
        systemHealth: { status: "healthy", database: "connected", uptime: 0, lastCheck: new Date().toISOString() },
        recentActivity: [],
        workList: [],
      },
    });
  }

  if (name === "admin-users") {
    const user = await requireTemporaryRole(req, res, ["admin"]);
    if (!user) return;

    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "10", 10) || 10));
    const search = (url.searchParams.get("search") ?? "").trim().toLowerCase();

    let users = await listCollection("users", 1000);
    if (search) {
      users = users.filter((entry: any) =>
        [entry.email, entry.firstName, entry.lastName].some((value) =>
          String(value ?? "").toLowerCase().includes(search),
        ),
      );
    }

    const total = users.length;
    const start = (page - 1) * limit;
    return sendJson(res, 200, {
      success: true,
      data: {
        users: users.slice(start, start + limit),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  }

  if (name === "ca-stats") {
    const user = await requireTemporaryRole(req, res, ["admin", "ca"]);
    if (!user) return;
    return sendJson(res, 200, {
      success: true,
      data: { totalClients: 0, totalFilings: 0, pendingFilings: 0, completedFilings: 0 },
    });
  }

  if (name === "ca-clients") {
    const user = await requireTemporaryRole(req, res, ["admin", "ca"]);
    if (!user) return;
    return sendJson(res, 200, { success: true, data: { clients: [], total: 0 } });
  }

  if (name === "cms-posts") {
    const user = await requireTemporaryRole(req, res, ["admin", "team_member"]);
    if (!user) return;
    return sendJson(res, 200, { success: true, posts: await listCollection("blog_posts", 1000) });
  }

  if (name === "cms-categories") {
    const user = await requireTemporaryRole(req, res, ["admin", "team_member"]);
    if (!user) return;
    return sendJson(res, 200, { success: true, categories: await listCollection("categories", 1000) });
  }

  return sendJson(res, 404, { error: "API route not found" });
}
