// Admin Layout Component - Single File, Simple and Clean

import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Home, Users, BarChart3, FileText, Settings, LogOut, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: FileText, label: 'Blog Posts', href: '/admin/blog-management' },
  { icon: FileText, label: 'Categories', href: '/admin/categories-management' },
  { icon: FileText, label: 'Daily Updates', href: '/admin/updates-management' },
  { icon: ImageIcon, label: 'Media Library', href: '/admin/media-management' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function Layout({ children, title = 'Admin Dashboard' }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300',
          'lg:translate-x-0 lg:relative lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Admin Panel</h2>
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
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer',
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-4">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" />
                Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">{title}</h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

