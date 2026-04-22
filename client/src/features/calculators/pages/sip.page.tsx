import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { calculateEnhancedSIP, formatCurrency } from "@/lib/enhanced-calculator-utils";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import {
  TrendingUp,
  Zap,
  ShieldCheck,
  IndianRupee,
  Calendar,
  Percent,
  Sparkles,
  PieChart as PieChartIcon,
  Info,
  TrendingDown,
  LineChart,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

export default function SIPCalculator() {
  const seo = getSEOConfig('/calculators/sip');
  const [monthlyAmount, setMonthlyAmount] = useState<number>(5000);
  const [years, setYears] = useState<number>(10);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);

  const result = useMemo(() => calculateEnhancedSIP(monthlyAmount || 0, years || 0, expectedReturn || 0), [monthlyAmount, years, expectedReturn]);

  const chartData = result.yearlyBreakdown.map((d) => ({
    year: d.year,
    investment: d.investment,
    returns: d.interestEarned,
    total: d.value,
  }));

  const fmt = (n: number) => formatCurrency(n);

  return (
    <>
      <MetaSEO
        title={seo?.title || "SIP Calculator 2025 | Mutual Fund Returns | MyeCA.in"}
        description={seo?.description || "Plan your wealth with our professional SIP calculator. Interactive compounding growth visualization for mutual fund SIP investments."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="SIP Calculator"
        description="Plan your long-term wealth creation with our professional Systematic Investment Plan calculator."
        category="Investment Tools"
        icon={<TrendingUp className="w-6 h-6" />}
        variant="blue"
        breadcrumbItems={[{ name: "SIP Calculator" }]}
      />

      <CalcLayout
        variant="blue"
        complianceFacts={[
          { title: "Power of Compounding", content: "Starting your SIP just 5 years earlier can nearly double your final wealth due to the exponential nature of compounding." },
          { title: "LTCG Taxation", content: "Gains above ₹1.25 Lakhs per year from equity mutual funds are taxed at 12.5% (as per Union Budget 2024)." },
          { title: "Rupee Cost Averaging", content: "SIPs automatically reduce your average acquisition cost by buying more units when prices are low and fewer when prices are high." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Projection Summary">
            <div className="space-y-4">
              <CalcResultRow label="Total Invested" value={fmt(result.totalInvestment)} />
              <CalcResultRow label="Estimated Gains" value={fmt(result.wealthGain)} variant="success" />
              <CalcResultRow label="Maturity Value" value={fmt(result.maturityValue)} variant="highlight" className="pt-4 border-t border-white/20" />
              
              <div className="bg-white/30 rounded-xl p-4 mt-6 border border-white/20">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Growth Analysis</p>
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-slate-400">Wealth Multiple</span>
                    <span className="text-xs font-bold text-blue-600">{(result.maturityValue / result.totalInvestment).toFixed(2)}x</span>
                  </div>
                  <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (result.wealthGain / result.maturityValue) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 text-center italic">Returns make up {Math.round((result.wealthGain / result.maturityValue) * 100)}% of your final wealth</p>
                </div>
              </div>

              <Link href="/services/wealth-management">
                <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 mt-4 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Optimize Portfolio Now
                </button>
              </Link>
            </div>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="SIP Parameters" icon={<PieChartIcon className="w-5 h-5" />}>
            <CalcInputGroup 
              label="Monthly Investment" 
              badgeValue={fmt(monthlyAmount)}
            >
              <Slider 
                value={[monthlyAmount]} 
                onValueChange={(v) => setMonthlyAmount(v[0])} 
                max={100000} 
                min={500} 
                step={500} 
              />
            </CalcInputGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <CalcInputGroup 
                label="Investment Period" 
                badgeValue={`${years} Years`}
              >
                <Slider 
                  value={[years]} 
                  onValueChange={(v) => setYears(v[0])} 
                  max={40} 
                  min={1} 
                  step={1} 
                />
              </CalcInputGroup>

              <CalcInputGroup 
                label="Expected Return Rate" 
                badgeValue={`${expectedReturn}% p.a.`}
              >
                <Slider 
                  value={[expectedReturn]} 
                  onValueChange={(v) => setExpectedReturn(v[0])} 
                  max={30} 
                  min={1} 
                  step={0.5} 
                />
              </CalcInputGroup>
            </div>
          </CalcInputCard>

          <CalcInputCard title="Growth Projection" icon={<LineChart className="w-5 h-5" />}>
            <div className="h-[300px] w-full mt-4 -ml-4 pr-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(val) => `Yr ${val}`}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(val) => {
                      if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
                      if (val >= 100000) return `${(val / 100000).toFixed(0)}L`;
                      return `${val / 1000}k`;
                    }}
                    width={52}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xl">
                            <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Year {label}</p>
                            <p className="text-sm font-bold text-slate-900 flex justify-between gap-8">
                              Total: <span className="text-blue-600">{fmt(payload[0].value as number)}</span>
                            </p>
                            <p className="text-sm font-bold text-slate-900 flex justify-between gap-8">
                              Invested: <span className="text-slate-500">{fmt(payload[1].value as number)}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" animationDuration={1200} />
                  <Area type="monotone" dataKey="investment" stroke="#64748b" strokeWidth={2} fillOpacity={0} animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CalcInputCard>
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <Sparkles className="w-5 h-5" />,
              iconBg: "bg-blue-50 text-blue-600",
              title: "Power of Compounding",
              desc: "In a SIP, you earn interest on your interest, leading to exponential wealth creation over long periods."
            },
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Risk Mitigation",
              desc: "SIPs follow the strategy of Rupee Cost Averaging, helping you navigate market volatility effectively."
            },
            {
              icon: <TrendingUp className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Financial Discipline",
              desc: "Automated monthly deductions ensure you save before you spend, building a consistent investment habit."
            }
          ]}
          howItWorks={{
            title: "The 15-15-15 Rule",
            description: "A famous thumb rule for SIP investors to reach the ₹1 Crore milestone.",
            steps: [
              { title: "Invest ₹15,000", desc: "Start with a monthly SIP of ₹15,000 in a diversified equity mutual fund." },
              { title: "For 15 Years", desc: "Remain invested consistently without withdrawing for a period of 15 years." },
              { title: "At 15% Return", desc: "Assuming a 15% annual return, your final corpus will be approximately ₹1 Crore." }
            ]
          }}
          faqs={[
            { q: "Can I increase my SIP amount?", a: "Yes, you can use a 'Step-up SIP' feature to increase your investment as your income grows." },
            { q: "Are SIP returns guaranteed?", a: "No, mutual fund returns depend on market performance. However, equity SIPs historically deliver 12-15% over 10+ years." },
            { q: "Is there a penalty for missing a SIP?", a: "Fund houses don't charge penalties, but your bank might charge an 'ECS bounce' fee for insufficient funds." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
