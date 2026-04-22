import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { calculateCapitalGains } from "@/lib/tax-calculations";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { 
  TrendingUp, Coins, Calendar, Target, 
  IndianRupee, Receipt, 
  Building2, LineChart, Sparkles, AlertTriangle, Zap,
  Clock, ArrowRight, ShieldCheck, Calculator, FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

const assetTypes = [
  { value: 'equity', label: 'Equity / Mutual Funds', icon: LineChart, ltcg: '> 1 yr', ltcgRate: '12.5%', stcgRate: '20%' },
  { value: 'property', label: 'Real Estate / Property', icon: Building2, ltcg: '> 2 yrs', ltcgRate: '12.5%', stcgRate: 'Slab' },
  { value: 'gold', label: 'Gold / Precious Metals', icon: Coins, ltcg: '> 2 yrs', ltcgRate: '12.5%', stcgRate: 'Slab' },
  { value: 'bonds', label: 'Bonds / Debentures', icon: Receipt, ltcg: '> 2 yrs', ltcgRate: '12.5%', stcgRate: 'Slab' }
];

export default function CapitalGainsCalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState<number>(100000);
  const [salePrice, setSalePrice] = useState<number>(150000);
  const [purchaseDate, setPurchaseDate] = useState<string>('2023-01-01');
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [assetType, setAssetType] = useState<string>('equity');

  const result = useMemo(() => {
    if (purchasePrice > 0 && salePrice > 0 && purchaseDate && saleDate && assetType) {
      return calculateCapitalGains(
        purchasePrice,
        salePrice,
        new Date(purchaseDate),
        new Date(saleDate),
        assetType as 'equity' | 'property' | 'gold' | 'bonds'
      );
    }
    return null;
  }, [purchasePrice, salePrice, purchaseDate, saleDate, assetType]);

  const seo = getSEOConfig('/calculators/capital-gains');
  const selectedAssetType = assetTypes.find(type => type.value === assetType);

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  return (
    <>
      <MetaSEO
        title={seo?.title || "Capital Gains Calculator 2025 | STCG & LTCG Tax | MyeCA.in"}
        description={seo?.description || "Calculate capital gains tax for equity, property, and gold under new Budget 2024 rules. Instant STCG & LTCG liability estimates."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="Capital Gains Calculator"
        description="Determine your tax liability on investments across Equity, Property, and Gold with latest FY 2024-25 rules."
        category="Investment Tax"
        icon={<TrendingUp className="w-6 h-6" />}
        variant="emerald"
        breadcrumbItems={[{ name: "Capital Gains" }]}
      />

      <CalcLayout
        variant="emerald"
        complianceFacts={[
          { title: "New LTCG Rate", content: "Post Budget 2024, LTCG tax on all assets is standardized at 12.5% without indexation benefits." },
          { title: "Equity Exemption", content: "LTCG on listed equity and equity-oriented mutual funds is exempt up to ₹1.25 Lakh per financial year." },
          { title: "Holding Period", content: "Holding period for LTCG is 1 year for listed equity and 2 years for most other assets like property and gold." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Tax Summary">
            <div className="space-y-1 pb-6 border-b border-white/20">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Net Tax Payable</p>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={result?.taxPayable} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className={cn(
                    "text-4xl font-bold tracking-tight tabular-nums",
                    (result?.taxPayable || 0) > 0 ? "text-red-600" : "text-emerald-600"
                  )}
                >
                  {fmt(result?.taxPayable || 0)}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="space-y-4 pt-6">
              <CalcResultRow label="Total Gain/Loss" value={fmt(result?.capitalGain || 0)} variant={ (result?.capitalGain || 0) >= 0 ? "success" : "highlight" } />
              <CalcResultRow label="Gain Type" value={result?.gainType || "—"} />
              <CalcResultRow label="Tax Rate" value={`${result?.taxRate || 0}%`} />
              
              <div className="pt-6 border-t border-white/20 space-y-3">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Holding Period</span>
                  <span className="text-slate-900 font-bold">{result?.holdingPeriod} Years</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Net In Hand</span>
                  <span className="text-slate-900 font-extrabold">{fmt(result?.netGain || 0)}</span>
                </div>
              </div>
            </div>

            <Link href="/services/tax-planning">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200 mt-6 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Optimise Gains with CA
              </button>
            </Link>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="Asset Configuration" icon={<Coins className="w-5 h-5" />}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {assetTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setAssetType(type.value)}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all text-left",
                      assetType === type.value
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/10"
                        : "border-slate-50 bg-slate-50 text-slate-600 hover:border-emerald-200"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <div className={cn("p-1.5 rounded-lg", assetType === type.value ? "bg-white/20" : "bg-white shadow-sm")}>
                          <Icon className="w-4 h-4" />
                       </div>
                    </div>
                    <p className="text-xs font-bold leading-tight">{type.label}</p>
                    <p className={cn("text-[10px] font-bold mt-1 opacity-80", assetType === type.value ? "text-emerald-50" : "text-slate-400 uppercase tracking-tight")}>
                      LTCG {type.ltcgRate} | STCG {type.stcgRate}
                    </p>
                  </button>
                );
              })}
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Purchase Date</label>
                  <div className="relative">
                    <Input 
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="h-12 pl-10 rounded-xl border-slate-100 bg-slate-50 font-bold text-sm focus:ring-2 focus:ring-emerald-100"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Sale Date</label>
                  <div className="relative">
                    <Input 
                      type="date"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      className="h-12 pl-10 rounded-xl border-slate-100 bg-slate-50 font-bold text-sm focus:ring-2 focus:ring-emerald-100"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
             </div>

             <CalcInputGroup label="Purchase Price (Buy)" badgeValue={fmt(purchasePrice)}>
                <div className="relative">
                  <Input 
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="h-14 pl-10 rounded-xl border-slate-100 bg-slate-50 font-bold text-lg focus:ring-2 focus:ring-emerald-100"
                  />
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
             </CalcInputGroup>

             <CalcInputGroup label="Sale Price (Sell)" badgeValue={fmt(salePrice)}>
                <div className="relative">
                  <Input 
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="h-14 pl-10 rounded-xl border-slate-100 bg-slate-50 font-bold text-lg focus:ring-2 focus:ring-emerald-100"
                  />
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
             </CalcInputGroup>
          </CalcInputCard>

          <CalcInputCard title="Holding Insight" icon={<Clock className="w-5 h-5" />}>
             <div className="space-y-6">
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600 shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Duration Breakdown</p>
                    <p className="text-xs text-slate-500 font-medium">
                      You held this asset for <span className="text-emerald-600 font-bold">{result?.holdingPeriodDays} days</span>.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                     <AlertTriangle className="w-4 h-4 text-indigo-600" />
                     <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Taxation Note</p>
                  </div>
                  <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                    {assetType === 'equity' 
                      ? "Equity assets held for > 12 months qualify for LTCG at 12.5% with a ₹1.25L annual exemption limit." 
                      : "Non-equity assets like property and gold require 24 months of holding for LTCG benefits."}
                  </p>
                </div>
             </div>
          </CalcInputCard>
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Tax Harvesting",
              desc: "Sell and reinvest your equity holdings annually to utilize the ₹1.25 Lakh LTCG exemption and reduce your overall tax liability."
            },
            {
              icon: <Zap className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Section 54 Benefits",
              desc: "Save tax on real estate gains by reinvesting the proceeds into another residential property within specified timelines."
            },
            {
              icon: <Calculator className="w-5 h-5" />,
              iconBg: "bg-blue-50 text-blue-600",
              title: "Loss Set-off",
              desc: "Short-term capital losses can be set off against both STCG and LTCG, while long-term losses can only be set off against LTCG."
            }
          ]}
          howItWorks={{
            title: "Budget 2024 Changes",
            description: "The Union Budget 2024 introduced significant changes to the capital gains tax structure in India.",
            steps: [
              { title: "Standard LTCG", desc: "Long-term capital gains on all assets are now taxed at a flat rate of 12.5% without indexation." },
              { title: "Increased STCG", desc: "Short-term capital gains (STCG) on listed equity have been increased from 15% to 20%." },
              { title: "Higher Exemption", desc: "The annual exemption limit for LTCG on equity has been increased from ₹1 Lakh to ₹1.25 Lakhs." }
            ]
          }}
          faqs={[
            { q: "What is the holding period for property?", a: "Real estate is considered long-term if held for more than 2 years (24 months) from the date of acquisition." },
            { q: "Is indexation benefit available for gold?", a: "No, as per the new rules, indexation benefits have been removed for all assets including gold and debt funds." },
            { q: "Can I carry forward capital losses?", a: "Yes, both short-term and long-term capital losses can be carried forward for up to 8 assessment years." }
          ]}
        />
      </CalcLayout>
    </>
  );
}