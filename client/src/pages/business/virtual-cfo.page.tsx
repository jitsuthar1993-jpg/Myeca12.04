import { Link } from "wouter";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Gem,
  IndianRupee,
  LineChart,
  PieChart as PieChartIcon,
  Plus,
  Rocket,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import MetaSEO from "@/components/seo/MetaSEO";
import { formatInr } from "@/components/platform/compliance-ui";

const monthlyRevenueData = [
  { month: "Apr", revenue: 850000, expenses: 620000, profit: 230000 },
  { month: "May", revenue: 920000, expenses: 680000, profit: 240000 },
  { month: "Jun", revenue: 780000, expenses: 590000, profit: 190000 },
  { month: "Jul", revenue: 1050000, expenses: 720000, profit: 330000 },
  { month: "Aug", revenue: 980000, expenses: 710000, profit: 270000 },
  { month: "Sep", revenue: 1120000, expenses: 780000, profit: 340000 },
  { month: "Oct", revenue: 1200000, expenses: 820000, profit: 380000 },
  { month: "Nov", revenue: 1350000, expenses: 890000, profit: 460000 },
];

const expenseBreakdown = [
  { name: "Salaries", value: 450000, color: "#2563eb" },
  { name: "Rent & utilities", value: 120000, color: "#10b981" },
  { name: "Marketing", value: 80000, color: "#f59e0b" },
  { name: "Technology", value: 95000, color: "#8b5cf6" },
  { name: "Operations", value: 145000, color: "#ef4444" },
];

const services = [
  {
    title: "Strategic Financial Planning",
    desc: "Long-term budgeting, forecasting, and scenario planning to guide your business growth.",
    icon: TrendingUp,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Real-time Telemetry",
    desc: "Live dashboards tracking P&L, cash flow, and burn rate with drill-down capabilities.",
    icon: BarChart3,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Tax & Compliance HQ",
    desc: "Comprehensive GST, TDS, and Income Tax management handled by expert CAs.",
    icon: ShieldCheck,
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Board & Investor Reporting",
    desc: "Professional MIS reports and financial storytelling for your stakeholders.",
    icon: PieChartIcon,
    color: "bg-orange-50 text-orange-600",
  },
];

export default function VirtualCFOPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      <MetaSEO
        title="Virtual CFO Services for Startups & SMEs | Strategic Financial Leadership"
        description="Scale your business with MyeCA.in's Virtual CFO services. Get expert financial planning, real-time telemetry, and strategic leadership at a fraction of the cost."
      />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-50">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-sm mb-8"
            >
              <Gem className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-black uppercase tracking-widest text-blue-700">Premium Professional Service</span>
            </m.div>

            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight mb-6"
            >
              Your Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Financial Pilot</span>
            </m.h1>

            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              Get high-level CFO expertise without the full-time salary. We handle your P&L, 
              strategic planning, and compliance, so you can focus on building your vision.
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-black h-14 px-8 rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1">
                Book a Discovery Call
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white border-slate-200 text-slate-700 font-bold h-14 px-8 rounded-2xl hover:bg-slate-50 transition-all">
                Download Brochure
                <Download className="ml-2 h-5 w-5" />
              </Button>
            </m.div>

            {/* Trusted By / Proof */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-40 grayscale"
            >
              <span className="text-sm font-black uppercase tracking-widest text-slate-400">Trusted by founders at</span>
              <div className="h-8 w-24 bg-slate-300 rounded-lg" />
              <div className="h-8 w-32 bg-slate-300 rounded-lg" />
              <div className="h-8 w-28 bg-slate-300 rounded-lg" />
            </m.div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Financial Mastery, <span className="text-blue-600">Simplified</span></h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">We provide the structure and insight needed to turn your financial data into a competitive advantage.</p>
          </div>

          <m.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {services.map((s, idx) => (
              <m.div key={idx} variants={item} className="group p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
                <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  <s.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-blue-600 transition-colors">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{s.desc}</p>
              </m.div>
            ))}
          </m.div>
        </div>
      </section>

      {/* Live Platform Demo Section - Light Theme */}
      <section className="py-24 bg-blue-50/50 border-y border-blue-100 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-widest mb-6">
                <Zap className="h-3 w-3 fill-blue-600" />
                Live Platform Preview
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
                Finance Telemetry at Your <span className="text-blue-600">Fingertips</span>
              </h2>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Our proprietary platform gives you instant access to your business vitals. 
                Track every rupee with AI-driven anomaly detection and CA-verified reporting.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Automated Reconciliation", desc: "Bank-to-Book reconciliation handled daily." },
                  { title: "Anomaly Detection", desc: "Identify expense leaks and GST risks before they impact you." },
                  { title: "Predictive Burn Rate", desc: "Always know your runway with high-precision forecasting." }
                ].map((f, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{f.title}</h4>
                      <p className="text-sm text-slate-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                  Request a Demo
                </Button>
              </div>
            </div>

            {/* Mock Dashboard UI - Light Version */}
            <m.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] blur opacity-10" />
              <Card className="bg-white border-slate-200 p-6 rounded-[32px] shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">P&L Velocity</h3>
                    <p className="text-2xl font-black text-slate-900 mt-1">₹4.2 Cr <span className="text-xs text-emerald-600 font-bold ml-2">+18.4% vs PY</span></p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-600 border-blue-100">Live Telemetry</Badge>
                </div>
                
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenueData}>
                      <defs>
                        <linearGradient id="demoRevenueLight" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                        itemStyle={{ color: "#0f172a" }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fill="url(#demoRevenueLight)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">EBITDA Margin</p>
                    <p className="text-lg font-black text-slate-900">32.4%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Cash Runway</p>
                    <p className="text-lg font-black text-slate-900">18 Months</p>
                  </div>
                </div>
              </Card>

              {/* Floating Element 1 */}
              <m.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-6 w-40 p-4 bg-white border border-slate-100 rounded-2xl shadow-xl z-20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-[10px] font-bold text-slate-600">GST Compliance</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full" />
                </div>
                <p className="text-[9px] text-emerald-600 font-bold mt-2">100% Verified</p>
              </m.div>

              {/* Floating Element 2 */}
              <m.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-10 p-5 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 max-w-[200px]"
              >
                <p className="text-xs font-bold text-slate-600 mb-2 italic">"Switching to MyeCA Virtual CFO was the best strategic move we made this year."</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100" />
                  <span className="text-[10px] font-bold text-slate-900">Rohit S., CEO at TechFlow</span>
                </div>
              </m.div>
            </m.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us / Comparison */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">The Modern Choice</h2>
            <p className="text-lg text-slate-500">Why settle for a part-time accountant when you can have a full-service strategic team?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="p-8 md:p-12 rounded-[40px] bg-slate-50 border border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 mb-8">Traditional CFO</h3>
              <ul className="space-y-6">
                {[
                  "Expensive: ₹25L - ₹60L per annum salary",
                  "Single person risk & limited bandwidth",
                  "Fragmented toolsets and spreadsheets",
                  "Slow manual reporting cycles",
                  "Limited experience across diverse industries"
                ].map((text, i) => (
                  <li key={i} className="flex gap-4 items-center text-slate-500 font-medium">
                    <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center shrink-0">
                      <Plus className="w-3 h-3 rotate-45" />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 md:p-12 rounded-[40px] bg-blue-600 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Rocket className="h-40 w-40 rotate-12" />
              </div>
              <h3 className="text-2xl font-black mb-8 relative z-10">MyeCA Virtual CFO</h3>
              <ul className="space-y-6 relative z-10">
                {[
                  "Affordable: Starting at ₹49k per month",
                  "Team of Experts: Dedicated CA + Tech stack",
                  "Unified Tech: Real-time finance dashboard",
                  "Instant Data: Live telemetry 24/7",
                  "Cross-Industry: Insights from 500+ scale-ups"
                ].map((text, i) => (
                  <li key={i} className="flex gap-4 items-center font-bold">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
              <div className="mt-12 relative z-10">
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-black h-14 rounded-2xl">
                  Get Started Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Packages */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Tailored to Your <span className="text-blue-600">Scale</span></h2>
            <p className="text-lg text-slate-500">From seed-stage startups to established enterprises.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Standard CFO",
                price: "49,000",
                desc: "Essential financial management for growing startups.",
                features: ["Monthly P&L & Cash Flow", "GST & TDS Compliance", "Basic Budgeting", "CA Review of Accounts", "Platform Access (1 User)"]
              },
              {
                name: "Growth CFO",
                price: "99,000",
                desc: "Strategic leadership for companies scaling fast.",
                popular: true,
                features: ["Everything in Standard", "Weekly Finance Meetings", "Investor Reporting", "Tax Planning & Audit Prep", "Virtual CFO Advisory", "Platform Access (5 Users)"]
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "Full-scale financial department for large operations.",
                features: ["Everything in Growth", "Dedicated CFO Team", "Internal Audit & Internal Controls", "Fundraising Assistance", "M&A Support", "Unlimited Users"]
              }
            ].map((p, i) => (
              <Card key={i} className={cn(
                "p-8 rounded-[32px] border transition-all duration-300 flex flex-col h-full",
                p.popular ? "border-blue-200 shadow-2xl scale-105 bg-white z-10" : "border-slate-200 bg-white/50 hover:bg-white hover:shadow-xl"
              )}>
                {p.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-8 relative z-10">
                  <h3 className="text-xl font-black text-slate-900 mb-2">{p.name}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{p.desc}</p>
                </div>
                <div className="mb-8 flex items-baseline gap-1 relative z-10">
                  <span className="text-slate-400 font-bold">₹</span>
                  <span className="text-4xl font-black text-slate-900">{p.price}</span>
                  {p.price !== "Custom" && <span className="text-slate-400 font-bold">/mo</span>}
                </div>
                <ul className="space-y-4 mb-10 flex-1 relative z-10">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex gap-3 items-start text-sm text-slate-600 font-medium">
                      <div className="mt-1 w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className={cn(
                  "w-full font-black h-12 rounded-xl transition-all relative z-10",
                  p.popular ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                )}>
                  Choose {p.name}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto p-12 md:p-20 rounded-[48px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
                Ready to Accelerate Your <span className="text-blue-200">Growth?</span>
              </h2>
              <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
                Join 500+ high-growth companies that trust MyeCA for their financial strategic leadership. 
                Get started with a free financial audit today.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-black h-16 px-10 rounded-2xl shadow-xl transition-all hover:-translate-y-1">
                  Start Your Free Audit
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold h-16 px-10 rounded-2xl backdrop-blur-sm transition-all">
                  Talk to a CFO
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
