import React from "react";
import { m } from "framer-motion";
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
  Building,
  CheckCircle2,
  Clock,
  Shield,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Advance Tax Planning",
    description: "Expert tax saving strategies for high net-worth individuals & professionals.",
    price: "₹1,999",
    originalPrice: "₹4,999",
    features: ["Customized Investment Plan", "Tax Projection Reports", "One-on-One CA Session"],
    longDescription: "Our Advance Tax Planning service is designed for those who want to maximize their wealth while remaining fully compliant with the latest tax laws. We analyze your income streams, ongoing investments, and future financial goals to create a robust tax-efficiency roadmap.",
    benefits: [
      "Legally minimize your tax liability",
      "Strategic investment advice aligned with Section 80C, 80D, etc.",
      "Quarterly review to adjust for changing tax regulations",
      "Detailed reports for your financial records"
    ],
    tat: "2-3 Working Days",
    icon: TrendingUp,
    color: "blue",
    discount: "60% OFF"
  },
  {
    title: "Tax Notice Management",
    description: "Professional assistance in responding to Income Tax notices & scrutiny.",
    price: "₹2,499",
    originalPrice: "₹5,000",
    features: ["Notice Analysis", "Drafting Responses", "Expert Representation"],
    longDescription: "Receiving a tax notice can be stressful. Our team of experienced Chartered Accountants specializes in handling scrutiny cases and complex inquiries from the Income Tax department. we provide end-to-end support from drafting the reply to representing you before tax authorities.",
    benefits: [
      "Eliminate stress with expert legal representation",
      "Ensure timely compliance with department deadlines",
      "Minimize the risk of penalties and interest",
      "Professional drafting of responses for maximum clarity"
    ],
    tat: "24-48 Hours Response Time",
    icon: ShieldCheck,
    color: "emerald",
    discount: "50% OFF"
  },
  {
    title: "HUF Tax Filing",
    description: "Complete tax filing and compliance for Hindu Undivided Families (HUF).",
    price: "₹3,499",
    originalPrice: "₹6,999",
    features: ["HUF Deed Creation", "ITR-2/3 Filing", "Investment Advisory"],
    longDescription: "A Hindu Undivided Family (HUF) is a separate legal entity for tax purposes, offering significant tax-saving opportunities. We assist in the creation, registration, and ongoing tax compliance (ITR-2, ITR-3) for your family unit.",
    benefits: [
      "Maximize tax benefits across family members",
      "Assistance with HUF deed preparation and PAN registration",
      "Expert filing of annual returns for the Karta and the HUF",
      "Strategic distribution of income within the family"
    ],
    tat: "3-5 Working Days",
    icon: Users,
    color: "indigo",
    discount: "50% OFF"
  },
  {
    title: "Business GST Filing",
    description: "Simplified GST registration, monthly filing & reconciliation for SMEs.",
    price: "₹999",
    originalPrice: "₹2,499",
    features: ["GSTR-1 & 3B Filing", "ITC Reconciliation", "GST Consultation"],
    longDescription: "Managing GST can be complex with changing rules and filing requirements. Our Business GST service takes the burden off your shoulders, ensuring your monthly and quarterly returns (GSTR-1, GSTR-3B) are filed accurately and on time.",
    benefits: [
      "Accurate Input Tax Credit (ITC) reconciliation",
      "Deadline tracking to reduce penalty risk",
      "Quarterly/Monthly business health check-up",
      "Priority support for GST department inquiries"
    ],
    tat: "Monthly Subscription Service",
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
              <m.div
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

                      <div className="space-y-8">
                        <Link href="/auth/register">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 font-black shadow-lg shadow-blue-500/20 transition-all border-none">
                            Buy Now
                          </Button>
                        </Link>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="w-full text-[13px] font-black text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 transition-colors group/btn">
                              Know more
                              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-white rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                            <div className="relative p-8 md:p-12">
                              <DialogHeader className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors.bg)}>
                                    <service.icon className={cn("w-6 h-6", colors.icon)} strokeWidth={2.5} />
                                  </div>
                                  <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">
                                    {service.discount}
                                  </Badge>
                                </div>
                                <DialogTitle className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                                  {service.title}
                                </DialogTitle>
                                <DialogDescription className="text-lg text-slate-500 font-medium leading-relaxed mb-6">
                                  {service.longDescription}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                  <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Key Benefits
                                  </h4>
                                  <div className="space-y-4">
                                    {service.benefits.map((benefit, i) => (
                                      <div key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                                        </div>
                                        <p className="text-sm text-slate-600 font-bold leading-snug">{benefit}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-8">
                                  <div>
                                    <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      Delivery Time
                                    </h4>
                                    <p className="text-slate-900 font-black text-xl">{service.tat}</p>
                                  </div>

                                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                      Service pricing
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-3xl font-black text-slate-900">{service.price}</span>
                                      <span className="text-sm font-bold text-slate-400 line-through opacity-60">{service.originalPrice}</span>
                                    </div>
                                    <Link href="/auth/register">
                                      <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 font-black shadow-xl shadow-blue-500/20 transition-all border-none">
                                        Buy Now
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
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
