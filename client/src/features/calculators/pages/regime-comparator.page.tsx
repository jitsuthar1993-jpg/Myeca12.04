import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp, 
  IndianRupee, 
  Scale,
  PiggyBank,
  Heart,
  Home,
  Wallet,
  Zap,
  Check,
  Info,
  ShieldCheck,
  Target,
  PieChart
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

// Tax calculation constants for FY 2024-25
const OLD_REGIME_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

const NEW_REGIME_SLABS = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 5 },
  { min: 700000, max: 1000000, rate: 10 },
  { min: 1000000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 },
];

const DEDUCTION_LIMITS = {
  section80C: 150000,
  section80CCD1B: 50000,
  section80D: 25000,
  section24b: 200000,
  standardDeduction: 75000,
  standardDeductionOld: 50000,
};

export default function RegimeComparatorPage() {
  const seo = getSEOConfig('/calculators/tax-regime');
  
  // Income States
  const [basicSalary, setBasicSalary] = useState(1200000);
  const [hra, setHra] = useState(400000);
  const [otherIncome, setOtherIncome] = useState(50000);

  // Deduction States
  const [sec80C, setSec80C] = useState(150000);
  const [sec80D, setSec80D] = useState(25000);
  const [homeLoanInt, setHomeLoanInt] = useState(0);

  const calculations = useMemo(() => {
    const grossIncome = basicSalary + hra + otherIncome;

    // Old Regime
    const oldRegimeDeductions = 
      Math.min(sec80C, DEDUCTION_LIMITS.section80C) +
      Math.min(sec80D, DEDUCTION_LIMITS.section80D) +
      Math.min(homeLoanInt, DEDUCTION_LIMITS.section24b) +
      DEDUCTION_LIMITS.standardDeductionOld;

    const oldTaxableIncome = Math.max(0, grossIncome - oldRegimeDeductions);
    
    let oldTax = 0;
    for (const slab of OLD_REGIME_SLABS) {
      if (oldTaxableIncome > slab.min) {
        const taxableInSlab = Math.min(oldTaxableIncome - slab.min, slab.max - slab.min);
        oldTax += taxableInSlab * (slab.rate / 100);
      }
    }
    if (oldTaxableIncome <= 500000) oldTax = 0;
    const oldTotalTax = oldTax * 1.04;

    // New Regime
    const newRegimeDeductions = DEDUCTION_LIMITS.standardDeduction;
    const newTaxableIncome = Math.max(0, grossIncome - newRegimeDeductions);
    
    let newTax = 0;
    for (const slab of NEW_REGIME_SLABS) {
      if (newTaxableIncome > slab.min) {
        const taxableInSlab = Math.min(newTaxableIncome - slab.min, slab.max - slab.min);
        newTax += taxableInSlab * (slab.rate / 100);
      }
    }
    if (newTaxableIncome <= 700000) newTax = 0;
    const newTotalTax = newTax * 1.04;

    const savings = Math.abs(oldTotalTax - newTotalTax);
    const betterRegime = oldTotalTax > newTotalTax ? 'New Regime' : 'Old Regime';

    return {
      grossIncome,
      oldTax: oldTotalTax,
      newTax: newTotalTax,
      savings,
      betterRegime,
      oldDeductions: oldRegimeDeductions
    };
  }, [basicSalary, hra, otherIncome, sec80C, sec80D, homeLoanInt]);

  const fmt = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${n.toLocaleString("en-IN")}`;

  return (
    <>
      <MetaSEO
        title={seo?.title || "Income Tax Regime Comparator | Old vs New Tax System | MyeCA.in"}
        description={seo?.description || "Compare Old vs New Tax Regime for FY 2024-25 & 2025-26. Find your break-even point and maximize tax savings with our advanced comparator."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="Regime Comparator"
        description="Side-by-side analysis of Old vs New Tax Regimes to find your perfect tax-saving strategy."
        category="Comparison"
        icon={<Scale className="w-6 h-6" />}
        variant="blue"
        breadcrumbItems={[{ name: "Regime Comparator" }]}
      />

      <CalcLayout
        variant="blue"
        complianceFacts={[
          { title: "Standard Deduction", content: "New Regime now offers a higher standard deduction of ₹75,000 compared to ₹50,000 in the Old Regime." },
          { title: "Break-even Point", content: "If your total deductions are below ₹3.75 Lakh, the New Regime is almost always mathematically superior." },
          { title: "Default Status", content: "The New Tax Regime is now the default regime unless you explicitly opt for the Old Regime during filing." }
        ]}
        faqs={[
          { q: "Is the New Regime better for high earners?", a: "Often yes, as the 30% slab starts much later (above ₹15 Lakh) in the New Regime compared to ₹10 Lakh in the Old Regime." },
          { q: "What deductions are lost in New Regime?", a: "You lose HRA, LTA, 80C, 80D, and Home Loan interest deductions in exchange for lower tax rates." },
          { q: "Can I switch every year?", a: "Yes, salaried individuals can switch between regimes every financial year depending on their investment plans." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Savings Analysis">
            <div className="space-y-1 pb-6 border-b border-white/20">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Recommended Choice</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-900 tracking-tight">{calculations.betterRegime}</p>
                <div className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase">Optimized</div>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <CalcResultRow label="Old Regime Tax" value={fmt(calculations.oldTax)} />
              <CalcResultRow label="New Regime Tax" value={fmt(calculations.newTax)} />
              
              <div className="pt-6 border-t border-white/20">
                <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-xl shadow-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Net Savings</span>
                  </div>
                  <p className="text-3xl font-black tabular-nums">{fmt(calculations.savings)}</p>
                  <p className="text-[10px] font-bold text-blue-100 mt-2 italic">Per financial year</p>
                </div>
              </div>
            </div>

            <Link href="/services/tax-planning">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                Talk to a Tax Expert
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="Income Sources" icon={<IndianRupee className="w-5 h-5" />}>
            <CalcInputGroup 
              label="Basic Salary (Annual)" 
              badgeValue={fmt(basicSalary)}
            >
              <Slider 
                value={[basicSalary]} 
                onValueChange={(v) => setBasicSalary(v[0])} 
                max={5000000} 
                min={0} 
                step={50000} 
              />
            </CalcInputGroup>

            <CalcInputGroup 
              label="HRA / Allowances" 
              badgeValue={fmt(hra)}
            >
              <Slider 
                value={[hra]} 
                onValueChange={(v) => setHra(v[0])} 
                max={1500000} 
                min={0} 
                step={10000} 
              />
            </CalcInputGroup>

            <CalcInputGroup 
              label="Other Income" 
              badgeValue={fmt(otherIncome)}
            >
              <Slider 
                value={[otherIncome]} 
                onValueChange={(v) => setOtherIncome(v[0])} 
                max={500000} 
                min={0} 
                step={5000} 
              />
            </CalcInputGroup>
          </CalcInputCard>

          <CalcInputCard title="Deductions (Old Regime)" icon={<PiggyBank className="w-5 h-5" />}>
            <div className="grid md:grid-cols-2 gap-8">
              <CalcInputGroup 
                label="Section 80C" 
                badgeValue={fmt(sec80C)}
              >
                <Slider 
                  value={[sec80C]} 
                  onValueChange={(v) => setSec80C(v[0])} 
                  max={150000} 
                  min={0} 
                  step={5000} 
                />
              </CalcInputGroup>

              <CalcInputGroup 
                label="Section 80D" 
                badgeValue={fmt(sec80D)}
              >
                <Slider 
                  value={[sec80D]} 
                  onValueChange={(v) => setSec80D(v[0])} 
                  max={100000} 
                  min={0} 
                  step={1000} 
                />
              </CalcInputGroup>
            </div>

            <CalcInputGroup 
              label="Home Loan Interest (24b)" 
              badgeValue={fmt(homeLoanInt)}
            >
              <Slider 
                value={[homeLoanInt]} 
                onValueChange={(v) => setHomeLoanInt(v[0])} 
                max={500000} 
                min={0} 
                step={5000} 
              />
            </CalcInputGroup>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: {fmt(calculations.oldDeductions)}</span>
              </div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest italic">Ignored in New Regime</p>
            </div>
          </CalcInputCard>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-500" />
              Regime Comparison Highlights
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Old Regime Effective Rate", value: `${((calculations.oldTax / calculations.grossIncome) * 100).toFixed(1)}%` },
                { label: "New Regime Effective Rate", value: `${((calculations.newTax / calculations.grossIncome) * 100).toFixed(1)}%` },
                { label: "Taxable Income (Old)", value: fmt(calculations.grossIncome - calculations.oldDeductions) },
                { label: "Taxable Income (New)", value: fmt(calculations.grossIncome - 75000) }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-base font-black text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <Scale className="w-5 h-5" />,
              iconBg: "bg-blue-50 text-blue-600",
              title: "Side-by-Side Comparison",
              desc: "Instantly see how your specific income and investment profile performs under both tax regimes."
            },
            {
              icon: <Zap className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Savings Maximization",
              desc: "Our engine identifies the break-even point where switching regimes becomes mathematically profitable for you."
            },
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "AY 2025-26 Ready",
              desc: "Updated with the latest budget changes including the increased standard deduction and revised new regime slabs."
            }
          ]}
          howItWorks={{
            title: "Understanding the Math",
            description: "The choice between regimes depends on your 'Total Deductions'. The New Regime has lower rates but almost no deductions.",
            steps: [
              { title: "Input Gross Income", desc: "Enter your salary, HRA, and other income sources for a total gross view." },
              { title: "Input Old Regime Deductions", desc: "List your HRA exemption, 80C, 80D, and Home Loan interest." },
              { title: "Compare Net Tax", desc: "We compute the final tax payable (including cess) for both systems side-by-side." }
            ]
          }}
          faqs={[
            { q: "What is the 87A rebate difference?", a: "In the New Regime, you pay zero tax up to ₹7 Lakh income. In the Old Regime, the rebate is only up to ₹5 Lakh income." },
            { q: "Is the New Regime mandatory?", a: "No, but it is the default. You must specifically opt-in for the Old Regime if you want to use it." },
            { q: "Which is better for salary above ₹15L?", a: "For high earners, the New Regime is often better unless you have deductions exceeding ₹4 Lakh." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
