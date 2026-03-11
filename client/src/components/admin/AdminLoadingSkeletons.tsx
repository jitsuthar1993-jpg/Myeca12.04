import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Admin Dashboard Layout Skeleton
export const AdminLayoutSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:w-64">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex-1 overflow-y-auto py-4 space-y-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="px-4 py-3 mx-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 lg:ml-0">
        {/* Header Skeleton */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-32 lg:hidden" />
              <Skeleton className="h-8 w-40 hidden lg:block" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </header>

        {/* Content Area Skeleton */}
        <main className="p-4 lg:p-6">
          <AdminDashboardSkeleton />
        </main>
      </div>
    </div>
  );
};

// Admin Dashboard Content Skeleton
export const AdminDashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
              <div className="mt-2">
                <Skeleton className="h-3 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Skeleton */}
        <Card className="border-gray-200">
          <CardHeader>
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full rounded" />
          </CardContent>
        </Card>

        {/* Service Distribution Skeleton */}
        <Card className="border-gray-200">
          <CardHeader>
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <Skeleton className="h-48 w-48 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Skeleton */}
        <Card className="border-gray-200 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Skeleton */}
        <Card className="border-gray-200">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                  <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
                  <Skeleton className="h-6 w-16 mx-auto mb-1" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-gray-200">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j}>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Widget-Specific Skeletons
export const RevenueWidgetSkeleton = () => (
  <Card className="h-full border-gray-200">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4 rounded" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-32 mb-2" />
      <div className="flex items-center gap-1 mt-1">
        <Skeleton className="h-3 w-3 rounded" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-3 w-28 mt-2" />
    </CardContent>
  </Card>
);

export const ChartWidgetSkeleton = ({ height = 300 }: { height?: number }) => (
  <Card className="h-full border-gray-200">
    <CardHeader>
      <Skeleton className="h-5 w-48 mb-2" />
      <Skeleton className="h-3 w-64" />
    </CardHeader>
    <CardContent>
      <Skeleton className="w-full rounded" style={{ height: `${height}px` }} />
    </CardContent>
  </Card>
);

export const ActivityWidgetSkeleton = () => (
  <Card className="h-full border-gray-200">
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Staggered Loading Wrapper
export const StaggeredSkeletonLoader: React.FC<{
  children: React.ReactNode;
  isLoading: boolean;
  skeleton: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, isLoading, skeleton, delay = 0, className }) => {
  const [showSkeleton, setShowSkeleton] = React.useState(true);

  React.useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(true);
    }
  }, [isLoading, delay]);

  if (isLoading || showSkeleton) {
    return <div className={cn("animate-fade-in", className)}>{skeleton}</div>;
  }

  return <div className={cn("animate-fade-in", className)}>{children}</div>;
};

// Progressive Loading Grid
export const ProgressiveGridSkeleton: React.FC<{
  columns?: number;
  items?: number;
  itemSkeleton?: React.ReactNode;
  className?: string;
}> = ({ 
  columns = 4, 
  items = 4, 
  itemSkeleton,
  className 
}) => {
  const defaultSkeleton = <Card className="h-full border-gray-200">
    <CardHeader>
      <Skeleton className="h-4 w-32" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-24 w-full" />
    </CardContent>
  </Card>;

  return (
    <div 
      className={cn(
        "grid gap-4",
        `grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`,
        className
      )}
    >
      {Array.from({ length: items }).map((_, i) => (
        <div 
          key={i}
          className="animate-fade-in"
          style={{ 
            animationDelay: `${i * 50}ms`,
            animationFillMode: 'both'
          }}
        >
          {itemSkeleton || defaultSkeleton}
        </div>
      ))}
    </div>
  );
};

// Loading Overlay for Admin Pages
export const AdminLoadingOverlay: React.FC<{
  isLoading: boolean;
  message?: string;
  transparent?: boolean;
}> = ({ isLoading, message = "Loading dashboard...", transparent = false }) => {
  if (!isLoading) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        transparent ? "bg-white/80 backdrop-blur-sm" : "bg-white"
      )}
    >
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-blue-600 animate-ping" />
          </div>
        </div>
        <p className="text-gray-600 text-sm font-medium">{message}</p>
        <div className="mt-2 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Optimized Loading with Suspense Boundary
export const AdminPageLoader: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showOverlay?: boolean;
  minLoadingTime?: number;
}> = ({ 
  isLoading, 
  children, 
  fallback,
  showOverlay = false,
  minLoadingTime = 0
}) => {
  const defaultFallback = <AdminLayoutSkeleton />;
  const [showContent, setShowContent] = React.useState(!isLoading);

  React.useEffect(() => {
    if (isLoading) {
      setShowContent(false);
    } else {
      // Add minimum loading time to prevent flash of content
      const timer = setTimeout(() => {
        setShowContent(true);
      }, minLoadingTime);
      return () => clearTimeout(timer);
    }
  }, [isLoading, minLoadingTime]);

  if (isLoading || !showContent) {
    if (showOverlay) {
      return (
        <>
          <div className="opacity-50 pointer-events-none">{children}</div>
          <AdminLoadingOverlay isLoading={true} />
        </>
      );
    }
    return <>{fallback || defaultFallback}</>;
  }

  return <div className="animate-fade-in">{children}</div>;
};

