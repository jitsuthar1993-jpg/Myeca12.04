import { forwardRef, InputHTMLAttributes, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface OptimizedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onDebouncedChange?: (value: string) => void;
  debounceDelay?: number;
  instantValidation?: boolean;
}

export const OptimizedInput = forwardRef<HTMLInputElement, OptimizedInputProps>(
  ({ 
    onChange, 
    onDebouncedChange, 
    debounceDelay = 300, 
    instantValidation = false,
    className,
    ...props 
  }, ref) => {
    const debouncedValue = useDebounce(props.value as string || '', debounceDelay);

    // Handle debounced change
    useCallback(() => {
      if (onDebouncedChange && debouncedValue) {
        onDebouncedChange(debouncedValue);
      }
    }, [debouncedValue, onDebouncedChange])();

    // Optimized change handler
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      // For instant validation, we use RAF to avoid blocking
      if (instantValidation) {
        requestAnimationFrame(() => {
          onChange?.(e);
        });
      } else {
        onChange?.(e);
      }
    }, [onChange, instantValidation]);

    return (
      <Input
        ref={ref}
        {...props}
        onChange={handleChange}
        className={cn(
          'transition-shadow duration-200',
          'focus:shadow-sm',
          className
        )}
        // Performance optimizations
        autoComplete={props.autoComplete || 'off'}
        spellCheck={props.type === 'email' || props.type === 'url' ? false : props.spellCheck}
      />
    );
  }
);

OptimizedInput.displayName = 'OptimizedInput';