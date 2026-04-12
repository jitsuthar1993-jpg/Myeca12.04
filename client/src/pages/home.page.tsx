import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { track } from "@vercel/analytics";
import {
  ArrowRight,
  Bot,
  Building2,
  Calculator,
  CheckCircle2,
  FileText,
  Globe2,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import MetaSEO from "@/components/seo/MetaSEO";
import Logo from "@/components/ui/logo";
import { MyeCard, SectionHeading, StatusBadge, TrustStrip, formatInr } from "@/components/platform/compliance-ui";

const processSteps = [
  ["Connect Data", "Upload Form 16, AIS, bank statements, or start with PAN profile basics.", Upload],
  ["AI + CA Review", "OCR extracts values while a named CA validates the filing decision.", Bot],
  ["One-Click File", "Pay with UPI Intent, submit, e-verify, and track refund status.", CheckCircle2],
];

const serviceCategories = [
  {
    title: "Individual Services",
    description: "ITR-1 to ITR-4, capital gains, tax notices, advance tax, refund tracking.",
    icon: FileText,
    href: "/services",
  },
  {
    title: "Business Compliance",
    description: "GST registration/returns, TDS, company incorporation, ROC, virtual CFO.",
    icon: Building2,
    href: "/services/marketplace",
  },
  {
    title: "NRI Tax Support",
    description: "DTAA relief, NRO/NRE taxation, foreign asset disclosure, cross-border income.",
    icon: Globe2,
    href: "/services/tax-planning",
  },
  {
    title: "Specialized Tools",
    description: "Trademark, ISO, document generator, calculators, and compliance templates.",
    icon: ReceiptText,
    href: "/all-services",
  },
];

const pricingTiers = [
  ["DIY Automated", "₹499", "Smart forms, calculators, vault, and AI guidance."],
  ["Expert Assisted", "₹999", "Named CA review for ITR and document reconciliation."],
  ["Premium vCFO", "Custom", "Business dashboards, GST/TDS workflows, and advisory cadence."],
];

const knowledgeLinks = [
  ["Old vs New Tax Regime", "/blog/old-vs-new-tax-regime-guide"],
  ["Form 16 filing guide", "/blog/form-16-itr-filing-guide"],
  ["GST compliance checklist", "/blog/gst-compliance-guide"],
];

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) setLocation("/dashboard");
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading || isAuthenticated) return null;

  return (
    <>
      <MetaSEO
        title="MyeCA.in | AI-powered ITR Filing, GST, Compliance and CA Services"
        description="File ITR, manage GST, upload tax documents, compare regimes, and work with CA-reviewed compliance workflows on MyeCA.in."
        keywords={[
          "ITR filing India",
          "CA assisted tax filing",
          "GST compliance",
          "income tax calculator",
          "document vault",
          "virtual CFO",
        ]}
      />

      <main className="min-h-screen bg-[#f6f9fd] text-slate-950">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 font-black text-[#003087]">
              <Logo size="sm" />
              <span>MyeCA.in</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
              <Link href="/services">Services</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/blog">Knowledge Hub</Link>
              <Link href="/about">About</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  size="sm"
                  className="bg-[#003087] text-white hover:bg-[#082a5c]"
                  onClick={() => track("homepage_start_filing")}
                >
                  Start Filing Free
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="mye-brand-panel relative overflow-hidden px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-emerald-200" />
                ERI-ready workflows · Clerk-secured · CA-reviewed
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
                File taxes, manage compliance, and make better financial decisions.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-50/90">
                MyeCA combines AI-assisted document extraction, regime comparison, expert CA review,
                GST/business compliance, and a secure vault into one premium Indian fintech workspace.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="bg-white text-[#003087] hover:bg-blue-50"
                    onClick={() => track("homepage_primary_cta")}
                  >
                    Start Filing Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/calculators/income-tax">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                    onClick={() => track("homepage_calculator_cta")}
                  >
                    Try Tax Calculator
                    <Calculator className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="mt-8">
                <TrustStrip />
              </div>
            </div>

            <div className="rounded-[36px] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur">
              <div className="rounded-[28px] bg-white p-6 text-slate-950">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500">Estimated tax saving</p>
                    <p className="mt-1 text-4xl font-black">{formatInr(12400)}</p>
                  </div>
                  <Sparkles className="h-9 w-9 text-[#003087]" />
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    ["HRA deduction opportunity", "85% confidence", "action_required"],
                    ["Form 16 OCR verified", "4 fields extracted", "ai_validation"],
                    ["CA review slot", "Available today", "ca_review"],
                    ["Refund tracker", "Enabled after filing", "not_started"],
                  ].map(([title, helper, status]) => (
                    <div key={title} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                      <div>
                        <p className="font-black">{title}</p>
                        <p className="text-sm text-slate-500">{helper}</p>
                      </div>
                      <StatusBadge status={status as any} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How it works"
            title="A calmer 3-step filing journey"
            description="The experience is designed to reduce cognitive load while keeping every high-risk step visible and auditable."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {processSteps.map(([title, description, Icon], index) => {
              const TypedIcon = Icon as typeof Upload;
              return (
                <MyeCard key={String(title)} className="p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#003087] text-white">
                    <TypedIcon className="h-6 w-6" />
                  </div>
                  <p className="mt-5 text-sm font-black uppercase tracking-widest text-[#0050b5]">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-2 text-2xl font-black">{String(title)}</h3>
                  <p className="mt-3 text-slate-600">{String(description)}</p>
                </MyeCard>
              );
            })}
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Services marketplace"
              title="One platform for individuals, NRIs, startups, and businesses"
              description="Services are grouped by intent so users do not face a wall of forms."
              action={
                <Link href="/services">
                  <Button variant="outline">Explore all services</Button>
                </Link>
              }
            />
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {serviceCategories.map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.title}
                    href={service.href}
                    className="rounded-[28px] border border-slate-200 bg-[#f6f9fd] p-6 transition hover:-translate-y-1 hover:border-[#003087]"
                  >
                    <Icon className="h-8 w-8 text-[#003087]" />
                    <h3 className="mt-5 text-xl font-black">{service.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
                    <p className="mt-5 flex items-center gap-2 font-black text-[#003087]">
                      View services
                      <ArrowRight className="h-4 w-4" />
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <MyeCard className="bg-gradient-to-br from-blue-50 to-emerald-50">
            <Calculator className="h-10 w-10 text-[#003087]" />
            <h2 className="mt-5 text-3xl font-black">Interactive tax tools hub</h2>
            <p className="mt-3 text-slate-600">
              Use calculators for income tax, HRA, capital gains, SIP, advance tax, and regime comparison.
              Save outputs to profile during authenticated filing.
            </p>
            <Link href="/calculators/regime-comparator">
              <Button className="mt-6 bg-[#003087] text-white hover:bg-[#082a5c]">
                Compare regimes
                <TrendingUp className="h-4 w-4" />
              </Button>
            </Link>
          </MyeCard>

          <div className="grid gap-4 sm:grid-cols-3">
            {pricingTiers.map(([name, price, description]) => (
              <MyeCard key={name} className="p-5">
                <p className="text-sm font-black uppercase tracking-widest text-[#0050b5]">{name}</p>
                <p className="mt-3 text-3xl font-black">{price}</p>
                <p className="mt-3 text-sm text-slate-600">{description}</p>
                <CheckCircle2 className="mt-5 h-6 w-6 text-emerald-800" />
              </MyeCard>
            ))}
          </div>
        </section>

        <section className="bg-[#003087] px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">Knowledge hub</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Readable tax guidance for real decisions</h2>
              <p className="mt-4 text-blue-50/90">
                Blog and guide pages support long-form reading with TOC, related posts, CTAs, and CA-reviewed language.
              </p>
            </div>
            <div className="space-y-3">
              {knowledgeLinks.map(([title, href]) => (
                <Link key={href} href={href} className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 p-4 font-black backdrop-blur transition hover:bg-white/20">
                  {title}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <footer className="bg-white px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-slate-200 pt-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <div>
                <p className="font-black text-[#003087]">MyeCA.in</p>
                <p className="text-sm text-slate-500">AI-powered compliance with human CA assurance.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-600">
              <Link href="/legal/privacy-policy">Privacy</Link>
              <Link href="/legal/terms-of-service">Terms</Link>
              <Link href="/legal/refund-policy">Refunds</Link>
              <Link href="/legal/disclaimer">Disclaimer</Link>
              <span className="flex items-center gap-1">
                <LockKeyhole className="h-4 w-4" />
                Secure by design
              </span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
