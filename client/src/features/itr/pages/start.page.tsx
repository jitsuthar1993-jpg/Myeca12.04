import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleAlert,
  FileCheck2,
  FileText,
  Landmark,
  ListChecks,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { useAuth } from "@/components/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

const itrStartProofItems = [
  ["No PAN here", "Public facts only"],
  ["Rules engine", "Same ITR logic"],
  ["Next step", "Filing draft"],
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
    <div className={cn("mt-3 grid gap-2", columns)}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "min-h-[74px] rounded-lg border p-3 text-left transition-colors",
            value === option.id
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
              : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50",
          )}
        >
          <span className="block text-sm font-black text-slate-950">{option.label}</span>
          <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600">{option.helper}</span>
        </button>
      ))}
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
        "min-h-[72px] rounded-lg border p-3 text-left transition-colors",
        selected
          ? "border-blue-500 bg-blue-50 text-slate-950 ring-2 ring-blue-100"
          : "border-slate-200 bg-white text-slate-900 hover:border-blue-200 hover:bg-slate-50",
      )}
    >
      <span className="flex items-start gap-2">
        {selected ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
        ) : (
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        )}
        <span>
          <span className="block text-sm font-black">{label}</span>
          <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600">
            {helper}
          </span>
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
          <div key={item} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold leading-5 text-slate-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </div>
        )) : (
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold leading-5 text-slate-500">
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
  const [answers, setAnswers] = useState<ItrStartSelectorAnswers>(() => readInitialAnswers());
  const params = new URLSearchParams(window.location.search);
  const conversionSource = params.get("source") || "itr_start_page";
  const isLegacyLoginFileSource = legacyLoginFileSources.has(conversionSource);
  const draft = useMemo(() => buildItrStartDraft(answers), [answers]);
  const recommendation = useMemo(() => recommendItrForm(draft), [draft]);
  const resultStatus = recommendation.caReviewRequired ? "CA review expected" : "Simple form path";
  const continuePath = `/itr/filing?source=${encodeURIComponent(conversionSource)}`;

  useEffect(() => {
    if (isLoading || !isLegacyLoginFileSource) return;

    navigate(isAuthenticated ? "/dashboard" : "/auth/login?next=%2Fdashboard");
  }, [isAuthenticated, isLegacyLoginFileSource, isLoading, navigate]);

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

  const handleContinue = () => {
    writeItrStartHandoff({
      answers,
      source: conversionSource,
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

      <section className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-black text-blue-800">
                <ShieldCheck className="h-4 w-4" />
                <span>AY 2026-27 form selection</span>
              </div>
              <h1 className="mt-4 type-page-title font-black tracking-tight text-slate-950">
                Individual ITR form selector
              </h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600 md:text-lg">
                Answer individual filing facts only. MyeCA will identify the likely ITR form and then you can continue inside the signed-in filing draft.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 lg:w-[440px]">
              {itrStartProofItems.map(([label, helper]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center sm:p-3 lg:text-left">
                  <p className="text-[0.68rem] font-black leading-tight text-slate-950 sm:text-sm">{label}</p>
                  <p className="mt-1 hidden text-xs font-semibold text-slate-500 sm:block">{helper}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,0.64fr)_minmax(360px,0.36fr)] lg:items-start">
          <div className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <div className="flex items-start gap-3">
                <UserRound className="mt-1 h-5 w-5 shrink-0 text-blue-700" />
                <div>
                  <h2 className="text-xl font-black text-slate-950">Individual filing facts</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    These answers decide which individual ITR form path applies.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-black text-slate-950">Assessment year</p>
                  <ChoiceGrid
                    options={assessmentYears}
                    value={answers.assessmentYear}
                    onChange={(value) => updateAnswer("assessmentYear", value)}
                  />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-950">Residential status</p>
                  <ChoiceGrid
                    options={residentialStatusOptions}
                    value={answers.residentialStatus}
                    onChange={(value) => updateAnswer("residentialStatus", value)}
                    columns="sm:grid-cols-3"
                  />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-950">Total income before deductions</p>
                  <ChoiceGrid
                    options={totalIncomeOptions}
                    value={answers.totalIncomeRange}
                    onChange={(value) => updateAnswer("totalIncomeRange", value)}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Current recommendation</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-lg border px-3 py-1.5 text-2xl font-black", resultTone(recommendation))}>
                      {formLabel(recommendation)} path
                    </span>
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{resultStatus}</Badge>
                  </div>
                </div>
                <FileCheck2 className="h-7 w-7 shrink-0 text-blue-700" />
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600" aria-live="polite">
                {recommendation.reasons[0] ?? "Answer more facts to refine the filing path."}
              </p>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <div className="flex items-start gap-3">
                <Landmark className="mt-1 h-5 w-5 shrink-0 text-blue-700" />
                <div>
                  <h2 className="text-xl font-black text-slate-950">Income heads</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    Select the broad income categories. Exact amounts are captured later in the filing draft.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <BooleanTile
                  selected={answers.salaryOrPension}
                  label="Salary or pension"
                  helper="Form 16, pension certificate, or employer TDS"
                  onClick={() => updateAnswer("salaryOrPension", !answers.salaryOrPension)}
                />
                <BooleanTile
                  selected={answers.otherSources}
                  label="Other sources"
                  helper="Interest, dividend, family pension, or similar income"
                  onClick={() => updateAnswer("otherSources", !answers.otherSources)}
                />
                <BooleanTile
                  selected={answers.agriculturalIncomeAboveLimit}
                  label="Agricultural income above Rs 5,000"
                  helper="This blocks ITR-1/4 simple paths"
                  onClick={() => updateAnswer("agriculturalIncomeAboveLimit", !answers.agriculturalIncomeAboveLimit)}
                />
              </div>

              <div className="mt-5">
                <p className="text-sm font-black text-slate-950">House property count</p>
                <ChoiceGrid
                  options={housePropertyOptions}
                  value={answers.housePropertyCount}
                  onChange={(value) => updateAnswer("housePropertyCount", value)}
                  columns="sm:grid-cols-2 xl:grid-cols-4"
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <div className="flex items-start gap-3">
                <FileText className="mt-1 h-5 w-5 shrink-0 text-blue-700" />
                <div>
                  <h2 className="text-xl font-black text-slate-950">Capital gains</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    Choose the closest capital-gains fact. Broker statements and schedule details come later.
                  </p>
                </div>
              </div>
              <ChoiceGrid
                options={capitalGainOptions}
                value={answers.capitalGains}
                onChange={(value) => updateAnswer("capitalGains", value)}
                columns="sm:grid-cols-2 xl:grid-cols-3"
              />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <div className="flex items-start gap-3">
                <BriefcaseBusiness className="mt-1 h-5 w-5 shrink-0 text-blue-700" />
                <div>
                  <h2 className="text-xl font-black text-slate-950">Business or profession</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    Presumptive eligibility decides whether ITR-4 is possible or ITR-3 is needed.
                  </p>
                </div>
              </div>

              <ChoiceGrid
                options={businessOptions}
                value={answers.businessOrProfession}
                onChange={updateBusiness}
                columns="sm:grid-cols-3"
              />

              {answers.businessOrProfession !== "none" ? (
                <div className="mt-5">
                  <p className="text-sm font-black text-slate-950">Presumptive scheme</p>
                  <ChoiceGrid
                    options={presumptiveOptions.filter((option) => option.when.includes(answers.businessOrProfession))}
                    value={answers.presumptiveScheme}
                    onChange={(value) => updateAnswer("presumptiveScheme", value)}
                    columns="sm:grid-cols-2"
                  />
                </div>
              ) : null}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <div className="flex items-start gap-3">
                <Building2 className="mt-1 h-5 w-5 shrink-0 text-blue-700" />
                <div>
                  <h2 className="text-xl font-black text-slate-950">Blockers and disclosures</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    Select any special facts that usually move the return into detailed schedules or CA review.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
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
            </section>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-500">Recommended form</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-lg border px-4 py-2 text-3xl font-black", resultTone(recommendation))}>
                    {formLabel(recommendation)}
                  </span>
                  <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{resultStatus}</Badge>
                </div>
              </div>
              <FileCheck2 className="h-8 w-8 shrink-0 text-blue-700" />
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                <div>
                  <p className="text-sm font-black text-slate-950">Selection basis</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    This panel uses the same ITR-1 to ITR-4 rule engine as the signed-in filing workspace.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <RecommendationList
                title="Reasons"
                items={recommendation.reasons}
                empty="Select facts above to build a clearer recommendation."
              />

              <RecommendationList
                title="Blockers"
                items={recommendation.blockers}
                empty="No blockers for the currently recommended form."
              />

              <RecommendationList
                title="Required schedules"
                items={recommendation.requiredSchedules}
                empty="Schedules will appear as facts are selected."
              />
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                {recommendation.exportAvailable ? (
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                )}
                <div>
                  <p className="text-sm font-black text-slate-950">Export status</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    {recommendation.exportStatus.reason}
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleContinue}
              disabled={isLoading}
              className="mt-5 h-12 w-full rounded-lg bg-slate-900 font-black text-white hover:bg-slate-800"
            >
              Continue to MY ITR
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
              Your selector answers are saved briefly and resumed after login. Form selection is guidance for the MyeCA draft and CA-assisted review flow. Official portal filing remains a separate authorized workflow.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
