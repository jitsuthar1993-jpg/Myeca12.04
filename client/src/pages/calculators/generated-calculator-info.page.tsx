import { Link, useLocation } from "wouter";
import {
  BadgeIndianRupee,
  BookOpen,
  CheckCircle2,
  Coins,
  FileText,
  ListChecks,
  PiggyBank,
  WalletCards,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { findGeneratedCalculatorPage } from "@/data/missing-pages";

const icons = {
  BadgeIndianRupee,
  Coins,
  ListChecks,
  PiggyBank,
  WalletCards,
};

export default function GeneratedCalculatorInfoPage() {
  const [location] = useLocation();
  const slug = location.split("?")[0].split("/").filter(Boolean).pop() || "";
  const page = findGeneratedCalculatorPage(slug);

  if (!page) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20 text-center">
        <h1 className="type-page-title font-black text-slate-950">Calculator guide not found</h1>
        <Link href="/calculators">
          <Button className="mt-6">Back to calculators</Button>
        </Link>
      </main>
    );
  }

  const Icon = icons[page.icon as keyof typeof icons] || FileText;

  return (
    <main className="min-h-screen bg-slate-50">
      <MetaSEO
        title={`${page.title} | MyeCA.in`}
        description={page.description}
        keywords={[page.title, "tax calculator guide", "MyeCA calculators"]}
        type="calculator"
        calculatorData={{
          type: page.title,
          features: page.highlights,
          accuracy: "Planning guide",
          updates: "Reviewed by MyeCA experts",
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Calculators", url: "/calculators" },
          { name: page.title, url: `/calculators/${page.slug}` },
        ]}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.1fr_0.9fr] md:px-6 lg:px-8">
          <div>
            <Badge className="mb-5 bg-indigo-50 text-indigo-700">{page.subtitle}</Badge>
            <h1 className="type-page-title font-black text-slate-950">{page.title}</h1>
            <p className="type-body mt-6 max-w-3xl text-slate-600">{page.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/expert-consultation">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Ask a CA
                </Button>
              </Link>
              <Link href="/calculators">
                <Button size="lg" variant="outline">
                  Browse calculators
                </Button>
              </Link>
            </div>
          </div>
          <Card className="rounded-[28px] border-slate-200 bg-slate-50 shadow-sm">
            <CardContent className="p-6">
              <div className="rounded-3xl bg-white p-5 text-blue-700 shadow-sm">
                <Icon className="h-10 w-10" />
              </div>
              <h2 className="type-section-title mt-6 font-black text-slate-950">What this guide helps with</h2>
              <div className="mt-5 grid gap-3">
                {page.highlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-4">
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
        <InfoCard title="Inputs to Prepare" items={page.inputs} />
        <InfoCard title="Expected Output" items={page.outputs} />
        <InfoCard title="Important Limits" items={page.limitations} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:px-8">
        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col justify-between gap-6 p-8 md:flex-row md:items-center">
            <div>
              <BookOpen className="mb-4 h-7 w-7 text-blue-600" />
              <h2 className="type-section-title font-black text-slate-950">Continue with a related workflow</h2>
              <p className="type-body mt-2 text-slate-600">Use an existing tool or ask an expert to review your facts.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {page.relatedLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button variant={link.href.includes("expert") ? "default" : "outline"}>{link.label}</Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="h-full rounded-[24px] border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <h2 className="type-card-title font-black text-slate-950">{title}</h2>
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div key={item} className="flex gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
