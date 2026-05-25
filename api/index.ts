import { readFileSync } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import multer from "multer";
import sharp from "sharp";
import { del, get, put } from "@vercel/blob";
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
import { TAX_GUIDES } from "../client/src/data/tax-guides.js";
import { getGeneratedPublicRoutes } from "../client/src/data/missing-pages.js";
import { buildOpenApiSpec } from "../server/openapi.js";
import { getIncomeTaxFormAsset } from "../shared/income-tax-form-assets.js";
import { normalizeAppRole } from "../shared/app-roles.js";
import {
  buildRobotsTxt,
  buildSitemapXml,
  getIndexablePublicRoutes,
  routeChangefreq,
  routePriority,
  toAbsoluteUrl,
} from "../shared/seo-public.js";
import { captureServerException, initServerSentry } from "../server/telemetry/sentry.js";

initServerSentry();
const PUBLIC_CACHE = "public, s-maxage=300, stale-while-revalidate=3600";
const PRIVATE_CACHE = "private, no-cache";
const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, images, Word, and Excel files are allowed."));
    }
  },
});

function ensureRequestId(req: any, res: any) {
  const incoming = String(req.headers?.["x-request-id"] || "");
  const requestId = incoming && incoming.length <= 120 ? incoming : crypto.randomUUID();
  res.locals ??= {};
  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  return requestId;
}

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
    "/api/documents": "documents-list",
    "/api/documents/upload": "documents-upload",
    "/api/documents/stats/summary": "documents-summary",
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

  const documentDownloadMatch = pathname.match(/^\/api\/documents\/([^/]+)\/download$/);
  if (documentDownloadMatch) {
    url.searchParams.set("id", decodeURIComponent(documentDownloadMatch[1]));
    return { name: "documents-download", url };
  }

  const documentMatch = pathname.match(/^\/api\/documents\/([^/]+)$/);
  if (documentMatch) {
    url.searchParams.set("id", decodeURIComponent(documentMatch[1]));
    return { name: "documents-detail", url };
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

function normalizeUserService(id: string, data: Record<string, any>) {
  const metadata = data.metadata || {};
  const assignedCa = metadata.assignedCa || {};

  return {
    id,
    ...data,
    assignedCaId: data.assignedCaId || metadata.assignedCaId || assignedCa.id || null,
    assignedCaName: data.assignedCaName || metadata.assignedCaName || assignedCa.name || null,
    assignedCaEmail: data.assignedCaEmail || metadata.assignedCaEmail || assignedCa.email || null,
  };
}

function isPendingStatus(status: unknown) {
  const normalized = String(status || "").toLowerCase();
  return ["draft", "pending", "in_progress", "link_requested", "requested", "new"].includes(normalized);
}

function asTime(value: unknown) {
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : null;
  const time = date?.getTime() ?? 0;
  return Number.isNaN(time) ? 0 : time;
}

function serializeDocument(docId: string, data: Record<string, any>) {
  return {
    id: docId,
    userId: data.userId,
    fileName: data.fileName ?? null,
    originalName: data.originalName ?? data.name ?? "document",
    name: data.name,
    mimeType: data.mimeType,
    size: data.size ?? 0,
    category: data.category,
    tags: data.tags ?? [],
    description: data.description ?? null,
    year: data.year ?? null,
    status: data.status,
    version: data.version ?? 1,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    isExternal: Boolean(data.isExternal),
    downloadPath: `/api/documents/${docId}/download`,
  };
}

function safePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 160);
}

function runMiddleware(req: any, res: any, middleware: any) {
  return new Promise<void>((resolve, reject) => {
    middleware(req, res, (result: any) => {
      if (result instanceof Error) {
        reject(result);
        return;
      }
      resolve();
    });
  });
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
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

export function buildApiSitemapXml() {
  const blogResponse = listPublicBlogs(new URL("https://myeca.in/api/public/blogs?limit=500"));
  const blogRoutes = blogResponse.posts.map((post: any) => `/blog/${post.slug || post.id}`);
  const blogDateMap = new Map(
    blogResponse.posts.map((post: any) => [
      `/blog/${post.slug || post.id}`,
      new Date(post.updatedAt || post.publishedAt || post.createdAt || Date.now()).toISOString().split("T")[0],
    ]),
  );
  const guideRoutes = TAX_GUIDES.map((guide) => `/learn/guide/${guide.slug}`);
  const routes = getIndexablePublicRoutes(
    [
      ...Object.entries(SEO_CONFIG)
        .filter(([, config]) => !config.noindex)
        .map(([route]) => route),
      ...getGeneratedPublicRoutes(),
    ],
    [...blogRoutes, ...guideRoutes],
  );

  return buildSitemapXml(routes.map((route) => ({
    loc: toAbsoluteUrl(route),
    lastmod: blogDateMap.get(route) || new Date().toISOString().split("T")[0],
    changefreq: routeChangefreq(route),
    priority: routePriority(route),
  })));
}

function robotsTxt() {
  return buildRobotsTxt();
}

function llmsText(full = false) {
  const fileName = full ? "llms-full.txt" : "llms.txt";
  const filePath = path.resolve(process.cwd(), "client", "public", fileName);
  return readFileSync(filePath, "utf8");
}

async function handleRequest(req: any, res: any) {
  ensureRequestId(req, res);
  const { name, url } = routeFor(req);
  res.setHeader("X-Robots-Tag", name === "sitemap" || name === "robots" ? "index, follow" : "noindex, nofollow");

  if (name === "health") {
    res.setHeader("Cache-Control", "no-store");
    return sendJson(res, 200, { status: "ok" });
  }

  if (name === "client-error-log") {
    res.setHeader("Cache-Control", "no-store");
    return sendJson(res, 200, { status: "logged" });
  }

  if (name === "sitemap") return sendText(res, 200, buildApiSitemapXml(), "application/xml", "public, s-maxage=86400");
  if (name === "robots") return sendText(res, 200, robotsTxt(), "text/plain", "public, s-maxage=86400");
  if (name === "openapi") return sendJson(res, 200, buildOpenApiSpec());
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
      normalizeAppRole(user.role ?? getBootstrapRoleForEmail(body.email || user.email) ?? "user");
    const updatedUser = {
      ...user,
      email: body.email || user.email || null,
      firstName: body.firstName || user.firstName || "User",
      lastName: body.lastName || user.lastName || "",
      phoneNumber: body.phoneNumber?.trim?.() || (user as any).phoneNumber || null,
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

  if (name === "documents-upload") {
    if (!methodAllowed(req, res, ["POST"])) return;
    const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;

    try {
      await runMiddleware(req, res, documentUpload.single("file"));
      const file = (req as any).file;
      if (!file) return sendJson(res, 400, { error: "No file uploaded" });

      let tags: string[] = [];
      if (req.body?.tags) {
        try {
          tags = typeof req.body.tags === "string" ? JSON.parse(req.body.tags) : req.body.tags;
        } catch {
          tags = [];
        }
      }

      let fileBuffer = file.buffer;
      let finalSize = file.size;
      let mimeType = file.mimetype;

      if (file.mimetype.startsWith("image/")) {
        fileBuffer = await sharp(file.buffer)
          .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        finalSize = fileBuffer.length;
        mimeType = "image/jpeg";
      }

      const docRef = adminDb.collection("documents").doc();
      const fileName = `${Date.now()}-${safePathSegment(file.originalname || "document")}`;
      const pathname = `documents/${user.id}/${docRef.id}/${fileName}`;
      const blob = await put(pathname, fileBuffer, {
        access: "private",
        contentType: mimeType,
      });

      const newDoc = {
        userId: user.id,
        fileName,
        originalName: file.originalname,
        mimeType,
        size: finalSize,
        uploadPath: blob.pathname,
        blobUrl: blob.url,
        downloadUrl: blob.downloadUrl,
        name: String(req.body?.name || file.originalname || "document").slice(0, 255),
        category: String(req.body?.category || "other"),
        tags: Array.isArray(tags) ? tags : [],
        description: req.body?.description || null,
        year: req.body?.year || null,
        status: "active",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await docRef.set(newDoc);
      return sendJson(res, 200, { success: true, document: serializeDocument(docRef.id, newDoc) });
    } catch (error: any) {
      console.error("[DOCUMENT_UPLOAD]", error);
      return sendJson(res, 500, { error: error.message || "Failed to upload document" });
    }
  }

  if (name === "documents-list") {
    if (!methodAllowed(req, res, ["GET"])) return;
    const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;

    const category = url.searchParams.get("category");
    const year = url.searchParams.get("year");
    const search = url.searchParams.get("search")?.toLowerCase();
    let query: any = adminDb.collection("documents").where("userId", "==", user.id).where("status", "==", "active");
    if (category && category !== "all") query = query.where("category", "==", category);
    if (year && year !== "all") query = query.where("year", "==", year);

    const snapshot = await query.get();
    let documents = snapshot.docs.map((doc: any) => serializeDocument(doc.id, doc.data()));
    if (search) {
      documents = documents.filter((doc: any) =>
        [doc.name, doc.description, doc.originalName].some((value) => String(value ?? "").toLowerCase().includes(search)),
      );
    }

    return sendJson(res, 200, { success: true, documents, total: documents.length });
  }

  if (name === "documents-summary") {
    if (!methodAllowed(req, res, ["GET"])) return;
    const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;

    const snapshot = await adminDb.collection("documents").where("userId", "==", user.id).where("status", "==", "active").get();
    const stats = { total: snapshot.size, byCategory: {} as Record<string, number>, byYear: {} as Record<string, number>, totalSize: 0 };
    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      stats.byCategory[data.category] = (stats.byCategory[data.category] || 0) + 1;
      if (data.year) stats.byYear[data.year] = (stats.byYear[data.year] || 0) + 1;
      stats.totalSize += data.size || 0;
    });

    return sendJson(res, 200, { success: true, stats });
  }

  if (name === "documents-download") {
    if (!methodAllowed(req, res, ["GET"])) return;
    const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;

    const docId = url.searchParams.get("id") || "";
    const doc = await adminDb.collection("documents").doc(docId).get();
    if (!doc.exists || doc.data()?.userId !== user.id) {
      return sendJson(res, 404, { error: "Document not found" });
    }

    const documentData = doc.data() as Record<string, any>;
    const blobUrl = documentData.blobUrl || documentData.url;
    if (!blobUrl) return sendJson(res, 404, { error: "Document file not found" });

    const blob = await get(blobUrl, { access: "private" });
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return sendJson(res, 404, { error: "Document file not found" });
    }

    const file = await streamToBuffer(blob.stream);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(documentData.originalName || documentData.name || "document")}"`);
    res.setHeader("Content-Type", documentData.mimeType || "application/octet-stream");
    return res.status(200).send(file);
  }

  if (name === "documents-detail") {
    if (!methodAllowed(req, res, ["GET", "PATCH", "DELETE"])) return;
    const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;

    const docId = url.searchParams.get("id") || "";
    const docRef = adminDb.collection("documents").doc(docId);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.userId !== user.id) {
      return sendJson(res, 404, { error: "Document not found" });
    }

    if (req.method === "DELETE") {
      const documentData = doc.data() as Record<string, any>;
      if (documentData.blobUrl || documentData.url) {
        await del(documentData.blobUrl || documentData.url).catch((error) => console.warn("[BLOB] Failed to delete blob:", error));
      }
      await docRef.update({ status: "deleted", deletedAt: new Date(), updatedAt: new Date() });
      return sendJson(res, 200, { success: true, message: "Document deleted successfully" });
    }

    if (req.method === "PATCH") {
      const body = requestBody(req);
      const updateData = {
        ...(body.name ? { name: String(body.name).slice(0, 255) } : {}),
        ...(body.category ? { category: String(body.category) } : {}),
        ...(Array.isArray(body.tags) ? { tags: body.tags } : {}),
        ...(body.description !== undefined ? { description: body.description || null } : {}),
        ...(body.year !== undefined ? { year: body.year || null } : {}),
        updatedAt: new Date(),
      };
      await docRef.update(updateData);
      return sendJson(res, 200, {
        success: true,
        document: serializeDocument(docId, { ...(doc.data() as Record<string, any>), ...updateData }),
      });
    }

    return sendJson(res, 200, { success: true, document: serializeDocument(doc.id, doc.data() as Record<string, any>) });
  }

  if (name === "user-dashboard") {
    if (!methodAllowed(req, res, ["GET"])) return;
    const user = await requireTemporaryRole(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;

    const [returnsSnapshot, docsSnapshot, servicesSnapshot] = await Promise.all([
      adminDb.collection("tax_returns").where("userId", "==", user.id).get(),
      adminDb.collection("documents").where("userId", "==", user.id).where("status", "==", "active").get(),
      adminDb.collection("user_services").where("userId", "==", user.id).get(),
    ]);
    const services = servicesSnapshot.docs.map((doc: any) => normalizeUserService(doc.id, doc.data()));
    const returns = returnsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    const pendingTasks =
      services.filter((service: any) => isPendingStatus(service.status) || isPendingStatus(service.paymentStatus)).length +
      returns.filter((entry: any) => isPendingStatus(entry.status)).length;
    const recentActivity = [
      ...services.map((service: any) => ({
        id: `service-${service.id}`,
        action: `Service ${service.serviceTitle || service.serviceId || "request"} is ${service.status || "pending"}`,
        timestamp: service.updatedAt || service.createdAt || null,
        type: "service",
      })),
      ...returns.map((entry: any) => ({
        id: `return-${entry.id}`,
        action: `Tax return ${entry.status || "updated"}`,
        timestamp: entry.updatedAt || entry.createdAt || null,
        type: "tax_return",
      })),
    ]
      .filter((entry) => entry.timestamp)
      .sort((a, b) => asTime(b.timestamp) - asTime(a.timestamp))
      .slice(0, 5);

    return sendJson(res, 200, {
      success: true,
      stats: { totalReturns: returnsSnapshot.size, documentsUploaded: docsSnapshot.size, pendingTasks, savedAmount: 0 },
      activeServices: services,
      recentActivity,
      taxReturns: returns.slice(0, 5),
    });
  }

  if (name === "user-services") {
    if (!methodAllowed(req, res, ["GET", "POST"])) return;
    const user = await requireTemporaryRole(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;

    if (req.method === "POST") {
      const body = requestBody(req);
      if (!body.serviceId || !body.serviceTitle || !body.serviceCategory) {
        return sendJson(res, 400, { error: "serviceId, serviceTitle, and serviceCategory are required" });
      }

      const newService = {
        userId: user.id,
        serviceId: String(body.serviceId),
        serviceTitle: String(body.serviceTitle),
        serviceCategory: String(body.serviceCategory),
        paymentAmount: body.paymentAmount ?? null,
        paymentStatus: body.paymentStatus || null,
        status: body.status || "pending",
        metadata: body.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const docRef = await adminDb.collection("user_services").add(newService);
      return sendJson(res, 200, { success: true, message: "Service request created", id: docRef.id });
    }

    const snapshot = await adminDb.collection("user_services").where("userId", "==", user.id).get();
    return sendJson(res, 200, snapshot.docs.map((doc: any) => normalizeUserService(doc.id, doc.data())));
  }

  if (!methodAllowed(req, res, ["GET"])) return;

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

export default async function handler(req: any, res: any) {
  try {
    return await handleRequest(req, res);
  } catch (error) {
    captureServerException(error, {
      method: req.method,
      path: requestUrl(req).pathname,
      requestId: res.locals?.requestId,
    });

    if (res.headersSent) {
      throw error;
    }

    res.setHeader("Cache-Control", PRIVATE_CACHE);
    return sendJson(res, 500, {
      error: "Internal server error",
      requestId: res.locals?.requestId,
    });
  }
}
