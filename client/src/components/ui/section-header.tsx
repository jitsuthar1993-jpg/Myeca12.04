import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type SectionHeaderProps = {
  icon?: LucideIcon;
  badge?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
  children?: React.ReactNode; // CTA or extra content below description
};

export function SectionHeader({
  icon: Icon,
  badge,
  title,
  highlight,
  subtitle,
  align = "center",
  className,
  children,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div className={cn("mb-6", isCenter ? "text-center" : "text-left", className)}>
      {badge ? (
        <div className={cn("type-meta mb-3 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 font-semibold uppercase text-blue-700")}
        >
          {Icon ? <Icon className="h-4 w-4 mr-2" /> : null}
          {badge}
        </div>
      ) : null}

      <h1 className={cn("type-page-title text-slate-900")}
      >
        {title}
        {highlight ? (
          <span className="text-brand-600"> {highlight}</span>
        ) : null}
      </h1>

      {subtitle ? (
        <p
          className={cn(
            "type-body mt-3 text-slate-600",
            isCenter ? "max-w-4xl mx-auto" : "max-w-3xl"
          )}
        >
          {subtitle}
        </p>
      ) : null}

      {children ? (
        <div className={cn("mt-4", isCenter ? "flex justify-center" : "")}>{children}</div>
      ) : null}
    </div>
  );
}

export default SectionHeader;
