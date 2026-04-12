// Mobile Accessibility Enhancements
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useMediaQuery } from 'react-responsive';

// Touch Target Interface
interface TouchTargetProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  minSize?: number;
  className?: string;
  onTouchStart?: (event: React.TouchEvent) => void;
  onTouchEnd?: (event: React.TouchEvent) => void;
  onTouchMove?: (event: React.TouchEvent) => void;
  disabled?: boolean;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

// Mobile-Friendly Button Component
export const MobileAccessibleButton: React.FC<TouchTargetProps & {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  loadingText?: string;
}> = ({
  children,
  minSize = 44, // WCAG minimum touch target size
  className = '',
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  disabled = false,
  role = 'button',
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  variant = 'primary',
  loading = false,
  loadingText = 'Loading...',
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = (event: React.TouchEvent) => {
    setIsPressed(true);
    onTouchStart?.(event);
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    setIsPressed(false);
    onTouchEnd?.(event);
  };

  const getVariantStyles = () => {
    const baseStyles: any = {
      minWidth: `${minSize}px`,
      minHeight: `${minSize}px`,
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: 'var(--text-base)',
      fontWeight: '500',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      border: '2px solid transparent',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent'
    };

    const variantStyles: any = {
      primary: {
        backgroundColor: '#0066cc',
        color: '#ffffff'
      },
      secondary: {
        backgroundColor: '#ffffff',
        color: '#0066cc',
        borderColor: '#0066cc'
      },
      danger: {
        backgroundColor: '#dc3545',
        color: '#ffffff'
      }
    };

    return { ...baseStyles, ...variantStyles[variant] };
  };

  return (
    <button
      ref={buttonRef}
      className={`mobile-accessible-button ${variant} ${className}`}
      style={getVariantStyles() as any}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={onTouchMove}
      disabled={disabled || loading}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-pressed={isPressed}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="loading-indicator" aria-hidden="true">⟳</span>
          <span className="loading-text">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Touch-Friendly Input Component
export const MobileAccessibleInput: React.FC<{
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'search';
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal' | 'search';
  pattern?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  id?: string;
}> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  required = false,
  disabled = false,
  autoComplete,
  inputMode,
  pattern,
  min,
  max,
  step,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const inputStyles: any = {
    minHeight: '44px',
    fontSize: 'var(--text-base)',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `2px solid ${error ? '#dc3545' : '#ccc'}`,
    backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
    color: '#333',
    width: '100%',
    boxSizing: 'border-box' as const,
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none'
  };


  return (
    <div className={`mobile-input-container ${className}`}>
      <label htmlFor={inputId} className="mobile-input-label">
        {label}
        {required && <span className="required-indicator" aria-label="required">*</span>}
      </label>
      
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        inputMode={inputMode}
        pattern={pattern}
        min={min}
        max={max}
        step={step}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        aria-required={required}
        aria-disabled={disabled}
        style={inputStyles as any}
        {...props}
      />
      
      {error && (
        <div id={errorId} className="mobile-input-error" role="alert">
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div id={helperId} className="mobile-input-helper">
          {helperText}
        </div>
      )}
    </div>
  );
};

// Touch-Friendly Checkbox Component
export const MobileAccessibleCheckbox: React.FC<{
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  indeterminate?: boolean;
  className?: string;
  id?: string;
}> = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  required = false,
  indeterminate = false,
  className = '',
  id
}) => {
  const checkboxId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleTouchStart = (event: React.TouchEvent) => {
    event.preventDefault(); // Prevent double-tap zoom
  };

  const checkboxStyles: any = {
    width: '24px',
    height: '24px',
    minWidth: '24px',
    minHeight: '24px',
    marginRight: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    border: '2px solid #ccc',
    borderRadius: '4px',
    backgroundColor: checked ? '#0066cc' : '#ffffff',
    position: 'relative' as const
  };

  const labelStyles: any = {
    display: 'flex',
    alignItems: 'center',
    minHeight: '44px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent'
  };

  return (
    <label htmlFor={checkboxId} className={`mobile-checkbox-label ${className}`} style={labelStyles}>
      <input
        ref={checkboxRef}
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        onTouchStart={handleTouchStart}
        disabled={disabled}
        required={required}
        aria-checked={indeterminate ? 'mixed' : checked}
        aria-disabled={disabled}
        aria-required={required}
        style={checkboxStyles as any}
      />
      <span className="checkbox-label-text">{label}</span>
    </label>
  );
};

// Touch-Friendly Radio Button Component
export const MobileAccessibleRadio: React.FC<{
  name: string;
  label: string;
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}> = ({
  name,
  label,
  value,
  checked = false,
  onChange,
  disabled = false,
  required = false,
  className = '',
  id
}) => {
  const radioId = id || `radio-${name}-${value}`;

  const handleTouchStart = (event: React.TouchEvent) => {
    event.preventDefault(); // Prevent double-tap zoom
  };

  const radioStyles: any = {
    width: '24px',
    height: '24px',
    minWidth: '24px',
    minHeight: '24px',
    marginRight: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    border: '2px solid #ccc',
    borderRadius: '50%',
    backgroundColor: checked ? '#0066cc' : '#ffffff',
    position: 'relative' as const
  };

  const labelStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    minHeight: '44px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent'
  };

  return (
    <label htmlFor={radioId} className={`mobile-radio-label ${className}`} style={labelStyles}>
      <input
        id={radioId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange?.(e.target.value)}
        onTouchStart={handleTouchStart}
        disabled={disabled}
        required={required}
        aria-checked={checked}
        aria-disabled={disabled}
        aria-required={required}
        style={radioStyles as any}
      />
      <span className="radio-label-text">{label}</span>
    </label>
  );
};

// Touch-Friendly Select Component
export const MobileAccessibleSelect: React.FC<{
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  id
}) => {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  const selectStyles = {
    minHeight: '44px',
    fontSize: 'var(--text-base)',
    padding: '12px 16px',
    paddingRight: '40px', // Space for dropdown arrow
    borderRadius: '8px',
    border: `2px solid ${error ? '#dc3545' : '#ccc'}`,
    backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
    color: '#333',
    width: '100%',
    boxSizing: 'border-box' as const,
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    ':focus': {
      outline: 'none',
      borderColor: '#0066cc',
      boxShadow: '0 0 0 3px rgba(0, 102, 204, 0.2)'
    }
  };

  return (
    <div className={`mobile-select-container ${className}`}>
      <label htmlFor={selectId} className="mobile-select-label">
        {label}
        {required && <span className="required-indicator" aria-label="required">*</span>}
      </label>
      
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        aria-required={required}
        aria-disabled={disabled}
        style={selectStyles as any}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <div id={errorId} className="mobile-select-error" role="alert">
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div id={helperId} className="mobile-select-helper">
          {helperText}
        </div>
      )}
    </div>
  );
};

// Touch Gesture Handler Hook
export const useTouchGestures = () => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    return {
      isLeftSwipe,
      isRightSwipe,
      isUpSwipe,
      isDownSwipe,
      distanceX,
      distanceY
    };
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};

// Mobile Accessibility Hook
export const useMobileAccessibility = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTouchDevice = useMediaQuery({ query: '(hover: none)' });
  
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const optimizeForTouch = (element: HTMLElement) => {
    // Add touch-friendly styles
    element.style.touchAction = 'manipulation';
    element.style.setProperty('-webkit-tap-highlight-color', 'transparent');
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
    
    // Ensure minimum touch target size
    const rect = element.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      element.style.minWidth = '44px';
      element.style.minHeight = '44px';
      element.style.padding = '12px';
    }
  };

  const preventZoom = (inputElement: HTMLInputElement | HTMLTextAreaElement) => {
    // Set font size to 16px to prevent zoom on iOS
    inputElement.style.fontSize = 'var(--text-base)';
    
    // Add touch event listeners to prevent zoom
    inputElement.addEventListener('touchstart', (e) => {
      e.preventDefault();
    }, { passive: false });
  };

  return {
    isMobile,
    isTouchDevice,
    viewport,
    optimizeForTouch,
    preventZoom
  };
};

// Mobile Accessibility Utilities
export const mobileAccessibilityUtils = {
  // Check if device supports touch
  isTouchDevice: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Check if device is mobile
  isMobileDevice: (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Get device orientation
  getOrientation: (): 'portrait' | 'landscape' => {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  },

  // Optimize viewport for mobile
  optimizeViewport: (): void => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }
  },

  // Enable touch feedback
  enableTouchFeedback: (element: HTMLElement): void => {
    element.style.setProperty('-webkit-tap-highlight-color', 'rgba(0,0,0,0.1)');
    element.style.touchAction = 'manipulation';
  },

  // Disable double-tap zoom
  disableDoubleTapZoom: (element: HTMLElement): void => {
    let lastTouchEnd = 0;
    element.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  },

  // Calculate optimal touch target size
  getOptimalTouchTargetSize: (): number => {
    const screenSize = Math.min(window.innerWidth, window.innerHeight);
    if (screenSize < 360) return 48; // Small phones
    if (screenSize < 768) return 44; // Regular phones
    return 40; // Tablets and larger
  },

  // Test touch target size
  testTouchTarget: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    const minSize = mobileAccessibilityUtils.getOptimalTouchTargetSize();
    return rect.width >= minSize && rect.height >= minSize;
  }
};

export default {
  MobileAccessibleButton,
  MobileAccessibleInput,
  MobileAccessibleCheckbox,
  MobileAccessibleRadio,
  MobileAccessibleSelect,
  useTouchGestures,
  useMobileAccessibility,
  mobileAccessibilityUtils
};
