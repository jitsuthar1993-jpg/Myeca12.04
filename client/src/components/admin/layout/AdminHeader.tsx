// Admin Header Component

import { Menu, Bell, Search, RefreshCw, LogOut, ShieldCheck, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/AuthProvider';
import { getRoleLabel, normalizeAppRole } from '@shared/app-roles';

interface AdminHeaderProps {
  title?: string;
  description?: string;
  onMenuClick: () => void;
}

export function AdminHeader({ title = 'Dashboard Overview', description, onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'MyeCA Admin';
  const roleLabel = getRoleLabel(normalizeAppRole(user?.role));
  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-slate-200 bg-white lg:left-64">
      <div className="flex items-center justify-between px-4 py-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-600 hover:bg-slate-100"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
            {description && (
              <p className="hidden text-sm text-slate-500 sm:block">{description}</p>
            )}
          </div>
        </div>

        {/* Right toolbar */}
        <div className="flex items-center gap-2">
          {/* Global Search */}
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition-colors hover:bg-slate-100 md:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-48 border-0 bg-transparent text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Refresh Button */}
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="secondary"
            size="icon"
            className="relative border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-red-500"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-3 p-2 text-slate-700 hover:bg-slate-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                  {initials}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold">{fullName}</p>
                  <p className="text-xs text-slate-500">{roleLabel}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <span className="block">My Account</span>
                {user?.email && <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Role: <span className="ml-1">{roleLabel}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void logout("manual")} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
