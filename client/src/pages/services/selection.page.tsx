import { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Building2, 
  User, 
  Rocket, 
  Scale, 
  FileText, 
  Receipt,
  Star as StarIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: 'all', label: 'All Services', icon: Sparkles },
  { id: 'individual', label: 'Individual', icon: User },
  { id: 'tax-compliance', label: 'Tax & Compliance', icon: FileText },
  { id: 'business', label: 'Business Setup', icon: Building2 },
  { id: 'startup', label: 'Startup Hub', icon: Rocket },
];

const SERVICES_DATA = [
  {
    id: 'itr-filing',
    title: 'Income Tax Return',
    category: 'individual',
    description: 'Expert filing for salaried, professional, and business income.',
    price: '₹999',
    features: ['Precision Review', 'Tax Optimization', '24/7 Expert Support'],
    color: 'blue',
    popular: true
  },
  {
    id: 'gst-reg',
    title: 'GST Registration',
    category: 'business',
    description: 'Get your GSTIN quickly with complete documentation.',
    price: '₹1,499',
    features: ['ARN Generation', 'Certificate Download', 'Expert Consulting'],
    color: 'emerald',
    popular: true
  },
  {
    id: 'company-incorp',
    title: 'Company Incorporation',
    category: 'startup',
    description: 'End-to-end support for PVT LTD, LLP, or One Person Company.',
    price: '₹5,999',
    features: ['DIN & DSC Included', 'MOA/AOA Drafting', 'PAN/TAN Support'],
    color: 'violet',
    popular: true
  },
  {
    id: 'tds-filing',
    title: 'TDS Return Filing',
    category: 'tax-compliance',
    description: 'Quarterly compliance for salary and non-salary payments.',
    price: '₹1,999',
    features: ['FVU Generation', '24Q/26Q Support', 'Zero Error Filing'],
    color: 'amber'
  },
  {
    id: 'msme-reg',
    title: 'MSME Registration',
    category: 'business',
    description: 'Udyam registration to unlock government benefits and subsidies.',
    price: '₹499',
    features: ['Instant Certificate', 'Government Perks', 'Priority Lending'],
    color: 'cyan'
  },
  {
    id: 'trademark-reg',
    title: 'Trademark Filing',
    category: 'startup',
    description: 'Protect your brand name, logo, and identity legally.',
    price: '₹2,499',
    features: ['Brand Protection', 'Search Report', 'Expert Drafting'],
    color: 'rose'
  }
];

export default function ServiceSelectionPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = useMemo(() => {
    return SERVICES_DATA.filter(service => {
      const matchesCategory = activeTab === 'all' || service.category === activeTab;
      const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            service.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="mb-8">
          <Link href="/dashboard">
            <m.button
              whileHover={{ x: -4 }}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </m.button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-500/20"
              >
                <Sparkles className="h-3 w-3" />
                Expert Marketplace
              </m.div>
              <m.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4"
              >
                Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Premium Service</span>
              </m.h1>
              <m.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed"
              >
                Launch your business or secure your financial future with our range of professional CA services tailored for your success.
              </m.p>
            </div>

            <m.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3 }}
               className="relative w-full md:w-80"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search for a service..."
                className="w-full h-14 pl-12 rounded-2xl bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </m.div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mb-8 flex flex-wrap gap-2 p-1 bg-white border border-slate-200 rounded-[20px] w-fit shadow-sm">
          {CATEGORIES.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all duration-500",
                activeTab === tab.id 
                  ? "text-white" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {activeTab === tab.id && (
                <m.div
                  layoutId="activeSelectionTab"
                  className="absolute inset-0 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className={cn("h-4 w-4 relative z-10 transition-transform duration-500", activeTab === tab.id && "scale-110")} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service, idx) => (
              <m.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="h-full group relative overflow-hidden bg-white border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[24px] flex flex-col">
                  {/* Glass Card Gradient */}
                  <div className={cn(
                    "absolute -top-16 -right-16 w-32 h-32 blur-[60px] transition-all duration-700 opacity-0 group-hover:opacity-20",
                    service.color === 'blue' && "bg-blue-500",
                    service.color === 'emerald' && "bg-emerald-500",
                    service.color === 'violet' && "bg-violet-500",
                    service.color === 'amber' && "bg-amber-500",
                    service.color === 'cyan' && "bg-cyan-500",
                    service.color === 'rose' && "bg-rose-500",
                  )} />

                  <CardHeader className="p-5 relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <div className={cn(
                        "p-2.5 rounded-xl transition-all duration-500 group-hover:scale-110 shadow-sm",
                        service.color === 'blue' && "bg-blue-500/10 text-blue-600",
                        service.color === 'emerald' && "bg-emerald-500/10 text-emerald-600",
                        service.color === 'violet' && "bg-violet-500/10 text-violet-600",
                        service.color === 'amber' && "bg-amber-500/10 text-amber-600",
                        service.color === 'cyan' && "bg-cyan-500/10 text-cyan-600",
                        service.color === 'rose' && "bg-rose-500/10 text-rose-600",
                      )}>
                        {service.category === 'individual' && <User className="h-5 w-5" />}
                        {service.category === 'business' && <Building2 className="h-5 w-5" />}
                        {service.category === 'startup' && <Rocket className="h-5 w-5" />}
                        {service.category === 'tax-compliance' && <FileText className="h-5 w-5" />}
                      </div>
                      {service.popular && (
                        <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-0 flex items-center gap-1 font-black text-[8px] tracking-tight uppercase px-2 py-0.5">
                          <StarIcon className="h-2.5 w-2.5 fill-yellow-600" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-8">
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-5 pb-5 flex-1 flex flex-col relative z-10">
                    <div className="space-y-2 mb-6">
                      {service.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-blue-600 shrink-0" />
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 tracking-tight">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between py-3 border-t border-slate-100">
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Fee</span>
                          <span className="text-xl font-extrabold text-slate-900">{service.price}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Time</span>
                          <span className="text-[11px] font-bold text-slate-900 flex items-center justify-end gap-1">
                            <Clock className="h-3 w-3 text-blue-600" />
                            3-5 Days
                          </span>
                        </div>
                      </div>

                      <Link href={`/services/activate/${service.id}`}>
                        <Button className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600/90 dark:hover:bg-blue-500 text-white font-black text-xs transition-all duration-300 gap-2 shadow-lg shadow-blue-500/20 group/btn">
                          Select Service
                          <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </m.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dynamic Footer section - Redesigned for Visibility */}
        <m.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6 }}
           className="mt-12 p-6 md:p-8 rounded-[32px] bg-white border border-slate-100 relative overflow-hidden shadow-lg"
        >
          {/* Decorative Background for banner */}
          <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-600/5 blur-[120px] rounded-full transform translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[30%] h-full bg-indigo-600/5 blur-[100px] rounded-full transform -translate-x-1/2" />
          
          <div className="relative z-10 grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 transition-all duration-300 hover:bg-blue-50 hover:border-blue-200 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 mb-4">Enterprise Security</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">Your data is encrypted with AES-256 and stored on ISO 27001-certified infrastructure.</p>
            </div>

            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 transition-all duration-300 hover:bg-amber-50 hover:border-amber-200 group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 mb-4">Flash Delivery</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">Our automated systems and expert CAs guarantee the fastest turnaround times in the industry.</p>
            </div>

            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 transition-all duration-300 hover:bg-violet-50 hover:border-violet-200 group">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Scale className="h-7 w-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 mb-4">Legal Compliance</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">Every document is verified by expert professionals ensuring 100% legal accuracy and zero notice risk.</p>
            </div>
          </div>
        </m.div>
      </div>
    </div>
  );
}
