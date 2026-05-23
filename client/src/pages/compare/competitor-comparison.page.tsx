import { Link, useLocation } from "wouter";
import { ArrowRight, CheckCircle2, ExternalLink, FileCheck2, ShieldCheck } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { caseTimelineStages, competitorPages, competitiveProofPoints } from "@/data/competitive-growth";

export default function CompetitorComparisonPage() {
  const [location] = useLocation();
  const slug = location.split("/").filter(Boolean).pop() || "";
  const page = competitorPages.find((item) => item.slug === slug) || competitorPages[0];

  return (
    <main className="min-h-screen bg-white">
      <MetaSEO
        title={`${page.title} | MyeCA.in`}
        description={page.description}
        keywords={[
          `${page.competitor} alternative`,
          "CA assisted ITR filing",
          "transparent tax filing pricing",
          "MyeCA comparison",
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Compare", url: "/compare" },
          { name: page.competitor, url: `/compare/${page.slug}` },
        ]}
        faqPageData={[
          {
            question: `Is MyeCA a factual alternative to ${page.competitor}?`,
            answer:
              "Yes. This page compares public positioning and product capabilities at a category level. It avoids private claims and focuses on MyeCA's own workflow, pricing clarity and expert-review strengths.",
          },
          {
            question: "What makes MyeCA different?",
            answer:
              "MyeCA emphasizes named CA accountability, visible document review, AIS/26AS mismatch checks, written scope before payment and case tracking from intake to post-filing support.",
          },
        ]}
      />

      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-6 lg:px-8">
          <div>
            <Badge className="mb-5 border-blue-100 bg-blue-50 text-blue-700">Competitor capture page</Badge>
            <h1 className="type-page-title text-slate-950">{page.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{page.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={page.primaryCta}>
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                  See MyeCA workflow
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  Compare plans
                </Button>
              </Link>
            </div>
          </div>

          <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">MyeCA position</p>
                  <h2 className="text-xl font-black text-slate-950">Expert-led, document-first filing</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {competitiveProofPoints.map((point) => (
                  <div key={point} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700">{point}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-2 md:px-6 lg:px-8">
        <Card className="rounded-[28px] border-slate-200">
          <CardContent className="p-6">
            <h2 className="text-2xl font-black text-slate-950">What {page.competitor} does well</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              These are the market strengths worth respecting and matching where relevant.
            </p>
            <div className="mt-6 space-y-3">
              {page.goodPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-slate-100 p-4 text-sm font-semibold text-slate-700">
                  {point}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-blue-200 bg-blue-50/40">
          <CardContent className="p-6">
            <h2 className="text-2xl font-black text-slate-950">Where MyeCA should win</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The conversion angle is stronger trust, clearer scope and a real case workflow.
            </p>
            <div className="mt-6 space-y-3">
              {page.myeCAEdge.map((point) => (
                <div key={point} className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-bold text-slate-800 shadow-sm">
                  <FileCheck2 className="h-5 w-5 text-blue-600" />
                  {point}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="bg-blue-700 px-4 py-14 text-white md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">Case workflow</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              The advantage is not another form. It is a visible filing journey.
            </h2>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {caseTimelineStages.map((stage, index) => (
              <div key={stage} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-black text-blue-200">0{index + 1}</p>
                <p className="mt-2 text-sm font-bold">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Source reference</p>
          <a href={page.source} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-blue-700">
            Public {page.competitor} reference
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <Link href={page.primaryCta}>
          <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
            Start with MyeCA
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </main>
  );
}
