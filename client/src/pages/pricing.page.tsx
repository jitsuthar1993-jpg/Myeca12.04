import { Link } from "wouter";
import { FileCheck2, ShieldCheck } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/ui/logo";
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

      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-black text-blue-700">
            <Logo size="sm" />
            MyeCA.in
          </Link>
          <Link href="/services">
            <Button variant="outline">View services</Button>
          </Link>
        </div>
      </header>

      <section className="bg-blue-700 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <Badge className="mb-5 border-blue-400/20 bg-blue-400/10 text-blue-200">
              No hidden-cost anxiety
            </Badge>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
              Transparent tax filing plans mapped to real return complexity.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Pick a plan by the work your return actually needs: salary, multiple Form 16,
              capital gains, F&O/crypto, freelancer income, NRI/foreign assets or business compliance.
            </p>
          </div>
          <Card className="rounded-[28px] border-white/10 bg-white/10 text-white backdrop-blur">
            <CardContent className="p-6">
              <ShieldCheck className="h-8 w-8 text-blue-200" />
              <h2 className="mt-4 text-2xl font-black">MyeCA promise</h2>
              <div className="mt-5 space-y-3">
                {trustRows.map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm font-black">{label}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-300">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <StandardPricingSection
        mode="plan-grid"
        title="Choose by return complexity, not guesswork"
        description="Scope, CA review, GST treatment, timelines, and exclusions are visible before the user starts filing."
        plans={getTaxFilingPlans()}
      />

      <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-700">Plan comparison</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Make scope visible before the user starts filing.
            </h2>
          </div>
          <div className="mt-8 overflow-x-auto rounded-[24px] border border-slate-200 bg-white">
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

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <Badge className="bg-emerald-50 text-emerald-700">Included workflow</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
              Every paid action becomes a trackable case.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This is the core difference from a plain checkout page: users can see the stage,
              pending documents, CA review status and post-filing support path.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {caseTimelineStages.map((stage, index) => (
              <div key={stage} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <FileCheck2 className="h-5 w-5 text-blue-600" />
                <p className="mt-3 text-xs font-black text-slate-400">Stage {index + 1}</p>
                <p className="text-sm font-black text-slate-900">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
