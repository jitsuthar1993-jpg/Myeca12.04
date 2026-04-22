import { useState, useMemo } from "react";
import { 
  Building2, IndianRupee, TrendingUp, Calendar,
  Zap, Sparkles, CreditCard, ShieldCheck, ArrowRight, 
  Wallet, Info, CheckCircle, Star, Lock, Headphones, 
  Award, BarChart3, PieChart, Percent, ArrowUpRight,
  Briefcase, Activity, Home, TrendingDown, CheckCircle2,
  Calculator, Download
} from "lucide-react";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

export default function HomeLoanCalculator() {
  const [propertyValue, setPropertyValue] = useState<number>(5000000);
  const [principal, setPrincipal] = useState<number>(4000000);
  const [rate, setRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(20);

  const calculations = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const tenureMonths = tenure * 12;
    
    if (principal <= 0 || monthlyRate <= 0 || tenureMonths <= 0) {
      return { emi: 0, totalPayment: 0, totalInterest: 0, ltvRatio: 0, schedule: [] };
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;
    const ltvRatio = (principal / propertyValue) * 100;

    let balance = principal;
    const schedule = [];
    for (let month = 1; month <= 12; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      balance -= principalPayment;
      schedule.push({
        month,
        emi: Math.round(emi),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.max(0, Math.round(balance))
      });
    }

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      ltvRatio: Math.round(ltvRatio * 100) / 100,
      schedule
    };
  }, [propertyValue, principal, rate, tenure]);

  const seo = getSEOConfig('/calculators/home-loan');

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
        title={seo?.title || "Home Loan EMI Calculator 2025 | Calculate Housing Loan EMI & Eligibility"}
        description={seo?.description || "Calculate home loan EMI with current interest rates 8.5-10.5%. Check eligibility, LTV ratio, tax benefits & compare 20+ banks."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Modern Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#444CE7] mb-4 uppercase tracking-widest bg-[#EEF2FF] w-fit px-4 py-1.5 rounded-full border border-[#C7D2FE]">
            <Home className="w-3.5 h-3.5" />
            Property Financing
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-[#101828] tracking-tight">
                Home Loan <span className="text-[#444CE7]">Calculator</span>
              </h1>
              <p className="text-[#667085] text-base max-w-xl font-medium">
                High-precision EMI and eligibility engine for your dream home.
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
                <p className="text-xs font-bold text-[#444CE7]">120k+ Homeowners</p>
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
              <div className="absolute top-0 right-0 p-6 opacity-5 text-[#444CE7]">
                <Building2 className="w-24 h-24" />
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#444CE7] border border-[#C7D2FE]">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#101828]">Loan Parameters</h2>
                  <p className="text-xs text-[#667085]">Map your home loan journey</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Property Value */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-[#344054]">Property Value</span>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                        <span className="text-xs font-bold text-[#667085]">₹</span>
                        <input 
                          type="number"
                          value={propertyValue}
                          onChange={(e) => setPropertyValue(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828]"
                        />
                      </div>
                    </div>
                    <input 
                      type="range"
                      min="500000"
                      max="100000000"
                      step="100000"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#444CE7]"
                    />
                  </div>

                  {/* Loan Amount */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-[#344054]">Loan Principal</span>
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
                      max={propertyValue}
                      step="50000"
                      value={principal}
                      onChange={(e) => setPrincipal(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#444CE7]"
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
                      max="15"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#444CE7]"
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
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#444CE7]"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-[#F2F4F7]">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAECF0]">
                      <p className="text-[10px] font-bold text-[#667085] uppercase mb-0.5 tracking-wider">LTV Ratio</p>
                      <p className="text-sm font-black text-[#101828]">{calculations.ltvRatio}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAECF0]">
                      <p className="text-[10px] font-bold text-[#667085] uppercase mb-0.5 tracking-wider">Total Interest</p>
                      <p className="text-sm font-black text-[#B42318]">{fmt(calculations.totalInterest)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] col-span-2 md:col-span-1">
                      <p className="text-[10px] font-bold text-[#667085] uppercase mb-0.5 tracking-wider">Total Tenure</p>
                      <p className="text-sm font-black text-[#101828]">{tenure * 12} Months</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Benefits Schedule Section */}
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F6FEF9] flex items-center justify-center text-[#027A48] border border-[#D1FADF]">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#101828]">First Year Schedule</h3>
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-[#444CE7] hover:bg-[#EEF2FF] px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-[#C7D2FE]">
                  <Download className="w-3.5 h-3.5" />
                  Full Schedule
                </button>
              </div>
              
              <div className="overflow-hidden border border-[#EAECF0] rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F9FAFB] border-b border-[#EAECF0]">
                    <tr className="text-[#667085] font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3">Principal</th>
                      <th className="px-4 py-3">Interest</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F4F7]">
                    {calculations.schedule.map((row) => (
                      <tr key={row.month} className="hover:bg-[#F9FAFB] transition-colors group">
                        <td className="px-4 py-3 font-bold text-[#667085]">Month {row.month}</td>
                        <td className="px-4 py-3 font-bold text-[#444CE7]">{fmt(row.principal)}</td>
                        <td className="px-4 py-3 font-bold text-[#B42318]">{fmt(row.interest)}</td>
                        <td className="px-4 py-3 text-right font-black text-[#101828]">{fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm h-full flex flex-col sticky top-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-[#101828]">EMI Breakdown</h2>
                <div className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#ECFDF3] text-[#027A48] flex items-center gap-1.5 uppercase tracking-wider">
                  <Activity className="w-3 h-3" />
                  Live
                </div>
              </div>
              <p className="text-sm text-[#667085] mb-4">Your housing loan obligation</p>

              <div className="space-y-4 mb-6">
                {/* Main EMI Highlight */}
                <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#444CE7] to-[#2D31A6] text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Home className="w-32 h-32" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80 block mb-2">Monthly Installment (EMI)</span>
                  <span className="text-4xl font-black block tabular-nums leading-none">
                    {fmt(calculations.emi)}
                  </span>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
                    <TrendingDown className="w-3 h-3 text-emerald-300" />
                    Floating Rate Estimate
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-[20px] border border-[#EAECF0] bg-[#F9FAFB]">
                    <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block mb-1">Total Payment</span>
                    <span className="text-lg font-bold text-[#101828] block tabular-nums">{fmt(calculations.totalPayment)}</span>
                  </div>
                  <div className="p-4 rounded-[20px] border border-[#EAECF0] bg-[#F9FAFB]">
                    <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block mb-1">Total Interest</span>
                    <span className="text-lg font-bold text-[#B42318] block tabular-nums">{fmt(calculations.totalInterest)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-grow px-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Monthly Rate</span>
                  <span className="text-xs font-bold text-[#101828]">{(rate / 12).toFixed(3)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">LTV Comparison</span>
                  <span className="text-xs font-bold text-[#027A48]">{calculations.ltvRatio}% Coverage</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Section 24(b) Savings</span>
                  <span className="text-xs font-bold text-[#101828]">Up to ₹2L /yr</span>
                </div>
                <div className="pt-4 border-t border-[#F2F4F7] flex items-center justify-between">
                  <span className="text-sm font-bold text-[#101828]">Monthly EMI</span>
                  <span className="text-base font-black text-[#444CE7]">{fmt(calculations.emi)}</span>
                </div>
              </div>

              {/* Action Box */}
              <div className="mt-6 bg-[#EEF2FF] border border-[#C7D2FE] rounded-[24px] p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#C7D2FE] flex items-center justify-center text-[#444CE7] shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-0.5">Need a Home Loan?</h4>
                  <p className="text-[11px] text-[#667085] mb-2 leading-tight">Compare 20+ banks and get pre-approved instantly with our CA assistance.</p>
                  <Link href="/services/home-loan">
                    <button className="text-[13px] font-bold text-[#444CE7] flex items-center gap-2 hover:gap-3 transition-all">
                      Apply Now
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
            { icon: <Headphones className="w-5 h-5" />, label: "Expert Assistance", desc: "Plan Section 24b deductions" },
            { icon: <Award className="w-5 h-5" />, label: "Best Rates", desc: "Compare 20+ top banks" },
            { icon: <Lock className="w-5 h-5" />, label: "Secure Data", desc: "Local calculation engine" },
            { icon: <Briefcase className="w-5 h-5" />, label: "End-to-End", desc: "Processing to disbursement" }
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
                icon: <CheckCircle2 className="w-5 h-5" />,
                iconBg: "bg-blue-50 text-blue-600",
                title: "Section 24(b) Benefits",
                desc: "Claim a deduction of up to ₹2 Lakhs per financial year on the interest paid for a self-occupied property."
              },
              {
                icon: <TrendingDown className="w-5 h-5" />,
                iconBg: "bg-emerald-50 text-emerald-600",
                title: "LTV Ratio Optimization",
                desc: "Learn how Loan-to-Value (LTV) ratios affect your interest rate and down payment requirements."
              },
              {
                icon: <Calculator className="w-5 h-5" />,
                iconBg: "bg-amber-50 text-amber-600",
                title: "Reducing Balance Math",
                desc: "Understand how interest is calculated on the outstanding principal at the end of every month."
              }
            ]}
            howItWorks={{
              title: "Home Loan Lifecycle",
              description: "From application to the final EMI payment.",
              steps: [
                { title: "LTV Assessment", desc: "Banks typically finance 80-90% of the property value based on your income." },
                { title: "Amortization Phase", desc: "Initially, your EMIs are interest-heavy. Principal repayment accelerates in the later years." },
                { title: "Tax Advantages", desc: "Enjoy dual benefits under Section 80C (Principal) and Section 24b (Interest) every year." }
              ]
            }}
            faqs={[
              { q: "Is home loan interest tax-free?", a: "Interest is deductible up to ₹2 Lakhs under Section 24(b) for self-occupied properties." },
              { q: "What is a good LTV ratio?", a: "Lenders prefer an LTV of 80% or lower, which often results in better interest rates." },
              { q: "Can I increase my EMI later?", a: "Yes, many banks allow 'Step-up' payments where you increase your EMI as your income grows." }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
