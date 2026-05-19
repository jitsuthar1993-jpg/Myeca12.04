import type { Express } from "express";
import * as Sentry from "@sentry/node";

let initialized = false;

const SENSITIVE_KEY_PATTERN =
  /(aadhaar|aadhar|authorization|cookie|email|otp|pan|password|phone|secret|session|supabase|token)/i;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PAN_PATTERN = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi;
const AADHAAR_PATTERN = /\b(?:\d[ -]?){12}\b/g;
const PHONE_PATTERN = /\b(?:\+?91[ -]?)?[6-9]\d{9}\b/g;
const TOKEN_PATTERN = /\b(?:eyJ[a-zA-Z0-9_-]+|sk-[a-zA-Z0-9_-]+|phc_[a-zA-Z0-9_-]+)\b/g;

function isEnabled() {
  return process.env.NODE_ENV === "production" && Boolean(process.env.SENTRY_DSN);
}

function numericRate(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
}

function safeUrl(value: string | undefined) {
  if (!value) return undefined;

  try {
    const parsed = new URL(value, process.env.APP_URL || "https://myeca.in");
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return String(value).split(/[?#]/)[0].slice(0, 200);
  }
}

function scrubString(value: string) {
  return value
    .replace(EMAIL_PATTERN, "[redacted-email]")
    .replace(PAN_PATTERN, "[redacted-pan]")
    .replace(AADHAAR_PATTERN, "[redacted-aadhaar]")
    .replace(PHONE_PATTERN, "[redacted-phone]")
    .replace(TOKEN_PATTERN, "[redacted-token]")
    .slice(0, 500);
}

function scrub(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return scrubString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (depth >= 4) return "[filtered]";
  if (Array.isArray(value)) return value.slice(0, 50).map((entry) => scrub(entry, depth + 1));

  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      output[key] = SENSITIVE_KEY_PATTERN.test(key) ? "[filtered]" : scrub(entry, depth + 1);
    }
    return output;
  }

  return "[filtered]";
}

function beforeSend(event: Sentry.ErrorEvent) {
  if (event.request) {
    event.request.url = safeUrl(event.request.url);
    event.request.query_string = undefined;
    event.request.cookies = undefined;
    event.request.data = "[filtered]";
    event.request.headers = scrub(event.request.headers || {}) as any;
  }

  event.extra = scrub(event.extra || {}) as any;
  event.tags = {
    ...event.tags,
    pii_default: "disabled",
  };

  return event;
}

export function initServerSentry() {
  if (initialized || !isEnabled()) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
    sendDefaultPii: false,
    tracesSampleRate: numericRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 0.05),
    beforeSend,
  });

  initialized = true;
}

export function setupServerSentryErrorHandler(app: Express) {
  if (!initialized) return;
  Sentry.setupExpressErrorHandler(app);
}

export function captureServerException(error: unknown, extra?: Record<string, unknown>) {
  if (!initialized) return;
  Sentry.captureException(error, { extra: scrub(extra || {}) as any });
}
