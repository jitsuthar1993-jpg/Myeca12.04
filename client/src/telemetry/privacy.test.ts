// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import {
  allowsBehaviorReplay,
  allowsSupportChat,
  isSensitiveTelemetryRoute,
  safeTelemetryPath,
  safeTelemetryUrl,
  scrubTelemetryProperties,
} from "./privacy";
import { shouldEnableTelemetry, type BrowserTelemetryConfig } from "./config";
import { getTelemetryConsent, hasTelemetryConsent, setTelemetryConsent } from "./config";

const emptyConfig: BrowserTelemetryConfig = {
  posthogHost: "https://us.i.posthog.com",
};

afterEach(() => {
  window.localStorage.clear();
});

describe("telemetry privacy gates", () => {
  it("allows replay only on low-risk public and onboarding routes", () => {
    expect(allowsBehaviorReplay("/")).toBe(true);
    expect(allowsBehaviorReplay("/services/gst-registration")).toBe(true);
    expect(allowsBehaviorReplay("/itr/form-selector")).toBe(true);
    expect(allowsBehaviorReplay("/learn/videos#all")).toBe(true);
  });

  it("blocks replay and chat on sensitive tax, document, auth, and workspace routes", () => {
    for (const route of [
      "/auth/login?next=%2Fdashboard",
      "/bank-analyzer",
      "/dashboard",
      "/documents/upload",
      "/payments",
      "/profile",
      "/settings/account",
      "/admin/analytics",
      "/itr/filing",
      "/form16-parser",
      "/ais-viewer",
      "/capital-gains-import",
      "/services/activation",
      "/tax-assistant",
    ]) {
      expect(isSensitiveTelemetryRoute(route), route).toBe(true);
      expect(allowsBehaviorReplay(route), route).toBe(false);
      expect(allowsSupportChat(route), route).toBe(false);
    }
  });

  it("removes query strings and hashes from telemetry URLs", () => {
    expect(safeTelemetryPath("/auth/login?next=%2Fdashboard#top")).toBe("/auth/login");
    expect(safeTelemetryUrl("https://myeca.in/services?email=user@example.com")).toBe("https://myeca.in/services");
  });

  it("scrubs direct identifiers and sensitive payload keys", () => {
    expect(scrubTelemetryProperties({
      email: "user@example.com",
      label: "PAN ABCDE1234F phone 9876543210",
      nested: {
        aadhaarNumber: "1234 5678 9012",
        service: "itr",
      },
    })).toEqual({
      email: "[filtered]",
      label: "PAN [redacted-pan] phone [redacted-phone]",
      nested: {
        aadhaarNumber: "[filtered]",
        service: "itr",
      },
    });
  });

  it("keeps telemetry disabled locally or without configured vendors", () => {
    expect(shouldEnableTelemetry(emptyConfig, true)).toBe(false);
    expect(shouldEnableTelemetry({ ...emptyConfig, gaMeasurementId: "G-TEST" }, false)).toBe(false);
    expect(shouldEnableTelemetry({ ...emptyConfig, gaMeasurementId: "G-TEST" }, true)).toBe(true);
  });

  it("stores explicit telemetry consent before behavior tools can load", () => {
    expect(getTelemetryConsent()).toBeUndefined();
    expect(hasTelemetryConsent()).toBe(false);

    setTelemetryConsent("granted");
    expect(getTelemetryConsent()).toBe("granted");
    expect(hasTelemetryConsent()).toBe(true);

    setTelemetryConsent("denied");
    expect(getTelemetryConsent()).toBe("denied");
    expect(hasTelemetryConsent()).toBe(false);
  });
});
