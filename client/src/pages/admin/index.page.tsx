import { Layout } from '@/components/admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStats } from '@/hooks/admin/useStats';
import {
  RefreshCw, Users, Coins, Activity,
  Search, Filter, LayoutGrid, List,
  ChevronRight, MoreHorizontal, ArrowUpRight,
  ShieldCheck, Briefcase, Sparkles, Zap, ArrowRight
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/admin/utils';
import { m, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { stats, isLoading, error, refetch } = useStats();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/users");
      const result = await response.json();
      return Array.isArray(result.data?.users) ? result.data.users : [];
    },
    enabled: !!user && user.role === 'admin',
  });

  const pendingCAs = users.filter((u: User) => u.role === 'ca' && u.status === 'pending');
  const workList = stats.workList || [];

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                <Zap className="w-3 h-3 fill-current" />
                System Live
             </div>
             <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Command Center</h1>
             <p className="text-slate-500 max-w-2xl text-sm font-medium">
               Real-time platform oversight, user management, and financial reconciliation.
             </p>
          </div>
          <div className="flex items-center gap-3">
             <Button
               variant="outline"
               className="h-10 rounded-lg border-slate-200 px-4 text-sm font-bold"
               onClick={() => refetch()}
             >
               <RefreshCw className={cn("h-3 w-3 mr-2", isLoading && "animate-spin")} />
               Refresh Data
             </Button>
          </div>
        </div>

        {error ? (
          <Card className="rounded-lg border-red-200 bg-red-50 shadow-none">
            <CardContent className="flex flex-col gap-3 p-5 text-sm text-red-800 md:flex-row md:items-center md:justify-between">
              <p className="font-medium">
                Admin statistics could not be loaded: {error instanceof Error ? error.message : 'Request failed'}
              </p>
              <Button
                variant="outline"
                className="h-9 rounded-lg border-red-200 bg-white text-xs font-bold text-red-700 hover:bg-red-100"
                onClick={() => refetch()}
              >
                <RefreshCw className={cn("mr-2 h-3 w-3", isLoading && "animate-spin")} />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Platform Users', value: formatNumber(stats.users.total), icon: Users, color: 'blue' },
            { label: 'Active Compliance Filings', value: formatNumber(stats.services.active), icon: Activity, color: 'emerald' },
            { label: 'Expert CA Applications', value: pendingCAs.length, icon: ShieldCheck, color: 'amber' },
            { label: 'Monthly Revenue (MTD)', value: formatCurrency(stats.revenue.thisMonth), icon: Coins, color: 'indigo' },
          ].map((item, i) => (
            <Card key={i} className="rounded-lg border-slate-200 bg-white p-3 shadow-none group transition-all">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={cn("rounded-lg p-2",
                       item.color === 'blue' ? "bg-blue-50 text-blue-600" :
                       item.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                       item.color === 'amber' ? "bg-amber-50 text-amber-600" :
                       "bg-indigo-50 text-indigo-600"
                     )}>
                       <item.icon className="h-4 w-4" />
                     </div>
                     <p className="mb-0 text-xs font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-xl font-bold text-slate-900 leading-none">{item.value}</span>
                     <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
               </div>
            </Card>
          ))}
        </div>

        {/* Action Bar & Main Feed */}
        <div className="space-y-6">
           <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                 <div className="h-6 w-1 bg-blue-600 rounded-full" />
                 <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Operational Log</h2>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                 <div className="relative group w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500" />
                    <Input
                      placeholder="Search activity..."
                      className="h-9 w-full rounded-lg border-slate-200 bg-white pl-9 text-xs font-medium sm:w-60"
                    />
                 </div>
                 <Button variant="outline" size="sm" className="h-9 w-full rounded-lg border-slate-200 text-slate-500 hover:bg-slate-50 sm:w-9">
                    <Filter className="h-4 w-4" />
                 </Button>
              </div>
           </div>

           <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-none">
             <CardContent className="p-0">
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity Detail</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Identity / ID</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Context</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {workList.slice(0, 5).map((work: any) => (
                        <tr key={work.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                                 <Briefcase className="h-3.5 w-3.5" />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-slate-900 leading-tight mb-0.5">{work.title}</p>
                                 <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tight">{work.type.replace('_', ' ')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="text-xs font-bold text-slate-900">{work.userName}</p>
                            <p className="text-[9px] font-medium text-slate-400 uppercase mt-0.5">#TRX-{work.id.toString().padStart(6, '0')}</p>
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="text-[10px] text-slate-500 font-medium line-clamp-1 max-w-xs">
                              {work.description || 'Routine platform transaction and compliance audit.'}
                            </p>
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge className={cn(
                              "rounded-full px-2 py-0.5 text-[8px] font-bold border-none shadow-sm",
                              work.status === 'pending' ? "bg-amber-50 text-amber-600" :
                              work.status === 'in_progress' ? "bg-blue-50 text-blue-600" :
                              "bg-emerald-50 text-emerald-600"
                            )}>
                              {work.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50">
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {workList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3 opacity-20">
                              <Activity className="h-10 w-10 text-slate-400" />
                              <p className="text-xs font-bold uppercase tracking-[0.2em]">No Active Logs</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                  {workList.slice(0, 5).map((work: any) => (
                    <div key={work.id} className="space-y-2 p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                          <Briefcase className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold leading-tight text-slate-900">{work.title}</p>
                          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-blue-500">{work.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900">{work.userName}</p>
                          <p className="text-[9px] font-medium uppercase text-slate-400">#TRX-{work.id.toString().padStart(6, '0')}</p>
                        </div>
                        <Badge className={cn(
                          "shrink-0 rounded-full border-none px-2 py-0.5 text-[8px] font-bold",
                          work.status === 'pending' ? "bg-amber-50 text-amber-600" :
                          work.status === 'in_progress' ? "bg-blue-50 text-blue-600" :
                          "bg-emerald-50 text-emerald-600"
                        )}>
                          {work.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {workList.length === 0 && (
                    <div className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <Activity className="h-8 w-8 text-slate-400" />
                        <p className="text-xs font-bold uppercase tracking-[0.2em]">No Active Logs</p>
                      </div>
                    </div>
                  )}
                </div>

               <div className="flex flex-col gap-3 bg-slate-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">System Total: {workList.length}</p>
                  <div className="flex items-center gap-2">
                     <Button variant="ghost" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900">Back</Button>
                     <Button className="h-8 px-5 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-900 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50">Forward</Button>
                  </div>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </Layout>
  );
}
