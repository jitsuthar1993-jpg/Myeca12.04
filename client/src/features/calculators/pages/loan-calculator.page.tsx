import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Calculator, 
  Home, 
  Car, 
  GraduationCap, 
  Wallet, 
  TrendingUp, 
  PieChart, 
  Info, 
  Download, 
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  ChevronRight,
  ChevronLeft,
  Banknote,
  Percent,
  CalendarDays,
  IndianRupee,
  Receipt,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { m, AnimatePresence } from "framer-motion";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import Breadcrumb from "@/components/Breadcrumb";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type LoanType = 'home' | 'personal' | 'car' | 'education';

export default function UnifiedLoanCalculatorPage() {
  const [location] = useLocation();
  
  const getInitialTab = (): LoanType => {
    if (location.includes('car-loan')) return 'car';
    if (location.includes('personal-loan')) return 'personal';
    if (location.includes('education-loan')) return 'education';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState<LoanType>(getInitialTab());

  // Sync tab with URL changes
  useEffect(() => {
    if (location.includes('car-loan')) setActiveTab('car');
    else if (location.includes('personal-loan')) setActiveTab('personal');
    else if (location.includes('education-loan')) setActiveTab('education');
    else if (location.includes('home-loan')) setActiveTab('home');
  }, [location]);
  
  // Common State
  const [loanAmount, setLoanAmount] = useState<string>("2500000");
  const [interestRate, setInterestRate] = useState<string>("8.5");
  const [tenure, setTenure] = useState<string>("20");
  const [tenureType, setTenureType] = useState<string>("years");

  // Specific States
  const [moratoriumPeriod, setMoratoriumPeriod] = useState<string>("4");
  const [hasMoratorium, setHasMoratorium] = useState<boolean>(true);
  const [monthlyIncomeInput, setMonthlyIncomeInput] = useState<string>("75000");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const loanConfig = {
    home: {
      title: "Home Loan",
      icon: Home,
      color: "blue",
      gradient: "from-blue-600 to-indigo-700",
      description: "Housing loan EMI & tax benefits.",
      defaultAmount: "2500000",
      defaultRate: "8.5",
      defaultTenure: "20"
    },
    personal: {
      title: "Personal Loan",
      icon: Wallet,
      color: "purple",
      gradient: "from-purple-600 to-pink-700",
      description: "Unsecured loan & eligibility.",
      defaultAmount: "500000",
      defaultRate: "14.5",
      defaultTenure: "3"
    },
    car: {
      title: "Car Loan",
      icon: Car,
      color: "orange",
      gradient: "from-orange-500 to-red-600",
      description: "New & used vehicle finance.",
      defaultAmount: "800000",
      defaultRate: "9.5",
      defaultTenure: "5"
    },
    education: {
      title: "Education Loan",
      icon: GraduationCap,
      color: "emerald",
      gradient: "from-emerald-600 to-teal-700",
      description: "Study loans with 80E benefits.",
      defaultAmount: "1500000",
      defaultRate: "10.5",
      defaultTenure: "10"
    }
  };

  const calculations = useMemo(() => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) || 0;
    const monthlyRate = rate / 12 / 100;
    const months = tenureType === "years" ? (parseFloat(tenure) || 0) * 12 : (parseFloat(tenure) || 0);

    if (principal <= 0 || rate <= 0 || months <= 0) {
      return { emi: 0, totalInterest: 0, totalPayment: 0 };
    }

    let principalForEMI = principal;
    let moratoriumInterest = 0;

    if (activeTab === 'education' && hasMoratorium) {
      const mMonths = (parseFloat(moratoriumPeriod) || 0) * 12;
      principalForEMI = principal * Math.pow(1 + monthlyRate, mMonths);
      moratoriumInterest = principalForEMI - principal;
    }

    const emi = (principalForEMI * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                (Math.pow(1 + monthlyRate, months) - 1);
    
    const totalPayment = emi * months;
    const totalInterest = (totalPayment - principalForEMI) + moratoriumInterest;

    const emiToIncomeRatio = activeTab === 'personal' ? (emi / (parseFloat(monthlyIncomeInput) || 1)) * 100 : (emi / 50000) * 100;

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      emiToIncomeRatio: Math.round(emiToIncomeRatio * 100) / 100
    };
  }, [loanAmount, interestRate, tenure, tenureType, activeTab, hasMoratorium, moratoriumPeriod, monthlyIncomeInput]);

  // Dynamic SEO based on active tab
  const activePath = `/calculators/${activeTab === 'home' ? 'home-loan' : activeTab === 'car' ? 'car-loan' : activeTab === 'personal' ? 'personal-loan' : 'education-loan'}`;
  const seo = getSEOConfig(activePath);

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

      <div className="min-h-screen bg-[#F8FAFC] font-jakarta pb-20">
        <Breadcrumb items={[{ name: "Calculators", href: "/calculators" }, { name: "Loan EMI Calculator" }]} />

        {/* --- COMPACT HERO --- */}
        <section className="pt-8 pb-10 text-center px-4">
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-4 border border-blue-100"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Standard Financial Tool 2025
          </m.div>
          <m.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3"
          >
            {loanConfig[activeTab].title} <span className="text-blue-600">Calculator</span>
          </m.h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm md:text-base">
            Professional EMI planning with real-time affordability analysis and tax benefit insights.
          </p>
        </section>

        {/* --- MAIN CALCULATOR (SINGLE PAGE VIEW) --- */}
        <main className="max-w-7xl mx-auto px-4 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT: INPUTS (Single View) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-slate-100 bg-slate-50/50">
                  {(Object.keys(loanConfig) as LoanType[]).map((type) => {
                    const isSelected = activeTab === type;
                    const Icon = loanConfig[type].icon;
                    return (
                      <button
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={cn(
                          "flex-1 py-4 px-2 flex flex-col items-center gap-1 transition-all border-b-2",
                          isSelected 
                            ? "border-blue-600 bg-white text-blue-600" 
                            : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{loanConfig[type].title.split(' ')[0]}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Grid Inputs */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Loan Amount</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          type="number" 
                          value={loanAmount} 
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="h-12 pl-10 rounded-xl border-slate-200 font-bold text-lg focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Interest Rate (% p.a.)</Label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          type="number" 
                          step="0.1"
                          value={interestRate} 
                          onChange={(e) => setInterestRate(e.target.value)}
                          className="h-12 pl-10 rounded-xl border-slate-200 font-bold text-lg focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Tenure</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          value={tenure} 
                          onChange={(e) => setTenure(e.target.value)}
                          className="h-12 flex-1 rounded-xl border-slate-200 font-bold text-lg focus:ring-2 focus:ring-blue-100"
                        />
                        <Select value={tenureType} onValueChange={setTenureType}>
                          <SelectTrigger className="h-12 w-28 rounded-xl border-slate-200 font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl font-bold">
                            <SelectItem value="years">Years</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {activeTab === 'personal' ? (
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Monthly Income</Label>
                        <div className="relative">
                          <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            type="number" 
                            value={monthlyIncomeInput} 
                            onChange={(e) => setMonthlyIncomeInput(e.target.value)}
                            className="h-12 pl-10 rounded-xl border-slate-200 font-bold text-lg"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-end pb-1">
                        <Badge variant="outline" className="h-10 rounded-xl border-slate-100 font-medium text-slate-400 justify-center">
                          {activeTab === 'home' ? 'Max tenure: 30 Yrs' : 'Max tenure: 7 Yrs'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {activeTab === 'education' && (
                    <m.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-emerald-800">Moratorium Period</Label>
                          <p className="text-[10px] text-emerald-600 font-medium">Interest-only period during study</p>
                        </div>
                        <Switch checked={hasMoratorium} onCheckedChange={setHasMoratorium} />
                      </div>
                      {hasMoratorium && (
                        <div className="flex items-center gap-3">
                          <Input 
                            type="number" 
                            value={moratoriumPeriod} 
                            onChange={(e) => setMoratoriumPeriod(e.target.value)}
                            placeholder="Years"
                            className="h-10 rounded-xl border-emerald-200 bg-white font-bold"
                          />
                          <span className="text-xs font-bold text-emerald-700">Years</span>
                        </div>
                      )}
                    </m.div>
                  )}

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                      <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> RBI Compliant</div>
                      <div className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> Instant Result</div>
                      <div className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5 text-emerald-500" /> FY 2025 Slabs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                   <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-blue-500" /> Impact Score
                   </h4>
                   <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    A 0.5% decrease in rate saves <span className="font-bold text-slate-900">₹{formatCurrency(calculations.emi * 12 * 0.05)}</span> annually.
                   </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                   <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-amber-500" /> Smart Tip
                   </h4>
                   <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    Paying 1 extra EMI per year reduces tenure by <span className="font-bold text-slate-900">22%</span>.
                   </p>
                </div>
              </div>
            </div>

            {/* RIGHT: RESULTS PANEL (Sticky) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 space-y-8 text-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 block mb-2">Monthly EMI</span>
                    <div className="text-5xl font-black tracking-tighter text-blue-400">
                      {formatCurrency(calculations.emi)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                    <div className="text-left">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Total Interest</span>
                      <span className="text-lg font-bold text-white">
                        {formatCurrency(calculations.totalInterest)}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Total Payment</span>
                      <span className="text-lg font-bold text-white">
                        {formatCurrency(calculations.totalPayment)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="uppercase tracking-widest text-slate-500">Affordability</span>
                      <span className={cn(calculations.emiToIncomeRatio < 40 ? "text-emerald-400" : "text-amber-400")}>
                        {calculations.emiToIncomeRatio < 40 ? 'EXCELLENT' : 'HIGH DSR'}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(100, calculations.emiToIncomeRatio * 2)} 
                      className="h-2 bg-white/5" 
                      indicatorClassName={cn(calculations.emiToIncomeRatio < 40 ? "bg-emerald-500" : "bg-amber-500")}
                    />
                  </div>

                  <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-blue-50 font-bold text-base transition-all shadow-xl">
                    Download Schedule <Download className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Composition */}
              <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-blue-500" />
                  Payment Split
                </h3>
                <div className="flex items-center gap-4 h-3 rounded-full bg-slate-100 overflow-hidden mb-6">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${Math.round((parseFloat(loanAmount) / (calculations.totalPayment || 1)) * 100)}%` }} 
                  />
                  <div 
                    className="h-full bg-slate-300" 
                    style={{ width: `${Math.round((calculations.totalInterest / (calculations.totalPayment || 1)) * 100)}%` }} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Principal</span>
                   </div>
                   <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Interest</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* --- SEO & EXPLAINER SECTION (BELOW FOLD) --- */}
        <section className="max-w-7xl mx-auto px-4 mt-20">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">
                Guide to {loanConfig[activeTab].title} Planning 2025
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 font-medium space-y-6">
                <p>
                  Our {activeTab} loan calculator is designed for the modern borrower. In FY 2024-25, with shifting repo rates, staying informed about your EMI commitment is crucial for maintaining a healthy debt-to-income ratio.
                </p>
                
                <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Tax Benefits (Section 24b, 80C, 80E)</h3>
                <ul className="list-none p-0 space-y-4">
                  {activeTab === 'home' && (
                    <li className="flex gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">₹</div>
                      <p className="text-sm"><span className="font-bold text-blue-900">Section 24(b):</span> Save up to <span className="font-bold">₹2 Lakh</span> annually on interest payments for self-occupied properties.</p>
                    </li>
                  )}
                  {activeTab === 'education' && (
                    <li className="flex gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">80E</div>
                      <p className="text-sm"><span className="font-bold text-emerald-900">Section 80E:</span> Full interest paid is deductible from your taxable income for up to 8 years.</p>
                    </li>
                  )}
                  <li className="flex gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-6 h-6 rounded-lg bg-slate-500 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">i</div>
                    <p className="text-sm"><span className="font-bold text-slate-900">Smart Repayment:</span> Making partial prepayments in the first 5 years of a loan significantly reduces total interest outflow.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-slate-100 grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h4 className="font-bold text-slate-900 mb-2">CIBIL Score</h4>
                <p className="text-xs text-slate-500 font-medium">Maintain 750+ for best rates.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Processing Fees</h4>
                <p className="text-xs text-slate-500 font-medium">Usually 0.5% to 1.5% of amount.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Prepayment</h4>
                <p className="text-xs text-slate-500 font-medium">Zero fees on floating rate loans.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
