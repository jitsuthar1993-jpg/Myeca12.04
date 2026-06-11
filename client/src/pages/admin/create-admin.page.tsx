import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, CheckCircle2, MailPlus, Shield, UserRoundPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PRIVILEGED_APP_ROLES, type PrivilegedAppRole } from "@shared/app-roles";

const inviteAdminSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().trim().max(100, "First name is too long").optional(),
  lastName: z.string().trim().max(100, "Last name is too long").optional(),
  role: z.enum(PRIVILEGED_APP_ROLES),
});

type InviteAdminForm = z.infer<typeof inviteAdminSchema>;

const roleCopy: Record<PrivilegedAppRole, string> = {
  admin: "Full platform administration, user management, settings, and content controls.",
  team_member: "Operational back-office access for customer support and compliance workflows.",
  ca: "CA workspace access for assigned filings, reviews, documents, and service timelines.",
};

export default function CreateAdminPage() {
  const { toast } = useToast();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<InviteAdminForm>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "team_member",
    },
  });

  const selectedRole = form.watch("role");

  const inviteMutation = useMutation({
    mutationFn: async (data: InviteAdminForm) => {
      const response = await apiRequest("/api/admin/invitations", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          firstName: data.firstName || undefined,
          lastName: data.lastName || undefined,
        }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      const message = data?.message || "Supabase invitation/provisioning completed successfully.";
      toast({
        title: "Access provisioned",
        description: message,
      });
      setSuccessMessage(message);
      form.reset({
        email: "",
        firstName: "",
        lastName: "",
        role: "team_member",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Provisioning failed",
        description: error.message || "Unable to provision this Supabase user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InviteAdminForm) => {
    setSuccessMessage(null);
    inviteMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0050b5]">Supabase provisioning</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Invite Admin, CA, or Team Member</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Passwords are no longer created inside MyeCA. Enter the person&apos;s email and role,
          then Supabase handles the secure invite or reset flow.
        </p>
      </div>

      <Card className="rounded-lg border-amber-200 bg-amber-50 shadow-none">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-amber-900">Role changes are effective after Supabase sync</h3>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Existing Supabase users are promoted immediately. New users receive a Supabase invitation,
                and their Supabase role is applied the first time they sign in with that email.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <Card className="rounded-lg border-slate-200 shadow-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
                <MailPlus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Send Supabase Invitation</CardTitle>
                <CardDescription>
                  Provision access without handling passwords, JWTs, or manual admin secrets.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...form.register("firstName")} placeholder="Aarav" />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...form.register("lastName")} placeholder="Sharma" />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="teammate@myeca.in"
                  autoComplete="email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => form.setValue("role", value as InviteAdminForm["role"], { shouldValidate: true })}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select access role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team_member">Team Member</SelectItem>
                    <SelectItem value="ca">Chartered Accountant</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm leading-6 text-slate-600">{roleCopy[selectedRole]}</p>
                {form.formState.errors.role && (
                  <p className="text-sm text-red-600">{form.formState.errors.role.message}</p>
                )}
              </div>

              {successMessage && (
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <CheckCircle2 className="mt-0.5 h-5 w-5" />
                  <p>{successMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={inviteMutation.isPending}
                className="w-full bg-brand-600 font-bold hover:bg-[#082a5c]"
              >
                {inviteMutation.isPending ? (
                  "Provisioning Access..."
                ) : (
                  <>
                    <UserRoundPlus className="mr-2 h-4 w-4" />
                    Send Invitation or Promote User
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 bg-slate-50 shadow-none">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-600">
              <Shield className="h-6 w-6" />
            </div>
            <CardTitle>What changed?</CardTitle>
            <CardDescription>MyeCA no longer stores or creates admin passwords.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-slate-700">
            <p>
              Supabase owns sign-in, passwordless methods, MFA, reset links, and invite acceptance. MyeCA
              stores the role in Supabase and mirrors it to Supabase public metadata for faster UI rendering.
            </p>
            <p>
              If a user already exists in Supabase, this page promotes their role immediately. If they do
              not exist yet, they receive an invitation and the provisioned role is applied during
              their first `/api/v1/auth/sync`.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
