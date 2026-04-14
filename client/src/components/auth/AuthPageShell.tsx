import { type ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, CheckCircle2, FileText } from 'lucide-react';
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
};

const requiredDocuments = [
  'PAN card',
  'Aadhaar linked mobile',
  'Form 16',
  'AIS / Form 26AS',
  'Bank account details',
  'Deduction proofs',
];

export const clerkAuthAppearance = {
  elements: {
    rootBox: 'w-full max-w-full min-w-0 overflow-visible',
    card: 'w-full max-w-full min-w-0 overflow-visible border-0 bg-transparent p-0 shadow-none',
    header: 'hidden',
    main: 'w-full max-w-full min-w-0 overflow-visible gap-3',
    socialButtons: 'w-full max-w-full min-w-0',
    socialButtonsBlockButton:
      'box-border h-10 w-full max-w-full rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-950 shadow-none transition hover:border-[#003087] hover:bg-[#f4f8ff]',
    socialButtonsBlockButtonText: 'font-bold',
    dividerLine: 'bg-slate-200',
    dividerText: 'text-xs font-bold uppercase text-slate-500',
    form: 'w-full max-w-full min-w-0',
    formField: 'w-full max-w-full min-w-0',
    formFieldLabel: 'block overflow-visible text-sm font-bold leading-5 text-slate-800',
    formFieldInput:
      'box-border h-10 w-full max-w-full rounded-lg border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-none focus:border-[#003087] focus:ring-[#003087]/20',
    formButtonPrimary:
      'box-border h-10 w-full rounded-lg bg-[#003087] text-sm font-black text-white shadow-none transition hover:bg-[#06439f] focus:ring-2 focus:ring-[#003087]/25',
    footer: 'hidden',
    footerAction: 'hidden',
    footerActionText: 'hidden',
    footerActionLink: 'hidden',
    footerPages: 'hidden',
    footerPagesLink: 'hidden',
    badge: 'hidden',
    badge__developmentMode: 'hidden',
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
}: AuthPageShellProps) {
  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#dbe8ff] p-0 text-slate-950 sm:p-2 lg:h-screen">
      <div className="mx-auto grid min-h-screen w-full min-w-0 max-w-[1080px] overflow-hidden bg-white shadow-[0_30px_90px_-70px_rgba(0,48,135,0.75)] sm:min-h-[calc(100vh-1rem)] sm:rounded-lg lg:h-full lg:min-h-0 lg:grid-cols-[minmax(360px,0.86fr)_minmax(0,0.9fr)]">
        <section className="flex min-h-screen w-full min-w-0 items-start justify-center overflow-y-auto bg-white px-4 py-3 sm:min-h-[calc(100vh-1rem)] sm:px-6 lg:h-full lg:min-h-0 lg:px-10 xl:px-14">
          <div className="w-full min-w-0 max-w-[365px] py-2">
            <header className="mb-3 flex items-center justify-between gap-4">
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

            <div className="mb-3 flex items-center gap-3">
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
              <h1 className="mt-1 text-2xl font-black leading-tight text-slate-950 sm:text-[30px]">
                {title}
              </h1>
              <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
            </div>

            {notice && (
              <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
                <p className="font-black">{notice.title}</p>
                <p className="mt-1 text-blue-800">{notice.message}</p>
              </div>
            )}

            <div className="w-full min-w-0 overflow-visible">{children}</div>

            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 lg:hidden">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#003087]">
                Required documents
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {requiredDocuments.slice(0, 4).map((document) => (
                  <div
                    key={document}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>{document}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="sr-only">
              {primaryLink.text} <Link href={primaryLink.href}>{primaryLink.label}</Link>
            </p>
          </div>
        </section>

        <aside className="relative hidden min-h-screen overflow-hidden bg-[#5267f6] px-8 py-6 text-white sm:min-h-[calc(100vh-1rem)] lg:block lg:h-full lg:min-h-0">
          <div className="absolute inset-x-0 top-0 h-28 -skew-y-6 bg-[#25359f]" />
          <div className="absolute bottom-0 left-0 h-72 w-[75%] translate-y-12 -skew-y-12 bg-[#58a2f6]/80" />
          <div className="absolute bottom-0 right-0 h-[460px] w-[58%] translate-y-20 skew-y-12 bg-[#3c86ed]/75" />
          <div className="absolute right-0 top-48 h-48 w-72 -skew-y-12 bg-[#62b7ff]/65" />

          <div className="relative z-10 flex h-full min-h-0 flex-col justify-center">
            <div className="mx-auto w-full max-w-[420px]">
              <div className="rounded-lg bg-white p-6 text-slate-950 shadow-[0_28px_80px_-50px_rgba(15,23,42,0.75)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[#003087]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#003087]">
                      Required documents
                    </p>
                    <h2 className="mt-2 text-2xl font-black leading-tight">{panelTitle}</h2>
                    <p className="mt-2 text-sm leading-5 text-slate-500">{panelDescription}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  {requiredDocuments.map((document) => (
                    <div
                      key={document}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-sm font-bold text-slate-800">{document}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
