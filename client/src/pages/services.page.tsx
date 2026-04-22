import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calculator,
  FileText,
  Globe2,
  ReceiptText,
  Search,
  ShieldCheck,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/ui/logo";
import { MyeCard, SectionHeading, StatusBadge } from "@/components/platform/compliance-ui";

const categories = [
  {
    title: "Individual Services",
    icon: FileText,
    audience: "Salaried, investors, freelancers",
    services: [
      ["ITR Filing", "ITR-1 to ITR-4 with CA review", "/itr/form-selector", "₹999"],
      ["Capital Gains", "Stocks, mutual funds, ESOPs", "/calculators/capital-gains", "₹1,499"],
      ["Tax Notice", "Plain-English notice response workflow", "/services/notice-compliance", "₹2,999"],
    ],
  },
  {
    title: "Business Services",
    icon: Building2,
    audience: "Startups, SMEs, companies",
    services: [
      ["GST Registration", "Registration and document checklist", "/services/gst-registration", "₹2,999"],
      ["GST Returns", "GSTR-1/3B and ITC reconciliation", "/services/gst-returns", "₹590"],
      ["Company Incorporation", "Name, DIN, documents, filing", "/services/company-registration", "₹7,999"],
    ],
  },
  {
    title: "NRI Services",
    icon: Globe2,
    audience: "NRIs and cross-border taxpayers",
    services: [
      ["DTAA Relief", "Foreign income and treaty support", "/services/tax-planning", "Custom"],
      ["NRO/NRE Taxation", "Interest, remittance, and disclosure", "/services/tax-planning", "Custom"],
      ["Foreign Assets", "Schedule FA support", "/services/tax-planning", "Custom"],
    ],
  },
  {
    title: "Specialized Tools",
    icon: ReceiptText,
    audience: "Founders and operators",
    services: [
      ["Trademark", "Brand protection workflow", "/services/trademark-registration", "₹6,999"],
      ["ISO Certification", "Process and document support", "/services/iso-certification", "₹9,999"],
      ["Document Generator", "Receipts, invoices, resolutions", "/documents/generator", "Free"],
    ],
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#f6f9fd]">
      <MetaSEO
        title="MyeCA Services Marketplace | ITR, GST, Company Registration, NRI Tax"
        description="Explore MyeCA's CA-reviewed tax, GST, business compliance, NRI, and document services."
        keywords={["ITR filing", "GST registration", "company incorporation", "tax notice", "NRI tax"]}
      />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-black text-[#315efb]">
            <Logo size="sm" />
            MyeCA.in
          </Link>
          <Link href="/auth/register">
            <Button className="bg-[#315efb] text-white hover:bg-[#082a5c]">Start now</Button>
          </Link>
        </div>
      </header>

      <section className="mye-brand-panel px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">Services marketplace</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            Choose the right compliance path without decoding forms.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50/90">
            Individual, business, NRI, and specialized services are grouped by intent with clear
            deliverables, pricing cues, timelines, and document expectations.
          </p>
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input className="h-14 rounded-2xl border-white/20 bg-white pl-12 text-slate-950" placeholder="Search ITR, GST, notices, company registration..." />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Categories"
          title="Everything has a clear next step"
          description="Each service card routes to a focused page or workflow while preserving existing URLs."
        />
        <div className="mt-8 grid gap-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <MyeCard key={category.title}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-sm">
                    <Icon className="h-9 w-9 text-[#315efb]" />
                    <h2 className="mt-4 text-2xl font-black text-slate-950">{category.title}</h2>
                    <p className="mt-2 text-slate-600">{category.audience}</p>
                    <StatusBadge status="ca_review" label="CA-assisted options" className="mt-4" />
                  </div>
                  <div className="grid flex-1 gap-4 md:grid-cols-3">
                    {category.services.map(([title, description, href, price]) => (
                      <Link key={title} href={href} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-[#315efb] hover:bg-blue-50">
                        <BadgeCheck className="h-6 w-6 text-emerald-800" />
                        <h3 className="mt-4 font-black text-slate-950">{title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{description}</p>
                        <div className="mt-5 flex items-center justify-between">
                          <span className="font-black text-[#315efb]">{price}</span>
                          <ArrowRight className="h-4 w-4 text-[#315efb]" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </MyeCard>
            );
          })}
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          {[
            ["Transparent deliverables", "Documents, timeline, price, and CA involvement are visible before checkout.", ShieldCheck],
            ["Smart recommendations", "Authenticated users see ITR/GST/service suggestions based on profile context.", Calculator],
            ["Stable workflows", "Long-running services use Kanban-style tracking and contextual CA chat.", Building2],
          ].map(([title, description, Icon]) => {
            const TypedIcon = Icon as typeof ShieldCheck;
            return (
              <MyeCard key={String(title)} className="p-7">
                <TypedIcon className="h-8 w-8 text-[#315efb]" />
                <h3 className="mt-4 text-xl font-black">{String(title)}</h3>
                <p className="mt-2 text-slate-600">{String(description)}</p>
              </MyeCard>
            );
          })}
        </div>
      </section>
    </main>
  );
}
