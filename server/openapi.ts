type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

const jsonResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "object",
        additionalProperties: true,
      },
    },
  },
});

const operation = (
  summary: string,
  options: {
    tags?: string[];
    auth?: boolean;
    status?: "production" | "mixed" | "demo";
    requestBody?: boolean;
  } = {},
) => ({
  tags: options.tags,
  summary,
  ...(options.status ? { "x-backend-status": options.status } : {}),
  ...(options.auth ? { security: [{ bearerAuth: [] }] } : {}),
  ...(options.requestBody
    ? {
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true },
            },
          },
        },
      }
    : {}),
  responses: {
    "200": jsonResponse("Success"),
    ...(options.auth ? { "401": jsonResponse("Unauthorized") } : {}),
    "429": jsonResponse("Rate limited"),
  },
});

function path(methods: Partial<Record<HttpMethod, ReturnType<typeof operation>>>) {
  return methods;
}

export function buildOpenApiSpec() {
  return {
    openapi: "3.0.0",
    info: {
      title: "MyeCA API",
      version: "1.0.0",
      description: "Mounted API surface for MyeCA.in. Successful response bodies remain endpoint-specific; error responses include success=false, error, and requestId.",
    },
    servers: [{ url: "https://myeca.in" }],
    paths: {
      "/api/health": path({
        get: operation("Health check", { tags: ["platform"], status: "production" }),
      }),
      "/api/errors/log": path({
        post: operation("Accept sanitized client-side error logs", { tags: ["observability"], requestBody: true, status: "production" }),
      }),
      "/api/public/updates/active": path({
        get: operation("List active public updates", { tags: ["public"], status: "production" }),
      }),
      "/api/public/blogs": path({
        get: operation("List published blog posts", { tags: ["public", "blog"], status: "production" }),
      }),
      "/api/public/blogs/{slug}": path({
        get: operation("Get a published blog post", { tags: ["public", "blog"], status: "production" }),
      }),
      "/api/public/blogs/{slug}/related": path({
        get: operation("List related published blog posts", { tags: ["public", "blog"], status: "production" }),
      }),
      "/api/public/categories": path({
        get: operation("List public blog categories", { tags: ["public", "blog"], status: "production" }),
      }),
      "/api/v1/auth/me": path({
        get: operation("Get current user", { tags: ["auth"], auth: true, status: "production" }),
      }),
      "/api/v1/auth/sync": path({
        post: operation("Create or update current user profile", { tags: ["auth"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/v1/auth/logout-event": path({
        post: operation("Record logout or session-expiry event", { tags: ["auth", "audit"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/user/dashboard": path({
        get: operation("Get current user's dashboard summary", { tags: ["user"], auth: true, status: "mixed" }),
      }),
      "/api/profile": path({
        get: operation("Get current user's profile", { tags: ["user"], auth: true, status: "production" }),
        put: operation("Update current user's profile", { tags: ["user"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/user-services": path({
        get: operation("List current user's activated services", { tags: ["user", "services"], auth: true, status: "production" }),
        post: operation("Create a service activation request", { tags: ["user", "services"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/user-services/{id}": path({
        get: operation("Get current user's service case", { tags: ["user", "services"], auth: true, status: "production" }),
        patch: operation("Update current user's editable service metadata", { tags: ["user", "services"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/consultation-requests": path({
        post: operation("Create a consultation callback request", { tags: ["consultation"], requestBody: true, status: "production" }),
      }),
      "/api/payments/request-link": path({
        post: operation("Request a payment link for a user service", { tags: ["payments"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/profiles": path({
        get: operation("List saved profiles", { tags: ["profiles"], auth: true, status: "production" }),
        post: operation("Create a saved profile", { tags: ["profiles"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/profiles/{id}": path({
        patch: operation("Update a saved profile", { tags: ["profiles"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/documents": path({
        get: operation("List current user's documents", { tags: ["documents"], auth: true, status: "production" }),
        post: operation("Create document metadata", { tags: ["documents"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/documents/upload": path({
        post: operation("Upload a private document file", { tags: ["documents"], auth: true, status: "production" }),
      }),
      "/api/documents/register": path({
        post: operation("Register external Vercel Blob document metadata", { tags: ["documents"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/documents/stats/summary": path({
        get: operation("Get document vault summary", { tags: ["documents"], auth: true, status: "production" }),
      }),
      "/api/documents/{id}": path({
        get: operation("Get a document by id", { tags: ["documents"], auth: true, status: "production" }),
        patch: operation("Update document metadata", { tags: ["documents"], auth: true, requestBody: true, status: "production" }),
        delete: operation("Delete a document", { tags: ["documents"], auth: true, status: "production" }),
      }),
      "/api/documents/{id}/download": path({
        get: operation("Download a private document", { tags: ["documents"], auth: true, status: "production" }),
      }),
      "/api/admin/users": path({
        get: operation("List users for admin management", { tags: ["admin"], auth: true, status: "production" }),
      }),
      "/api/admin/users/{id}/role": path({
        patch: operation("Update user role or status", { tags: ["admin"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/admin/users/{id}/assign-ca": path({
        patch: operation("Assign a CA to a user", { tags: ["admin"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/admin/stats": path({
        get: operation("Get admin operational statistics", { tags: ["admin"], auth: true, status: "mixed" }),
      }),
      "/api/admin/feedback": path({
        get: operation("List submitted feedback", { tags: ["admin", "feedback"], auth: true, status: "production" }),
      }),
      "/api/cms/posts": path({
        get: operation("List CMS blog posts", { tags: ["cms"], auth: true, status: "production" }),
        post: operation("Create CMS blog post", { tags: ["cms"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/cms/posts/{id}": path({
        get: operation("Get CMS blog post", { tags: ["cms"], auth: true, status: "production" }),
        put: operation("Update CMS blog post", { tags: ["cms"], auth: true, requestBody: true, status: "production" }),
        delete: operation("Delete CMS blog post", { tags: ["cms"], auth: true, status: "production" }),
      }),
      "/api/cms/upload": path({
        post: operation("Upload CMS media", { tags: ["cms"], auth: true, status: "production" }),
      }),
      "/api/cms/categories": path({
        get: operation("List CMS categories", { tags: ["cms"], auth: true, status: "production" }),
        post: operation("Create CMS category", { tags: ["cms"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/cms/updates": path({
        get: operation("List CMS daily updates", { tags: ["cms"], auth: true, status: "production" }),
        post: operation("Create CMS daily update", { tags: ["cms"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/analytics/overview": path({
        get: operation("Get admin analytics overview", { tags: ["analytics"], auth: true, status: "production" }),
      }),
      "/api/notifications": path({
        get: operation("List notifications", { tags: ["notifications"], auth: true, status: "production" }),
      }),
      "/api/teams": path({
        get: operation("List teams visible to current user", { tags: ["teams"], auth: true, status: "mixed" }),
        post: operation("Create a team", { tags: ["teams"], auth: true, requestBody: true, status: "mixed" }),
      }),
      "/api/workflows": path({
        get: operation("List workflows", { tags: ["workflows"], auth: true, status: "mixed" }),
        post: operation("Create workflow definition", { tags: ["workflows"], auth: true, requestBody: true, status: "mixed" }),
      }),
      "/api/workflows/templates": path({
        get: operation("List static workflow templates", { tags: ["workflows"], auth: true, status: "demo" }),
      }),
      "/api/reports/history": path({
        get: operation("List generated reports", { tags: ["reports"], auth: true, status: "mixed" }),
      }),
      "/api/reports/generate": path({
        post: operation("Generate a report record", { tags: ["reports"], auth: true, requestBody: true, status: "mixed" }),
      }),
      "/api/referrals": path({
        get: operation("List referrals", { tags: ["referrals"], auth: true, status: "mixed" }),
        post: operation("Create referral", { tags: ["referrals"], auth: true, requestBody: true, status: "mixed" }),
      }),
      "/api/audit/logs": path({
        get: operation("List audit logs", { tags: ["audit"], auth: true, status: "production" }),
        post: operation("Create audit log", { tags: ["audit"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/system/config": path({
        get: operation("Get system config", { tags: ["system"], auth: true, status: "production" }),
        put: operation("Update system config", { tags: ["system"], auth: true, requestBody: true, status: "production" }),
      }),
      "/api/ca/clients": path({
        get: operation("List clients assigned to current CA", { tags: ["ca"], auth: true, status: "production" }),
      }),
      "/api/whatsapp/webhook": path({
        post: operation("Receive WhatsApp webhook", { tags: ["webhooks"], status: "production" }),
      }),
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "Supabase access token",
        },
      },
    },
  };
}

