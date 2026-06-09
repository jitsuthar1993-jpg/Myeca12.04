import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileCheck2,
  FileText,
  HelpCircle,
  Landmark,
  Scale,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  itrReturnDecisionSteps,
  itrReturnFormGuide,
  itrReturnFormSourceLinks,
  type ItrReturnFormCtaCategory,
  type ItrReturnFormGuide,
} from "@/features/itr/data/return-form-guide";

const formTone: Record<ItrReturnFormGuide["id"], string> = {
  "ITR-1": "border-emerald-100 bg-emerald-50 text-emerald-700",
  "ITR-2": "border-blue-100 bg-blue-50 text-blue-700",
  "ITR-3": "border-indigo-100 bg-indigo-50 text-indigo-700",
  "ITR-4": "border-cyan-100 bg-cyan-50 text-cyan-700",
  "ITR-5": "border-amber-100 bg-amber-50 text-amber-700",
  "ITR-6": "border-slate-200 bg-slate-100 text-slate-700",
  "ITR-7": "border-violet-100 bg-violet-50 text-violet-700",
  "ITR-U": "border-rose-100 bg-rose-50 text-rose-700",
};

function ctaFor(category: ItrReturnFormCtaCategory) {
  if (category === "individual-selector") {
    return {
      label: "Start individual selector",
      href: "/which-itr-form-to-file?source=form_selector_full_guide",
      external: false,
    };
  }

  if (category === "ca-review") {
    return {
      label: "Ask CA before filing",
      href: "/expert-consultation?service=itr-filing&source=form_selector_full_guide",
      external: false,
    };
  }

  return {
    label: "Check official return route",
    href: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/%20income%20tax%20returns-faq",
    external: true,
  };
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm font-semibold leading-6 text-slate-700">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormGuideCard({ form }: { form: ItrReturnFormGuide }) {
  const cta = ctaFor(form.ctaCategory);

  return (
    <article id={form.id} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={formTone[form.id]}>{form.id}</Badge>
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{form.shortLabel}</span>
          </div>
          <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950">{form.title}</h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">{form.summary}</p>
        </div>
        {cta.external ? (
          <a href={cta.href} target="_blank" rel="noreferrer" className="shrink-0">
            <Button variant="outline" className="h-11 w-full border-slate-200 bg-white font-black text-slate-800 md:w-auto">
              {cta.label}
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        ) : (
          <Link href={cta.href} className="shrink-0">
            <Button className="h-11 w-full bg-blue-600 font-black text-white hover:bg-blue-700 md:w-auto">
              {cta.label}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <DetailList title="Applies to" items={form.appliesTo} />
        <DetailList title="Not for" items={form.notFor} />
      </div>

      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-4">
          <FileText className="mb-3 h-5 w-5 text-blue-700" />
          <DetailList title="Income heads" items={form.incomeSources} />
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <ClipboardCheck className="mb-3 h-5 w-5 text-blue-700" />
          <DetailList title="Key schedules" items={form.keySchedules} />
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <FileCheck2 className="mb-3 h-5 w-5 text-blue-700" />
          <DetailList title="Typical documents" items={form.typicalDocuments} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-2">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <CalendarDays className="mb-2 h-5 w-5 text-blue-700" />
          <p className="text-sm font-black text-blue-950">Deadline note</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{form.deadlineNote}</p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
          <HelpCircle className="mb-2 h-5 w-5 text-amber-700" />
          <p className="text-sm font-black text-amber-950">Late filing impact</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{form.lateFilingNote}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {form.sourceLinks.map((source) => (
          <a
            key={`${form.id}-${source.label}`}
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
          >
            {source.label}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    </article>
  );
}

export default function ITRFormSelectorPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <MetaSEO
        title="Which ITR Return Should You File for AY 2026-27? | MyeCA.in"
        description="Compare ITR-1, ITR-2, ITR-3, ITR-4, ITR-5, ITR-6, ITR-7 and ITR-U for AY 2026-27 with documents, schedules, deadlines, and CA-assisted filing paths."
        keywords={[
          "which ITR return to file",
          "ITR form selector AY 2026-27",
          "ITR-1 ITR-2 ITR-3 ITR-4 ITR-5 ITR-6 ITR-7 ITR-U",
          "income tax return form India",
          "CA assisted ITR filing",
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Which ITR Return to File", url: "/itr/form-selector" },
        ]}
        faqPageData={[
          {
            question: "Which ITR return should I file for AY 2026-27?",
            answer:
              "The return depends on taxpayer type, residential status, income heads, capital gains, business income, foreign assets, audit triggers, and whether the filing is original, revised, belated, or updated.",
          },
          {
            question: "Does MyeCA support every ITR form as a filing draft?",
            answer:
              "MyeCA keeps the public guide broad, but the active individual draft workflow remains focused on ITR-1 to ITR-4 with CA scope review for entity and complex cases.",
          },
        ]}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1fr_0.78fr] md:px-6 md:py-12 lg:px-8">
          <div>
            <Badge className="mb-4 border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-50">AY 2026-27 guide</Badge>
            <h1 className="type-page-title font-black text-slate-950">Which ITR Return Should You File for AY 2026-27?</h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-slate-600">
              Use this MyeCA guide to compare ITR-1 through ITR-7 and ITR-U before starting a filing draft,
              asking for CA-assisted review, or checking the official Income Tax portal. AY 2026-27 returns
              for FY 2025-26 continue under the Income Tax Act, 1961 framework.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/which-itr-form-to-file?source=form_selector_full_guide">
                <Button size="lg" className="h-12 bg-blue-600 font-black text-white hover:bg-blue-700">
                  Check my ITR plan in 60 sec
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/expert-consultation?service=itr-filing&source=form_selector_full_guide">
                <Button size="lg" variant="outline" className="h-12 border-blue-100 bg-blue-50 font-black text-blue-700 hover:bg-blue-100">
                  Ask CA before filing
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
            <ShieldCheck className="h-7 w-7 text-blue-700" />
            <h2 className="mt-4 text-xl font-black text-blue-950">Scope before payment</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
              This page is for form selection and document readiness. Final filing must follow the live Income Tax portal,
              current notifications, and reviewer judgment for complex cases.
            </p>
            <div className="mt-4 grid gap-2">
              {["Official sources checked", "All ITR forms covered", "Individual wizard kept separate"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-black text-slate-700">
                  <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          <div className="mb-5 flex items-start gap-3">
            <Scale className="mt-1 h-5 w-5 shrink-0 text-blue-700" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Fast decision strip</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Start from taxpayer type, then check blockers.</h2>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {itrReturnDecisionSteps.map((step) => (
              <a key={step.label} href={step.href} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50">
                <p className="text-sm font-black text-slate-950">{step.label}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{step.result}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Complete form map</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">ITR-1 to ITR-7 plus ITR-U</h2>
          </div>
          <div className="grid gap-2 text-sm font-semibold text-slate-600 sm:grid-cols-3 md:w-[520px]">
            <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2">
              <UsersRound className="h-4 w-4 text-blue-700" />
              Individuals
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2">
              <Building2 className="h-4 w-4 text-blue-700" />
              Entities
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2">
              <Landmark className="h-4 w-4 text-blue-700" />
              Trusts
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {itrReturnFormGuide.map((form) => (
            <FormGuideCard key={form.id} form={form} />
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-[0.8fr_1.2fr] md:px-6 lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Official source links</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Verify before final filing.</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
              MyeCA uses this page for practical guidance and CA-assisted readiness. The live portal,
              current forms, and notifications remain the final authority.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {itrReturnFormSourceLinks.map((source) => (
              <a
                key={source.label}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-16 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {source.label}
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
