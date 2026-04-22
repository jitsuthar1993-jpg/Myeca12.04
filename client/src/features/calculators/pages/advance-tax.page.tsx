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

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

// Advance Tax Due Dates for FY 2024-25
const ADVANCE_TAX_SCHEDULE = [
  { quarter: "Q1", dueDate: "June 15, 2024", cumulativePercent: 15, label: "First Installment" },
  { quarter: "Q2", dueDate: "September 15, 2024", cumulativePercent: 45, label: "Second Installment" },
  { quarter: "Q3", dueDate: "December 15, 2024", cumulativePercent: 75, label: "Third Installment" },
  { quarter: "Q4", dueDate: "March 15, 2025", cumulativePercent: 100, label: "Fourth Installment" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

interface TaxInputs {
  estimatedIncome: number;
  tdsDeducted: number;
  tcsCollected: number;
  selfAssessmentPaid: number;
  advanceTaxPaid: { q1: number; q2: number; q3: number; q4: number };
}

export default function AdvanceTaxCalculatorPage() {
  const [inputs, setInputs] = useState<TaxInputs>({
    estimatedIncome: 2000000,
    tdsDeducted: 150000,
    tcsCollected: 0,
    selfAssessmentPaid: 0,
    advanceTaxPaid: { q1: 0, q2: 0, q3: 0, q4: 0 },
  });

  const [regime, setRegime] = useState<"old" | "new">("new");

  const calculateTax = (income: number, selectedRegime: "old" | "new") => {
    let tax = 0;
    if (selectedRegime === "new") {
      const slabs = [
        { min: 0, max: 300000, rate: 0 },
        { min: 300000, max: 700000, rate: 5 },
        { min: 700000, max: 1000000, rate: 10 },
        { min: 1000000, max: 1200000, rate: 15 },
        { min: 1200000, max: 1500000, rate: 20 },
        { min: 1500000, max: Infinity, rate: 30 },
      ];
      const taxableIncome = Math.max(0, income - 75000); // Standard deduction
      for (const slab of slabs) {
        if (taxableIncome > slab.min) {
          const taxableInSlab = Math.min(taxableIncome - slab.min, slab.max - slab.min);
          tax += taxableInSlab * (slab.rate / 100);
        }
      }
      if (taxableIncome <= 700000) tax = Math.max(0, tax - 25000);
    } else {
      const slabs = [
        { min: 0, max: 250000, rate: 0 },
        { min: 250000, max: 500000, rate: 5 },
        { min: 500000, max: 1000000, rate: 20 },
        { min: 1000000, max: Infinity, rate: 30 },
      ];
      const taxableIncome = Math.max(0, income - 50000); // Standard deduction
      for (const slab of slabs) {
        if (taxableIncome > slab.min) {
          const taxableInSlab = Math.min(taxableIncome - slab.min, slab.max - slab.min);
          tax += taxableInSlab * (slab.rate / 100);
        }
      }
      if (taxableIncome <= 500000) tax = Math.max(0, tax - 12500);
    }
    return tax + (tax * 0.04);
  };

  const calculations = useMemo(() => {
    const totalTax = calculateTax(inputs.estimatedIncome, regime);
    const totalTdsAndTcs = inputs.tdsDeducted + inputs.tcsCollected;
    const netTaxLiability = Math.max(0, totalTax - totalTdsAndTcs);
    const advanceTaxRequired = netTaxLiability > 10000;
    
    const quarterlyAnalysis = ADVANCE_TAX_SCHEDULE.map((schedule, index) => {
      const previousPercent = index > 0 ? ADVANCE_TAX_SCHEDULE[index - 1].cumulativePercent : 0;
      const installmentPercent = schedule.cumulativePercent - previousPercent;
      const cumulativeAmount = (netTaxLiability * schedule.cumulativePercent) / 100;
      const paidTillQuarter = [
        inputs.advanceTaxPaid.q1,
        inputs.advanceTaxPaid.q1 + inputs.advanceTaxPaid.q2,
        inputs.advanceTaxPaid.q1 + inputs.advanceTaxPaid.q2 + inputs.advanceTaxPaid.q3,
        inputs.advanceTaxPaid.q1 + inputs.advanceTaxPaid.q2 + inputs.advanceTaxPaid.q3 + inputs.advanceTaxPaid.q4,
      ][index];
      
      const shortfall = Math.max(0, cumulativeAmount - paidTillQuarter);
      
      return {
        ...schedule,
        cumulativeAmount,
        paidTillQuarter,
        shortfall,
      };
    });

    const totalAdvanceTaxPaid = inputs.advanceTaxPaid.q1 + inputs.advanceTaxPaid.q2 + inputs.advanceTaxPaid.q3 + inputs.advanceTaxPaid.q4;
    const balanceTax = Math.max(0, netTaxLiability - totalAdvanceTaxPaid - inputs.selfAssessmentPaid);
    
    return {
      totalTax,
      netTaxLiability,
      advanceTaxRequired,
      quarterlyAnalysis,
      totalAdvanceTaxPaid,
      balanceTax,
    };
  }, [inputs, regime]);

  const seo = getSEOConfig('/calculators/advance-tax');
  const currentQuarter = (() => {
    const month = new Date().getMonth();
    if (month < 3) return 4;
    if (month < 6) return 1;
    if (month < 9) return 2;
    return 3;
  })();

  return (
    <>
      <MetaSEO
        title={seo?.title || "Advance Tax Calculator 2025 | Quarterly Payments | MyeCA.in"}
        description={seo?.description || "Calculate quarterly advance tax payments for FY 2024-25. Avoid Sec 234B/C interest penalties with professional planning."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="Advance Tax Calculator"
        description="Calculate quarterly tax installments and avoid interest penalties under Section 234B & 234C."
        category="Tax Compliance"
        icon={<Calculator className="w-6 h-6" />}
        variant="indigo"
        breadcrumbItems={[{ name: "Advance Tax" }]}
      />

      <CalcLayout
        variant="indigo"
        complianceFacts={[
          { title: "₹10,000 Threshold", content: "Advance tax is mandatory if your estimated tax liability for the year (after TDS) exceeds ₹10,000." },
          { title: "Senior Citizens", content: "Senior citizens (60+) not having income from business or profession are exempt from paying advance tax." },
          { title: "Presumptive Tax", content: "Taxpayers under Section 44AD/ADA can pay 100% of their advance tax in a single installment by March 15." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Compliance Overview">
            <div className="space-y-1 pb-6 border-b border-white/20">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Net Tax Liability</p>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={calculations.netTaxLiability} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-4xl font-bold text-slate-900 tracking-tight tabular-nums"
                >
                  {formatCurrency(calculations.netTaxLiability)}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="space-y-4 pt-6">
              <CalcResultRow label="Total Tax (incl. Cess)" value={formatCurrency(calculations.totalTax)} />
              <CalcResultRow label="Paid Till Date" value={formatCurrency(calculations.totalAdvanceTaxPaid)} variant="success" />
              <CalcResultRow label="Balance Payable" value={formatCurrency(calculations.balanceTax)} variant="highlight" />
              
              {!calculations.advanceTaxRequired && (
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 mt-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-[10px] font-bold text-emerald-700 leading-relaxed uppercase tracking-widest">No Advance Tax Required (&lt;₹10k)</p>
                </div>
              )}

              {calculations.advanceTaxRequired && (
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-600" />
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Next Due Date</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{ADVANCE_TAX_SCHEDULE[currentQuarter - 1].dueDate}</p>
                  <p className="text-[10px] text-slate-500 font-medium italic">Installment Target: {ADVANCE_TAX_SCHEDULE[currentQuarter - 1].cumulativePercent}%</p>
                </div>
              )}
            </div>

            <Link href="/services/tax-planning">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tax Regime</label>
                <div className="grid grid-cols-2 gap-3">
                  {['new', 'old'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRegime(r as any)}
                      className={cn(
                        "py-4 rounded-2xl border-2 transition-all font-bold text-sm",
                        regime === r ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" : "border-slate-100 bg-slate-50 text-slate-500 hover:border-indigo-200"
                      )}
                    >
                      {r === 'new' ? 'New Regime' : 'Old Regime'}
                    </button>
                  ))}
                </div>
             </div>

             <CalcInputGroup label="Estimated Annual Income" badgeValue={formatCurrency(inputs.estimatedIncome)}>
                <div className="relative">
                  <Input 
                    type="number"
                    value={inputs.estimatedIncome}
                    onChange={(e) => setInputs({...inputs, estimatedIncome: Number(e.target.value)})}
                    className="h-14 pl-10 rounded-xl border-slate-100 bg-slate-50 font-bold text-lg focus:ring-2 focus:ring-indigo-100"
                  />
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
             </CalcInputGroup>

             <CalcInputGroup label="TDS / TCS Deducted" badgeValue={formatCurrency(inputs.tdsDeducted)}>
                <div className="relative">
                  <Input 
                    type="number"
                    value={inputs.tdsDeducted}
                    onChange={(e) => setInputs({...inputs, tdsDeducted: Number(e.target.value)})}
                    className="h-14 pl-10 rounded-xl border-slate-100 bg-slate-50 font-bold text-lg focus:ring-2 focus:ring-indigo-100"
                  />
                  <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
             </CalcInputGroup>
          </CalcInputCard>

          <CalcInputCard title="Installment Tracking" icon={<Calendar className="w-5 h-5" />}>
             <div className="grid grid-cols-2 gap-4 mb-8">
                {(['q1', 'q2', 'q3', 'q4'] as const).map((q, i) => (
                  <div key={q} className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                      {ADVANCE_TAX_SCHEDULE[i].quarter} Paid (INR)
                    </label>
                    <Input 
                      type="number"
                      value={inputs.advanceTaxPaid[q]}
                      onChange={(e) => setInputs({
                        ...inputs, 
                        advanceTaxPaid: { ...inputs.advanceTaxPaid, [q]: Number(e.target.value) }
                      })}
                      className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold text-sm focus:ring-2 focus:ring-indigo-100"
                      placeholder="0"
                    />
                  </div>
                ))}
             </div>

             <div className="space-y-6 pt-6 border-t border-slate-50">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Payment Progress</label>
                <div className="space-y-4">
                  {calculations.quarterlyAnalysis.map((q, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">{q.quarter} Cumulative ({q.cumulativePercent}%)</span>
                        <span className="text-slate-900">{formatCurrency(q.cumulativeAmount)}</span>
                      </div>
                      <Progress value={(q.paidTillQuarter / q.cumulativeAmount) * 100} className="h-2 bg-slate-100" />
                      {q.shortfall > 0 && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Shortfall: {formatCurrency(q.shortfall)}</p>
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
              title: "Avoid Penalties",
              desc: "Paying advance tax on time helps you avoid mandatory interest under Sections 234B and 234C of the Income Tax Act."
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
            title: "Interest Sections 234B & 234C",
            description: "If you fail to pay advance tax or pay less than required, the Income Tax department charges interest.",
            steps: [
              { title: "Sec 234C", desc: "Charged @ 1% per month for shortfall in quarterly installments (Q1, Q2, Q3, Q4)." },
              { title: "Sec 234B", desc: "Charged @ 1% per month if 90% of the total tax is not paid by the end of the financial year (March 31)." },
              { title: "Self Assessment", desc: "Any balance tax paid after the end of the financial year is called 'Self-Assessment Tax'." }
            ]
          }}
          faqs={[
            { q: "Is advance tax applicable to everyone?", a: "It is applicable to every taxpayer (salaried, freelancer, or business) whose estimated tax liability after TDS exceeds ₹10,000." },
            { q: "Can I pay advance tax after the due date?", a: "Yes, but you will be liable to pay interest under Section 234C for the period of delay until the next installment or tax filing." },
            { q: "How to pay advance tax online?", a: "You can pay it through the e-filing portal or via 'e-pay tax' on the NSDL website using Challan No./ITNS 280." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
