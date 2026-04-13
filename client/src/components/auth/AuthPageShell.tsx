import { type ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
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
    rootBox: "w-full max-w-full min-w-0",
    card: "w-full max-w-full min-w-0 border-0 bg-transparent p-0 shadow-none",
    header: "hidden",
    main: "w-full max-w-full min-w-0 gap-4",
    socialButtons: "w-full max-w-full min-w-0",
    socialButtonsBlockButton:
      "h-11 w-full max-w-full rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-950 shadow-none transition hover:border-[#003087] hover:bg-[#f4f8ff]",
    socialButtonsBlockButtonText: "font-bold",
    dividerLine: "bg-slate-200",
    dividerText: "text-xs font-bold uppercase text-slate-500",
    form: "w-full max-w-full min-w-0",
    formField: "w-full max-w-full min-w-0",
    formFieldLabel: "text-sm font-bold text-slate-800",
    formFieldInput:
      "h-11 w-full max-w-full rounded-lg border-slate-300 bg-white text-slate-950 shadow-none focus:border-[#003087] focus:ring-[#003087]/20",
    formButtonPrimary:
      "h-11 w-full rounded-lg bg-[#003087] text-sm font-black text-white shadow-none transition hover:bg-[#06439f] focus:ring-2 focus:ring-[#003087]/25",
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
      className="min-h-[330px] animate-pulse space-y-4"
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
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f6f8fb] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full min-w-0 max-w-[1360px] overflow-x-hidden lg:grid-cols-[minmax(0,1fr)_minmax(440px,500px)]">
        <section className="hidden min-h-screen flex-col justify-between px-8 py-6 lg:flex xl:px-10">
          <header className="flex items-center justify-between gap-4">
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

          <div className="grid items-center gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">
                <BadgeCheck className="h-4 w-4" />
                CA-assisted tax workspace
              </div>

              <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.08] text-slate-950 xl:text-5xl">
                {panelTitle}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                {panelDescription}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
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

            <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_90px_-62px_rgba(15,23,42,0.7)] xl:block">
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
                  className="mx-auto h-32 w-32 object-contain"
                />

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 bg-[#f8fafc] p-3">
                    <p className="text-xs font-bold text-slate-500">Documents</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">24</p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-bold text-amber-800">Due soon</p>
                    <p className="mt-1 text-2xl font-black text-amber-950">3</p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {steps.slice(0, 2).map(({ title: stepTitle, icon: Icon }, index) => (
                    <div key={stepTitle} className="flex items-center gap-3 border-t border-slate-100 pt-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[#003087]">
                        {index === steps.length - 1 ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <p className="text-sm font-black text-slate-950">{stepTitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <footer className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4 text-sm font-bold text-slate-500">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              One secure account for every compliance workflow.
            </span>
            <span className="hidden gap-2 xl:inline-flex">
              {serviceItems.map((item) => (
                <span key={item} className="rounded-lg bg-white px-2 py-1 text-xs text-slate-600">
                  {item}
                </span>
              ))}
            </span>
          </footer>
        </section>

        <aside className="flex min-h-screen w-full min-w-0 items-center justify-center bg-white px-4 py-4 sm:px-6 lg:border-l lg:border-slate-200">
          <div className="w-full min-w-0 max-w-[440px]">
            <header className="mb-5 flex items-center justify-between gap-4 lg:hidden">
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

            <div className="mb-3">
              <p className="text-xs font-black uppercase text-[#003087]">{eyebrow}</p>
              <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>

            {notice && (
              <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
                <p className="font-black">{notice.title}</p>
                <p className="mt-1 text-blue-800">{notice.message}</p>
              </div>
            )}

            <div className="w-full min-w-0 overflow-visible rounded-lg border border-slate-200 bg-white p-2.5 shadow-[0_28px_90px_-65px_rgba(0,48,135,0.95)] sm:p-4">
              {children}
            </div>

            <p className="sr-only">
              {primaryLink.text}{" "}
              <Link href={primaryLink.href}>{primaryLink.label}</Link>
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
