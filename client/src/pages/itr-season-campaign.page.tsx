import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  SearchCheck,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { ItrDeadlineNotice } from "@/components/campaign/ItrDeadlineNotice";
import { getItrDeadlineMessage } from "@/components/campaign/itr-deadline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBlogCoverImageSrc } from "@/lib/blog-cover-assets";
import {
  ITR_SEASON_HUB_BASE,
  getItrSeasonGuide,
  itrSeasonGuides,
  type ItrSeasonGuide,
  type SeasonGuideLink,
} from "@/data/itr-season-campaign";

const iconMap = {
  search: SearchCheck,
  form: FileText,
  gains: TrendingUp,
  calendar: CalendarCheck2,
};

const filingSteps: Array<{ title: string; detail: string; links: SeasonGuideLink[] }> = [
  {
    title: "Collect and reconcile documents",
    detail: "Pull Form 16, AIS, TIS, and Form 26AS, then resolve mismatches before you compute anything.",
    links: [{ label: "Parse Form 16", href: "/form16-parser" }],
  },
  {
    title: "Estimate tax and compare regimes",
    detail: "Check your liability under the old and new regimes before you commit to one on the portal.",
    links: [
      { label: "Estimate income tax", href: "/calculators/income-tax" },
      { label: "Compare regimes", href: "/calculators/regime-comparator" },
    ],
  },
  {
    title: "Confirm your ITR form",
    detail: "Capital gains, business income, ESOPs, and foreign assets change which form applies to you.",
    links: [{ label: "Find your form", href: "/itr/form-selector" }],
  },
  {
    title: "File, e-verify, and follow the refund",
    detail: "E-verify within the allowed window so your return is treated as filed, then check refund status once processing starts.",
    links: [{ label: "Track refund status", href: "/tds-refund-tracker" }],
  },
];

const deadlineCategories = ["salaried", "business-profession"] as const;

export default function ItrSeasonPage() {
  const [location] = useLocation();
  const slug = location.split("?")[0].split("/").filter(Boolean)[1] || "";
  const guide = slug ? getItrSeasonGuide(slug) : undefined;

  if (slug && !guide) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20 text-center">
        <h1 className="type-page-title font-black text-slate-950">ITR season guide not found</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          This guide may have moved. Browse the AY 2026-27 hub for current checklists and tools.
        </p>
        <Link href={ITR_SEASON_HUB_BASE}>
          <Button className="mt-6 bg-blue-600 text-white hover:bg-blue-700">Open ITR season hub</Button>
        </Link>
      </main>
    );
  }

  return guide ? <SeasonGuidePage guide={guide} /> : <SeasonHubPage />;
}

function SeasonHubPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <MetaSEO
        title="AY 2026-27 ITR Season Hub | MyeCA.in"
        description="Use MyeCA's AY 2026-27 ITR season hub for Form 16, AIS/Form 26AS, capital gains, refund tracking, and filing readiness workflows."
        keywords={[
          "AY 2026-27 ITR season",
          "ITR filing checklist",
          "Form 16 parser",
          "AIS Form 26AS mismatch",
          "capital gains ITR checklist",
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "ITR Season 2026", url: ITR_SEASON_HUB_BASE },
        ]}
        faqPageData={[
          {
            question: "What is the fastest way to prepare for AY 2026-27 ITR filing?",
            answer:
              "Start by organizing Form 16, AIS, Form 26AS, deduction proofs, bank validation, and capital-gains records, then use a calculator or parser before filing.",
          },
          {
            question: "When should I use expert review?",
            answer:
              "Use expert review for AIS mismatches, multiple Form 16s, capital gains, business income, foreign assets, notices, or refund/demand uncertainty.",
          },
        ]}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1fr_0.82fr] md:px-6 lg:px-8">
          <div>
            <Badge className="mb-5 border-blue-100 bg-blue-50 text-blue-700">AY 2026-27 ITR season</Badge>
            <h1 className="type-page-title font-black text-slate-950">
              Prepare, verify, and file your AY 2026-27 ITR with fewer surprises.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              Use these MyeCA checklists and tools to move from tax-season questions into clean documents,
              calculator-backed estimates, and scoped expert review where the facts need a CA.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/which-itr-form-to-file?source=itr_season_hero">
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                  Start ITR path <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/form16-parser">
                <Button size="lg" variant="outline">Parse Form 16</Button>
              </Link>
            </div>
            <div className="mt-5">
              <ItrDeadlineNotice />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 p-3 shadow-sm">
            <img
              src={getBlogCoverImageSrc("/assets/blog/text-covers/when-will-itr-filing-start-ay-2026-27.svg")}
              alt="AY 2026-27 ITR filing season checklist"
              className="aspect-[16/10] w-full rounded-xl bg-white object-contain p-2"
            />
            <div className="grid grid-cols-2 gap-2 pt-3">
              {["Form 16", "AIS/26AS", "Capital gains", "Refund status"].map((item) => (
                <div key={item} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Season guides</p>
            <h2 className="type-section-title mt-2 font-black text-slate-950">Pick the checklist that matches your next step</h2>
          </div>
          <Link href="/blog">
            <Button variant="outline">Browse all ITR guides</Button>
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {itrSeasonGuides.map((guide) => (
            <SeasonGuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[0.8fr_1.2fr] md:px-6 lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Key dates</p>
            <h2 className="type-section-title mt-2 font-black text-slate-950">Know your due date, then work backwards</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Your due date depends on how you earn. File early enough that AIS feedback, bank validation,
              and e-verification clear before the date instead of after it.
            </p>
            <div className="mt-5 space-y-3">
              {deadlineCategories.map((category) => {
                const message = getItrDeadlineMessage(category);
                return (
                  <div key={category} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-lg font-black text-slate-950">{message.dateLabel}</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{message.categoryLabel}</p>
                  </div>
                );
              })}
            </div>
            <Link href="/learn/guide/important-tax-deadlines">
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800">
                See all filing deadlines <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {filingSteps.map((step, index) => (
              <div key={step.title} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-base font-black text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {step.links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50">
                        {link.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6 shadow-sm md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Complex case?</p>
              <h2 className="type-section-title mt-2 font-black text-blue-800">Get a scoped CA review before filing.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                AIS mismatches, multiple employers, capital gains, business income, foreign assets, and notices
                should be reviewed before the return is submitted.
              </p>
            </div>
            <Link href="/expert-consultation">
              <Button size="lg" variant="outline" className="border-blue-200 bg-white text-blue-700 hover:border-blue-300 hover:bg-blue-50">
                Request expert review <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SeasonGuidePage({ guide }: { guide: ItrSeasonGuide }) {
  const Icon = iconMap[guide.icon];
  const path = `${ITR_SEASON_HUB_BASE}/${guide.slug}`;

  return (
    <main className="min-h-screen bg-slate-50">
      <MetaSEO
        title={`${guide.title} | MyeCA.in`}
        description={guide.description}
        keywords={[guide.shortTitle, "AY 2026-27 ITR", "MyeCA tax checklist", "ITR filing India"]}
        type="article"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "ITR Season 2026", url: ITR_SEASON_HUB_BASE },
          { name: guide.shortTitle, url: path },
        ]}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1fr_0.78fr] md:px-6 lg:px-8">
          <div>
            <Link href={ITR_SEASON_HUB_BASE}>
              <span className="text-sm font-bold text-blue-700">AY 2026-27 ITR hub</span>
            </Link>
            <Badge className="mt-5 block w-fit border-blue-100 bg-blue-50 text-blue-700">{guide.eyebrow}</Badge>
            <h1 className="type-page-title mt-4 font-black text-slate-950">{guide.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{guide.description}</p>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500">{guide.audience}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={guide.toolLink.href}>
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                  {guide.toolLink.label} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={guide.conversionLink.href}>
                <Button size="lg" variant="outline">{guide.conversionLink.label}</Button>
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <img src={getBlogCoverImageSrc(guide.coverImage)} alt={guide.title} className="aspect-[16/10] w-full rounded-xl object-contain p-2" />
            <div className="mt-3 rounded-xl bg-slate-50 p-4">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">What you'll get done</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{guide.purpose}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-[1fr_0.82fr] md:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <ClipboardCheck className="h-6 w-6 text-blue-600" />
            <h2 className="type-section-title font-black text-slate-950">Checklist</h2>
          </div>
          <div className="space-y-3">
            {guide.checklist.map((item) => (
              <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <ShieldCheck className="mb-4 h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-black text-slate-950">Before you rely on this</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{guide.reviewNote}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{guide.disclaimer}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Official sources</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cross-check dates, forms, and portal steps against these pages before you submit.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {guide.sourceLinks.map((source) => (
                <a
                  key={`${guide.slug}-${source.href}`}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                >
                  {source.label}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 md:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="type-section-title font-black text-slate-950">Continue the filing workflow</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[guide.toolLink, guide.conversionLink, guide.relatedBlogLink, guide.learnGuideLink].map((link) => (
              <Link key={link.href} href={link.href}>
                <span className="flex h-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                  {link.label}
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function SeasonGuideCard({ guide }: { guide: ItrSeasonGuide }) {
  const Icon = iconMap[guide.icon];
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-lg">
      <div className="grid h-full md:grid-cols-[180px_1fr]">
        <div className="bg-blue-50 p-3">
          <img src={getBlogCoverImageSrc(guide.coverImage)} alt={guide.title} className="h-full min-h-[170px] w-full rounded-xl bg-white object-contain p-2" />
        </div>
        <div className="flex h-full flex-col p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">{guide.eyebrow}</p>
          </div>
          <h3 className="text-xl font-black leading-snug text-slate-950">{guide.shortTitle}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{guide.description}</p>
          <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{guide.audience}</p>
          <div className="mt-auto flex flex-wrap gap-3 pt-5">
            <Link href={`${ITR_SEASON_HUB_BASE}/${guide.slug}`}>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">Open guide</Button>
            </Link>
            <Link href={guide.toolLink.href}>
              <Button variant="outline">{guide.toolLink.label}</Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
