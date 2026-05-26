import { useMemo, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Building2,
  Calculator,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Home,
  MessageCircle,
  PiggyBank,
  Receipt,
  Search,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import MetaSEO from "@/components/seo/MetaSEO";
import { getSEOConfig } from "@/config/seo.config";
import { allServices, type Service } from "@/data/all-services";

const iconMap = {
  AlertTriangle,
  Award,
  Building2,
  Calculator,
  CreditCard,
  FileText,
  Home,
  MessageCircle,
  PiggyBank,
  Receipt,
  Shield,
  TrendingUp,
};

const sectionLabels: Record<string, string> = {
  Services: "Tax and compliance",
  Startup: "Business setup",
  Calculators: "Calculators",
  "ITR Filing": "ITR preparation",
};

const proofItems = [
  "Upload Form 16 and AIS first for ITR work.",
  "CA review starts after the document checklist is complete.",
  "No PAN, passwords, or full records are needed in public contact forms.",
];

function ServiceCard({ service }: { service: Service }) {
  const IconComponent = iconMap[service.icon as keyof typeof iconMap] ?? FileText;
  const price = service.price ?? (service.ctaLabel === "Open calculator" ? "Free calculator" : "Price shown after review");

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.18 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col rounded-lg border-slate-200 bg-white shadow-sm transition-colors hover:border-blue-200">
        <CardContent className="flex h-full flex-col p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <IconComponent className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
              {service.category}
            </Badge>
          </div>

          <h2 className="mt-5 text-lg font-extrabold leading-snug text-slate-950">{service.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>

          <div className="mt-5 grid gap-3 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Price cue</p>
              <p className="mt-1 font-bold text-slate-900">{price}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                <Clock3 className="h-3.5 w-3.5" />
                Turnaround
              </p>
              <p className="mt-1 leading-5 text-slate-700">{service.turnaround}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Documents commonly needed</p>
              <ul className="mt-3 space-y-2">
                {service.documents.slice(0, 3).map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-5 text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">MyeCA checks</p>
              <ul className="mt-3 space-y-2">
                {service.checks.slice(0, 3).map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-5 text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-auto pt-6">
            {service.path ? (
              <Link href={service.path}>
                <Button className="h-11 w-full rounded-lg bg-blue-700 font-bold text-white hover:bg-blue-800">
                  {service.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button disabled className="h-11 w-full rounded-lg">
                Request details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
}

export default function AllServicesPage() {
  const seo = getSEOConfig("/all-services");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("all");

  const sections = useMemo(() => ["all", ...Array.from(new Set(allServices.map((service) => service.section)))], []);

  const filteredServices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return allServices.filter((service) => {
      const searchable = [
        service.title,
        service.description,
        service.category,
        service.section,
        ...service.documents,
        ...service.checks,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);
      const matchesSection = activeSection === "all" || service.section === activeSection;
      return matchesSearch && matchesSection;
    });
  }, [activeSection, searchTerm]);

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <MetaSEO
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        type={seo?.type}
        breadcrumbs={seo?.breadcrumbs}
      />

      <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-end">
            <div>
              <Badge className="mb-5 border-blue-100 bg-blue-50 text-blue-700">Public services catalogue</Badge>
              <h1 className="type-hero-title max-w-4xl font-extrabold text-slate-950">
                Choose the tax service by the documents you already have.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                Browse ITR filing, GST, notices, startup compliance, and calculators with the document list and review checks visible before you begin.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Before you choose</p>
              <div className="mt-4 grid gap-3">
                {proofItems.map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search ITR, GST, notice, capital gains..."
                className="h-12 rounded-lg border-slate-200 bg-white pl-10 shadow-sm"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:justify-end">
              {sections.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className={`h-10 shrink-0 rounded-lg border px-4 text-sm font-bold transition-colors ${
                    activeSection === section
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  {section === "all" ? "All services" : sectionLabels[section] ?? section}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                {activeSection === "all" ? "All categories" : sectionLabels[activeSection] ?? activeSection}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                {filteredServices.length} matching service{filteredServices.length === 1 ? "" : "s"}
              </h2>
            </div>
            <Link href="/contact" className="text-sm font-bold text-blue-700 hover:text-blue-800">
              Not sure where to start? Send a short summary
            </Link>
          </div>

          {filteredServices.length > 0 ? (
            <m.div layout className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </AnimatePresence>
            </m.div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-400" />
              <h2 className="mt-4 text-xl font-extrabold text-slate-950">No services found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Try a different keyword such as Form 16, GST, notice, capital gains, or company registration.
              </p>
              <Button
                variant="outline"
                className="mt-5 rounded-lg"
                onClick={() => {
                  setSearchTerm("");
                  setActiveSection("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
