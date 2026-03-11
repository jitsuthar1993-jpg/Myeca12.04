import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  ShieldCheck, 
  FileText, 
  Users, 
  Zap, 
  Check, 
  ArrowRight, 
  TrendingUp, 
  Scale, 
  Building 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Advance Tax Planning",
    description: "Expert tax saving strategies for high net-worth individuals & professionals.",
    price: "\u20B91,999",
    originalPrice: "\u20B94,999",
    features: ["Customized Investment Plan", "Tax Projection Reports", "One-on-One CA Session"],
    icon: TrendingUp,
    color: "blue",
    discount: "60% OFF"
  },
  {
    title: "Tax Notice Management",
    description: "Professional assistance in responding to Income Tax notices & scrutiny.",
    price: "\u20B92,499",
    originalPrice: "\u20B95,000",
    features: ["Notice Analysis", "Drafting Responses", "Expert Representation"],
    icon: ShieldCheck,
    color: "emerald",
    discount: "50% OFF"
  },
  {
    title: "HUF Tax Filing",
    description: "Complete tax filing and compliance for Hindu Undivided Families (HUF).",
    price: "\u20B93,499",
    originalPrice: "\u20B96,999",
    features: ["HUF Deed Creation", "ITR-2/3 Filing", "Investment Advisory"],
    icon: Users,
    color: "indigo",
    discount: "50% OFF"
  },
  {
    title: "Business GST Filing",
    description: "Simplified GST registration, monthly filing & reconciliation for SMEs.",
    price: "\u20B9999",
    originalPrice: "\u20B92,499",
    features: ["GSTR-1 & 3B Filing", "ITC Reconciliation", "GST Consultation"],
    icon: Building,
    color: "slate",
    discount: "60% OFF",
    label: "Monthly"
  }
];

const colorVariants: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-100" },
  slate: { bg: "bg-slate-50", icon: "text-slate-600", border: "border-slate-100" },
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
            Premium <span className="text-blue-600">Advisory Services</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            Expert-led compliance and planning services for advanced tax needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const colors = colorVariants[service.color];
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-white border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-2 transition-all duration-500 group overflow-hidden flex flex-col">
                  <CardContent className="p-8 flex-grow flex flex-col">
                    <div className="flex items-start justify-between mb-8">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                        colors.bg
                      )}>
                        <service.icon className={cn("w-7 h-7", colors.icon)} strokeWidth={2.5} />
                      </div>
                      <div className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        {service.discount}
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-[15px] text-slate-500 leading-relaxed mb-8 font-medium">
                      {service.description}
                    </p>

                    <div className="space-y-4 mb-8">
                      {service.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-blue-600" strokeWidth={3} />
                          </div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-8 border-t border-slate-100">
                      <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-2xl font-black text-slate-900">{service.price}</span>
                        <span className="text-sm font-bold text-slate-400 line-through opacity-60">{service.originalPrice}</span>
                        {service.label && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ {service.label}</span>}
                      </div>

                      <div className="space-y-3">
                        <Link href="/auth/register">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 font-black shadow-lg shadow-blue-500/20 transition-all border-none">
                            Buy Now
                          </Button>
                        </Link>
                        <Link href="/services/marketplace">
                          <button className="w-full text-[13px] font-black text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 transition-colors">
                            Know more
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
