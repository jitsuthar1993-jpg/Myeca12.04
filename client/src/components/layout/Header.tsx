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
  const [location, navigate] = useLocation();
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

  const openTaxAssistant = () => {
    navigate('/tax-assistant');
  };

  const openSearch = () => {
    window.dispatchEvent(new Event('openGlobalSearch'));
  };

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
            ? "bg-white/95 backdrop-blur-xl shadow-md border-slate-200/60 py-0.5 md:py-1"
            : "bg-white/95 backdrop-blur-lg border-slate-100 shadow-sm py-1 md:bg-white/80 md:py-2"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={cn(
              "flex justify-between items-center transition-all duration-300",
              isScrolled ? "h-[48px] md:h-[50px]" : "h-[52px] md:h-[58px]"
            )}>
              {/* Logo Section */}
              <div className="flex items-center gap-3 md:gap-4">
                <a href="https://myeca.in" className="flex items-center gap-2 group shrink-0">
                  <Logo size={isScrolled ? "sm" : "md"} className="scale-90 md:scale-100" />
                  <div className="flex flex-col justify-center gap-0.5">
                    <span className={cn(
                      "font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-500 leading-none tracking-tight block m-0",
                      isScrolled ? "text-lg md:text-[1.25rem]" : "text-xl md:text-2xl"
                    )}>
                      MyeCA.in
                    </span>
                    <span className={cn(
                      "hidden text-[9.5px] text-slate-500 font-normal tracking-[0.15em] transition-all duration-500 m-0 leading-none md:block",
                      isScrolled ? "h-0 opacity-0 overflow-hidden" : "h-auto opacity-100"
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
                                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6">Compare regimes and review eligible deductions before filing.</p>
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
                                { href: "/calculators/income-tax", icon: Calculator, title: "Income Tax", desc: "AY 2026-27 Tax Estimate", color: "emerald" },
                                { href: "/calculators/tax-regime", icon: Scale, title: "Tax Regime Compare", desc: "Old vs New side by side", color: "emerald" },
                                { href: "/calculators/hra", icon: Home, title: "HRA Exemption", desc: "Calculate rent allowance", color: "blue" },
                                { href: "/calculators/gst", icon: Receipt, title: "GST Calculator", desc: "Add or remove GST", color: "blue" },
                                { href: "/calculators/salary", icon: Wallet, title: "Salary Calculator", desc: "CTC to in-hand pay", color: "emerald" },
                                { href: "/calculators/tds", icon: Receipt, title: "TDS Calculator", desc: "Deduction on salary & more", color: "orange" },
                                { href: "/calculators/capital-gains", icon: TrendingUp, title: "Capital Gains", desc: "STCG & LTCG computation", color: "indigo" }
                              ].slice(0, 4).map((item, idx) => {
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
                                { href: "/calculators/rd", icon: Calendar, title: "RD Calculator", desc: "Recurring deposit growth", color: "blue" },
                                { href: "/calculators/epf", icon: Shield, title: "EPF Calculator", desc: "Provident fund corpus", color: "emerald" },
                                { href: "/calculators/lumpsum", icon: TrendingUp, title: "Lumpsum Calculator", desc: "One-time investment", color: "orange" },
                                { href: "/calculators/swp", icon: Wallet, title: "SWP Calculator", desc: "Monthly withdrawal plan", color: "indigo" },
                                { href: "/calculators/inflation", icon: LineChart, title: "Inflation Calculator", desc: "Future cost planner", color: "orange" },
                              ].slice(0, 4).map((item, idx) => {
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
                                { href: "/calculators/loan-eligibility", icon: Target, title: "Loan Eligibility", desc: "Estimate borrowing power", color: "blue" },
                                { href: "/calculators/gratuity", icon: Gift, title: "Gratuity Calculator", desc: "Employee benefit estimate", color: "indigo" },
                                { href: "/compliance-calendar", icon: Calendar, title: "Compliance Calendar", desc: "GST & Tax Deadlines", color: "indigo" },
                                { href: "/calculators/penalty", icon: ShieldAlert, title: "Penalty Calculator", desc: "GST & Tax Delay Costs", color: "orange" }
                              ].slice(0, 4).map((item, idx) => {
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

                        <div className="w-72 bg-slate-50/50 p-6 border-l border-slate-100 flex flex-col">
                          <div className="flex-1">
                            <h5 className="text-[10px] font-normal text-slate-400 uppercase tracking-[2px] mb-6">Calculator Index</h5>
                            <Link href="/calculators" onMouseEnter={() => preloadOnHover("/calculators")} className="block group">
                              <div className="bg-white rounded-2xl p-6 shadow-md border border-emerald-100/50 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-lg">
                                <div className="relative z-10">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Grid className="w-4 h-4 text-emerald-600" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">All Tools</span>
                                  </div>
                                  <h6 className="font-normal text-slate-900 text-lg mb-2">Browse every calculator</h6>
                                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">Open the full calculator library for tax, investment, loan, and compliance tools.</p>
                                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-emerald-200/50">
                                    View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>

                          <div className="mt-8 pt-6 border-t border-slate-200/60">
                            <Link href="/calculators" onMouseEnter={() => preloadOnHover("/calculators")} className="inline-flex items-center gap-2 text-xs font-normal text-emerald-600 hover:text-emerald-700 uppercase tracking-widest group">
                              See All Calculators <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  onClick={openSearch}
                  aria-label="Open search"
                  className="hidden lg:flex text-slate-400 hover:text-[#2563eb] hover:bg-blue-50/80 rounded-xl w-10 h-10 transition-all duration-300 border border-transparent hover:border-blue-100/50"
                >
                  <Search className="w-[18px] h-[18px]" />
                </Button>

                <Button
                  type="button"
                  onClick={openTaxAssistant}
                  className="hidden lg:inline-flex h-10 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 text-sm font-semibold text-blue-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200"
                >
                  <Bot className="h-4 w-4" />
                  <span>Tax Assistant</span>
                </Button>

                {!isLoading && isAuthenticated && (
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 px-2 h-10 rounded-full hover:bg-slate-100/50">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-normal text-white shadow-sm ring-2 ring-white">
                            {getInitials()}
                          </div>
                          <span className="hidden sm:inline text-xs font-normal text-slate-600">
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
                              <span className="text-sm font-normal text-slate-900 truncate">
                                {[user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.email}
                              </span>
                              <span className="text-[10px] font-medium text-slate-500 truncate mt-0.5">
                                {user?.email}
                              </span>
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[9px] font-normal text-blue-600 uppercase tracking-widest border border-blue-100/50">
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
                            <span className="text-sm font-normal text-slate-700 group-hover:text-blue-600 transition-colors">Dashboard</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="p-3 rounded-xl cursor-pointer group" asChild>
                          <Link href="/settings" className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <Settings className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-normal text-slate-700 group-hover:text-blue-600 transition-colors">Account Settings</span>
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
                            <span className="text-sm font-normal text-slate-700 group-hover:text-red-600 transition-colors uppercase tracking-tight">Sign Out</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {!isLoading && !isAuthenticated && (
                  <div className="hidden lg:flex items-center gap-3">
                    <Link href="/login">
                      <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-normal text-sm rounded-xl px-7 h-11 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_25px_-6px_rgba(37,99,235,0.45)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5">
                        <User className="w-[18px] h-[18px]" />
                        <span>Log in / Join</span>
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Mobile Menu Trigger (Sheet) */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={openSearch}
                  aria-label="Open search"
                  className="h-10 w-10 rounded-lg text-slate-700 transition-all hover:bg-slate-100 lg:hidden"
                >
                  <Search className="w-5 h-5" />
                </Button>

                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-slate-700 transition-all hover:bg-slate-100 lg:hidden" aria-label="Open navigation menu">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="flex w-[calc(100vw-24px)] max-w-[340px] flex-col overflow-y-auto p-0 sm:w-[350px]">
                    <SheetHeader className="overflow-hidden border-b bg-white p-0 text-left">
                      <a
                        href="https://myeca.in"
                        onClick={() => setMobileMenuOpen(false)}
                        className="group flex cursor-pointer items-center gap-3 p-4 transition-all hover:bg-slate-50"
                      >
                        <Logo size="sm" className="transition-transform group-hover:scale-105" />
                        <div className="flex flex-col justify-center gap-0.5">
                          <span className="m-0 block text-lg font-bold leading-none text-[#315efb]">
                            MyeCA.in
                          </span>
                          <span className="m-0 block text-[9px] font-normal uppercase leading-none tracking-widest text-slate-400">SMART TAX SOLUTIONS</span>
                        </div>
                      </a>
                      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto">
                      <div className="grid gap-2 p-4">
                        {isAuthenticated && (
                          <Link href={
                            user?.role === 'admin' ? "/admin/users" :
                              user?.role === 'ca' ? "/ca/dashboard" :
                                user?.role === 'team_member' ? "/admin/blog-management" :
                                  "/dashboard"
                          } className="flex min-h-11 items-center rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100">
                            {user?.role === 'admin' ? "Admin" :
                              user?.role === 'ca' ? "CA Dashboard" :
                                user?.role === 'team_member' ? "Staff Panel" :
                                  "Dashboard"}
                          </Link>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { href: "/", label: "Home", icon: Home },
                            { href: "/services", label: "Services", icon: Briefcase },
                            { href: "/calculators", label: "Calculators", icon: Calculator },
                            { href: "/blog", label: "Blog", icon: Newspaper },
                          ].map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onTouchStart={() => preloadOnHover(item.href)}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                  "flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700",
                                  (item.href === "/" ? location === "/" : location.startsWith(item.href)) && "border-blue-100 bg-blue-50 text-blue-700"
                                )}
                              >
                                <Icon className="h-4 w-4" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>

                        <Accordion type="single" collapsible className="w-full rounded-lg border border-slate-200 bg-white">
                          <AccordionItem value="services" className="border-none px-1">
                            <AccordionTrigger className={cn(
                              "min-h-11 px-3 py-2 text-sm text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-600 hover:no-underline",
                              location.startsWith('/services') ? "font-bold" : "font-normal"
                            )}>
                              Services
                            </AccordionTrigger>
                            <AccordionContent className="px-3 pb-3">
                              <div className="grid gap-1">
                                {[
                                  ["/services/tds-filing", "TDS Filing"],
                                  ["/services/gst-registration", "GST Registration"],
                                  ["/services/company-registration", "Company Registration"],
                                  ["/services/trademark-registration", "Trademark"],
                                  ["/services/document-vault", "Document Vault"],
                                ].map(([href, label]) => (
                                  <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-2 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600">
                                    {label}
                                  </Link>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="startup" className="border-t border-slate-100 px-1">
                            <AccordionTrigger className={cn(
                              "min-h-11 px-3 py-2 text-sm text-slate-700 transition-all hover:bg-slate-50 hover:text-purple-600 hover:no-underline",
                              location.startsWith('/startup') ? "font-bold" : "font-normal"
                            )}>
                              Startup Services
                            </AccordionTrigger>
                            <AccordionContent className="px-3 pb-3">
                              <div className="grid gap-1">
                                <Link href="/startup-services" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-2 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">Overview</Link>
                                <Link href="/startup/registration" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-2 py-2 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-600">Registration</Link>
                                <Link href="/startup/funding" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-2 py-2 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-600">Funding & Grants</Link>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="calculators" className="border-t border-slate-100 px-1">
                            <AccordionTrigger className={cn(
                              "min-h-11 px-3 py-2 text-sm text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-600 hover:no-underline",
                              (location.startsWith('/calculators') || location === '/compliance-calendar' || location === '/elss-comparator') ? "font-bold" : "font-normal"
                            )}>
                              Calculators
                            </AccordionTrigger>
                            <AccordionContent className="px-3 pb-3">
                              <div className="grid gap-1">
                                {[
                                  ["/calculators/income-tax", "Income Tax"],
                                  ["/calculators/gst", "GST Calculator"],
                                  ["/calculators/salary", "Salary Calculator"],
                                  ["/calculators/sip", "SIP Calculator"],
                                  ["/calculators/emi", "EMI Calculator"],
                                  ["/calculators", "All Calculators"],
                                ].map(([href, label]) => (
                                  <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-2 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600">
                                    {label}
                                  </Link>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <Link
                          href="/about"
                          onTouchStart={() => preloadOnHover("/about")}
                          className={cn(
                            "flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600",
                            location === '/about' ? "font-bold text-blue-700" : "font-normal"
                          )}>
                          About MyeCA.in
                        </Link>

                        <Link
                          href="/contact"
                          onTouchStart={() => preloadOnHover("/contact")}
                          className={cn(
                            "flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600",
                            location === '/contact' ? "font-bold text-blue-700" : "font-normal"
                          )}>
                          Contact Us
                        </Link>
                      </div>
                    </div>

                    <div className="mt-auto border-t bg-slate-50/50 p-4">
                      <Button
                        type="button"
                        onClick={() => {
                          openTaxAssistant();
                          setMobileMenuOpen(false);
                        }}
                        className="mb-3 h-11 w-full justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 shadow-sm hover:bg-blue-600 hover:text-white"
                      >
                        <Bot className="h-4 w-4" />
                        Tax Assistant
                      </Button>
                      {!isLoading && !isAuthenticated && (
                        <div className="grid gap-3">
                          <Link href="/login" onTouchStart={() => preloadOnHover("/login")} onClick={() => setMobileMenuOpen(false)}>
                            <Button className="h-11 w-full justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-200 hover:bg-blue-700">
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
                          className="h-11 w-full justify-center rounded-lg border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
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

