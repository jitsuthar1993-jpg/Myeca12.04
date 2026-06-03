const DEFAULT_PRODUCTION_ORIGINS = ["https://myeca.in", "https://www.myeca.in"] as const;
const LOCAL_ORIGINS: RegExp[] = [/^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/];

function normalizeOrigin(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getAllowedOrigins(env: NodeJS.ProcessEnv = process.env) {
  const configuredOrigins = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((entry) => normalizeOrigin(entry))
    .filter((entry): entry is string => Boolean(entry));

  return [...new Set([...DEFAULT_PRODUCTION_ORIGINS, ...configuredOrigins])];
}

export function isLocalHost(host: string | undefined) {
  const normalizedHost = host?.split(":")[0] || "";
  return normalizedHost === "localhost" || normalizedHost === "127.0.0.1" || normalizedHost === "::1";
}

export function isAllowedOrigin(
  origin: string,
  options: { env?: NodeJS.ProcessEnv; allowLocalOrigins?: boolean } = {},
) {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;

  const allowedOrigins = getAllowedOrigins(options.env);
  if (allowedOrigins.includes(normalizedOrigin)) return true;

  return Boolean(options.allowLocalOrigins && LOCAL_ORIGINS.some((entry) => entry.test(normalizedOrigin)));
}
