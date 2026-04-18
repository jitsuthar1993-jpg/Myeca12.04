import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { calculateIncomeTax } from "@/lib/tax-calculations";
import { IncomeTaxInputs, TaxCalculationResult } from "@/types/calculator";
import { 
  Calculator, TrendingDown, TrendingUp, IndianRupee, Info, 
  Shield, FileText, ArrowRight, ArrowLeft, Zap, Star, 
  ChevronRight, Lightbulb, PieChart, ShieldCheck
} from "lucide-react";
import { CalculatorExport } from "@/components/ui/calculator-export";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCalculatorTracking } from "@/hooks/use-analytics";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";

import TaxStepIndicator from "../components/TaxStepIndicator";
import TaxStickySidebar from "../components/TaxStickySidebar";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "income", label: "Income", description: "Salary & other sources" },
  { id: "deductions", label: "Deductions", description: "80C, 80D, etc." },
  { id: "results", label: "Summary", description: "Tax & savings" },
];

export default function IncomeTaxCalculator() {
  const { calculateAndTrack } = useCalculatorTracking('Income Tax Calculator');
  const [currentStep, setCurrentStep] = useState(0);
  const [inputs, setInputs] = useState<IncomeTaxInputs & { assessmentYear: string; age: number }>({
    income: 0,
    regime: 'new',
    deductions: 0,
    assessmentYear: '2026-27',
    age: 30
  });

  const [result, setResult] = useState<TaxCalculationResult | null>(null);
  const [otherResult, setOtherResult] = useState<TaxCalculationResult | null>(null);
  const [comparison, setComparison] = useState<{ recommended: 'old' | 'new', savings: number } | null>(null);
  
  const seo = getSEOConfig('/calculators/income-tax');

  // Real-time calculation
  useEffect(() => {
    const calculationResult = calculateIncomeTax(inputs);
    setResult(calculationResult);

    const otherRegimeType = inputs.regime === 'old' ? 'new' : 'old';
    const otherCalculation = calculateIncomeTax({ ...inputs, regime: otherRegimeType });
    setOtherResult(otherCalculation);
    
    const savings = otherCalculation.taxPayable - calculationResult.taxPayable;
    
    if (savings > 0) {
      setComparison({ recommended: inputs.regime, savings });
    } else if (savings < 0) {
      setComparison({ recommended: otherRegimeType, savings: Math.abs(savings) });
    } else {
      setComparison(null);
    }
  }, [inputs]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <>
      <MetaSEO
        title={seo?.title || "Income Tax Calculator 2025-26 | Professional Tax Hub"}
        description={seo?.description || "Comprehensive income tax calculator with real-time comparison for AY 2025-26 and 2026-27."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
        howToData={{
          name: "How to Calculate Income Tax AY 2025-26",
          description: "Follow these 4 simple steps to calculate your income tax liability for the Assessment Year 2025-26 using our professional tool.",
          steps: [
            { name: "Select Assessment Year", text: "Choose between AY 2025-26 (for income earned in April 2024 - March 2025) or AY 2026-27." },
            { name: "Enter Income Details", text: "Provide your Gross Salary, Income from Interest, and other sources like rental income or capital gains." },
            { name: "Declare Exemptions & Deductions", text: "Enter your standard deduction, HRA, and investments under Section 80C, 80D, etc." },
            { name: "Compare & Optimize", text: "Review the comparison between Old and New regimes to choose the one with the lowest tax liability." }
          ]
        }}
      />


      <div className="min-h-screen bg-slate-50/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left: Input Wizard */}
            <div className="lg:col-span-8 space-y-8">
              
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <TaxStepIndicator 
                  steps={STEPS} 
                  currentStep={currentStep} 
                  onStepClick={setCurrentStep} 
                />

                <div className="mt-12 min-h-[400px]">
                  <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                      <m.div
                        key="step-income"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div className="space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                 <IndianRupee className="w-5 h-5" />
                              </div>
                              <div>
                                 <h3 className="text-xl font-black text-slate-900">Income Details</h3>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step 1 of 3</p>
                              </div>
                           </div>

                           <div className="grid md:grid-cols-2 gap-6 pt-4">
                              <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Assessment Year</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  {['2026-27', '2025-26'].map(year => (
                                    <button
                                      key={year}
                                      onClick={() => setInputs(p => ({ ...p, assessmentYear: year }))}
                                      className={cn(
                                        "py-3 rounded-xl border-2 text-xs font-black transition-all",
                                        inputs.assessmentYear === year 
                                          ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" 
                                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                      )}
                                    >
                                      AY {year}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Basic Salary (Annual)</Label>
                                <div className="relative group">
                                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                                  <Input 
                                    type="number"
                                    value={inputs.income || ""}
                                    onChange={e => setInputs(p => ({ ...p, income: Number(e.target.value) }))}
                                    className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 text-lg font-black focus:bg-white transition-all focus:ring-4 focus:ring-blue-100"
                                    placeholder="e.g. 10,00,000"
                                  />
                                </div>
                              </div>

                              <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Other Income / Interest</Label>
                                <div className="relative group">
                                  <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                                  <Input 
                                    type="number"
                                    onChange={e => setInputs(p => ({ ...p, income: (inputs.income || 0) + Number(e.target.value) }))}
                                    className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 text-sm font-black focus:bg-white transition-all"
                                    placeholder="Savings/FD Interest"
                                  />
                                </div>
                              </div>

                              <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Rental Income</Label>
                                <div className="relative group">
                                  <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                                  <Input 
                                    type="number"
                                    className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 text-sm font-black focus:bg-white transition-all"
                                    placeholder="Annual Rent Received"
                                  />
                                </div>
                              </div>
                           </div>


                           <div className="space-y-3 pt-4">
                              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tax Regime</Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {[
                                   { id: 'new', label: 'New Tax Regime', desc: 'Lower rates, no major deductions' },
                                   { id: 'old', label: 'Old Tax Regime', desc: 'Higher rates, multiple deductions' }
                                 ].map(regime => (
                                   <div 
                                     key={regime.id}
                                     onClick={() => setInputs(p => ({ ...p, regime: regime.id as any }))}
                                     className={cn(
                                       "p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4",
                                       inputs.regime === regime.id 
                                         ? "border-blue-600 bg-blue-50/30" 
                                         : "border-slate-100 hover:bg-slate-50"
                                     )}
                                   >
                                      <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 shrink-0",
                                        inputs.regime === regime.id ? "border-blue-600" : "border-slate-300"
                                      )}>
                                        {inputs.regime === regime.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                      </div>
                                      <div>
                                         <p className="font-black text-slate-900 leading-none mb-1">{regime.label}</p>
                                         <p className="text-[11px] font-bold text-slate-400">{regime.desc}</p>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                      </m.div>
                    )}

                    {currentStep === 1 && (
                      <m.div
                        key="step-deductions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                         <div className="space-y-6">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                  <ShieldCheck className="w-5 h-5" />
                               </div>
                               <div>
                                  <h3 className="text-xl font-black text-slate-900">Deductions & Exemptions</h3>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step 2 of 3</p>
                               </div>
                            </div>

                            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                               <div className="flex items-center gap-2 mb-4">
                                  <Info className="w-4 h-4 text-blue-500" />
                                  <p className="text-xs font-bold text-slate-500 italic">
                                     Only standard deduction (₹75k) applies in the New Regime. Other deductions require the Old Regime.
                                  </p>
                               </div>

                               <div className="space-y-6">
                                  <div className="grid md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Section 80C (Max ₹1.5L)</Label>
                                        <div className="relative group">
                                           <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
                                           <Input 
                                             type="number"
                                             disabled={inputs.regime === 'new'}
                                             onChange={e => setInputs(p => ({ ...p, deductions: (inputs.deductions || 0) + Number(e.target.value) }))}
                                             className="h-14 pl-12 rounded-2xl border-slate-100 bg-white text-sm font-black transition-all"
                                             placeholder="PPF, LIC, ELSS..."
                                           />
                                        </div>
                                     </div>
                                     <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Section 80D (Health)</Label>
                                        <div className="relative group">
                                           <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
                                           <Input 
                                             type="number"
                                             disabled={inputs.regime === 'new'}
                                             className="h-14 pl-12 rounded-2xl border-slate-100 bg-white text-sm font-black transition-all"
                                             placeholder="Insurance Premium"
                                           />
                                        </div>
                                     </div>
                                  </div>

                                  <div className="space-y-2">
                                     <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Other Deductions (HRA, etc.)</Label>
                                     <div className="relative group">
                                        <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
                                        <Input 
                                          type="number"
                                          disabled={inputs.regime === 'new'}
                                          value={inputs.deductions || ""}
                                          onChange={e => setInputs(p => ({ ...p, deductions: Number(e.target.value) }))}
                                          className="h-14 pl-12 rounded-2xl border-slate-100 bg-white text-lg font-black transition-all focus:ring-4 focus:ring-emerald-100"
                                          placeholder="Enter total amount"
                                        />
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </m.div>
                    )}

                    {currentStep === 2 && (
                      <m.div
                        key="step-results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                      >
                         <div className="space-y-8">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                                     <PieChart className="w-5 h-5" />
                                  </div>
                                  <div>
                                     <h3 className="text-xl font-black text-slate-900">Tax Summary</h3>
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Final Step</p>
                                  </div>
                               </div>
                               <CalculatorExport 
                                 title="Tax Analysis"
                                 data={{
                                   "Income": inputs.income || 0,
                                   "Regime": inputs.regime,
                                   "Tax": result?.taxPayable || 0
                                 }}
                               />
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <m.div
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className={cn(
                                   "p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden",
                                   inputs.regime === 'new' ? "border-blue-600 bg-white shadow-2xl shadow-blue-50" : "border-slate-100 bg-slate-50 opacity-60"
                                 )}
                               >
                                  {inputs.regime === 'new' && (
                                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Selected</div>
                                  )}
                                  <div className="flex items-center gap-3 mb-6">
                                     <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Zap className="w-5 h-5 fill-blue-600" />
                                     </div>
                                     <h4 className="text-lg font-black text-slate-900">New Regime</h4>
                                  </div>
                                  <div className="space-y-1">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Liability</p>
                                     <p className="text-3xl font-black text-slate-900">
                                        {formatCurrency(inputs.regime === 'new' ? result?.taxPayable || 0 : otherResult?.taxPayable || 0)}
                                     </p>
                                  </div>
                                  <div className="mt-8 pt-6 border-t border-slate-100">
                                     <p className="text-[10px] font-bold text-slate-500 italic">Optimized for AY {inputs.assessmentYear}</p>
                                  </div>
                               </m.div>

                               <m.div
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: 0.1 }}
                                 className={cn(
                                   "p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden",
                                   inputs.regime === 'old' ? "border-slate-900 bg-white shadow-2xl shadow-slate-50" : "border-slate-100 bg-slate-50 opacity-60"
                                 )}
                               >
                                  {inputs.regime === 'old' && (
                                    <div className="absolute top-4 right-4 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Selected</div>
                                  )}
                                  <div className="flex items-center gap-3 mb-6">
                                     <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-600">
                                        <TrendingDown className="w-5 h-5" />
                                     </div>
                                     <h4 className="text-lg font-black text-slate-900">Old Regime</h4>
                                  </div>
                                  <div className="space-y-1">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Tax</p>
                                     <p className="text-2xl font-black text-slate-900">
                                        {formatCurrency(inputs.regime === 'old' ? result?.taxPayable || 0 : otherResult?.taxPayable || 0)}
                                     </p>
                                  </div>
                                  <div className="mt-8 pt-6 border-t border-slate-100 italic text-[10px] font-bold text-slate-400">
                                     Includes your declared deductions
                                  </div>
                              </m.div>

                            </div>

                            {comparison && comparison.recommended !== inputs.regime && (
                               <m.div 
                                 initial={{ opacity: 0, scale: 0.9 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6"
                               >
                                  <div>
                                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
                                        Optimization Alert
                                     </div>
                                     <h4 className="text-2xl font-black mb-2 italic tracking-tight">You could save {formatCurrency(comparison.savings)}!</h4>
                                     <p className="text-xs font-bold text-slate-400">Switching to the <span className="text-blue-400 uppercase">{comparison.recommended}</span> regime will lower your tax liability.</p>
                                  </div>
                                  <Button 
                                    onClick={() => setInputs(p => ({ ...p, regime: comparison.recommended }))}
                                    className="bg-white text-slate-900 rounded-2xl font-black px-10 h-14 hover:bg-slate-100 transition-all border-none"
                                  >
                                     Switch to {comparison.recommended}
                                  </Button>
                               </m.div>
                            )}


                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               {[
                                 { label: 'Taxable Income', val: result?.taxableIncome, icon: IndianRupee, color: 'text-blue-600' },
                                 { label: 'Standard Ded.', val: 75000, icon: Shield, color: 'text-emerald-600' },
                                 { label: 'Net Take-Home', val: result?.netIncome, icon: TrendingUp, color: 'text-violet-600' }
                               ].map((stat, i) => (
                                 <div key={i} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-3">
                                       <stat.icon className={cn("w-4 h-4", stat.color)} />
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-900 tracking-tight">{formatCurrency(stat.val || 0)}</p>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
                   <Button
                     variant="ghost"
                     onClick={prevStep}
                     disabled={currentStep === 0}
                     className="rounded-xl font-bold text-slate-400 hover:text-slate-900 transition-colors"
                   >
                     <ArrowLeft className="w-4 h-4 mr-2" />
                     Previous
                   </Button>

                   {currentStep < STEPS.length - 1 ? (
                     <Button
                       onClick={nextStep}
                       className="bg-slate-900 text-white rounded-xl font-black px-8 py-6 h-auto hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5"
                     >
                       Continue
                       <ArrowRight className="w-4 h-4 ml-2" />
                     </Button>
                   ) : (
                     <Button
                        onClick={() => setCurrentStep(0)}
                        className="bg-blue-600 text-white rounded-xl font-black px-8 py-6 h-auto hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                     >
                        Reset Calculator
                     </Button>
                   )}
                </div>
              </div>

              {/* Bottom Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <Star className="w-8 h-8 text-white/20 mb-6" />
                    <h4 className="text-xl font-black mb-2 italic">Professional CA Support</h4>
                    <p className="text-sm text-white/70 mb-6 leading-relaxed">Don't risk errors. Get your taxes filed by certified experts with 100% precision.</p>
                    <Button className="bg-white text-indigo-600 rounded-xl font-black hover:bg-slate-100 transition-all">
                       Talk to an Expert
                    </Button>
                 </div>
                 <div className="bg-white rounded-3xl p-8 border border-slate-100 relative overflow-hidden group">
                    <Lightbulb className="w-8 h-8 text-amber-500 mb-6" />
                    <h4 className="text-xl font-black text-slate-900 mb-2 italic">Tax Saving Tips</h4>
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">Discover hidden exemptions that could save you thousands this financial year.</p>
                    <Button variant="ghost" className="text-slate-900 rounded-xl font-black hover:bg-slate-50 transition-all px-0 flex items-center gap-2">
                       Explore Guides <ArrowRight className="w-4 h-4" />
                    </Button>
                 </div>
              </div>

            </div>

            {/* Right: Sticky Summary */}
            <div className="hidden lg:block lg:col-span-4">
              <TaxStickySidebar 
                result={result} 
                inputs={inputs} 
                assessmentYear={inputs.assessmentYear} 
              />
            </div>
            {/* New SEO Depth Section: How to Calculate & FAQ */}
            <div className="lg:col-span-12 mt-16 space-y-16 border-t pt-16">
              <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 italic tracking-tight underline decoration-blue-500/20 decoration-8 underline-offset-[-2px]">
                    Step-by-Step: How to Calculate Income Tax Manually?
                  </h2>
                  <div className="space-y-6">
                    {[
                      { step: "01", title: "Calculate Gross Total Income", desc: "Sum up your salary, house property income, business profits, capital gains, and income from other sources (like interest)." },
                      { step: "02", title: "Subtract Exemptions", desc: "For the Old Regime, subtract HRA, LTA, and other allowances. For both regimes, subtract the Standard Deduction (₹75,000 for AY 25-26)." },
                      { step: "03", title: "Deduct Investments (Section 80C to 80U)", desc: "Subtract investments like PPF, ELSS, Insurance (up to ₹1.5L) and Health Insurance (Section 80D). This applies only to the Old Regime." },
                      { step: "04", title: "Apply Slab Rates", desc: "Apply the relevant tax slabs (0%, 5%, 10%, etc.) to your Net Taxable Income. Remember to use the New Regime slabs for default calculation." },
                      { step: "05", title: "Add Health & Education Cess", desc: "Calculate 4% Cess on the total tax liability before the final payment." }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-6 group">
                        <div className="text-3xl font-black text-slate-200 group-hover:text-blue-100 transition-colors leading-none">{item.step}</div>
                        <div>
                          <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                          <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    {[
                      { q: "Is income up to ₹7 Lakh really tax-free?", a: "Yes, under the New Tax Regime, Section 87A provides a rebate that makes your effective tax zero if your taxable income doesn't exceed ₹7 Lakh." },
                      { q: "Can I switch between Old and New regimes?", a: "Salaried individuals can choose every year at the time of filing ITR. However, those with business income can only switch once in a lifetime." },
                      { q: "What is the Standard Deduction for AY 2025-26?", a: "Budget 2024-25 increased the Standard Deduction from ₹50,000 to ₹75,000 for both salaried employees and pensioners under the New Regime." },
                      { q: "How much can I save under Section 80C?", a: "You can deduct up to ₹1.5 Lakh per year through investments like PF, ELSS, Insurance, and Life Insurance premiums under the Old Tax Regime." }
                    ].map((faq, idx) => (
                      <div key={idx} className="space-y-2 border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                        <h4 className="font-bold text-slate-900 flex gap-2">
                          <span className="text-blue-600 italic font-black">Q.</span> {faq.q}
                        </h4>
                        <p className="text-sm text-slate-500 pl-6 leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
