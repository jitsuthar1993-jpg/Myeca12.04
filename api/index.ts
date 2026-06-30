import { existsSync, readFileSync } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import multer from "multer";
import sharp from "sharp";
import { del, get, put } from "@vercel/blob";
import { z } from "zod";
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
import { allServices } from "../client/src/data/all-services.js";
import { TAX_GUIDES } from "../client/src/data/tax-guides.js";
import { getGeneratedPublicRoutes } from "../client/src/data/missing-pages.js";
import { buildOpenApiSpec } from "../server/openapi.js";
import { getIncomeTaxFormAsset } from "../shared/income-tax-form-assets.js";
import { normalizeAppRole } from "../shared/app-roles.js";
import { isAdminCatalogService, serializeAdminCatalogService } from "../shared/admin-service-catalog.js";
import {
  buildRobotsTxt,
  buildSitemapXml,
  getIndexablePublicRoutes,
  routeChangefreq,
  routePriority,
  toAbsoluteUrl,
} from "../shared/seo-public.js";
import {
  indexNowKeyResponse,
  normalizedIndexNowKey,
} from "../shared/indexnow.js";
import {
  ITR_REVIEW_STATUSES,
  buildItrDraftJsonExport,
  buildItrReviewPacket,
  calculateItrTotalDeductions,
  calculateItrTotalIncome,
  calculateItrTotalTaxPaid,
  computeItrTaxLiability,
  getItrDocumentChecklist,
  normalizeItrDraft,
  recommendItrForm,
  type ItrFilingDraft,
} from "../shared/itr-filing.js";
import {
  buildNoindexNotFoundHtml,
  classifySpaFallbackPath,
  injectNoindexFallbackMeta,
} from "../shared/spa-fallback-policy.js";
import { captureServerException, initServerSentry } from "../server/telemetry/sentry.js";
import { decryptPII, encryptPII } from "../server/utils/encryption.js";
import { fileBufferMatchesDeclaredType } from "../server/lib/file-signature.js";

initServerSentry();
const PUBLIC_CACHE = "public, s-maxage=300, stale-while-revalidate=3600";
const PRIVATE_CACHE = "private, no-cache";
const FALLBACK_APP_CACHE = "no-store";
const activationServiceIds = allServices.map((service) => service.id);
let appShellHtmlCache: string | null = null;
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

// Best-effort, per-instance rate limiting for sensitive endpoints. Vercel may run several
// warm instances, so this is not a global guarantee — a KV/Redis-backed limiter (e.g. Upstash)
// is recommended for cross-instance enforcement. This still blunts single-instance brute force.
const RATE_LIMITED_ROUTES: Record<string, { limit: number; windowMs: number }> = {
  "auth-sync": { limit: 30, windowMs: 60_000 },
  "auth-logout-event": { limit: 30, windowMs: 60_000 },
  "documents-upload": { limit: 20, windowMs: 60_000 },
};
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: any) {
  const forwarded = String(req.headers?.["x-forwarded-for"] || "");
  const first = forwarded.split(",")[0]?.trim();
  return first || req.socket?.remoteAddress || "unknown";
}

function checkRateLimit(req: any, bucket: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (rateLimitBuckets.size > 10_000) {
    for (const [key, value] of rateLimitBuckets) {
      if (now > value.resetAt) rateLimitBuckets.delete(key);
    }
  }

  const key = `${bucket}:${clientIp(req)}`;
  const entry = rateLimitBuckets.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

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
    "/api/admin/services": "admin-services",
    "/api/admin/user-services": "admin-user-services",
    "/api/ca/stats": "ca-stats",
    "/api/ca/clients": "ca-clients",
    "/api/cms/posts": "cms-posts",
    "/api/cms/categories": "cms-categories",
    "/api/public/blogs": "public-blogs",
    "/api/public/categories": "public-categories",
    "/api/documents": "documents-list",
    "/api/documents/upload": "documents-upload",
    "/api/documents/stats/summary": "documents-summary",
    "/api/tax-returns": "tax-returns",
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

  const taxReturnActionMatch = pathname.match(/^\/api\/tax-returns\/([^/]+)\/([^/]+)$/);
  if (taxReturnActionMatch) {
    url.searchParams.set("id", decodeURIComponent(taxReturnActionMatch[1]));
    const action = decodeURIComponent(taxReturnActionMatch[2]);
    const taxReturnActionRoutes: Record<string, string> = {
      documents: "tax-return-documents",
      recommendation: "tax-return-recommendation",
      "submit-review": "tax-return-submit-review",
      "review-status": "tax-return-review-status",
      "review-packet": "tax-return-review-packet",
      "export-json": "tax-return-export-json",
    };
    return { name: taxReturnActionRoutes[action] ?? "not-found", url };
  }

  const taxReturnMatch = pathname.match(/^\/api\/tax-returns\/([^/]+)$/);
  if (taxReturnMatch) {
    url.searchParams.set("id", decodeURIComponent(taxReturnMatch[1]));
    return { name: "tax-return-detail", url };
  }

  const adminUserServiceMatch = pathname.match(/^\/api\/admin\/user-services\/([^/]+)$/);
  if (adminUserServiceMatch) {
    url.searchParams.set("id", decodeURIComponent(adminUserServiceMatch[1]));
    return { name: "admin-user-service-detail", url };
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

function appShellHtml() {
  if (appShellHtmlCache) return appShellHtmlCache;

  const candidates = [
    path.resolve(process.cwd(), "dist", "public", "index.html"),
    path.resolve(process.cwd(), "client", "index.html"),
  ];
  const indexPath = candidates.find((candidate) => existsSync(candidate));

  if (!indexPath) {
    throw new Error(`App shell not found in ${candidates.join(", ")}`);
  }

  appShellHtmlCache = readFileSync(indexPath, "utf8");
  return appShellHtmlCache;
}

export function fallbackRequestPath(req: any, url: URL) {
  const originalPathHeader = req.headers?.["x-original-path"] || req.headers?.["x-vercel-original-path"];
  const requestUrlPath = (() => {
    const value = req.url || req.originalUrl || "/";
    try {
      return new URL(String(value), "https://myeca.in").pathname;
    } catch {
      return String(value).split("?")[0] || "/";
    }
  })();
  const value = originalPathHeader || url.searchParams.get("path") || requestUrlPath;
  const pathValue = Array.isArray(value) ? value[0] : String(value);
  return pathValue.startsWith("/") ? pathValue : `/${pathValue}`;
}

function sendAppFallback(req: any, res: any, url: URL) {
  const requestedPath = fallbackRequestPath(req, url);
  const fallback = classifySpaFallbackPath(requestedPath, { activationServiceIds });

  res.setHeader("X-Robots-Tag", fallback.robots);

  if (!fallback.known) {
    return sendText(
      res,
      404,
      buildNoindexNotFoundHtml(fallback.path),
      "text/html; charset=utf-8",
      FALLBACK_APP_CACHE,
    );
  }

  return sendText(
    res,
    200,
    injectNoindexFallbackMeta(appShellHtml(), fallback.path),
    "text/html; charset=utf-8",
    FALLBACK_APP_CACHE,
  );
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
  const date = value instanceof Date
    ? value
    : typeof (value as any)?.toDate === "function"
      ? (value as any).toDate()
      : typeof value === "string"
        ? new Date(value)
        : null;
  const time = date?.getTime() ?? 0;
  return Number.isNaN(time) ? 0 : time;
}

type DashboardNextAction = {
  id: string;
  label: string;
  detail: string;
  href: string;
  source: "reminder" | "payment" | "document" | "ca" | "service" | "filing" | "empty";
  tone: "amber" | "blue" | "emerald" | "slate";
};

function internalActionHref(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.startsWith("/auth/") || trimmed === "/login" || trimmed === "/register") return fallback;
  return trimmed;
}

function dashboardServiceTitle(service: Record<string, any>) {
  return service.serviceTitle || service.serviceId || "Service request";
}

function paymentNeedsAttention(service: Record<string, any>) {
  const serviceStatus = String(service.status || "").toLowerCase();
  if (["completed", "filed", "cancelled", "closed"].includes(serviceStatus)) return false;

  const status = String(service.paymentStatus || "pending").toLowerCase();
  return !["paid", "not_required", "not required", "waived", "completed"].includes(status);
}

function clientResponseNeeded(status: unknown) {
  return ["changes_requested", "client_response_needed", "action_required"].includes(String(status || "").toLowerCase());
}

function buildDashboardNextActions({
  services,
  returns,
  documentsUploaded,
  reminders,
}: {
  services: Array<Record<string, any>>;
  returns: Array<Record<string, any>>;
  documentsUploaded: number;
  reminders: Array<Record<string, any>>;
}): DashboardNextAction[] {
  const actions: DashboardNextAction[] = [];
  const reminder = reminders[0];

  if (reminder) {
    const fallbackHref = reminder.caseId ? `/dashboard/services/${reminder.caseId}` : "/dashboard";
    actions.push({
      id: `reminder-${reminder.id}`,
      label: reminder.title || "Reminder pending",
      detail: reminder.message || "Review the pending reminder in your workspace.",
      href: internalActionHref(reminder.metadata?.actionUrl, fallbackHref),
      source: "reminder",
      tone: reminder.priority === "high" || reminder.priority === "urgent" ? "amber" : "blue",
    });
  }

  const paymentService = services.find(paymentNeedsAttention);
  if (paymentService) {
    actions.push({
      id: `payment-${paymentService.id}`,
      label: "Payment pending",
      detail: `${dashboardServiceTitle(paymentService)} needs payment before the next fulfillment step.`,
      href: "/payments",
      source: "payment",
      tone: "amber",
    });
  }

  const responseService = services.find((service) => clientResponseNeeded(service.status));
  if (responseService) {
    actions.push({
      id: `response-${responseService.id}`,
      label: "CA response needed",
      detail: `${dashboardServiceTitle(responseService)} is waiting for your reply or document update.`,
      href: `/dashboard/services/${responseService.id}`,
      source: "ca",
      tone: "amber",
    });
  }

  const draftReturn = returns.find((entry) => isPendingStatus(entry.status) || entry.status === "changes_requested");
  if (draftReturn) {
    actions.push({
      id: `filing-${draftReturn.id}`,
      label: "Continue ITR draft",
      detail: "Resume the saved return and complete the remaining filing steps.",
      href: `/itr/filing/${draftReturn.id}`,
      source: "filing",
      tone: "blue",
    });
  }

  if (documentsUploaded === 0) {
    actions.push({
      id: "document-upload",
      label: "Upload documents",
      detail: "Add Form 16, AIS, Form 26AS, or other reusable records to your vault.",
      href: "/documents",
      source: "document",
      tone: "blue",
    });
  }

  const activeService = services.find((service) => isPendingStatus(service.status) || clientResponseNeeded(service.status));
  if (activeService) {
    actions.push({
      id: `service-${activeService.id}`,
      label: "Track active case",
      detail: `${dashboardServiceTitle(activeService)} is currently ${activeService.status || "pending"}.`,
      href: `/dashboard/services/${activeService.id}`,
      source: "service",
      tone: "slate",
    });
  }

  if (!actions.length) {
    actions.push({
      id: "workspace-clear",
      label: "Workspace is up to date",
      detail: "No pending payments, reminders, or active filing tasks are waiting right now.",
      href: "/dashboard/services",
      source: "empty",
      tone: "emerald",
    });
  }

  return actions.slice(0, 4);
}

function apiDate(value: unknown) {
  const time = asTime(value);
  return time ? new Date(time).toISOString() : value ?? null;
}

function apiAmount(record: Record<string, any>) {
  const value = record.paymentAmount ?? record.amount ?? record.price ?? record.totalAmount ?? 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const match = String(value).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function apiLimit(value: string | null, fallback = 100) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? Math.min(500, Math.max(1, parsed)) : fallback;
}

function serializeDocument(docId: string, data: Record<string, any>) {
  return {
    id: docId,
    userId: data.userId,
    profileId: data.profileId ?? null,
    taxReturnId: data.taxReturnId ?? null,
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

const createTaxReturnSchema = z.object({
  assessmentYear: z.string().trim().min(1).default("2026-27"),
  profileId: z.string().trim().min(1).nullable().optional(),
  owner: z.enum(["self", "member"]).optional(),
  draft: z.unknown().optional(),
}).superRefine((data, ctx) => {
  if (data.owner === "member" && !data.profileId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["profileId"],
      message: "Select the saved member to file for.",
    });
  }
});

const updateTaxReturnSchema = z.object({
  assessmentYear: z.string().trim().min(1).optional(),
  profileId: z.string().trim().min(1).nullable().optional(),
  draft: z.unknown().optional(),
});

const linkTaxReturnDocumentSchema = z.object({
  documentId: z.string().trim().min(1),
  checklistItemId: z.string().trim().min(1),
});

const reviewStatusSchema = z.object({
  status: z.enum(ITR_REVIEW_STATUSES),
  notes: z.string().trim().max(2000).optional().default(""),
  acknowledgmentNumber: z.string().trim().max(80).optional(),
  refundAmount: z.number().optional().nullable(),
  filedAt: z.string().trim().optional(),
});

const CA_REVIEW_STATUSES = new Set([
  "ca_review",
  "changes_requested",
  "approved_for_filing",
  "filed",
  "e_verified",
  "refund_or_demand_tracking",
]);

const SENSITIVE_TAXPAYER_FIELDS = [
  "pan",
  "aadhaar",
  "bankAccount",
  "bankAccountConfirm",
] as const;

function transformSensitiveTaxpayerFields(
  draftInput: ItrFilingDraft,
  transform: (value?: string | null) => string | null | undefined,
) {
  const draft = normalizeItrDraft(draftInput);
  const taxpayer = { ...draft.taxpayer };

  for (const field of SENSITIVE_TAXPAYER_FIELDS) {
    taxpayer[field] = transform(taxpayer[field]) ?? "";
  }

  return {
    ...draft,
    taxpayer,
  };
}

function secureTaxReturnDraftForStorage(draftInput: ItrFilingDraft) {
  return transformSensitiveTaxpayerFields(draftInput, encryptPII);
}

function decryptTaxReturnDraftForResponse(draftInput: ItrFilingDraft) {
  const rawDraft = draftInput && typeof draftInput === "object"
    ? { ...(draftInput as Record<string, any>) }
    : {};
  const taxpayer = rawDraft.taxpayer && typeof rawDraft.taxpayer === "object"
    ? { ...rawDraft.taxpayer }
    : {};

  for (const field of SENSITIVE_TAXPAYER_FIELDS) {
    taxpayer[field] = decryptPII(taxpayer[field]) ?? "";
  }

  return normalizeItrDraft({
    ...rawDraft,
    taxpayer,
  });
}

function secureReviewPacketForStorage(packet: ReturnType<typeof buildItrReviewPacket>) {
  return {
    ...packet,
    draft: secureTaxReturnDraftForStorage(packet.draft),
  };
}

function decryptReviewPacketForResponse(packet: ReturnType<typeof buildItrReviewPacket>) {
  return {
    ...packet,
    draft: decryptTaxReturnDraftForResponse(packet.draft),
  };
}

function parseStoredTaxReturnDraft(data: Record<string, any>): ItrFilingDraft {
  let parsed: unknown;

  if (data.formData && typeof data.formData === "string") {
    try {
      parsed = JSON.parse(data.formData);
    } catch {
      parsed = {};
    }
  } else if (data.formData && typeof data.formData === "object") {
    parsed = data.formData;
  } else {
    parsed = {};
  }

  return decryptTaxReturnDraftForResponse(parsed as ItrFilingDraft);
}

function buildTaxReturnSummary(draft: ItrFilingDraft) {
  return {
    totalIncome: calculateItrTotalIncome(draft),
    totalDeductions: calculateItrTotalDeductions(draft),
    totalTaxPaid: calculateItrTotalTaxPaid(draft),
    taxLiability: computeItrTaxLiability(draft),
  };
}

function serializeTaxReturn(id: string, data: Record<string, any>) {
  const draft = parseStoredTaxReturnDraft(data);
  const recommendation = data.recommendation ?? recommendItrForm(draft);
  const calculatedTax = data.calculatedTax ?? computeItrTaxLiability(draft);
  const reviewPacket = data.reviewPacket
    ? decryptReviewPacketForResponse(data.reviewPacket)
    : null;

  return {
    id,
    userId: data.userId,
    profileId: data.profileId ?? null,
    assessmentYear: data.assessmentYear ?? draft.assessmentYear,
    itrType: data.itrType ?? recommendation.form,
    status: data.status ?? "draft",
    reviewStatus: data.reviewStatus ?? data.status ?? "draft",
    formData: draft,
    recommendation,
    reviewPacket,
    taxSummary: data.taxSummary ?? buildTaxReturnSummary(draft),
    calculatedTax,
    refundAmount: data.refundAmount ?? null,
    acknowledgmentNumber: data.acknowledgmentNumber ?? null,
    filedAt: data.filedAt ?? null,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

function apiRole(user: any) {
  return normalizeAppRole(user?.role);
}

function apiIsAdmin(user: any) {
  return apiRole(user) === "admin";
}

function apiIsCa(user: any) {
  return apiRole(user) === "ca";
}

async function apiCanAccessUserData(actor: any, targetUserId?: string | null) {
  if (!actor || !targetUserId) return false;
  if (actor.id === targetUserId) return true;
  if (apiIsAdmin(actor)) return true;

  if (apiIsCa(actor)) {
    const targetUser = await adminDb.collection("users").doc(targetUserId).get();
    return targetUser.exists && targetUser.data()?.assignedCaId === actor.id;
  }

  return false;
}

async function profileCanBeLinked(userId: string, profileId?: string | null) {
  if (!profileId) return true;
  const profile = await adminDb.collection("profiles").doc(profileId).get();
  return profile.exists && profile.data()?.userId === userId;
}

const OPEN_TAX_RETURN_STATUSES = new Set(["draft", "changes_requested"]);

function splitTaxpayerFullName(name: unknown) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

function fillEmptyTaxpayerFields(
  taxpayer: ItrFilingDraft["taxpayer"],
  prefill: Partial<Record<string, string>>,
) {
  const next: Record<string, unknown> = { ...taxpayer };
  for (const [field, value] of Object.entries(prefill)) {
    if (!value) continue;
    const current = next[field];
    if (typeof current !== "string" || !current.trim()) {
      next[field] = value;
    }
  }
  return next as ItrFilingDraft["taxpayer"];
}

async function findSelfTaxpayerProfile(userId: string): Promise<Record<string, any> | null> {
  const snapshot = await adminDb.collection("profiles").where("userId", "==", userId).get();
  const profiles: Record<string, any>[] = snapshot.docs.map(
    (doc: any) => ({ ...(doc.data() as Record<string, any>), id: doc.id }),
  );
  return profiles.find((profile) =>
    String(profile.relation ?? "").toLowerCase() === "self" && profile.isActive !== false
  ) ?? null;
}

async function buildTaxReturnOwnerPrefill(
  user: Record<string, any>,
  data: { owner?: "self" | "member"; profileId?: string | null },
): Promise<{ filingOwner: ItrFilingDraft["filingOwner"]; taxpayer: Partial<Record<string, string>> } | null> {
  if (!data.owner) return null;

  if (data.owner === "member" && data.profileId) {
    const profileDoc = await adminDb.collection("profiles").doc(data.profileId).get();
    const profile = profileDoc.exists ? (profileDoc.data() as Record<string, any>) : null;
    if (!profile) return null;
    const { firstName, lastName } = splitTaxpayerFullName(profile.name);
    return {
      filingOwner: {
        mode: "other",
        personId: profileDoc.id,
        relationship: String(profile.relation ?? ""),
        displayName: String(profile.name ?? ""),
      },
      taxpayer: {
        firstName,
        lastName,
        pan: decryptPII(profile.pan) ?? "",
        aadhaar: decryptPII(profile.aadhaar) ?? "",
        dateOfBirth: typeof profile.dateOfBirth === "string" ? profile.dateOfBirth : "",
      },
    };
  }

  const selfProfile = await findSelfTaxpayerProfile(String(user.id));
  return {
    filingOwner: { mode: "self", personId: "", relationship: "", displayName: "" },
    taxpayer: {
      firstName: String(user.firstName ?? ""),
      lastName: String(user.lastName ?? ""),
      email: String(user.email ?? ""),
      mobile: String(user.phoneNumber ?? "").replace(/\D/g, "").slice(-10),
      pan: selfProfile ? decryptPII(selfProfile.pan) ?? "" : "",
      aadhaar: selfProfile ? decryptPII(selfProfile.aadhaar) ?? "" : "",
      dateOfBirth: selfProfile && typeof selfProfile.dateOfBirth === "string" ? selfProfile.dateOfBirth : "",
    },
  };
}

function storedTaxReturnOwnerMode(record: Record<string, any>) {
  try {
    const raw = typeof record.formData === "string" ? JSON.parse(record.formData) : record.formData;
    return raw?.filingOwner?.mode === "other" ? "other" : "self";
  } catch {
    return "self";
  }
}

async function findResumableTaxReturn(
  userId: string,
  assessmentYear: string,
  data: { owner?: "self" | "member"; profileId?: string | null },
) {
  if (!data.owner) return null;
  const snapshot = await adminDb.collection("tax_returns").where("userId", "==", userId).get();
  const records: Array<{ id: string; data: Record<string, any> }> = snapshot.docs.map(
    (doc: any) => ({ id: doc.id, data: doc.data() as Record<string, any> }),
  );
  return records.find(({ data: record }) => {
    if (String(record.assessmentYear ?? "") !== assessmentYear) return false;
    if (!OPEN_TAX_RETURN_STATUSES.has(String(record.status ?? "draft"))) return false;
    if (data.owner === "member") return record.profileId === data.profileId;
    return !record.profileId && storedTaxReturnOwnerMode(record) === "self";
  }) ?? null;
}

async function getOwnedTaxReturn(userId: string, id?: string | null) {
  if (!id) return null;
  const doc = await adminDb.collection("tax_returns").doc(id).get();
  if (!doc.exists || doc.data()?.userId !== userId) return null;
  return doc;
}

async function getReviewAccessibleTaxReturn(user: any, id?: string | null) {
  if (!id) return null;
  const doc = await adminDb.collection("tax_returns").doc(id).get();
  if (!doc.exists) return null;
  return await apiCanAccessUserData(user, doc.data()?.userId) ? doc : null;
}

function taxRouteError(res: any, error: unknown, fallback: string) {
  if (error instanceof z.ZodError) {
    return sendJson(res, 400, { error: error.errors[0]?.message || fallback });
  }

  const status = typeof (error as any)?.status === "number" ? (error as any).status : undefined;
  if (status) {
    return sendJson(res, status, { error: (error as Error).message || fallback });
  }

  console.error("[TAX_RETURNS_API]", error);
  return sendJson(res, 500, { error: fallback });
}

async function handleTaxReturnsApi(name: string, req: any, res: any, url: URL) {
  try {
    if (name === "tax-returns") {
      if (!methodAllowed(req, res, ["GET", "POST"])) return;
      const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
      if (!user) return;

      if (req.method === "POST") {
        const data = createTaxReturnSchema.parse(requestBody(req));
        if (!(await profileCanBeLinked(user.id, data.profileId))) {
          return sendJson(res, 400, { error: "Linked profile does not belong to this user." });
        }

        const resumable = await findResumableTaxReturn(user.id, data.assessmentYear, data);
        if (resumable) {
          const serialized = serializeTaxReturn(resumable.id, resumable.data);
          return sendJson(res, 200, {
            success: true,
            taxReturn: serialized,
            recommendation: serialized.recommendation,
            resumed: true,
          });
        }

        const baseDraft = normalizeItrDraft({
          ...(typeof data.draft === "object" && data.draft ? data.draft : {}),
          assessmentYear: data.assessmentYear,
        });
        const ownerPrefill = await buildTaxReturnOwnerPrefill(user, data);
        const draft = ownerPrefill
          ? normalizeItrDraft({
              ...baseDraft,
              filingOwner: ownerPrefill.filingOwner,
              taxpayer: fillEmptyTaxpayerFields(baseDraft.taxpayer, ownerPrefill.taxpayer),
            })
          : baseDraft;
        const recommendation = recommendItrForm(draft);
        const taxSummary = buildTaxReturnSummary(draft);
        const calculatedTax = computeItrTaxLiability(draft);
        const now = new Date();
        const taxReturnRef = adminDb.collection("tax_returns").doc();
        const taxReturn = {
          id: taxReturnRef.id,
          userId: user.id,
          profileId: data.profileId ?? null,
          assessmentYear: draft.assessmentYear,
          itrType: recommendation.form,
          status: "draft",
          reviewStatus: "draft",
          formData: JSON.stringify(secureTaxReturnDraftForStorage(draft)),
          recommendation,
          documentChecklist: getItrDocumentChecklist(draft),
          taxSummary,
          calculatedTax,
          createdAt: now,
          updatedAt: now,
        };

        await taxReturnRef.set(taxReturn);
        return sendJson(res, 200, {
          success: true,
          taxReturn: serializeTaxReturn(taxReturnRef.id, taxReturn),
          recommendation,
        });
      }

      const snapshot = await adminDb.collection("tax_returns").where("userId", "==", user.id).get();
      const taxReturns = snapshot.docs
        .map((doc: any) => serializeTaxReturn(doc.id, doc.data()))
        .sort((a: any, b: any) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));

      return sendJson(res, 200, { success: true, taxReturns });
    }

    if (name === "tax-return-detail") {
      if (!methodAllowed(req, res, ["GET", "PATCH"])) return;
      const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
      if (!user) return;

      const doc = await getOwnedTaxReturn(user.id, url.searchParams.get("id"));
      if (!doc) return sendJson(res, 404, { error: "Tax return not found" });
      const existing = doc.data() as Record<string, any>;

      if (req.method === "PATCH") {
        const data = updateTaxReturnSchema.parse(requestBody(req));
        if (!(await profileCanBeLinked(existing.userId, data.profileId))) {
          return sendJson(res, 400, { error: "Linked profile does not belong to this user." });
        }

        const existingDraft = parseStoredTaxReturnDraft(existing);
        const draft = data.draft === undefined
          ? normalizeItrDraft({ ...existingDraft, assessmentYear: data.assessmentYear ?? existingDraft.assessmentYear })
          : normalizeItrDraft({
              ...existingDraft,
              ...(typeof data.draft === "object" && data.draft ? data.draft : {}),
              assessmentYear: data.assessmentYear ?? existingDraft.assessmentYear,
            });
        const recommendation = recommendItrForm(draft);
        const taxSummary = buildTaxReturnSummary(draft);
        const calculatedTax = computeItrTaxLiability(draft);
        const updateData = {
          ...(data.profileId !== undefined ? { profileId: data.profileId } : {}),
          assessmentYear: draft.assessmentYear,
          itrType: recommendation.form,
          formData: JSON.stringify(secureTaxReturnDraftForStorage(draft)),
          recommendation,
          documentChecklist: getItrDocumentChecklist(draft),
          taxSummary,
          calculatedTax,
          updatedAt: new Date(),
        };

        await doc.ref?.update(updateData);
        return sendJson(res, 200, {
          success: true,
          taxReturn: serializeTaxReturn(doc.id, { ...existing, ...updateData }),
          recommendation,
        });
      }

      return sendJson(res, 200, { success: true, taxReturn: serializeTaxReturn(doc.id, existing) });
    }

    if (name === "tax-return-documents") {
      if (!methodAllowed(req, res, ["POST"])) return;
      const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
      if (!user) return;

      const taxReturnDoc = await getOwnedTaxReturn(user.id, url.searchParams.get("id"));
      if (!taxReturnDoc) return sendJson(res, 404, { error: "Tax return not found" });

      const { documentId, checklistItemId } = linkTaxReturnDocumentSchema.parse(requestBody(req));
      const documentDoc = await adminDb.collection("documents").doc(documentId).get();
      if (!documentDoc.exists) return sendJson(res, 404, { error: "Document not found" });

      const taxReturn = taxReturnDoc.data() as Record<string, any>;
      const document = documentDoc.data() as Record<string, any>;
      if (document.userId !== taxReturn.userId) {
        return sendJson(res, 403, { error: "Document does not belong to this tax return owner" });
      }

      const existingDraft = parseStoredTaxReturnDraft(taxReturn);
      const draft = normalizeItrDraft({
        ...existingDraft,
        documents: {
          ...existingDraft.documents,
          [checklistItemId]: documentId,
        },
      });
      const recommendation = recommendItrForm(draft);
      const taxSummary = buildTaxReturnSummary(draft);
      const calculatedTax = computeItrTaxLiability(draft);
      const updateData = {
        formData: JSON.stringify(secureTaxReturnDraftForStorage(draft)),
        recommendation,
        itrType: recommendation.form,
        documentChecklist: getItrDocumentChecklist(draft),
        taxSummary,
        calculatedTax,
        updatedAt: new Date(),
      };

      await documentDoc.ref?.update({ taxReturnId: taxReturnDoc.id, updatedAt: new Date() });
      await taxReturnDoc.ref?.update(updateData);
      return sendJson(res, 200, {
        success: true,
        taxReturn: serializeTaxReturn(taxReturnDoc.id, { ...taxReturn, ...updateData }),
        document: {
          id: documentDoc.id,
          name: document.name ?? document.originalName ?? "document",
          taxReturnId: taxReturnDoc.id,
        },
        recommendation,
      });
    }

    if (name === "tax-return-recommendation") {
      if (!methodAllowed(req, res, ["POST"])) return;
      const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
      if (!user) return;

      const doc = await getOwnedTaxReturn(user.id, url.searchParams.get("id"));
      if (!doc) return sendJson(res, 404, { error: "Tax return not found" });

      const draft = parseStoredTaxReturnDraft(doc.data() as Record<string, any>);
      const recommendation = recommendItrForm(draft);
      const calculatedTax = computeItrTaxLiability(draft);
      await doc.ref?.update({
        recommendation,
        itrType: recommendation.form,
        taxSummary: buildTaxReturnSummary(draft),
        calculatedTax,
        updatedAt: new Date(),
      });

      return sendJson(res, 200, { success: true, recommendation, calculatedTax });
    }

    if (name === "tax-return-submit-review") {
      if (!methodAllowed(req, res, ["POST"])) return;
      const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
      if (!user) return;

      const doc = await getOwnedTaxReturn(user.id, url.searchParams.get("id"));
      if (!doc) return sendJson(res, 404, { error: "Tax return not found" });

      const existing = doc.data() as Record<string, any>;
      const draft = parseStoredTaxReturnDraft(existing);
      const recommendation = recommendItrForm(draft);
      const reviewPacket = buildItrReviewPacket(draft, doc.id);
      const taxSummary = buildTaxReturnSummary(draft);
      const calculatedTax = computeItrTaxLiability(draft);
      const updateData = {
        status: "ready_for_review",
        reviewStatus: "ready_for_review",
        itrType: recommendation.form,
        recommendation,
        reviewPacket: secureReviewPacketForStorage(reviewPacket),
        taxSummary,
        calculatedTax,
        updatedAt: new Date(),
      };

      await doc.ref?.update(updateData);
      return sendJson(res, 200, {
        success: true,
        taxReturn: serializeTaxReturn(doc.id, { ...existing, ...updateData }),
        reviewPacket,
      });
    }

    if (name === "tax-return-review-status") {
      if (!methodAllowed(req, res, ["PATCH"])) return;
      const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
      if (!user) return;
      if (!apiIsAdmin(user) && !apiIsCa(user)) {
        return sendJson(res, 403, { error: "Only a CA or admin can update review status" });
      }

      const doc = await getReviewAccessibleTaxReturn(user, url.searchParams.get("id"));
      if (!doc) return sendJson(res, 404, { error: "Tax return not found" });

      const data = reviewStatusSchema.parse(requestBody(req));
      if (!CA_REVIEW_STATUSES.has(data.status)) {
        return sendJson(res, 400, { error: "Use submit-review to move a draft into ready_for_review" });
      }

      const existing = doc.data() as Record<string, any>;
      const now = new Date();
      const statusHistory = Array.isArray(existing.reviewStatusHistory) ? existing.reviewStatusHistory : [];
      const updateData = {
        status: data.status,
        reviewStatus: data.status,
        ...(data.acknowledgmentNumber !== undefined ? { acknowledgmentNumber: data.acknowledgmentNumber } : {}),
        ...(data.refundAmount !== undefined ? { refundAmount: data.refundAmount } : {}),
        ...(data.filedAt !== undefined ? { filedAt: data.filedAt ? new Date(data.filedAt) : null } : {}),
        reviewStatusHistory: [
          ...statusHistory,
          {
            status: data.status,
            notes: data.notes,
            actorId: user.id ?? null,
            actorRole: user.role ?? null,
            createdAt: now,
          },
        ],
        updatedAt: now,
      };

      await doc.ref?.update(updateData);
      return sendJson(res, 200, {
        success: true,
        taxReturn: serializeTaxReturn(doc.id, { ...existing, ...updateData }),
      });
    }

    if (name === "tax-return-review-packet") {
      if (!methodAllowed(req, res, ["GET"])) return;
      const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
      if (!user) return;

      const doc = await getReviewAccessibleTaxReturn(user, url.searchParams.get("id"));
      if (!doc) return sendJson(res, 404, { error: "Tax return not found" });

      const data = doc.data() as Record<string, any>;
      const reviewPacket = data.reviewPacket
        ? decryptReviewPacketForResponse(data.reviewPacket)
        : buildItrReviewPacket(parseStoredTaxReturnDraft(data), doc.id);

      return sendJson(res, 200, { success: true, reviewPacket });
    }

    if (name === "tax-return-export-json") {
      if (!methodAllowed(req, res, ["GET"])) return;
      const user = await requireApiUser(req, res, ["admin", "ca", "team_member", "user"]);
      if (!user) return;

      const doc = await getReviewAccessibleTaxReturn(user, url.searchParams.get("id"));
      if (!doc) return sendJson(res, 404, { error: "Tax return not found" });

      return sendJson(
        res,
        200,
        buildItrDraftJsonExport(parseStoredTaxReturnDraft(doc.data() as Record<string, any>), doc.id),
      );
    }

    return sendJson(res, 404, { error: "API route not found" });
  } catch (error) {
    return taxRouteError(res, error, "Failed to process tax return request");
  }
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
    blogResponse.posts.flatMap((post: any) => {
      const value = post.updatedAt || post.publishedAt || post.createdAt;
      const date = value ? new Date(value) : null;
      return date && !Number.isNaN(date.getTime())
        ? [[`/blog/${post.slug || post.id}`, date.toISOString().split("T")[0]] as const]
        : [];
    }),
  );
  const guideRoutes = TAX_GUIDES.map((guide) => `/learn/guide/${guide.slug}`);
  const guideDateMap = new Map(TAX_GUIDES.map((guide) => [`/learn/guide/${guide.slug}`, guide.lastUpdated]));
  const dateMap = new Map([...blogDateMap, ...guideDateMap]);
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
    lastmod: dateMap.get(route),
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

  const rateLimit = RATE_LIMITED_ROUTES[name];
  if (rateLimit && !checkRateLimit(req, name, rateLimit.limit, rateLimit.windowMs)) {
    res.setHeader("Retry-After", String(Math.ceil(rateLimit.windowMs / 1000)));
    res.setHeader("Cache-Control", "no-store");
    return sendJson(res, 429, { error: "Too many requests, please try again shortly." });
  }

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
  if (name === "indexnow-key") {
    const configuredKey = normalizedIndexNowKey(process.env.INDEXNOW_KEY);
    const requestedKey = normalizedIndexNowKey(url.searchParams.get("key"));
    if (!configuredKey || requestedKey !== configuredKey) {
      return sendText(res, 404, "IndexNow key not found", "text/plain", "no-store");
    }
    return sendText(res, 200, indexNowKeyResponse(configuredKey), "text/plain", "public, s-maxage=300");
  }
  if (name === "openapi") return sendJson(res, 200, buildOpenApiSpec());
  if (name === "llms") return sendText(res, 200, llmsText(false), "text/plain", "public, s-maxage=3600");
  if (name === "llms-full") return sendText(res, 200, llmsText(true), "text/plain", "public, s-maxage=3600");
  if (name === "income-tax-form-download") return redirectToIncomeTaxForm(req, res, url);
  if (name === "app-fallback") return sendAppFallback(req, res, url);

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

  if (name.startsWith("tax-return")) {
    return handleTaxReturnsApi(name, req, res, url);
  }

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
    // SECURITY: derive role and the stored email ONLY from the verified session identity,
    // never from the request body. Trusting body.email here would let any authenticated user
    // escalate to a privileged role by claiming an invited/bootstrap admin/CA email.
    const verifiedEmail = user.email ?? null;
    const role =
      (await getProvisionedRoleForEmail(verifiedEmail)) ??
      normalizeAppRole(user.role ?? getBootstrapRoleForEmail(verifiedEmail) ?? "user");
    const updatedUser = {
      ...user,
      email: verifiedEmail,
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

      // Validate real content against the declared type — multer only checks the client mimetype.
      if (!fileBufferMatchesDeclaredType(file.buffer, file.mimetype)) {
        return sendJson(res, 400, { error: "File content does not match its declared type." });
      }

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
    const taxReturnId = url.searchParams.get("taxReturnId");
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
    if (taxReturnId) {
      documents = documents.filter((doc: any) => doc.taxReturnId === taxReturnId);
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

    const [returnsSnapshot, docsSnapshot, servicesSnapshot, remindersSnapshot] = await Promise.all([
      adminDb.collection("tax_returns").where("userId", "==", user.id).get(),
      adminDb.collection("documents").where("userId", "==", user.id).where("status", "==", "active").get(),
      adminDb.collection("user_services").where("userId", "==", user.id).get(),
      adminDb.collection("reminders").where("targetUserId", "==", user.id).get(),
    ]);
    const services = servicesSnapshot.docs.map((doc: any) => normalizeUserService(doc.id, doc.data()));
    const returns = returnsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    const reminders = remindersSnapshot.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() }))
      .filter((reminder: any) => reminder.status === "pending")
      .sort((a: any, b: any) => asTime(a.dueAt) - asTime(b.dueAt));
    const pendingTasks =
      services.filter((service: any) => isPendingStatus(service.status) || isPendingStatus(service.paymentStatus)).length +
      returns.filter((entry: any) => isPendingStatus(entry.status)).length;
    const nextActions = buildDashboardNextActions({
      services,
      returns,
      documentsUploaded: docsSnapshot.size,
      reminders,
    });
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
      nextActions,
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

  if (name === "admin-services") {
    if (!methodAllowed(req, res, ["GET"])) return;
    const user = await requireTemporaryRole(req, res, ["admin"]);
    if (!user) return;

    const requests = await listCollection("user_services", 1000);
    const bookings = new Map<string, number>();
    requests.forEach((request: any) => {
      const serviceId = String(request.serviceId || "");
      if (serviceId) bookings.set(serviceId, (bookings.get(serviceId) || 0) + 1);
    });

    return sendJson(
      res,
      200,
      allServices
        .filter(isAdminCatalogService)
        .map((service) => serializeAdminCatalogService(service, bookings.get(service.id) || 0)),
    );
  }

  if (name === "admin-user-services") {
    if (!methodAllowed(req, res, ["GET"])) return;
    const user = await requireTemporaryRole(req, res, ["admin"]);
    if (!user) return;

    const status = url.searchParams.get("status");
    const limit = apiLimit(url.searchParams.get("limit"));
    const services = (await listCollection("user_services", 1000))
      .filter((service: any) => !status || status === "all" || service.status === status)
      .sort((a: any, b: any) => asTime(b.createdAt) - asTime(a.createdAt));
    const userIds = Array.from(new Set(services.map((service: any) => service.userId).filter(Boolean))) as string[];
    const userDocs = await Promise.all(userIds.map((id) => adminDb.collection("users").doc(id).get()));
    const users = new Map(userDocs.filter((doc: any) => doc.exists).map((doc: any) => [doc.id, doc.data()]));
    const cases = services.slice(0, limit).map((service: any) => ({
      ...normalizeUserService(service.id, service),
      userName: users.get(service.userId)?.firstName || "Customer",
      userEmail: users.get(service.userId)?.email || null,
      createdAt: apiDate(service.createdAt),
      updatedAt: apiDate(service.updatedAt),
    }));

    return sendJson(res, 200, { success: true, cases, total: services.length });
  }

  if (name === "admin-user-service-detail") {
    if (!methodAllowed(req, res, ["PATCH"])) return;
    const user = await requireTemporaryRole(req, res, ["admin"]);
    if (!user) return;

    const updateSchema = z.object({
      status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
      assignedCaId: z.string().trim().max(128).nullable().optional(),
      adminNote: z.string().trim().max(2000).optional(),
    });
    const parsed = updateSchema.safeParse(requestBody(req));
    if (!parsed.success) return sendJson(res, 400, { error: parsed.error.errors[0]?.message || "Invalid service update" });

    const id = url.searchParams.get("id") || "";
    const ref = adminDb.collection("user_services").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return sendJson(res, 404, { error: "Service case not found" });

    const updates: Record<string, any> = { ...parsed.data, updatedAt: new Date() };
    if (parsed.data.adminNote !== undefined) {
      updates.metadata = { ...(doc.data()?.metadata || {}), adminNote: parsed.data.adminNote };
      delete updates.adminNote;
    }
    await ref.update(updates);
    return sendJson(res, 200, { success: true });
  }

  if (!methodAllowed(req, res, ["GET"])) return;

  if (name === "notifications") {
    const user = await requireTemporaryRole(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;
    // SECURITY: scope to the caller. A global list would leak every user's notifications.
    const snapshot = await adminDb
      .collection("notifications")
      .where("userId", "==", user.id)
      .limit(100)
      .get();
    const notifications = snapshot.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() }))
      .filter((notification: any) => notification.status !== "deleted");
    return sendJson(res, 200, { success: true, notifications });
  }

  if (name === "user-activity") {
    const user = await requireTemporaryRole(req, res, ["admin", "ca", "team_member", "user"]);
    if (!user) return;
    // SECURITY: scope to the caller. A global list would leak every user's activity trail.
    const snapshot = await adminDb
      .collection("activity_logs")
      .where("userId", "==", user.id)
      .limit(100)
      .get();
    const activities = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return sendJson(res, 200, {
      success: true,
      data: { activities },
    });
  }

  if (name === "admin-stats") {
    const user = await requireTemporaryRole(req, res, ["admin"]);
    if (!user) return;

    const [usersTotal, userServicesTotal, taxReturnsTotal, users, userServices, taxReturns] = await Promise.all([
      countCollection("users"),
      countCollection("user_services"),
      countCollection("tax_returns"),
      listCollection("users", 1000),
      listCollection("user_services", 1000),
      listCollection("tax_returns", 1000),
    ]);
    const userMap = new Map<string, any>(
      users.map((entry: any): [string, any] => [entry.id, entry]),
    );
    const pendingServices = userServices.filter((entry: any) => !["completed", "cancelled"].includes(entry.status));
    const pendingTaxReturns = taxReturns.filter((entry: any) => !["filed", "completed"].includes(entry.status));
    const pendingWorkList = [
      ...pendingServices.map((entry: any) => ({
        id: entry.id,
        type: "service",
        title: entry.serviceTitle || entry.serviceName || "Custom Service",
        userId: entry.userId,
        userName: userMap.get(entry.userId)?.firstName || "Unknown",
        assignedCaId: entry.assignedCaId || null,
        assignedCaName: userMap.get(entry.assignedCaId)?.firstName || "Unassigned",
        status: entry.status || "pending",
        price: apiAmount(entry),
        createdAt: apiDate(entry.createdAt),
      })),
      ...pendingTaxReturns.map((entry: any) => ({
        id: entry.id,
        type: "tax_return",
        title: `ITR Filing (${entry.filingType || entry.itrType || "General"})`,
        userId: entry.userId,
        userName: userMap.get(entry.userId)?.firstName || "Unknown",
        assignedCaId: entry.assignedCaId || userMap.get(entry.userId)?.assignedCaId || null,
        assignedCaName: userMap.get(entry.assignedCaId || userMap.get(entry.userId)?.assignedCaId)?.firstName || "Unassigned",
        status: entry.status || "draft",
        price: apiAmount(entry),
        createdAt: apiDate(entry.createdAt),
      })),
    ].sort((a, b) => asTime(b.createdAt) - asTime(a.createdAt));
    const workList = pendingWorkList.slice(0, 20);
    const serviceFrequency = new Map<string, number>();
    userServices.forEach((entry: any) => {
      const title = entry.serviceTitle || entry.serviceName || "Custom Service";
      serviceFrequency.set(title, (serviceFrequency.get(title) || 0) + 1);
    });
    const revenueTotal = userServices.reduce((sum: number, entry: any) => sum + apiAmount(entry), 0);

    return sendJson(res, 200, {
      success: true,
      data: {
        users: {
          total: usersTotal,
          active: users.filter((entry: any) => String(entry.status || "active").toLowerCase() === "active").length,
          inactive: users.filter((entry: any) => String(entry.status || "").toLowerCase() === "inactive").length,
          newThisMonth: users.length,
          growthPercent: 0,
        },
        calculations: {
          total: taxReturnsTotal,
          thisMonth: pendingTaxReturns.length,
          saved: taxReturns.filter((entry: any) => entry.status === "draft").length,
          trend: "stable",
        },
        revenue: { total: revenueTotal, pending: pendingWorkList.reduce((sum, entry) => sum + entry.price, 0), thisMonth: 0, growthPercent: 0 },
        services: {
          total: userServicesTotal,
          active: pendingWorkList.length,
          popular: Array.from(serviceFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => ({ name, count })),
        },
        systemHealth: { status: "healthy", database: "connected", uptime: 0, lastCheck: new Date().toISOString() },
        recentActivity: userServices
          .slice()
          .sort((a: any, b: any) => asTime(b.createdAt) - asTime(a.createdAt))
          .slice(0, 10)
          .map((entry: any) => ({
            id: entry.id,
            action: `Service request created: ${entry.serviceTitle || entry.serviceName || "Custom Service"}`,
            user: userMap.get(entry.userId)?.firstName || "Unknown",
            timestamp: apiDate(entry.createdAt),
            resourceType: "service",
            resourceId: entry.id,
          })),
        workList,
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
