import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { addPerformanceHints } from "./utils/performance-hints";
import "./utils/safe-dom";
import "./index.css";

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
      <Analytics />
      <SpeedInsights />
    </ErrorBoundary>,
  );
} else {
  const fallback = document.createElement('div');
  fallback.style.cssText = 'padding:20px;background:white;';
  fallback.textContent = 'App Loading Error: Root element not found';
  document.body.appendChild(fallback);
}
