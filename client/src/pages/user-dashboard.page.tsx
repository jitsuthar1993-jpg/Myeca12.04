import { Layout } from '@/components/admin/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  ChevronRight,
  Clock,
  FileText,
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

type DashboardData = {
  stats?: {
    totalReturns?: number;
    documentsUploaded?: number;
    pendingTasks?: number;
    savedAmount?: number;
  };
  activeServices?: DashboardService[];
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
  const stats = data?.stats || {};
  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';

  return (
    <Layout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="type-page-title text-slate-900">Welcome, {displayName}</h1>
            <p className="type-body max-w-2xl font-medium text-slate-500">
              Track active filings, document progress, assigned CA support, and service payments from one workspace.
            </p>
          </div>
          <Link href="/dashboard/services">
            <Button className="h-10 rounded-lg bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800">
              <Plus className="mr-2 h-4 w-4" />
              New Filing
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Returns', value: stats.totalReturns ?? 0, icon: FileText, color: 'blue' },
            { label: 'Documents', value: stats.documentsUploaded ?? 0, icon: Briefcase, color: 'indigo' },
            { label: 'Pending Tasks', value: stats.pendingTasks ?? 0, icon: Clock, color: 'amber' },
            { label: 'Active Services', value: activeServices.length, icon: Target, color: 'emerald' },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-lg border-slate-200 shadow-none">
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    stat.color === 'blue' && 'bg-blue-50 text-blue-600',
                    stat.color === 'indigo' && 'bg-indigo-50 text-indigo-600',
                    stat.color === 'amber' && 'bg-amber-50 text-amber-600',
                    stat.color === 'emerald' && 'bg-emerald-50 text-emerald-600',
                  )}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="type-meta font-bold uppercase text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="type-card-title text-slate-900">Active Services</h2>
              <p className="type-support mt-1 font-medium text-slate-500">Each service shows its current status and assigned CA.</p>
            </div>
            <div className="relative min-w-[260px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <Input
                placeholder="Search applications..."
                className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-10 text-sm font-medium focus-visible:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Service</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Assigned CA</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Payment</th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Status</th>
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
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="mb-2 text-sm font-bold leading-none text-slate-900">
                              {service.serviceTitle || service.serviceId || 'Service request'}
                            </p>
                            <p className="type-meta font-bold uppercase text-slate-400">
                              {service.serviceCategory || 'General service'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{assignedCaLabel(service)}</p>
                            {(service.assignedCaEmail || service.metadata?.assignedCa?.email) && (
                              <p className="type-meta mt-1 font-semibold text-slate-400">
                                {service.assignedCaEmail || service.metadata?.assignedCa?.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <Badge variant="outline" className="type-meta border-slate-200 bg-slate-50 px-3 py-1 font-bold text-slate-600">
                          {service.paymentStatus || 'Payment pending'}
                        </Badge>
                      </td>
                      <td className="px-5 py-5 text-right">
                        <Link href={`/dashboard/services/${service.id}`}>
                          <Button variant="outline" className="h-9 rounded-lg border-slate-200 px-4 text-xs font-bold text-slate-600 hover:border-blue-600 hover:bg-blue-600 hover:text-white">
                            {serviceStatus(service)}
                            <ChevronRight className="ml-2 h-3.5 w-3.5" />
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
