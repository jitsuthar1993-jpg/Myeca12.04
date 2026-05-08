import { useEffect, useMemo, useState } from "react";
import { m } from "framer-motion";
import { useLocation } from "wouter";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileCheck2,
  MessageCircle,
  Phone,
  ReceiptText,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type ServiceProfile = {
  eyebrow: string;
  title: string;
  subtitle: string;
  formTitle: string;
  cta: string;
  defaultMessage: string;
  painPoints: string[];
  outcomes: string[];
  stats: Array<{ label: string; value: string }>;
};

const SERVICE_LABELS: Record<string, string> = {
  "labour-law-compliance": "Labour Law Compliance",
  "company-incorporation": "Company Incorporation",
  "iso-certification": "ISO Certification",
  "trade-license": "Trade License",
  "gst-returns": "GST Returns Filing",
  "startup-india-registration": "Startup India Registration",
  "gst-registration": "GST Registration",
  "company-registration": "Company Registration",
  "tds-filing": "TDS Filing",
  "trademark-registration": "Trademark Registration",
  "fssai-registration": "FSSAI Registration",
  "msme-udyam-registration": "MSME Udyam Registration",
  "notice-compliance": "Income Tax Notice Handling",
  "itr-filing": "ITR Filing",
  "tax-consultation": "Tax Consultation",
  general: "General Consultation",
};

const SERVICE_PROFILES: Record<string, ServiceProfile> = {
  "gst-returns": {
    eyebrow: "GST return help today",
    title: "File GST returns without missed ITC, late fees, or portal confusion.",
    subtitle:
      "A CA-led team checks your sales, purchases, ITC, GSTR-1 and GSTR-3B before filing. Share your GSTIN and we will call back with the exact next step.",
    formTitle: "Get GST return callback",
    cta: "Get GST Return Help",
    defaultMessage: "I need help with GST returns filing, ITC reconciliation, and pending compliance.",
    painPoints: ["GSTR-1 or 3B pending", "ITC mismatch or blocked credit", "Late fee or interest risk"],
    outcomes: ["GSTR-1 and GSTR-3B review", "ITC reconciliation checklist", "Filing plan with fee quote"],
    stats: [
      { value: "2 hr", label: "callback window" },
      { value: "CA", label: "reviewed filing" },
      { value: "GSTR", label: "1 + 3B support" },
    ],
  },
  general: {
    eyebrow: "Expert consultation",
    title: "Talk to a verified tax and compliance expert before you decide.",
    subtitle:
      "Tell us what you need. We will connect you with the right CA or compliance specialist and give you a clear next step.",
    formTitle: "Request a callback",
    cta: "Schedule Expert Consultation",
    defaultMessage: "I need expert consultation for tax or compliance support.",
    painPoints: ["Unsure about compliance steps", "Need pricing before starting", "Need expert review"],
    outcomes: ["Right expert matched", "Clear document checklist", "Transparent fee quote"],
    stats: [
      { value: "2 hr", label: "callback window" },
      { value: "50+", label: "experts" },
      { value: "Review", label: "focused" },
    ],
  },
};

const services = Object.values(SERVICE_LABELS);
const timeSlots = ["Call now", "Today before 1 PM", "Today 2 PM - 4 PM", "Today 4 PM - 6 PM", "Tomorrow morning"];
const turnoverBands = ["Under Rs. 20 lakh", "Rs. 20 lakh - Rs. 1 crore", "Rs. 1 crore - Rs. 5 crore", "Above Rs. 5 crore"];

export default function ExpertConsultationPage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceKey, setServiceKey] = useState("general");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    gstin: "",
    company: "",
    service: SERVICE_LABELS.general,
    turnover: "",
    preferredTime: "Call now",
    message: SERVICE_PROFILES.general.defaultMessage,
  });

  useEffect(() => {
    const service = new URLSearchParams(window.location.search).get("service") || "general";
    const nextServiceKey = SERVICE_PROFILES[service] ? service : "general";
    const nextProfile = SERVICE_PROFILES[nextServiceKey];
    setServiceKey(nextServiceKey);
    setFormData((current) => ({
      ...current,
      service: SERVICE_LABELS[service] || SERVICE_LABELS.general,
      message: current.message === SERVICE_PROFILES.general.defaultMessage ? nextProfile.defaultMessage : current.message,
    }));
  }, [location]);

  const profile = SERVICE_PROFILES[serviceKey] || SERVICE_PROFILES.general;
  const isGstReturns = serviceKey === "gst-returns";

  const urgency = useMemo(() => {
    const day = new Date().getDate();
    if (isGstReturns && day >= 8 && day <= 20) {
      return "GST return due-date window is active. Avoid late fees by getting a quick review.";
    }
    return isGstReturns
      ? "Pending GST returns can attract late fees and interest. A quick review usually catches avoidable mistakes."
      : "Share your details once. We will route the request to the right specialist.";
  }, [isGstReturns]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast({
        title: "Callback request received",
        description: "Our expert team will contact you within 2 business hours.",
      });
      setFormData((current) => ({
        ...current,
        name: "",
        phone: "",
        email: "",
        gstin: "",
        company: "",
        turnover: "",
      }));
    } catch {
      toast({
        title: "Could not submit request",
        description: "Please try again or call us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20 text-slate-950 lg:pb-0">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:py-8 lg:grid-cols-[1fr_430px] lg:items-start lg:gap-8 lg:py-10">
          <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-normal uppercase tracking-widest text-blue-700">
              <ReceiptText className="h-3.5 w-3.5" />
              {profile.eyebrow}
            </div>

            <h1 className="mt-4 max-w-4xl text-[30px] font-normal leading-[1.05] tracking-tight text-slate-950 sm:mt-5 sm:text-5xl lg:text-[60px]">
              {profile.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-5 sm:text-lg sm:leading-7">{profile.subtitle}</p>

            <div className="mt-4 flex flex-wrap gap-3 sm:mt-6">
              <a href="tel:+919876543210" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-normal text-white shadow-lg shadow-slate-900/10 transition hover:bg-blue-700 sm:h-12 sm:px-5">
                <Phone className="h-4 w-4" />
                Call now
              </a>
              <a href="https://wa.me/919876543210" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-normal text-emerald-700 transition hover:bg-emerald-100 sm:h-12 sm:px-5">
                <MessageCircle className="h-4 w-4" />
                WhatsApp expert
              </a>
            </div>

            <div className="mt-7 hidden gap-3 sm:grid sm:grid-cols-3">
              {profile.stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="text-2xl font-normal text-slate-950">{stat.value}</div>
                  <div className="mt-1 text-[11px] font-normal uppercase tracking-widest text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>

            <Alert className="mt-6 hidden border-amber-200 bg-amber-50 text-amber-900 sm:flex">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription>{urgency}</AlertDescription>
            </Alert>
          </m.div>

          <m.div id="consultation-form" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/70 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-normal text-slate-950">{profile.formTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">Takes less than 45 seconds.</p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-normal uppercase tracking-widest text-emerald-700">
                Free call
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={formData.name} onChange={(event) => handleInputChange("name", event.target.value)} placeholder="Your name" required className="h-11 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Mobile *</Label>
                  <Input id="phone" value={formData.phone} onChange={(event) => handleInputChange("phone", event.target.value)} placeholder="+91 98765 43210" required className="h-11 rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="gstin">{isGstReturns ? "GSTIN" : "Company / GSTIN"}</Label>
                  <Input id="gstin" value={formData.gstin} onChange={(event) => handleInputChange("gstin", event.target.value.toUpperCase())} placeholder={isGstReturns ? "22AAAAA0000A1Z5" : "Optional"} className="h-11 rounded-lg uppercase" />
                </div>
                <div className="space-y-1.5">
                  <Label>Call time</Label>
                  <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange("preferredTime", value)}>
                    <SelectTrigger className="h-11 rounded-lg border-gray-300 bg-white text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isGstReturns ? (
                <div className="space-y-1.5">
                  <Label>Monthly turnover</Label>
                  <Select value={formData.turnover} onValueChange={(value) => handleInputChange("turnover", value)}>
                    <SelectTrigger className="h-11 rounded-lg border-gray-300 bg-white text-gray-900">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {turnoverBands.map((band) => <SelectItem key={band} value={band}>{band}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>Service</Label>
                  <Select value={formData.service} onValueChange={(value) => handleInputChange("service", value)}>
                    <SelectTrigger className="h-11 rounded-lg border-gray-300 bg-white text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => <SelectItem key={service} value={service}>{service}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="message">{isGstReturns ? "What is pending?" : "Requirement"}</Label>
                <Textarea id="message" value={formData.message} onChange={(event) => handleInputChange("message", event.target.value)} rows={3} className="rounded-lg" />
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting} className="h-12 w-full rounded-lg bg-blue-600 text-base font-normal text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Sending request...
                  </>
                ) : (
                  <>
                    {profile.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-[11px] leading-5 text-slate-500">
                No spam. No payment on this page. You get a document checklist and price before work starts.
              </p>
            </form>
          </m.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:gap-6 sm:py-8 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-normal text-slate-950">What we check</h3>
          <ul className="mt-4 space-y-3">
            {profile.painPoints.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-normal text-slate-950">What you get</h3>
          <ul className="mt-4 space-y-3">
            {profile.outcomes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-normal text-slate-950">Trusted expert support</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { icon: Star, text: "Document-based guidance" },
              { icon: CalendarClock, text: "6 days/week" },
              { icon: ShieldCheck, text: "Confidential" },
              { icon: Phone, text: "Fast callback" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <Icon className="mb-2 h-4 w-4 text-blue-600" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl shadow-slate-950/10 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-[0.85fr_1.15fr] gap-3">
          <a href="tel:+919876543210" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-normal text-slate-800">
            <Phone className="h-4 w-4" />
            Call
          </a>
          <a href="#consultation-form" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-normal text-white shadow-lg shadow-blue-500/20">
            Get callback
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
