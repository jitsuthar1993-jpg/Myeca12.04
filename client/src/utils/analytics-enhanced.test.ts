// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { setTelemetryConsent } from "@/telemetry/config";
import {
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
  trackSiteSearch,
  trackSocialShare,
  trackViewItem,
} from "./analytics-enhanced";

afterEach(() => {
  window.localStorage.clear();
  delete window.dataLayer;
  delete window.gtag;
  window.history.replaceState({}, "", "/");
});

describe("enhanced analytics dispatch", () => {
  it("sends each recommended GA4 event once through the privacy-aware telemetry path", () => {
    setTelemetryConsent("granted");
    const gtag = vi.fn();
    window.gtag = gtag;
    window.history.replaceState({}, "", "/pricing");

    const item = {
      item_id: "itr-assisted",
      item_name: "Assisted ITR Filing",
      price: 1499,
      currency: "INR",
      quantity: 1,
    };

    trackViewItem(item);
    trackAddToCart(item);
    trackBeginCheckout([item], 1499);
    trackPurchase({
      transaction_id: "txn-123",
      value: 1499,
      currency: "INR",
      items: [item],
    });
    trackSiteSearch("ITR filing", 12, "services");
    trackSocialShare("linkedin", "guide", "itr-guide");

    expect(gtag.mock.calls.map((call) => call[1])).toEqual([
      "view_item",
      "add_to_cart",
      "begin_checkout",
      "purchase",
      "search",
      "share",
    ]);
    expect(gtag).toHaveBeenCalledTimes(6);
    expect(gtag).toHaveBeenCalledWith("event", "purchase", expect.objectContaining({
      transaction_id: "txn-123",
      value: 1499,
      currency: "INR",
      page_path: "/pricing",
    }));
    expect(gtag).toHaveBeenCalledWith("event", "search", expect.objectContaining({
      search_term: "ITR filing",
      results_count: 12,
      search_type: "services",
    }));
  });
});
