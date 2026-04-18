import { Layout } from '@/components/admin/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  ShieldCheck, 
  History,
  FileCheck,
  TrendingUp,
  Target
} from 'lucide-react';
import { m } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function UserDashboard() {
  const { user } = useAuth();

  const activeServices = [
    { id: 1, title: "Income Tax Return (ITR-1)", year: "AY 2025-26", status: "In Progress", progress: 65, color: "blue" },
    { id: 2, title: "GST Registration", year: "FY 2024-25", status: "Review", progress: 90, color: "emerald" }
  ];

  const recentDocuments = [
    { name: "PAN_Card.pdf", date: "2 days ago", size: "1.2 MB", category: "Identity" },
    { name: "Form_16_FY24.pdf", date: "5 days ago", size: "2.4 MB", category: "Tax Forms" },
    { name: "Bank_Statement_HDFC.pdf", date: "1 week ago", size: "3.8 MB", category: "Banking" }
  ];

  return (
    <Layout title="My Dashboard">
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10 pb-20"
      >
        {/* Welcome Section */}
        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[40px] blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
           <div className="relative bg-white/60 backdrop-blur-3xl border border-white p-10 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <Badge className="bg-blue-100 text-blue-700 border-0 font-black px-4 py-1 mb-4 rounded-full uppercase tracking-widest text-[10px]">
                  User Account
                </Badge>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">
                    Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.firstName || 'User'}</span>
                </h2>
                <p className="text-[15px] text-slate-500 font-medium max-w-xl">
                  Manage your tax filings, documents, and expert consultations from your central command center.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                  <Link href="/services">
                    <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black h-14 px-8 shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 active:scale-95">
                      <Plus className="h-4 w-4 mr-2" />
                      Start New Filing
                    </Button>
                  </Link>
              </div>
           </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { title: "Active Services", value: "02", icon: Target, color: "blue", desc: "Currently processing" },
             { title: "Documents", value: "14", icon: FileText, color: "indigo", desc: "Securely vaulted" },
             { title: "Calculations", value: "08", icon: TrendingUp, color: "emerald", desc: "Saved simulations" },
             { title: "Experts", value: "01", icon: ShieldCheck, color: "purple", desc: "Assigned CA" }
           ].map((stat, i) => (
             <Card key={i} className="bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2rem] overflow-hidden hover:shadow-xl transition-all duration-500">
               <CardContent className="p-6">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-opacity-10", `bg-${stat.color}-500 text-${stat.color}-600`)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">{stat.title}</div>
                  <div className="text-[10px] font-medium text-slate-400 mt-2">{stat.desc}</div>
               </CardContent>
             </Card>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Active Services Hub */}
          <div className="lg:col-span-2 space-y-10">
            <Card className="bg-white border-0 shadow-[0_32px_80px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden">
              <CardHeader className="p-10 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Active Work</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Tracking your ongoing applications and filings</CardDescription>
                  </div>
                  <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 px-10 pb-10">
                <div className="space-y-6">
                  {activeServices.map((service) => (
                    <div key={service.id} className="p-6 rounded-[2rem] bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-500 group">
                       <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-5">
                             <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm border border-white", `bg-${service.color}-50 text-${service.color}-600`)}>
                                <FileCheck className="h-7 w-7" />
                             </div>
                             <div>
                                <h4 className="font-black text-slate-900 leading-tight">{service.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                   <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-white">{service.year}</Badge>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Updated Today</span>
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-xs font-black text-slate-900 mb-2 uppercase tracking-widest">{service.progress}% Complete</div>
                             <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className={cn("h-full transition-all duration-1000", `bg-${service.color}-500`)} style={{ width: `${service.progress}%` }} />
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] border-0 p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-1000"></div>
                  <h3 className="text-2xl font-black tracking-tight mb-2">Need Help?</h3>
                  <p className="text-indigo-100 text-sm font-medium mb-8 leading-relaxed">Connect with our tax experts for a 1-on-1 consultation session.</p>
                  <Button className="w-full h-14 bg-white text-indigo-700 hover:bg-indigo-50 font-black rounded-2xl shadow-xl transition-all hover:-translate-y-1">
                    Book Expert Now
                  </Button>
               </Card>

               <Card className="bg-white border-0 shadow-[0_32px_80px_rgba(0,0,0,0.03)] rounded-[32px] p-8 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Tax Optimizer</h3>
                    <p className="text-slate-500 text-sm font-medium">Analyze your investments and find potential tax savings.</p>
                  </div>
                  <Button variant="ghost" className="mt-8 justify-between p-0 font-black text-slate-900 hover:bg-transparent group">
                    Optimize Now
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </Button>
               </Card>
            </div>
          </div>

          {/* Sidebar - Recent Documents */}
          <div className="space-y-10">
            <Card className="bg-white border border-slate-100 shadow-[0_32px_80px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden">
               <CardHeader className="p-10 pb-6 border-b border-slate-50">
                  <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <History className="h-5 w-5 text-blue-600" />
                    Recent Vault
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  <div className="space-y-2">
                     {recentDocuments.map((doc, i) => (
                       <div key={i} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                <FileText className="h-5 w-5" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-bold text-slate-900 leading-tight truncate">{doc.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{doc.date} • {doc.size}</p>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </CardContent>
               <div className="p-8 pt-0">
                  <Button variant="ghost" className="w-full rounded-2xl text-slate-400 font-bold hover:bg-slate-50 hover:text-blue-600 transition-all h-14">
                    View Full Vault
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
               </div>
            </Card>

            <div className="p-8 bg-slate-900 rounded-[32px] text-white relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
               <div className="relative z-10">
                  <h4 className="text-lg font-black mb-2 tracking-tight">Security Status</h4>
                  <div className="flex items-center gap-3 mb-6">
                     <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                     <span className="text-xs font-bold text-slate-400">256-bit AES Encryption</span>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        <span>Vault Health</span>
                        <span>100%</span>
                     </div>
                     <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-full"></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </m.div>
    </Layout>
  );
}
