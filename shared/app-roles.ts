export const APP_ROLES = ["admin", "team_member", "ca", "user"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const PRIVILEGED_APP_ROLES = ["admin", "team_member", "ca"] as const;
export type PrivilegedAppRole = (typeof PRIVILEGED_APP_ROLES)[number];

export const DEFAULT_APP_ROLE: AppRole = "user";

export const APP_ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  team_member: "Team Member",
  ca: "CA Expert",
  user: "User",
};

export const APP_ROLE_HOME: Record<AppRole, string> = {
  admin: "/admin/dashboard",
  team_member: "/team/dashboard",
  ca: "/ca/dashboard",
  user: "/dashboard",
};

const TEAM_MEMBER_ADMIN_PATHS = [
  "/admin/blog-management",
  "/admin/categories-management",
  "/admin/updates-management",
  "/admin/media-management",
];

export function isAppRole(role: unknown): role is AppRole {
  return typeof role === "string" && (APP_ROLES as readonly string[]).includes(role);
}

export function isPrivilegedAppRole(role: unknown): role is PrivilegedAppRole {
  return typeof role === "string" && (PRIVILEGED_APP_ROLES as readonly string[]).includes(role);
}

export function normalizeAppRole(role: unknown): AppRole {
  return isAppRole(role) ? role : DEFAULT_APP_ROLE;
}

export function getRoleHome(role: unknown): string {
  return APP_ROLE_HOME[normalizeAppRole(role)];
}

export function getRoleLabel(role: unknown): string {
  return APP_ROLE_LABELS[normalizeAppRole(role)];
}

export function isRoleAllowedPath(role: unknown, path: string) {
  const normalizedRole = normalizeAppRole(role);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const isAdminPath = normalizedPath === "/admin" || normalizedPath.startsWith("/admin/");
  const isCaPath = normalizedPath === "/ca" || normalizedPath.startsWith("/ca/");
  const isTeamPath = normalizedPath === "/team" || normalizedPath.startsWith("/team/");

  if (normalizedRole === "admin") return true;
  if (normalizedRole === "ca") return !isAdminPath && !isTeamPath;
  if (normalizedRole === "team_member") {
    return (
      !isCaPath &&
      (!isAdminPath || TEAM_MEMBER_ADMIN_PATHS.some((prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)))
    );
  }

  return !isAdminPath && !isCaPath && !isTeamPath;
}
