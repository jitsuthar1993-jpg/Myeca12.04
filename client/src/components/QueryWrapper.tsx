import React, { ReactNode } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { AlertCircle, RefreshCw, Loader2, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface QueryWrapperProps<T> {
  query: UseQueryResult<T, Error>;
  children: (data: T) => ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
  isEmpty?: (data: T) => boolean;
  skeleton?: 'card' | 'table' | 'list' | 'form' | 'custom';
  skeletonCount?: number;
}

// Default skeleton loaders
function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-5/6 mb-4" />
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <Skeleton className="h-4 w-full" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-b-0">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

// Error display component
interface ErrorDisplayProps {
  error: Error;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorDisplay({ error, onRetry, compact = false }: ErrorDisplayProps) {
  const isNetworkError = error.message.includes('network') || 
                         error.message.includes('fetch') ||
                         error.message.includes('Failed to fetch');
  const isServerError = error.message.includes('500') || 
                        error.message.includes('server');

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
        <span className="text-red-700 flex-1">{error.message}</span>
        {onRetry && (
          <Button size="sm" variant="ghost" onClick={onRetry} className="h-7 px-2">
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          {isNetworkError ? (
            <WifiOff className="h-6 w-6 text-red-600" />
          ) : isServerError ? (
            <ServerCrash className="h-6 w-6 text-red-600" />
          ) : (
            <AlertCircle className="h-6 w-6 text-red-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          {isNetworkError ? 'Connection Error' : 
           isServerError ? 'Server Error' : 
           'Something went wrong'}
        </h3>
        <p className="text-red-600 mb-4 text-sm">
          {isNetworkError ? 'Please check your internet connection and try again.' :
           isServerError ? 'Our servers are having issues. Please try again later.' :
           error.message || 'An unexpected error occurred.'}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Loading display component
interface LoadingDisplayProps {
  message?: string;
  compact?: boolean;
}

export function LoadingDisplay({ message = 'Loading...', compact = false }: LoadingDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">{message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

// Empty state component
interface EmptyDisplayProps {
  title?: string;
  message?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyDisplay({ 
  title = 'No data found', 
  message = 'There is nothing to display here yet.',
  action,
  icon
}: EmptyDisplayProps) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          {icon || <AlertCircle className="h-8 w-8 text-gray-400" />}
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{message}</p>
        {action}
      </CardContent>
    </Card>
  );
}

// Main QueryWrapper component
export function QueryWrapper<T>({
  query,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  isEmpty,
  skeleton = 'card',
  skeletonCount = 3,
}: QueryWrapperProps<T>) {
  const { data, isLoading, isError, error, refetch } = query;

  // Loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    switch (skeleton) {
      case 'table':
        return <TableSkeleton count={skeletonCount} />;
      case 'list':
        return <ListSkeleton count={skeletonCount} />;
      case 'form':
        return <FormSkeleton />;
      case 'card':
      default:
        return <CardSkeleton count={skeletonCount} />;
    }
  }

  // Error state
  if (isError) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    return <ErrorDisplay error={error} onRetry={() => refetch()} />;
  }

  // Empty state
  if (data && isEmpty?.(data)) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    return <EmptyDisplay />;
  }

  // Success state
  if (data) {
    return <>{children(data)}</>;
  }

  return null;
}

export default QueryWrapper;

