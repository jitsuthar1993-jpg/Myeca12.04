import { route, type ClientRouteDefinition } from "../route-types";

export const ADMIN_ROUTES = [
  route("/admin/blog-management", "admin", "client/src/pages/admin/blog.page.tsx"),
  route("/admin/categories-management", "admin", "client/src/pages/admin/categories-management.page.tsx"),
  route("/admin/updates-management", "admin", "client/src/pages/admin/updates-management.page.tsx"),
  route("/admin/media-management", "admin", "client/src/pages/admin/media-management.page.tsx"),
  route("/admin/dashboard", "admin", "client/src/pages/admin/index.page.tsx"),
  route("/admin", "admin", "client/src/pages/admin/index.page.tsx"),
  route("/admin/services", "admin", "client/src/pages/admin/services.page.tsx"),
  route("/admin/blog", "admin", "client/src/pages/admin/blog.page.tsx"),
  route("/admin/analytics/overview", "admin", "client/src/pages/admin/analytics/overview.page.tsx"),
  route("/admin/analytics", "admin", "client/src/pages/admin/analytics/index.page.tsx"),
  route("/admin/users", "admin", "client/src/pages/admin/users.page.tsx"),
  route("/admin/user-management", "admin", "client/src/pages/admin/user-management.page.tsx"),
  route("/admin/create-admin", "admin", "client/src/pages/admin/create-admin.page.tsx"),
  route("/admin/feedback", "admin", "client/src/pages/admin/feedback-management.page.tsx"),
  route("/admin/requests", "admin", "client/src/pages/admin/requests.page.tsx"),
  route("/admin/settings", "admin", "client/src/pages/admin/settings.page.tsx"),
  route("/admin/audit-logs", "admin", "client/src/pages/admin/audit-logs.page.tsx"),
] as const satisfies readonly ClientRouteDefinition[];
