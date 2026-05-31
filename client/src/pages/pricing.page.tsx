import { Link } from "wouter";
import { ArrowRight, CheckCircle2, FileCheck2, ShieldCheck, Sparkles } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StandardPricingSection from "@/components/pricing/StandardPricingSection";
import { caseTimelineStages } from "@/data/competitive-growth";
import { getTaxFilingPlans } from "@/data/pricing";

const trustRows = [
  ["Written scope before payment", "Included in every paid plan"],
  ["Named CA accountability", "Included in assisted and specialist plans"],
  ["AIS / 26AS mismatch visibility", "Built into review workflow"],
  ["Revision support window", "Shown before checkout by service type"],
  ["Mandatory vs optional charges", "Separated on business services"],
];

const pricingHighlights = [
  ["Starts at", "₹499", "Guided salary filing"],
  ["Assisted from", "₹999", "Named CA review on eligible plans"],
  ["Complex cases", "Scope first", "Capital gains, NRI, business and GST"],
];

const proofPoints = ["Scope before payment", "GST treatment visible", "CA touchpoints shown"];

const popularPaths = [
  {
    name: "Salary",
    price: "Rs 499",
    detail: "Simple salary and interest income",
    href: "/itr/start?plan=salary&source=pricing_popular_paths",
    cta: "Start ITR Filing",
  },
  {
    name: "Expert Assisted",
    price: "Rs 999",
    detail: "CA review, AIS/26AS checks, Form 16 support",
    href: "/itr/start?plan=expert-assisted&source=pricing_popular_paths",
    cta: "Start ITR Filing",
    featured: true,
  },
  {
    name: "Capital Gains",
    price: "Rs 1,499+",
    detail: "Stocks, mutual funds, property, crypto/VDA",
    href: "/itr/start?profile=capital-gains&source=pricing_popular_paths",
    cta: "Start ITR Filing",
  },
  {
    name: "Business / GST",
    price: "Scope first",
    detail: "GST, TDS, company compliance and business filings",
    href: "/services",
    cta: "View Business Services",
  },
];

const comparisonColumns = ["Salary", "Expert", "Capital Gains", "Business"];
const comparisonRows = [
  ["Named CA review", "Add-on", "Yes", "Yes", "Dedicated owner"],
  ["AIS / 26AS check", "Checklist", "Yes", "Yes", "As applicable"],
  ["Document vault", "Basic", "Advanced", "Advanced", "Advanced"],
  ["Case timeline", "Basic", "Full", "Full", "Milestone based"],
  ["Post-filing support", "Email", "Included", "Included", "Scope based"],
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MetaSEO
        title="Transparent ITR Filing Pricing by Complexity | MyeCA.in"
        description="Compare MyeCA pricing for salary, multiple Form 16, capital gains, F&O, freelancer, NRI, foreign assets, notice and business GST compliance cases."
        keywords={[
          "ITR filing pricing India",
          "CA assisted ITR pricing",
          "capital gains ITR filing price",
          "NRI ITR filing price",
          "transparent tax filing plans",
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Pricing", url: "/pricing" },
        ]}
        faqPageData={[
          {
            question: "Why is MyeCA pricing based on complexity?",
            answer:
              "Simple salary returns need less review than capital gains, F&O, NRI, foreign asset, business income or GST cases. Complexity-based pricing prevents surprise charges after the user starts.",
          },
          {
            question: "Will MyeCA show exclusions before payment?",
            answer:
              "Yes. Each plan shows included items, CA touchpoints, SLA and exclusions so the user understands scope before paying.",
          },
        ]}
      />

      <section className="border-b border-slate-100 bg-white px-4 py-10 sm:px-6 md:bg-gradient-to-br md:from-slate-50 md:via-blue-50/20 md:to-white md:py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:items-start">
          <div className="max-w-4xl">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm">
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
              <span>Transparent pricing</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" aria-hidden="true" />
              <span className="text-emerald-600">Scope before payment</span>
            </div>

            <h1 className="type-hero-title mt-7 max-w-4xl text-slate-950">
              Tax filing plans priced by real return complexity.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
              Compare guided, assisted, investor, NRI, freelancer, and business compliance plans with CA touchpoints,
              GST treatment, timelines, and exclusions visible before you start.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/itr/start?source=pricing_hero" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-slate-800 hover:bg-slate-900 sm:w-auto">
                  Start ITR Filing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#popular-pricing-paths" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Compare Pricing
                </Button>
              </a>
            </div>
            <div className="mt-8 flex flex-col gap-3 text-sm font-semibold text-slate-600 sm:flex-row sm:flex-wrap">
              {proofPoints.map((point) => (
                <span key={point} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {point}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-950">MyeCA pricing promise</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Every paid plan separates included work, exclusions, SLA, and review scope before payment.
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {trustRows.map(([label, value]) => (
                  <div key={label} className="grid gap-1 rounded-lg border border-slate-100 bg-slate-50/70 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <p className="text-sm font-bold text-slate-900">{label}</p>
                    <p className="text-xs font-bold text-blue-700 sm:text-right">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {pricingHighlights.map(([label, value, note]) => (
                <div key={label} className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">{label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="popular-pricing-paths" className="border-b border-slate-100 bg-white px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">Popular filing paths</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                Pick the nearest case and start with scope clarity.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Scope is confirmed before payment. Refund outcomes are never guaranteed by any filing plan.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {popularPaths.map((path) => (
              <Link key={path.name} href={path.href} className="group h-full">
                <div className={`flex h-full flex-col rounded-lg border p-5 shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-lg ${path.featured ? "border-blue-300 bg-blue-50/60" : "border-slate-200 bg-slate-50/70 group-hover:bg-white"}`}>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{path.name}</p>
                  <p className="mt-3 text-3xl font-black text-slate-950">{path.price}</p>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{path.detail}</p>
                  <span className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-black text-white transition group-hover:bg-blue-700">
                    {path.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <StandardPricingSection
        mode="plan-grid"
        title="Choose by return complexity, not guesswork"
        description="Scope, CA review, GST treatment, timelines, and exclusions are visible before you start filing."
        plans={getTaxFilingPlans()}
        className="bg-white py-12 md:py-16"
      />

      <section className="border-y border-slate-100 bg-slate-50 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">Plan comparison</p>
              <h2 className="type-section-title mt-3 text-slate-950">
                See the right support level before you start filing.
              </h2>
            </div>
            <p className="text-sm leading-7 text-slate-600 lg:max-w-xl">
              The comparison keeps the purchase decision simple: choose the plan that matches documents, review depth,
              and post-filing support instead of guessing from a flat price list.
            </p>
          </div>
          <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="grid min-w-[760px] grid-cols-5 bg-slate-100 p-4 text-xs font-black uppercase tracking-widest text-slate-500">
              <span>Capability</span>
              {comparisonColumns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            {comparisonRows.map((row) => (
              <div key={row[0]} className="grid min-w-[760px] grid-cols-5 border-t border-slate-100 p-4 text-sm">
                {row.map((cell, index) => (
                  <span key={`${row[0]}-${index}`} className={index === 0 ? "font-black text-slate-950" : "font-semibold text-slate-700"}>
                    {cell}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <Badge className="bg-emerald-50 text-emerald-700">Included workflow</Badge>
            <h2 className="type-section-title mt-4 text-slate-950">
              Every paid action becomes a trackable case.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This is the core difference from a plain checkout page: users can see the stage,
              pending documents, CA review status and post-filing support path.
            </p>
            <Link href="/expert-consultation?service=pricing-help" className="mt-6 inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-800">
              Need help choosing a plan <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {caseTimelineStages.map((stage, index) => (
              <div key={stage} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Stage {index + 1}</p>
                <p className="text-sm font-black text-slate-900">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
