import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, Save, Lock, User, Shield, CreditCard, Bell, 
  Mail, Phone, Calendar, LogOut, ShieldCheck, Zap, 
  ChevronRight, Camera, Sparkles, Globe, Fingerprint
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MfaEnrollment } from "@/components/auth/MfaEnrollment";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/admin/Layout";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export default function UnifiedAccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      try {
        const res = await apiRequest("/api/profile");
        const data = await res.json();
        return data.data?.user;
      } catch (e) {
        return null;
      }
    },
  });

  useEffect(() => {
    if (profileData) {
      profileForm.reset({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
      });
    } else if (user) {
      profileForm.reset({
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        email: user.email || "",
        phone: "",
      });
    }
  }, [profileData, user, profileForm]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Profile Updated", description: "Your changes have been saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: (error: any) => {
      toast({ title: "Update Failed", description: error.message || "Could not save profile changes.", variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/change-password", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Password Changed", description: "Your security credentials have been updated." });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Security Update Failed", description: error.message || "Failed to change password.", variant: "destructive" });
    },
  });

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <Layout title="Account Settings">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">User Preferences</span>
             </div>
             <h1 className="text-4xl font-black tracking-tight text-slate-900">Account Control</h1>
             <p className="text-slate-500 font-medium text-sm">Unified management of your profile, security and billing.</p>
          </div>
          <Button 
            onClick={() => logout()}
            variant="ghost" 
            className="h-11 px-6 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold gap-2 transition-all border border-red-100/50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start bg-slate-50/50 rounded-[48px] p-2">
          {/* Sticky Left Sidebar Menu */}
          <div className="lg:w-80 shrink-0 w-full space-y-6 lg:sticky lg:top-[112px]">
            <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-100/50">
               <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-500 relative">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/20 to-transparent" />
               </div>
               <CardContent className="relative px-6 pb-8">
                  <div className="flex flex-col items-center -mt-16">
                     <div className="relative group">
                        <div className="w-32 h-32 rounded-[40px] bg-white p-2 shadow-2xl">
                           <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-5xl font-black text-blue-600 border border-blue-100">
                              {getInitials()}
                           </div>
                        </div>
                        <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all border border-slate-100 group-hover:scale-110">
                           <Camera className="h-5 w-5" />
                        </button>
                     </div>
                     <div className="mt-6 text-center">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.firstName} {user?.lastName}</h2>
                        <div className="flex items-center justify-center gap-2 mt-2">
                           <Badge variant="outline" className="bg-blue-50 text-blue-700 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5">
                              {user?.role?.replace('_', ' ')}
                           </Badge>
                           {user?.isVerified && (
                              <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                 <ShieldCheck className="h-3 w-3" />
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="mt-10 space-y-2">
                     {[
                        { id: 'profile', label: 'General Profile', icon: User, desc: 'Identity & Contact' },
                        { id: 'security', label: 'Security & Access', icon: ShieldCheck, desc: 'Passwords & MFA' },
                        { id: 'billing', label: 'Billing & Plans', icon: CreditCard, desc: 'Subscriptions' },
                        { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alert settings' },
                     ].map((tab) => (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={cn(
                              "w-full flex items-center gap-4 px-5 py-4 rounded-[28px] transition-all duration-300 text-left group",
                              activeTab === tab.id 
                                 ? "bg-blue-600 text-white shadow-xl shadow-blue-100" 
                                 : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                           )}
                        >
                           <div className={cn(
                              "h-11 w-11 rounded-[18px] flex items-center justify-center transition-colors",
                              activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"
                           )}>
                              <tab.icon className="h-5 w-5" />
                           </div>
                           <div className="flex flex-col min-w-0">
                              <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                              <span className={cn("text-[10px] font-medium truncate", activeTab === tab.id ? "text-blue-100" : "text-slate-400")}>{tab.desc}</span>
                           </div>
                           {activeTab === tab.id && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
                        </button>
                     ))}
                  </div>
               </CardContent>
            </Card>

            <div className="p-10 rounded-[48px] bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100/50 relative overflow-hidden group cursor-pointer shadow-xl shadow-blue-50">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 transition-all group-hover:scale-150" />
               <Sparkles className="h-8 w-8 text-blue-500 mb-6" />
               <h3 className="font-black text-2xl leading-tight mb-3 text-slate-900">Expert Advisory</h3>
               <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8">Direct priority access to our most senior Chartered Accountants.</p>
               <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-black text-[11px] uppercase tracking-widest h-14 rounded-3xl shadow-lg shadow-blue-100 border-none transition-all hover:-translate-y-1">Connect Now</Button>
            </div>
          </div>

          {/* Main Content Area - Full Page Scroll */}
          <div className="flex-1 min-w-0 w-full lg:max-w-4xl space-y-8 pb-20">
            <AnimatePresence mode="wait">
               {activeTab === 'profile' && (
                  <m.div
                     key="profile"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="space-y-8"
                  >
                     <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white border border-slate-100/50">
                        <CardHeader className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <div>
                              <div className="flex items-center gap-3 mb-2">
                                 <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Identity Profile</span>
                              </div>
                              <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">General Information</CardTitle>
                              <CardDescription className="text-sm font-medium text-slate-500 mt-2">Update your personal and legal identifiers used for official filings.</CardDescription>
                           </div>
                           <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none px-4 py-1.5 font-black text-[9px] uppercase tracking-widest">Active Profile</Badge>
                        </CardHeader>
                        <CardContent className="p-10">
                           {isLoadingProfile ? (
                              <div className="flex justify-center py-20">
                                 <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                              </div>
                           ) : (
                              <Form {...profileForm}>
                                 <form onSubmit={profileForm.handleSubmit((d) => updateProfileMutation.mutate(d))} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                       <FormField
                                          control={profileForm.control}
                                          name="first_name"
                                          render={({ field }) => (
                                             <FormItem className="space-y-3">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal First Name</FormLabel>
                                                <FormControl>
                                                   <div className="relative">
                                                      <User className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                                                      <Input {...field} className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 focus-visible:ring-blue-500 font-bold text-base" />
                                                   </div>
                                                </FormControl>
                                                <FormMessage />
                                             </FormItem>
                                          )}
                                       />
                                       <FormField
                                          control={profileForm.control}
                                          name="last_name"
                                          render={({ field }) => (
                                             <FormItem className="space-y-3">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Last Name</FormLabel>
                                                <FormControl>
                                                   <div className="relative">
                                                      <User className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                                                      <Input {...field} className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 focus-visible:ring-blue-500 font-bold text-base" />
                                                   </div>
                                                </FormControl>
                                                <FormMessage />
                                             </FormItem>
                                          )}
                                       />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                       <FormField
                                          control={profileForm.control}
                                          name="email"
                                          render={({ field }) => (
                                             <FormItem className="space-y-3">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</FormLabel>
                                                <FormControl>
                                                   <div className="relative">
                                                      <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                                                      <Input {...field} disabled className="h-14 pl-12 rounded-2xl bg-slate-100 border-slate-100 text-slate-400 font-bold text-base cursor-not-allowed" />
                                                   </div>
                                                </FormControl>
                                                <FormMessage />
                                             </FormItem>
                                          )}
                                       />
                                       <FormField
                                          control={profileForm.control}
                                          name="phone"
                                          render={({ field }) => (
                                             <FormItem className="space-y-3">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</FormLabel>
                                                <FormControl>
                                                   <div className="relative">
                                                      <Phone className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                                                      <Input {...field} placeholder="+91 98765 43210" className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 focus-visible:ring-blue-500 font-bold text-base" />
                                                   </div>
                                                </FormControl>
                                                <FormMessage />
                                             </FormItem>
                                          )}
                                       />
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                       <Button type="submit" disabled={updateProfileMutation.isPending} className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 transition-all hover:-translate-y-1">
                                          {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <Save className="h-4 w-4 mr-3" />}
                                          Save Profile Changes
                                       </Button>
                                    </div>
                                 </form>
                              </Form>
                           )}
                        </CardContent>
                     </Card>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                           { icon: Calendar, label: 'Member Since', value: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), color: 'blue' },
                           { icon: Shield, label: 'Security Level', value: 'High (Verified)', color: 'emerald' },
                           { icon: Globe, label: 'Account Locale', value: 'India (IST)', color: 'violet' },
                        ].map((stat, idx) => (
                           <div key={idx} className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all">
                              <div className={cn(
                                 "h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                                 stat.color === 'blue' && "bg-blue-50 text-blue-600",
                                 stat.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                                 stat.color === 'violet' && "bg-violet-50 text-violet-600"
                              )}>
                                 <stat.icon className="h-7 w-7" />
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                              <p className="text-base font-black text-slate-900">{stat.value}</p>
                           </div>
                        ))}
                     </div>
                  </m.div>
               )}

               {activeTab === 'security' && (
                  <m.div
                     key="security"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="space-y-8"
                  >
                     <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white border border-slate-100/50">
                        <CardHeader className="p-10 border-b border-slate-50">
                           <div className="flex items-center gap-3 mb-2">
                              <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Secure Access</span>
                           </div>
                           <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Security Credentials</CardTitle>
                           <CardDescription className="text-sm font-medium text-slate-500 mt-2">Manage your authentication protocols and password security.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10">
                           <Form {...passwordForm}>
                              <form onSubmit={passwordForm.handleSubmit((d) => changePasswordMutation.mutate(d))} className="space-y-10 max-w-2xl">
                                 <FormField
                                    control={passwordForm.control}
                                    name="current_password"
                                    render={({ field }) => (
                                       <FormItem className="space-y-3">
                                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Password</FormLabel>
                                          <FormControl>
                                             <div className="relative">
                                                <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                                                <Input type="password" {...field} className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 focus-visible:ring-blue-500 font-bold text-base" />
                                             </div>
                                          </FormControl>
                                          <FormMessage />
                                       </FormItem>
                                    )}
                                 />

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <FormField
                                       control={passwordForm.control}
                                       name="new_password"
                                       render={({ field }) => (
                                          <FormItem className="space-y-3">
                                             <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</FormLabel>
                                             <FormControl>
                                                <Input type="password" {...field} className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 focus-visible:ring-blue-500 font-bold text-base" />
                                             </FormControl>
                                             <FormMessage />
                                          </FormItem>
                                       )}
                                    />
                                    <FormField
                                       control={passwordForm.control}
                                       name="confirm_password"
                                       render={({ field }) => (
                                          <FormItem className="space-y-3">
                                             <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm New Password</FormLabel>
                                             <FormControl>
                                                <Input type="password" {...field} className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 focus-visible:ring-blue-500 font-bold text-base" />
                                             </FormControl>
                                             <FormMessage />
                                          </FormItem>
                                       )}
                                    />
                                 </div>

                                 <div className="pt-4">
                                    <Button type="submit" disabled={changePasswordMutation.isPending} className="h-14 px-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-red-100 transition-all hover:-translate-y-1">
                                       {changePasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <ShieldCheck className="h-5 w-5 mr-3" />}
                                       Update Security Credentials
                                    </Button>
                                 </div>
                              </form>
                           </Form>

                           <div className="my-14">
                              <Separator className="bg-slate-50" />
                           </div>

                           <div className="space-y-10">
                              <div className="flex items-center gap-6">
                                 <div className="h-16 w-16 rounded-[24px] bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                    <Fingerprint className="h-8 w-8" />
                                 </div>
                                 <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Multi-Factor Authentication</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Fortify your account with biometrics or authenticator apps.</p>
                                 </div>
                              </div>
                              <div className="bg-slate-50/50 p-10 rounded-[40px] border border-slate-100/50">
                                 <MfaEnrollment />
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </m.div>
               )}

               {activeTab === 'billing' && (
                  <m.div
                     key="billing"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                  >
                     <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white border border-slate-100/50 p-16 text-center min-h-[500px] flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-blue-50 rounded-[40px] flex items-center justify-center mb-10 relative">
                           <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 animate-pulse" />
                           <CreditCard className="w-12 h-12 text-blue-600 relative z-10" />
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">Billing & Plans</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-4 text-base font-medium leading-relaxed">
                           Securely manage your active subscriptions, payment instruments and historical invoices.
                        </p>
                        
                        <div className="mt-12 p-8 rounded-[40px] bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center gap-8 max-w-lg w-full">
                           <div className="h-14 w-14 rounded-[20px] bg-white shadow-md flex items-center justify-center text-blue-600">
                              <Sparkles className="h-7 w-7" />
                           </div>
                           <div className="text-center md:text-left flex-1">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Active Plan</p>
                              <p className="text-xl font-black text-slate-900">Standard Professional</p>
                           </div>
                           <Badge className="bg-blue-600 text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full">Active</Badge>
                        </div>

                        <Button variant="outline" className="mt-10 rounded-2xl px-16 h-14 font-black text-[11px] uppercase tracking-widest border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                           Access Transaction Ledger
                        </Button>
                     </Card>
               </m.div>
               )}

               {activeTab === 'notifications' && (
                  <m.div
                     key="notifications"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                  >
                     <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white border border-slate-100/50 p-16 text-center min-h-[500px] flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-amber-50 rounded-[40px] flex items-center justify-center mb-10">
                           <Bell className="w-12 h-12 text-amber-600" />
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">Notification Engine</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-4 text-base font-medium leading-relaxed">
                           Personalize your alerting system for filings, security events and system updates.
                        </p>
                        <Button className="mt-12 rounded-2xl px-16 h-14 bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                           Configure Preferences
                        </Button>
                     </Card>
               </m.div>
               )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}
