import { Link } from "wouter";
import { ArrowRight, CheckCircle, Calculator, TrendingDown, PieChart, RefreshCw, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/Breadcrumb";

const calculators = [
  {
    title: "Income Tax Calculator",
    desc: "Old vs. New Tax Regime comparison with exact liability breakdown.",
    href: "/calculators/income-tax",
    badge: "Most Used",
  },
  {
    title: "HRA Exemption Calculator",
    desc: "Calculate exempt HRA based on your rent, salary, and city.",
    href: "/calculators/hra",
    badge: null,
  },
  {
    title: "Capital Gains Calculator",
    desc: "STCG and LTCG on equities, mutual funds, and property.",
    href: "/calculators/capital-gains",
    badge: null,
  },
  {
    title: "Home Loan Interest (Sec 24)",
    desc: "Deduction limits under Section 24(b) for self-occupied and let-out property.",
    href: "/calculators/home-loan",
    badge: null,
  },
  {
    title: "80C / 80D Deduction Planner",
    desc: "See how much more you can invest to reduce tax before March 31.",
    href: "/calculators/deductions",
    badge: "Tax Planning",
  },
  {
    title: "Advance Tax Calculator",
    desc: "Calculate your quarterly advance tax instalments to avoid interest.",
    href: "/calculators/advance-tax",
    badge: null,
  },
];

const features = [
  "Old vs. New Regime side-by-side output",
  "Handles salary, business, and capital gains income",
  "Section-wise deduction breakdown (80C, 80D, 24b, and more)",
  "Surcharge and cess computed automatically",
  "Results exportable to PDF for CA review",
  "Updated for the current assessment year",
];

export default function TaxCalculatorFeaturePage() {
  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ name: "Features", href: "/" }, { name: "Accurate Tax Calculator" }]} />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-indigo-50 to-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
            <Calculator className="w-4 h-4" />
            Updated for AY 2025–26
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Know Your Tax <span className="text-[#315efb]">Before You File</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            Six calculators built for Indian taxpayers — income tax, HRA, capital gains, deductions, and more. No guesswork, no spreadsheets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculators/income-tax">
              <Button size="lg" className="gap-2">
                Calculate Your Tax <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/itr/form-selector">
              <Button size="lg" variant="outline">File ITR with a CA</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Calculator Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">All Calculators</h2>
            <p className="text-slate-500 mt-3 text-lg">Pick the one that applies to your situation.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculators.map((calc) => (
              <Link key={calc.title} href={calc.href}>
                <div className="group h-full p-6 rounded-2xl border border-slate-100 hover:border-[#315efb]/30 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#315efb] transition-colors">{calc.title}</h3>
                    {calc.badge && (
                      <span className="ml-2 shrink-0 px-2 py-0.5 bg-[#315efb]/8 text-[#315efb] text-[10px] font-black uppercase tracking-wider rounded-full">
                        {calc.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{calc.desc}</p>
                  <div className="flex items-center gap-1 text-[#315efb] text-sm font-semibold">
                    Open Calculator <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What makes it accurate */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                Built on the actual tax code, not estimates
              </h2>
              <p className="text-slate-500 mb-8">
                Every calculator uses the Finance Act provisions in force for the current assessment year — including the revised New Regime slabs, surcharge thresholds, and section-by-section deduction limits.
              </p>
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              {[
                { icon: TrendingDown, label: "Old vs. New Regime", desc: "Side-by-side tax liability comparison so you pick the regime that saves more." },
                { icon: PieChart, label: "Section-wise Breakdown", desc: "See exactly which deductions are applied and how each one reduces your tax." },
                { icon: RefreshCw, label: "AY Updated Annually", desc: "Rates, slabs, and limits are updated every year when the Finance Bill is passed." },
                { icon: Zap, label: "Instant Results", desc: "Calculations run in the browser — no form submission, no waiting." },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-100">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-[#315efb]/8 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#315efb]" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{label}</div>
                    <div className="text-slate-500 text-sm mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#315efb] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Calculator className="w-8 h-8 mx-auto mb-4 text-blue-300" />
          <h2 className="text-3xl font-extrabold mb-4">Calculated your tax? File it with a CA.</h2>
          <p className="text-blue-100 mb-8">A licensed Chartered Accountant reviews every return before submission. Starting at ₹499.</p>
          <Link href="/itr/form-selector">
            <Button size="lg" className="bg-white text-[#315efb] hover:bg-blue-50 gap-2">
              Start ITR Filing <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
