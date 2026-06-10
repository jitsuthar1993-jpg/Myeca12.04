import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Command,
  FilePenLine,
  FileText,
  FolderOpen,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Search,
  Settings,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BrandLockup from '@/components/ui/brand-lockup';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { Input } from '@/components/ui/input';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { ROLE_NAV_GROUPS } from '@/lib/role-workspace';
import { getRoleHome, getRoleLabel, normalizeAppRole } from '@shared/app-roles';
import { useRoutePreload } from '@/hooks/use-route-preload';
import { MobileBottomNav, MobileMoreSheet, type MobileNavItem } from '@/components/mobile';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title = 'Workspace' }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { preloadOnHover } = useRoutePreload();
  const role = normalizeAppRole(user?.role);
  const roleGroups = ROLE_NAV_GROUPS[role];
  const roleHome = getRoleHome(role);
  const roleLabel = getRoleLabel(role);
  const isUserRole = role === 'user';
  const userName = user?.firstName || user?.email?.split('@')[0] || 'User';
  const isActivePath = (href: string) => location === href || location.startsWith(`${href}/`);
  const isDocumentGeneratorPath =
    location === '/documents/generator_page' || isActivePath('/documents/generator');
  const isWorkspaceNavItemActive = (href: string) =>
    href === '/documents'
      ? location === href
      : href === '/documents/generator'
        ? isDocumentGeneratorPath
        : isActivePath(href);

  const mobileNavItems: MobileNavItem[] = [
    { icon: LayoutGrid, label: 'Home', href: '/dashboard', active: isActivePath('/dashboard') && !isActivePath('/dashboard/services') },
    { icon: FileText, label: 'MY ITR', href: '/itr/filing', active: isActivePath('/itr/filing') },
    { icon: Zap, label: 'Services', href: '/dashboard/services', active: isActivePath('/dashboard/services') },
    { icon: FolderOpen, label: 'Docs', href: '/documents', active: isWorkspaceNavItemActive('/documents') },
    { icon: FilePenLine, label: 'Generator', href: '/documents/generator', active: isDocumentGeneratorPath },
    { icon: MoreHorizontal, label: 'More', onClick: () => setMoreOpen(true), active: moreOpen, testId: 'mobile-nav-more' },
  ];

  const moreActions = [
    { icon: Settings, label: 'Account', href: '/settings' },
    { icon: HelpCircle, label: 'Help', href: '/help' },
    { icon: MessageSquare, label: 'Support Request', href: '/expert-consultation' },
    { icon: LogOut, label: 'Sign Out', href: '/logout' },
  ];

  const submitSearch = () => {
    const query = searchTerm.trim();
    if (query) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-950 selection:bg-blue-100 selection:text-blue-900">
      <TooltipProvider>
        <aside
          className={cn(
            'fixed left-0 top-0 z-50 h-full w-64 transform border-r border-slate-200 bg-white transition-transform duration-200',
            'lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
              <Link href={roleHome} className="flex min-w-0 items-center">
                <BrandLockup
                  logoSize="sm"
                  wordmarkSize="sm"
                  subtitle="SMART TAX SOLUTIONS"
                  subtitleClassName="whitespace-nowrap text-[8px] tracking-[0.1em]"
                  className="min-w-0 gap-2"
                />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-9 w-9 rounded-lg lg:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 px-3 py-4">
              <div className="space-y-5">
                {roleGroups.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <p className="type-meta px-3 font-bold uppercase tracking-[0.12em] text-slate-400">
                      {group.label}
                    </p>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = isWorkspaceNavItemActive(item.href);
                      return (
                        <Link
                          key={`${group.label}-${item.label}-${item.href}`}
                          href={item.href}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <div
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                              isActive
                                ? 'border border-blue-100 bg-blue-50 text-blue-700'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                            )}
                            onClick={() => setSidebarOpen(false)}
                            onMouseEnter={() => preloadOnHover(item.href)}
                            onTouchStart={() => preloadOnHover(item.href)}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}

                <div className="space-y-1 border-t border-slate-200 pt-4">
                  <p className="type-meta px-3 font-bold uppercase tracking-[0.12em] text-slate-400">Support</p>
                  <Link href="/help">
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950">
                      <HelpCircle className="h-4 w-4 shrink-0" />
                      <span>Knowledge Base</span>
                    </div>
                  </Link>
                  <Link href="/expert-consultation">
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950">
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <span>Support Request</span>
                    </div>
                  </Link>
                </div>
              </div>
            </ScrollArea>

            <div className="border-t border-slate-200 p-3">
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-900 ring-1 ring-slate-200">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-0 truncate text-xs font-bold leading-tight text-slate-950">{user?.firstName || 'User'}</p>
                  <p className="type-meta mb-0 truncate font-medium leading-tight text-slate-500">{roleLabel}</p>
                </div>
                <Link href="/logout">
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg p-0 text-slate-500 hover:bg-red-50 hover:text-red-600">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-9 w-9 rounded-lg lg:hidden', isUserRole && 'hidden md:inline-flex')}
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden w-full max-w-xl sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search filings, documents, users or help"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        submitSearch();
                      }
                    }}
                    className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-10 text-sm"
                  />
                  <div className="type-meta pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 font-medium text-slate-400 md:flex">
                    <Command className="h-3 w-3" /> K
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-9 items-center gap-3">
              <p className="mb-0 hidden text-sm font-bold leading-none text-slate-700 md:block">{title}</p>
              <NotificationCenter />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">
                {userName[0] || 'U'}
              </div>
            </div>
          </header>

          <main
            data-testid="workspace-main-shell"
            className={cn(
              'flex-1 bg-slate-50',
              isUserRole && 'pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0',
            )}
          >
            <div className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>

        {isUserRole && (
          <>
            <MobileBottomNav items={mobileNavItems} />
            <MobileMoreSheet
              open={moreOpen}
              onOpenChange={setMoreOpen}
              actions={moreActions}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              onSearchSubmit={() => {
                submitSearch();
                setMoreOpen(false);
              }}
              userName={userName}
              roleLabel={roleLabel}
            />
          </>
        )}
      </TooltipProvider>
    </div>
  );
}
