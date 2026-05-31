import { m } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Building, Check, Clock, ShieldCheck, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Advance Tax Planning",
    description: "Review salary, business income, investments, and deduction readiness before paying advance tax.",
    price: "Rs. 1,999 excluding GST",
    features: ["Income review", "Deduction checklist", "Written next steps"],
    tat: "2-3 working days after complete details",
    icon: TrendingUp,
    color: "blue",
    badge: "Planning",
    href: "/expert-consultation?service=tax-planning",
  },
  {
    title: "Tax Notice Management",
    description: "Map the notice, deadline, risk, and document gaps before response drafting starts.",
    price: "Rs. 2,499 excluding GST",
    features: ["Notice analysis", "Draft response guidance", "Risk notes"],
    tat: "After complete document review",
    icon: ShieldCheck,
    color: "emerald",
    badge: "Notice",
    href: "/expert-consultation?service=notice-compliance",
  },
  {
    title: "HUF Tax Filing",
    description: "Get specialist filing support for Hindu Undivided Family income and documentation.",
    price: "Rs. 3,499 excluding GST",
    features: ["HUF checklist", "ITR-2/3 support", "Filing review"],
    tat: "3-5 working days after complete details",
    icon: Users,
    color: "indigo",
    badge: "Specialist",
    href: "/expert-consultation?service=huf-tax-filing",
  },
  {
    title: "Business GST Filing",
    description: "Prepare recurring GST returns with invoice checks, ITC review, and due-date clarity.",
    price: "Rs. 999 excluding GST",
    features: ["GSTR-1 and 3B", "ITC reconciliation", "Deadline checklist"],
    tat: "Monthly support, scoped before payment",
    icon: Building,
    color: "slate",
    badge: "Monthly",
    href: "/expert-consultation?service=gst-returns",
  },
];

const colorVariants: Record<string, { bg: string; icon: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-700" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-700" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-700" },
  slate: { bg: "bg-slate-100", icon: "text-slate-700" },
};

export default function OtherServicesSection() {
  return (
    <section className="border-y border-slate-200 bg-[#F8FAFC] py-14">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-8 grid max-w-7xl gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              <Zap className="h-3.5 w-3.5" />
              Scope-first pricing
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 lg:text-4xl">
              Advisory services that start with clarity.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Each service card explains the scope, documents, timing, and fee expectation so visitors can request the right help without guessing.
          </p>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const colors = colorVariants[service.color];
            return (
              <m.div
                key={service.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <Card className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-blue-200">
                  <CardContent className="flex flex-grow flex-col p-5">
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", colors.bg)}>
                        <service.icon className={cn("h-5 w-5", colors.icon)} strokeWidth={2.4} />
                      </div>
                      <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 type-meta font-bold uppercase tracking-wide text-slate-600">
                        {service.badge}
                      </div>
                    </div>

                    <h3 className="text-lg font-extrabold tracking-tight text-slate-950 transition-colors group-hover:text-blue-700">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>

                    <div className="my-5 space-y-3">
                      {service.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                            <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} />
                          </div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto border-t border-slate-200 pt-5">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">From</p>
                      <div className="mt-1 text-xl font-extrabold text-slate-950">{service.price}</div>
                      <div className="mt-2 flex items-start gap-2 text-xs font-semibold leading-5 text-slate-500">
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                        {service.tat}
                      </div>

                      <Link href={service.href}>
                        <Button className="mt-5 h-11 w-full rounded-lg border-none bg-blue-600 font-bold text-white transition-colors hover:bg-blue-700">
                          Request scoped review
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
