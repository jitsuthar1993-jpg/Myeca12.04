import { useState, useMemo } from "react";
import { 
  PiggyBank, IndianRupee, Calendar, TrendingUp, 
  Sparkles, ShieldCheck, Zap, Clock, ArrowRight,
  Star, Info, Lock, Headphones, Award, BarChart3,
  CheckCircle2, Calculator, FileSpreadsheet, Percent,
  ArrowUpRight, LineChart
} from "lucide-react";
import { calculateFD } from "@/lib/tax-calculations";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

export default function FDCalculator() {
  const seo = getSEOConfig('/calculators/fd');
  
  const [principal, setPrincipal] = useState<number>(100000);
  const [rate, setRate] = useState<number>(7.1);
  const [tenure, setTenure] = useState<number>(5);
  const [compoundingFrequency, setCompoundingFrequency] = useState<number>(4);

  const calculations = useMemo(() => {
    return calculateFD(principal, rate, tenure, compoundingFrequency);
  }, [principal, rate, tenure, compoundingFrequency]);

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
        title={seo?.title || "FD Calculator 2025 | Fixed Deposit Maturity Amount | MyeCA.in"}
        description={seo?.description || "Calculate your FD maturity amount and interest earned. Compare latest bank FD rates and plan your savings."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Modern Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#175CD3] mb-4 uppercase tracking-widest bg-[#EFF8FF] w-fit px-4 py-1.5 rounded-full border border-[#B2DDFF]">
            <Sparkles className="w-3.5 h-3.5" />
            Guaranteed Returns
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-[#101828] tracking-tight">
                FD <span className="text-[#175CD3]">Calculator</span>
              </h1>
              <p className="text-[#667085] text-base max-w-xl font-medium">
                Calculate your maturity amount and interest with bank-grade precision.
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
                <p className="text-xs font-bold text-[#175CD3]">50k+ Savers</p>
              </div>
              <div className="pl-2">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
                <p className="text-[10px] font-bold text-[#667085]">4.8/5 Rating</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 items-start">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 text-[#175CD3]">
                <PiggyBank className="w-24 h-24" />
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#EFF8FF] flex items-center justify-center text-[#175CD3] border border-[#B2DDFF]">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#101828]">Deposit Configuration</h2>
                  <p className="text-xs text-[#667085]">Plan your fixed deposit investment</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Main Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Principal Amount */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#344054]">Deposit Amount</span>
                        <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                      </div>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm focus-within:border-[#175CD3] focus-within:ring-1 focus-within:ring-[#175CD3]/10 transition-all">
                        <span className="text-xs font-bold text-[#667085]">₹</span>
                        <input 
                          type="number"
                          value={principal}
                          onChange={(e) => setPrincipal(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <input 
                      type="range"
                      min="5000"
                      max="10000000"
                      step="5000"
                      value={principal}
                      onChange={(e) => setPrincipal(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#175CD3]"
                    />
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#344054]">Interest Rate (%)</span>
                        <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                      </div>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[100px] flex items-center gap-1.5 shadow-sm focus-within:border-[#175CD3] focus-within:ring-1 focus-within:ring-[#175CD3]/10 transition-all">
                        <input 
                          type="number"
                          value={rate}
                          onChange={(e) => setRate(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield]"
                        />
                        <span className="text-xs font-bold text-[#667085]">%</span>
                      </div>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="15"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#175CD3]"
                    />
                  </div>

                  {/* Tenure */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#344054]">Tenure (Years)</span>
                        <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                      </div>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[100px] flex items-center gap-1.5 shadow-sm focus-within:border-[#175CD3] focus-within:ring-1 focus-within:ring-[#175CD3]/10 transition-all">
                        <input 
                          type="number"
                          value={tenure}
                          onChange={(e) => setTenure(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield]"
                        />
                        <span className="text-xs font-bold text-[#667085]">Yrs</span>
                      </div>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="25"
                      step="1"
                      value={tenure}
                      onChange={(e) => setTenure(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#175CD3]"
                    />
                  </div>

                  {/* Compounding Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#667085] uppercase tracking-widest px-1">Compounding Frequency</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Monthly", value: 12 },
                        { label: "Quarterly", value: 4 },
                        { label: "Half-Year", value: 2 },
                        { label: "Annually", value: 1 }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setCompoundingFrequency(opt.value)}
                          className={cn(
                            "py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center",
                            compoundingFrequency === opt.value
                              ? "bg-[#175CD3] border-[#175CD3] text-white shadow-sm"
                              : "bg-white border-[#EAECF0] text-[#344054] hover:border-[#B2DDFF]"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F0F9FF] border border-[#B9E6FE] flex items-center justify-center text-[#026AA2]">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Effective Yield</p>
                  <p className="text-xl font-black text-[#101828]">{calculations.effectiveRate}%</p>
                </div>
              </div>
              <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ECFDF3] border border-[#ABEFC6] flex items-center justify-center text-[#067647]">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Maturity Date</p>
                  <p className="text-xl font-black text-[#101828]">Year {new Date().getFullYear() + tenure}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm h-full flex flex-col sticky top-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-[#101828]">Maturity Summary</h2>
                <div className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#ECFDF3] text-[#027A48] flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" />
                  Calculated
                </div>
              </div>
              <p className="text-sm text-[#667085] mb-4">Investment returns breakdown</p>

              <div className="grid grid-cols-1 gap-4 mb-6">
                {/* Maturity Amount Main Highlight */}
                <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#175CD3] to-[#1E4391] text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <IndianRupee className="w-32 h-32" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80 block mb-2">Total Maturity Amount</span>
                  <span className="text-4xl font-black block tabular-nums leading-none">
                    {fmt(calculations.maturityAmount)}
                  </span>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
                    <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                    Growth of {((calculations.totalInterest / principal) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-[20px] border border-[#EAECF0] bg-[#F9FAFB]">
                    <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block mb-1">Total Principal</span>
                    <span className="text-lg font-bold text-[#101828] block tabular-nums">{fmt(principal)}</span>
                  </div>
                  <div className="p-4 rounded-[20px] border border-[#EAECF0] bg-[#F9FAFB]">
                    <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block mb-1">Interest Earned</span>
                    <span className="text-lg font-bold text-[#175CD3] block tabular-nums">{fmt(calculations.totalInterest)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-grow px-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Compounding Every</span>
                  <span className="text-xs font-bold text-[#101828]">
                    {compoundingFrequency === 12 ? 'Month' : compoundingFrequency === 4 ? 'Quarter' : compoundingFrequency === 2 ? '6 Months' : 'Year'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Lock-in Period</span>
                  <span className="text-xs font-bold text-[#101828]">{tenure} Years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Effective Yield</span>
                  <span className="text-xs font-bold text-[#027A48]">{calculations.effectiveRate}%</span>
                </div>
                <div className="pt-4 border-t border-[#F2F4F7] flex items-center justify-between">
                  <span className="text-sm font-bold text-[#101828]">Maturity Proceeds</span>
                  <span className="text-base font-black text-[#175CD3]">{fmt(calculations.maturityAmount)}</span>
                </div>
              </div>

              {/* Expert Action Box */}
              <div className="mt-6 bg-[#EFF8FF] border border-[#B2DDFF] rounded-[24px] p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#B2DDFF] flex items-center justify-center text-[#175CD3] shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-0.5">Need Higher Returns?</h4>
                  <p className="text-[11px] text-[#667085] mb-2 leading-tight">Explore Corporate FDs & Debt Mutual Funds with our expert CAs.</p>
                  <Link href="/services/tax-planning">
                    <button className="text-[13px] font-bold text-[#175CD3] flex items-center gap-2 hover:gap-3 transition-all">
                      Consult an Expert
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
            { icon: <Headphones className="w-5 h-5" />, label: "Expert CA Support", desc: "Get personalized tax advice" },
            { icon: <Award className="w-5 h-5" />, label: "100% Accurate", desc: "Bank-grade calculations" },
            { icon: <Lock className="w-5 h-5" />, label: "Secure & Private", desc: "No data collection ever" },
            { icon: <BarChart3 className="w-5 h-5" />, label: "Tax Analysis", desc: "Analyze TDS implications" }
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
                iconBg: "bg-blue-50 text-blue-600",
                title: "DICGC Insured",
                desc: "Your deposits are insured up to ₹5 Lakhs per bank by the Deposit Insurance and Credit Guarantee Corporation."
              },
              {
                icon: <Zap className="w-5 h-5" />,
                iconBg: "bg-amber-50 text-amber-600",
                title: "Taxable Interest",
                desc: "FD interest is taxable as per your income slab. Banks deduct 10% TDS if interest exceeds threshold limits."
              },
              {
                icon: <Calculator className="w-5 h-5" />,
                iconBg: "bg-indigo-50 text-indigo-600",
                title: "Laddering Strategy",
                desc: "Spread investments across different tenures to manage liquidity and hedge against interest rate risks."
              }
            ]}
            howItWorks={{
              title: "The Math of Maturity",
              description: "Understanding how compound interest works for your fixed deposits.",
              steps: [
                { title: "Principal Payout", desc: "The initial amount you deposit starts earning interest from day one." },
                { title: "Compounding Effect", desc: "Interest is calculated on the principal plus previously earned interest at regular intervals." },
                { title: "Final Maturity", desc: "The total amount paid back to you at the end of the selected tenure." }
              ]
            }}
            faqs={[
              { q: "Is FD interest tax-free?", a: "No, FD interest is added to your total income and taxed as per your slab rate." },
              { q: "What is the minimum tenure?", a: "The minimum tenure for an FD can be as low as 7 days depending on the bank." },
              { q: "Can I withdraw before maturity?", a: "Yes, but most banks charge a premature withdrawal penalty of 0.5% to 1%." }
            ]}
          />
        </div>
      </div>
    </div>
  );
}