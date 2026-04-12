// @ts-nocheck
/**
 * Immediate Mobile Button Text Overflow Fix
 * 
 * Apply this fix immediately to resolve button text overflow issues on mobile devices.
 * This should be imported and executed in your main app component or layout.
 */

import { fixMobileButtonClasses } from './mobile-button-fix';

/**
 * Apply mobile button fixes immediately on page load
 * This function should be called in your main App component or layout
 */
export function applyImmediateMobileButtonFix(): void {
  if (typeof window === 'undefined') return;

  // Wait for DOM to be ready
  const applyFixes = () => {
    // Find all buttons on the page
    const buttons = document.querySelectorAll('button, [role="button"], .btn');
    let fixedCount = 0;

    buttons.forEach((button) => {
      const originalClassName = button.className;
      
      // Check if this button needs fixing
      if (originalClassName && originalClassName.includes('h-9') && originalClassName.includes('py-4')) {
        const fixedClassName = fixMobileButtonClasses(originalClassName);
        
        if (fixedClassName !== originalClassName) {
          button.className = fixedClassName;
          fixedCount++;
          
          console.log('Fixed mobile button text overflow:', {
            element: button,
            original: originalClassName,
            fixed: fixedClassName,
          });
        }
      }
    });

    if (fixedCount > 0) {
      console.log(`Applied mobile button fixes to ${fixedCount} buttons`);
    }
  };

  // Apply fixes immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFixes);
  } else {
    applyFixes();
  }

  // Re-apply fixes on window resize (for responsive behavior)
  let resizeTimeout: NodeJS.Timeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(applyFixes, 250);
  });
}

/**
 * CSS injection for immediate mobile button fixes
 * This provides instant CSS fixes without modifying component code
 */
export function injectMobileButtonFixCSS(): void {
  if (typeof window === 'undefined') return;

  // Check if CSS already injected
  if (document.getElementById('mobile-button-fix-css')) return;

  const css = `
    /* Mobile Button Text Overflow Fix - Immediate CSS */
    @media (max-width: 768px) {
      /* Fix the specific problematic button pattern */
      button[class*="h-9"][class*="py-4"][class*="text-lg"],
      [role="button"][class*="h-9"][class*="py-4"][class*="text-lg"],
      .btn[class*="h-9"][class*="py-4"][class*="text-lg"] {
        /* Remove conflicting constraints */
        height: auto !important;
        min-height: 48px !important; /* Touch target compliance */
        
        /* Allow text wrapping */
        white-space: normal !important;
        overflow-wrap: break-word !important;
        word-break: break-word !important;
        
        /* Adjust padding for mobile */
        padding-top: 0.75rem !important;    /* py-3 */
        padding-bottom: 0.75rem !important; /* py-3 */
        
        /* Mobile-optimized text sizing */
        font-size: 1rem !important; /* text-base */
        line-height: 1.25 !important;
        
        /* Ensure proper alignment */
        text-align: center !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      /* Fix for "Choose CA Expert Assisted" type buttons */
      button[class*="w-full"][class*="text-lg"][class*="font-semibold"][class*="h-9"],
      [role="button"][class*="w-full"][class*="text-lg"][class*="font-semibold"][class*="h-9"] {
        white-space: normal !important;
        overflow-wrap: break-word !important;
        word-break: break-word !important;
        height: auto !important;
        min-height: 48px !important;
        padding: 0.75rem 1rem !important; /* py-3 px-4 */
        font-size: 1rem !important;
        line-height: 1.3 !important;
      }
      
      /* Ensure touch target compliance */
      button:not([class*="min-h-"]),
      [role="button"]:not([class*="min-h-"]),
      .btn:not([class*="min-h-"]) {
        min-height: 48px !important;
        min-width: 48px !important;
      }
      
      /* Fix text overflow on gradient backgrounds */
      section[class*="bg-gradient"] button,
      div[class*="bg-gradient"] button {
        position: relative !important;
        z-index: 10 !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
      }
    }
  `;

  const styleElement = document.createElement('style');
  styleElement.id = 'mobile-button-fix-css';
  styleElement.textContent = css;
  document.head.appendChild(styleElement);

  console.log('Injected mobile button fix CSS');
}

/**
 * React hook for applying mobile button fixes
 */
export function useMobileButtonFix(): void {
  if (typeof window === 'undefined') return;

  React.useEffect(() => {
    injectMobileButtonFixCSS();
    applyImmediateMobileButtonFix();

    // Cleanup function
    return () => {
      const styleElement = document.getElementById('mobile-button-fix-css');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
}

/**
 * Debug utility to identify and fix all button text overflow issues
 */
export function debugMobileButtonIssues(): void {
  if (typeof window === 'undefined') return;

  console.log('=== Mobile Button Text Overflow Debug ===');
  
  const buttons = document.querySelectorAll('button, [role="button"], .btn');
  const issues: Array<{
    element: Element;
    issue: string;
    suggestion: string;
  }> = [];

  buttons.forEach((button, index) => {
    const className = button.className;
    const textContent = button.textContent?.trim() || '';
    const rect = button.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(button);
    
    let hasIssue = false;
    let issue = '';
    let suggestion = '';

    // Check for problematic class combinations
    if (className.includes('h-9') && className.includes('py-4')) {
      hasIssue = true;
      issue = 'Conflicting height (h-9) and padding (py-4) classes';
      suggestion = 'Replace h-9 with h-auto min-h-[48px] and py-4 with py-3';
    }
    
    if (className.includes('whitespace-nowrap') && className.includes('text-lg')) {
      hasIssue = true;
      issue = 'Text wrapping disabled (whitespace-nowrap) with large text (text-lg)';
      suggestion = 'Remove whitespace-nowrap and use text-sm or text-base for mobile';
    }
    
    if (textContent.length > 20 && computedStyle.fontSize === '18px') {
      hasIssue = true;
      issue = 'Long text with large font size on mobile';
      suggestion = 'Use text-sm or allow text wrapping with break-words';
    }
    
    if (rect.height < 44 && computedStyle.fontSize === '18px') {
      hasIssue = true;
      issue = 'Button height too small for text-lg content';
      suggestion = 'Increase min-height to 48px or reduce font size';
    }

    if (hasIssue) {
      issues.push({
        element: button,
        issue,
        suggestion,
      });
      
      // Highlight problematic button
      (button as HTMLElement).style.outline = '2px solid red';
      (button as HTMLElement).style.outlineOffset = '2px';
      
      console.warn(`Button ${index + 1}:`, {
        text: textContent,
        className,
        issue,
        suggestion,
        rect: {
          width: rect.width,
          height: rect.height,
          fontSize: computedStyle.fontSize,
          lineHeight: computedStyle.lineHeight,
          whiteSpace: computedStyle.whiteSpace,
          overflow: computedStyle.overflow,
        },
      });
    }
  });

  console.log(`Found ${issues.length} buttons with potential text overflow issues`);
  
  if (issues.length > 0) {
    console.log('Apply fixes by calling autoFixMobileButtonIssues()');
  }

  console.log('=== Debug Complete ===');
}

/**
 * Auto-fix all identified button text overflow issues
 */
export function autoFixMobileButtonIssues(): void {
  if (typeof window === 'undefined') return;

  console.log('Applying automatic fixes to mobile button text overflow issues...');
  
  const buttons = document.querySelectorAll('button, [role="button"], .btn');
  let fixedCount = 0;

  buttons.forEach((button) => {
    const originalClassName = button.className;
    const fixedClassName = fixMobileButtonClasses(originalClassName);
    
    if (fixedClassName !== originalClassName) {
      button.className = fixedClassName;
      fixedCount++;
      
      // Remove debug highlighting
      (button as HTMLElement).style.outline = '';
      (button as HTMLElement).style.outlineOffset = '';
      
      console.log(`Fixed button: "${button.textContent?.trim()}"`);
    }
  });

  console.log(`Applied fixes to ${fixedCount} buttons`);
  
  if (fixedCount === 0) {
    console.log('No button text overflow issues found to fix');
  }
}

/**
 * Export all utilities for easy importing
 */
export const MobileButtonFixUtils = {
  applyImmediateFix: applyImmediateMobileButtonFix,
  injectCSS: injectMobileButtonFixCSS,
  useFix: useMobileButtonFix,
  debug: debugMobileButtonIssues,
  autoFix: autoFixMobileButtonIssues,
  fixClasses: fixMobileButtonClasses,
  needsFix: (className: string) => className.includes('h-9') && className.includes('py-4'),
};

export default MobileButtonFixUtils;
