const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export function isLocalRuntime() {
  if (typeof window === "undefined") return true;

  const hostname = window.location.hostname.toLowerCase();
  return LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith(".local");
}

export function shouldLoadProductionTelemetry() {
  return import.meta.env.PROD && !isLocalRuntime();
}

export function allowLocalAuthFallbacks() {
  if (import.meta.env.PROD) return false;
  if (!isLocalRuntime()) return false;

  return import.meta.env.DEV || import.meta.env.VITE_ALLOW_LOCAL_AUTH_FALLBACKS === "true";
}
