import { useState } from "react";
import { m } from "framer-motion";
import { 
  Plug, Check, X, ArrowRight, Zap, Shield, 
  Globe, Database, Mail, Phone, CreditCard, FileText,
  TrendingUp, Users, Calendar, BarChart3, Settings, Search, ChevronRight, Activity, Cloud, RefreshCw, Smartphone
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/admin/Layout";
import { cn } from "@/lib/utils";

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
    <Layout>
      <SEO
        title="Integration Hub - Tool Connectivity | MyeCA.in"
        description="Connect MyeCA with your favorite accounting, banking, and productivity tools. Seamless integrations for efficient tax management."
        keywords="integrations, API connections, third-party tools, accounting integration, banking integration"
      />

      <div className="flex flex-col lg:flex-row gap-12 items-start bg-slate-50/50 rounded-[48px] p-2">
        {/* Sticky Left Sidebar */}
        <div className="lg:w-96 shrink-0 w-full space-y-6 lg:sticky lg:top-[112px]">
          <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-100/50">
             <div className="h-28 bg-gradient-to-br from-purple-500 to-fuchsia-500 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
             </div>
             <CardContent className="relative px-6 pb-8">
                <div className="flex flex-col items-center -mt-14">
                   <div className="w-28 h-28 rounded-[40px] bg-white p-2 shadow-2xl">
                      <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-purple-50 to-fuchsia-50 flex items-center justify-center text-4xl font-black text-purple-600 border border-purple-100">
                         <Plug className="h-10 w-10" />
                      </div>
                   </div>
                   <div className="mt-5 text-center">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">System Connect</h2>
                      <Badge variant="outline" className="mt-2 bg-purple-50 text-purple-700 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5">
                         {connectedCount} Active Nodes
                      </Badge>
                   </div>
                </div>

                <div className="mt-10 space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Toolbox Filter</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                         <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest">
                            <SelectValue placeholder="Category" />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">All Modules</SelectItem>
                            {Object.entries(integrationCategories).map(([key, cat]) => (
                               <SelectItem key={key} value={key} className="text-[10px] font-black uppercase tracking-widest">{cat.name}</SelectItem>
                            ))}
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="pt-4 grid grid-cols-2 gap-3">
                      {[
                        { label: "Uptime", value: "99.9%", color: "emerald" },
                        { label: "Latency", value: "48ms", color: "blue" },
                        { label: "API Rate", value: "2.8k", color: "purple" },
                        { label: "Success", value: "99.8%", color: "indigo" }
                      ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-3xl bg-slate-50 border border-slate-100/50 flex flex-col items-center text-center">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                           <span className={cn("text-sm font-black leading-none", `text-${stat.color}-600`)}>{stat.value}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </CardContent>
          </Card>

          <div className="p-8 rounded-[40px] bg-gradient-to-br from-slate-900 to-slate-800 border-none relative overflow-hidden group cursor-pointer shadow-xl shadow-slate-200">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2" />
             <Settings className="h-8 w-8 text-purple-400 mb-6" />
             <h3 className="font-black text-xl leading-tight mb-3 text-white">API Credentials</h3>
             <p className="text-slate-400 text-[10px] font-medium leading-relaxed mb-6">Manage your secret keys and endpoint configurations securely.</p>
             <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black text-[10px] uppercase tracking-widest h-11 rounded-2xl border-none">Control Center</Button>
          </div>
        </div>

        {/* Main Content Area - Full Page Scroll */}
        <div className="flex-1 min-w-0 w-full lg:max-w-7xl space-y-10 pb-20">
          <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100/50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">Ecosystem Hub</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Module Integrations</h1>
              <p className="text-slate-500 max-w-2xl text-base font-medium leading-relaxed">
                Connect your professional stack. Synchronize fiscal data across accounting, banking, and productivity tools in real-time.
              </p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="relative group max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-purple-600 transition-colors" />
                <Input 
                   placeholder="Search connected tools..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="h-16 pl-14 pr-8 rounded-[24px] bg-white border-none shadow-sm text-sm font-black uppercase tracking-widest placeholder:text-slate-200"
                />
             </div>
          </div>

          <div className="space-y-12">
            {Object.entries(filteredIntegrations).map(([category, data]) => {
              const CategoryIcon = data.icon;
              return (
                <div key={category} className="space-y-6">
                  <div className="flex items-center gap-3 ml-2">
                    <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{data.name}</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.integrations.map((integration) => (
                      <Card key={integration.id} className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white group hover:shadow-xl transition-all border border-slate-100/50">
                        <CardContent className="p-8">
                           <div className="flex items-start justify-between mb-8">
                              <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center border border-slate-100 p-3 group-hover:bg-purple-50 group-hover:border-purple-100 transition-colors">
                                 <OptimizedImage 
                                   src={integration.logo} 
                                   alt={integration.name}
                                   width={40}
                                   height={40}
                                   className="rounded-lg grayscale group-hover:grayscale-0 transition-all"
                                   objectFit="contain"
                                 />
                              </div>
                              {getStatusBadge(integration.status)}
                           </div>

                           <div className="space-y-2 mb-8">
                              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                {integration.name}
                                {'popular' in integration && integration.popular && (
                                  <Badge className="bg-amber-100 text-amber-700 border-none text-[8px] font-black uppercase tracking-widest h-4 px-2">Essential</Badge>
                                )}
                              </h3>
                              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                {integration.description}
                              </p>
                           </div>

                           <div className="space-y-4 mb-8">
                             <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Core Capabilities</span>
                                <div className="h-px flex-1 mx-4 bg-slate-50" />
                             </div>
                             <ul className="grid grid-cols-1 gap-2">
                               {integration.features.map((feature, idx) => (
                                 <li key={idx} className="text-[10px] font-black text-slate-600 flex items-center gap-3 uppercase tracking-tight">
                                   <div className="w-1.5 h-1.5 rounded-full bg-purple-200 group-hover:bg-purple-600 transition-colors" />
                                   {feature}
                                 </li>
                               ))}
                             </ul>
                           </div>
                           
                           <div className="pt-4 border-t border-slate-50">
                             {integration.status === "connected" ? (
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Node Online</span>
                                 </div>
                                 <Button 
                                   variant="ghost" 
                                   size="sm"
                                   onClick={() => handleDisconnect(integration.name)}
                                   className="h-10 px-4 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 font-black text-[9px] uppercase tracking-widest"
                                 >
                                   Terminate
                                 </Button>
                               </div>
                             ) : integration.status === "available" ? (
                               <Button 
                                 className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest border-none hover:bg-purple-600 transition-all shadow-lg shadow-slate-100"
                                 onClick={() => handleConnect(integration.name)}
                               >
                                 Connect Pipeline
                               </Button>
                             ) : (
                               <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 text-slate-300 font-black text-[10px] uppercase tracking-widest" disabled>
                                 Reserved Entry
                               </Button>
                             )}
                           </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <Card className="border-none shadow-2xl shadow-purple-100 rounded-[56px] bg-purple-600 p-16 relative overflow-hidden text-center">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
             <div className="relative z-10 space-y-8">
                <div className="w-20 h-20 bg-white/20 rounded-[32px] flex items-center justify-center mx-auto backdrop-blur-xl">
                   <ArrowRight className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-4xl font-black text-white tracking-tighter uppercase">Request Bespoke Module</h3>
                   <p className="text-purple-100 text-sm font-medium max-w-lg mx-auto leading-relaxed">
                      Our engineering team can architect custom data bridges for your proprietary internal systems or niche third-party software.
                   </p>
                </div>
                <Button size="lg" className="h-16 px-12 rounded-3xl bg-white text-purple-600 hover:bg-purple-50 font-black text-xs uppercase tracking-widest border-none shadow-2xl shadow-purple-900/20">
                   Initiate Architect Request
                </Button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}