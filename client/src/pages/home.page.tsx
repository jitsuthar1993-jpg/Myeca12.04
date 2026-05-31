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
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import { FastITRFilingLogo, AccurateTaxCalculatorLogo, SmartDocumentScannerLogo, ExpertTaxReviewLogo } from "@/components/ui/home-feature-logos";
import { Skeleton } from "@/components/ui/skeleton";
import { getSEOConfig } from "@/config/seo.config";
import { trackPublicCtaClick } from "@/lib/public-conversion-events";
import { lazyWithRetry } from "@/utils/lazy-with-retry";


const FeaturesSection = lazyWithRetry(() => import("@/components/FeaturesSection"));
const Testimonials = lazyWithRetry(() => import("@/components/Testimonials"));
const TrustedBySection = lazyWithRetry(() => import("@/components/TrustedBySection"));
const EverythingSection = lazyWithRetry(() => import("@/components/EverythingSection"));
const NoticeComplianceSection = lazyWithRetry(() => import("@/components/NoticeComplianceSection"));
const GSTNoticeSection = lazyWithRetry(() => import("@/components/GSTNoticeSection"));
const ProfessionalServicesSection = lazyWithRetry(() => import("@/components/ProfessionalServicesSection"));
const OtherServicesSection = lazyWithRetry(() => import("@/components/OtherServicesSection"));
const FinancialGlossary = lazyWithRetry(() => import("@/components/seo/FinancialGlossary"));
const FeaturedResources = lazyWithRetry(() => import("@/components/seo/FeaturedResources"));

const SectionFallback = () => (
  <div className="py-12">
    <div className="container mx-auto px-4 space-y-4">
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-5 w-full max-w-96 mx-auto" />
      <div className="grid md:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

const HERO_TYPING_PHRASES = [
  "Income Tax Returns",
  "GST Returns",
  "TDS Returns",
  "Compliances",
];

const mobileSummaryCards = [
  {
    label: "For salaried professionals",
    title: "Start with the right ITR path.",
    description: "Check salary, Form 16, deductions, AIS, capital gains, and refund readiness before filing.",
    href: "/itr/start?source=homepage_mobile_summary",
    cta: "Start ITR Filing",
    icon: FileText,
  },
  {
    label: "Business / GST",
    title: "Keep compliance scoped first.",
    description: "Review GST, notices, TDS, registration, documents, and advisory needs before payment.",
    href: "/services",
    cta: "View Business Services",
    icon: Building2,
  },
];

const LowerHomepageMobileSummary = () => (
  <section className="border-y border-slate-200 bg-[#F8FAFC] py-6 md:hidden">
    <div className="container mx-auto px-4">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Guided next steps</p>
        <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-950">
          Choose the tax path that matches your case.
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Compact mobile summaries keep the homepage fast while showing the trust, scope, and SEO answers people need before filing.
        </p>
      </div>

      <div className="grid gap-3">
        {mobileSummaryCards.map((item) => (
          <Link key={item.title} href={item.href}>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">{item.label}</p>
                  <h3 className="mt-1 text-base font-extrabold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                  <div className="mt-3 inline-flex items-center text-sm font-bold text-blue-700">
                    {item.cta}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-slate-700">
        <div className="flex items-start gap-2">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <span>Scope before payment, secure document handling, and expert review are available when your filing needs more judgment.</span>
        </div>
      </div>
    </div>
  </section>
);

const HomePage = () => {
  const seo = getSEOConfig('/');
  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0);
  const [heroTypedLength, setHeroTypedLength] = useState(HERO_TYPING_PHRASES[0].length);
  const [isHeroDeleting, setIsHeroDeleting] = useState(false);
  const currentHeroPhrase = HERO_TYPING_PHRASES[heroPhraseIndex];
  const typedHeroPhrase = currentHeroPhrase.slice(0, heroTypedLength);

  useEffect(() => {
    const typingDelay = isHeroDeleting ? 38 : 76;
    const holdDelay = 1250;
    const switchDelay = 220;
    const delay = !isHeroDeleting && heroTypedLength === currentHeroPhrase.length
      ? holdDelay
      : isHeroDeleting && heroTypedLength === 0
        ? switchDelay
        : typingDelay;

    const timeout = window.setTimeout(() => {
      if (!isHeroDeleting && heroTypedLength < currentHeroPhrase.length) {
        setHeroTypedLength((length) => length + 1);
        return;
      }

      if (!isHeroDeleting) {
        setIsHeroDeleting(true);
        return;
      }

      if (heroTypedLength > 0) {
        setHeroTypedLength((length) => length - 1);
        return;
      }

      setHeroPhraseIndex((index) => (index + 1) % HERO_TYPING_PHRASES.length);
      setIsHeroDeleting(false);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [currentHeroPhrase, heroTypedLength, isHeroDeleting]);

  return (
    <>
      <MetaSEO
        title={seo?.title || "Income Tax Filing & ITR e-Filing Services India AY 2026-27"}
        description={seo?.description || "File ITR online with MyeCA.in using guided workflows, tax calculators, and optional CA-assisted review. ITR filing starts at ₹499 for AY 2026-27."}
        keywords={seo?.keywords}
        breadcrumbs={[
          { name: "Home", url: "/" },
        ]}
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
          "priceRange": "₹499-₹9,999"
        }}
        faqPageData={[
          {
            question: "How can I file ITR online with guidance?",
            answer: "MyeCA.in offers a guided ITR filing process where you can enter details, use Form 16 support where available, and choose CA-assisted review on eligible plans."
          },
          {
            question: "Is CA review mandatory for all tax filings on MyeCA.in?",
            answer: "No. Self-service filing and CA-assisted packages are separate options, so choose the review level that fits your facts and document readiness."
          },
          {
            question: "How much does it cost to file ITR online?",
            answer: "ITR filing starts at ₹499 for simple guided cases, with CA-assisted package levels such as ₹999 and ₹1,499 depending on the return type and support required."
          },
          {
            question: "Can I get a refund for my income tax through MyeCA.in?",
            answer: "A refund depends on your income, TDS, advance tax, deductions, exemptions, and final processing by the Income Tax Department. MyeCA helps you review eligible claims based on the documents you provide."
          }
        ]}
      />

      <div className="bg-white min-h-screen">
        {/* Hero Section - Compact & Focused */}
        <section className="bg-white py-10 md:bg-gradient-to-br md:from-slate-50 md:via-blue-50/20 md:to-white md:py-12 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl text-center">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm">
                <Shield className="h-4 w-4 shrink-0 text-blue-600" />
                <span>Smart tax filing</span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" aria-hidden="true" />
                <span className="text-emerald-600">AY 2026-27</span>
              </div>

              <div className="relative mx-auto mt-6 max-w-5xl">
                <span className="hero-filing-stamp pointer-events-none absolute -left-28 top-[5.75rem] hidden rounded-[3px] border-2 border-dashed border-emerald-500/70 bg-transparent px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-700/85 ring-1 ring-emerald-500/20 ring-offset-2 ring-offset-white xl:inline-flex">
                  ITR FILING 2026-27 STARTED
                </span>

                <h1 className="type-hero-title mx-auto max-w-5xl text-slate-950">
                  File your{" "}
                  <span className="inline-flex min-w-[14ch] items-center justify-start text-left text-blue-600 sm:min-w-[18ch]">
                    <span aria-live="polite">{typedHeroPhrase || "\u00a0"}</span>
                    <span className="ml-1 inline-block h-[0.95em] w-1 animate-pulse bg-blue-600 align-[-0.08em]" aria-hidden="true" />
                  </span>
                </h1>
                <p className="mx-auto mt-3 max-w-3xl text-center text-lg leading-8 text-slate-600 md:text-2xl">
                  With <span className="font-bold text-slate-700">Expert eCA Assistance</span> and <span className="font-bold text-slate-700">Free Notice Assistance</span>.
                </p>
                <span className="hero-filing-stamp mt-3 inline-flex rounded-[3px] border-2 border-dashed border-emerald-500/70 bg-transparent px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-700/85 ring-1 ring-emerald-500/20 ring-offset-2 ring-offset-white xl:hidden">
                  ITR FILING 2026-27 STARTED
                </span>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap md:mt-7">
                <Link
                  href="/itr/start?source=homepage_hero"
                  onClick={() => trackPublicCtaClick("Start Filing Now", "homepage_hero")}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-lg bg-slate-800 px-8 text-base font-black text-white shadow-lg shadow-slate-300 transition-colors hover:bg-slate-900 sm:w-auto"
                >
                  <Rocket className="h-5 w-5" />
                  Start Filing Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/calculators/income-tax"
                  onClick={() => trackPublicCtaClick("Free Tax Calculator", "homepage_hero")}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-8 text-base font-black text-slate-800 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700 sm:w-auto"
                >
                  <Calculator className="h-5 w-5" />
                  Free Tax Calculator
                </Link>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 text-sm font-semibold text-slate-600 sm:flex-row sm:gap-6 md:mt-7 md:text-base">
                {[
                  "Secure documents",
                  "Scope before payment",
                  "Expert support",
                ].map((item) => (
                  <div key={item} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/trust" className="mt-4 inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-800">
                Privacy, security and document handling <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-100 bg-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.35fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  <Shield className="h-3.5 w-3.5" />
                  Transparent pricing
                </div>
                <h2 className="mt-4 text-2xl font-extrabold leading-tight text-slate-950 md:text-3xl">Know the filing scope before you pay.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Simple salary cases start at ₹499. Assisted filing starts at ₹999, with CA review available for complex deductions, capital gains, business income, and notices.
                </p>
                <div className="mt-5 grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-1">
                  {["Scope shown upfront", "Documents reviewed before quote"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      {item}
                    </div>
                  ))}
                </div>
                <Link href="/pricing" className="mt-5 inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-800">
                  Compare Pricing <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { title: "Self-guided", price: "₹499", detail: "Simple salary filing", note: "Checklist and guided workflow" },
                  { title: "Assisted", price: "₹999", detail: "Expert-assisted filing", note: "Review scope shown upfront" },
                  { title: "Complex cases", price: "Scope first", detail: "Capital gains, NRI, business", note: "Documents reviewed before quote" },
                ].map((plan) => (
                  <div key={plan.title} className="rounded-lg border border-slate-100 bg-slate-50/70 p-5 transition-colors hover:border-blue-100 hover:bg-white md:p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">{plan.title}</p>
                    <p className="mt-3 text-2xl font-extrabold text-slate-950">{plan.price}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">{plan.detail}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-600">{plan.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Proof Strip */}
        <section className="border-b border-slate-200 bg-[#F8FAFC] py-4 md:py-6">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Shield, title: "Portal workflow", text: "Filing steps are aligned to official income-tax portal submission flow." },
                { icon: Users, title: "CA review scope", text: "Assisted plans explain what an expert reviews before work starts." },
                { icon: FileText, title: "Document privacy", text: "Upload only required documents and see missing items before filing." },
                { icon: Award, title: "Price clarity", text: "Plan scope, GST treatment, and exclusions stay visible before checkout." },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-left md:text-center">
              <Link href="/trust" className="inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-800">
                Review trust and document handling <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Core Features - Redesigned for Premium Look */}
        <section className="relative hidden overflow-hidden bg-white py-6 md:block md:py-20">
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
                  title: "Document Upload & Review",
                  description: "Upload Form 16, AIS, bank statements, and proofs so extracted details can be reviewed before filing.",
                  icon: SmartDocumentScannerLogo,
                  bgColor: "bg-purple-50",
                  textColor: "text-purple-600",
                  borderColor: "border-purple-100/50",
                  shadowColor: "shadow-purple-500/10",
                  href: "/features/document-scanner",
                },
                {
                  title: "Optional Expert Review",
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
                      <h3 className="type-card-title font-bold text-slate-900 transition-colors group-hover:text-[var(--color-primary-600)] md:mb-4">
                        {feature.title}
                      </h3>

                      <p className="type-support mt-1 font-medium text-slate-500 md:mt-0">
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
              <p className="mt-2 text-sm text-slate-600 md:mt-4 md:text-lg">Our workflow keeps filing structured, documented, and easier to review.</p>
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
                    <p className="type-support mt-1 font-medium text-slate-600 md:mt-0">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="hidden md:block">
          <Suspense fallback={<SectionFallback />}>
            <Testimonials />
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <TrustedBySection />
          </Suspense>
        </div>

        {/* Planning Tools Section */}
        <section className="border-b border-slate-200 bg-white py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
              <div className="flex max-w-2xl flex-col lg:max-w-none">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Planning tools</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
                  Estimate first. File with fewer surprises.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
                  Use calculators to prepare your numbers, then move into the filing workflow when documents and deductions are clear.
                </p>
                <Link href="/calculators" className="mt-5 inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-800">
                  View all calculators <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link href="/tax-assistant" className="mt-6 hidden md:block">
                  <div className="group rounded-lg border border-blue-100 bg-blue-50/70 p-5 transition-colors hover:border-blue-200 hover:bg-blue-50">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold tracking-tight text-slate-950">AI Tax Assistant</h3>
                          <span className="type-meta rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-bold text-amber-700">Beta</span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-600">Ask tax questions, prepare documents, and understand next steps before filing.</p>
                        <div className="mt-4 inline-flex items-center text-sm font-bold text-blue-700">
                          Try Assistant <Sparkles className="ml-2 h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-2 md:hidden">
                  {[
                    { title: "Income Tax", desc: "Tax payable", href: "/calculators/income-tax", icon: Calculator, tone: "bg-blue-50 text-blue-700" },
                    { title: "Regime", desc: "Old vs new", href: "/calculators/regime-comparator", icon: TrendingUp, tone: "bg-emerald-50 text-emerald-700" },
                    { title: "HRA", desc: "Rent benefit", href: "/calculators/hra", icon: Shield, tone: "bg-amber-50 text-amber-700" },
                    { title: "Form 16", desc: "Parse salary data", href: "/form16-parser", icon: FileText, tone: "bg-indigo-50 text-indigo-700" },
                  ].map((calc) => (
                    <Link key={calc.title} href={calc.href}>
                      <Card className="group h-full cursor-pointer rounded-lg border border-slate-100 bg-slate-50/70 shadow-none transition-colors hover:border-blue-100 hover:bg-white">
                        <CardContent className="p-4">
                          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", calc.tone)}>
                            <calc.icon className="h-4 w-4" strokeWidth={2} />
                          </div>
                          <h3 className="mt-3 text-sm font-bold tracking-tight text-slate-950 group-hover:text-blue-700">
                            {calc.title}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{calc.desc}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <div className="hidden gap-3 md:grid md:grid-cols-3">
                  {[
                    { title: "Income Tax", desc: "AY 2026-27 estimate", href: "/calculators/income-tax", icon: Calculator, tone: "bg-blue-50 text-blue-700" },
                    { title: "HRA", desc: "Rent allowance check", href: "/calculators/hra", icon: Shield, tone: "bg-emerald-50 text-emerald-700" },
                    { title: "SIP", desc: "Investment planning", href: "/calculators/sip", icon: TrendingUp, tone: "bg-amber-50 text-amber-700" },
                    { title: "Regime Compare", desc: "Old vs new tax", href: "/calculators/regime-comparator", icon: TrendingUp, tone: "bg-indigo-50 text-indigo-700" },
                    { title: "TDS", desc: "Deduction estimate", href: "/calculators/tds", icon: FileText, tone: "bg-orange-50 text-orange-700" },
                    { title: "Capital Gains", desc: "STCG and LTCG", href: "/calculators/capital-gains", icon: Calculator, tone: "bg-violet-50 text-violet-700" },
                  ].map((calc) => (
                    <Link key={calc.title} href={calc.href}>
                      <Card className="group h-full cursor-pointer rounded-lg border border-slate-100 bg-slate-50/70 shadow-none transition-colors hover:border-blue-100 hover:bg-white">
                        <CardContent className="p-5">
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", calc.tone)}>
                            <calc.icon className="h-5 w-5" strokeWidth={2} />
                          </div>
                          <h3 className="mt-4 text-base font-bold tracking-tight text-slate-950 group-hover:text-blue-700">
                            {calc.title}
                          </h3>
                          <p className="mt-1 text-sm leading-5 text-slate-600">{calc.desc}</p>
                          <div className="mt-4 inline-flex items-center text-sm font-bold text-blue-700">
                            Calculate <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 md:hidden">
                  <p className="type-meta font-bold text-blue-700">Next step</p>
                  <h3 className="mt-2 text-base font-extrabold text-slate-950">Know your number? Check the ITR path.</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Start with a 60-second plan check before choosing a technical ITR form.
                  </p>
                  <div className="mt-3 grid gap-2">
                    <Link href="/itr/start?source=homepage_mobile_tools">
                      <Button className="h-11 w-full rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700">
                        Check my ITR plan
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/itr/form-recommender" className="flex h-11 items-center justify-center rounded-lg border border-blue-100 bg-white text-sm font-bold text-blue-700">
                      Not sure which form?
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LowerHomepageMobileSummary />

        <section className="hidden md:block" style={{ contentVisibility: 'auto', contain: 'content', containIntrinsicSize: '0 500px' }}>
          <Suspense fallback={<SectionFallback />}>
            <FeaturesSection />
          </Suspense>
        </section>

        <div className="hidden md:block">
          <Suspense fallback={<SectionFallback />}>
            <EverythingSection />
          </Suspense>

          <Suspense fallback={<SectionFallback />}>
            <OtherServicesSection />
          </Suspense>

          <section style={{ contentVisibility: 'auto', contain: 'content', containIntrinsicSize: '0 500px' }}>
            <Suspense fallback={<SectionFallback />}>
              <ProfessionalServicesSection />
            </Suspense>
          </section>
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
        </div>

        {/* Final CTA */}
        <section className="border-t border-gray-100 bg-white py-8 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-lg border border-slate-200/60 bg-white p-5 text-left shadow-sm md:rounded-card md:p-12 md:text-center md:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] lg:p-16">
              
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-blue-100/50 bg-blue-50/50 px-3 py-2 text-xs font-semibold text-brand-600 md:mb-8 md:rounded-full md:px-5">
                  <Award className="w-4 h-4" />
                  Portal workflow · CA review available · Official portal guidance
                </div>

                <h2 className="type-section-title mb-3 font-extrabold text-slate-900 md:mb-6">
                  Ready to file your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Tax Returns?</span>
                </h2>

                <p className="mb-5 max-w-2xl text-sm leading-6 text-slate-500 md:mx-auto md:mb-10 md:text-lg md:leading-relaxed">
                  Start with guided filing and add expert review when your return needs a closer look.
                </p>

                <div className="flex flex-col gap-2 sm:flex-row md:justify-center md:gap-4">
                  <Link href="/itr/start?source=homepage_final_cta">
                    <Button variant="brand" size="xl" className="h-11 w-full rounded-lg px-6 shadow-sm shadow-brand-500/25 transition-all sm:w-auto md:px-8 md:hover:-translate-y-0.5">
                      <Rocket className="mr-2 h-5 w-5" />
                       Start ITR Filing
                    </Button>
                  </Link>
                  <Link href="/expert-consultation?service=itr-filing&source=homepage_final_cta">
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
