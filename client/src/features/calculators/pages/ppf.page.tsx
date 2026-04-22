import { useState, useMemo } from "react";
import { 
  Shield, TrendingUp, Zap, ShieldCheck, Sparkles, Banknote, 
  Receipt, CheckCircle2, Info, ArrowRight, Calculator, IndianRupee,
  Star, Lock, Headphones, Award, BarChart3, Clock, Briefcase, 
  Coins, Percent, Target
} from "lucide-react";
import { calculateEnhancedPPF, formatCurrency, CURRENT_RATES } from "@/lib/enhanced-calculator-utils";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

export default function PPFCalculatorPage() {
  const [annualInvestment, setAnnualInvestment] = useState<number>(150000);
  const [years, setYears] = useState<number>(15);

  const result = useMemo(() => calculateEnhancedPPF(annualInvestment, years, CURRENT_RATES.PPF), [annualInvestment, years]);
  const seo = getSEOConfig('/calculators/ppf');

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n).replace("₹", "₹ ");

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-inter">
      <MetaSEO
        title={seo?.title || "PPF Calculator 2025 | Maturity & Returns | MyeCA.in"}
        description={seo?.description || "Calculate PPF returns with current 7.1% interest rate. Professional planning with 80C tax benefits and EEE status insights."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Modern Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#027A48] mb-4 uppercase tracking-widest bg-[#ECFDF3] w-fit px-4 py-1.5 rounded-full border border-[#D1FADF]">
            <Shield className="w-3.5 h-3.5" />
            Sovereign Safety
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-[#101828] tracking-tight">
                PPF <span className="text-[#027A48]">Calculator</span>
              </h1>
              <p className="text-[#667085] text-base max-w-xl font-medium">
                Public Provident Fund returns with EEE tax benefits.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-[24px] border border-[#EAECF0] shadow-sm self-start">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-[#F2F4F7] flex items-center justify-center text-[10px] font-bold text-[#475467]">
                    {i === 1 ? 'RK' : i === 2 ? 'PS' : 'MD'}
                  </div>
                ))}
              </div>
              <div className="pr-4 border-r border-[#F2F4F7]">
                <p className="text-[10px] font-bold text-[#101828] uppercase tracking-wider">Trusted by</p>
                <p className="text-xs font-bold text-[#027A48]">100k+ Investors</p>
              </div>
              <div className="pl-2">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
                <p className="text-[10px] font-bold text-[#667085]">5.0/5 Rating</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 items-start">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 text-[#027A48]">
                <Banknote className="w-24 h-24" />
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] flex items-center justify-center text-[#027A48] border border-[#D1FADF]">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#101828]">Investment Configuration</h2>
                  <p className="text-xs text-[#667085]">Plan your 15-year wealth building journey</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Annual Investment */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-[#344054]">Annual Investment</span>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                        <span className="text-xs font-bold text-[#667085]">₹</span>
                        <input 
                          type="number"
                          value={annualInvestment}
                          onChange={(e) => setAnnualInvestment(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828]"
                        />
                      </div>
                    </div>
                    <input 
                      type="range"
                      min="500"
                      max="150000"
                      step="500"
                      value={annualInvestment}
                      onChange={(e) => setAnnualInvestment(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#027A48]"
                    />
                  </div>

                  {/* Tenure */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-[#344054]">Investment Tenure</span>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[80px] flex items-center gap-1 shadow-sm">
                        <input 
                          type="number"
                          value={years}
                          onChange={(e) => setYears(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828]"
                        />
                        <span className="text-xs font-bold text-[#667085]">Yrs</span>
                      </div>
                    </div>
                    <input 
                      type="range"
                      min="15"
                      max="50"
                      step="5"
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#027A48]"
                    />
                  </div>
                </div>

                {/* Quick Selection Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Sec 80C Max", amount: 150000 },
                    { label: "₹1L Yearly", amount: 100000 },
                    { label: "₹50k Yearly", amount: 50000 }
                  ].map((btn) => (
                    <button
                      key={btn.amount}
                      onClick={() => setAnnualInvestment(btn.amount)}
                      className={cn(
                        "py-2 px-3 rounded-xl border text-[11px] font-bold transition-all text-center",
                        annualInvestment === btn.amount
                          ? "bg-[#027A48] border-[#027A48] text-white shadow-sm"
                          : "bg-white border-[#EAECF0] text-[#344054] hover:border-[#D1FADF]"
                      )}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* EEE Status Card */}
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm flex items-center gap-6 relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-5 text-[#027A48]">
                <ShieldCheck className="w-24 h-24" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#ECFDF3] border border-[#ABEFC6] flex items-center justify-center text-[#027A48] shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#101828]">EEE Tax Status</h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Your <span className="font-bold text-[#101828]">Investment</span>, <span className="font-bold text-[#101828]">Interest</span>, and <span className="font-bold text-[#101828]">Maturity</span> are 100% tax-free under current laws.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm h-full flex flex-col sticky top-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-[#101828]">Maturity Summary</h2>
                <div className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#ECFDF3] text-[#027A48] flex items-center gap-1.5 uppercase tracking-wider">
                  <Percent className="w-3 h-3" />
                  {CURRENT_RATES.PPF}% P.A.
                </div>
              </div>
              <p className="text-sm text-[#667085] mb-4">Long-term wealth estimation</p>

              <div className="space-y-4 mb-6">
                {/* Main Maturity Highlight */}
                <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#027A48] to-[#054F31] text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <IndianRupee className="w-32 h-32" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80 block mb-2">Total Maturity Value</span>
                  <span className="text-4xl font-black block tabular-nums leading-none">
                    {fmt(result.maturityValue)}
                  </span>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
                    <TrendingUp className="w-3 h-3 text-emerald-300" />
                    Gain of {((result.interestEarned / result.totalInvestment) * 100).toFixed(0)}% over tenure
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-[20px] border border-[#EAECF0] bg-[#F9FAFB]">
                    <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block mb-1">Total Invested</span>
                    <span className="text-lg font-bold text-[#101828] block tabular-nums">{fmt(result.totalInvestment)}</span>
                  </div>
                  <div className="p-4 rounded-[20px] border border-[#EAECF0] bg-[#F9FAFB]">
                    <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block mb-1">Interest Earned</span>
                    <span className="text-lg font-bold text-[#027A48] block tabular-nums">{fmt(result.interestEarned)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-grow px-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Yearly Deposit</span>
                  <span className="text-xs font-bold text-[#101828]">{fmt(annualInvestment)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Lock-in Period</span>
                  <span className="text-xs font-bold text-[#101828]">{years} Years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Current Int. Rate</span>
                  <span className="text-xs font-bold text-[#027A48]">{CURRENT_RATES.PPF}% P.A.</span>
                </div>
                <div className="pt-4 border-t border-[#F2F4F7] flex items-center justify-between">
                  <span className="text-sm font-bold text-[#101828]">Maturity Proceeds</span>
                  <span className="text-base font-black text-[#027A48]">{fmt(result.maturityValue)}</span>
                </div>
              </div>

              {/* Action Box */}
              <div className="mt-6 bg-[#ECFDF3] border border-[#ABEFC6] rounded-[24px] p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#ABEFC6] flex items-center justify-center text-[#027A48] shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-0.5">Plan 80C Savings?</h4>
                  <p className="text-[11px] text-[#667085] mb-2 leading-tight">Maximize your tax-free returns with professional wealth planning.</p>
                  <Link href="/services/tax-planning">
                    <button className="text-[13px] font-bold text-[#027A48] flex items-center gap-2 hover:gap-3 transition-all">
                      Consult a CA Expert
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Headphones className="w-5 h-5" />, label: "Expert CA Support", desc: "Plan your 80C deductions" },
            { icon: <Award className="w-5 h-5" />, label: "Sovereign Guarantee", desc: "Government backed returns" },
            { icon: <Lock className="w-5 h-5" />, label: "Private & Local", desc: "Zero data collection" },
            { icon: <BarChart3 className="w-5 h-5" />, label: "Tax-Free Maturity", desc: "EEE status verified" }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-2 bg-white/50 rounded-2xl border border-transparent hover:border-[#EAECF0] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAECF0] flex items-center justify-center text-[#101828] shrink-0 shadow-sm">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <h5 className="text-[13px] font-bold text-[#101828]">{item.label}</h5>
                <p className="text-[11px] text-[#667085] leading-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Informational Content */}
        <div className="mt-12">
          <CalculatorMiniBlog 
            features={[
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                iconBg: "bg-emerald-50 text-emerald-600",
                title: "100% Capital Safety",
                desc: "PPF is one of the safest investments as it is backed by the Government of India."
              },
              {
                icon: <Zap className="w-5 h-5" />,
                iconBg: "bg-amber-50 text-amber-600",
                title: "Exempt-Exempt-Exempt",
                desc: "No tax on investment (under 80C), no tax on interest, and no tax on maturity proceeds."
              },
              {
                icon: <Calculator className="w-5 h-5" />,
                iconBg: "bg-blue-50 text-blue-600",
                title: "Loan & Withdrawal",
                desc: "Availability of loans from 3rd year and partial withdrawals from 7th financial year."
              }
            ]}
            howItWorks={{
              title: "PPF Rules & Timeline",
              description: "Understanding the lifecycle of a Public Provident Fund account.",
              steps: [
                { title: "Opening the Account", desc: "Start with as little as ₹500 at any post office or designated bank." },
                { title: "Annual Contributions", desc: "Invest up to ₹1.5 Lakhs per year to claim full Section 80C benefits." },
                { title: "Maturity & Extension", desc: "Account matures in 15 years; can be extended in blocks of 5 years indefinitely." }
              ]
            }}
            faqs={[
              { q: "What is the current PPF rate?", a: "The current interest rate is 7.1% per annum, compounded annually." },
              { q: "Can I have two PPF accounts?", a: "No, an individual can only have one PPF account in their name." },
              { q: "Is there a minimum deposit?", a: "Yes, a minimum of ₹500 must be deposited every financial year to keep the account active." }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
