import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "@/components/charts/lightweight-recharts";
import { Slider } from "@/components/ui/slider";
import { Link, useLocation } from "wouter";
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
  ArrowRight,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

const DEFAULT_SIP_INPUTS = { monthlyAmount: 5000, years: 10, expectedReturn: 12 } as const;

export default function SIPCalculator() {
  const [location] = useLocation();
  const isEnhancedRoute = location.split("?")[0] === "/calculators/sip-enhanced";
  const seoPath = isEnhancedRoute ? "/calculators/sip-enhanced" : "/calculators/sip";
  const seo = getSEOConfig(seoPath);
  const [monthlyAmount, setMonthlyAmount] = useState<number>(DEFAULT_SIP_INPUTS.monthlyAmount);
  const [years, setYears] = useState<number>(DEFAULT_SIP_INPUTS.years);
  const [expectedReturn, setExpectedReturn] = useState<number>(DEFAULT_SIP_INPUTS.expectedReturn);

  const result = useMemo(() => calculateEnhancedSIP(monthlyAmount, years, expectedReturn), [monthlyAmount, years, expectedReturn]);

  const chartData = result.yearlyBreakdown.map((d) => ({
    year: d.year,
    investment: d.investment,
    returns: d.interestEarned,
    total: d.value,
  }));

  const fmt = (n: number) => formatCurrency(n);
  const wealthMultiple = result.totalInvestment > 0 ? result.maturityValue / result.totalInvestment : 0;
  const returnsPercent = result.maturityValue > 0 ? Math.round((result.wealthGain / result.maturityValue) * 100) : 0;
  const resetCalculator = () => {
    setMonthlyAmount(DEFAULT_SIP_INPUTS.monthlyAmount);
    setYears(DEFAULT_SIP_INPUTS.years);
    setExpectedReturn(DEFAULT_SIP_INPUTS.expectedReturn);
  };

  return (
    <>
      <MetaSEO
        title={seo?.title || "SIP Calculator 2026 | Mutual Fund Returns | MyeCA.in"}
        description={seo?.description || "Plan your wealth with our professional SIP calculator. Interactive compounding growth visualization for mutual fund SIP investments."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero
        title={isEnhancedRoute ? "Enhanced SIP Calculator" : "SIP Calculator"}
        description={
          isEnhancedRoute
            ? "Plan mutual fund SIP returns with compounding projections, year-wise growth and clear investment limitations."
            : "Plan your long-term wealth creation with our professional Systematic Investment Plan calculator."
        }
        category="Investment Tools"
        icon={<TrendingUp className="w-6 h-6" />}
        variant="blue"
        breadcrumbItems={[{ name: isEnhancedRoute ? "Enhanced SIP Calculator" : "SIP Calculator" }]}
        compact
      />

      <CalcLayout
        variant="blue"
        complianceFacts={[
          { title: "Compounding Assumption", content: "Starting earlier gives contributions more time to compound, but actual returns will vary with market performance." },
          { title: "Tax Treatment", content: "Tax depends on the fund type, holding period, realized gains, and rules applicable when units are redeemed." },
          { title: "Regular Investing", content: "A fixed monthly contribution buys different numbers of units as market prices change; it does not remove investment risk." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Projection Summary">
            <div className="space-y-4">
              <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                Total invested {fmt(result.totalInvestment)}. Estimated gains {fmt(result.wealthGain)}. Projected value {fmt(result.maturityValue)}.
              </div>
              <CalcResultRow label="Total Invested" value={fmt(result.totalInvestment)} />
              <CalcResultRow label="Estimated Gains" value={fmt(result.wealthGain)} variant="success" />
              <CalcResultRow label="Maturity Value" value={fmt(result.maturityValue)} variant="highlight" className="pt-4 border-t border-white/20" />

              <div className="bg-white/30 rounded-xl p-4 mt-6 border border-white/20">
                <p className="type-meta mb-2 font-normal uppercase tracking-widest text-slate-500">Growth Analysis</p>
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                    <span className="type-meta font-normal text-slate-400">Wealth Multiple</span>
                    <span className="text-xs font-normal text-blue-600">{wealthMultiple.toFixed(2)}x</span>
                  </div>
                  <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, returnsPercent))}%` }}
                      role="progressbar"
                      aria-label="Returns share of projected value"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={returnsPercent}
                    />
                  </div>
                  <p className="type-meta text-center italic text-slate-400">Estimated gains make up {returnsPercent}% of the projected value</p>
                </div>
              </div>

              <Link href="/services/wealth-management" className="w-full py-4 rounded-2xl bg-blue-700 text-white font-normal text-sm hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 mt-4 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Review Investment Assumptions
              </Link>
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-relaxed text-slate-600">
                This projection assumes a constant annual return and contributions at the beginning of each month. Returns are estimates, not guaranteed; taxes, fees, exit loads, inflation, and market volatility are not modeled.
              </div>
            </div>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="SIP Parameters" icon={<PieChartIcon className="w-5 h-5" />}>
            <div className="flex justify-end">
              <button type="button" onClick={resetCalculator} aria-label="Reset calculator" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
            <CalcInputGroup
              label="Monthly Investment"
              badgeValue={fmt(monthlyAmount)}
            >
              <Slider
                thumbAriaLabel="Monthly investment"
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
                  thumbAriaLabel="Investment period"
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
                  thumbAriaLabel="Expected annual return"
                  value={[expectedReturn]}
                  onValueChange={(v) => setExpectedReturn(v[0])}
                  max={30}
                  min={0}
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
                            <p className="type-meta mb-2 font-normal uppercase tracking-widest text-slate-400">Year {label}</p>
                            <p className="text-sm font-normal text-slate-900 flex justify-between gap-8">
                              Total: <span className="text-blue-600">{fmt(payload[0].value as number)}</span>
                            </p>
                            <p className="text-sm font-normal text-slate-900 flex justify-between gap-8">
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
            title: "Sample SIP Assumption",
            description: "A simple scenario for testing how monthly investment, time, and assumed return interact.",
            steps: [
              { title: "Invest ₹15,000", desc: "Start with a monthly SIP of ₹15,000 in a diversified equity mutual fund." },
              { title: "For 15 Years", desc: "Remain invested consistently without withdrawing for a period of 15 years." },
              { title: "At 15% Return", desc: "Assuming a 15% annual return, your final corpus will be approximately ₹1 Crore." }
            ]
          }}
          faqs={[
            { q: "Can I increase my SIP amount?", a: "Yes, you can use a 'Step-up SIP' feature to increase your investment as your income grows." },
            { q: "Are SIP returns guaranteed?", a: "No, mutual fund returns depend on market performance. Review fund factsheets, risk level, and time horizon before investing." },
            { q: "Is there a penalty for missing a SIP?", a: "Fund houses don't charge penalties, but your bank might charge an 'ECS bounce' fee for insufficient funds." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
