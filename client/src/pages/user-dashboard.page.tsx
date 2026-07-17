import { Layout } from '@/components/admin/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  MessageCircle,
  AlertCircle,
  Plus,
  Search,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { buildDocumentReadiness, buildFilingTimeline, type DashboardTaxReturn } from '@/lib/user-dashboard-workspace';
import { buildClientActionPlan } from '@/lib/client-action-plan';

type DashboardService = {
  id: string;
  serviceId?: string;
  serviceTitle?: string;
  serviceCategory?: string;
  paymentAmount?: number | string | null;
  paymentStatus?: string | null;
  status?: string | null;
  assignedCaId?: string | null;
  assignedCaName?: string | null;
  assignedCaEmail?: string | null;
  metadata?: Record<string, any>;
};

type DashboardNextAction = {
  id: string;
  label: string;
  detail: string;
  href: string;
  source?: 'reminder' | 'payment' | 'document' | 'ca' | 'service' | 'filing' | 'empty';
  tone?: 'amber' | 'blue' | 'emerald' | 'slate';
};

type DashboardData = {
  stats?: {
    totalReturns?: number;
    documentsUploaded?: number;
    pendingTasks?: number;
    savedAmount?: number;
  };
  nextActions?: DashboardNextAction[];
  activeServices?: DashboardService[];
  taxReturns?: DashboardTaxReturn[];
};

function assignedCaLabel(service: DashboardService) {
  const metadata = service.metadata || {};
  const assignedCa = metadata.assignedCa;

  if (service.assignedCaName) return service.assignedCaName;
  if (typeof assignedCa === 'string' && assignedCa.trim()) return assignedCa.trim();
  if (assignedCa?.name) return assignedCa.name;
  if (metadata.assignedCaName) return metadata.assignedCaName;
  return 'CA not assigned yet';
}

function serviceStatus(service: DashboardService) {
  return service.status || 'pending';
}

function nextActionIcon(source: DashboardNextAction['source']) {
  if (source === 'document' || source === 'filing') return FileText;
  if (source === 'payment' || source === 'ca') return ShieldCheck;
  if (source === 'service') return Briefcase;
  if (source === 'empty') return Target;
  return Clock;
}

function nextActionTone(tone: DashboardNextAction['tone']) {
  if (tone === 'amber') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (tone === 'emerald') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (tone === 'slate') return 'border-slate-200 bg-slate-50 text-slate-700';
  return 'border-blue-200 bg-blue-50 text-blue-700';
}

export default function UserDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/user/dashboard'],
    queryFn: async () => {
      const response = await apiRequest('/api/user/dashboard');
      return response.json();
    },
  });

  const activeServices = data?.activeServices || [];
  const nextActions = data?.nextActions || [];
  const stats = data?.stats || {};
  const latestReturn = data?.taxReturns?.[0];
  const documentReadiness = buildDocumentReadiness({
    documentsUploaded: stats.documentsUploaded ?? 0,
    taxReturn: latestReturn,
  });
  const filingTimeline = latestReturn ? buildFilingTimeline(latestReturn) : [];
  const actionPlan = buildClientActionPlan({
    latestReturn,
    documentReadiness,
    activeServices,
  });
  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';

  return (
    <Layout>
      <div className="space-y-5 pb-12 md:space-y-6">
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="space-y-2">
            <h1 className="type-page-title text-slate-900">Welcome, {displayName}</h1>
            <p className="type-body max-w-2xl font-medium text-slate-500">
              Track active filings, document progress, assigned CA support, and service payments from one workspace.
            </p>
          </div>
          <Link href="/dashboard/services" className="w-full md:w-auto">
            <Button className="h-11 w-full rounded-lg bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800 md:h-10 md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Filing
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
          {[
            { label: 'Returns', value: stats.totalReturns ?? 0, icon: FileText, color: 'blue' },
            { label: 'Documents', value: stats.documentsUploaded ?? 0, icon: Briefcase, color: 'indigo' },
            { label: 'Pending Tasks', value: stats.pendingTasks ?? 0, icon: Clock, color: 'amber' },
            { label: 'Active Services', value: activeServices.length, icon: Target, color: 'emerald' },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-lg border-slate-200 shadow-none">
              <CardContent className="grid min-h-[60px] grid-cols-[36px_minmax(0,1fr)] items-center gap-3 px-3 py-2 sm:px-4">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    stat.color === 'blue' && 'bg-blue-50 text-blue-600',
                    stat.color === 'indigo' && 'bg-indigo-50 text-indigo-600',
                    stat.color === 'amber' && 'bg-amber-50 text-amber-600',
                    stat.color === 'emerald' && 'bg-emerald-50 text-emerald-600',
                  )}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 [&>p]:mb-0">
                  <p className="type-meta font-bold uppercase leading-tight text-slate-400">{stat.label}</p>
                  <p className="mt-0.5 text-xl font-bold leading-none text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section aria-label="What's next" className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-4 md:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="min-w-0 xl:w-60 [&>p]:mb-0">
              <p className="type-meta font-bold uppercase text-blue-500">What's next</p>
              <h2 className="type-card-title mt-1 text-slate-900">Your next useful move</h2>
              <p className="type-support mt-1 text-slate-500">Built from live services, reminders, payments, and returns.</p>
            </div>
            <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
              {nextActions.map((action) => {
                const Icon = nextActionIcon(action.source);

                return (
                  <Link key={action.id} href={action.href}>
                    <div className="flex min-h-[74px] items-center gap-3 rounded-lg border border-white bg-white px-3 py-2 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border', nextActionTone(action.tone))}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 [&>p]:mb-0">
                        <p className="truncate text-sm font-bold text-slate-900">{action.label}</p>
                        <p className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-slate-500">{action.detail}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
        <section aria-label="Filing workspace overview" className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="type-meta font-bold uppercase text-slate-400">Document readiness</p>
                <h2 className="type-card-title mt-1 text-slate-900">Prepare your next review</h2>
                <p className="type-support mt-1 text-slate-500">Checklist progress only; it is not a tax correctness guarantee.</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                {documentReadiness.percentage === 100 ? <CheckCircle2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
            </div>
            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-black tracking-tight text-slate-900">{documentReadiness.percentage}%</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{documentReadiness.label}</p>
              </div>
              <Link href={documentReadiness.href}>
                <Button variant="outline" className="h-9 rounded-lg border-slate-200 px-3 text-xs font-bold text-slate-700">
                  Review documents
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" aria-label="Document readiness progress">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: documentReadiness.percentage + '%' }} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="type-meta font-bold uppercase text-slate-400">Filing timeline</p>
                <h2 className="type-card-title mt-1 text-slate-900">Know what happens next</h2>
                <p className="type-support mt-1 text-slate-500">{latestReturn ? 'Your latest return, from saved draft to filing.' : 'Start an ITR workspace to see its live progress here.'}</p>
              </div>
              <Link href={latestReturn?.id ? '/itr/filing/' + latestReturn.id : '/itr/filing/new'} aria-label="Open filing workspace">
                <Button variant="ghost" className="h-9 rounded-lg px-2 text-blue-700 hover:bg-blue-50">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            {filingTimeline.length ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                {filingTimeline.map((step, index) => (
                  <div key={step.id} className="relative min-w-0">
                    {index < filingTimeline.length - 1 && <div className="absolute left-3 top-3 hidden h-px w-full bg-slate-200 sm:block" aria-hidden="true" />}
                    <div className="relative flex items-start gap-2 sm:block">
                      <div className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white',
                        step.state === 'complete' && 'border-emerald-500 text-emerald-600',
                        step.state === 'current' && 'border-blue-500 text-blue-600',
                        step.state === 'attention' && 'border-amber-500 text-amber-600',
                        step.state === 'upcoming' && 'border-slate-200 text-slate-300',
                      )}>
                        {step.state === 'complete' ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.state === 'attention' ? <AlertCircle className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                      </div>
                      <div className="min-w-0 sm:mt-2">
                        <p className="text-xs font-bold text-slate-800">{step.label}</p>
                        <p className="mt-1 text-[11px] font-medium leading-snug text-slate-500">{step.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Link href="/itr/filing/new" className="mt-5 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                <span className="text-sm font-bold text-blue-800">Start an ITR workspace to track filing progress.</span>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-blue-500" />
              </Link>
            )}
          </div>
        </section>

        <section aria-label="Support shortcuts" className="flex flex-col gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm"><MessageCircle className="h-4 w-4" /></div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Need help with a document or case?</h2>
              <p className="mt-1 text-xs font-medium text-slate-600">Continue in your workspace or ask the MyeCA team for the next action.</p>
            </div>
          </div>
          <Link href="/expert-consultation" className="shrink-0">
            <Button variant="outline" className="h-9 rounded-lg border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100">Contact support</Button>
          </Link>
        </section>
        <section aria-label="Your action plan" className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="type-meta font-bold uppercase text-slate-400">Personal action plan</p>
              <h2 className="type-card-title mt-1 text-slate-900">Your next useful steps</h2>
              <p className="type-support mt-1 text-slate-500">Based on your current filing and service workspace.</p>
            </div>
            <span className="text-xs font-bold text-slate-400">{actionPlan.length} step{actionPlan.length === 1 ? '' : 's'} in view</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {actionPlan.map((item, index) => (
              <Link key={item.id} href={item.href}>
                <div className="flex min-h-[112px] items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 transition hover:border-blue-200 hover:bg-blue-50/40">
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black',
                    item.tone === 'urgent' && 'bg-amber-100 text-amber-700',
                    item.tone === 'next' && 'bg-blue-100 text-blue-700',
                    item.tone === 'later' && 'bg-emerald-100 text-emerald-700',
                  )}>
                    {item.tone === 'urgent' ? <AlertCircle className="h-4 w-4" /> : <span>{index + 1}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-tight text-slate-900">{item.title}</p>
                    <p className="mt-1 line-clamp-3 text-xs font-medium leading-snug text-slate-500">{item.detail}</p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-blue-700">Open step</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                </div>
              </Link>
            ))}
          </div>
        </section>



        <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="type-card-title text-slate-900">Active Services</h2>
              <p className="type-support mt-1 font-medium text-slate-500">Each service shows its current status and assigned CA.</p>
            </div>
            <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[260px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <Input
                placeholder="Search applications..."
                className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-10 text-sm font-medium focus-visible:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:hidden">
          {isLoading ? (
            <div className="rounded-lg border border-slate-200 bg-white px-5 py-12 text-center text-sm font-bold text-slate-400">
              Loading your workspace...
            </div>
          ) : activeServices.length ? (
            activeServices.map((service) => (
              <Link key={service.id} href={`/dashboard/services/${service.id}`}>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 [&>p]:mb-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {service.serviceTitle || service.serviceId || 'Service request'}
                      </p>
                      <p className="type-meta mt-1 font-bold uppercase text-slate-400">
                        {service.serviceCategory || 'General service'}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="type-meta font-bold uppercase text-slate-400">CA</p>
                      <p className="mt-1 truncate text-xs font-bold text-slate-800">{assignedCaLabel(service)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="type-meta font-bold uppercase text-slate-400">Status</p>
                      <p className="mt-1 truncate text-xs font-bold capitalize text-blue-700">{serviceStatus(service)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center">
              <Briefcase className="mx-auto mb-4 h-10 w-10 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-900">No active services yet</h3>
              <p className="mt-2 text-sm font-medium text-slate-500">Start a filing or service request to see it here.</p>
              <Link href="/dashboard/services">
                <Button className="mt-6 h-10 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700">
                  Browse Services
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[28%]" />
                <col className="w-[20%]" />
                <col className="w-[22%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Service</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Assigned CA</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-sm font-bold text-slate-400">
                      Loading your workspace...
                    </td>
                  </tr>
                ) : activeServices.length ? (
                  activeServices.map((service) => (
                    <tr key={service.id} className="group transition-colors hover:bg-blue-50/30">
                      <td className="align-middle px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 [&>p]:mb-0">
                            <p className="truncate text-sm font-bold leading-tight text-slate-900">
                              {service.serviceTitle || service.serviceId || 'Service request'}
                            </p>
                            <p className="type-meta mt-1 truncate font-bold uppercase text-slate-400">
                              {service.serviceCategory || 'General service'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle px-4 py-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
                          <div className="min-w-0 [&>p]:mb-0">
                            <p className="truncate text-sm font-bold text-slate-800">{assignedCaLabel(service)}</p>
                            {(service.assignedCaEmail || service.metadata?.assignedCa?.email) && (
                              <p className="type-meta mt-0.5 truncate font-semibold text-slate-400">
                                {service.assignedCaEmail || service.metadata?.assignedCa?.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="align-middle px-4 py-3">
                        <Badge variant="outline" className="type-meta whitespace-nowrap border-slate-200 bg-slate-50 px-2.5 py-0.5 font-bold text-slate-600">
                          {service.paymentStatus || 'Payment pending'}
                        </Badge>
                      </td>
                      <td className="align-middle px-4 py-3 text-right">
                        <Link href={`/dashboard/services/${service.id}`}>
                          <Button variant="outline" className="h-8 min-w-[136px] justify-between rounded-lg border-slate-200 px-3 text-xs font-bold text-slate-600 hover:border-blue-600 hover:bg-blue-600 hover:text-white">
                            {serviceStatus(service)}
                            <ChevronRight className="ml-2 h-3.5 w-3.5 shrink-0" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center">
                      <div className="mx-auto max-w-sm">
                        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-300">
                          <Briefcase className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No active services yet</h3>
                        <p className="mt-2 text-sm font-medium text-slate-500">Start a filing or service request to see it here.</p>
                        <Link href="/dashboard/services">
                          <Button className="mt-6 h-10 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700">
                            Browse Services
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
