import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { 
  Building2, FileText, Calculator, Receipt, PiggyBank, Shield, 
  CreditCard, Award, Home, TrendingUp, Grid, BarChart3, Users,
  HelpCircle, BookOpen, Bot, MessageCircle, AlertTriangle,
  Search, PlayCircle, Code2, ExternalLink, Activity, TerminalSquare,
  KeyRound, CreditCard as CreditCardIcon, FileQuestion, Grid3X3,
  ChevronRight, Sparkles, Building, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { allServices, Service } from "@/data/all-services";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { Link } from "wouter";

const iconMap = {
  Building2, FileText, Calculator, Receipt, PiggyBank, Shield, 
  CreditCard, Award, Home, TrendingUp, Grid, BarChart3, Users,
  HelpCircle, BookOpen, Bot, MessageCircle, AlertTriangle
};

const SIDEBAR_NAV = [
  { id: "all", label: "All Services Catalogue", icon: Grid3X3 },
  { id: "Services", label: "Tax & Filing", icon: FileText },
  { id: "Startup", label: "Business Setup", icon: Building },
  { id: "Calculators", label: "Calculators", icon: Calculator },
  { id: "ITR Filing", label: "ITR Ecosystem", icon: Receipt },
  { id: "Analytics", label: "Analytics", icon: Activity },
];

const BOTTOM_NAV = [
  { id: "docs", label: "Documentation", icon: FileQuestion },
  { id: "status", label: "System Status", icon: Activity },
];

export default function AllServicesPage() {
  const seo = getSEOConfig('/all-services');
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [userMode, setUserMode] = useState<"individual" | "business">("individual");

  // Filter services based on active category and search
  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || service.section === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderServiceCard = (service: Service) => {
    const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Grid;
    const isPremium = service.price !== undefined;
    
    return (
      <m.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        key={service.id}
      >
        <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-gray-200/60 bg-white group hover:-translate-y-1">
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <IconComponent className="w-6 h-6 text-slate-600 group-hover:text-indigo-600 transition-colors" />
              </div>
              <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-medium text-xs rounded-full px-3 cursor-default hover:bg-slate-200">
                {isPremium ? "Premium" : "Free Tools"}
              </Badge>
            </div>
            
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{service.title}</h3>
            <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-3 leading-relaxed">
              {service.description}
            </p>

            <div className="flex items-center gap-4 mt-auto">
              <Link href="/learn/videos" className="flex items-center text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                <PlayCircle className="w-4 h-4 mr-1.5" />
                Watch Demo
              </Link>
              <Link href="/help" className="flex items-center text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                <Code2 className="w-4 h-4 mr-1.5" />
                Documentation
              </Link>
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            {service.path ? (
              <Link href={service.path} className="w-full">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-6 rounded-xl transition-all shadow-md hover:shadow-lg">
                  {isPremium ? "Subscribe Now" : "Explore Now"}
                  {!isPremium && <ChevronRight className="w-4 h-4 ml-1.5" />}
                </Button>
              </Link>
            ) : (
              <Button disabled className="w-full bg-slate-100 text-slate-400 font-medium py-6 rounded-xl">
                Coming Soon
              </Button>
            )}
          </CardFooter>
        </Card>
      </m.div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-74px)] bg-slate-50/50 flex">
      <MetaSEO 
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        type={seo?.type}
        breadcrumbs={seo?.breadcrumbs}
      />

      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col flex-shrink-0 sticky top-[74px] h-[calc(100vh-74px)]">
        <div className="p-6">
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Grid3X3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">MyeCA<span className="text-indigo-600 font-light">Hub</span></span>
          </div>

          <div className="space-y-1">
            {SIDEBAR_NAV.map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveCategory(nav.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${activeCategory === nav.id 
                    ? "bg-indigo-50 text-indigo-600 font-semibold shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  }`}
              >
                <nav.icon className={`w-5 h-5 ${activeCategory === nav.id ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{nav.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-6 space-y-1">
          {BOTTOM_NAV.map((nav) => (
            <button
              key={nav.id}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-all"
            >
              <div className="flex items-center space-x-3">
                <nav.icon className="w-5 h-5 text-slate-400" />
                <span>{nav.label}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300" />
            </button>
          ))}
          
          <div className="pt-6 mt-4 border-t border-slate-100">
            <div className="flex items-center space-x-3 px-4 py-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold">
                JS
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-900">Jitendra Suthar</span>
                <span className="text-xs text-slate-500">cajsuthar@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-[74px] z-10 flex-shrink-0">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search services, APIs, calculators..." 
                className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 h-10 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 pl-4 shrink-0">
            {/* Environment Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center hidden sm:flex">
              <button 
                onClick={() => setUserMode("individual")}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${userMode === "individual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <User className="w-4 h-4" />
                <span>Individual</span>
              </button>
              <button 
                onClick={() => setUserMode("business")}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${userMode === "business" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Building className="w-4 h-4" />
                <span>Business</span>
              </button>
            </div>

            <Button variant="outline" className="hidden lg:flex gap-2 h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Buy Credits
            </Button>
            
            <Button size="icon" variant="ghost" className="rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 h-10 w-10">
              <Grid3X3 className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  {SIDEBAR_NAV.find(nav => nav.id === activeCategory)?.label || "Services Catalogue"}
                </h1>
                <p className="text-slate-500 text-lg">
                  Integrate, subscribe, or explore our curated selection of professional tools.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                  {filteredServices.length} Services Available
                </Badge>
              </div>
            </div>

            {/* Grid Area */}
            {filteredServices.length > 0 ? (
              <m.div layout>
                  <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {filteredServices.map(renderServiceCard)}
                </div>
                </AnimatePresence>
              </m.div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 border-dashed rounded-2xl">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex flex-col items-center justify-center mb-4 text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No services found</h3>
                <p className="text-slate-500 text-center max-w-md">
                  We couldn't find any services matching your search criteria. Try using different keywords or selecting a different category.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-6 rounded-xl"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}