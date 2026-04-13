import { type ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Logo from "@/components/ui/logo";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  notice?: {
    title: string;
    message: string;
  } | null;
  panelTitle: string;
  panelDescription: string;
  primaryLink: {
    href: string;
    label: string;
    text: string;
  };
  steps: Array<{
    title: string;
    description: string;
    icon: LucideIcon;
  }>;
};

const trustItems = [
  { label: "Clerk-secured identity", icon: ShieldCheck },
  { label: "Protected document vault", icon: LockKeyhole },
  { label: "Deadline-aware dashboard", icon: CalendarCheck2 },
];

export const clerkAuthAppearance = {
  elements: {
    rootBox: "w-full",
    card: "w-full border-0 bg-transparent p-0 shadow-none",
    header: "hidden",
    main: "gap-5",
    socialButtonsBlockButton:
      "h-11 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-900 shadow-none transition hover:border-[#003087] hover:bg-slate-50",
    socialButtonsBlockButtonText: "font-bold",
    dividerLine: "bg-slate-200",
    dividerText: "text-xs font-bold uppercase text-slate-500",
    formFieldLabel: "text-sm font-bold text-slate-800",
    formFieldInput:
      "h-11 rounded-lg border-slate-300 bg-white text-slate-950 shadow-none focus:border-[#003087] focus:ring-[#003087]/20",
    formButtonPrimary:
      "h-11 rounded-lg bg-[#003087] text-sm font-black text-white shadow-none transition hover:bg-[#06439f] focus:ring-2 focus:ring-[#003087]/25",
    footer: "rounded-lg bg-slate-50 px-4 py-3",
    footerActionText: "text-sm text-slate-600",
    footerActionLink: "text-sm font-black text-[#003087] hover:text-[#06439f]",
    identityPreviewText: "text-slate-700",
    formFieldAction: "font-bold text-[#003087]",
    otpCodeFieldInput: "rounded-lg border-slate-300",
    alert: "rounded-lg border border-rose-200 bg-rose-50 text-rose-900",
  },
  variables: {
    colorPrimary: "#003087",
    colorText: "#0f172a",
    colorTextSecondary: "#475569",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    borderRadius: "0.5rem",
    fontFamily: "Inter, Plus Jakarta Sans, system-ui, sans-serif",
  },
};

export function AuthFormSkeleton() {
  return (
    <div
      className="min-h-[360px] animate-pulse space-y-5"
      aria-busy="true"
      aria-label="Preparing secure authentication"
    >
      <div className="space-y-2">
        <div className="h-4 w-28 rounded-lg bg-slate-200" />
        <div className="h-3 w-48 rounded-lg bg-slate-100" />
      </div>

      <div className="h-11 rounded-lg border border-slate-200 bg-slate-50" />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <div className="h-3 w-16 rounded-lg bg-slate-100" />
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-2">
        <div className="h-3 w-20 rounded-lg bg-slate-200" />
        <div className="h-11 rounded-lg border border-slate-200 bg-white" />
      </div>

      <div className="space-y-2">
        <div className="h-3 w-24 rounded-lg bg-slate-200" />
        <div className="h-11 rounded-lg border border-slate-200 bg-white" />
      </div>

      <div className="h-11 rounded-lg bg-[#003087]/15" />
      <div className="h-10 rounded-lg bg-slate-50" />
    </div>
  );
}

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  notice,
  panelTitle,
  panelDescription,
  primaryLink,
  steps,
}: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
        <section className="flex flex-col justify-between px-5 py-6 sm:px-8 lg:px-12">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-3 font-black text-[#003087]">
              <Logo size="sm" />
              <span>MyeCA.in</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-[#003087] hover:text-[#003087]"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </header>

          <div className="mx-auto w-full max-w-6xl py-10 lg:py-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">
                <BadgeCheck className="h-4 w-4" />
                CA-assisted tax workspace
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                {panelTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                {panelDescription}
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
              <div className="grid gap-3 sm:grid-cols-3">
                {trustItems.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <Icon className="h-5 w-5 text-[#003087]" />
                    <p className="mt-3 text-sm font-black text-slate-900">{label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-black text-slate-950">What happens next</p>
                <div className="mt-4 space-y-4">
                  {steps.map(({ title: stepTitle, description: stepDescription, icon: Icon }, index) => (
                    <div key={stepTitle} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[#003087]">
                        {index === steps.length - 1 ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-950">{stepTitle}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{stepDescription}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <footer className="hidden items-center gap-3 text-sm font-bold text-slate-500 sm:flex">
            <Sparkles className="h-4 w-4 text-amber-500" />
            ITR, GST, notices, payroll, and startup compliance in one secure account.
          </footer>
        </section>

        <aside className="flex items-center justify-center border-t border-slate-200 bg-white px-5 py-8 sm:px-8 lg:border-l lg:border-t-0">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#003087]">
                {eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
            </div>

            {notice && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                <p className="font-black">{notice.title}</p>
                <p className="mt-1 text-blue-800">{notice.message}</p>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-60px_rgba(0,48,135,0.8)]">
              {children}
            </div>

            <p className="mt-5 text-center text-sm text-slate-600">
              {primaryLink.text}{" "}
              <Link href={primaryLink.href} className="font-black text-[#003087] hover:text-[#06439f]">
                {primaryLink.label}
              </Link>
            </p>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#003087]" />
                <p className="text-sm leading-6 text-slate-600">
                  Your account keeps service history, uploads, invoices, and CA handoffs tied to the
                  same Clerk session.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
