import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateCapitalGains } from "@/lib/tax-calculations";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { 
  TrendingUp, Coins, Calendar, Target, 
  IndianRupee, Receipt, 
  Building2, LineChart, Sparkles, AlertTriangle, Zap,
  Clock, ArrowRight, ShieldCheck, Calculator, FileSpreadsheet,
  Star, Info, Lock, Headphones, Award, BarChart3,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

const assetTypes = [
  { value: 'equity', label: 'Equity / MF', icon: LineChart, ltcg: '> 1 yr', ltcgRate: '12.5%', stcgRate: '20%' },
  { value: 'property', label: 'Real Estate', icon: Building2, ltcg: '> 2 yrs', ltcgRate: '12.5%', stcgRate: 'Slab' },
  { value: 'gold', label: 'Gold / Metals', icon: Coins, ltcg: '> 2 yrs', ltcgRate: '12.5%', stcgRate: 'Slab' },
  { value: 'bonds', label: 'Bonds / Debts', icon: Receipt, ltcg: '> 2 yrs', ltcgRate: '12.5%', stcgRate: 'Slab' }
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
        title={seo?.title || "Capital Gains Calculator 2025 | STCG & LTCG Tax | MyeCA.in"}
        description={seo?.description || "Calculate capital gains tax for equity, property, and gold under new Budget 2024 rules. Instant STCG & LTCG liability estimates."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Modern Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#027A48] mb-4 uppercase tracking-widest bg-[#ECFDF3] w-fit px-4 py-1.5 rounded-full border border-[#D1FADF]">
            <Sparkles className="w-3.5 h-3.5" />
            Investment Tax Tool
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-[#101828] tracking-tight">
                Capital <span className="text-[#027A48]">Gains</span>
              </h1>
              <p className="text-[#667085] text-base max-w-xl font-medium">
                Calculate STCG & LTCG liability based on latest Budget 2024 rules.
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
                <p className="text-xs font-bold text-[#027A48]">25k+ Investors</p>
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
              <div className="absolute top-0 right-0 p-6 opacity-5 text-[#027A48]">
                <Coins className="w-24 h-24" />
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] flex items-center justify-center text-[#027A48] border border-[#D1FADF]">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#101828]">Asset Configuration</h2>
                  <p className="text-xs text-[#667085]">Select asset type and transaction details</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Asset Type Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {assetTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setAssetType(type.value)}
                        className={cn(
                          "p-3 rounded-2xl border-2 transition-all text-left relative group",
                          assetType === type.value
                            ? "border-[#027A48] bg-[#F6FEF9]"
                            : "border-[#EAECF0] bg-white hover:border-[#D1FADF]"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-all",
                          assetType === type.value ? "bg-[#027A48] text-white" : "bg-[#F9FAFB] text-[#667085] group-hover:bg-[#F2F4F7]"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <p className={cn("text-[11px] font-bold leading-tight", assetType === type.value ? "text-[#101828]" : "text-[#344054]")}>{type.label}</p>
                        <p className="text-[9px] text-[#667085] font-medium mt-0.5">LTCG {type.ltcgRate}</p>
                        {assetType === type.value && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#027A48]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#F2F4F7]">
                  {/* Purchase Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#667085] uppercase tracking-widest px-1">Purchase Date</label>
                    <div className="relative group">
                      <input 
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="w-full h-10 pl-10 pr-3 rounded-lg border border-[#EAECF0] bg-white font-bold text-sm focus:ring-1 focus:ring-[#027A48]/10 focus:border-[#027A48] outline-none transition-all"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3] group-focus-within:text-[#027A48] transition-colors" />
                    </div>
                  </div>

                  {/* Sale Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#667085] uppercase tracking-widest px-1">Sale Date</label>
                    <div className="relative group">
                      <input 
                        type="date"
                        value={saleDate}
                        onChange={(e) => setSaleDate(e.target.value)}
                        className="w-full h-10 pl-10 pr-3 rounded-lg border border-[#EAECF0] bg-white font-bold text-sm focus:ring-1 focus:ring-[#027A48]/10 focus:border-[#027A48] outline-none transition-all"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3] group-focus-within:text-[#027A48] transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {/* Purchase Price */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#344054]">Purchase Price</span>
                        <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                      </div>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm focus-within:border-[#027A48] focus-within:ring-1 focus-within:ring-[#027A48]/10 transition-all">
                        <span className="text-xs font-bold text-[#667085]">₹</span>
                        <input 
                          type="number"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sale Price */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#344054]">Sale Price</span>
                        <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                      </div>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm focus-within:border-[#027A48] focus-within:ring-1 focus-within:ring-[#027A48]/10 transition-all">
                        <span className="text-xs font-bold text-[#667085]">₹</span>
                        <input 
                          type="number"
                          value={salePrice}
                          onChange={(e) => setSalePrice(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-bold text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Holding Insight Card */}
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm overflow-hidden relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F9FAFB] flex items-center justify-center text-[#101828] border border-[#EAECF0]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#101828]">Holding Insight</h2>
                  <p className="text-xs text-[#667085]">Duration and taxation eligibility</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0]">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#027A48] shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Holding Period</p>
                    <p className="text-sm font-black text-[#101828]">
                      {result?.holdingPeriodDays} Days <span className="text-[#667085] font-medium text-xs">({result?.holdingPeriod} Yrs)</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F6FEF9] border border-[#D1FADF] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#027A48] flex items-center justify-center text-white shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-[#027A48] font-bold leading-tight">
                    {result?.gainType} Gain detected. Applied rate: <span className="font-black underline">{result?.taxRate}%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm h-full flex flex-col sticky top-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-[#101828]">Tax Summary</h2>
                <div className={cn(
                  "text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider",
                  (result?.taxPayable || 0) > 0 ? "bg-[#FEF3F2] text-[#B42318]" : "bg-[#ECFDF3] text-[#027A48]"
                )}>
                  {selectedAssetType?.value}
                </div>
              </div>
              <p className="text-sm text-[#667085] mb-4">Final capital gain results</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Total Gain/Loss */}
                <div className={cn(
                  "p-4 rounded-[20px] border-2 transition-all",
                  (result?.capitalGain || 0) >= 0 ? "bg-[#F6FEF9] border-[#ECFDF3]" : "bg-[#FFFBFA] border-[#FEF3F2]"
                )}>
                  <span className="text-xs font-bold text-[#101828] block mb-0.5">Total Gain/Loss</span>
                  <span className="text-[10px] text-[#667085] block mb-2">Net appreciation</span>
                  <span className={cn(
                    "text-2xl font-bold block mb-0.5 tabular-nums",
                    (result?.capitalGain || 0) >= 0 ? "text-[#027A48]" : "text-[#B42318]"
                  )}>
                    {fmt(result?.capitalGain || 0)}
                  </span>
                  <span className="text-[10px] text-[#98A2B3] font-medium uppercase tracking-widest">{result?.gainType}</span>
                </div>

                {/* Net Tax Payable */}
                <div className="p-4 rounded-[20px] border-2 border-[#EAECF0] bg-[#F9FAFB]">
                  <span className="text-xs font-bold text-[#101828] block mb-0.5">Tax Payable</span>
                  <span className="text-[10px] text-[#667085] block mb-2">Final liability</span>
                  <span className="text-2xl font-bold block mb-0.5 text-[#B42318] tabular-nums">
                    {fmt(result?.taxPayable || 0)}
                  </span>
                  <span className="text-[10px] text-[#98A2B3] font-medium uppercase tracking-widest">Post Exemption</span>
                </div>
              </div>

              {/* Net In Hand Highlight */}
              <div className="bg-[#F5F8FF] rounded-[20px] border border-[#D1E0FF] p-4 flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#E0E7FF] flex items-center justify-center text-[#444CE7] shrink-0">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#475467]">Net In-Hand Profit</span>
                    <span className="text-2xl font-bold text-[#444CE7] tabular-nums">{fmt(result?.netGain || 0)}</span>
                  </div>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    Final profit after deducting <span className="font-bold text-[#101828]">all taxes</span>.
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-grow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Purchase Value</span>
                  <span className="text-xs font-bold text-[#101828] text-right">{fmt(purchasePrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Sale Value</span>
                  <span className="text-xs font-bold text-[#101828] text-right">{fmt(salePrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#667085]">Exemption Applied</span>
                  <span className="text-xs font-bold text-[#027A48] text-right">
                    {assetType === 'equity' && (result?.capitalGain || 0) > 125000 ? "₹ 1,25,000" : "N/A"}
                  </span>
                </div>
                <div className="pt-4 border-t border-[#F2F4F7] flex items-center justify-between">
                  <span className="text-sm font-bold text-[#101828]">Tax Rate (%)</span>
                  <span className="text-base font-bold text-[#B42318] text-right">{result?.taxRate}%</span>
                </div>
              </div>

              {/* Expert Action Box */}
              <div className="mt-6 bg-[#F6FEF9] border border-[#D1FADF] rounded-[20px] p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#D1FADF] flex items-center justify-center text-[#027A48] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-0.5">Optimize Gains?</h4>
                  <p className="text-xs text-[#667085] mb-2">Save tax on gains with expert planning</p>
                  <Link href="/services/tax-planning">
                    <button className="text-[13px] font-bold text-[#027A48] flex items-center gap-2 hover:gap-3 transition-all">
                      Consult a CA Expert
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
            { icon: <Award className="w-5 h-5" />, label: "100% Accurate", desc: "As per latest Budget 2024" },
            { icon: <Lock className="w-5 h-5" />, label: "Secure & Private", desc: "Your data is fully encrypted" },
            { icon: <BarChart3 className="w-5 h-5" />, label: "Save & Compare", desc: "Save scenarios and compare later" }
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
        </div>
      </div>
    </div>
  );
}