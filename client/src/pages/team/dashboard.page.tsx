import { Layout } from '@/components/admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  Activity, 
  Plus, 
  MessageSquare, 
  Layers,
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronRight,
  Briefcase,
  Sparkles,
  ArrowUpRight,
  Zap,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { m } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

export default function TeamDashboard() {
  const { user } = useAuth();

  const activeTasks = [
    { id: 1, title: "Review 'Section 80C' Article", assignedBy: "Admin", priority: "High", deadline: "Today", color: "red", status: "Pending" },
    { id: 2, title: "Upload Daily Tax Updates", assignedBy: "System", priority: "Medium", deadline: "2 PM", color: "blue", status: "Active" },
    { id: 3, title: "Respond to Help Center Tickets", assignedBy: "Admin", priority: "Low", deadline: "EOD", color: "emerald", status: "Active" }
  ];

  const contentStats = [
    { label: "Blog Posts", value: "24", change: "+3", icon: FileText, color: "blue" },
    { label: "Reviews", value: "05", change: "-2", icon: Clock, color: "amber" },
    { label: "Total Reach", value: "12.5k", change: "+12%", icon: Activity, color: "indigo" },
    { label: "Comments", value: "82", change: "+14", icon: MessageSquare, color: "emerald" }
  ];

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
               <Zap className="w-3 h-3 fill-current" />
               Operations Center
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Team Portal</h1>
            <p className="text-slate-500 max-w-2xl text-sm font-medium">
              Collaborate on content, manage tax updates, and maintain the platform's knowledge base.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Link href="/admin/blog-management">
               <Button className="h-10 rounded-lg bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800">
                 <Plus className="h-4 w-4 mr-2" />
                 New Post
               </Button>
             </Link>
          </div>
        </div>

        {/* Content Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contentStats.map((stat, i) => (
            <Card key={i} className="rounded-lg border-slate-200 bg-white p-5 shadow-none">
               <div className="flex justify-between items-start mb-4">
                  <div className={cn("rounded-lg p-3",
                    stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                    stat.color === 'amber' ? "bg-amber-50 text-amber-600" :
                    stat.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                    "bg-emerald-50 text-emerald-600"
                  )}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold border-none bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase">
                    {stat.change}
                  </Badge>
               </div>
               <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{stat.label}</p>
               <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Action Bar & Task Management */}
        <div className="space-y-6">
           <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                 <div className="h-6 w-1 bg-blue-600 rounded-full" />
                 <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Production Pipeline</h2>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                 <div className="relative group w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500" />
                    <Input 
                      placeholder="Search tasks..." 
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
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Task Detail</th>
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Coordinator</th>
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Priority</th>
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Timeframe</th>
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {activeTasks.map((task) => (
                       <tr key={task.id} className="group hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-5">
                           <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 transition-colors group-hover:text-blue-600">
                                 <Layers className="h-4 w-4" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-900 leading-tight mb-0.5">{task.title}</p>
                                 <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{task.status}</p>
                              </div>
                           </div>
                         </td>
                         <td className="px-8 py-5">
                           <p className="text-xs font-bold text-slate-600">{task.assignedBy}</p>
                         </td>
                         <td className="px-8 py-5">
                           <Badge className={cn(
                             "rounded-full px-3 py-1 text-[9px] font-bold border-none shadow-sm",
                             task.priority === 'High' ? "bg-red-50 text-red-600" :
                             task.priority === 'Medium' ? "bg-blue-50 text-blue-600" :
                             "bg-emerald-50 text-emerald-600"
                           )}>
                             {task.priority.toUpperCase()}
                           </Badge>
                         </td>
                         <td className="px-8 py-5">
                           <p className="text-xs font-bold text-slate-900">{task.deadline}</p>
                         </td>
                         <td className="px-8 py-5 text-right">
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50">
                             <ArrowRight className="h-4 w-4" />
                           </Button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               <div className="divide-y divide-slate-100 md:hidden">
                 {activeTasks.map((task) => (
                   <div key={task.id} className="space-y-3 p-4">
                     <div className="flex items-start gap-3">
                       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                         <Layers className="h-4 w-4" />
                       </div>
                       <div className="min-w-0 flex-1">
                         <p className="text-sm font-bold leading-tight text-slate-900">{task.title}</p>
                         <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">{task.status}</p>
                       </div>
                     </div>
                     <div className="flex items-center justify-between gap-3">
                       <div className="min-w-0">
                         <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Coordinator</p>
                         <p className="truncate text-xs font-bold text-slate-700">{task.assignedBy}</p>
                       </div>
                       <div className="flex shrink-0 items-center gap-2">
                         <Badge className={cn(
                           "rounded-full border-none px-3 py-1 text-[9px] font-bold",
                           task.priority === 'High' ? "bg-red-50 text-red-600" :
                           task.priority === 'Medium' ? "bg-blue-50 text-blue-600" :
                           "bg-emerald-50 text-emerald-600"
                         )}>
                           {task.priority.toUpperCase()}
                         </Badge>
                         <span className="text-xs font-bold text-slate-900">{task.deadline}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="flex flex-col gap-3 bg-slate-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Queue Volume: {activeTasks.length}</p>
                  <div className="flex items-center gap-2">
                     <Button variant="ghost" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900">Previous</Button>
                     <Button className="h-8 px-5 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-900 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50">Next Page</Button>
                  </div>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </Layout>
  );
}
