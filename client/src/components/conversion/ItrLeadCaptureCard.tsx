import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { captureCampaignAttribution } from "@/lib/campaign-attribution";
import { captureTelemetryEvent } from "@/telemetry/browser";
import { readCampaignAttributionFromParams, type CampaignAttribution } from "@shared/campaign-attribution";

export type ItrLeadCaseType =
  | "itr-selector"
  | "form16"
  | "ais-mismatch"
  | "capital-gains"
  | "refund-tracker"
  | "income-tax-estimate"
  | "nri"
  | "freelancer"
  | "notice-risk";

interface ItrLeadCaptureCardProps {
  caseType: ItrLeadCaseType;
  source: string;
  title: string;
  description: string;
  checklistLabel: string;
  className?: string;
}

function getCurrentSourceUrl() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

function getCurrentAttribution(): CampaignAttribution | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  return readCampaignAttributionFromParams(params) || captureCampaignAttribution(params);
}

function buildUtmFields(attribution: CampaignAttribution | undefined) {
  if (!attribution) return undefined;
  return {
    utmCampaign: attribution.utmCampaign,
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmContent: attribution.utmContent,
  };
}

function buildUtmPayloadFields(attribution: CampaignAttribution | undefined) {
  if (!attribution) return undefined;
  return {
    utm_campaign: attribution.utmCampaign,
    utm_source: attribution.utmSource,
    utm_medium: attribution.utmMedium,
    utm_content: attribution.utmContent,
  };
}

export default function ItrLeadCaptureCard({
  caseType,
  source,
  title,
  description,
  checklistLabel,
  className = "",
}: ItrLeadCaptureCardProps) {
  const attribution = useMemo(() => getCurrentAttribution(), []);
  const sourceUrl = useMemo(() => getCurrentSourceUrl(), []);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [consent, setConsent] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">("idle");
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!consent) {
      setError("Consent is required before we contact you.");
      return;
    }

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }

    setStatus("submitting");
    const consentTimestamp = new Date().toISOString();
    const leadContext = {
      caseType,
      checklistLabel,
      sourceUrl,
      consentTimestamp,
      utmFields: buildUtmFields(attribution),
    };
    const leadPayload = {
      name,
      phone_or_email: phone || email,
      service_interest: "AY 2026-27 ITR filing",
      source_url: sourceUrl,
      utm_fields: buildUtmPayloadFields(attribution),
      case_type: caseType,
      consent_timestamp: consentTimestamp,
    };
    const channelConsent = whatsappConsent && phone
      ? {
          whatsapp: {
            optedIn: true,
            phone,
            consentText: "I agree to receive MyeCA updates for this ITR request on WhatsApp.",
            consentTimestamp,
          },
        }
      : undefined;

    try {
      await apiRequest("/api/consultation-requests", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          phone,
          service: "AY 2026-27 ITR filing",
          preferredTime: "Business hours",
          source,
          formId: "itr-acquisition-lead-capture",
          serviceIntent: "itr-filing",
          message: `Requested ${checklistLabel} and a scoped AY 2026-27 ITR filing path.`,
          attribution,
          leadContext,
          leadPayload,
          ...(channelConsent ? { channelConsent } : {}),
        }),
      });

      captureTelemetryEvent("lead_capture_submitted", {
        case_type: caseType,
        source,
        utm_campaign: attribution?.utmCampaign,
        utm_source: attribution?.utmSource,
        checklist_label: checklistLabel,
      });

      setStatus("submitted");
    } catch {
      captureTelemetryEvent("lead_capture_failed", {
        case_type: caseType,
        source,
        utm_campaign: attribution?.utmCampaign,
      });
      setStatus("idle");
      setError("Could not send the checklist request. Please try again.");
    }
  };

  if (status === "submitted") {
    return (
      <section className={`rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm ${className}`}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <h2 className="text-base font-black text-emerald-950">Checklist request received</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-emerald-800">
              We will follow up with the {checklistLabel.toLowerCase()} and the next filing step during business hours.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`rounded-2xl border border-blue-100 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">ITR filing follow-up</p>
          <h2 className="mt-1 text-lg font-black leading-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <div>
          <Label htmlFor={`${source}-name`}>Name</Label>
          <Input
            id={`${source}-name`}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            autoComplete="name"
            maxLength={120}
            className="mt-1 h-11 rounded-lg"
            required
          />
        </div>
        <div>
          <Label htmlFor={`${source}-email`}>Email</Label>
          <Input
            id={`${source}-email`}
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="email"
            maxLength={160}
            className="mt-1 h-11 rounded-lg"
            required
          />
        </div>
        <div>
          <Label htmlFor={`${source}-phone`}>WhatsApp number</Label>
          <Input
            id={`${source}-phone`}
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            autoComplete="tel"
            inputMode="tel"
            maxLength={30}
            className="mt-1 h-11 rounded-lg"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-600">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
            aria-label="I consent to receive ITR filing follow-up"
          />
          <span>I consent to receive the checklist and filing follow-up from MyeCA. No PAN, Aadhaar, or tax documents are collected in this form.</span>
        </label>

        <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-semibold leading-5 text-emerald-900">
          <input
            type="checkbox"
            checked={whatsappConsent}
            onChange={(event) => setWhatsappConsent(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-600"
            aria-label="I agree to receive MyeCA updates on WhatsApp"
            disabled={!form.phone.trim()}
          />
          <span>Send checklist and missing-document updates on WhatsApp. We will not send PAN, Aadhaar, income figures, or document contents in messages.</span>
        </label>

        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

        <Button type="submit" disabled={status === "submitting"} className="h-11 w-full rounded-lg bg-blue-600 text-sm font-black text-white hover:bg-blue-700">
          {status === "submitting" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Send checklist
        </Button>
      </form>
    </section>
  );
}
