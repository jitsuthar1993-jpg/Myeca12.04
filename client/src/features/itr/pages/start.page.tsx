import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileCheck2,
  FileText,
  Landmark,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { useAuth } from "@/components/AuthProvider";
import BrandLockup from "@/components/ui/brand-lockup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { captureCampaignAttribution } from "@/lib/campaign-attribution";
import { captureTelemetryEvent } from "@/telemetry/browser";
import {
  buildItrStartDraft,
  getItrStartSelectorAnswersFromParams,
  normalizeItrStartSelectorAnswers,
  readItrStartHandoff,
  writeItrStartHandoff,
  type ItrStartBusinessOrProfession,
  type ItrStartCapitalGains,
  type ItrStartHousePropertyCount,
  type ItrStartSelectorAnswers,
  type ItrStartTotalIncomeRange,
} from "@/features/itr/lib/start-selector";
import { recommendItrForm, type ItrFormRecommendation } from "@shared/itr-filing";

const assessmentYears: Array<{
  id: ItrStartSelectorAnswers["assessmentYear"];
  label: string;
  helper: string;
}> = [
  { id: "2026-27", label: "AY 2026-27", helper: "FY 2025-26" },
  { id: "2025-26", label: "AY 2025-26", helper: "Prior-year draft" },
];

const residentialStatusOptions: Array<{
  id: ItrStartSelectorAnswers["residentialStatus"];
  label: string;
  helper: string;
}> = [
  { id: "resident", label: "Resident", helper: "Eligible for simple forms if no blockers apply" },
  { id: "rnor", label: "RNOR", helper: "Usually needs detailed CA review" },
  { id: "nri", label: "NRI", helper: "Usually needs ITR-2/3 and foreign disclosure review" },
];

const totalIncomeOptions: Array<{
  id: ItrStartTotalIncomeRange;
  label: string;
  helper: string;
}> = [
  { id: "under-50-lakh", label: "Rs 50 lakh or below", helper: "Keeps ITR-1/4 possible if other rules fit" },
  { id: "above-50-lakh", label: "Above Rs 50 lakh", helper: "Moves simple cases beyond ITR-1/4" },
];

const housePropertyOptions: Array<{
  id: ItrStartHousePropertyCount;
  label: string;
  helper: string;
}> = [
  { id: "none", label: "No house property", helper: "No house-property schedule expected" },
  { id: "one", label: "One property", helper: "Allowed in simple checks" },
  { id: "two", label: "Two properties", helper: "Allowed in the AY 2026-27 simple check" },
  { id: "more-than-two", label: "More than two", helper: "Blocks ITR-1/4" },
];

const capitalGainOptions: Array<{
  id: ItrStartCapitalGains;
  label: string;
  helper: string;
}> = [
  { id: "none", label: "No capital gains", helper: "No shares, funds, property, ESOP, VDA, or F&O gains" },
  { id: "section112a-under-limit", label: "112A LTCG up to Rs 1.25 lakh", helper: "Still keeps ITR-1/4 possible" },
  { id: "section112a-over-limit", label: "112A LTCG above Rs 1.25 lakh", helper: "Needs detailed capital-gain schedules" },
  { id: "short-term", label: "Short-term gains", helper: "Stocks, funds, property, ESOP, VDA, or similar gains" },
  { id: "other", label: "Other gains", helper: "Property, debt fund, VDA, or other non-112A gains" },
];

const businessOptions: Array<{
  id: ItrStartBusinessOrProfession;
  label: string;
  helper: string;
}> = [
  { id: "none", label: "No business/profession", helper: "Salary, pension, house property, other sources, or investments only" },
  { id: "business", label: "Business income", helper: "Trading, shop, agency, F&O as business, or other business receipts" },
  { id: "profession", label: "Professional / freelance", helper: "Consulting, design, software, CA, doctor, lawyer, creator, or similar receipts" },
];

const presumptiveOptions: Array<{
  id: ItrStartSelectorAnswers["presumptiveScheme"];
  label: string;
  helper: string;
  when: ItrStartBusinessOrProfession[];
}> = [
  { id: "none", label: "Not presumptive", helper: "Books-led or detailed business/profession return", when: ["business", "profession"] },
  { id: "44AD", label: "44AD", helper: "Eligible presumptive business", when: ["business"] },
  { id: "44ADA", label: "44ADA", helper: "Eligible presumptive profession", when: ["profession"] },
  { id: "44AE", label: "44AE", helper: "Eligible goods-carriage business", when: ["business"] },
];

const riskFlags: Array<{
  key: keyof Pick<
    ItrStartSelectorAnswers,
    | "foreignIncomeOrAssets"
    | "directorInCompany"
    | "heldUnlistedEquity"
    | "hasDeferredEsopTax"
    | "hasBroughtForwardOrCarryForwardLoss"
    | "section194NCashWithdrawal"
    | "governedByPortugueseCivilCode"
  >;
  label: string;
  helper: string;
}> = [
  { key: "foreignIncomeOrAssets", label: "Foreign income/assets", helper: "Foreign assets, signing authority, foreign income, or Form 67/DTAA review" },
  { key: "directorInCompany", label: "Director in company", helper: "Blocks ITR-1/4 simple paths" },
  { key: "heldUnlistedEquity", label: "Unlisted equity held", helper: "Needs enhanced shareholding disclosure" },
  { key: "hasDeferredEsopTax", label: "ESOP tax deferral", helper: "Needs schedule and CA review mapping" },
  { key: "hasBroughtForwardOrCarryForwardLoss", label: "Losses to set off/carry forward", helper: "Requires detailed loss schedule review" },
  { key: "section194NCashWithdrawal", label: "Section 194N TDS", helper: "Cash-withdrawal TDS blocks simple forms" },
  { key: "governedByPortugueseCivilCode", label: "Portuguese Civil Code", helper: "Needs separate income-sharing review" },
];

export const ITR_START_STEPS: Array<{
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "filing-facts",
    title: "Individual filing facts",
    description: "Confirm the basic facts that decide which individual ITR forms remain possible.",
    icon: UserRound,
  },
  {
    id: "income-heads",
    title: "Income heads",
    description: "Choose every broad income category that applied during the financial year.",
    icon: Landmark,
  },
  {
    id: "capital-gains",
    title: "Capital gains",
    description: "Choose the closest capital-gains fact. Exact schedules and amounts come later.",
    icon: FileText,
  },
  {
    id: "business-profession",
    title: "Business or profession",
    description: "Confirm whether business, professional, freelance, or presumptive income applies.",
    icon: BriefcaseBusiness,
  },
  {
    id: "disclosures",
    title: "Blockers and disclosures",
    description: "Select anything that applies. Leave every option unselected if none apply.",
    icon: Building2,
  },
  {
    id: "recommendation",
    title: "Your recommendation",
    description: "Review the likely form and continue to your private filing draft.",
    icon: FileCheck2,
  },
];

const legacyLoginFileSources = new Set(["header_desktop_login_file", "mobile_menu_login_file"]);

function readInitialAnswers() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("resume") === "1") {
    const handoff = readItrStartHandoff();
    if (handoff?.answers) {
      return normalizeItrStartSelectorAnswers(handoff.answers);
    }
  }

  return getItrStartSelectorAnswersFromParams(params);
}

function resultTone(recommendation: ItrFormRecommendation) {
  if (recommendation.form === "CA_SCOPE_REVIEW") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (recommendation.caReviewRequired) {
    return "border-blue-200 bg-blue-50 text-blue-800";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function formLabel(recommendation: ItrFormRecommendation) {
  return recommendation.form === "CA_SCOPE_REVIEW" ? "CA scope review" : recommendation.form;
}

function ChoiceGrid<T extends string>({
  options,
  value,
  onChange,
  columns = "sm:grid-cols-2",
}: {
  options: Array<{ id: T; label: string; helper: string }>;
  value: T;
  onChange: (value: T) => void;
  columns?: string;
}) {
  return (
    <div className={cn("mt-3 grid gap-3", columns)}>
      {options.map((option) => {
        const selected = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={cn(
              "min-h-[76px] rounded-xl border p-4 text-left transition duration-200 motion-reduce:transition-none",
              selected
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50",
            )}
          >
            <span className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-sm font-black text-slate-950">{option.label}</span>
                <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600">{option.helper}</span>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-transparent",
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BooleanTile({
  selected,
  label,
  helper,
  onClick,
}: {
  selected: boolean;
  label: string;
  helper: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-[76px] rounded-xl border p-4 text-left transition duration-200 motion-reduce:transition-none",
        selected
          ? "border-blue-500 bg-blue-50 text-slate-950 ring-2 ring-blue-100"
          : "border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-slate-50",
      )}
    >
      <span className="flex items-start gap-3">
        {selected ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
        ) : (
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
        )}
        <span>
          <span className="block text-sm font-black">{label}</span>
          <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600">{helper}</span>
        </span>
      </span>
    </button>
  );
}

function RecommendationList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div>
      <p className="text-sm font-black text-slate-950">{title}</p>
      <div className="mt-2 space-y-2">
        {items.length ? items.map((item) => (
          <div key={item} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold leading-5 text-slate-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </div>
        )) : (
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold leading-5 text-slate-500">
            {empty}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ITRStartPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const reduceMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [answers, setAnswers] = useState<ItrStartSelectorAnswers>(() => readInitialAnswers());
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const conversionSource = params.get("source") || "itr_start_page";
  const attribution = useMemo(() => captureCampaignAttribution(params), []);
  const isLegacyLoginFileSource = legacyLoginFileSources.has(conversionSource);
  const draft = useMemo(() => buildItrStartDraft(answers), [answers]);
  const recommendation = useMemo(() => recommendItrForm(draft), [draft]);
  const resultStatus = recommendation.caReviewRequired ? "CA review expected" : "Simple form path";
  const continuePath = `/itr/filing?source=${encodeURIComponent(conversionSource)}`;
  const activeStep = ITR_START_STEPS[currentStep];
  const ActiveStepIcon = activeStep.icon;
  const isResultStep = currentStep === ITR_START_STEPS.length - 1;
  const progress = ((currentStep + 1) / ITR_START_STEPS.length) * 100;
  const visibleResultReasons = Array.from(new Set([
    ...recommendation.reasons,
    ...recommendation.blockers,
  ])).slice(0, 3);

  useEffect(() => {
    if (isLoading || !isLegacyLoginFileSource) return;

    navigate(isAuthenticated ? "/dashboard" : "/auth/login?next=%2Fdashboard");
  }, [isAuthenticated, isLegacyLoginFileSource, isLoading, navigate]);

  useEffect(() => {
    if (isLegacyLoginFileSource) return;

    captureTelemetryEvent("landing_view", {
      source: conversionSource,
      partner_code: attribution?.partnerCode,
      utm_campaign: attribution?.utmCampaign,
    });
    captureTelemetryEvent("itr_selector_start", {
      source: conversionSource,
      partner_code: attribution?.partnerCode,
      utm_campaign: attribution?.utmCampaign,
    });
  }, [attribution?.partnerCode, attribution?.utmCampaign, conversionSource, isLegacyLoginFileSource]);

  useEffect(() => {
    if (isLegacyLoginFileSource) return;

    captureTelemetryEvent("itr_form_selector_recommended", {
      source: conversionSource,
      assessment_year: answers.assessmentYear,
      recommended_form: recommendation.form,
      blocker_count: recommendation.blockers.length,
      ca_review_required: recommendation.caReviewRequired,
    });
  }, [
    answers.assessmentYear,
    conversionSource,
    recommendation.blockers.length,
    recommendation.caReviewRequired,
    recommendation.form,
    isLegacyLoginFileSource,
  ]);

  useEffect(() => {
    const heading = document.getElementById("itr-selector-step-heading");
    heading?.focus({ preventScroll: false });
  }, [currentStep]);

  const updateAnswer = <K extends keyof ItrStartSelectorAnswers>(key: K, value: ItrStartSelectorAnswers[K]) => {
    setAnswers((current) => normalizeItrStartSelectorAnswers({ ...current, [key]: value }));
  };

  const updateBusiness = (value: ItrStartBusinessOrProfession) => {
    setAnswers((current) => normalizeItrStartSelectorAnswers({
      ...current,
      businessOrProfession: value,
      presumptiveScheme:
        value === "none" ? "none" :
          value === "business" && current.presumptiveScheme === "44ADA" ? "none" :
            value === "profession" && (current.presumptiveScheme === "44AD" || current.presumptiveScheme === "44AE") ? "none" :
              current.presumptiveScheme,
    }));
  };

  const goNext = () => {
    if (isResultStep) return;
    setDirection(1);
    setCurrentStep((step) => Math.min(step + 1, ITR_START_STEPS.length - 1));
  };

  const goBack = () => {
    if (currentStep === 0) return;
    setDirection(-1);
    setDetailsOpen(false);
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const handleContinue = () => {
    writeItrStartHandoff({
      answers,
      source: conversionSource,
      attribution,
    });

    captureTelemetryEvent("itr_selector_complete", {
      source: conversionSource,
      recommended_form: recommendation.form,
      partner_code: attribution?.partnerCode,
      utm_campaign: attribution?.utmCampaign,
    });
    captureTelemetryEvent("itr_form_selector_continue", {
      source: conversionSource,
      recommended_form: recommendation.form,
      ca_review_required: recommendation.caReviewRequired,
    });

    if (isAuthenticated) {
      navigate(continuePath);
      return;
    }

    navigate(`/auth/register?redirect_url=${encodeURIComponent(continuePath)}`);
  };

  if (isLegacyLoginFileSource) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MetaSEO
        title="Individual ITR Form Selector AY 2026-27 | Choose ITR-1, ITR-2, ITR-3 or ITR-4"
        description="Use the MyeCA individual ITR form selector for AY 2026-27. Answer public facts and get an ITR-1, ITR-2, ITR-3, ITR-4, or CA scope review recommendation."
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Individual ITR Form Selector", url: "/which-itr-form-to-file" },
        ]}
      />

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="MyeCA.in home" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
            <BrandLockup logoSize="sm" wordmarkSize="sm" compact />
          </Link>
          <span className="text-xs font-black uppercase text-slate-500 sm:tracking-[0.12em]">ITR selector</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-32 pt-5 sm:px-6 sm:pt-8">
        <section className="mb-4 rounded-lg border border-blue-100 bg-white p-4 shadow-sm sm:mb-5 sm:rounded-2xl sm:p-6">
          <Badge className="hidden border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-50 sm:inline-flex">AY 2026-27 paid filing path</Badge>
          <h1 className="text-xl font-black tracking-tight text-slate-950 sm:mt-3 sm:text-3xl">
            File AY 2026-27 ITR with scope clarity before payment.
          </h1>
          <p className="mt-1.5 text-sm font-semibold leading-5 text-slate-600 sm:mt-2 sm:leading-6">
            Check my ITR scope from public filing facts, then continue to guided filing or CA-assisted review when your case needs it.
          </p>
          <div className="mt-4 hidden flex-wrap items-center gap-2 text-xs font-bold text-slate-600 sm:flex">
            {["Form recommendation", "Document checklist", "Clear next step"].map((item) => (
              <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">{item}</span>
            ))}
          </div>
        </section>

        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <m.section
            key={activeStep.id}
            custom={direction}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? 28 : -28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? -28 : 28 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <ActiveStepIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    id="itr-selector-step-heading"
                    tabIndex={-1}
                    className="text-xl font-black tracking-tight text-slate-950 outline-none sm:text-2xl"
                  >
                    {activeStep.title}
                  </h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{activeStep.description}</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {currentStep === 0 ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-black text-slate-950">Assessment year</p>
                    <ChoiceGrid options={assessmentYears} value={answers.assessmentYear} onChange={(value) => updateAnswer("assessmentYear", value)} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-950">Residential status</p>
                    <ChoiceGrid options={residentialStatusOptions} value={answers.residentialStatus} onChange={(value) => updateAnswer("residentialStatus", value)} columns="sm:grid-cols-3" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-950">Total income before deductions</p>
                    <ChoiceGrid options={totalIncomeOptions} value={answers.totalIncomeRange} onChange={(value) => updateAnswer("totalIncomeRange", value)} />
                  </div>
                </div>
              ) : null}

              {currentStep === 1 ? (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <BooleanTile selected={answers.salaryOrPension} label="Salary or pension" helper="Form 16, pension certificate, or employer TDS" onClick={() => updateAnswer("salaryOrPension", !answers.salaryOrPension)} />
                    <BooleanTile selected={answers.otherSources} label="Other sources" helper="Interest, dividend, family pension, or similar income" onClick={() => updateAnswer("otherSources", !answers.otherSources)} />
                    <BooleanTile selected={answers.agriculturalIncomeAboveLimit} label="Agricultural income above Rs 5,000" helper="This blocks ITR-1/4 simple paths" onClick={() => updateAnswer("agriculturalIncomeAboveLimit", !answers.agriculturalIncomeAboveLimit)} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-950">House property count</p>
                    <ChoiceGrid options={housePropertyOptions} value={answers.housePropertyCount} onChange={(value) => updateAnswer("housePropertyCount", value)} columns="sm:grid-cols-2" />
                  </div>
                </div>
              ) : null}

              {currentStep === 2 ? (
                <ChoiceGrid options={capitalGainOptions} value={answers.capitalGains} onChange={(value) => updateAnswer("capitalGains", value)} columns="sm:grid-cols-2" />
              ) : null}

              {currentStep === 3 ? (
                <div className="space-y-6">
                  <ChoiceGrid options={businessOptions} value={answers.businessOrProfession} onChange={updateBusiness} columns="sm:grid-cols-3" />
                  {answers.businessOrProfession !== "none" ? (
                    <div>
                      <p className="text-sm font-black text-slate-950">Presumptive scheme</p>
                      <ChoiceGrid
                        options={presumptiveOptions.filter((option) => option.when.includes(answers.businessOrProfession))}
                        value={answers.presumptiveScheme}
                        onChange={(value) => updateAnswer("presumptiveScheme", value)}
                        columns="sm:grid-cols-2"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {currentStep === 4 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {riskFlags.map((flag) => (
                    <BooleanTile
                      key={flag.key}
                      selected={Boolean(answers[flag.key])}
                      label={flag.label}
                      helper={flag.helper}
                      onClick={() => updateAnswer(flag.key, !answers[flag.key])}
                    />
                  ))}
                </div>
              ) : null}

              {currentStep === 5 ? (
                <div>
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Recommended form</p>
                        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                          Your likely form is {formLabel(recommendation)}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={cn("rounded-lg border px-3 py-1.5 text-lg font-black", resultTone(recommendation))}>
                            {formLabel(recommendation)}
                          </span>
                          <Badge className="bg-white text-slate-700 hover:bg-white">{resultStatus}</Badge>
                        </div>
                      </div>
                      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border", resultTone(recommendation))}>
                        <FileCheck2 className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-black text-slate-950">Why this path</p>
                    <div className="mt-3 space-y-2">
                      {visibleResultReasons.map((reason) => (
                        <div key={reason} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="mt-5">
                    <CollapsibleTrigger asChild>
                      <Button type="button" variant="outline" className="h-11 w-full justify-between rounded-xl">
                        View recommendation details
                        <ChevronDown className={cn("h-4 w-4 transition-transform motion-reduce:transition-none", detailsOpen && "rotate-180")} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-5">
                      <RecommendationList title="Blockers" items={recommendation.blockers} empty="No blockers for the currently recommended form." />
                      <RecommendationList title="Required schedules" items={recommendation.requiredSchedules} empty="No additional schedules identified." />
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-start gap-3">
                          {recommendation.exportAvailable ? (
                            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                          )}
                          <div>
                            <p className="text-sm font-black text-slate-950">Export status</p>
                            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{recommendation.exportStatus.reason}</p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <p className="mt-5 text-xs font-semibold leading-5 text-slate-500">
                    Your answers can be resumed after login. This recommendation guides the MyeCA draft and CA-assisted review flow; official portal filing remains a separate authorized workflow.
                  </p>
                </div>
              ) : null}
            </div>
          </m.section>
        </AnimatePresence>
      </main>

      <div
        data-testid="itr-selector-bottom-bar"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-14px_36px_-28px_rgba(15,23,42,0.55)] backdrop-blur sm:px-6"
      >
        <div className="mx-auto max-w-3xl">
          <div
            data-testid="itr-selector-progress-strip"
            className="mb-2 px-1"
          >
            <Progress
              value={progress}
              aria-label="ITR selector progress"
              aria-valuenow={Math.round(progress)}
              className="h-1.5 bg-slate-200"
              indicatorClassName="bg-blue-600 motion-reduce:transition-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={currentStep === 0}
              aria-label="Back"
              className="h-11 min-w-12 rounded-lg px-3 font-black sm:h-12 sm:min-w-[104px] sm:rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button
              type="button"
              onClick={isResultStep ? handleContinue : goNext}
              disabled={isLoading}
              className="h-11 flex-1 rounded-lg bg-blue-700 font-black text-white shadow-sm hover:bg-blue-800 sm:h-12 sm:rounded-xl"
            >
              {isResultStep ? "Continue to MY ITR" : "Next"}
              {isResultStep ? <ArrowRight className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
