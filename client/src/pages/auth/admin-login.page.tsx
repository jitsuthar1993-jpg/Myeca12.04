import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

const adminLoginSchema = z.object({
  username: z.string().min(3, "Username is required").max(255),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AdminLoginData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: AdminLoginData) => {
      const response = await apiRequest("/api/auth/admin-login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      toast({
        title: "Admin login successful",
        description: `Welcome back, ${data.user.firstName}!`,
      });
      setLocation('/admin/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdminLoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-6"
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Sign In
          </h2>
          <p className="text-gray-600">
            Secure access for administrators
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-8 bg-white shadow-2xl border-0">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="pl-10 h-12 border-2 focus:border-blue-500"
                  {...form.register("username")}
                />
              </div>
              {form.formState.errors.username && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12 border-2 focus:border-blue-500"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Sign In as Admin
                </div>
              )}
            </Button>

            {/* Error Message */}
            {loginMutation.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {(loginMutation.error as any)?.message || "Login failed. Please try again."}
                </AlertDescription>
              </Alert>
            )}
          </form>

          <div className="mt-8">
            <Separator className="my-6" />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Not an admin?{" "}
                <Link href="/auth/login">
                  <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                    Go to user login
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <Shield className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-green-700 font-medium">
              Secured with 256-bit SSL encryption
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}