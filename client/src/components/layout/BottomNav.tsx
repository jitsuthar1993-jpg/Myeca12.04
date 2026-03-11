import { Link, useLocation } from "wouter";
import { Home, Calculator, User, Rocket, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
  matchPaths?: string[];
  activeColor?: string;
}

export default function BottomNav() {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    {
      href: "/",
      icon: <Home className="w-5 h-5" />,
      label: "Home",
      matchPaths: ["/"],
    },
    {
      href: "/calculators",
      icon: <Calculator className="w-5 h-5" />,
      label: "Tools",
      matchPaths: ["/calculators", "/tax-optimizer"],
    },
    {
      href: "/startup-services",
      icon: <Rocket className="w-5 h-5" />,
      label: "Startup",
      matchPaths: ["/startup-services", "/startup"],
      activeColor: "purple",
      badge: (
        <div className="absolute -top-1 right-0 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
          <Sparkles className="w-2.5 h-2.5 text-white" />
        </div>
      ),
    },
    {
      href: "/auth/login",
      icon: <User className="w-5 h-5" />,
      label: "Account",
      matchPaths: ["/auth", "/dashboard", "/profile", "/settings"],
      badge: (
        <div className="absolute -top-0.5 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      ),
    },
  ];

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some(path => 
        path === "/" ? location === "/" : location.startsWith(path)
      );
    }
    return location === item.href;
  };

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:hidden",
        "bg-white backdrop-blur-none",
        "border-t border-gray-200/50",
        "shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]",
        "safe-area-pb"
      )}
    >
      <div className="grid grid-cols-4 gap-1 px-2 py-1.5">
        {navItems.map((item) => {
          const active = isActive(item);
          const colorClass = item.activeColor === "purple"
            ? active 
              ? "text-purple-600 bg-purple-50" 
              : "text-gray-500"
            : active 
              ? "text-blue-600 bg-blue-50" 
              : "text-gray-500";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2.5 px-2 rounded-xl",
                "transition-all duration-200 relative",
                "touch-manipulation active:scale-95",
                "min-h-[56px]",
                colorClass
              )}
            >
              {/* Badge */}
              {item.badge}
              
              {/* Icon */}
              <div className={cn(
                "mb-1 transition-transform duration-200",
                active && "scale-110"
              )}>
                {item.icon}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-xs font-medium transition-opacity",
                active ? "opacity-100" : "opacity-70"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* iOS safe area spacer */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
