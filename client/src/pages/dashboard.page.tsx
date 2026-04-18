import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  FileText, 
  Calculator, 
  Upload, 
  PlusCircle, 
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Box,
  ArrowRight,
  Phone,
  MessageSquare,
  Bell,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import QuickActions from "@/components/ui/quick-actions";
import { useAuth } from "@/components/AuthProvider";
import { StatusChip } from "@/components/ui/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layout } from "@/components/admin/Layout";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const seo = getSEOConfig('/dashboard');
  const { user } = useAuth();
  const userId = user?.id;
  
  const { data: userServices = [], isLoading: servicesLoading } = useQuery<any[]>({
    queryKey: ['/api/user-services'],
    enabled: !!userId
  });

  const { data: notificationsData } = useQuery<any[]>({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      return data.notifications || [];
    },
    enabled: !!userId
  });

  const { data: activityData } = useQuery<any[]>({
    queryKey: ['/api/user/activity'],
    queryFn: async () => {
      const res = await fetch('/api/user/activity', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      return data.data?.activities || [];
    },
    enabled: !!userId
  });
  
  const profiles = [
    { id: 1, name: "Primary Profile", isActive: true, relation: "Self", pan: "" }
  ];
  const activeProfile = profiles[0];
  
  const taxReturns = [
    { id: 1, assessmentYear: "2024-25", status: "draft", filingDate: null },
    { id: 2, assessmentYear: "2023-24", status: "filed", filingDate: "2024-07-30" }
  ];
  
  const documents = [
    { id: 1, name: "Form 16", category: "Salary", uploadDate: "2024-01-15" },
    { id: 2, name: "Bank Statement", category: "Banking", uploadDate: "2024-01-20" }
  ];

  return (
    <Layout>
      <MetaSEO
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        type={seo?.type}
        breadcrumbs={seo?.breadcrumbs}
      />

      <div className="space-y-8 pb-12">
        {/* Welcome Header */}
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
              <Zap className="w-3 h-3 fill-current" />
              Live Dashboard
           </div>
           <h1 className="text-3xl font-bold tracking-tight text-slate-900">
             Welcome back, {user?.username || 'Partner'}
           </h1>
           <p className="text-slate-500 max-w-2xl font-medium">
             Your compliance status is currently <span className="text-emerald-600 font-bold">Optimal</span>. You have 2 pending documents for the 2024-25 Assessment Year.
           </p>
        </div>

        {/* High-Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-white p-6 rounded-[32px] group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <FileText className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tax Returns</p>
            <p className="text-2xl font-bold text-slate-900">{taxReturns.length}</p>
          </Card>

          <Card className="border-none shadow-sm bg-white p-6 rounded-[32px] group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Upload className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Documents</p>
            <p className="text-2xl font-bold text-slate-900">{documents.length}</p>
          </Card>

          <Card className="border-none shadow-sm bg-white p-6 rounded-[32px] group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <User className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Profiles</p>
            <p className="text-2xl font-bold text-slate-900">{profiles.length}</p>
          </Card>

          <Card className="border-none shadow-sm bg-white p-6 rounded-[32px] group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assessment Yr</p>
            <p className="text-2xl font-bold text-slate-900">2024-25</p>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left/Middle Columns: Actions & Services */}
           <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions Component Integrated */}
              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                   <div className="h-6 w-1 bg-blue-600 rounded-full" />
                   <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Priority Operations</h2>
                </div>
                <QuickActions />
              </div>

              {/* Active Subscriptions/Services */}
              <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">Managed Services</CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-500">Real-time status of your compliance engagements.</CardDescription>
                  </div>
                  <Link href="/services">
                    <Button variant="ghost" className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:bg-blue-50">
                      Marketplace <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  {servicesLoading ? (
                    <div className="p-8 space-y-4">
                      {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                    </div>
                  ) : userServices.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                         <Box className="h-8 w-8 text-slate-300" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">No active services</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">Explore our range of professional tax and business services.</p>
                      <Link href="/services">
                        <Button className="mt-6 rounded-xl bg-slate-900 font-bold text-xs uppercase tracking-widest px-8">Explore Now</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {userServices.map((userService: any) => (
                        <div key={userService.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                              <Box className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{userService.service?.name || 'Service Package'}</p>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                                ID: {userService.id.slice(0,8)} · {new Date(userService.purchaseDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <StatusChip status={userService.status} size="sm" />
                            <div className="flex items-center gap-1">
                               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-blue-600">
                                 <MessageSquare className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-blue-600">
                                 <ArrowRight className="h-4 w-4" />
                               </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
           </div>

           {/* Right Column: Notifications & Activity */}
           <div className="space-y-8">
              {/* Notifications Card */}
              <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                 <CardHeader className="p-6 border-b border-slate-50">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                       <Bell className="w-4 h-4 text-blue-600" />
                       Alerts
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-0">
                    <ScrollArea className="h-[350px]">
                       {notificationsData && notificationsData.length > 0 ? (
                          <div className="divide-y divide-slate-50">
                             {notificationsData.map((notification: any) => (
                                <div key={notification.id} className={cn("p-5 transition-colors", notification.read ? 'bg-white' : 'bg-blue-50/30')}>
                                   <div className="flex justify-between items-start mb-1">
                                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{notification.title}</h4>
                                      {!notification.read && <span className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-1" />}
                                   </div>
                                   <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed mb-2">{notification.message}</p>
                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                      {new Date(notification.createdAt).toLocaleDateString()}
                                   </span>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <div className="flex flex-col items-center justify-center h-[350px] text-slate-300">
                             <Bell className="w-8 h-8 mb-3 opacity-20" />
                             <p className="text-[10px] font-bold uppercase tracking-widest">No Alerts</p>
                          </div>
                       )}
                    </ScrollArea>
                 </CardContent>
              </Card>

              {/* Activity Timeline Card */}
              <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-slate-900 text-white">
                 <CardHeader className="p-6 border-b border-white/5">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                       <Activity className="w-4 h-4 text-emerald-400" />
                       Audit Log
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-0">
                    <ScrollArea className="h-[350px]">
                       {activityData && activityData.length > 0 ? (
                          <div className="p-6 space-y-6">
                             {activityData.map((activity: any) => (
                                <div key={activity.id} className="relative pl-6 border-l border-white/10 group">
                                   <span className="absolute -left-[4.5px] top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-transform group-hover:scale-150" />
                                   <div className="flex flex-col">
                                      <span className="text-xs font-bold text-white mb-0.5">{activity.action}</span>
                                      <span className="text-[10px] text-slate-400 mb-1 leading-relaxed">{activity.description}</span>
                                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                                         {new Date(activity.timestamp).toLocaleDateString()} • {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <div className="flex flex-col items-center justify-center h-[350px] text-slate-600">
                             <Activity className="w-8 h-8 mb-3 opacity-20" />
                             <p className="text-[10px] font-bold uppercase tracking-widest">No Activity Recorded</p>
                          </div>
                       )}
                    </ScrollArea>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </Layout>
  );
}
  );
}
