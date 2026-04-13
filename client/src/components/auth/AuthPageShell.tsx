import { type ReactNode } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  IndianRupee,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import Logo from '@/components/ui/logo';

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
  { label: 'Form 16', value: 'Ready', icon: FileText },
  { label: 'Refund', value: 'Tracked', icon: IndianRupee },
  { label: 'CA review', value: 'Included', icon: ShieldCheck },
];

const serviceItems = ['ITR-1', 'ITR-2', 'Form 16', 'AIS', 'Refund'];

export const clerkAuthAppearance = {
  elements: {
    rootBox: 'w-full max-w-full min-w-0',
    card: 'w-full max-w-full min-w-0 border-0 bg-transparent p-0 shadow-none',
    header: 'hidden',
    main: 'w-full max-w-full min-w-0 gap-4',
    socialButtons: 'w-full max-w-full min-w-0',
    socialButtonsBlockButton:
      'h-11 w-full max-w-full rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-950 shadow-none transition hover:border-[#003087] hover:bg-[#f4f8ff]',
    socialButtonsBlockButtonText: 'font-bold',
    dividerLine: 'bg-slate-200',
    dividerText: 'text-xs font-bold uppercase text-slate-500',
    form: 'w-full max-w-full min-w-0',
    formField: 'w-full max-w-full min-w-0',
    formFieldLabel: 'text-sm font-bold text-slate-800',
    formFieldInput:
      'h-11 w-full max-w-full rounded-lg border-slate-300 bg-white text-slate-950 shadow-none focus:border-[#003087] focus:ring-[#003087]/20',
    formButtonPrimary:
      'h-11 w-full rounded-lg bg-[#003087] text-sm font-black text-white shadow-none transition hover:bg-[#06439f] focus:ring-2 focus:ring-[#003087]/25',
    footer: 'rounded-lg border border-slate-200 bg-slate-50 px-4 py-3',
    footerActionText: 'text-sm text-slate-600',
    footerActionLink: 'text-sm font-black text-[#003087] hover:text-[#06439f]',
    identityPreviewText: 'text-slate-700',
    formFieldAction: 'font-bold text-[#003087]',
    otpCodeFieldInput: 'rounded-lg border-slate-300',
    alert: 'rounded-lg border border-rose-200 bg-rose-50 text-rose-900',
  },
  variables: {
    colorPrimary: '#003087',
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    colorInputText: '#0f172a',
    borderRadius: '0.5rem',
    fontFamily: 'Inter, Plus Jakarta Sans, system-ui, sans-serif',
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
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#dbe8ff] p-0 text-slate-950 sm:p-3">
      <div className="mx-auto grid min-h-screen w-full min-w-0 max-w-[1440px] overflow-hidden bg-white shadow-[0_30px_90px_-70px_rgba(0,48,135,0.75)] sm:min-h-[calc(100vh-1.5rem)] sm:rounded-lg lg:grid-cols-[minmax(420px,0.94fr)_minmax(0,1.06fr)]">
        <section className="flex min-h-screen w-full min-w-0 items-center justify-center bg-white px-4 py-5 sm:min-h-[calc(100vh-1.5rem)] sm:px-8 lg:px-14 xl:px-20">
          <div className="w-full min-w-0 max-w-[410px]">
            <header className="mb-10 flex items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#003087] hover:text-[#003087]"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <p className="text-xs font-bold text-slate-500 sm:text-sm">
                {primaryLink.text}{' '}
                <Link
                  href={primaryLink.href}
                  className="font-black text-[#003087] hover:text-[#06439f]"
                >
                  {primaryLink.label}
                </Link>
              </p>
            </header>

            <div className="mb-8 flex items-center gap-3">
              <Logo size="sm" />
              <span className="font-black text-[#003087]">MyeCA.in</span>
              <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                ERI Ready
              </span>
            </div>

            <div className="mb-3">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#003087]">
                {eyebrow}
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>

            {notice && (
              <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
                <p className="font-black">{notice.title}</p>
                <p className="mt-1 text-blue-800">{notice.message}</p>
              </div>
            )}

            <div className="w-full min-w-0 overflow-visible">{children}</div>

            <p className="sr-only">
              {primaryLink.text} <Link href={primaryLink.href}>{primaryLink.label}</Link>
            </p>
          </div>
        </section>

        <aside className="relative hidden min-h-screen overflow-hidden bg-[#5267f6] px-10 py-10 text-white sm:min-h-[calc(100vh-1.5rem)] lg:block">
          <div className="absolute inset-x-0 top-0 h-28 -skew-y-6 bg-[#25359f]" />
          <div className="absolute bottom-0 left-0 h-72 w-[75%] translate-y-12 -skew-y-12 bg-[#58a2f6]/80" />
          <div className="absolute bottom-0 right-0 h-[460px] w-[58%] translate-y-20 skew-y-12 bg-[#3c86ed]/75" />
          <div className="absolute right-0 top-48 h-48 w-72 -skew-y-12 bg-[#62b7ff]/65" />

          <div className="relative z-10 flex h-full min-h-[calc(100vh-5rem)] flex-col justify-center">
            <div className="mx-auto w-full max-w-[520px]">
              <div className="mb-8 ml-auto w-48 rounded-lg bg-white p-5 text-slate-950 shadow-[0_28px_80px_-50px_rgba(15,23,42,0.75)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-amber-600">Refund estimate</p>
                    <p className="mt-2 text-3xl font-black">₹18,460</p>
                  </div>
                  <img
                    src="/blog_hero_illustration.png"
                    alt="Tax filing workspace"
                    className="h-12 w-12 shrink-0 object-contain"
                  />
                </div>
                <div className="mt-7 flex h-12 items-end gap-2">
                  {[30, 48, 26, 36, 58, 42, 52].map((height, index) => (
                    <span
                      key={index}
                      className="w-full rounded-lg bg-[#5267f6]"
                      style={{ height }}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-7 w-full max-w-[430px] rounded-lg bg-white p-6 text-slate-950 shadow-[0_28px_80px_-50px_rgba(15,23,42,0.75)]">
                <div className="flex items-start gap-5">
                  <div className="space-y-3 pt-1">
                    <span className="block h-1.5 w-16 rounded-lg bg-[#5267f6]" />
                    <span className="block h-1.5 w-28 rounded-lg bg-slate-200" />
                    <span className="block h-1.5 w-20 rounded-lg bg-slate-200" />
                    <span className="block h-1.5 w-32 rounded-lg bg-slate-200" />
                  </div>
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                      <LockKeyhole className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-black">{panelTitle}</h2>
                    <p className="mt-3 max-w-[230px] text-sm leading-6 text-slate-500">
                      {panelDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {trustItems.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-lg bg-white/95 p-4 text-slate-950 shadow-sm">
                    <Icon className="h-5 w-5 text-[#003087]" />
                    <p className="mt-3 text-xs font-bold uppercase text-slate-500">{label}</p>
                    <p className="mt-1 text-base font-black">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-lg bg-white/95 p-5 text-slate-950 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-black">ITR filing flow</p>
                  <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                    Secure
                  </span>
                </div>

                <div className="space-y-3">
                  {steps.map(
                    ({ title: stepTitle, description: stepDescription, icon: Icon }, index) => (
                      <div key={stepTitle} className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[#003087]">
                          {index === steps.length - 1 ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black">{stepTitle}</p>
                          <p className="text-xs leading-5 text-slate-500">{stepDescription}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <footer className="mt-6 flex items-center justify-between gap-4 text-sm font-bold text-white/85">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-200" />
                  ITR data stays protected.
                </span>
                <span className="hidden gap-2 xl:inline-flex">
                  {serviceItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg bg-white/15 px-2 py-1 text-xs text-white"
                    >
                      {item}
                    </span>
                  ))}
                </span>
              </footer>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
