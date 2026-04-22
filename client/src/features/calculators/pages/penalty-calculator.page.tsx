import { useState, useMemo } from "react";
import { m } from "framer-motion";
import {
  AlertTriangle, ArrowRight, ShieldAlert, IndianRupee,
  TrendingUp, Info, Clock, AlertCircle, ShieldCheck, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import MetaSEO from "@/components/seo/MetaSEO";
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";

const penalties = {
  gst: {
    label: "GST",
    color: "blue",
    items: {
      gstr1: { name: "GSTR-1 (Monthly/Quarterly)", rateType: "daily", rate: 200, max: 5000, desc: "Late filing fee under Section 47. ₹100 CGST + ₹100 SGST per day." },
      gstr3b: { name: "GSTR-3B (Monthly/QRMP)", rateType: "daily", rate: 50, max: 10000, desc: "₹25 CGST + ₹25 SGST per day for non-nil returns." },
      gstr9: { name: "GSTR-9 (Annual Return)", rateType: "daily", rate: 200, max: "0.5% turnover", desc: "Late filing fee: ₹200/day. Max = 0.5% of state turnover." },
    },
  },
  it: {
    label: "Income Tax",
    color: "emerald",
    items: {
      tdsLate: { name: "TDS/TCS Late Deposit", rateType: "percent", rate: 1.5, max: null, desc: "Interest u/s 201(1A): 1.5% per month from deduction date." },
      tdsReturn: { name: "TDS Statement (24Q/26Q)", rateType: "daily", rate: 200, max: "TDS Amount", desc: "Late fee u/s 234E: ₹200/day. Max capped at TDS amount." },
      itrLate: { name: "Income Tax Return (ITR)", rateType: "flat", rate: 5000, max: null, desc: "Late fee u/s 234F. ₹1,000 if total income ≤ ₹5 Lakhs." },
    },
  },
  mca: {
    label: "MCA / ROC",
    color: "violet",
    items: {
      aoc4: { name: "Form AOC-4 (Financials)", rateType: "daily", rate: 100, max: null, desc: "Additional fee for delayed filing of financial statements with ROC." },
      mgt7: { name: "Form MGT-7 (Annual Return)", rateType: "daily", rate: 100, max: null, desc: "Additional fee per day for delayed annual return filing." },
      kyc: { name: "DIR-3 KYC", rateType: "flat", rate: 5000, max: null, desc: "One-time penalty for late submission of Director KYC form." },
    },
  },
  fema: {
    label: "FEMA",
    color: "amber",
    items: {
      ecb2: { name: "ECB-2 Return", rateType: "flat", rate: 5000, max: null, desc: "Late Submission Charge (LSC) per month of delay for FEMA ECB reporting." },
      fla: { name: "FLA Return", rateType: "flat", rate: 10000, max: null, desc: "Indicative penalty for late filing of Foreign Assets & Liabilities." },
    },
  },
};

export default function PenaltyCalculatorPage() {
  const [activeReg, setActiveReg] = useState("gst");
  const [activeItem, setActiveItem] = useState("gstr1");
  const [delay, setDelay] = useState(30);
  const [amount, setAmount] = useState(100000);

  const regData = penalties[activeReg as keyof typeof penalties];
  const itemData = regData?.items[activeItem as keyof typeof regData.items] as any;

  const result = useMemo(() => {
    if (!itemData) return { value: 0, label: "" };
    if (itemData.rateType === "flat") return { value: itemData.rate, label: "Fixed Penalty" };
    if (itemData.rateType === "percent") {
      const months = Math.max(1, Math.ceil(delay / 30));
      return { value: (amount * itemData.rate * months) / 100, label: `${itemData.rate}% × ${months} mo.` };
    }
    const raw = itemData.rate * delay;
    const final = typeof itemData.max === 'number' && raw > itemData.max ? itemData.max : raw;
    return { value: final, label: `₹${itemData.rate}/day × ${delay} days` };
  }, [itemData, delay, amount]);

  const severity = result.value > 10000 ? { label: "CRITICAL", color: "text-red-600 bg-red-50" } : result.value > 5000 ? { label: "HIGH", color: "text-amber-600 bg-amber-50" } : { label: "MODERATE", color: "text-emerald-600 bg-emerald-50" };

  return (
    <>
      <MetaSEO 
        title="Statutory Penalty Calculator 2025-26 | GST, IT, MCA | MyeCA.in" 
        description="Estimate late fees and interest penalties for delayed statutory filings." 
      />

      <CalcHero 
        title="Penalty Calculator"
        description="Calculate late fees, interest, and penalties for GST, Income Tax, and MCA filings with statutory accuracy."
        category="Compliance Utility"
        icon={<ShieldAlert className="w-6 h-6 text-amber-600" />}
        variant="amber"
        breadcrumbItems={[{ name: "Penalty Calculator" }]}
      />

      <CalcLayout
        variant="amber"
        sidebar={
          <CalcGlassSidebar 
            title="Estimated Liability"
            description="Statutory non-compliance estimate"
            variant="amber"
          >
             <div className="space-y-6">
                <div className="text-center py-6">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Due</span>
                   <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl font-black text-slate-400">₹</span>
                      <span className="text-6xl font-black text-slate-900 tracking-tighter">
                        {result.value.toLocaleString('en-IN')}
                      </span>
                   </div>
                   <div className="mt-4 flex justify-center">
                      <Badge className={cn("rounded-full border-none px-4 py-1 font-black text-[9px] tracking-widest", severity.color)}>
                        {severity.label}
                      </Badge>
                   </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                   <CalcResultRow label="Calculation Logic" value={result.label} />
                   <CalcResultRow label="Maximum Cap" value={itemData?.max ? (typeof itemData.max === 'number' ? `₹${itemData.max.toLocaleString('en-IN')}` : itemData.max) : "Unlimited"} />
                   <CalcResultRow label="Regulation" value={regData.label} />
                </div>

                <Button className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-100 mt-4 transition-all">
                   Consult Advisor <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
             </div>
          </CalcGlassSidebar>
        }
        complianceFacts={[
          { title: "Late Fees vs Interest", content: "Late fees (like GST ₹50/day) are mandatory charges for filing after the deadline. Interest (like TDS 1.5%/month) is compensatory for the delay in tax payment to the government." },
          { title: "Statutory Limits", content: "Most daily late fees have a maximum cap defined by law. For instance, GSTR-1 is capped at ₹5,000 per return in many cases, whereas ROC penalties can grow much higher." }
        ]}
        faqs={[
          { q: "Can penalties be waived?", a: "Late fees can only be waived by the government through official 'Amnesty Schemes' or notifications. Regular portal delays usually do not trigger waivers automatically." },
          { q: "Is interest calculated per day or per month?", a: "Under Income Tax, interest is usually calculated for every month or part of a month. Under GST, it is calculated daily at 18% per annum." }
        ]}
      >
        <div className="space-y-8 pb-12">
           {/* Regulation Selector */}
           <div className="bg-white p-1.5 rounded-3xl border border-slate-100 shadow-sm flex gap-1">
              {Object.entries(penalties).map(([key, reg]) => (
                <button
                  key={key}
                  onClick={() => { setActiveReg(key); setActiveItem(Object.keys(reg.items)[0]); }}
                  className={cn(
                    "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all",
                    activeReg === key 
                      ? "bg-slate-900 text-white shadow-lg" 
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  )}
                >
                  {reg.label}
                </button>
              ))}
           </div>

           {/* Type Selection Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(regData.items).map(([key, item]: any) => (
                <button
                  key={key}
                  onClick={() => setActiveItem(key)}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group",
                    activeItem === key
                      ? "bg-white border-amber-500 shadow-xl shadow-amber-100/50"
                      : "bg-white border-slate-100 hover:border-slate-200"
                  )}
                >
                  {activeItem === key && (
                    <div className="absolute top-0 right-0 p-3">
                       <CheckCircle2 className="w-5 h-5 text-amber-500" />
                    </div>
                  )}
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">
                    {item.rateType.replace('daily', 'per day').replace('percent', '% per month')}
                  </span>
                  <h4 className={cn("text-sm font-bold leading-tight", activeItem === key ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900")}>
                    {item.name}
                  </h4>
                </button>
              ))}
           </div>

           {/* Input Section */}
           <Card className="rounded-[3rem] border-slate-100 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-10 space-y-10">
                {itemData.rateType !== "flat" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Delay Period</Label>
                        <h3 className="text-lg font-bold text-slate-900">How many days were missed?</h3>
                      </div>
                      <div className="text-3xl font-black text-amber-600">{delay} <span className="text-xs font-bold text-slate-300 uppercase">Days</span></div>
                    </div>
                    <Slider 
                      value={[delay]} 
                      onValueChange={v => setDelay(v[0])} 
                      max={180} 
                      step={1} 
                      className="py-4"
                    />
                    <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest">
                       <span>1 Day Delay</span>
                       <span>6 Months Delay</span>
                    </div>
                  </div>
                )}

                {itemData.rateType === "percent" && (
                  <div className="space-y-6 pt-6 border-t border-slate-50">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Amount</Label>
                      <h3 className="text-lg font-bold text-slate-900">Total Tax Payable (₹)</h3>
                    </div>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</div>
                      <Input 
                        type="number"
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        className="h-16 pl-10 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white text-xl font-bold text-slate-900"
                      />
                    </div>
                  </div>
                )}

                <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-100/50 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Info className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Statutory Provision</span>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {itemData.desc}
                    </p>
                  </div>
                </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Compound Effect</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Penalties like GSTR-3B accumulate daily. Filing even 1 day earlier can save you ₹50 - ₹200 depending on your return type.
                </p>
              </div>
              <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Deadline Alerts</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Never pay penalties again. Use our Compliance Calendar to set automated email alerts for all your statutory due dates.
                </p>
                <Link href="/compliance-calendar">
                  <Button variant="link" className="p-0 h-auto text-indigo-600 font-bold text-xs uppercase tracking-widest">
                    Open Calendar <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </div>
           </div>
        </div>
      </CalcLayout>
    </>
  );
}
