// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { captureTelemetryEvent, trackTelemetryPageView } from "./browser";

afterEach(() => {
  delete window.gtag;
  delete window.posthog;
  window.history.replaceState({}, "", "/");
});

describe("browser telemetry dispatch", () => {
  it("sends scrubbed page views with safe URLs", () => {
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
});
