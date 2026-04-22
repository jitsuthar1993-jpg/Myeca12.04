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
  Shield, Wallet, Receipt, CheckCircle2,
  Lock, Headphones, Award, Calendar
} from "lucide-react";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

export default function IncomeTaxCalculator() {
  const [currentStep, setCurrentStep] = useState(0);
  
  // States
  const [basicSalary, setBasicSalary] = useState<number>(710000);
  const [rentalIncome, setRentalIncome] = useState<number>(0);
  const [savingInterest, setSavingInterest] = useState<number>(10000);
  const [otherIncome, setOtherIncome] = useState<number>(50000);
  
  const [deductions80C, setDeductions80C] = useState<number>(150000);
  const [deductions80D, setDeductions80D] = useState<number>(25000);
  const [otherDeductions, setOtherDeductions] = useState<number>(50000);
  
  const [regime, setRegime] = useState<'old' | 'new'>('new');
  const [assessmentYear, setAssessmentYear] = useState('2026-27');
  const [age, setAge] = useState(30);

  // Derived totals
  const totalIncome = basicSalary + rentalIncome + otherIncome + savingInterest;
  
  // Apply 80TTA deduction automatically for Old Regime (up to 10k)
  const auto80TTA = regime === 'old' ? Math.min(savingInterest, 10000) : 0;
  const totalDeductions = deductions80C + deductions80D + otherDeductions + auto80TTA;

  const inputs: IncomeTaxInputs & { assessmentYear: string; age: number } = {
    income: totalIncome,
    regime,
    deductions: totalDeductions,
    assessmentYear,
    age,
  };

  const { result, otherResult, comparison } = useMemo(() => {
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

  const fmt = (n: number) => n.toLocaleString("en-IN");
  const fmtCurrency = (n: number) => `₹ ${fmt(n)}`;

  const newRegimeTax = regime === 'new' ? result : otherResult;
  const oldRegimeTax = regime === 'old' ? result : otherResult;

  const savingsValue = Math.abs(newRegimeTax.taxPayable - oldRegimeTax.taxPayable);
  const betterRegime = newRegimeTax.taxPayable < oldRegimeTax.taxPayable ? "New Regime" : "Old Regime";
  const savingsPercent = Math.round((savingsValue / Math.max(newRegimeTax.taxPayable, oldRegimeTax.taxPayable)) * 100) || 0;

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <MetaSEO
        title={seo?.title || "Income Tax Calculator 2025-26 | AY 2026-27 | MyeCA.in"}
        description={seo?.description || "Calculate your income tax for AY 2025-26 & 2026-27. Compare Old vs New Tax Regime and optimize your savings."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      {/* Header Section */}
      <div className="max-w-[1200px] mx-auto px-4 pt-12 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-[40px] font-bold text-[#101828] tracking-tight">Income Tax Calculator</h1>
            <p className="text-[#667085] text-lg">Optimize your taxes. Compare regimes. Save more.</p>
          </div>
          <div className="flex items-center gap-4 bg-[#F0F2F5] px-4 py-2 rounded-full border border-[#D0D5DD]">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#475467]">
              <CheckCircle2 className="w-4 h-4 text-[#101828]" />
              CA Verified
            </div>
            <div className="w-px h-4 bg-[#D0D5DD]" />
            <div className="text-[13px] font-medium text-[#475467]">100% Secure</div>
            <div className="w-px h-4 bg-[#D0D5DD]" />
            <div className="text-[13px] font-medium text-[#475467]">No data shared</div>
          </div>
        </div>

        {/* Main Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          
          {/* Left Column - Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#444CE7]">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#101828]">Your Income</h2>
                    <p className="text-sm text-[#667085]">Enter your income details to calculate your tax</p>
                  </div>
                </div>
                <div className="flex bg-[#F9FAFB] border border-[#EAECF0] p-1 rounded-xl">
                  {['2025-26', '2026-27'].map(year => (
                    <button
                      key={year}
                      onClick={() => setAssessmentYear(year)}
                      className={cn(
                        "px-5 py-1.5 rounded-lg text-xs font-bold transition-all",
                        assessmentYear === year 
                          ? "bg-white text-[#444CE7] shadow-sm border border-[#EAECF0]" 
                          : "text-[#667085] hover:text-[#101828]"
                      )}
                    >
                      AY {year}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {currentStep === 0 ? (
                  <motion.div
                    key="income"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                {/* Annual Salary */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#344054]">Annual Salary</span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-bold text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={basicSalary}
                        onChange={(e) => setBasicSalary(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider 
                    value={[basicSalary]} 
                    onValueChange={(v) => setBasicSalary(v[0])} 
                    max={5000000} 
                    min={0} 
                    step={10000} 
                    colorTheme="slate"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#667085] font-medium uppercase tracking-wider">
                    <span>Gross salary from all sources</span>
                  </div>
                </div>

                {/* Rental Income */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#344054]">Rental Income (Annual)</span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-bold text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={rentalIncome}
                        onChange={(e) => setRentalIncome(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider 
                    value={[rentalIncome]} 
                    onValueChange={(v) => setRentalIncome(v[0])} 
                    max={2000000} 
                    min={0} 
                    step={10000} 
                    colorTheme="slate"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#667085] font-medium uppercase tracking-wider">
                    <span>Income from house property</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {/* Saving Interest */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#344054]">Saving Interest</span>
                        <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                      </div>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[110px] flex items-center gap-1.5 shadow-sm">
                        <span className="text-xs font-bold text-[#667085]">₹</span>
                        <input 
                          type="number"
                          value={savingInterest}
                          onChange={(e) => setSavingInterest(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <Slider 
                      value={[savingInterest]} 
                      onValueChange={(v) => setSavingInterest(v[0])} 
                      max={100000} 
                      min={0} 
                      step={500} 
                      colorTheme="slate"
                    />
                    <div className="flex items-center justify-between text-[10px] text-[#667085] font-medium uppercase tracking-wider">
                      <span>Max ₹10k deduction</span>
                    </div>
                  </div>

                  {/* Other Income */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#344054]">Other Income</span>
                        <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                      </div>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[110px] flex items-center gap-1.5 shadow-sm">
                        <span className="text-xs font-bold text-[#667085]">₹</span>
                        <input 
                          type="number"
                          value={otherIncome}
                          onChange={(e) => setOtherIncome(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <Slider 
                      value={[otherIncome]} 
                      onValueChange={(v) => setOtherIncome(v[0])} 
                      max={1000000} 
                      min={0} 
                      step={5000} 
                      colorTheme="slate"
                    />
                    <div className="flex items-center justify-between text-[10px] text-[#667085] font-medium uppercase tracking-wider">
                      <span>Other sources</span>
                    </div>
                  </div>
                </div>

                {/* Regime Toggle */}
                <div className="pt-4 border-t border-[#F2F4F7]">
                  <label className="text-sm font-bold text-[#344054] mb-2 block">Choose Default Tax Regime</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'new', label: 'New Regime (Default)', desc: 'Lower tax rates, fewer deductions' },
                      { id: 'old', label: 'Old Regime', desc: 'Higher deductions, higher tax benefits' }
                    ].map(r => (
                      <button
                        key={r.id}
                        onClick={() => setRegime(r.id as 'old' | 'new')}
                        className={cn(
                          "p-6 rounded-[20px] border-2 text-left transition-all relative overflow-hidden",
                          regime === r.id 
                            ? "border-[#444CE7] bg-[#F5F8FF]" 
                            : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            regime === r.id ? "border-[#444CE7] bg-[#444CE7]" : "border-[#D0D5DD]"
                          )}>
                            {regime === r.id && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className={cn("text-sm font-bold", regime === r.id ? "text-[#444CE7]" : "text-[#344054]")}>{r.label}</span>
                        </div>
                        <p className="text-xs text-[#667085] ml-8">{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentStep(1)}
                  className="w-full py-3.5 rounded-[20px] bg-[#101828] text-white font-bold text-base hover:bg-[#1C293E] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#101828]/10"
                >
                  Continue to Deductions
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="deductions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* 80C Deductions */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#344054]">Section 80C</span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-bold text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={deductions80C}
                        onChange={(e) => setDeductions80C(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider 
                    value={[deductions80C]} 
                    onValueChange={(v) => setDeductions80C(v[0])} 
                    max={150000} 
                    min={0} 
                    step={5000} 
                    colorTheme="slate"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#667085] font-medium uppercase tracking-wider">
                    <span>PPF, ELSS, LIC, etc. (Max 1.5L)</span>
                  </div>
                </div>

                {/* 80D Deductions */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#344054]">Section 80D</span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-bold text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={deductions80D}
                        onChange={(e) => setDeductions80D(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider 
                    value={[deductions80D]} 
                    onValueChange={(v) => setDeductions80D(v[0])} 
                    max={100000} 
                    min={0} 
                    step={5000} 
                    colorTheme="slate"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#667085] font-medium uppercase tracking-wider">
                    <span>Health Insurance Premiums</span>
                  </div>
                </div>

                {/* Other Deductions */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#344054]">Other Deductions</span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-bold text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={otherDeductions}
                        onChange={(e) => setOtherDeductions(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider 
                    value={[otherDeductions]} 
                    onValueChange={(v) => setOtherDeductions(v[0])} 
                    max={500000} 
                    min={0} 
                    step={5000} 
                    colorTheme="slate"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#667085] font-medium uppercase tracking-wider">
                    <span>NPS, HRA, Education Loan, etc.</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F2F4F7]">
                  <button 
                    onClick={() => setCurrentStep(0)}
                    className="py-3.5 rounded-[20px] bg-white border border-[#EAECF0] text-[#344054] font-bold text-base hover:bg-[#F9FAFB] transition-all flex items-center justify-center gap-3"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Income
                  </button>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="py-3.5 rounded-[20px] bg-[#101828] text-white font-bold text-base hover:bg-[#1C293E] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#101828]/10"
                  >
                    View Result
                    <TrendingUp className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-[#101828]">Tax Summary</h2>
                <div className="bg-[#ECFDF3] text-[#027A48] text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                  <Star className="w-3 h-3 fill-[#027A48]" />
                  Recommended
                </div>
              </div>
              <p className="text-sm text-[#667085] mb-4">Live comparison of tax regimes</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* New Regime Box */}
                <div className={cn(
                  "p-4 rounded-[20px] border-2",
                  betterRegime === "New Regime" ? "border-[#ECFDF3] bg-[#F6FEF9]" : "border-[#EAECF0] bg-white"
                )}>
                  <span className="text-xs font-bold text-[#101828] block mb-0.5">New Regime</span>
                  <span className="text-[10px] text-[#667085] block mb-2">Lower tax rates</span>
                  <span className={cn("text-2xl font-bold block mb-0.5", betterRegime === "New Regime" ? "text-[#027A48]" : "text-[#344054]")}>
                    ₹ {fmt(newRegimeTax.taxPayable)}
                  </span>
                  <span className="text-[10px] text-[#98A2B3] font-medium uppercase tracking-widest">Total Tax</span>
                </div>

                {/* Old Regime Box */}
                <div className={cn(
                  "p-4 rounded-[20px] border-2",
                  betterRegime === "Old Regime" ? "border-[#ECFDF3] bg-[#F6FEF9]" : "border-[#EAECF0] bg-white"
                )}>
                  <span className="text-xs font-bold text-[#101828] block mb-0.5">Old Regime</span>
                  <span className="text-[10px] text-[#667085] block mb-2">With deductions</span>
                  <span className={cn("text-2xl font-bold block mb-0.5", betterRegime === "Old Regime" ? "text-[#027A48]" : "text-[#B42318]")}>
                    ₹ {fmt(oldRegimeTax.taxPayable)}
                  </span>
                  <span className="text-[10px] text-[#98A2B3] font-medium uppercase tracking-widest">Total Tax</span>
                </div>
              </div>

              {/* Savings Highlight */}
              <div className="bg-[#F9FAFB] rounded-[20px] border border-[#EAECF0] p-4 flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#ECFDF3] flex items-center justify-center text-[#027A48] shrink-0">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#475467]">You Save</span>
                    <span className="text-2xl font-bold text-[#027A48]">₹ {fmt(savingsValue)}</span>
                  </div>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    by choosing <span className="font-bold text-[#101828]">{betterRegime}</span>. 
                    That's <span className="font-bold text-[#027A48]">{savingsPercent}%</span> savings!
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-grow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Tax Before Cess</span>
                  <div className="flex gap-8">
                    <span className="text-xs font-bold text-[#101828] min-w-[70px] text-right">₹ {fmt(Math.round(newRegimeTax.taxPayable / 1.04))}</span>
                    <span className="text-xs font-bold text-[#101828] min-w-[70px] text-right">₹ {fmt(Math.round(oldRegimeTax.taxPayable / 1.04))}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Education Cess</span>
                  <div className="flex gap-8">
                    <span className="text-xs font-bold text-[#101828] min-w-[70px] text-right">₹ {fmt(newRegimeTax.taxPayable - Math.round(newRegimeTax.taxPayable / 1.04))}</span>
                    <span className="text-xs font-bold text-[#101828] min-w-[70px] text-right">₹ {fmt(oldRegimeTax.taxPayable - Math.round(oldRegimeTax.taxPayable / 1.04))}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#F2F4F7] flex items-center justify-between">
                  <span className="text-sm font-bold text-[#101828]">Take Home (Net)</span>
                  <div className="flex gap-8">
                    <span className="text-base font-bold text-[#027A48] min-w-[70px] text-right">₹ {fmt(newRegimeTax.netIncome)}</span>
                    <span className="text-base font-bold text-[#B42318] min-w-[70px] text-right">₹ {fmt(oldRegimeTax.netIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Expert Call Box */}
              <div className="mt-6 bg-[#F5F8FF] border border-[#D1E0FF] rounded-[20px] p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#D1E0FF] flex items-center justify-center text-[#444CE7] shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-0.5">Need expert help?</h4>
                  <p className="text-xs text-[#667085] mb-2">Plan your tax with our expert CA</p>
                  <Link href="/services/tax-planning">
                    <button className="text-[13px] font-bold text-[#444CE7] flex items-center gap-2 hover:gap-3 transition-all">
                      Book Free Consultation
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: <Headphones className="w-5 h-5" />, label: "Expert CA Support", desc: "Get guidance from tax experts" },
            { icon: <Award className="w-5 h-5" />, label: "100% Accurate", desc: "As per latest tax laws" },
            { icon: <Lock className="w-5 h-5" />, label: "Secure & Private", desc: "Your data is fully encrypted" },
            { icon: <PieChart className="w-5 h-5" />, label: "Save & Compare", desc: "Save scenarios and compare later" }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAECF0] flex items-center justify-center text-[#101828] shrink-0">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <h5 className="text-[13px] font-bold text-[#101828]">{item.label}</h5>
                <p className="text-[11px] text-[#667085]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Informational Content */}
        <div className="mt-32">
          <CalculatorMiniBlog 
            features={[
              {
                icon: <Zap className="w-5 h-5" />,
                iconBg: "bg-blue-50 text-blue-600",
                title: "2026-27 Tax Planning",
                desc: "For AY 2026-27, the New Regime is highly optimized. Income up to ₹12 Lakh (Net) results in zero tax due to the enhanced 87A rebate."
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
                desc: "Our calculator automatically compares both regimes and suggests the one that saves you more money based on the latest 2026-27 rates."
              }
            ]}
            howItWorks={{
              title: "How Income Tax is Calculated (2026-27)",
              description: "Income tax calculation follows a structured process of summing income, subtracting exemptions, and applying slab rates.",
              steps: [
                { title: "Gross Total Income", desc: "Sum up salary, interest, rental income, and business profits." },
                { title: "Exemptions & Deductions", desc: "Subtract Standard Deduction (₹75k for New Regime) and Chapter VI-A investments." },
                { title: "Slab Application", desc: "Apply the new 2026-27 slabs: 0% up to 4L, 5% up to 8L, and so on." }
              ]
            }}
            faqs={[
              { q: "What is the new 12L rebate in 2026-27?", a: "For AY 2026-27, if your taxable income is up to ₹12 Lakh under the New Regime, you get a full tax rebate of ₹60,000, making your net tax zero." },
              { q: "Is the ₹75k Standard Deduction for everyone?", a: "Yes, it applies to all salaried individuals and pensioners, but only for those opting for the New Tax Regime." },
              { q: "Can I claim HRA in the New Regime?", a: "No, HRA exemption is not available in the New Tax Regime. It is only available in the Old Tax Regime." }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
