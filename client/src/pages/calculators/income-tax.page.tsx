import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import EnhancedSEO from "@/components/EnhancedSEO";
import { getHowToSchema } from "@/utils/seo-defaults";
import TaxStepIndicator from "@/components/calculators/TaxStepIndicator";
import TaxStickySidebar from "@/components/calculators/TaxStickySidebar";
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
      <EnhancedSEO
        title="Income Tax Calculator 2026-27 | Professional Tax Hub"
        description="Premium income tax calculator with real-time comparison. Optimized for AY 2026-27 and 2025-26."
        url="https://myeca.in/calculators/income-tax"
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
                      <motion.div
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
                      </motion.div>
                    )}

                    {currentStep === 1 && (
                      <motion.div
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
                                     Only standard deduction (\u20B975k) applies in the New Regime. Other deductions require the Old Regime.
                                  </p>
                               </div>

                               <div className="space-y-6">
                                  <div className="grid md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Section 80C (Max \u20B91.5L)</Label>
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
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div
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
                               <motion.div
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
                               </motion.div>

                               <motion.div
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
                               </motion.div>

                            </div>

                            {comparison && comparison.recommended !== inputs.regime && (
                               <motion.div 
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
                               </motion.div>
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
                      </motion.div>
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

          </div>
        </div>
      </div>
    </>
  );
}
