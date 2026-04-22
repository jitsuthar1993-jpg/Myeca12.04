import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardPopular, CardPremium } from "@/components/ui/card";
import { Check, Shield, Clock, Award, Users, Star, Phone } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  price: string;
  isFree?: boolean;
  originalPrice?: string;
  description: string;
  features: string[];
  popular: boolean;
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "DIY Self-Filing",
    price: "0",
    isFree: true,
    originalPrice: "799",
    description: "Perfect for simple salary returns",
    features: [
      "ITR-1 filing in 3 minutes",
      "PAN auto-prefill & validation",
      "Form 16 upload & processing",
      "E-verification & acknowledgment",
      "Tax saving recommendations",
      "Mobile & desktop access",
      "Basic email support"
    ],
    popular: false
  },
  {
    id: "standard",
    name: "CA Expert Assisted", 
    price: "1,499",
    originalPrice: "1,999",
    description: "Most popular - Expert guidance included (Including Taxes)",
    features: [
      "All ITR forms (1-4) supported",
      "90-min dedicated CA consultation",
      "Multiple Form 16 auto-import",
      "Real-time tax optimization",
      "Priority support & review",
      "Post-filing assistance",
      "Maximum refund guarantee",
      "AI-driven error detection"
    ],
    popular: true
  },
  {
    id: "premium",
    name: "LIVE Premium CA",
    price: "3,999", 
    originalPrice: "5,999",
    description: "Complete tax solution with dedicated CA",
    features: [
      "Everything in CA Expert plan",
      "Dedicated relationship manager",
      "Capital gains & crypto filing",
      "Business income & trading",
      "Notice handling & defense",
      "Year-round tax planning",
      "Unlimited revisions",
      "ISO 27001 certified security"
    ],
    popular: false
  }
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-16 bg-white border-y border-gray-100 scroll-mt-20">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <m.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Plans for <span className="text-blue-600">Every Tax Need</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            Simple, honest pricing with no hidden surprises. All plans include 100% CA review for accuracy.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: Shield, text: "ISO 27001 Secure" },
              { icon: Award, text: "Money-Back Guarantee" },
              { icon: Users, text: "CA-Reviewed Returns" },
            ].map((badge, index) => (
              <div key={index} className="flex items-center text-sm font-medium text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <badge.icon className="w-4 h-4 text-blue-500 mr-2" />
                {badge.text}
              </div>
            ))}
          </div>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <m.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <Card className={cn(
                "h-full p-8 flex flex-col transition-all duration-300 border",
                plan.popular 
                  ? "border-blue-200 shadow-xl ring-2 ring-blue-600/10 scale-105 z-10" 
                  : "border-gray-200 hover:border-blue-100 hover:shadow-lg"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-current" />
                    RECOMMENDED
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8 flex items-baseline gap-1">
                  {plan.isFree ? (
                    <span className="text-4xl font-extrabold text-gray-900">FREE</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-gray-400">{"₹"}</span>
                      <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                    </>
                  )}
                  {plan.originalPrice && !plan.isFree && (
                    <span className="text-sm text-gray-400 line-through ml-2">
                      {"₹"}{plan.originalPrice}
                    </span>
                  )}
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.slice(0, 6).map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 bg-blue-50 rounded-full p-0.5">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.isFree ? "/itr/compact-filing" : "/expert-consultation?service=tax-consultation"}>
                  <Button 
                    className={cn(
                      "w-full py-6 rounded-xl font-bold text-base transition-all duration-300",
                      plan.popular 
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20" 
                        : "bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-600 hover:text-blue-600"
                    )}
                  >
                    {plan.isFree ? "Start Filing Free" : "Get Started"}
                  </Button>
                </Link>
              </Card>
            </m.div>
          ))}
        </div>
        
        {/* Support Banner - Simple */}
        <m.div 
          className="mt-16 p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Need help choosing?</h4>
              <p className="text-sm text-gray-600">Our tax experts are available for a free consultation.</p>
            </div>
          </div>
          <Link href="tel:+919876543210">
            <Button variant="outline" className="border-slate-300 text-slate-700 font-bold px-8 py-6 rounded-xl">
              Talk to Expert
            </Button>
          </Link>
        </m.div>
      </div>
    </section>
  );
}
