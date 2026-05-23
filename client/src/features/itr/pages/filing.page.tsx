import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Home,
  IndianRupee,
  ReceiptText,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  MyeCard,
  SectionHeading,
  StatusBadge,
  formatInr,
} from "@/components/platform/compliance-ui";
import { Layout } from "@/components/admin/Layout";
import { cn } from "@/lib/utils";

export const ITR_FILING_STEPS = [
  {
    id: "sources",
    title: "Income Sources",
    description: "Select salary, capital gains, business, property, other, and foreign income so MY ITR can choose the right path.",
  },
  {
    id: "profile",
    title: "Profile & Bank",
    description: "Confirm PAN, Aadhaar-link status, contact details, and refund bank account.",
  },
  {
    id: "documents",
    title: "Documents",
    description: "Upload or mark Form 16, AIS, 26AS, bank statements, and deduction proofs before return preparation.",
  },
  {
    id: "income",
    title: "Income Details",
    description: "Fill salary, interest, capital gains, business/profession, rental, and other income details.",
  },
  {
    id: "deductions",
    title: "Deductions & Regime",
    description: "Capture 80C, 80D, HRA, home loan, rent receipts, and compare old vs new regime.",
  },
  {
    id: "tax-paid",
    title: "AIS, 26AS & Tax Paid",
    description: "Match TDS/TCS, advance tax, self-assessment tax, and mismatch flags.",
  },
  {
    id: "review",
    title: "Review & CA Handoff",
    description: "Review the draft, request expert assistance, pay if needed, and submit for filing support.",
  },
  {
    id: "e-verify",
    title: "E-Verify & Track",
    description: "After filing, complete e-verification within 30 days and track acknowledgement or refund status.",
  },
] as const;

export const ITR_DOCUMENT_CHECKLIST = [
  {
    id: "form16",
    title: "Form 16 Part A/B",
    description: "Salary and employer TDS certificate. If unavailable, keep salary slips and employer tax computation ready.",
    required: true,
  },
  {
    id: "ais",
    title: "AIS / TIS statement",
    description: "Annual information statement for interest, dividends, securities, foreign remittances, and reported transactions.",
    required: true,
  },
  {
    id: "form26as",
    title: "Form 26AS",
    description: "TDS, TCS, advance tax, and self-assessment tax credits to reconcile before submission.",
    required: true,
  },
  {
    id: "bank",
    title: "Bank statements",
    description: "Salary credits, interest income, refunds, rent receipts, and tax payment proofs.",
    required: true,
  },
  {
    id: "deductions",
    title: "Deduction proofs",
    description: "80C, 80D, NPS, donations, education loan, home loan, HRA, and rent documents.",
    required: false,
  },
  {
    id: "capital-gains",
    title: "Capital gains reports",
    description: "Broker P&L, mutual fund statements, property sale deed, purchase deed, and expense proofs where applicable.",
    required: false,
  },
] as const;

export const ITR_FILING_LAYOUT = {
  usesDedicatedLeftRail: false,
  usesAuthenticatedWorkspaceShell: true,
  tone: "professional",
} as const;

const INCOME_SOURCE_OPTIONS = [
  { id: "salary", label: "Salary / Pension", helper: "Form 16, salary slips, employer TDS" },
  { id: "capitalGains", label: "Capital Gains / Losses", helper: "Shares, mutual funds, F&O, property, crypto" },
  { id: "business", label: "Business / Profession", helper: "Books, presumptive income, invoices" },
  { id: "houseProperty", label: "House Property", helper: "Home loan, rent received, municipal tax" },
  { id: "otherSources", label: "Other Sources", helper: "Interest, dividends, gifts, winnings" },
  { id: "foreignIncome", label: "Foreign Income", helper: "Foreign assets, RSUs, NRI/RNOR details" },
] as const;

const newRegimeSlabs = [
  "Rs 0-4L: Nil",
  "Rs 4-8L: 5%",
  "Rs 8-12L: 10%",
  "Rs 12-16L: 15%",
  "Rs 16-20L: 20%",
  "Rs 20-24L: 25%",
  "Above Rs 24L: 30%",
];

const trackProductionEvent = (
  eventName: string,
  properties?: Record<string, string | number | boolean | null>,
) => {
  if (!import.meta.env.PROD) return;

  void import("@vercel/analytics")
    .then(({ track }) => track(eventName, properties))
    .catch(() => undefined);
};

function estimateNewRegimeTax(income: number) {
  const slabs = [
    [400000, 0],
    [400000, 0.05],
    [400000, 0.1],
    [400000, 0.15],
    [400000, 0.2],
    [400000, 0.25],
  ];
  let remaining = income;
  let tax = 0;
  for (const [amount, rate] of slabs) {
    const taxable = Math.min(Math.max(remaining, 0), amount);
    tax += taxable * rate;
    remaining -= amount;
  }
  if (remaining > 0) tax += remaining * 0.3;
  if (income <= 700000) return 0;
  return Math.round(tax * 1.04);
}

function estimateOldRegimeTax(income: number, deductions: number) {
  const taxable = Math.max(0, income - deductions - 50000);
  let tax = 0;
  if (taxable > 1000000) tax += (taxable - 1000000) * 0.3 + 112500;
  else if (taxable > 500000) tax += (taxable - 500000) * 0.2 + 12500;
  else if (taxable > 250000) tax += (taxable - 250000) * 0.05;
  if (taxable <= 500000) return 0;
  return Math.round(tax * 1.04);
}

export default function ITRFilingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [sourceSelections, setSourceSelections] = useState<Record<string, boolean>>({
    salary: true,
    capitalGains: false,
    business: false,
    houseProperty: false,
    otherSources: true,
    foreignIncome: false,
  });
  const [profileDraft, setProfileDraft] = useState({
    pan: "",
    aadhaarStatus: "Linked",
    mobile: "",
    bankAccount: "",
    ifsc: "",
  });
  const [documentFiles, setDocumentFiles] = useState<Record<string, string>>({});
  const [salaryIncome, setSalaryIncome] = useState(1200000);
  const [interestIncome, setInterestIncome] = useState(25000);
  const [capitalGainsIncome, setCapitalGainsIncome] = useState(0);
  const [deductions, setDeductions] = useState(250000);
  const [rentAmount, setRentAmount] = useState(300000);
  const [tdsPaid, setTdsPaid] = useState(95000);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const progress = ((currentStep + 1) / ITR_FILING_STEPS.length) * 100;

  const totalIncome = salaryIncome + interestIncome + capitalGainsIncome;
  const readyDocumentCount = Object.keys(documentFiles).length;
  const requiredDocumentsReady = ITR_DOCUMENT_CHECKLIST
    .filter((document) => document.required)
    .every((document) => documentFiles[document.id]);
  const selectedSourceCount = Object.values(sourceSelections).filter(Boolean).length;

  const regime = useMemo(() => {
    const newTax = estimateNewRegimeTax(totalIncome);
    const oldTax = estimateOldRegimeTax(totalIncome, deductions);
    return {
      newTax,
      oldTax,
      better: newTax <= oldTax ? "New Regime" : "Old Regime",
      savings: Math.abs(newTax - oldTax),
      estimatedPayable: Math.max(0, Math.min(newTax, oldTax) - tdsPaid),
    };
  }, [totalIncome, deductions, tdsPaid]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(
        "mye_itr_draft",
        JSON.stringify({
          currentStep,
          sourceSelections,
          profileDraft,
          documentFiles,
          salaryIncome,
          interestIncome,
          capitalGainsIncome,
          deductions,
          rentAmount,
          tdsPaid,
          assessmentYear: "2026-27",
          updatedAt: new Date().toISOString(),
        }),
      );
      setLastSavedAt(new Date());
      trackProductionEvent("itr_draft_autosaved", { step: ITR_FILING_STEPS[currentStep].id });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [
    currentStep,
    sourceSelections,
    profileDraft,
    documentFiles,
    salaryIncome,
    interestIncome,
    capitalGainsIncome,
    deductions,
    rentAmount,
    tdsPaid,
  ]);

  const nextStep = () => {
    if (currentStep < ITR_FILING_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      trackProductionEvent("itr_wizard_step_next", { step: ITR_FILING_STEPS[next].id });
    }
  };

  const previousStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const submitForReview = () => {
    trackProductionEvent("itr_review_payment_start", { method: "assisted_handoff", regime: regime.better });
    window.location.href = "/itr/success";
  };

  const currentStepId = ITR_FILING_STEPS[currentStep].id;

  return (
    <Layout title="MY ITR">
      <div className="space-y-6 pb-28 md:pb-0">
        <MyeCard className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="type-meta font-black uppercase text-[#0050b5]">
                MyeCA filing workspace
              </p>
              <h1 className="type-page-title mt-2 font-black text-slate-950">MY ITR filing workspace</h1>
              <p className="type-body mt-3 max-w-3xl text-slate-600">
                A signed-in AY 2026-27 flow for source selection, document collection, return preparation, CA review, filing handoff, and e-verification tracking.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 type-support text-slate-700">
              <Save className="mr-2 inline h-4 w-4" />
              {lastSavedAt ? `Autosaved ${lastSavedAt.toLocaleTimeString()}` : "Autosave ready"}
            </div>
          </div>
        </MyeCard>

        <MyeCard className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="type-meta font-black uppercase text-[#0050b5]">
                MY ITR progress
              </p>
              <h2 className="mt-2 type-section-title font-black text-slate-950">
                Step {currentStep + 1} of {ITR_FILING_STEPS.length}
              </h2>
            </div>
            <StatusBadge status="in_progress" label={ITR_FILING_STEPS[currentStep].title} />
          </div>
          <Progress value={progress} className="mt-4 h-2" />
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {ITR_FILING_STEPS.map((step, index) => (
              <button
                key={step.id}
                type="button"
                aria-current={index === currentStep ? "step" : undefined}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition",
                  index === currentStep && "border-blue-200 bg-blue-50 text-slate-950 shadow-sm",
                  index < currentStep && "border-emerald-200 bg-emerald-50 text-emerald-900",
                  index > currentStep && "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-[#315efb]">
                  {index < currentStep ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </span>
                <span>
                  <span className="block font-black">{step.title}</span>
                  <span className="mt-1 hidden type-meta opacity-80 lg:block">{step.description}</span>
                </span>
              </button>
            ))}
          </div>
        </MyeCard>

        <MyeCard>
            <SectionHeading
              eyebrow="Current step"
              title={ITR_FILING_STEPS[currentStep].title}
              description={ITR_FILING_STEPS[currentStep].description}
            />

            {currentStepId === "sources" && (
              <div className="mt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {INCOME_SOURCE_OPTIONS.map((source) => {
                    const selected = Boolean(sourceSelections[source.id]);
                    return (
                      <div
                        key={source.id}
                        className={cn(
                          "rounded-2xl border p-5",
                          selected ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50",
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-black text-slate-950">{source.label}</p>
                            <p className="mt-1 type-support text-slate-600">{source.helper}</p>
                          </div>
                          <StatusBadge status={selected ? "in_progress" : "not_started"} label={selected ? "Yes" : "No"} />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            className={cn(
                              "h-10 rounded-lg border px-4 text-sm font-bold transition",
                              selected
                                ? "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
                            )}
                            onClick={() => setSourceSelections((prev) => ({ ...prev, [source.id]: true }))}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            className={cn(
                              "h-10 rounded-lg border px-4 text-sm font-bold transition",
                              !selected
                                ? "border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
                            )}
                            onClick={() => setSourceSelections((prev) => ({ ...prev, [source.id]: false }))}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <BadgeCheck className="h-7 w-7 text-emerald-800" />
                  <p className="mt-3 font-black text-emerald-950">
                    {selectedSourceCount} source{selectedSourceCount === 1 ? "" : "s"} selected
                  </p>
                  <p className="mt-1 type-support text-emerald-900">
                    The selected sources decide whether a simple ITR-1 path is enough or whether MY ITR should prepare for ITR-2/3/4 style details.
                  </p>
                </div>
              </div>
            )}

            {currentStepId === "profile" && (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="pan">PAN</Label>
                  <Input
                    id="pan"
                    placeholder="ABCDE1234F"
                    value={profileDraft.pan}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, pan: event.target.value.toUpperCase() }))}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="aadhaarStatus">Aadhaar link status</Label>
                  <Input
                    id="aadhaarStatus"
                    value={profileDraft.aadhaarStatus}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, aadhaarStatus: event.target.value }))}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile for OTP updates</Label>
                  <Input
                    id="mobile"
                    placeholder="9876543210"
                    value={profileDraft.mobile}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, mobile: event.target.value }))}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccount">Refund bank account</Label>
                  <Input
                    id="bankAccount"
                    placeholder="Bank account number"
                    value={profileDraft.bankAccount}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, bankAccount: event.target.value }))}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="ifsc">IFSC code</Label>
                  <Input
                    id="ifsc"
                    placeholder="ABCD0123456"
                    value={profileDraft.ifsc}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, ifsc: event.target.value.toUpperCase() }))}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
              </div>
            )}

            {currentStepId === "documents" && (
              <div className="mt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {ITR_DOCUMENT_CHECKLIST.map((document) => {
                    const uploaded = documentFiles[document.id];
                    return (
                      <div key={document.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <FileText className="h-6 w-6 text-[#315efb]" />
                            <p className="mt-3 font-black text-slate-950">{document.title}</p>
                            <p className="mt-1 type-support text-slate-600">{document.description}</p>
                          </div>
                          <StatusBadge
                            status={uploaded ? "filed" : document.required ? "action_required" : "not_started"}
                            label={uploaded ? "Ready" : document.required ? "Required" : "Optional"}
                          />
                        </div>
                        <Input
                          type="file"
                          className="mt-4 h-11 rounded-lg bg-white"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            setDocumentFiles((prev) => {
                              const next = { ...prev };
                              if (file) next[document.id] = file.name;
                              else delete next[document.id];
                              return next;
                            });
                          }}
                        />
                        {uploaded && <p className="mt-2 type-meta font-semibold text-emerald-700">{uploaded}</p>}
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <p className="font-black text-blue-950">{readyDocumentCount} of {ITR_DOCUMENT_CHECKLIST.length} document groups ready</p>
                  <p className="mt-1 type-support text-blue-900">
                    {requiredDocumentsReady
                      ? "Required documents are marked ready. Optional proofs can still be added before review."
                      : "Complete the required documents before submitting your return for review."}
                  </p>
                  <Link href="/documents">
                    <Button variant="outline" className="mt-4 border-blue-200 bg-white text-blue-700 hover:bg-blue-100">
                      Open Document Vault
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {currentStepId === "income" && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="salaryIncome">Salary / pension income</Label>
                    <Input
                      id="salaryIncome"
                      type="number"
                      value={salaryIncome}
                      onChange={(event) => setSalaryIncome(Number(event.target.value))}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="interestIncome">Interest / other income</Label>
                    <Input
                      id="interestIncome"
                      type="number"
                      value={interestIncome}
                      onChange={(event) => setInterestIncome(Number(event.target.value))}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capitalGainsIncome">Capital gains estimate</Label>
                    <Input
                      id="capitalGainsIncome"
                      type="number"
                      value={capitalGainsIncome}
                      onChange={(event) => setCapitalGainsIncome(Number(event.target.value))}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
                  <p className="type-support font-semibold text-slate-500">Total income captured so far</p>
                  <p className="mt-2 text-4xl font-black text-slate-950">{formatInr(totalIncome)}</p>
                  <p className="mt-2 type-support text-slate-600">
                    Add business, house property, or foreign income in the selected-source path before CA review if those apply.
                  </p>
                </div>
              </div>
            )}

            {currentStepId === "deductions" && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="deductions">Old regime deductions</Label>
                    <Input
                      id="deductions"
                      type="number"
                      value={deductions}
                      onChange={(event) => setDeductions(Number(event.target.value))}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rentAmount">Annual rent paid</Label>
                    <Input
                      id="rentAmount"
                      type="number"
                      value={rentAmount}
                      onChange={(event) => setRentAmount(Number(event.target.value))}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-6">
                    <p className="font-black text-[#315efb]">New Regime tax</p>
                    <p className="mt-3 text-4xl font-black text-slate-950">{formatInr(regime.newTax)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {newRegimeSlabs.map((slab) => (
                        <span key={slab} className="rounded-full bg-white px-3 py-1 type-meta font-bold text-slate-700">
                          {slab}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6">
                    <p className="font-black text-emerald-900">Old Regime tax</p>
                    <p className="mt-3 text-4xl font-black text-slate-950">{formatInr(regime.oldTax)}</p>
                    <p className="mt-4 type-support text-emerald-900">
                      Includes standard deduction and your declared Chapter VIA/HRA estimate.
                    </p>
                  </div>
                </div>
                <div className="rounded-[24px] border border-blue-200 bg-white p-6">
                  <BadgeCheck className="h-8 w-8 text-emerald-700" />
                  <p className="mt-3 type-section-title font-black text-slate-950">{regime.better} currently looks better</p>
                  <p className="mt-2 text-slate-600">
                    Estimated advantage: {formatInr(regime.savings)}. Final selection remains CA-reviewed.
                  </p>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                  <Home className="h-8 w-8 text-emerald-800" />
                  <p className="mt-4 type-section-title font-black text-slate-950">HRA receipt generator</p>
                  <p className="mt-2 text-slate-600">
                    Generate rent receipts from the filing flow and save them directly into the document vault.
                  </p>
                  <Link href="/documents/generator/rent-receipt">
                    <Button variant="outline" className="mt-5 border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
                      Open Generator
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {currentStepId === "tax-paid" && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    ["AIS import", "Compare reported salary, interest, dividends, securities, and foreign remittance values.", "ai_validation"],
                    ["Form 26AS", "Match TDS/TCS and tax payments against your declared income.", "in_progress"],
                    ["Advance tax", "Add challans for advance tax and self-assessment tax paid manually.", "not_started"],
                  ].map(([title, description, status]) => (
                    <div key={title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <CalendarCheck className="h-7 w-7 text-[#315efb]" />
                      <p className="mt-4 type-card-title font-black text-slate-950">{title}</p>
                      <p className="mt-2 type-support text-slate-600">{description}</p>
                      <StatusBadge status={status as any} className="mt-4" />
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="tdsPaid">TDS / tax paid visible in AIS or 26AS</Label>
                  <Input
                    id="tdsPaid"
                    type="number"
                    value={tdsPaid}
                    onChange={(event) => setTdsPaid(Number(event.target.value))}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
              </div>
            )}

            {currentStepId === "review" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                  <ShieldCheck className="h-8 w-8 text-emerald-800" />
                  <h3 className="mt-4 type-section-title font-black text-slate-950">Ready for review</h3>
                  <p className="mt-2 text-slate-600">
                    MY ITR has saved your source selections, profile details, document checklist, tax estimate, and filing notes.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <StatusBadge status={selectedSourceCount ? "in_progress" : "action_required"} label={`${selectedSourceCount} income sources`} />
                    <StatusBadge status={requiredDocumentsReady ? "filed" : "action_required"} label={requiredDocumentsReady ? "Documents ready" : "Documents pending"} />
                    <StatusBadge status="ca_review" label="CA review next" />
                    <StatusBadge status="submitted" label="Filing handoff ready" />
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-white p-6">
                  <IndianRupee className="h-8 w-8 text-emerald-700" />
                  <p className="mt-4 type-support font-black uppercase tracking-widest text-slate-500">
                    Estimated tax payable
                  </p>
                  <p className="mt-2 text-4xl font-black text-slate-950">{formatInr(regime.estimatedPayable)}</p>
                  <p className="mt-2 text-slate-600">Final liability and filing status must be checked before submission.</p>
                  <button
                    type="button"
                    onClick={submitForReview}
                    className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                  >
                    Submit for CA Review
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {currentStepId === "e-verify" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                  <CheckCircle2 className="h-8 w-8 text-emerald-800" />
                  <h3 className="mt-4 type-section-title font-black text-slate-950">After filing, e-verify within 30 days</h3>
                  <p className="mt-2 text-slate-600">
                    Complete e-verification through Aadhaar OTP, net banking, bank account EVC, demat EVC, DSC, or ITR-V where applicable. An unverified return may be treated as not filed.
                  </p>
                  <div className="mt-5 grid gap-3">
                    {["Aadhaar OTP", "Net banking", "Bank account EVC", "Demat account EVC", "DSC / ITR-V if applicable"].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-4">
                        <ReceiptText className="h-5 w-5 text-[#315efb]" />
                        <span className="font-semibold text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-white p-6">
                  <FileText className="h-8 w-8 text-[#315efb]" />
                  <p className="mt-4 type-section-title font-black text-slate-950">Track acknowledgement and refund</p>
                  <p className="mt-2 text-slate-600">
                    Keep acknowledgement number, e-verification status, and refund status visible from the ITR tracker.
                  </p>
                  <Link href="/itr/status-tracker">
                    <Button variant="outline" className="mt-6 w-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                      Open ITR Tracker
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </MyeCard>

          <div className="fixed inset-x-4 bottom-20 z-40 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_16px_50px_-35px_rgba(15,23,42,0.6)] backdrop-blur md:sticky md:inset-x-auto md:z-20 md:pr-48 lg:bottom-4">
            <button
              type="button"
              onClick={previousStep}
              disabled={currentStep === 0}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            {currentStep < ITR_FILING_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link href="/itr/status-tracker">
                <button type="button" className="flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100">
                  Track ITR
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </Link>
            )}
          </div>
      </div>
    </Layout>
  );
}
