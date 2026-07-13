import { useState } from 'react';
import { Layout } from '@/components/admin/Layout';
import { Card, CardContent } from '@/components/ui/card';
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
  Zap,
  ArrowRight
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type TriageItem = {
  id: string;
  sourceType: string;
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  status?: string;
  preferredTime?: string;
  source?: string;
  formId?: string | null;
  serviceIntent?: string | null;
  channelConsent?: {
    whatsapp?: {
      optedIn?: boolean;
      phone?: string;
    };
  } | null;
  whatsappStatus?: {
    consentStatus?: string;
    leadAcknowledgementStatus?: string;
  } | null;
  createdAt?: string;
};

function triagePriority(status?: string) {
  if (status === "needs_info") return "High";
  if (status === "new") return "Medium";
  return "Low";
}

function triageLabel(value?: string) {
  return (value || "new").replace(/_/g, " ");
}

function triageTitle(item: TriageItem) {
  return item.serviceIntent || item.service || item.source || "Customer intake";
}

function triageContact(item: TriageItem) {
  return item.phone || item.email || "No contact captured";
}

function hasWhatsappOptIn(item: TriageItem) {
  return item.channelConsent?.whatsapp?.optedIn === true || item.whatsappStatus?.consentStatus === "opted_in";
}

function triageTime(value?: string) {
  if (!value) return "New";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "New";
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function TeamDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const triageQuery = useQuery<{ items: TriageItem[]; total: number }>({
    queryKey: ["/api/team/triage"],
    queryFn: async () => {
      const response = await apiRequest("/api/team/triage");
      return response.json();
    },
  });

  const updateTriage = useMutation({
    mutationFn: async ({ id, status, internalNote }: { id: string; status: string; internalNote?: string }) => {
      const response = await apiRequest(`/api/team/triage/consultation_requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, internalNote }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/triage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/requests/consultations"] });
      toast({ title: "Triage updated", description: "The intake queue is ready for the next action." });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error?.message || "Please try again.", variant: "destructive" });
    },
  });

  const activeTasks = (triageQuery.data?.items || []).filter((item) => {
    const haystack = `${item.name || ""} ${item.email || ""} ${item.phone || ""} ${item.service || ""} ${item.message || ""}`.toLowerCase();
    return !searchTerm || haystack.includes(searchTerm.toLowerCase());
  });

  const contentStats = [
    { label: "Open Intake", value: String(activeTasks.length).padStart(2, "0"), change: "Live", icon: MessageSquare, color: "blue" },
    { label: "Needs Info", value: String(activeTasks.filter((item) => item.status === "needs_info").length).padStart(2, "0"), change: "Follow", icon: Clock, color: "amber" },
    { label: "Escalated", value: String(activeTasks.filter((item) => String(item.status || "").startsWith("escalated")).length).padStart(2, "0"), change: "Review", icon: Activity, color: "indigo" },
    { label: "New Today", value: String(activeTasks.filter((item) => item.status === "new").length).padStart(2, "0"), change: "Now", icon: FileText, color: "emerald" }
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
              Triage new consultations, follow up on missing information, and escalate cases to admin or CA owners.
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
            <Card key={i} className="border-slate-200 bg-white p-3 rounded-lg shadow-none group transition-all">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={cn("rounded-lg p-2",
                       stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                       stat.color === 'amber' ? "bg-amber-50 text-amber-600" :
                       stat.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                       "bg-emerald-50 text-emerald-600"
                     )}>
                       <stat.icon className="h-4 w-4" />
                     </div>
                     <p className="mb-0 text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-xl font-bold text-slate-900 leading-none">{stat.value}</span>
                     <Badge variant="outline" className="text-[9px] font-bold border-none bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase leading-none">
                       {stat.change}
                     </Badge>
                  </div>
               </div>
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
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
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
                                 <p className="text-sm font-bold text-slate-900 leading-tight mb-0.5">{triageTitle(task)}</p>
                                 <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{task.name || "Customer"} / {task.formId || task.sourceType}</p>
                              </div>
                           </div>
                         </td>
                         <td className="px-8 py-5">
                           <p className="text-xs font-bold text-slate-600">{triageContact(task)}</p>
                           <div className="mt-1 flex flex-wrap items-center gap-2">
                             <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{triageLabel(task.status)}</p>
                             {hasWhatsappOptIn(task) ? (
                               <Badge className="rounded-full border-none bg-emerald-50 px-2 py-0.5 text-[8px] font-bold uppercase text-emerald-700">
                                 WhatsApp
                               </Badge>
                             ) : null}
                           </div>
                         </td>
                         <td className="px-8 py-5">
                           <Badge className={cn(
                             "rounded-full px-3 py-1 text-[9px] font-bold border-none shadow-sm",
                             triagePriority(task.status) === 'High' ? "bg-red-50 text-red-600" :
                             triagePriority(task.status) === 'Medium' ? "bg-blue-50 text-blue-600" :
                             "bg-emerald-50 text-emerald-600"
                           )}>
                             {triagePriority(task.status).toUpperCase()}
                           </Badge>
                         </td>
                         <td className="px-8 py-5">
                           <p className="text-xs font-bold text-slate-900">{triageTime(task.createdAt)}</p>
                         </td>
                         <td className="px-8 py-5 text-right">
                           <div className="flex flex-wrap justify-end gap-2">
                             <Button
                               variant="outline"
                               size="sm"
                               className="h-8 rounded-lg border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest"
                               disabled={updateTriage.isPending}
                               onClick={() => updateTriage.mutate({ id: task.id, status: "contacted" })}
                             >
                               Contacted
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               className="h-8 rounded-lg border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest"
                               disabled={updateTriage.isPending}
                               onClick={() => updateTriage.mutate({ id: task.id, status: "needs_info" })}
                             >
                               Need info
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               className="h-8 rounded-lg border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest"
                               disabled={updateTriage.isPending}
                               onClick={() => updateTriage.mutate({ id: task.id, status: "escalated_ca" })}
                             >
                               Escalate CA
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               className="h-8 rounded-lg border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest"
                               disabled={updateTriage.isPending}
                               onClick={() => updateTriage.mutate({ id: task.id, status: "closed" })}
                             >
                               Close
                             </Button>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-8 w-8 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50"
                               disabled={updateTriage.isPending}
                               onClick={() => updateTriage.mutate({ id: task.id, status: "escalated_admin" })}
                               title="Escalate to admin"
                             >
                               <ArrowRight className="h-4 w-4" />
                             </Button>
                           </div>
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
                         <p className="text-sm font-bold leading-tight text-slate-900">{triageTitle(task)}</p>
                         <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">{task.name || "Customer"} / {triageLabel(task.status)}</p>
                       </div>
                     </div>
                     <div className="flex items-center justify-between gap-3">
                       <div className="min-w-0">
                         <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Coordinator</p>
                         <p className="truncate text-xs font-bold text-slate-700">{triageContact(task)}</p>
                         {hasWhatsappOptIn(task) ? (
                           <Badge className="mt-2 rounded-full border-none bg-emerald-50 px-2 py-0.5 text-[8px] font-bold uppercase text-emerald-700">
                             WhatsApp opted in
                           </Badge>
                         ) : null}
                       </div>
                       <div className="flex shrink-0 items-center gap-2">
                         <Badge className={cn(
                           "rounded-full border-none px-3 py-1 text-[9px] font-bold",
                           triagePriority(task.status) === 'High' ? "bg-red-50 text-red-600" :
                           triagePriority(task.status) === 'Medium' ? "bg-blue-50 text-blue-600" :
                           "bg-emerald-50 text-emerald-600"
                         )}>
                           {triagePriority(task.status).toUpperCase()}
                         </Badge>
                         <span className="text-xs font-bold text-slate-900">{triageTime(task.createdAt)}</span>
                       </div>
                     </div>
                     <div className="flex flex-wrap gap-2">
                       <Button
                         variant="outline"
                         size="sm"
                         className="h-8 rounded-lg border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest"
                         disabled={updateTriage.isPending}
                         onClick={() => updateTriage.mutate({ id: task.id, status: "contacted" })}
                       >
                         Contacted
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         className="h-8 rounded-lg border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest"
                         disabled={updateTriage.isPending}
                         onClick={() => updateTriage.mutate({ id: task.id, status: "needs_info" })}
                       >
                         Need info
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         className="h-8 rounded-lg border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest"
                         disabled={updateTriage.isPending}
                         onClick={() => updateTriage.mutate({ id: task.id, status: "escalated_admin" })}
                       >
                         Escalate admin
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         className="h-8 rounded-lg border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest"
                         disabled={updateTriage.isPending}
                         onClick={() => updateTriage.mutate({ id: task.id, status: "escalated_ca" })}
                       >
                         Escalate CA
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         className="h-8 rounded-lg border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest"
                         disabled={updateTriage.isPending}
                         onClick={() => updateTriage.mutate({ id: task.id, status: "closed" })}
                       >
                         Close
                       </Button>
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
