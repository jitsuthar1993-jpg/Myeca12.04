import { useState, useMemo } from "react";
import { 
  Calculator, IndianRupee, TrendingUp, Calendar,
  Zap, Sparkles, CreditCard, ShieldCheck, ArrowRight, 
  Wallet, Info, CheckCircle, Star, Lock, Headphones, 
  Award, BarChart3, PieChart, Percent, ArrowUpRight,
  Briefcase, Activity
} from "lucide-react";
import { calculateEMI } from "@/lib/tax-calculations";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

export default function EMICalculator() {
  const [principal, setPrincipal] = useState<number>(1000000);
  const [rate, setRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(20);

  const result = useMemo(() => calculateEMI(principal, rate, tenure), [principal, rate, tenure]);
  const seo = getSEOConfig('/calculators/emi');

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n).replace("₹", "₹ ");

  const interestPct = result.totalPayment > 0 ? Math.round((result.totalInterest / result.totalPayment) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-inter">
      <MetaSEO
        title={seo?.title || "EMI Calculator 2025 | Home, Car & Personal Loan | MyeCA.in"}
        description={seo?.description || "Calculate monthly EMIs for any loan. See total interest payable and principal breakdown with interactive charts."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Modern Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#175CD3] mb-4 uppercase tracking-widest bg-[#EFF8FF] w-fit px-4 py-1.5 rounded-full border border-[#B2DDFF]">
            <CreditCard className="w-3.5 h-3.5" />
            Loan Planning Tool
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-[#101828] tracking-tight">
                EMI <span className="text-[#175CD3]">Calculator</span>
              </h1>
              <p className="text-[#667085] text-base max-w-xl font-medium">
                Plan your repayments for Home, Car, or Personal loans.
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
                <p className="text-xs font-bold text-[#175CD3]">80k+ Borrowers</p>
              </div>
              <div className="pl-2">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
                <p className="text-[10px] font-bold text-[#667085]">4.9/5 Rating</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 items-start">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 text-[#175CD3]">
                <Wallet className="w-24 h-24" />
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#EFF8FF] flex items-center justify-center text-[#175CD3] border border-[#B2DDFF]">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#101828]">Loan Configuration</h2>
                  <p className="text-xs text-[#667085]">Adjust parameters to see instant EMI impact</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Loan Presets */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Home Loan', p: 2500000, r: 8.5, t: 20 },
                    { label: 'Car Loan', p: 800000, r: 9.5, t: 7 },
                    { label: 'Personal', p: 500000, r: 12, t: 5 }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setPrincipal(preset.p);
                        setRate(preset.r);
                        setTenure(preset.t);
                      }}
                      className={cn(
                        "py-2 px-1 rounded-xl border transition-all text-[11px] font-bold uppercase tracking-tight",
                        principal === preset.p ? "border-[#175CD3] bg-[#EFF8FF] text-[#175CD3]" : "border-[#EAECF0] bg-white text-[#667085] hover:border-[#B2DDFF]"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Principal */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-[#344054]">Loan Amount</span>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                        <span className="text-xs font-bold text-[#667085]">₹</span>
                        <input 
                          type="number"
                          value={principal}
                          onChange={(e) => setPrincipal(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828]"
                        />
                      </div>
                    </div>
                    <input 
                      type="range"
                      min="100000"
                      max="100000000"
                      step="50000"
                      value={principal}
                      onChange={(e) => setPrincipal(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#175CD3]"
                    />
                  </div>

                  {/* Rate */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-[#344054]">Interest Rate</span>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[80px] flex items-center gap-1 shadow-sm">
                        <input 
                          type="number"
                          value={rate}
                          onChange={(e) => setRate(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828]"
                        />
                        <span className="text-xs font-bold text-[#667085]">%</span>
                      </div>
                    </div>
                    <input 
                      type="range"
                      min="5"
                      max="20"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#175CD3]"
                    />
                  </div>

                  {/* Tenure */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-[#344054]">Tenure (Years)</span>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[80px] flex items-center gap-1 shadow-sm">
                        <input 
                          type="number"
                          value={tenure}
                          onChange={(e) => setTenure(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828]"
                        />
                        <span className="text-xs font-bold text-[#667085]">Yrs</span>
                      </div>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={tenure}
                      onChange={(e) => setTenure(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#175CD3]"
                    />
                  </div>

                   <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0]">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#175CD3] shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Total Repayments</p>
                      <p className="text-sm font-black text-[#101828]">{tenure * 12} Installments</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interest-to-Principal Card */}
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm flex items-center gap-6 relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-5 text-[#175CD3]">
                <Activity className="w-24 h-24" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#FEF3F2] border border-[#FEE4E2] flex items-center justify-center text-[#B42318] shrink-0">
                <Percent className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#101828]">Interest Ratio Insight</h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  You are paying <span className="font-bold text-[#B42318]">{interestPct}% interest</span> on your principal. Total cost of loan: <span className="font-bold text-[#101828]">{fmt(result.totalPayment)}</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm h-full flex flex-col sticky top-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-[#101828]">EMI Summary</h2>
                <div className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#ECFDF3] text-[#027A48] flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle className="w-3 h-3" />
                  Calculated
                </div>
              </div>
              <p className="text-sm text-[#667085] mb-4">Your monthly loan obligation</p>

              <div className="space-y-4 mb-6">
                {/* Main EMI Highlight */}
                <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#175CD3] to-[#1E4391] text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <IndianRupee className="w-32 h-32" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80 block mb-2">Equated Monthly Installment</span>
                  <span className="text-4xl font-black block tabular-nums leading-none">
                    {fmt(result.emi)}
                  </span>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
                    <Calendar className="w-3 h-3 text-white/60" />
                    Due on {new Date().getDate()}th of every month
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-[20px] border border-[#EAECF0] bg-[#F9FAFB]">
                    <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block mb-1">Total Interest</span>
                    <span className="text-lg font-bold text-[#B42318] block tabular-nums">{fmt(result.totalInterest)}</span>
                  </div>
                  <div className="p-4 rounded-[20px] border border-[#EAECF0] bg-[#F9FAFB]">
                    <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block mb-1">Total Payment</span>
                    <span className="text-lg font-bold text-[#101828] block tabular-nums">{fmt(result.totalPayment)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-grow px-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Monthly Rate</span>
                  <span className="text-xs font-bold text-[#101828]">{(rate / 12).toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Tenure in Months</span>
                  <span className="text-xs font-bold text-[#101828]">{tenure * 12} Mo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Annualized Cost</span>
                  <span className="text-xs font-bold text-[#101828]">{fmt(result.emi * 12)}</span>
                </div>
                <div className="pt-4 border-t border-[#F2F4F7] flex items-center justify-between">
                  <span className="text-sm font-bold text-[#101828]">EMI Payable</span>
                  <span className="text-base font-black text-[#175CD3]">{fmt(result.emi)}</span>
                </div>
              </div>

              {/* Action Box */}
              <div className="mt-6 bg-[#F6FEF9] border border-[#D1FADF] rounded-[24px] p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#D1FADF] flex items-center justify-center text-[#027A48] shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-0.5">Save on Interest?</h4>
                  <p className="text-[11px] text-[#667085] mb-2 leading-tight">Reduce your tenure or EMI with balance transfer expert guidance.</p>
                  <Link href="/services/tax-planning">
                    <button className="text-[13px] font-bold text-[#027A48] flex items-center gap-2 hover:gap-3 transition-all">
                      Consult CA Expert
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
            { icon: <Headphones className="w-5 h-5" />, label: "Expert CA Support", desc: "Plan your loan deductions" },
            { icon: <Award className="w-5 h-5" />, label: "100% Accurate", desc: "Standard amortization math" },
            { icon: <Lock className="w-5 h-5" />, label: "Secure & Private", desc: "Zero data collection" },
            { icon: <BarChart3 className="w-5 h-5" />, label: "Tax Analysis", desc: "Analyze 24b implications" }
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
                icon: <CheckCircle className="w-5 h-5" />,
                iconBg: "bg-blue-50 text-blue-600",
                title: "Prepayment Benefit",
                desc: "Paying just one extra EMI per year can reduce your 20-year loan tenure by nearly 3 years."
              },
              {
                icon: <Zap className="w-5 h-5" />,
                iconBg: "bg-amber-50 text-amber-600",
                title: "Balance Transfer",
                desc: "Moving your loan to a lender with a lower interest rate can save you lakhs in total interest."
              },
              {
                icon: <Calculator className="w-5 h-5" />,
                iconBg: "bg-emerald-50 text-emerald-600",
                title: "Credit Score Role",
                desc: "A credit score above 750 usually qualifies you for the lowest interest rates offered by banks."
              }
            ]}
            howItWorks={{
              title: "EMI Amortization",
              description: "Every EMI payment is split into principal and interest components.",
              steps: [
                { title: "Interest Heavy Start", desc: "In the initial years, a major portion of your EMI goes towards paying the interest." },
                { title: "Reducing Balance", desc: "As the principal reduces, the interest component decreases and principal repayment increases." },
                { title: "Final Payoff", desc: "The last few EMIs are almost entirely focused on clearing the remaining principal balance." }
              ]
            }}
            faqs={[
              { q: "What is the formula for EMI?", a: "EMI = [P x R x (1+R)^N]/[(1+R)^N-1], where P is Principal, R is monthly rate, and N is months." },
              { q: "Can I change my EMI tenure?", a: "Yes, you can request your bank to restructure the loan to increase or decrease tenure." },
              { q: "Is there a penalty for prepayment?", a: "Most floating-rate loans have zero prepayment penalties as per RBI guidelines." }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
