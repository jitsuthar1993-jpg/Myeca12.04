// Admin Sidebar Navigation Component

import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  BarChart3,
  FileText,
  Settings,
  Activity,
  Shield,
  X,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/admin',
  },
  {
    icon: Users,
    label: 'Users',
    href: '/admin/users',
    badge: 12,
  },
  {
    icon: ShoppingBag,
    label: 'Services',
    href: '/admin/services',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    href: '/admin/analytics',
  },
  {
    icon: FileText,
    label: 'Content',
    href: '/admin/blog',
  },
  {
    icon: Activity,
    label: 'Activity',
    href: '/admin/audit-logs',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/admin/settings',
  },
];

export function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform border-r border-slate-200 bg-white text-slate-700 transition-transform duration-300',
          'lg:translate-x-0 lg:relative lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-900 p-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Admin Panel</h2>
                <p className="text-xs text-slate-500">Control Center</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || location.startsWith(item.href + '/');

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'group relative flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors',
                        isActive
                          ? 'bg-slate-100 text-slate-950'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className={cn(
                        'h-5 w-5 flex-shrink-0',
                        isActive && 'text-slate-950'
                      )} />
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge variant="secondary" className="border-0 bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                          {item.badge > 99 ? '99+' : item.badge}
                        </Badge>
                      )}
                      {isActive && (
                        <div className="absolute bottom-2 right-0 top-2 w-1 rounded-l-full bg-slate-900" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4">
            <Link href="/">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                <LogOut className="h-4 w-4" />
                <span>Back to Site</span>
              </Button>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
