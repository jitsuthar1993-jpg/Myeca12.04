import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, Settings, Users, BarChart3, FileText, HelpCircle, Home, Briefcase, BookOpen, Edit } from "lucide-react";
import Logo from "@/components/ui/logo";
import { useAuth } from "@/components/AuthProvider";
import { DailyUpdatesBanner } from "@/components/DailyUpdatesBanner";

export default function HeaderNew() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  let user = null;
  let isAuthenticated = false;
  let logout = () => {};
  
  try {
    const auth = useAuth();
    user = auth.user;
    isAuthenticated = auth.isAuthenticated;
    logout = auth.logout;
  } catch (error) {
    // AuthProvider not available, use defaults
  }

  const isActive = (path: string) => location === path;

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (user?.role === 'admin') {
      return [
        { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/services', label: 'Services', icon: Briefcase },
        { href: '/admin/blog', label: 'Blog', icon: Edit },
        { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      ];
    } else if (isAuthenticated) {
      return [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/itr/form-selector', label: 'My ITR', icon: FileText },
        { href: '/documents', label: 'Documents', icon: FileText },
        { href: '/services', label: 'Services', icon: Briefcase },
        { href: '/support', label: 'Support', icon: HelpCircle },
      ];
    } else {
      return [
        { href: '/services', label: 'Services', icon: Briefcase },
        { href: '/calculators', label: 'Calculators', icon: BarChart3 },
        { href: '/blog', label: 'Blog', icon: BookOpen },

      ];
    }
  };

  const navItems = getNavigationItems();

  return (
    <>
      <DailyUpdatesBanner />
      <header className="sticky top-0 z-50 bg-white border-b border-[var(--color-primary-100)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group focus:outline-none focus:ring-0">
            <div className="transition-all duration-300 transform group-hover:scale-105">
              <Logo size="md" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[var(--color-primary-900)] group-hover:text-[var(--color-accent-600)] transition-colors duration-300">
                MyeCA.in
              </span>
            </div>
          </Link>

          {/* Prominent Startup Button in Center */}
          <Link href="/startup-services" className="hidden md:block">
            <Button 
              size="lg" 
              className="bg-gradient-accent text-white shadow-lg transform hover:scale-105 transition-all duration-300 px-6 py-3"
            >
              <span className="flex items-center gap-2 font-semibold">
                🚀 Startup Services
              </span>
            </Button>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`flex items-center space-x-2 text-base font-medium transition-colors duration-200 ${
                isActive(item.href) ? 'text-[var(--color-accent-600)]' : 'text-[var(--color-primary-700)] hover:text-[var(--color-accent-600)]'
              }`}>
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user?.firstName || user?.email || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-white text-[var(--color-primary-900)] border border-[var(--color-primary-200)] shadow-xl ring-1 ring-black/5"
                >
                  {user?.role === 'admin' ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-[var(--color-primary-700)] hover:bg-[var(--color-accent-50)] hover:text-[var(--color-accent-600)] focus:bg-[var(--color-accent-50)] focus:text-[var(--color-accent-700)] transition-colors">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/settings" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-[var(--color-primary-700)] hover:bg-[var(--color-accent-50)] hover:text-[var(--color-accent-600)] focus:bg-[var(--color-accent-50)] focus:text-[var(--color-accent-700)] transition-colors">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profiles" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors">
                          <Users className="h-4 w-4 mr-2" />
                          Profiles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/documents" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors">
                          <FileText className="h-4 w-4 mr-2" />
                          Documents
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-[var(--color-primary-700)] hover:bg-[var(--color-accent-50)] hover:text-[var(--color-accent-600)] focus:bg-[var(--color-accent-50)] focus:text-[var(--color-accent-700)] transition-colors cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" className="h-11 w-11 p-0 flex items-center justify-center">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-6">
                {/* Prominent Startup Button for Mobile */}
                <Link href="/startup-services" onClick={() => setIsOpen(false)}>
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-accent text-white shadow-lg mb-4 h-12"
                  >
                    <span className="flex items-center justify-center gap-2 font-semibold">
                      🚀 Startup Services
                    </span>
                  </Button>
                </Link>
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={`flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href) 
                      ? 'bg-[var(--color-accent-50)] text-[var(--color-accent-600)]' 
                      : 'text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-900)]'
                  }`}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                <div className="border-t pt-4 mt-4">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Logged in as {user?.email}
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-3 rounded-md text-base font-medium text-[var(--color-error-600)] hover:bg-[var(--color-error-50)] transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">Login</Button>
                      </Link>
                      <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Sign Up</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    </>
  );
}