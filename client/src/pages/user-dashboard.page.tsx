import { Layout } from '@/components/admin/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  Plus, 
  ShieldCheck, 
  TrendingUp,
  Target,
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronRight,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { m } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

export default function UserDashboard() {
  const { user } = useAuth();

  const activeServices = [
    { id: 1, title: "Income Tax Return (ITR-1)", year: "AY 2025-26", status: "In Progress", progress: 65, color: "blue", description: "Standard filing for individuals with salary income." },
    { id: 2, title: "GST Registration", year: "FY 2024-25", status: "Review", progress: 90, color: "emerald", description: "Business registration for tax compliance." }
  ];

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-12 items-start bg-slate-50/50 rounded-[48px] p-2">
        {/* Sticky Left Summary Section */}
        <div className="lg:w-80 shrink-0 w-full space-y-6 lg:sticky lg:top-[112px]">
          <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-100/50">
             <div className="h-28 bg-gradient-to-br from-blue-500 to-indigo-500 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
             </div>
             <CardContent className="relative px-6 pb-8">
                <div className="flex flex-col items-center -mt-14">
                   <div className="w-28 h-28 rounded-[40px] bg-white p-2 shadow-2xl">
                      <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-4xl font-black text-blue-600 border border-blue-100">
                         {user?.firstName?.[0]}
                      </div>
                   </div>
                   <div className="mt-5 text-center">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Welcome, {user?.firstName}</h2>
                      <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5">
                         {user?.role?.replace('_', ' ')}
                      </Badge>
                   </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3">
                   {[
                     { label: "Files", value: "14", icon: FileText, color: "blue" },
                     { label: "Active", value: "02", icon: Target, color: "emerald" },
                     { label: "Experts", value: "01", icon: ShieldCheck, color: "purple" },
                     { label: "Vault", value: "08", icon: Briefcase, color: "indigo" }
                   ].map((stat, i) => (
                     <div key={i} className="p-4 rounded-3xl bg-slate-50 border border-slate-100/50 flex flex-col items-center text-center">
                        <stat.icon className={cn("h-4 w-4 mb-2", `text-${stat.color}-600`)} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                        <span className="text-sm font-black text-slate-900 leading-none">{stat.value}</span>
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>

          <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100/50 relative overflow-hidden group cursor-pointer shadow-xl shadow-blue-50">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 transition-all group-hover:scale-150" />
             <Sparkles className="h-8 w-8 text-blue-500 mb-6" />
             <h3 className="font-black text-xl leading-tight mb-3 text-slate-900">MyeCA Intelligence</h3>
             <p className="text-slate-500 text-[10px] font-medium leading-relaxed mb-6">Our AI is analyzing your tax regime for potential savings.</p>
             <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest h-11 rounded-2xl shadow-lg shadow-blue-100 border-none transition-all">View Insights</Button>
          </div>
        </div>

        {/* Main Content Area - Full Page Scroll */}
        <div className="flex-1 min-w-0 w-full lg:max-w-6xl space-y-8 pb-20">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">My Workspace</h1>
              <p className="text-slate-500 max-w-2xl text-base font-medium">
                Manage your active filings and expert reviews.
              </p>
            </div>
            <Link href="/dashboard/services">
              <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:-translate-y-1">
                <Plus className="h-4 w-4 mr-2" />
                New Filing
              </Button>
            </Link>
          </div>

          {/* Action Bar */}
          <div className="bg-white px-8 py-5 rounded-[32px] border border-slate-100 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  placeholder="Search applications..." 
                  className="pl-12 h-12 border-slate-100 focus-visible:ring-blue-100 rounded-xl bg-slate-50/30 font-medium text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Work List */}
          <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Application Item</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Assessment</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Stage Progress</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activeServices.map((service) => (
                      <tr key={service.id} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                             <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110", `bg-${service.color}-50 border-${service.color}-100 text-${service.color}-600`)}>
                                <Briefcase className="h-7 w-7" />
                             </div>
                             <div>
                                <p className="font-black text-slate-900 text-base leading-none mb-2">{service.title}</p>
                                <Badge variant="outline" className="text-[9px] font-black uppercase border-none bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">{service.status}</Badge>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-8">
                          <p className="text-base font-black text-slate-700">{service.year}</p>
                          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Active Cycle</p>
                        </td>
                        <td className="px-6 py-8">
                          <div className="space-y-3 w-40">
                             <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Completion</span>
                                <span className="text-blue-600">{service.progress}%</span>
                             </div>
                             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={cn("h-full transition-all duration-1000", `bg-${service.color === 'blue' ? 'blue' : 'emerald'}-500`)} style={{ width: `${service.progress}%` }} />
                             </div>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-black text-[10px] uppercase tracking-widest">
                            View Status
                            <ChevronRight className="ml-2 h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active filings: 02</p>
               <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest opacity-50">Prev</Button>
                  <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest">Next</Button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
