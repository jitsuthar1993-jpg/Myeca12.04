import { Link } from "wouter";
import { ArrowRight, BadgeCheck, Bot, Building2, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { MyeCard, SectionHeading, StatusBadge } from "@/components/platform/compliance-ui";

const plans = [
  {
    name: "DIY Automated",
    price: "₹499",
    audience: "Simple salary returns",
    status: "not_started" as const,
    features: ["ITR-1 guided filing", "Regime comparison", "Basic document vault", "Email support"],
  },
  {
    name: "Expert Assisted",
    price: "₹999",
    audience: "Most individuals and investors",
    status: "ca_review" as const,
    features: ["Named CA review", "Form 16 + AIS checks", "HRA/rent receipt support", "Refund tracking"],
    featured: true,
  },
  {
    name: "Premium vCFO",
    price: "Custom",
    audience: "Businesses and founders",
    status: "registered" as const,
    features: ["GST/TDS compliance", "Monthly dashboards", "Document workflows", "Strategic CFO review"],
  },
];

const comparisonRows = [
  ["Capital gains support", "Add-on", "Included", "Included"],
  ["Foreign asset/NRI review", "Not included", "Add-on", "Custom advisory"],
  ["Business income/GST", "Not included", "Add-on", "Included"],
  ["CA chat", "No", "Yes", "Priority"],
  ["Document OCR workflow", "Basic", "Advanced", "Advanced"],
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#f6f9fd]">
      <MetaSEO
        title="MyeCA Pricing | DIY, CA Assisted and vCFO Plans"
        description="Compare MyeCA pricing for DIY ITR filing, expert CA-assisted filing, and Premium vCFO compliance support."
        keywords={["ITR pricing", "CA assisted filing", "vCFO pricing", "tax filing plans"]}
      />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-black text-[#003087]">
            <Logo size="sm" />
            MyeCA.in
          </Link>
          <Link href="/services">
            <Button variant="outline">View services</Button>
          </Link>
        </div>
      </header>

      <section className="mye-brand-panel px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">Transparent pricing</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            Pick the amount of automation and expert review you need.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50/90">
            Plans make complexity visible upfront, especially capital gains, NRI income, business income,
            foreign assets, and CA-review requirements.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <MyeCard
              key={plan.name}
              className={plan.featured ? "border-[#003087] ring-4 ring-blue-100" : undefined}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <StatusBadge status={plan.status} label={plan.featured ? "Recommended" : plan.audience} />
                  <h2 className="mt-5 text-2xl font-black text-slate-950">{plan.name}</h2>
                  <p className="mt-2 text-slate-600">{plan.audience}</p>
                </div>
                {plan.featured ? <BadgeCheck className="h-7 w-7 text-[#003087]" /> : null}
              </div>
              <p className="mt-6 text-5xl font-black text-slate-950">{plan.price}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 font-semibold text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-emerald-800" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register">
                <Button className="mt-8 w-full bg-[#003087] text-white hover:bg-[#082a5c]">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </MyeCard>
          ))}
        </div>

        <MyeCard className="mt-8">
          <SectionHeading
            eyebrow="Comparison"
            title="Map complexity to the right plan"
            description="This matrix prevents surprises after the user starts filing."
          />
          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
            <div className="grid grid-cols-4 bg-slate-50 p-4 text-xs font-black uppercase tracking-widest text-slate-500">
              <span>Feature</span>
              <span>DIY</span>
              <span>Expert</span>
              <span>vCFO</span>
            </div>
            {comparisonRows.map((row) => (
              <div key={row[0]} className="grid grid-cols-1 gap-2 border-t border-slate-200 p-4 text-sm md:grid-cols-4">
                {row.map((cell, index) => (
                  <span key={`${row[0]}-${cell}`} className={index === 0 ? "font-black text-slate-950" : "text-slate-700"}>
                    {cell}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </MyeCard>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            ["AI-assisted, CA-reviewed", Bot],
            ["Private document vault", ShieldCheck],
            ["Business compliance upgrade path", Building2],
          ].map(([label, Icon]) => {
            const TypedIcon = Icon as typeof FileText;
            return (
              <MyeCard key={String(label)} className="p-7">
                <TypedIcon className="h-8 w-8 text-[#003087]" />
                <p className="mt-4 text-xl font-black text-slate-950">{String(label)}</p>
              </MyeCard>
            );
          })}
        </div>
      </section>
    </main>
  );
}
