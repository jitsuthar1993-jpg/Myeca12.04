import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { calculateHRA } from "@/lib/tax-calculations";
import {
  Building2,
  ShieldCheck,
  Zap,
  IndianRupee,
  Sparkles,
  CheckCircle2,
  Receipt,
  BadgeCheck,
  FileQuestion,
  Info
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { getSEOConfig } from "@/config/seo.config";
import { cn } from "@/lib/utils";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";

const CHART_COLORS = ["#2563eb", "#e8ecf1"];

export default function HRACalculator() {
  const seo = getSEOConfig("/calculators/hra");
  const [salary, setSalary] = useState<number>(1200000);
  const [hra, setHra] = useState<number>(400000);
  const [rent, setRent] = useState<number>(300000);
  const [city, setCity] = useState<"metro" | "non-metro">("metro");

  const result = calculateHRA(salary, hra, rent, city);

  const chartData = [
    { name: "Exempt", value: result.exemption },
    { name: "Taxable", value: result.taxableHRA },
  ];

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const pct = hra > 0 ? Math.round((result.exemption / hra) * 100) : 0;

  const breakdownItems = [
    {
      label: "Actual HRA Received",
      value: hra,
      color: "text-blue-600",
    },
    {
      label: "Rent − 10% of Basic",
      value: result.breakdown.rentMinus10Percent,
      color: "text-violet-600",
    },
    {
      label: city === "metro" ? "50% of Basic (Metro)" : "40% of Basic (Non-Metro)",
      value: result.breakdown.cityAllowance,
      color: "text-emerald-600",
    },
  ];

  const minVal = Math.min(hra, result.breakdown.rentMinus10Percent, result.breakdown.cityAllowance);
  const minIndex = breakdownItems.findIndex((b) => b.value === minVal);

  return (
    <>
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

      <CalcHero 
        title="HRA Calculator"
        description="Calculate your HRA exemption under Section 10(13A) with professional tax optimization."
        category="Tax Tools"
        icon={<Building2 className="w-6 h-6" />}
        variant="emerald"
        breadcrumbItems={[{ name: "HRA Calculator" }]}
      />

      <CalcLayout
        variant="emerald"
        complianceFacts={[
          { title: "Section 10(13A)", content: "HRA exemption is only available if you live in a rented house and is restricted to the minimum of the three prescribed rules." },
          { title: "Landlord PAN", content: "Mandatory if the annual rent exceeds ₹1,00,000 for claiming the exemption with your employer." },
          { title: "Old vs New Regime", content: "HRA exemption is ONLY available under the Old Tax Regime. The New Tax Regime does not support HRA claims." }
        ]}
        faqs={[
          { q: "Can I pay rent to my parents?", a: "Yes, you can pay rent to parents and claim HRA, provided they declare it as income and there is a formal rental agreement." },
          { q: "Is landlord PAN mandatory?", a: "Yes, if your annual rent exceeds ₹1 Lakh, the landlord's PAN is required by the IT Department." },
          { q: "Can I claim both HRA and Home Loan interest?", a: "Yes, if you live in a rented house while owning a home in a different city, you can claim both deductions." }
        ]}
        sidebar={
          <CalcGlassSidebar title="HRA Summary">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{pct}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">HRA Exemption</p>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={result.exemption} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums"
                  >
                    {fmt(result.exemption)}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <CalcResultRow label="Total Salary" value={fmt(salary)} />
              <CalcResultRow label="Actual HRA" value={fmt(hra)} />
              <CalcResultRow label="Taxable HRA" value={fmt(result.taxableHRA)} variant="warning" />
              <CalcResultRow 
                label="Total Tax Savings" 
                value={fmt(result.exemption * 0.3)} 
                variant="success" 
                className="pt-4 border-t border-white/20" 
              />
              <p className="text-[10px] text-slate-400 italic text-center mt-2">
                *Estimated at 30% tax bracket
              </p>
            </div>

            <Link href="/services/tax-filing">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200 mt-4 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Plan with CA Advisory
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <CalcInputCard title="Salary & Rent Details" icon={<Receipt className="w-5 h-5" />}>
          <CalcInputGroup 
            label="Annual Basic Salary" 
            badgeValue={fmt(salary)}
          >
            <Slider 
              value={[salary]} 
              onValueChange={(v) => setSalary(v[0])} 
              max={5000000} 
              min={100000} 
              step={10000} 
            />
          </CalcInputGroup>

          <CalcInputGroup 
            label="Annual HRA Received" 
            badgeValue={fmt(hra)}
          >
            <Slider 
              value={[hra]} 
              onValueChange={(v) => setHra(v[0])} 
              max={2000000} 
              min={0} 
              step={5000} 
            />
          </CalcInputGroup>

          <CalcInputGroup 
            label="Annual Rent Paid" 
            badgeValue={fmt(rent)}
          >
            <Slider 
              value={[rent]} 
              onValueChange={(v) => setRent(v[0])} 
              max={2000000} 
              min={0} 
              step={5000} 
            />
          </CalcInputGroup>

          <div className="pt-6 border-t border-slate-50">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mb-6 block">
              Residential City Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "metro" as const, label: "Metro City", sub: "50% of Basic", icon: <Building2 className="w-4 h-4" /> },
                { id: "non-metro" as const, label: "Other City", sub: "40% of Basic", icon: <Building2 className="w-4 h-4 opacity-50" /> },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCity(opt.id)}
                  className={cn(
                    "p-5 rounded-2xl border-2 transition-all text-left",
                    city === opt.id
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                      : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {opt.icon}
                    <p className="text-sm font-bold">{opt.label}</p>
                  </div>
                  <p className={cn(
                    "text-[10px] font-medium",
                    city === opt.id ? "text-emerald-100/80" : "text-slate-400"
                  )}>
                    {opt.sub}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </CalcInputCard>

        <CalcInputCard title="Exemption Breakdown" icon={<Sparkles className="w-5 h-5" />}>
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium italic mb-6">
              Your HRA exemption is the minimum of these three rules:
            </p>
            {breakdownItems.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between p-5 rounded-2xl border transition-all",
                  idx === minIndex
                    ? "bg-emerald-50 border-emerald-100 ring-1 ring-emerald-500/20 shadow-sm"
                    : "bg-slate-50/50 border-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                    idx === minIndex ? "bg-emerald-600 text-white" : "border border-slate-200"
                  )}>
                    {idx === minIndex ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5 text-slate-300" />}
                  </div>
                  <span className={cn(
                    "text-sm",
                    idx === minIndex ? "font-bold text-slate-800" : "font-medium text-slate-500"
                  )}>
                    {item.label}
                  </span>
                </div>
                <span className={cn(
                  "text-sm font-bold tabular-nums",
                  idx === minIndex ? "text-emerald-600" : "text-slate-700"
                )}>
                  {fmt(item.value)}
                </span>
              </div>
            ))}
          </div>
        </CalcInputCard>
      </CalcLayout>
    </>
  );
}
