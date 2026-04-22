import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  PiggyBank,
  IndianRupee,
  Calendar,
  Zap,
  TrendingUp,
  PieChart as PieChartIcon,
  CheckCircle2,
  ShieldCheck,
  History,
  Calculator,
  ArrowRight
} from "lucide-react";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { calculateFD } from "@/lib/tax-calculations";
import { cn } from "@/lib/utils";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

const CHART_COLORS = ["#2563eb", "#ef4444"];

export default function FDCalculator() {
  const seo = getSEOConfig('/calculators/fd');
  
  const [principal, setPrincipal] = useState<number>(100000);
  const [rate, setRate] = useState<number>(7);
  const [tenure, setTenure] = useState<number>(5);
  const [compoundingFrequency, setCompoundingFrequency] = useState<number>(4);

  const calculations = useMemo(() => {
    return calculateFD(principal, rate, tenure, compoundingFrequency);
  }, [principal, rate, tenure, compoundingFrequency]);

  const chartData = [
    { name: "Principal", value: principal },
    { name: "Interest", value: calculations.totalInterest },
  ];

  const fmt = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${n.toLocaleString("en-IN")}`;

  return (
    <>
      <MetaSEO
        title={seo?.title || "FD Calculator 2025 | Fixed Deposit Maturity Amount | MyeCA.in"}
        description={seo?.description || "Calculate your FD maturity amount and interest earned. Compare latest bank FD rates and plan your savings."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="FD Calculator"
        description="Secure your future with guaranteed returns and precise maturity projections."
        category="Savings & Deposits"
        icon={<PiggyBank className="w-6 h-6" />}
        variant="blue"
        breadcrumbItems={[{ name: "Fixed Deposit Calculator" }]}
      />

      <CalcLayout
        variant="blue"
        complianceFacts={[
          { title: "DICGC Insured", content: "Your deposits are insured up to ₹5 Lakhs per bank by the Deposit Insurance and Credit Guarantee Corporation." },
          { title: "Taxable Interest", content: "FD interest is taxable. Banks deduct 10% TDS if interest exceeds ₹40,000 (₹50,000 for seniors)." },
          { title: "Laddering Strategy", content: "Split your investment across multiple tenures to maintain liquidity and hedge against rate fluctuations." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Maturity Summary">
            <div className="space-y-1 pb-6 border-b border-white/20">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Maturity Amount</p>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {fmt(calculations.maturityAmount)}
              </p>
            </div>

            <div className="space-y-4 pt-6">
              <CalcResultRow label="Total Principal" value={fmt(principal)} />
              <CalcResultRow label="Interest Earned" value={fmt(calculations.totalInterest)} variant="success" />
              <CalcResultRow label="Effective Yield" value={`${calculations.effectiveRate}%`} />
              
              <div className="pt-6 border-t border-white/20">
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <Link href="/services/advisory">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Plan Tax-Efficient Savings
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="Deposit Details" icon={<IndianRupee className="w-5 h-5" />}>
            <CalcInputGroup 
              label="Investment Amount" 
              badgeValue={fmt(principal)}
            >
              <Slider 
                value={[principal]} 
                onValueChange={(v) => setPrincipal(v[0])} 
                max={10000000} 
                min={10000} 
                step={10000} 
              />
            </CalcInputGroup>

            <div className="grid md:grid-cols-2 gap-8">
              <CalcInputGroup 
                label="Interest Rate (%)" 
                badgeValue={`${rate}%`}
              >
                <Slider 
                  value={[rate]} 
                  onValueChange={(v) => setRate(v[0])} 
                  max={12} 
                  min={3} 
                  step={0.1} 
                />
              </CalcInputGroup>

              <CalcInputGroup 
                label="Tenure (Years)" 
                badgeValue={`${tenure} Yrs`}
              >
                <Slider 
                  value={[tenure]} 
                  onValueChange={(v) => setTenure(v[0])} 
                  max={10} 
                  min={1} 
                  step={1} 
                />
              </CalcInputGroup>
            </div>

            <div className="pt-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Compounding Frequency</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 1, label: 'Annually' },
                  { value: 2, label: 'Half-yearly' },
                  { value: 4, label: 'Quarterly' },
                  { value: 12, label: 'Monthly' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setCompoundingFrequency(opt.value)}
                    className={cn(
                      "py-3 px-2 rounded-2xl border-2 font-bold text-xs transition-all",
                      compoundingFrequency === opt.value
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-100 bg-slate-50/50 text-slate-400 hover:border-blue-200"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </CalcInputCard>

          <div className="bg-white rounded-[2rem] border border-slate-100 p-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar className="w-3 h-3 text-blue-600" /> Projected Growth
            </h4>
            <div className="space-y-2">
              {calculations.yearlyBreakdown.slice(0, 5).map((year: any) => (
                <div key={year.year} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-500">Year {year.year}</span>
                  <span className="text-xs font-black text-slate-700 tabular-nums">{fmt(year.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              iconBg: "bg-blue-50 text-blue-600",
              title: "Fixed Returns",
              desc: "Unlike market-linked investments, your returns are locked in at the time of opening the FD."
            },
            {
              icon: <History className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Compounding Magic",
              desc: "By choosing quarterly compounding, you earn interest on your interest, boosting your effective yield."
            },
            {
              icon: <Calculator className="w-5 h-5" />,
              iconBg: "bg-indigo-50 text-indigo-600",
              title: "Easy Liquidity",
              desc: "Most banks allow premature withdrawal with a small penalty, making it a good emergency fund."
            }
          ]}
          howItWorks={{
            title: "Maturity Math",
            description: "How we calculate your fixed deposit returns using the compounding formula.",
            steps: [
              { title: "Principal Deposit", desc: "The initial lump sum amount you invest with the bank." },
              { title: "Compounding Effect", desc: "Interest is calculated on the principal + previously earned interest." },
              { title: "Maturity Payout", desc: "The final amount paid back to you at the end of the selected tenure." }
            ]
          }}
          faqs={[
            { q: "Is FD interest tax-free?", a: "No, FD interest is added to your total income and taxed as per your slab rate." },
            { q: "Can I open an FD for 1 month?", a: "Yes, the minimum tenure for a fixed deposit is usually 7 days." },
            { q: "What is a Tax-Saving FD?", a: "It's a special FD with a 5-year lock-in that gives you a deduction under Section 80C." }
          ]}
        />
      </CalcLayout>
    </>
  );
}