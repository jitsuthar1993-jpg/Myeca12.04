import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Globe, 
  Mail, 
  Shield, 
  Database, 
  Users, 
  CreditCard, 
  Bell, 
  FileText, 
  Palette,
  Key,
  Server,
  Activity,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw
} from "lucide-react";

// Settings content component
function AdminSettingsContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // General Settings
  const [siteName, setSiteName] = useState("MyeCA.in");
  const [siteDescription, setSiteDescription] = useState("Expert Income Tax Filing & ITR e-Filing in India");
  const [supportEmail, setSupportEmail] = useState("support@myeca.in");
  const [contactPhone, setContactPhone] = useState("+91-9876543210");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Email Settings
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  
  // Payment Settings
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [paymentMode, setPaymentMode] = useState("test");
  const [paymentsEnabled, setPaymentsEnabled] = useState(true);
  
  // Security Settings
  const [jwtExpiry, setJwtExpiry] = useState("7d");
  const [passwordMinLength, setPasswordMinLength] = useState("8");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("24");
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [adminAlerts, setAdminAlerts] = useState(true);
  
  // Tax Filing Settings
  const [currentAssessmentYear, setCurrentAssessmentYear] = useState("2025-26");
  const [itrFilingEnabled, setItrFilingEnabled] = useState(true);
  const [maxFileSize, setMaxFileSize] = useState("10");
  const [autoSaveDrafts, setAutoSaveDrafts] = useState(true);
  
  // API Settings
  const [rateLimit, setRateLimit] = useState("100");
  const [apiTimeout, setApiTimeout] = useState("30");
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  const handleSaveSettings = async (section: string) => {
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: `${section} settings have been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async (type: string) => {
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Connection Test",
        description: `${type} connection test successful.`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `${type} connection test failed.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-gray-600 mt-2">Configure system settings and platform options</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="tax">Tax Filing</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Configuration
              </CardTitle>
              <CardDescription>
                Basic site information and global settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="MyeCA.in"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@myeca.in"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Expert Income Tax Filing & ITR e-Filing in India"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91-9876543210"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenanceMode"
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  {maintenanceMode && (
                    <Badge variant="destructive">Active</Badge>
                  )}
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings("General")} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                SMTP settings for transactional emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="emailEnabled"
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
                <Label htmlFor="emailEnabled">Enable Email Service</Label>
                {emailEnabled ? (
                  <Badge variant="default">Enabled</Badge>
                ) : (
                  <Badge variant="secondary">Disabled</Badge>
                )}
              </div>
              
              {emailEnabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        placeholder="587"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input
                        id="smtpUser"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        placeholder="App Password"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => handleTestConnection("Email")} variant="outline">
                      <Activity className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                    <Button onClick={() => handleSaveSettings("Email")}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Email Settings
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Gateway
              </CardTitle>
              <CardDescription>
                Configure Razorpay payment processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="paymentsEnabled"
                  checked={paymentsEnabled}
                  onCheckedChange={setPaymentsEnabled}
                />
                <Label htmlFor="paymentsEnabled">Enable Payments</Label>
                {paymentsEnabled ? (
                  <Badge variant="default">Enabled</Badge>
                ) : (
                  <Badge variant="secondary">Disabled</Badge>
                )}
              </div>
              
              {paymentsEnabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMode">Payment Mode</Label>
                    <Select value={paymentMode} onValueChange={setPaymentMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">Test Mode</SelectItem>
                        <SelectItem value="live">Live Mode</SelectItem>
                      </SelectContent>
                    </Select>
                    {paymentMode === "test" && (
                      <Badge variant="secondary">Test Mode Active</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                      <Input
                        id="razorpayKeyId"
                        value={razorpayKeyId}
                        onChange={(e) => setRazorpayKeyId(e.target.value)}
                        placeholder="rzp_test_1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                      <Input
                        id="razorpayKeySecret"
                        type="password"
                        value={razorpayKeySecret}
                        onChange={(e) => setRazorpayKeySecret(e.target.value)}
                        placeholder="Secret Key"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => handleTestConnection("Payment")} variant="outline">
                      <Activity className="h-4 w-4 mr-2" />
                      Test Gateway
                    </Button>
                    <Button onClick={() => handleSaveSettings("Payment")}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Payment Settings
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Clerk-controlled authentication and MyeCA session policy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jwtExpiry">Clerk Session Policy</Label>
                  <Select value={jwtExpiry} onValueChange={setJwtExpiry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Strict session refresh</SelectItem>
                      <SelectItem value="24h">Daily Clerk refresh</SelectItem>
                      <SelectItem value="7d">Weekly Clerk refresh</SelectItem>
                      <SelectItem value="30d">Monthly Clerk refresh</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Configure actual session lifetime, MFA, and passwordless methods in Clerk.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Password Policy Reference</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={passwordMinLength}
                    onChange={(e) => setPasswordMinLength(e.target.value)}
                    min="6"
                    max="20"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    MyeCA does not create admin passwords; Clerk owns passwordless and password rules.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="twoFactorAuth"
                    checked={twoFactorAuth}
                    onCheckedChange={setTwoFactorAuth}
                  />
                  <Label htmlFor="twoFactorAuth">Require Clerk MFA for privileged users</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Idle Auto Logout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value="15"
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    min="15"
                    max="15"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Locked by policy: warning at 14 minutes, logout at 15 minutes.
                  </p>
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings("Security")} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Filing Settings */}
        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tax Filing Configuration
              </CardTitle>
              <CardDescription>
                ITR filing and tax-related settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentAssessmentYear">Current Assessment Year</Label>
                  <Select value={currentAssessmentYear} onValueChange={setCurrentAssessmentYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-24">2023-24</SelectItem>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2025-26">2025-26</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={maxFileSize}
                    onChange={(e) => setMaxFileSize(e.target.value)}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="itrFilingEnabled"
                    checked={itrFilingEnabled}
                    onCheckedChange={setItrFilingEnabled}
                  />
                  <Label htmlFor="itrFilingEnabled">ITR Filing Enabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoSaveDrafts"
                    checked={autoSaveDrafts}
                    onCheckedChange={setAutoSaveDrafts}
                  />
                  <Label htmlFor="autoSaveDrafts">Auto-save Drafts</Label>
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings("Tax Filing")} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Tax Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                API limits, caching, and system performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rateLimit">API Rate Limit (per minute)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(e.target.value)}
                    min="10"
                    max="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiTimeout">API Timeout (seconds)</Label>
                  <Input
                    id="apiTimeout"
                    type="number"
                    value={apiTimeout}
                    onChange={(e) => setApiTimeout(e.target.value)}
                    min="5"
                    max="120"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cacheEnabled"
                    checked={cacheEnabled}
                    onCheckedChange={setCacheEnabled}
                  />
                  <Label htmlFor="cacheEnabled">Enable Caching</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="debugMode"
                    checked={debugMode}
                    onCheckedChange={setDebugMode}
                  />
                  <Label htmlFor="debugMode">Debug Mode</Label>
                  {debugMode && (
                    <Badge variant="destructive">Active</Badge>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smsNotifications"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pushNotifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="adminAlerts"
                    checked={adminAlerts}
                    onCheckedChange={setAdminAlerts}
                  />
                  <Label htmlFor="adminAlerts">Admin Alerts</Label>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => handleSaveSettings("System")} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save System Settings
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart System
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Main settings page without sidebar
export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AdminSettingsContent />
      </div>
    </div>
  );
}
