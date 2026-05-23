import { Link } from "wouter";
import { m } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  FileText,
  BarChart3,
  Briefcase,
  ArrowRight,
  Check
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const services = [
  {
    title: "Services Marketplace",
    description: "Browse available CA and compliance services with scope, documents, and next steps visible before checkout.",
    icon: Briefcase,
    href: "/services/marketplace",
    color: "blue",
    badge: "Catalog",
    features: ["Plan scope", "Document needs", "Timeline notes"]
  },
  {
    title: "Document Generator",
    description: "Create common tax and business documents from structured templates when you need clean paperwork quickly.",
    icon: FileText,
    href: "/documents/generator",
    color: "teal",
    badge: "Templates",
    features: ["Rent receipts", "Salary slips", "GST invoices"]
  },
  {
    title: "Business Dashboard",
    description: "Track compliance items, service progress, and documents in one place for business workflows.",
    icon: Building2,
    href: "/business/dashboard",
    color: "slate",
    badge: "For Businesses",
    features: ["Compliance tracker", "Document vault", "Due date view"]
  },
  {
    title: "Virtual CFO",
    description: "Request scoped finance support for reporting, cash-flow review, and business decision preparation.",
    icon: BarChart3,
    href: "/business/virtual-cfo",
    color: "emerald",
    badge: "Scoped",
    features: ["Financial reports", "Budget review", "Investor prep"]
  }
];

const colorClasses: Record<string, { bg: string; icon: string; badgeBg: string; badgeText: string }> = {
  blue: { bg: "bg-[#eef2ff]", icon: "text-[#4f46e5]", badgeBg: "bg-[#eef2ff]", badgeText: "text-[#4f46e5]" },
  teal: { bg: "bg-[#ccfbf1]", icon: "text-[#0d9488]", badgeBg: "bg-[#ccfbf1]", badgeText: "text-[#0d9488]" },
  slate: { bg: "bg-[#f1f5f9]", icon: "text-[#475569]", badgeBg: "bg-[#f1f5f9]", badgeText: "text-[#475569]" },
  emerald: { bg: "bg-[#dcfce7]", icon: "text-[#15803d]", badgeBg: "bg-[#dcfce7]", badgeText: "text-[#15803d]" },
};

export default function ProfessionalServicesSection() {
  return (
    <section id="professional-services" className="border-b border-slate-200 bg-[#F8FAFC] py-8 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-3 md:mb-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Business tools</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              Tools and services for document-heavy tax work.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Use these when your filing needs supporting documents, business compliance tracking, or a scoped finance review.
          </p>
        </div>

        <m.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
        >
          {services.map((service) => {
            const colors = colorClasses[service.color];
            return (
              <m.div key={service.title} variants={itemVariants} className="h-full">
                <Card className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-blue-200">
                  <CardContent className="flex h-full flex-grow flex-col p-5">
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}>
                        <service.icon className={`h-5 w-5 ${colors.icon}`} strokeWidth={2} />
                      </div>
                      <span className={`rounded-full px-3 py-1 type-meta font-bold uppercase tracking-wide ${colors.badgeBg} ${colors.badgeText}`}>
                        {service.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold tracking-tight text-slate-950">
                      {service.title}
                    </h3>

                    <p className="mt-2 flex-grow text-sm leading-6 text-slate-600">
                      {service.description}
                    </p>

                    <ul className="my-5 space-y-3">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50">
                            <Check className="h-3 w-3 text-emerald-600" strokeWidth={3.5} />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link href={service.href} className="w-full flex justify-center mt-auto">
                      <Button className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-bold text-white transition-colors hover:bg-blue-700">
                        Open
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>

                  </CardContent>
                </Card>
              </m.div>
            );
          })}
        </m.div>
      </div>
    </section>
  );
}
