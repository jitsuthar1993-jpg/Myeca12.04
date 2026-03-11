import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

/**
 * Mobile-optimized React components with proper touch targets,
 * responsive design, and accessibility features.
 */

// Touch target minimum size constants
const MIN_TOUCH_TARGET = 48; // pixels
const MIN_TOUCH_SPACING = 8; // pixels between touch targets

/**
 * Hook to detect mobile device and screen characteristics
 */
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerWidth < window.innerHeight ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenWidth(width);
      setScreenHeight(height);
      setIsMobile(width <= 768);
      setOrientation(width < height ? 'portrait' : 'landscape');
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return {
    isMobile,
    screenWidth,
    screenHeight,
    orientation,
    isSmallScreen: screenWidth <= 375,
    isTablet: screenWidth > 600 && screenWidth <= 1024,
  };
};

/**
 * Hook to handle touch events with proper feedback
 */
export const useTouchFeedback = () => {
  const [touchState, setTouchState] = useState<'idle' | 'touching' | 'released'>('idle');

  const touchHandlers = {
    onTouchStart: useCallback(() => setTouchState('touching'), []),
    onTouchEnd: useCallback(() => {
      setTouchState('released');
      setTimeout(() => setTouchState('idle'), 150);
    }, []),
    onTouchCancel: useCallback(() => setTouchState('idle'), []),
  };

  return { touchState, touchHandlers };
};

/**
 * Optimized button component with proper touch targets
 */
export interface OptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  touchTargetSize?: number;
}

export const OptimizedButton: React.FC<OptimizedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  touchTargetSize = MIN_TOUCH_TARGET,
  className,
  disabled,
  ...props
}) => {
  const { touchState, touchHandlers } = useTouchFeedback();
  const { isMobile } = useMobileDetection();

  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-150',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
    'select-none touch-manipulation',
    {
      'w-full': fullWidth,
      'opacity-50 cursor-not-allowed': disabled || loading,
      'active:scale-95': touchState === 'touching',
      'hover:scale-105': touchState === 'released',
    },
    className
  );

  const sizeClasses = cn({
    'px-3 py-2 text-sm': size === 'sm',
    'px-4 py-3 text-base': size === 'md',
    'px-6 py-4 text-lg': size === 'lg',
  });

  const variantClasses = cn({
    'bg-primary text-white hover:bg-primary-dark focus:ring-primary': variant === 'primary',
    'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary': variant === 'secondary',
    'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary': variant === 'outline',
    'text-primary hover:bg-primary-light focus:ring-primary': variant === 'ghost',
  });

  // Ensure minimum touch target size
  const touchTargetClasses = isMobile
    ? `min-w-[${touchTargetSize}px] min-h-[${touchTargetSize}px]`
    : '';

  return (
    <button
      className={cn(baseClasses, sizeClasses, variantClasses, touchTargetClasses)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...touchHandlers}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * Optimized input component with proper touch targets and validation
 */
export interface OptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  touchTargetSize?: number;
  currency?: boolean;
  maxValue?: number;
  minValue?: number;
}

export const OptimizedInput: React.FC<OptimizedInputProps> = ({
  label,
  error,
  helperText,
  touchTargetSize = MIN_TOUCH_TARGET,
  currency = false,
  maxValue,
  minValue = 0,
  className,
  type = 'text',
  value,
  onChange,
  ...props
}) => {
  const { isMobile } = useMobileDetection();
  const [inputValue, setInputValue] = useState(value?.toString() || '');
  const [isValid, setIsValid] = useState(true);

  // Validate input
  useEffect(() => {
    if (inputValue) {
      const numValue = parseFloat(inputValue.replace(/[^\d.]/g, ''));
      if (currency && (isNaN(numValue) || numValue < minValue || (maxValue && numValue > maxValue))) {
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    } else {
      setIsValid(true);
    }
  }, [inputValue, currency, minValue, maxValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    if (currency) {
      // Only allow numbers and decimal points
      newValue = newValue.replace(/[^\d.]/g, '');
      // Ensure only one decimal point
      const parts = newValue.split('.');
      if (parts.length > 2) {
        newValue = parts[0] + '.' + parts.slice(1).join('');
      }
    }
    
    setInputValue(newValue);
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          value: newValue,
        },
      });
    }
  };

  const touchTargetClasses = isMobile
    ? `min-h-[${touchTargetSize}px]`
    : 'min-h-[40px]';

  return (
    <div className="space-y-2">
      <label htmlFor={label} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {currency && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">\u20B9</span>
          </div>
        )}
        <input
          id={label}
          type={type}
          value={currency ? inputValue : value}
          onChange={handleChange}
          className={cn(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm',
            touchTargetClasses,
            'px-3 py-2 text-base',
            {
              'pl-8': currency,
              'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500': error || !isValid,
            },
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${label}-error` : helperText ? `${label}-description` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${label}-error`} role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500" id={`${label}-description`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

/**
 * Optimized select dropdown component
 */
export interface OptimizedSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  helperText?: string;
  touchTargetSize?: number;
}

export const OptimizedSelect: React.FC<OptimizedSelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
  touchTargetSize = MIN_TOUCH_TARGET,
}) => {
  const { isMobile } = useMobileDetection();
  const [isOpen, setIsOpen] = useState(false);

  const touchTargetClasses = isMobile
    ? `min-h-[${touchTargetSize}px]`
    : 'min-h-[40px]';

  return (
    <div className="space-y-2">
      <label htmlFor={label} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          id={label}
          className={cn(
            'relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm',
            touchTargetClasses,
            {
              'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500': error,
            }
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          aria-invalid={error ? 'true' : 'false'}
        >
          <span className="block truncate">
            {options.find(opt => opt.value === value)?.label || 'Select an option'}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <ul
            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            tabIndex={-1}
            role="listbox"
          >
            {options.map((option) => (
              <li
                key={option.value}
                className={cn(
                  'cursor-default select-none relative py-2 pl-3 pr-9',
                  {
                    'text-white bg-primary': option.value === value,
                    'text-gray-900': option.value !== value,
                  }
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={option.value === value}
              >
                <span className={cn('block truncate', { 'font-semibold': option.value === value })}>
                  {option.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${label}-error`} role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500" id={`${label}-description`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

/**
 * Optimized card component with proper spacing and elevation
 */
export interface OptimizedCardProps {
  children: React.ReactNode;
  elevation?: 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const OptimizedCard: React.FC<OptimizedCardProps> = ({
  children,
  elevation = 'md',
  padding = 'md',
  className,
}) => {
  const elevationClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  }[elevation];

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200',
        elevationClasses,
        paddingClasses,
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Responsive layout wrapper that adapts to screen size
 */
export interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
}) => {
  const { isMobile, isSmallScreen, isTablet } = useMobileDetection();

  const containerClasses = cn(
    'mx-auto px-4 py-6',
    {
      'max-w-sm': isSmallScreen,
      'max-w-md': isMobile && !isSmallScreen,
      'max-w-lg': isTablet,
      'max-w-xl': !isMobile && !isTablet,
    },
    className
  );

  return (
    <div className={containerClasses}>
      <div className="space-y-6">{children}</div>
    </div>
  );
};

/**
 * Mobile-optimized switch/toggle component
 */
export interface OptimizedSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  touchTargetSize?: number;
}

export const OptimizedSwitch: React.FC<OptimizedSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  touchTargetSize = MIN_TOUCH_TARGET,
}) => {
  const { isMobile } = useMobileDetection();
  const { touchState, touchHandlers } = useTouchFeedback();

  const touchTargetClasses = isMobile
    ? `min-h-[${touchTargetSize}px]`
    : 'min-h-[44px]';

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200',
        touchTargetClasses,
        {
          'opacity-50 cursor-not-allowed': disabled,
          'cursor-pointer': !disabled,
          'active:scale-95': touchState === 'touching' && !disabled,
        }
      )}
      onClick={() => !disabled && onChange(!checked)}
      {...touchHandlers}
    >
      <div className="flex-1">
        <p className="text-base font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          {
            'bg-primary': checked,
            'bg-gray-200': !checked,
          }
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            {
              'translate-x-5': checked,
              'translate-x-0': !checked,
            }
          )}
        />
      </button>
    </div>
  );
};

/**
 * Loading spinner component optimized for mobile
 */
export const OptimizedLoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }[size];

  return (
    <div className={cn('flex justify-center items-center', className)}>
      <div className={cn('animate-spin rounded-full border-b-2 border-primary', sizeClasses)} />
    </div>
  );
};

/**
 * Error message component with accessibility
 */
export interface OptimizedErrorMessageProps {
  message: string;
  className?: string;
  onRetry?: () => void;
}

export const OptimizedErrorMessage: React.FC<OptimizedErrorMessageProps> = ({
  message,
  className,
  onRetry,
}) => {
  return (
    <div
      className={cn(
        'bg-red-50 border border-red-200 rounded-md p-4',
        'flex items-center justify-between',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center">
        <svg
          className="h-5 w-5 text-red-400 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm text-red-800">{message}</p>
      </div>
      {onRetry && (
        <OptimizedButton
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          Retry
        </OptimizedButton>
      )}
    </div>
  );
};

/**
 * Success message component with accessibility
 */
export interface OptimizedSuccessMessageProps {
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export const OptimizedSuccessMessage: React.FC<OptimizedSuccessMessageProps> = ({
  message,
  className,
  onDismiss,
}) => {
  return (
    <div
      className={cn(
        'bg-green-50 border border-green-200 rounded-md p-4',
        'flex items-center justify-between',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center">
        <svg
          className="h-5 w-5 text-green-400 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm text-green-800">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Dismiss success message"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Hook for form validation with mobile-optimized error handling
 */
export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string, rules: Record<string, any>) => {
    let error = '';

    if (rules.required && !value.trim()) {
      error = `${name} is required`;
    } else if (rules.minLength && value.length < rules.minLength) {
      error = `${name} must be at least ${rules.minLength} characters`;
    } else if (rules.maxLength && value.length > rules.maxLength) {
      error = `${name} must be no more than ${rules.maxLength} characters`;
    } else if (rules.pattern && !rules.pattern.test(value)) {
      error = rules.patternMessage || `${name} format is invalid`;
    } else if (rules.minValue && parseFloat(value) < rules.minValue) {
      error = `${name} must be at least ${rules.minValue}`;
    } else if (rules.maxValue && parseFloat(value) > rules.maxValue) {
      error = `${name} must be no more than ${rules.maxValue}`;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const getFieldError = (name: string) => {
    return touched[name] ? errors[name] : undefined;
  };

  return {
    errors,
    touched,
    validateField,
    handleBlur,
    getFieldError,
    setErrors,
    setTouched,
  };
};

/**
 * Utility function to format currency for mobile display
 */
export const formatCurrency = (amount: number | string, currency: string = 'INR'): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '\u20B90';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

/**
 * Utility function to format percentage for mobile display
 */
export const formatPercentage = (value: number | string, decimals: number = 2): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  return `${numValue.toFixed(decimals)}%`;
};

/**
 * Utility function to validate mobile number format
 */
export const validateMobileNumber = (mobile: string): boolean => {
  // Indian mobile number validation: 10 digits, starts with 6-9
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile.replace(/\D/g, ''));
};

/**
 * Utility function to validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Utility function to validate PAN format
 */
export const validatePAN = (pan: string): boolean => {
  // PAN format: 5 letters + 4 digits + 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  return panRegex.test(pan.toUpperCase());
};

/**
 * Utility function to validate Aadhaar format
 */
export const validateAadhaar = (aadhaar: string): boolean => {
  // Aadhaar format: 12 digits
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
};