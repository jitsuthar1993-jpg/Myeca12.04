import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, FileText, Clock, CheckCircle, AlertCircle,
  TrendingUp, Search, Eye, Briefcase, LayoutDashboard,
  FolderOpen, ArrowRight, ChevronRight, Loader2, Plus, ArrowUpRight
} from "lucide-react";
import { m } from "framer-motion";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Layout } from "@/components/admin/Layout";
import { normalizeAppRole } from "@shared/app-roles";
import { useToast } from "@/hooks/use-toast";
import { buildCaActionQueue } from "@/lib/ca-action-queue";

export default function CADashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const role = normalizeAppRole(user?.role);
  const canUseCaWorkspace = isAuthenticated && (role === "ca" || role === "admin");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/ca/stats"],
    enabled: canUseCaWorkspace,
  });

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/ca/clients"],
    enabled: canUseCaWorkspace,
  });

  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ["/api/ca/cases"],
    enabled: canUseCaWorkspace,
  });

  const { data: remindersData, isLoading: remindersLoading } = useQuery({
    queryKey: ["/api/reminders"],
    enabled: canUseCaWorkspace,
  });

  const updateCase = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const response = await apiRequest(`/api/ca/cases/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ca/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-events"] });
      toast({ title: "Case updated", description: "The workflow timeline and reminders were refreshed." });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error?.message || "Please try again.", variant: "destructive" });
    },
  });

  const stats = (statsData as any)?.data || {
    totalClients: 0,
    totalFilings: 0,
    pendingFilings: 0,
    completedFilings: 0,
  };

  const clients = ((clientsData as any)?.data?.clients || []).filter((client: any) =>
    searchTerm === "" ||
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const assignedCases = ((casesData as any)?.data?.cases || []).filter((serviceCase: any) =>
    searchTerm === "" ||
    serviceCase.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    serviceCase.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    serviceCase.serviceTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const activeCaseCount = assignedCases.filter((serviceCase: any) =>
    !["completed", "closed", "cancelled"].includes(serviceCase.status || "")
  ).length;
  const reminders = ((remindersData as any)?.reminders || []).filter((reminder: any) =>
    searchTerm === "" ||
    reminder.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reminder.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reminder.caseId?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const actionQueue = buildCaActionQueue({
    cases: assignedCases,
    reminders,
  });
  const activeReminderCount = reminders.filter((reminder: any) => (reminder.status || "pending") === "pending").length;

  if (authLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Initializing Expert Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">CA Expert Panel</h1>
            <p className="text-slate-500 max-w-2xl text-sm font-medium">
              Manage client portfolios, monitor filing statuses, and oversee compliance lifecycles.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="h-10 rounded-lg border-slate-200 px-4 text-sm font-bold">
               Portfolio Report
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
          <Card className="border-slate-200 bg-white p-3 rounded-lg shadow-none group transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Users className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0">Assigned Clients</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 leading-none">{stats.totalClients}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 bg-white p-3 rounded-lg shadow-none group transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0">Returns Filed</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 leading-none">{stats.completedFilings}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 bg-white p-3 rounded-lg shadow-none group transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Clock className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0">Pending Actions</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 leading-none">{stats.pendingFilings}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-amber-500 transition-colors" />
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 bg-white p-3 rounded-lg shadow-none group transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0">Reminders</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 leading-none">{activeReminderCount}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-rose-500 transition-colors" />
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 bg-white p-3 rounded-lg shadow-none group transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Briefcase className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0">Assigned Cases</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 leading-none">{activeCaseCount}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 bg-white p-3 rounded-lg shadow-none group transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0">Annual Volume</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 leading-none">{stats.totalFilings}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-violet-500 transition-colors" />
              </div>
            </div>
          </Card>
        </div>
        <section aria-label="CA action inbox" className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">Action inbox</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">Cases needing a next move</h2>
              <p className="mt-1 text-xs font-medium text-slate-600">Prioritized from reminders, client responses, and missing case documents.</p>
            </div>
            <Badge className="w-fit border-none bg-white px-3 py-1 text-xs font-bold text-amber-800">{actionQueue.length} open action{actionQueue.length === 1 ? '' : 's'}</Badge>
          </div>
          {actionQueue.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {actionQueue.map((action) => (
                <Link key={action.id} href={action.href}>
                  <div className="flex min-h-[112px] items-start gap-3 rounded-lg border border-white bg-white p-3 shadow-sm transition hover:border-amber-300 hover:shadow-md">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      action.tone === "urgent" && "bg-rose-50 text-rose-600",
                      action.tone === "attention" && "bg-amber-50 text-amber-600",
                      action.tone === "routine" && "bg-blue-50 text-blue-600",
                    )}>
                      {action.kind === "reminder" ? <Clock className="h-4 w-4" /> : action.kind === "documents" ? <FolderOpen className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold leading-tight text-slate-900">{action.title}</p>
                      <p className="mt-1 line-clamp-3 text-xs font-medium leading-snug text-slate-500">{action.detail}</p>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-blue-700">Open client records</p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-white bg-white p-3 text-sm font-semibold text-slate-600">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              No unresolved client actions are waiting in the current queue.
            </div>
          )}
        </section>



        {/* Portfolio Tabs */}
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="inline-flex h-11 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <TabsTrigger value="clients" className="rounded-md px-5 text-xs font-bold uppercase tracking-[0.12em] data-[state=active]:bg-white">Active Clients</TabsTrigger>
            <TabsTrigger value="cases" className="rounded-md px-5 text-xs font-bold uppercase tracking-[0.12em] data-[state=active]:bg-white">Assigned Cases</TabsTrigger>
            <TabsTrigger value="reminders" className="rounded-md px-5 text-xs font-bold uppercase tracking-[0.12em] data-[state=active]:bg-white">Reminders</TabsTrigger>
            <TabsTrigger value="filings" className="rounded-md px-5 text-xs font-bold uppercase tracking-[0.12em] data-[state=active]:bg-white">Filing History</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-none">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-5">
                   <div>
                      <CardTitle className="text-lg font-bold">Client Portfolios</CardTitle>
                      <CardDescription className="text-xs font-medium text-slate-500">Search and oversee assigned tax profiles.</CardDescription>
                   </div>
                   <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500" />
                      <Input
                        placeholder="Search clients..."
                        className="h-9 w-60 rounded-lg border-slate-200 bg-slate-50 pl-9 text-xs font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   {clientsLoading ? (
                      <div className="p-12 text-center">
                         <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                         <p className="text-slate-500 font-medium">Synchronizing client data...</p>
                      </div>
                   ) : (
                      <div className="overflow-x-auto">
                         <table className="w-full text-left border-collapse">
                            <thead>
                               <tr className="border-b border-slate-50">
                                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile</th>
                                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Stats</th>
                                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {clients.map((client: any) => (
                                  <tr key={client.id} className="group hover:bg-slate-50/50 transition-colors">
                                     <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                                              {client.firstName?.[0]}{client.lastName?.[0]}
                                           </div>
                                           <div>
                                              <p className="text-sm font-bold text-slate-900">{client.firstName} {client.lastName}</p>
                                              <p className="text-[10px] font-medium text-slate-500">{client.email}</p>
                                           </div>
                                        </div>
                                     </td>
                                     <td className="px-8 py-4">
                                        <div className="flex items-center justify-center gap-4">
                                           <div className="text-center">
                                              <p className="text-sm font-bold text-slate-900 leading-none">{client.filingCount || 0}</p>
                                              <p className="text-[8px] font-bold text-emerald-600 uppercase mt-1">Filed</p>
                                           </div>
                                           <div className="text-center">
                                              <p className="text-sm font-bold text-amber-600 leading-none">{client.pendingCount || 0}</p>
                                              <p className="text-[8px] font-bold text-amber-500 uppercase mt-1">Pending</p>
                                           </div>
                                        </div>
                                     </td>
                                     <td className="px-8 py-4">
                                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] uppercase tracking-widest px-2.5 py-1">
                                           {client.status || 'Active'}
                                        </Badge>
                                     </td>
                                     <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                           <Link href={`/ca/clients/${client.id}/documents`}>
                                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                 <FolderOpen className="h-4 w-4" />
                                              </Button>
                                           </Link>
                                           <Link href={`/ca/clients/${client.id}/filings`}>
                                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                 <ArrowRight className="h-4 w-4" />
                                              </Button>
                                           </Link>
                                        </div>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                         {clients.length === 0 && (
                            <div className="p-12 text-center">
                               <p className="text-sm font-bold text-slate-400">No matching clients found.</p>
                            </div>
                         )}
                      </div>
                   )}
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="cases" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-none">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-5">
                   <div>
                      <CardTitle className="text-lg font-bold">Assigned Case Queue</CardTitle>
                      <CardDescription className="text-xs font-medium text-slate-500">Review submitted service cases, MY ITR handoffs, and linked document counts.</CardDescription>
                   </div>
                   <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500" />
                      <Input
                        placeholder="Search cases..."
                        className="h-9 w-60 rounded-lg border-slate-200 bg-slate-50 pl-9 text-xs font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   {casesLoading ? (
                      <div className="p-12 text-center">
                         <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                         <p className="text-slate-500 font-medium">Loading assigned cases...</p>
                      </div>
                   ) : (
                      <div className="overflow-x-auto">
                         <Table>
                            <TableHeader>
                               <TableRow>
                                  <TableHead>Case</TableHead>
                                  <TableHead>Client</TableHead>
                                  <TableHead>Documents</TableHead>
                                  <TableHead>Tax Return</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                               </TableRow>
                            </TableHeader>
                            <TableBody>
                               {assignedCases.map((serviceCase: any) => (
                                  <TableRow key={serviceCase.id}>
                                     <TableCell>
                                        <p className="text-sm font-bold text-slate-900">{serviceCase.serviceTitle || "Service case"}</p>
                                        <p className="text-xs font-medium text-slate-500">{serviceCase.serviceCategory || "Workspace request"}</p>
                                     </TableCell>
                                     <TableCell>
                                        <p className="text-sm font-bold text-slate-900">{serviceCase.clientName || serviceCase.userName || "Client"}</p>
                                        <Badge className="mt-1 border-none bg-slate-50 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                           {(serviceCase.status || "pending").replace(/_/g, " ")}
                                        </Badge>
                                     </TableCell>
                                     <TableCell>
                                        <p className="text-sm font-bold text-slate-900">{serviceCase.documentCount || 0}</p>
                                        <p className="text-[10px] font-medium text-slate-500">{serviceCase.latestDocumentAt ? new Date(serviceCase.latestDocumentAt).toLocaleDateString("en-IN") : "No uploads"}</p>
                                     </TableCell>
                                     <TableCell>
                                        <p className="text-sm font-bold text-slate-900">{serviceCase.taxReturn?.recommendedForm || "Not linked"}</p>
                                        <p className="text-[10px] font-medium text-slate-500">{serviceCase.taxReturn?.assessmentYear || "AY pending"}</p>
                                     </TableCell>
                                     <TableCell className="text-right">
                                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                                           <Button
                                             variant="outline"
                                             size="sm"
                                             className="h-8 rounded-lg border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest"
                                             disabled={updateCase.isPending}
                                             onClick={() =>
                                               updateCase.mutate({
                                                 id: serviceCase.id,
                                                 payload: {
                                                   status: "in_progress",
                                                   caNote: "CA review started.",
                                                 },
                                               })
                                             }
                                           >
                                             Start
                                           </Button>
                                           <Button
                                             variant="outline"
                                             size="sm"
                                             className="h-8 rounded-lg border-slate-200 px-3 text-[10px] font-bold uppercase tracking-widest"
                                             disabled={updateCase.isPending}
                                             onClick={() =>
                                               updateCase.mutate({
                                                 id: serviceCase.id,
                                                 payload: {
                                                   status: "client_response_needed",
                                                   caNote: "Client response needed before the next review step.",
                                                   reminderMessage: "Please share the missing information requested by your CA.",
                                                   reminderDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                                                 },
                                               })
                                             }
                                           >
                                             Need info
                                           </Button>
                                           {serviceCase.userId && (
                                             <Link href={`/ca/clients/${serviceCase.userId}/documents`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                   <FolderOpen className="h-4 w-4" />
                                                </Button>
                                             </Link>
                                           )}
                                           {serviceCase.userId && (
                                             <Link href={`/ca/clients/${serviceCase.userId}/filings`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                   <ArrowRight className="h-4 w-4" />
                                                </Button>
                                             </Link>
                                           )}
                                        </div>
                                     </TableCell>
                                  </TableRow>
                               ))}
                               {assignedCases.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-sm font-bold text-slate-400">
                                      No assigned cases found.
                                    </TableCell>
                                  </TableRow>
                               )}
                            </TableBody>
                         </Table>
                      </div>
                   )}
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="reminders" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-none">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-5">
                   <div>
                      <CardTitle className="text-lg font-bold">Assigned Reminder Queue</CardTitle>
                      <CardDescription className="text-xs font-medium text-slate-500">Track missing-document requests, client-response items, and due follow-ups.</CardDescription>
                   </div>
                   <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500" />
                      <Input
                        placeholder="Search reminders..."
                        className="h-9 w-60 rounded-lg border-slate-200 bg-slate-50 pl-9 text-xs font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   {remindersLoading ? (
                      <div className="p-12 text-center">
                         <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                         <p className="text-slate-500 font-medium">Loading reminder actions...</p>
                      </div>
                   ) : (
                      <div className="overflow-x-auto">
                         <Table>
                            <TableHeader>
                               <TableRow>
                                  <TableHead>Reminder</TableHead>
                                  <TableHead>Priority</TableHead>
                                  <TableHead>Due</TableHead>
                                  <TableHead>Status</TableHead>
                               </TableRow>
                            </TableHeader>
                            <TableBody>
                               {reminders.map((reminder: any) => (
                                  <TableRow key={reminder.id}>
                                     <TableCell>
                                        <p className="text-sm font-bold text-slate-900">{reminder.title || "Workflow reminder"}</p>
                                        <p className="max-w-lg text-xs font-medium text-slate-500">{reminder.message || "No message recorded."}</p>
                                        {reminder.caseId && (
                                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Case linked</p>
                                        )}
                                     </TableCell>
                                     <TableCell>
                                        <Badge className="border-none bg-rose-50 text-[9px] font-bold uppercase tracking-widest text-rose-600">
                                           {(reminder.priority || "medium").replace(/_/g, " ")}
                                        </Badge>
                                     </TableCell>
                                     <TableCell>
                                        <p className="text-xs font-bold text-slate-700">
                                          {reminder.dueAt ? new Date(reminder.dueAt).toLocaleString("en-IN") : "Immediate"}
                                        </p>
                                     </TableCell>
                                     <TableCell>
                                        <Badge className="border-none bg-slate-50 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                           {(reminder.status || "pending").replace(/_/g, " ")}
                                        </Badge>
                                     </TableCell>
                                  </TableRow>
                               ))}
                               {reminders.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-sm font-bold text-slate-400">
                                      No assigned reminder actions found.
                                    </TableCell>
                                  </TableRow>
                               )}
                            </TableBody>
                         </Table>
                      </div>
                   )}
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="filings" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Card className="overflow-hidden rounded-lg border-slate-200 bg-white p-6 text-center shadow-none">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                   <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Comprehensive Filing History</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm font-medium">Bulk filing views and history logs are currently being optimized for Expert performance.</p>
                <Button variant="outline" className="mt-8 rounded-xl px-10 h-11 font-bold text-xs uppercase tracking-widest border-slate-100 hover:bg-slate-50">Request Access</Button>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
