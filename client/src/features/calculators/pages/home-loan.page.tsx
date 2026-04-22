import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Building2,
  IndianRupee,
  Calendar,
  Percent,
  Zap,
  TrendingDown,
  PieChart as PieChartIcon,
  Home,
  CheckCircle2,
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

const CHART_COLORS = ["#6366f1", "#f43f5e"];

export default function HomeLoanCalculator() {
  const seo = getSEOConfig('/calculators/home-loan');
  
  const [propertyValue, setPropertyValue] = useState<number>(5000000);
  const [principal, setPrincipal] = useState<number>(4000000);
  const [rate, setRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(20);

  const calculations = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const tenureMonths = tenure * 12;
    
    if (principal <= 0 || monthlyRate <= 0 || tenureMonths <= 0) {
      return { emi: 0, totalPayment: 0, totalInterest: 0, ltvRatio: 0, schedule: [] };
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;
    const ltvRatio = (principal / propertyValue) * 100;

    let balance = principal;
    const schedule = [];
    for (let month = 1; month <= 12; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      balance -= principalPayment;
      schedule.push({
        month,
        emi: Math.round(emi),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.max(0, Math.round(balance))
      });
    }

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      ltvRatio: Math.round(ltvRatio * 100) / 100,
      schedule
    };
  }, [propertyValue, principal, rate, tenure]);

  const chartData = [
    { name: "Principal", value: principal },
    { name: "Interest", value: calculations.totalInterest },
  ];

  const fmt = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${n.toLocaleString("en-IN")}`;

  return (
    <>
      <MetaSEO
        title={seo?.title || "Home Loan EMI Calculator 2025 | Calculate Housing Loan EMI & Eligibility"}
        description={seo?.description || "Calculate home loan EMI with current interest rates 8.5-10.5%. Check eligibility, LTV ratio, tax benefits & compare 20+ banks."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="Home Loan Calculator"
        description="Plan your dream home with our high-precision EMI and eligibility engine."
        category="Loans & EMI"
        icon={<Building2 className="w-6 h-6" />}
        variant="indigo"
        breadcrumbItems={[{ name: "Home Loan Calculator" }]}
      />

      <CalcLayout
        variant="indigo"
        complianceFacts={[
          { title: "Tax Benefits", content: "Claim up to ₹2 Lakhs on interest (Sec 24b) and ₹1.5 Lakhs on principal (Sec 80C) annually." },
          { title: "Prepayment", content: "Floating rate home loans have zero prepayment penalties for individual borrowers as per RBI norms." },
          { title: "LTV Ratio", content: "Most banks finance 80-90% of the agreement value, depending on the loan amount." }
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
              <CalcResultRow label="Total Principal" value={fmt(principal)} />
              <CalcResultRow label="Total Interest" value={fmt(calculations.totalInterest)} variant="warning" />
              <CalcResultRow label="Total Payable" value={fmt(calculations.totalPayment)} variant="success" />
              
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
                <div className="flex justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Principal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Interest</span>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/services/home-loan">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Apply for Best Rates
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="Loan Configuration" icon={<Home className="w-5 h-5" />}>
            <CalcInputGroup 
              label="Property Value" 
              badgeValue={fmt(propertyValue)}
            >
              <Slider 
                value={[propertyValue]} 
                onValueChange={(v) => {
                  setPropertyValue(v[0]);
                  if (principal > v[0]) setPrincipal(v[0]);
                }} 
                max={100000000} 
                min={500000} 
                step={100000} 
              />
            </CalcInputGroup>

            <CalcInputGroup 
              label="Loan Principal" 
              badgeValue={fmt(principal)}
            >
              <Slider 
                value={[principal]} 
                onValueChange={(v) => setPrincipal(v[0])} 
                max={propertyValue} 
                min={100000} 
                step={50000} 
              />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] font-bold text-slate-400">LTV: {calculations.ltvRatio}%</span>
                <span className="text-[10px] font-bold text-indigo-600">Max: {fmt(propertyValue)}</span>
              </div>
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
                  min={5} 
                  step={0.1} 
                />
              </CalcInputGroup>

              <CalcInputGroup 
                label="Loan Tenure (Years)" 
                badgeValue={`${tenure} Yrs`}
              >
                <Slider 
                  value={[tenure]} 
                  onValueChange={(v) => setTenure(v[0])} 
                  max={30} 
                  min={1} 
                  step={1} 
                />
              </CalcInputGroup>
            </div>
          </CalcInputCard>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              First Year Repayment Schedule
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-400 uppercase tracking-widest font-bold">
                    <th className="pb-2 pl-4">Month</th>
                    <th className="pb-2">Principal</th>
                    <th className="pb-2">Interest</th>
                    <th className="pb-2 pr-4 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {calculations.schedule.map((row) => (
                    <tr key={row.month} className="bg-slate-50/50 rounded-xl overflow-hidden group hover:bg-slate-50 transition-colors">
                      <td className="py-4 pl-4 font-bold text-slate-400">Month {row.month}</td>
                      <td className="py-4 font-bold text-indigo-600">{fmt(row.principal)}</td>
                      <td className="py-4 font-bold text-rose-500">{fmt(row.interest)}</td>
                      <td className="py-4 pr-4 text-right font-black text-slate-700">{fmt(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="w-full py-3 mt-4 rounded-xl border border-dashed border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
              Download Full 20 Year Schedule
            </button>
          </div>
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <CheckCircle2 className="w-5 h-5" />,
              iconBg: "bg-blue-50 text-blue-600",
              title: "Instant Eligibility",
              desc: "See how much you can borrow based on property value and your repayment capacity."
            },
            {
              icon: <TrendingDown className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Tax Optimization",
              desc: "We factor in Section 24(b) and 80C benefits to show you the real effective cost of your loan."
            },
            {
              icon: <Calculator className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Principal Breakdown",
              desc: "Visualise exactly how your monthly EMI is split between interest and principal over the years."
            }
          ]}
          howItWorks={{
            title: "Home Loan EMI Formula",
            description: "Equated Monthly Installments are calculated using the reducing balance method.",
            steps: [
              { title: "EMI = [P x R x (1+R)^N] / [(1+R)^N-1]", desc: "Where P is Principal, R is monthly interest rate, and N is tenure in months." },
              { title: "Interest Component", desc: "Initially, a larger part of your EMI goes towards interest. This reverses as the principal reduces." },
              { title: "Reducing Balance", desc: "Interest is only charged on the outstanding principal at the end of each month." }
            ]
          }}
          faqs={[
            { q: "Can I prepay my home loan?", a: "Yes, you can prepay any amount at any time. For floating rate loans, banks cannot charge any penalty." },
            { q: "Does CIBIL score affect interest rates?", a: "Absolutely. A CIBIL score above 750 can help you secure the lowest possible interest rates (currently 8.5-8.7%)." },
            { q: "What is LTV in home loans?", a: "Loan-to-Value (LTV) is the percentage of property value financed by the bank. Typically it is 80% for loans above ₹30 Lakh." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
