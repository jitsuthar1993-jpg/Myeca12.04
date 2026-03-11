/**
 * Mobile Button Fix Tests
 * 
 * Tests for the mobile button text overflow fix utilities
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  fixMobileButtonClasses,
  needsMobileButtonFix,
  applyMobileButtonFix,
  createMobileButtonClasses,
  PROBLEMATIC_BUTTON_COMBINATIONS,
} from '../../utils/mobile-button-fix';

describe('Mobile Button Fix Utilities', () => {
  describe('needsMobileButtonFix', () => {
    it('should detect problematic button class combinations', () => {
      const problematicClasses = [
        'h-9 py-4 text-lg font-semibold',
        'whitespace-nowrap text-lg px-4',
        'h-9 text-lg w-full py-4',
        'py-4 px-4 text-lg font-medium',
      ];

      problematicClasses.forEach(className => {
        expect(needsMobileButtonFix(className)).toBe(true);
      });
    });

    it('should not flag normal button classes', () => {
      const normalClasses = [
        'px-4 py-2 text-sm',
        'h-10 px-4 text-base',
        'px-6 py-3 text-lg',
        'w-full px-4 py-2',
      ];

      normalClasses.forEach(className => {
        expect(needsMobileButtonFix(className)).toBe(false);
      });
    });

    it('should handle empty or undefined class names', () => {
      expect(needsMobileButtonFix('')).toBe(false);
      expect(needsMobileButtonFix(undefined as any)).toBe(false);
      expect(needsMobileButtonFix(null as any)).toBe(false);
    });
  });

  describe('fixMobileButtonClasses', () => {
    it('should fix problematic button classes', () => {
      const input = 'h-9 py-4 text-lg font-semibold w-full';
      const result = fixMobileButtonClasses(input);
      
      expect(result).toContain('h-auto');
      expect(result).toContain('min-h-[48px]');
      expect(result).toContain('whitespace-normal');
      expect(result).toContain('break-words');
      expect(result).toContain('py-3');
      expect(result).toContain('text-sm');
      expect(result).not.toContain('h-9');
      expect(result).not.toContain('whitespace-nowrap');
      expect(result).not.toContain('py-4');
      expect(result).not.toContain('text-lg');
    });

    it('should preserve non-problematic classes', () => {
      const input = 'px-4 font-medium rounded-lg';
      const result = fixMobileButtonClasses(input);
      
      expect(result).toContain('px-4');
      expect(result).toContain('font-medium');
      expect(result).toContain('rounded-lg');
      expect(result).toContain('h-auto');
      expect(result).toContain('min-h-[48px]');
    });

    it('should handle complex class combinations', () => {
      const input = 'inline-flex items-center justify-center h-9 px-4 py-4 text-lg font-semibold transition-all';
      const result = fixMobileButtonClasses(input);
      
      expect(result).toContain('inline-flex');
      expect(result).toContain('items-center');
      expect(result).toContain('justify-center');
      expect(result).toContain('transition-all');
      expect(result).toContain('h-auto');
      expect(result).toContain('min-h-[48px]');
      expect(result).not.toContain('h-9');
      expect(result).not.toContain('py-4');
      expect(result).not.toContain('text-lg');
    });

    it('should handle empty class names', () => {
      expect(fixMobileButtonClasses('')).toBe('');
    });
  });

  describe('applyMobileButtonFix', () => {
    it('should apply fix when needed', () => {
      const input = 'h-9 py-4 text-lg font-semibold';
      const result = applyMobileButtonFix(input);
      
      expect(result).toContain('h-auto');
      expect(result).toContain('min-h-[48px]');
      expect(result).not.toContain('h-9');
    });

    it('should not apply fix when not needed', () => {
      const input = 'px-4 py-2 text-sm font-medium';
      const result = applyMobileButtonFix(input);
      
      expect(result).toBe(input);
    });

    it('should force fix when specified', () => {
      const input = 'px-4 py-2 text-sm font-medium';
      const result = applyMobileButtonFix(input, true);
      
      expect(result).toContain('h-auto');
      expect(result).toContain('min-h-[48px]');
      expect(result).toContain('whitespace-normal');
    });
  });

  describe('createMobileButtonClasses', () => {
    it('should create mobile-optimized button classes', () => {
      const result = createMobileButtonClasses({
        variant: 'default',
        size: 'default',
        fullWidth: true,
        allowTextWrap: true,
      });
      
      expect(result).toContain('inline-flex items-center justify-center');
      expect(result).toContain('h-auto min-h-[48px] min-w-[48px]');
      expect(result).toContain('whitespace-normal break-words text-center');
      expect(result).toContain('w-full');
      expect(result).toContain('px-4 py-3');
      expect(result).toContain('text-sm');
      expect(result).toContain('bg-blue-600 text-white');
    });

    it('should create outline variant classes', () => {
      const result = createMobileButtonClasses({
        variant: 'outline',
        size: 'lg',
        allowTextWrap: false,
      });
      
      expect(result).toContain('border-2 border-blue-600 bg-white text-blue-600');
      expect(result).toContain('px-6 py-4');
      expect(result).toContain('whitespace-nowrap');
      expect(result).not.toContain('break-words');
    });

    it('should create small button classes', () => {
      const result = createMobileButtonClasses({
        variant: 'destructive',
        size: 'sm',
      });
      
      expect(result).toContain('bg-red-600 text-white');
      expect(result).toContain('px-3 py-2');
      expect(result).toContain('text-sm');
      expect(result).toContain('h-auto min-h-[48px] min-w-[48px]');
    });
  });
});

describe('Mobile Button Component Integration', () => {
  it('should render button with mobile optimizations', () => {
    const { container } = render(
      <button className={fixMobileButtonClasses('h-9 py-4 text-lg Choose CA Expert Assisted')}>
        Choose CA Expert Assisted
      </button>
    );
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('h-auto');
    expect(button).toHaveClass('min-h-[48px]');
    expect(button).toHaveClass('whitespace-normal');
    expect(button).not.toHaveClass('h-9');
    expect(button).not.toHaveClass('py-4');
    expect(button).not.toHaveClass('text-lg');
  });

  it('should handle long button text', () => {
    const longText = 'Choose Chartered Accountant Expert Assisted Filing Service';
    
    const { container } = render(
      <button className={fixMobileButtonClasses('h-9 py-4 text-lg w-full')}>
        {longText}
      </button>
    );
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('whitespace-normal');
    expect(button).toHaveClass('break-words');
    expect(button).toHaveClass('text-center');
    expect(button).toHaveTextContent(longText);
  });

  it('should maintain touch target compliance', () => {
    const { container } = render(
      <button className={fixMobileButtonClasses('h-9 text-sm')}>
        Test Button
      </button>
    );
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('min-h-[48px]');
    expect(button).toHaveClass('h-auto');
  });
});

describe('Edge Cases', () => {
  it('should handle buttons with only some problematic classes', () => {
    const input = 'h-9 rounded-lg font-medium'; // Only h-9 is problematic
    const result = fixMobileButtonClasses(input);
    
    expect(result).toContain('h-auto');
    expect(result).toContain('min-h-[48px]');
    expect(result).toContain('rounded-lg');
    expect(result).toContain('font-medium');
    expect(result).not.toContain('h-9');
  });

  it('should handle duplicate classes', () => {
    const input = 'h-9 h-9 py-4 py-4 text-lg text-lg';
    const result = fixMobileButtonClasses(input);
    
    expect(result).toContain('h-auto');
    expect(result).not.toContain('h-9');
    expect(result.split(' ').filter(cls => cls === 'h-auto').length).toBe(1);
  });

  it('should preserve important classes', () => {
    const input = 'inline-flex items-center justify-center h-9 py-4 text-lg transition-all duration-300';
    const result = fixMobileButtonClasses(input);
    
    expect(result).toContain('inline-flex');
    expect(result).toContain('items-center');
    expect(result).toContain('justify-center');
    expect(result).toContain('transition-all');
    expect(result).toContain('duration-300');
  });

  it('should handle responsive modifier classes', () => {
    const input = 'h-9 py-4 text-lg sm:py-2 md:py-3';
    const result = fixMobileButtonClasses(input);
    
    expect(result).toContain('py-3'); // Base mobile size
    expect(result).toContain('sm:py-2');
    expect(result).toContain('md:py-3');
  });
});

describe('Performance', () => {
  it('should handle large numbers of buttons efficiently', () => {
    const startTime = performance.now();
    
    // Test with 1000 button class fixes
    for (let i = 0; i < 1000; i++) {
      fixMobileButtonClasses('h-9 py-4 text-lg font-semibold w-full rounded-lg');
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
  });

  it('should cache results for repeated calls', () => {
    const className = 'h-9 py-4 text-lg font-semibold';
    
    const result1 = fixMobileButtonClasses(className);
    const result2 = fixMobileButtonClasses(className);
    
    expect(result1).toBe(result2);
  });
});

/**
 * Integration test for real-world scenarios
 */
describe('Real-World Integration Tests', () => {
  beforeEach(() => {
    // Mock window.innerWidth for mobile testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // iPhone SE width
    });
  });

  afterEach(() => {
    // Reset window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('should fix the specific "Choose CA Expert Assisted" button issue', () => {
    const problematicClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap h-9 px-4 py-4 rounded-lg font-semibold transition-all duration-300 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl border-2 border-white';
    
    const result = fixMobileButtonClasses(problematicClasses);
    
    // Check that problematic classes are removed
    expect(result).not.toContain('h-9');
    expect(result).not.toContain('py-4');
    expect(result).not.toContain('whitespace-nowrap');
    expect(result).not.toContain('text-lg');
    
    // Check that mobile-optimized classes are added
    expect(result).toContain('h-auto');
    expect(result).toContain('min-h-[48px]');
    expect(result).toContain('whitespace-normal');
    expect(result).toContain('break-words');
    expect(result).toContain('py-3');
    expect(result).toContain('text-sm');
    
    // Check that useful classes are preserved
    expect(result).toContain('inline-flex');
    expect(result).toContain('items-center');
    expect(result).toContain('justify-center');
    expect(result).toContain('gap-2');
    expect(result).toContain('rounded-lg');
    expect(result).toContain('font-semibold');
    expect(result).toContain('transition-all');
    expect(result).toContain('duration-300');
    expect(result).toContain('bg-white');
    expect(result).toContain('text-blue-600');
    expect(result).toContain('hover:bg-blue-50');
    expect(result).toContain('shadow-lg');
    expect(result).toContain('hover:shadow-xl');
    expect(result).toContain('border-2');
    expect(result).toContain('border-white');
  });

  it('should handle gradient background buttons', () => {
    const gradientButtonClasses = 'h-9 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white';
    const result = fixMobileButtonClasses(gradientButtonClasses);
    
    expect(result).toContain('h-auto');
    expect(result).toContain('min-h-[48px]');
    expect(result).toContain('whitespace-normal');
    expect(result).toContain('text-sm');
    expect(result).toContain('bg-gradient-to-r');
    expect(result).toContain('from-blue-600');
    expect(result).toContain('to-purple-600');
    expect(result).toContain('text-white');
  });

  it('should handle outline buttons', () => {
    const outlineButtonClasses = 'h-9 py-4 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50';
    const result = fixMobileButtonClasses(outlineButtonClasses);
    
    expect(result).toContain('h-auto');
    expect(result).toContain('min-h-[48px]');
    expect(result).toContain('whitespace-normal');
    expect(result).toContain('text-sm');
    expect(result).toContain('border-2');
    expect(result).toContain('border-blue-600');
    expect(result).toContain('text-blue-600');
    expect(result).toContain('hover:bg-blue-50');
  });
});