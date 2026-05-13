import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { addPerformanceHints } from "./utils/performance-hints";
import { shouldLoadProductionTelemetry } from "./utils/runtime-env";
import "./utils/safe-dom";
import "./index.css";

const loadProductionTelemetry = shouldLoadProductionTelemetry();

const VercelAnalytics = loadProductionTelemetry
  ? lazy(() => import("@vercel/analytics/react").then((mod) => ({ default: mod.Analytics })))
  : null;
const VercelSpeedInsights = loadProductionTelemetry
  ? lazy(() => import("@vercel/speed-insights/react").then((mod) => ({ default: mod.SpeedInsights })))
  : null;

// Initialize performance hints (preconnect, dns-prefetch)
addPerformanceHints();

// PWA Service Worker registration
import { registerServiceWorker, setupInstallPrompt } from "./utils/registerSW";
registerServiceWorker();
setupInstallPrompt();

// Prevent browser from restoring scroll position on refresh/navigation
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Lightweight error logging via sendBeacon (non-blocking)
window.addEventListener('error', (e) => {
  try {
    navigator.sendBeacon?.('/api/errors/log', JSON.stringify({
      kind: 'window_error',
      msg: String(e.message || ''),
      src: String(e.filename || ''),
      line: e.lineno || null,
      ts: Date.now(),
    }));
  } catch {}
});

window.addEventListener('unhandledrejection', (e) => {
  try {
    navigator.sendBeacon?.('/api/errors/log', JSON.stringify({
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
        <App />
        {VercelAnalytics && VercelSpeedInsights && (
          <Suspense fallback={null}>
            <VercelAnalytics />
            <VercelSpeedInsights />
          </Suspense>
        )}
      </ErrorBoundary>,
  );
} else {
  const fallback = document.createElement('div');
  fallback.style.cssText = 'padding:20px;background:white;';
  fallback.textContent = 'App Loading Error: Root element not found';
  document.body.appendChild(fallback);
}
