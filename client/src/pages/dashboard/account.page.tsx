import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Fingerprint,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { MfaEnrollment } from "@/components/auth/MfaEnrollment";
import { Layout } from "@/components/admin/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { changeSupabasePassword } from "@/lib/account-security";
import { apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100, "First name is too long"),
  lastName: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z.string().trim().max(20).optional(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

type AccountUser = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  role?: string | null;
  isVerified?: boolean | null;
};

const accountTabs = [
  {
    id: "profile",
    label: "Profile Details",
    description: "Name, email, and mobile",
    icon: User,
  },
  {
    id: "security",
    label: "Security",
    description: "Password and MFA",
    icon: ShieldCheck,
  },
] as const;

type AccountTab = (typeof accountTabs)[number]["id"];

function getInitials(accountUser?: AccountUser | null) {
  const initials = `${accountUser?.firstName?.[0] || ""}${accountUser?.lastName?.[0] || ""}`.toUpperCase();
  return initials || accountUser?.email?.[0]?.toUpperCase() || "U";
}

function getDisplayName(accountUser?: AccountUser | null) {
  const name = [accountUser?.firstName, accountUser?.lastName].filter(Boolean).join(" ").trim();
  return name || accountUser?.email || "Your account";
}

function getRoleLabel(role?: string | null) {
  return (role || "user").replace(/_/g, " ");
}

export default function UnifiedAccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const { data: profileData, isLoading: isLoadingProfile } = useQuery<AccountUser | null>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      try {
        const res = await apiRequest("/api/profile");
        const data = await res.json();
        return data.data?.user || null;
      } catch {
        return null;
      }
    },
  });

  const accountUser = (profileData || user || null) as AccountUser | null;
  const displayName = getDisplayName(accountUser);
  const displayEmail = accountUser?.email || "Email not available";
  const displayPhone = accountUser?.phoneNumber || "Mobile not added";
  const roleLabel = getRoleLabel(accountUser?.role);
  const verificationLabel = accountUser?.isVerified ? "Verified account" : "Verification pending";

  useEffect(() => {
    const source = profileData || user;
    if (!source) return;

    profileForm.reset({
      firstName: source.firstName || "",
      lastName: source.lastName || "",
      email: source.email || "",
      phoneNumber: source.phoneNumber || "",
    });
  }, [profileData, profileForm, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("/api/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data?.user;
    },
    onSuccess: (updatedUser) => {
      toast({ title: "Profile updated", description: "Your account details have been saved." });
      if (updatedUser) {
        queryClient.setQueryData(["/api/profile"], updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not save profile changes.",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      return changeSupabasePassword(
        supabase,
        accountUser?.email || user?.email,
        data.current_password,
        data.new_password,
      );
    },
    onSuccess: () => {
      toast({ title: "Password changed", description: "Your sign-in password has been updated." });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Security update failed",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      });
    },
  });

  return (
    <Layout title="Account Settings">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-10">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="type-meta font-black uppercase">User Preferences</span>
             </div>
             <h1 className="type-page-title font-black text-slate-900">Account Control</h1>
             <p className="type-support font-medium text-slate-500">Manage your profile details and account security in one place.</p>
          </div>
          <Button
            onClick={() => logout()}
            variant="ghost" 
            className="h-11 w-full rounded-lg border border-red-100/50 bg-red-50 px-6 font-bold text-red-600 transition-all hover:bg-red-100 md:w-auto md:rounded-2xl"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>

        <div className="flex flex-col items-start gap-5 bg-slate-50/50 p-0 lg:flex-row lg:gap-12 lg:rounded-[48px] lg:p-2">
          {/* Sticky Left Sidebar Menu */}
          <div className="hidden w-full shrink-0 space-y-6 lg:sticky lg:top-[112px] lg:block lg:w-80">
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
                     </div>
                     <div className="mt-6 text-center">
                        <h2 className="type-section-title font-black text-slate-900">{displayName}</h2>
                        <div className="mt-3 space-y-1 text-xs font-semibold text-slate-500">
                           <p className="break-all">{displayEmail}</p>
                           <p>{displayPhone}</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-2">
                           <Badge variant="outline" className="type-meta border-none bg-blue-50 px-2.5 py-0.5 font-black uppercase text-blue-700">
                              {accountUser?.role?.replace('_', ' ') || 'user'}
                           </Badge>
                           {accountUser?.isVerified && (
                              <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                 <ShieldCheck className="h-3 w-3" />
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-slate-950">{displayName}</h2>
                    <p className="mt-1 truncate text-sm text-slate-600">{displayEmail}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="rounded-md border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-600">
                        {roleLabel}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-md text-[11px] font-bold uppercase",
                          accountUser?.isVerified
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700",
                        )}
                      >
                        {verificationLabel}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-5" />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="min-w-0 truncate">{displayEmail}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="min-w-0 truncate">{displayPhone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          <div className="w-full rounded-lg border border-slate-100 bg-white p-4 shadow-sm lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-xl font-black text-blue-600">
                {getInitials()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-black text-slate-900">{displayName}</h2>
                <p className="truncate text-xs font-semibold text-slate-500">{displayEmail}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{displayPhone}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'security', label: 'Security', icon: ShieldCheck },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex min-h-[44px] items-center justify-center gap-2 rounded-lg border text-sm font-black",
                    activeTab === tab.id
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-slate-200 bg-white text-slate-600",
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area - Full Page Scroll */}
          <div className="min-w-0 flex-1 w-full space-y-5 pb-20 lg:max-w-4xl lg:space-y-8">
            <AnimatePresence mode="wait">
               {activeTab === 'profile' && (
                  <m.div
                     key="profile"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="space-y-8"
                  >
                     <Card className="overflow-hidden rounded-lg border border-slate-100/50 bg-white shadow-sm md:rounded-[40px]">
                        <CardHeader className="flex flex-col justify-between gap-4 border-b border-slate-50 p-5 md:flex-row md:items-center md:gap-6 md:p-10">
                           <div>
                              <div className="flex items-center gap-3 mb-2">
                                 <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                 <span className="type-meta font-black uppercase text-blue-600">Identity Profile</span>
                              </div>
                              <CardTitle className="type-section-title font-black text-slate-900">General Information</CardTitle>
                              <CardDescription className="text-sm font-medium text-slate-500 mt-2">Update your personal and legal identifiers used for official filings.</CardDescription>
                           </div>
                           <Badge variant="outline" className="type-meta border-none bg-emerald-50 px-4 py-1.5 font-black uppercase text-emerald-700">Active Profile</Badge>
                        </CardHeader>
                        <CardContent className="p-5 md:p-10">
                           {isLoadingProfile ? (
                              <div className="flex justify-center py-20">
                                 <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                              </div>
                           ) : (
                              <Form {...profileForm}>
                                 <form onSubmit={profileForm.handleSubmit((d) => updateProfileMutation.mutate(d))} className="space-y-6 md:space-y-10">
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-10">
                                       <FormField
                                          control={profileForm.control}
                                          name="firstName"
                                          render={({ field }) => (
                                             <FormItem className="space-y-3">
                                                <FormLabel className="type-meta ml-1 font-black uppercase text-slate-400">Legal First Name</FormLabel>
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
                                          name="lastName"
                                          render={({ field }) => (
                                             <FormItem className="space-y-3">
                                                <FormLabel className="type-meta ml-1 font-black uppercase text-slate-400">Legal Last Name</FormLabel>
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

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-10">
                                       <FormField
                                          control={profileForm.control}
                                          name="email"
                                          render={({ field }) => (
                                             <FormItem className="space-y-3">
                                                <FormLabel className="type-meta ml-1 font-black uppercase text-slate-400">Email Address</FormLabel>
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
                                          name="phoneNumber"
                                          render={({ field }) => (
                                             <FormItem className="space-y-3">
                                                <FormLabel className="type-meta ml-1 font-black uppercase text-slate-400">Phone Number</FormLabel>
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

                                    <div className="flex justify-end pt-2 md:pt-6">
                                       <Button type="submit" disabled={updateProfileMutation.isPending} className="h-12 w-full rounded-lg bg-blue-600 px-6 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-200 transition-all hover:-translate-y-1 hover:bg-blue-700 md:h-14 md:w-auto md:rounded-2xl md:px-12">
                                          {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <Save className="h-4 w-4 mr-3" />}
                                          Save Profile Changes
                                       </Button>
                                    </div>
                                 </form>
                              </Form>
                           )}
                        </CardContent>
                     </Card>

                     <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-8">
                        {[
                           { icon: Calendar, label: 'Member Since', value: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), color: 'blue' },
                           { icon: Shield, label: 'Security Level', value: 'High (Verified)', color: 'emerald' },
                           { icon: Globe, label: 'Account Locale', value: 'India (IST)', color: 'violet' },
                        ].map((stat, idx) => (
                           <div key={idx} className="group flex flex-col items-center rounded-lg border border-slate-100 bg-white p-5 text-center shadow-sm transition-all hover:shadow-md md:rounded-[40px] md:p-8">
                              <div className={cn(
                                 "h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                                 stat.color === 'blue' && "bg-blue-50 text-blue-600",
                                 stat.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                                 stat.color === 'violet' && "bg-violet-50 text-violet-600"
                              )}>
                                 <stat.icon className="h-7 w-7" />
                              </div>
                              <p className="type-meta mb-2 font-black uppercase text-slate-400">{stat.label}</p>
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
                     <Card className="overflow-hidden rounded-lg border border-slate-100/50 bg-white shadow-sm md:rounded-[40px]">
                        <CardHeader className="border-b border-slate-50 p-5 md:p-10">
                           <div className="flex items-center gap-3 mb-2">
                              <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                              <span className="type-meta font-black uppercase text-red-600">Secure Access</span>
                           </div>
                           <CardTitle className="type-section-title font-black text-slate-900">Security Credentials</CardTitle>
                           <CardDescription className="text-sm font-medium text-slate-500 mt-2">Manage your authentication protocols and password security.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 md:p-10">
                           <Form {...passwordForm}>
                              <form onSubmit={passwordForm.handleSubmit((d) => changePasswordMutation.mutate(d))} className="max-w-2xl space-y-6 md:space-y-10">
                                 <FormField
                                    control={passwordForm.control}
                                    name="current_password"
                                    render={({ field }) => (
                                       <FormItem className="space-y-3">
                                          <FormLabel className="type-meta ml-1 font-black uppercase text-slate-400">Current Password</FormLabel>
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

                                 <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-10">
                                    <FormField
                                       control={passwordForm.control}
                                       name="new_password"
                                       render={({ field }) => (
                                          <FormItem className="space-y-3">
                                             <FormLabel className="type-meta ml-1 font-black uppercase text-slate-400">New Password</FormLabel>
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
                                             <FormLabel className="type-meta ml-1 font-black uppercase text-slate-400">Confirm New Password</FormLabel>
                                             <FormControl>
                                                <Input type="password" {...field} className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 focus-visible:ring-blue-500 font-bold text-base" />
                                             </FormControl>
                                             <FormMessage />
                                          </FormItem>
                                       )}
                                    />
                                 </div>

                                 <div className="pt-4">
                                    <Button type="submit" disabled={changePasswordMutation.isPending} className="h-12 w-full rounded-lg bg-red-600 px-6 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-red-100 transition-all hover:-translate-y-1 hover:bg-red-700 md:h-14 md:w-auto md:rounded-2xl md:px-12">
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
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shadow-sm md:h-16 md:w-16 md:rounded-[24px]">
                                    <Fingerprint className="h-8 w-8" />
                                 </div>
                                 <div>
                                    <h3 className="type-section-title font-black text-slate-900">Multi-Factor Authentication</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Fortify your account with biometrics or authenticator apps.</p>
                                 </div>
                              </div>
                              <div className="rounded-lg border border-slate-100/50 bg-slate-50/50 p-4 md:rounded-[40px] md:p-10">
                                 <MfaEnrollment />
                              </div>
                           </div>
                        </CardContent>
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
