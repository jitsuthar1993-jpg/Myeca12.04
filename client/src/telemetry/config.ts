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
  umamiWebsiteId?: string;
  umamiScriptUrl?: string;
  chatwootBaseUrl?: string;
  chatwootWebsiteToken?: string;
};

const gaMeasurementId = String(import.meta.env.VITE_GA_MEASUREMENT_ID || "").trim() || undefined;
const clarityProjectId = String(import.meta.env.VITE_CLARITY_PROJECT_ID || "").trim() || undefined;
const posthogKey = String(import.meta.env.VITE_POSTHOG_KEY || "").trim() || undefined;
const posthogHost = String(import.meta.env.VITE_POSTHOG_HOST || "").trim() || "https://us.i.posthog.com";
const sentryDsn = String(import.meta.env.VITE_SENTRY_DSN || "").trim() || undefined;
const crispWebsiteId = String(import.meta.env.VITE_CRISP_WEBSITE_ID || "").trim() || undefined;
const umamiWebsiteId = String(import.meta.env.VITE_UMAMI_WEBSITE_ID || "").trim() || undefined;
const umamiScriptUrl = String(import.meta.env.VITE_UMAMI_SCRIPT_URL || "").trim() || undefined;
const chatwootBaseUrl = String(import.meta.env.VITE_CHATWOOT_BASE_URL || "").trim() || undefined;
const chatwootWebsiteToken = String(import.meta.env.VITE_CHATWOOT_WEBSITE_TOKEN || "").trim() || undefined;

export const hasSentryTelemetryConfig = Boolean(sentryDsn);
export const hasPosthogTelemetryConfig = Boolean(posthogKey);
export const hasCrispTelemetryConfig = Boolean(crispWebsiteId);
export const hasUmamiTelemetryConfig = Boolean(umamiWebsiteId && umamiScriptUrl);
export const hasChatwootTelemetryConfig = Boolean(chatwootBaseUrl && chatwootWebsiteToken);
export const hasBrowserTelemetryConfig = Boolean(
  gaMeasurementId ||
    clarityProjectId ||
    posthogKey ||
    sentryDsn ||
    crispWebsiteId ||
    hasUmamiTelemetryConfig ||
    hasChatwootTelemetryConfig,
);

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
    gaMeasurementId,
    clarityProjectId,
    posthogKey,
    posthogHost,
    sentryDsn,
    crispWebsiteId,
    umamiWebsiteId,
    umamiScriptUrl,
    chatwootBaseUrl,
    chatwootWebsiteToken,
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
      config.crispWebsiteId ||
      (config.umamiWebsiteId && config.umamiScriptUrl) ||
      (config.chatwootBaseUrl && config.chatwootWebsiteToken),
  );
}
