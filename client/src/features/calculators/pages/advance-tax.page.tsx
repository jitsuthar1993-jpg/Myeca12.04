import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Calculator, Calendar, IndianRupee, AlertTriangle, CheckCircle,
  Bell, FileText, Wallet, Sparkles, TrendingUp,
  ShieldCheck, Zap, Receipt, Shield, FileSpreadsheet, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { TAX_PERIOD_DATASETS } from "@/data/calculator-rule-datasets";
import { projectAdvanceTax } from "@/lib/advance-tax-projection";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

const LEGACY_RULES = TAX_PERIOD_DATASETS.legacyAy2026_27;
if (LEGACY_RULES.period.kind !== "financial-assessment-year") {
  throw new Error("The legacy advance-tax dataset must use a financial/assessment-year period.");
}
const DEFAULT_FINANCIAL_YEAR = LEGACY_RULES.period.financialYear;
const DEFAULT_ASSESSMENT_YEAR = LEGACY_RULES.period.assessmentYear;
// This route remains on the verified AY 2026-27 / FY 2025-26 filing dataset.
// Tax Year 2026-27 must not be enabled until its separate engine dataset exists.

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const parseNonNegativeAmount = (value: string) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
};

interface TaxInputs {
  estimatedTaxLiability: number;
  tdsDeducted: number;
  tcsCollected: number;
  selfAssessmentPaid: number;
  advanceTaxPaid: { q1: number; q2: number; q3: number; q4: number };
}

export default function AdvanceTaxCalculatorPage() {
  const [inputs, setInputs] = useState<TaxInputs>({
    estimatedTaxLiability: 250000,
    tdsDeducted: 150000,
    tcsCollected: 0,
    selfAssessmentPaid: 0,
    advanceTaxPaid: { q1: 0, q2: 0, q3: 0, q4: 0 },
  });

  const [financialYear, setFinancialYear] = useState(DEFAULT_FINANCIAL_YEAR);

  const calculations = useMemo(() => {
    return projectAdvanceTax({
      dataset: LEGACY_RULES,
      period: {
        kind: "financial-assessment-year",
        financialYear,
        assessmentYear: DEFAULT_ASSESSMENT_YEAR,
      },
      totalTax: inputs.estimatedTaxLiability,
      tdsAndTcs: inputs.tdsDeducted + inputs.tcsCollected,
      paidInstallments: [
        inputs.advanceTaxPaid.q1,
        inputs.advanceTaxPaid.q2,
        inputs.advanceTaxPaid.q3,
        inputs.advanceTaxPaid.q4,
      ],
      selfAssessmentPaid: inputs.selfAssessmentPaid,
    });
  }, [inputs, financialYear]);

  const seo = getSEOConfig('/calculators/advance-tax');
  if (calculations.status === "unavailable") {
    return (
      <>
        <MetaSEO
          title={seo?.title || "Advance Tax Calculator | MyeCA.in"}
          description={seo?.description || "Advance-tax projection availability."}
          noindex
        />
        <main className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-3xl font-semibold text-slate-900">Advance-tax projection unavailable</h1>
          <p className="mt-4 text-slate-600">{calculations.reason}</p>
        </main>
      </>
    );
  }

  const quarterlyAnalysis = calculations.installments;
  return (
    <>
      <MetaSEO
        title={seo?.title || "FY 2025-26 Advance Tax Reconciliation | MyeCA.in"}
        description={seo?.description || "Reconcile the historical FY 2025-26 advance-tax schedule for AY 2026-27."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero
        title="FY 2025-26 Advance Tax Reconciliation"
        description="Compare recorded payments with the historical AY 2026-27 installment schedule. Tax Year 2026-27 is not enabled."
        category="Tax Compliance"
        icon={<Calculator className="w-6 h-6" />}
        variant="indigo"
        breadcrumbItems={[{ name: "Advance Tax" }]}
        compact
      />

      <CalcLayout
        variant="indigo"
        complianceFacts={[
          { title: "Historical period only", content: "This reconciliation uses FY 2025-26 / AY 2026-27 rules under the Income-tax Act, 1961." },
          { title: "Official rule sources", content: "The threshold is sourced to section 208 and the installment schedule to section 211, checked 13 July 2026." },
          { title: "Excluded calculation", content: "Interest, late charges, exceptions and Tax Year 2026-27 are not calculated here." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Compliance Overview">
            <div className="space-y-1 pb-6 border-b border-white/20">
              <p className="type-meta font-normal uppercase tracking-widest text-slate-400">Net Tax Liability</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={calculations.netTaxLiability}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-normal text-slate-900 tracking-tight tabular-nums"
                >
                  {formatCurrency(calculations.netTaxLiability)}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="space-y-4 pt-6">
              <CalcResultRow label="Total Tax (incl. Cess)" value={formatCurrency(calculations.totalTax)} />
              <CalcResultRow label="Paid Till Date" value={formatCurrency(calculations.totalAdvanceTaxPaid)} variant="success" />
              <CalcResultRow label="Balance Payable" value={formatCurrency(calculations.balanceTax)} variant="highlight" />

              {!calculations.meetsAdvanceTaxThreshold && (
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 mt-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="type-meta font-normal uppercase leading-relaxed tracking-widest text-emerald-700">Below the ₹10,000 net-tax threshold</p>
                    <p className="mt-1 text-xs leading-5 text-emerald-800">This does not determine legal eligibility; exemptions are not modeled.</p>
                  </div>
                </div>
              )}

              {calculations.meetsAdvanceTaxThreshold && (
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-600" />
                    <p className="type-meta font-normal uppercase tracking-widest text-amber-700">Historical schedule</p>
                  </div>
                  <p className="text-sm font-normal text-slate-900">FY 2025-26 installment dates have passed.</p>
                  <p className="type-meta font-normal italic text-slate-500">The net-tax amount meets the schedule threshold. This does not determine legal eligibility; exemptions are not modeled. Verify interest and balance payable on the official portal.</p>
                </div>
              )}
            </div>

            <Link href="/services/tax-planning">
              <button className="w-full py-4 rounded-2xl bg-blue-700 text-white font-normal text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Plan Tax with CA
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="Tax Configuration" icon={<ShieldCheck className="w-5 h-5" />}>
             <div className="space-y-4 mb-8">
                <label className="type-meta px-1 font-normal uppercase tracking-widest text-slate-400">Tax period</label>
                <div className="grid grid-cols-2 gap-3">
                  {([DEFAULT_FINANCIAL_YEAR] as const).map((fy) => (
                    <button
                      key={fy}
                      onClick={() => setFinancialYear(fy)}
                      className={cn(
                        "py-3 rounded-2xl border-2 transition-all font-normal text-sm",
                        financialYear === fy ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" : "border-slate-100 bg-slate-50 text-slate-500 hover:border-indigo-200"
                      )}
                    >
                      FY {fy} / AY 2026-27 (Income-tax Act, 1961)
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                  Rules checked {LEGACY_RULES.checkedOn}.{" "}
                  {LEGACY_RULES.officialSources.map((source, index) => (
                    <React.Fragment key={source.url}>
                      {index > 0 ? " · " : ""}
                      <a href={source.url} target="_blank" rel="noreferrer" className="font-medium text-blue-700 underline">
                        {source.title}
                      </a>
                    </React.Fragment>
                  ))}
                </div>
             </div>

             <CalcInputGroup label="Estimated Tax Liability Before TDS / TCS" badgeValue={formatCurrency(inputs.estimatedTaxLiability)}>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    value={inputs.estimatedTaxLiability}
                    onChange={(e) => setInputs({...inputs, estimatedTaxLiability: parseNonNegativeAmount(e.target.value)})}
                    className="h-14 pl-10 rounded-xl border-slate-100 bg-slate-50 font-normal text-lg focus:ring-2 focus:ring-indigo-100"
                  />
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
             </CalcInputGroup>

             <CalcInputGroup label="TDS / TCS Deducted" badgeValue={formatCurrency(inputs.tdsDeducted)}>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    value={inputs.tdsDeducted}
                    onChange={(e) => setInputs({...inputs, tdsDeducted: parseNonNegativeAmount(e.target.value)})}
                    className="h-14 pl-10 rounded-xl border-slate-100 bg-slate-50 font-normal text-lg focus:ring-2 focus:ring-indigo-100"
                  />
                  <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
             </CalcInputGroup>
          </CalcInputCard>

          <CalcInputCard title="Installment Tracking" icon={<Calendar className="w-5 h-5" />}>
             <div className="grid grid-cols-2 gap-4 mb-8">
                {(['q1', 'q2', 'q3', 'q4'] as const).map((q, i) => (
                  <div key={q} className="space-y-2">
                    <label className="type-meta px-1 font-normal uppercase tracking-widest text-slate-400">
                      {quarterlyAnalysis[i].quarter} Paid (INR)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={inputs.advanceTaxPaid[q]}
                      onChange={(e) => setInputs({
                        ...inputs,
                        advanceTaxPaid: { ...inputs.advanceTaxPaid, [q]: parseNonNegativeAmount(e.target.value) }
                      })}
                      className="h-12 rounded-xl border-slate-100 bg-slate-50 font-normal text-sm focus:ring-2 focus:ring-indigo-100"
                      placeholder="0"
                    />
                  </div>
                ))}
             </div>

             <div className="space-y-6 pt-6 border-t border-slate-50">
                <label className="type-meta px-1 font-normal uppercase tracking-widest text-slate-400">Payment Progress</label>
                <div className="space-y-4">
                  {quarterlyAnalysis.map((q, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-normal">
                        <span className="text-slate-600">{q.quarter} Cumulative ({q.cumulativePercent}%)</span>
                        <span className="text-slate-900">{formatCurrency(q.cumulativeAmount)}</span>
                      </div>
                      <Progress value={q.cumulativeAmount > 0 ? (q.paidTillQuarter / q.cumulativeAmount) * 100 : 0} className="h-2 bg-slate-100" />
                      {q.shortfall > 0 && (
                        <p className="type-meta font-normal uppercase tracking-widest text-red-500">Shortfall: {formatCurrency(q.shortfall)}</p>
                      )}
                    </div>
                  ))}
                </div>
             </div>
          </CalcInputCard>
        </div>

        <CalculatorMiniBlog
          features={[
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              iconBg: "bg-indigo-50 text-indigo-600",
              title: "Historical Schedule",
              desc: "Use the FY 2025-26 schedule to reconcile recorded installments; this page does not calculate interest or late charges."
            },
            {
              icon: <TrendingUp className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Cash Flow Management",
              desc: "Quarterly payments prevent a huge tax burden at the end of the year, making it easier to manage your business or personal finances."
            },
            {
              icon: <FileSpreadsheet className="w-5 h-5" />,
              iconBg: "bg-blue-50 text-blue-600",
              title: "Easy Reconciliation",
              desc: "Keeping track of advance tax makes filing your Income Tax Return (ITR) much faster and ensures no tax credits are missed."
            }
          ]}
          howItWorks={{
            title: "What this reconciliation covers",
            description: "The page compares recorded payments with the section 211 cumulative schedule for FY 2025-26.",
            steps: [
              { title: "Verified period", desc: "FY 2025-26 / AY 2026-27 under the Income-tax Act, 1961." },
              { title: "Recorded payments", desc: "Enter installments already paid to see cumulative shortfalls against the historical schedule." },
              { title: "Portal verification", desc: "Confirm challans, balance, exceptions and any interest on the official e-filing portal." }
            ]
          }}
          faqs={[
            { q: "Which period does this page cover?", a: "Only FY 2025-26 / AY 2026-27. It does not calculate Tax Year 2026-27." },
            { q: "Does this calculate interest or penalties?", a: "No. Verify any interest, exception or final balance on the official e-filing portal or with a tax professional." },
            { q: "Where do the schedule rules come from?", a: "The central dataset links the Income Tax Department pages for sections 208 and 211." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
