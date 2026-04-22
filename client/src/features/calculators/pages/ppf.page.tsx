import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { calculateEnhancedPPF, formatCurrency, CURRENT_RATES } from "@/lib/enhanced-calculator-utils";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Shield,
  TrendingUp,
  Zap,
  ShieldCheck,
  Sparkles,
  Banknote,
  Receipt,
  CheckCircle2,
  Info,
  ArrowRight,
  Calculator,
  IndianRupee
} from "lucide-react";
import { cn } from "@/lib/utils";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

const CHART_COLORS = ["#e2e8f0", "#10b981"];

export default function PPFCalculatorPage() {
  const [annualInvestment, setAnnualInvestment] = useState<number>(150000);
  const [years, setYears] = useState<number>(15);

  const result = useMemo(() => calculateEnhancedPPF(annualInvestment, years, CURRENT_RATES.PPF), [annualInvestment, years]);

  const seo = getSEOConfig('/calculators/ppf');

  const chartData = [
    { name: "Invested", value: result.totalInvestment },
    { name: "Interest", value: result.interestEarned },
  ];

  const fmt = (n: number) => formatCurrency(n);

  const interestPct = result.maturityValue > 0 ? Math.round((result.interestEarned / result.maturityValue) * 100) : 0;

  return (
    <>
      <MetaSEO
        title={seo?.title || "PPF Calculator 2025 | Maturity & Returns | MyeCA.in"}
        description={seo?.description || "Calculate PPF returns with current 7.1% interest rate. Professional planning with 80C tax benefits and EEE status insights."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="PPF Calculator"
        description="Calculate Public Provident Fund returns with EEE tax benefits and government-backed safety."
        category="Tax Saving"
        icon={<Shield className="w-6 h-6" />}
        variant="emerald"
        breadcrumbItems={[{ name: "PPF Calculator" }]}
      />

      <CalcLayout
        variant="emerald"
        complianceFacts={[
          { title: "EEE Status", content: "PPF is one of the few instruments that is 'Exempt-Exempt-Exempt'—meaning investment, interest, and maturity are all tax-free." },
          { title: "Annual Limit", content: "The maximum investment allowed in a PPF account is ₹1.5 Lakhs per financial year to qualify for Section 80C benefits." },
          { title: "Lock-in Period", content: "PPF has a mandatory 15-year lock-in period, but offers partial withdrawals from the 7th year and loan facilities from the 3rd year." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Maturity Summary">
            <div className="flex items-center gap-6 pb-6 border-b border-white/20">
              <div className="w-24 h-24 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={32} outerRadius={46} paddingAngle={4} dataKey="value" stroke="none">
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-emerald-600">{interestPct}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Maturity Amount</p>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={result.maturityValue} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums"
                  >
                    {fmt(result.maturityValue)}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <CalcResultRow label="Total Invested" value={fmt(result.totalInvestment)} />
              <CalcResultRow label="Total Interest" value={fmt(result.interestEarned)} variant="success" />
              <CalcResultRow 
                label="EEE Benefit" 
                value="100% Tax Free" 
                variant="highlight" 
                className="pt-4 border-t border-white/20" 
              />
            </div>

            <Link href="/services/tax-filing">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200 mt-4 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Plan 80C with CA
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="Investment Details" icon={<Banknote className="w-5 h-5" />}>
            <CalcInputGroup 
              label="Annual Investment" 
              badgeValue={fmt(annualInvestment)}
            >
              <Slider 
                value={[annualInvestment]} 
                onValueChange={(v) => setAnnualInvestment(v[0])} 
                max={150000} 
                min={500} 
                step={500} 
              />
            </CalcInputGroup>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { amount: 50000, label: "Beginner", description: "33% of 80C" },
                { amount: 100000, label: "Growth", description: "67% of 80C" },
                { amount: 150000, label: "Max 80C", description: "Full ₹1.5L" },
              ].map((s) => (
                <button
                  key={s.amount}
                  onClick={() => setAnnualInvestment(s.amount)}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all text-left",
                    annualInvestment === s.amount
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/10"
                      : "border-slate-100 bg-slate-50 text-slate-600 hover:border-emerald-200"
                  )}
                >
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-widest mb-1",
                    annualInvestment === s.amount ? "text-emerald-100" : "text-slate-400"
                  )}>
                    {s.label}
                  </p>
                  <p className="text-xs font-bold">{s.description}</p>
                </button>
              ))}
            </div>

            <CalcInputGroup 
              label="Investment Tenure" 
              badgeValue={`${years} Years`}
            >
              <Slider 
                value={[years]} 
                onValueChange={(v) => setYears(v[0])} 
                max={50} 
                min={15} 
                step={5} 
              />
            </CalcInputGroup>
          </CalcInputCard>

          <CalcInputCard title="EEE Tax Advantages" icon={<Sparkles className="w-5 h-5" />}>
            <div className="space-y-4">
              {[
                { label: "Contribution", desc: "Deductible under Section 80C up to ₹1.5L", icon: <IndianRupee className="w-4 h-4" /> },
                { label: "Interest", desc: "Compounded annually and 100% Tax-Free", icon: <TrendingUp className="w-4 h-4" /> },
                { label: "Withdrawal", desc: "Final maturity amount is 100% Tax-Free", icon: <CheckCircle2 className="w-4 h-4" /> },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CalcInputCard>
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Sovereign Guarantee",
              desc: "PPF is backed by the Government of India, making it one of the safest long-term investment options available."
            },
            {
              icon: <Zap className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "EEE Tax Status",
              desc: "Exempt-Exempt-Exempt: Your investment, interest earned, and final maturity amount are all completely tax-free."
            },
            {
              icon: <Calculator className="w-5 h-5" />,
              iconBg: "bg-blue-50 text-blue-600",
              title: "Loan Facility",
              desc: "You can take a loan against your PPF balance from the 3rd to the 6th financial year at a very nominal interest rate."
            }
          ]}
          howItWorks={{
            title: "Maturity & Extensions",
            description: "Understanding the timeline of your PPF account.",
            steps: [
              { title: "15 Year Lock-in", desc: "The account matures after 15 full financial years. Partial withdrawals are allowed from the 7th year." },
              { title: "5 Year Extensions", desc: "After maturity, you can extend the account in blocks of 5 years indefinitely." },
              { title: "Minimum Deposit", desc: "You must deposit at least ₹500 every year to keep the account active and avoid penalties." }
            ]
          }}
          faqs={[
            { q: "What is the current PPF interest rate?", a: "The current interest rate is 7.1% per annum (compounded annually), as set by the government." },
            { q: "Can I have multiple PPF accounts?", a: "No, an individual can have only one PPF account in their name across all banks and post offices." },
            { q: "Is there a maximum limit?", a: "Yes, the maximum deposit allowed is ₹1.5 Lakhs per financial year per individual." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
