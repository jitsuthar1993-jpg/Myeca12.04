import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plug, Check, X, ArrowRight, Zap, Shield, 
  Globe, Database, Mail, Phone, CreditCard, FileText,
  TrendingUp, Users, Calendar, BarChart3, Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

// Integration categories
const integrationCategories = {
  accounting: {
    name: "Accounting Software",
    icon: FileText,
    integrations: [
      {
        id: "tally",
        name: "Tally",
        description: "Sync ITR data with Tally ERP",
        logo: "/api/placeholder/48/48",
        features: ["Auto-sync transactions", "GST reconciliation", "Balance sheet import"],
        status: "connected",
        popular: true
      },
      {
        id: "quickbooks",
        name: "QuickBooks",
        description: "Import/export financial data",
        logo: "/api/placeholder/48/48",
        features: ["Invoice sync", "Expense tracking", "Tax reports"],
        status: "available"
      },
      {
        id: "zohobooks",
        name: "Zoho Books",
        description: "Complete accounting integration",
        logo: "/api/placeholder/48/48",
        features: ["Multi-currency", "Project tracking", "Automated workflows"],
        status: "available"
      }
    ]
  },
  banking: {
    name: "Banking",
    icon: CreditCard,
    integrations: [
      {
        id: "icici",
        name: "ICICI Bank",
        description: "Direct bank statement import",
        logo: "/api/placeholder/48/48",
        features: ["Statement download", "Transaction categorization", "Balance check"],
        status: "connected",
        popular: true
      },
      {
        id: "hdfc",
        name: "HDFC Bank",
        description: "Automated transaction sync",
        logo: "/api/placeholder/48/48",
        features: ["Real-time sync", "Multi-account support", "Export to Excel"],
        status: "available"
      },
      {
        id: "sbi",
        name: "State Bank of India",
        description: "SBI account integration",
        logo: "/api/placeholder/48/48",
        features: ["YONO integration", "Statement analysis", "Tax calculations"],
        status: "coming_soon"
      }
    ]
  },
  communication: {
    name: "Communication",
    icon: Mail,
    integrations: [
      {
        id: "whatsapp",
        name: "WhatsApp Business",
        description: "Send automated tax reminders",
        logo: "/api/placeholder/48/48",
        features: ["Bulk messaging", "Document sharing", "Status updates"],
        status: "connected"
      },
      {
        id: "sms",
        name: "SMS Gateway",
        description: "SMS notifications and OTP",
        logo: "/api/placeholder/48/48",
        features: ["Transaction alerts", "Due date reminders", "2FA support"],
        status: "connected"
      },
      {
        id: "email",
        name: "Email Services",
        description: "Advanced email automation",
        logo: "/api/placeholder/48/48",
        features: ["Custom templates", "Bulk campaigns", "Analytics"],
        status: "connected"
      }
    ]
  },
  analytics: {
    name: "Analytics & BI",
    icon: BarChart3,
    integrations: [
      {
        id: "powerbi",
        name: "Power BI",
        description: "Advanced tax analytics",
        logo: "/api/placeholder/48/48",
        features: ["Custom dashboards", "Real-time data", "Predictive analytics"],
        status: "available"
      },
      {
        id: "tableau",
        name: "Tableau",
        description: "Visual tax insights",
        logo: "/api/placeholder/48/48",
        features: ["Interactive reports", "Trend analysis", "Client segmentation"],
        status: "coming_soon"
      },
      {
        id: "googleanalytics",
        name: "Google Analytics",
        description: "Website & user analytics",
        logo: "/api/placeholder/48/48",
        features: ["User behavior", "Conversion tracking", "Custom events"],
        status: "connected"
      }
    ]
  },
  productivity: {
    name: "Productivity",
    icon: Zap,
    integrations: [
      {
        id: "googleworkspace",
        name: "Google Workspace",
        description: "Docs, Sheets & Drive integration",
        logo: "/api/placeholder/48/48",
        features: ["Document storage", "Collaborative editing", "Auto-backup"],
        status: "connected",
        popular: true
      },
      {
        id: "slack",
        name: "Slack",
        description: "Team communication",
        logo: "/api/placeholder/48/48",
        features: ["Notifications", "File sharing", "Client channels"],
        status: "available"
      },
      {
        id: "calendar",
        name: "Calendar Sync",
        description: "Google & Outlook calendar",
        logo: "/api/placeholder/48/48",
        features: ["Due date sync", "Meeting scheduler", "Reminder automation"],
        status: "connected"
      }
    ]
  }
};

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const handleConnect = (integrationName: string) => {
    toast({
      title: "Integration initiated",
      description: `Connecting to ${integrationName}...`,
    });
  };

  const handleDisconnect = (integrationName: string) => {
    toast({
      title: "Integration disconnected",
      description: `${integrationName} has been disconnected.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-700">Connected</Badge>;
      case "available":
        return <Badge className="bg-blue-100 text-blue-700">Available</Badge>;
      case "coming_soon":
        return <Badge className="bg-gray-100 text-gray-700">Coming Soon</Badge>;
      default:
        return null;
    }
  };

  const filteredIntegrations = Object.entries(integrationCategories).reduce((acc, [category, data]) => {
    if (selectedCategory !== "all" && category !== selectedCategory) return acc;
    
    const filtered = data.integrations.filter(integration =>
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filtered.length > 0) {
      acc[category as keyof typeof integrationCategories] = { ...data, integrations: filtered };
    }
    
    return acc;
  }, {} as typeof integrationCategories);

  const connectedCount = Object.values(integrationCategories)
    .flatMap(cat => cat.integrations)
    .filter(int => int.status === "connected").length;

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <SEO
        title="Integration Hub - Connect Your Tools | MyeCA.in"
        description="Connect MyeCA with your favorite accounting, banking, and productivity tools. Seamless integrations for efficient tax management."
        keywords="integrations, API connections, third-party tools, accounting integration, banking integration"
      />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Plug className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Integration Hub</h1>
                <p className="text-gray-600">Connect your favorite tools and services</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              API Settings
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Connected</p>
                    <p className="text-2xl font-bold">{connectedCount}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-2xl font-bold">15+</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plug className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">API Calls Today</p>
                    <p className="text-2xl font-bold">2,847</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold">99.8%</p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-6 w-full md:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="accounting">Accounting</TabsTrigger>
              <TabsTrigger value="banking">Banking</TabsTrigger>
              <TabsTrigger value="communication">Comm</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="productivity">Productivity</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Integration Categories */}
        <div className="space-y-8">
          {Object.entries(filteredIntegrations).map(([category, data]) => {
            const CategoryIcon = data.icon;
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <CategoryIcon className="h-5 w-5 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{data.name}</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.integrations.map((integration) => (
                    <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img 
                              src={integration.logo} 
                              alt={integration.name}
                              className="w-12 h-12 rounded-lg bg-gray-100"
                            />
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {integration.name}
                                {'popular' in integration && integration.popular && (
                                  <Badge variant="outline" className="text-xs">Popular</Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {integration.description}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(integration.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-2">Features</p>
                            <ul className="space-y-1">
                              {integration.features.map((feature, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-center gap-1">
                                  <Check className="h-3 w-3 text-green-500" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="pt-3">
                            {integration.status === "connected" ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                  <span className="text-sm text-green-700">Active</span>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDisconnect(integration.name)}
                                >
                                  Disconnect
                                </Button>
                              </div>
                            ) : integration.status === "available" ? (
                              <Button 
                                className="w-full"
                                onClick={() => handleConnect(integration.name)}
                              >
                                Connect
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            ) : (
                              <Button variant="outline" className="w-full" disabled>
                                Coming Soon
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Integration */}
        <Card className="mt-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Need a Custom Integration?</CardTitle>
            <CardDescription>
              We can build custom integrations for your specific needs
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg">
              Request Custom Integration
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}