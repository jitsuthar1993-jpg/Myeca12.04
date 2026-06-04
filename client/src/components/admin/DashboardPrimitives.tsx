import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "blue" | "emerald" | "amber" | "indigo" | "slate" | "red" | "violet";

const toneClasses: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  indigo: "bg-indigo-50 text-indigo-600",
  slate: "bg-slate-100 text-slate-600",
  red: "bg-red-50 text-red-600",
  violet: "bg-violet-50 text-violet-600",
};

type DashboardPageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
};

export function DashboardPageHeader({
  title,
  description,
  eyebrow,
  action,
  className,
}: DashboardPageHeaderProps) {
  return (
    <section className={cn("flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <p className="type-meta font-bold uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p>
        ) : null}
        <h1 className="type-page-title text-slate-950">{title}</h1>
        {description ? (
          <p className="type-body max-w-2xl font-medium text-slate-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </section>
  );
}

type DashboardMetricTileProps = {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  className?: string;
};

export function DashboardMetricTile({
  label,
  value,
  icon: Icon,
  tone = "blue",
  className,
}: DashboardMetricTileProps) {
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white p-4 shadow-none", className)}>
      <div className="flex items-center gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="type-meta font-bold uppercase text-slate-400">{label}</p>
          <p className="mt-1 truncate text-2xl font-bold text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

type DashboardPanelProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function DashboardPanel({
  children,
  title,
  description,
  action,
  className,
  contentClassName,
}: DashboardPanelProps) {
  return (
    <section className={cn("overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none", className)}>
      {(title || description || action) ? (
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title ? <h2 className="type-card-title text-slate-950">{title}</h2> : null}
            {description ? <p className="type-support mt-1 font-medium text-slate-500">{description}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn("p-0", contentClassName)}>{children}</div>
    </section>
  );
}

type DashboardToolbarProps = {
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function DashboardToolbar({ title, children, action, className }: DashboardToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="min-w-0">
        {title ? <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-900">{title}</h2> : null}
        {children}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}

type DashboardEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: DashboardEmptyStateProps) {
  return (
    <div className={cn("mx-auto max-w-sm px-4 py-10 text-center", className)}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-300">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      {description ? <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

type DashboardIconButtonProps = ComponentPropsWithoutRef<typeof Button> & {
  label: string;
};

export function DashboardIconButton({
  label,
  className,
  variant = "ghost",
  size = "icon",
  children,
  ...props
}: DashboardIconButtonProps) {
  return (
    <Button
      {...props}
      aria-label={label}
      variant={variant}
      size={size}
      className={cn("h-8 w-8 rounded-lg p-0 text-slate-400 hover:bg-blue-50 hover:text-blue-700", className)}
    >
      {children}
    </Button>
  );
}
