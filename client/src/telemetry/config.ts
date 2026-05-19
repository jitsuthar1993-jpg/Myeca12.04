import { shouldLoadProductionTelemetry } from "@/utils/runtime-env";

export const TELEMETRY_CONSENT_EVENT = "myeca:telemetry-consent";
export const TELEMETRY_CONSENT_KEY = "myeca:telemetry-consent";
export type TelemetryConsent = "granted" | "denied";

export type BrowserTelemetryConfig = {
  gaMeasurementId?: string;
  clarityProjectId?: string;
  posthogKey?: string;
  posthogHost: string;
  sentryDsn?: string;
  crispWebsiteId?: string;
};

function readEnv(key: string) {
  return String(import.meta.env[key] || "").trim() || undefined;
}

export function getTelemetryConsent() {
  if (typeof window === "undefined") return undefined;

  try {
    const value = window.localStorage.getItem(TELEMETRY_CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : undefined;
  } catch {
    return undefined;
  }
}

export function hasTelemetryConsent() {
  return getTelemetryConsent() === "granted";
}

export function setTelemetryConsent(value: TelemetryConsent) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(TELEMETRY_CONSENT_KEY, value);
  } catch {
    return;
  }

  window.dispatchEvent(new CustomEvent(TELEMETRY_CONSENT_EVENT, { detail: value }));
}

export function getBrowserTelemetryConfig(): BrowserTelemetryConfig {
  return {
    gaMeasurementId: readEnv("VITE_GA_MEASUREMENT_ID"),
    clarityProjectId: readEnv("VITE_CLARITY_PROJECT_ID"),
    posthogKey: readEnv("VITE_POSTHOG_KEY"),
    posthogHost: readEnv("VITE_POSTHOG_HOST") || "https://us.i.posthog.com",
    sentryDsn: readEnv("VITE_SENTRY_DSN"),
    crispWebsiteId: readEnv("VITE_CRISP_WEBSITE_ID"),
  };
}

export function shouldEnableTelemetry(
  config: BrowserTelemetryConfig = getBrowserTelemetryConfig(),
  productionTelemetry = shouldLoadProductionTelemetry(),
) {
  return productionTelemetry && Boolean(
    config.gaMeasurementId ||
      config.clarityProjectId ||
      config.posthogKey ||
      config.sentryDsn ||
      config.crispWebsiteId,
  );
}
