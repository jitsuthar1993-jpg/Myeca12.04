import { beforeEach, describe, expect, it, vi } from "vitest";
import { captureTelemetryEvent } from "@/telemetry/browser";
import { captureItrFilingEvent } from "./filing-telemetry";

vi.mock("@/telemetry/browser", () => ({
  captureTelemetryEvent: vi.fn(),
}));

describe("captureItrFilingEvent", () => {
  beforeEach(() => {
    vi.mocked(captureTelemetryEvent).mockClear();
  });

  it("captures only the allowlisted pane-funnel properties", () => {
    captureItrFilingEvent("itr_filing_pane_viewed", {
      step: "identity",
      pane: "identity-pan-aadhaar",
      viewport: "mobile",
      pan: "ABCDE1234F",
      income: 900000,
    } as never);

    expect(captureTelemetryEvent).toHaveBeenCalledWith("itr_filing_pane_viewed", {
      step: "identity",
      pane: "identity-pan-aadhaar",
      viewport: "mobile",
    });
  });

  it("allows timing, rule, count, and viewport values without draft data", () => {
    captureItrFilingEvent("itr_filing_validation_blocked", {
      step: "identity",
      pane: "identity-pan-aadhaar",
      rule: "pan-format",
    });
    captureItrFilingEvent("itr_filing_review_submitted", {
      stepsVisited: 7,
      totalMs: 120000,
      viewport: "desktop",
    });

    expect(captureTelemetryEvent).toHaveBeenNthCalledWith(1, "itr_filing_validation_blocked", {
      step: "identity",
      pane: "identity-pan-aadhaar",
      rule: "pan-format",
    });
    expect(captureTelemetryEvent).toHaveBeenNthCalledWith(2, "itr_filing_review_submitted", {
      stepsVisited: 7,
      totalMs: 120000,
      viewport: "desktop",
    });
  });
});
