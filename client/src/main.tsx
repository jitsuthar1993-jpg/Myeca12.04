import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { RouteProgressOverlay, RouteTransitionProvider } from "./components/routing/route-transition";
import { addPerformanceHints } from "./utils/performance-hints";
import { recoverFromStaleChunk } from "./utils/chunk-recovery";
import { lazyWithRetry } from "./utils/lazy-with-retry";
import { shouldLoadProductionTelemetry } from "./utils/runtime-env";
import { installApiBaseUrlFetch, resolveApiUrl } from "./lib/api-base-url";
import { hasBrowserTelemetryConfig, hasSentryTelemetryConfig } from "./telemetry/config";
import "./utils/safe-dom";
import "./index.css";

const hasBuildTimeBrowserTelemetryConfig = hasBrowserTelemetryConfig;
const loadClientSentry = import.meta.env.VITE_SENTRY_DSN ? () => import("./telemetry/sentry.client") : null;
const loadProductionTelemetry = hasBuildTimeBrowserTelemetryConfig && shouldLoadProductionTelemetry();

installApiBaseUrlFetch();
if (loadClientSentry && hasSentryTelemetryConfig && loadProductionTelemetry) {
  void loadClientSentry()
    .then(({ initClientSentry }) => initClientSentry())
    .catch(() => {});
}

const VercelAnalytics = loadProductionTelemetry
  ? lazyWithRetry(() => import("@vercel/analytics/react").then((mod) => ({ default: mod.Analytics })))
  : null;
const VercelSpeedInsights = loadProductionTelemetry
  ? lazyWithRetry(() => import("@vercel/speed-insights/react").then((mod) => ({ default: mod.SpeedInsights })))
  : null;

// Initialize performance hints (preconnect, dns-prefetch)
addPerformanceHints();

// PWA Service Worker registration
import { registerServiceWorker, setupInstallPrompt } from "./utils/registerSW";
registerServiceWorker();
setupInstallPrompt();

// Lightweight error logging via sendBeacon (non-blocking)
window.addEventListener('error', (e) => {
  void recoverFromStaleChunk(e.error || e.message);
  try {
    navigator.sendBeacon?.(String(resolveApiUrl('/api/errors/log')), JSON.stringify({
      kind: 'window_error',
      msg: String(e.message || ''),
      src: String(e.filename || ''),
      line: e.lineno || null,
      ts: Date.now(),
    }));
  } catch {}
});

window.addEventListener('unhandledrejection', (e) => {
  void recoverFromStaleChunk(e.reason);
  try {
    navigator.sendBeacon?.(String(resolveApiUrl('/api/errors/log')), JSON.stringify({
      kind: 'unhandled_rejection',
      reason: String(e.reason || ''),
      ts: Date.now(),
    }));
  } catch {}
});

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
      <ErrorBoundary>
        <RouteTransitionProvider>
          <App />
          <RouteProgressOverlay />
          {VercelAnalytics && VercelSpeedInsights && (
            <Suspense fallback={null}>
              <VercelAnalytics />
              <VercelSpeedInsights />
            </Suspense>
          )}
        </RouteTransitionProvider>
      </ErrorBoundary>,
  );
} else {
  const fallback = document.createElement('div');
  fallback.style.cssText = 'padding:20px;background:white;';
  fallback.textContent = 'App Loading Error: Root element not found';
  document.body.appendChild(fallback);
}
