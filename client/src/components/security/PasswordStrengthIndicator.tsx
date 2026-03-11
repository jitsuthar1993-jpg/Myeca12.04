import { useEffect, useState } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState({ score: 0, feedback: [] as string[] });

  useEffect(() => {
    const checkStrength = (pwd: string) => {
      let score = 0;
      const feedback: string[] = [];

      if (pwd.length >= 8) score++;
      if (pwd.length >= 12) score++;
      if (/[a-z]/.test(pwd)) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[!@#$%^&*]/.test(pwd)) score++;

      if (pwd.length < 8) {
        feedback.push('At least 8 characters');
      }
      if (!/[a-z]/.test(pwd)) {
        feedback.push('One lowercase letter');
      }
      if (!/[A-Z]/.test(pwd)) {
        feedback.push('One uppercase letter');
      }
      if (!/[0-9]/.test(pwd)) {
        feedback.push('One number');
      }
      if (!/[!@#$%^&*]/.test(pwd)) {
        feedback.push('One special character');
      }

      return { score: Math.min(score, 5), feedback };
    };

    setStrength(checkStrength(password));
  }, [password]);

  const getStrengthLabel = () => {
    if (strength.score === 0) return { label: 'Very Weak', color: 'bg-red-600' };
    if (strength.score <= 2) return { label: 'Weak', color: 'bg-orange-600' };
    if (strength.score === 3) return { label: 'Fair', color: 'bg-yellow-600' };
    if (strength.score === 4) return { label: 'Good', color: 'bg-blue-600' };
    return { label: 'Strong', color: 'bg-green-600' };
  };

  const { label, color } = getStrengthLabel();
  const progressValue = (strength.score / 5) * 100;

  if (!password) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Password strength:</span>
        <span className={cn('font-medium', {
          'text-red-600': strength.score === 0,
          'text-orange-600': strength.score <= 2,
          'text-yellow-600': strength.score === 3,
          'text-blue-600': strength.score === 4,
          'text-green-600': strength.score === 5,
        })}>
          {label}
        </span>
      </div>
      
      <Progress 
        value={progressValue} 
        className="h-2"
        indicatorClassName={color}
      />

      {strength.feedback.length > 0 && (
        <div className="space-y-1 mt-2">
          <p className="text-xs text-gray-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Requirements:
          </p>
          <ul className="space-y-1">
            {['At least 8 characters', 'One lowercase letter', 'One uppercase letter', 'One number', 'One special character'].map((req) => {
              const isMet = !strength.feedback.includes(req);
              return (
                <li
                  key={req}
                  className={cn('text-xs flex items-center gap-1', {
                    'text-green-600': isMet,
                    'text-gray-500': !isMet,
                  })}
                >
                  {isMet ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  {req}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}