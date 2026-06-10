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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBlogCoverImageSrc } from "@/lib/blog-cover-assets";
import {
  ITR_SEASON_CAMPAIGN_BASE,
  buildCampaignUrl,
  getItrSeasonAsset,
  itrSeasonCampaignAssets,
  type ItrSeasonCampaignAsset,
} from "@/data/itr-season-campaign";

const iconMap = {
  search: SearchCheck,
  form: FileText,
  gains: TrendingUp,
  calendar: CalendarCheck2,
};

const operatingRhythm = [
  "Publish one ITR-season answer, checklist, or workflow every day during launch.",
  "Route awareness readers to a tool before asking for consultation.",
  "Pitch expert quotes and useful resources, never paid dofollow links.",
  "Review Search Console weekly for indexing, CTR, queries, and conversion paths.",
];

export default function ItrSeasonCampaignPage() {
  const [location] = useLocation();
  const slug = location.split("?")[0].split("/").filter(Boolean)[1] || "";
  const asset = slug ? getItrSeasonAsset(slug) : undefined;

  if (slug && !asset) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20 text-center">
        <h1 className="type-page-title font-black text-slate-950">ITR season asset not found</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          This campaign resource may have moved. Browse the AY 2026-27 hub for current checklists and tools.
        </p>
        <Link href={ITR_SEASON_CAMPAIGN_BASE}>
          <Button className="mt-6 bg-blue-600 text-white hover:bg-blue-700">Open ITR season hub</Button>
        </Link>
      </main>
    );
  }

  return asset ? <CampaignAssetPage asset={asset} /> : <CampaignHubPage />;
}

function CampaignHubPage() {
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
          { name: "ITR Season 2026", url: ITR_SEASON_CAMPAIGN_BASE },
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
            <Badge className="mb-5 border-blue-100 bg-blue-50 text-blue-700">AY 2026-27 launch hub</Badge>
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
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Linkable assets</p>
            <h2 className="type-section-title mt-2 font-black text-slate-950">Campaign resources to publish and pitch</h2>
          </div>
          <Link href="/blog">
            <Button variant="outline">Browse all ITR guides</Button>
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {itrSeasonCampaignAssets.map((asset) => (
            <AssetCard key={asset.slug} asset={asset} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[0.8fr_1.2fr] md:px-6 lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Operating rhythm</p>
            <h2 className="type-section-title mt-2 font-black text-slate-950">Aggressive growth without link spam</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Each asset is built to be useful on its own, then promoted through expert quotes,
              resource-page outreach, community answers, HR/payroll partners, and newsletters.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {operatingRhythm.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-600" />
                <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
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

function CampaignAssetPage({ asset }: { asset: ItrSeasonCampaignAsset }) {
  const Icon = iconMap[asset.icon];
  const path = `${ITR_SEASON_CAMPAIGN_BASE}/${asset.slug}`;

  return (
    <main className="min-h-screen bg-slate-50">
      <MetaSEO
        title={`${asset.title} | MyeCA.in`}
        description={asset.description}
        keywords={[asset.shortTitle, "AY 2026-27 ITR", "MyeCA tax checklist", "ITR filing India"]}
        type="article"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "ITR Season 2026", url: ITR_SEASON_CAMPAIGN_BASE },
          { name: asset.shortTitle, url: path },
        ]}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1fr_0.78fr] md:px-6 lg:px-8">
          <div>
            <Link href={ITR_SEASON_CAMPAIGN_BASE}>
              <span className="text-sm font-bold text-blue-700">AY 2026-27 ITR hub</span>
            </Link>
            <Badge className="mt-5 block w-fit border-blue-100 bg-blue-50 text-blue-700">{asset.eyebrow}</Badge>
            <h1 className="type-page-title mt-4 font-black text-slate-950">{asset.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{asset.description}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={asset.toolLink.href}>
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                  {asset.toolLink.label} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={asset.conversionLink.href}>
                <Button size="lg" variant="outline">{asset.conversionLink.label}</Button>
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <img src={getBlogCoverImageSrc(asset.coverImage)} alt={asset.title} className="aspect-[16/10] w-full rounded-xl object-contain p-2" />
            <div className="mt-3 rounded-xl bg-slate-50 p-4">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Reader intent</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{asset.intent}</p>
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
            {asset.checklist.map((item) => (
              <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <ShieldCheck className="mb-4 h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-black text-slate-950">Outreach angles</h2>
            <div className="mt-4 space-y-3">
              {asset.outreachAngles.map((angle) => (
                <p key={angle} className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold leading-6 text-slate-700">
                  {angle}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Tracked outreach URL</p>
            <code className="mt-3 block break-all rounded-xl bg-white p-3 text-xs font-semibold text-slate-700">
              {buildCampaignUrl(path, "outreach", asset.slug)}
            </code>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <ShieldCheck className="mb-4 h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-black text-slate-950">Review note</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{asset.reviewNote}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{asset.disclaimer}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {asset.sourceLinks.map((source) => (
                <a
                  key={`${asset.slug}-${source.href}`}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-800 transition hover:border-amber-400"
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
            {[asset.toolLink, asset.conversionLink, asset.relatedBlogLink, asset.learnGuideLink].map((link) => (
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

function AssetCard({ asset }: { asset: ItrSeasonCampaignAsset }) {
  const Icon = iconMap[asset.icon];
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-lg">
      <div className="grid h-full md:grid-cols-[180px_1fr]">
        <div className="bg-blue-50 p-3">
          <img src={getBlogCoverImageSrc(asset.coverImage)} alt={asset.title} className="h-full min-h-[170px] w-full rounded-xl bg-white object-contain p-2" />
        </div>
        <div className="flex h-full flex-col p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">{asset.eyebrow}</p>
          </div>
          <h3 className="text-xl font-black leading-snug text-slate-950">{asset.shortTitle}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{asset.description}</p>
          <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{asset.audience}</p>
          <div className="mt-auto flex flex-wrap gap-3 pt-5">
            <Link href={`${ITR_SEASON_CAMPAIGN_BASE}/${asset.slug}`}>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">Open asset</Button>
            </Link>
            <Link href={asset.toolLink.href}>
              <Button variant="outline">{asset.toolLink.label}</Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
