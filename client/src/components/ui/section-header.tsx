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
        <div className={cn("inline-flex items-center rounded-full px-4 py-2 mb-3 bg-blue-100 text-blue-700")}
        >
          {Icon ? <Icon className="h-4 w-4 mr-2" /> : null}
          {badge}
        </div>
      ) : null}

      <h1 className={cn("text-4xl md:text-5xl font-bold text-gray-900 leading-tight")}
      >
        {title}
        {highlight ? (
          <span className="text-[#003087]"> {highlight}</span>
        ) : null}
      </h1>

      {subtitle ? (
        <p
          className={cn(
            "mt-3 text-lg text-gray-600",
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