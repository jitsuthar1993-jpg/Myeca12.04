import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { 
  TrendingUp, TrendingDown, Users, FileText, IndianRupee, 
  Calendar, Award, Target, Activity, Download, RefreshCw, Eye, Zap, 
  ChevronRight, ArrowRight, BarChart3, Clock, MapPin
} from "lucide-react";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import SEO from "@/components/SEO";
import { Layout } from "@/components/admin/Layout";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

// Sample data - In production, this would come from API
const revenueData = [
  { month: "Jan", revenue: 450000, users: 3200, filings: 2800 },
  { month: "Feb", revenue: 520000, users: 3800, filings: 3400 },
  { month: "Mar", revenue: 890000, users: 5600, filings: 5200 },
  { month: "Apr", revenue: 1250000, users: 8900, filings: 8500 },
  { month: "May", revenue: 980000, users: 7200, filings: 6800 },
  { month: "Jun", revenue: 1450000, users: 10500, filings: 9800 },
  { month: "Jul", revenue: 2100000, users: 15000, filings: 14200 },
];

const serviceDistribution = [
  { name: "ITR Filing", value: 45, color: "#3b82f6" },
  { name: "GST Returns", value: 20, color: "#10b981" },
  { name: "Company Registration", value: 15, color: "#f59e0b" },
  { name: "Compliance Services", value: 12, color: "#8b5cf6" },
  { name: "Others", value: 8, color: "#6b7280" },
];

const userDemographics = [
  { age: "18-25", male: 2500, female: 2200 },
  { age: "26-35", male: 4500, female: 3800 },
  { age: "36-45", male: 3200, female: 2800 },
  { age: "46-55", male: 2100, female: 1900 },
  { age: "56+", male: 1200, female: 1000 },
];

const performanceMetrics = [
  { metric: "Page Load Time", value: 1.2, target: 2.0, unit: "s" },
  { metric: "Success Rate", value: 99.8, target: 99.0, unit: "%" },
  { metric: "User Satisfaction", value: 4.8, target: 4.5, unit: "/5" },
  { metric: "Support Response", value: 15, target: 30, unit: "min" },
  { metric: "Uptime", value: 99.9, target: 99.5, unit: "%" },
];

const geographicData = [
  { state: "Maharashtra", users: 25000 },
  { state: "Karnataka", users: 18000 },
  { state: "Delhi NCR", users: 15000 },
  { state: "Tamil Nadu", users: 12000 },
  { state: "Gujarat", users: 10000 },
  { state: "West Bengal", users: 8000 },
  { state: "Others", users: 27000 },
];

export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(false);
  const { setPageTitle } = useAccessibility();

  useEffect(() => {
    setPageTitle("Analytics Dashboard");
  }, [setPageTitle]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const PerformanceMetric = ({ metric, value, target, unit }: any) => {
    const percentage = (value / target) * 100;
    const isExceeding = value >= target;
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
          <span>{metric}</span>
          <span className={cn("font-black", isExceeding ? "text-emerald-600" : "text-amber-600")}>
            {value}{unit}
          </span>
        </div>
        <Progress value={Math.min(percentage, 100)} className="h-2 bg-slate-100" indicatorClassName={isExceeding ? "bg-emerald-500" : "bg-amber-500"} />
      </div>
    );
  };

  return (
    <Layout>
      <SEO 
        title="Performance Analytics | MyeCA.in"
        description="Comprehensive analytics and insights for platform performance, user metrics, and tax filing statistics."
      />

      <div className="flex flex-col lg:flex-row gap-12 items-start h-[calc(100vh-200px)] lg:h-[calc(100vh-240px)] overflow-hidden bg-slate-50/50 rounded-[48px] p-2">
        {/* Fixed Left Summary Section */}
        <div className="lg:w-96 h-full overflow-y-auto pr-2 shrink-0 w-full scrollbar-none pb-10 space-y-6">
          <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-100/50">
             <div className="h-32 bg-gradient-to-br from-slate-900 to-slate-800 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="absolute top-6 left-6 flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <BarChart3 className="h-6 w-6 text-white" />
                   </div>
                   <h2 className="text-white font-black tracking-tight">System Intel</h2>
                </div>
             </div>
             
             <CardContent className="px-6 pb-8 relative">
                <div className="space-y-8 -mt-8">
                   <div className="p-6 rounded-[32px] bg-white shadow-2xl border border-slate-100 space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observability Window</p>
                      <div className="flex items-center gap-3">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                          <SelectTrigger className="flex-1 rounded-2xl border-none shadow-sm bg-slate-50 font-black text-xs h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="24h" className="rounded-xl font-bold">Last 24 Hours</SelectItem>
                            <SelectItem value="7d" className="rounded-xl font-bold">Last 7 Days</SelectItem>
                            <SelectItem value="30d" className="rounded-xl font-bold">Last 30 Days</SelectItem>
                            <SelectItem value="90d" className="rounded-xl font-bold">Last quarter</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-slate-100" onClick={handleRefresh}>
                           <RefreshCw className={cn("h-5 w-5 text-slate-600", isLoading && "animate-spin")} />
                        </Button>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Core Health</p>
                      <div className="grid grid-cols-2 gap-3">
                         {[
                           { label: "Rev Yield", value: "₹82.5L", trend: "+15%", color: "blue" },
                           { label: "Active Nodes", value: "15.2K", trend: "+8.7%", color: "emerald" },
                           { label: "Filings", value: "12.8K", trend: "+12%", color: "indigo" },
                           { label: "Uptime", value: "99.9%", trend: "100%", color: "amber" }
                         ].map((m, i) => (
                           <div key={i} className="p-4 rounded-[24px] bg-slate-50 border border-slate-100">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{m.label}</p>
                              <p className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">{m.value}</p>
                              <Badge className="bg-white text-[8px] font-black text-slate-400 border-none px-1.5 py-0 rounded-md">{m.trend}</Badge>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Latency Profile</p>
                      <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 space-y-6">
                         <PerformanceMetric metric="Avg Page Load" value={1.2} target={2.0} unit="s" />
                         <PerformanceMetric metric="API Response" value={45} target={100} unit="ms" />
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Button className="w-full h-16 rounded-[32px] bg-slate-900 text-white hover:bg-slate-800 font-black text-xs uppercase tracking-widest transition-all hover:-translate-y-1">
             <Download className="h-5 w-5 mr-3 text-blue-400" />
             Download Analytics
          </Button>
        </div>

        {/* Main Content Area - Independently Scrollable */}
        <div className="flex-1 min-w-0 w-full lg:max-w-7xl h-full overflow-y-auto pr-4 pb-20 scroll-smooth custom-scrollbar space-y-10">
          {/* Header */}
          <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100/50 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Enterprise Dashboard</span>
               </div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Observability</h1>
               <p className="text-slate-500 max-w-2xl text-base font-medium leading-relaxed">
                  Real-time telemetry and deep-dive analytics into platform transactions, user behavior, and infrastructure performance.
               </p>
            </div>
            <div className="flex gap-4">
               <Button variant="outline" className="rounded-2xl h-14 px-8 border-slate-100 bg-white font-black text-xs uppercase tracking-widest">
                  Custom Query
               </Button>
            </div>
          </div>

          <Tabs defaultValue="revenue" className="space-y-10">
            <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none">
              <TabsList className="bg-white p-2 rounded-[28px] border border-slate-100/50 h-auto shadow-sm">
                {[
                  { id: "revenue", label: "Financials", icon: IndianRupee },
                  { id: "services", label: "Services", icon: Zap },
                  { id: "users", label: "Demographics", icon: Users },
                  { id: "performance", label: "Core Web Vitals", icon: Activity },
                  { id: "geographic", label: "Markets", icon: MapPin }
                ].map((t) => (
                  <TabsTrigger 
                    key={t.id} 
                    value={t.id} 
                    className="rounded-2xl px-6 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                  >
                    <t.icon className="h-4 w-4 mr-2" />
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="revenue" className="space-y-10 m-0">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 border-none shadow-sm rounded-[48px] bg-white p-10">
                    <div className="flex items-center justify-between mb-10">
                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Growth Velocity</h3>
                       <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Monthly Trend</Badge>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                        <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}} />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="border-none shadow-sm rounded-[48px] bg-white p-10">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Yield Breakdown</h3>
                    <div className="space-y-8">
                      {[
                        { name: "ITR Filing", val: 45, color: "blue" },
                        { name: "GST Returns", val: 20, color: "emerald" },
                        { name: "Company Reg", val: 15, color: "amber" },
                        { name: "Other Ops", val: 20, color: "slate" }
                      ].map((s, i) => (
                        <div key={i} className="space-y-3">
                           <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                              <span className="text-slate-400">{s.name}</span>
                              <span className="text-slate-900">{s.val}%</span>
                           </div>
                           <Progress value={s.val} className="h-2 bg-slate-50" indicatorClassName={`bg-${s.color}-500`} />
                        </div>
                      ))}
                    </div>
                  </Card>
               </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-10 m-0">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {serviceDistribution.map((service, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-[40px] bg-white p-10 group hover:shadow-xl transition-all">
                       <div className="flex items-center justify-between mb-8">
                          <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                             <Zap className="h-7 w-7" />
                          </div>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">{service.value}%</p>
                       </div>
                       <h4 className="text-lg font-black text-slate-900 mb-1">{service.name}</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Share</p>
                    </Card>
                  ))}
               </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-10 m-0">
               <Card className="border-none shadow-sm rounded-[48px] bg-white p-12">
                  <div className="flex items-center justify-between mb-12">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">User Demographics</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={userDemographics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}} />
                      <Legend iconType="circle" />
                      <Bar dataKey="male" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="female" fill="#ec4899" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </Card>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-10 m-0">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-none shadow-sm rounded-[48px] bg-white p-12">
                     <h3 className="text-xl font-black text-slate-900 tracking-tight mb-10">Asset Latency (ms)</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={[
                          { ep: "Auth", t: 45 },
                          { ep: "Submit", t: 120 },
                          { ep: "Calc", t: 30 },
                          { ep: "Vault", t: 85 },
                          { ep: "Home", t: 60 },
                        ]}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="ep" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                           <Tooltip contentStyle={{borderRadius: '24px', border: 'none'}} />
                           <Line type="monotone" dataKey="t" stroke="#3b82f6" strokeWidth={4} dot={{r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} />
                        </LineChart>
                     </ResponsiveContainer>
                  </Card>
                  
                  <Card className="border-none shadow-sm rounded-[48px] bg-white p-12">
                     <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Node Reliability</h3>
                     <div className="space-y-10 mt-10">
                        {performanceMetrics.map((p, i) => (
                           <PerformanceMetric key={i} metric={p.metric} value={p.value} target={p.target} unit={p.unit} />
                        ))}
                     </div>
                  </Card>
               </div>
            </TabsContent>
          </Tabs>

          {/* Real-time Activity Feed */}
          <div className="space-y-6">
             <div className="flex items-center justify-between ml-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Events</h3>
                <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest text-blue-600">View History →</Button>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {[
                  { time: "2m", action: "Transaction Executed", node: "Mumbai, MH", icon: Zap, color: "blue" },
                  { time: "5m", action: "Submission Received", node: "Bangalore, KA", icon: FileText, color: "emerald" },
                  { time: "8m", action: "Node Authorization", node: "Delhi, DL", icon: Users, color: "indigo" },
                  { time: "12m", action: "Payment Pipeline", node: "Chennai, TN", icon: IndianRupee, color: "amber" }
                ].map((act, i) => (
                  <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100/50 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                     <div className="flex items-center gap-6">
                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-colors", `bg-${act.color}-50 text-${act.color}-600`)}>
                           <act.icon className="h-6 w-6" />
                        </div>
                        <div>
                           <h4 className="text-base font-black text-slate-900 leading-none mb-1.5">{act.action}</h4>
                           <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.node}</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.time} ago</span>
                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                           <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}