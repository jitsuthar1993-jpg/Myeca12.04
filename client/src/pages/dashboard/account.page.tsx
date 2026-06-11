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
    <Layout title="My Account">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="type-meta font-bold uppercase tracking-[0.12em] text-slate-500">Account</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">My Account</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review your profile, contact details, password, and multi-factor authentication from one secure workspace.
            </p>
          </div>
          <Button
            onClick={() => logout()}
            variant="outline"
            className="h-10 w-fit gap-2 rounded-md border-red-200 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-lg font-bold text-white">
                    {getInitials(accountUser)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-slate-950">{displayName}</h2>
                    <p className="mt-1 truncate text-sm text-slate-600">{displayEmail}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="rounded-md border-slate-200 bg-slate-50 type-meta font-bold uppercase text-slate-600">
                        {roleLabel}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-md type-meta font-bold uppercase",
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

            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="space-y-2 p-3">
                {accountTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors",
                        isActive
                          ? "border border-blue-100 bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-sm font-bold">{tab.label}</span>
                        <span className={cn("block truncate text-xs", isActive ? "text-blue-600" : "text-slate-500")}>
                          {tab.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          <div className="min-w-0 space-y-6">
            {activeTab === "profile" && (
              <Card className="rounded-lg border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-950">Profile Details</CardTitle>
                      <CardDescription className="mt-1 text-sm text-slate-600">
                        Keep the account holder name and mobile number current for filings and service communication.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  {isLoadingProfile ? (
                    <div className="flex items-center justify-center py-16 text-slate-500">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Loading account details...
                    </div>
                  ) : (
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-6">
                        <div className="grid gap-5 md:grid-cols-2">
                          <FormField
                            control={profileForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First name</FormLabel>
                                <FormControl>
                                  <Input {...field} className="h-11 rounded-md border-slate-200 bg-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last name</FormLabel>
                                <FormControl>
                                  <Input {...field} className="h-11 rounded-md border-slate-200 bg-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email address</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled className="h-11 rounded-md border-slate-200 bg-slate-50 text-slate-500" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mobile number</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="+91 98765 43210" className="h-11 rounded-md border-slate-200 bg-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end border-t border-slate-100 pt-5">
                          <Button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="h-10 gap-2 rounded-md bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800"
                          >
                            {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card className="rounded-lg border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-950">Security</CardTitle>
                      <CardDescription className="mt-1 text-sm text-slate-600">
                        Update your password and strengthen sign-in protection with multi-factor authentication.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 p-5">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit((data) => changePasswordMutation.mutate(data))} className="max-w-2xl space-y-5">
                      <FormField
                        control={passwordForm.control}
                        name="current_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input type="password" {...field} className="h-11 rounded-md border-slate-200 bg-white pl-10" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-5 md:grid-cols-2">
                        <FormField
                          control={passwordForm.control}
                          name="new_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} className="h-11 rounded-md border-slate-200 bg-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirm_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} className="h-11 rounded-md border-slate-200 bg-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="h-10 gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        {changePasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        Update password
                      </Button>
                    </form>
                  </Form>

                  <Separator />

                  <section className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                        <Fingerprint className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-950">Multi-factor authentication</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Add an authenticator app to reduce the risk of unauthorized account access.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <MfaEnrollment />
                    </div>
                  </section>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
