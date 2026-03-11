import { motion } from "framer-motion";
import { useState } from "react";
import SEO from "@/components/SEO";
import Breadcrumb from "@/components/Breadcrumb";
import StructuredData from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Clock, Award, Users, Star, ArrowRight, Phone, Calculator, FileText, HeadphonesIcon, Zap } from "lucide-react";
import { Link } from "wouter";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";

// FAQ Component for pricing page
const PricingFAQ = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: "What's included in the FREE plan?",
      answer: "The FREE plan includes ITR-1 filing, Form 16 auto-import, basic tax calculations, e-verification, and email support. Perfect for simple salary returns with no additional income sources."
    },
    {
      question: "Can I upgrade from FREE to CA Expert plan later?",
      answer: "Yes! You can upgrade anytime. If you start with FREE filing and need expert help, you can easily upgrade to CA Expert plan and get full CA consultation and review."
    },
    {
      question: "What makes the CA Expert plan worth \u20B91,499?",
      answer: "You get 90-minute dedicated CA consultation, support for all ITR forms (1-4), real-time tax optimization, priority support, post-filing assistance, and maximum refund guarantee. The average tax savings is \u20B915,000+."
    },
    {
      question: "Is there any hidden cost or annual subscription?",
      answer: "No hidden costs! All pricing is transparent and one-time for the current assessment year. No annual subscriptions or recurring charges. What you see is what you pay."
    },
    {
      question: "How secure is my financial data?",
      answer: "We use ISO 27001 certified security with bank-grade 256-bit SSL encryption. Your data is stored securely and never shared with third parties. We're compliant with all Indian data protection regulations."
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "We offer 100% money-back guarantee within 30 days. If you're not completely satisfied with our service, we'll refund your full payment, no questions asked."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about our pricing plans
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div 
                  className="flex justify-between items-center"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className={`transform transition-transform duration-300 ${openFAQ === index ? 'rotate-45' : ''}`}>
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xl">+</span>
                    </div>
                  </div>
                </div>
                {openFAQ === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Component
const PricingTestimonials = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      content: "MyeCA.in saved me \u20B918,000 in taxes with their CA Expert plan. The consultation was thorough and the filing process was seamless.",
      rating: 5,
      savings: "\u20B918,000"
    },
    {
      name: "Rajesh Kumar",
      role: "Business Owner",
      content: "Used the LIVE Premium CA plan for my business returns. The dedicated support and notice handling service is exceptional.",
      rating: 5,
      savings: "\u20B945,000"
    },
    {
      name: "Anita Patel",
      role: "Marketing Manager",
      content: "Started with FREE plan and upgraded to CA Expert. The transition was smooth and I got maximum refund as promised.",
      rating: 5,
      savings: "\u20B912,500"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands who've maximized their tax savings with us
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 font-semibold">
                    Saved {testimonial.savings}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Value Proposition Component
const ValueProposition = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="bg-blue-600 text-white px-6 py-2 text-lg font-semibold mb-6">
            Why Choose MyeCA.in?
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Every Plan Includes a Real CA
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Not just software. A named, qualified Chartered Accountant reviews and files your return — from \u20B90 to get started.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Calculator className="w-8 h-8" />,
              title: "Maximum Refund, Every Time",
              description: "AI-powered deduction optimizer claims every section (80C, 80D, HRA, NPS) you're eligible for — nothing missed."
            },
            {
              icon: <Clock className="w-8 h-8" />,
              title: "3-Minute Filing",
              description: "Upload Form 16, auto-fill details, and file your ITR in just 3 minutes with our smart technology."
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: "ISO 27001 Security",
              description: "Bank-grade security with 256-bit encryption ensures your financial data is always protected."
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: "Expert CA Support",
              description: "Direct access to qualified Chartered Accountants for consultation and tax planning advice."
            },
            {
              icon: <FileText className="w-8 h-8" />,
              title: "All ITR Forms Supported",
              description: "From simple ITR-1 to complex ITR-4, we handle all types of tax returns with expertise."
            },
            {
              icon: <Award className="w-8 h-8" />,
              title: "100% Guarantee",
              description: "Not satisfied? Get full refund within 30 days. We're confident in our service quality."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-blue-600">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function PricingPage() {
  return (
    <>
      <SEO 
        title={"ITR Filing Pricing - \u20B9499 DIY to \u20B91,499 CA Expert | MyeCA.in"}
        description={"Transparent ITR filing pricing. Choose FREE DIY plan or CA Expert Assisted plan starting at \u20B91,499. Maximum refund guarantee with 15L+ happy customers."}
        keywords="ITR filing price, income tax return cost, CA charges, tax filing fees, ITR-1 price, ITR-2 charges, tax consultant fees"
        url="https://myeca.in/pricing"
      />
      <div className="mobile-safe-bottom bg-white">
        <Breadcrumb items={[{ name: 'Pricing' }]} />
        <StructuredData 
          type="Product" 
          data={{
            name: "ITR Filing Services",
            description: "Professional ITR filing services with CA expert assistance. Get maximum refunds with 99.8% accuracy.",
            price: "1499",
            url: "https://myeca.in/pricing",
            rating: { value: "4.8", count: "15000" }
          }} 
        />
      {/* Hero Section */}
      <section className="py-16 bg-white border-b soft-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-blue-600 text-white px-6 py-2.5 text-lg font-bold mb-8 shadow-lg shadow-blue-500/30 animate-pulse">
              <span className="mr-2">{"\uD83D\uDE80"}</span>
              Website Launch Offer - Limited Time
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
              Transparent Pricing, <br />
              <span className="text-blue-600">Maximum Savings</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your tax filing needs. All plans include expert support, maximum refund guarantee, and secure filing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/itr/compact-filing">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Free Filing
                </Button>
              </Link>
              <Link href="tel:+919876543210">
                <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Expert Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <ValueProposition />
      <PricingSection />
      <PricingTestimonials />
      <PricingFAQ />
      <CTASection />
    </div>
    </>
  );
}
