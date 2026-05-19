import * as Sentry from "@sentry/react";
import { getBrowserTelemetryConfig } from "@/telemetry/config";
import { safeTelemetryUrl, scrubTelemetryProperties } from "@/telemetry/privacy";
import { shouldLoadProductionTelemetry } from "@/utils/runtime-env";

let initialized = false;

function scrubSentryEvent(event: Sentry.ErrorEvent) {
  if (event.request) {
    event.request.url = event.request.url ? safeTelemetryUrl(event.request.url) : undefined;
    event.request.query_string = undefined;
    event.request.cookies = undefined;
    event.request.data = "[filtered]";
    event.request.headers = scrubTelemetryProperties((event.request.headers || {}) as any) as any;
  }

  event.extra = scrubTelemetryProperties((event.extra || {}) as any) as any;
  event.tags = {
    ...event.tags,
    pii_default: "disabled",
  };

  return event;
}

export function initClientSentry() {
  if (initialized || !shouldLoadProductionTelemetry()) return;

  const config = getBrowserTelemetryConfig();
  if (!config.sentryDsn) return;

  Sentry.init({
    dsn: config.sentryDsn,
    environment: import.meta.env.VITE_VERCEL_ENV || import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE || import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA,
    sendDefaultPii: false,
    tracesSampleRate: 0.05,
    beforeSend: scrubSentryEvent,
  });

  initialized = true;
}

export function captureClientException(error: unknown, extra?: Record<string, unknown>) {
  if (!initialized) return;

  Sentry.captureException(error, {
    extra: scrubTelemetryProperties((extra || {}) as any) as any,
  });
}
