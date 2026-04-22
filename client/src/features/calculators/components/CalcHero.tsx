import React from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "wouter";
import { Home } from "lucide-react";

interface CalcHeroProps {
  title: string;
  description?: string;
  category?: string;
  icon?: React.ReactNode;
  variant?: "blue" | "emerald" | "indigo" | "violet" | "amber";
  breadcrumbItems?: { name: string; href?: string }[];
  hideBreadcrumbs?: boolean;
}

const variantStyles = {
  blue: "from-blue-500/10 via-transparent to-transparent text-blue-600",
  emerald: "from-emerald-500/10 via-transparent to-transparent text-emerald-600",
  indigo: "from-indigo-500/10 via-transparent to-transparent text-indigo-600",
  violet: "from-violet-500/10 via-transparent to-transparent text-violet-600",
  amber: "from-amber-500/10 via-transparent to-transparent text-amber-600",
};

export default function CalcHero({ 
  title, 
  description, 
  category, 
  icon, 
  variant = "blue",
  breadcrumbItems = [],
  hideBreadcrumbs = false
}: CalcHeroProps) {
  return (
    <div className="relative pt-8 pb-12 overflow-hidden">
      {/* Background Aura */}
      <div className={cn(
        "absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b blur-[120px] -z-10 opacity-60",
        variantStyles[variant].split(" ").slice(0, 3).join(" ")
      )} />

      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumbs */}
        {!hideBreadcrumbs && (
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="flex items-center gap-1">
                    <Home className="h-3.5 w-3.5" />
                    <span>Home</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/calculators">Calculators</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbItems.map((item, i) => (
                <React.Fragment key={i}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.name}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.name}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {icon && (
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100",
                  variantStyles[variant].split(" ").pop()
                )}>
                  {icon}
                </div>
              )}
              <div className="space-y-1">
                {category && (
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.2em]",
                    variantStyles[variant].split(" ").pop()
                  )}>
                    {category}
                  </span>
                )}
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                  {title}
                </h1>
              </div>
            </div>
            {description && (
              <p className="text-slate-500 max-w-2xl text-lg font-medium leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
