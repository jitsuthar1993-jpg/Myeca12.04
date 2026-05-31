import { Link } from "wouter";
import { m } from "framer-motion";
import { ArrowRight, BarChart3, Briefcase, Building2, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    title: "Services Marketplace",
    description: "Browse CA and compliance services with scope, documents, and next steps visible before checkout.",
    icon: Briefcase,
    href: "/services/marketplace",
    badge: "Catalog",
    features: ["Plan scope", "Document needs", "Timeline notes"],
  },
  {
    title: "Document Generator",
    description: "Create common tax and business documents from structured templates when clean paperwork is needed.",
    icon: FileText,
    href: "/documents/generator",
    badge: "Templates",
    features: ["Rent receipts", "Salary slips", "GST invoices"],
  },
  {
    title: "Business Dashboard",
    description: "Track compliance items, service progress, and documents in one place for business workflows.",
    icon: Building2,
    href: "/business/dashboard",
    badge: "Business",
    features: ["Compliance tracker", "Document vault", "Due date view"],
  },
  {
    title: "Virtual CFO",
    description: "Request scoped finance support for reporting, cash-flow review, and decision preparation.",
    icon: BarChart3,
    href: "/business/virtual-cfo",
    badge: "Scoped",
    features: ["Financial reports", "Budget review", "Investor prep"],
  },
];

export default function ProfessionalServicesSection() {
  return (
    <section id="professional-services" className="border-b border-slate-200 bg-[#F8FAFC] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Business tools</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 lg:text-4xl">
              Tools for document-heavy tax and business work.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            These tools support the higher-trust conversion path: organize documents, confirm scope, and then move into the right service workspace.
          </p>
        </div>

        <m.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
        >
          {services.map((service) => (
            <Card key={service.title} className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-blue-200">
              <CardContent className="flex h-full flex-grow flex-col p-5">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <service.icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 type-meta font-bold uppercase tracking-wide text-slate-600">
                    {service.badge}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold tracking-tight text-slate-950 transition-colors group-hover:text-blue-700">
                  {service.title}
                </h3>
                <p className="mt-2 flex-grow text-sm leading-6 text-slate-600">{service.description}</p>

                <ul className="my-5 space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                        <Check className="h-3 w-3 text-emerald-600" strokeWidth={3.2} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href={service.href} className="mt-auto w-full">
                  <Button className="h-11 w-full rounded-lg bg-blue-600 text-sm font-bold text-white transition-colors hover:bg-blue-700">
                    Request scoped review
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </m.div>
      </div>
    </section>
  );
}
