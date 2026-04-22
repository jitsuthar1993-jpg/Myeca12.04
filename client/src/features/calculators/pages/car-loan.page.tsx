import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Car,
  IndianRupee,
  Calendar,
  Zap,
  TrendingDown,
  PieChart as PieChartIcon,
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

const CHART_COLORS = ["#f97316", "#ef4444"];

export default function CarLoanCalculator() {
  const seo = getSEOConfig('/calculators/car-loan');
  
  const [carPrice, setCarPrice] = useState<number>(1000000);
  const [downPayment, setDownPayment] = useState<number>(200000);
  const [rate, setRate] = useState<number>(9.5);
  const [tenure, setTenure] = useState<number>(5);
  const [carType, setCarType] = useState<"new" | "used">("new");

  const calculations = useMemo(() => {
    const principal = carPrice - downPayment;
    const monthlyRate = rate / 12 / 100;
    const tenureMonths = tenure * 12;
    
    if (principal <= 0 || monthlyRate <= 0 || tenureMonths <= 0) {
      return { emi: 0, totalPayment: 0, totalInterest: 0, loanAmount: 0, schedule: [] };
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;

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
      loanAmount: principal,
      schedule
    };
  }, [carPrice, downPayment, rate, tenure]);

  const chartData = [
    { name: "Principal", value: calculations.loanAmount },
    { name: "Interest", value: calculations.totalInterest },
  ];

  const fmt = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${n.toLocaleString("en-IN")}`;

  return (
    <>
      <MetaSEO
        title={seo?.title || "Car Loan EMI Calculator 2025 | New & Used Car Loan Calculator"}
        description={seo?.description || "Calculate car loan EMI for new cars (8.25-10.5%) & used cars (10-15%). Compare interest rates and down payment options."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="Car Loan Calculator"
        description="Drive your dream car home with a perfectly planned repayment strategy."
        category="Loans & EMI"
        icon={<Car className="w-6 h-6" />}
        variant="amber"
        breadcrumbItems={[{ name: "Car Loan Calculator" }]}
      />

      <CalcLayout
        variant="indigo"
        complianceFacts={[
          { title: "New vs Used", content: "New cars usually have lower rates (8.5-10%) compared to used cars (12-15%) due to depreciation risk." },
          { title: "Down Payment", content: "A higher down payment of 20-30% can significantly reduce your monthly EMI and total interest outgo." },
          { title: "Business Use", content: "Self-employed professionals can claim car loan interest and depreciation as tax-deductible business expenses." }
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
              <CalcResultRow label="Loan Amount" value={fmt(calculations.loanAmount)} />
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
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Principal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Interest</span>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/services/business-advisory">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Plan Business Vehicle Tax
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'new', label: 'New Car', desc: '8.5% - 10.5% p.a.', icon: <Car className="w-4 h-4" /> },
              { id: 'used', label: 'Used Car', desc: '11% - 15% p.a.', icon: <Car className="w-4 h-4 opacity-60" /> }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => {
                  setCarType(type.id as 'new' | 'used');
                  setRate(type.id === 'new' ? 9.5 : 12.5);
                }}
                className={cn(
                  "p-4 rounded-[2rem] border-2 text-left transition-all",
                  carType === type.id 
                    ? "bg-orange-50 border-orange-600 text-orange-900" 
                    : "bg-white border-slate-100 text-slate-500 hover:border-orange-200"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {type.icon}
                  <span className="text-xs font-black">{type.label}</span>
                </div>
                <p className="text-[10px] font-bold opacity-60">{type.desc}</p>
              </button>
            ))}
          </div>

          <CalcInputCard title="Price & Down Payment" icon={<IndianRupee className="w-5 h-5" />}>
            <CalcInputGroup 
              label="Car Price (On-Road)" 
              badgeValue={fmt(carPrice)}
            >
              <Slider 
                value={[carPrice]} 
                onValueChange={(v) => {
                  setCarPrice(v[0]);
                  if (downPayment > v[0]) setDownPayment(Math.round(v[0] * 0.2));
                }} 
                max={10000000} 
                min={200000} 
                step={50000} 
              />
            </CalcInputGroup>

            <CalcInputGroup 
              label="Down Payment" 
              badgeValue={fmt(downPayment)}
            >
              <Slider 
                value={[downPayment]} 
                onValueChange={(v) => setDownPayment(v[0])} 
                max={carPrice} 
                min={0} 
                step={10000} 
              />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] font-bold text-slate-400">Equity: {Math.round((downPayment / carPrice) * 100)}%</span>
                <span className="text-[10px] font-bold text-orange-600">Loan: {fmt(calculations.loanAmount)}</span>
              </div>
            </CalcInputGroup>
          </CalcInputCard>

          <CalcInputCard title="Rate & Tenure" icon={<Calendar className="w-5 h-5" />}>
            <div className="grid md:grid-cols-2 gap-8">
              <CalcInputGroup 
                label="Interest Rate (%)" 
                badgeValue={`${rate}%`}
              >
                <Slider 
                  value={[rate]} 
                  onValueChange={(v) => setRate(v[0])} 
                  max={20} 
                  min={5} 
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
          </CalcInputCard>
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <CheckCircle2 className="w-5 h-5" />,
              iconBg: "bg-orange-50 text-orange-600",
              title: "Pre-approved Rates",
              desc: "Compare current car loan rates from HDFC, SBI, ICICI and others to get the best deal."
            },
            {
              icon: <TrendingDown className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Depreciation Benefit",
              desc: "Learn how to use car depreciation to offset your professional or business income tax."
            },
            {
              icon: <Calculator className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Smart EMI Planning",
              desc: "Find the balance between a low EMI and a shorter tenure to save on total interest costs."
            }
          ]}
          howItWorks={{
            title: "Car Loan Checklist",
            description: "Essential things to consider before signing your vehicle finance agreement.",
            steps: [
              { title: "Check Foreclosure Charges", desc: "Many banks charge 2-5% for early closure. PSU banks often have zero foreclosure fees." },
              { title: "Processing Fees", desc: "Negotiate on processing fees which can range from ₹1,000 to 0.5% of the loan amount." },
              { title: "CIBIL Impact", desc: "A score above 750 can get you 'Star' interest rates which are usually 0.5% lower." }
            ]
          }}
          faqs={[
            { q: "Can I get a 100% car loan?", a: "Some banks offer 100% financing on the ex-showroom price for select profiles, but on-road funding usually requires a 10-20% down payment." },
            { q: "Is car insurance part of the loan?", a: "No, car insurance is a recurring annual expense and must be paid separately, though some lenders offer bundled insurance for the first year." },
            { q: "What documents are needed?", a: "KYC (Aadhar, PAN), Salary slips (3 months), and Bank statements (6 months) are the standard requirements." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
