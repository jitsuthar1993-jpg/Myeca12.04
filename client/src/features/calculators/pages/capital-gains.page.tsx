import React, { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { calculateCapitalGains } from "@/lib/tax-calculations";
import { CalculatorExport } from "@/components/ui/calculator-export";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import Breadcrumb from "@/components/Breadcrumb";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, Coins, Calendar, Target, AlertCircle, Clock, Info, 
  Calculator, IndianRupee, Receipt, ChevronRight, ChevronLeft,
  Building2, LineChart, Sparkles, AlertTriangle, ArrowRight
} from "lucide-react";

export default function CapitalGainsCalculatorPage() {
  const seo = getSEOConfig('/calculators/capital-gains');
  const [step, setStep] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [saleDate, setSaleDate] = useState<string>('');
  const [assetType, setAssetType] = useState<string>('');

  const faqData = [
    {
      question: "What is the difference between STCG and LTCG?",
      answer: "Short-term capital gains (STCG) apply when assets are held for less than the specified period (1 year for equity, 2 years for property). Long-term capital gains (LTCG) apply for longer holding periods."
    },
    {
      question: "What are the new capital gains tax rates for 2025?",
      answer: "From Budget 2024, LTCG tax rate is 12.5% (without indexation) and STCG on equity is 20%. Property and other assets have different rates."
    },
    {
      question: "Is there any exemption on capital gains?",
      answer: "Yes, LTCG up to ₹1.25 lakh per year is exempt. You can also claim exemptions under sections 54, 54F, 54EC by reinvesting gains."
    }
  ];

  const assetTypes = [
    { value: 'equity', label: 'Equity / Mutual Funds', icon: LineChart, ltcg: '> 1 yr', ltcgRate: '12.5%', stcgRate: '20%' },
    { value: 'property', label: 'Real Estate / Property', icon: Building2, ltcg: '> 2 yrs', ltcgRate: '12.5%', stcgRate: 'Slab' },
    { value: 'gold', label: 'Gold / Precious Metals', icon: Coins, ltcg: '> 2 yrs', ltcgRate: '12.5%', stcgRate: 'Slab' },
    { value: 'bonds', label: 'Bonds / Debentures', icon: Receipt, ltcg: '> 2 yrs', ltcgRate: '12.5%', stcgRate: 'Slab' }
  ];

  const selectedAssetType = assetTypes.find(type => type.value === assetType);

  const result = useMemo(() => {
    if (purchasePrice > 0 && salePrice > 0 && purchaseDate && saleDate && assetType) {
      return calculateCapitalGains(
        purchasePrice,
        salePrice,
        new Date(purchaseDate),
        new Date(saleDate),
        assetType as 'equity' | 'property' | 'gold' | 'bonds'
      );
    }
    return null;
  }, [purchasePrice, salePrice, purchaseDate, saleDate, assetType]);

  const handleNext = () => setStep((s) => Math.min(3, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  return (
    <>
      <MetaSEO
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        type={seo?.type}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
        faqPageData={faqData}
      />

      <div className="min-h-screen bg-slate-50/50 calculator-gradient-bg pb-24">
        <Breadcrumb items={[{ name: "Calculators", href: "/calculators" }, { name: "Capital Gains Calculator" }]} />

        {/* --- HERO SECTION --- */}
        <section className="relative pt-12 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] -z-10" />
          <div className="max-w-7xl mx-auto px-4 text-center">
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/50 text-emerald-600 text-[11px] font-black uppercase tracking-widest mb-6 shadow-sm"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              FY 2024-25 Budget Updated
            </m.div>
            <m.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6"
            >
              Calculate <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Capital Gains</span>
            </m.h1>
            <m.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-500 max-w-2xl mx-auto font-medium"
            >
              Determine STCG and LTCG tax liabilities for equity, property, and gold with the latest tax rules.
            </m.p>
          </div>
        </section>

        {/* --- WIZARD INTERFACE --- */}
        <main className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Input Panel (Wizard) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Progress Steps */}
              <div className="flex items-center justify-between px-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-2 flex-1 relative">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm z-10 transition-colors duration-300",
                      step >= s ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-white text-slate-400 border border-slate-200"
                    )}>
                      {step > s ? <Clock className="w-5 h-5" /> : s}
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest text-center",
                      step >= s ? "text-emerald-700" : "text-slate-400"
                    )}>
                      {s === 1 ? 'Asset' : s === 2 ? 'Values' : 'Dates'}
                    </span>
                    {s < 3 && (
                      <div className={cn(
                        "absolute top-5 left-1/2 w-full h-[2px] -translate-y-1/2 -z-0",
                        step > s ? "bg-emerald-600" : "bg-slate-200"
                      )} />
                    )}
                  </div>
                ))}
              </div>

              <m.div
                key={`step-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden"
              >
                <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50/50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                      {step === 1 && <Building2 className="w-6 h-6" />}
                      {step === 2 && <IndianRupee className="w-6 h-6" />}
                      {step === 3 && <Calendar className="w-6 h-6" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        {step === 1 && "Select Asset Type"}
                        {step === 2 && "Transaction Values"}
                        {step === 3 && "Transaction Dates"}
                      </h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {step === 1 && "What did you sell?"}
                        {step === 2 && "How much was it?"}
                        {step === 3 && "When did it happen?"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {step === 1 && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {assetTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = assetType === type.value;
                        return (
                          <div 
                            key={type.value}
                            onClick={() => setAssetType(type.value)}
                            className={cn(
                              "relative p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300",
                              isSelected
                                ? "bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-100/50"
                                : "bg-white border-slate-100 hover:border-slate-300"
                            )}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                              )}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <span className={cn(
                                "font-black leading-tight",
                                isSelected ? "text-emerald-900" : "text-slate-900"
                              )}>
                                {type.label}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                              <div className="bg-slate-50 rounded-lg p-2 text-center">LTCG: {type.ltcgRate}</div>
                              <div className="bg-slate-50 rounded-lg p-2 text-center">STCG: {type.stcgRate}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                          Purchase Price
                        </Label>
                        <div className="relative group">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
                          <Input
                            type="number"
                            value={purchasePrice || ''}
                            onChange={(e) => setPurchasePrice(Number(e.target.value))}
                            placeholder="0"
                            className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 text-lg font-black focus:bg-white transition-all focus:ring-4 focus:ring-emerald-100"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                          Sale Price
                        </Label>
                        <div className="relative group">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
                          <Input
                            type="number"
                            value={salePrice || ''}
                            onChange={(e) => setSalePrice(Number(e.target.value))}
                            placeholder="0"
                            className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 text-lg font-black focus:bg-white transition-all focus:ring-4 focus:ring-emerald-100"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                          Purchase Date
                        </Label>
                        <div className="relative group">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
                          <Input
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 text-lg font-black focus:bg-white transition-all focus:ring-4 focus:ring-emerald-100"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                          Sale Date
                        </Label>
                        <div className="relative group">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
                          <Input
                            type="date"
                            value={saleDate}
                            onChange={(e) => setSaleDate(e.target.value)}
                            className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 text-lg font-black focus:bg-white transition-all focus:ring-4 focus:ring-emerald-100"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={step === 1}
                      className="rounded-xl h-12 px-6 font-black text-slate-600 border-slate-200 hover:bg-slate-50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={
                        (step === 1 && !assetType) || 
                        (step === 2 && (!purchasePrice || !salePrice)) ||
                        (step === 3 && (!purchaseDate || !saleDate))
                      }
                      className="rounded-xl h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-200 hover:-translate-y-0.5 transition-all"
                    >
                      {step === 3 ? "Calculate" : "Next"} <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                </div>
              </m.div>

              {/* Informational Cards */}
              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                 <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                       <Receipt className="w-4 h-4 text-emerald-500" />
                       FY 24-25 Tax Rates
                    </h3>
                    <ul className="space-y-2 text-xs font-medium text-slate-500">
                       <li>• <strong className="text-slate-900">Equity LTCG:</strong> 12.5%</li>
                       <li>• <strong className="text-slate-900">Equity STCG:</strong> 20%</li>
                       <li>• <strong className="text-slate-900">Property LTCG:</strong> 12.5%</li>
                    </ul>
                 </div>
                 <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                       <AlertTriangle className="w-4 h-4 text-amber-500" />
                       Key Notes
                    </h3>
                    <ul className="space-y-2 text-xs font-medium text-slate-500">
                       <li>• ₹1.25L exemption on equity LTCG</li>
                       <li>• Indexation removed from July 2024</li>
                       <li>• 4% Health & Education cess applies</li>
                    </ul>
                 </div>
              </div>

            </div>

            {/* Right: Results Panel */}
            <div className="lg:col-span-5 space-y-6">
              <AnimatePresence mode="wait">
                {result ? (
                  <m.div
                    key="results"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {/* Main Summary Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.05] scale-150">
                        <TrendingUp className="w-32 h-32" />
                      </div>
                      <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
                              {result.gainType} @ {result.taxRate}%
                           </div>
                           <CalculatorExport 
                              title="Capital Gains Calculation"
                              data={{
                                "Asset Type": selectedAssetType?.label || assetType,
                                "Purchase Price": purchasePrice,
                                "Sale Price": salePrice,
                                "Holding Period": `${result.holdingPeriod} years`,
                                "Capital Gain": result.capitalGain,
                                "Gain Type": result.gainType,
                                "Tax Rate": `${result.taxRate}%`,
                                "Tax Payable": result.taxPayable,
                                "Net Gain": result.netGain
                              }}
                           />
                        </div>

                        <div>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Net Tax Payable</span>
                          <div className="text-4xl md:text-5xl font-black tracking-tighter">
                            ₹{result.taxPayable.toLocaleString()}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Capital Gain</span>
                            <span className={cn("text-xl font-black", result.capitalGain >= 0 ? "text-emerald-400" : "text-red-400")}>
                              {result.capitalGain >= 0 ? '+' : ''}₹{result.capitalGain.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Net In Hand</span>
                            <span className={cn("text-xl font-black", result.netGain >= 0 ? "text-blue-400" : "text-red-400")}>
                              {result.netGain >= 0 ? '+' : ''}₹{result.netGain.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Details */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-4">
                      <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-emerald-500" />
                        Breakdown
                      </h3>
                      
                      <div className="flex justify-between items-center py-2 text-sm">
                        <span className="font-bold text-slate-500">Holding Period</span>
                        <span className="font-black text-slate-900">{result.holdingPeriodDays} Days ({result.holdingPeriod} Yrs)</span>
                      </div>
                      <div className="flex justify-between items-center py-2 text-sm border-t border-slate-100">
                        <span className="font-bold text-slate-500">Purchase Price</span>
                        <span className="font-black text-slate-900">₹{purchasePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 text-sm border-t border-slate-100">
                        <span className="font-bold text-slate-500">Sale Price</span>
                        <span className="font-black text-slate-900">₹{salePrice.toLocaleString()}</span>
                      </div>
                      
                      {result.ltcgExemption > 0 && (
                        <div className="flex justify-between items-center py-2 text-sm border-t border-slate-100">
                          <span className="font-bold text-slate-500">LTCG Exemption (Sec 112A)</span>
                          <span className="font-black text-emerald-600">-₹{result.ltcgExemption.toLocaleString()}</span>
                        </div>
                      )}

                      {result.ltcgExemption > 0 && (
                        <div className="flex justify-between items-center py-2 text-sm border-t border-slate-100">
                          <span className="font-bold text-slate-500">Taxable Gain</span>
                          <span className="font-black text-slate-900">₹{result.taxableGain.toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center py-2 text-sm border-t border-slate-100">
                        <span className="font-bold text-slate-500">Effective Tax Rate</span>
                        <span className="font-black text-slate-900">{(result.taxRate * 1.04).toFixed(2)}% (inc. cess)</span>
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
                      <Target className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Complete the steps</h3>
                    <p className="text-slate-500 font-medium">Select your asset, enter transaction values, and set dates to instantly see your tax liability.</p>
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
                Understanding Capital Gains Tax in India (FY 2024-25)
              </h2>
              <div className="space-y-6 text-slate-600 font-medium leading-relaxed">
                <p>
                  Capital gains tax is the tax levied on the profit made from the sale of a non-inventory asset that was purchased for a lower price. In India, the tax rates and rules vary significantly depending on the type of asset (equity, property, gold, bonds) and the holding period.
                </p>
                
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-8 mb-4">
                  Short-Term vs. Long-Term Capital Gains
                </h3>
                <p>
                  The classification of capital gains into short-term (STCG) and long-term (LTCG) is crucial because it dictates the tax rate applied. 
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-slate-900 font-bold">Equity & Mutual Funds:</strong> Held for more than 1 year is considered Long-Term.</li>
                  <li><strong className="text-slate-900 font-bold">Real Estate & Property:</strong> Held for more than 2 years is considered Long-Term.</li>
                  <li><strong className="text-slate-900 font-bold">Gold & Debt Funds:</strong> Historically 3 years, but recent budgets have updated holding periods and tax treatments. Always verify current fiscal rules.</li>
                </ul>

                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-8 mb-4">
                  Recent Changes (Budget 2024)
                </h3>
                <p>
                  The Union Budget 2024 introduced significant changes to the capital gains tax structure. The LTCG tax rate across all asset classes was standardized to <strong className="text-emerald-600 font-black">12.5%</strong> without the benefit of indexation. Meanwhile, STCG on equity was revised to <strong className="text-emerald-600 font-black">20%</strong>. Additionally, the exemption limit for LTCG on listed equities and equity-oriented mutual funds was increased to ₹1.25 lakh per financial year.
                </p>
              </div>
            </div>

            <hr className="my-12 border-slate-100" />

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-2">
                <Info className="w-6 h-6 text-emerald-500" />
                Frequently Asked Questions
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {faqData.map((faq, idx) => (
                  <div key={idx} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                    <h4 className="font-black text-slate-900 mb-2">{faq.question}</h4>
                    <p className="text-sm font-medium text-slate-600">{faq.answer}</p>
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