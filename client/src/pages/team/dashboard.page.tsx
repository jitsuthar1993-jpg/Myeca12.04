import { Layout } from '@/components/admin/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Clock, 
  Activity, 
  ArrowRight, 
  Plus, 
  MessageSquare, 
  Calendar,
  Layers,
  Zap,
  CheckCircle,
  Eye
} from 'lucide-react';
import { m } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function TeamDashboard() {
  const { user } = useAuth();

  const activeTasks = [
    { id: 1, title: "Review 'Section 80C' Article", assignedBy: "Admin", priority: "High", deadline: "Today", color: "red" },
    { id: 2, title: "Upload Daily Tax Updates", assignedBy: "System", priority: "Medium", deadline: "2 PM", color: "blue" },
    { id: 3, title: "Respond to Help Center Tickets", assignedBy: "Admin", priority: "Low", deadline: "EOD", color: "emerald" }
  ];

  const contentStats = [
    { label: "My Blog Posts", value: "24", change: "+3 this week", icon: FileText, color: "blue" },
    { label: "Pending Reviews", value: "05", change: "-2 from yesterday", icon: Clock, color: "amber" },
    { label: "Total Reach", value: "12.5k", change: "+12% growth", icon: Activity, color: "indigo" },
    { label: "Active Comments", value: "82", change: "14 new", icon: MessageSquare, color: "emerald" }
  ];

  return (
    <Layout title="Team Portal">
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10 pb-20"
      >
        {/* Welcome Section */}
        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[40px] blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
           <div className="relative bg-white/60 backdrop-blur-3xl border border-white p-10 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 font-black px-4 py-1 mb-4 rounded-full uppercase tracking-widest text-[10px]">
                  Team Member
                </Badge>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{user?.firstName || 'Professional'}</span>
                </h2>
                <p className="text-[15px] text-slate-500 font-medium max-w-xl">
                  Collaborate on content, manage tax updates, and maintain the platform's knowledge base.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                  <Link href="/admin/blog-management">
                    <Button className="rounded-2xl bg-slate-900 hover:bg-black text-white font-black h-14 px-8 shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95">
                      <Plus className="h-4 w-4 mr-2" />
                      New Post
                    </Button>
                  </Link>
                  <Button variant="outline" className="rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-black h-14 px-8 shadow-sm transition-all hover:-translate-y-1">
                    My Tasks
                  </Button>
              </div>
           </div>
        </div>

        {/* Strategic Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contentStats.map((stat, i) => (
            <Card key={i} className="bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2rem] overflow-hidden hover:shadow-xl transition-all duration-500">
              <CardContent className="p-6">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-opacity-10", `bg-${stat.color}-500 text-${stat.color}-600`)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">{stat.label}</div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-2">{stat.change}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* Active Tasks Queue */}
          <div className="xl:col-span-2 space-y-10">
            <Card className="bg-white border-0 shadow-[0_32px_80px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden">
              <CardHeader className="p-10 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Assigned Tasks</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Items requiring your immediate professional attention</CardDescription>
                  </div>
                  <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Layers className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 px-10 pb-10">
                <div className="space-y-4">
                  {activeTasks.map((task) => (
                    <div key={task.id} className="group p-6 rounded-[2rem] bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-500">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-5">
                             <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shadow-sm bg-white border border-slate-100")}>
                                <CheckCircle className={cn("h-5 w-5", `text-${task.color}-600`)} />
                             </div>
                             <div>
                                <h4 className="font-black text-slate-900 leading-tight">{task.title}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">From: {task.assignedBy}</span>
                                   <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-2 py-0 border-0", task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600')}>
                                      {task.priority} Priority
                                   </Badge>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="text-right">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Due</span>
                                <span className="text-xs font-bold text-slate-900">{task.deadline}</span>
                             </div>
                             <Button size="icon" variant="ghost" className="rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100">
                                <ArrowRight className="h-4 w-4" />
                             </Button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <Zap className="h-8 w-8 text-emerald-400 mb-6" />
                  <h3 className="text-xl font-black mb-2 tracking-tight">Content Performance</h3>
                  <p className="text-slate-400 text-sm font-medium mb-8">Your articles have been viewed <span className="text-white font-bold">4.2k times</span> this month.</p>
                  <Button className="w-full h-12 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl border border-white/10 backdrop-blur-md">
                    Analytics Dashboard
                  </Button>
               </Card>

               <Card className="bg-white border-0 shadow-[0_32px_80px_rgba(0,0,0,0.03)] rounded-[32px] p-8 flex flex-col justify-between">
                  <div>
                    <Calendar className="h-8 w-8 text-indigo-600 mb-6" />
                    <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Schedule Post</h3>
                    <p className="text-slate-500 text-sm font-medium">Plan your content calendar and automate your reach.</p>
                  </div>
                  <Button variant="ghost" className="mt-8 justify-between p-0 font-black text-slate-900 hover:bg-transparent group">
                    View Calendar
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </Button>
               </Card>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-10">
            <Card className="bg-white border border-slate-100 shadow-[0_32px_80px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden">
               <CardHeader className="p-10 pb-6 border-b border-slate-50">
                  <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Latest Updates
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  <div className="space-y-2">
                     {[
                       { action: "Admin approved your post", time: "10 mins ago", icon: Eye },
                       { action: "New comment on 'GST Guide'", time: "45 mins ago", icon: MessageSquare },
                       { action: "Daily tax rates updated", time: "2 hours ago", icon: Zap }
                     ].map((activity, i) => (
                       <div key={i} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-emerald-100 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                <activity.icon className="h-5 w-5" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-bold text-slate-900 leading-tight">{activity.action}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{activity.time}</p>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white">
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                     <Users className="h-6 w-6" />
                  </div>
                  <div>
                     <h4 className="text-lg font-black tracking-tight">Team Chat</h4>
                     <p className="text-xs font-bold text-blue-100 opacity-60">4 members online</p>
                  </div>
               </div>
               <Button className="w-full h-14 bg-white text-blue-700 hover:bg-blue-50 font-black rounded-2xl shadow-xl transition-all">
                  Open Messenger
               </Button>
            </Card>
          </div>
        </div>
      </m.div>
    </Layout>
  );
}
