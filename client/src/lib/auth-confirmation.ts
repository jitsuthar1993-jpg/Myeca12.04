import { getSafeRedirectPath } from "@/lib/role-redirect";

export const DEFAULT_AUTH_REDIRECT_PATH = "/dashboard";

function stripPrefix(value: string, prefix: string) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

export function getAuthRedirectPath(rawRedirect: string | null | undefined, origin = window.location.origin) {
  return getSafeRedirectPath(rawRedirect ?? null, origin) || DEFAULT_AUTH_REDIRECT_PATH;
}

export function buildSignupConfirmationRedirectUrl(
  rawRedirect: string | null | undefined,
  origin = window.location.origin,
) {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", getAuthRedirectPath(rawRedirect, origin));
  return url.toString();
}

export function buildSignupConfirmationResendOptions(
  rawRedirect: string | null | undefined,
  origin = window.location.origin,
) {
  return {
    emailRedirectTo: buildSignupConfirmationRedirectUrl(rawRedirect, origin),
  };
}

export function getAuthCallbackTarget(search: string, hash = "", origin = window.location.origin) {
  const searchParams = new URLSearchParams(stripPrefix(search, "?"));
  const hashParams = new URLSearchParams(stripPrefix(hash, "#"));
  return getAuthRedirectPath(searchParams.get("next") || hashParams.get("next"), origin);
}

export function getAuthCallbackCode(search: string) {
  return new URLSearchParams(stripPrefix(search, "?")).get("code");
}

export function getAuthCallbackTokens(hash: string) {
  const hashParams = new URLSearchParams(stripPrefix(hash, "#"));
  return {
    accessToken: hashParams.get("access_token"),
    refreshToken: hashParams.get("refresh_token"),
  };
}

export function getAuthCallbackError(search: string, hash = "") {
  const searchParams = new URLSearchParams(stripPrefix(search, "?"));
  const hashParams = new URLSearchParams(stripPrefix(hash, "#"));
  return (
    searchParams.get("error_description") ||
    searchParams.get("error") ||
    hashParams.get("error_description") ||
    hashParams.get("error")
  );
}
