import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PiggyBank, TrendingUp, IndianRupee, Clock, ArrowRight,
  ShieldCheck, Zap, Sparkles, AlertCircle, BarChart3,
  Calendar, PieChart, Info, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "@/components/charts/lightweight-recharts";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { calculateWithdrawalPlan, WithdrawalFrequency } from "@/lib/withdrawal-planner";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function WithdrawalPlannerPage() {
  const [principal, setPrincipal] = useState<number>(1000000);
  const [annualRate, setAnnualRate] = useState<number>(7.0);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(10000);
  const [frequency, setFrequency] = useState<WithdrawalFrequency>("monthly");
  const [years, setYears] = useState<number>(10);

  const result = useMemo(() => {
    return calculateWithdrawalPlan(principal, annualRate, withdrawalAmount, frequency, years);
  }, [principal, annualRate, withdrawalAmount, frequency, years]);

  const seo = getSEOConfig('/calculators/withdrawal-planner');

  const chartData = useMemo(() => {
    // Show only 12 data points for clarity in the small sidebar chart
    const step = Math.max(1, Math.floor(result.schedule.length / 12));
    return result.schedule.filter((_, i) => i % step === 0).map((entry) => ({
      name: `P${entry.period}`,
      'Withdrawal': entry.withdrawal,
      'Interest': entry.interestAccrued,
    }));
  }, [result.schedule]);

  return (
    <>
      <MetaSEO
        title={seo?.title || "Fixed Income Withdrawal Planner | SWP Calculator | MyeCA.in"}
        description={seo?.description || "Plan your systematic withdrawals from fixed income investments. Calculate how long your corpus will last with interest accrual."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero
        title="Withdrawal Planner"
        description="Strategize periodic withdrawals from your corpus while accounting for interest growth and depletion risks."
        category="Retirement Planning"
        icon={<PiggyBank className="w-6 h-6" />}
        variant="indigo"
        breadcrumbItems={[{ name: "Withdrawal Planner" }]}
        compact
      />

      <CalcLayout
        variant="indigo"
        complianceFacts={[
          { title: "Scenario only", content: "This projection uses a constant nominal return and is not a guarantee of corpus longevity." },
          { title: "Calculation timing", content: "Nominal periodic interest is applied before each scheduled withdrawal." },
          { title: "Frequency", content: "More frequent withdrawals (e.g., monthly vs yearly) slightly reduce the total interest earned due to lower average principal." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Plan Summary">
            <div className="space-y-1 pb-6 border-b border-white/20">
              <p className="type-meta font-normal uppercase tracking-widest text-slate-400">Ending Balance</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={result.endingBalance}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "text-4xl font-normal tracking-tight tabular-nums",
                    result.depleted ? "text-red-600" : "text-slate-900"
                  )}
                >
                  {formatCurrency(result.endingBalance)}
                </motion.p>
              </AnimatePresence>
              {result.depleted && (
                <div className="type-meta mt-2 inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2 py-0.5 font-normal uppercase tracking-widest text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  Corpus Depleted in Year {Math.ceil(result.depletionPeriod / (frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1))}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-6">
              <CalcResultRow label="Total Withdrawn" value={formatCurrency(result.totalWithdrawn)} variant="success" />
              <CalcResultRow label="Total Interest Earned" value={formatCurrency(result.totalInterestAccrued)} />

              <div className="h-44 mt-5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="Interest" fill="#818cf8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Withdrawal" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Link href="/services/investment-advisory">
              <button className="w-full py-4 rounded-2xl bg-blue-700 text-white font-normal text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Get Custom SWP Plan
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="Corpus Details" icon={<IndianRupee className="w-5 h-5" />}>
             <CalcInputGroup label="Starting Principal" badgeValue={formatCurrency(principal)}>
                <div className="relative">
                  <Input
                    aria-label="Starting Principal"
                    type="number"
                    value={principal}
                    min="0"
                    onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value) || 0))}
                    className="h-14 pl-10 rounded-xl border-slate-100 bg-slate-50 font-normal text-lg focus:ring-2 focus:ring-indigo-100"
                  />
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {[500000, 1000000, 2500000, 5000000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setPrincipal(amt)}
                      className={cn(
                        "type-meta rounded-lg border px-3 py-1.5 font-normal transition-all",
                        principal === amt ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-100 bg-white text-slate-500 hover:border-indigo-200"
                      )}
                    >
                      ₹{amt/100000}L
                    </button>
                  ))}
                </div>
             </CalcInputGroup>

             <CalcInputGroup label="Annual Return (%)" badgeValue={`${annualRate}%`}>
                <div className="relative">
                  <Input
                    aria-label="Annual Return"
                    type="number"
                    step="0.1"
                    value={annualRate}
                    min="0"
                    onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value) || 0))}
                    className="h-14 pl-10 rounded-xl border-slate-100 bg-slate-50 font-normal text-lg focus:ring-2 focus:ring-indigo-100"
                  />
                  <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
             </CalcInputGroup>
          </CalcInputCard>

          <CalcInputCard title="Withdrawal Strategy" icon={<Clock className="w-5 h-5" />}>
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="space-y-2">
                  <label className="type-meta px-1 font-normal uppercase tracking-widest text-slate-400">Frequency</label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as WithdrawalFrequency)}>
                    <SelectTrigger aria-label="Frequency" className="h-12 rounded-xl border-slate-100 bg-slate-50 font-normal text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="type-meta px-1 font-normal uppercase tracking-widest text-slate-400">Duration (Years)</label>
                  <Input
                    aria-label="Duration in Years"
                    type="number"
                    value={years}
                    min="1"
                    step="1"
                    onChange={(e) => setYears(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                    className="h-12 rounded-xl border-slate-100 bg-slate-50 font-normal text-sm focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
             </div>

             <CalcInputGroup label="Withdrawal per Period" badgeValue={formatCurrency(withdrawalAmount)}>
                <div className="relative">
                  <Input
                    aria-label="Withdrawal per Period"
                    type="number"
                    value={withdrawalAmount}
                    min="0"
                    onChange={(e) => setWithdrawalAmount(Math.max(0, Number(e.target.value) || 0))}
                    className="h-14 pl-10 rounded-xl border-slate-100 bg-slate-50 font-normal text-lg focus:ring-2 focus:ring-indigo-100"
                  />
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
             </CalcInputGroup>

             <div className="mt-8 p-5 rounded-2xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <p className="type-meta font-normal uppercase tracking-widest text-amber-700">Sustainability Insight</p>
                </div>
                <p className="type-support font-normal text-amber-800">
                  {withdrawalAmount * (frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1) > principal * (annualRate/100)
                    ? "Your withdrawal rate exceeds the interest earned. Your principal will deplete over time."
                    : "This scenario funds the selected withdrawals under the constant-return assumptions; actual results can differ."}
                </p>
             </div>
          </CalcInputCard>
        </div>

        <CalculatorMiniBlog
          features={[
            {
              icon: <PiggyBank className="w-5 h-5" />,
              iconBg: "bg-indigo-50 text-indigo-600",
              title: "Systematic Withdrawal",
              desc: "SWP allows you to withdraw a fixed amount from your investment, providing a steady stream of income while the rest stays invested."
            },
            {
              icon: <Zap className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Tax Efficiency",
              desc: "Tax treatment depends on the investment, holding period, and applicable law. This projection excludes tax and exit loads."
            },
            {
              icon: <TrendingUp className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Corpus Longevity",
              desc: "Actual returns vary over time. Sequence-of-returns risk and inflation can shorten corpus longevity."
            }
          ]}
          howItWorks={{
            title: "SWP Planning Guide",
            description: "Planning your withdrawals requires balancing income needs with corpus preservation.",
            steps: [
              { title: "Define Income Needs", desc: "Calculate your monthly or annual requirements for living expenses and lifestyle." },
              { title: "Estimate Returns", desc: "Use conservative return estimates (e.g., 6-8%) based on your asset allocation." },
              { title: "Monitor Depletion", desc: "Regularly check if your withdrawals are eating into your principal faster than expected." }
            ]
          }}
          faqs={[
            { q: "Is SWP better than FD interest?", a: "They have different return, liquidity, market, and tax characteristics. Compare the current rules and product costs for your situation." },
            { q: "Can I stop my withdrawal plan?", a: "Yes, SWPs are completely flexible. You can stop, increase, or decrease the withdrawal amount at any time." },
            { q: "Is there a guaranteed safe withdrawal rate?", a: "No. Longevity depends on actual return sequence, inflation, fees, taxes, and changing withdrawals." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
