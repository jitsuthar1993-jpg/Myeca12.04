import { useState, useMemo } from "react";
import { 
  Shield, 
  Coins, 
  TrendingUp, 
  Calendar, 
  Target, 
  Award, 
  AlertCircle, 
  BarChart3, 
  Table,
  Info,
  Download,
  Zap,
  ShieldCheck,
  ChevronRight,
  PieChart,
  ArrowRight,
  Banknote,
  Receipt,
  History
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { m, AnimatePresence } from "framer-motion";
import { calculateEnhancedPPF, formatCurrency, CURRENT_RATES } from "@/lib/enhanced-calculator-utils";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import Breadcrumb from "@/components/Breadcrumb";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function PPFCalculatorPage() {
  const [annualInvestment, setAnnualInvestment] = useState<number>(150000);
  const [years, setYears] = useState<number>(15);
  
  const result = useMemo(() => calculateEnhancedPPF(annualInvestment, years, CURRENT_RATES.PPF), [annualInvestment, years]);

  const seo = getSEOConfig('/calculators/ppf');

  const ppfFeatures = [
    { title: "Tax Free", description: "No tax on maturity amount", icon: Target, color: "blue" },
    { title: "EEE Status", description: "Exempt-Exempt-Exempt taxation", icon: ShieldCheck, color: "emerald" },
    { title: "15 Year Lock-in", description: "Minimum maturity period", icon: History, color: "amber" },
    { title: "80C Benefit", description: "Up to ₹1.5L tax deduction", icon: Banknote, color: "purple" },
    { title: "7.1% Interest", description: "Current interest rate", icon: TrendingUp, color: "blue" },
    { title: "Partial Withdrawal", description: "From 7th year onwards", icon: Receipt, color: "rose" }
  ];

  const investmentSuggestions = [
    { amount: 50000, label: "Beginner", description: "33% of 80C limit" },
    { amount: 100000, label: "Growth", description: "67% of 80C limit" },
    { amount: 150000, label: "Full Tax Save", description: "Max 80C benefit" }
  ];

  return (
    <>
      <MetaSEO
        title={seo?.title || "PPF Calculator 2025 | Maturity & Returns | MyeCA.in"}
        description={seo?.description || "Calculate PPF returns with current 7.1% interest rate. Professional planning with 80C tax benefits and EEE status insights."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
        <Breadcrumb items={[{ name: "Calculators", href: "/calculators" }, { name: "PPF Calculator" }]} />

        <section className="pt-8 pb-10 text-center px-4">
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-4 border border-emerald-100"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Standard Financial Tool 2025
          </m.div>
          <m.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3"
          >
            PPF <span className="text-emerald-600">Calculator</span>
          </m.h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm md:text-base">
            Professional Public Provident Fund planning with real-time tax benefit insights and EEE status analysis.
          </p>
        </section>

        <main className="max-w-7xl mx-auto px-4 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 rounded-xl">
                      <Coins className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Investment Details</h2>
                      <p className="text-xs text-slate-500 font-medium">Configure your yearly PPF contributions</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Annual Investment</Label>
                        <span className="text-lg font-black text-emerald-600">{formatCurrency(annualInvestment)}</span>
                      </div>
                      <Slider 
                        value={[annualInvestment]} 
                        onValueChange={(v) => setAnnualInvestment(v[0])}
                        max={150000}
                        min={500}
                        step={500}
                        className="py-4"
                      />
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>MIN: ₹500</span>
                        <span>MAX: ₹1.5L (80C Limit)</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Investment Period</Label>
                        <span className="text-lg font-black text-emerald-600">{years} Years</span>
                      </div>
                      <Slider 
                        value={[years]} 
                        onValueChange={(v) => setYears(v[0])}
                        max={50}
                        min={15}
                        step={5}
                        className="py-4"
                      />
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>MIN: 15 YRS</span>
                        <span>MAX: 50 YRS</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {investmentSuggestions.map((s) => (
                      <button
                        key={s.amount}
                        onClick={() => setAnnualInvestment(s.amount)}
                        className={cn(
                          "p-3 rounded-2xl border transition-all text-left group",
                          annualInvestment === s.amount 
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200" 
                            : "bg-white border-slate-100 hover:border-emerald-200 text-slate-600"
                        )}
                      >
                        <div className={cn("text-[9px] font-bold uppercase tracking-wider mb-1", annualInvestment === s.amount ? "text-emerald-100" : "text-slate-400")}>
                          {s.label}
                        </div>
                        <div className="text-xs font-bold leading-tight">{s.description}</div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                      <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Government Backed</div>
                      <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Current Rate: 7.1%</div>
                      <div className="flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5 text-blue-500" /> FY 2025-26</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
                   <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Power of Compounding
                   </h4>
                   <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    By investing <span className="text-slate-900 font-bold">₹1.5L</span> for 25 years, your wealth grows to <span className="text-emerald-600 font-bold">₹1.03 Cr</span>.
                   </p>
                </div>
                <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
                   <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Smart Deposit Tip
                   </h4>
                   <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    Always deposit between <span className="text-slate-900 font-bold">1st to 5th</span> of the month to earn full monthly interest.
                   </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-600/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 space-y-8 text-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 block mb-2">Maturity Amount</span>
                    <div className="text-5xl font-black tracking-tighter text-emerald-400">
                      {formatCurrency(result.maturityValue)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                    <div className="text-left">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Total Invested</span>
                      <span className="text-lg font-bold text-white">
                        {formatCurrency(result.totalInvestment)}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Total Interest</span>
                      <span className="text-lg font-bold text-white">
                        {formatCurrency(result.interestEarned)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="uppercase tracking-widest text-slate-500 text-left">Capital Protection</span>
                      <span className="text-emerald-400">SOVEREIGN GUARANTEE</span>
                    </div>
                    <Progress 
                      value={100} 
                      className="h-2 bg-white/5" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-500" />
                  Wealth Composition
                </h3>
                <div className="flex items-center gap-0 h-3 rounded-full bg-slate-100 overflow-hidden mb-6">
                  <div 
                    className="h-full bg-slate-200" 
                    style={{ width: `${Math.round((result.totalInvestment / result.maturityValue) * 100)}%` }} 
                  />
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${Math.round((result.interestEarned / result.maturityValue) * 100)}%` }} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Invested</span>
                   </div>
                   <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Interest</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <section className="max-w-7xl mx-auto px-4 mt-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Public Provident Fund Benefits</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ppfFeatures.map((f, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-5 rounded-[2rem] border border-slate-100 text-center flex flex-col items-center gap-3"
              >
                <div className={cn("p-2.5 rounded-2xl bg-slate-50 text-emerald-600")}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase text-slate-900 leading-tight mb-1">{f.title}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{f.description}</p>
                </div>
              </m.div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 mt-20">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                  The Complete Guide to PPF <br /><span className="text-emerald-600">Planning in 2025</span>
                </h2>
                <div className="text-slate-600 font-medium space-y-6 text-sm md:text-base leading-relaxed">
                  <p>
                    The Public Provident Fund (PPF) is a sovereign-backed investment scheme in India that offers guaranteed returns and substantial tax benefits.
                  </p>
                  <p>
                    Its <span className="text-slate-900 font-bold">EEE</span> tax status ensures your contribution, interest, and maturity are tax-free under 80C.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 rounded-[2rem] bg-emerald-600 text-white shadow-2xl">
                  <h4 className="text-xl font-bold mb-4">Why invest in PPF?</h4>
                  <div className="space-y-4">
                    {[
                      "Zero risk (Sovereign guarantee)",
                      "Higher interest than savings",
                      "Tax-free wealth creation",
                      "Protected from attachment"
                    ].map((t, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-sm font-medium opacity-90">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}