import { m } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Calculator, Scan, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    id: "itr-filing",
    title: "Fastest ITR Filing",
    description: "File your ITR in just 4 simple steps with CA review. Get done efficiently with our AI-powered platform.",
    color: "bg-[var(--color-accent-600)]",
    shadowColor: "shadow-[var(--color-accent-500)]/40",
    icon: Zap,
    href: "/itr/filing"
  },
  {
    id: "tax-calculators", 
    title: "Accurate Tax Calculator",
    description: "Get precise tax calculations instantly. Compare old vs new regime and maximize your savings.",
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
    description: "Every return reviewed by certified CAs. Get maximum refund with zero errors guarantee.",
    color: "bg-[var(--color-warning-600)]",
    shadowColor: "shadow-[var(--color-warning-500)]/40",
    icon: ShieldCheck,
    href: "/consultation"
  }
];

export default function EverythingSection() {
  return (
    <section id="services" className="py-[var(--space-24)] bg-[var(--color-primary-50)] border-b border-[var(--color-primary-100)] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <m.div
          className="text-center mb-[var(--space-16)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--color-primary-900)] mb-5 tracking-tight">
            Everything You Need for Tax Filing
          </h2>
          <p className="text-lg md:text-[19px] text-[var(--color-primary-500)] max-w-2xl mx-auto font-medium leading-relaxed">
            Calculators, CA filing, GST services, and startup registration — built specifically for Indian tax compliance.
          </p>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {features.map((feature, index) => (
            <m.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={feature.href}>
                <Card className="bg-white rounded-[var(--radius-3xl)] shadow-sm hover:shadow-xl transition-all duration-300 h-full border border-[var(--color-primary-200)]/60 hover:-translate-y-1 overflow-hidden group cursor-pointer">
                  <CardContent className="px-[var(--space-6)] py-[var(--space-10)] text-center flex flex-col items-center justify-start h-full">
                    <div className={`w-[68px] h-[68px] rounded-full mb-[var(--space-8)] transform group-hover:scale-110 transition-transform duration-500 ${feature.color} shadow-lg ${feature.shadowColor} flex items-center justify-center`}>
                      <feature.icon className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-primary-900)] mb-[var(--space-4)] tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-[var(--color-primary-500)] text-[15px] leading-relaxed">
                      {feature.description}
                    </p>
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