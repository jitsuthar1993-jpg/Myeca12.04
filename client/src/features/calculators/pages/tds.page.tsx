import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Receipt,
  Zap,
  ShieldCheck,
  UserCheck,
  FileBadge,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Briefcase,
  Home,
  Percent,
  TrendingUp,
  User,
  Shield,
  FileSpreadsheet,
  Calculator,
  ArrowRight,
  Star,
  Info,
  Calendar,
  Lock,
  Headphones,
  Award,
  Sparkles,
  PieChart
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { calculateTDS } from "@/lib/tax-calculations";
import { assessmentYears } from "@/data/tds-rules";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

const incomeTypes = [
  { value: 'professional_fees', label: 'Professional Fees', section: '194J', rate: '10%', icon: <Briefcase className="w-4 h-4" /> },
  { value: 'interest', label: 'Interest on Deposits', section: '194A', rate: '10%', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'rent', label: 'Rent Income', section: '194I', rate: '10%', icon: <Home className="w-4 h-4" /> },
  { value: 'commission', label: 'Commission', section: '194H', rate: '5%', icon: <Percent className="w-4 h-4" /> },
  { value: 'contractor_payment', label: 'Contractor Payment', section: '194C', rate: '1/2%', icon: <Receipt className="w-4 h-4" /> },
  { value: 'dividend', label: 'Dividend Income', section: '194', rate: '10%', icon: <UserCheck className="w-4 h-4" /> },
];

export default function TDSCalculatorPage() {
  const [income, setIncome] = useState<number>(50000);
  const [incomeType, setIncomeType] = useState<string>('professional_fees');
  const [selectedYear, setSelectedYear] = useState<string>("2025-26");
  const [panProvided, setPanProvided] = useState<boolean>(true);
  const [isSeniorCitizen, setIsSeniorCitizen] = useState<boolean>(false);
  const [form15G15HSubmitted, setForm15G15HSubmitted] = useState<boolean>(false);

  const result = useMemo(() => {
    return calculateTDS({
      income,
      incomeType,
      assessmentYear: selectedYear,
      panProvided,
      isSeniorCitizen,
      form15G15HSubmitted,
    });
  }, [income, incomeType, selectedYear, panProvided, isSeniorCitizen, form15G15HSubmitted]);

  const seo = getSEOConfig('/calculators/tds');
  const selectedIncomeType = incomeTypes.find(type => type.value === incomeType);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n).replace("₹", "₹ ");

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-inter">
      <MetaSEO
        title={seo?.title || "TDS Calculator 2025 | Rates & Sections | MyeCA.in"}
        description={seo?.description || "Calculate TDS across income types with current rates for AY 2025-26. Professional tax planning with PAN and threshold insights."}
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
            Compliance Tool
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-[#101828] tracking-tight">
                TDS <span className="text-[#444CE7]">Calculator</span>
              </h1>
              <p className="text-[#667085] text-base max-w-xl font-medium">
                Instant TDS estimates based on Income Tax sections and threshold limits.
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
                <p className="text-xs font-bold text-[#444CE7]">50k+ Businesses</p>
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
              <div className="absolute top-0 right-0 p-6 opacity-5 text-[#444CE7]">
                <FileText className="w-24 h-24" />
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#F5F8FF] flex items-center justify-center text-[#444CE7] border border-[#D1E0FF]">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#101828]">Payment Details</h2>
                  <p className="text-xs text-[#667085]">Configure your payment nature and amount</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Income Nature */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#667085] uppercase tracking-widest px-1">Income Nature</label>
                    <Select value={incomeType} onValueChange={setIncomeType}>
                      <SelectTrigger className="h-10 rounded-lg border-[#EAECF0] bg-white font-bold text-sm shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {incomeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="font-bold py-2.5">
                            <div className="flex items-center gap-2">
                              {type.icon}
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assessment Year */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#667085] uppercase tracking-widest px-1">Assessment Year</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="h-10 rounded-lg border-[#EAECF0] bg-white font-bold text-sm shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {assessmentYears.map((y) => (
                          <SelectItem key={y.value} value={y.value} className="font-bold">{y.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Payment Amount */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#344054]">Payment Amount</span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[140px] flex items-center gap-1.5 shadow-sm focus-within:border-[#444CE7] focus-within:ring-1 focus-within:ring-[#444CE7]/10 transition-all">
                      <span className="text-xs font-bold text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#667085] font-medium uppercase tracking-wider mt-1">
                    <span>Enter the gross invoice amount before tax</span>
                  </div>
                </div>

                {/* Compliance Checks */}
                <div className="pt-4 border-t border-[#F2F4F7]">
                  <label className="text-[10px] font-bold text-[#667085] uppercase tracking-widest px-1 mb-3 block">Compliance Checks</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { label: "Valid PAN Available", state: panProvided, setState: setPanProvided, icon: <UserCheck className="w-3.5 h-3.5 text-[#444CE7]" />, desc: panProvided ? "Standard Rate" : "20% Penalty Rate" },
                      { label: "Senior Citizen Payee", state: isSeniorCitizen, setState: setIsSeniorCitizen, icon: <User className="w-3.5 h-3.5 text-amber-500" />, desc: "Higher Thresholds Apply" },
                      { label: "Form 15G/H Submitted", state: form15G15HSubmitted, setState: setForm15G15HSubmitted, icon: <FileBadge className="w-3.5 h-3.5 text-emerald-500" />, desc: "Zero TDS Exemption" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl border border-[#EAECF0] bg-white hover:border-[#D1E0FF] transition-all shadow-sm group">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#F9FAFB] flex items-center justify-center group-hover:bg-[#F5F8FF] transition-all shrink-0">
                            {item.icon}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-[#101828] leading-tight">{item.label}</p>
                            <p className="text-[9px] text-[#667085] font-medium uppercase tracking-tight leading-none">{item.desc}</p>
                          </div>
                        </div>
                        <div className="scale-75 origin-right">
                          <Switch checked={item.state} onCheckedChange={item.setState} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm h-full flex flex-col sticky top-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-[#101828]">Deduction Summary</h2>
                <div className={cn(
                  "text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider",
                  result?.tdsAmount > 0 ? "bg-[#FEF3F2] text-[#B42318]" : "bg-[#ECFDF3] text-[#027A48]"
                )}>
                  {result?.tdsAmount > 0 ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  {selectedIncomeType?.section}
                </div>
              </div>
              <p className="text-sm text-[#667085] mb-4">Final TDS calculation</p>

              <div className="p-5 rounded-[24px] border-2 mb-6 transition-all bg-[#F9FAFB] border-[#EAECF0]">
                <span className="text-xs font-bold text-[#667085] block mb-1 uppercase tracking-widest">TDS Amount to Deduct</span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={result?.tdsAmount}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "text-4xl font-black block tabular-nums",
                      result?.tdsAmount > 0 ? "text-[#B42318]" : "text-[#027A48]"
                    )}
                  >
                    {fmt(result?.tdsAmount || 0)}
                  </motion.span>
                </AnimatePresence>
                <div className="mt-4 pt-4 border-t border-[#EAECF0] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#667085] uppercase">Applicable Rate</span>
                  <span className="text-sm font-black text-[#101828] bg-white px-2 py-0.5 rounded border border-[#EAECF0]">{result?.tdsRate || 0}%</span>
                </div>
              </div>

              {/* Status Note */}
              <div className={cn(
                "rounded-[20px] border p-4 flex items-center gap-4 mb-6 transition-all",
                result?.applicable ? "bg-[#FFFBFA] border-[#FEF3F2]" : "bg-[#F6FEF9] border-[#D1FADF]"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                  result?.applicable ? "bg-[#B42318] text-white" : "bg-[#027A48] text-white"
                )}>
                  {result?.applicable ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
                <div>
                  <p className={cn("text-sm font-bold", result?.applicable ? "text-[#B42318]" : "text-[#027A48]")}>
                    {result?.applicable ? "Action Required" : "No Deduction Needed"}
                  </p>
                  <p className="text-[11px] text-[#667085] leading-tight">
                    {result?.applicable ? "Amount exceeds annual threshold. TDS must be deducted." : "Amount is within threshold limits."}
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-grow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Total Invoice Amount</span>
                  <span className="text-xs font-bold text-[#101828] text-right">{fmt(income)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">PAN Status Penalty</span>
                  <span className="text-xs font-bold text-[#B42318] text-right">{panProvided ? "Nil" : "20% Apply"}</span>
                </div>
                <div className="pt-4 border-t border-[#F2F4F7] flex items-center justify-between">
                  <span className="text-sm font-bold text-[#101828]">Net Payable to Vendor</span>
                  <span className="text-base font-bold text-[#444CE7] text-right">{fmt(result?.netIncome || 0)}</span>
                </div>
              </div>

              {/* Action Box */}
              <div className="mt-6 bg-[#F5F8FF] border border-[#D1E0FF] rounded-[20px] p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#D1E0FF] flex items-center justify-center text-[#444CE7] shrink-0">
                  <FileBadge className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-0.5">Need to file TDS?</h4>
                  <p className="text-xs text-[#667085] mb-2">Get CA assistance for monthly TDS filing</p>
                  <Link href="/services/tds-filing">
                    <button className="text-[13px] font-bold text-[#444CE7] flex items-center gap-2 hover:gap-3 transition-all">
                      Start Filing Now
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
                icon: <Shield className="w-5 h-5" />,
                iconBg: "bg-indigo-50 text-indigo-600",
                title: "PAN Compliance",
                desc: "Always ensure the payee provides a valid PAN. Without it, TDS is deducted at a flat 20% under Section 206AA."
              },
              {
                icon: <FileSpreadsheet className="w-5 h-5" />,
                iconBg: "bg-emerald-50 text-emerald-600",
                title: "TRACES Integration",
                desc: "After deduction, ensure you deposit the tax and file returns to generate Form 16/16A from the TRACES portal."
              },
              {
                icon: <Zap className="w-5 h-5" />,
                iconBg: "bg-amber-50 text-amber-600",
                title: "Interest & Penalties",
                desc: "Late deposit of TDS attracts 1.5% interest per month. Late filing of TDS returns costs ₹200 per day in penalties."
              }
            ]}
            howItWorks={{
              title: "TDS Threshold Limits",
              description: "TDS is only applicable if the total payment to a person in a financial year exceeds certain limits.",
              steps: [
                { title: "Sec 194J", desc: "Professional Fees: Threshold of ₹30,000 per year. Rate is 10% (2% for Technical Services)." },
                { title: "Sec 194C", desc: "Contracts: Threshold of ₹30,000 for single payment or ₹1,00,000 aggregate per year." },
                { title: "Sec 194I", desc: "Rent: Threshold of ₹2,40,000 per year for rent of land, building, or furniture." }
              ]
            }}
            faqs={[
              { q: "Can I adjust TDS against final tax?", a: "Yes, TDS is a form of advance tax. You can adjust the total TDS deducted against your final income tax liability while filing ITR." },
              { q: "What is Form 15G/15H?", a: "These are self-declaration forms for individuals with income below the taxable limit to request zero TDS on interest income." },
              { q: "Is TDS applicable on Salary?", a: "Yes, under Section 192. It is calculated based on the employee's projected annual income and applicable tax slabs." }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
