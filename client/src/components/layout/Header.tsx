import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
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
  LineChart, Wallet, Banknote, Gem, Newspaper, PiggyBank
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
            <div className="text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-3">
              <span className="flex items-center text-sm">⏰</span>
              <span className="hidden sm:inline">ITR DEADLINE: 31 JULY 2026</span>
              <span className="hidden sm:inline opacity-30">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                2,847 PEOPLE FILED TODAY
              </span>
              <Link href="/itr/filing" onMouseEnter={() => preloadOnHover('/itr/filing')} className="bg-black text-[#FDE047] px-3 py-1 rounded-full text-[9px] font-black hover:bg-slate-800 transition-colors ml-2">
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
                      "font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-500 leading-none tracking-tight",
                      isScrolled ? "text-[1.25rem]" : "text-2xl"
                    )}>
                      MyeCA.in
                    </span>
                    <span className={cn(
                      "text-[9.5px] text-slate-500 font-bold tracking-[0.15em] transition-all duration-500",
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
                            <m.div 
                              layoutId="active-pill"
                              className="absolute inset-0 bg-blue-600/10 border border-blue-600/20 shadow-sm rounded-full"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <span className={cn(
                            "relative z-10 inline-flex items-center justify-center px-5 py-2.5 font-black transition-colors duration-300 cursor-pointer text-[17px]",
                            (location.startsWith('/admin') || location.startsWith('/ca') || location === '/dashboard')
                              ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
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
                        <m.div 
                          layoutId="active-pill"
                          className="absolute inset-0 bg-blue-600/10 border border-blue-600/20 shadow-sm rounded-full"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <NavigationMenuTrigger className={cn(
                        "relative z-10 bg-transparent font-black transition-colors duration-300 group px-5 py-2.5 rounded-full text-[17px]",
                        inServices ? "text-blue-600" : "text-slate-600 hover:text-blue-600",
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
                                  <h4 className="font-black text-slate-900 tracking-tight text-sm">Tax & Compliance</h4>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Expert Guided</p>
                                </div>
                              </div>
                             <ul className="space-y-4">
                               {[
                                 { href: "/services/tds-filing", icon: Receipt, title: "TDS Filing", desc: "Quarterly returns & certificates", color: "blue" },
                                 { href: "/services/gst-returns", icon: Calculator, title: "GST Returns", desc: "GSTR-1, 3B & Annual filing", color: "emerald" },
                                 { href: "/services/notice-compliance", icon: Shield, title: "Notice Management", desc: "Expert reply drafting", color: "orange" },
                                 { href: "/services/document-vault", icon: Lock, title: "Secure Vault", desc: "Bank-grade storage", color: "indigo" }
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
                                         <span className="block text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.title}</span>
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
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                                  <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-black text-slate-900 tracking-tight text-sm">Business Setup</h4>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Growth Focused</p>
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
                                         <span className="block text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.title}</span>
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
                                  <BarChart3 className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-black text-slate-900 tracking-tight text-sm">Business Intel</h4>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Growth Analytics</p>
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
                                         <span className="block text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">{item.title}</span>
                                         <span className="block text-[10px] text-slate-400 font-medium">{item.desc}</span>
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
                               <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-6">Trending Tool</h5>
                               <Link href="/tax-loss-harvesting" className="block group relative">
                                  <div className="relative overflow-hidden rounded-2xl p-6 shadow-2xl shadow-blue-100/30 transition-all duration-500 group-hover:-translate-y-1 bg-gradient-to-br from-blue-50/80 to-white border border-blue-100/50 backdrop-blur-sm">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                                     <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                           <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                              <Sparkles className="w-4 h-4 fill-white/20" />
                                           </div>
                                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Optimized AI</span>
                                        </div>
                                        <h6 className="text-xl font-black text-slate-900 leading-tight mb-2">Tax Optimizer AI</h6>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6">Save up to {"₹"}50k in taxes with our smart algorithm.</p>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-blue-200/50">
                                           Explore Tool <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                     </div>
                                  </div>
                               </Link>
                            </div>
                           
                           <div className="mt-8 pt-6 border-t border-slate-200/60">
                             <Link href="/services/marketplace" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest group">
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
                        <m.div 
                          layoutId="active-pill"
                          className="absolute inset-0 bg-blue-600/10 border border-blue-600/20 shadow-sm rounded-full"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <NavigationMenuTrigger className={cn(
                        "relative z-10 bg-transparent font-black transition-colors duration-300 group px-5 py-2.5 rounded-full text-[17px]",
                        inStartup ? "text-blue-600" : "text-slate-600 hover:text-blue-600",
                        "data-[state=open]:bg-blue-600/10 data-[state=open]:text-blue-600 data-[state=open]:border-blue-600/20 border border-transparent"
                      )}>
                        <span>Startup</span>
                      </NavigationMenuTrigger>
                    </div>
                    <NavigationMenuContent>
                       <div className="w-[720px] p-0 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200/60 overflow-hidden flex">
                          <div className="flex-1 p-6 grid grid-cols-2 gap-8 bg-white">
                             <div>
                                <div className="flex items-center gap-4 mb-6 px-0.5">
                                   <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100/50">
                                      <Rocket className="w-5 h-5" />
                                   </div>
                                   <div>
                                      <h4 className="font-black text-slate-900 tracking-tight text-sm">Launch</h4>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Day 0 Support</p>
                                   </div>
                                </div>
                                <ul className="space-y-4">
                                   {[
                                     { href: "/startup/registration", icon: Building2, title: "Entity Registration", desc: "Incorporate your company", color: "purple" },
                                     { href: "/services/gst-registration", icon: Stamp, title: "Essential Licenses", desc: "GST, MSME & Shop Act", color: "blue" }
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
                                             item.color === "blue" && "bg-blue-50/50 text-blue-500 group-hover:border-blue-100"
                                           )}>
                                             <Icon className="w-5 h-5" />
                                           </div>
                                           <div>
                                             <span className="block text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">{item.title}</span>
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
                                   <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100/50">
                                       <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                       <h4 className="font-black text-slate-900 tracking-tight text-sm">Scale</h4>
                                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Growth Engine</p>
                                    </div>
                                 </div>
                                <ul className="space-y-4">
                                   {[
                                     { href: "/startup/funding", icon: Coins, title: "Funding Assistance", desc: "Get investment ready", color: "emerald" },
                                     { href: "/startup-services", icon: Target, title: "Strategic Advisory", desc: "Expert business consulting", color: "purple" }
                                   ].map((item, idx) => {
                                     const Icon = item.icon as any;
                                     return (
                                       <li key={idx}>
                                         <Link href={item.href} className="group flex items-center gap-4 p-2.5 -ml-2 rounded-xl hover:bg-slate-50 transition-all duration-300">
                                           <div className={cn(
                                             "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm",
                                             item.color === "emerald" && "bg-emerald-50 text-emerald-500",
                                             item.color === "purple" && "bg-purple-50 text-purple-500"
                                           )}>
                                             <Icon className="w-5 h-5" />
                                           </div>
                                           <div>
                                             <span className="block text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">{item.title}</span>
                                             <span className="block text-[11px] text-slate-500 font-medium">{item.desc}</span>
                                           </div>
                                         </Link>
                                       </li>
                                     );
                                   })}
                                </ul>
                             </div>
                          </div>
                          
                          {/* Sidebar */}
                          <div className="w-64 bg-slate-50/50 p-6 border-l border-slate-100 flex flex-col">
                             <div className="flex-1">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-6">Spotlight</h5>
                                <div className="bg-gradient-to-br from-purple-50/80 to-white rounded-2xl p-6 shadow-xl shadow-purple-100/50 relative overflow-hidden group border border-purple-100/50">
                                   <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                   <div className="relative z-10">
                                      <div className="flex items-center gap-2 mb-3">
                                         <Zap className="w-4 h-4 text-purple-600 fill-purple-600/20" />
                                         <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">Startup India</span>
                                      </div>
                                      <h6 className="font-black text-slate-900 text-lg mb-2">Get Recognition</h6>
                                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">Avail 3 years of tax exemption and capital gains benefits.</p>
                                      <Link href="/contact" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-purple-200/50">
                                         Apply Now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                      </Link>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="mt-8 pt-6 border-t border-slate-200/60">
                               <Link href="/startup-services" className="inline-flex items-center gap-2 text-xs font-black text-purple-600 hover:text-purple-700 uppercase tracking-widest group">
                                 Explore Hub <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                        <m.div 
                          layoutId="active-pill"
                          className="absolute inset-0 bg-blue-600/10 border border-blue-600/20 shadow-sm rounded-full"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <NavigationMenuTrigger className={cn(
                        "relative z-10 bg-transparent font-black transition-colors duration-300 group px-5 py-2.5 rounded-full text-[17px]",
                        inCalculators ? "text-blue-600" : "text-slate-600 hover:text-blue-600",
                        "data-[state=open]:bg-blue-600/10 data-[state=open]:text-blue-600 data-[state=open]:border-blue-600/20 border border-transparent"
                      )}>
                        <span>Calculators</span>
                      </NavigationMenuTrigger>
                    </div>
                    <NavigationMenuContent>
                      <div className="w-[720px] p-0 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200/60 overflow-hidden flex">
                        {/* Main Categories */}
                        <div className="flex-1 p-6 grid grid-cols-2 gap-8 bg-white">
                           <div>
                              <div className="flex items-center gap-4 mb-6 px-0.5">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                                  <Landmark className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-black text-slate-900 tracking-tight text-sm">Income Tax</h4>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Compliance Hub</p>
                                </div>
                              </div>
                             <ul className="space-y-4">
                               {[
                                 { href: "/calculators/income-tax", icon: Calculator, title: "Tax Calculator", desc: "New vs Old Regime Analysis", color: "emerald" },
                                 { href: "/calculators/hra", icon: Home, title: "HRA Exemption", desc: "Calculate rent allowance", color: "blue" }
                               ].map((item, idx) => {
                                 const Icon = item.icon as any;
                                 return (
                                   <li key={idx}>
                                     <Link 
                                       href={item.href} 
                                       onMouseEnter={() => preloadOnHover(item.href)}
                                       className="group flex items-center gap-4 p-2.5 -ml-2 rounded-xl hover:bg-slate-50 transition-all duration-300"
                                     >
                                       <div className={cn(
                                         "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm",
                                         item.color === "emerald" && "bg-emerald-50 text-emerald-500",
                                         item.color === "blue" && "bg-blue-50 text-blue-500"
                                       )}>
                                         <Icon className="w-5 h-5" />
                                       </div>
                                       <div>
                                         <span className="block text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{item.title}</span>
                                         <span className="block text-[11px] text-slate-500 font-medium">{item.desc}</span>
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
                                    <TrendingUp className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <h4 className="font-black text-slate-900 tracking-tight text-sm">Investment</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Financial Planning</p>
                                 </div>
                              </div>
                             <ul className="space-y-4">
                               {[
                                 { href: "/calculators/sip", icon: Coins, title: "SIP Tool", desc: "Plan mutual fund returns", color: "orange" },
                                 { href: "/calculators/nps", icon: Umbrella, title: "NPS Calculator", desc: "Pension & retirement planning", color: "indigo" }
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
                                         item.color === "indigo" && "bg-indigo-50/50 text-indigo-500 group-hover:border-indigo-100"
                                       )}>
                                         <Icon className="w-5 h-5" />
                                       </div>
                                       <div>
                                         <span className="block text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.title}</span>
                                         <span className="block text-[10px] text-slate-400 font-medium">{item.desc}</span>
                                       </div>
                                     </Link>
                                   </li>
                                 );
                               })}
                             </ul>
                           </div>
                        </div>
                        
                        {/* Sidebar */}
                        <div className="w-64 bg-slate-50/50 p-6 border-l border-slate-100 flex flex-col">
                           <div className="flex-1">
                              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-6">AI Powered</h5>
                              <Link href="/tax-assistant" className="block group">
                                 <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1">
                                    <div className="flex items-center gap-3 mb-3">
                                       <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                          <Bot className="w-4 h-4" />
                                       </div>
                                       <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">AI Tax Buddy</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed mb-4">Get instant answers for ITR filing & tax savings.</p>
                                    <span className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">Talk to AI <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
                                 </div>
                              </Link>
                              
                              <div className="mt-6">
                                <Link href="/calculators/general" className="group flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50/50 transition-all">
                                   <Grid className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                                   <span className="text-xs font-bold text-slate-600">General Calculator</span>
                                </Link>
                              </div>
                           </div>
                           
                           <div className="mt-8 pt-6 border-t border-slate-200/60">
                             <Link href="/calculators" className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest group">
                               All Tools <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                          <m.div 
                            layoutId="active-pill"
                            className="absolute inset-0 bg-blue-600/10 border border-blue-600/20 shadow-sm rounded-full"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className={cn(
                          "relative z-10 inline-flex items-center justify-center px-5 py-2.5 font-black transition-colors duration-300 cursor-pointer text-[17px]",
                          location.startsWith('/blog') ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
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
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-black text-white shadow-sm ring-2 ring-white">
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
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md ring-2 ring-white">
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
                          <Link href="/profile" className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">My Profile</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="p-3 rounded-xl cursor-pointer group" asChild>
                          <Link href="/settings" className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <Settings className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Settings</span>
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
                            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
                              <AccordionTrigger className="px-6 py-3 text-sm font-medium text-slate-700 hover:no-underline hover:bg-slate-50 hover:text-blue-600">
                                  Services
                              </AccordionTrigger>
                              <AccordionContent className="bg-slate-50/50 px-6 py-2">
                                 <div className="space-y-3">
                                    <div className="space-y-1">
                                       <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tax & Compliance</h5>
                                       <Link href="/services/tds-filing" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">TDS Filing</Link>
                                       <Link href="/services/gst-registration" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">GST Registration</Link>
                                       <Link href="/services/document-vault" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Document Vault</Link>
                                     </div>
                                    <div className="space-y-1 pt-2">
                                       <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business</h5>
                                       <Link href="/services/company-registration" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Company Registration</Link>
                                       <Link href="/services/trademark-registration" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Trademark</Link>
                                    </div>
                                 </div>
                              </AccordionContent>
                           </AccordionItem>

                           <AccordionItem value="startup" className="border-none">
                              <AccordionTrigger className="px-6 py-3 text-sm font-medium text-slate-700 hover:no-underline hover:bg-slate-50 hover:text-purple-600">
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
                              <AccordionTrigger className="px-6 py-3 text-sm font-medium text-slate-700 hover:no-underline hover:bg-slate-50 hover:text-blue-600">
                                 Calculators
                              </AccordionTrigger>
                              <AccordionContent className="bg-slate-50/50 px-6 py-2">
                                 <div className="grid grid-cols-1 gap-2">
                                    <Link href="/calculators/income-tax" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Income Tax Calculator</Link>
                                    <Link href="/calculators/sip" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">SIP Calculator</Link>
                                    <Link href="/calculators/hra" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">HRA Calculator</Link>
                                 </div>
                              </AccordionContent>
                           </AccordionItem>
                        </Accordion>

                        <Link href="/blog" className="px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors border-l-4 border-transparent hover:border-blue-600">
                           Knowledge Hub (Blog)
                        </Link>

                        <Link href="/about" className="px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors border-l-4 border-transparent hover:border-blue-600">
                           About MyeCA.in
                        </Link>
                        
                        <Link href="/contact" className="px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors border-l-4 border-transparent hover:border-blue-600">
                           Contact Us
                        </Link>
                      </div>
                    </div>

                    <div className="p-6 border-t mt-auto bg-slate-50/50">
                       {!isLoading && !isAuthenticated && (
                          <div className="grid gap-3">
                             <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
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

