import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, ShieldCheck, UsersRound } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { captureCampaignAttribution } from "@/lib/campaign-attribution";
import { apiRequest } from "@/lib/queryClient";
import { captureTelemetryEvent } from "@/telemetry/browser";

const partnerOffers = [
  {
    icon: UsersRound,
    title: "CA overflow fulfillment",
    description: "Route approved ITR case types into MyeCA's existing assignment workflow with agreed capacity, SLA, consent, and QA controls.",
  },
  {
    icon: Building2,
    title: "Employer and HR distribution",
    description: "Give employees a tracked preparation and filing path for Form 16 season without sending taxpayer documents through HR.",
  },
];

export default function PartnersPage() {
  const { toast } = useToast();
  const attribution = useMemo(() => captureCampaignAttribution(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    partnerType: "ca-overflow",
    message: "",
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiRequest("/api/consultation-requests", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          service: form.partnerType === "ca-overflow" ? "CA overflow partnership" : "Employer and HR distribution partnership",
          message: form.message,
          source: "partner",
          formId: "partner-lead-form",
          serviceIntent: form.partnerType,
          attribution,
        }),
      });
      const result = await response.json();
      captureTelemetryEvent("consultation_request_created", {
        source: "partner",
        service_intent: form.partnerType,
        consultation_request_id: result.id,
        partner_code: attribution?.partnerCode,
      });
      toast({ title: "Partner request received", description: "The operations team will review fit, capacity, and next steps." });
      setForm((current) => ({ ...current, name: "", email: "", phone: "", company: "", message: "" }));
    } catch {
      toast({ title: "Could not submit request", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <MetaSEO
        title="MyeCA ITR Fulfillment and Employer Partners"
        description="Partner with MyeCA for seasonal CA overflow fulfillment or tracked employer and HR ITR distribution."
        keywords={["CA overflow partnership", "ITR filing partner", "employee ITR filing"]}
        type="service"
        canonicalUrl="https://myeca.in/partners"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Partners", url: "/partners" }]}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-8">
          <BadgeCheck className="h-7 w-7 text-blue-600" />
          <h1 className="type-page-title mt-4 max-w-4xl font-black text-slate-950">Add trusted ITR capacity without building another operations system.</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            MyeCA uses its existing case assignment workflow for vetted fulfillment partners and tracked employer distribution. Agreements, taxpayer consent, explicit assignment, and QA approval come before document access.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-2 md:px-6 lg:px-8">
        {partnerOffers.map(({ icon: Icon, title, description }) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Icon className="h-6 w-6 text-blue-600" />
            <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 md:grid-cols-[0.85fr_1.15fr] md:px-6 lg:px-8">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <ShieldCheck className="h-6 w-6 text-blue-700" />
          <h2 className="mt-4 text-xl font-black text-slate-950">Seasonal operating rules</h2>
          <div className="mt-5 space-y-3">
            {[
              "Approved case types and daily capacity are recorded before activation.",
              "Taxpayer documents stay private until consent and explicit case assignment.",
              "SLA and QA status are reviewed before more cases are released.",
            ].map((rule) => (
              <p key={rule} className="flex gap-2 text-sm font-semibold leading-6 text-slate-700">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" /> {rule}
              </p>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">Request a partner review</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Share operating context only. Do not submit taxpayer documents here.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="partner-name">Name</Label><Input id="partner-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
            <div><Label htmlFor="partner-email">Work email</Label><Input id="partner-email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
            <div><Label htmlFor="partner-phone">Phone</Label><Input id="partner-phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div>
            <div><Label htmlFor="partner-company">Firm or employer</Label><Input id="partner-company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></div>
          </div>
          <div className="mt-4">
            <Label>Partner path</Label>
            <Select value={form.partnerType} onValueChange={(partnerType) => setForm({ ...form, partnerType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ca-overflow">CA overflow fulfillment</SelectItem>
                <SelectItem value="employer-hr-distribution">Employer / HR distribution</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4"><Label htmlFor="partner-message">Capacity and fit</Label><Textarea id="partner-message" required minLength={10} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></div>
          <Button className="mt-5 bg-blue-600 text-white hover:bg-blue-700" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Request partner review"} <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </section>
    </main>
  );
}
