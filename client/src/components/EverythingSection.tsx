import { m } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calculator, Scan, ShieldCheck, Zap } from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    id: "itr-filing",
    title: "Guided ITR Filing",
    description: "File your ITR through simple guided steps and add CA review where your case needs it.",
    label: "Start filing",
    tone: "bg-blue-50 text-blue-700",
    icon: Zap,
    href: "/itr/form-selector"
  },
  {
    id: "tax-calculators", 
    title: "Tax Estimate Calculator",
    description: "Estimate tax, compare old vs new regime, and review assumptions before filing.",
    label: "Estimate",
    tone: "bg-emerald-50 text-emerald-700",
    icon: Calculator,
    href: "/calculators"
  },
  {
    id: "document-vault",
    title: "Document Upload & Review",
    description: "Upload Form 16, AIS, bank statements, and certificates so extracted details can be checked before filing.",
    label: "Prepare docs",
    tone: "bg-indigo-50 text-indigo-700",
    icon: Scan,
    href: "/services/document-vault"
  },
  {
    id: "tax-expert",
    title: "Expert Tax Review",
    description: "Get expert review for complex deductions, notices, capital gains, business income, and NRI cases.",
    label: "Review",
    tone: "bg-amber-50 text-amber-700",
    icon: ShieldCheck,
    href: "/expert-consultation"
  }
];

export default function EverythingSection() {
  return (
    <section id="services" className="scroll-mt-20 border-b border-slate-200 bg-white py-8 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <m.div
          className="mb-6 grid gap-3 md:mb-8 md:grid-cols-[0.8fr_1.2fr] md:items-end"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Connected workflow</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              Move from estimate to filing without guessing the next step.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Keep planning, document readiness, and optional expert review connected before you commit to payment or submission.
          </p>
        </m.div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <m.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={feature.href}>
                <Card className="group h-full cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-blue-200">
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${feature.tone}`}>
                        <feature.icon className="h-5 w-5" strokeWidth={2} />
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 type-meta font-bold uppercase tracking-wide text-slate-600">
                        {feature.label}
                      </span>
                    </div>
                    <div className="mt-5 flex flex-1 flex-col">
                      <h3 className="text-base font-bold tracking-tight text-slate-950 md:text-lg">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {feature.description}
                      </p>
                      <div className="mt-auto inline-flex items-center pt-4 text-sm font-bold text-blue-700">
                        Open <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
