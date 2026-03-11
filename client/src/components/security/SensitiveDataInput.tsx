import { useState, forwardRef, InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type SensitiveDataType = 'pan' | 'aadhaar' | 'gstin' | 'account' | 'custom';

interface SensitiveDataInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  dataType: SensitiveDataType;
  showToggle?: boolean;
  maskPattern?: string; // Custom mask pattern for 'custom' type
}

export const SensitiveDataInput = forwardRef<HTMLInputElement, SensitiveDataInputProps>(
  ({ dataType, showToggle = true, maskPattern, className, ...props }, ref) => {
    const [showData, setShowData] = useState(false);

    const getMaskedValue = (value: string): string => {
      if (!value || showData) return value;

      switch (dataType) {
        case 'pan':
          // Show first 5 and last 1 character: ABCDE****F
          if (value.length >= 10) {
            return value.slice(0, 5) + '****' + value.slice(-1);
          }
          return value;

        case 'aadhaar':
          // Show last 4 digits: ********1234
          if (value.length >= 12) {
            return '********' + value.slice(-4);
          }
          return value;

        case 'gstin':
          // Show first 2 and last 3 characters: 29***********ZYX
          if (value.length >= 15) {
            return value.slice(0, 2) + '***********' + value.slice(-3);
          }
          return value;

        case 'account':
          // Show last 4 digits: ******1234
          if (value.length >= 8) {
            return '*'.repeat(value.length - 4) + value.slice(-4);
          }
          return value;

        case 'custom':
          // Use custom mask pattern
          if (maskPattern) {
            return maskPattern.replace(/\*/g, () => '*');
          }
          return value;

        default:
          return value;
      }
    };

    const getPlaceholder = (): string => {
      switch (dataType) {
        case 'pan':
          return 'Enter PAN (e.g., ABCDE1234F)';
        case 'aadhaar':
          return 'Enter Aadhaar (12 digits)';
        case 'gstin':
          return 'Enter GSTIN (15 characters)';
        case 'account':
          return 'Enter Account Number';
        default:
          return props.placeholder || 'Enter sensitive data';
      }
    };

    const validateInput = (value: string): boolean => {
      switch (dataType) {
        case 'pan':
          return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase());
        case 'aadhaar':
          return /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/.test(value);
        case 'gstin':
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value.toUpperCase());
        default:
          return true;
      }
    };

    const formatInput = (value: string): string => {
      switch (dataType) {
        case 'pan':
        case 'gstin':
          return value.toUpperCase();
        case 'aadhaar':
          return value.replace(/\D/g, '').slice(0, 12);
        case 'account':
          return value.replace(/\D/g, '');
        default:
          return value;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formattedValue = formatInput(e.target.value);
      e.target.value = formattedValue;
      
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const displayValue = props.value ? getMaskedValue(String(props.value)) : undefined;

    return (
      <div className="relative">
        <Input
          ref={ref}
          {...props}
          type={showData ? 'text' : 'password'}
          value={showData ? props.value : displayValue}
          onChange={handleChange}
          placeholder={getPlaceholder()}
          className={cn('pr-10', className)}
          data-sensitive="true"
          autoComplete="off"
        />
        {showToggle && props.value && (
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowData(!showData)}
            aria-label={showData ? 'Hide data' : 'Show data'}
          >
            {showData ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    );
  }
);

SensitiveDataInput.displayName = 'SensitiveDataInput';

// Export validation patterns for use in forms
export const sensitiveDataPatterns = {
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  aadhaar: /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/,
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  account: /^[0-9]{9,18}$/,
};