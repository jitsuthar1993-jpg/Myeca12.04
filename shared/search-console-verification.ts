const GOOGLE_SITE_VERIFICATION_PREFIX = "google-site-verification=";
const VITE_GOOGLE_SITE_VERIFICATION_PLACEHOLDER = "%VITE_GOOGLE_SITE_VERIFICATION%";

export function normalizeGoogleSiteVerificationToken(value: string | null | undefined) {
  return (value ?? "").trim();
}

export function isValidGoogleSiteVerificationToken(value: string | null | undefined) {
  const token = normalizeGoogleSiteVerificationToken(value);

  if (!token) return false;
  if (token === VITE_GOOGLE_SITE_VERIFICATION_PLACEHOLDER) return false;
  if (token.toLowerCase() === "undefined" || token.toLowerCase() === "null") return false;
  if (token.toLowerCase() === "changeme" || token.toLowerCase() === "replace-me") return false;
  if (token.startsWith(GOOGLE_SITE_VERIFICATION_PREFIX)) return false;
  if (token.length < 8) return false;

  return !/[%<>"'=\s]/.test(token);
}

export function parseGoogleSiteVerificationTxtRecord(value: string | null | undefined) {
  const record = normalizeGoogleSiteVerificationToken(value);
  if (!record.startsWith(GOOGLE_SITE_VERIFICATION_PREFIX)) return null;

  const token = record.slice(GOOGLE_SITE_VERIFICATION_PREFIX.length);
  return isValidGoogleSiteVerificationToken(token) ? token : null;
}
