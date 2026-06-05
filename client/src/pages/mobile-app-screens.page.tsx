import type { ComponentType, ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Bell,
  Bot,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileText,
  FolderOpen,
  Home,
  LayoutDashboard,
  LockKeyhole,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCircle2,
  WalletCards,
  TrendingUp,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import BrandLockup from "@/components/ui/brand-lockup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BottomNavItem = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const bottomNavItems: BottomNavItem[] = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "file", label: "File", href: "/itr/start?source=mobile_app_preview_nav", icon: FileText },
  { id: "tools", label: "Tools", href: "/calculators", icon: Calculator },
  { id: "services", label: "Services", href: "/services", icon: WalletCards },
  { id: "account", label: "Account", href: "/dashboard", icon: UserCircle2 },
];

function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[360px]",
        "rounded-[2.75rem] bg-blue-700 p-[10px]",
        "shadow-[0_40px_120px_-50px_rgba(8,42,92,0.85)]",
        className,
      )}
    >
      <div className="flex aspect-[9/19.5] flex-col overflow-hidden rounded-[2.1rem] bg-white">
        {children}
      </div>
    </div>
  );
}

function StatusBar({ inverted = false }: { inverted?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 pt-4 type-meta font-normal tracking-[0.24em]",
        inverted ? "text-white/90" : "text-slate-500",
      )}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <span className={cn("h-2 w-2 rounded-full", inverted ? "bg-white/70" : "bg-slate-300")} />
        <span className={cn("h-2 w-4 rounded-full", inverted ? "bg-white/70" : "bg-slate-300")} />
        <span className={cn("h-2 w-6 rounded-full", inverted ? "bg-white/70" : "bg-slate-300")} />
      </div>
    </div>
  );
}

function BottomNav({ active }: { active: string }) {
  return (
    <nav className="border-t border-slate-200/80 bg-white/95 px-2 py-2 shadow-[0_-6px_24px_-14px_rgba(0,48,135,0.25)] backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 type-meta font-normal transition",
                "min-h-[56px] touch-manipulation active:scale-95",
                isActive ? "bg-blue-50 text-[#315efb]" : "text-slate-500",
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "scale-110")} />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function PhoneHeader({
  title,
  subtitle,
  icon: Icon,
  accent = "blue",
}: {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "blue" | "indigo" | "emerald" | "amber";
}) {
  const tone = {
    blue: "bg-blue-50 text-[#315efb]",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[accent];

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="type-meta font-normal uppercase tracking-[0.28em] text-slate-400">MyeCA mobile</p>
        <h3 className="mt-2 type-card-title font-normal tracking-tight text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
      </div>
      <div className={cn("rounded-2xl p-3", tone)}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

function ScreenTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 type-meta font-normal uppercase tracking-[0.22em] text-slate-500">
      {label}
    </span>
  );
}

function StatPill({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "slate" | "blue" | "emerald" | "amber";
}) {
  const classes = {
    slate: "bg-slate-50 text-slate-900",
    blue: "bg-blue-50 text-[#315efb]",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <div className={cn("rounded-[22px] border border-slate-100 px-4 py-3", classes)}>
      <p className="type-meta font-normal uppercase tracking-[0.22em] opacity-60">{label}</p>
      <p className="mt-1 text-lg font-normal tracking-tight">{value}</p>
    </div>
  );
}

const quickActions = [
  { label: "File ITR", icon: FileText, href: "/itr/start?source=mobile_app_preview_action", tone: "bg-blue-50 text-[#315efb]" },
  { label: "Tax Calc", icon: Calculator, href: "/calculators/income-tax", tone: "bg-emerald-50 text-emerald-700" },
  { label: "Upload Docs", icon: Upload, href: "/documents", tone: "bg-indigo-50 text-indigo-600" },
  { label: "Ask CA", icon: Bot, href: "/tax-assistant", tone: "bg-amber-50 text-amber-700" },
] as const;

const calculatorCards = [
  { title: "Income Tax", desc: "Old vs new regime", icon: CircleDollarSign, tone: "bg-blue-50 text-[#315efb]" },
  { title: "HRA", desc: "Rent savings", icon: Building2, tone: "bg-emerald-50 text-emerald-700" },
  { title: "SIP", desc: "Future corpus", icon: TrendingUp, tone: "bg-indigo-50 text-indigo-600" },
  { title: "EMI", desc: "Loan planning", icon: LockKeyhole, tone: "bg-amber-50 text-amber-700" },
] as const;

const serviceRows = [
  { title: "ITR Filing", desc: "CA-reviewed return in 4 steps", price: "From ₹999 excluding GST", tone: "bg-blue-50 text-[#315efb]" },
  { title: "GST Registration", desc: "Documents, filing, activation", price: "₹2,999", tone: "bg-emerald-50 text-emerald-700" },
  { title: "Company Setup", desc: "Pvt Ltd, LLP, OPC", price: "₹7,999", tone: "bg-indigo-50 text-indigo-600" },
  { title: "Notice Help", desc: "Draft the response with a CA", price: "₹2,999", tone: "bg-amber-50 text-amber-700" },
] as const;

export default function MobileAppScreensPage() {
  return (
    <main className="min-h-screen bg-[#f6f9fd] text-slate-950">
      <MetaSEO
        title="MyeCA Mobile App Screens | Concept Preview"
        description="Mobile-first screen concepts based on the MyeCA website: onboarding, dashboard, filing, calculators, documents, assistant, services, and account."
        keywords={["MyeCA mobile app", "tax app screens", "ITR mobile UI", "GST app design"]}
      />

      <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-br from-slate-50 via-blue-50/40 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(49,94,251,0.10),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.08),transparent_28%)]" />
        <div className="absolute left-8 top-16 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl animate-float" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl animate-float delay-2" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-7">
              <ScreenTag label="Mobile app concept" />
              <div className="space-y-4">
                <h1 className="max-w-3xl type-page-title text-slate-950">
                  MyeCA, redesigned for
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#315efb] via-[#0646b2] to-[#0f766e]">
                    a mobile-first tax cockpit
                  </span>
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  I turned the website’s main journeys into app screens for filing ITR, checking calculators, uploading documents, chatting with a CA, and managing services from a phone.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge className="rounded-full bg-blue-50 px-4 py-2 text-[#315efb] hover:bg-blue-50">
                  CA-reviewed filing
                </Badge>
                <Badge className="rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 hover:bg-emerald-50">
                  Secure document vault
                </Badge>
                <Badge className="rounded-full bg-amber-50 px-4 py-2 text-amber-700 hover:bg-amber-50">
                  AI assistant
                </Badge>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-12 w-full rounded-2xl bg-[#315efb] px-6 font-normal text-white shadow-lg shadow-blue-500/20 hover:bg-[#2040d8] sm:w-auto">
                  <Link href="/itr/start?source=mobile_app_preview_cta">
                    Preview filing flow
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 w-full rounded-2xl border-slate-200 px-6 font-normal text-slate-700 hover:bg-slate-50 sm:w-auto">
                  <Link href="/dashboard">Open dashboard</Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <StatPill label="Core screens" value="8" tone="blue" />
                <StatPill label="Primary flows" value="4" tone="emerald" />
                <StatPill label="Shared nav" value="Bottom bar" tone="amber" />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-8 rounded-[2.75rem] bg-white/70 blur-2xl" />
              <div className="relative grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-48px_rgba(0,48,135,0.45)]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-blue-50 p-3 text-[#315efb]">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-normal uppercase tracking-[0.22em] text-slate-400">Trust first</p>
                      <p className="mt-1 text-sm font-normal text-slate-900">CA-assisted review where applicable</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    The mobile UI keeps the same trust signals from the website, with faster thumb-sized actions.
                  </p>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-[#315efb] to-[#082a5c] p-6 text-white shadow-[0_24px_70px_-48px_rgba(8,42,92,0.65)]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-normal uppercase tracking-[0.22em] text-blue-100">Fast lane</p>
                      <p className="mt-1 text-sm font-normal">Upload, parse, and file in one flow</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-3 text-xs font-normal uppercase tracking-[0.2em] text-blue-100/90">
                    <span className="rounded-full bg-white/10 px-3 py-1">Form 16</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">AIS</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">CA Review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-normal uppercase tracking-[0.28em] text-[#315efb]">Screen set</p>
            <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950 md:text-3xl">
              Screens mapped from the website’s core journeys
            </h2>
            <p className="mt-2 max-w-3xl text-slate-600">
              Each phone mockup uses the same brand colors, trust language, and service hierarchy as the website, but reorganized for one-handed mobile use.
            </p>
          </div>
          <Badge className="w-fit rounded-full bg-white px-4 py-2 text-slate-600 ring-1 ring-slate-200">
            Tap any CTA to open the real route
          </Badge>
        </div>

        <div className="grid gap-8 xl:grid-cols-2 2xl:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="type-meta font-normal uppercase tracking-[0.28em] text-slate-400">Screen 01</p>
                <h3 className="mt-1 text-xl font-normal tracking-tight text-slate-950">Splash and welcome</h3>
              </div>
              <ScreenTag label="Onboarding" />
            </div>
            <PhoneFrame>
              <div className="flex h-full flex-col bg-gradient-to-b from-[#315efb] via-[#0a46b3] to-[#082a5c] text-white">
                <StatusBar inverted />
                <div className="flex-1 px-6 pb-6 pt-4">
                  <div className="mt-4 flex items-center gap-3">
                    <div className="rounded-2xl bg-white p-2 shadow-lg shadow-blue-900/10">
                      <span className="block scale-95">
                        <BrandLockup logoSize="sm" wordmarkSize="sm" compact />
                      </span>
                    </div>
                    <div>
                      <p className="type-meta font-normal uppercase tracking-[0.24em] text-blue-100">Smart tax solutions</p>
                      <p className="mt-1 text-sm font-normal text-white/90">Tax, GST, and business in one place</p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                    <p className="type-meta font-normal uppercase tracking-[0.24em] text-blue-100">Welcome back</p>
                    <h4 className="mt-2 text-2xl font-normal tracking-tight">File, track, and ask</h4>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      Upload your documents, use guided help, and choose CA-assisted review where the filing scope includes it.
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button asChild className="h-12 w-full rounded-2xl bg-white text-[#315efb] hover:bg-white/95">
                      <Link href="/auth/login">Sign in</Link>
                    </Button>
                    <Button asChild className="h-12 w-full rounded-2xl bg-white/10 text-white hover:bg-white/15">
                      <Link href="/auth/register">Create account</Link>
                    </Button>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {["CA verified", "Secure login", "Fast setup"].map((item) => (
                      <Badge key={item} className="rounded-full bg-white/10 px-3 py-1 type-meta text-white hover:bg-white/10">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </PhoneFrame>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="type-meta font-normal uppercase tracking-[0.28em] text-slate-400">Screen 02</p>
                <h3 className="mt-1 text-xl font-normal tracking-tight text-slate-950">Home dashboard</h3>
              </div>
              <ScreenTag label="Primary hub" />
            </div>
            <PhoneFrame>
              <div className="flex h-full flex-col bg-slate-50">
                <StatusBar />
                <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-3 scrollbar-hide-mobile">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="type-meta font-normal uppercase tracking-[0.24em] text-slate-400">Hello, Arjun</p>
                      <h4 className="mt-1 text-2xl font-normal tracking-tight text-slate-950">Your tax cockpit</h4>
                    </div>
                    <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
                      <Bell className="h-5 w-5 text-slate-500" />
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-gradient-to-br from-[#315efb] to-[#0646b2] p-5 text-white shadow-[0_18px_45px_-28px_rgba(49,94,251,0.75)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="type-meta font-normal uppercase tracking-[0.24em] text-blue-100">Refund estimate</p>
                        <p className="mt-2 text-3xl font-normal tracking-tight">₹18,400</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-3">
                        <CircleDollarSign className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-normal uppercase tracking-[0.2em] text-blue-100/90">
                      <span className="rounded-full bg-white/10 px-3 py-1">AY 2026-27</span>
                      <span className="rounded-full bg-white/10 px-3 py-1">Deadline 31 Jul</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Link key={action.label} href={action.href}>
                          <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm transition active:scale-95">
                            <div className={cn("inline-flex rounded-2xl p-3", action.tone)}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <p className="mt-4 text-sm font-normal text-slate-950">{action.label}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="type-meta font-normal uppercase tracking-[0.24em] text-slate-400">Today’s insight</p>
                        <p className="mt-1 text-sm font-normal text-slate-900">HRA deduction looks available</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Upload rent receipts to check whether your current regime can save more tax this year.
                    </p>
                  </div>
                </div>

                <BottomNav active="home" />
              </div>
            </PhoneFrame>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="type-meta font-normal uppercase tracking-[0.28em] text-slate-400">Screen 03</p>
                <h3 className="mt-1 text-xl font-normal tracking-tight text-slate-950">ITR filing flow</h3>
              </div>
              <ScreenTag label="Filing" />
            </div>
            <PhoneFrame>
              <div className="flex h-full flex-col bg-white">
                <StatusBar />
                <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-3 scrollbar-hide-mobile">
                  <PhoneHeader
                    title="File your return"
                    subtitle="A simple four-step flow designed for thumb use and CA review."
                    icon={FileText}
                    accent="blue"
                  />

                  <div className="rounded-[1.7rem] bg-slate-50 p-4">
                    <div className="flex items-center justify-between type-meta font-normal uppercase tracking-[0.24em] text-slate-400">
                      <span>Step 2 of 4</span>
                      <span className="text-[#315efb]">CA review</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-200">
                      <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-[#315efb] to-[#0646b2]" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      ["1", "Enter income details", "Salary, business, capital gains"],
                      ["2", "Upload docs", "Form 16, AIS, receipts"],
                      ["3", "CA review", "Expert validation before filing"],
                      ["4", "Submit", "Direct e-filing on the portal"],
                    ].map(([num, label, desc], index) => (
                      <div key={label} className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200 p-4">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-normal",
                            index < 2 ? "bg-blue-50 text-[#315efb]" : "bg-slate-50 text-slate-400",
                          )}
                        >
                          {num}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-normal text-slate-950">{label}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1.7rem] border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#315efb]" />
                      <p className="text-sm font-normal text-slate-950">Document checks completed</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      The app can keep the filing flow concise while still showing CA review status and missing items.
                    </p>
                    <Button asChild className="mt-4 h-11 w-full rounded-2xl bg-[#315efb] font-normal text-white hover:bg-[#2040d8]">
                      <Link href="/itr/start?source=mobile_app_preview_continue">Continue filing</Link>
                    </Button>
                  </div>
                </div>

                <BottomNav active="file" />
              </div>
            </PhoneFrame>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="type-meta font-normal uppercase tracking-[0.28em] text-slate-400">Screen 04</p>
                <h3 className="mt-1 text-xl font-normal tracking-tight text-slate-950">Tax tools</h3>
              </div>
              <ScreenTag label="Calculators" />
            </div>
            <PhoneFrame>
              <div className="flex h-full flex-col bg-[#f8fbff]">
                <StatusBar />
                <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-3 scrollbar-hide-mobile">
                  <PhoneHeader
                    title="Free tax calculators"
                    subtitle="Compare regimes, plan savings, and estimate loans without leaving the app."
                    icon={Calculator}
                    accent="emerald"
                  />

                  <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-slate-400">
                      <Search className="h-4 w-4" />
                      <span className="text-sm">Search calculator</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {calculatorCards.map((calc) => {
                      const Icon = calc.icon;
                      return (
                        <div key={calc.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                          <div className={cn("inline-flex rounded-2xl p-3", calc.tone)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="mt-4 text-sm font-normal text-slate-950">{calc.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{calc.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-[1.7rem] bg-gradient-to-br from-[#315efb] to-[#082a5c] p-4 text-white shadow-[0_18px_50px_-35px_rgba(8,42,92,0.8)]">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="type-meta font-normal uppercase tracking-[0.24em] text-blue-100">Savings snapshot</p>
                        <p className="mt-2 text-2xl font-normal tracking-tight">₹32,000</p>
                      </div>
                      <div className="flex h-16 items-end gap-2">
                        <span className="w-3 rounded-t-full bg-white/30" style={{ height: "40%" }} />
                        <span className="w-3 rounded-t-full bg-white/45" style={{ height: "55%" }} />
                        <span className="w-3 rounded-t-full bg-white/70" style={{ height: "80%" }} />
                        <span className="w-3 rounded-t-full bg-white" style={{ height: "68%" }} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-blue-100/85">
                      This screen keeps the dashboard-like summary from the website but makes it easy to scan on mobile.
                    </p>
                  </div>
                </div>

                <BottomNav active="tools" />
              </div>
            </PhoneFrame>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="type-meta font-normal uppercase tracking-[0.28em] text-slate-400">Screen 05</p>
                <h3 className="mt-1 text-xl font-normal tracking-tight text-slate-950">Document vault</h3>
              </div>
              <ScreenTag label="Private document area" />
            </div>
            <PhoneFrame>
              <div className="flex h-full flex-col bg-white">
                <StatusBar />
                <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-3 scrollbar-hide-mobile">
                  <PhoneHeader
                    title="Private document vault"
                    subtitle="Keep Form 16, AIS, rent receipts, and bank statements in a signed-in document area."
                    icon={FolderOpen}
                    accent="amber"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <StatPill label="Storage" value="2.4 MB" tone="blue" />
                    <StatPill label="Encrypted" value="Active" tone="emerald" />
                  </div>

                  <div className="space-y-2">
                    {[
                      ["Form 16", "Matched and ready", "blue"],
                      ["AIS / 26AS", "Review required", "amber"],
                      ["Rent receipts", "Uploaded today", "emerald"],
                      ["Bank statement", "OCR completed", "slate"],
                    ].map(([label, status, tone]) => (
                      <div key={label} className="flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-slate-50/60 p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("rounded-2xl bg-white p-2 shadow-sm", tone === "blue" && "text-[#315efb]", tone === "amber" && "text-amber-700", tone === "emerald" && "text-emerald-700", tone === "slate" && "text-slate-500")}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-normal text-slate-950">{label}</p>
                            <p className="mt-1 text-xs text-slate-500">{status}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1.7rem] border border-dashed border-blue-200 bg-blue-50/60 p-5 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#315efb] shadow-sm">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-normal text-slate-950">Upload a new document</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      One tap brings you to the private upload flow already used across the website.
                    </p>
                  </div>
                </div>

                <BottomNav active="services" />
              </div>
            </PhoneFrame>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="type-meta font-normal uppercase tracking-[0.28em] text-slate-400">Screen 06</p>
                <h3 className="mt-1 text-xl font-normal tracking-tight text-slate-950">AI assistant</h3>
              </div>
              <ScreenTag label="Chat" />
            </div>
            <PhoneFrame>
              <div className="flex h-full flex-col bg-blue-700 text-white">
                <StatusBar inverted />
                <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-3 scrollbar-hide-mobile">
                  <PhoneHeader
                    title="Ask the tax assistant"
                    subtitle="A conversational layer for tax questions, document checks, and next-step guidance."
                    icon={Bot}
                    accent="blue"
                  />

                  <div className="flex flex-wrap gap-2">
                    {["Salary income", "HRA check", "Old vs new", "Form 16 OCR"].map((chip) => (
                      <Badge key={chip} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 type-meta text-white hover:bg-white/10">
                        {chip}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="max-w-[85%] rounded-[1.5rem] rounded-tl-md bg-white/10 p-4 backdrop-blur">
                      <p className="type-meta font-normal uppercase tracking-[0.24em] text-blue-100">You</p>
                      <p className="mt-2 text-sm leading-6 text-white/90">
                        Compare the new regime with my salary and rent details.
                      </p>
                    </div>
                    <div className="ml-auto max-w-[86%] rounded-[1.5rem] rounded-tr-md bg-blue-500/20 p-4">
                      <p className="type-meta font-normal uppercase tracking-[0.24em] text-blue-100">MyeCA AI</p>
                      <p className="mt-2 text-sm leading-6 text-white/90">
                        Upload Form 16 and rent receipts. I will estimate the HRA benefit, compare both regimes, and flag any CA review items.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.7rem] bg-white p-4 text-slate-950 shadow-lg shadow-blue-900/20">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-normal">Quick reply</p>
                      <Sparkles className="h-4 w-4 text-[#315efb]" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      The app can keep the same “ask, analyze, and action” pattern from the website’s assistant page.
                    </p>
                    <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-slate-400">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">Type your question</span>
                    </div>
                  </div>
                </div>
              </div>
            </PhoneFrame>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="type-meta font-normal uppercase tracking-[0.28em] text-slate-400">Screen 07</p>
                <h3 className="mt-1 text-xl font-normal tracking-tight text-slate-950">Services marketplace</h3>
              </div>
              <ScreenTag label="Business" />
            </div>
            <PhoneFrame>
              <div className="flex h-full flex-col bg-[#f6f9fd]">
                <StatusBar />
                <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-3 scrollbar-hide-mobile">
                  <PhoneHeader
                    title="Choose a service"
                    subtitle="Grouped by intent so users can pick the right next step without reading long explanations."
                    icon={WalletCards}
                    accent="indigo"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["ITR", "Individuals", "blue"],
                      ["GST", "Businesses", "emerald"],
                      ["Company", "Startups", "indigo"],
                      ["Notice", "Urgent help", "amber"],
                    ].map(([label, desc, tone]) => (
                      <div key={label} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                        <div className={cn("inline-flex rounded-2xl px-3 py-2 text-xs font-normal uppercase tracking-[0.22em]", tone === "blue" && "bg-blue-50 text-[#315efb]", tone === "emerald" && "bg-emerald-50 text-emerald-700", tone === "indigo" && "bg-indigo-50 text-indigo-600", tone === "amber" && "bg-amber-50 text-amber-700")}>
                          {label}
                        </div>
                        <p className="mt-4 text-sm font-normal text-slate-950">{desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {serviceRows.map((service) => (
                      <div key={service.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-normal text-slate-950">{service.title}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{service.desc}</p>
                          </div>
                          <span className={cn("rounded-full px-3 py-1 type-meta font-normal uppercase tracking-[0.22em]", service.tone)}>
                            {service.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1.7rem] bg-gradient-to-br from-[#315efb] to-[#082a5c] p-4 text-white shadow-[0_18px_50px_-35px_rgba(8,42,92,0.75)]">
                    <p className="type-meta font-normal uppercase tracking-[0.24em] text-blue-100">Need expert help?</p>
                    <p className="mt-2 text-sm leading-6 text-blue-100/90">
                      Push people toward the same high-trust service flow used on the website.
                    </p>
                    <Button asChild className="mt-4 h-11 w-full rounded-2xl bg-white text-[#315efb] hover:bg-white/95">
                      <Link href="/expert-consultation">Book a consultation</Link>
                    </Button>
                  </div>
                </div>

                <BottomNav active="services" />
              </div>
            </PhoneFrame>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="type-meta font-normal uppercase tracking-[0.28em] text-slate-400">Screen 08</p>
                <h3 className="mt-1 text-xl font-normal tracking-tight text-slate-950">Account and settings</h3>
              </div>
              <ScreenTag label="Profile" />
            </div>
            <PhoneFrame>
              <div className="flex h-full flex-col bg-white">
                <StatusBar />
                <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-3 scrollbar-hide-mobile">
                  <PhoneHeader
                    title="My account"
                    subtitle="Identity, preferences, documents, and support in a clean mobile profile screen."
                    icon={UserCircle2}
                    accent="blue"
                  />

                  <div className="rounded-[1.7rem] bg-slate-50 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-[#315efb] to-[#082a5c] text-2xl font-normal text-white shadow-lg shadow-blue-500/20">
                        A
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-normal text-slate-950">Arjun Mehta</p>
                          <Badge className="rounded-full bg-emerald-50 px-2.5 py-1 type-meta text-emerald-700 hover:bg-emerald-50">
                            Verified
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">arjun@example.com</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <StatPill label="Filing status" value="In progress" tone="blue" />
                    <StatPill label="Docs" value="8 stored" tone="emerald" />
                  </div>

                  <div className="space-y-2">
                    {[
                      ["Dashboard", LayoutDashboard],
                      ["Notifications", Bell],
                      ["Security", ShieldCheck],
                      ["Preferences", Settings],
                    ].map(([label, Icon]) => {
                      const TypedIcon = Icon as typeof LayoutDashboard;
                      return (
                        <div key={String(label)} className="flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-slate-50 p-2 text-[#315efb]">
                              <TypedIcon className="h-4 w-4" />
                            </div>
                            <p className="text-sm font-normal text-slate-950">{String(label)}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300" />
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <LockKeyhole className="h-5 w-5 text-[#315efb]" />
                      <div>
                        <p className="text-sm font-normal text-slate-950">Security and help</p>
                        <p className="text-xs text-slate-500">Change password, sign out, and reach support quickly.</p>
                      </div>
                    </div>
                    <Button className="mt-4 h-11 w-full rounded-2xl bg-blue-700 font-normal text-white hover:bg-[#315efb]">
                      Sign out
                    </Button>
                  </div>
                </div>

                <BottomNav active="account" />
              </div>
            </PhoneFrame>
          </div>
        </div>
      </section>
    </main>
  );
}
