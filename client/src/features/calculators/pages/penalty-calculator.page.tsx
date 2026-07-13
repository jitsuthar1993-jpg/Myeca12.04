import { AlertTriangle, BookOpenCheck, CalendarClock, ExternalLink, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import MetaSEO from "@/components/seo/MetaSEO";
import { PENALTY_RULE_DATASET } from "@/data/calculator-rule-datasets";
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcGlassSidebar from "@/features/calculators/components/CalcGlassSidebar";

export default function PenaltyCalculatorPage() {
  return (
    <>
      <MetaSEO
        title="Late Charge Source Reference | GST, IT, MCA and FEMA | MyeCA.in"
        description="Official authority links for checking statutory late fees, interest and other charges. No estimate is available while the effective-dated rules are being verified."
        noindex
      />

      <CalcHero
        title="Late Charge Source Reference"
        description="Check the applicable authority for the provision, effective period, cap, waiver and portal amount that applies to your filing."
        category="Verification pending"
        icon={<ShieldAlert className="h-6 w-6 text-amber-600" />}
        variant="amber"
        breadcrumbItems={[{ name: "Late Charge Reference" }]}
        compact
      />

      <CalcLayout
        variant="amber"
        sidebar={
          <CalcGlassSidebar
            title="Calculation unavailable"
            description="No estimate is available"
            variant="amber"
          >
            <div className="space-y-5">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <div>
                    <p className="text-sm font-medium text-amber-950">Source verification in progress</p>
                    <p className="mt-2 text-sm leading-6 text-amber-900">
                      This page will not calculate a charge until each rule has an official source,
                      effective date, calculation method and cap.
                    </p>
                  </div>
                </div>
              </div>

              <dl className="space-y-3 border-t border-slate-100 pt-5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Dataset status</dt>
                  <dd className="font-medium text-slate-900">Unavailable</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Last reviewed</dt>
                  <dd className="font-medium text-slate-900">{PENALTY_RULE_DATASET.checkedOn}</dd>
                </div>
              </dl>
            </div>
          </CalcGlassSidebar>
        }
        complianceFacts={[
          {
            title: "Identify the exact obligation",
            content: "Confirm the return, statement, payment or form involved before checking the applicable authority.",
          },
          {
            title: "Check the effective period",
            content: "Notifications, waivers, caps and portal implementation can change between filing periods.",
          },
        ]}
        faqs={[
          {
            q: "Why does this page not calculate a late charge?",
            a: "A reliable calculation needs an obligation-specific and effective-dated official rule. The verified rule dataset is not complete, so presenting an amount could mislead users.",
          },
          {
            q: "Where should I confirm the amount?",
            a: "Use the relevant authority link below and check the applicable notification, circular, rule or portal demand for your exact filing period.",
          },
        ]}
      >
        <div className="space-y-8 pb-12">
          <section className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm md:p-9" aria-labelledby="authority-sources">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="type-meta font-normal uppercase tracking-widest text-amber-700">Official references</p>
                <h2 id="authority-sources" className="mt-2 text-xl font-medium text-slate-950">
                  Check the applicable authority
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Select the authority responsible for your filing. Confirm the exact obligation and period before relying on any charge shown by a government portal.
                </p>
              </div>
            </div>

            <ul className="mt-7 grid gap-4 md:grid-cols-2">
              {PENALTY_RULE_DATASET.officialSources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-full items-center justify-between gap-4 rounded-2xl border border-slate-200 p-5 text-sm font-medium text-slate-800 transition-colors hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
                  >
                    <span>{source.title}</span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[2rem] border border-slate-100 bg-slate-50 p-7 md:p-9" aria-labelledby="before-checking">
            <div className="flex items-start gap-4">
              <CalendarClock className="mt-1 h-6 w-6 shrink-0 text-slate-600" />
              <div>
                <h2 id="before-checking" className="text-lg font-medium text-slate-950">Keep these details ready</h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                  <li>The exact return, statement, payment or form name.</li>
                  <li>The statutory due date and actual filing or payment date.</li>
                  <li>The filing period and any notification or waiver that may apply.</li>
                  <li>The portal-generated demand or computation, if one is available.</li>
                </ul>
                <Link
                  href="/compliance-calendar"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-800 underline decoration-amber-300 underline-offset-4 hover:text-amber-950"
                >
                  Review the compliance calendar
                </Link>
              </div>
            </div>
          </section>
        </div>
      </CalcLayout>
    </>
  );
}
