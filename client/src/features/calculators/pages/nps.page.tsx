import { useState, useMemo } from "react";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { m } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import Breadcrumb from "@/components/Breadcrumb";
import {
  PiggyBank, TrendingUp, Shield, IndianRupee, Target,
  Calendar, Percent, Info, ShieldCheck, Sparkles, ArrowRight
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const fmt = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${n.toLocaleString("en-IN")}`;

function calcNPS(monthly: number, years: number, rate: number, annuity: number, age: number) {
  const r = rate / 100 / 12;
  const n = years * 12;
  const corpus = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const lumpSum = corpus * (1 - annuity / 100);
  const annuityCorpus = corpus * (annuity / 100);
  const monthlyPension = (annuityCorpus * 0.065) / 12;
  const taxSaved80C = Math.min(monthly * 12, 150000) * 0.3;
  const taxSaved80CCD = Math.min(monthly * 12, 50000) * 0.3;
  const chartData: { year: number; corpus: number; invested: number }[] = [];
  for (let y = 1; y <= years; y++) {
    const invested = monthly * 12 * y;
    const c = monthly * ((Math.pow(1 + r, y * 12) - 1) / r) * (1 + r);
    chartData.push({ year: age + y, corpus: Math.round(c), invested: Math.round(invested) });
  }
  return { corpus, lumpSum, annuityCorpus, monthlyPension, taxSaved80C, taxSaved80CCD, chartData };
}

const PIE_COLORS = ["#003087", "#10b981"];

export default function NPSCalculatorPage() {
  const seo = getSEOConfig("/calculators/nps");
  const [age, setAge] = useState(30);
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(10);
  const [annuity, setAnnuity] = useState(40);

  const retireAge = 60;
  const years = retireAge - age;
  const result = useMemo(
    () => calcNPS(monthly, years, rate, annuity, age),
    [monthly, years, rate, annuity, age]
  );

  const pieData = [
    { name: "Lump Sum (Tax-Free)", value: Math.round(result.lumpSum) },
    { name: "Annuity Corpus", value: Math.round(result.annuityCorpus) },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-lg text-sm">
          <p className="text-slate-500 mb-1 font-bold">Age {payload[0]?.payload?.year}</p>
          <p className="text-indigo-600 font-black">{fmt(payload[0]?.value ?? 0)}</p>
          {payload[1] && <p className="text-slate-400 font-bold">{fmt(payload[1]?.value ?? 0)}</p>}
        </div>
      );
    }
    return null;
  };

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
          { question: "What is NPS?", answer: "National Pension System (NPS) is a government-sponsored retirement savings scheme. Contributions are invested in equity, corporate bonds, and government securities." },
          { question: "How much tax can I save with NPS?", answer: "You can save tax under Section 80CCD(1) up to ₹1.5L and an additional ₹50,000 under 80CCD(1B), totaling ₹2 lakhs of deductions." },
          { question: "When can I withdraw from NPS?", answer: "At age 60, you can withdraw 60% as a lump sum (tax-free) and must invest 40% in an annuity plan for monthly pension." },
        ]}
      />

      <div className="min-h-screen bg-slate-50/50 calculator-gradient-bg pb-24">
        <Breadcrumb items={[{ name: "Calculators", href: "/calculators" }, { name: "NPS Calculator" }]} />

        {/* Hero */}
        <section className="relative pt-12 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] -z-10" />
          <div className="max-w-7xl mx-auto px-4 text-center">
            <m.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-[11px] font-black uppercase tracking-widest mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Retirement Planning · Tax Saving
            </m.div>
            <m.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              NPS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Pension</span> Calculator
            </m.h1>
            <m.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Plan your retirement corpus, visualize growth, and discover your tax savings under Section 80CCD.
            </m.p>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ─── Input Panel ─── */}
            <div className="lg:col-span-4 space-y-5">
              <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50/50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                      <PiggyBank className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Your NPS Details</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configure your plan</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Current Age */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Current Age
                      </label>
                      <span className="text-indigo-600 font-black text-xl">{age} yrs</span>
                    </div>
                    <Slider colorTheme="blue" value={[age]} onValueChange={([v]) => setAge(v)} min={18} max={55} step={1} className="w-full" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-bold">
                      <span>18 yrs</span><span>55 yrs</span>
                    </div>
                  </div>

                  {/* Monthly Contribution */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5" /> Monthly Contribution
                      </label>
                      <span className="text-indigo-600 font-black text-xl">{fmt(monthly)}</span>
                    </div>
                    <Slider colorTheme="blue" value={[monthly]} onValueChange={([v]) => setMonthly(v)} min={500} max={100000} step={500} className="w-full" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-bold">
                      <span>₹500</span><span>₹1 Lakh</span>
                    </div>
                  </div>

                  {/* Expected Return */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5" /> Expected Annual Return
                      </label>
                      <span className="text-emerald-600 font-black text-xl">{rate}%</span>
                    </div>
                    <Slider colorTheme="blue" value={[rate]} onValueChange={([v]) => setRate(v)} min={6} max={15} step={0.5} className="w-full" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-bold">
                      <span>6%</span><span>15%</span>
                    </div>
                  </div>

                  {/* Annuity % */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Annuity Allocation
                      </label>
                      <span className="text-violet-600 font-black text-xl">{annuity}%</span>
                    </div>
                    <Slider colorTheme="blue" value={[annuity]} onValueChange={([v]) => setAnnuity(v)} min={40} max={100} step={5} className="w-full" />
                    <p className="text-[10px] text-slate-400 font-bold mt-1.5">Min 40% required by PFRDA</p>
                  </div>
                </div>
              </m.div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Retire at", val: "60 yrs", icon: Calendar, c: "text-indigo-600", bg: "bg-indigo-50" },
                  { label: "Years left", val: `${years} yrs`, icon: Target, c: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Total invested", val: fmt(monthly * 12 * years), icon: IndianRupee, c: "text-violet-600", bg: "bg-violet-50" },
                  { label: "Tax saved/yr", val: fmt(result.taxSaved80C + result.taxSaved80CCD), icon: Shield, c: "text-rose-600", bg: "bg-rose-50" },
                ].map(({ label, val, icon: Icon, c, bg }) => (
                  <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                      <Icon className={`w-4 h-4 ${c}`} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
                    <p className="text-slate-900 font-black text-sm mt-0.5">{val}</p>
                  </div>
                ))}
              </div>

              {/* Tax Benefits Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200/50">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-indigo-200" />
                  <h3 className="font-black text-sm tracking-tight">Annual Tax Benefits</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-200 text-sm font-medium">80CCD(1) — via 80C</span>
                    <span className="font-black text-white">{fmt(result.taxSaved80C)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-200 text-sm font-medium">80CCD(1B) — Extra ₹50k</span>
                    <span className="font-black text-white">{fmt(result.taxSaved80CCD)}</span>
                  </div>
                  <div className="border-t border-indigo-500/50 pt-3 flex justify-between items-center">
                    <span className="font-black text-sm">Total Saved/yr</span>
                    <span className="font-black text-2xl">{fmt(result.taxSaved80C + result.taxSaved80CCD)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Results Panel ─── */}
            <div className="lg:col-span-8 space-y-6">
              <m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Total Corpus", val: fmt(result.corpus), icon: Target, accent: "from-indigo-500 to-violet-600", text: "text-indigo-600" },
                    { label: "Lump Sum", val: fmt(result.lumpSum), icon: IndianRupee, accent: "from-emerald-500 to-teal-600", text: "text-emerald-600" },
                    { label: "Annuity Fund", val: fmt(result.annuityCorpus), icon: TrendingUp, accent: "from-amber-500 to-orange-500", text: "text-amber-600" },
                    { label: "Monthly Pension", val: fmt(result.monthlyPension), icon: PiggyBank, accent: "from-rose-500 to-pink-600", text: "text-rose-600" },
                  ].map(({ label, val, icon: Icon, accent, text }) => (
                    <m.div key={label} whileHover={{ y: -2 }}
                      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 overflow-hidden relative">
                      <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${accent} opacity-10 rounded-full blur-xl`} />
                      <Icon className={`w-5 h-5 ${text} mb-3`} />
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-slate-900 font-black text-lg leading-none">{val}</p>
                    </m.div>
                  ))}
                </div>

                {/* Growth Chart */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-slate-900 font-black tracking-tight">Corpus Growth Over Time</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Age {age} → Retirement at 60</p>
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-600 border-0 text-xs font-black hover:bg-indigo-50">{rate}% p.a.</Badge>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.chartData} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                        <defs>
                          <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#003087" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#003087" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 700 }} tickLine={false} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} tickFormatter={(v) => `₹${(v / 1e5).toFixed(0)}L`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "11px", fontWeight: 700, color: "#64748b" }} />
                        <Area type="monotone" dataKey="invested" name="Invested" stroke="#10b981" fill="url(#investedGrad)" strokeWidth={2} dot={false} />
                        <Area type="monotone" dataKey="corpus" name="Corpus" stroke="#003087" fill="url(#corpusGrad)" strokeWidth={2.5} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie + Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7">
                    <h3 className="text-slate-900 font-black tracking-tight mb-4">Corpus Split at Retirement</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => fmt(v)}
                            contentStyle={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: "12px", fontSize: "12px", fontWeight: 700 }} />
                          <Legend wrapperStyle={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7">
                    <h3 className="text-slate-900 font-black tracking-tight mb-4">Summary</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Investment Duration", val: `${years} years` },
                        { label: "Total Invested", val: fmt(monthly * 12 * years) },
                        { label: "Net Gains", val: fmt(result.corpus - monthly * 12 * years) },
                        { label: "Wealth Multiplier", val: `${(result.corpus / Math.max(1, monthly * 12 * years)).toFixed(1)}x` },
                        { label: "Annuity Rate (est.)", val: "6.5% p.a." },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                          <span className="text-slate-500 text-sm font-medium">{label}</span>
                          <span className="text-slate-900 font-black text-sm">{val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-start gap-2 bg-amber-50 rounded-2xl p-4 border border-amber-100">
                      <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-amber-700 text-xs font-medium leading-relaxed">
                        Returns are estimates. Actual NPS returns vary based on asset class (E/C/G) allocation.
                      </p>
                    </div>
                  </div>
                </div>
              </m.div>
            </div>
          </div>
        </main>

        {/* FAQ */}
        <section className="max-w-7xl mx-auto px-4 mt-24">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-2">
              <Info className="w-6 h-6 text-indigo-500" /> Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { q: "Who can open an NPS account?", a: "Any Indian citizen aged 18–70 years (residents and NRIs) can open an NPS account." },
                { q: "Is NPS return guaranteed?", a: "No. NPS returns depend on market performance across Equity (E), Corporate Bonds (C), and Government Securities (G) asset classes." },
                { q: "What happens to NPS if I die before 60?", a: "The entire corpus is paid to the nominee. No mandatory annuity purchase is required in this case." },
                { q: "Can I withdraw before 60?", a: "Partial withdrawal (up to 25%) is allowed after 3 years for education, marriage, or medical emergency." },
              ].map(({ q, a }, i) => (
                <div key={i} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="font-black text-slate-900 mb-2">{q}</h4>
                  <p className="text-sm font-medium text-slate-600">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
