import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Mobile-Optimized Button Component
 * 
 * Fixes text overflow issues on mobile devices by:
 * - Preventing text from going outside button boundaries
 * - Maintaining 48x48px touch target compliance
 * - Providing responsive text sizing
 * - Allowing text wrapping when needed
 */

export interface MobileOptimizedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  touchTargetSize?: number;
  allowTextWrap?: boolean;
  mobileTextSize?: 'sm' | 'base' | 'lg';
}

const MobileOptimizedButton = React.forwardRef<
  HTMLButtonElement,
  MobileOptimizedButtonProps
>(
  ({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    children,
    loading = false,
    loadingText = 'Loading...',
    touchTargetSize = 48,
    allowTextWrap = true,
    mobileTextSize = 'base',
    disabled,
    ...props
  }, ref) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
      const checkScreenSize = () => {
        setIsMobile(window.innerWidth <= 768);
        setIsSmallScreen(window.innerWidth <= 375);
      };

      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Mobile-optimized base styles
    const baseStyles = cn(
      'inline-flex items-center justify-center',
      'gap-2 rounded-lg font-medium',
      'transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      {
        // Fix text overflow issues
        'whitespace-normal': allowTextWrap,
        'whitespace-nowrap': !allowTextWrap,
        'overflow-wrap-break-word': allowTextWrap,
        'break-words': allowTextWrap,
        
        // Ensure proper text alignment
        'text-center': true,
        'text-left': !isMobile,
        
        // Prevent text clipping
        'overflow-hidden': !allowTextWrap,
        'text-ellipsis': !allowTextWrap,
      }
    );

    // Mobile-optimized size styles
    const sizeStyles = cn({
      // Default size - mobile optimized
      'h-auto min-h-[48px] px-4 py-3 text-base': size === 'default' && isMobile,
      'h-10 px-4 py-2 text-sm': size === 'default' && !isMobile,
      
      // Small size - still meets touch targets
      'h-auto min-h-[48px] px-3 py-2 text-sm': size === 'sm' && isMobile,
      'h-9 px-3 py-1.5 text-sm': size === 'sm' && !isMobile,
      
      // Large size - mobile optimized
      'h-auto min-h-[56px] px-6 py-4 text-lg': size === 'lg' && isMobile,
      'h-11 px-8 py-3 text-lg': size === 'lg' && !isMobile,
      
      // Icon size - maintains touch target
      'h-auto min-h-[48px] w-auto min-w-[48px] p-2': size === 'icon' && isMobile,
      'h-10 w-10 p-2': size === 'icon' && !isMobile,
    });

    // Mobile-optimized text size
    const textStyles = cn({
      'text-sm': mobileTextSize === 'sm' || (isSmallScreen && size !== 'lg'),
      'text-base': mobileTextSize === 'base' || (!isSmallScreen && size === 'default'),
      'text-lg': mobileTextSize === 'lg' || (size === 'lg' && !isSmallScreen),
      'text-xl': size === 'lg' && !isMobile,
    });

    // Variant styles - mobile optimized
    const variantStyles = cn({
      'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800':
        variant === 'default',
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800':
        variant === 'destructive',
      'border-2 border-blue-600 bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100':
        variant === 'outline',
      'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300':
        variant === 'secondary',
      'hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200':
        variant === 'ghost',
      'text-blue-600 underline-offset-4 hover:underline active:text-blue-700':
        variant === 'link',
    });

    // Loading state styles
    const loadingStyles = cn({
      'relative': loading,
      'opacity-75': loading,
    });

    // Combine all styles
    const buttonStyles = cn(
      baseStyles,
      sizeStyles,
      textStyles,
      variantStyles,
      loadingStyles,
      className
    );

    // Handle loading state
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading) {
        e.preventDefault();
        return;
      }
      props.onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={buttonStyles}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <span className="mr-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        
        <span className={cn('flex-1', { 'opacity-0': loading })}>
          {loading ? loadingText : children}
        </span>
      </button>
    );
  }
);

MobileOptimizedButton.displayName = 'MobileOptimizedButton';

export default MobileOptimizedButton;

/**
 * Utility hook for mobile button optimization
 */
export const useMobileButtonOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallScreen(window.innerWidth <= 375);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return {
    isMobile,
    isSmallScreen,
    touchTargetSize: 48,
    mobileTextSize: isSmallScreen ? 'sm' : 'base',
  };
};

/**
 * CSS classes for fixing existing button overflow issues
 */
export const mobileButtonFixClasses = {
  // Fix text overflow
  textOverflowFix: 'whitespace-normal break-words text-center',
  
  // Ensure touch target compliance
  touchTargetFix: 'h-auto min-h-[48px] min-w-[48px]',
  
  // Mobile-optimized padding
  mobilePadding: 'px-4 py-3',
  
  // Mobile-optimized text size
  mobileText: 'text-sm sm:text-base',
  
  // Complete mobile button fix
  completeFix: cn(
    'whitespace-normal break-words text-center',
    'h-auto min-h-[48px] min-w-[48px]',
    'px-4 py-3',
    'text-sm sm:text-base'
  ),
};

/**
 * Function to fix existing button classes
 */
export const fixMobileButtonClasses = (className: string): string => {
  // Remove problematic classes
  let fixedClasses = className
    .replace(/\bh-9\b/g, '') // Remove fixed height
    .replace(/\bwhitespace-nowrap\b/g, '') // Remove nowrap
    .replace(/\bpy-4\b/g, 'py-3') // Reduce padding on mobile
    .replace(/\btext-lg\b/g, 'text-base sm:text-lg'); // Scale text

  // Add mobile-optimized classes
  return cn(
    fixedClasses,
    'h-auto min-h-[48px]', // Ensure touch target
    'whitespace-normal break-words', // Allow text wrapping
    'text-center', // Center text
    'px-4 py-3', // Mobile-optimized padding
    'text-sm sm:text-base' // Responsive text size
  );
};