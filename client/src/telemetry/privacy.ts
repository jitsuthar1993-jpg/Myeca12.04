export type TelemetryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | TelemetryValue[]
  | { [key: string]: TelemetryValue };

const SENSITIVE_ROUTE_PREFIXES = [
  "/admin",
  "/ais-viewer",
  "/analytics",
  "/analytics-dashboard",
  "/auth",
  "/bank-analyzer",
  "/business",
  "/ca",
  "/capital-gains-import",
  "/dashboard",
  "/documents",
  "/export",
  "/form16-parser",
  "/integrations",
  "/itr/filing",
  "/payments",
  "/profile",
  "/reports",
  "/settings",
  "/services/activation",
  "/tax-assistant",
  "/team",
  "/teams",
  "/workflows",
];

const BEHAVIOR_REPLAY_ROUTE_PREFIXES = [
  "/",
  "/about",
  "/blog",
  "/calculators",
  "/contact",
  "/expert-consultation",
  "/help",
  "/which-itr-form-to-file",
  "/itr/form-selector",
  "/learn",
  "/pricing",
  "/services",
  "/startup-services",
  "/trust",
];

const SUPPORT_CHAT_ROUTE_PREFIXES = [
  "/",
  "/about",
  "/contact",
  "/expert-consultation",
  "/help",
  "/which-itr-form-to-file",
  "/learn",
  "/pricing",
  "/services",
  "/startup-services",
  "/trust",
];

const SENSITIVE_KEY_PATTERN =
  /(aadhaar|aadhar|account|address|ais|amount|authorization|bank|cookie|deduction|document|email|file|form16|ifsc|income|mobile|otp|pan|password|phone|salary|secret|session|supabase|taxable|tis|token|26as)/i;

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PAN_PATTERN = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi;
const AADHAAR_PATTERN = /\b(?:\d[ -]?){12}\b/g;
const INDIAN_PHONE_PATTERN = /\b(?:\+?91[ -]?)?[6-9]\d{9}\b/g;
const TOKEN_PATTERN = /\b(?:eyJ[a-zA-Z0-9_-]+|sk-[a-zA-Z0-9_-]+|phc_[a-zA-Z0-9_-]+)\b/g;

function matchesRoute(path: string, prefix: string) {
  if (prefix === "/") return path === "/";
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function normalizeTelemetryPath(input = "/") {
  const raw = String(input || "/");
  const pathOnly = raw.replace(/^https?:\/\/[^/]+/i, "").split(/[?#]/)[0] || "/";
  const normalized = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return normalized.replace(/\/+$/, "") || "/";
}

export function isSensitiveTelemetryRoute(path: string) {
  const normalized = normalizeTelemetryPath(path);
  return SENSITIVE_ROUTE_PREFIXES.some((prefix) => matchesRoute(normalized, prefix));
}

export function allowsBehaviorReplay(path: string) {
  const normalized = normalizeTelemetryPath(path);
  if (isSensitiveTelemetryRoute(normalized)) return false;
  return BEHAVIOR_REPLAY_ROUTE_PREFIXES.some((prefix) => matchesRoute(normalized, prefix));
}

export function allowsSupportChat(path: string) {
  const normalized = normalizeTelemetryPath(path);
  if (isSensitiveTelemetryRoute(normalized)) return false;
  return SUPPORT_CHAT_ROUTE_PREFIXES.some((prefix) => matchesRoute(normalized, prefix));
}

export function shouldMaskTelemetryRoute(path: string) {
  return isSensitiveTelemetryRoute(path);
}

export function safeTelemetryPath(input = "/") {
  return normalizeTelemetryPath(input);
}

export function safeTelemetryUrl(input = "/") {
  return `https://myeca.in${safeTelemetryPath(input)}`;
}

function redactString(value: string) {
  return value
    .replace(EMAIL_PATTERN, "[redacted-email]")
    .replace(PAN_PATTERN, "[redacted-pan]")
    .replace(AADHAAR_PATTERN, "[redacted-aadhaar]")
    .replace(INDIAN_PHONE_PATTERN, "[redacted-phone]")
    .replace(TOKEN_PATTERN, "[redacted-token]")
    .slice(0, 500);
}

export function scrubTelemetryProperties<T extends TelemetryValue>(value: T, depth = 0): T {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return redactString(value) as T;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (depth >= 5) return "[filtered]" as T;

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((entry) => scrubTelemetryProperties(entry, depth + 1)) as T;
  }

  const scrubbed: Record<string, TelemetryValue> = {};
  for (const [key, entry] of Object.entries(value)) {
    scrubbed[key] = SENSITIVE_KEY_PATTERN.test(key)
      ? "[filtered]"
      : scrubTelemetryProperties(entry as TelemetryValue, depth + 1);
  }

  return scrubbed as T;
}
