import { useState, useMemo, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { 
  Receipt, 
  AlertCircle, 
  Coins, 
  Percent, 
  FileText, 
  CheckCircle, 
  Info, 
  Calculator, 
  IndianRupee, 
  FileCheck, 
  Calendar,
  Download,
  ShieldCheck,
  Zap,
  ChevronRight,
  PieChart,
  ArrowRight,
  Banknote,
  History,
  AlertTriangle,
  UserCheck,
  FileBadge
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { calculateTDS } from "@/lib/tax-calculations";
import { assessmentYears } from "@/data/tds-rules";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import Breadcrumb from "@/components/Breadcrumb";
import { cn } from "@/lib/utils";

export default function TDSCalculatorPage() {
  const [income, setIncome] = useState<number>(0);
  const [incomeType, setIncomeType] = useState<string>('professional_fees');
  const [selectedYear, setSelectedYear] = useState<string>("2025-26");
  const [panProvided, setPanProvided] = useState<boolean>(true);
  const [isSeniorCitizen, setIsSeniorCitizen] = useState<boolean>(false);
  const [form15G15HSubmitted, setForm15G15HSubmitted] = useState<boolean>(false);

  const result = useMemo(() => {
    if (income > 0 && incomeType) {
      return calculateTDS({
        income,
        incomeType,
        assessmentYear: selectedYear,
        panProvided,
        isSeniorCitizen,
        form15G15HSubmitted,
      });
    }
    return null;
  }, [income, incomeType, selectedYear, panProvided, isSeniorCitizen, form15G15HSubmitted]);

  const seo = getSEOConfig('/calculators/tds');

  const incomeTypes = [
    { value: 'professional_fees', label: 'Professional Fees', section: '194J', rate: '10%' },
    { value: 'interest', label: 'Interest on Deposits', section: '194A', rate: '10%' },
    { value: 'rent', label: 'Rent Income', section: '194I', rate: '10%' },
    { value: 'commission', label: 'Commission', section: '194H', rate: '5%' },
    { value: 'contractor_payment', label: 'Contractor Payment', section: '194C', rate: '1/2%' },
    { value: 'dividend', label: 'Dividend Income', section: '194', rate: '10%' }
  ];

  const selectedIncomeType = incomeTypes.find(type => type.value === incomeType);

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

      <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
        <Breadcrumb items={[{ name: "Calculators", href: "/calculators" }, { name: "TDS Calculator" }]} />

        {/* --- HERO --- */}
        <section className="pt-8 pb-10 text-center px-4">
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-widest mb-4 border border-purple-100"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Standard Financial Tool 2025
          </m.div>
          <m.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3"
          >
            TDS <span className="text-purple-600">Calculator</span>
          </m.h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm md:text-base">
            Professional Tax Deducted at Source planning with real-time rate analysis and threshold insights.
          </p>
        </section>

        {/* --- MAIN CONTENT --- */}
        <main className="max-w-7xl mx-auto px-4 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT: INPUTS */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-50 rounded-xl">
                        <Receipt className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Payment Details</h2>
                        <p className="text-xs text-slate-500 font-medium">Configure income type and amounts</p>
                      </div>
                    </div>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-32 h-10 rounded-xl border-slate-200 font-bold text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold">
                        {assessmentYears.map((y) => (
                          <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Income Type</Label>
                      <Select value={incomeType} onValueChange={setIncomeType}>
                        <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl font-bold">
                          {incomeTypes.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              <div className="flex items-center gap-2">
                                <span>{t.label}</span>
                                <Badge variant="secondary" className="text-[9px] h-4 bg-slate-100 text-slate-500">{t.section}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Payment Amount</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          type="number" 
                          value={income || ''} 
                          onChange={(e) => setIncome(Number(e.target.value))}
                          placeholder="0"
                          className="h-12 pl-10 rounded-xl border-slate-200 font-bold text-lg focus:ring-2 focus:ring-purple-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={cn(
                      "p-4 rounded-2xl border transition-all flex items-center justify-between",
                      panProvided ? "bg-white border-slate-200" : "bg-red-50 border-red-100"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", panProvided ? "bg-purple-50 text-purple-600" : "bg-red-100 text-red-600")}>
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-900 uppercase leading-none">PAN Provided</p>
                          <p className="text-[9px] font-medium text-slate-400 mt-1">{panProvided ? 'Standard Rates' : '20% Flat Rate'}</p>
                        </div>
                      </div>
                      <Switch checked={panProvided} onCheckedChange={setPanProvided} />
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-white transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                          <History className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-900 uppercase leading-none">Sr. Citizen</p>
                          <p className="text-[9px] font-medium text-slate-400 mt-1">Higher Limits</p>
                        </div>
                      </div>
                      <Switch checked={isSeniorCitizen} onCheckedChange={setIsSeniorCitizen} />
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-white transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                          <FileBadge className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-900 uppercase leading-none">15G/15H</p>
                          <p className="text-[9px] font-medium text-slate-400 mt-1">Zero TDS Claim</p>
                        </div>
                      </div>
                      <Switch checked={form15G15HSubmitted} onCheckedChange={setForm15G15HSubmitted} />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                      <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> IT Act Compliant</div>
                      <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Instant Calculation</div>
                      <div className="flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5 text-blue-500" /> FY 2025-26 Rules</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
                   <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-purple-500" /> Threshold Limit
                   </h4>
                   <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    TDS is only applicable if the total payment to a single person exceeds <span className="text-slate-900 font-bold">₹{selectedIncomeType?.value === 'professional_fees' ? '30,000' : '40,000'}</span> in a financial year.
                   </p>
                </div>
                <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
                   <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Flat 20% Rule
                   </h4>
                   <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    Under <span className="text-slate-900 font-bold">Section 206AA</span>, if the payee does not provide a valid PAN, TDS must be deducted at 20% or the applicable rate, whichever is higher.
                   </p>
                </div>
              </div>
            </div>

            {/* RIGHT: RESULTS (Sticky) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 space-y-8 text-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 block mb-2">TDS to be Deducted</span>
                    <div className={cn("text-5xl font-black tracking-tighter", result?.tdsAmount ? "text-red-400" : "text-emerald-400")}>
                      {result ? `₹${result.tdsAmount.toLocaleString()}` : "₹0"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                    <div className="text-left">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Applicable Rate</span>
                      <span className="text-lg font-bold text-white">
                        {result ? `${result.tdsRate}%` : "0%"}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Net Payable</span>
                      <span className="text-lg font-bold text-white">
                        {result ? `₹${result.netIncome.toLocaleString()}` : "₹0"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="uppercase tracking-widest text-slate-500 text-left">Calculation Status</span>
                      <span className={result?.applicable ? "text-amber-400" : "text-emerald-400"}>
                        {result?.applicable ? "LIMIT EXCEEDED" : "BELOW THRESHOLD"}
                      </span>
                    </div>
                    <Progress 
                      value={result?.applicable ? 100 : 40} 
                      className="h-2 bg-white/5" 
                      indicatorClassName={result?.applicable ? "bg-amber-500" : "bg-emerald-500"}
                    />
                  </div>

                  <Button 
                    className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-purple-50 border-none font-bold text-base transition-all shadow-xl"
                  >
                    Download Summary <Download className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Composition */}
              <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-500" />
                  Payment Split
                </h3>
                <div className="flex items-center gap-0 h-3 rounded-full bg-slate-100 overflow-hidden mb-6">
                  <div 
                    className="h-full bg-slate-200" 
                    style={{ width: `${result ? Math.round((result.netIncome / income) * 100) : 100}%` }} 
                  />
                  <div 
                    className="h-full bg-red-400" 
                    style={{ width: `${result ? Math.round((result.tdsAmount / income) * 100) : 0}%` }} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Payee Gets</span>
                   </div>
                   <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase">TDS (Govt)</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* --- RATES GRID --- */}
        <section className="max-w-7xl mx-auto px-4 mt-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">TDS Rates & Thresholds 2025</h2>
            <p className="text-slate-500 text-sm font-medium">Standard rates for Indian Residents as per Income Tax Act</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {incomeTypes.map((t, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-5 rounded-[2rem] border border-slate-100 text-center flex flex-col items-center gap-2 hover:shadow-md transition-all"
              >
                <Badge variant="secondary" className="text-[8px] h-4 bg-purple-50 text-purple-600 mb-1">{t.section}</Badge>
                <h4 className="text-[10px] font-black uppercase text-slate-900 leading-tight mb-1">{t.label}</h4>
                <div className="text-sm font-black text-purple-600">{t.rate}</div>
              </m.div>
            ))}
          </div>
        </section>

        {/* --- GUIDE SECTION --- */}
        <section className="max-w-7xl mx-auto px-4 mt-20">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                  Understanding TDS <br /><span className="text-purple-600">Compliance in 2025</span>
                </h2>
                <div className="text-slate-600 font-medium space-y-6 text-sm md:text-base leading-relaxed">
                  <p>
                    Tax Deducted at Source (TDS) is a system introduced by the Income Tax Department where tax is collected at the very source of income. 
                  </p>
                  <p>
                    For instance, if a company makes a payment of <span className="text-slate-900 font-bold">Professional Fees</span> exceeding ₹30,000 to an individual, it is required to deduct 10% as TDS and deposit it with the government.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 rounded-[2rem] bg-slate-900 text-white shadow-2xl">
                  <h4 className="text-xl font-bold mb-4">Important Compliance</h4>
                  <div className="space-y-4">
                    {[
                      "TDS must be deposited by 7th of next month",
                      "Quarterly TDS returns are mandatory",
                      "Form 16/16A must be issued to the payee",
                      "TDS credit can be checked in Form 26AS"
                    ].map((t, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <CheckCircle className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium opacity-90">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}