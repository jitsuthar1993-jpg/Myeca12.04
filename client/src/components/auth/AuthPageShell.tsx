import { type ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, CheckCircle2, FileText, ShieldCheck, TrendingUp } from 'lucide-react';
import BrandLockup from '@/components/ui/brand-lockup';
import { cn } from '@/lib/utils';

type PanelItem = { label: string; icon?: any };

type AuthPageShellProps = {
  variant?: 'split' | 'compact';
  eyebrow?: string;
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
  variant = 'split',
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

  if (variant === 'compact') {
    return (
      <main className="flex min-h-screen w-full max-w-full items-center justify-center overflow-x-hidden bg-[#f7f8fa] px-4 py-3 text-slate-950 sm:px-6 sm:py-5">
        <div className="w-full max-w-[520px]">
          <header className="mb-3 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-[#315efb] hover:text-[#315efb]"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <p className="text-right text-xs font-semibold leading-5 text-slate-500 sm:text-sm">
              {primaryLink.text}{' '}
              <Link
                href={primaryLink.href}
                className="font-bold text-[#315efb] hover:text-[#06439f]"
              >
                {primaryLink.label}
              </Link>
            </p>
          </header>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.8)] sm:p-6">
            <div className="mb-5 flex justify-center">
              <BrandLockup
                logoSize="sm"
                wordmarkSize="md"
                compact
              />
            </div>

            <div className="mb-4 text-center">
              {eyebrow ? (
                <p className="type-meta font-bold uppercase text-emerald-700">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className={cn("text-2xl font-black leading-tight text-slate-950 sm:text-3xl", eyebrow && "mt-2")}>
                {title}
              </h1>
              {description ? (
                <p className="mt-2 text-sm leading-5 text-slate-600">{description}</p>
              ) : null}
            </div>

            {notice && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
                <p className="font-black">{notice.title}</p>
                <p className="mt-1 text-blue-800">{notice.message}</p>
              </div>
            )}

            <div className="w-full min-w-0">{children}</div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f7f8fa] text-slate-950 lg:h-screen">
      <div className="mx-auto grid min-h-screen w-full min-w-0 max-w-[1120px] overflow-hidden bg-white shadow-none lg:h-screen lg:min-h-0 lg:grid-cols-[minmax(380px,0.9fr)_minmax(0,1.1fr)]">
        <section className="order-2 flex min-h-screen w-full min-w-0 items-start justify-center overflow-y-auto bg-white px-4 py-5 sm:px-6 lg:order-1 lg:h-screen lg:min-h-0 lg:px-10">
          <div className="w-full min-w-0 max-w-[420px] py-0 sm:py-4">
            <header className="mb-8 flex items-center justify-between gap-3">
              <Link
                href="/"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-[#315efb] hover:text-[#315efb]"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <p className="text-right text-xs font-semibold leading-5 text-slate-500 sm:text-sm">
                {primaryLink.text}{' '}
                <Link
                  href={primaryLink.href}
                  className="font-bold text-[#315efb] hover:text-[#06439f]"
                >
                  {primaryLink.label}
                </Link>
              </p>
            </header>

            <div className="mb-7 flex items-center gap-3">
              <BrandLockup
                logoSize="sm"
                wordmarkSize="sm"
                compact
              />
            </div>

            <div className="mb-7">
              {eyebrow ? (
                <p className="type-meta font-bold uppercase text-emerald-700">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className={cn("type-page-title font-black text-slate-950", eyebrow && "mt-2")}>
                {title}
              </h1>
              <p className="type-support mt-3 text-slate-600">{description}</p>
            </div>

            {notice && (
              <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950 sm:mb-6">
                <p className="font-black">{notice.title}</p>
                <p className="mt-1 text-blue-800">{notice.message}</p>
              </div>
            )}

            <div className="w-full min-w-0 overflow-visible">{children}</div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 lg:hidden">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                {panelTitle}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {items.slice(0, 4).map((item) => (
                  <div
                    key={item.label}
                    className="flex min-h-8 items-center gap-2 text-xs font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="relative order-1 hidden min-h-screen overflow-hidden border-l border-slate-200 bg-[#f7f8fa] px-8 py-8 text-slate-950 lg:block lg:h-screen lg:min-h-0 lg:overflow-y-auto">
          <div className="relative z-10 flex min-h-full flex-col">
            <div className="flex items-center justify-between gap-3">
              <BrandLockup
                logoSize="sm"
                wordmarkSize="sm"
                badge="MyeCA"
                compact
              />
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                Secure
              </div>
            </div>

            <div className="flex flex-1 items-center py-10">
              <div className="mx-auto w-full max-w-[430px]">
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Secure workspace
                  </p>
                  <h2 className="type-section-title mt-3 font-black text-slate-950">
                    Simple access to your tax numbers.
                  </h2>
                  <p className="type-support mt-3 text-slate-600">
                    Filing status, refund estimates, documents, and review updates stay organized after sign in.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-56px_rgba(15,23,42,0.75)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                        {panelTitle}
                      </p>
                      <h3 className="mt-2 text-xl font-black leading-tight text-slate-950">Workspace snapshot</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{panelDescription}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-2">
                    {items.map((item) => {
                      const Icon = item.icon || CheckCircle2;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0 text-emerald-700" />
                            <span className="truncate text-sm font-semibold text-slate-800">{item.label}</span>
                          </span>
                          <span className="text-xs font-semibold text-slate-400">Ready</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Progress</p>
                    <div className="mt-3 flex items-end gap-2">
                      <span className="text-3xl font-black text-slate-950">72%</span>
                      <TrendingUp className="mb-1 h-4 w-4 text-emerald-700" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Next</p>
                    <p className="mt-3 text-sm font-bold leading-5 text-slate-950">Review documents</p>
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
