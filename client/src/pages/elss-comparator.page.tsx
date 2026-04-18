import { useState, useMemo } from "react";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { m, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import Breadcrumb from "@/components/Breadcrumb";
import {
  TrendingUp, IndianRupee, Shield, Star, CheckCircle,
  Lock, Info, Sparkles, ShieldCheck, ArrowRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

const fmt = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${n.toLocaleString("en-IN")}`;

function calcSIP(monthly: number, years: number, rate: number) {
  const r = rate / 100 / 12;
  const n = years * 12;
  const corpus = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = monthly * n;
  const gains = corpus - invested;
  const ltcgExempt = 125000;
  const ltcgTaxable = Math.max(0, gains - ltcgExempt);
  const ltcgTax = ltcgTaxable * 0.125;
  const taxSaved80CPerYear = Math.min(monthly * 12, 150000) * 0.3;
  return { corpus, invested, gains, ltcgTax, netCorpus: corpus - ltcgTax, taxSavedTotal: taxSaved80CPerYear * years };
}

interface FundData {
  id: string; name: string; amc: string; category: string;
  returns: { "1Y": number; "3Y": number; "5Y": number; "10Y": number };
  expense: number; rating: number; minSIP: number; aum: string;
  tag?: string; tagColor?: string;
}

const FUNDS: FundData[] = [
  { id: "mirae", name: "Mirae Asset ELSS Tax Saver", amc: "Mirae Asset", category: "Flexi Cap", returns: { "1Y": 22.4, "3Y": 18.1, "5Y": 19.2, "10Y": 20.1 }, expense: 0.55, rating: 5, minSIP: 500, aum: "₹24,300 Cr", tag: "Top Rated", tagColor: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { id: "quant", name: "Quant ELSS Tax Saver", amc: "Quant MF", category: "Flexi Cap", returns: { "1Y": 31.2, "3Y": 28.4, "5Y": 31.1, "10Y": 21.3 }, expense: 0.57, rating: 5, minSIP: 500, aum: "₹10,200 Cr", tag: "High Return", tagColor: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { id: "axis", name: "Axis Long Term Equity", amc: "Axis MF", category: "Multi Cap", returns: { "1Y": 14.8, "3Y": 10.2, "5Y": 14.1, "10Y": 18.2 }, expense: 0.78, rating: 3, minSIP: 500, aum: "₹33,100 Cr" },
  { id: "sbi", name: "SBI Long Term Equity", amc: "SBI MF", category: "Flexi Cap", returns: { "1Y": 19.3, "3Y": 15.6, "5Y": 17.4, "10Y": 15.8 }, expense: 1.12, rating: 4, minSIP: 500, aum: "₹26,500 Cr", tag: "Popular", tagColor: "bg-violet-50 text-violet-600 border-violet-100" },
  { id: "hdfc", name: "HDFC ELSS Tax Saver", amc: "HDFC MF", category: "Large & Mid Cap", returns: { "1Y": 25.1, "3Y": 19.8, "5Y": 20.3, "10Y": 18.9 }, expense: 0.79, rating: 4, minSIP: 500, aum: "₹15,800 Cr" },
  { id: "dsp", name: "DSP Tax Saver", amc: "DSP MF", category: "Flexi Cap", returns: { "1Y": 18.7, "3Y": 16.3, "5Y": 18.1, "10Y": 16.4 }, expense: 0.88, rating: 4, minSIP: 500, aum: "₹14,200 Cr" },
];

const PERIOD_KEYS = ["1Y", "3Y", "5Y", "10Y"] as const;
const CHART_COLORS = ["#003087", "#10b981", "#f59e0b", "#ef4444"];

export default function ELSSCalculatorPage() {
  const seo = getSEOConfig("/calculators/sip");
  const [monthly, setMonthly] = useState(12500);
  const [years, setYears] = useState(10);
  const [period, setPeriod] = useState<typeof PERIOD_KEYS[number]>("3Y");
  const [selectedIds, setSelectedIds] = useState<string[]>(["mirae", "quant"]);

  const toggleFund = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const taxSavedPerYear = useMemo(() => Math.min(monthly * 12, 150000) * 0.3, [monthly]);
  const selectedFunds = useMemo(() => FUNDS.filter(f => selectedIds.includes(f.id)), [selectedIds]);

  const chartData = useMemo(() =>
    PERIOD_KEYS.map(p => ({
      period: p,
      ...Object.fromEntries(selectedFunds.map(f => [f.name.split(" ").slice(0, 2).join(" "), f.returns[p]]))
    })),
    [selectedFunds]
  );

  const projections = useMemo(() =>
    selectedFunds.map(f => ({
      fund: f,
      ...calcSIP(monthly, years, f.returns[period])
    })),
    [selectedFunds, monthly, years, period]
  );

  const CompTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-lg text-sm">
        <p className="text-slate-500 font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.fill }} className="font-black">{p.name}: {p.value}%</p>
        ))}
      </div>
    );
  };

  return (
    <>
      <MetaSEO
        title="ELSS Tax Saver Fund Comparator 2025 | Section 80C | MyeCA.in"
        description="Compare best ELSS mutual funds for Section 80C tax saving. Calculate SIP returns, tax savings, and find your ideal fund."
        keywords={["ELSS calculator", "best ELSS funds 2025", "tax saver mutual fund", "80C investment", "ELSS SIP returns"]}
        type="calculator"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Calculators", url: "/calculators" }, { name: "ELSS Comparator", url: "/elss-comparator" }]}
        faqPageData={[
          { question: "What is ELSS?", answer: "ELSS (Equity Linked Savings Scheme) is a mutual fund qualifying for tax deduction under Section 80C up to ₹1.5 lakh with only 3 years lock-in." },
          { question: "How much tax can I save with ELSS?", answer: "Investing ₹1.5L/year saves ₹46,800 tax (30% bracket + cess). Your effective investment cost becomes just ₹1,03,200." },
          { question: "ELSS vs PPF — which is better?", answer: "ELSS offers higher potential returns (~15-18%) vs PPF (7.1%) with shorter lock-in (3 vs 15 years). ELSS is market-linked while PPF is risk-free." },
        ]}
      />

      <div className="min-h-screen bg-slate-50/50 calculator-gradient-bg pb-24">
        <Breadcrumb items={[{ name: "Calculators", href: "/calculators" }, { name: "ELSS Comparator" }]} />

        {/* Hero */}
        <section className="relative pt-12 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] -z-10" />
          <div className="max-w-7xl mx-auto px-4 text-center">
            <m.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/50 text-emerald-600 text-[11px] font-black uppercase tracking-widest mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Section 80C · 3 Year Lock-in
            </m.div>
            <m.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              ELSS Fund <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Comparator</span>
            </m.h1>
            <m.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Compare top ELSS funds, calculate real SIP returns after LTCG tax, and find your ideal tax-saving investment.
            </m.p>

            {/* Quick Stats */}
            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                { icon: Shield, label: "80C Deduction", val: "Up to ₹1.5L/yr", c: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
                { icon: Lock, label: "Lock-in Period", val: "Just 3 Years", c: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                { icon: TrendingUp, label: "Avg 10Y CAGR", val: "~16-18%", c: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
                { icon: ShieldCheck, label: "Tax Saved/yr", val: fmt(taxSavedPerYear), c: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
              ].map(({ icon: Icon, label, val, c, bg }) => (
                <div key={label} className={`flex items-center gap-2.5 ${bg} border rounded-2xl px-5 py-3`}>
                  <Icon className={`w-4 h-4 ${c}`} />
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
                    <p className="text-slate-900 font-black text-sm">{val}</p>
                  </div>
                </div>
              ))}
            </m.div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 -mt-8 space-y-8">

          {/* SIP Calculator Controls */}
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-600" /> SIP Calculator
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Monthly SIP</label>
                  <span className="text-emerald-600 font-black text-xl">{fmt(monthly)}</span>
                </div>
                <Slider colorTheme="blue" value={[monthly]} onValueChange={([v]) => setMonthly(v)} min={500} max={50000} step={500} />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-bold"><span>₹500</span><span>₹50,000</span></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Investment Period</label>
                  <span className="text-indigo-600 font-black text-xl">{years} yrs</span>
                </div>
                <Slider colorTheme="blue" value={[years]} onValueChange={([v]) => setYears(v)} min={3} max={25} step={1} />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-bold"><span>3 yrs</span><span>25 yrs</span></div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Compare using:</span>
              {PERIOD_KEYS.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all border ${period === p ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200/50" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                  {p} Returns
                </button>
              ))}
            </div>
          </m.div>

          {/* Fund Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Select Funds to Compare</h2>
              <span className="text-sm font-bold text-slate-400">{selectedIds.length}/4 selected</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FUNDS.map((fund) => {
                const selected = selectedIds.includes(fund.id);
                return (
                  <m.div key={fund.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}
                    onClick={() => toggleFund(fund.id)}
                    className={`relative cursor-pointer rounded-[2rem] border-2 p-5 transition-all ${selected ? "bg-indigo-50/50 border-indigo-300 shadow-lg shadow-indigo-100/50" : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"}`}>

                    {selected && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle className="w-5 h-5 text-indigo-600" />
                      </div>
                    )}
                    {fund.tag && !selected && (
                      <div className="absolute top-4 right-4">
                        <Badge className={`${fund.tagColor} border text-[10px] font-black`}>{fund.tag}</Badge>
                      </div>
                    )}

                    <h4 className="text-slate-900 font-black text-sm leading-tight pr-16 mb-1">{fund.name}</h4>
                    <p className="text-slate-400 text-xs font-bold mb-4">{fund.amc} · {fund.category}</p>

                    <div className="grid grid-cols-4 gap-1.5 mb-4">
                      {PERIOD_KEYS.map(p => (
                        <div key={p} className={`rounded-xl p-2 text-center ${p === period ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50"}`}>
                          <p className="text-[9px] text-slate-400 font-black uppercase">{p}</p>
                          <p className={`text-xs font-black mt-0.5 ${fund.returns[p] >= 20 ? "text-emerald-600" : fund.returns[p] >= 15 ? "text-indigo-600" : "text-slate-600"}`}>
                            {fund.returns[p]}%
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= fund.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
                        ))}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Exp: {fund.expense}% · AUM: {fund.aum}</span>
                    </div>
                  </m.div>
                );
              })}
            </div>
          </div>

          {/* Comparison Results */}
          <AnimatePresence>
            {selectedFunds.length > 0 && (
              <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="grid md:grid-cols-2 gap-6">

                {/* Returns Chart */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7">
                  <h3 className="text-slate-900 font-black tracking-tight mb-5">Returns Comparison</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barSize={14}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="period" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} tickLine={false} />
                        <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} tickFormatter={v => `${v}%`} />
                        <Tooltip content={<CompTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }} />
                        {selectedFunds.map((f, i) => (
                          <Bar key={f.id} dataKey={f.name.split(" ").slice(0, 2).join(" ")} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* SIP Projections */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7">
                  <h3 className="text-slate-900 font-black tracking-tight mb-2">
                    SIP Projections
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-5">
                    {fmt(monthly)}/mo · {years} yrs · Based on {period} returns
                  </p>
                  <div className="space-y-4">
                    {projections.map(({ fund, corpus, invested, netCorpus, taxSavedTotal }, i) => (
                      <div key={fund.id} className="rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <p className="text-slate-900 font-black text-sm truncate">{fund.name}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[
                            { label: "Invested", val: fmt(invested), c: "text-slate-600" },
                            { label: "Corpus", val: fmt(corpus), c: "text-emerald-600" },
                            { label: "Tax Saved", val: fmt(taxSavedTotal), c: "text-indigo-600" },
                          ].map(({ label, val, c }) => (
                            <div key={label} className="bg-white rounded-xl p-2 border border-slate-100">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                              <p className={`text-xs font-black mt-0.5 ${c}`}>{val}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 bg-emerald-50 rounded-xl p-2 text-center border border-emerald-100">
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Net After LTCG Tax</p>
                          <p className="text-emerald-700 font-black text-sm">{fmt(netCorpus)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {/* ELSS vs Others */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">ELSS vs Other 80C Options</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">Projected corpus on ₹1.5L/year over 15 years</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "ELSS", ret: "~15% avg", corpus: "₹81.4 L", lockin: "3 yrs", best: true, c: "from-emerald-50 to-teal-50 border-emerald-200" },
                { name: "PPF", ret: "7.1% guaranteed", corpus: "₹40.6 L", lockin: "15 yrs", best: false, c: "from-blue-50 to-indigo-50 border-blue-200" },
                { name: "Tax-Saver FD", ret: "~6.5% avg", corpus: "₹37.0 L", lockin: "5 yrs", best: false, c: "from-amber-50 to-orange-50 border-amber-200" },
                { name: "NSC", ret: "7.7% avg", corpus: "₹43.2 L", lockin: "5 yrs", best: false, c: "from-violet-50 to-purple-50 border-violet-200" },
              ].map(({ name, ret, corpus, lockin, best, c }) => (
                <div key={name} className={`rounded-2xl bg-gradient-to-br ${c} border p-5`}>
                  {best && <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] font-black mb-3 hover:bg-emerald-100">Best Returns</Badge>}
                  <p className="text-slate-900 font-black text-xl">{name}</p>
                  <p className="text-slate-500 text-xs font-bold mt-1">{ret}</p>
                  <p className={`font-black text-2xl mt-3 ${best ? "text-emerald-700" : "text-slate-700"}`}>{corpus}</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">{lockin} lock-in</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-2">
              <Info className="w-6 h-6 text-emerald-500" /> Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { q: "What is the minimum SIP for ELSS?", a: "Most ELSS funds allow SIP from ₹500/month. Tax benefit is capped at ₹1.5L/year under 80C." },
                { q: "Are ELSS gains taxable?", a: "Yes. Gains above ₹1.25 lakh/year are taxed at 12.5% LTCG. Below ₹1.25L, gains are completely exempt." },
                { q: "Which is better: ELSS Lump Sum or SIP?", a: "SIP is generally better — it averages cost via rupee-cost averaging, reducing risk in volatile markets." },
                { q: "Can I stop my ELSS SIP before 3 years?", a: "You can stop future installments, but each SIP installment has its own 3-year lock-in from its investment date." },
              ].map(({ q, a }, i) => (
                <div key={i} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="font-black text-slate-900 mb-2">{q}</h4>
                  <p className="text-sm font-medium text-slate-600">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
