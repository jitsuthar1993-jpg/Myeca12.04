import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Sparkles,
  Zap,
  ChevronRight,
  Calculator,
  TrendingDown,
  Wallet,
  GraduationCap,
  Car,
  Home,
  ShieldCheck,
  Banknote,
  PieChart as PieChartIcon,
  CheckCircle2,
  TrendingUp,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

type LoanType = 'home' | 'personal' | 'car' | 'education';

const CHART_COLORS = ["#3b82f6", "#ef4444"]; 

export default function UnifiedLoanCalculatorPage() {
  const [location] = useLocation();
  
  const getInitialTab = (): LoanType => {
    if (location.includes('car-loan')) return 'car';
    if (location.includes('personal-loan')) return 'personal';
    if (location.includes('education-loan')) return 'education';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState<LoanType>(getInitialTab());

  useEffect(() => {
    if (location.includes('car-loan')) setActiveTab('car');
    else if (location.includes('personal-loan')) setActiveTab('personal');
    else if (location.includes('education-loan')) setActiveTab('education');
    else if (location.includes('home-loan')) setActiveTab('home');
  }, [location]);

  const [principal, setPrincipal] = useState<number>(2500000);
  const [rate, setRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(20);
  const [tenureType, setTenureType] = useState<"years"|"months">("years");

  const [moratoriumPeriod, setMoratoriumPeriod] = useState<number>(4);
  const [hasMoratorium, setHasMoratorium] = useState<boolean>(true);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(75000);

  useEffect(() => {
    if (activeTab === 'home') { setPrincipal(2500000); setRate(8.5); setTenure(20); }
    if (activeTab === 'personal') { setPrincipal(500000); setRate(14.5); setTenure(3); }
    if (activeTab === 'car') { setPrincipal(800000); setRate(9.5); setTenure(5); }
    if (activeTab === 'education') { setPrincipal(1500000); setRate(10.5); setTenure(10); }
  }, [activeTab]);

  const loanConfig = {
    home: { title: "Home Loan", icon: Home, maxPrincipal: 50000000, maxTenure: 30, variant: "blue" as const },
    personal: { title: "Personal Loan", icon: Wallet, maxPrincipal: 5000000, maxTenure: 7, variant: "indigo" as const },
    car: { title: "Car Loan", icon: Car, maxPrincipal: 10000000, maxTenure: 10, variant: "amber" as const },
    education: { title: "Education Loan", icon: GraduationCap, maxPrincipal: 20000000, maxTenure: 15, variant: "violet" as const }
  };

  const calculateLoan = () => {
    const monthlyRate = rate / 12 / 100;
    const months = tenureType === "years" ? tenure * 12 : tenure;
    
    if (principal <= 0 || monthlyRate <= 0 || months <= 0) {
      return { emi: 0, totalPayment: 0, totalInterest: 0, moratoriumInterest: 0, emiToIncomeRatio: 0, schedule: [] };
    }

    let principalForEMI = principal;
    let moratoriumInterest = 0;

    if (activeTab === 'education' && hasMoratorium) {
      const mMonths = moratoriumPeriod * 12;
      principalForEMI = principal + (principal * monthlyRate * mMonths);
      moratoriumInterest = principalForEMI - principal;
    }

    const emi = (principalForEMI * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                (Math.pow(1 + monthlyRate, months) - 1);
    
    const totalPayment = emi * months;
    const totalInterest = (totalPayment - principalForEMI) + moratoriumInterest;

    const emiToIncomeRatio = activeTab === 'personal' ? (monthlyIncome > 0 ? (emi / monthlyIncome) * 100 : 0) : 0;

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      moratoriumInterest: Math.round(moratoriumInterest),
      emiToIncomeRatio: Math.round(emiToIncomeRatio * 100) / 100,
      schedule: []
    };
  };

  const result = calculateLoan();
  const activePath = `/calculators/${activeTab === 'home' ? 'home-loan' : activeTab === 'car' ? 'car-loan' : activeTab === 'personal' ? 'personal-loan' : 'education-loan'}`;
  const seo = getSEOConfig(activePath);

  const chartData = [
    { name: "Principal", value: principal },
    { name: "Total Interest", value: result.totalInterest },
  ];

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const principalPct = result.totalPayment > 0 ? Math.round((principal / (principal + result.totalInterest)) * 100) : 0;
  const interestPct = result.totalPayment > 0 ? Math.round((result.totalInterest / (principal + result.totalInterest)) * 100) : 0;

  const ActiveIcon = loanConfig[activeTab].icon;

  return (
    <>
      <MetaSEO 
        title={seo?.title || "Loan EMI Calculator 2025 | MyeCA.in"}
        description={seo?.description || "Professional EMI planning with real-time affordability analysis and tax benefit insights."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title={`${loanConfig[activeTab].title} Calculator`}
        description="Professional EMI planning with real-time affordability analysis and tax benefit insights."
        category="Planning Tools"
        icon={<ActiveIcon className="w-6 h-6" />}
        variant={loanConfig[activeTab].variant}
        breadcrumbItems={[{ name: "Loan EMI Calculator" }]}
      />

      <CalcLayout
        variant={loanConfig[activeTab].variant}
        complianceFacts={[
          { title: "Reducing Balance", content: "Most Indian banks use the reducing balance method, where interest is calculated on the outstanding loan amount." },
          { title: "Tax Deductions", content: "Claim up to ₹2 Lakhs on home loan interest (Sec 24b) and unlimited on education loan interest (Sec 80E)." },
          { title: "Credit Score", content: "A credit score above 750 can reduce your interest rates by up to 0.5%, saving lakhs in long-term interest." }
        ]}
        sidebar={
          <CalcGlassSidebar title="EMI Breakdown">
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
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Monthly EMI</p>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={result.emi} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums"
                  >
                    {fmt(result.emi)}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <CalcResultRow label="Total Principal" value={fmt(principal)} />
              <CalcResultRow label="Total Interest" value={fmt(result.totalInterest)} variant="warning" />
              <CalcResultRow label="Total Payment" value={fmt(result.totalPayment)} variant="highlight" className="pt-4 border-t border-white/20" />
              
              {activeTab === 'personal' && (
                <div className="mt-4 pt-4 border-t border-white/20">
                   <CalcResultRow label="EMI/Income Ratio" value={`${result.emiToIncomeRatio}%`} variant={result.emiToIncomeRatio > 40 ? "warning" : "success"} />
                   <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">Banks prefer &lt; 40% for personal loans.</p>
                </div>
              )}
            </div>

            <Link href="/services/advisory">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Plan with CA Advisory
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard>
            <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
              {(Object.keys(loanConfig) as LoanType[]).map((type) => {
                const isSelected = activeTab === type;
                const Icon = loanConfig[type].icon;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={cn(
                      "flex-1 py-3 px-1 flex flex-col items-center gap-1.5 transition-all rounded-xl",
                      isSelected 
                        ? "bg-white shadow-sm text-slate-900" 
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{loanConfig[type].title.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>

            <CalcInputGroup 
              label="Loan Amount" 
              badgeValue={fmt(principal)}
            >
              <Slider 
                value={[principal]} 
                onValueChange={(v) => setPrincipal(v[0])} 
                max={loanConfig[activeTab].maxPrincipal} 
                min={10000} 
                step={10000} 
              />
            </CalcInputGroup>

            <CalcInputGroup 
              label="Annual Interest Rate" 
              badgeValue={`${rate}%`}
            >
              <Slider 
                value={[rate]} 
                onValueChange={(v) => setRate(v[0])} 
                max={30} 
                min={1} 
                step={0.1} 
              />
            </CalcInputGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <CalcInputGroup 
                label={`Tenure (${tenureType})`} 
                badgeValue={`${tenure} ${tenureType === 'years' ? 'Yrs' : 'Mos'}`}
              >
                <Slider 
                  value={[tenure]} 
                  onValueChange={(v) => setTenure(v[0])} 
                  max={tenureType === "years" ? loanConfig[activeTab].maxTenure : loanConfig[activeTab].maxTenure * 12} 
                  min={1} 
                  step={1} 
                />
              </CalcInputGroup>

              {activeTab === 'personal' && (
                <CalcInputGroup 
                  label="Monthly Income" 
                  badgeValue={fmt(monthlyIncome)}
                >
                  <Slider 
                    value={[monthlyIncome]} 
                    onValueChange={(v) => setMonthlyIncome(v[0])} 
                    max={500000} 
                    min={10000} 
                    step={5000} 
                  />
                </CalcInputGroup>
              )}
            </div>

            {activeTab === 'education' && (
              <div className="pt-6 border-t border-slate-50 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Moratorium Period</p>
                    <p className="text-[10px] text-slate-400 font-medium">Interest calculation during study period</p>
                  </div>
                  <div 
                    onClick={() => setHasMoratorium(!hasMoratorium)}
                    className={cn(
                      "w-10 h-5 rounded-full cursor-pointer transition-colors relative",
                      hasMoratorium ? "bg-indigo-600" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all",
                      hasMoratorium ? "left-5.5" : "left-0.5"
                    )} />
                  </div>
                </div>
                
                {hasMoratorium && (
                  <CalcInputGroup 
                    label="Moratorium Duration (Years)" 
                    badgeValue={`${moratoriumPeriod} Yrs`}
                  >
                    <Slider 
                      value={[moratoriumPeriod]} 
                      onValueChange={(v) => setMoratoriumPeriod(v[0])} 
                      max={7} 
                      min={1} 
                      step={0.5} 
                    />
                  </CalcInputGroup>
                )}
              </div>
            )}
          </CalcInputCard>
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <CheckCircle2 className="w-5 h-5" />,
              iconBg: "bg-blue-50 text-blue-600",
              title: "Unified Planning",
              desc: "Compare Home, Car, Personal, and Education loans side-by-side to understand your total repayment burden."
            },
            {
              icon: <TrendingUp className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Tax Advantage",
              desc: "Identify loans with tax-deductible interest (Home and Education) to lower your effective cost of borrowing."
            },
            {
              icon: <TrendingDown className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Reducing Balance",
              desc: "Our engine uses the standard bank method ensuring you get accurate, market-standard EMI estimates."
            }
          ]}
          howItWorks={{
            title: "EMI Amortization Facts",
            description: "An Equated Monthly Installment (EMI) consists of both principal and interest components.",
            steps: [
              { title: "Interest Heavy Start", desc: "In the initial years, a larger part of your EMI goes towards interest, not principal." },
              { title: "Principal Payoff", desc: "As the principal reduces over time, the interest component decreases and principal repayment accelerates." },
              { title: "Tenure Impact", desc: "Increasing tenure reduces monthly EMI but significantly increases the total interest you pay to the bank." }
            ]
          }}
          faqs={[
            { q: "What is the 50/30/20 rule for loans?", a: "Financial experts suggest keeping total debt EMIs below 30-40% of your net monthly income for financial stability." },
            { q: "Are personal loans more expensive?", a: "Yes, personal loans are unsecured and typically have interest rates between 12-20%, much higher than home or car loans." },
            { q: "What is an Education Loan moratorium?", a: "It's a 'holiday' from repayment during the study period. However, interest still accrues and is added to the principal." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
