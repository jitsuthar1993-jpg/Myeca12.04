import { m } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Calculator, Scan, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    id: "itr-filing",
    title: "Guided ITR Filing",
    description: "File your ITR through simple guided steps and add CA review where your case needs it.",
    color: "bg-[var(--color-accent-600)]",
    shadowColor: "shadow-[var(--color-accent-500)]/40",
    icon: Zap,
    href: "/itr/filing"
  },
  {
    id: "tax-calculators", 
    title: "Tax Estimate Calculator",
    description: "Estimate tax instantly, compare old vs new regime, and review assumptions before filing.",
    color: "bg-[var(--color-success-600)]",
    shadowColor: "shadow-[var(--color-success-500)]/40",
    icon: Calculator,
    href: "/calculators"
  },
  {
    id: "document-vault",
    title: "Smart Document Scanner", 
    description: "Auto-extract data from Form 16, bank statements, and certificates. No manual typing needed.",
    color: "bg-purple-600",
    shadowColor: "shadow-purple-500/40",
    icon: Scan,
    href: "/services/document-vault"
  },
  {
    id: "tax-expert",
    title: "Expert Tax Review",
    description: "Get expert review for complex deductions, notices, capital gains, business income, and NRI cases.",
    color: "bg-[var(--color-warning-600)]",
    shadowColor: "shadow-[var(--color-warning-500)]/40",
    icon: ShieldCheck,
    href: "/consultation"
  }
];

export default function EverythingSection() {
  return (
    <section id="services" className="py-9 md:py-[var(--space-24)] bg-[var(--color-primary-50)] border-b border-[var(--color-primary-100)] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <m.div
          className="mb-6 text-left md:mb-[var(--space-16)] md:text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl md:text-5xl font-extrabold text-[var(--color-primary-900)] mb-2 md:mb-5 tracking-tight">
            Everything You Need for Tax Filing
          </h2>
          <p className="text-sm md:text-[19px] text-[var(--color-primary-500)] max-w-2xl md:mx-auto font-medium leading-relaxed">
            Calculators, CA filing, GST services, and startup registration — built specifically for Indian tax compliance.
          </p>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 xl:gap-8">
          {features.map((feature, index) => (
            <m.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={feature.href}>
                <Card className="bg-white rounded-lg md:rounded-[var(--radius-3xl)] shadow-sm hover:shadow-xl transition-all duration-300 h-full border border-[var(--color-primary-200)]/60 md:hover:-translate-y-1 overflow-hidden group cursor-pointer">
                  <CardContent className="px-4 py-4 md:px-[var(--space-6)] md:py-[var(--space-10)] text-left md:text-center flex flex-row md:flex-col items-center md:items-center justify-start h-full gap-3 md:gap-0">
                    <div className={`w-11 h-11 md:w-[68px] md:h-[68px] rounded-lg md:rounded-full md:mb-[var(--space-8)] transform md:group-hover:scale-110 transition-transform duration-500 ${feature.color} md:shadow-lg ${feature.shadowColor} flex shrink-0 items-center justify-center`}>
                      <feature.icon className="w-5 h-5 md:w-8 md:h-8 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-base md:text-xl font-bold text-[var(--color-primary-900)] md:mb-[var(--space-4)] tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="hidden md:block text-[var(--color-primary-500)] text-[15px] leading-relaxed">
                        {feature.description}
                      </p>
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
