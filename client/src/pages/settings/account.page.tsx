import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Lock, User, Shield, CreditCard, Bell } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MfaEnrollment } from "@/components/auth/MfaEnrollment";
import { Separator } from "@/components/ui/separator";
import { logAuditEvent } from "@/lib/audit";
import { Layout } from "@/components/admin/Layout";

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

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      const res = await apiRequest("/api/profile");
      const data = await res.json();
      return data.data?.user;
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
      const names = (user.username || "").split(" ");
      profileForm.reset({
        first_name: names[0] || "",
        last_name: names.slice(1).join(" ") || "",
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
      toast({ title: "Success", description: "Profile updated successfully" });
      logAuditEvent({ action: 'profile_update_success', category: 'authentication' });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update profile", variant: "destructive" });
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
      toast({ title: "Success", description: "Password updated successfully" });
      logAuditEvent({ action: 'password_change_success', category: 'security' });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to change password", variant: "destructive" });
    },
  });

  const onProfileSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: any) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Configurations</h1>
          <p className="text-slate-500 max-w-2xl">
            Fine-tune your personal information, security protocols, and account preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-slate-50 p-1 rounded-xl h-12 inline-flex border border-slate-100/50">
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase tracking-widest">Profile</TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase tracking-widest">Security</TabsTrigger>
            <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase tracking-widest">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  Personal Information
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Update your details as they appear on official filings.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {isLoadingProfile ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">First Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-11 rounded-xl bg-slate-50 border-slate-100 focus-visible:ring-blue-500 text-sm font-semibold" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-11 rounded-xl bg-slate-50 border-slate-100 focus-visible:ring-blue-500 text-sm font-semibold" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} disabled className="h-11 rounded-xl bg-slate-100 border-slate-100 text-slate-500 text-sm font-semibold cursor-not-allowed" />
                            </FormControl>
                            <p className="text-[10px] text-slate-400 font-medium">Authentication email cannot be changed directly.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+91 9876543210" className="h-11 rounded-xl bg-slate-50 border-slate-100 focus-visible:ring-blue-500 text-sm font-semibold" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={updateProfileMutation.isPending} className="rounded-xl bg-slate-900 hover:bg-black px-8 h-11 font-bold text-sm shadow-sm transition-all">
                          {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  Security Protocols
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Manage your access credentials and multi-factor settings.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
                    <FormField
                      control={passwordForm.control}
                      name="current_password"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <Input type="password" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-100 focus-visible:ring-blue-500 text-sm font-semibold pr-10" />
                               <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="new_password"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-100 focus-visible:ring-blue-500 text-sm font-semibold" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirm_password"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="h-11 rounded-xl bg-slate-50 border-slate-100 focus-visible:ring-blue-500 text-sm font-semibold" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-2">
                      <Button type="submit" variant="destructive" disabled={changePasswordMutation.isPending} className="rounded-xl px-8 h-11 font-bold text-sm shadow-sm hover:shadow-red-100 transition-all">
                        {changePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                      </Button>
                    </div>
                  </form>
                </Form>

                <div className="my-10">
                  <Separator className="bg-slate-50" />
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Multi-Factor Authentication</h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">Fortify your account with an extra layer of verification via authenticator apps.</p>
                  </div>
                  <MfaEnrollment />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                   <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Billing & Subscription</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm font-medium">You are currently on the <span className="text-blue-600 font-bold">Standard Professional</span> plan. Managed billing is coming soon to your portal.</p>
                <Button variant="outline" className="mt-8 rounded-xl px-10 h-11 font-bold text-xs uppercase tracking-widest border-slate-100 hover:bg-slate-50">View Transactions</Button>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
  );
}
