import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User, LogOut, Settings, BarChart3, FileText, Users, Gift,
  Calculator, TrendingUp, Building2, Coins,
  Search, ArrowRight, Shield, HelpCircle, Home, Grid, Bot, Sparkles, X, Menu,
  Phone, Mail, ChevronRight, Briefcase, FileCheck, Scale, Zap, Target, PieChart,
  Landmark, Receipt, Stamp, Umbrella, Rocket, Lock, LayoutDashboard,
  LineChart, Wallet, Banknote, Gem, Newspaper, PiggyBank, Calendar, ShieldAlert
} from "lucide-react";
import Logo from "@/components/ui/logo";
import { useAuth } from "@/components/AuthProvider";
import { useRoutePreload } from "@/hooks/use-route-preload";
import { cn } from "@/lib/utils";

const PROMO_DISMISSED_KEY = 'promo-bar-dismissed-v2';
const PROMO_DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function Header() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [promoDismissed, setPromoDismissed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { preloadOnHover } = useRoutePreload();

  // Check if promo was previously dismissed
  useEffect(() => {
    const dismissedAt = localStorage.getItem(PROMO_DISMISSED_KEY);
    if (dismissedAt) {
      const dismissTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissTime < PROMO_DISMISS_DURATION) {
        setPromoDismissed(true);
      } else {
        localStorage.removeItem(PROMO_DISMISSED_KEY);
      }
    }
  }, []);

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dismiss promo bar
  const dismissPromo = () => {
    setPromoDismissed(true);
    localStorage.setItem(PROMO_DISMISSED_KEY, Date.now().toString());
  };

  // Try to get auth context
  let user = null;
  let isAuthenticated = false;
  let logout = () => { };
  let isLoading = true;

  try {
    const auth = useAuth();
    user = auth.user;
    isAuthenticated = auth.isAuthenticated;
    logout = auth.logout;
    isLoading = auth.isLoading;
  } catch {
    // AuthProvider not available
  }

  const isActive = (path: string) => location === path;
  // Calculate top offset based on promo bar visibility
  // Promo bar is 36px high.
  const headerTop = promoDismissed ? 'top-0' : 'top-[36px]';

  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [location]);

  const inServices = location.startsWith('/services');
  const inCalculators = location.startsWith('/calculators');
  const inStartup = location.startsWith('/startup') || location === '/startup-services';

  const getInitials = () => {
    if (!user) return 'U';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) return user.firstName[0].toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <>
      {/* Nano Banana Urgency Banner */}
      {!promoDismissed && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-[#FDE047] text-black h-[36px] flex items-center shadow-sm">
          <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-center relative">
            <div className="text-[11px] font-normal uppercase tracking-wider flex items-center justify-center gap-3">
              <span className="flex items-center text-sm">⏰</span>
              <span className="hidden sm:inline">ITR DEADLINE: 31 JULY 2026</span>
              <span className="hidden sm:inline opacity-30">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                2,847 PEOPLE FILED TODAY
              </span>
              <Link href="/itr/filing" onMouseEnter={() => preloadOnHover('/itr/filing')} className="bg-black text-[#FDE047] px-3 py-1 rounded-full text-[9px] font-bold hover:bg-slate-800 transition-colors ml-2">
                FILE NOW →
              </Link>
            </div>
            <button
              onClick={dismissPromo}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded transition-colors text-black/50 hover:text-black flex items-center justify-center"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        headerTop
      )}>

        <div className={cn(
          "w-full transition-all duration-300 border-b",
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-md border-slate-200/60 py-1"
            : "bg-white/80 backdrop-blur-lg border-slate-100 shadow-sm py-2"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={cn(
              "flex justify-between items-center transition-all duration-300",
              isScrolled ? "h-[50px]" : "h-[58px]"
            )}>
              {/* Logo Section */}
              <div className="flex items-center gap-4">
                <a href="https://myeca.in" className="flex items-center gap-2 group shrink-0">
                  <Logo size={isScrolled ? "sm" : "md"} />
                  <div className="flex flex-col">
                    <span className={cn(
                      "font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-500 leading-none tracking-tight",
                      isScrolled ? "text-[1.25rem]" : "text-2xl"
                    )}>
                      MyeCA.in
                    </span>
                    <span className={cn(
                      "text-[9.5px] text-slate-500 font-normal tracking-[0.15em] transition-all duration-500",
                      isScrolled ? "h-0 opacity-0 overflow-hidden" : "h-auto opacity-100 mt-1"
                    )}>
                      SMART TAX SOLUTIONS
                    </span>
                  </div>
                </a>
              </div>

              {/* Desktop Navigation */}
              <NavigationMenu className="hidden lg:flex flex-1 justify-center max-w-[1000px]">
                <NavigationMenuList className="gap-4">


                  {isAuthenticated && (
                    <NavigationMenuItem>
                      <Link href={
                        user?.role === 'admin' ? "/admin/dashboard" :
                          user?.role === 'ca' ? "/ca/dashboard" :
                            user?.role === 'team_member' ? "/admin/blog-management" :
                              "/dashboard"
                      }
                        onMouseEnter={() => preloadOnHover(user?.role === 'admin' ? "/admin/dashboard" : "/dashboard")}
                      >
                        <div className="relative group">
                          {(location.startsWith('/admin') || location.startsWith('/ca') || location === '/dashboard') && (
                            <div className="absolute inset-0 bg-blue-600/10 border border-blue-600/20 shadow-sm rounded-full transition-all duration-300" />
                          )}
                          <span className={cn(
                            "relative z-10 inline-flex items-center justify-center px-5 py-2.5 transition-colors duration-300 cursor-pointer text-[17px]",
                            (location.startsWith('/admin') || location.startsWith('/ca') || location === '/dashboard') ? "font-bold text-blue-600" : "font-normal text-slate-600 hover:text-blue-600"
                          )}>
                            {user?.role === 'admin' ? "Admin" :
                              user?.role === 'ca' ? "CA" :
                                user?.role === 'team_member' ? "Staff" :
                                  "Dashboard"}
                          </span>
                        </div>
                      </Link>
                    </NavigationMenuItem>
                  )}

                  <NavigationMenuItem>
                    <div className="relative group">
                      {inServices && (
                        <div className="absolute inset-0 bg-blue-600/10 border border-blue-600/20 shadow-sm rounded-full transition-all duration-300" />
                      )}
                      <NavigationMenuTrigger className={cn(
                        "relative z-10 bg-transparent transition-colors duration-300 group px-5 py-2.5 rounded-full text-[17px]",
                        inServices ? "font-bold text-blue-600" : "font-normal text-slate-600 hover:text-blue-600",
                        "data-[state=open]:bg-blue-600/10 data-[state=open]:text-blue-600 data-[state=open]:border-blue-600/20 border border-transparent"
                      )}>
                        <span>Services</span>
                      </NavigationMenuTrigger>
                    </div>
                    <NavigationMenuContent>
                      <div className="w-[1024px] p-0 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200/60 overflow-hidden flex">
                        {/* Main Categories */}
                        <div className="flex-1 p-6 grid grid-cols-3 gap-8 bg-white">
                          <div>
                            <div className="flex items-center gap-4 mb-6 px-0.5">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-normal text-slate-900 tracking-tight text-sm">Tax & Compliance</h4>
                                <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest mt-0.5">Expert Guided</p>
                              </div>
                            </div>
                            <ul className="space-y-4">
                              {[
                                { href: "/services/tds-filing", icon: Receipt, title: "TDS Filing", desc: "Quarterly returns & certificates", color: "blue" },
                                { href: "/services/gst-returns", icon: Calculator, title: "GST Returns", desc: "GSTR-1, 3B & Annual filing", color: "emerald" },
                                { href: "/services/notice-compliance", icon: Shield, title: "Notice Management", desc: "Expert reply drafting", color: "orange" },
                                { href: "/services/reliable-storage", icon: Lock, title: "Secure Vault", desc: "Bank-grade storage", color: "indigo" }
                              ].map((item, idx) => {
                                const Icon = item.icon as any;
                                return (
                                  <li key={idx}>
                                    <Link
                                      href={item.href}
                                      onMouseEnter={() => preloadOnHover(item.href)}
                                      className="group flex items-center gap-4 py-2 hover:translate-x-1 transition-all duration-300"
                                    >
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm border border-transparent",
                                        item.color === "blue" && "bg-blue-50/50 text-blue-500 group-hover:border-blue-100",
                                        item.color === "emerald" && "bg-emerald-50/50 text-emerald-500 group-hover:border-emerald-100",
                                        item.color === "orange" && "bg-orange-50/50 text-orange-500 group-hover:border-orange-100",
                                        item.color === "indigo" && "bg-indigo-50/50 text-indigo-500 group-hover:border-indigo-100"
                                      )}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <span className="block text-sm font-normal text-slate-700 group-hover:text-blue-600 transition-colors">{item.title}</span>
                                        <span className="block text-[10px] text-slate-400 font-normal">{item.desc}</span>
                                      </div>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          <div>
                            <div className="flex items-center gap-4 mb-6 px-0.5">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-normal text-slate-900 tracking-tight text-sm">Business Setup</h4>
                                <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest mt-0.5">Growth Focused</p>
                              </div>
                            </div>
                            <ul className="space-y-4">
                              {[
                                { href: "/services/company-registration", icon: Briefcase, title: "Company Registration", desc: "Pvt Ltd, LLP, OPC & more", color: "indigo" },
                                { href: "/services/trademark-registration", icon: Scale, title: "IPR Services", desc: "Trademark & Copyright", color: "purple" },
                                { href: "/documents/generator", icon: FileCheck, title: "Legal Documents", desc: "Agreements & Contracts", color: "blue" }
                              ].map((item, idx) => {
                                const Icon = item.icon as any;
                                return (
                                  <li key={idx}>
                                    <Link
                                      href={item.href}
                                      onMouseEnter={() => preloadOnHover(item.href)}
                                      className="group flex items-center gap-4 py-2 hover:translate-x-1 transition-all duration-300"
                                    >
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm border border-transparent",
                                        item.color === "indigo" && "bg-indigo-50/50 text-indigo-500 group-hover:border-indigo-100",
                                        item.color === "purple" && "bg-purple-50/50 text-purple-500 group-hover:border-purple-100",
                                        item.color === "blue" && "bg-blue-50/50 text-blue-500 group-hover:border-blue-100"
                                      )}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <span className="block text-sm font-normal text-slate-700 group-hover:text-indigo-600 transition-colors">{item.title}</span>
                                        <span className="block text-[10px] text-slate-400 font-normal">{item.desc}</span>
                                      </div>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          <div>
                            <div className="flex items-center gap-4 mb-6 px-0.5">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                                <BarChart3 className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-normal text-slate-900 tracking-tight text-sm">Business Intel</h4>
                                <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest mt-0.5">Growth Analytics</p>
                              </div>
                            </div>
                            <ul className="space-y-4">
                              {[
                                { href: "/business/dashboard", icon: LayoutDashboard, title: "Business HQ", desc: "Compliance & deadines", color: "emerald" },
                                { href: "/business/virtual-cfo", icon: BarChart3, title: "Virtual CFO", desc: "P&L & Runway tracking", color: "blue" },
                                { href: "/services/tax-planning", icon: TrendingUp, title: "Tax Planning", desc: "Expert advisory", color: "orange" }
                              ].map((item, idx) => {
                                const Icon = item.icon as any;
                                return (
                                  <li key={idx}>
                                    <Link
                                      href={item.href}
                                      onMouseEnter={() => preloadOnHover(item.href)}
                                      className="group flex items-center gap-4 py-2 hover:translate-x-1 transition-all duration-300"
                                    >
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm border border-transparent",
                                        item.color === "emerald" && "bg-emerald-50/50 text-emerald-500 group-hover:border-emerald-100",
                                        item.color === "blue" && "bg-blue-50/50 text-blue-500 group-hover:border-blue-100",
                                        item.color === "orange" && "bg-orange-50/50 text-orange-500 group-hover:border-orange-100"
                                      )}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <span className="block text-sm font-normal text-slate-700 group-hover:text-emerald-600 transition-colors">{item.title}</span>
                                        <span className="block text-[10px] text-slate-400 font-normal">{item.desc}</span>
                                      </div>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>

                        {/* Sidebar */}
                        <div className="w-72 bg-slate-50/50 p-6 border-l border-slate-100 flex flex-col">
                          <div className="flex-1">
                            <h5 className="text-[10px] font-normal text-slate-400 uppercase tracking-[2px] mb-6">Trending Tool</h5>
                            <Link href="/tax-loss-harvesting" className="block group relative">
                              <div className="relative overflow-hidden rounded-2xl p-6 shadow-2xl shadow-blue-100/30 transition-all duration-500 group-hover:-translate-y-1 bg-gradient-to-br from-blue-50/80 to-white border border-blue-100/50 backdrop-blur-sm">
                                <div className="relative z-10">
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                      <Sparkles className="w-4 h-4 fill-white/20" />
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Optimized AI</span>
                                  </div>
                                  <h6 className="text-xl font-normal text-slate-900 leading-tight mb-2">Tax Optimizer AI</h6>
                                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6">Save up to {"₹"}50k in taxes with our smart algorithm.</p>
                                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-blue-200/50">
                                    Explore Tool <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>

                          <div className="mt-8 pt-6 border-t border-slate-200/60">
                            <Link href="/services/marketplace" className="inline-flex items-center gap-2 text-xs font-normal text-blue-600 hover:text-blue-700 uppercase tracking-widest group">
                              Explore All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Startup Services */}
                  <NavigationMenuItem>
                    <div className="relative group">
                      {inStartup && (
                        <div className="absolute inset-0 bg-blue-600/10 border border-blue-600/20 shadow-sm rounded-full transition-all duration-300" />
                      )}
                      <NavigationMenuTrigger className={cn(
                        "relative z-10 bg-transparent transition-colors duration-300 group px-5 py-2.5 rounded-full text-[17px]",
                        inStartup ? "font-bold text-blue-600" : "font-normal text-slate-600 hover:text-blue-600",
                        "data-[state=open]:bg-blue-600/10 data-[state=open]:text-blue-600 data-[state=open]:border-blue-600/20 border border-transparent"
                      )}>
                        <span>Startup</span>
                      </NavigationMenuTrigger>
                    </div>
                    <NavigationMenuContent>
                      <div className="w-[1024px] p-0 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200/60 overflow-hidden flex">
                        <div className="flex-1 p-6 grid grid-cols-3 gap-8 bg-white">
                          <div>
                            <div className="flex items-center gap-4 mb-6 px-0.5">
                              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100/50">
                                <Rocket className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-normal text-slate-900 tracking-tight text-sm">Launch</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Day 0 setup</p>
                              </div>
                            </div>
                            <ul className="space-y-4">
                              {[
                                { href: "/startup-services", icon: Rocket, title: "Startup Hub", desc: "All founder services", color: "purple" },
                                { href: "/startup/registration", icon: Building2, title: "Entity Registration", desc: "Pvt Ltd, LLP, OPC", color: "indigo" },
                                { href: "/services/company-registration", icon: FileCheck, title: "Company Setup", desc: "MCA incorporation flow", color: "blue" }
                              ].map((item, idx) => {
                                const Icon = item.icon as any;
                                return (
                                  <li key={idx}>
                                    <Link
                                      href={item.href}
                                      onMouseEnter={() => preloadOnHover(item.href)}
                                      className="group flex items-center gap-4 py-2 hover:translate-x-1 transition-all duration-300"
                                    >
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm border border-transparent",
                                        item.color === "purple" && "bg-purple-50/50 text-purple-500 group-hover:border-purple-100",
                                        item.color === "indigo" && "bg-indigo-50/50 text-indigo-500 group-hover:border-indigo-100",
                                        item.color === "blue" && "bg-blue-50/50 text-blue-500 group-hover:border-blue-100"
                                      )}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <span className="block text-sm font-normal text-slate-700 group-hover:text-purple-600 transition-colors">{item.title}</span>
                                        <span className="block text-[10px] text-slate-400 font-normal">{item.desc}</span>
                                      </div>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          <div>
                            <div className="flex items-center gap-4 mb-6 px-0.5">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                                <Stamp className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-normal text-slate-900 tracking-tight text-sm">Licenses</h4>
                                <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest mt-0.5">Compliance ready</p>
                              </div>
                            </div>
                            <ul className="space-y-4">
                              {[
                                { href: "/services/startup-india-registration", icon: Zap, title: "Startup India", desc: "DPIIT recognition", color: "purple" },
                                { href: "/services/msme-udyam-registration", icon: Shield, title: "MSME Udyam", desc: "Udyam certificate", color: "emerald" },
                                { href: "/services/gst-registration", icon: Receipt, title: "GST Registration", desc: "GSTIN for sales", color: "blue" },
                                { href: "/services/fssai-registration", icon: Stamp, title: "FSSAI License", desc: "Food business approval", color: "orange" }
                              ].map((item, idx) => {
                                const Icon = item.icon as any;
                                return (
                                  <li key={idx}>
                                    <Link
                                      href={item.href}
                                      onMouseEnter={() => preloadOnHover(item.href)}
                                      className="group flex items-center gap-4 py-2 hover:translate-x-1 transition-all duration-300"
                                    >
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm border border-transparent",
                                        item.color === "purple" && "bg-purple-50/50 text-purple-500 group-hover:border-purple-100",
                                        item.color === "emerald" && "bg-emerald-50/50 text-emerald-500 group-hover:border-emerald-100",
                                        item.color === "blue" && "bg-blue-50/50 text-blue-500 group-hover:border-blue-100",
                                        item.color === "orange" && "bg-orange-50/50 text-orange-500 group-hover:border-orange-100"
                                      )}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <span className="block text-sm font-normal text-slate-700 group-hover:text-purple-600 transition-colors">{item.title}</span>
                                        <span className="block text-[10px] text-slate-400 font-medium">{item.desc}</span>
                                      </div>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          <div>
                            <div className="flex items-center gap-4 mb-6 px-0.5">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                                <TrendingUp className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-normal text-slate-900 tracking-tight text-sm">Scale</h4>
                                <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest mt-0.5">Growth engine</p>
                              </div>
                            </div>
                            <ul className="space-y-4">
                              {[
                                { href: "/startup/funding", icon: Coins, title: "Funding Assistance", desc: "Investor-ready support", color: "emerald" },
                                { href: "/services/trademark-registration", icon: Scale, title: "Trademark", desc: "Protect your brand", color: "purple" },
                                { href: "/services/iso-certification", icon: Gem, title: "ISO Certification", desc: "Trust and quality proof", color: "indigo" },
                                { href: "/services/trade-license", icon: Landmark, title: "Trade License", desc: "Local business approval", color: "blue" }
                              ].map((item, idx) => {
                                const Icon = item.icon as any;
                                return (
                                  <li key={idx}>
                                    <Link
                                      href={item.href}
                                      onMouseEnter={() => preloadOnHover(item.href)}
                                      className="group flex items-center gap-4 py-2 hover:translate-x-1 transition-all duration-300"
                                    >
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm border border-transparent",
                                        item.color === "emerald" && "bg-emerald-50/50 text-emerald-500 group-hover:border-emerald-100",
                                        item.color === "purple" && "bg-purple-50/50 text-purple-500 group-hover:border-purple-100",
                                        item.color === "indigo" && "bg-indigo-50/50 text-indigo-500 group-hover:border-indigo-100",
                                        item.color === "blue" && "bg-blue-50/50 text-blue-500 group-hover:border-blue-100"
                                      )}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <span className="block text-sm font-normal text-slate-700 group-hover:text-purple-600 transition-colors">{item.title}</span>
                                        <span className="block text-[10px] text-slate-400 font-normal">{item.desc}</span>
                                      </div>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>

                        <div className="w-72 bg-slate-50/50 p-6 border-l border-slate-100 flex flex-col">
                          <div className="flex-1">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-6">Founder spotlight</h5>
                            <Link href="/services/startup-india-registration" onMouseEnter={() => preloadOnHover("/services/startup-india-registration")} className="block">
                              <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100/50 group">
                                <div className="relative z-10">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-4 h-4 text-purple-600 fill-purple-600/20" />
                                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">Startup India</span>
                                  </div>
                                  <h6 className="font-normal text-slate-900 text-lg mb-2">Recognition + tax benefits</h6>
                                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">Get DPIIT recognition, IP support, and founder-friendly compliance guidance.</p>
                                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-purple-200/50">
                                    Apply Now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>

                          <div className="mt-8 pt-6 border-t border-slate-200/60">
                            <Link href="/startup-services" className="inline-flex items-center gap-2 text-xs font-normal text-purple-600 hover:text-purple-700 uppercase tracking-widest group">
                              Explore Startup Hub <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Calculators Mega Menu */}
                  <NavigationMenuItem>
                    <div className="relative group">
                      {inCalculators && (
                        <div className="absolute inset-0 bg-blue-600/10 border border-blue-600/20 shadow-sm rounded-full transition-all duration-300" />
                      )}
                      <NavigationMenuTrigger className={cn(
                        "relative z-10 bg-transparent transition-colors duration-300 group px-5 py-2.5 rounded-full text-[17px]",
                        inCalculators ? "font-bold text-blue-600" : "font-normal text-slate-600 hover:text-blue-600",
                        "data-[state=open]:bg-blue-600/10 data-[state=open]:text-blue-600 data-[state=open]:border-blue-600/20 border border-transparent"
                      )}>
                        <span>Calculators</span>
                      </NavigationMenuTrigger>
                    </div>
                    <NavigationMenuContent>
                      <div className="w-[1024px] p-0 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200/60 overflow-hidden flex">
                        {/* Main Categories — 3 columns */}
                        <div className="flex-1 p-6 grid grid-cols-3 gap-8 bg-white">
                          {/* Column 1: Tax Calculators */}
                          <div>
                            <div className="flex items-center gap-4 mb-6 px-0.5">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                                <Landmark className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-normal text-slate-900 tracking-tight text-sm">Tax Calculators</h4>
                                <p className="text-[9px] text-slate-400 font-normal uppercase tracking-widest mt-0.5">Compliance Hub</p>
                              </div>
                            </div>
                            <ul className="space-y-4">
                              {[
                                { href: "/calculators/income-tax", icon: Calculator, title: "Income Tax", desc: "AY 2025-26 Tax Analysis", color: "emerald" },
                                { href: "/calculators/tax-regime", icon: Scale, title: "Tax Regime Compare", desc: "Old vs New side by side", color: "emerald" },
                                { href: "/calculators/hra", icon: Home, title: "HRA Exemption", desc: "Calculate rent allowance", color: "blue" },
                                { href: "/calculators/tds", icon: Receipt, title: "TDS Calculator", desc: "Deduction on salary & more", color: "orange" },
                                { href: "/calculators/capital-gains", icon: TrendingUp, title: "Capital Gains", desc: "STCG & LTCG computation", color: "indigo" }
                              ].map((item, idx) => {
                                const Icon = item.icon as any;
                                return (
                                  <li key={idx}>
                                    <Link
                                      href={item.href}
                                      onMouseEnter={() => preloadOnHover(item.href)}
                                      className="group flex items-center gap-4 py-2 hover:translate-x-1 transition-all duration-300"
                                    >
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm border border-transparent",
                                        item.color === "emerald" && "bg-emerald-50/50 text-emerald-500 group-hover:border-emerald-100",
                                        item.color === "blue" && "bg-blue-50/50 text-blue-500 group-hover:border-blue-100",
                                        item.color === "orange" && "bg-orange-50/50 text-orange-500 group-hover:border-orange-100",
                                        item.color === "indigo" && "bg-indigo-50/50 text-indigo-500 group-hover:border-indigo-100"
                                      )}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <span className="block text-sm font-normal text-slate-700 group-hover:text-emerald-600 transition-colors">{item.title}</span>
                                        <span className="block text-[10px] text-slate-400 font-normal">{item.desc}</span>
                                      </div>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          {/* Column 2: Investment & Savings */}
                          <div>
                            <div className="flex items-center gap-4 mb-6 px-0.5">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                                <PiggyBank className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-normal text-slate-900 tracking-tight text-sm">Investment & Savings</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Financial Planning</p>
                              </div>
                            </div>
                            <ul className="space-y-4">
                              {[
                                { href: "/calculators/sip", icon: Coins, title: "SIP Calculator", desc: "Plan mutual fund returns", color: "orange" },
                                { href: "/elss-comparator", icon: LineChart, title: "ELSS Comparator", desc: "Compare tax saving funds", color: "orange" },
                                { href: "/calculators/nps", icon: Umbrella, title: "NPS Calculator", desc: "Pension & retirement planning", color: "indigo" },
                                { href: "/calculators/ppf", icon: PiggyBank, title: "PPF Calculator", desc: "Public Provident Fund growth", color: "emerald" },
                                { href: "/calculators/fd", icon: Banknote, title: "FD Calculator", desc: "Fixed deposit returns", color: "blue" },
                              ].map((item, idx) => {
                                const Icon = item.icon as any;
                                return (
                                  <li key={idx}>
                                    <Link
                                      href={item.href}
                                      onMouseEnter={() => preloadOnHover(item.href)}
                                      className="group flex items-center gap-4 py-2 hover:translate-x-1 transition-all duration-300"
                                    >
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm border border-transparent",
                                        item.color === "orange" && "bg-orange-50/50 text-orange-500 group-hover:border-orange-100",
                                        item.color === "indigo" && "bg-indigo-50/50 text-indigo-500 group-hover:border-indigo-100",
                                        item.color === "emerald" && "bg-emerald-50/50 text-emerald-500 group-hover:border-emerald-100",
                                        item.color === "blue" && "bg-blue-50/50 text-blue-500 group-hover:border-blue-100"
                                      )}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <span className="block text-sm font-normal text-slate-700 group-hover:text-blue-600 transition-colors">{item.title}</span>
                                        <span className="block text-[10px] text-slate-400 font-normal">{item.desc}</span>
                                      </div>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          {/* Column 3: Loan & EMI */}
                          <div>
                            <div className="flex items-center gap-4 mb-6 px-0.5">
                              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm border border-orange-100/50">
                                <Wallet className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-normal text-slate-900 tracking-tight text-sm">Loan & EMI</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Borrowing Tools</p>
                              </div>
                            </div>
                            <ul className="space-y-4">
                              {[
                                { href: "/calculators/emi", icon: Calculator, title: "EMI Calculator", desc: "Monthly instalment planner", color: "orange" },
                                { href: "/calculators/home-loan", icon: Landmark, title: "Loan EMI Calculator", desc: "Home, Car & Personal Loans", color: "blue" },
                                { href: "/compliance-calendar", icon: Calendar, title: "Compliance Calendar", desc: "GST & Tax Deadlines", color: "indigo" },
                                { href: "/calculators/penalty", icon: ShieldAlert, title: "Penalty Calculator", desc: "GST & Tax Delay Costs", color: "orange" }
                              ].map((item, idx) => {
                                const Icon = item.icon as any;
                                return (
                                  <li key={idx}>
                                    <Link
                                      href={item.href}
                                      onMouseEnter={() => preloadOnHover(item.href)}
                                      className="group flex items-center gap-4 py-2 hover:translate-x-1 transition-all duration-300"
                                    >
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm border border-transparent",
                                        item.color === "orange" && "bg-orange-50/50 text-orange-500 group-hover:border-orange-100",
                                        item.color === "blue" && "bg-blue-50/50 text-blue-500 group-hover:border-blue-100",
                                        item.color === "indigo" && "bg-indigo-50/50 text-indigo-500 group-hover:border-indigo-100",
                                        item.color === "emerald" && "bg-emerald-50/50 text-emerald-500 group-hover:border-emerald-100"
                                      )}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <span className="block text-sm font-normal text-slate-700 group-hover:text-orange-600 transition-colors">{item.title}</span>
                                        <span className="block text-[10px] text-slate-400 font-normal">{item.desc}</span>
                                      </div>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>

                        {/* Sidebar */}
                        <div className="w-72 bg-slate-50/50 p-6 border-l border-slate-100 flex flex-col">
                          <div className="flex-1">
                            <h5 className="text-[10px] font-normal text-slate-400 uppercase tracking-[2px] mb-6">AI Powered</h5>
                            <Link href="/tax-assistant" onMouseEnter={() => preloadOnHover("/tax-assistant")} className="block group">
                              <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Bot className="w-4 h-4" />
                                  </div>
                                  <span className="text-[10px] font-normal text-slate-900 uppercase tracking-wider">AI Tax Buddy</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">Get instant answers for ITR filing & tax savings.</p>
                                <span className="inline-flex items-center gap-2 text-[10px] font-normal text-emerald-600 uppercase tracking-widest">Talk to AI <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
                              </div>
                            </Link>

                            <div className="mt-6 space-y-1">
                              <Link href="/calculators/general" onMouseEnter={() => preloadOnHover("/calculators/general")} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50/50 transition-all">
                                <Grid className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                                <span className="text-xs font-normal text-slate-600">General Calculator</span>
                              </Link>
                              <Link href="/calculators/hsn-finder" onMouseEnter={() => preloadOnHover("/calculators/hsn-finder")} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/50 transition-all">
                                <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                <span className="text-xs font-normal text-slate-600">HSN/SAC Finder</span>
                              </Link>
                              <Link href="/form16-parser" onMouseEnter={() => preloadOnHover("/form16-parser")} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50/50 transition-all">
                                <FileText className="w-4 h-4 text-slate-400 group-hover:text-orange-600" />
                                <span className="text-xs font-normal text-slate-600">Form 16 Parser</span>
                              </Link>
                            </div>
                          </div>

                          <div className="mt-8 pt-6 border-t border-slate-200/60">
                            <Link href="/calculators" onMouseEnter={() => preloadOnHover("/calculators")} className="inline-flex items-center gap-2 text-xs font-normal text-emerald-600 hover:text-emerald-700 uppercase tracking-widest group">
                              All Calculators <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>


                  <NavigationMenuItem>
                    <Link href="/blog" onMouseEnter={() => preloadOnHover('/blog')}>
                      <div className="relative group">
                        {location.startsWith('/blog') && (
                          <div className="absolute inset-0 bg-blue-600/10 border border-blue-600/20 shadow-sm rounded-full transition-all duration-300" />
                        )}
                        <span className={cn(
                          "relative z-10 inline-flex items-center justify-center px-5 py-2.5 transition-colors duration-300 cursor-pointer text-[17px]",
                          location.startsWith('/blog') ? "font-bold text-blue-600" : "font-normal text-slate-600 hover:text-blue-600"
                        )}>
                          Blog
                        </span>
                      </div>
                    </Link>
                  </NavigationMenuItem>




                </NavigationMenuList>
              </NavigationMenu>

              {/* Right Side Actions - Pill Style */}
              <div className="flex items-center gap-3">
                {/* Search - Desktop */}
                <Button variant="ghost" size="icon" className="hidden lg:flex text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-full w-10 h-10 transition-all duration-300">
                  <Search className="w-5 h-5" />
                </Button>

                {!isLoading && isAuthenticated && (
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 px-2 h-10 rounded-full hover:bg-slate-100/50">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-normal text-white shadow-sm ring-2 ring-white">
                            {getInitials()}
                          </div>
                          <span className="hidden sm:inline text-xs font-bold text-slate-700">
                            {user?.firstName}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 p-2 rounded-2xl shadow-2xl border-slate-200/60" align="end">
                        <div className="px-3 py-4 mb-2 bg-slate-50/50 rounded-xl border border-slate-100/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-normal text-white shadow-md ring-2 ring-white">
                              {getInitials()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-black text-slate-900 truncate">
                                {[user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.email}
                              </span>
                              <span className="text-[10px] font-medium text-slate-500 truncate mt-0.5">
                                {user?.email}
                              </span>
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-[9px] font-black text-blue-700 uppercase tracking-wider">
                                  {user?.role || 'User'}
                                </span>
                                {user?.isVerified && (
                                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600">
                                    <Shield className="w-2.5 h-2.5" /> Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <DropdownMenuItem className="p-3 rounded-xl cursor-pointer group" asChild>
                          <Link href={
                            user?.role === 'admin' ? "/admin/dashboard" :
                              user?.role === 'team_member' ? "/admin/blog-management" :
                                "/dashboard"
                          } className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <LayoutDashboard className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Dashboard</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="p-3 rounded-xl cursor-pointer group" asChild>
                          <Link href="/settings" className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <Settings className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Account Settings</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2 bg-slate-100" />

                        <DropdownMenuItem
                          className="p-3 rounded-xl cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 group"
                          onClick={() => logout()}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                              <LogOut className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-tight">Sign Out</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {!isLoading && !isAuthenticated && (
                  <div className="hidden lg:flex items-center">
                    <Link href="/login">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-full px-8 h-11 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5">
                        <User className="w-4 h-4" />
                        <span>Log in / Join</span>
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Mobile Menu Trigger (Sheet) */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 overflow-y-auto flex flex-col">
                    <SheetHeader className="p-0 border-b bg-slate-50/50 text-left overflow-hidden">
                      <a
                        href="https://myeca.in"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-6 hover:bg-white transition-all cursor-pointer group"
                      >
                        <Logo size="md" className="group-hover:scale-105 transition-transform" />
                        <div className="flex flex-col">
                          <span className="font-bold text-xl text-[#315efb]">
                            MyeCA.in
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">FINANCIAL COCKPIT</span>
                        </div>
                      </a>
                      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto">
                      <div className="flex flex-col py-4">
                        {isAuthenticated && (
                          <Link href={
                            user?.role === 'admin' ? "/admin/users" :
                              user?.role === 'ca' ? "/ca/dashboard" :
                                user?.role === 'team_member' ? "/admin/blog-management" :
                                  "/dashboard"
                          } className="px-6 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors border-l-4 border-blue-600 bg-blue-50/30">
                            {user?.role === 'admin' ? "Admin" :
                              user?.role === 'ca' ? "CA Dashboard" :
                                user?.role === 'team_member' ? "Staff Panel" :
                                  "Dashboard"}
                          </Link>
                        )}

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="services" className="border-none">
                            <AccordionTrigger className={cn(
                              "px-6 py-3 text-sm text-slate-700 hover:no-underline hover:bg-slate-50 hover:text-blue-600 transition-all",
                              location.startsWith('/services') ? "font-bold" : "font-normal"
                            )}>
                              Services
                            </AccordionTrigger>
                            <AccordionContent className="bg-slate-50/50 px-6 py-2">
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <h5 className="text-xs font-normal text-slate-400 uppercase tracking-wider mb-2">Tax & Compliance</h5>
                                  <Link href="/services/tds-filing" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">TDS Filing</Link>
                                  <Link href="/services/gst-registration" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">GST Registration</Link>
                                  <Link href="/services/document-vault" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Document Vault</Link>
                                </div>
                                <div className="space-y-1 pt-2">
                                  <h5 className="text-xs font-normal text-slate-400 uppercase tracking-wider mb-2">Business</h5>
                                  <Link href="/services/company-registration" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Company Registration</Link>
                                  <Link href="/services/trademark-registration" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Trademark</Link>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="startup" className="border-none">
                            <AccordionTrigger className={cn(
                              "px-6 py-3 text-sm text-slate-700 hover:no-underline hover:bg-slate-50 hover:text-purple-600 transition-all",
                              location.startsWith('/startup') ? "font-bold" : "font-normal"
                            )}>
                              Startup Services
                            </AccordionTrigger>
                            <AccordionContent className="bg-purple-50/30 px-6 py-2">
                              <div className="grid grid-cols-1 gap-2">
                                <Link href="/startup-services" className="block py-1.5 text-sm text-purple-700 font-medium">Overview</Link>
                                <Link href="/startup/registration" className="block py-1.5 text-sm text-slate-600 hover:text-purple-600">Registration</Link>
                                <Link href="/startup/funding" className="block py-1.5 text-sm text-slate-600 hover:text-purple-600">Funding & Grants</Link>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="calculators" className="border-none">
                            <AccordionTrigger className={cn(
                              "px-6 py-3 text-sm text-slate-700 hover:no-underline hover:bg-slate-50 hover:text-blue-600 transition-all",
                              (location.startsWith('/calculators') || location === '/compliance-calendar' || location === '/elss-comparator') ? "font-bold" : "font-normal"
                            )}>
                              Calculators
                            </AccordionTrigger>
                            <AccordionContent className="bg-slate-50/50 px-6 py-2">
                              <p className="text-[10px] font-normal text-slate-400 uppercase tracking-wider mb-2">Tax & Compliance</p>
                              <div className="grid grid-cols-1 gap-1 mb-4">
                                <Link href="/calculators/income-tax" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Income Tax (New vs Old)</Link>
                                <Link href="/calculators/tax-regime" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Tax Regime Compare</Link>
                                <Link href="/calculators/hra" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">HRA Exemption</Link>
                                <Link href="/calculators/tds" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">TDS Calculator</Link>
                                <Link href="/calculators/capital-gains" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Capital Gains</Link>
                              </div>
                              <p className="text-[10px] font-normal text-slate-400 uppercase tracking-wider mb-2">Wealth & Savings</p>
                              <div className="grid grid-cols-1 gap-1 mb-4">
                                <Link href="/calculators/sip" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">SIP Calculator</Link>
                                <Link href="/elss-comparator" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">ELSS Comparator</Link>
                                <Link href="/calculators/nps" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">NPS Calculator</Link>
                                <Link href="/calculators/ppf" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">PPF Calculator</Link>
                                <Link href="/calculators/fd" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">FD Calculator</Link>
                              </div>
                              <p className="text-[10px] font-normal text-slate-400 uppercase tracking-wider mb-2">Loan & EMI</p>
                              <div className="grid grid-cols-1 gap-1">
                                <Link href="/calculators/emi" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">EMI Calculator</Link>
                                <Link href="/calculators/home-loan" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Loan EMI Calculator</Link>
                                <Link href="/compliance-calendar" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Compliance Calendar</Link>
                                <Link href="/calculators/penalty" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Penalty Calculator</Link>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <Link
                          href="/blog"
                          onTouchStart={() => preloadOnHover("/blog")}
                          className={cn(
                            "px-6 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors border-l-4 border-transparent hover:border-blue-600",
                            location.startsWith('/blog') ? "font-bold" : "font-normal"
                          )}>
                          Knowledge Hub (Blog)
                        </Link>

                        <Link
                          href="/about"
                          onTouchStart={() => preloadOnHover("/about")}
                          className={cn(
                            "px-6 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors border-l-4 border-transparent hover:border-blue-600",
                            location === '/about' ? "font-bold" : "font-normal"
                          )}>
                          About MyeCA.in
                        </Link>

                        <Link
                          href="/contact"
                          onTouchStart={() => preloadOnHover("/contact")}
                          className={cn(
                            "px-6 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors border-l-4 border-transparent hover:border-blue-600",
                            location === '/contact' ? "font-bold" : "font-normal"
                          )}>
                          Contact Us
                        </Link>
                      </div>
                    </div>

                    <div className="p-6 border-t mt-auto bg-slate-50/50">
                      {!isLoading && !isAuthenticated && (
                        <div className="grid gap-3">
                          <Link href="/login" onTouchStart={() => preloadOnHover("/login")} onClick={() => setMobileMenuOpen(false)}>
                            <Button className="w-full justify-center text-white bg-blue-600 hover:bg-blue-700 rounded-xl h-11 shadow-lg shadow-blue-200">
                              Join / Sign in
                            </Button>
                          </Link>
                        </div>
                      )}
                      {!isLoading && isAuthenticated && (
                        <Button
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                          variant="outline"
                          className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl h-11 border-red-100"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Log Out
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

