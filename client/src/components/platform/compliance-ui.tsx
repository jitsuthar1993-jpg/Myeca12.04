import type React from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Bot,
  Building2,
  Calculator,
  CalendarDays,
  FileText,
  FolderOpen,
  Home,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCircle,
  WalletCards,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export type ComplianceStatus =
  | "not_started"
  | "in_progress"
  | "action_required"
  | "ai_validation"
  | "ca_review"
  | "submitted"
  | "filed"
  | "registered"
  | "refund_processed"
  | "failed";

const statusTone: Record<ComplianceStatus, string> = {
  not_started: "bg-slate-100 text-slate-700 border-slate-200",
  in_progress: "bg-blue-50 text-blue-800 border-blue-200",
  action_required: "bg-amber-50 text-amber-900 border-amber-200",
  ai_validation: "bg-cyan-50 text-cyan-800 border-cyan-200",
  ca_review: "bg-indigo-50 text-indigo-800 border-indigo-200",
  submitted: "bg-violet-50 text-violet-800 border-violet-200",
  filed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  registered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  refund_processed: "bg-green-50 text-green-800 border-green-200",
  failed: "bg-red-50 text-red-800 border-red-200",
};

const statusLabel: Record<ComplianceStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  action_required: "Action required",
  ai_validation: "AI validation",
  ca_review: "CA review",
  submitted: "Submitted",
  filed: "Filed",
  registered: "Registered",
  refund_processed: "Refund processed",
  failed: "Failed",
};

export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "File ITR", href: "/itr/filing", icon: FileText },
  { label: "Documents", href: "/documents", icon: FolderOpen },
  { label: "Tax Tools", href: "/calculators", icon: Calculator },
  { label: "AI Assistant", href: "/tax-assistant", icon: Bot },
  { label: "Services", href: "/services", icon: WalletCards },
  { label: "Business", href: "/business/dashboard", icon: Building2 },
  { label: "vCFO", href: "/business/virtual-cfo", icon: BarChart3 },
];

export const serviceStatuses = [
  { label: "Documents Uploaded", status: "filed" as ComplianceStatus },
  { label: "AI Validation", status: "ai_validation" as ComplianceStatus },
  { label: "CA Review", status: "ca_review" as ComplianceStatus },
  { label: "e-Filed", status: "not_started" as ComplianceStatus },
];

export const complianceDeadlines = [
  { label: "GSTR-3B", date: "20 Apr", status: "action_required" as ComplianceStatus },
  { label: "TDS Q4", date: "31 May", status: "in_progress" as ComplianceStatus },
  { label: "ITR Filing", date: "31 Jul", status: "not_started" as ComplianceStatus },
  { label: "Advance Tax", date: "15 Jun", status: "submitted" as ComplianceStatus },
];

export const dashboardInsights = [
  "We found a likely HRA claim opportunity. Add rent receipts to estimate additional savings.",
  "Your Form 16 and AIS values should be reconciled before final CA review.",
  "Based on your profile, ITR-2 may be better if you have equity capital gains.",
];

export const formatInr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: ComplianceStatus;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
        statusTone[status],
        className,
      )}
    >
      {label || statusLabel[status]}
    </span>
  );
}

export function MyeCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(0,48,135,0.45)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "amber" | "slate";
}) {
  const tones = {
    blue: "bg-blue-50 text-[#003087]",
    green: "bg-emerald-50 text-emerald-800",
    amber: "bg-amber-50 text-amber-900",
    slate: "bg-slate-100 text-slate-800",
  };

  return (
    <MyeCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{helper}</p>
        </div>
        <div className={cn("rounded-2xl p-3", tones[tone])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </MyeCard>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#0050b5]">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-2xl text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProgressTimeline({
  items,
}: {
  items: Array<{ label: string; status: ComplianceStatus }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {items.map((item, index) => {
        const complete = ["filed", "registered", "refund_processed", "submitted"].includes(item.status);
        return (
          <div key={item.label} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div
              className={cn(
                "mb-3 flex h-9 w-9 items-center justify-center rounded-full text-sm font-black",
                complete ? "bg-emerald-700 text-white" : "bg-white text-[#003087] ring-1 ring-slate-200",
              )}
            >
              {index + 1}
            </div>
            <p className="font-bold text-slate-950">{item.label}</p>
            <StatusBadge status={item.status} className="mt-3" />
          </div>
        );
      })}
    </div>
  );
}

export function TrustStrip() {
  return (
    <div className="grid gap-3 text-sm sm:grid-cols-3">
      {[
        "Clerk-secured identity",
        "Private Blob document vault",
        "CA-reviewed compliance",
      ].map((item) => (
        <div
          key={item}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white/90 backdrop-blur"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-200" />
          {item}
        </div>
      ))}
    </div>
  );
}

export function ComplianceShell({
  children,
  active,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode;
  active?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f9fd] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-black text-[#003087]">
            <Logo size="sm" />
            <span>MyeCA</span>
          </Link>
          <div className="hidden flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 lg:flex">
            <Search className="mr-2 h-4 w-4" />
            Search filings, documents, deadlines, services...
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              <CalendarDays className="h-4 w-4" />
              Deadlines
            </Button>
            <Button variant="outline" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Menu" className="lg:hidden">
              <Menu className="h-4 w-4" />
            </Button>
            <UserCircle className="hidden h-9 w-9 text-[#003087] sm:block" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[280px_1fr]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] border-r border-slate-200/80 bg-white/75 p-4 lg:block">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.href || active === item.label;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                    isActive
                      ? "bg-[#003087] text-white shadow-lg shadow-blue-950/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#003087]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 rounded-[24px] bg-[#003087] p-5 text-white">
            <Sparkles className="h-6 w-6 text-emerald-200" />
            <p className="mt-3 text-sm font-black">AI compliance nudge</p>
            <p className="mt-2 text-sm text-white/75">
              Upload Form 16 and AIS together to reduce manual review time.
            </p>
          </div>
        </aside>

        <main className="min-w-0 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 rounded-[32px] bg-gradient-to-br from-[#003087] via-[#0646b2] to-[#082a5c] p-6 text-white shadow-[0_30px_90px_-50px_rgba(0,48,135,0.75)] md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">
                MyeCA compliance cockpit
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
              {subtitle && <p className="mt-3 max-w-3xl text-blue-50/90">{subtitle}</p>}
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-2xl backdrop-blur lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = active === item.href || active === item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-bold",
                isActive ? "bg-blue-50 text-[#003087]" : "text-slate-500",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function UploadDropzone({
  onClick,
  label = "Upload document",
}: {
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-blue-200 bg-blue-50/60 p-8 text-center transition hover:border-[#003087] hover:bg-blue-50"
    >
      <div className="rounded-2xl bg-white p-4 text-[#003087] shadow-sm transition group-hover:-translate-y-1">
        <Upload className="h-8 w-8" />
      </div>
      <p className="mt-4 text-lg font-black text-slate-950">{label}</p>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Drag and drop PDF, image, or spreadsheet files. Private files are served only through
        authenticated API checks before Blob access.
      </p>
    </button>
  );
}
