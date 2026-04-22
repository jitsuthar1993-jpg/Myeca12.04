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

interface AdminHeaderProps {
  title?: string;
  description?: string;
  onMenuClick: () => void;
}

export function AdminHeader({ title = 'Dashboard Overview', description, onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'MyeCA Admin';
  const role = user?.role || 'admin';
  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-[#315efb] fixed top-0 left-0 right-0 z-30 lg:left-64 shadow-lg">
      <div className="flex items-center justify-between px-4 py-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/20"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {description && (
              <p className="text-sm text-white/75 hidden sm:block">{description}</p>
            )}
          </div>
        </div>

        {/* Right toolbar */}
        <div className="flex items-center gap-2">
          {/* Global Search */}
          <div className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors">
            <Search className="h-4 w-4 text-white" />
            <Input
              type="search"
              placeholder="Search..."
              className="bg-transparent border-0 text-white placeholder:text-blue-200 focus-visible:ring-0 focus-visible:ring-offset-0 w-48"
            />
          </div>

          {/* Refresh Button */}
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-indigo-600"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-3 text-white hover:bg-white/20 p-2"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/30">
                  {initials}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold">{fullName}</p>
                  <p className="text-xs text-blue-100 capitalize">{role.replace("_", " ")}</p>
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
                Role: <span className="ml-1 capitalize">{role.replace("_", " ")}</span>
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
