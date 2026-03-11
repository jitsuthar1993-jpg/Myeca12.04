import { motion } from "framer-motion";
import { Users, Award, Shield, Target, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import Breadcrumb from "@/components/Breadcrumb";
import { Link } from "wouter";

export default function AboutPage() {
  const stats = [
    { label: "Happy Clients", value: "15K+", icon: Users },
    { label: "Tax Saved", value: "\u20B985Cr+", icon: Award },
    { label: "Years Experience", value: "12+", icon: Clock },
    { label: "Team Strength", value: "50+", icon: Shield },
  ];

  return (
    <>
      <SEO 
        title="About MyeCA - India's Trusted Tax & Business Partner"
        description="Learn about MyeCA's mission to simplify taxes and business compliance for millions of Indians. Meet our expert team of CAs and financial advisors."
      />
      <div className="min-h-screen bg-white">
        <Breadcrumb items={[{ name: 'About Us' }]} />

        {/* Hero Section */}
        <section className="py-16 bg-white border-b soft-border">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Simplifying Finances for <br/>
              <span className="text-blue-600">Every Indian</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              We are on a mission to make tax filing and business compliance accessible, 
              transparent, and affordable for everyone.
            </motion.p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  To empower individuals and businesses with smart, AI-driven financial tools 
                  and expert guidance, eliminating the fear and complexity around taxes and compliance.
                </p>
                <ul className="space-y-3">
                  {[
                    "Simplify complex tax laws",
                    "Provide affordable expert access",
                    "Ensure 100% data security",
                    "Deliver maximum tax savings"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-50 rounded-2xl border border-blue-200 flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                    alt="Team working" 
                    className="rounded-2xl shadow-lg object-cover w-full h-full opacity-90"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We combine technology with human expertise to deliver the best financial services experience.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Expertise You Can Trust",
                  desc: "Our team consists of qualified Chartered Accountants and tax experts with decades of combined experience.",
                  icon: Award
                },
                {
                  title: "Technology First",
                  desc: "We use AI and automation to ensure zero-error filings and maximum efficiency in all processes.",
                  icon: Shield
                },
                {
                  title: "Customer Obsessed",
                  desc: "Your satisfaction is our priority. We provide 24/7 support and handle all notices on your behalf.",
                  icon: Users
                }
              ].map((feature, i) => (
                <Card key={i} className="text-center hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of happy customers who trust MyeCA for their financial needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                  Explore Services <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// Helper component for icon
function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
