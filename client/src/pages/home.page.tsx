import {
  ArrowRight,
  Shield,
  Calculator,
  Rocket,
  CheckCircle,
  Award,
  Phone,
  Sparkles,
  FileText,
  TrendingUp,
  Users,
  Building2,
  Bot
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { lazy, Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import { FastITRFilingLogo, AccurateTaxCalculatorLogo, SmartDocumentScannerLogo, ExpertTaxReviewLogo } from "@/components/ui/home-feature-logos";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/AuthProvider";
import { getSEOConfig } from "@/config/seo.config";


const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const TrustedBySection = lazy(() => import("@/components/TrustedBySection"));
const EverythingSection = lazy(() => import("@/components/EverythingSection"));
const NoticeComplianceSection = lazy(() => import("@/components/NoticeComplianceSection"));
const GSTNoticeSection = lazy(() => import("@/components/GSTNoticeSection"));
const ProfessionalServicesSection = lazy(() => import("@/components/ProfessionalServicesSection"));
const OtherServicesSection = lazy(() => import("@/components/OtherServicesSection"));
const FinancialGlossary = lazy(() => import("@/components/seo/FinancialGlossary"));
const FeaturedResources = lazy(() => import("@/components/seo/FeaturedResources"));

const SectionFallback = () => (
  <div className="py-12">
    <div className="container mx-auto px-4 space-y-4">
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-5 w-96 mx-auto" />
      <div className="grid md:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const seo = getSEOConfig('/');

  useEffect(() => {
    // Removed auto-redirect so users can always access the homepage
    // if (!isLoading && isAuthenticated) {
    //   setLocation("/dashboard");
    // }
  }, [isAuthenticated, isLoading, setLocation]);

  // if (isAuthenticated) return null;

  return (
    <>
      <MetaSEO
        title={seo?.title || "Expert Income Tax Filing & ITR e-Filing Services India 2025-26"}
        description={seo?.description || "File ITR online with MyeCA.in. Expert CA assistance, maximum refund guarantee, 15L+ happy customers. ITR filing starts at ₹499. File AY 2025-26 returns now!"}
        keywords={seo?.keywords}
        localBusinessData={{
          "name": "MyeCA.in",
          "telephone": "+91-9876543210",
          "email": "support@myeca.in",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Business Park",
            "addressLocality": "Mumbai",
            "addressRegion": "Maharashtra",
            "postalCode": "400001",
            "addressCountry": "IN"
          },
          "priceRange": "₹499-₹9999",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "150000"
          }
        }}
        faqPageData={[
          {
            question: "What is the fastest way to file ITR in India?",
            answer: "MyeCA.in offers a 4-step ITR filing process where you can auto-import data from Form 16 and get it reviewed by a certified CA within 24 hours."
          },
          {
            question: "Is CA review mandatory for all tax filings on MyeCA.in?",
            answer: "Yes, every return filed through MyeCA.in is manually reviewed by a named Chartered Accountant to ensure zero errors and maximum tax savings."
          },
          {
            question: "How much does it cost to file ITR online?",
            answer: "ITR filing starts at just ₹499 on MyeCA.in. We offer transparent pricing with no hidden charges, and you only pay after your return is reviewed by a CA."
          },
          {
            question: "Can I get a refund for my income tax through MyeCA.in?",
            answer: "Our expert CAs optimize your return to ensure you claim all eligible deductions under Section 80C, 80D, and others, maximizing your chance of a refund."
          }
        ]}
      />

      <div className="bg-white min-h-screen">
        {/* Hero Section - Compact & Focused */}
        <section className="py-12 lg:py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-white text-[var(--color-primary-700)] px-4 py-2 rounded-full text-sm font-medium shadow-sm border border-[var(--color-primary-100)]">
                <Shield className="w-4 h-4 text-[var(--color-accent-600)]" />
                <span>ERI Registered</span>
                <span className="text-[var(--color-primary-400)]">•</span>
                <span className="text-[var(--color-success-600)] font-semibold">CA Verified Every Return</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl lg:text-5xl font-bold text-[var(--color-primary-900)] leading-tight">
                Get Your <span className="text-[var(--color-accent-600)]">Maximum Tax Refund</span> — 
                <br className="hidden sm:block" />
                Expert CA Filing from ₹999
              </h1>

              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                File your ITR with a real, named Chartered Accountant reviewing every detail.
                Maximum refund. Zero errors. Filed via official Income Tax Portal.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link href="/auth/login">
                  <Button variant="brand" size="lg" className="w-full sm:w-auto px-8 shadow-sm shadow-brand-600/20 transition-all">
                    <Rocket className="w-4 h-4 mr-2" />
                    Start Filing Now
                  </Button>
                </Link>
                <Link href="/calculators/income-tax">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 border-slate-200 hover:bg-slate-50 text-slate-700 transition-all">
                    <Calculator className="w-4 h-4 mr-2" />
                    Free Tax Calculator
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  ERI Registered with Govt.
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No Document Upload Needed
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Pay Only After CA Review
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Login Portals Section */}
        <section className="py-12 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Secure Access Portals</h2>
              <p className="text-slate-500 mt-2">Select your role to access your personalized dashboard</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                { title: "User Portal", icon: Users, href: "/auth/login", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", hover: "hover:border-blue-300" },
                { title: "Admin Portal", icon: Shield, href: "/auth/admin-login?role=admin", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", hover: "hover:border-indigo-300" },
                { title: "CA Portal", icon: FileText, href: "/auth/admin-login?role=ca", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", hover: "hover:border-emerald-300" },
                { title: "Team Portal", icon: Building2, href: "/auth/admin-login?role=team", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", hover: "hover:border-purple-300" },
              ].map((portal) => (
                <Link key={portal.title} href={portal.href}>
                  <div className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all cursor-pointer group",
                    portal.border, portal.hover, "hover:shadow-md bg-white"
                  )}>
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", portal.bg)}>
                      <portal.icon className={cn("w-6 h-6", portal.color)} />
                    </div>
                    <span className="font-semibold text-slate-900">{portal.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Core Features - Redesigned for Premium Look */}
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {[
                {
                  title: "Fastest ITR Filing",
                  description: "File your ITR in just 4 simple steps with CA review. Get done efficiently with our AI-powered platform.",
                  icon: FastITRFilingLogo,
                  bgColor: "bg-indigo-50",
                  textColor: "text-indigo-600",
                  borderColor: "border-indigo-100/50",
                  shadowColor: "shadow-indigo-500/10"
                },
                {
                  title: "Accurate Tax Calculator",
                  description: "Get precise tax calculations instantly. Compare old vs new regime and maximize your savings.",
                  icon: AccurateTaxCalculatorLogo,
                  bgColor: "bg-emerald-50",
                  textColor: "text-emerald-600",
                  borderColor: "border-emerald-100/50",
                  shadowColor: "shadow-emerald-500/10"
                },
                {
                  title: "Smart Document Scanner",
                  description: "Auto-extract data from Form 16, bank statements, and certificates. No manual typing needed.",
                  icon: SmartDocumentScannerLogo,
                  bgColor: "bg-purple-50",
                  textColor: "text-purple-600",
                  borderColor: "border-purple-100/50",
                  shadowColor: "shadow-purple-500/10"
                },
                {
                  title: "Expert Tax Review",
                  description: "Every return reviewed by certified CAs. Get maximum refund with zero errors guarantee.",
                  icon: ExpertTaxReviewLogo,
                  bgColor: "bg-orange-50",
                  textColor: "text-orange-600",
                  borderColor: "border-orange-100/50",
                  shadowColor: "shadow-orange-500/10"
                }
              ].map((feature, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "relative p-8 rounded-card bg-white border h-full transition-all duration-500 group cursor-default",
                    "hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] hover:-translate-y-2",
                    feature.borderColor
                  )}
                >
                  <div className="flex flex-col h-full">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                      feature.bgColor,
                      feature.shadowColor,
                      "shadow-lg"
                    )}>
                      <feature.icon className={cn("w-8 h-8", feature.textColor)} />
                    </div>
                    
                    <h3 className="text-[22px] font-bold text-slate-900 tracking-tight leading-snug mb-4 transition-colors group-hover:text-[var(--color-primary-600)]">
                      {feature.title}
                    </h3>
                    
                    <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                      {feature.description}
                    </p>
                    
                    <div className="mt-auto pt-8 flex items-center text-sm font-bold text-slate-400 group-hover:text-[var(--color-primary-600)] transition-colors">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                  
                  {/* Subtle Background Accent */}
                  <div className={cn(
                    "absolute -bottom-2 -right-2 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none rounded-full",
                    feature.bgColor
                  )}></div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* How It Works - 3 Simple Steps */}
        <section className="py-24 bg-slate-50 border-y border-slate-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                File ITR in <span className="text-blue-600">3 Simple Steps</span>
              </h2>
              <p className="text-slate-500 mt-4 text-lg">Our streamlined process makes tax filing effortless.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-slate-200 -translate-y-1/2 z-0"></div>
              
              {[
                { num: "1", title: "Enter Details", desc: "Add your income & deductions", icon: FileText, color: "bg-blue-600 shadow-blue-500/30" },
                { num: "2", title: "CA Review", desc: "Expert verification for accuracy", icon: Users, color: "bg-indigo-600 shadow-indigo-500/30" },
                { num: "3", title: "File ITR", desc: "Submit to Income Tax Dept", icon: CheckCircle, color: "bg-emerald-600 shadow-emerald-500/30" },
              ].map((step, idx) => (
                <div key={step.num} className="relative z-10 bg-white p-8 rounded-card border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={cn(
                    "w-12 h-12 text-white rounded-2xl flex items-center justify-center font-bold text-xl mb-6 shadow-lg",
                    step.color
                  )}>
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculators Section */}
        <section className="py-16 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                Free Tax <span className="text-blue-600">Calculators</span>
              </h2>
              <p className="text-gray-600">Plan your taxes with our accurate calculators</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { title: "Income Tax Calculator", desc: "AY 2025-26 tax calculation", href: "/calculators/income-tax", icon: Calculator },
                { title: "HRA Calculator", desc: "Optimize rent allowance", href: "/calculators/hra", icon: Shield },
                { title: "SIP Calculator", desc: "Plan your investments", href: "/calculators/sip", icon: TrendingUp },
              ].map((calc) => (
                <Link key={calc.title} href={calc.href}>
                  <Card className="bg-white rounded-[24px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/60 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full">
                    <CardContent className="p-8">
                      <div className="flex flex-col items-start gap-5 mb-5">
                        <div className="w-14 h-14 bg-[#eef2ff] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <calc.icon className="w-7 h-7 text-[#4f46e5]" strokeWidth={2} />
                        </div>
                        <div>
                          <h3 className="text-[19px] font-bold text-slate-900 group-hover:text-[#2563eb] transition-colors tracking-tight">
                            {calc.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">{calc.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-[#2563eb] text-[15px] font-semibold">
                        Calculate Now
                        <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

          {/* AI Assistant Banner - Help Recovery Center Style */}
          <div className="max-w-5xl mx-auto mt-12">
            <Link href="/tax-assistant">
              <div className="rounded-[var(--radius-3xl)] bg-white shadow-lg border border-[var(--color-primary-100)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 flex flex-col sm:flex-row items-center justify-between cursor-pointer group gap-6 text-center sm:text-left overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="p-4 bg-[var(--color-primary-100)] rounded-[var(--radius-2xl)] group-hover:scale-110 transition-transform duration-500">
                    <Bot className="w-8 h-8 text-[var(--color-primary-600)]" />
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 mb-1">
                      <h3 className="font-bold text-[22px] text-[var(--color-primary-900)] tracking-tight">AI Tax Assistant</h3>
                      <span className="px-2 py-0.5 bg-[var(--color-warning-100)] text-[var(--color-warning-700)] text-xs font-bold rounded-full uppercase tracking-tighter">BETA</span>
                    </div>
                    <p className="text-[var(--color-primary-500)] text-sm">Instant tax help, Form 16 parser & bank analyzer</p>
                  </div>
                </div>
                <Button variant="brand" className="h-12 px-8 transition-all">
                  Try AI Assistant
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Link>
          </div>
          </div>
        </section>

        <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
          <Suspense fallback={<SectionFallback />}>
            <FeaturesSection />
          </Suspense>
        </section>

        <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
          <Suspense fallback={<SectionFallback />}>
            <PricingSection />
          </Suspense>
        </section>

        <Suspense fallback={<SectionFallback />}>
          <OtherServicesSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <EverythingSection />
        </Suspense>

        <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
          <Suspense fallback={<SectionFallback />}>
            <ProfessionalServicesSection />
          </Suspense>
        </section>

        {/* Stats Section - Quality signals, no artificial numbers */}
        <section className="py-12 bg-white border-y">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
              {[
                { value: "100%", label: "CA-Reviewed Returns" },
                { value: "₹15L+", label: "Tax Saved for Clients" },
                { value: "950+", label: "ITRs Verified & Filed" },
                { value: "24 hrs", label: "CA Turnaround Time" },
              ].map((stat) => (
                <div key={stat.label} className="p-8 rounded-[24px] bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">{stat.value}</div>
                  <div className="text-slate-500 text-sm mt-2 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
          <Suspense fallback={<SectionFallback />}>
            <Testimonials />
          </Suspense>
        </section>

        <Suspense fallback={<SectionFallback />}>
          <TrustedBySection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <NoticeComplianceSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <GSTNoticeSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <FinancialGlossary />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <FeaturedResources />
        </Suspense>

        {/* Final CTA */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto p-12 md:p-16 rounded-card bg-white shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-200/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-blue-50/50 px-5 py-2 rounded-full text-xs font-semibold text-brand-600 mb-8 border border-blue-100/50">
                  <Award className="w-4 h-4" />
                  ERI Registered · CA Verified · Filed via Official IT Portal
                </div>

                <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                  Ready to file your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Tax Returns?</span>
                </h2>

                <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Start free. A named CA reviews every return. Pay only when satisfied.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/register">
                    <Button variant="brand" size="xl" className="px-8 w-full sm:w-auto shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5">
                      <Rocket className="mr-2 h-5 w-5" />
                      Start Filing Now
                    </Button>
                  </Link>
                  <Link href="/expert-consultation">
                    <Button size="xl" variant="outline" className="px-8 w-full sm:w-auto border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all hover:-translate-y-0.5">
                      <Phone className="mr-2 h-5 w-5" />
                      Talk to Expert
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
