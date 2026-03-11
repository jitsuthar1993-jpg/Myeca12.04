import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search, TrendingUp, Calculator, Coins, ArrowRight, CheckCircle,
  Users, Award, Home, Briefcase, GraduationCap, Car, IndianRupee,
  Zap, Shield, FileText, Building2, PiggyBank, BarChart3, Sparkles,
  Bot, FileSpreadsheet, Scan, Upload, Star, Clock, ChevronRight
} from "lucide-react";
import SEO from "@/components/SEO";
import Breadcrumb from "@/components/Breadcrumb";
import StructuredData from "@/components/StructuredData";
import { Link } from "wouter";

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
      { name: "Home Loan Calculator",    href: "/calculators/home-loan",       icon: Home,                        description: "Housing loan EMI & eligibility" },
      { name: "Car Loan Calculator",     href: "/calculators/car-loan",        icon: Car,                         description: "Vehicle loan calculations" },
      { name: "Personal Loan Calc.",     href: "/calculators/personal-loan",   icon: Users,                       description: "Personal loan EMI" },
      { name: "Education Loan Calc.",    href: "/calculators/education-loan",  icon: GraduationCap,               description: "Study loan planning" },
    ],
  },
];

const stats = [
  { value: "2.5M+",  label: "Calculations Done", icon: Calculator },
  { value: "150K+",  label: "Monthly Users",      icon: Users },
  { value: "\u20B9850Cr+", label: "Tax Saved",         icon: Coins },
  { value: "99.8%",  label: "Accuracy Rate",      icon: Star },
];

/* ─────────────────────────────────────────────────────────
   TOOL CARD
───────────────────────────────────────────────────────── */
function ToolCard({ calc, color, bg, border, index }: { calc: any; color: string; bg: string; border: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Link href={calc.href}>
        <div className="group relative flex flex-col h-full bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
          {/* ghost watermark */}
          <div className="absolute -bottom-2 -right-2 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
            <calc.icon className="w-20 h-20" strokeWidth={1} />
          </div>

          {/* icon */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 shrink-0" style={{ background: bg, border: `1px solid ${border}` }}>
            <calc.icon className="w-5 h-5" style={{ color }} />
          </div>

          {/* badges */}
          {(calc.isPopular || calc.isNew) && (
            <div className="flex gap-1.5 mb-2 flex-wrap">
              {calc.isPopular && <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">Popular</span>}
              {calc.isNew && <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">New</span>}
            </div>
          )}

          <h3 className="text-sm font-extrabold text-slate-800 mb-1 leading-snug">{calc.name}</h3>
          <p className="text-xs text-slate-400 leading-relaxed flex-1">{calc.description}</p>

          {/* footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Free</span>
            <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5" style={{ background: bg }}>
              <ArrowRight className="w-3.5 h-3.5" style={{ color }} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
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
      <SEO
        title="Tax & Financial Calculators — Income Tax, SIP, EMI, HRA | MyeCA.in"
        description="Free professional calculators for income tax AY 2025-26, SIP returns, EMI, HRA, PPF and more. 99.8% accuracy with CA-verified algorithms."
        keywords="income tax calculator, SIP calculator, EMI calculator, HRA calculator, PPF calculator"
        url="https://myeca.in/calculators"
      />
      <StructuredData type="Service" data={{ name: "Financial Calculators", description: "Free tax and financial calculators.", serviceType: "Financial Planning Tools", price: "0", features: ["Income Tax Calculator", "SIP Calculator", "EMI Calculator"] }} />

      {/* ─── full-page wrapper — consistent slate-50 background ─── */}
      <div className="min-h-screen bg-slate-50">
        <Breadcrumb items={[{ name: "Calculators" }]} />

        {/* ══════════════════════════════════════════
            HERO — same light palette as rest of page
        ══════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
          {/* subtle decorative blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-100/60 blur-[140px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-100/50 blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
            {/* eyebrow */}
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              Financial Intelligence Hub
            </motion.div>

            {/* headline */}
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
              Calculate with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Precision</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-slate-500 max-w-xl mx-auto mb-12">
              Professional-grade calculators for tax, investments & loans — expert-verified and always up to date.
            </motion.p>

            {/* stats */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-200 px-4 py-5 shadow-sm text-center hover:shadow-md transition-shadow">
                  <s.icon className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{s.value}</div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* search + filter */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl border border-slate-200 shadow-md">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search calculators…"
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                </div>
                <div className="flex gap-1 p-1 rounded-xl bg-slate-50 border border-slate-100 overflow-x-auto">
                  {[{ id: "all", label: "All" }, ...calculatorCategories.map((c) => ({ id: c.id, label: c.name.split(" ")[0] }))].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setActiveCategory(opt.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        activeCategory === opt.id
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-700 hover:bg-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CALCULATOR GRID
        ══════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 py-14">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <Calculator className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-semibold text-lg">No tools found for "{searchTerm}"</p>
            </div>
          ) : isFiltering ? (
            /* flat filtered grid */
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-6">{filtered.length} tool{filtered.length !== 1 ? "s" : ""} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((c, i) => <ToolCard key={i} calc={c} color={c.color} bg={c.bg} border={c.border} index={i} />)}
              </div>
            </div>
          ) : (
            /* grouped by category */
            <div className="space-y-14">
              {calculatorCategories.map((cat) => (
                <div key={cat.id}>
                  {/* category header */}
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

                  {/* cards */}
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

        {/* ══════════════════════════════════════════
            TRUST STRIP
        ══════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════
            CTA — slightly darker but still light
        ══════════════════════════════════════════ */}
        <section className="bg-slate-900 py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest mb-6">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Expert Consultation
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Need a CA's Advice?</h2>
            <p className="text-slate-400 text-lg mb-10">Our calculators give you the numbers. Our Chartered Accountants give you the strategy.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/itr/filing">
                <button className="px-10 py-4 rounded-xl bg-white text-slate-900 font-extrabold text-base hover:bg-slate-100 shadow-xl transition-all hover:-translate-y-0.5">
                  Start ITR Filing
                </button>
              </Link>
              <Link href="/services">
                <button className="px-10 py-4 rounded-xl border border-white/20 text-white font-bold text-base hover:bg-white/10 transition-all hover:-translate-y-0.5">
                  Explore Services
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}