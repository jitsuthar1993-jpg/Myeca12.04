import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, Search, TrendingUp, Coins, FileText, Calendar, 
  ArrowRight, ShieldCheck, Scale, IndianRupee, Info 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import Breadcrumb from "@/components/Breadcrumb";
import { getHowToSchema } from "@/utils/seo-defaults";
import { cn } from "@/lib/utils";

interface TaxSlab {
  min: number;
  max: number | null;
  rate: number;
}

interface TaxRates {
  year: string;
  oldRegime: TaxSlab[];
  newRegime: TaxSlab[];
  standardDeduction: number;
  basicExemption: number;
}

interface TaxCalculation {
  grossIncome: number;
  taxableIncome: number;
  taxPayable: number;
  netIncome: number;
  effectiveRate: number;
  slabWiseBreakdown: Array<{
    slab: string;
    taxableAmount: number;
    tax: number;
  }>;
}

const assessmentYears = [
  { value: "2025-26", label: "AY 2025-26 (FY 2024-25)" },
  { value: "2024-25", label: "AY 2024-25 (FY 2023-24)" },
  { value: "2023-24", label: "AY 2023-24 (FY 2022-23)" }
];

// Default tax rates (Budget 2024 rates for FY 2024-25)
const defaultTaxRates: { [key: string]: TaxRates } = {
  "2025-26": {
    year: "2025-26",
    oldRegime: [
      { min: 0, max: 250000, rate: 0 },
      { min: 250000, max: 500000, rate: 5 },
      { min: 500000, max: 1000000, rate: 20 },
      { min: 1000000, max: null, rate: 30 }
    ],
    newRegime: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 700000, rate: 5 },
      { min: 700000, max: 1000000, rate: 10 },
      { min: 1000000, max: 1200000, rate: 15 },
      { min: 1200000, max: 1500000, rate: 20 },
      { min: 1500000, max: null, rate: 30 }
    ],
    standardDeduction: 75000,
    basicExemption: 300000
  },
  "2024-25": {
    year: "2024-25",
    oldRegime: [
      { min: 0, max: 250000, rate: 0 },
      { min: 250000, max: 500000, rate: 5 },
      { min: 500000, max: 1000000, rate: 20 },
      { min: 1000000, max: null, rate: 30 }
    ],
    newRegime: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 700000, rate: 5 },
      { min: 700000, max: 1000000, rate: 10 },
      { min: 1000000, max: 1200000, rate: 15 },
      { min: 1200000, max: 1500000, rate: 20 },
      { min: 1500000, max: null, rate: 30 }
    ],
    standardDeduction: 75000,
    basicExemption: 300000
  }
};

export default function TaxRegimeCalculator() {
  const seo = getSEOConfig('/calculators/tax-regime');
  const [selectedYear, setSelectedYear] = useState("2025-26");
  const [income, setIncome] = useState("");
  const [deductions, setDeductions] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [taxRates, setTaxRates] = useState<{ [key: string]: TaxRates }>(defaultTaxRates);
  const [calculations, setCalculations] = useState<{
    oldRegime: TaxCalculation | null;
    newRegime: TaxCalculation | null;
  }>({ oldRegime: null, newRegime: null });
  
  const { toast } = useToast();

  const searchTaxRates = async () => {
    setIsSearching(true);
    try {
      const response = await fetch('/api/search-tax-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentYear: selectedYear })
      });

      if (response.ok) {
        const searchData = await response.json();
        if (searchData.knownRates) {
          setTaxRates(prev => ({
            ...prev,
            [selectedYear]: {
              year: selectedYear,
              oldRegime: searchData.knownRates.oldRegime,
              newRegime: searchData.knownRates.newRegime,
              standardDeduction: searchData.knownRates.standardDeduction,
              basicExemption: searchData.knownRates.newRegime[0].max
            }
          }));
        }
        Object.entries(searchData.searchUrls).forEach(([key, url], index) => {
          setTimeout(() => { window.open(url as string, `_blank_${key}`); }, index * 500);
        });
        toast({ title: "Search URLs Opened", description: `Opened Google search tabs for AY ${selectedYear} tax rates. Please verify the current rates from official sources.` });
      } else {
        throw new Error('Failed to get search URLs');
      }
    } catch (error) {
      toast({ title: "Search Failed", description: "Could not open search URLs. Please manually search for current tax rates.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const calculateTax = (grossIncome: number, totalDeds: number, regime: 'old' | 'new'): TaxCalculation => {
    const currentRates = taxRates[selectedYear] || defaultTaxRates["2025-26"];
    const slabs = regime === 'old' ? currentRates.oldRegime : currentRates.newRegime;
    const standardDeduction = regime === 'new' ? currentRates.standardDeduction : 50000; // 50k SD in old regime usually, assuming 50k for salaried.
    const maxDeductions = regime === 'old' ? totalDeds + 50000 : currentRates.standardDeduction; 
    
    // For simplicity: Old regime takes user deductions + 50k SD. New regime takes 75k SD (from Budget 24).
    const appliedDeductions = regime === 'old' ? totalDeds + 50000 : currentRates.standardDeduction;
    const taxableIncome = Math.max(0, grossIncome - appliedDeductions);
    
    let taxPayable = 0;
    const slabWiseBreakdown: Array<{slab: string; taxableAmount: number; tax: number;}> = [];

    for (const slab of slabs) {
      if (taxableIncome <= slab.min) break;
      const maxForSlab = slab.max || taxableIncome;
      const taxableInThisSlab = Math.min(taxableIncome, maxForSlab) - slab.min;
      
      if (taxableInThisSlab > 0) {
        const taxForSlab = (taxableInThisSlab * slab.rate) / 100;
        taxPayable += taxForSlab;
        slabWiseBreakdown.push({
          slab: slab.max ? `₹${slab.min.toLocaleString()} - ₹${slab.max.toLocaleString()}` : `₹${slab.min.toLocaleString()}+`,
          taxableAmount: taxableInThisSlab,
          tax: taxForSlab
        });
      }
    }

    // Rebate 87A
    if (regime === 'old' && taxableIncome <= 500000) { taxPayable = 0; }
    if (regime === 'new' && taxableIncome <= 700000) { taxPayable = 0; } // Assuming default 7L limit for new regime 87A

    const cess = taxPayable > 0 ? taxPayable * 0.04 : 0;
    const totalTax = taxPayable + cess;

    return {
      grossIncome,
      taxableIncome,
      taxPayable: totalTax,
      netIncome: grossIncome - totalTax,
      effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
      slabWiseBreakdown: taxPayable > 0 ? slabWiseBreakdown : []
    };
  };

  const handleCalculate = () => {
    const grossIncome = parseFloat(income) || 0;
    const totalDeductions = parseFloat(deductions) || 0;

    if (grossIncome <= 0) {
      toast({ title: "Invalid Input", description: "Please enter a valid gross income amount.", variant: "destructive" });
      return;
    }

    setCalculations({
      oldRegime: calculateTax(grossIncome, totalDeductions, 'old'),
      newRegime: calculateTax(grossIncome, totalDeductions, 'new')
    });
  };

  const recommendation = React.useMemo(() => {
    if (!calculations.oldRegime || !calculations.newRegime) return null;
    const diff = calculations.oldRegime.taxPayable - calculations.newRegime.taxPayable;
    if (Math.abs(diff) < 500) return { regime: 'either', savings: 0, text: 'Both regimes are similar for you.' };
    return diff > 0 
      ? { regime: 'new', savings: diff, text: `New Regime saves you ₹${Math.abs(diff).toLocaleString()}` }
      : { regime: 'old', savings: Math.abs(diff), text: `Old Regime saves you ₹${Math.abs(diff).toLocaleString()}` };
  }, [calculations]);

  const howToSchema = getHowToSchema({
    name: "How to Compare Old vs New Tax Regime",
    description: "Compare tax liability under old and new income tax regimes",
    totalTime: "PT5M",
    steps: [
      { name: "Enter your income details", text: "Input your gross annual income and deductions" },
      { name: "Select assessment year", text: "Choose the relevant assessment year for accurate tax rates" },
      { name: "Review calculations", text: "Compare tax liability under both regimes side by side" },
      { name: "Choose optimal regime", text: "Select the regime that saves you more tax" }
    ]
  });

  return (
    <>
      <MetaSEO
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        type={seo?.type}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
        faqPageData={[
          {
            question: "Can I switch regimes every year?",
            answer: "Yes, if you have salary or pension income, you can choose a different regime every year. However, if you have income from a business or profession, you can only opt back to the Old Regime once in your lifetime."
          },
          {
            question: "Do I get HRA in the New Tax Regime?",
            answer: "No. House Rent Allowance (HRA) and Leave Travel Allowance (LTA) exemptions are not available under the New Tax Regime."
          },
          {
            question: "Is the Standard Deduction available in both?",
            answer: "Yes. The Standard Deduction of ₹75,000 (updated in Budget 2024) is available under the New Regime, while the Old Regime offers ₹50,000."
          }
        ]}
      />
      <div className="min-h-screen bg-slate-50/50 calculator-gradient-bg pb-24">
        <Breadcrumb items={[{ name: "Calculators", href: "/calculators" }, { name: "Regime Comparator" }]} />

        {/* --- HERO SECTION --- */}
        <section className="relative pt-12 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] -z-10" />
          <div className="max-w-7xl mx-auto px-4 text-center">
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-[11px] font-black uppercase tracking-widest mb-6 shadow-sm"
            >
              <Scale className="w-3.5 h-3.5" />
              Regime Comparator
            </m.div>
            <m.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6"
            >
              Old vs <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">New Regime</span>
            </m.h1>
            <m.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-500 max-w-2xl mx-auto font-medium"
            >
              Discover which tax regime helps you save more money. Compare side-by-side with the latest FY 2024-25 rates.
            </m.p>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Input Panel */}
            <div className="lg:col-span-5 space-y-6">
              <m.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden"
              >
                <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50/50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Details</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Income & Deductions</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                      Assessment Year
                    </Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 text-lg font-black focus:bg-white focus:ring-4 focus:ring-blue-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                        {assessmentYears.map((year) => (
                          <SelectItem key={year.value} value={year.value} className="font-bold text-slate-700">
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                      Gross Annual Income
                    </Label>
                    <div className="relative group">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                      <Input
                        type="number"
                        placeholder="0"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 text-lg font-black focus:bg-white transition-all focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                        Total Deductions (80C, 80D)
                      </Label>
                    </div>
                    <div className="relative group">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                      <Input
                        type="number"
                        placeholder="0"
                        value={deductions}
                        onChange={(e) => setDeductions(e.target.value)}
                        className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 text-lg font-black focus:bg-white transition-all focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Standard Deduction (50k/75k) is applied automatically</p>
                  </div>

                  <Button
                    onClick={handleCalculate}
                    disabled={!income}
                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all text-lg"
                  >
                    Compare Now <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </m.div>

              {/* Verify Rates Note */}
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-slate-400" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-slate-900 mb-1 tracking-tight">Accurate Estimations</h3>
                    <p className="text-xs font-medium text-slate-500 mb-3">Calculations use default Budget 2024 rates. For precise planning, verify with current notifications.</p>
                    <Button variant="outline" size="sm" onClick={searchTaxRates} disabled={isSearching} className="h-8 rounded-lg text-xs font-bold border-slate-200">
                       {isSearching ? 'Opening...' : 'Verify Rates on Google'}
                    </Button>
                 </div>
              </div>
            </div>

            {/* Right: Results Panel */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {calculations.oldRegime && calculations.newRegime ? (
                  <m.div
                    key="results"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Recommendation Banner */}
                    {recommendation && (
                      <div className={cn(
                        "rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl",
                        recommendation.regime === 'new' ? "bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20" : 
                        recommendation.regime === 'old' ? "bg-gradient-to-br from-indigo-500 to-blue-700 shadow-blue-500/20" :
                        "bg-gradient-to-br from-slate-600 to-slate-800 shadow-slate-500/20"
                      )}>
                        <div className="absolute top-0 right-0 p-8 opacity-10 scale-150">
                          <TrendingUp className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:justify-between gap-6">
                           <div>
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                                 Recommendation
                              </div>
                              <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                                 {recommendation.regime === 'new' ? 'Choose New Regime' : recommendation.regime === 'old' ? 'Choose Old Regime' : 'Both are Similar'}
                              </h3>
                              <p className="text-white/80 font-medium">
                                 {recommendation.text}
                              </p>
                           </div>
                           {recommendation.savings > 0 && (
                              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-center min-w-[160px] border border-white/20">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-white/70 block mb-1">You Save</span>
                                 <span className="text-3xl font-black tracking-tighter">₹{recommendation.savings.toLocaleString()}</span>
                              </div>
                           )}
                        </div>
                      </div>
                    )}

                    {/* Side-by-side Comparison */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      
                      {/* Old Regime Card */}
                      <div className="bg-white rounded-[2.5rem] border-2 border-indigo-50 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 bg-indigo-50/50 border-b border-indigo-50 text-center">
                          <h4 className="font-black text-indigo-900 tracking-tight text-lg mb-1">Old Regime</h4>
                          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-[10px] uppercase tracking-widest border-0">Traditional</Badge>
                        </div>
                        <div className="p-6 space-y-6 flex-1">
                          <div className="text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Total Tax Payable</span>
                            <div className="text-4xl font-black tracking-tighter text-slate-900">
                              ₹{calculations.oldRegime.taxPayable.toLocaleString()}
                            </div>
                          </div>

                          <div className="space-y-3 pt-6 border-t border-slate-100">
                            <div className="flex justify-between items-center py-1">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross</span>
                              <span className="font-black text-slate-900">₹{calculations.oldRegime.grossIncome.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deductions</span>
                              <span className="font-black text-slate-900">-₹{(Number(deductions) + 50000).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taxable</span>
                              <span className="font-black text-indigo-600">₹{calculations.oldRegime.taxableIncome.toLocaleString()}</span>
                            </div>
                          </div>

                          {calculations.oldRegime.slabWiseBreakdown.length > 0 && (
                            <div className="pt-6 border-t border-slate-100">
                               <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Slab Breakdown</h5>
                               <div className="space-y-2">
                                  {calculations.oldRegime.slabWiseBreakdown.map((slab, i) => (
                                     <div key={i} className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-medium">{slab.slab}</span>
                                        <span className="font-bold text-slate-700">₹{slab.tax.toLocaleString()}</span>
                                     </div>
                                  ))}
                               </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* New Regime Card */}
                      <div className="bg-white rounded-[2.5rem] border-2 border-emerald-50 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 bg-emerald-50/50 border-b border-emerald-50 text-center">
                          <h4 className="font-black text-emerald-900 tracking-tight text-lg mb-1">New Regime</h4>
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] uppercase tracking-widest border-0">Default from FY24</Badge>
                        </div>
                        <div className="p-6 space-y-6 flex-1">
                          <div className="text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Total Tax Payable</span>
                            <div className="text-4xl font-black tracking-tighter text-slate-900">
                              ₹{calculations.newRegime.taxPayable.toLocaleString()}
                            </div>
                          </div>

                          <div className="space-y-3 pt-6 border-t border-slate-100">
                            <div className="flex justify-between items-center py-1">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross</span>
                              <span className="font-black text-slate-900">₹{calculations.newRegime.grossIncome.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Std. Ded.</span>
                              <span className="font-black text-slate-900">-₹75,000</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taxable</span>
                              <span className="font-black text-emerald-600">₹{calculations.newRegime.taxableIncome.toLocaleString()}</span>
                            </div>
                          </div>

                          {calculations.newRegime.slabWiseBreakdown.length > 0 && (
                            <div className="pt-6 border-t border-slate-100">
                               <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Slab Breakdown</h5>
                               <div className="space-y-2">
                                  {calculations.newRegime.slabWiseBreakdown.map((slab, i) => (
                                     <div key={i} className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-medium">{slab.slab}</span>
                                        <span className="font-bold text-slate-700">₹{slab.tax.toLocaleString()}</span>
                                     </div>
                                  ))}
                               </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </m.div>
                ) : (
                  <m.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-100 border-dashed rounded-[2.5rem]"
                  >
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                      <Scale className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Compare Regimes</h3>
                    <p className="text-slate-500 font-medium max-w-sm">Enter your income and deductions to instantly see which tax regime works best for you.</p>
                  </m.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </main>

        {/* --- SEO & EXPLAINER SECTION --- */}
        <section className="max-w-7xl mx-auto px-4 mt-24">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6">
                Old vs New Tax Regime: Which is Better? (FY 2024-25)
              </h2>
              <div className="space-y-6 text-slate-600 font-medium leading-relaxed">
                <p>
                  Choosing between the Old and New Tax Regimes is one of the most critical financial decisions taxpayers face. The New Tax Regime offers lower tax slab rates but strips away most deductions. In contrast, the Old Tax Regime retains higher tax rates but allows you to reduce your taxable income using deductions like Section 80C, HRA, and home loan interest.
                </p>
                
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-8 mb-4">
                  The New Tax Regime (Default)
                </h3>
                <p>
                  As of FY 2023-24, the New Regime is the default option. If you do not explicitly choose the Old Regime with your employer or while filing ITR, your taxes will be computed under the New Regime. It is generally beneficial for individuals who do not have significant tax-saving investments or home loans. Notably, it offers a Standard Deduction of ₹75,000 for salaried employees and zero tax on income up to ₹7 Lakhs due to Section 87A rebate.
                </p>

                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-8 mb-4">
                  The Old Tax Regime
                </h3>
                <p>
                  The Old Regime rewards disciplined saving. It allows a multitude of deductions:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-slate-900 font-bold">Section 80C:</strong> Up to ₹1.5 Lakhs (PPF, ELSS, EPF, Life Insurance).</li>
                  <li><strong className="text-slate-900 font-bold">Section 80D:</strong> Medical insurance premiums.</li>
                  <li><strong className="text-slate-900 font-bold">Section 24(b):</strong> Up to ₹2 Lakhs on home loan interest.</li>
                  <li><strong className="text-slate-900 font-bold">HRA & LTA:</strong> Exemptions for rent and travel.</li>
                </ul>

                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-8 mb-4">
                  The Break-Even Point
                </h3>
                <p>
                  Whether you should stick to the Old Regime or switch depends on your "Break-Even Deductions." If your total eligible deductions exceed this break-even amount (which varies based on your income level), the Old Regime will save you more tax. Our calculator above does this math automatically for you.
                </p>
              </div>
            </div>

            <hr className="my-12 border-slate-100" />

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-2">
                <Info className="w-6 h-6 text-indigo-500" />
                Frequently Asked Questions
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { q: "Can I switch regimes every year?", a: "Yes, if you have salary or pension income, you can choose a different regime every year. However, if you have income from a business or profession, you can only opt back to the Old Regime once in your lifetime." },
                  { q: "Do I get HRA in the New Tax Regime?", a: "No. House Rent Allowance (HRA) and Leave Travel Allowance (LTA) exemptions are not available under the New Tax Regime." },
                  { q: "Is the Standard Deduction available in both?", a: "Yes. The Standard Deduction of ₹75,000 (updated in Budget 2024) is available under the New Regime, while the Old Regime offers ₹50,000." },
                  { q: "What if my income is exactly ₹7.5 Lakhs?", a: "Under the New Regime, a salaried individual with ₹7.5L income pays ZERO tax (₹7.5L - ₹75k standard deduction = ₹6.75L taxable, which is under the ₹7L rebate limit)." }
                ].map((faq, idx) => (
                  <div key={idx} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                    <h4 className="font-black text-slate-900 mb-2">{faq.q}</h4>
                    <p className="text-sm font-medium text-slate-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}