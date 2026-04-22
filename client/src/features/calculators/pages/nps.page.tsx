import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  PiggyBank, TrendingUp, Target,
  Calendar, IndianRupee,
  ShieldCheck, Sparkles, Zap, Shield,
  BadgeCent,
  CheckCircle2,
  Clock,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

const fmt = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${n.toLocaleString("en-IN")}`;

function calcNPS(monthly: number, years: number, rate: number, annuity: number, age: number) {
  const r = rate / 100 / 12;
  const n = years * 12;
  const corpus = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const lumpSum = corpus * (1 - annuity / 100);
  const annuityCorpus = corpus * (annuity / 100);
  const monthlyPension = (annuityCorpus * 0.06) / 12; // Conservative 6% annuity rate
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

export default function NPSCalculatorPage() {
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

  const seo = getSEOConfig("/calculators/nps");

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-xl p-3 shadow-xl text-sm">
          <p className="text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-widest">Age {payload[0]?.payload?.year}</p>
          <p className="text-indigo-600 font-bold">{fmt(payload[0]?.value ?? 0)}</p>
          {payload[1] && <p className="text-emerald-500 font-bold text-xs">{fmt(payload[1]?.value ?? 0)} Invested</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <MetaSEO
        title={seo?.title || "NPS Calculator 2025 | Pension Corpus & Tax Savings | MyeCA.in"}
        description={seo?.description || "Calculate your NPS retirement corpus, monthly pension, and tax savings under Section 80CCD. Plan your retirement with India's National Pension System."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="NPS Calculator"
        description="Plan your retirement corpus and monthly pension with government-regulated tax benefits."
        category="Retirement"
        icon={<Target className="w-6 h-6" />}
        variant="indigo"
        breadcrumbItems={[{ name: "NPS Calculator" }]}
      />

      <CalcLayout
        variant="indigo"
        complianceFacts={[
          { title: "80CCD(1B) Benefit", content: "NPS offers an exclusive additional deduction of ₹50,000 per year over and above the ₹1.5 Lakh limit of Section 80C." },
          { title: "Withdrawal Rules", content: "At age 60, you can withdraw 60% of the corpus tax-free as a lump sum. The remaining 40% must be used for an annuity." },
          { title: "Annuity Requirement", content: "PFRDA mandates a minimum 40% annuity purchase at maturity. However, you can choose to invest up to 100% in annuity for higher pension." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Pension Summary">
            <div className="space-y-1 pb-6 border-b border-white/20">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Total Retirement Corpus</p>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={result.corpus} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-4xl font-bold text-slate-900 tracking-tight tabular-nums"
                >
                  {fmt(result.corpus)}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="space-y-4 pt-6">
              <CalcResultRow label="Monthly Pension" value={fmt(result.monthlyPension)} variant="success" />
              <CalcResultRow label="Lump Sum (Tax-Free)" value={fmt(result.lumpSum)} />
              <CalcResultRow label="Annuity Fund" value={fmt(result.annuityCorpus)} />
              
              <div className="pt-6 border-t border-white/20 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tax Savings Estimate</p>
                <div className="flex justify-between items-center bg-white/40 p-3 rounded-xl border border-white/60">
                  <span className="text-xs font-bold text-indigo-700">Total Tax Saved / Yr</span>
                  <span className="text-sm font-bold text-indigo-900">{fmt(result.taxSaved80C + result.taxSaved80CCD)}</span>
                </div>
              </div>
            </div>

            <Link href="/services/tax-planning">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Optimise Retirement with CA
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="Retirement Inputs" icon={<Calendar className="w-5 h-5" />}>
            <CalcInputGroup 
              label="Current Age" 
              badgeValue={`${age} Years`}
            >
              <Slider 
                value={[age]} 
                onValueChange={(v) => setAge(v[0])} 
                max={55} 
                min={18} 
                step={1} 
              />
            </CalcInputGroup>

            <CalcInputGroup 
              label="Monthly Contribution" 
              badgeValue={fmt(monthly)}
            >
              <Slider 
                value={[monthly]} 
                onValueChange={(v) => setMonthly(v[0])} 
                max={100000} 
                min={500} 
                step={500} 
              />
            </CalcInputGroup>

            <div className="grid md:grid-cols-2 gap-8">
              <CalcInputGroup 
                label="Expected Returns (%)" 
                badgeValue={`${rate}%`}
              >
                <Slider 
                  value={[rate]} 
                  onValueChange={(v) => setRate(v[0])} 
                  max={15} 
                  min={6} 
                  step={0.5} 
                />
              </CalcInputGroup>

              <CalcInputGroup 
                label="Annuity Allocation (%)" 
                badgeValue={`${annuity}%`}
              >
                <Slider 
                  value={[annuity]} 
                  onValueChange={(v) => setAnnuity(v[0])} 
                  max={100} 
                  min={40} 
                  step={5} 
                />
              </CalcInputGroup>
            </div>
          </CalcInputCard>

          <CalcInputCard title="Corpus Projection" icon={<TrendingUp className="w-5 h-5" />}>
            <div className="h-[280px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`}
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="corpus" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCorpus)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CalcInputCard>
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              iconBg: "bg-indigo-50 text-indigo-600",
              title: "Government Regulated",
              desc: "NPS is regulated by the PFRDA, ensuring transparency and professional fund management for your retirement."
            },
            {
              icon: <Zap className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Tier-1 vs Tier-2",
              desc: "Tier-1 is mandatory for tax benefits, while Tier-2 acts as a voluntary savings account with no lock-in period."
            },
            {
              icon: <Calculator className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Low Cost Structure",
              desc: "NPS is one of the world's lowest-cost pension products, maximizing your long-term wealth creation."
            }
          ]}
          howItWorks={{
            title: "Tax Benefits & Sections",
            description: "Understanding how NPS helps you save on taxes today while building for tomorrow.",
            steps: [
              { title: "Sec 80CCD(1)", desc: "Invest up to 10% of your salary (basic + DA) within the overall ₹1.5L limit of Section 80C." },
              { title: "Sec 80CCD(1B)", desc: "Exclusive additional deduction of ₹50,000, allowing a total deduction of up to ₹2 Lakhs." },
              { title: "Sec 80CCD(2)", desc: "Employer's contribution up to 10-14% of salary is also tax-deductible for the employee." }
            ]
          }}
          faqs={[
            { q: "Is the monthly pension tax-free?", a: "No, the annuity (pension) received is taxable as per your income tax slab in the year of receipt." },
            { q: "Can I choose my fund manager?", a: "Yes, you can choose from various Pension Fund Managers (PFMs) and change them once a year." },
            { q: "What is 'Auto Choice'?", a: "Auto Choice is a lifecycle fund where the equity allocation decreases automatically as you get older." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
