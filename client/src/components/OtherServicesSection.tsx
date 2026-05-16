import { m } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight,
  Building,
  Check,
  Clock,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Advance Tax Planning",
    description: "Tax planning review for salary, business income, investments, and deduction readiness.",
    price: "₹1,999 excluding GST",
    features: ["Income review", "Deduction checklist", "Written next steps"],
    tat: "2-3 working days after complete details",
    icon: TrendingUp,
    color: "blue",
    badge: "Scope review",
    href: "/expert-consultation?service=tax-planning",
  },
  {
    title: "Tax Notice Management",
    description: "Notice analysis, document checklist, and response drafting support based on facts.",
    price: "₹2,499 excluding GST",
    features: ["Notice analysis", "Draft response guidance", "Risk notes"],
    tat: "After complete document review",
    icon: ShieldCheck,
    color: "emerald",
    badge: "Notice review",
    href: "/expert-consultation?service=notice-compliance",
  },
  {
    title: "HUF Tax Filing",
    description: "Filing and compliance support for Hindu Undivided Family tax cases.",
    price: "₹3,499 excluding GST",
    features: ["HUF document checklist", "ITR-2/3 support", "Filing review"],
    tat: "3-5 working days after complete details",
    icon: Users,
    color: "indigo",
    badge: "Specialist scope",
    href: "/expert-consultation?service=huf-tax-filing",
  },
  {
    title: "Business GST Filing",
    description: "Recurring GST return support with invoice checks and ITC reconciliation.",
    price: "₹999 excluding GST",
    features: ["GSTR-1 & 3B support", "ITC reconciliation", "Deadline checklist"],
    tat: "Monthly support, scoped before payment",
    icon: Building,
    color: "slate",
    badge: "Monthly scope",
    href: "/expert-consultation?service=gst-returns",
    label: "Monthly",
  },
];

const colorVariants: Record<string, { bg: string; icon: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600" },
  slate: { bg: "bg-slate-50", icon: "text-slate-600" },
};

export default function OtherServicesSection() {
  return (
    <section className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[13px] font-bold text-slate-500 shadow-sm border border-slate-100 mb-6 uppercase tracking-widest">
            <Zap className="w-4 h-4 text-blue-600" />
            Specialized Advisory
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Advisory <span className="text-blue-600">Services</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            Review-led compliance and planning services with scope confirmed before payment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const colors = colorVariants[service.color];
            return (
              <m.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-white border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col">
                  <CardContent className="p-8 flex-grow flex flex-col">
                    <div className="flex items-start justify-between mb-8">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110", colors.bg)}>
                        <service.icon className={cn("w-7 h-7", colors.icon)} strokeWidth={2.5} />
                      </div>
                      <div className="bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        {service.badge}
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-[15px] text-slate-500 leading-relaxed mb-8 font-medium">
                      {service.description}
                    </p>

                    <div className="space-y-4 mb-8">
                      {service.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-blue-600" strokeWidth={3} />
                          </div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-8 border-t border-slate-100">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-black text-slate-900">{service.price}</span>
                        {service.label && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ {service.label}</span>}
                      </div>
                      <div className="mb-6 flex items-start gap-2 text-xs font-semibold text-slate-500">
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                        {service.tat}
                      </div>

                      <Link href={service.href}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 font-black shadow-lg shadow-blue-500/20 transition-all border-none">
                          Request Scope
                          <ArrowRight className="w-4 h-4 ml-2" />
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
