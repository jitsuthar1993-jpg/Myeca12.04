import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  FileSpreadsheet,
  FileText,
  Home,
  IndianRupee,
  PiggyBank,
  Scan,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Tag,
  TrendingUp,
  Upload,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import Breadcrumb from "@/components/Breadcrumb";
import MetaSEO from "@/components/seo/MetaSEO";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobilePageHeader } from "@/components/mobile";

type CalculatorItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  isNew?: boolean;
  isPopular?: boolean;
};

type CalculatorCategory = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "emerald" | "orange" | "indigo";
  calculators: CalculatorItem[];
};

const colorClasses = {
  blue: {
    icon: "bg-blue-50 text-blue-600 border-blue-100",
    text: "text-blue-600",
    hover: "group-hover:text-blue-600",
    active: "bg-blue-600 text-white border-blue-600",
    soft: "bg-blue-50 text-blue-700 border-blue-100",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 border-emerald-100",
    text: "text-emerald-600",
    hover: "group-hover:text-emerald-600",
    active: "bg-emerald-600 text-white border-emerald-600",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600 border-orange-100",
    text: "text-orange-600",
    hover: "group-hover:text-orange-600",
    active: "bg-orange-600 text-white border-orange-600",
    soft: "bg-orange-50 text-orange-700 border-orange-100",
  },
  indigo: {
    icon: "bg-indigo-50 text-indigo-600 border-indigo-100",
    text: "text-indigo-600",
    hover: "group-hover:text-indigo-600",
    active: "bg-indigo-600 text-white border-indigo-600",
    soft: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
};

const calculatorCategories: CalculatorCategory[] = [
  {
    id: "tax",
    name: "Tax Calculators",
    eyebrow: "Compliance hub",
    description: "Income tax, GST, TDS, salary and capital gains tools for everyday filing decisions.",
    icon: FileText,
    color: "blue",
    calculators: [
      { name: "Income Tax Calculator", href: "/calculators/income-tax", icon: IndianRupee, isPopular: true, description: "AY 2026-27 tax estimate" },
      { name: "Tax Regime Comparator", href: "/calculators/regime-comparator", icon: Zap, isNew: true, description: "Old vs new regime side by side" },
      { name: "HRA Calculator", href: "/calculators/hra", icon: Home, description: "House rent allowance benefits" },
      { name: "GST Calculator", href: "/calculators/gst", icon: FileText, isNew: true, isPopular: true, description: "Add or remove GST with clear tax split" },
      { name: "Salary Calculator", href: "/calculators/salary", icon: Wallet, isNew: true, description: "CTC to in-hand salary" },
      { name: "TDS Calculator", href: "/calculators/tds", icon: Shield, description: "Tax deducted at source" },
      { name: "Capital Gains Calculator", href: "/calculators/capital-gains", icon: BarChart3, description: "LTCG and STCG computation" },
      { name: "Advance Tax Calculator", href: "/calculators/advance-tax", icon: Clock, isNew: true, description: "Quarterly tax payment planner" },
      { name: "HSN / SAC Code Finder", href: "/calculators/hsn-finder", icon: Tag, isNew: true, description: "GST rates for goods and services" },
    ],
  },
  {
    id: "investment",
    name: "Investment & Savings",
    eyebrow: "Financial planning",
    description: "Plan SIPs, deposits, provident funds, withdrawals and long-term purchasing power.",
    icon: PiggyBank,
    color: "emerald",
    calculators: [
      { name: "SIP Calculator", href: "/calculators/sip", icon: TrendingUp, isPopular: true, description: "Systematic investment planning" },
      { name: "PPF Calculator", href: "/calculators/ppf", icon: Shield, description: "Public Provident Fund returns" },
      { name: "FD Calculator", href: "/calculators/fd", icon: Building2, description: "Fixed deposit maturity value" },
      { name: "RD Calculator", href: "/calculators/rd", icon: Calendar, isNew: true, description: "Recurring deposit maturity" },
      { name: "NPS Calculator", href: "/calculators/nps", icon: Award, description: "National Pension Scheme corpus" },
      { name: "EPF Calculator", href: "/calculators/epf", icon: Award, isNew: true, description: "Provident fund projection" },
      { name: "Lumpsum Calculator", href: "/calculators/lumpsum", icon: TrendingUp, isNew: true, description: "One-time mutual fund growth" },
      { name: "SWP Calculator", href: "/calculators/swp", icon: Coins, isNew: true, description: "Systematic withdrawal plan" },
      { name: "Inflation Calculator", href: "/calculators/inflation", icon: Zap, isNew: true, description: "Future cost and real value" },
      { name: "ELSS Comparator", href: "/elss-comparator", icon: Coins, description: "Compare tax-saving mutual funds" },
      { name: "Tax Loss Harvesting", href: "/tax-loss-harvesting", icon: TrendingUp, isNew: true, description: "Optimize capital gains tax" },
    ],
  },
  {
    id: "loan",
    name: "Loan & EMI",
    eyebrow: "Borrowing tools",
    description: "Estimate EMIs, eligibility, loan affordability and employee benefit payouts.",
    icon: Briefcase,
    color: "orange",
    calculators: [
      { name: "EMI Calculator", href: "/calculators/emi", icon: Calculator, isPopular: true, description: "Monthly instalment calculator" },
      { name: "Home Loan Calculator", href: "/calculators/home-loan", icon: Home, description: "Housing loan EMI and interest" },
      { name: "Car Loan Calculator", href: "/calculators/car-loan", icon: Briefcase, description: "Vehicle loan EMI planning" },
      { name: "Personal Loan Calculator", href: "/calculators/personal-loan", icon: IndianRupee, description: "Unsecured loan repayment view" },
      { name: "Education Loan Calculator", href: "/calculators/education-loan", icon: Award, description: "Moratorium and repayment planning" },
      { name: "Loan Eligibility", href: "/calculators/loan-eligibility", icon: Calculator, isNew: true, description: "Borrowing power estimator" },
      { name: "Gratuity Calculator", href: "/calculators/gratuity", icon: Shield, isNew: true, description: "Employee exit benefit" },
      { name: "Penalty Calculator", href: "/calculators/penalty", icon: ShieldAlert, description: "GST and tax penalty estimator" },
    ],
  },
  {
    id: "ai-tools",
    name: "AI & Document Tools",
    eyebrow: "Smart assistants",
    description: "Use automation for Form 16, AIS, bank statements and faster tax review workflows.",
    icon: Bot,
    color: "indigo",
    calculators: [
      { name: "AI Tax Assistant", href: "/tax-assistant", icon: Bot, isNew: true, isPopular: true, description: "Instant answers to tax questions" },
      { name: "Form 16 Parser", href: "/form16-parser", icon: Scan, isNew: true, description: "Extract salary data from Form 16" },
      { name: "Bank Statement Analyzer", href: "/bank-analyzer", icon: FileSpreadsheet, isNew: true, description: "Auto-categorize transactions" },
      { name: "AIS / 26AS Viewer", href: "/ais-viewer", icon: FileText, isNew: true, description: "Analyze your tax credit statement" },
      { name: "Capital Gains Import", href: "/capital-gains-import", icon: Upload, isNew: true, description: "Import broker statements" },
      { name: "Compliance Calendar", href: "/compliance-calendar", icon: Calendar, isPopular: true, description: "Track statutory deadlines" },
    ],
  },
];

const stats = [
  { value: "AY 2026", label: "Tax tools ready", icon: Calculator },
  { value: "20+", label: "Estimate tools", icon: Users },
  { value: "Review", label: "Caveats included", icon: CheckCircle },
];

const featuredTools = [
  "/calculators/income-tax",
  "/calculators/sip",
  "/calculators/emi",
  "/calculators/regime-comparator",
];

function ToolCard({ calc, category }: { calc: CalculatorItem; category: CalculatorCategory }) {
  const Icon = calc.icon;
  const colors = colorClasses[category.color];

  return (
    <Link href={calc.href} className="group block h-full">
      <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border", colors.icon)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {calc.isPopular && (
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-700">
                Popular
              </span>
            )}
            {calc.isNew && (
              <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-indigo-700">
                New
              </span>
            )}
          </div>
        </div>

        <h3 className={cn("text-sm font-medium text-slate-900 transition-colors", colors.hover)}>
          {calc.name}
        </h3>
        <p className="mt-2 flex-1 text-xs leading-5 text-slate-500">{calc.description}</p>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Free tool</span>
          <ArrowRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", colors.text)} />
        </div>
      </article>
    </Link>
  );
}

export default function CalculatorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const allCalcs = useMemo(
    () =>
      calculatorCategories.flatMap((category) =>
        category.calculators.map((calculator) => ({ ...calculator, category }))
      ),
    []
  );

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return allCalcs.filter(({ name, description, category }) => {
      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        category.name.toLowerCase().includes(query);
      const matchesCategory = activeCategory === "all" || category.id === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, allCalcs, searchTerm]);

  const featured = allCalcs.filter(({ href }) => featuredTools.includes(href));
  const isFiltering = searchTerm.trim() !== "" || activeCategory !== "all";

  return (
    <>
      <MetaSEO
        title="Tax & Financial Calculators | Income Tax, SIP, EMI, HRA | MyeCA.in"
        description="Free calculators for income tax, SIP, EMI, HRA, GST, FD, PPF and loans. Fast, CA-informed tools for Indian taxpayers and investors."
        keywords={["income tax calculator", "SIP calculator", "EMI calculator", "HRA calculator", "GST calculator", "FD calculator"]}
        type="calculator"
        calculatorData={{
          type: "Financial Planning Tools",
          features: ["Income Tax Calculator", "SIP Calculator", "EMI Calculator", "GST Calculator"],
          accuracy: "Estimate tools with caveats",
          updates: "AY 2026-27",
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Calculators", url: "/calculators" },
        ]}
      />

      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10 lg:px-8 lg:py-12">
            <div className="hidden md:block">
              <Breadcrumb items={[{ name: "Calculators" }]} />
            </div>
            <nav className="mb-6 hidden items-center gap-2 text-xs text-slate-500 md:flex" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <ArrowRight className="h-3 w-3 text-slate-300" />
              <span className="font-medium text-slate-700">Calculators</span>
            </nav>

            <div className="grid gap-4 md:gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
              <div>
                <div className="md:hidden">
                  <MobilePageHeader
                    eyebrow="Calculator Library"
                    icon={<Sparkles className="h-4 w-4" />}
                    title="Financial calculators for tax, investing and loans."
                    description="Search, compare and open focused tools for Indian tax and money decisions."
                  />
                </div>
                <div className="mb-5 hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-blue-700 md:inline-flex">
                  <Sparkles className="h-3.5 w-3.5" />
                  Calculator Library
                </div>
                <h1 className="hidden max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:block sm:text-5xl">
                  Financial calculators for tax, investing and loans.
                </h1>
                <p className="mt-5 hidden max-w-2xl text-base leading-7 text-slate-600 md:block">
                  Fast, focused tools for Indian taxpayers. Compare regimes, plan SIPs, estimate EMIs, calculate GST and keep every major money decision in one place.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:p-4">
                <div className="mb-3 flex items-center justify-between md:mb-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Popular now</p>
                  <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-700">
                    Updated
                  </span>
                </div>
                <div className="space-y-2">
                  {featured.map(({ category, ...calc }) => {
                    const Icon = calc.icon;
                    const colors = colorClasses[category.color];
                    return (
                      <Link key={calc.href} href={calc.href} className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300">
                        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", colors.icon)}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-800">{calc.name}</span>
                          <span className="block truncate text-xs text-slate-500">{category.name}</span>
                        </span>
                        <ArrowRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", colors.text)} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-6 md:gap-4 md:py-4 lg:grid-cols-[1fr_auto] lg:px-8">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by calculator, tax, SIP, EMI, GST..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 md:h-12 md:bg-slate-50 md:focus:bg-white"
              />
            </label>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:justify-end lg:pb-0">
              {[{ id: "all", name: "All" }, ...calculatorCategories].map((category) => {
                const active = activeCategory === category.id;
                const categoryColor = category.id === "all" ? "blue" : (category as CalculatorCategory).color;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "h-10 shrink-0 rounded-lg border px-3 text-xs font-medium uppercase tracking-wider transition-colors md:h-12 md:px-4",
                      active
                        ? colorClasses[categoryColor].active
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
          <div className="mb-8 hidden gap-3 md:grid sm:grid-cols-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-semibold tabular-nums text-slate-950">{value}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {isFiltering ? (
            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Search results</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {filtered.length} matching tool{filtered.length === 1 ? "" : "s"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("all");
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
                  <Calculator className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-4 text-base font-medium text-slate-800">No calculator found</p>
                  <p className="mt-2 text-sm text-slate-500">Try another keyword or browse all categories.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map(({ category, ...calc }) => (
                    <ToolCard key={`${category.id}-${calc.href}`} calc={calc} category={category} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-7 md:space-y-10">
              {calculatorCategories.map((category) => {
                const CategoryIcon = category.icon;
                const colors = colorClasses[category.color];

                return (
                  <section key={category.id} aria-labelledby={`${category.id}-heading`}>
                    <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between md:mb-5 md:gap-4">
                      <div className="flex gap-4">
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border md:h-12 md:w-12", colors.icon)}>
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">{category.eyebrow}</p>
                          <h2 id={`${category.id}-heading`} className="mt-1 text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                            {category.name}
                          </h2>
                          <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-slate-600 sm:block">{category.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveCategory(category.id)}
                        className={cn("inline-flex items-center gap-2 text-sm font-medium", colors.text)}
                      >
                        View category <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {category.calculators.map((calc) => (
                        <ToolCard key={calc.href} calc={calc} category={category} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>

        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 md:py-10 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Need expert review?</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">Use the calculators, then file with confidence.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                MyeCA can help turn your calculator results into accurate ITR filing, tax planning and compliance action.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:gap-3">
              <Link href="/itr/form-selector">
                <Button className="h-11 w-full rounded-lg bg-blue-600 px-5 text-white hover:bg-blue-700 sm:w-auto">
                  Start ITR Filing
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" className="h-11 w-full rounded-lg border-slate-200 px-5 text-slate-700 hover:bg-slate-50 sm:w-auto">
                  Explore Services
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
