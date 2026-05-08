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
import { MobileActionBar } from "@/components/mobile";


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
        title={seo?.title || "Income Tax Filing & ITR e-Filing Services India AY 2026-27"}
        description={seo?.description || "File ITR online with MyeCA.in using guided workflows, tax calculators, and optional CA-assisted review. ITR filing starts at Rs 499 for AY 2026-27."}
        keywords={seo?.keywords}
        aiSummary="MyeCA.in offers guided ITR filing, GST compliance, startup registration, AY 2026-27 tax calculators, Form 16 parsing, and optional expert support for eligible plans."
        localBusinessData={{
          "name": "MyeCA.in",
          "email": "support@myeca.in",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Mumbai",
            "addressRegion": "Maharashtra",
            "addressCountry": "IN"
          },
          "priceRange": "Rs 499-Rs 9,999"
        }}
        faqPageData={[
          {
            question: "What is the fastest way to file ITR in India?",
            answer: "MyeCA.in offers a guided ITR filing process where you can enter details, use Form 16 support where available, and choose CA-assisted review on eligible plans."
          },
          {
            question: "Is CA review mandatory for all tax filings on MyeCA.in?",
            answer: "No. Self-service filing and CA-assisted packages are separate options, so choose the review level that fits your facts and document readiness."
          },
          {
            question: "How much does it cost to file ITR online?",
            answer: "ITR filing starts at Rs 499 for simple self-service cases, with CA-assisted package levels such as Rs 999 and Rs 1,499 depending on the return type and support required."
          },
          {
            question: "Can I get a refund for my income tax through MyeCA.in?",
            answer: "A refund depends on your income, TDS, advance tax, deductions, exemptions, and final processing by the Income Tax Department. MyeCA helps you review eligible claims based on the documents you provide."
          }
        ]}
      />

      <div className="bg-white min-h-screen">
        {/* Hero Section - Compact & Focused */}
        <section className="bg-white py-8 md:bg-gradient-to-br md:from-slate-50 md:via-blue-50/30 md:to-white md:py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl space-y-4 text-left md:space-y-6 md:text-center">
              {/* Trust Badge */}
              <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-[var(--color-primary-100)] bg-slate-50 px-3 py-2 text-xs font-medium text-[var(--color-primary-700)] shadow-sm md:rounded-full md:bg-white md:px-4 md:text-sm">
                <Shield className="w-4 h-4 text-[var(--color-accent-600)]" />
                <span>ERI Registered</span>
                <span className="text-[var(--color-primary-400)]">•</span>
                <span className="text-[var(--color-success-600)] font-semibold">CA Review Available</span>
              </div>

              {/* Headline */}
              <h1 className="text-[30px] font-bold leading-tight text-[var(--color-primary-900)] md:text-3xl lg:text-5xl">
                File Your <span className="text-[var(--color-accent-600)]">AY 2026-27 ITR</span>
                <br className="hidden sm:block" />
                Guided Filing from Rs 499
              </h1>

              <p className="max-w-2xl text-sm leading-6 text-gray-600 md:mx-auto md:text-lg">
                Use guided filing, regime comparison, and optional CA-assisted review before submission through the official Income Tax Portal.
              </p>

              {/* CTA Buttons */}
              <MobileActionBar className="pt-1 md:justify-center md:pt-2" primary={
                <Link href="/auth/login">
                  <Button variant="brand" size="lg" className="h-11 w-full rounded-lg px-6 shadow-sm shadow-brand-600/20 transition-all sm:w-auto md:px-8">
                    <Rocket className="w-4 h-4 mr-2" />
                    Start Filing Now
                  </Button>
                </Link>
              } secondary={
                <Link href="/calculators/income-tax">
                  <Button variant="outline" size="lg" className="h-11 w-full rounded-lg border-slate-200 px-6 text-slate-700 transition-all hover:bg-slate-50 sm:w-auto md:px-8">
                    <Calculator className="w-4 h-4 mr-2" />
                    Free Tax Calculator
                  </Button>
                </Link>
              } />

              {/* Trust Indicators */}
              <div className="grid gap-2 pt-1 text-sm text-gray-600 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center md:gap-6 md:pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  ERI Registered with Govt.
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Simple Document Flow
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  CA-Assisted Plans Available
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features - Redesigned for Premium Look */}
        <section className="relative overflow-hidden bg-white py-6 md:py-20">
          <div className="absolute left-0 top-0 hidden h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent md:block"></div>
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              {[
                {
                  title: "Guided ITR Filing",
                  description: "Complete your return with a structured workflow and optional expert review for eligible plans.",
                  icon: FastITRFilingLogo,
                  bgColor: "bg-indigo-50",
                  textColor: "text-indigo-600",
                  borderColor: "border-indigo-100/50",
                  shadowColor: "shadow-indigo-500/10",
                  href: "/features/fastest-itr-filing",
                },
                {
                  title: "Tax Estimate Calculator",
                  description: "Estimate tax under old and new regimes for AY 2026-27, with caveats for special cases.",
                  icon: AccurateTaxCalculatorLogo,
                  bgColor: "bg-emerald-50",
                  textColor: "text-emerald-600",
                  borderColor: "border-emerald-100/50",
                  shadowColor: "shadow-emerald-500/10",
                  href: "/features/tax-calculator",
                },
                {
                  title: "Smart Document Scanner",
                  description: "Auto-extract data from Form 16, bank statements, and certificates. No manual typing needed.",
                  icon: SmartDocumentScannerLogo,
                  bgColor: "bg-purple-50",
                  textColor: "text-purple-600",
                  borderColor: "border-purple-100/50",
                  shadowColor: "shadow-purple-500/10",
                  href: "/features/document-scanner",
                },
                {
                  title: "Expert Tax Review",
                  description: "Choose CA-assisted review for complex returns, deductions, capital gains, or business income.",
                  icon: ExpertTaxReviewLogo,
                  bgColor: "bg-orange-50",
                  textColor: "text-orange-600",
                  borderColor: "border-orange-100/50",
                  shadowColor: "shadow-orange-500/10",
                  href: "/features/expert-tax-review",
                }
              ].map((feature, idx) => (
                <Link key={idx} href={feature.href}>
                <div
                  className={cn(
                    "group relative h-full cursor-pointer rounded-lg border bg-white p-4 transition-all duration-300 md:rounded-card md:p-8 md:duration-500",
                    "hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] md:hover:-translate-y-2",
                    feature.borderColor
                  )}
                >
                  <div className="flex h-full items-start gap-3 md:flex-col md:gap-0">
                    <div className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-all duration-300 md:mb-8 md:h-16 md:w-16 md:rounded-2xl md:duration-500 md:group-hover:scale-110 md:group-hover:rotate-3",
                      feature.bgColor,
                      feature.shadowColor,
                      "md:shadow-lg"
                    )}>
                      <feature.icon className={cn("h-6 w-6 md:h-8 md:w-8", feature.textColor)} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-[var(--color-primary-600)] md:mb-4 md:text-[22px]">
                        {feature.title}
                      </h3>

                      <p className="mt-1 text-sm font-medium leading-6 text-slate-500 md:mt-0 md:text-[15px] md:leading-relaxed">
                        {feature.description}
                      </p>

                      <div className="mt-auto hidden items-center pt-8 text-sm font-bold text-slate-400 transition-colors group-hover:text-[var(--color-primary-600)] md:flex">
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </div>
                    </div>
                  </div>

                </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        {/* How It Works - 3 Simple Steps */}
        <section className="border-y border-slate-100 bg-slate-50 py-6 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-5 text-left md:mb-16 md:text-center">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 md:text-3xl lg:text-4xl">
                File ITR in <span className="text-blue-600">3 Simple Steps</span>
              </h2>
              <p className="mt-2 text-sm text-slate-500 md:mt-4 md:text-lg">Our workflow keeps filing structured, documented, and easier to review.</p>
            </div>

            <div className="relative mx-auto grid max-w-5xl gap-3 md:grid-cols-3 md:gap-8">
              {/* Connector Line (Desktop) */}
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-slate-200 -translate-y-1/2 z-0"></div>
              
              {[
                { num: "1", title: "Enter Details", desc: "Add your income & deductions", icon: FileText, color: "bg-blue-600 shadow-blue-500/30" },
                { num: "2", title: "Review", desc: "Check calculations and choose expert help if needed", icon: Users, color: "bg-indigo-600 shadow-indigo-500/30" },
                { num: "3", title: "File ITR", desc: "Submit to Income Tax Dept", icon: CheckCircle, color: "bg-emerald-600 shadow-emerald-500/30" },
              ].map((step, idx) => (
                <div key={step.num} className="relative z-10 flex gap-3 rounded-lg border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 md:block md:rounded-card md:p-8 md:hover:-translate-y-1 md:hover:shadow-xl">
                  <div className={cn(
                    "mb-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-bold text-white shadow-sm md:mb-6 md:h-12 md:w-12 md:rounded-2xl md:text-xl md:shadow-lg",
                    step.color
                  )}>
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-slate-900 md:mb-3 md:text-xl">{step.title}</h3>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-500 md:mt-0 md:text-[15px] md:leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculators Section */}
        <section className="bg-white py-6 md:bg-gradient-to-b md:from-white md:to-slate-50 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-5 text-left md:mb-10 md:text-center">
              <h2 className="mb-2 text-xl font-bold text-gray-900 md:mb-3 md:text-2xl lg:text-3xl">
                Free Tax <span className="text-blue-600">Calculators</span>
              </h2>
              <p className="text-sm text-gray-600 md:text-base">Plan your taxes with estimate calculators and review caveats</p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-3 md:gap-6">
              {[
                { title: "Income Tax Calculator", desc: "AY 2026-27 tax estimate", href: "/calculators/income-tax", icon: Calculator },
                { title: "HRA Calculator", desc: "Optimize rent allowance", href: "/calculators/hra", icon: Shield },
                { title: "SIP Calculator", desc: "Plan your investments", href: "/calculators/sip", icon: TrendingUp },
              ].map((calc) => (
                <Link key={calc.title} href={calc.href}>
                  <Card className="group h-full cursor-pointer rounded-lg border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-md md:rounded-[24px] md:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] md:hover:-translate-y-1 md:hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)]">
                    <CardContent className="p-4 md:p-8">
                      <div className="mb-3 flex items-center gap-3 md:mb-5 md:flex-col md:items-start md:gap-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eef2ff] transition-transform duration-300 md:h-14 md:w-14 md:rounded-2xl md:duration-500 md:group-hover:scale-110">
                          <calc.icon className="h-6 w-6 text-[#4f46e5] md:h-7 md:w-7" strokeWidth={2} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold tracking-tight text-slate-900 transition-colors group-hover:text-[#2563eb] md:text-[19px]">
                            {calc.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">{calc.desc}</p>
                        </div>
                      </div>
                      <div className="hidden items-center text-[15px] font-semibold text-[#2563eb] md:flex">
                        Calculate Now
                        <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

          {/* AI Assistant Banner - Help Recovery Center Style */}
          <div className="mx-auto mt-4 max-w-5xl md:mt-12">
            <Link href="/tax-assistant">
              <div className="group flex cursor-pointer flex-col gap-3 overflow-hidden rounded-lg border border-[var(--color-primary-100)] bg-white p-4 text-left shadow-sm transition-all duration-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between md:gap-6 md:rounded-[var(--radius-3xl)] md:p-8 md:hover:-translate-y-1 md:hover:shadow-xl">
                <div className="flex items-center gap-3 md:gap-6">
                  <div className="rounded-lg bg-[var(--color-primary-100)] p-3 transition-transform duration-300 md:rounded-[var(--radius-2xl)] md:p-4 md:duration-500 md:group-hover:scale-110">
                    <Bot className="h-6 w-6 text-[var(--color-primary-600)] md:h-8 md:w-8" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-base font-bold tracking-tight text-[var(--color-primary-900)] md:text-[22px]">AI Tax Assistant</h3>
                      <span className="px-2 py-0.5 bg-[var(--color-warning-100)] text-[var(--color-warning-700)] text-xs font-bold rounded-full uppercase tracking-tighter">BETA</span>
                    </div>
                    <p className="text-[var(--color-primary-500)] text-sm">Tax help, Form 16 support & document review workflows</p>
                  </div>
                </div>
                <Button variant="brand" className="h-11 w-full rounded-lg px-6 transition-all sm:w-auto md:h-12 md:px-8">
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
        <section className="border-y bg-white py-6 md:py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 text-center md:grid-cols-4 md:gap-8">
              {[
                { value: "AY 2026", label: "Filing Support" },
                { value: "Rs 499", label: "Simple Filing From" },
                { value: "Rs 999", label: "Assisted Filing From" },
                { value: "Add-on", label: "CA Review Available" },
              ].map((stat, idx) => (
                <div key={stat.label} className={cn("rounded-lg border border-slate-100 bg-white p-4 shadow-sm transition-transform duration-300 md:rounded-[24px] md:p-8 md:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] md:hover:-translate-y-1", idx > 1 && "hidden md:block")}>
                  <div className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl lg:text-4xl">{stat.value}</div>
                  <div className="mt-1 text-xs font-medium text-slate-500 md:mt-2 md:text-sm">{stat.label}</div>
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
        <section className="border-t border-gray-100 bg-white py-8 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-lg border border-slate-200/60 bg-white p-5 text-left shadow-sm md:rounded-card md:p-12 md:text-center md:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] lg:p-16">
              
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-blue-100/50 bg-blue-50/50 px-3 py-2 text-xs font-semibold text-brand-600 md:mb-8 md:rounded-full md:px-5">
                  <Award className="w-4 h-4" />
                  ERI Registered · CA Review Available · Official Portal Workflow
                </div>

                <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-slate-900 md:mb-6 md:text-4xl lg:text-5xl">
                  Ready to file your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Tax Returns?</span>
                </h2>

                <p className="mb-5 max-w-2xl text-sm leading-6 text-slate-500 md:mx-auto md:mb-10 md:text-lg md:leading-relaxed">
                  Start with guided filing and add expert review when your return needs a closer look.
                </p>

                <div className="flex flex-col gap-2 sm:flex-row md:justify-center md:gap-4">
                  <Link href="/auth/register">
                    <Button variant="brand" size="xl" className="h-11 w-full rounded-lg px-6 shadow-sm shadow-brand-500/25 transition-all sm:w-auto md:px-8 md:hover:-translate-y-0.5">
                      <Rocket className="mr-2 h-5 w-5" />
                      Start Filing Now
                    </Button>
                  </Link>
                  <Link href="/expert-consultation">
                    <Button size="xl" variant="outline" className="h-11 w-full rounded-lg border-slate-200 px-6 text-slate-700 shadow-sm transition-all hover:bg-slate-50 sm:w-auto md:px-8 md:hover:-translate-y-0.5">
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
