import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Shield, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Bell,
  Zap,
  Briefcase,
  FileText,
  Phone,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { Layout } from "@/components/admin/Layout";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/user/dashboard"],
  });

  const apiActiveServices = (dashboardData as any)?.activeServices || [];
  
  const getInitials = () => {
    if (!user) return 'U';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) return user.firstName[0].toUpperCase();
    return 'U';
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profile Settings</h1>
          <p className="text-slate-500 max-w-2xl">
            Manage your personal information, security preferences, and account status.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Profile Overview */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[32px] border-none shadow-sm overflow-hidden bg-white">
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 relative" />
              <CardContent className="relative px-6 pb-8">
                <div className="flex flex-col items-center -mt-12">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 border-4 border-white shadow-xl flex items-center justify-center text-2xl font-black text-white">
                    {getInitials()}
                  </div>
                  <div className="mt-4 text-center">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-slate-500 font-medium text-xs mt-1">{user?.email}</p>
                    
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none font-bold px-3 py-1 uppercase text-[9px] tracking-widest">
                        {user?.role || 'User'}
                      </Badge>
                      {user?.isVerified && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold px-3 py-1 flex items-center gap-1 uppercase text-[9px] tracking-widest">
                          <Shield className="w-3 h-3" /> Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-1">
                  <Link href="/settings/account">
                    <Button variant="ghost" className="w-full justify-between h-11 rounded-xl hover:bg-slate-50 group">
                      <div className="flex items-center gap-3">
                        <Settings className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600">Settings</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => logout()}
                    variant="ghost" 
                    className="w-full justify-between h-11 rounded-xl hover:bg-red-50 text-red-600 group"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-semibold">Sign Out</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Detailed Info */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="rounded-[32px] border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 tracking-tight">Personal Details</CardTitle>
                    <CardDescription className="text-slate-500 text-xs font-medium">Standard information linked to your legal identity</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-900 text-[13px]">
                      {user?.firstName} {user?.lastName}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-900 text-[13px] flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {user?.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Contact Number</label>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-400 italic text-[13px] flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Not Linked
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Registration Date</label>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-900 text-[13px] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button className="rounded-xl bg-slate-900 hover:bg-black px-6 h-11 font-bold text-sm shadow-sm">
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Card className="border-none shadow-sm bg-white p-6 rounded-3xl flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                     <Shield className="h-6 w-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Security</p>
                     <p className="text-sm font-bold text-slate-900">2FA Protected</p>
                  </div>
               </Card>
               <Card className="border-none shadow-sm bg-white p-6 rounded-3xl flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                     <Zap className="h-6 w-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Active Services</p>
                     <p className="text-sm font-bold text-slate-900">{apiActiveServices.length} Filings</p>
                  </div>
               </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
  );
}
