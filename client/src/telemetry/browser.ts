import {
  getBrowserTelemetryConfig,
  hasTelemetryConsent,
  shouldEnableTelemetry,
  type BrowserTelemetryConfig,
} from "@/telemetry/config";
import {
  allowsBehaviorReplay,
  allowsSupportChat,
  safeTelemetryPath,
  safeTelemetryUrl,
  scrubTelemetryProperties,
  shouldMaskTelemetryRoute,
  type TelemetryValue,
} from "@/telemetry/privacy";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
    posthog?: {
      capture?: (eventName: string, properties?: Record<string, unknown>) => void;
      startSessionRecording?: () => void;
      stopSessionRecording?: () => void;
      register?: (properties: Record<string, unknown>) => void;
    };
    chatwootSettings?: Record<string, unknown>;
    chatwootSDK?: {
      run?: (options: { websiteToken: string; baseUrl: string }) => void;
    };
    $chatwoot?: {
      toggleBubbleVisibility?: (visibility: "show" | "hide") => void;
    };
  }
}

let gaLoaded = false;
let clarityLoaded = false;
let posthogLoaded = false;
let crispLoaded = false;
let umamiLoaded = false;
let chatwootLoaded = false;
let webVitalsLoaded = false;
let crispClient: any = null;
let lastTrackedPath = "";
const loadPosthogModule = import.meta.env.VITE_POSTHOG_KEY ? () => import("posthog-js") : null;
const loadCrispModule = import.meta.env.VITE_CRISP_WEBSITE_ID ? () => import("crisp-sdk-web") : null;

const EVENT_ALIASES: Record<string, string> = {
  begin_checkout: "checkout_started",
  checkout_start: "checkout_started",
  complete_registration: "signup",
  form_submit: "lead_submit",
  form_submission: "lead_submit",
  generate_lead: "lead_submit",
  registration_complete: "signup",
  service_activation: "service_activation_requested",
  service_request: "service_activation_requested",
  sign_up: "signup",
};

function normalizeEventName(eventName: string) {
  const normalized = eventName.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").slice(0, 80);
  return EVENT_ALIASES[normalized] || normalized;
}

function loadScriptOnce(id: string, src: string, configure?: (script: HTMLScriptElement) => void) {
  const existing = document.getElementById(id);
  if (existing) return existing as HTMLScriptElement;

  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  script.defer = true;
  configure?.(script);
  document.head.appendChild(script);
  return script;
}

function initializeGa(config: BrowserTelemetryConfig) {
  if (gaLoaded || !config.gaMeasurementId) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: any[]) {
    window.dataLayer?.push(args);
  };

  loadScriptOnce("myeca-ga4", `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.gaMeasurementId)}`);
  window.gtag("js", new Date());
  window.gtag("config", config.gaMeasurementId, {
    send_page_view: false,
    anonymize_ip: true,
  });

  gaLoaded = true;
}

function initializeClarity(config: BrowserTelemetryConfig, path: string) {
  if (clarityLoaded || !config.clarityProjectId || !allowsBehaviorReplay(path)) return;

  window.clarity = window.clarity || function clarity(...args: any[]) {
    ((window.clarity as any).q = (window.clarity as any).q || []).push(args);
  };
  window.clarity("consent", true);
  loadScriptOnce("myeca-clarity", `https://www.clarity.ms/tag/${encodeURIComponent(config.clarityProjectId)}`);
  clarityLoaded = true;
}

async function initializePostHog(config: BrowserTelemetryConfig, path: string) {
  if (!loadPosthogModule || posthogLoaded || !config.posthogKey) return;

  const posthogModule = await loadPosthogModule();
  const posthog = posthogModule.default;
  posthog.init(config.posthogKey, {
    api_host: config.posthogHost,
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
    defaults: "2026-01-30",
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-telemetry-mask], [data-clarity-mask='true']",
      blockSelector: "[data-telemetry-block], [data-clarity-mask='true']",
    },
    loaded: (client: any) => {
      window.posthog = client;
      updateTelemetryForRoute(path);
    },
  } as any);

  window.posthog = posthog as any;
  posthogLoaded = true;
}

async function initializeCrisp(config: BrowserTelemetryConfig, path: string) {
  if (
    config.chatwootBaseUrl &&
    config.chatwootWebsiteToken
  ) return;
  if (!loadCrispModule || crispLoaded || !config.crispWebsiteId || !allowsSupportChat(path)) return;

  const { Crisp } = await loadCrispModule();
  Crisp.configure(config.crispWebsiteId, {
    autoload: false,
    safeMode: true,
  });
  Crisp.load();
  Crisp.chat.show();

  crispClient = Crisp;
  crispLoaded = true;
}

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function initializeUmami(config: BrowserTelemetryConfig) {
  if (umamiLoaded || !config.umamiWebsiteId || !config.umamiScriptUrl) return;

  loadScriptOnce("myeca-umami", config.umamiScriptUrl, (script) => {
    script.dataset.websiteId = config.umamiWebsiteId || "";
  });
  umamiLoaded = true;
}

function initializeChatwoot(config: BrowserTelemetryConfig, path: string) {
  if (
    chatwootLoaded ||
    !config.chatwootBaseUrl ||
    !config.chatwootWebsiteToken ||
    !allowsSupportChat(path)
  ) return;

  const baseUrl = normalizeBaseUrl(config.chatwootBaseUrl);
  window.chatwootSettings = {
    hideMessageBubble: false,
    position: "right",
    type: "standard",
  };

  loadScriptOnce("myeca-chatwoot", `${baseUrl}/packs/js/sdk.js`, (script) => {
    script.onload = () => {
      window.chatwootSDK?.run?.({
        websiteToken: config.chatwootWebsiteToken || "",
        baseUrl,
      });
    };
  });
  chatwootLoaded = true;
}

export function initializeSelfHostedTelemetry(config: BrowserTelemetryConfig, path: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  initializeUmami(config);
  initializeChatwoot(config, path);
  updateTelemetryForRoute(path);
}

async function initializeWebVitals() {
  if (webVitalsLoaded) return;

  const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import("web-vitals");
  const report = (metric: { name: string; value: number; rating?: string; id?: string }) => {
    captureTelemetryEvent("web_vital", {
      metric_name: metric.name,
      metric_value: Math.round(metric.value * 1000) / 1000,
      metric_rating: metric.rating,
      metric_id: metric.id,
      page_path: safeTelemetryPath(window.location.pathname),
    });
  };

  onCLS(report);
  onFCP(report);
  onINP(report);
  onLCP(report);
  onTTFB(report);
  webVitalsLoaded = true;
}

export async function initializeBrowserTelemetry(path = typeof window !== "undefined" ? window.location.pathname : "/") {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const config = getBrowserTelemetryConfig();
  if (!shouldEnableTelemetry(config)) return;
  if (!hasTelemetryConsent()) return;

  initializeGa(config);
  initializeClarity(config, path);
  initializeSelfHostedTelemetry(config, path);
  await Promise.all([
    initializePostHog(config, path),
    initializeCrisp(config, path),
    initializeWebVitals(),
  ]);
  updateTelemetryForRoute(path);
  trackTelemetryPageView(path, document.title);
}

export function updateTelemetryForRoute(path: string) {
  if (typeof document === "undefined") return;

  const safePath = safeTelemetryPath(path);
  const sensitive = shouldMaskTelemetryRoute(safePath);

  document.documentElement.toggleAttribute("data-telemetry-sensitive", sensitive);

  if (posthogLoaded && window.posthog) {
    window.posthog.register?.({ route_sensitive: sensitive, replay_allowed: allowsBehaviorReplay(safePath) });
    if (allowsBehaviorReplay(safePath)) {
      window.posthog.startSessionRecording?.();
    } else {
      window.posthog.stopSessionRecording?.();
    }
  }

  if (clarityLoaded && window.clarity) {
    window.clarity("consent", allowsBehaviorReplay(safePath));
  }

  if (crispLoaded && crispClient) {
    if (allowsSupportChat(safePath)) {
      crispClient.chat.show();
    } else {
      crispClient.chat.close();
      crispClient.chat.hide();
    }
  }

  if (chatwootLoaded && window.$chatwoot) {
    window.$chatwoot.toggleBubbleVisibility?.(allowsSupportChat(safePath) ? "show" : "hide");
  }
}

export function trackTelemetryPageView(path: string, title = typeof document !== "undefined" ? document.title : "") {
  if (typeof window === "undefined") return;

  const safePath = safeTelemetryPath(path);
  const hasPageViewSink = Boolean(window.gtag || window.posthog?.capture);
  if (!hasPageViewSink) return;
  if (safePath === lastTrackedPath) return;

  lastTrackedPath = safePath;
  const payload = scrubTelemetryProperties({
    page_path: safePath,
    page_location: safeTelemetryUrl(safePath),
    page_title: title,
    route_sensitive: shouldMaskTelemetryRoute(safePath),
    replay_allowed: allowsBehaviorReplay(safePath),
  });

  window.gtag?.("event", "page_view", payload);
  window.posthog?.capture?.("$pageview", payload);
}

export function captureTelemetryEvent(eventName: string, properties: Record<string, TelemetryValue> = {}) {
  if (typeof window === "undefined") return;

  const cleanName = normalizeEventName(eventName);
  if (!cleanName) return;

  const safePath = safeTelemetryPath(window.location.pathname);
  const payload = scrubTelemetryProperties({
    ...properties,
    page_path: safePath,
    route_sensitive: shouldMaskTelemetryRoute(safePath),
  });

  window.gtag?.("event", cleanName, payload);
  window.posthog?.capture?.(cleanName, payload);
}
