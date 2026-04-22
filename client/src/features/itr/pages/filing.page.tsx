import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { track } from "@vercel/analytics";
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
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ComplianceShell,
  MyeCard,
  SectionHeading,
  StatusBadge,
  UploadDropzone,
  formatInr,
} from "@/components/platform/compliance-ui";

const steps = [
  {
    id: "profile",
    title: "Profile Verification",
    description: "Confirm PAN, Aadhaar-link status, address, and filing persona.",
  },
  {
    id: "regime",
    title: "Old vs New Regime",
    description: "Compare tax liability under FY 2025-26 default new regime slabs.",
  },
  {
    id: "income",
    title: "Income & Form 16",
    description: "Upload Form 16 Part A/B and reconcile salary income with AIS.",
  },
  {
    id: "deductions",
    title: "Deductions & HRA",
    description: "Capture 80C, 80D, HRA, home loan, and rent receipt details.",
  },
  {
    id: "tax-paid",
    title: "AIS, 26AS & Tax Paid",
    description: "Review TDS, advance tax, self-assessment tax, and mismatch flags.",
  },
  {
    id: "review",
    title: "Review, Pay & CA Handoff",
    description: "Submit for CA review and checkout through Razorpay UPI Intent.",
  },
];

const newRegimeSlabs = [
  "₹0-4L: Nil",
  "₹4-8L: 5%",
  "₹8-12L: 10%",
  "₹12-16L: 15%",
  "₹16-20L: 20%",
  "₹20-24L: 25%",
  "Above ₹24L: 30%",
];

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
    remaining -= taxable;
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
  const [salaryIncome, setSalaryIncome] = useState(1200000);
  const [deductions, setDeductions] = useState(250000);
  const [rentAmount, setRentAmount] = useState(300000);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const regime = useMemo(() => {
    const newTax = estimateNewRegimeTax(salaryIncome);
    const oldTax = estimateOldRegimeTax(salaryIncome, deductions);
    return {
      newTax,
      oldTax,
      better: newTax <= oldTax ? "New Regime" : "Old Regime",
      savings: Math.abs(newTax - oldTax),
    };
  }, [salaryIncome, deductions]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(
        "mye_itr_draft",
        JSON.stringify({
          currentStep,
          salaryIncome,
          deductions,
          rentAmount,
          assessmentYear: "2026-27",
          updatedAt: new Date().toISOString(),
        }),
      );
      setLastSavedAt(new Date());
      track("itr_draft_autosaved", { step: steps[currentStep].id });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [currentStep, salaryIncome, deductions, rentAmount]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      track("itr_wizard_step_next", { step: steps[next].id });
    }
  };

  const previousStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const submitForReview = () => {
    track("itr_review_payment_start", { method: "upi_intent", regime: regime.better });
    window.location.href = "/itr/success";
  };

  return (
    <ComplianceShell
      active="/itr/filing"
      title="ITR filing wizard"
      subtitle="A guided AY 2026-27 / FY 2025-26 flow with autosave, smart branching, OCR-ready document upload, CA review, and mobile-first payment handoff."
      actions={
        <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/90">
          <Save className="mr-2 inline h-4 w-4" />
          {lastSavedAt ? `Autosaved ${lastSavedAt.toLocaleTimeString()}` : "Autosave ready"}
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <MyeCard className="h-max xl:sticky xl:top-24">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0050b5]">
            Filing progress
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">Step {currentStep + 1} of {steps.length}</h2>
          <Progress value={progress} className="mt-4 h-2" />
          <div className="mt-6 space-y-3">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left transition ${
                  index === currentStep
                    ? "bg-[#315efb] text-white"
                    : index < currentStep
                      ? "bg-emerald-50 text-emerald-900"
                      : "bg-slate-50 text-slate-600"
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/90 text-sm font-black text-[#315efb]">
                  {index < currentStep ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </span>
                <span>
                  <span className="block font-black">{step.title}</span>
                  <span className="mt-1 block text-xs opacity-80">{step.description}</span>
                </span>
              </button>
            ))}
          </div>
        </MyeCard>

        <div className="space-y-6">
          <MyeCard>
            <SectionHeading
              eyebrow="Current step"
              title={steps[currentStep].title}
              description={steps[currentStep].description}
            />

            {steps[currentStep].id === "profile" && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  ["PAN", "ABCDE1234F", "Verified"],
                  ["Aadhaar link", "Linked", "OTP-ready"],
                  ["Filing type", "Salaried individual", "ITR-1 recommended"],
                  ["Assessment year", "2026-27", "FY 2025-26"],
                ].map(([label, value, status]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">{label}</p>
                    <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
                    <StatusBadge status="filed" label={status} className="mt-4" />
                  </div>
                ))}
              </div>
            )}

            {steps[currentStep].id === "regime" && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="salaryIncome">Gross salary income</Label>
                    <Input
                      id="salaryIncome"
                      type="number"
                      value={salaryIncome}
                      onChange={(event) => setSalaryIncome(Number(event.target.value))}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
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
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-6">
                    <p className="font-black text-[#315efb]">New Regime tax</p>
                    <p className="mt-3 text-4xl font-black text-slate-950">{formatInr(regime.newTax)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {newRegimeSlabs.map((slab) => (
                        <span key={slab} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                          {slab}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6">
                    <p className="font-black text-emerald-900">Old Regime tax</p>
                    <p className="mt-3 text-4xl font-black text-slate-950">{formatInr(regime.oldTax)}</p>
                    <p className="mt-4 text-sm text-emerald-900">
                      Includes standard deduction and your declared Chapter VIA/HRA estimate.
                    </p>
                  </div>
                </div>
                <div className="rounded-[24px] bg-[#315efb] p-6 text-white">
                  <BadgeCheck className="h-8 w-8 text-emerald-200" />
                  <p className="mt-3 text-2xl font-black">{regime.better} currently looks better</p>
                  <p className="mt-2 text-blue-50">
                    Estimated advantage: {formatInr(regime.savings)}. Final selection remains CA-reviewed.
                  </p>
                </div>
              </div>
            )}

            {steps[currentStep].id === "income" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <UploadDropzone label="Upload Form 16 Part A & Part B" />
                <div className="space-y-4">
                  {[
                    ["Form 16 Part A", "Employer TDS certificate"],
                    ["Form 16 Part B", "Salary and deductions breakup"],
                    ["AIS statement", "Recommended for mismatch detection"],
                  ].map(([title, description]) => (
                    <div key={title} className="rounded-2xl border border-slate-200 p-4">
                      <FileText className="h-5 w-5 text-[#315efb]" />
                      <p className="mt-2 font-black text-slate-950">{title}</p>
                      <p className="text-sm text-slate-600">{description}</p>
                      <StatusBadge status="not_started" className="mt-3" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {steps[currentStep].id === "deductions" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
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
                  {[
                    "Tenant name",
                    "Landlord name",
                    "Rental period",
                    "Property address",
                    "Landlord PAN if annual rent exceeds ₹1,00,000",
                    "Revenue stamp prompt if cash payment exceeds ₹5,000",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                      <ReceiptText className="h-5 w-5 text-[#315efb]" />
                      <span className="font-semibold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-[28px] bg-gradient-to-br from-emerald-50 to-blue-50 p-6">
                  <Home className="h-8 w-8 text-emerald-800" />
                  <p className="mt-4 text-2xl font-black text-slate-950">HRA receipt generator</p>
                  <p className="mt-2 text-slate-600">
                    Generate valid rent receipts from the filing flow and save them directly into the document vault.
                  </p>
                  <Link href="/documents/generator/rent-receipt">
                    <Button className="mt-5 bg-[#315efb] text-white hover:bg-[#082a5c]">
                      Open Generator
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {steps[currentStep].id === "tax-paid" && (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  ["AIS import", "Connect when government integration credentials are available.", "ai_validation"],
                  ["Form 26AS", "TDS and TCS credits matched against salary data.", "in_progress"],
                  ["Advance tax", "Quarterly payments and challans can be added manually.", "not_started"],
                ].map(([title, description, status]) => (
                  <div key={title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <CalendarCheck className="h-7 w-7 text-[#315efb]" />
                    <p className="mt-4 text-lg font-black text-slate-950">{title}</p>
                    <p className="mt-2 text-sm text-slate-600">{description}</p>
                    <StatusBadge status={status as any} className="mt-4" />
                  </div>
                ))}
              </div>
            )}

            {steps[currentStep].id === "review" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                  <ShieldCheck className="h-8 w-8 text-emerald-800" />
                  <h3 className="mt-4 text-2xl font-black text-slate-950">Ready for CA review</h3>
                  <p className="mt-2 text-slate-600">
                    Your draft is autosaved. The next step opens a Razorpay UPI Intent handoff on mobile and marks the filing for CA review.
                  </p>
                  <div className="mt-5 space-y-3">
                    <StatusBadge status="ca_review" />
                    <StatusBadge status="submitted" label="Razorpay UPI Intent ready" />
                    <StatusBadge status="ai_validation" label="OCR/AIS checks retained" />
                  </div>
                </div>
                <div className="rounded-[28px] bg-[#315efb] p-6 text-white">
                  <IndianRupee className="h-8 w-8 text-emerald-200" />
                  <p className="mt-4 text-sm font-black uppercase tracking-widest text-blue-100">
                    Expert-assisted filing
                  </p>
                  <p className="mt-2 text-4xl font-black">₹999</p>
                  <p className="mt-2 text-blue-50">Includes named CA review, correction loop, and e-filing handoff.</p>
                  <Button onClick={submitForReview} className="mt-6 w-full bg-white text-[#315efb] hover:bg-blue-50">
                    Pay & Submit for CA Review
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </MyeCard>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={previousStep} disabled={currentStep === 0}>
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep} className="bg-[#315efb] text-white hover:bg-[#082a5c]">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submitForReview} className="bg-emerald-800 text-white hover:bg-emerald-900">
                Complete Filing
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </ComplianceShell>
  );
}
