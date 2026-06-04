// @vitest-environment jsdom
import "@/test/setup";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  GoogleAnalyticsDashboard,
  type GoogleAnalyticsDashboardRange,
} from "./GoogleAnalyticsDashboard";

describe("GoogleAnalyticsDashboard", () => {
  it("shows setup guidance when GA4 server credentials are not configured", () => {
    render(
      <GoogleAnalyticsDashboard
        report={{
          status: "not_configured",
          dateRange: { range: "30d", startDate: "30daysAgo", endDate: "today" },
          summary: emptySummary(),
          topPages: [],
          trafficSources: [],
          devices: [],
          locations: [],
          events: [],
          keyEvents: [],
          lastFetchedAt: null,
        }}
        selectedRange="30d"
        onRangeChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Setup required")).toBeInTheDocument();
    expect(screen.getByText(/GOOGLE_ANALYTICS_PROPERTY_ID/)).toBeInTheDocument();
  });

  it("renders detailed GA4 metrics and tables", () => {
    render(
      <GoogleAnalyticsDashboard
        report={{
          status: "ready",
          dateRange: { range: "30d", startDate: "30daysAgo", endDate: "today" },
          summary: {
            activeUsers: 42,
            newUsers: 12,
            sessions: 60,
            pageViews: 144,
            eventCount: 500,
            keyEvents: 8,
            engagementRate: 0.75,
            averageSessionDuration: 91.5,
          },
          topPages: [{ path: "/services", title: "Services", pageViews: 80, activeUsers: 25, engagementRate: 0.8 }],
          trafficSources: [{ channel: "Organic Search", sourceMedium: "google / organic", sessions: 30, activeUsers: 21, keyEvents: 5 }],
          devices: [{ category: "mobile", browser: "Chrome", activeUsers: 28, sessions: 35 }],
          locations: [{ country: "India", city: "Pune", activeUsers: 19, sessions: 24 }],
          events: [{ eventName: "page_view", eventCount: 300, activeUsers: 40, keyEvents: 0 }],
          keyEvents: [{ eventName: "lead_submit", keyEvents: 7, eventCount: 10, activeUsers: 5 }],
          lastFetchedAt: "2026-06-04T10:00:00.000Z",
        }}
        selectedRange="30d"
        onRangeChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("144")).toBeInTheDocument();
    expect(screen.getByText("75.0%")).toBeInTheDocument();
    expect(screen.getByText("1m 32s")).toBeInTheDocument();
    expect(screen.getByText("/services")).toBeInTheDocument();
    expect(screen.getByText("Organic Search")).toBeInTheDocument();
    expect(screen.getByText("mobile")).toBeInTheDocument();
    expect(screen.getByText("Pune")).toBeInTheDocument();
    expect(screen.getByText("lead_submit")).toBeInTheDocument();
  });

  it("calls the range change handler from the segmented range controls", async () => {
    const onRangeChange = vi.fn<(range: GoogleAnalyticsDashboardRange) => void>();
    const user = userEvent.setup();

    render(
      <GoogleAnalyticsDashboard
        report={{
          status: "not_configured",
          dateRange: { range: "30d", startDate: "30daysAgo", endDate: "today" },
          summary: emptySummary(),
          topPages: [],
          trafficSources: [],
          devices: [],
          locations: [],
          events: [],
          keyEvents: [],
          lastFetchedAt: null,
        }}
        selectedRange="30d"
        onRangeChange={onRangeChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "90D" }));

    expect(onRangeChange).toHaveBeenCalledWith("90d");
  });
});

function emptySummary() {
  return {
    activeUsers: 0,
    newUsers: 0,
    sessions: 0,
    pageViews: 0,
    eventCount: 0,
    keyEvents: 0,
    engagementRate: 0,
    averageSessionDuration: 0,
  };
}
