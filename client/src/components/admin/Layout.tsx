// Admin Layout Component - Minimalist & Premium Redesign

import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Menu, X, Home, Users, BarChart3, FileText, Settings, 
  LogOut, Image as ImageIcon, Briefcase, User, FolderOpen, 
  Heart, Search, Bell, Wallet, ChevronRight, LayoutGrid, 
  Database, HelpCircle, Command, Sparkles, BookOpen, 
  ShieldCheck, PieChart, Layers, Globe, Zap, History,
  ClipboardList, CreditCard, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

// Navigation structure grouped by usage/account type
const navGroups = {
  admin: [
    {
      label: 'Core Management',
      items: [
        { icon: LayoutGrid, label: 'Control Center', href: '/admin' },
        { icon: Users, label: 'User Registry', href: '/admin/users' },
        { icon: ShieldCheck, label: 'CA Authorization', href: '/admin/dashboard' }, // Link to CA queue
      ]
    },
    {
      label: 'Content Engine',
      items: [
        { icon: FileText, label: 'Blog Manager', href: '/admin/blog-management' },
        { icon: ImageIcon, label: 'Media Library', href: '/admin/media-management' },
        { icon: Globe, label: 'Categories', href: '/admin/categories-management' },
      ]
    },
    {
      label: 'System Insights',
      items: [
        { icon: BarChart3, label: 'Performance', href: '/admin/analytics' },
        { icon: Database, label: 'Audit Logs', href: '/admin/audit-logs' },
        { icon: Settings, label: 'Configurations', href: '/admin/settings' },
      ]
    }
  ],
  ca: [
    {
      label: 'Professional Portal',
      items: [
        { icon: Briefcase, label: 'My Practice', href: '/ca/dashboard' },
        { icon: Users, label: 'Client Registry', href: '/profiles' },
        { icon: ClipboardList, label: 'Work Ledger', href: '/ca/dashboard' },
      ]
    },
    {
      label: 'Tax Services',
      items: [
        { icon: Zap, label: 'Active Filings', href: '/ca/dashboard' },
        { icon: History, label: 'Filing History', href: '/reports' },
      ]
    }
  ],
  team_member: [
    {
      label: 'My Workspace',
      items: [
        { icon: Home, label: 'Team Hub', href: '/team/dashboard' },
        { icon: Layers, label: 'Assigned Tasks', href: '/team/dashboard' },
      ]
    },
    {
      label: 'Content Operations',
      items: [
        { icon: FileText, label: 'Blog Engine', href: '/admin/blog-management' },
        { icon: ImageIcon, label: 'Asset Library', href: '/admin/media-management' },
      ]
    }
  ],
  user: [
    {
      label: 'Workspace',
      items: [
        { icon: LayoutGrid, label: 'My Dashboard', href: '/dashboard' },
        { icon: ClipboardList, label: 'Active Filings', href: '/dashboard' },
        { icon: FolderOpen, label: 'Document Vault', href: '/documents' },
      ]
    },
    {
      label: 'Service Catalog',
      items: [
        { icon: Zap, label: 'New Filing', href: '/dashboard/services' },
        { icon: Heart, label: 'My Experts', href: '/experts' },
        { icon: CreditCard, label: 'Payments', href: '/pricing' },
      ]
    },
    {
      label: 'Account Control',
      items: [
        { icon: User, label: 'Account Settings', href: '/settings' },
      ]
    }
  ]
};

export function Layout({ children, title = 'Control Center' }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Get groups based on role, fallback to 'user'
  const roleGroups = navGroups[user?.role as keyof typeof navGroups] || navGroups.user;

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans selection:bg-blue-100 selection:text-blue-900">
      <TooltipProvider>
        {/* Sidebar - Single Patch Fixed Design */}
        <aside
          className={cn(
            'fixed left-0 top-0 h-full w-[260px] bg-white border-r border-slate-100 z-50 transform transition-all duration-300 ease-in-out shadow-sm',
            'lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Logo Section */}
            <div className="h-20 flex items-center px-8 mb-2">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs transition-all group-hover:bg-blue-600">
                  M
                </div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">MyeCA Portal</h2>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden ml-auto rounded-full hover:bg-slate-50"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4 text-slate-400" />
              </Button>
            </div>

            {/* Navigation - Categorized by Usage */}
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-6 pb-8">
                {roleGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-1">
                    <div className="px-4 py-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{group.label}</span>
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.href;
                        return (
                          <Link key={item.href} href={item.href}>
                            <div
                              className={cn(
                                'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group',
                                isActive
                                  ? 'bg-slate-50 text-slate-900 font-semibold shadow-sm border border-slate-100/50'
                                  : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-900'
                              )}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <Icon className={cn("h-[17px] w-[17px]", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-900")} />
                              <span className="text-[13px]">{item.label}</span>
                              {isActive && (
                                <div className="ml-auto w-1 h-3.5 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Shared Platform Links */}
                <div className="pt-4 border-t border-slate-50 space-y-1">
                   <div className="px-4 py-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Support</span>
                   </div>
                   <Link href="/help">
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer group">
                      <HelpCircle className="h-[17px] w-[17px] text-slate-400 group-hover:text-slate-900" />
                      <span className="text-[13px]">Knowledge Base</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer group">
                    <MessageSquare className="h-[17px] w-[17px] text-slate-400 group-hover:text-slate-900" />
                    <span className="text-[13px]">Direct Support</span>
                    <Badge variant="outline" className="ml-auto text-[9px] border-slate-100 bg-slate-50">Online</Badge>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Sidebar User Footer */}
            <div className="p-4 mt-auto border-t border-slate-50">
              <div className="p-3 rounded-2xl bg-slate-50/50 group transition-all hover:bg-white hover:shadow-sm hover:border-slate-100 border border-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold shadow-sm">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.firstName}</p>
                    <p className="text-[9px] font-medium text-slate-400 truncate uppercase tracking-tighter">{user?.role?.replace('_', ' ')}</p>
                  </div>
                  <Link href="/logout">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Top Navigation Bar */}
          <header className="h-20 flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-md z-30">
            <div className="flex items-center gap-6 flex-1 max-w-2xl">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full hover:bg-slate-50"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-slate-600" />
              </Button>
              <div className="relative group w-full hidden sm:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  placeholder="Search filings, documents or help..." 
                  className="w-full bg-slate-50/50 border-none focus-visible:ring-1 focus-visible:ring-blue-100 pl-11 h-11 rounded-xl text-[13px] transition-all hover:bg-slate-100/80"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40 group-focus-within:opacity-0 transition-opacity">
                   <kbd className="h-5 min-w-[20px] items-center justify-center rounded border bg-white px-1 font-sans text-[10px] font-medium text-slate-400 flex">
                      <Command className="h-2.5 w-2.5 mr-0.5" /> K
                   </kbd>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Wallet/Credits Info (Mimicking Attachment) */}
              <div className="hidden md:flex items-center gap-4 mr-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 group cursor-pointer transition-all hover:bg-blue-100/50">
                  <Wallet className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-bold text-blue-700">₹14,250.00</span>
                  <div className="h-3 w-px bg-blue-200 mx-1"></div>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Credits</span>
                </div>
                
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-100">
                  <Button variant="ghost" size="sm" className="h-7 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white hover:shadow-sm">Sandbox</Button>
                  <Button variant="ghost" size="sm" className="h-7 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white shadow-sm text-blue-600 border border-blue-50 font-bold">
                    <Sparkles className="h-3 w-3 mr-1.5 text-blue-500 fill-blue-500" />
                    Production
                  </Button>
                </div>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-500 hover:bg-slate-50">
                    <Bell className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>

              <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-105 transition-transform">
                {user?.firstName?.[0] || 'U'}
              </div>
            </div>
          </header>

          {/* Main Body Content */}
          <main className="flex-1 bg-[#FDFDFD]">
            <div className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
              {children}
            </div>
          </main>
          

        </div>
      </TooltipProvider>
    </div>
  );
}

