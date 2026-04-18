import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, Calendar, IndianRupee, AlertTriangle, CheckCircle,
  Info, Bell, FileText, Wallet, Sparkles, TrendingUp, ArrowRight,
  ShieldCheck, PieChart, Zap
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CalculatorExport } from "@/components/ui/calculator-export";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import Breadcrumb from "@/components/Breadcrumb";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

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
  const seo = getSEOConfig('/calculators/advance-tax');
  const [inputs, setInputs] = useState<TaxInputs>({
    estimatedIncome: 2000000,
    tdsDeducted: 150000,
    tcsCollected: 0,
    selfAssessmentPaid: 0,
    advanceTaxPaid: { q1: 0, q2: 0, q3: 0, q4: 0 },
  });

  const [regime, setRegime] = useState<"old" | "new">("new");

  // Calculate tax based on regime
  const calculateTax = (income: number, selectedRegime: "old" | "new") => {
    let tax = 0;
    
    if (selectedRegime === "new") {
      // New Regime Slabs FY 24-25
      const slabs = [
        { min: 0, max: 300000, rate: 0 },
        { min: 300000, max: 700000, rate: 5 },
        { min: 700000, max: 1000000, rate: 10 },
        { min: 1000000, max: 1200000, rate: 15 },
        { min: 1200000, max: 1500000, rate: 20 },
        { min: 1500000, max: Infinity, rate: 30 },
      ];
      
      // Standard deduction
      const taxableIncome = Math.max(0, income - 75000);
      
      for (const slab of slabs) {
        if (taxableIncome > slab.min) {
          const taxableInSlab = Math.min(taxableIncome - slab.min, slab.max - slab.min);
          tax += taxableInSlab * (slab.rate / 100);
        }
      }
      
      // Rebate under 87A
      if (taxableIncome <= 700000) {
        tax = Math.max(0, tax - 25000);
      }
    } else {
      // Old Regime Slabs
      const slabs = [
        { min: 0, max: 250000, rate: 0 },
        { min: 250000, max: 500000, rate: 5 },
        { min: 500000, max: 1000000, rate: 20 },
        { min: 1000000, max: Infinity, rate: 30 },
      ];
      
      // Standard deduction
      const taxableIncome = Math.max(0, income - 50000);
      
      for (const slab of slabs) {
        if (taxableIncome > slab.min) {
          const taxableInSlab = Math.min(taxableIncome - slab.min, slab.max - slab.min);
          tax += taxableInSlab * (slab.rate / 100);
        }
      }
      
      // Rebate under 87A
      if (taxableIncome <= 500000) {
        tax = Math.max(0, tax - 12500);
      }
    }
    
    // Add 4% Health & Education Cess
    const cess = tax * 0.04;
    return tax + cess;
  };

  const calculations = useMemo(() => {
    const totalTax = calculateTax(inputs.estimatedIncome, regime);
    const totalTdsAndTcs = inputs.tdsDeducted + inputs.tcsCollected;
    const netTaxLiability = Math.max(0, totalTax - totalTdsAndTcs);
    
    // Advance tax is required if tax liability > ₹10,000
    const advanceTaxRequired = netTaxLiability > 10000;
    
    // Calculate advance tax installments
    const advanceTaxInstallments = ADVANCE_TAX_SCHEDULE.map((schedule, index) => {
      const previousPercent = index > 0 ? ADVANCE_TAX_SCHEDULE[index - 1].cumulativePercent : 0;
      const installmentPercent = schedule.cumulativePercent - previousPercent;
      const installmentAmount = (netTaxLiability * installmentPercent) / 100;
      const cumulativeAmount = (netTaxLiability * schedule.cumulativePercent) / 100;
      
      return {
        ...schedule,
        installmentPercent,
        installmentAmount,
        cumulativeAmount,
      };
    });
    
    // Calculate total advance tax paid
    const totalAdvanceTaxPaid = 
      inputs.advanceTaxPaid.q1 + 
      inputs.advanceTaxPaid.q2 + 
      inputs.advanceTaxPaid.q3 + 
      inputs.advanceTaxPaid.q4;
    
    // Calculate shortfall/excess for each quarter
    const quarterlyAnalysis = advanceTaxInstallments.map((inst, index) => {
      const paidTillQuarter = [
        inputs.advanceTaxPaid.q1,
        inputs.advanceTaxPaid.q1 + inputs.advanceTaxPaid.q2,
        inputs.advanceTaxPaid.q1 + inputs.advanceTaxPaid.q2 + inputs.advanceTaxPaid.q3,
        totalAdvanceTaxPaid,
      ][index];
      
      const shortfall = Math.max(0, inst.cumulativeAmount - paidTillQuarter);
      const excess = Math.max(0, paidTillQuarter - inst.cumulativeAmount);
      
      return {
        ...inst,
        paidTillQuarter,
        shortfall,
        excess,
        status: shortfall > 0 ? 'shortfall' : excess > 0 ? 'excess' : 'met',
      };
    });
    
    // Calculate interest under Section 234B and 234C
    const today = new Date();
    let interest234C = 0;
    
    quarterlyAnalysis.forEach((q, index) => {
      if (q.shortfall > 0) {
        // Interest @ 1% per month for shortfall
        const monthsRemaining = Math.max(0, 12 - (index * 3));
        interest234C += q.shortfall * 0.01 * Math.min(3, monthsRemaining);
      }
    });
    
    // Balance tax payable
    const balanceTax = Math.max(0, netTaxLiability - totalAdvanceTaxPaid - inputs.selfAssessmentPaid);
    
    return {
      totalTax,
      totalTdsAndTcs,
      netTaxLiability,
      advanceTaxRequired,
      advanceTaxInstallments,
      quarterlyAnalysis,
      totalAdvanceTaxPaid,
      interest234C,
      balanceTax,
    };
  }, [inputs, regime]);

  const chartData = calculations.quarterlyAnalysis.map((q) => ({
    name: q.quarter,
    'Required': q.cumulativeAmount,
    'Paid': q.paidTillQuarter,
  }));

  const handleInputChange = (field: keyof TaxInputs, value: string | number) => {
    if (field === 'advanceTaxPaid') return;
    setInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const handleAdvanceTaxChange = (quarter: 'q1' | 'q2' | 'q3' | 'q4', value: string) => {
    setInputs(prev => ({
      ...prev,
      advanceTaxPaid: {
        ...prev.advanceTaxPaid,
        [quarter]: Number(value) || 0,
      },
    }));
  };

  const getCurrentQuarter = () => {
    const month = new Date().getMonth();
    if (month < 3) return 4; // Jan-Mar = Q4
    if (month < 6) return 1; // Apr-Jun = Q1
    if (month < 9) return 2; // Jul-Sep = Q2
    return 3; // Oct-Dec = Q3
  };

  const currentQuarter = getCurrentQuarter();

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
            question: "Who is required to pay advance tax?",
            answer: "Any taxpayer whose estimated tax liability for the year (after TDS/TCS) is ₹10,000 or more is required to pay advance tax."
          },
          {
            question: "What are the advance tax due dates for individual taxpayers?",
            answer: "Advance tax is paid in 4 installments: June 15 (15%), Sep 15 (45%), Dec 15 (75%), and March 15 (100%)."
          },
          {
            question: "What happens if I don't pay advance tax on time?",
            answer: "Failure to pay advance tax or short payment attracts interest under sections 234B and 234C at the rate of 1% per month."
          }
        ]}
      />

      <div className="min-h-screen bg-slate-50/50 calculator-gradient-bg pb-24">
        <Breadcrumb items={[{ name: "Calculators", href: "/calculators" }, { name: "Advance Tax Calculator" }]} />

        {/* --- HERO SECTION --- */}
        <section className="relative pt-12 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] -z-10" />
          <div className="max-w-7xl mx-auto px-4 text-center">
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-[11px] font-black uppercase tracking-widest mb-6 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              FY 2024-25 Assessment Ready
            </m.div>
            <m.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6"
            >
              Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Advance Tax</span>
            </m.h1>
            <m.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-500 max-w-2xl mx-auto font-medium"
            >
              Calculate quarterly payments, avoid Section 234B & 234C interest penalties, and track your compliance in real-time.
            </m.p>
          </div>
        </section>

        {/* --- MAIN INTERFACE --- */}
        <main className="max-w-7xl mx-auto px-4 -mt-12">
          {calculations.advanceTaxRequired && (
            <m.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-2xl flex items-start md:items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-amber-900 mb-1">Next Due Date: {ADVANCE_TAX_SCHEDULE[currentQuarter - 1]?.label}</h4>
                  <p className="text-sm font-medium text-amber-700">
                    Pay {ADVANCE_TAX_SCHEDULE[currentQuarter - 1]?.cumulativePercent}% of your estimated tax liability by <span className="font-black">{ADVANCE_TAX_SCHEDULE[currentQuarter - 1]?.dueDate}</span> to avoid penalties.
                  </p>
                </div>
              </div>
            </m.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Input Panel */}
            <div className="lg:col-span-7 space-y-6">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden"
              >
                <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50/50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Income & Tax Details</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configure your financials</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Regime Selection */}
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Tax Regime</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'new', label: 'New Regime' },
                        { id: 'old', label: 'Old Regime' }
                      ].map(r => (
                        <div 
                          key={r.id}
                          onClick={() => setRegime(r.id as any)}
                          className={cn(
                            "relative group p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-3",
                            regime === r.id
                              ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-100 text-white"
                              : "bg-white border-slate-100 hover:border-slate-300 text-slate-900"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                            regime === r.id ? "border-white" : "border-slate-300"
                          )}>
                            {regime === r.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>
                          <span className="font-black">{r.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                        Estimated Annual Income
                      </Label>
                      <div className="relative group">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                        <Input
                          type="number"
                          value={inputs.estimatedIncome || ''}
                          onChange={(e) => handleInputChange('estimatedIncome', e.target.value)}
                          className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 text-lg font-black focus:bg-white transition-all focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                        TDS/TCS Already Deducted
                      </Label>
                      <div className="relative group">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
                        <Input
                          type="number"
                          value={inputs.tdsDeducted || ''}
                          onChange={(e) => handleInputChange('tdsDeducted', e.target.value)}
                          className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 text-lg font-black focus:bg-white transition-all focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                      <span>Estimated Total Tax</span>
                      <span>{formatCurrency(calculations.totalTax)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-emerald-600">
                      <span>Less: TDS/TCS</span>
                      <span>- {formatCurrency(calculations.totalTdsAndTcs)}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Net Tax Liability</span>
                      <span className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(calculations.netTaxLiability)}</span>
                    </div>
                  </div>

                  {!calculations.advanceTaxRequired && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-lg font-black text-emerald-900 mb-1">No Advance Tax Required</h4>
                        <p className="text-sm font-medium text-emerald-700">
                          Your estimated tax liability is below ₹10,000, which means you are exempt from paying advance tax installments.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </m.div>

              {/* Advance Tax Paid Inputs */}
              {calculations.advanceTaxRequired && (
                <m.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Advance Tax Paid</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Record your payments to date</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(['q1', 'q2', 'q3', 'q4'] as const).map((quarter, index) => (
                      <div key={quarter} className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block h-8 leading-tight">
                          {ADVANCE_TAX_SCHEDULE[index].label.replace(' Installment', '')}
                        </Label>
                        <div className="relative group">
                          <Input
                            type="number"
                            placeholder="0"
                            value={inputs.advanceTaxPaid[quarter] || ''}
                            onChange={(e) => handleAdvanceTaxChange(quarter, e.target.value)}
                            className="h-12 text-center rounded-xl border-slate-100 bg-slate-50/50 text-base font-black focus:bg-white transition-all focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </m.div>
              )}
            </div>

            {/* Right: Results Panel */}
            <div className="lg:col-span-5 space-y-6">
              <AnimatePresence mode="wait">
                <m.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* --- MAIN SUMMARY CARD --- */}
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] scale-150">
                      <PieChart className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-widest">
                            Overview
                         </div>
                         <CalculatorExport 
                            title="Advance Tax Report"
                            data={{
                              "Estimated Income": inputs.estimatedIncome,
                              "Total Tax Liability": calculations.totalTax,
                              "Net Advance Tax": calculations.netTaxLiability,
                              "Paid Till Date": calculations.totalAdvanceTaxPaid,
                              "Balance Payable": calculations.balanceTax,
                            }}
                         />
                      </div>

                      <div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Total Advance Tax Required</span>
                        <div className="text-4xl md:text-5xl font-black tracking-tighter">
                          {formatCurrency(calculations.netTaxLiability)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Paid</span>
                          <span className="text-xl font-black text-emerald-400">{formatCurrency(calculations.totalAdvanceTaxPaid)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Balance</span>
                          <span className="text-xl font-black text-amber-400">{formatCurrency(calculations.balanceTax)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {calculations.advanceTaxRequired && calculations.interest234C > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex gap-4">
                       <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                       <div>
                          <h4 className="text-base font-black text-red-900 mb-1">Interest Liability (Sec 234C)</h4>
                          <p className="text-sm font-medium text-red-700 leading-relaxed">
                            You may be liable for ~<span className="font-black">{formatCurrency(calculations.interest234C)}</span> in interest due to delayed or short payments of advance tax installments.
                          </p>
                       </div>
                    </div>
                  )}

                  {/* Quarterly Breakdown */}
                  {calculations.advanceTaxRequired && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                      <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        Quarterly Schedule
                      </h3>
                      <div className="space-y-4">
                        {calculations.quarterlyAnalysis.map((q, index) => {
                          const isCurrent = index + 1 === currentQuarter;
                          return (
                            <div 
                              key={q.quarter}
                              className={cn(
                                "p-5 rounded-2xl border transition-all",
                                isCurrent ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-slate-50/50"
                              )}
                            >
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-900">{q.quarter}</span>
                                  {isCurrent && <Badge className="bg-amber-500 text-xs font-bold px-2 py-0">Current</Badge>}
                                </div>
                                <span className="text-xs font-bold text-slate-400">{q.dueDate}</span>
                              </div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="font-bold text-slate-500">Required ({q.cumulativePercent}%)</span>
                                <span className="font-black text-slate-900">{formatCurrency(q.cumulativeAmount)}</span>
                              </div>
                              <Progress 
                                value={Math.min(100, (q.paidTillQuarter / q.cumulativeAmount) * 100)} 
                                className={cn("h-2", isCurrent ? "bg-amber-200" : "bg-slate-200")}
                                indicatorClassName={cn(isCurrent ? "bg-amber-500" : "bg-blue-600")}
                              />
                              {q.shortfall > 0 && (
                                <p className="text-[11px] font-black uppercase tracking-widest text-red-500 mt-3">
                                  Shortfall: {formatCurrency(q.shortfall)}
                                </p>
                              )}
                              {q.excess > 0 && (
                                <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500 mt-3">
                                  Excess Paid: {formatCurrency(q.excess)}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Chart */}
                  {calculations.advanceTaxRequired && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                      <h3 className="text-lg font-black text-slate-900 mb-6">Payment Progress</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                            <Tooltip 
                               formatter={(value: number) => formatCurrency(value)}
                               contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                            <Bar dataKey="Required" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Paid" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* How to Pay */}
                  <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                     <h4 className="text-xl font-black mb-6 flex items-center gap-2">
                       <FileText className="w-5 h-5" /> How to Pay Online
                     </h4>
                     <ul className="space-y-4 mb-8">
                       {[
                         "Visit Income Tax e-filing portal",
                         "Select 'e-Pay Tax' and choose Challan 280",
                         "Select '(100) Advance Tax' as type",
                         "Pay via Net Banking or UPI"
                       ].map((step, idx) => (
                         <li key={idx} className="flex gap-3 text-sm font-medium text-white/90">
                           <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-[10px] font-black">{idx + 1}</span>
                           {step}
                         </li>
                       ))}
                     </ul>
                     <Button className="w-full bg-white text-indigo-600 rounded-xl font-black hover:bg-slate-50 transition-all h-14" asChild>
                       <a href="https://eportal.incometax.gov.in/iec/foloigin" target="_blank" rel="noopener noreferrer">
                         Go to e-Filing Portal <ArrowRight className="w-4 h-4 ml-2" />
                       </a>
                     </Button>
                  </div>

                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* --- SEO & EXPLAINER SECTION --- */}
        <section className="max-w-7xl mx-auto px-4 mt-24">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6">
                Understanding Advance Tax in India (FY 2024-25)
              </h2>
              <div className="space-y-6 text-slate-600 font-medium leading-relaxed">
                <p>
                  Advance tax refers to paying a part of your taxes before the end of the financial year. Also known as "pay-as-you-earn" tax, it is required if your total estimated tax liability for the year exceeds ₹10,000.
                </p>
                
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-8 mb-4">
                  Who Needs to Pay Advance Tax?
                </h3>
                <p>
                  Any individual—whether salaried, self-employed, or a freelancer—whose tax liability in a financial year is greater than ₹10,000 must pay advance tax. However, senior citizens (aged 60 or above) who do not have any income from a business or profession are exempt from paying advance tax.
                </p>

                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-8 mb-4">
                  Due Dates and Installments
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-slate-900 font-bold">15th June:</strong> Pay 15% of total advance tax liability.</li>
                  <li><strong className="text-slate-900 font-bold">15th September:</strong> Pay 45% of total advance tax liability.</li>
                  <li><strong className="text-slate-900 font-bold">15th December:</strong> Pay 75% of total advance tax liability.</li>
                  <li><strong className="text-slate-900 font-bold">15th March:</strong> Pay 100% of total advance tax liability.</li>
                </ul>

                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-8 mb-4">
                  Penalties for Delay (Section 234B & 234C)
                </h3>
                <p>
                  If you fail to pay advance tax or pay less than 90% of the assessed tax, you will be liable to pay interest under Section 234B at 1% per month. Furthermore, a delay in the payment of specific installments incurs interest under Section 234C.
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
                  { q: "Is a salaried person required to pay advance tax?", a: "Generally, employers deduct TDS on salaries, so advance tax isn't required unless the employee has significant other income (e.g., from interest, capital gains, or rent) where TDS wasn't deducted." },
                  { q: "What happens if I miss the 15th March deadline?", a: "You can still pay tax before 31st March, and it will be treated as advance tax. However, interest under Section 234B and 234C will apply on the delayed amount." },
                  { q: "Do freelancers have to pay advance tax?", a: "Yes. Freelancers and professionals whose total tax liability for the year exceeds ₹10,000 must pay advance tax in four installments." },
                  { q: "How is it calculated under the Presumptive Taxation Scheme?", a: "Taxpayers opting for presumptive taxation under sections 44AD or 44ADA can pay their entire advance tax in a single installment on or before 15th March." }
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

