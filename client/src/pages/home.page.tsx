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
import { Link } from "wouter";
import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EnhancedSEO from "@/components/EnhancedSEO";
import { cn } from "@/lib/utils";
import { FastITRFilingLogo, AccurateTaxCalculatorLogo, SmartDocumentScannerLogo, ExpertTaxReviewLogo } from "@/components/ui/home-feature-logos";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const TrustedBySection = lazy(() => import("@/components/TrustedBySection"));
const EverythingSection = lazy(() => import("@/components/EverythingSection"));
const NoticeComplianceSection = lazy(() => import("@/components/NoticeComplianceSection"));
const GSTNoticeSection = lazy(() => import("@/components/GSTNoticeSection"));
const ProfessionalServicesSection = lazy(() => import("@/components/ProfessionalServicesSection"));
const OtherServicesSection = lazy(() => import("@/components/OtherServicesSection"));

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
  return (
    <>
      <EnhancedSEO
        title="Expert Income Tax Filing & ITR e-Filing Services India 2025-26"
        description="File ITR online with MyeCA.in. Expert CA assistance, maximum refund guarantee, 15L+ happy customers. ITR filing starts at \u20B9499. File AY 2025-26 returns now!"
        keywords={["ITR filing", "income tax return", "tax filing India", "e-filing", "AY 2025-26", "tax consultant", "CA services", "ITR-1", "ITR-2", "income tax refund"]}
        url="https://myeca.in"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "MyeCA.in",
          "url": "https://myeca.in",
          "description": "India's premier digital platform for expert tax filing with CA assistance"
        }}
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
                Your <span className="text-[var(--color-accent-600)]">Personal CA</span> is{" "}
                <br className="hidden sm:block" />
                one click away
              </h1>

              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                File your ITR with a real, named Chartered Accountant reviewing every detail.
                Maximum refund. Zero errors. Filed via official Income Tax Portal.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link href="/auth/login">
                  <Button size="lg" className="w-full sm:w-auto px-8 rounded-xl h-12 text-[15px] font-semibold bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] shadow-sm shadow-[var(--color-accent-600)]/20 transition-all">
                    <Rocket className="w-4 h-4 mr-2" />
                    Start Filing Now
                  </Button>
                </Link>
                <Link href="/calculators/income-tax">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 rounded-xl h-12 text-[15px] font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 transition-all">
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

        {/* How It Works - Simplified */}
        <section className="py-12 bg-white border-y">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16 mt-8">
              <div className="p-8 rounded-[24px] bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/60 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex flex-col items-start gap-5">
                  <div className="p-4 rounded-2xl bg-[#eef2ff] text-[#4f46e5] group-hover:scale-110 transition-transform duration-500">
                    <FastITRFilingLogo className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-slate-900 tracking-tight">Fastest ITR Filing</h3>
                    <p className="text-[15px] text-slate-500 mt-2 leading-relaxed">File your ITR in just 4 simple steps with CA review. Get done efficiently with our AI-powered platform.</p>
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-[24px] bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/60 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex flex-col items-start gap-5">
                  <div className="p-4 rounded-2xl bg-[#dcfce7] text-[#15803d] group-hover:scale-110 transition-transform duration-500">
                    <AccurateTaxCalculatorLogo className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-slate-900 tracking-tight">Accurate Tax Calculator</h3>
                    <p className="text-[15px] text-slate-500 mt-2 leading-relaxed">Get precise tax calculations instantly. Compare old vs new regime and maximize your savings.</p>
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-[24px] bg-white shadow-sm border border-[var(--color-primary-100)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex flex-col items-start gap-5">
                  <div className="p-4 rounded-2xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform duration-500">
                    <SmartDocumentScannerLogo className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-[var(--color-primary-900)] tracking-tight">Smart Document Scanner</h3>
                    <p className="text-[15px] text-[var(--color-primary-500)] mt-2 leading-relaxed">Auto-extract data from Form 16, bank statements, and certificates. No manual typing needed.</p>
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-[24px] bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/60 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex flex-col items-start gap-5">
                  <div className="p-4 rounded-2xl bg-[#ffedd5] text-[#c2410c] group-hover:scale-110 transition-transform duration-500">
                    <ExpertTaxReviewLogo className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-slate-900 tracking-tight">Expert Tax Review</h3>
                    <p className="text-[15px] text-slate-500 mt-2 leading-relaxed">Every return reviewed by certified CAs. Get maximum refund with zero errors guarantee.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                File ITR in 3 Simple Steps
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { num: "1", title: "Enter Details", desc: "Add your income & deductions", icon: FileText },
                { num: "2", title: "CA Review", desc: "Expert verification for accuracy", icon: Users },
                { num: "3", title: "File ITR", desc: "Submit to Income Tax Dept", icon: CheckCircle },
              ].map((step) => (
                <div key={step.num} className="text-center p-8 rounded-[24px] bg-slate-50 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)]">
                  <div className="w-14 h-14 bg-[#0f172a] text-white rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-5 shadow-lg shadow-slate-900/20">
                    {step.num}
                  </div>
                  <h3 className="text-[19px] font-bold text-slate-900 mb-2 tracking-tight">{step.title}</h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed">{step.desc}</p>
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
                          <p className="text-[15px] text-slate-500 mt-1">{calc.desc}</p>
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
                      <span className="px-2 py-0.5 bg-[var(--color-warning-100)] text-[var(--color-warning-700)] text-[10px] font-bold rounded-full uppercase tracking-tighter">BETA</span>
                    </div>
                    <p className="text-[var(--color-primary-500)] text-[15px]">Instant tax help, Form 16 parser & bank analyzer</p>
                  </div>
                </div>
                <Button className="bg-[var(--color-primary-900)] hover:bg-black text-white rounded-xl h-12 px-8 text-[15px] font-semibold transition-all">
                  Try AI Assistant
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Link>
          </div>
          </div>
        </section>

        <Suspense fallback={<SectionFallback />}>
          <FeaturesSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <PricingSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <OtherServicesSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <EverythingSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <ProfessionalServicesSection />
        </Suspense>

        {/* Stats Section - Quality signals, no artificial numbers */}
        <section className="py-12 bg-white border-y">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
              {[
                { value: "100%", label: "CA-Reviewed Returns" },
                { value: "4.8 ★", label: "Average Rating" },
                { value: "\u20B90", label: "To Get Started" },
                { value: "24 hrs", label: "CA Turnaround Time" },
              ].map((stat) => (
                <div key={stat.label} className="p-8 rounded-[24px] bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">{stat.value}</div>
                  <div className="text-slate-500 text-[15px] mt-2 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Suspense fallback={<SectionFallback />}>
          <Testimonials />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <TrustedBySection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <NoticeComplianceSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <GSTNoticeSection />
        </Suspense>

        {/* Final CTA */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto p-12 md:p-16 rounded-[32px] bg-white shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-200/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-blue-50/50 px-5 py-2 rounded-full text-[14px] font-semibold text-[#2563eb] mb-8 border border-blue-100/50">
                  <Award className="w-4 h-4" />
                  ERI Registered · CA Verified · Filed via Official IT Portal
                </div>

                <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                  Ready to file your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Tax Returns?</span>
                </h2>

                <p className="text-[19px] text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Start free. A named CA reviews every return. Pay only when satisfied.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/register">
                    <Button size="lg" className="px-8 w-full sm:w-auto rounded-[14px] h-14 text-[16px] font-semibold bg-[#2563eb] hover:bg-blue-700 shadow-lg shadow-blue-500/25 text-white transition-all hover:-translate-y-0.5">
                      <Rocket className="mr-2 h-5 w-5" />
                      Start Filing Now
                    </Button>
                  </Link>
                  <Link href="/expert-consultation">
                    <Button size="lg" variant="outline" className="px-8 w-full sm:w-auto rounded-[14px] h-14 text-[16px] font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all hover:-translate-y-0.5">
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
