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
  CheckCircle,
  FileText,
  Briefcase,
  Home,
  Percent,
  TrendingUp,
  User,
  Shield,
  FileSpreadsheet,
  Calculator
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { calculateTDS } from "@/lib/tax-calculations";
import { assessmentYears } from "@/data/tds-rules";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
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
    }).format(n);

  return (
    <>
      <MetaSEO
        title={seo?.title || "TDS Calculator 2025 | Rates & Sections | MyeCA.in"}
        description={seo?.description || "Calculate TDS across income types with current rates for AY 2025-26. Professional tax planning with PAN and threshold insights."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="TDS Calculator"
        description="Instant TDS estimates based on Income Tax sections, thresholds, and current AY 2025-26 rates."
        category="Compliance"
        icon={<FileText className="w-6 h-6" />}
        variant="indigo"
        breadcrumbItems={[{ name: "TDS Calculator" }]}
      />

      <CalcLayout
        variant="indigo"
        complianceFacts={[
          { title: "PAN Requirement", content: "Failure to provide PAN (Section 206AA) triggers a flat 20% TDS rate, regardless of the actual slab or section." },
          { title: "Threshold Limits", content: "TDS applies only when payments exceed specific thresholds (e.g., ₹30k for professional fees, ₹40k for bank interest)." },
          { title: "Form 15G/H", content: "Individuals with total income below the taxable limit can submit these forms to avoid TDS on interest income." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Deduction Summary">
            <div className="space-y-1 pb-6 border-b border-white/20">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">TDS Amount to Deduct</p>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={result?.tdsAmount} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className={cn(
                    "text-4xl font-bold tracking-tight tabular-nums",
                    result?.tdsAmount > 0 ? "text-red-600" : "text-emerald-600"
                  )}
                >
                  {fmt(result?.tdsAmount || 0)}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="space-y-4 pt-6">
              <CalcResultRow label="Net Payable Amount" value={fmt(result?.netIncome || 0)} variant="highlight" />
              <CalcResultRow label="Applicable Rate" value={`${result?.tdsRate || 0}%`} />
              <CalcResultRow label="Tax Section" value={selectedIncomeType?.section || "—"} />
              
              <div className="pt-6 border-t border-white/20">
                <div className={cn(
                  "flex items-start gap-3 p-4 rounded-2xl border transition-all",
                  result?.applicable ? "bg-amber-50/50 border-amber-200" : "bg-emerald-50/50 border-emerald-200"
                )}>
                  {result?.applicable ? <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /> : <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
                  <div>
                    <p className="text-xs font-bold text-slate-900">{result?.applicable ? "Above Threshold" : "Below Threshold"}</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      {result?.applicable ? "TDS deduction is mandatory for this payment amount." : "TDS not applicable as amount is below the annual threshold."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/services/tds-filing">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                <FileBadge className="w-4 h-4 text-purple-400" />
                File TDS Returns with CA
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="Payment Details" icon={<IndianRupee className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Income Nature</label>
                <Select value={incomeType} onValueChange={setIncomeType}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {incomeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="font-bold py-3">
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Assessment Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold text-sm">
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

            <div className="space-y-2 mb-8">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Invoice / Payment Amount</label>
              <div className="relative">
                <Input 
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="h-14 pl-10 rounded-xl border-slate-100 bg-slate-50 font-bold text-lg focus:ring-2 focus:ring-indigo-100"
                />
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-50">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Compliance Checks</label>
              <div className="grid gap-3">
                {[
                  { label: "Valid PAN Available", state: panProvided, setState: setPanProvided, icon: <UserCheck className="w-4 h-4 text-indigo-500" />, desc: panProvided ? "Standard Section Rate" : "20% Penalty Rate" },
                  { label: "Senior Citizen Payee", state: isSeniorCitizen, setState: setIsSeniorCitizen, icon: <User className="w-4 h-4 text-amber-500" />, desc: "Higher Thresholds Apply" },
                  { label: "Form 15G/H Submitted", state: form15G15HSubmitted, setState: setForm15G15HSubmitted, icon: <FileBadge className="w-4 h-4 text-emerald-500" />, desc: "Zero TDS Exemption" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-100 transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">{item.desc}</p>
                      </div>
                    </div>
                    <Switch checked={item.state} onCheckedChange={item.setState} />
                  </div>
                ))}
              </div>
            </div>
          </CalcInputCard>
        </div>

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
      </CalcLayout>
    </>
  );
}
