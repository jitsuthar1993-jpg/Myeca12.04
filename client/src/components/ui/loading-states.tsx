// Advanced loading states and skeleton components
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rect' | 'circle' | 'button' | 'card' | 'avatar';
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  width, 
  height, 
  variant = 'text',
  animation = 'pulse',
  lines = 1 
}) => {
  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700',
    {
      'animate-pulse': animation === 'pulse',
      'animate-shimmer': animation === 'wave',
    },
    className
  );

  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return {
          width: width || '100%',
          height: height || '1rem',
          borderRadius: '0.25rem'
        };
      case 'rect':
        return {
          width: width || '100%',
          height: height || '4rem',
          borderRadius: '0.375rem'
        };
      case 'circle':
      case 'avatar':
        return {
          width: width || '3rem',
          height: height || '3rem',
          borderRadius: '50%'
        };
      case 'button':
        return {
          width: width || '8rem',
          height: height || '2.5rem',
          borderRadius: '0.375rem'
        };
      case 'card':
        return {
          width: width || '100%',
          height: height || '12rem',
          borderRadius: '0.5rem'
        };
      default:
        return {
          width: width || '100%',
          height: height || '1rem',
          borderRadius: '0.25rem'
        };
    }
  };

  const styles = getVariantStyles();

  if (lines > 1 && variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={baseClasses}
            style={{
              ...styles,
              width: i === lines - 1 ? '75%' : styles.width
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={styles}
    />
  );
};

// Advanced skeleton loaders for different components
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-4">
            <Skeleton variant="avatar" />
            <div className="flex-1 space-y-3">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" lines={2} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} variant="text" width="20%" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: cols }).map((_, j) => (
                <Skeleton key={j} variant="text" width="20%" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="space-y-4">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rect" height="200px" />
        <div className="flex justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" width="15%" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton variant="text" width="20%" />
        <Skeleton variant="text" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="20%" />
        <Skeleton variant="text" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" />
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" />
        </div>
      </div>
      <Skeleton variant="button" />
    </div>
  );
};

// Advanced loading wrapper
interface LoadingWrapperProps {
  isLoading: boolean;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minLoadingTime?: number;
  className?: string;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  skeleton,
  children,
  fallback,
  minLoadingTime = 0,
  className
}) => {
  const [showLoading, setShowLoading] = React.useState(isLoading);
  const [showContent, setShowContent] = React.useState(false);

  React.useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
      setShowContent(false);
      
      if (minLoadingTime > 0) {
        const timer = setTimeout(() => {
          if (!isLoading) {
            setShowLoading(false);
            setShowContent(true);
          }
        }, minLoadingTime);
        
        return () => clearTimeout(timer);
      }
    } else {
      setShowLoading(false);
      setTimeout(() => setShowContent(true), 100); // Small delay for smooth transition
    }
  }, [isLoading, minLoadingTime]);

  if (showLoading) {
    return (
      <div className={cn('relative', className)}>
        {skeleton || fallback}
      </div>
    );
  }

  return (
    <div className={cn('transition-opacity duration-300', className, {
      'opacity-0': !showContent,
      'opacity-100': showContent
    })}>
      {children}
    </div>
  );
};

// Progressive loading component
interface ProgressiveLoadingProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  children,
  placeholder,
  threshold = 0.1,
  rootMargin = '50px',
  className
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (placeholder || <Skeleton variant="rect" height="200px" />)}
    </div>
  );
};

// Staggered loading animation
interface StaggeredLoadingProps {
  children: React.ReactNode[];
  delay?: number;
  className?: string;
}

export const StaggeredLoading: React.FC<StaggeredLoadingProps> = ({
  children,
  delay = 100,
  className
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="animate-fade-in"
          style={{
            animationDelay: `${index * delay}ms`,
            animationFillMode: 'both'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Loading states for different scenarios
export const LoadingStates = {
  // Full page loading
  Page: ({ message = 'Loading...' }: { message?: string }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  ),

  // Section loading
  Section: ({ title = 'Loading section...' }: { title?: string }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      <CardSkeleton count={2} />
    </div>
  ),

  // Button loading
  Button: ({ children, isLoading }: { children: React.ReactNode; isLoading: boolean }) => (
    <button
      disabled={isLoading}
      className={cn(
        'relative inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      )}
      {children}
    </button>
  ),

  // Inline loading
  Inline: ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8'
    };

    return (
      <div className={cn('animate-spin rounded-full border-b-2 border-blue-600', sizeClasses[size])}></div>
    );
  }
};

// CSS animations for loading states
const loadingStyles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
  
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  
  .animate-shimmer {
    background: linear-gradient(
      90deg,
      #f0f0f0 0px,
      #e0e0e0 40px,
      #f0f0f0 80px
    );
    background-size: 1000px 100%;
    animation: shimmer 2s infinite linear;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = loadingStyles;
  document.head.appendChild(style);
}