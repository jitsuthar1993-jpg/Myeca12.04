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
  { label: "Clerk-secured", value: "Identity", icon: ShieldCheck },
  { label: "Encrypted", value: "Vault", icon: LockKeyhole },
  { label: "Deadline aware", value: "Tasks", icon: CalendarCheck2 },
];

const serviceItems = ["ITR", "GST", "Notice", "Payroll"];

export const clerkAuthAppearance = {
  elements: {
    rootBox: "w-full",
    card: "w-full border-0 bg-transparent p-0 shadow-none",
    header: "hidden",
    main: "gap-4",
    socialButtonsBlockButton:
      "h-11 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-950 shadow-none transition hover:border-[#003087] hover:bg-[#f4f8ff]",
    socialButtonsBlockButtonText: "font-bold",
    dividerLine: "bg-slate-200",
    dividerText: "text-xs font-bold uppercase text-slate-500",
    formFieldLabel: "text-sm font-bold text-slate-800",
    formFieldInput:
      "h-11 rounded-lg border-slate-300 bg-white text-slate-950 shadow-none focus:border-[#003087] focus:ring-[#003087]/20",
    formButtonPrimary:
      "h-11 rounded-lg bg-[#003087] text-sm font-black text-white shadow-none transition hover:bg-[#06439f] focus:ring-2 focus:ring-[#003087]/25",
    footer: "rounded-lg border border-slate-200 bg-slate-50 px-4 py-3",
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
      className="min-h-[372px] animate-pulse space-y-4"
      aria-busy="true"
      aria-label="Preparing secure authentication"
    >
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
      <div className="h-10 rounded-lg border border-slate-200 bg-slate-50" />
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
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col">
        <header className="flex items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
          <Link href="/" className="inline-flex items-center gap-3 font-black text-[#003087]">
            <Logo size="sm" />
            <span>MyeCA.in</span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#003087] hover:text-[#003087]"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </header>

        <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_480px]">
          <section className="order-2 flex flex-col px-5 pb-6 sm:px-8 lg:order-1 lg:px-10">
            <div className="flex flex-1 items-center py-8 lg:py-10">
              <div className="grid w-full gap-8 xl:grid-cols-[minmax(0,0.9fr)_390px] xl:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">
                  <BadgeCheck className="h-4 w-4" />
                  CA-assisted tax workspace
                </div>

                <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.08] text-slate-950 lg:text-5xl">
                  {panelTitle}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                  {panelDescription}
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {trustItems.map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <Icon className="h-5 w-5 text-[#003087]" />
                      <p className="mt-3 text-xs font-bold uppercase text-slate-500">{label}</p>
                      <p className="mt-1 text-base font-black text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden xl:block">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_90px_-60px_rgba(15,23,42,0.65)]">
                  <div className="border-b border-slate-200 bg-[#003087] px-4 py-3 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black">Today in MyeCA</p>
                      <span className="rounded-lg bg-white/15 px-2 py-1 text-xs font-bold">
                        Secure
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <img
                      src="/blog_hero_illustration.png"
                      alt="Tax workspace illustration"
                      className="mx-auto h-44 w-44 object-contain"
                    />

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-slate-200 bg-[#f8fafc] p-3">
                        <p className="text-xs font-bold text-slate-500">Documents</p>
                        <p className="mt-1 text-2xl font-black text-slate-950">24</p>
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs font-bold text-amber-800">Due soon</p>
                        <p className="mt-1 text-2xl font-black text-amber-950">3</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {steps.map(({ title: stepTitle, description: stepDescription, icon: Icon }, index) => (
                        <div key={stepTitle} className="flex gap-3 border-t border-slate-100 pt-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[#003087]">
                            {index === steps.length - 1 ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Icon className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-950">{stepTitle}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              {stepDescription}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="hidden items-center justify-between gap-4 border-t border-slate-200 pt-4 text-sm font-bold text-slate-500 sm:flex">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              One secure account for every compliance workflow.
            </span>
            <span className="hidden gap-2 lg:inline-flex">
              {serviceItems.map((item) => (
                <span key={item} className="rounded-lg bg-white px-2 py-1 text-xs text-slate-600">
                  {item}
                </span>
              ))}
            </span>
          </footer>
        </section>

        <aside className="order-1 flex items-center justify-center border-y border-slate-200 bg-white px-5 py-8 sm:px-8 lg:order-2 lg:border-y-0 lg:border-l">
          <div className="w-full max-w-[420px]">
            <div className="mb-5">
              <p className="text-xs font-black uppercase text-[#003087]">{eyebrow}</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
            </div>

            {notice && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                <p className="font-black">{notice.title}</p>
                <p className="mt-1 text-blue-800">{notice.message}</p>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_28px_90px_-65px_rgba(0,48,135,0.95)]">
              {children}
            </div>

            <p className="mt-5 text-center text-sm text-slate-600">
              {primaryLink.text}{" "}
              <Link href={primaryLink.href} className="font-black text-[#003087] hover:text-[#06439f]">
                {primaryLink.label}
              </Link>
            </p>

            <div className="mt-6 rounded-lg border border-slate-200 bg-[#f8fafc] p-4">
              <div className="flex gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#003087]" />
                <p className="text-sm leading-6 text-slate-600">
                  Uploads, invoices, service history, and CA handoffs stay tied to the same Clerk
                  session.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
      </div>
    </main>
  );
}
