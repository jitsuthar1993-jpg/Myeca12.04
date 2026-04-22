import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { calculateIncomeTax } from "@/lib/tax-calculations";
import { IncomeTaxInputs } from "@/types/calculator";
import { 
  TrendingUp, IndianRupee, 
  Zap, Star, 
  ChevronRight, PieChart, ShieldCheck,
  Target, Info, ArrowLeft, ArrowRight,
  Shield, Wallet, Receipt
} from "lucide-react";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

const STEPS = [
  { id: "income", label: "Income", icon: <IndianRupee className="w-4 h-4" /> },
  { id: "deductions", label: "Deductions", icon: <Wallet className="w-4 h-4" /> },
];

export default function IncomeTaxCalculator() {
  const [currentStep, setCurrentStep] = useState(0);
  
  // States
  const [basicSalary, setBasicSalary] = useState<number>(1000000);
  const [otherIncome, setOtherIncome] = useState<number>(50000);
  const [rentalIncome, setRentalIncome] = useState<number>(0);
  const [deductions80C, setDeductions80C] = useState<number>(150000);
  const [deductions80D, setDeductions80D] = useState<number>(25000);
  const [otherDeductions, setOtherDeductions] = useState<number>(50000);
  
  const [regime, setRegime] = useState<'old' | 'new'>('new');
  const [assessmentYear, setAssessmentYear] = useState('2026-27');
  const [age, setAge] = useState(30);

  // Derived totals
  const totalIncome = basicSalary + otherIncome + rentalIncome;
  const totalDeductions = deductions80C + deductions80D + otherDeductions;

  const inputs: IncomeTaxInputs & { assessmentYear: string; age: number } = {
    income: totalIncome,
    regime,
    deductions: totalDeductions,
    assessmentYear,
    age,
  };

  const { result, comparison } = useMemo(() => {
    const calculationResult = calculateIncomeTax(inputs);
    const otherRegimeType = regime === 'old' ? 'new' : 'old';
    const otherCalculation = calculateIncomeTax({ ...inputs, regime: otherRegimeType });
    
    const savings = otherCalculation.taxPayable - calculationResult.taxPayable;
    let comparisonData = null;
    
    if (savings > 0) {
      comparisonData = { recommended: regime, savings };
    } else if (savings < 0) {
      comparisonData = { recommended: otherRegimeType, savings: Math.abs(savings) };
    }

    return { result: calculationResult, otherResult: otherCalculation, comparison: comparisonData };
  }, [totalIncome, totalDeductions, regime, assessmentYear, age]);

  const seo = getSEOConfig('/calculators/income-tax');

  const fmt = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${n.toLocaleString("en-IN")}`;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <>
      <MetaSEO
        title={seo?.title || "Income Tax Calculator 2025-26 | AY 2026-27 | MyeCA.in"}
        description={seo?.description || "Calculate your income tax for AY 2025-26 & 2026-27. Compare Old vs New Tax Regime and optimize your savings."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="Income Tax Calculator"
        description="Professional-grade tax analysis with real-time regime comparison and optimization."
        category="Tax Planning"
        icon={<PieChart className="w-6 h-6" />}
        variant="indigo"
        breadcrumbItems={[{ name: "Income Tax Calculator" }]}
      />

      <CalcLayout
        variant="indigo"
        complianceFacts={[
          { title: "Standard Deduction", content: "Budget 2024 increased the standard deduction to ₹75,000 for the New Tax Regime (AY 2025-26 onwards)." },
          { title: "Rebate u/s 87A", content: "Under the New Regime, income up to ₹7 Lakh (Net) results in zero tax due to the 87A rebate." },
          { title: "Investment Proofs", content: "New Regime doesn't require submitting investment proofs (80C, 80D, HRA) to your employer, simplifying payroll." }
        ]}
        faqs={[
          { q: "Which regime is better for me?", a: "Generally, if your deductions (HRA, 80C, Home Loan) are more than ₹3.75 - ₹4.25 Lakh, the Old Regime might be better. Otherwise, the New Regime usually wins." },
          { q: "Can I switch regimes later?", a: "Salaried individuals can choose every year at the time of filing ITR. Those with business income can only switch once." },
          { q: "Is NPS deduction available in New Regime?", a: "Only employer's contribution to NPS is deductible in the New Regime. The self-contribution of ₹50,000 (80CCD 1B) is not available." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Tax Summary">
            <div className="space-y-1 pb-6 border-b border-white/20">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Net Tax Payable</p>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={result.taxPayable} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-4xl font-bold text-slate-900 tracking-tight tabular-nums"
                >
                  {fmt(result.taxPayable)}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="space-y-4 pt-6">
              <CalcResultRow label="Taxable Income" value={fmt(result.taxableIncome)} />
              <CalcResultRow label="Effective Rate" value={`${((result.taxPayable / totalIncome) * 100).toFixed(1)}%`} />
              <CalcResultRow label="Take Home (Net)" value={fmt(result.netIncome)} variant="success" />
              
              {comparison && comparison.recommended !== regime && (
                <div className="pt-6 border-t border-white/20">
                  <div className="bg-indigo-600 rounded-2xl p-4 text-white shadow-xl shadow-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Optimisation Alert</span>
                    </div>
                    <p className="text-sm font-bold leading-tight mb-3">
                      You could save {fmt(comparison.savings)} by switching to the {comparison.recommended} regime!
                    </p>
                    <button 
                      onClick={() => setRegime(comparison.recommended as 'old' | 'new')}
                      className="w-full py-2.5 rounded-xl bg-white text-indigo-600 text-xs font-bold hover:bg-slate-50 transition-all"
                    >
                      Switch to {comparison.recommended.toUpperCase()}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link href="/services/tax-planning">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Plan Tax with Expert CA
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all border",
                currentStep === idx 
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                  : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
              )}
            >
              {step.icon}
              {step.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 0 ? (
            <motion.div
              key="step-income"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <CalcInputCard title="Income Configuration" icon={<IndianRupee className="w-5 h-5" />}>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  {['2026-27', '2025-26'].map(year => (
                    <button
                      key={year}
                      onClick={() => setAssessmentYear(year)}
                      className={cn(
                        "py-4 rounded-2xl border-2 text-xs font-black transition-all",
                        assessmentYear === year 
                          ? "bg-indigo-50 border-indigo-600 text-indigo-600" 
                          : "bg-slate-50 border-transparent text-slate-400 hover:border-slate-200"
                      )}
                    >
                      AY {year}
                    </button>
                  ))}
                </div>

                <CalcInputGroup 
                  label="Annual Salary" 
                  badgeValue={fmt(basicSalary)}
                >
                  <Slider 
                    value={[basicSalary]} 
                    onValueChange={(v) => setBasicSalary(v[0])} 
                    max={5000000} 
                    min={0} 
                    step={10000} 
                  />
                </CalcInputGroup>

                <CalcInputGroup 
                  label="Other Income / Interest" 
                  badgeValue={fmt(otherIncome)}
                >
                  <Slider 
                    value={[otherIncome]} 
                    onValueChange={(v) => setOtherIncome(v[0])} 
                    max={1000000} 
                    min={0} 
                    step={5000} 
                  />
                </CalcInputGroup>

                <CalcInputGroup 
                  label="Rental Income (Annual)" 
                  badgeValue={fmt(rentalIncome)}
                >
                  <Slider 
                    value={[rentalIncome]} 
                    onValueChange={(v) => setRentalIncome(v[0])} 
                    max={2000000} 
                    min={0} 
                    step={10000} 
                  />
                </CalcInputGroup>

                <div className="pt-8 border-t border-slate-50">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6 block">Default Tax Regime</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { id: 'new', label: 'New Regime', desc: 'Default (Lower rates)', icon: <Zap className="w-4 h-4" /> },
                      { id: 'old', label: 'Old Regime', desc: 'Optional (Higher rates)', icon: <Shield className="w-4 h-4" /> }
                    ].map(r => (
                      <button
                        key={r.id}
                        onClick={() => setRegime(r.id as 'old' | 'new')}
                        className={cn(
                          "p-4 rounded-2xl border-2 text-left transition-all",
                          regime === r.id 
                            ? "bg-indigo-600 border-indigo-600 text-white" 
                            : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {r.icon}
                          <span className="text-xs font-black">{r.label}</span>
                        </div>
                        <p className={cn("text-[10px] font-medium", regime === r.id ? "text-indigo-100" : "text-slate-400")}>{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CalcInputCard>
            </motion.div>
          ) : (
            <motion.div
              key="step-deductions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <CalcInputCard title="Deductions (Old Regime Only)" icon={<Wallet className="w-5 h-5" />}>
                {regime === 'new' && (
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 mb-6">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-amber-700 leading-relaxed">
                      You are in the New Regime. Standard deduction (₹75k) is automatically applied. Other deductions only apply in the Old Regime.
                    </p>
                  </div>
                )}

                <CalcInputGroup 
                  label="Section 80C (Max ₹1.5L)" 
                  badgeValue={fmt(deductions80C)}
                >
                  <Slider 
                    value={[deductions80C]} 
                    disabled={regime === 'new'}
                    onValueChange={(v) => setDeductions80C(v[0])} 
                    max={150000} 
                    min={0} 
                    step={1000} 
                  />
                </CalcInputGroup>

                <CalcInputGroup 
                  label="Section 80D (Health Insurance)" 
                  badgeValue={fmt(deductions80D)}
                >
                  <Slider 
                    value={[deductions80D]} 
                    disabled={regime === 'new'}
                    onValueChange={(v) => setDeductions80D(v[0])} 
                    max={100000} 
                    min={0} 
                    step={1000} 
                  />
                </CalcInputGroup>

                <CalcInputGroup 
                  label="Other (HRA, Home Loan, etc.)" 
                  badgeValue={fmt(otherDeductions)}
                >
                  <Slider 
                    value={[otherDeductions]} 
                    disabled={regime === 'new'}
                    onValueChange={(v) => setOtherDeductions(v[0])} 
                    max={1000000} 
                    min={0} 
                    step={5000} 
                  />
                </CalcInputGroup>

                <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: {fmt(totalDeductions)}</span>
                  </div>
                  {regime === 'new' && (
                    <button 
                      onClick={() => setRegime('old')}
                      className="text-[10px] font-black text-indigo-600 uppercase underline underline-offset-4"
                    >
                      Switch to Old to apply these
                    </button>
                  )}
                </div>
              </CalcInputCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          
          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all"
            >
              Continue to Deductions
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
            >
              <Receipt className="w-4 h-4" />
              Detailed Report
            </button>
          )}
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <Zap className="w-5 h-5" />,
              iconBg: "bg-blue-50 text-blue-600",
              title: "New Regime Advantage",
              desc: "The New Regime offers lower tax rates and an increased standard deduction of ₹75,000, making it ideal for most salaried employees."
            },
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Old Regime Benefits",
              desc: "If you have a home loan, pay high rent (HRA), or have major investments in PPF/LIC, the Old Regime might still be your best choice."
            },
            {
              icon: <Target className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Tax Optimization",
              desc: "Our calculator automatically compares both regimes and suggests the one that saves you more money based on your profile."
            }
          ]}
          howItWorks={{
            title: "How Income Tax is Calculated",
            description: "Income tax calculation follows a structured process of summing income, subtracting exemptions, and applying slab rates.",
            steps: [
              { title: "Gross Total Income", desc: "Sum up salary, interest, rental income, and business profits." },
              { title: "Exemptions & Deductions", desc: "Subtract HRA, Standard Deduction, and Chapter VI-A investments like 80C and 80D." },
              { title: "Slab Application", desc: "Apply progressive slab rates (0%, 5%, 10%, etc.) to the Net Taxable Income." }
            ]
          }}
          faqs={[
            { q: "What is the 87A rebate?", a: "Section 87A provides a tax rebate that makes your tax zero if your total taxable income is below ₹7 Lakh (New Regime) or ₹5 Lakh (Old Regime)." },
            { q: "Is the ₹75k Standard Deduction for everyone?", a: "Yes, it applies to all salaried individuals and pensioners, but only for those opting for the New Tax Regime." },
            { q: "Can I claim HRA in the New Regime?", a: "No, HRA exemption is not available in the New Tax Regime. It is only available in the Old Tax Regime." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
