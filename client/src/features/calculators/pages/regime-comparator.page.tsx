import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Info, 
  Calculator, 
  TrendingUp, 
  IndianRupee, 
  Check, 
  X, 
  Lightbulb,
  Scale,
  PiggyBank,
  Heart,
  Home,
  Wallet,
  Sparkles
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CalculatorExport } from "@/components/ui/calculator-export";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import Breadcrumb from "@/components/Breadcrumb";
import { cn } from "@/lib/utils";

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
  section80D_self: 25000,
  section80D_parents: 50000,
  section80D_preventive: 5000,
  section80E: Infinity,
  section80G: Infinity,
  section80TTA: 10000,
  section80TTB: 50000,
  section24b: 200000,
  standardDeduction: 75000,
  standardDeductionOld: 50000,
};

interface IncomeInputs {
  basicSalary: number;
  hra: number;
  lta: number;
  specialAllowance: number;
  otherIncome: number;
  rentalIncome: number;
  interestIncome: number;
  businessIncome: number;
}

interface DeductionInputs {
  section80C: number;
  section80CCD1B: number;
  section80D_self: number;
  section80D_parents: number;
  section80E: number;
  section80G: number;
  section80TTA: number;
  section24b: number;
  hraExemption: number;
  ltaExemption: number;
  professionalTax: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatLakhs = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return formatCurrency(amount);
};

export default function RegimeComparatorPage() {
  const seo = getSEOConfig('/calculators/tax-regime');
  const [activeTab, setActiveTab] = useState("income");
  
  const [income, setIncome] = useState<IncomeInputs>({
    basicSalary: 1000000,
    hra: 400000,
    lta: 50000,
    specialAllowance: 300000,
    otherIncome: 0,
    rentalIncome: 0,
    interestIncome: 50000,
    businessIncome: 0,
  });

  const [deductions, setDeductions] = useState<DeductionInputs>({
    section80C: 150000,
    section80CCD1B: 50000,
    section80D_self: 25000,
    section80D_parents: 0,
    section80E: 0,
    section80G: 0,
    section80TTA: 10000,
    section24b: 0,
    hraExemption: 200000,
    ltaExemption: 50000,
    professionalTax: 2500,
  });

  const calculations = useMemo(() => {
    const grossSalary = income.basicSalary + income.hra + income.lta + income.specialAllowance;
    const grossIncome = grossSalary + income.otherIncome + income.rentalIncome + income.interestIncome + income.businessIncome;

    const oldRegimeDeductions = 
      Math.min(deductions.section80C, DEDUCTION_LIMITS.section80C) +
      Math.min(deductions.section80CCD1B, DEDUCTION_LIMITS.section80CCD1B) +
      Math.min(deductions.section80D_self, DEDUCTION_LIMITS.section80D_self) +
      Math.min(deductions.section80D_parents, DEDUCTION_LIMITS.section80D_parents) +
      deductions.section80E +
      deductions.section80G +
      Math.min(deductions.section80TTA, DEDUCTION_LIMITS.section80TTA) +
      Math.min(deductions.section24b, DEDUCTION_LIMITS.section24b) +
      deductions.hraExemption +
      deductions.ltaExemption +
      deductions.professionalTax +
      DEDUCTION_LIMITS.standardDeductionOld;

    const oldTaxableIncome = Math.max(0, grossIncome - oldRegimeDeductions);
    
    let oldTax = 0;
    for (const slab of OLD_REGIME_SLABS) {
      if (oldTaxableIncome > slab.min) {
        const taxableInSlab = Math.min(oldTaxableIncome - slab.min, slab.max - slab.min);
        oldTax += taxableInSlab * (slab.rate / 100);
      }
    }

    if (oldTaxableIncome <= 500000) { oldTax = 0; }

    let oldSurcharge = 0;
    if (oldTaxableIncome > 5000000) { oldSurcharge = oldTax * 0.37; } 
    else if (oldTaxableIncome > 2000000) { oldSurcharge = oldTax * 0.25; } 
    else if (oldTaxableIncome > 1000000) { oldSurcharge = oldTax * 0.15; } 
    else if (oldTaxableIncome > 5000000) { oldSurcharge = oldTax * 0.10; }
    
    const oldCess = (oldTax + oldSurcharge) * 0.04;
    const oldTotalTax = oldTax + oldSurcharge + oldCess;

    const newRegimeDeductions = DEDUCTION_LIMITS.standardDeduction;
    const newTaxableIncome = Math.max(0, grossIncome - newRegimeDeductions);
    
    let newTax = 0;
    for (const slab of NEW_REGIME_SLABS) {
      if (newTaxableIncome > slab.min) {
        const taxableInSlab = Math.min(newTaxableIncome - slab.min, slab.max - slab.min);
        newTax += taxableInSlab * (slab.rate / 100);
      }
    }

    if (newTaxableIncome <= 700000) { newTax = 0; }

    let newSurcharge = 0;
    if (newTaxableIncome > 5000000) { newSurcharge = newTax * 0.25; } 
    else if (newTaxableIncome > 2000000) { newSurcharge = newTax * 0.25; } 
    else if (newTaxableIncome > 1000000) { newSurcharge = newTax * 0.15; } 
    else if (newTaxableIncome > 5000000) { newSurcharge = newTax * 0.10; }
    
    const newCess = (newTax + newSurcharge) * 0.04;
    const newTotalTax = newTax + newSurcharge + newCess;

    const savings = oldTotalTax - newTotalTax;
    const betterRegime = savings > 0 ? 'new' : savings < 0 ? 'old' : 'same';
    const absoluteSavings = Math.abs(savings);

    const breakevenDeductions = grossIncome - (newTaxableIncome + (newTotalTax / 0.3));

    const oldEffectiveRate = grossIncome > 0 ? (oldTotalTax / grossIncome) * 100 : 0;
    const newEffectiveRate = grossIncome > 0 ? (newTotalTax / grossIncome) * 100 : 0;

    return {
      grossIncome,
      grossSalary,
      oldRegime: {
        deductions: oldRegimeDeductions,
        taxableIncome: oldTaxableIncome,
        tax: oldTax,
        surcharge: oldSurcharge,
        cess: oldCess,
        totalTax: oldTotalTax,
        effectiveRate: oldEffectiveRate,
      },
      newRegime: {
        deductions: newRegimeDeductions,
        taxableIncome: newTaxableIncome,
        tax: newTax,
        surcharge: newSurcharge,
        cess: newCess,
        totalTax: newTotalTax,
        effectiveRate: newEffectiveRate,
      },
      savings: absoluteSavings,
      betterRegime,
      breakevenDeductions,
    };
  }, [income, deductions]);

  const comparisonChartData = [
    {
      name: 'Old Regime',
      'Gross Income': calculations.grossIncome,
      'Deductions': calculations.oldRegime.deductions,
      'Taxable Income': calculations.oldRegime.taxableIncome,
      'Tax Payable': calculations.oldRegime.totalTax,
    },
    {
      name: 'New Regime',
      'Gross Income': calculations.grossIncome,
      'Deductions': calculations.newRegime.deductions,
      'Taxable Income': calculations.newRegime.taxableIncome,
      'Tax Payable': calculations.newRegime.totalTax,
    },
  ];

  const handleIncomeChange = (field: keyof IncomeInputs, value: string) => {
    setIncome(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const handleDeductionChange = (field: keyof DeductionInputs, value: string) => {
    setDeductions(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const getRecommendation = () => {
    const { betterRegime, savings, oldRegime, newRegime, grossIncome } = calculations;
    
    if (betterRegime === 'same') {
      return {
        regime: 'Either',
        reason: 'Both regimes result in the same tax liability. You can choose either.',
        tips: ['Consider future income changes', 'New regime is simpler with fewer compliance requirements'],
      };
    }

    if (betterRegime === 'new') {
      return {
        regime: 'New Tax Regime',
        reason: `You save ${formatCurrency(savings)} with the New Regime. Your deductions (${formatCurrency(oldRegime.deductions)}) are not high enough to benefit from the Old Regime.`,
        tips: [
          'No need to maintain investment proofs',
          'Simpler tax filing process',
          'Better if you have limited deductions',
          grossIncome <= 700000 ? 'You get full tax rebate under Section 87A' : '',
        ].filter(Boolean),
      };
    }

    return {
      regime: 'Old Tax Regime',
      reason: `You save ${formatCurrency(savings)} with the Old Regime. Your total deductions of ${formatCurrency(oldRegime.deductions)} significantly reduce your tax liability.`,
      tips: [
        'Continue your tax-saving investments',
        'Claim all eligible deductions',
        'Keep proper documentation for HRA, 80C, 80D claims',
        'Consider maximizing NPS contribution for additional 80CCD(1B) benefit',
      ],
    };
  };

  const recommendation = getRecommendation();

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
            question: "Which tax regime is better for AY 2025-26?",
            answer: "For most people with income up to ₹7 lakh, the New Regime is better as it offers zero tax. For higher income, it depends on your deductions like HRA, 80C, and Home Loan interest."
          },
          {
            question: "What is the new standard deduction in Budget 2024?",
            answer: "The standard deduction has been increased to ₹75,000 for the New Tax Regime, while it remains ₹50,000 for the Old Tax Regime."
          },
          {
            question: "Can I switch between Old and New tax regimes every year?",
            answer: "Salaried individuals can choose between regimes every year. However, individuals with business income can only switch back to the Old Regime once in their lifetime."
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
              Advanced Comparison
            </m.div>
            <m.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6"
            >
              Regime <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Comparator</span>
            </m.h1>
            <m.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-500 max-w-2xl mx-auto font-medium"
            >
              Detailed breakdown of your tax savings under both regimes, comparing every deduction and exemption side-by-side.
            </m.p>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 -mt-8">
          {/* Quick Result Banner */}
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className={cn(
              "rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl transition-all",
              calculations.betterRegime === 'new' ? "bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20" : 
              calculations.betterRegime === 'old' ? "bg-gradient-to-br from-indigo-500 to-blue-700 shadow-blue-500/20" :
              "bg-gradient-to-br from-slate-600 to-slate-800 shadow-slate-500/20"
            )}>
              <div className="absolute top-0 right-0 p-8 opacity-10 scale-150">
                <Sparkles className="w-32 h-32" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Scale className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-2">
                       Recommendation
                    </div>
                    <p className="text-3xl md:text-4xl font-black tracking-tight">{recommendation.regime}</p>
                  </div>
                </div>
                {calculations.savings > 0 && (
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-center min-w-[200px] border border-white/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70 block mb-1">You Save</span>
                    <span className="text-4xl font-black tracking-tighter">{formatCurrency(calculations.savings)}</span>
                  </div>
                )}
              </div>
            </div>
          </m.div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Input Section */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50/50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Profile</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed Data Entry</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-2 bg-slate-50/50 p-2 rounded-none border-b border-slate-100">
                      <TabsTrigger value="income" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-bold tracking-tight">
                        <IndianRupee className="h-4 w-4 mr-2" /> Income
                      </TabsTrigger>
                      <TabsTrigger value="deductions" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-bold tracking-tight">
                        <PiggyBank className="h-4 w-4 mr-2" /> Deductions
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="income" className="p-8 space-y-6 mt-0">
                      <div className="space-y-4">
                        {[
                          { label: 'Basic Salary (Annual)', key: 'basicSalary' },
                          { label: 'HRA Received', key: 'hra' },
                          { label: 'LTA Received', key: 'lta' },
                          { label: 'Special Allowance', key: 'specialAllowance' },
                          { label: 'Interest Income', key: 'interestIncome' },
                          { label: 'Other Income', key: 'otherIncome' },
                        ].map(({ label, key }) => (
                          <div key={key} className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</Label>
                            <div className="relative group">
                              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                              <Input
                                type="number"
                                value={income[key as keyof IncomeInputs]}
                                onChange={(e) => handleIncomeChange(key as keyof IncomeInputs, e.target.value)}
                                className="h-12 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 text-base font-black focus:bg-white transition-all focus:ring-4 focus:ring-blue-100"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-center justify-between mt-6">
                        <span className="text-[11px] font-black uppercase tracking-widest text-blue-600">Total Gross Income</span>
                        <span className="text-2xl font-black text-blue-900 tracking-tighter">
                          {formatCurrency(calculations.grossIncome)}
                        </span>
                      </div>
                    </TabsContent>

                    <TabsContent value="deductions" className="p-8 space-y-6 mt-0">
                      <Accordion type="multiple" defaultValue={["80c"]} className="space-y-4">
                        <AccordionItem value="80c" className="border border-slate-100 rounded-2xl overflow-hidden bg-white px-1">
                          <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:border-b border-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                <PiggyBank className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="font-bold text-slate-800 tracking-tight text-sm">Sec 80C & 80CCD</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-4 space-y-5">
                            <div className="space-y-2">
                              <div className="flex justify-between items-end mb-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">80C (Max ₹1.5L)</Label>
                                <span className="text-xs font-bold text-slate-400">{Math.round((deductions.section80C / 150000) * 100)}% filled</span>
                              </div>
                              <Input type="number" value={deductions.section80C} onChange={(e) => handleDeductionChange('section80C', e.target.value)} className="h-10 rounded-xl border-slate-100 font-bold" />
                              <Progress value={(deductions.section80C / 150000) * 100} className="h-1.5" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">80CCD(1B) NPS (Max ₹50K)</Label>
                              <Input type="number" value={deductions.section80CCD1B} onChange={(e) => handleDeductionChange('section80CCD1B', e.target.value)} className="h-10 rounded-xl border-slate-100 font-bold" />
                              <Progress value={(deductions.section80CCD1B / 50000) * 100} className="h-1.5" />
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="80d" className="border border-slate-100 rounded-2xl overflow-hidden bg-white px-1">
                          <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:border-b border-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                <Heart className="h-4 w-4 text-red-600" />
                              </div>
                              <span className="font-bold text-slate-800 tracking-tight text-sm">Health (80D)</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-4 space-y-4">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Self & Family</Label>
                              <Input type="number" value={deductions.section80D_self} onChange={(e) => handleDeductionChange('section80D_self', e.target.value)} className="h-10 rounded-xl font-bold border-slate-100" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Parents</Label>
                              <Input type="number" value={deductions.section80D_parents} onChange={(e) => handleDeductionChange('section80D_parents', e.target.value)} className="h-10 rounded-xl font-bold border-slate-100" />
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="housing" className="border border-slate-100 rounded-2xl overflow-hidden bg-white px-1">
                          <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:border-b border-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Home className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-bold text-slate-800 tracking-tight text-sm">Housing Benefits</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-4 space-y-4">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">HRA Exemption</Label>
                              <Input type="number" value={deductions.hraExemption} onChange={(e) => handleDeductionChange('hraExemption', e.target.value)} className="h-10 rounded-xl font-bold border-slate-100" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Home Loan Int. (24b)</Label>
                              <Input type="number" value={deductions.section24b} onChange={(e) => handleDeductionChange('section24b', e.target.value)} className="h-10 rounded-xl font-bold border-slate-100" />
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="other" className="border border-slate-100 rounded-2xl overflow-hidden bg-white px-1">
                          <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:border-b border-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                <Wallet className="h-4 w-4 text-purple-600" />
                              </div>
                              <span className="font-bold text-slate-800 tracking-tight text-sm">Other Deductions</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-4 grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">80E Edu Loan</Label>
                              <Input type="number" value={deductions.section80E} onChange={(e) => handleDeductionChange('section80E', e.target.value)} className="h-10 rounded-xl font-bold border-slate-100" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">80TTA Interest</Label>
                              <Input type="number" value={deductions.section80TTA} onChange={(e) => handleDeductionChange('section80TTA', e.target.value)} className="h-10 rounded-xl font-bold border-slate-100" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">LTA Exemption</Label>
                              <Input type="number" value={deductions.ltaExemption} onChange={(e) => handleDeductionChange('ltaExemption', e.target.value)} className="h-10 rounded-xl font-bold border-slate-100" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Prof. Tax</Label>
                              <Input type="number" value={deductions.professionalTax} onChange={(e) => handleDeductionChange('professionalTax', e.target.value)} className="h-10 rounded-xl font-bold border-slate-100" />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex items-center justify-between mt-6">
                        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Total Deductions (Old)</span>
                        <span className="text-2xl font-black text-emerald-900 tracking-tighter">
                          {formatCurrency(calculations.oldRegime.deductions)}
                        </span>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Detailed Comparison Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className={cn("rounded-[2.5rem] border-2 shadow-sm overflow-hidden flex flex-col", calculations.betterRegime === 'old' ? 'border-indigo-400 bg-indigo-50/10' : 'border-indigo-50 bg-white')}>
                  <div className="p-6 bg-indigo-50/50 border-b border-indigo-50 text-center relative">
                    {calculations.betterRegime === 'old' && <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full">Winner</div>}
                    <h4 className="font-black text-indigo-900 tracking-tight text-lg mb-1">Old Regime</h4>
                  </div>
                  <div className="p-6 space-y-6 flex-1">
                    <div className="text-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Total Tax</span>
                      <div className="text-4xl font-black tracking-tighter text-slate-900">
                        {formatCurrency(calculations.oldRegime.totalTax)}
                      </div>
                      <Badge className="mt-2 bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 text-[10px] uppercase tracking-widest">{calculations.oldRegime.effectiveRate.toFixed(1)}% Effective</Badge>
                    </div>
                  </div>
                </Card>

                <Card className={cn("rounded-[2.5rem] border-2 shadow-sm overflow-hidden flex flex-col", calculations.betterRegime === 'new' ? 'border-emerald-400 bg-emerald-50/10' : 'border-emerald-50 bg-white')}>
                  <div className="p-6 bg-emerald-50/50 border-b border-emerald-50 text-center relative">
                    {calculations.betterRegime === 'new' && <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full">Winner</div>}
                    <h4 className="font-black text-emerald-900 tracking-tight text-lg mb-1">New Regime</h4>
                  </div>
                  <div className="p-6 space-y-6 flex-1">
                    <div className="text-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Total Tax</span>
                      <div className="text-4xl font-black tracking-tighter text-slate-900">
                        {formatCurrency(calculations.newRegime.totalTax)}
                      </div>
                      <Badge className="mt-2 bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 text-[10px] uppercase tracking-widest">{calculations.newRegime.effectiveRate.toFixed(1)}% Effective</Badge>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Insights */}
              <Card className="rounded-[2.5rem] border border-slate-100 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50/30">
                <CardContent className="p-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Lightbulb className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="space-y-4">
                      <div>
                         <h3 className="text-lg font-black text-amber-900 tracking-tight mb-1">Our Analysis</h3>
                         <p className="text-sm font-medium text-amber-800/80 leading-relaxed">{recommendation.reason}</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {recommendation.tips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm bg-white/60 p-3 rounded-xl border border-amber-100/50">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-amber-900/80 font-medium leading-tight">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visual Comparison Chart */}
              <Card className="rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="p-6 border-b border-slate-100">
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">Visual Breakdown</h3>
                </div>
                <CardContent className="p-6">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tickFormatter={(v) => formatLakhs(v)} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fontWeight: 700, fill: '#0f172a' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                           formatter={(value: number) => formatCurrency(value)}
                           contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} iconType="circle" />
                        <Bar dataKey="Taxable Income" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={24} />
                        <Bar dataKey="Tax Payable" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Deductions Availability Table */}
              <Card className="rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Deductions Availability</h3>
                </div>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-white">
                          <th className="py-4 px-6 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Deduction Type</th>
                          <th className="py-4 px-6 text-center font-bold text-indigo-400 uppercase tracking-widest text-[10px]">Old Regime</th>
                          <th className="py-4 px-6 text-center font-bold text-emerald-400 uppercase tracking-widest text-[10px]">New Regime</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { name: "Standard Deduction", old: "₹50,000", new: "₹75,000" },
                          { name: "Sec 80C (PPF, ELSS, etc.)", old: "₹1.5L", new: false },
                          { name: "Sec 80CCD(1B) - NPS", old: "₹50,000", new: false },
                          { name: "Sec 80D - Health Insurance", old: "Up to ₹1L", new: false },
                          { name: "HRA Exemption", old: true, new: false },
                          { name: "Home Loan Interest (24b)", old: "₹2L", new: false },
                          { name: "Sec 80E - Education Loan", old: "No limit", new: false },
                        ].map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/50 transition-colors bg-white">
                            <td className="py-4 px-6 font-medium text-slate-700">{item.name}</td>
                            <td className="py-4 px-6 text-center">
                              {typeof item.old === 'boolean' 
                                ? (item.old ? <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50"><Check className="h-3 w-3 text-emerald-600" /></div> : <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50"><X className="h-3 w-3 text-red-600" /></div>)
                                : <span className="text-xs font-black text-indigo-600">{item.old}</span>
                              }
                            </td>
                            <td className="py-4 px-6 text-center">
                              {typeof item.new === 'boolean' 
                                ? (item.new ? <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50"><Check className="h-3 w-3 text-emerald-600" /></div> : <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50"><X className="h-3 w-3 text-red-600" /></div>)
                                : <span className="text-xs font-black text-emerald-600">{item.new}</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Export */}
              <div className="flex justify-end">
                <CalculatorExport
                  title="Tax Regime Comparison Detailed"
                  data={{
                    "Gross Income": calculations.grossIncome,
                    "Old Regime Tax": calculations.oldRegime.totalTax,
                    "New Regime Tax": calculations.newRegime.totalTax,
                    "Recommended Regime": recommendation.regime,
                    "Tax Savings": calculations.savings,
                  }}
                />
              </div>

            </div>
          </div>
        </main>

        {/* --- SEO & EXPLAINER SECTION --- */}
        <section className="max-w-7xl mx-auto px-4 mt-24">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6">
                Regime Comparator: Detailed Breakdown (FY 2024-25)
              </h2>
              <div className="space-y-6 text-slate-600 font-medium leading-relaxed">
                <p>
                  The Regime Comparator is an advanced tool designed to give you a side-by-side microscopic view of how the Old and New Tax Regimes treat your specific income components and deductions. Unlike a simple calculator, this tool breaks down exactly which exemptions are saving you money and where you are losing out.
                </p>
                
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-8 mb-4">
                  Why Compare Both Regimes?
                </h3>
                <p>
                  A single financial decision (like taking an education loan or buying health insurance) can flip the math. The New Regime is highly efficient for those with zero or minimal investments. However, if you are actively investing in PPF, ELSS, NPS, or paying EMIs for a home loan, the Old Regime might still offer a significantly lower effective tax rate. Comparing them side-by-side ensures you don't leave money on the table.
                </p>

                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-8 mb-4">
                  Crucial Exemptions You Lose in the New Regime
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-slate-900 font-bold">House Rent Allowance (HRA):</strong> A major component for salaried individuals living in rented accommodations.</li>
                  <li><strong className="text-slate-900 font-bold">Section 80C & 80D:</strong> The combined ₹2.5L+ deduction window for investments and health insurance is gone.</li>
                  <li><strong className="text-slate-900 font-bold">Home Loan Interest:</strong> The ₹2L deduction under Section 24(b) for self-occupied properties is not available.</li>
                </ul>
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
                  { q: "Is the New Tax Regime better for everyone?", a: "No. While it is the default and simpler, it is generally only better for individuals earning up to ₹7-7.5 Lakhs (who pay zero tax) or those who do not make tax-saving investments." },
                  { q: "What is the break-even point?", a: "The break-even point is the exact amount of total deductions at which your tax liability under both regimes is identical. If your actual deductions exceed this point, the Old Regime is better." },
                  { q: "Do I get standard deduction in both?", a: "Yes. For FY 2024-25, you get a ₹50,000 standard deduction in the Old Regime and an enhanced ₹75,000 standard deduction in the New Regime." },
                  { q: "What if I forget to declare my choice to my employer?", a: "By default, your employer will compute your TDS based on the New Tax Regime. However, you can change your choice while filing your final Income Tax Return (ITR)." }
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
