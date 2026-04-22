import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  GraduationCap,
  IndianRupee,
  Calendar,
  Zap,
  TrendingDown,
  PieChart as PieChartIcon,
  CheckCircle2,
  Book,
  Clock,
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

const CHART_COLORS = ["#0d9488", "#ef4444"];

export default function EducationLoanCalculator() {
  const seo = getSEOConfig('/calculators/education-loan');
  
  const [principal, setPrincipal] = useState<number>(1000000);
  const [rate, setRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(10);
  const [moratoriumYears, setMoratoriumYears] = useState<number>(4);

  const calculations = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const tenureMonths = tenure * 12;
    const moratoriumMonths = moratoriumYears * 12;
    
    if (principal <= 0 || monthlyRate <= 0 || tenureMonths <= 0) {
      return { emi: 0, totalPayment: 0, totalInterest: 0, moratoriumInterest: 0 };
    }

    // Simple interest during moratorium
    const moratoriumInterest = principal * monthlyRate * moratoriumMonths;
    const principalAtEmiStart = principal + moratoriumInterest;

    const emi = (principalAtEmiStart * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    const totalPayment = emi * tenureMonths;
    const totalInterest = (totalPayment - principalAtEmiStart) + moratoriumInterest;

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment + (moratoriumMonths > 0 ? 0 : 0)), // interest is already in totalInterest
      totalInterest: Math.round(totalInterest),
      moratoriumInterest: Math.round(moratoriumInterest),
      taxBenefit: Math.round(totalInterest * 0.3) // assuming 30% tax bracket
    };
  }, [principal, rate, tenure, moratoriumYears]);

  const chartData = [
    { name: "Principal", value: principal },
    { name: "Interest", value: calculations.totalInterest },
  ];

  const fmt = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${n.toLocaleString("en-IN")}`;

  return (
    <>
      <MetaSEO
        title={seo?.title || "Education Loan EMI Calculator 2025 | Study Loan with 80E Benefits"}
        description={seo?.description || "Calculate education loan EMI with moratorium period & Section 80E tax benefits. Compare rates for domestic & abroad studies."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="Education Loan Calculator"
        description="Fund your academic journey with smart planning and Section 80E tax advantages."
        category="Loans & EMI"
        icon={<GraduationCap className="w-6 h-6" />}
        variant="emerald"
        breadcrumbItems={[{ name: "Education Loan Calculator" }]}
      />

      <CalcLayout
        variant="emerald"
        complianceFacts={[
          { title: "Section 80E", content: "The entire interest paid on an education loan is tax-deductible for 8 years without any upper limit." },
          { title: "Moratorium Period", content: "Enjoy a grace period during studies + 6-12 months before starting your EMI payments." },
          { title: "No Collateral", content: "Loans up to ₹7.5 Lakhs typically don't require any tangible collateral security." }
        ]}
        sidebar={
          <CalcGlassSidebar title="EMI Summary">
            <div className="space-y-1 pb-6 border-b border-white/20">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Post-Moratorium EMI</p>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {fmt(calculations.emi)}
              </p>
            </div>

            <div className="space-y-4 pt-6">
              <CalcResultRow label="Principal" value={fmt(principal)} />
              <CalcResultRow label="Total Interest" value={fmt(calculations.totalInterest)} variant="warning" />
              <CalcResultRow label="Est. Tax Saving" value={fmt(calculations.taxBenefit)} variant="success" />
              
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
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-teal-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Optimise 80E Tax Savings
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="Loan Configuration" icon={<IndianRupee className="w-5 h-5" />}>
            <CalcInputGroup 
              label="Loan Principal" 
              badgeValue={fmt(principal)}
            >
              <Slider 
                value={[principal]} 
                onValueChange={(v) => setPrincipal(v[0])} 
                max={15000000} 
                min={100000} 
                step={50000} 
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
                  max={15} 
                  min={7} 
                  step={0.1} 
                />
              </CalcInputGroup>

              <CalcInputGroup 
                label="Moratorium (Years)" 
                badgeValue={`${moratoriumYears} Yrs`}
              >
                <Slider 
                  value={[moratoriumYears]} 
                  onValueChange={(v) => setMoratoriumYears(v[0])} 
                  max={7} 
                  min={0} 
                  step={0.5} 
                />
              </CalcInputGroup>
            </div>

            <CalcInputGroup 
              label="Repayment Tenure (Post-Study)" 
              badgeValue={`${tenure} Yrs`}
            >
              <Slider 
                value={[tenure]} 
                onValueChange={(v) => setTenure(v[0])} 
                max={15} 
                min={1} 
                step={1} 
              />
            </CalcInputGroup>
          </CalcInputCard>

          <div className="bg-teal-50 border border-teal-100 p-6 rounded-[2rem] flex gap-4">
            <Book className="w-6 h-6 text-teal-600 shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-black text-teal-900 mb-1">Education Loan Tip</h4>
              <p className="text-xs font-bold text-teal-700 leading-relaxed">
                Paying just the simple interest during the moratorium period (study years) can save you up to {fmt(calculations.moratoriumInterest)} in future interest costs and prevents your principal from swelling.
              </p>
            </div>
          </div>
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <Clock className="w-5 h-5" />,
              iconBg: "bg-teal-50 text-teal-600",
              title: "Study Period Grace",
              desc: "Focus on your studies without worrying about repayments. EMIs typically start only after you finish the course."
            },
            {
              icon: <TrendingDown className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Unlimited Tax Deduction",
              desc: "Under Section 80E, there is no cap on the interest deduction, meaning you save more as you repay more interest."
            },
            {
              icon: <Calculator className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Global Education",
              desc: "Our calculator supports planning for both domestic Indian universities and international higher education."
            }
          ]}
          howItWorks={{
            title: "Moratorium Math Explained",
            description: "How interest is handled during the grace period of your education loan.",
            steps: [
              { title: "Simple Interest Period", desc: "During studies, banks usually charge simple interest on the disbursed amount." },
              { title: "Principal Capitalization", desc: "If unpaid, the moratorium interest is added to your principal before EMI starts." },
              { title: "Repayment Tenure", desc: "Once the course ends (+ 6-12 months), the final loan amount is divided into monthly EMIs." }
            ]
          }}
          faqs={[
            { q: "Who can claim Section 80E?", a: "The person who took the loan (parent or student) and is paying the interest can claim the deduction from their taxable income." },
            { q: "What is the maximum loan tenure?", a: "Most banks allow up to 15 years for repayment, excluding the study and grace period." },
            { q: "Does it cover living expenses?", a: "Yes, many abroad education loans cover tuition fees, travel, books, and living expenses (Hostel/Rent)." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
