/**
 * Mobile Button Text Overflow Fix Utility
 * 
 * Provides functions to fix button text overflow issues on mobile devices
 * where text goes outside button boundaries due to conflicting CSS classes.
 */

import { cn } from '@/lib/utils';

/**
 * Common problematic class combinations that cause text overflow
 */
export const PROBLEMATIC_BUTTON_COMBINATIONS = [
  'h-9 py-4 text-lg',      // Fixed height + large padding + large text
  'whitespace-nowrap text-lg', // No text wrapping + large text
  'h-9 text-lg w-full',    // Fixed height + large text + full width
  'py-4 px-4 text-lg',     // Large padding + large text
];

/**
 * Mobile-optimized button class fixes
 */
export const MOBILE_BUTTON_FIXES = {
  // Remove problematic classes
  remove: [
    'h-9',                    // Fixed height that conflicts with padding
    'whitespace-nowrap',      // Prevents text wrapping
    'py-4',                   // Excessive vertical padding on mobile
    'text-lg',                // Too large for mobile buttons
  ],
  
  // Add mobile-optimized classes
  add: [
    'h-auto',                 // Auto height based on content
    'min-h-[48px]',          // Touch target compliance (48px minimum)
    'whitespace-normal',     // Allow text wrapping
    'break-words',           // Break long words
    'text-center',           // Center text alignment
    'py-3',                  // Reduced vertical padding
    'px-4',                  // Standard horizontal padding
    'text-sm',               // Mobile-optimized text size
    'sm:text-base',          // Larger text on tablets/desktop
    'leading-tight',         // Tighter line height
  ],
};

/**
 * Fix button classes for mobile optimization
 */
export function fixMobileButtonClasses(className: string): string {
  if (!className) return '';
  
  // Remove problematic classes
  let cleanedClasses = className;
  MOBILE_BUTTON_FIXES.remove.forEach(badClass => {
    const regex = new RegExp(`\\b${badClass}\\b`, 'g');
    cleanedClasses = cleanedClasses.replace(regex, '');
  });
  
  // Add mobile-optimized classes
  const optimizedClasses = cn(
    cleanedClasses,
    ...MOBILE_BUTTON_FIXES.add
  );
  
  return optimizedClasses.trim();
}

/**
 * Check if button classes need mobile optimization
 */
export function needsMobileButtonFix(className: string): boolean {
  if (!className) return false;
  
  return PROBLEMATIC_BUTTON_COMBINATIONS.some(combination => {
    const classes = combination.split(' ');
    return classes.every(cls => className.includes(cls));
  });
}

/**
 * Apply mobile button fix to a React component's className
 */
export function applyMobileButtonFix(
  className: string | undefined,
  forceFix: boolean = false
): string {
  if (!className) return '';
  
  // Always apply fix if force is true, otherwise check if needed
  if (forceFix || needsMobileButtonFix(className)) {
    return fixMobileButtonClasses(className);
  }
  
  return className;
}

/**
 * CSS-in-JS styles for mobile button optimization
 */
export const mobileButtonStyles = {
  // Base mobile button styles
  base: {
    height: 'auto',
    minHeight: '48px',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    textAlign: 'center' as const,
    padding: '0.75rem 1rem', // py-3 px-4
    fontSize: '0.875rem', // text-sm
    lineHeight: '1.25',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Tablet and up styles
  tablet: {
    fontSize: '1rem', // text-base
    padding: '0.5rem 1rem', // py-2 px-4
  },
  
  // Touch feedback
  touch: {
    transition: 'transform 0.1s ease-out',
    ':active': {
      transform: 'scale(0.95)',
    },
  },
};

/**
 * Hook for mobile button optimization
 */
export function useMobileButtonOptimization() {
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
    shouldApplyFix: (className: string) => isMobile && needsMobileButtonFix(className),
    applyFix: (className: string) => isMobile ? fixMobileButtonClasses(className) : className,
  };
}

/**
 * Utility to create mobile-optimized button classes
 */
export function createMobileButtonClasses(options: {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  fullWidth?: boolean;
  allowTextWrap?: boolean;
  mobileTextSize?: 'sm' | 'base' | 'lg';
} = {}): string {
  const {
    variant = 'default',
    size = 'default',
    fullWidth = false,
    allowTextWrap = true,
    mobileTextSize = 'base',
  } = options;

  const baseClasses = [
    'inline-flex items-center justify-center',
    'gap-2 rounded-lg font-medium',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'h-auto min-h-[48px] min-w-[48px]', // Touch target compliance
    fullWidth ? 'w-full' : '',
    allowTextWrap ? 'whitespace-normal break-words text-center' : 'whitespace-nowrap',
  ];

  // Size-specific classes
  const sizeClasses = {
    sm: ['px-3 py-2', 'text-sm'],
    default: ['px-4 py-3', mobileTextSize === 'sm' ? 'text-sm' : 'text-sm sm:text-base'],
    lg: ['px-6 py-4', mobileTextSize === 'lg' ? 'text-lg' : 'text-base sm:text-lg'],
  }[size];

  // Variant-specific classes
  const variantClasses = {
    default: ['bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'],
    outline: ['border-2 border-blue-600 bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100'],
    ghost: ['hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'],
    destructive: ['bg-red-600 text-white hover:bg-red-700 active:bg-red-800'],
  }[variant];

  return cn(...baseClasses, ...sizeClasses, ...variantClasses);
}

/**
 * Debug utility to identify button text overflow issues
 */
export function debugButtonOverflow(): void {
  if (typeof window === 'undefined') return;

  const buttons = document.querySelectorAll('button, [role="button"], .btn');
  const problematicButtons: Element[] = [];

  buttons.forEach((button) => {
    const className = button.className;
    if (needsMobileButtonFix(className)) {
      problematicButtons.push(button);
      
      // Add debug styling
      (button as HTMLElement).style.outline = '2px solid red';
      (button as HTMLElement).style.outlineOffset = '2px';
      
      console.warn('Button with potential text overflow:', {
        element: button,
        className: className,
        suggestedFix: fixMobileButtonClasses(className),
      });
    }
  });

  if (problematicButtons.length > 0) {
    console.warn(`Found ${problematicButtons.length} buttons with potential text overflow issues`);
  }
}

/**
 * Auto-fix all buttons on the page
 */
export function autoFixAllButtons(): void {
  if (typeof window === 'undefined') return;

  const buttons = document.querySelectorAll('button, [role="button"], .btn');
  let fixedCount = 0;

  buttons.forEach((button) => {
    const originalClassName = button.className;
    if (needsMobileButtonFix(originalClassName)) {
      const fixedClassName = fixMobileButtonClasses(originalClassName);
      button.className = fixedClassName;
      fixedCount++;
      
      console.log('Fixed button text overflow:', {
        original: originalClassName,
        fixed: fixedClassName,
      });
    }
  });

  if (fixedCount > 0) {
    console.log(`Auto-fixed ${fixedCount} buttons with text overflow issues`);
  }
}