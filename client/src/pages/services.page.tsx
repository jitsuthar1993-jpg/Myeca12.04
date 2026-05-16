import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Globe2,
  Layers3,
  LifeBuoy,
  MessageCircle,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobilePageHeader } from "@/components/mobile";
import { cn } from "@/lib/utils";
import { formatPricingLabel, getPricingByServiceId } from "@/data/pricing";

const priceFor = (serviceId: string, fallback: string) => {
  const pricing = getPricingByServiceId(serviceId);
  return pricing ? formatPricingLabel(pricing.pricing) : fallback;
};

const categories = [
  {
    id: "individual",
    title: "Individual Tax",
    icon: UserRound,
    audience: "Salaried, investors, freelancers, NRIs",
    summary: "ITR filing, refunds, capital gains, and notices with CA-backed review.",
    services: [
      {
        title: "ITR Filing",
        description: "ITR-1 to ITR-4 with CA review, deductions, and e-verification support.",
        href: "/itr/form-selector",
        price: priceFor("itr-filing", "From ₹999 excluding GST"),
        meta: "Document-led",
      },
      {
        title: "Capital Gains",
        description: "Stocks, mutual funds, ESOPs, property gains, and loss harvesting checks.",
        href: "/calculators/capital-gains",
        price: "From ₹1,499 excluding GST",
        meta: "2-3 days",
      },
      {
        title: "Tax Notice Response",
        description: "Notice reading, reply drafting, document mapping, and submission support.",
        href: "/services/notice-compliance",
        price: priceFor("notice-compliance", "From ₹2,999 excluding GST"),
        meta: "Priority help",
      },
    ],
  },
  {
    id: "business",
    title: "Business Compliance",
    icon: Building2,
    audience: "Founders, SMEs, companies, operators",
    summary: "Registration, GST, monthly compliance, and filings for growing businesses.",
    services: [
      {
        title: "GST Registration",
        description: "Application filing, query handling, certificate download, and setup guidance.",
        href: "/services/gst-registration",
        price: priceFor("gst-registration", "From ₹2,999 excluding GST"),
        meta: "3-7 days",
      },
      {
        title: "GST Returns",
        description: "GSTR-1/3B filing, ITC reconciliation, and compliance calendar tracking.",
        href: "/services/gst-returns",
        price: priceFor("gst-returns", "₹999/month excluding GST"),
        meta: "Monthly",
      },
      {
        title: "Company Incorporation",
        description: "Name, DSC, DIN, MOA/AOA, PAN/TAN, and registration coordination.",
        href: "/services/company-registration",
        price: priceFor("company-registration", "From ₹6,999 excluding GST"),
        meta: "10-15 days",
      },
    ],
  },
  {
    id: "nri",
    title: "NRI & Cross-Border",
    icon: Globe2,
    audience: "NRIs, foreign asset holders, global income cases",
    summary: "India tax filing for foreign income, assets, DTAA, and repatriation context.",
    services: [
      {
        title: "DTAA Relief",
        description: "Treaty benefit review, tax credit support, and disclosure guidance.",
        href: "/services/tax-planning",
        price: "Custom quote",
        meta: "Advisory",
      },
      {
        title: "NRO/NRE Taxation",
        description: "Interest income, TDS refund, repatriation, and remittance documentation.",
        href: "/services/tax-planning",
        price: "Custom quote",
        meta: "CA call",
      },
      {
        title: "Foreign Assets",
        description: "Schedule FA support for overseas accounts, equity, ESOPs, and income.",
        href: "/services/tax-planning",
        price: "Custom quote",
        meta: "Specialist",
      },
    ],
  },
  {
    id: "specialized",
    title: "Startup & Legal",
    icon: ReceiptText,
    audience: "Brands, startups, teams, and back offices",
    summary: "Trademark, ISO, startup registrations, and documents with clear deliverables.",
    services: [
      {
        title: "Trademark Registration",
        description: "Brand search, class selection, filing support, and response workflow.",
        href: "/services/trademark-registration",
        price: priceFor("trademark-registration", "From ₹12,999 excluding GST"),
        meta: "IP support",
      },
      {
        title: "ISO Certification",
        description: "Process checks, documentation, audit coordination, and certificate support.",
        href: "/services/iso-certification",
        price: "From ₹9,999 excluding GST",
        meta: "Business",
      },
      {
        title: "Document Generator",
        description: "Invoices, receipts, board resolutions, letters, agreements, and affidavits.",
        href: "/documents/generator",
        price: "Free",
        meta: "Self-serve",
      },
    ],
  },
];

const filters = [
  { id: "all", label: "All services" },
  { id: "individual", label: "Individual" },
  { id: "business", label: "Business" },
  { id: "nri", label: "NRI" },
  { id: "specialized", label: "Startup & Legal" },
];

const proofPoints = [
  { value: "CA", label: "Reviewed deliverables" },
  { value: "4", label: "Service groups" },
  { value: "ITR", label: "Guided filing workflow" },
];

const serviceFlow = [
  {
    title: "Pick a path",
    description: "Choose the service group that matches your filing, registration, or advisory need.",
    icon: Layers3,
  },
  {
    title: "Share documents",
    description: "Upload or generate only the documents needed for that service workflow.",
    icon: ClipboardCheck,
  },
  {
    title: "Track expert review",
    description: "Move through validation, CA review, filing, and final deliverables in one place.",
    icon: BadgeCheck,
  },
];

const supportCards = [
  {
    title: "Transparent scope",
    description: "Price cues, timelines, and deliverables are visible before checkout.",
    icon: ShieldCheck,
  },
  {
    title: "Smart routing",
    description: "Each service opens a focused workflow or service page with the same URL structure.",
    icon: Calculator,
  },
  {
    title: "Human help",
    description: "Complex cases can move from self-serve tools into CA-assisted support.",
    icon: MessageCircle,
  },
];

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories
      .filter((category) => activeFilter === "all" || category.id === activeFilter)
      .map((category) => ({
        ...category,
        services: category.services.filter((service) => {
          if (!query) return true;

          return [
            category.title,
            category.audience,
            category.summary,
            service.title,
            service.description,
            service.price,
            service.meta,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        }),
      }))
      .filter((category) => category.services.length > 0);
  }, [activeFilter, searchQuery]);

  const totalVisibleServices = filteredCategories.reduce(
    (total, category) => total + category.services.length,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <MetaSEO
        title="MyeCA Services Marketplace | ITR, GST, Company Registration, NRI Tax"
        description="Explore MyeCA's CA-reviewed tax, GST, business compliance, NRI, and document services."
        keywords={["ITR filing", "GST registration", "company incorporation", "tax notice", "NRI tax"]}
      />

      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="lg:hidden">
              <MobilePageHeader
                eyebrow="Services marketplace"
                icon={<Sparkles className="h-3.5 w-3.5" />}
                title="Find the right service"
                description="ITR, GST, notices, company setup, and NRI tax with CA-reviewed next steps."
              />
            </div>

            <div className="hidden lg:block">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                <Sparkles className="h-3.5 w-3.5 text-[#315efb]" />
                Services marketplace
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
                Find the right tax and compliance service without decoding forms.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                Explore CA-reviewed services for ITR, GST, notices, company setup, NRI tax, and
                business compliance with clear timelines and next steps.
              </p>
            </div>

            <div className="mt-5 grid max-w-3xl gap-2 sm:grid-cols-[1fr_auto] md:mt-7 md:gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 md:left-4 md:h-5 md:w-5" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-11 rounded-lg border-slate-200 bg-white pl-10 text-sm text-slate-950 shadow-sm placeholder:text-slate-400 md:h-12 md:pl-12 md:text-base"
                  placeholder="Search services..."
                />
              </div>
              <Link href="/tax-assistant">
                <Button className="h-11 w-full rounded-lg bg-[#315efb] px-5 font-bold text-white shadow-sm hover:bg-[#2040d8] md:h-12 sm:w-auto">
                  <LifeBuoy className="h-4 w-4" />
                  Ask assistant
                </Button>
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 lg:hidden">
              {proofPoints.map((point) => (
                <div key={point.label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-sm font-black text-slate-950">{point.value}</p>
                  <p className="mt-0.5 text-[10px] leading-3 text-slate-500">{point.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden rounded-lg border border-slate-200 bg-slate-50 p-5 lg:block">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-[#315efb]">
                <Clock3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950">Service readiness</p>
                <p className="text-sm text-slate-600">Pick, upload, review, file.</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {proofPoints.map((point) => (
                <div key={point.label} className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-lg font-black text-slate-950">{point.value}</p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">{point.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-[60px] z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 md:static md:py-4 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "h-9 shrink-0 rounded-lg border px-3 text-xs font-bold transition md:h-10 md:px-4 md:text-sm",
                activeFilter === filter.id
                  ? "border-[#315efb] bg-[#315efb] text-white shadow-sm shadow-blue-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0050b5]">
              Service groups
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 md:mt-2 md:text-3xl">
              {totalVisibleServices} clear next steps
            </h2>
          </div>
          <p className="hidden max-w-xl text-sm leading-6 text-slate-600 sm:block">
            Every card keeps the existing route structure while presenting scope, price cue, and
            expected turnaround up front.
          </p>
        </div>

        {filteredCategories.length > 0 ? (
          <div className="mt-5 space-y-4 md:mt-8 md:space-y-6">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <section
                  key={category.title}
                  className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:p-6"
                >
                  <div className="grid gap-4 md:gap-6 lg:grid-cols-[300px_1fr]">
                    <div className="flex gap-3 lg:block">
                      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[#315efb] md:h-auto md:w-auto md:p-3">
                        <Icon className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black tracking-tight text-slate-950 md:mt-4 md:text-2xl">
                          {category.title}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500 md:mt-2 md:text-sm">{category.audience}</p>
                        <p className="mt-2 hidden text-sm leading-6 text-slate-600 md:block lg:mt-4">{category.summary}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3 md:gap-4">
                      {category.services.map((service) => (
                        <Link
                          key={service.title}
                          href={service.href}
                          className={cn(
                            "group flex min-h-0 flex-col rounded-lg border border-slate-200 bg-slate-50 p-4 transition md:min-h-[220px] md:p-5 md:hover:-translate-y-1 md:hover:shadow-lg md:hover:shadow-slate-200/70",
                            "hover:border-slate-300 hover:bg-white",
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600 md:px-2.5 md:text-[11px] md:normal-case md:tracking-normal">
                              {service.meta}
                            </span>
                            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#315efb]" />
                          </div>
                          <h4 className="mt-3 text-base font-black leading-tight text-slate-950 md:mt-4 md:text-lg">
                            {service.title}
                          </h4>
                          <p className="mt-1 line-clamp-2 flex-1 text-xs leading-5 text-slate-600 md:mt-2 md:line-clamp-none md:text-sm md:leading-6">
                            {service.description}
                          </p>
                          <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 md:mt-5 md:pt-4">
                            <CheckCircle2 className="h-4 w-4 text-slate-500" />
                            <span className="text-sm font-black text-[#315efb]">{service.price}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-4 text-xl font-black text-slate-950">No matching services</h3>
            <p className="mt-2 text-sm text-slate-600">Try a broader term like ITR, GST, notice, NRI, or company.</p>
          </div>
        )}
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-3 md:gap-4 lg:grid-cols-3">
            {serviceFlow.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#315efb] text-sm font-black text-white">
                      {index + 1}
                    </div>
                    <div>
                      <Icon className="hidden h-5 w-5 text-[#315efb] md:block" />
                      <h3 className="text-base font-black text-slate-950 md:mt-3 md:text-lg">{step.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-600 md:mt-2 md:text-sm md:leading-6">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 md:py-12 lg:grid-cols-[1fr_420px] lg:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0050b5]">
            Why MyeCA services
          </p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 md:mt-2 md:text-3xl">
            Built for repeated compliance work, not one-off confusion.
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 md:mt-6 md:gap-4">
            {supportCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:block md:p-5">
                  <Icon className="h-5 w-5 shrink-0 text-[#315efb] md:h-7 md:w-7" />
                  <div>
                    <h3 className="font-black text-slate-950 md:mt-4">{card.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600 md:mt-2 md:text-sm md:leading-6">{card.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg bg-[#082a5c] p-5 text-white shadow-xl shadow-blue-950/10 md:p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">Need help choosing?</p>
          <h2 className="mt-2 text-xl font-black leading-tight text-white md:mt-3 md:text-2xl">
            Tell us what changed this year. We will route you to the right service.
          </h2>
          <p className="mt-3 text-sm leading-6 text-blue-50/80">
            Salary switch, capital gains, GST registration, a tax notice, or a new company can all
            change your next step.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/expert-consultation">
              <Button className="h-11 w-full rounded-lg bg-white text-[#315efb] hover:bg-blue-50 sm:w-auto">
                Talk to expert
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/services/selection">
              <Button
                variant="outline"
                className="h-11 w-full rounded-lg border-white/25 bg-white/5 text-white hover:bg-white/15 sm:w-auto"
              >
                Browse guided flow
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
