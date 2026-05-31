import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileText,
  HelpCircle,
  Loader2,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { useAuth } from "@/components/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { captureTelemetryEvent } from "@/telemetry/browser";
import {
  buildItrServiceMetadata,
  getItrStartRecommendation,
  type ItrAssistanceLevel,
  type ItrIncomeProfile,
  type ItrStartAnswers,
} from "@/lib/itr-start-conversion";

const DRAFT_KEY = "myeca:itr-start-draft";

const assessmentYears = [
  { value: "2026-27", label: "AY 2026-27", helper: "FY 2025-26 filing" },
  { value: "2025-26", label: "AY 2025-26", helper: "Prior-year filing" },
];

const incomeProfiles: Array<{
  id: ItrIncomeProfile;
  title: string;
  description: string;
  tone: string;
}> = [
  {
    id: "salary",
    title: "Salary / Form 16",
    description: "Single employer, interest and deductions",
    tone: "border-emerald-100 bg-emerald-50 text-emerald-800",
  },
  {
    id: "multiple-form16",
    title: "Multiple Form 16",
    description: "Changed jobs or has more review needs",
    tone: "border-blue-100 bg-blue-50 text-blue-800",
  },
  {
    id: "capital-gains",
    title: "Capital gains",
    description: "Stocks, mutual funds, property or crypto/VDA",
    tone: "border-amber-100 bg-amber-50 text-amber-800",
  },
  {
    id: "business-freelance",
    title: "Business / freelance",
    description: "44AD, 44ADA, GST or professional income",
    tone: "border-indigo-100 bg-indigo-50 text-indigo-800",
  },
  {
    id: "nri-foreign",
    title: "NRI / foreign assets",
    description: "Foreign income, DTAA, Form 67 or Schedule FA",
    tone: "border-violet-100 bg-violet-50 text-violet-800",
  },
  {
    id: "notice",
    title: "Notice or mismatch",
    description: "Tax notice, AIS mismatch or filing uncertainty",
    tone: "border-rose-100 bg-rose-50 text-rose-800",
  },
];

const assistanceOptions: Array<{
  id: ItrAssistanceLevel;
  title: string;
  description: string;
}> = [
  {
    id: "guided",
    title: "I can follow a guided checklist",
    description: "Fastest path when your return is simple.",
  },
  {
    id: "ca-assisted",
    title: "I want CA review",
    description: "Best when you want an expert to check before filing.",
  },
  {
    id: "not-sure",
    title: "I am not sure",
    description: "We will keep this scope-first if facts look complex.",
  },
];

const processSteps = [
  "Check path",
  "Start case",
  "Upload documents",
  "Review and file",
  "E-verify",
];

function readInitialAnswers(): ItrStartAnswers {
  const params = new URLSearchParams(window.location.search);
  const queryProfile = params.get("profile") as ItrIncomeProfile | null;
  const queryPlan = params.get("plan");

  if (params.get("resume") === "1") {
    try {
      const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "") as ItrStartAnswers;
      if (draft?.assessmentYear && draft?.incomeProfiles?.length && draft?.assistanceLevel) {
        return draft;
      }
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }

  if (queryProfile && incomeProfiles.some((profile) => profile.id === queryProfile)) {
    return {
      assessmentYear: "2026-27",
      incomeProfiles: [queryProfile],
      assistanceLevel: "ca-assisted",
    };
  }

  if (queryPlan === "expert-assisted") {
    return {
      assessmentYear: "2026-27",
      incomeProfiles: ["salary", "multiple-form16"],
      assistanceLevel: "ca-assisted",
    };
  }

  return {
    assessmentYear: "2026-27",
    incomeProfiles: ["salary"],
    assistanceLevel: "guided",
  };
}

export default function ITRStartPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<ItrStartAnswers>(() => readInitialAnswers());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const conversionSource = params.get("source") || "itr_start_page";

  const recommendation = useMemo(() => getItrStartRecommendation(answers), [answers]);
  const isFixedPlan = recommendation.nextStep === "payment-link";

  useEffect(() => {
    captureTelemetryEvent("itr_plan_recommended", {
      recommended_plan_id: recommendation.planId,
      assessment_year: answers.assessmentYear,
      profile_count: answers.incomeProfiles.length,
      assistance_level: answers.assistanceLevel,
    });
  }, [answers.assessmentYear, answers.assistanceLevel, answers.incomeProfiles.length, recommendation.planId]);

  const toggleProfile = (profileId: ItrIncomeProfile) => {
    setAnswers((current) => {
      const selected = current.incomeProfiles.includes(profileId)
        ? current.incomeProfiles.filter((id) => id !== profileId)
        : [...current.incomeProfiles, profileId];

      return {
        ...current,
        incomeProfiles: selected.length ? selected : ["salary"],
      };
    });
  };

  const handlePrimaryAction = async () => {
    captureTelemetryEvent("itr_start_cta_click", {
      recommended_plan_id: recommendation.planId,
      cta_variant: isFixedPlan ? "create_case_payment_link" : "scope_review",
      assessment_year: answers.assessmentYear,
      profile_count: answers.incomeProfiles.length,
    });

    if (!isFixedPlan) {
      navigate("/expert-consultation?service=itr-filing&source=itr-start");
      return;
    }

    if (!isAuthenticated) {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
      navigate(`/auth/register?redirect_url=${encodeURIComponent("/itr/start?resume=1")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const metadata = buildItrServiceMetadata(
        answers,
        recommendation,
        conversionSource,
        "itr_start_primary"
      );
      const serviceResponse = await apiRequest("/api/user-services", {
        method: "POST",
        body: JSON.stringify({
          serviceId: recommendation.serviceId,
          serviceTitle: recommendation.serviceTitle,
          serviceCategory: recommendation.serviceCategory,
          paymentAmount: recommendation.paymentAmount,
          metadata,
        }),
      });
      const serviceJson = await serviceResponse.json();
      const userServiceId = serviceJson.id || serviceJson.service?.id;

      if (userServiceId) {
        await apiRequest("/api/payments/request-link", {
          method: "POST",
          body: JSON.stringify({
            userServiceId,
            note: `${recommendation.title} payment link requested from ITR start funnel.`,
          }),
        });
        setCaseId(userServiceId);
        sessionStorage.removeItem(DRAFT_KEY);
        queryClient.invalidateQueries({ queryKey: ["/api/user-services"] });
        captureTelemetryEvent("itr_case_created", {
          recommended_plan_id: recommendation.planId,
          service_case_created: true,
        });
        captureTelemetryEvent("payment_link_requested", {
          recommended_plan_id: recommendation.planId,
          payment_link_requested: true,
        });
        toast({
          title: "ITR case created",
          description: "We requested the payment link and opened your trackable filing case.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Could not start the case",
        description: error?.message || "Please try again or request a CA callback.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MetaSEO
        title="Start ITR Filing AY 2026-27 | Check Your Plan in 60 Seconds"
        description="Check the right MyeCA ITR filing plan for AY 2026-27. Salary filing starts at Rs 499, CA-assisted filing starts at Rs 999, and complex cases are scoped before payment."
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Start ITR", url: "/itr/start" },
        ]}
      />

      <section className="border-b border-slate-100 bg-white px-4 py-10 sm:px-6 md:bg-gradient-to-br md:from-slate-50 md:via-blue-50/20 md:to-white md:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm">
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
              <span>CA assisted tax filing</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" aria-hidden="true" />
              <span className="text-emerald-600">AY 2026-27</span>
            </div>
            <h1 className="mt-8 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Start your{" "}
              <span className="inline-flex items-center text-blue-600">
                ITR filing
                <span className="ml-1 inline-block h-[0.95em] w-1 animate-pulse bg-blue-600 align-[-0.08em]" aria-hidden="true" />
              </span>{" "}
              with expert CA assistance
            </h1>
            <p className="mx-auto mt-5 max-w-4xl text-lg leading-8 text-slate-600 md:text-2xl">
              With <span className="font-bold text-slate-700">Free Notice Assistance</span> for tax, GST, notices &amp; other services.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 text-sm font-semibold text-slate-600 sm:flex-row sm:gap-8 md:text-base">
              {["Secure documents", "Scope before payment", "Expert support"].map((item) => (
                <div key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-5xl rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 md:p-6">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">60-second diagnosis</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">Which ITR path fits me?</h2>
              </div>
              <Badge className="w-fit bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                Public questions only
              </Badge>
            </div>

            <div className="mt-5 space-y-6">
              <div>
                <label className="text-sm font-black text-slate-950">Assessment year</label>
                <Select
                  value={answers.assessmentYear}
                  onValueChange={(value) => setAnswers((current) => ({ ...current, assessmentYear: value }))}
                >
                  <SelectTrigger className="mt-2 h-12 rounded-lg border-slate-200 bg-slate-50 font-bold text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assessmentYears.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label} - {year.helper}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-black text-slate-950">Income profile</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {incomeProfiles.map((profile) => {
                    const selected = answers.incomeProfiles.includes(profile.id);
                    return (
                      <button
                        key={profile.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleProfile(profile.id)}
                        className={cn(
                          "min-h-[88px] rounded-lg border p-3 text-left transition-colors",
                          selected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                        )}
                      >
                        <span className="flex items-start gap-3">
                          <span className={cn("mt-0.5 rounded-lg border px-2 py-1 text-xs font-black", profile.tone)}>
                            {selected ? "Selected" : "Choose"}
                          </span>
                          <span>
                            <span className="block text-sm font-black text-slate-950">{profile.title}</span>
                            <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600">
                              {profile.description}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-black text-slate-950">Assistance preference</p>
                <div className="mt-2 grid gap-2">
                  {assistanceOptions.map((option) => {
                    const selected = answers.assistanceLevel === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setAnswers((current) => ({ ...current, assistanceLevel: option.id }))}
                        className={cn(
                          "rounded-lg border p-3 text-left transition-colors",
                          selected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-900 hover:border-blue-200"
                        )}
                      >
                        <span className="flex items-start gap-3">
                          <UserCheck className={cn("mt-0.5 h-4 w-4 shrink-0", selected ? "text-blue-200" : "text-blue-700")} />
                          <span>
                            <span className="block text-sm font-black">{option.title}</span>
                            <span className={cn("mt-1 block text-xs font-semibold leading-5", selected ? "text-slate-200" : "text-slate-600")}>
                              {option.description}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.72fr_0.28fr] lg:items-start">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Recommended plan</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{recommendation.title}</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{recommendation.explanation}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-2xl font-black text-slate-950">
                    {recommendation.priceLabel}
                  </span>
                  <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
                    {isFixedPlan ? "Payment link requested after case creation" : "Scope before payment"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  {isFixedPlan ? (
                    <FileCheck2 className="mt-1 h-5 w-5 shrink-0 text-blue-700" />
                  ) : (
                    <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
                  )}
                  <div>
                    <p className="font-black text-slate-950">Next step</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                      {isFixedPlan
                        ? "Create a trackable ITR case, then request a payment link for the recommended fixed plan."
                        : "A CA team member reviews the facts first so pricing and exclusions are clear before payment."}
                    </p>
                  </div>
                </div>
                {caseId ? (
                  <Link href={`/dashboard/services/${caseId}`} className="mt-5 block">
                    <Button className="h-12 w-full rounded-lg bg-emerald-600 font-black text-white hover:bg-emerald-700">
                      Open my ITR case
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    type="button"
                    onClick={handlePrimaryAction}
                    disabled={isSubmitting || isLoading}
                    className="mt-5 h-12 w-full rounded-lg bg-slate-900 font-black text-white hover:bg-slate-800"
                  >
                    {isSubmitting || isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isFixedPlan && !isAuthenticated ? "Create account and save my plan" : recommendation.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                <Link
                  href="/expert-consultation?service=itr-filing&source=itr-start-secondary"
                  className="mt-3 flex h-11 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white text-sm font-black text-blue-700 hover:bg-blue-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  Talk to Expert
                </Link>
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-blue-700" />
              <p className="text-sm font-black text-slate-950">Trust framework</p>
            </div>
            <div className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
              {[
                "Price shown before account creation",
                "No PAN, phone, income amount or document upload here",
                "Complex cases stay scope-first",
                "Exclusions remain visible before checkout",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[0.38fr_0.62fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Process trust</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Small first action. Clear next step.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-5">
              {processSteps.map((step, index) => (
                <div key={step} className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-black text-blue-700">0{index + 1}</p>
                  <p className="mt-2 text-sm font-black text-slate-950">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-5 md:grid-cols-[0.28fr_0.72fr] md:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-slate-950">Still want to pick the ITR form directly?</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                  The old form selector remains available for users who already know whether they need ITR-1, ITR-2, ITR-3 or ITR-4.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Link href="/itr/form-selector">
                <Button variant="outline" className="h-11 w-full rounded-lg font-black sm:w-auto">
                  <FileText className="h-4 w-4" />
                  Open form selector
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="h-11 w-full rounded-lg font-black sm:w-auto">
                  Compare pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
