import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { calculateHRA } from "@/lib/tax-calculations";
import {
  Building2,
  TrendingUp,
  Receipt,
  Info,
  ArrowRight,
  Star,
  Calendar,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  ShieldCheck,
  Award,
  PieChart,
  Lock,
  Headphones
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { getSEOConfig } from "@/config/seo.config";
import { cn } from "@/lib/utils";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

export default function HRACalculator() {
  const seo = getSEOConfig("/calculators/hra");
  const [salary, setSalary] = useState<number>(1200000);
  const [hra, setHra] = useState<number>(400000);
  const [rent, setRent] = useState<number>(300000);
  const [city, setCity] = useState<"metro" | "non-metro">("metro");

  const result = calculateHRA(salary, hra, rent, city);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n).replace("₹", "₹ ");

  const breakdownItems = [
    {
      label: "Actual HRA Received",
      value: hra,
      desc: "Total HRA component in salary",
      id: "actual"
    },
    {
      label: "Rent − 10% of Basic",
      value: result.breakdown.rentMinus10Percent,
      desc: "Excess rent over 10% basic",
      id: "rent"
    },
    {
      label: city === "metro" ? "50% of Basic (Metro)" : "40% of Basic (Non-Metro)",
      value: result.breakdown.cityAllowance,
      desc: "City-based basic limit",
      id: "city"
    },
  ];

  const minVal = Math.min(hra, result.breakdown.rentMinus10Percent, result.breakdown.cityAllowance);

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-inter">
      <MetaSEO
        title={seo?.title || "HRA Calculator 2025 | House Rent Allowance Exemption | MyeCA.in"}
        description={
          seo?.description ||
          "Calculate your HRA exemption under Section 10(13A). Interactive visualization for maximum tax savings."
        }
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Modern Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#444CE7] mb-4 uppercase tracking-widest bg-[#F5F8FF] w-fit px-4 py-1.5 rounded-full border border-[#D1E0FF]">
            <Sparkles className="w-3.5 h-3.5" />
            Tax Optimization Tool
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-[#101828] tracking-tight">
                HRA <span className="text-[#444CE7]">Calculator</span>
              </h1>
              <p className="text-[#667085] text-base max-w-xl font-medium">
                Calculate your tax-exempt House Rent Allowance under Section 10(13A).
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-[24px] border border-[#EAECF0] shadow-sm self-start">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-[#F2F4F7] flex items-center justify-center text-[10px] font-bold text-[#475467]">
                    {i === 1 ? 'JD' : i === 2 ? 'AS' : 'RK'}
                  </div>
                ))}
              </div>
              <div className="pr-4 border-r border-[#F2F4F7]">
                <p className="text-[10px] font-bold text-[#101828] uppercase tracking-wider">Trusted by</p>
                <p className="text-xs font-bold text-[#444CE7]">10k+ Taxpayers</p>
              </div>
              <div className="pl-2">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
                <p className="text-[10px] font-bold text-[#667085]">4.9/5 Rating</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 items-start">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Building2 className="w-24 h-24" />
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#F5F8FF] flex items-center justify-center text-[#444CE7] border border-[#D1E0FF]">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#101828]">Salary & Rent Details</h2>
                  <p className="text-xs text-[#667085]">Fill in your annual salary components</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Annual Basic Salary */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#344054]">Annual Basic Salary</span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-bold text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={salary}
                        onChange={(e) => setSalary(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider 
                    value={[salary]} 
                    onValueChange={(v) => setSalary(v[0])} 
                    max={5000000} 
                    min={100000} 
                    step={10000} 
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#667085] font-medium uppercase tracking-wider">
                    <span>Min: 1L</span>
                    <span>Max: 50L</span>
                  </div>
                </div>

                {/* Annual HRA Received */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#344054]">Annual HRA Received</span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-bold text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={hra}
                        onChange={(e) => setHra(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider 
                    value={[hra]} 
                    onValueChange={(v) => setHra(v[0])} 
                    max={2000000} 
                    min={0} 
                    step={5000} 
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#667085] font-medium uppercase tracking-wider">
                    <span>Min: 0</span>
                    <span>Max: 20L</span>
                  </div>
                </div>

                {/* Annual Rent Paid */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#344054]">Annual Rent Paid</span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-bold text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={rent}
                        onChange={(e) => setRent(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider 
                    value={[rent]} 
                    onValueChange={(v) => setRent(v[0])} 
                    max={2000000} 
                    min={0} 
                    step={5000} 
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#667085] font-medium uppercase tracking-wider">
                    <span>Min: 0</span>
                    <span>Max: 20L</span>
                  </div>
                </div>

                {/* City Type Selection */}
                <div className="pt-4 border-t border-[#F2F4F7]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-[#344054]">Residential City Type</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "metro" as const, label: "Metro City", sub: "50% of Basic", icon: <Building2 className="w-4 h-4" /> },
                      { id: "non-metro" as const, label: "Other City", sub: "40% of Basic", icon: <Building2 className="w-4 h-4 opacity-50" /> },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setCity(opt.id)}
                        className={cn(
                          "p-4 rounded-[20px] border-2 text-left transition-all relative overflow-hidden group",
                          city === opt.id
                            ? "border-[#444CE7] bg-[#F5F8FF]"
                            : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            city === opt.id ? "bg-[#444CE7] text-white" : "bg-[#F9FAFB] text-[#667085] group-hover:bg-[#F2F4F7]"
                          )}>
                            {opt.icon}
                          </div>
                          <div>
                            <p className={cn("text-sm font-bold", city === opt.id ? "text-[#101828]" : "text-[#344054]")}>{opt.label}</p>
                            <p className="text-[10px] text-[#667085] font-medium">{opt.sub}</p>
                          </div>
                        </div>
                        {city === opt.id && (
                          <div className="absolute top-4 right-4">
                            <CheckCircle2 className="w-4 h-4 text-[#444CE7]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Exemption Breakdown */}
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#FDF2FA] flex items-center justify-center text-[#C11574] border border-[#FCCEEE]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#101828]">Calculation Rules</h2>
                  <p className="text-xs text-[#667085]">Exemption is the minimum of these three</p>
                </div>
              </div>

              <div className="space-y-2">
                {breakdownItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-xl border transition-all",
                      item.value === minVal
                        ? "bg-[#F6FEF9] border-[#D1FADF] ring-1 ring-[#027A48]/10"
                        : "bg-white border-[#EAECF0]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2",
                        item.value === minVal ? "bg-[#027A48] border-[#027A48] text-white" : "border-[#EAECF0] text-[#98A2B3]"
                      )}>
                        {item.value === minVal ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1 h-1 rounded-full bg-current" />}
                      </div>
                      <div>
                        <p className={cn("text-sm font-bold", item.value === minVal ? "text-[#101828]" : "text-[#344054]")}>{item.label}</p>
                        <p className="text-[10px] text-[#667085] font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <span className={cn("text-sm font-bold", item.value === minVal ? "text-[#027A48]" : "text-[#101828]")}>
                      {fmt(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm h-full flex flex-col sticky top-8">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-[#101828]">HRA Summary</h2>
                <div className="bg-[#ECFDF3] text-[#027A48] text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                  <Star className="w-3 h-3 fill-[#027A48]" />
                  Section 10(13A)
                </div>
              </div>
              <p className="text-sm text-[#667085] mb-4">Live calculation results</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Exempt HRA */}
                <div className="p-4 rounded-[20px] border-2 border-[#ECFDF3] bg-[#F6FEF9]">
                  <span className="text-xs font-bold text-[#101828] block mb-0.5">Exempt HRA</span>
                  <span className="text-[10px] text-[#667085] block mb-2">Non-taxable part</span>
                  <span className="text-2xl font-bold block mb-0.5 text-[#027A48]">
                    {fmt(result.exemption)}
                  </span>
                  <span className="text-[10px] text-[#98A2B3] font-medium uppercase tracking-widest">Tax Free</span>
                </div>

                {/* Taxable HRA */}
                <div className="p-4 rounded-[20px] border-2 border-[#FEF3F2] bg-[#FFFBFA]">
                  <span className="text-xs font-bold text-[#101828] block mb-0.5">Taxable HRA</span>
                  <span className="text-[10px] text-[#667085] block mb-2">Added to salary</span>
                  <span className="text-2xl font-bold block mb-0.5 text-[#B42318]">
                    {fmt(result.taxableHRA)}
                  </span>
                  <span className="text-[10px] text-[#98A2B3] font-medium uppercase tracking-widest">Added to Tax</span>
                </div>
              </div>

              {/* Savings Highlight */}
              <div className="bg-[#F9FAFB] rounded-[20px] border border-[#EAECF0] p-4 flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#ECFDF3] flex items-center justify-center text-[#027A48] shrink-0">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#475467]">Potential Tax Savings</span>
                    <span className="text-2xl font-bold text-[#027A48]">{fmt(Math.round(result.exemption * 0.312))}</span>
                  </div>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    Estimated tax saved at <span className="font-bold text-[#101828]">30% bracket</span> (including cess).
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-grow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Annual Basic</span>
                  <span className="text-xs font-bold text-[#101828] text-right">{fmt(salary)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Total HRA Received</span>
                  <span className="text-xs font-bold text-[#101828] text-right">{fmt(hra)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Total Rent Paid</span>
                  <span className="text-xs font-bold text-[#101828] text-right">{fmt(rent)}</span>
                </div>
                <div className="pt-4 border-t border-[#F2F4F7] flex items-center justify-between">
                  <span className="text-sm font-bold text-[#101828]">Net Taxable Salary</span>
                  <span className="text-base font-bold text-[#B42318] text-right">{fmt(salary + result.taxableHRA)}</span>
                </div>
              </div>

              {/* Expert Call Box */}
              <div className="mt-6 bg-[#F5F8FF] border border-[#D1E0FF] rounded-[20px] p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#D1E0FF] flex items-center justify-center text-[#444CE7] shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-0.5">Maximize HRA?</h4>
                  <p className="text-xs text-[#667085] mb-2">Get CA assistance for HRA optimization</p>
                  <Link href="/services/tax-planning">
                    <button className="text-[13px] font-bold text-[#444CE7] flex items-center gap-2 hover:gap-3 transition-all">
                      Book Consultation
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Headphones className="w-5 h-5" />, label: "Expert CA Support", desc: "Get guidance from tax experts" },
            { icon: <Award className="w-5 h-5" />, label: "100% Accurate", desc: "As per latest tax laws" },
            { icon: <Lock className="w-5 h-5" />, label: "Secure & Private", desc: "Your data is fully encrypted" },
            { icon: <PieChart className="w-5 h-5" />, label: "Save & Compare", desc: "Save scenarios and compare later" }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-2">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAECF0] flex items-center justify-center text-[#101828] shrink-0">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <h5 className="text-[13px] font-bold text-[#101828]">{item.label}</h5>
                <p className="text-[11px] text-[#667085] leading-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Informational Content */}
        <div className="mt-12">
          <CalculatorMiniBlog 
            features={[
              {
                icon: <Zap className="w-5 h-5" />,
                iconBg: "bg-blue-50 text-blue-600",
                title: "Old Regime Only",
                desc: "HRA exemption is only available under the Old Tax Regime. The New Regime does not allow HRA claims."
              },
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                iconBg: "bg-emerald-50 text-emerald-600",
                title: "Rent Agreements",
                desc: "Ensure you have a valid rent agreement and rent receipts. Landlord PAN is mandatory if rent > ₹1L per year."
              },
              {
                icon: <Target className="w-5 h-5" />,
                iconBg: "bg-amber-50 text-amber-600",
                title: "Rule of Minimum",
                desc: "Your exemption is calculated based on the lowest of three specific rules defined by the Income Tax Act."
              }
            ]}
            howItWorks={{
              title: "HRA Exemption Rules",
              description: "The Income Tax Act calculates HRA exemption based on the lower of the following three criteria:",
              steps: [
                { title: "Actual HRA", desc: "The total HRA component as mentioned in your salary slip/offer letter." },
                { title: "Rent Over 10%", desc: "Actual rent paid minus 10% of your basic salary." },
                { title: "City Limit", desc: "50% of basic (Metro) or 40% of basic (Non-Metro cities)." }
              ]
            }}
            faqs={[
              { q: "Can I pay rent to my parents?", a: "Yes, you can pay rent to parents and claim HRA, provided they declare it as income and there is a formal rental agreement." },
              { q: "Is landlord PAN mandatory?", a: "Yes, if your annual rent exceeds ₹1 Lakh, the landlord's PAN is required by the IT Department." },
              { q: "Can I claim both HRA and Home Loan?", a: "Yes, if you live in a rented house while owning a home in a different city, you can claim both deductions." }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
