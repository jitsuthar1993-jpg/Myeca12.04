import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
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

export default function CADashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/ca/stats"],
    enabled: isAuthenticated && (user?.role === 'ca' || user?.role === 'admin'),
  });

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/ca/clients"],
    enabled: isAuthenticated && (user?.role === 'ca' || user?.role === 'admin'),
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
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">CA Expert Panel</h1>
            <p className="text-slate-500 max-w-2xl text-sm font-medium">
              Manage client portfolios, monitor filing statuses, and oversee compliance lifecycles.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-xl h-10 px-4 font-bold text-xs uppercase tracking-widest border-slate-200">
               Portfolio Report
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-white p-6 rounded-[32px] group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Users className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Clients</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalClients}</p>
          </Card>

          <Card className="border-none shadow-sm bg-white p-6 rounded-[32px] group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <CheckCircle className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Returns Filed</p>
            <p className="text-2xl font-bold text-slate-900">{stats.completedFilings}</p>
          </Card>

          <Card className="border-none shadow-sm bg-white p-6 rounded-[32px] group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Clock className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Actions</p>
            <p className="text-2xl font-bold text-slate-900">{stats.pendingFilings}</p>
          </Card>

          <Card className="border-none shadow-sm bg-white p-6 rounded-[32px] group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                <TrendingUp className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-violet-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Annual Volume</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalFilings}</p>
          </Card>
        </div>

        {/* Portfolio Tabs */}
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="bg-slate-50 p-1 rounded-xl h-12 inline-flex border border-slate-100/50">
            <TabsTrigger value="clients" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase tracking-widest">Active Clients</TabsTrigger>
            <TabsTrigger value="filings" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase tracking-widest">Filing History</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                   <div>
                      <CardTitle className="text-lg font-bold">Client Portfolios</CardTitle>
                      <CardDescription className="text-xs font-medium text-slate-500">Search and oversee assigned tax profiles.</CardDescription>
                   </div>
                   <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500" />
                      <Input 
                        placeholder="Search clients..." 
                        className="h-9 w-60 rounded-xl bg-slate-50 border-none pl-9 text-xs font-medium"
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
                                           <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
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

          <TabsContent value="filings" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white p-12 text-center">
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
  );
}
