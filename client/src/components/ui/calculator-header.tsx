import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type CalculatorHeaderProps = {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  color?: "blue" | "purple" | "green" | "orange" | "red" | "teal";
  align?: "center" | "left";
  className?: string;
};

const colorMap: Record<NonNullable<CalculatorHeaderProps["color"]>, string> = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
  green: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
  red: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
  teal: "bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400",
};

export function CalculatorHeader({
  icon: Icon,
  title,
  subtitle,
  color = "blue",
  align = "center",
  className,
}: CalculatorHeaderProps) {
  const colorClasses = colorMap[color] ?? colorMap.blue;

  return (
    <div className={cn("mb-6", align === "center" ? "text-center" : "text-left", className)}>
      {Icon ? (
        <div className={cn(
          "inline-flex items-center justify-center rounded-md p-2 mb-2",
          colorClasses
        )}>
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
      {subtitle ? (
        <p
          className={cn(
            "mt-1 text-sm md:text-base text-gray-600 dark:text-gray-400",
            align === "center" ? "max-w-2xl mx-auto" : undefined
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export default CalculatorHeader;