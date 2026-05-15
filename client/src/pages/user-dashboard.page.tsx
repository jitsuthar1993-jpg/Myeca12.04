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
      <div className="space-y-8 pb-20">
        <div className="flex flex-col gap-6 rounded-[40px] border border-slate-100 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Welcome, {displayName}</h1>
            <p className="max-w-2xl text-base font-medium text-slate-500">
              Track active filings, document progress, assigned CA support, and service payments from one workspace.
            </p>
          </div>
          <Link href="/dashboard/services">
            <Button className="h-14 rounded-2xl bg-slate-900 px-8 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-blue-600">
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
            <Card key={stat.label} className="rounded-[28px] border-slate-100 shadow-sm">
              <CardContent className="flex items-center gap-4 p-6">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-2xl',
                    stat.color === 'blue' && 'bg-blue-50 text-blue-600',
                    stat.color === 'indigo' && 'bg-indigo-50 text-indigo-600',
                    stat.color === 'amber' && 'bg-amber-50 text-amber-600',
                    stat.color === 'emerald' && 'bg-emerald-50 text-emerald-600',
                  )}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-[32px] border border-slate-100 bg-white px-8 py-5">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Active Services</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Each service shows its current status and assigned CA.</p>
            </div>
            <div className="relative min-w-[260px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <Input
                placeholder="Search applications..."
                className="h-12 rounded-xl border-slate-100 bg-slate-50/30 pl-12 text-sm font-medium focus-visible:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Service</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned CA</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Payment</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
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
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 transition-all group-hover:scale-105">
                            <Briefcase className="h-7 w-7" />
                          </div>
                          <div>
                            <p className="mb-2 text-base font-black leading-none text-slate-900">
                              {service.serviceTitle || service.serviceId || 'Service request'}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {service.serviceCategory || 'General service'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-black text-slate-800">{assignedCaLabel(service)}</p>
                            {(service.assignedCaEmail || service.metadata?.assignedCa?.email) && (
                              <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                {service.assignedCaEmail || service.metadata?.assignedCa?.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <Badge variant="outline" className="border-none bg-slate-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-600">
                          {service.paymentStatus || 'Payment pending'}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link href={`/dashboard/services/${service.id}`}>
                          <Button variant="outline" className="h-11 rounded-xl border-slate-200 px-6 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white">
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
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                          <Briefcase className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">No active services yet</h3>
                        <p className="mt-2 text-sm font-medium text-slate-500">Start a filing or service request to see it here.</p>
                        <Link href="/dashboard/services">
                          <Button className="mt-6 h-11 rounded-xl bg-blue-600 px-6 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700">
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
