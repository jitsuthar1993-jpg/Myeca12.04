import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, Shield, AlertTriangle } from "lucide-react";

const createAdminSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateAdminForm = z.infer<typeof createAdminSchema>;

export default function CreateAdminPage() {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<CreateAdminForm>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: CreateAdminForm) => {
      const { confirmPassword, ...adminData } = data;
      const response = await apiRequest("/api/admin/create-admin", {
        method: "POST",
        body: JSON.stringify(adminData),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Admin Created Successfully",
        description: `Admin account for ${data.user.firstName} ${data.user.lastName} has been created.`,
      });
      setShowSuccess(true);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Admin",
        description: error.message || "An error occurred while creating the admin account.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateAdminForm) => {
    createAdminMutation.mutate(data);
  };

  if (showSuccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Account Created</h1>
          <p className="text-gray-600 mt-2">New administrator account has been successfully created</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <UserPlus className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Admin Account Created</h3>
                <p className="text-gray-600">
                  The administrator can now log in and access all admin features.
                </p>
              </div>
              <Button onClick={() => setShowSuccess(false)} className="w-full">
                Create Another Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Admin Account</h1>
        <p className="text-gray-600 mt-2">Create a new administrator account with full system access</p>
      </div>

      {/* Warning Banner */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Administrator Privileges</h3>
              <p className="text-sm text-amber-700 mt-1">
                Admin accounts have full access to all system features including user management, 
                service management, and system settings. Only create admin accounts for trusted individuals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Admin Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>New Administrator Details</CardTitle>
              <CardDescription>
                Enter the details for the new administrator account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...form.register("firstName")}
                  placeholder="Enter first name"
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...form.register("lastName")}
                  placeholder="Enter last name"
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="Enter email address"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder="Enter password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register("confirmPassword")}
                  placeholder="Confirm password"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createAdminMutation.isPending}
                className="flex-1"
              >
                {createAdminMutation.isPending ? (
                  <>Creating Admin...</>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Admin Account
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}