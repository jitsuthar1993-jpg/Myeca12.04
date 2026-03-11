import { ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  minHeight?: string;
  skeletonHeight?: string;
}

export function LazySection({
  children,
  fallback,
  className,
  threshold = 0.1,
  rootMargin = '100px',
  minHeight = '200px',
  skeletonHeight = '400px',
}: LazySectionProps) {
  const [targetRef, isVisible] = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: true,
  });

  return (
    <div
      ref={targetRef}
      className={cn('relative', className)}
      style={{ minHeight: isVisible ? undefined : minHeight }}
    >
      {isVisible ? (
        children
      ) : (
        fallback || (
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className={`w-full`} style={{ height: skeletonHeight }} />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )
      )}
    </div>
  );
}