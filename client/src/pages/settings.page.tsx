import { useState, useEffect } from "react";
import { m } from "framer-motion";
import {
  User, Bell, Shield, Globe, Palette, Download, Key,
  CreditCard, FileText, Mail, Smartphone, Monitor, TrendingUp,
  ChevronRight, Check, X, Info, AlertCircle, Loader2, Save,
  LogOut, Trash2, Lock, Fingerprint, History, Database
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
  iconColor?: string;
  bgColor?: string;
}

function SettingsSection({ title, description, icon: Icon, children, iconColor = "text-blue-600", bgColor = "bg-blue-50" }: SettingsSectionProps) {
  return (
    <Card className="rounded-[2.5rem] border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden bg-white mb-8">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-2xl", bgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">{title}</CardTitle>
            <CardDescription className="text-slate-500 font-medium mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8">{children}</CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user, logout, sendPasswordReset, sendEmailVerification, deleteAccount } = useAuth();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState<string | null>(null);

  // Fetch additional user data if needed
  const { data: dashboardData } = useQuery({
    queryKey: ["/api/user/dashboard"],
  });

  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    reminderNotifications: true,
    // Preferences
    language: "en",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    defaultView: "dashboard",
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "Setting updated",
      description: `Your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} preference has been saved.`,
    });
  };

  const handleChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value as any }));
  };

  const handleAction = async (action: string, fn: () => Promise<void>) => {
    setIsPending(action);
    try {
      await fn();
      toast({
        title: "Action successful",
        description: `The request for ${action} was processed successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(null);
    }
  };

  const handleExportData = () => {
    const data = {
      profile: user,
      activity: (dashboardData as any)?.recentActivity || [],
      services: (dashboardData as any)?.activeServices || [],
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `myeca-data-export-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: "Your data has been packaged and downloaded.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pt-12 pb-24">
      <SEO
        title="Settings | MyeCA.in"
        description="Manage your account preferences and security settings."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <Badge className="bg-blue-100 text-blue-700 border-0 font-black px-4 py-1 mb-4 rounded-full uppercase tracking-widest text-[10px]">
            Preferences
          </Badge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Account Settings</h1>
          <p className="text-slate-500 font-medium">Customize your MyeCA experience and manage security.</p>
        </m.div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="flex w-full max-w-md mx-auto p-1 bg-white rounded-2xl shadow-sm border border-slate-200/60 mb-12">
            <TabsTrigger value="profile" className="flex-1 rounded-xl font-bold py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 rounded-xl font-bold py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Alerts
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 rounded-xl font-bold py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <SettingsSection
              title="Personal Details"
              description="Basic account information for identification"
              icon={User}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email (Primary)</Label>
                  <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-400">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Verification</Label>
                  <div className="flex items-center justify-between p-3 px-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      {user?.isVerified ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <X className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="font-bold text-sm">{user?.isVerified ? "Verified" : "Unverified"}</span>
                    </div>
                    {!user?.isVerified && (
                      <Button 
                        onClick={() => handleAction("verify-email", sendEmailVerification)}
                        disabled={isPending === "verify-email"}
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 font-bold h-8"
                      >
                        {isPending === "verify-email" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify Now"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Account Management"
              description="Manage your account health and data"
              icon={Shield}
              iconColor="text-indigo-600"
              bgColor="bg-indigo-50"
            >
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 group transition-all hover:bg-white hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-none mb-1">Change Password</h4>
                      <p className="text-xs text-slate-500 font-medium">Sends a secure reset link to your email</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-xl border-slate-200 px-6 font-bold hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => handleAction("password-reset", () => sendPasswordReset(user?.email || ""))}
                    disabled={isPending === "password-reset"}
                  >
                    {isPending === "password-reset" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset >"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 group transition-all hover:bg-white hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600">
                      <Download className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-none mb-1">Export Your Data</h4>
                      <p className="text-xs text-slate-500 font-medium">Download a complete copy of your tax records</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-xl border-slate-200 px-6 font-bold hover:bg-emerald-50 hover:text-emerald-600"
                    onClick={handleExportData}
                  >
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-6 bg-red-50/30 rounded-3xl border border-red-100 group transition-all hover:bg-white hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-red-600">
                      <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-red-900 leading-none mb-1">Delete Account</h4>
                      <p className="text-xs text-red-600/70 font-medium">Permanently removes all data and access</p>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="rounded-xl px-6 font-black shadow-lg shadow-red-200"
                    onClick={() => {
                        if (confirm("Are you absolutely sure? This cannot be undone.")) {
                            handleAction("delete-account", deleteAccount);
                        }
                    }}
                    disabled={isPending === "delete-account"}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </SettingsSection>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <SettingsSection
              title="Push Alerts"
              description="Stay updated with real-time notifications"
              icon={Bell}
              iconColor="text-amber-600"
              bgColor="bg-amber-50"
            >
              <div className="space-y-6 mt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-black text-slate-900">Tax Filing Updates</Label>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Notifications about your ITR status, missing documents, or CA queries.</p>
                  </div>
                  <Switch checked={settings.emailNotifications} onCheckedChange={() => handleToggle("emailNotifications")} className="data-[state=checked]:bg-blue-600" />
                </div>
                <Separator className="bg-slate-100" />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-black text-slate-900">Deadline Reminders</Label>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Alerts for upcoming tax dates and payment windows.</p>
                  </div>
                  <Switch checked={settings.reminderNotifications} onCheckedChange={() => handleToggle("reminderNotifications")} className="data-[state=checked]:bg-blue-600" />
                </div>
              </div>
            </SettingsSection>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SettingsSection
              title="Security Checkup"
              description="Strengthen your account protection"
              icon={Fingerprint}
              iconColor="text-purple-600"
              bgColor="bg-purple-50"
            >
              <div className="space-y-6 mt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-black text-slate-900">2-Factor Authentication</Label>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Add an extra layer of security using your mobile device.</p>
                  </div>
                  <Switch checked={false} disabled className="opacity-50" />
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700 font-medium">
                    2FA management is available through Clerk account security settings.
                  </p>
                </div>
              </div>
            </SettingsSection>
            
            <SettingsSection
              title="Recent Activity"
              description="Monitor your account for unauthorized access"
              icon={History}
              iconColor="text-slate-600"
              bgColor="bg-slate-100"
            >
              <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                        <Monitor className="h-4 w-4 text-slate-400" />
                        <div>
                            <p className="text-sm font-bold text-slate-900">Chrome on Windows</p>
                            <p className="text-[10px] font-medium text-slate-500">Current Session • India</p>
                        </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-0 font-bold text-[9px] uppercase tracking-widest px-2 py-0.5">Active</Badge>
                </div>
              </div>
            </SettingsSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
