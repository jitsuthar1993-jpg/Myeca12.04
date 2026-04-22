import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { 
  Calculator, IndianRupee, TrendingUp, Calendar,
  PieChart as PieChartIcon, Zap, Sparkles, CreditCard,
  ShieldCheck, ArrowRight, Wallet, Info, CheckCircle
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { calculateEMI } from "@/lib/tax-calculations";
import { EMIInputs } from "@/types/calculator";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

const CHART_COLORS = ["#2563eb", "#ef4444"]; // Blue for Principal, Red for Interest

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function EMICalculator() {
  const [inputs, setInputs] = useState<EMIInputs>({
    principal: 1000000,
    rate: 8.5,
    tenure: 20
  });

  const result = calculateEMI(inputs.principal, inputs.rate, inputs.tenure);
  const seo = getSEOConfig('/calculators/emi');

  const chartData = [
    { name: "Principal", value: inputs.principal },
    { name: "Interest", value: result.totalInterest },
  ];

  const interestPct = result.totalPayment > 0 ? Math.round((result.totalInterest / result.totalPayment) * 100) : 0;

  return (
    <>
      <MetaSEO
        title={seo?.title || "EMI Calculator 2025 | Home, Car & Personal Loan | MyeCA.in"}
        description={seo?.description || "Calculate monthly EMIs for any loan. See total interest payable and principal breakdown with interactive charts."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="EMI Calculator"
        description="Plan your loan repayments with precision. Calculate EMIs for Home, Car, or Personal loans instantly."
        category="Loan Planning"
        icon={<CreditCard className="w-6 h-6" />}
        variant="blue"
        breadcrumbItems={[{ name: "EMI Calculator" }]}
      />

      <CalcLayout
        variant="blue"
        complianceFacts={[
          { title: "Reducing Balance", content: "Most Indian banks use the reducing balance method, where interest is charged on the outstanding principal." },
          { title: "FOIR Limit", content: "Lenders typically prefer your total monthly EMIs to be within 40-50% of your net monthly income." },
          { title: "Prepayment Benefit", content: "Making early prepayments can significantly reduce your total interest burden and loan tenure." }
        ]}
        sidebar={
          <CalcGlassSidebar title="EMI Breakdown">
            <div className="space-y-1 pb-6 border-b border-white/20 text-center">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Monthly EMI</p>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={result.emi} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-4xl font-bold text-slate-900 tracking-tight tabular-nums"
                >
                  {formatCurrency(result.emi)}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="space-y-4 pt-6">
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Interest</p>
                  <p className="text-lg font-black text-red-500">{interestPct}%</p>
                </div>
              </div>

              <div className="space-y-3">
                <CalcResultRow label="Total Principal" value={formatCurrency(inputs.principal)} />
                <CalcResultRow label="Total Interest" value={formatCurrency(result.totalInterest)} variant="highlight" />
                <CalcResultRow label="Total Payment" value={formatCurrency(result.totalPayment)} variant="success" />
              </div>
            </div>

            <Link href="/services/loan-assistance">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Apply for Low-Interest Loan
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="Loan Configuration" icon={<ShieldCheck className="w-5 h-5" />}>
             <div className="grid grid-cols-3 gap-2 mb-8">
                {[
                  { label: 'Home Loan', p: 2500000, r: 8.5, t: 20 },
                  { label: 'Car Loan', p: 800000, r: 9.5, t: 7 },
                  { label: 'Personal', p: 500000, r: 12, t: 5 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setInputs({ principal: preset.p, rate: preset.r, tenure: preset.t })}
                    className={cn(
                      "py-3 px-1 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-tight",
                      inputs.principal === preset.p ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-100 bg-slate-50 text-slate-500 hover:border-blue-200"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
             </div>

             <CalcInputGroup label="Principal Amount" badgeValue={formatCurrency(inputs.principal)}>
                <div className="relative">
                  <Input 
                    type="number"
                    value={inputs.principal}
                    onChange={(e) => setInputs({...inputs, principal: Number(e.target.value)})}
                    className="h-14 pl-10 rounded-xl border-slate-100 bg-slate-50 font-bold text-lg focus:ring-2 focus:ring-blue-100"
                  />
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
             </CalcInputGroup>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Interest Rate (%)</label>
                  <div className="relative">
                    <Input 
                      type="number"
                      step="0.1"
                      value={inputs.rate}
                      onChange={(e) => setInputs({...inputs, rate: Number(e.target.value)})}
                      className="h-12 pl-10 rounded-xl border-slate-100 bg-slate-50 font-bold text-sm focus:ring-2 focus:ring-blue-100"
                    />
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tenure (Years)</label>
                  <div className="relative">
                    <Input 
                      type="number"
                      value={inputs.tenure}
                      onChange={(e) => setInputs({...inputs, tenure: Number(e.target.value)})}
                      className="h-12 pl-10 rounded-xl border-slate-100 bg-slate-50 font-bold text-sm focus:ring-2 focus:ring-blue-100"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
             </div>
          </CalcInputCard>

          <CalcInputCard title="Repayment Insight" icon={<Wallet className="w-5 h-5" />}>
             <div className="space-y-6">
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                    <PieChartIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Interest-to-Principal Ratio</p>
                    <p className="text-xs text-slate-500 font-medium">
                      You are paying <span className="text-red-500 font-bold">{interestPct}% interest</span> on your principal.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Loan Period</p>
                      <p className="text-lg font-black text-slate-900">{inputs.tenure * 12} Months</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Annual EMI Total</p>
                      <p className="text-lg font-black text-slate-900">{formatCurrency(result.emi * 12)}</p>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-50">
                   <Link href="/services/tax-planning">
                      <div className="flex items-center justify-between group cursor-pointer">
                         <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors">Claim Home Loan Tax Deductions (Section 24b)</span>
                         <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                   </Link>
                </div>
             </div>
          </CalcInputCard>
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <CheckCircle className="w-5 h-5" />,
              iconBg: "bg-blue-50 text-blue-600",
              title: "Prepayment Impact",
              desc: "Making a single extra EMI payment every year can reduce your 20-year home loan tenure by nearly 3 years."
            },
            {
              icon: <Zap className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Balance Transfer",
              desc: "If other banks offer significantly lower rates, consider a loan balance transfer to save on total interest."
            },
            {
              icon: <Sparkles className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Credit Score Role",
              desc: "A credit score above 750 often qualifies you for the 'best available' interest rates, saving lakhs in interest."
            }
          ]}
          howItWorks={{
            title: "EMI Amortization",
            description: "An EMI is split into principal and interest. In the early years, the interest component is high.",
            steps: [
              { title: "Principal Portion", desc: "The actual loan amount you borrowed that gets repaid every month." },
              { title: "Interest Portion", desc: "The cost of borrowing charged by the bank on the outstanding balance." },
              { title: "Total Payment", desc: "The sum of principal and interest paid over the entire tenure of the loan." }
            ]
          }}
          faqs={[
            { q: "What is the formula for EMI?", a: "EMI = [P x R x (1+R)^N]/[(1+R)^N-1], where P=Principal, R=Monthly Rate, N=Tenure in months." },
            { q: "Can I increase my EMI?", a: "Yes, increasing your EMI annually (Step-up) can help you pay off your loan much faster." },
            { q: "Are there hidden charges?", a: "Always check for processing fees, documentation charges, and prepayment penalties (mostly for fixed rates)." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
