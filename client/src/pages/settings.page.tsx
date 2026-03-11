import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Bell, Shield, Globe, Palette, Download, Key,
  CreditCard, FileText, Mail, Smartphone, Monitor, TrendingUp,
  ChevronRight, Check, X, Info, AlertCircle
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
import SEO from "@/components/SEO";

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function SettingsSection({ title, description, icon: Icon, children }: SettingsSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Profile
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+91 98765 43210",
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    reminderNotifications: true,
    
    // Privacy
    twoFactorAuth: false,
    showProfile: true,
    dataSharing: false,
    activityTracking: true,
    
    // Preferences
    language: "en",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    defaultView: "dashboard",
    
    // Tax Settings
    taxRegime: "new",
    autoSave: true,
    autoCalculate: true,
    showTips: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "Setting updated",
      description: "Your preference has been saved.",
    });
  };

  const handleChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value as any }));
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "All your preferences have been updated successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export initiated",
      description: "Your data export will be ready in a few minutes. We'll email you the download link.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <SEO
        title="Settings - Manage Your Preferences | MyeCA.in"
        description="Customize your MyeCA experience. Manage notifications, privacy settings, tax preferences, and account settings."
        keywords="settings, preferences, account management, notifications, privacy, tax settings"
      />

      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
        </motion.div>
      </div>

      {/* Settings Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="tax" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Tax</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <SettingsSection
              title="Personal Information"
              description="Update your personal details and contact information"
              icon={User}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={settings.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={settings.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleSave} className="mt-4">
                  Save Changes
                </Button>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Account Management"
              description="Manage your account settings and data"
              icon={Key}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Export Your Data</h4>
                    <p className="text-sm text-gray-600">Download all your tax data and documents</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700">Permanently delete your account and data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
            </SettingsSection>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <SettingsSection
              title="Email Notifications"
              description="Choose which emails you want to receive"
              icon={Mail}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications" className="font-medium">Tax Filing Updates</Label>
                    <p className="text-sm text-gray-600">Get notified about your tax filing status</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={() => handleToggle("emailNotifications")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminderNotifications" className="font-medium">Due Date Reminders</Label>
                    <p className="text-sm text-gray-600">Receive reminders for important tax deadlines</p>
                  </div>
                  <Switch
                    id="reminderNotifications"
                    checked={settings.reminderNotifications}
                    onCheckedChange={() => handleToggle("reminderNotifications")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketingEmails" className="font-medium">Marketing & Offers</Label>
                    <p className="text-sm text-gray-600">Receive special offers and tax saving tips</p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={settings.marketingEmails}
                    onCheckedChange={() => handleToggle("marketingEmails")}
                  />
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Other Notifications"
              description="Manage SMS and push notifications"
              icon={Smartphone}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications" className="font-medium">SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Receive important updates via SMS</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={settings.smsNotifications}
                    onCheckedChange={() => handleToggle("smsNotifications")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications" className="font-medium">Browser Notifications</Label>
                    <p className="text-sm text-gray-600">Get real-time updates in your browser</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={() => handleToggle("pushNotifications")}
                  />
                </div>
              </div>
            </SettingsSection>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <SettingsSection
              title="Security Settings"
              description="Enhance your account security"
              icon={Shield}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorAuth" className="font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={() => handleToggle("twoFactorAuth")}
                  />
                </div>
                {settings.twoFactorAuth && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">2FA is enabled</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">Your account is protected with two-factor authentication</p>
                  </div>
                )}
              </div>
            </SettingsSection>

            <SettingsSection
              title="Privacy Controls"
              description="Control how your data is used"
              icon={Globe}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showProfile" className="font-medium">Public Profile</Label>
                    <p className="text-sm text-gray-600">Allow others to see your basic profile information</p>
                  </div>
                  <Switch
                    id="showProfile"
                    checked={settings.showProfile}
                    onCheckedChange={() => handleToggle("showProfile")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dataSharing" className="font-medium">Data Sharing</Label>
                    <p className="text-sm text-gray-600">Share anonymized data to improve our services</p>
                  </div>
                  <Switch
                    id="dataSharing"
                    checked={settings.dataSharing}
                    onCheckedChange={() => handleToggle("dataSharing")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="activityTracking" className="font-medium">Activity Tracking</Label>
                    <p className="text-sm text-gray-600">Allow us to track your usage for personalization</p>
                  </div>
                  <Switch
                    id="activityTracking"
                    checked={settings.activityTracking}
                    onCheckedChange={() => handleToggle("activityTracking")}
                  />
                </div>
              </div>
            </SettingsSection>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <SettingsSection
              title="Display Preferences"
              description="Customize how the platform looks and feels"
              icon={Monitor}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => handleChange("language", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                      <SelectItem value="bn">Bengali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={settings.dateFormat} onValueChange={(value) => handleChange("dateFormat", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="defaultView">Default Dashboard View</Label>
                  <Select value={settings.defaultView} onValueChange={(value) => handleChange("defaultView", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Overview Dashboard</SelectItem>
                      <SelectItem value="returns">Tax Returns</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Regional Settings"
              description="Set your location and currency preferences"
              icon={Globe}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => handleChange("currency", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee ({"\u20B9"})</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SettingsSection>
          </TabsContent>

          {/* Tax Settings Tab */}
          <TabsContent value="tax" className="space-y-6">
            <SettingsSection
              title="Tax Preferences"
              description="Set your default tax calculation preferences"
              icon={FileText}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="taxRegime">Default Tax Regime</Label>
                  <Select value={settings.taxRegime} onValueChange={(value) => handleChange("taxRegime", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Tax Regime</SelectItem>
                      <SelectItem value="old">Old Tax Regime</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 mt-1">This will be used as default in tax calculations</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoSave" className="font-medium">Auto-Save Progress</Label>
                    <p className="text-sm text-gray-600">Automatically save your tax filing progress</p>
                  </div>
                  <Switch
                    id="autoSave"
                    checked={settings.autoSave}
                    onCheckedChange={() => handleToggle("autoSave")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoCalculate" className="font-medium">Auto-Calculate Tax</Label>
                    <p className="text-sm text-gray-600">Calculate tax automatically as you enter data</p>
                  </div>
                  <Switch
                    id="autoCalculate"
                    checked={settings.autoCalculate}
                    onCheckedChange={() => handleToggle("autoCalculate")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showTips" className="font-medium">Tax Saving Tips</Label>
                    <p className="text-sm text-gray-600">Show helpful tips while filing returns</p>
                  </div>
                  <Switch
                    id="showTips"
                    checked={settings.showTips}
                    onCheckedChange={() => handleToggle("showTips")}
                  />
                </div>
              </div>
            </SettingsSection>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Tax Settings Help</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      These settings help us provide personalized tax calculations and recommendations. 
                      You can always override these defaults when filing your returns.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}