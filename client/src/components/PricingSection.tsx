import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardPopular, CardPremium } from "@/components/ui/card";
import { Check, Shield, Clock, Award, Users, Sparkles, Star } from "lucide-react";
import { Link } from "wouter";

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
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Combined Premium Offer Banner - Refined for Visibility and Correct Icons */}
          <div className="flex justify-center w-full mb-16">
            <div className="relative flex flex-col items-center gap-6 p-10 rounded-[40px] bg-slate-900 shadow-[0_20px_60px_-15px_rgba(30,58,138,0.5)] border border-slate-800 overflow-hidden group hover:scale-[1.02] transition-all duration-700 max-w-4xl w-full mx-auto">
              {/* Animated Glow Effect */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-all duration-1000"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -ml-20 -mb-20 group-hover:bg-emerald-500/15 transition-all duration-1000"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-6 w-full text-center">
                {/* Top Row: Hero Badges */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex items-center gap-2 px-5 py-2 bg-blue-600/20 border border-blue-500/40 text-blue-400 rounded-full text-xs font-black uppercase tracking-[0.1em]">
                    <Sparkles className="w-4 h-4" />
                    Website Launch Offer
                  </div>
                  <div className="flex items-center gap-2 px-5 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full text-xs font-black uppercase tracking-[0.1em]">
                    Limited Time
                  </div>
                </div>

                {/* Middle Row: The Offer */}
                <div className="flex flex-col items-center gap-3">
                  <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                    50% <span className="text-blue-500">OFF</span>
                  </h3>
                  <p className="text-slate-400 font-semibold text-lg">On all professional filing plans</p>
                </div>

                {/* Divider Line */}
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent my-2"></div>

                {/* Bottom Row: Savings Highlight */}
                <div className="flex flex-wrap items-center justify-center gap-10 text-white font-bold">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl shadow-inner border border-emerald-500/20">
                      {"\uD83D\uDCB0"}
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[11px] text-slate-500 uppercase tracking-widest mb-1 font-black">Maximum Savings</span>
                      <span className="text-xl">Save up to {"\u20B9"}86,500</span>
                    </div>
                  </div>
                  
                  <div className="hidden md:block w-px h-12 bg-slate-800"></div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner border border-blue-500/20">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[11px] text-slate-500 uppercase tracking-widest mb-1 font-black">Fastest Filing</span>
                      <span className="text-xl">File in 3 minutes</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Shine */}
              <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            </div>
          </div>

          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Transparent Pricing, <span className="text-blue-600">Maximum Savings</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your needs. All plans include expert support and maximum refund guarantee.
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            {[
              { icon: Shield, text: "ISO 27001 Certified Security" },
              { icon: Award, text: "100% Money-Back Guarantee" },
              { icon: Users, text: "15L+ Happy Customers" },
            ].map((badge, index) => (
              <div key={index} className="flex items-center bg-white px-4 py-2.5 rounded-full border border-gray-200 shadow-sm hover:border-blue-200 transition-all">
                <badge.icon className="w-4 h-4 text-blue-500 mr-2" />
                {badge.text}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'mt-0' : 'mt-8'}`}
              style={{ zIndex: plan.popular ? 10 : 1 }}
            >
              {plan.popular && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-30">
                  <div className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <Star className="w-4 h-4 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}
              
              {plan.popular ? (
                <CardPopular className="p-8 h-full border-blue-200 shadow-xl bg-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">
                        {plan.name}
                      </h3>
                      <div className="mb-3">
                        <div className="text-5xl font-bold text-blue-600 flex items-center justify-center gap-1">
                          {plan.isFree ? (
                            "FREE"
                          ) : (
                            <>
                              <span className="text-3xl">{"\u20B9"}</span>
                              {plan.price}
                            </>
                          )}
                        </div>
                        {plan.originalPrice && (
                          <div className="text-lg line-through opacity-60 mt-1 text-gray-400 flex items-center justify-center gap-1">
                            was <span className="font-medium text-red-400">{"\u20B9"}{plan.originalPrice}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-base text-gray-600">
                        {plan.description}
                      </div>
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <Check className="mr-3 w-4 h-4 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link href={plan.isFree ? "/itr/compact-filing" : "/expert-consultation?service=tax-consultation"}>
                      <Button 
                        size="lg"
                        className="w-full text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                      >
                        {plan.isFree ? "Get Started Free" : "Get Expert Help"}
                      </Button>
                    </Link>
                  </div>
                </CardPopular>
              ) : (
                <CardPremium className="p-8 h-full bg-white border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">
                      {plan.name}
                    </h3>
                    <div className="mb-3">
                      <div className="text-5xl font-bold text-gray-900 flex items-center justify-center gap-1">
                        {plan.isFree ? (
                          "FREE"
                        ) : (
                          <>
                            <span className="text-3xl text-gray-400">{"\u20B9"}</span>
                            {plan.price}
                          </>
                        )}
                      </div>
                      {plan.originalPrice && (
                        <div className="text-lg line-through opacity-60 mt-1 text-gray-400 flex items-center justify-center gap-1">
                          was <span className="font-medium text-red-500">{"\u20B9"}{plan.originalPrice}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-base text-gray-600">
                      {plan.description}
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="mr-3 w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href={plan.isFree ? "/itr/compact-filing" : "/expert-consultation?service=tax-consultation"}>
                    <Button 
                      variant="outline"
                      size="lg"
                      className="w-full text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {plan.isFree ? "Get Started Free" : plan.id === "premium" ? "Get Premium" : "Choose Plan"}
                    </Button>
                  </Link>
                </CardPremium>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Enhanced Guarantee and Features Section */}
        <motion.div
          className="mt-16 pt-12 border-t border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose MyeCA.in?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every plan includes a real CA reviewing your return — not just software.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="text-center bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">100% Money-Back Guarantee</h4>
              <p className="text-sm text-gray-600">
                Not satisfied? Get full refund within 30 days, no questions asked.
              </p>
            </div>
            
            <div className="text-center bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">3-Minute Filing</h4>
              <p className="text-sm text-gray-600">
                Upload Form 16, auto-fill details, and file your ITR in just 3 minutes.
              </p>
            </div>
            
            <div className="text-center bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Maximum Refund</h4>
              <p className="text-sm text-gray-600">
                AI-powered optimization claims every deduction you're eligible for — nothing is missed.
              </p>
            </div>
            
            <div className="text-center bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Expert CA Support</h4>
              <p className="text-sm text-gray-600">
                Direct access to qualified CAs for all your tax queries and concerns.
              </p>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center bg-blue-50 border-2 border-blue-200 rounded-2xl p-8">
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              Start Your Tax Filing Journey Today
            </h4>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-lg">
              Start free. A Chartered Accountant reviews every return before it's filed. No artificial numbers — just real CA expertise.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/itr/compact-filing">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/expert-consultation?service=tax-consultation">
                <Button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Talk to Expert CA
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-gray-600">
              <div className="flex items-center bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                No hidden charges
              </div>
              <div className="flex items-center bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Secure & confidential  
              </div>
              <div className="flex items-center bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Government approved
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
