import { getRoleHome } from "@shared/app-roles";

export function getSafeRedirectPath(rawRedirectUrl: string | null, origin = window.location.origin) {
  if (!rawRedirectUrl) return null;

  try {
    const parsedUrl = new URL(rawRedirectUrl, origin);
    if (parsedUrl.origin !== origin) return null;

    const target = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    const authPath = parsedUrl.pathname === "/auth/login" || parsedUrl.pathname === "/login" || parsedUrl.pathname === "/auth/register";
    if (authPath) return null;

    return target.startsWith("/") ? target : null;
  } catch {
    return null;
  }
}

export function resolvePostLoginRedirect(role: unknown, _requestedPath: string | null) {
  return getRoleHome(role);
}
