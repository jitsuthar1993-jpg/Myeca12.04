import { type ElementType, type ReactNode } from "react";
import { Link } from "wouter";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type MobilePrimitiveProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

export function MobileSection({
  as: Component = "section",
  children,
  className,
}: MobilePrimitiveProps) {
  return (
    <Component className={cn("px-4 py-6 md:px-0 md:py-0", className)}>
      {children}
    </Component>
  );
}

export function MobileCard({
  as: Component = "div",
  children,
  className,
}: MobilePrimitiveProps) {
  return (
    <Component
      className={cn(
        "min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:rounded-card md:p-6",
        className
      )}
    >
      {children}
    </Component>
  );
}

type MobilePageHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function MobilePageHeader({
  eyebrow,
  title,
  description,
  action,
  icon,
  className,
}: MobilePageHeaderProps) {
  return (
    <header className={cn("space-y-3 md:space-y-5", className)}>
      {(eyebrow || icon) && (
        <div className="type-meta flex items-center gap-2 font-semibold uppercase text-blue-700">
          {icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700 md:h-10 md:w-10">
              {icon}
            </span>
          )}
          {eyebrow && <span>{eyebrow}</span>}
        </div>
      )}
      <div className="space-y-2">
        <h1 className="type-page-title font-semibold text-slate-950">
          {title}
        </h1>
        {description && (
          <p className="type-support text-slate-600 md:max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </header>
  );
}

type MobileActionBarProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  className?: string;
};

export function MobileActionBar({ primary, secondary, className }: MobileActionBarProps) {
  return (
    <div
      className={cn(
        "grid gap-2 md:flex md:flex-wrap md:items-center md:gap-3",
        className
      )}
    >
      {primary}
      {secondary}
    </div>
  );
}

export type MobileNavItem = {
  icon: LucideIcon;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  testId?: string;
};

type MobileBottomNavProps = {
  items: MobileNavItem[];
  className?: string;
};

export function MobileBottomNav({ items, className }: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Mobile primary navigation"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-14px_34px_-28px_rgba(15,23,42,0.7)] backdrop-blur md:hidden",
        className,
      )}
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon className="h-5 w-5" />
              <span className="mt-1 max-w-full truncate text-[0.68rem] font-black leading-none">{item.label}</span>
            </>
          );
          const className = cn(
            "flex min-h-[52px] min-w-0 flex-col items-center justify-center rounded-lg px-1 text-slate-500 transition-colors",
            item.active ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 hover:text-slate-900",
          );

          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={className}
                data-testid={item.testId}
                aria-current={item.active ? "page" : undefined}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              className={className}
              data-testid={item.testId}
              aria-pressed={item.active || undefined}
              onClick={item.onClick}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

type MobileMoreAction = {
  icon: LucideIcon;
  label: string;
  href: string;
};

type MobileMoreSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: MobileMoreAction[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearchSubmit: () => void;
  userName: string;
  roleLabel: string;
};

export function MobileMoreSheet({
  open,
  onOpenChange,
  actions,
  searchTerm,
  onSearchTermChange,
  onSearchSubmit,
  userName,
  roleLabel,
}: MobileMoreSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-slate-200 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:hidden"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-base font-black text-slate-950">More workspace options</SheetTitle>
          <SheetDescription className="text-xs font-semibold text-slate-500">
            {userName} - {roleLabel}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="mobile-workspace-search" className="type-meta font-black uppercase text-slate-400">
              Search workspace
            </label>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                onSearchSubmit();
              }}
            >
              <input
                id="mobile-workspace-search"
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
                placeholder="Search filings, docs or help"
                className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                className="h-11 rounded-lg bg-blue-700 px-4 text-sm font-black text-white"
              >
                Search
              </button>
            </form>
          </div>

          <div className="grid gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex min-h-[48px] items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700"
                  onClick={() => onOpenChange(false)}
                >
                  <Icon className="h-4 w-4 text-blue-600" />
                  <span>{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
