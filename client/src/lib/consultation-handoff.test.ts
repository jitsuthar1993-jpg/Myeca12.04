import { describe, expect, it } from "vitest";

import {
  buildConsultationPrefillMessage,
  buildConsultationHref,
  CONSULTATION_SERVICE_KEYS,
} from "./consultation-handoff";

describe("consultation handoff", () => {
  it("builds a real support route with privacy-safe selection context", () => {
    const href = buildConsultationHref("tax-consultation", {
      source: "learn-consultations",
      team: "tax-review-team",
      type: "itr-review",
      date: new Date(2026, 6, 10),
      time: "10:00 AM",
    });

    expect(href).toBe(
      "/expert-consultation?service=tax-consultation&source=learn-consultations&team=tax-review-team&type=itr-review&date=2026-07-10&time=10%3A00+AM",
    );
  });

  it("omits blank values and never serializes personal form fields", () => {
    const href = buildConsultationHref("business-tax-review", {
      source: "city-landing",
      serviceArea: "company-registration",
      city: "mumbai",
      team: "",
      name: "Private Name",
      email: "private@example.test",
      phone: "+91 99999 99999",
    } as never);

    const query = new URL(href, "https://myeca.in").searchParams;

    expect(query.get("service")).toBe("business-tax-review");
    expect(query.get("serviceArea")).toBe("company-registration");
    expect(query.get("city")).toBe("mumbai");
    expect(query.has("team")).toBe(false);
    expect(query.has("name")).toBe(false);
    expect(query.has("email")).toBe(false);
    expect(query.has("phone")).toBe(false);
  });

  it("carries selection context into the support message without accepting personal query fields", () => {
    const message = buildConsultationPrefillMessage(
      "I need a review of my tax question.",
      "?team=tax-review-team&type=itr-review&date=2026-07-10&time=10%3A00+AM&name=Private+Name&email=private%40example.test",
    );

    expect(message).toBe(
      "I need a review of my tax question.\n\nRequest context: service team tax review team; topic itr review; preferred date 2026-07-10; preferred time 10:00 AM.",
    );
    expect(message).not.toContain("Private Name");
    expect(message).not.toContain("private@example.test");
  });

  it("exposes only service keys backed by consultation profiles", () => {
    expect(CONSULTATION_SERVICE_KEYS).toEqual([
      "general",
      "tax-consultation",
      "gst-returns",
      "business-tax-review",
    ]);
  });
});
