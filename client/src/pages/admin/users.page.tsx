import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { 
  Users, Search, Filter, MoreVertical, Check, X, Clock, 
  UserCheck, UserX, Shield, Eye, Ban, UserPlus, Edit,
  Mail, Phone, Calendar, MapPin, Trash2, Zap, ArrowUpRight, ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Layout } from "@/components/admin/Layout";

const formatDate = (date: any, includeTime: boolean = false) => {
  if (!date) return "N/A";
  try {
    let d;
    if (typeof date.toDate === 'function') {
      d = date.toDate();
    } else if (date && typeof date._seconds === 'number') {
      d = new Date(date._seconds * 1000);
    } else {
      d = new Date(date);
    }
    
    if (isNaN(d.getTime())) return "N/A";
    return format(d, includeTime ? 'MMM dd, yyyy HH:mm' : 'MMM dd, yyyy');
  } catch (err) {
    return "N/A";
  }
};

interface User {
  id: string; // Clerk ID
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UsersManagementPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: response, isLoading, error } = useQuery<{
    success: boolean;
    data: { users: User[]; pagination: { total: number; pages: number; page: number; limit: number } };
  }>({
    queryKey: [`/api/admin/users?page=${page}&limit=${limit}&search=${searchTerm}`],
    enabled: !!currentUser && currentUser.role === 'admin',
  });

  const users = response?.data?.users || [];

  // User action mutations
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await apiRequest(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role })
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: data.message || "Role updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update role",
        variant: "destructive"
      });
    }
  });

  const assignCaMutation = useMutation({
    mutationFn: async ({ userId, caId }: { userId: string; caId: string | null }) => {
      const res = await apiRequest(`/api/admin/users/${userId}/assign-ca`, {
        method: "PATCH",
        body: JSON.stringify({ caId })
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: data.message || "CA assignment updated" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to assign CA",
        variant: "destructive"
      });
    }
  });

  // Get list of CAs for assignment dropdown
  const caUsers = users.filter((u: User) => u.role === 'ca');

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Admin',
      team_member: 'Team Member', 
      ca: 'CA Expert',
      user: 'User'
    };
    return labels[role] || role;
  };

  const userCounts = {
    total: response?.data?.pagination?.total || 0,
    active: users.filter((u: User) => u.status === 'active').length,
    pending: users.filter((u: User) => u.status === 'pending').length,
    ca: users.filter((u: User) => u.role === 'ca').length,
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-slate-500 font-medium">Synchronizing User Directory...</p>
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
             <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                <Zap className="w-3 h-3 fill-current" />
                Access Control
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
             <p className="text-slate-500 max-w-2xl text-sm font-medium">
               Manage identities, provision roles, and oversee platform permissions.
             </p>
          </div>
          <div className="flex items-center gap-3">
             <Button className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest shadow-sm">
               <UserPlus className="h-4 w-4 mr-2" />
               New Account
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
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Identities</p>
            <p className="text-2xl font-bold text-slate-900">{userCounts.total}</p>
          </Card>

          <Card className="border-none shadow-sm bg-white p-6 rounded-[32px] group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <UserCheck className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Profiles</p>
            <p className="text-2xl font-bold text-slate-900">{userCounts.active}</p>
          </Card>

          <Card className="border-none shadow-sm bg-white p-6 rounded-[32px] group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Clock className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Approval</p>
            <p className="text-2xl font-bold text-slate-900">{userCounts.pending}</p>
          </Card>

          <Card className="border-none shadow-sm bg-white p-6 rounded-[32px] group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Shield className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expert Network</p>
            <p className="text-2xl font-bold text-slate-900">{userCounts.ca}</p>
          </Card>
        </div>

        {/* Action Bar & Table */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="h-6 w-1 bg-blue-600 rounded-full" />
                 <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">User Directory</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500" />
                    <Input 
                      placeholder="Search users..." 
                      className="h-9 w-60 rounded-xl bg-white border-slate-100 pl-9 text-xs font-medium shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-32 rounded-xl bg-white border-slate-100 text-[10px] font-bold uppercase tracking-widest">
                       <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                       <SelectItem value="all">All Status</SelectItem>
                       <SelectItem value="active">Active</SelectItem>
                       <SelectItem value="pending">Pending</SelectItem>
                       <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                 </Select>

                 <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-9 w-32 rounded-xl bg-white border-slate-100 text-[10px] font-bold uppercase tracking-widest">
                       <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                       <SelectItem value="all">All Roles</SelectItem>
                       <SelectItem value="admin">Admin</SelectItem>
                       <SelectItem value="team_member">Team</SelectItem>
                       <SelectItem value="ca">Expert</SelectItem>
                       <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
           </div>

           <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
             <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-slate-50">
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Identity Profile</th>
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Access Role</th>
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Lifecycle</th>
                       <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Provisions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {filteredUsers.map((user: User) => (
                       <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                 {user.firstName?.[0]}{user.lastName?.[0]}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-900 leading-tight mb-0.5">{user.firstName} {user.lastName}</p>
                                 <p className="text-[10px] font-medium text-slate-400 truncate max-w-[200px]">{user.email}</p>
                              </div>
                           </div>
                         </td>
                         <td className="px-8 py-5">
                            <Badge className={cn(
                              "rounded-full px-2.5 py-1 text-[9px] font-bold border-none shadow-sm",
                              user.role === 'admin' ? "bg-red-50 text-red-600" :
                              user.role === 'ca' ? "bg-emerald-50 text-emerald-600" :
                              user.role === 'team_member' ? "bg-blue-50 text-blue-600" :
                              "bg-slate-100 text-slate-500"
                            )}>
                              {getRoleLabel(user.role).toUpperCase()}
                            </Badge>
                         </td>
                         <td className="px-8 py-5">
                            <Badge className={cn(
                              "rounded-full px-2.5 py-1 text-[9px] font-bold border-none",
                              user.status === 'active' ? "bg-emerald-50 text-emerald-600" :
                              user.status === 'pending' ? "bg-amber-50 text-amber-600" :
                              "bg-red-50 text-red-600"
                            )}>
                              {user.status.toUpperCase()}
                            </Badge>
                         </td>
                         <td className="px-8 py-5">
                            <div>
                               <p className="text-[11px] font-bold text-slate-900">{formatDate(user.createdAt)}</p>
                               <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">Joined Date</p>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-right">
                           <div className="flex items-center justify-end gap-2">
                             <Select
                               defaultValue={user.role}
                               onValueChange={(newRole) => {
                                 updateRoleMutation.mutate({ userId: user.id, role: newRole });
                               }}
                             >
                               <SelectTrigger className="w-[100px] h-8 text-[9px] font-bold uppercase tracking-widest rounded-lg border-slate-100">
                                 <SelectValue placeholder="Role" />
                               </SelectTrigger>
                               <SelectContent className="rounded-lg shadow-xl border-slate-100">
                                 <SelectItem value="user">User</SelectItem>
                                 <SelectItem value="team_member">Team</SelectItem>
                                 <SelectItem value="ca">Expert</SelectItem>
                                 <SelectItem value="admin">Admin</SelectItem>
                               </SelectContent>
                             </Select>

                             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50">
                               <Eye className="h-4 w-4" />
                             </Button>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 
                 {filteredUsers.length === 0 && (
                   <div className="py-24 text-center">
                     <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No users found</p>
                   </div>
                 )}
               </div>

               <div className="p-6 bg-slate-50/50 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Platform Pool: {userCounts.total}</p>
                  <div className="flex items-center gap-2">
                     <Button 
                       variant="ghost" 
                       className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900"
                       onClick={() => setPage(p => Math.max(1, p - 1))}
                       disabled={page === 1}
                     >
                        Previous
                     </Button>
                     <Button 
                       className="h-8 px-5 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-900 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50"
                       onClick={() => setPage(p => p + 1)}
                       disabled={!response?.data?.pagination || page >= response.data.pagination.pages}
                     >
                        Next Page
                     </Button>
                  </div>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </Layout>
  );
}
  );
}