import { useState, useMemo } from "react";
import { 
  PiggyBank, TrendingUp, Target, Calendar, IndianRupee,
  ShieldCheck, Sparkles, Zap, Shield, BadgeCent,
  CheckCircle2, Clock, Calculator, ArrowRight,
  Star, Info, Lock, Headphones, Award, BarChart3,
  Percent, ArrowUpRight, HeartHandshake, Briefcase
} from "lucide-react";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

function calcNPS(monthly: number, years: number, rate: number, annuity: number, age: number) {
  const r = rate / 100 / 12;
  const n = years * 12;
  const corpus = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const lumpSum = corpus * (1 - annuity / 100);
  const annuityCorpus = corpus * (annuity / 100);
  const monthlyPension = (annuityCorpus * 0.06) / 12; // Conservative 6% annuity rate
  const taxSaved80C = Math.min(monthly * 12, 150000) * 0.3;
  const taxSaved80CCD = Math.min(monthly * 12, 50000) * 0.3;
  return { corpus, lumpSum, annuityCorpus, monthlyPension, taxSaved80C, taxSaved80CCD };
}

export default function NPSCalculatorPage() {
  const [age, setAge] = useState(30);
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(10);
  const [annuity, setAnnuity] = useState(40);

  const retireAge = 60;
  const years = Math.max(0, retireAge - age);
  const result = useMemo(
    () => calcNPS(monthly, years, rate, annuity, age),
    [monthly, years, rate, annuity, age]
  );

  const seo = getSEOConfig("/calculators/nps");

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
        title={seo?.title || "NPS Calculator 2025 | Pension Corpus & Tax Savings | MyeCA.in"}
        description={seo?.description || "Calculate your NPS retirement corpus, monthly pension, and tax savings under Section 80CCD. Plan your retirement with India's National Pension System."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Modern Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#444CE7] mb-4 uppercase tracking-widest bg-[#EEF2FF] w-fit px-4 py-1.5 rounded-full border border-[#C7D2FE]">
            <Target className="w-3.5 h-3.5" />
            Retirement Planning
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-[#101828] tracking-tight">
                NPS <span className="text-[#444CE7]">Calculator</span>
              </h1>
              <p className="text-[#667085] text-base max-w-xl font-medium">
                National Pension System corpus & monthly pension estimator.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-[24px] border border-[#EAECF0] shadow-sm self-start">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-[#F2F4F7] flex items-center justify-center text-[10px] font-bold text-[#475467]">
                    {i === 1 ? 'JD' : i === 2 ? 'RK' : 'AM'}
                  </div>
                ))}
              </div>
              <div className="pr-4 border-r border-[#F2F4F7]">
                <p className="text-[10px] font-bold text-[#101828] uppercase tracking-wider">Trusted by</p>
                <p className="text-xs font-bold text-[#444CE7]">35k+ Investors</p>
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
              <div className="absolute top-0 right-0 p-6 opacity-5 text-[#444CE7]">
                <Shield className="w-24 h-24" />
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#444CE7] border border-[#C7D2FE]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#101828]">Retirement Configuration</h2>
                  <p className="text-xs text-[#667085]">Set your contribution and expectations</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Current Age */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-[#344054]">Current Age</span>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[80px] flex items-center gap-1 shadow-sm">
                        <input 
                          type="number"
                          value={age}
                          onChange={(e) => setAge(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828]"
                        />
                        <span className="text-xs font-bold text-[#667085]">Yrs</span>
                      </div>
                    </div>
                    <input 
                      type="range"
                      min="18"
                      max="55"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#444CE7]"
                    />
                  </div>

                  {/* Monthly Contribution */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-[#344054]">Monthly Invest</span>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                        <span className="text-xs font-bold text-[#667085]">₹</span>
                        <input 
                          type="number"
                          value={monthly}
                          onChange={(e) => setMonthly(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828]"
                        />
                      </div>
                    </div>
                    <input 
                      type="range"
                      min="500"
                      max="150000"
                      step="500"
                      value={monthly}
                      onChange={(e) => setMonthly(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#444CE7]"
                    />
                  </div>

                  {/* Expected Returns */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-[#344054]">Expected Return</span>
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
                      min="6"
                      max="15"
                      step="0.5"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#444CE7]"
                    />
                  </div>

                  {/* Annuity Purchase */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-[#344054]">Annuity Choice</span>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[80px] flex items-center gap-1 shadow-sm">
                        <input 
                          type="number"
                          value={annuity}
                          onChange={(e) => setAnnuity(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828]"
                        />
                        <span className="text-xs font-bold text-[#667085]">%</span>
                      </div>
                    </div>
                    <input 
                      type="range"
                      min="40"
                      max="100"
                      step="5"
                      value={annuity}
                      onChange={(e) => setAnnuity(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#444CE7]"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-[#F2F4F7]">
                  <div className="bg-[#F9FAFB] rounded-[24px] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#EAECF0] flex items-center justify-center text-[#444CE7]">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#101828]">Accumulation Phase</p>
                        <p className="text-[11px] text-[#667085]">{years} years of active compounding</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#444CE7]">Retire at 60</p>
                      <p className="text-[11px] text-[#667085]">Standard PFRDA Age</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Savings Insight */}
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm flex items-center gap-6 relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-5 text-[#444CE7]">
                <BadgeCent className="w-24 h-24" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#444CE7] shrink-0">
                <Percent className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#101828]">Tax Saving Advantage</h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Save up to <span className="font-bold text-[#444CE7]">{fmt(result.taxSaved80C + result.taxSaved80CCD)}</span> annually in taxes under Section 80CCD.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm h-full flex flex-col sticky top-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-[#101828]">Pension Summary</h2>
                <div className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#ECFDF3] text-[#027A48] flex items-center gap-1.5 uppercase tracking-wider">
                  <BadgeCent className="w-3 h-3" />
                  Estimated
                </div>
              </div>
              <p className="text-sm text-[#667085] mb-4">Your future retirement outlook</p>

              <div className="space-y-4 mb-6">
                {/* Main Corpus Highlight */}
                <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#444CE7] to-[#2D31A6] text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <PiggyBank className="w-32 h-32" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80 block mb-2">Retirement Corpus</span>
                  <span className="text-4xl font-black block tabular-nums leading-none">
                    {fmt(result.corpus)}
                  </span>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
                    <TrendingUp className="w-3 h-3 text-emerald-300" />
                    Target reached at age 60
                  </div>
                </div>

                {/* Monthly Pension Stats */}
                <div className="bg-[#F9FAFB] rounded-[24px] border border-[#EAECF0] p-5">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#F2F4F7]">
                    <div>
                      <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Monthly Pension</p>
                      <p className="text-2xl font-black text-[#101828] tabular-nums">{fmt(result.monthlyPension)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#EAECF0] flex items-center justify-center text-[#444CE7]">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-[#667085] uppercase mb-0.5">Lump Sum (60%)</p>
                      <p className="text-sm font-bold text-[#101828] tabular-nums">{fmt(result.lumpSum)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#667085] uppercase mb-0.5">Annuity (40%)</p>
                      <p className="text-sm font-bold text-[#101828] tabular-nums">{fmt(result.annuityCorpus)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-grow px-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Total Investment</span>
                  <span className="text-xs font-bold text-[#101828]">{fmt(monthly * 12 * years)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Compounding Gain</span>
                  <span className="text-xs font-bold text-[#027A48]">{fmt(result.corpus - (monthly * 12 * years))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Lump Sum Tax Status</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#027A48] uppercase">Tax Free</span>
                </div>
                <div className="pt-4 border-t border-[#F2F4F7] flex items-center justify-between">
                  <span className="text-sm font-bold text-[#101828]">Estimated Pension</span>
                  <span className="text-base font-black text-[#444CE7]">{fmt(result.monthlyPension)}/mo</span>
                </div>
              </div>

              {/* Action Box */}
              <div className="mt-6 bg-[#EEF2FF] border border-[#C7D2FE] rounded-[24px] p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#C7D2FE] flex items-center justify-center text-[#444CE7] shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-0.5">Retirement Strategy?</h4>
                  <p className="text-[11px] text-[#667085] mb-2 leading-tight">Map your portfolio for a stress-free retirement with our CA experts.</p>
                  <Link href="/services/tax-planning">
                    <button className="text-[13px] font-bold text-[#444CE7] flex items-center gap-2 hover:gap-3 transition-all">
                      Speak to Consultant
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
            { icon: <Headphones className="w-5 h-5" />, label: "Expert CA Support", desc: "Consult for 80CCD savings" },
            { icon: <Award className="w-5 h-5" />, label: "PFRDA Regulated", desc: "Government backed tool" },
            { icon: <Lock className="w-5 h-5" />, label: "Privacy First", desc: "Data processed locally" },
            { icon: <BarChart3 className="w-5 h-5" />, label: "Wealth Analysis", desc: "Complete corpus projection" }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-2">
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
                iconBg: "bg-indigo-50 text-indigo-600",
                title: "Section 80CCD(1B)",
                desc: "Exclusive additional deduction of ₹50,000 per year over and above the ₹1.5 Lakh limit of Section 80C."
              },
              {
                icon: <Zap className="w-5 h-5" />,
                iconBg: "bg-amber-50 text-amber-600",
                title: "Flexible Withdrawal",
                desc: "At 60, withdraw 60% corpus tax-free. Use remaining 40% for annuity to get regular monthly pension."
              },
              {
                icon: <Calculator className="w-5 h-5" />,
                iconBg: "bg-emerald-50 text-emerald-600",
                title: "Low Cost Fund",
                desc: "NPS is one of the lowest-cost investment products globally, ensuring more of your money works for you."
              }
            ]}
            howItWorks={{
              title: "Retirement Roadmap",
              description: "The path to building your government-regulated retirement fund.",
              steps: [
                { title: "Active Investing", desc: "Make monthly or annual contributions to your Tier-1 NPS account until age 60." },
                { title: "Market Growth", desc: "Choose between Active or Auto choice to allocate funds across Equity, Corporate & Govt bonds." },
                { title: "Maturity Payout", desc: "Convert your accumulated wealth into a stable pension and tax-free lump sum at retirement." }
              ]
            }}
            faqs={[
              { q: "Is monthly pension tax-free?", a: "No, the annuity income (pension) is taxable as per your income tax slab in the year of receipt." },
              { q: "Can I choose my fund manager?", a: "Yes, you can select from various Pension Fund Managers (PFMs) and change them once a year." },
              { q: "What is Tier-2 account?", a: "Tier-2 is a voluntary savings account with no lock-in, but it doesn't offer any tax benefits." }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
