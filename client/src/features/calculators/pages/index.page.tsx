import React, { useState, useMemo } from "react";
import { m } from "framer-motion";
import {
  Search, TrendingUp, Calculator, Coins, ArrowRight, CheckCircle,
  Users, Award, Home, Briefcase, GraduationCap, Car, IndianRupee,
  Zap, Shield, FileText, Building2, PiggyBank, BarChart3, Sparkles,
  Bot, FileSpreadsheet, Scan, Upload, Star, Clock, ChevronRight, Tag, Calendar, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MetaSEO from "@/components/seo/MetaSEO";
import Breadcrumb from "@/components/Breadcrumb";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────── */

const calculatorCategories = [
  {
    id: "ai-tools",
    name: "AI-Powered Tools",
    icon: Bot,
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "#ede9fe",
    calculators: [
      { name: "AI Tax Assistant",        href: "/tax-assistant",          icon: Bot,          isNew: true,  isPopular: true,  description: "Instant answers to tax questions" },
      { name: "Form 16 Parser",          href: "/form16-parser",          icon: Scan,         isNew: true,  description: "Extract salary data from Form 16" },
      { name: "Bank Statement Analyzer", href: "/bank-analyzer",          icon: FileSpreadsheet, isNew: true, description: "Auto-categorize transactions" },
      { name: "AIS / 26AS Viewer",       href: "/ais-viewer",            icon: FileText,     isNew: true,  description: "Analyze your tax credit statement" },
      { name: "Capital Gains Import",    href: "/capital-gains-import",  icon: Upload,       isNew: true,  description: "Import broker statements" },
    ],
  },
  {
    id: "tax",
    name: "Tax Calculators",
    icon: FileText,
    color: "#0369a1",
    bg: "#f0f9ff",
    border: "#bae6fd",
    calculators: [
      { name: "Income Tax Calculator",   href: "/calculators/income-tax",      icon: IndianRupee, isPopular: true, description: "AY 2025-26 tax calculation" },
      { name: "HRA Calculator",          href: "/calculators/hra",             icon: Home,                         description: "House rent allowance benefits" },
      { name: "TDS Calculator",          href: "/calculators/tds",             icon: Shield,                       description: "Tax deducted at source" },
      { name: "Capital Gains Calc.",     href: "/calculators/capital-gains",   icon: BarChart3,                    description: "LTCG / STCG calculation" },
      { name: "Tax Regime Comparator",   href: "/calculators/regime-comparator", icon: Zap,     isNew: true,      description: "Old vs New regime" },
      { name: "Advance Tax Calculator",  href: "/calculators/advance-tax",     icon: Clock,   isNew: true,        description: "Quarterly tax payments" },
      { name: "HSN / SAC Code Finder",   href: "/calculators/hsn-finder",      icon: Tag,     isNew: true,        description: "GST rates for goods & services" },
    ],
  },
  {
    id: "investment",
    name: "Investment Tools",
    icon: PiggyBank,
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    calculators: [
      { name: "SIP Calculator",         href: "/calculators/sip",              icon: TrendingUp, isPopular: true, description: "Systematic investment planning" },
      { name: "PPF Calculator",         href: "/calculators/ppf",              icon: Shield,                      description: "Public Provident Fund returns" },
      { name: "FD Calculator",          href: "/calculators/fd",               icon: Building2,                   description: "Fixed deposit maturity value" },
      { name: "NPS Calculator",         href: "/calculators/nps",              icon: Award,                       description: "National Pension Scheme" },
      { name: "ELSS Calculator",        href: "/calculators/elss",             icon: Coins,                       description: "Tax-saving mutual funds" },
      { name: "Tax Loss Harvesting",    href: "/tax-loss-harvesting",          icon: TrendingUp, isNew: true,     description: "Optimize capital gains tax" },
    ],
  },
  {
    id: "loan",
    name: "Loan Calculators",
    icon: Briefcase,
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fde68a",
    calculators: [
      { name: "EMI Calculator",          href: "/calculators/emi",             icon: Calculator, isPopular: true, description: "Monthly installment calculator" },
      { name: "Loan Calculator",         href: "/calculators/home-loan",       icon: Briefcase,                   description: "Home, Car, Personal & Education" },
      { name: "Compliance Calendar",      href: "/compliance-calendar",         icon: Calendar,    isPopular: true, description: "Track all your statutory deadlines" },
      { name: "Penalty Calculator",       href: "/calculators/penalty",         icon: ShieldAlert,                  description: "GST & Tax penalty estimator" },
    ],
  },
];

const stats = [
  { value: "2.5M+",  label: "Calculations Done", icon: Calculator },
  { value: "150K+",  label: "Monthly Users",      icon: Users },
  { value: "₹850Cr+", label: "Tax Saved",         icon: Coins },
  { value: "99.8%",  label: "Accuracy Rate",      icon: Star },
];

/* ─────────────────────────────────────────────────────────
   HELPER COMPONENTS
 ───────────────────────────────────────────────────────── */
function CalculatorPattern({ color }: { color: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.015] pointer-events-none group-hover:opacity-[0.04] transition-opacity duration-700" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="calc-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill={color} />
          <path d="M30 10l-4 4m0-4l4 4M10 30h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <circle cx="25" cy="25" r="3" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#calc-pattern)" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   TOOL CARD
 ───────────────────────────────────────────────────────── */
function ToolCard({ calc, color, bg, border, index }: { calc: any; color: string; bg: string; border: string; index: number }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className="h-full"
    >
      <Link href={calc.href}>
        <div 
          className="group relative flex flex-col h-full bg-white/70 backdrop-blur-md rounded-[2rem] border border-white/80 p-6 hover:border-white hover:bg-white/90 transition-all duration-500 cursor-pointer overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] active:scale-[0.98]"
          style={{ 
            boxShadow: `0 10px 30px -10px ${color}15`
          }}
        >
          <CalculatorPattern color={color} />
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 blur-[60px] opacity-20 transition-all duration-500 group-hover:opacity-30 group-hover:scale-125" style={{ background: color }} />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-5">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-lg" 
                style={{ 
                  background: `linear-gradient(135deg, ${bg} 0%, white 100%)`, 
                  border: `1.5px solid ${border}` 
                }}
              >
                <calc.icon className="w-6 h-6 transition-transform duration-500" style={{ color }} />
              </div>

              {(calc.isPopular || calc.isNew) && (
                <div className="flex flex-col gap-1 items-end">
                  {calc.isPopular && (
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-600 border border-amber-400/20 backdrop-blur-sm">
                      Popular
                    </span>
                  )}
                  {calc.isNew && (
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg bg-violet-400/10 text-violet-600 border border-violet-400/20 backdrop-blur-sm">
                      Brand New
                    </span>
                  )}
                </div>
              )}
            </div>

            <h3 className="text-base font-black text-slate-800 mb-2 leading-tight group-hover:text-slate-900 transition-colors">
              {calc.name}
            </h3>
            <p className="text-xs font-medium text-slate-500 leading-relaxed flex-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {calc.description}
            </p>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100/50">
              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-all">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Free Tool</span>
              </div>
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 group-hover:translate-x-1 shadow-sm group-hover:shadow-md" 
                style={{ background: `linear-gradient(135deg, white 0%, ${bg} 100%)`, border: `1px solid ${border}` }}
              >
                <ChevronRight className="w-4 h-4" style={{ color }} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </m.div>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */
export default function CalculatorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const allCalcs = calculatorCategories.flatMap((cat) =>
    cat.calculators.map((c) => ({ ...c, categoryId: cat.id, color: cat.color, bg: cat.bg, border: cat.border }))
  );

  const filtered = useMemo(() => {
    return allCalcs.filter((c) => {
      const inSearch = !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase());
      const inCat = activeCategory === "all" || c.categoryId === activeCategory;
      return inSearch && inCat;
    });
  }, [searchTerm, activeCategory]);

  const isFiltering = searchTerm !== "" || activeCategory !== "all";

  return (
    <>
      <MetaSEO
        title="Tax & Financial Calculators \u2014 Income Tax, SIP, EMI, HRA | MyeCA.in"
        description="Free professional calculators for income tax AY 2025-26, SIP returns, EMI, HRA, PPF and more. 99.8% accuracy with CA-verified algorithms."
        keywords={[
          "income tax calculator", "SIP calculator", "EMI calculator", "HRA calculator", "PPF calculator"
        ]}
        type="calculator"
        calculatorData={{
          type: "Financial Planning Tools",
          features: ["Income Tax Calculator", "SIP Calculator", "EMI Calculator"],
          accuracy: "99.8%",
          updates: "AY 2025-26"
        }}
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Calculators", url: "/calculators" }]}
      />

      <div className="min-h-screen bg-slate-50">

        {/* Hero Section - Split Layout */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-slate-100/30 border-b border-slate-200/60 transition-all duration-500">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-100/40 blur-[140px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-100/30 blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 pb-16">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:text-left text-center">
              {/* Left Side: Content & Search */}
              <div className="flex-1 max-w-3xl">
                <m.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  Financial Intelligence Hub
                </m.div>

                <m.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-5"
                >
                  Calculate with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Precision</span>
                </m.h1>

                <m.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-slate-500 max-w-xl lg:mx-0 mx-auto mb-10 font-medium opacity-80"
                >
                  Professional-grade calculators for tax, investments & loans — expert-verified and always up to date.
                </m.p>

                <m.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-2xl"
                >
                  <div className="flex flex-col md:flex-row gap-3 p-2 bg-white rounded-[2rem] border border-slate-200/60 shadow-2xl shadow-slate-200/50">
                    <div className="relative flex-1">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search calculators..."
                        className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-slate-700 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                      />
                    </div>
                    <div className="flex gap-1 p-1 bg-slate-50 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
                      {[{ id: "all", label: "All" }, ...calculatorCategories.map(c => ({ id: c.id, label: c.name.split(' ')[0] }))].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setActiveCategory(opt.id)}
                          className={cn(
                            "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                            activeCategory === opt.id
                              ? "bg-slate-900 text-white shadow-lg shadow-slate-300"
                              : "text-slate-400 hover:text-slate-700 hover:bg-white"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </m.div>
              </div>

              {/* Right Side: Stats Grid */}
              <div className="w-full lg:w-[440px] shrink-0">
                <m.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25, type: "spring", stiffness: 100 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {stats.map((s, idx) => (
                    <m.div
                      key={s.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="group bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        <s.icon className="w-6 h-6" />
                      </div>
                      <div className="text-2xl font-black text-slate-800 tabular-nums tracking-tighter leading-none mb-2">
                        {s.value}
                      </div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] leading-tight opacity-80">
                        {s.label}
                      </div>
                    </m.div>
                  ))}
                </m.div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Grid */}
        <section className="max-w-7xl mx-auto px-4 py-14">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <Calculator className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-semibold text-lg">No tools found for "{searchTerm}"</p>
            </div>
          ) : isFiltering ? (
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-6">{filtered.length} tool{filtered.length !== 1 ? "s" : ""} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((c, i) => <ToolCard key={i} calc={c} color={c.color} bg={c.bg} border={c.border} index={i} />)}
              </div>
            </div>
          ) : (
            <div className="space-y-14">
              {calculatorCategories.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                      <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">{cat.name}</h2>
                    <div className="flex-1 h-px bg-slate-200" />
                    <button onClick={() => setActiveCategory(cat.id)} className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-0.5 transition-colors whitespace-nowrap">
                      See all <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {cat.calculators.map((calc, i) => (
                      <ToolCard key={i} calc={calc} color={cat.color} bg={cat.bg} border={cat.border} index={i} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trust Strip */}
        <section className="border-t border-slate-200 bg-white py-12">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Sparkles, label: "100% Free",     sub: "No charges, ever" },
              { icon: Clock,    label: "Live Rates",    sub: "Always up to date" },
              { icon: CheckCircle, label: "CA-Verified", sub: "Expert-approved math" },
              { icon: FileText, label: "PDF Reports",   sub: "Download summaries" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-bold text-slate-700">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-20 border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              Expert Consultation
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Need a <span className="text-blue-600">CA's Advice?</span></h2>
            <p className="text-slate-500 text-lg mb-10 font-medium">Our calculators give you the numbers. Our Chartered Accountants give you the strategy.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/itr/filing">
                <Button size="lg" className="px-10 h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-0.5">
                  Start ITR Filing
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" className="px-10 h-14 rounded-xl border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition-all hover:-translate-y-0.5 shadow-sm">
                  Explore Services
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}