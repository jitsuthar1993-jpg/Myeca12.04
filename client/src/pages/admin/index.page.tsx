import { Layout } from '@/components/admin/Layout';
import { StatCard } from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStats } from '@/hooks/admin/useStats';
import { 
  RefreshCw, Users, Coins, ShoppingBag, Activity, 
  AlertCircle, ArrowRight, TrendingUp, UserCheck, 
  UserX, Clock, ShieldCheck, Briefcase, ExternalLink
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/admin/utils';
import { Chart } from '@/components/admin/Chart';
import { m, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  // Fetch pending CA users specifically for the dashboard module
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/users");
      const result = await response.json();
      return Array.isArray(result.data?.users) ? result.data.users : [];
    },
    enabled: !!user && user.role === 'admin',
  });

  const pendingCAs = users.filter((u: User) => u.role === 'ca' && u.status === 'pending');

  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest(`/api/admin/users/${userId}/approve`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }); // Stats might change too
      toast({ title: "CA Authorized", description: "The professional has been granted access." });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest(`/api/admin/users/${userId}/reject`, { 
        method: "POST",
        body: JSON.stringify({ reason: "Rejected via Quick Dashboard Action" })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Account Rejected", variant: "destructive" });
    },
  });

  const isMainAdmin = user?.role === 'admin';

  if (error) {
    return (
      <Layout title="System Overview">
        <Card className="bg-red-50/50 backdrop-blur-md border-red-100 rounded-[32px]">
          <CardContent className="p-10">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-red-100 rounded-2xl">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-red-900 tracking-tight">System Interruption</h3>
                <p className="text-red-700 font-medium mt-1">{error.message || 'Failed to synchronize with backend services'}</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-6 rounded-xl border-red-200" size="lg">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restore Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Hub">
      <m.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10 pb-20"
      >
        {/* Personalized Welcome Section */}
        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[40px] blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
           <div className="relative bg-white/60 backdrop-blur-3xl border border-white p-10 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <Badge className="bg-blue-100 text-blue-700 border-0 font-black px-4 py-1 mb-4 rounded-full uppercase tracking-widest text-[10px]">
                      {isMainAdmin ? 'Admin Control' : 'Administrator'}
                </Badge>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.firstName && user.firstName !== 'User' ? user.firstName : 'Administrator'}</span>
                </h2>
                <p className="text-[15px] text-slate-500 font-medium max-w-xl">
                  You are viewing the <span className="text-slate-900 font-bold">CA Management Dashboard</span>. 
                  Currently managing <span className="text-blue-600 font-bold">{users.length} professionals</span> and platform assets.
                </p>
              </div>
              <div className="flex items-center gap-4">
                  <div className="hidden xl:flex flex-col items-end mr-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Last Sync</span>
                     <span className="text-xs font-bold text-slate-600">Just Now</span>
                  </div>
                  <Button 
                    onClick={() => { refetch(); queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] }); }} 
                    disabled={isLoading} 
                    className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black h-14 px-8 shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 active:scale-95"
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Sync Atmosphere
                  </Button>
              </div>
           </div>
        </div>

        {/* Strategic Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Ecosystem"
            value={formatNumber(stats.users.total)}
            description={`${stats.users.regular_count || 0} Users • ${stats.users.ca_count || 0} CAs`}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Projected Intake"
            value={formatCurrency(stats.revenue.pending || 0)}
            description="Pending Work Revenue"
            icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          />
          <StatCard
            title="Active Operations"
            value={formatNumber(stats.services.active)}
            description="Pending Tasks & Filings"
            icon={<Activity className="h-5 w-5 text-blue-500" />}
          />
          <StatCard
            title="Lifetime Revenue"
            value={formatCurrency(stats.revenue.total)}
            change={stats.revenue.growth_percent}
            icon={<Coins className="h-5 w-5 text-amber-500" />}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* Main Authorization Hub - New for CA requirements */}
          <div className="xl:col-span-2 space-y-10">
            {/* CA Work Queue - NEW REQUIREMENT */}
            <Card className="bg-white border-0 shadow-[0_32px_80px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden">
              <CardHeader className="p-10 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">CA Work List (Pending)</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Tracking lifecycle of all active tax and business services</CardDescription>
                  </div>
                  <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Briefcase className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Service / Task</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Client</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Assigned CA</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</th>
                        <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(stats.work_list || []).map((work: any) => (
                        <tr key={work.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-5">
                            <span className="font-bold text-slate-900 block truncate max-w-[200px]">{work.title}</span>
                            <span className="text-[10px] font-black uppercase tracking-tighter text-blue-500">{work.type.replace('_', ' ')}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-bold text-slate-600">{work.userName}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                {work.assignedCaName?.[0] || '?'}
                              </div>
                              <span className="text-sm font-medium text-slate-500">{work.assignedCaName || 'Unassigned'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <Badge variant="outline" className={cn(
                              "rounded-lg font-bold text-[10px] uppercase border-0 px-2 py-0.5",
                              work.status === 'pending' ? "bg-amber-100 text-amber-700" :
                              work.status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                              "bg-slate-100 text-slate-600"
                            )}>
                              {work.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-10 py-5 text-right">
                            <span className="font-black text-slate-900">{formatCurrency(work.price)}</span>
                          </td>
                        </tr>
                      ))}
                      {(!stats.work_list || stats.work_list.length === 0) && (
                        <tr>
                          <td colSpan={5} className="p-20 text-center text-slate-300">
                             <Briefcase className="h-10 w-10 mx-auto mb-4 opacity-20" />
                             <span className="text-[10px] font-black uppercase tracking-widest opacity-50">No active work items found</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <div className="p-8 bg-slate-50/50 border-t border-slate-50 text-center">
                  <Button variant="ghost" className="text-slate-400 font-bold hover:text-emerald-600 group rounded-xl">
                    View Comprehensive Work Ledger
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
              </div>
            </Card>

            <Card className="bg-white border-0 shadow-[0_32px_80px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden">
              <CardHeader className="p-10 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">CA Authorization Queue</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Approve newly registered tax professionals for platform access</CardDescription>
                  </div>
                  <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {usersLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                    <RefreshCw className="h-10 w-10 animate-spin opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Validating Registry</span>
                  </div>
                ) : pendingCAs.length === 0 ? (
                  <div className="px-20 py-10 flex flex-col items-center justify-center gap-4 text-slate-300">
                    <div className="p-4 bg-slate-50 rounded-[2rem]">
                      <UserCheck className="h-6 w-6 opacity-30" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Queue Clear</span>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="space-y-4">
                      {pendingCAs.map((ca: User) => (
                        <m.div 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={ca.id} 
                          className="group p-6 rounded-[2rem] bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl font-bold text-slate-800 border border-slate-50">
                                {ca.firstName[0]}{ca.lastName[0]}
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 leading-tight">{ca.firstName} {ca.lastName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Briefcase className="h-3 w-3 text-slate-400" />
                                  <span className="text-xs font-bold text-slate-500">{ca.email}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button 
                                onClick={() => approveMutation.mutate(ca.id)}
                                disabled={approveMutation.isPending}
                                className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 shadow-lg shadow-emerald-100 transition-all hover:-translate-y-1"
                              >
                                {approveMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4 mr-2" />}
                                Authorize
                              </Button>
                            </div>
                          </div>
                        </m.div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-[0_32px_80px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden">
               <CardHeader className="p-10 pb-0">
                  <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Financial Performance</CardTitle>
               </CardHeader>
               <CardContent className="p-10">
                  <Chart
                    title=""
                    type="area"
                    data={stats.recent_calculations?.map((item) => ({
                      name: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                      value: (item.count || 0) * 1250,
                    })) || []}
                    height={350}
                  />
               </CardContent>
            </Card>
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-10">
            <Card className="bg-white border border-slate-100 shadow-[0_32px_80px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden sticky top-32">
              <CardHeader className="p-10 pb-6 border-b border-slate-50">
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Live Audit
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {stats.recent_activity.slice(0, 8).map((activity, i) => (
                    <m.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={activity.id} 
                      className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                           <Users className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[14px] font-bold text-slate-900 leading-tight mb-1">{activity.action}</p>
                           <p className="text-[11px] font-bold text-slate-400 truncate">{activity.user}</p>
                        </div>
                      </div>
                    </m.div>
                  ))}
                  {stats.recent_activity.length === 0 && (
                    <div className="py-20 text-center opacity-20">
                       <Activity className="h-12 w-12 mx-auto mb-4 text-slate-900" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">No active pulses</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="p-8 pt-0">
                  <Button variant="ghost" className="w-full rounded-2xl text-slate-400 font-bold hover:bg-slate-50 hover:text-blue-600 transition-all h-14">
                    Full Log History
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
              </div>
            </Card>
          </div>
        </div>
      </m.div>
    </Layout>
  );
}

