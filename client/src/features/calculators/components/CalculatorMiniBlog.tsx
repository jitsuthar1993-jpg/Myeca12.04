import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { HelpCircle, TrendingDown, ArrowUpRight, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface FeatureCard {
  icon: ReactNode;
  iconBg: string;
  title: string;
  desc: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface HowItWorksProps {
  title: string;
  description: ReactNode;
  formulaBox?: ReactNode;
  steps?: { title: string; desc: string }[];
}

interface CalculatorMiniBlogProps {
  features: FeatureCard[];
  howItWorks: HowItWorksProps;
  faqs: FAQItem[];
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaLink?: string;
  ctaIcon?: ReactNode;
}

export function CalculatorMiniBlog({
  features = [],
  howItWorks = { title: "How it Works", description: "Learn how the calculations are performed." },
  faqs = [],
  ctaTitle = "Maximise Your Tax Savings",
  ctaDescription = "Our CA experts can review your financial profile and find additional savings worth ₹50,000+",
  ctaButtonText = "Get Expert Advisory",
  ctaLink = "/auth/register",
  ctaIcon = <TrendingDown className="w-7 h-7" />
}: CalculatorMiniBlogProps) {
  return (
    <div className="mt-16 space-y-16">
      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features?.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-slate-200/70 p-6 hover:shadow-md hover:border-slate-300/80 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-4`}>
              {f.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* How it works + FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* How it works */}
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {howItWorks?.title}
          </h2>
          <div className="text-slate-500 leading-relaxed">
            {howItWorks?.description}
          </div>
          
          {howItWorks?.formulaBox && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-5 border-l-4 border-l-blue-500 overflow-hidden">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-0.5" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-0.5" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-0.5" />
              </div>
              {howItWorks.formulaBox}
            </div>
          )}

          {howItWorks?.steps && (
            <div className="space-y-4">
              {howItWorks.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{step.title}</h4>
                    <p className="text-sm text-slate-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            Common Questions
          </h2>
          <div className="space-y-3">
            {faqs?.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/70 p-5 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <h4 className="font-bold text-slate-800 mb-1.5">{faq.q}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 rounded-2xl p-8 sm:p-10 border border-blue-100/60">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
            {ctaIcon}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">
              {ctaTitle}
            </h3>
            <p className="text-slate-500 text-sm max-w-xl">
              {ctaDescription}
            </p>
          </div>
          <Link href={ctaLink}>
            <Button className="bg-slate-900 hover:bg-blue-700 text-white rounded-xl px-6 h-11 font-bold shadow-sm transition-colors whitespace-nowrap">
              {ctaButtonText}
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
