import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Wallet,
  IndianRupee,
  Calendar,
  Zap,
  TrendingDown,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  ArrowRight
} from "lucide-react";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

const CHART_COLORS = ["#9333ea", "#ef4444"];

export default function PersonalLoanCalculator() {
  const seo = getSEOConfig('/calculators/personal-loan');
  
  const [principal, setPrincipal] = useState<number>(500000);
  const [rate, setRate] = useState<number>(12.5);
  const [tenure, setTenure] = useState<number>(3);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(75000);

  const calculations = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const tenureMonths = tenure * 12;
    
    if (principal <= 0 || monthlyRate <= 0 || tenureMonths <= 0) {
      return { emi: 0, totalPayment: 0, totalInterest: 0, incomeRatio: 0 };
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;
    const incomeRatio = monthlyIncome > 0 ? (emi / monthlyIncome) * 100 : 0;

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      incomeRatio: Math.round(incomeRatio * 100) / 100
    };
  }, [principal, rate, tenure, monthlyIncome]);

  const chartData = [
    { name: "Principal", value: principal },
    { name: "Interest", value: calculations.totalInterest },
  ];

  const fmt = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${n.toLocaleString("en-IN")}`;

  return (
    <>
      <MetaSEO
        title={seo?.title || "Personal Loan EMI Calculator 2025 | Calculate Interest & Eligibility"}
        description={seo?.description || "Calculate personal loan EMI with interest rates 10.5-24%. Check eligibility, EMI to income ratio and optimize your debt."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="Personal Loan Calculator"
        description="Plan your finances with instant EMI calculations and risk assessment."
        category="Loans & EMI"
        icon={<Wallet className="w-6 h-6" />}
        variant="violet"
        breadcrumbItems={[{ name: "Personal Loan Calculator" }]}
      />

      <CalcLayout
        variant="indigo"
        complianceFacts={[
          { title: "No Collateral", content: "Personal loans are unsecured, meaning you don't need to provide any asset as security to the bank." },
          { title: "FOIR Check", content: "Lenders check your Fixed Obligation to Income Ratio (FOIR). Ideally, it should be below 50%." },
          { title: "Credit Score", content: "Higher credit scores (750+) can help you negotiate 2-3% lower interest rates on personal loans." }
        ]}
        sidebar={
          <CalcGlassSidebar title="EMI Summary">
            <div className="space-y-1 pb-6 border-b border-white/20">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Monthly EMI</p>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {fmt(calculations.emi)}
              </p>
            </div>

            <div className="space-y-4 pt-6">
              <CalcResultRow label="Principal" value={fmt(principal)} />
              <CalcResultRow label="Total Interest" value={fmt(calculations.totalInterest)} variant="warning" />
              <CalcResultRow label="EMI/Income Ratio" value={`${calculations.incomeRatio}%`} variant={calculations.incomeRatio > 40 ? "warning" : "success"} />
              
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
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-purple-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Plan Debt Consolidation
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="Loan Details" icon={<IndianRupee className="w-5 h-5" />}>
            <CalcInputGroup 
              label="Loan Amount" 
              badgeValue={fmt(principal)}
            >
              <Slider 
                value={[principal]} 
                onValueChange={(v) => setPrincipal(v[0])} 
                max={5000000} 
                min={20000} 
                step={10000} 
              />
            </CalcInputGroup>

            <CalcInputGroup 
              label="Monthly Income (Take-home)" 
              badgeValue={fmt(monthlyIncome)}
            >
              <Slider 
                value={[monthlyIncome]} 
                onValueChange={(v) => setMonthlyIncome(v[0])} 
                max={500000} 
                min={15000} 
                step={5000} 
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
                  max={30} 
                  min={8} 
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
                  max={7} 
                  min={1} 
                  step={1} 
                />
              </CalcInputGroup>
            </div>
          </CalcInputCard>

          {calculations.incomeRatio > 50 && (
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex gap-4">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-black text-rose-900 mb-1">High EMI Exposure Alert</h4>
                <p className="text-xs font-bold text-rose-700 leading-relaxed">
                  Your EMI consumes {calculations.incomeRatio}% of your income. Banks generally prefer a ratio under 40% for approval. Consider increasing the tenure or reducing the loan amount.
                </p>
              </div>
            </div>
          )}
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <CheckCircle2 className="w-5 h-5" />,
              iconBg: "bg-purple-50 text-purple-600",
              title: "Quick Approval",
              desc: "Personal loans have minimal documentation requirements and can often be approved within 24-48 hours."
            },
            {
              icon: <TrendingDown className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Debt Consolidation",
              desc: "Lower your monthly payments by consolidating high-interest credit card debt into a single personal loan."
            },
            {
              icon: <Calculator className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Flexible Tenure",
              desc: "Choose a repayment period between 12 to 84 months that best fits your monthly cash flow."
            }
          ]}
          howItWorks={{
            title: "Eligibility Factors",
            description: "What banks look for when deciding your personal loan interest rates and amount.",
            steps: [
              { title: "Net Monthly Income", desc: "Your take-home salary after all tax deductions and existing EMIs." },
              { title: "Employer Category", desc: "Employees of MNCs and reputed private/government firms often get lower rates." },
              { title: "Debt-to-Income Ratio", desc: "Total monthly debt repayments should ideally not exceed 50% of your gross income." }
            ]
          }}
          faqs={[
            { q: "What is the processing fee?", a: "Processing fees usually range from 1% to 2.5% of the loan amount, deducted from the final disbursement." },
            { q: "Can I get a loan without a salary slip?", a: "Self-employed individuals can get loans based on their Income Tax Returns (ITR) for the last 2 years." },
            { q: "Are there any prepayment charges?", a: "Most banks charge 2-4% penalty for closing the loan before the tenure. Some NBFCs offer zero foreclosure after 12 months." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
