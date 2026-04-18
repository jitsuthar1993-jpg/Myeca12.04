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

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                <Zap className="w-3 h-3 fill-current" />
                System Live
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Command Center</h1>
             <p className="text-slate-500 max-w-2xl text-sm font-medium">
               Real-time platform oversight, user management, and financial reconciliation.
             </p>
          </div>
          <div className="flex items-center gap-3">
             <Button 
               variant="outline" 
               className="rounded-xl h-10 px-4 font-bold text-xs uppercase tracking-widest border-slate-200"
               onClick={() => refetch()}
             >
               <RefreshCw className={cn("h-3 w-3 mr-2", isLoading && "animate-spin")} />
               Refresh Data
             </Button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Platform Users', value: formatNumber(stats.users.total), icon: Users, color: 'blue' },
            { label: 'Active Compliance Filings', value: formatNumber(stats.services.active), icon: Activity, color: 'emerald' },
            { label: 'Expert CA Applications', value: pendingCAs.length, icon: ShieldCheck, color: 'amber' },
            { label: 'Monthly Revenue (MTD)', value: formatCurrency(stats.revenue.total), icon: Coins, color: 'indigo' },
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-sm bg-white p-6 rounded-[32px] group hover:shadow-md transition-all">
               <div className="flex justify-between items-start mb-4">
                  <div className={cn("p-3 rounded-2xl", 
                    item.color === 'blue' ? "bg-blue-50 text-blue-600" :
                    item.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                    item.color === 'amber' ? "bg-amber-50 text-amber-600" :
                    "bg-indigo-50 text-indigo-600"
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
               <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            </Card>
          ))}
        </div>

        {/* Action Bar & Main Feed */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="h-6 w-1 bg-blue-600 rounded-full" />
                 <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Operational Log</h2>
              </div>
              <div className="flex items-center gap-2">
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500" />
                    <Input 
                      placeholder="Search activity..." 
                      className="h-9 w-60 rounded-xl bg-white border-slate-100 pl-9 text-xs font-medium shadow-sm"
                    />
                 </div>
                 <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50">
                    <Filter className="h-4 w-4" />
                 </Button>
              </div>
           </div>

           <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
             <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-slate-50">
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Activity Detail</th>
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Identity / ID</th>
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Context</th>
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {(stats.workList || []).slice(0, 5).map((work: any) => (
                       <tr key={work.id} className="group hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-5">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                 <Briefcase className="h-4 w-4" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-900 leading-tight mb-0.5">{work.title}</p>
                                 <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">{work.type.replace('_', ' ')}</p>
                              </div>
                           </div>
                         </td>
                         <td className="px-8 py-5">
                           <p className="text-xs font-bold text-slate-900">{work.userName}</p>
                           <p className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">#TRX-{work.id.toString().padStart(6, '0')}</p>
                         </td>
                         <td className="px-8 py-5">
                           <p className="text-[11px] text-slate-500 font-medium line-clamp-1 max-w-xs">
                             {work.description || 'Routine platform transaction and compliance audit.'}
                           </p>
                         </td>
                         <td className="px-8 py-5">
                           <Badge className={cn(
                             "rounded-full px-3 py-1 text-[9px] font-bold border-none shadow-sm",
                             work.status === 'pending' ? "bg-amber-50 text-amber-600" :
                             work.status === 'in_progress' ? "bg-blue-50 text-blue-600" :
                             "bg-emerald-50 text-emerald-600"
                           )}>
                             {work.status.replace('_', ' ').toUpperCase()}
                           </Badge>
                         </td>
                         <td className="px-8 py-5 text-right">
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50">
                             <ArrowRight className="h-4 w-4" />
                           </Button>
                         </td>
                       </tr>
                     ))}
                     {(!stats.workList || stats.workList.length === 0) && (
                       <tr>
                         <td colSpan={5} className="py-24 text-center">
                           <div className="flex flex-col items-center gap-3 opacity-20">
                              <Activity className="h-12 w-12 text-slate-400" />
                              <p className="text-sm font-bold uppercase tracking-[0.2em]">No Active Logs</p>
                           </div>
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
               
               <div className="p-6 bg-slate-50/50 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">System Total: {stats.workList?.length || 0}</p>
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

