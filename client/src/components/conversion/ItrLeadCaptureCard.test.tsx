import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ItrLeadCaptureCard from "./ItrLeadCaptureCard";
import { apiRequest } from "@/lib/queryClient";
import { captureTelemetryEvent } from "@/telemetry/browser";

vi.mock("@/lib/queryClient", () => ({
  apiRequest: vi.fn(),
}));

vi.mock("@/telemetry/browser", () => ({
  captureTelemetryEvent: vi.fn(),
}));

describe("ItrLeadCaptureCard", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
    vi.mocked(captureTelemetryEvent).mockReset();
    window.history.replaceState({}, "", "/form16-parser?utm_campaign=itr-season-2026&utm_source=google&utm_medium=paid_search&utm_content=form16");
  });

  it("submits a privacy-scoped ITR lead payload with consent and attribution", async () => {
    vi.mocked(apiRequest).mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));

    render(
      <ItrLeadCaptureCard
        caseType="form16"
        source="form16_parser_lead_capture"
        title="Get the Form 16 filing checklist"
        description="Share contact details for a checklist and scoped filing path."
        checklistLabel="Form 16 checklist"
      />,
    );

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Asha" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "asha@example.com" } });
    fireEvent.change(screen.getByLabelText("WhatsApp number"), { target: { value: "9999999999" } });
    fireEvent.click(screen.getByLabelText(/consent/i));
    fireEvent.click(screen.getByLabelText(/updates on WhatsApp/i));
    fireEvent.click(screen.getByRole("button", { name: /send checklist/i }));

    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith("/api/consultation-requests", expect.any(Object)));

    const [, options] = vi.mocked(apiRequest).mock.calls[0];
    const body = JSON.parse(String(options?.body));
    expect(body).toMatchObject({
      name: "Asha",
      email: "asha@example.com",
      phone: "9999999999",
      service: "AY 2026-27 ITR filing",
      source: "form16_parser_lead_capture",
      formId: "itr-acquisition-lead-capture",
      serviceIntent: "itr-filing",
      attribution: {
        utmCampaign: "itr-season-2026",
        utmSource: "google",
        utmMedium: "paid_search",
        utmContent: "form16",
      },
      leadContext: {
        caseType: "form16",
        checklistLabel: "Form 16 checklist",
        sourceUrl: "/form16-parser?utm_campaign=itr-season-2026&utm_source=google&utm_medium=paid_search&utm_content=form16",
      },
      leadPayload: {
        name: "Asha",
        phone_or_email: "9999999999",
        service_interest: "AY 2026-27 ITR filing",
        source_url: "/form16-parser?utm_campaign=itr-season-2026&utm_source=google&utm_medium=paid_search&utm_content=form16",
        utm_fields: {
          utm_campaign: "itr-season-2026",
          utm_source: "google",
          utm_medium: "paid_search",
          utm_content: "form16",
        },
        case_type: "form16",
      },
      channelConsent: {
        whatsapp: {
          optedIn: true,
          phone: "9999999999",
          consentText: "I agree to receive MyeCA updates for this ITR request on WhatsApp.",
        },
      },
    });
    expect(body.channelConsent.whatsapp.consentTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(body.leadContext.consentTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(body.leadPayload.consent_timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(JSON.stringify(body)).not.toMatch(/pan|aadhaar|incomeAmount|taxableIncome/i);
    expect(captureTelemetryEvent).toHaveBeenCalledWith("lead_capture_submitted", expect.objectContaining({
      case_type: "form16",
      source: "form16_parser_lead_capture",
      utm_campaign: "itr-season-2026",
    }));
  });

  it("requires consent before submission", async () => {
    render(
      <ItrLeadCaptureCard
        caseType="ais-mismatch"
        source="itr_season_ais_lead_capture"
        title="Get AIS mismatch checklist"
        description="Share contact details for the checklist."
        checklistLabel="AIS mismatch checklist"
      />,
    );

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Asha" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "asha@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /send checklist/i }));

    expect(await screen.findByText("Consent is required before we contact you.")).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalled();
  });
});
