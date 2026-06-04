// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ensureGoogleConsentModeDefault,
  captureTelemetryEvent,
  initializeSelfHostedTelemetry,
  trackTelemetryPageView,
  updateGoogleConsentMode,
  updateTelemetryForRoute,
} from "./browser";
import { setTelemetryConsent } from "./config";

afterEach(() => {
  window.localStorage.clear();
  delete window.dataLayer;
  delete window.gtag;
  delete window.posthog;
  delete (window as any).$chatwoot;
  delete (window as any).chatwootSDK;
  delete (window as any).chatwootSettings;
  document.head.innerHTML = "";
  window.history.replaceState({}, "", "/");
});

describe("browser telemetry dispatch", () => {
  it("sets Google Consent Mode v2 defaults before Google tags send data", () => {
    ensureGoogleConsentModeDefault();

    expect(window.dataLayer).toContainEqual(["consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      wait_for_update: 500,
    }]);
    expect(window.dataLayer).toContainEqual(["set", "ads_data_redaction", true]);
  });

  it("updates Google Consent Mode for analytics-only acceptance and denial", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    updateGoogleConsentMode("granted");

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });

    updateGoogleConsentMode("denied");

    expect(gtag).toHaveBeenLastCalledWith("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  });

  it("sends scrubbed page views with safe URLs", () => {
    setTelemetryConsent("granted");
    const gtag = vi.fn();
    const capture = vi.fn();
    window.gtag = gtag;
    window.posthog = { capture };
    document.title = "Login";

    trackTelemetryPageView("/auth/login?next=%2Fdashboard&email=user@example.com", "Login");

    expect(gtag).toHaveBeenCalledWith("event", "page_view", {
      page_path: "/auth/login",
      page_location: "https://myeca.in/auth/login",
      page_title: "Login",
      route_sensitive: true,
      replay_allowed: false,
    });
    expect(capture).toHaveBeenCalledWith("$pageview", {
      page_path: "/auth/login",
      page_location: "https://myeca.in/auth/login",
      page_title: "Login",
      route_sensitive: true,
      replay_allowed: false,
    });
  });

  it("normalizes conversion event names and scrubs payloads", () => {
    setTelemetryConsent("granted");
    const gtag = vi.fn();
    const capture = vi.fn();
    window.gtag = gtag;
    window.posthog = { capture };
    window.history.replaceState({}, "", "/services");

    captureTelemetryEvent("sign_up", {
      email: "user@example.com",
      label: "PAN ABCDE1234F phone 9876543210",
      step: 2,
    });

    const payload = {
      email: "[filtered]",
      label: "PAN [redacted-pan] phone [redacted-phone]",
      step: 2,
      page_path: "/services",
      route_sensitive: false,
    };
    expect(gtag).toHaveBeenCalledWith("event", "signup", payload);
    expect(capture).toHaveBeenCalledWith("signup", payload);
  });

  it("does not dispatch telemetry events after consent is denied", () => {
    const gtag = vi.fn();
    const capture = vi.fn();
    window.gtag = gtag;
    window.posthog = { capture };
    setTelemetryConsent("denied");
    window.history.replaceState({}, "", "/pricing");

    trackTelemetryPageView("/pricing", "Pricing");
    captureTelemetryEvent("lead_submit", { source: "pricing" });

    expect(gtag).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
  });

  it("injects self-hosted Umami and Chatwoot only from configured safe routes", () => {
    const toggleBubbleVisibility = vi.fn();
    (window as any).$chatwoot = { toggleBubbleVisibility };

    initializeSelfHostedTelemetry({
      posthogHost: "https://us.i.posthog.com",
      umamiWebsiteId: "umami-site-id",
      umamiScriptUrl: "https://analytics.myeca.in/script.js",
      chatwootBaseUrl: "https://chat.myeca.in",
      chatwootWebsiteToken: "chatwoot-token",
    }, "/contact");

    const umamiScript = document.getElementById("myeca-umami") as HTMLScriptElement | null;
    expect(umamiScript?.src).toBe("https://analytics.myeca.in/script.js");
    expect(umamiScript?.dataset.websiteId).toBe("umami-site-id");

    const chatwootScript = document.getElementById("myeca-chatwoot") as HTMLScriptElement | null;
    expect(chatwootScript?.src).toBe("https://chat.myeca.in/packs/js/sdk.js");
    expect((window as any).chatwootSettings).toMatchObject({ hideMessageBubble: false });

    updateTelemetryForRoute("/documents/upload");
    expect(toggleBubbleVisibility).toHaveBeenLastCalledWith("hide");

    updateTelemetryForRoute("/contact");
    expect(toggleBubbleVisibility).toHaveBeenLastCalledWith("show");
  });
});
