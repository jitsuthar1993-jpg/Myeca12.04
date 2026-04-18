// Admin Layout Component - Single File, Simple and Clean

import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Home, Users, BarChart3, FileText, Settings, LogOut, Image as ImageIcon, Briefcase, User, FolderOpen, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const menuItems = [
  // Admin & Team Member Shared
  { icon: Home, label: 'Admin Hub', href: '/admin', roles: ['admin'] },
  { icon: Briefcase, label: 'Team Portal', href: '/team/dashboard', roles: ['admin', 'team_member'] },
  
  // Admin Only
  { icon: Users, label: 'Manage Users', href: '/admin/users', roles: ['admin'] },
  { icon: BarChart3, label: 'System Analytics', href: '/admin/analytics', roles: ['admin'] },
  { icon: Settings, label: 'Global Settings', href: '/admin/settings', roles: ['admin'] },
  
  // Content Management (Shared)
  { icon: FileText, label: 'Blog Management', href: '/admin/blog-management', roles: ['admin', 'team_member'] },
  { icon: ImageIcon, label: 'Media Assets', href: '/admin/media-management', roles: ['admin', 'team_member'] },
  
  // User Only
  { icon: Home, label: 'My Dashboard', href: '/dashboard', roles: ['user'] },
  { icon: User, label: 'My Profile', href: '/profile', roles: ['user'] },
  { icon: FolderOpen, label: 'My Documents', href: '/documents', roles: ['user'] },
  { icon: Heart, label: 'My Experts', href: '/experts', roles: ['user'] },
];

export function Layout({ children, title = 'Admin Panel' }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  
  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar - Premium Glassmorphism */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-72 bg-white/70 backdrop-blur-2xl border-r border-slate-200/50 z-50 transform transition-all duration-500 ease-in-out shadow-[20px_0_40px_rgba(0,0,0,0.02)]',
          'lg:translate-x-0 lg:relative lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-slate-100/50">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 font-bold text-white text-xl transition-transform group-hover:scale-110">
                M
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-800 uppercase group-hover:text-blue-600 transition-colors">MyeCA.in</h2>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-4 py-8">
            <div className="mb-4 px-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Main Menu</span>
            </div>
            <nav className="space-y-1.5">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'flex items-center gap-3.5 px-4 py-3 rounded-[18px] transition-all duration-300 cursor-pointer group mb-1',
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold'
                          : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-xl hover:shadow-black/[0.02]'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                      <span className="text-[14px] tracking-wide">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer Card */}
          <div className="p-6 border-t border-slate-100/50 bg-slate-50/50">
             <div className="bg-white/80 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-sm mb-4">
               <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Logged in as</p>
               <p className="text-sm font-bold text-slate-800 truncate">{user?.firstName} {user?.lastName}</p>
               <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100 mt-2 uppercase tracking-tight">
                  {user?.role}
               </span>
             </div>
            <Link href="/">
              <Button variant="outline" className="w-full justify-center gap-2 rounded-xl h-11 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold transition-all">
                <LogOut className="h-4 w-4" />
                Back to Portal
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 overflow-hidden">
        {/* Header - Modern Sticky */}
        <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-30 h-20 flex items-center shadow-sm shadow-black/[0.01]">
          <div className="flex items-center justify-between px-8 w-full">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden bg-slate-100 hover:bg-slate-200 rounded-xl"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
                <p className="text-xs text-slate-400 font-medium hidden sm:block">Manage your professional dashboard and services</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
                  <span className="text-sm font-bold text-slate-600">
                    {(user?.firstName && user?.lastName ? `${user.firstName[0]}${user.lastName[0]}` : 
                      user?.firstName ? user.firstName[0] : 'U').toUpperCase()}
                  </span>
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

