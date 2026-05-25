import { Link } from "wouter";
import { ArrowRight, CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StandardPricingSection from "@/components/pricing/StandardPricingSection";
import { caseTimelineStages } from "@/data/competitive-growth";
import { getTaxFilingPlans } from "@/data/pricing";

const trustRows = [
  ["Written scope before payment", "Included in every paid plan"],
  ["CA-assisted review", "Included where the selected plan scope supports it"],
  ["AIS / 26AS mismatch visibility", "Built into assisted review workflow"],
  ["Revision support window", "Shown before checkout by service type"],
  ["Mandatory vs optional charges", "Separated on business services"],
];

const heroHighlights = [
  ["Starting point", "Rs 499", "Simple salary filing"],
  ["Review path", "CA-assisted", "For eligible complex returns"],
  ["Scope clarity", "Before pay", "GST, SLA, inclusions and exclusions"],
];

const comparisonColumns = ["Salary", "Expert", "Capital Gains", "Business"];
const comparisonRows = [
  ["CA-assisted review", "Optional add-on", "Included where eligible", "Included where eligible", "Assigned owner"],
  ["AIS / 26AS check", "Checklist", "Yes", "Yes", "As applicable"],
  ["Document vault", "Basic", "Advanced", "Advanced", "Advanced"],
  ["Case timeline", "Basic", "Full", "Full", "Milestone based"],
  ["Post-filing support", "Email", "Included", "Included", "Scope based"],
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
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

      <section className="border-b border-blue-100 bg-[#F8FAFC] px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
          <div className="flex flex-col justify-center rounded-lg border border-blue-100 bg-white p-5 shadow-sm md:p-8 lg:p-10">
            <Badge className="mb-5 w-fit border-blue-100 bg-blue-50 text-blue-700">
              Transparent pricing
            </Badge>
            <h1 className="type-hero-title max-w-4xl font-extrabold text-slate-900">
              Transparent tax filing plans mapped to real return complexity.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg md:leading-8">
              Pick a plan by the work your return actually needs: salary, multiple Form 16,
              capital gains, F&O/crypto, freelancer income, NRI/foreign assets or business compliance.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="#pricing">
                <Button variant="brand" className="h-11 w-full rounded-lg px-5 sm:w-auto">
                  Compare plans
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/expert-consultation?service=pricing-help">
                <Button variant="outline" className="h-11 w-full rounded-lg border-blue-100 text-blue-700 hover:border-blue-200 hover:bg-blue-50 sm:w-auto">
                  Ask for pricing help
                </Button>
              </Link>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {heroHighlights.map(([label, value, helper]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">{label}</p>
                  <p className="mt-2 text-xl font-extrabold text-slate-900">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{helper}</p>
                </div>
              ))}
            </div>
          </div>
          <Card className="rounded-lg border-blue-100 bg-white shadow-sm">
            <CardContent className="p-5 md:p-7">
              <div className="flex items-start gap-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">MyeCA promise</p>
                  <h2 className="mt-2 text-xl font-extrabold text-slate-900 md:text-2xl">Know the scope before checkout.</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Plans explain what is included, where CA review applies, and when a case needs scope-first quoting.
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {trustRows.map(([label, value]) => (
                  <div key={label} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{label}</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <StandardPricingSection
        mode="plan-grid"
        className="border-b border-slate-100 bg-white"
        title="Choose by return complexity, not guesswork"
        description="Scope, CA review, GST treatment, timelines, and exclusions are visible before the user starts filing."
        plans={getTaxFilingPlans()}
      />

      <section className="border-b border-slate-100 bg-[#F8FAFC] px-4 py-12 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Plan comparison</p>
            <h2 className="type-section-title mt-3 font-extrabold text-slate-900">
              Make scope visible before the user starts filing.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
              Compare common touchpoints across plan families before choosing the right filing path.
            </p>
          </div>
          <div className="mt-8 overflow-x-auto rounded-lg border border-blue-100 bg-white shadow-sm">
            <div className="grid min-w-[760px] grid-cols-5 bg-blue-50 p-4 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
              <span>Capability</span>
              {comparisonColumns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            {comparisonRows.map((row) => (
              <div key={row[0]} className="grid min-w-[760px] grid-cols-5 border-t border-slate-100 p-4 text-sm">
                {row.map((cell, index) => (
                  <span key={`${row[0]}-${index}`} className={index === 0 ? "font-bold text-slate-900" : "font-semibold text-slate-700"}>
                    {cell}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-5 md:p-6">
            <Badge className="bg-white text-emerald-700">Included workflow</Badge>
            <h2 className="type-section-title mt-4 font-extrabold text-slate-900">
              Every paid action becomes a trackable case.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This is the core difference from a plain checkout page: users can see the stage,
              pending documents, CA review status and post-filing support path.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {caseTimelineStages.map((stage, index) => (
              <div key={stage} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-200">
                <FileCheck2 className="h-5 w-5 text-blue-600" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Stage {index + 1}</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
