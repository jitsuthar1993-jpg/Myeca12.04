import { type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

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
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
          {icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700 md:h-10 md:w-10">
              {icon}
            </span>
          )}
          {eyebrow && <span>{eyebrow}</span>}
        </div>
      )}
      <div className="space-y-2">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm leading-6 text-slate-600 md:max-w-2xl md:text-base md:leading-7">
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
