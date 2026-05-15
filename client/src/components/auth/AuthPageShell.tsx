import { type ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, CheckCircle2, FileText } from 'lucide-react';
import BrandLockup from '@/components/ui/brand-lockup';

type PanelItem = { label: string; icon?: any };

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
  panelItems?: PanelItem[];
  primaryLink: {
    href: string;
    label: string;
    text: string;
  };
};

const defaultRequiredDocuments = [
  'PAN card',
  'Aadhaar linked mobile',
  'Form 16',
  'AIS / Form 26AS',
  'Bank account details',
  'Deduction proofs',
];

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

      <div className="h-11 rounded-lg bg-[#315efb]/15" />
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
  panelItems,
  primaryLink,
}: AuthPageShellProps) {
  const items: PanelItem[] = panelItems || defaultRequiredDocuments.map(d => ({ label: d }));

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100 p-0 text-slate-950 sm:p-3 lg:h-screen">
      <div className="mx-auto grid min-h-screen w-full min-w-0 max-w-[1120px] overflow-hidden bg-white shadow-none sm:min-h-[calc(100vh-1.5rem)] sm:rounded-xl sm:shadow-[0_30px_90px_-70px_rgba(15,23,42,0.7)] lg:h-full lg:min-h-0 lg:grid-cols-[minmax(380px,1.05fr)_minmax(0,0.95fr)]">
        <section className="flex min-h-screen w-full min-w-0 items-start justify-center overflow-y-auto bg-white px-4 py-5 sm:min-h-[calc(100vh-1.5rem)] sm:px-6 lg:h-full lg:min-h-0 lg:px-10 xl:px-14">
          <div className="w-full min-w-0 max-w-[430px] py-0 sm:py-2">
            <header className="mb-6 flex items-center justify-between gap-3">
              <Link
                href="/"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#315efb] hover:text-[#315efb]"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <p className="text-right text-xs font-bold leading-5 text-slate-500 sm:text-sm">
                {primaryLink.text}{' '}
                <Link
                  href={primaryLink.href}
                  className="font-black text-[#315efb] hover:text-[#06439f]"
                >
                  {primaryLink.label}
                </Link>
              </p>
            </header>

            <div className="mb-5 flex items-center gap-3">
              <BrandLockup
                logoSize="sm"
                wordmarkSize="sm"
                badge="ERI Ready"
                compact
              />
            </div>

            <div className="mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:mb-8">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#315efb] sm:text-xs">
                {eyebrow}
              </p>
              <h1 className="mt-1 text-[28px] font-black leading-tight text-slate-950 sm:text-[34px]">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>

            {notice && (
              <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950 sm:mb-6">
                <p className="font-black">{notice.title}</p>
                <p className="mt-1 text-blue-800">{notice.message}</p>
              </div>
            )}

            <div className="w-full min-w-0 overflow-visible">{children}</div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 lg:hidden">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#315efb]">
                {panelTitle}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {items.slice(0, 4).map((item) => (
                  <div
                    key={item.label}
                    className="flex min-h-8 items-center gap-2 text-xs font-bold text-slate-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="relative hidden min-h-screen overflow-hidden bg-slate-950 px-8 py-6 text-white sm:min-h-[calc(100vh-1.5rem)] lg:block lg:h-full lg:min-h-0">
          <div className="relative z-10 flex h-full min-h-0 flex-col justify-center">
            <div className="mx-auto w-full max-w-[420px]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-8 text-white shadow-2xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-200">
                      Information Panel
                    </p>
                    <h2 className="mt-2 text-2xl font-black leading-tight">{panelTitle}</h2>
                    <p className="mt-2 text-sm leading-6 text-blue-100/80">{panelDescription}</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-3">
                  {items.map((item) => {
                    const Icon = item.icon || CheckCircle2;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                      >
                        <Icon className="h-5 w-5 shrink-0 text-emerald-400" />
                        <span className="text-sm font-bold">{item.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-200">
                    Workflow
                  </p>
                  <div className="mt-4 grid gap-3">
                    {['Sign in securely', 'Review your workspace', 'Continue filing or service work'].map((step, index) => (
                      <div key={step} className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-black text-slate-950">
                          {index + 1}
                        </div>
                        <span className="text-sm font-bold text-slate-100">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
