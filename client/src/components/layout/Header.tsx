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
  Landmark, Receipt, Stamp, Umbrella, Rocket
} from "lucide-react";
import Logo from "@/components/ui/logo";
import { useAuth } from "@/components/AuthProvider";
import { Show, SignInButton, SignUpButton, UserButton } from "@/lib/clerk";
import { cn } from "@/lib/utils";

const PROMO_DISMISSED_KEY = 'promo-bar-dismissed-v2';
const PROMO_DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function Header() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [promoDismissed, setPromoDismissed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  try {
    const auth = useAuth();
    user = auth.user;
    isAuthenticated = auth.isAuthenticated;
    logout = auth.logout;
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

  return (
    <>
      {/* Promotional Bar */}
      {!promoDismissed && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-blue-50 text-blue-900 border-b border-blue-100 h-[36px] flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-center relative">
            <div className="text-xs font-medium flex items-center justify-center gap-2">
              <span className="flex items-center">🚀</span>
              <span className="hidden sm:inline text-blue-800">Startup Funding: Up to \u20B950L</span>
              <span className="sm:hidden text-blue-800">Startup Services</span>
              <Link href="/startup-services" className="text-blue-600 font-semibold hover:text-blue-800 underline-offset-2 hover:underline ml-1 flex items-center">
                Learn More <ArrowRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
            <button
              onClick={dismissPromo}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-blue-100 rounded transition-colors text-blue-500 flex items-center justify-center"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header Structure */}
      <header className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-300 flex flex-col",
        headerTop
      )}>
        
        {/* Top Info Bar - Collapses on scroll */}
        <div className="hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between text-xs">
            <div className="flex items-center gap-6">
              <a href="mailto:support@myeca.in" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5" />
                <span>support@myeca.in</span>
              </a>
              <a href="tel:+919876543210" className="hidden sm:flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5" />
                <span>+91 98765 43210</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-slate-400">Tax Season is Live!</span>
              <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className={cn(
          "w-full transition-all duration-500 border-b relative",
          isScrolled 
            ? "bg-white/80 backdrop-blur-md shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border-slate-200/50" 
            : "bg-white border-transparent"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={cn(
              "flex justify-between items-center transition-all duration-300",
              "h-16"
            )}>
              
              {/* Logo Section */}
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                  <Logo size={isScrolled ? "md" : "lg"} />
                  <div className="flex flex-col">
                    <span className={cn(
                      "font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 leading-none tracking-tight",
                      isScrolled ? "text-xl" : "text-2xl"
                    )}>
                      MyeCA.in
                    </span>
                    <span className={cn(
                      "text-[10px] text-slate-500 font-medium tracking-wider transition-all duration-300",
                      isScrolled ? "h-0 opacity-0 overflow-hidden" : "h-auto opacity-100"
                    )}>
                      SMART TAX SOLUTIONS
                    </span>
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <NavigationMenu className="hidden lg:flex">
                <NavigationMenuList className="gap-4">
                  
                  <NavigationMenuItem>
                    <Link href="/">
                      <span className={cn(
                        "inline-flex items-center justify-center px-4 py-2 font-bold transition-all duration-300 cursor-pointer rounded-xl",
                        isActive('/') 
                          ? "text-blue-600 bg-blue-50/80 text-[15.5px]" 
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50 text-sm"
                      )}>
                        Home
                      </span>
                    </Link>
                  </NavigationMenuItem>

                  {/* Services Mega Menu */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={cn(
                      "bg-transparent font-bold transition-all duration-300 group rounded-xl px-4 py-2",
                      inServices 
                        ? "text-blue-600 bg-blue-50/80 text-[15.5px]" 
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50 text-sm",
                      "data-[state=open]:bg-blue-50/80 data-[state=open]:text-blue-600 data-[state=open]:text-[15.5px]"
                    )}>
                      <span>Services</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[720px] p-0 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200/60 overflow-hidden flex">
                        {/* Main Categories */}
                        <div className="flex-1 p-6 grid grid-cols-2 gap-8 bg-white">
                           <div>
                             <div className="flex items-center gap-3 mb-6">
                               <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                 <FileText className="w-5 h-5" />
                               </div>
                               <div>
                                 <h4 className="font-extrabold text-slate-900 tracking-tight">Tax & Compliance</h4>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Expert Guided</p>
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
                                     <Link href={item.href} className="group flex items-center gap-4 p-2.5 -ml-2 rounded-xl hover:bg-slate-50 transition-all duration-300">
                                       <div className={cn(
                                         "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm",
                                         item.color === "blue" && "bg-blue-50 text-blue-500",
                                         item.color === "emerald" && "bg-emerald-50 text-emerald-500",
                                         item.color === "orange" && "bg-orange-50 text-orange-500",
                                         item.color === "indigo" && "bg-indigo-50 text-indigo-500"
                                       )}>
                                         <Icon className="w-5 h-5" />
                                       </div>
                                       <div>
                                         <span className="block text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.title}</span>
                                         <span className="block text-[11px] text-slate-500 font-medium">{item.desc}</span>
                                       </div>
                                     </Link>
                                   </li>
                                 );
                               })}
                             </ul>
                           </div>
                           
                           <div>
                             <div className="flex items-center gap-3 mb-6">
                               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                 <Building2 className="w-5 h-5" />
                               </div>
                               <div>
                                 <h4 className="font-extrabold text-slate-900 tracking-tight">Business Setup</h4>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Growth Focused</p>
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
                                     <Link href={item.href} className="group flex items-center gap-4 p-2.5 -ml-2 rounded-xl hover:bg-slate-50 transition-all duration-300">
                                       <div className={cn(
                                         "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm",
                                         item.color === "indigo" && "bg-indigo-50 text-indigo-500",
                                         item.color === "purple" && "bg-purple-50 text-purple-500",
                                         item.color === "blue" && "bg-blue-50 text-blue-500"
                                       )}>
                                         <Icon className="w-5 h-5" />
                                       </div>
                                       <div>
                                         <span className="block text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.title}</span>
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
                              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-6">Trending Tool</h5>
                              <Link href="/tax-loss-harvesting" className="block group relative">
                                 <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 mb-4 overflow-hidden shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-all duration-500">
                                    <div className="absolute inset-0 flex items-center justify-center text-white/20">
                                       <PieChart className="w-20 h-20 group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
                                 </div>
                                 <h6 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Tax Optimizer AI</h6>
                                 <p className="text-xs text-slate-500 mt-2 leading-relaxed">Save up to \u20B950k in taxes with our smart algorithm.</p>
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
                    <NavigationMenuTrigger className={cn(
                      "bg-transparent font-bold transition-all duration-300 group rounded-xl px-4 py-2",
                      inStartup 
                        ? "text-purple-600 bg-purple-50/80 text-[15.5px]" 
                        : "text-slate-600 hover:text-purple-600 hover:bg-slate-50 text-sm",
                      "data-[state=open]:bg-purple-50/80 data-[state=open]:text-purple-600 data-[state=open]:text-[15.5px]"
                    )}>
                      <span>Startup</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                       <div className="w-[720px] p-0 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200/60 overflow-hidden flex">
                          <div className="flex-1 p-6 grid grid-cols-2 gap-8 bg-white">
                             <div>
                                <div className="flex items-center gap-3 mb-6">
                                   <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                      <Rocket className="w-5 h-5" />
                                   </div>
                                   <div>
                                      <h4 className="font-extrabold text-slate-900 tracking-tight">Launch</h4>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Day 0 Support</p>
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
                                         <Link href={item.href} className="group flex items-center gap-4 p-2.5 -ml-2 rounded-xl hover:bg-slate-50 transition-all duration-300">
                                           <div className={cn(
                                             "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm",
                                             item.color === "purple" && "bg-purple-50 text-purple-500",
                                             item.color === "blue" && "bg-blue-50 text-blue-500"
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
                             
                             <div>
                                <div className="flex items-center gap-3 mb-6">
                                   <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                      <TrendingUp className="w-5 h-5" />
                                   </div>
                                   <div>
                                      <h4 className="font-extrabold text-slate-900 tracking-tight">Scale</h4>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Growth Engine</p>
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
                                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 shadow-xl shadow-purple-100 relative overflow-hidden group">
                                   <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                   <div className="relative z-10">
                                      <div className="flex items-center gap-2 mb-3">
                                         <Zap className="w-4 h-4 text-purple-200 fill-purple-200" />
                                         <span className="text-[10px] font-black text-purple-100 uppercase tracking-wider">Startup India</span>
                                      </div>
                                      <h6 className="font-bold text-white mb-2">Get Recognition</h6>
                                      <p className="text-[11px] text-purple-100/80 leading-relaxed mb-4">Avail 3 years of tax exemption and capital gains benefits.</p>
                                      <Link href="/contact" className="inline-flex items-center gap-2 text-[11px] font-black text-white hover:underline uppercase tracking-wider">
                                         Apply Now <ArrowRight className="w-3 h-3" />
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
                    <NavigationMenuTrigger className={cn(
                      "bg-transparent font-bold transition-all duration-300 group rounded-xl px-4 py-2",
                      inCalculators 
                        ? "text-emerald-600 bg-emerald-50/80 text-[15.5px]" 
                        : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50 text-sm",
                      "data-[state=open]:bg-emerald-50/80 data-[state=open]:text-emerald-600 data-[state=open]:text-[15.5px]"
                    )}>
                      <span>Calculators</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[720px] p-0 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200/60 overflow-hidden flex">
                        {/* Main Categories */}
                        <div className="flex-1 p-6 grid grid-cols-2 gap-8 bg-white">
                           <div>
                             <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                   <Landmark className="w-5 h-5" />
                                </div>
                                <div>
                                   <h4 className="font-extrabold text-slate-900 tracking-tight">Income Tax</h4>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Compliance Hub</p>
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
                                     <Link href={item.href} className="group flex items-center gap-4 p-2.5 -ml-2 rounded-xl hover:bg-slate-50 transition-all duration-300">
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
                             <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                   <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                   <h4 className="font-extrabold text-slate-900 tracking-tight">Investment</h4>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Financial Planning</p>
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
                                     <Link href={item.href} className="group flex items-center gap-4 p-2.5 -ml-2 rounded-xl hover:bg-slate-50 transition-all duration-300">
                                       <div className={cn(
                                         "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm",
                                         item.color === "orange" && "bg-orange-50 text-orange-500",
                                         item.color === "indigo" && "bg-indigo-50 text-indigo-500"
                                       )}>
                                         <Icon className="w-5 h-5" />
                                       </div>
                                       <div>
                                         <span className="block text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.title}</span>
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

                  {/* Investment Mega Menu */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={cn(
                      "bg-transparent font-bold transition-all duration-300 group rounded-xl px-4 py-2",
                      location.startsWith('/investment') 
                        ? "text-blue-600 bg-blue-50/80 text-[15.5px]" 
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50 text-sm",
                      "data-[state=open]:bg-blue-50/80 data-[state=open]:text-blue-600 data-[state=open]:text-[15.5px]"
                    )}>
                      <span>Wealth</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[720px] p-0 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200/60 overflow-hidden flex">
                        <div className="flex-1 p-6 grid grid-cols-2 gap-8 bg-white">
                          <div>
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <TrendingUp className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-900 tracking-tight">Dashboard & Tools</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time Insights</p>
                              </div>
                            </div>
                            <ul className="space-y-4">
                              {[
                                { href: "/investment/dashboard", icon: PieChart, title: "Portfolio Dashboard", desc: "Track your wealth growth", color: "emerald" },
                                { href: "/investment/watchlist", icon: BarChart3, title: "Watchlist", desc: "Monitor favorite stocks", color: "blue" },
                                { href: "/investment/portfolio-simulation", icon: Calculator, title: "Portfolio Simulator", desc: "Project future returns", color: "indigo" }
                              ].map((item, idx) => {
                                const Icon = item.icon as any;
                                return (
                                  <li key={idx}>
                                    <Link href={item.href} className="group flex items-center gap-4 p-2.5 -ml-2 rounded-xl hover:bg-slate-50 transition-all duration-300">
                                      <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm",
                                        item.color === "emerald" && "bg-emerald-50 text-emerald-500",
                                        item.color === "blue" && "bg-blue-50 text-blue-500",
                                        item.color === "indigo" && "bg-indigo-50 text-indigo-500"
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
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <BarChart3 className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-900 tracking-tight">Market & Analysis</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Data Driven</p>
                              </div>
                            </div>
                            <ul className="space-y-4">
                              {[
                                { href: "/investment/stocks", icon: TrendingUp, title: "Stock Analysis", desc: "Deep dive fundamentals", color: "blue" },
                                { href: "/investment/risk-assessment", icon: Shield, title: "Risk Assessment", desc: "Know your profile", color: "emerald" },
                                { href: "/tax-loss-harvesting", icon: Scale, title: "Tax Optimization", desc: "Harvest losses efficiently", color: "orange" }
                              ].map((item, idx) => {
                                const Icon = item.icon as any;
                                return (
                                  <li key={idx}>
                                    <Link href={item.href} className="group flex items-center gap-4 p-2.5 -ml-2 rounded-xl hover:bg-slate-50 transition-all duration-300">
                                      <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm",
                                        item.color === "blue" && "bg-blue-50 text-blue-500",
                                        item.color === "emerald" && "bg-emerald-50 text-emerald-500",
                                        item.color === "orange" && "bg-orange-50 text-orange-500"
                                      )}>
                                        <Icon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <span className="block text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.title}</span>
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
                              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-6">Learn Center</h5>
                              <Link href="/learn/investment-basics" className="block group">
                                 <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-lg shadow-emerald-100 group-hover:shadow-emerald-200 transition-all duration-500">
                                    <div className="flex items-center gap-3 mb-4">
                                       <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                                          <Target className="w-4 h-4" />
                                       </div>
                                       <span className="text-xs font-black text-white uppercase tracking-wider">Investing 101</span>
                                    </div>
                                    <h6 className="font-bold text-white mb-2">Master the Market</h6>
                                    <p className="text-[11px] text-emerald-50/80 leading-relaxed">Everything you need to know about wealth creation in India.</p>
                                 </div>
                              </Link>
                              
                              <div className="mt-6">
                                <Link href="/learn/glossary" className="group flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all">
                                   <div className="flex items-center gap-3">
                                      <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                      <span className="text-xs font-bold text-slate-600">Financial Glossary</span>
                                   </div>
                                   <ChevronRight className="w-3 h-3 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </Link>
                              </div>
                           </div>
                           
                           <div className="mt-8 pt-6 border-t border-slate-200/60">
                             <Link href="/investment/dashboard" className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest group">
                               Go to Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                             </Link>
                           </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                </NavigationMenuList>
              </NavigationMenu>

              {/* Right Side Actions */}
              <div className="flex items-center gap-3">
                
                {/* Search - Desktop */}
                <Button variant="ghost" size="icon" className="hidden lg:flex text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                  <Search className="w-5 h-5" />
                </Button>

                <Show when="signed-in">
                  <UserButton />
                </Show>
                <Show when="signed-out">
                  <div className="hidden lg:flex items-center gap-2">
                    <SignInButton mode="modal">
                      <Button variant="ghost" className="text-slate-600 hover:text-blue-600 font-bold text-sm px-6 h-10 rounded-xl transition-all">
                        Log in
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl px-7 h-10 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0">
                        Get Started
                      </Button>
                    </SignUpButton>
                  </div>
                </Show>

                {/* Mobile Menu Trigger (Sheet) */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 overflow-y-auto">
                    <SheetHeader className="p-6 border-b bg-slate-50/50 text-left">
                       <div className="flex items-center gap-3">
                          <Logo size="md" />
                          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                             MyeCA.in
                          </span>
                       </div>
                       <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex flex-col py-4">
                       <Link href="/" className="px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors border-l-4 border-transparent hover:border-blue-600">
                          Home
                       </Link>
                       
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
                          
                          <AccordionItem value="investment" className="border-none">
                             <AccordionTrigger className="px-6 py-3 text-sm font-medium text-slate-700 hover:no-underline hover:bg-slate-50 hover:text-green-600">
                                Investment
                             </AccordionTrigger>
                             <AccordionContent className="bg-green-50/30 px-6 py-2">
                                <div className="grid grid-cols-1 gap-2">
                                   <Link href="/investment/dashboard" className="block py-1.5 text-sm text-slate-600 hover:text-green-600">Dashboard</Link>
                                   <Link href="/investment/stocks" className="block py-1.5 text-sm text-slate-600 hover:text-green-600">Stocks</Link>
                                   <Link href="/investment/watchlist" className="block py-1.5 text-sm text-slate-600 hover:text-green-600">Watchlist</Link>
                                </div>
                             </AccordionContent>
                          </AccordionItem>
                       </Accordion>

                       <Link href="/contact" className="px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors border-l-4 border-transparent hover:border-blue-600">
                          Contact Us
                       </Link>
                    </div>

                    <div className="p-6 border-t mt-auto">
                       <Show when="signed-out">
                          <div className="grid gap-3">
                             <SignInButton mode="modal">
                                <Button variant="outline" className="w-full justify-center">Log In</Button>
                             </SignInButton>
                             <SignUpButton mode="modal">
                                <Button className="w-full justify-center text-white bg-blue-600 hover:bg-blue-700">Get Started</Button>
                             </SignUpButton>
                          </div>
                       </Show>
                       <Show when="signed-in">
                          <Button onClick={() => logout()} variant="outline" className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50">
                             <LogOut className="w-4 h-4 mr-2" />
                             Log Out
                          </Button>
                       </Show>
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
