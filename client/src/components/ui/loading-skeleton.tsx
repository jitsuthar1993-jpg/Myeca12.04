import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card" | "avatar" | "button";
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  lines = 1,
  animate = true,
  ...props
}: SkeletonProps) {
  const baseClasses = cn(
    "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800",
    "bg-[length:200%_100%]",
    animate && "animate-shimmer",
    className
  );

  const getVariantClasses = () => {
    switch (variant) {
      case "text":
        return "h-4 rounded w-full";
      case "circular":
        return "rounded-full";
      case "avatar":
        return "h-10 w-10 rounded-full";
      case "button":
        return "h-10 w-24 rounded-lg";
      case "card":
        return "h-32 w-full rounded-xl";
      default:
        return "rounded-lg";
    }
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, getVariantClasses())}
            style={{
              ...style,
              width: index === lines - 1 ? "60%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, getVariantClasses())}
      style={style}
      {...props}
    />
  );
}

// Pre-built skeleton layouts
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
      <div className="flex gap-2">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="50%" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
        >
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </div>
      ))}
    </div>
  );
}

export function CalculatorSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width="50%" />
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton variant="text" width="30%" />
            <Skeleton height={40} />
          </div>
        ))}
        <Skeleton variant="button" width="100%" height={44} />
      </div>
      
      {/* Result Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <Skeleton variant="text" width="40%" />
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 text-center">
          <Skeleton variant="text" width="30%" className="mx-auto mb-2" />
          <Skeleton height={48} width="60%" className="mx-auto" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex justify-between">
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="30%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="circular" width={40} height={40} />
            </div>
            <Skeleton height={32} width="60%" />
            <Skeleton variant="text" width="80%" className="mt-2" />
          </div>
        ))}
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton variant="text" width="40%" className="mb-6" />
          <Skeleton height={240} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton variant="text" width="40%" className="mb-6" />
          <Skeleton height={240} />
        </div>
      </div>
      
      {/* Table */}
      <TableSkeleton rows={5} />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <Skeleton height={40} width="30%" />
        <Skeleton variant="text" width="50%" />
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="40%" />
          </div>
          <Skeleton variant="button" />
        </div>
      ))}
    </div>
  );
}

