import { Link, useLocation } from "wouter";
import { BookOpenCheck, CheckCircle2, Map, Rocket, TrendingUp } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { findGeneratedStartupPage } from "@/data/missing-pages";

const icons = {
  BookOpenCheck,
  Map,
  TrendingUp,
};

export default function GeneratedStartupTopicPage() {
  const [location] = useLocation();
  const slug = location.split("?")[0].split("/").filter(Boolean).pop() || "";
  const page = findGeneratedStartupPage(slug);

  if (!page) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20 text-center">
        <h1 className="type-page-title font-black text-slate-950">Startup topic not found</h1>
        <Link href="/startup-services">
          <Button className="mt-6">Back to startup services</Button>
        </Link>
      </main>
    );
  }

  const Icon = icons[page.icon as keyof typeof icons] || Rocket;

  return (
    <main className="min-h-screen bg-white">
      <MetaSEO
        title={`${page.title} | MyeCA.in`}
        description={page.description}
        canonicalUrl={`/startup/${page.slug}`}
        keywords={[page.title, "startup services India", "MyeCA startup advisory"]}
        type="service"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Startup Services", url: "/startup-services" },
          { name: page.title, url: `/startup/${page.slug}` },
        ]}
      />

      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1fr_0.9fr] md:px-6 lg:px-8">
          <div>
            <Badge className="mb-5 bg-emerald-50 text-emerald-700">{page.subtitle}</Badge>
            <h1 className="type-page-title font-black text-slate-950">{page.title}</h1>
            <p className="type-body mt-6 max-w-3xl text-slate-600">{page.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/expert-consultation?service=startup-${page.slug}`}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Plan with an expert
                </Button>
              </Link>
              <Link href="/startup-services">
                <Button size="lg" variant="outline">
                  See startup packages
                </Button>
              </Link>
            </div>
          </div>
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-700">
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Founder workflow</p>
                  <h2 className="type-section-title font-black text-slate-950">Build from clean foundations</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {page.highlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-3 md:px-6 lg:px-8">
        <StartupCard title="Deliverables" items={page.deliverables} />
        <StartupCard title="Process" items={page.process} ordered />
        <StartupCard title="Related Workflows" items={page.relatedLinks.map((item) => item.label)} links={page.relatedLinks} />
      </section>
    </main>
  );
}

function StartupCard({
  title,
  items,
  ordered = false,
  links,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
  links?: Array<{ label: string; href: string }>;
}) {
  return (
    <Card className="h-full rounded-[24px] border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <h2 className="type-card-title font-black text-slate-950">{title}</h2>
        <div className="mt-5 space-y-3">
          {items.map((item, index) => {
            const maybeLink = links?.find((link) => link.label === item);
            return (
              <div key={item} className="flex gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-blue-700">
                  {ordered ? index + 1 : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </span>
                {maybeLink ? (
                  <Link href={maybeLink.href} className="font-bold text-blue-700 hover:text-blue-800">
                    {item}
                  </Link>
                ) : (
                  <span>{item}</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
