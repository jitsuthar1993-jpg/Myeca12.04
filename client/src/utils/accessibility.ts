import { trackEvent } from './analytics';

export interface AccessibilityIssue {
  type: 'contrast' | 'keyboard' | 'screen-reader' | 'focus' | 'aria' | 'semantic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  element: HTMLElement;
  description: string;
  recommendation: string;
  wcagGuideline: string;
}

export interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  warnings: string[];
  recommendations: string[];
  timestamp: string;
  url: string;
}

class AccessibilityMonitor {
  private issues: AccessibilityIssue[] = [];
  private isMonitoring = false;
  private keyboardOnly = false;
  private focusOutline: HTMLDivElement | null = null;
  private announcements: HTMLDivElement | null = null;

  constructor() {
    this.setupGlobalHandlers();
    this.createAccessibilityElements();
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.runAccessibilityAudit();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.monitorUserInteractions();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  private createAccessibilityElements(): void {
    // Create live region for screen reader announcements
    this.announcements = document.createElement('div');
    this.announcements.setAttribute('aria-live', 'polite');
    this.announcements.setAttribute('aria-atomic', 'true');
    this.announcements.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.announcements);

    // Create focus outline indicator
    this.focusOutline = document.createElement('div');
    this.focusOutline.id = 'a11y-focus-outline';
    this.focusOutline.style.cssText = `
      position: absolute;
      pointer-events: none;
      border: 3px solid #3b82f6;
      border-radius: 4px;
      transition: all 0.2s ease;
      z-index: 9999;
      display: none;
    `;
    document.body.appendChild(this.focusOutline);
  }

  private setupGlobalHandlers(): void {
    // Detect keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.keyboardOnly = true;
        document.body.classList.add('keyboard-navigation');
        this.announceToScreenReader('Keyboard navigation detected');
      }
    });

    // Detect mouse usage
    document.addEventListener('mousedown', () => {
      this.keyboardOnly = false;
      document.body.classList.remove('keyboard-navigation');
    });

    // Handle high contrast mode
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.body.classList.add('high-contrast');
    }

    // Handle reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduce-motion');
    }
  }

  private setupKeyboardNavigation(): void {
    // Skip links
    this.createSkipLinks();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Alt + 1 = Main content
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        this.focusMainContent();
      }
      // Alt + 2 = Navigation
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        this.focusNavigation();
      }
      // Alt + 3 = Search
      if (e.altKey && e.key === '3') {
        e.preventDefault();
        this.focusSearch();
      }
    });
  }

  private createSkipLinks(): void {
    const skipLinks = [
      { id: 'skip-to-main', text: 'Skip to main content', target: 'main' },
      { id: 'skip-to-nav', text: 'Skip to navigation', target: 'nav' },
      { id: 'skip-to-search', text: 'Skip to search', target: 'search' },
    ];

    skipLinks.forEach(link => {
      const skipLink = document.createElement('a');
      skipLink.href = `#${link.target}`;
      skipLink.textContent = link.text;
      skipLink.className = 'skip-link';
      skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
      `;
      
      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
      });
      
      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
      });
      
      document.body.insertBefore(skipLink, document.body.firstChild);
    });
  }

  private setupFocusManagement(): void {
    // Track focus changes
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      this.highlightFocus(target);
      this.announceFocusChange(target);
    });

    // Ensure focus is visible
    document.addEventListener('focusout', (e) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!relatedTarget || relatedTarget.tabIndex < 0) {
        this.hideFocusOutline();
      }
    });
  }

  private highlightFocus(element: HTMLElement): void {
    if (!this.focusOutline) return;

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    this.focusOutline.style.display = 'block';
    this.focusOutline.style.top = `${rect.top + scrollTop - 2}px`;
    this.focusOutline.style.left = `${rect.left + scrollLeft - 2}px`;
    this.focusOutline.style.width = `${rect.width + 4}px`;
    this.focusOutline.style.height = `${rect.height + 4}px`;
  }

  private hideFocusOutline(): void {
    if (this.focusOutline) {
      this.focusOutline.style.display = 'none';
    }
  }

  private announceFocusChange(element: HTMLElement): void {
    const role = element.getAttribute('role');
    const ariaLabel = element.getAttribute('aria-label');
    const textContent = element.textContent?.trim();
    
    let announcement = '';
    
    if (ariaLabel) {
      announcement = ariaLabel;
    } else if (role) {
      announcement = `${role} focused`;
    } else if (textContent) {
      announcement = textContent;
    } else {
      announcement = `${element.tagName.toLowerCase()} focused`;
    }
    
    this.announceToScreenReader(announcement);
  }

  private setupScreenReaderSupport(): void {
    // Ensure all images have alt text
    this.checkImageAltText();
    
    // Ensure form inputs have labels
    this.checkFormLabels();
    
    // Check ARIA attributes
    this.checkARIAAttributes();
    
    // Check heading structure
    this.checkHeadingStructure();
  }

  private announceToScreenReader(message: string): void {
    if (!this.announcements) return;
    
    // Clear previous announcement
    this.announcements.textContent = '';
    
    // Add new announcement
    setTimeout(() => {
      this.announcements!.textContent = message;
    }, 100);
    
    // Clear after announcement
    setTimeout(() => {
      this.announcements!.textContent = '';
    }, 1000);
  }

  private runAccessibilityAudit(): void {
    this.issues = [];
    
    // Check color contrast
    this.checkColorContrast();
    
    // Check keyboard navigation
    this.checkKeyboardNavigation();
    
    // Check semantic HTML
    this.checkSemanticHTML();
    
    // Check ARIA implementation
    this.checkARIAImplementation();
    
    // Check form accessibility
    this.checkFormAccessibility();
    
    // Check media accessibility
    this.checkMediaAccessibility();
    
    // Generate report
    this.generateReport();
  }

  private checkColorContrast(): void {
    const elements = document.querySelectorAll('*');
    
    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      const color = style.color;
      
      if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && 
          color && color !== 'rgba(0, 0, 0, 0)') {
        const contrastRatio = this.getContrastRatio(color, backgroundColor);
        
        if (contrastRatio < 4.5) {
          this.issues.push({
            type: 'contrast',
            severity: contrastRatio < 3 ? 'high' : 'medium',
            element: element as HTMLElement,
            description: `Insufficient color contrast ratio: ${contrastRatio.toFixed(2)}:1`,
            recommendation: 'Increase contrast ratio to at least 4.5:1 for normal text, 3:1 for large text',
            wcagGuideline: 'WCAG 2.1 AA 1.4.3'
          });
        }
      }
    });
  }

  private getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    if (!rgb1 || !rgb2) return 1;
    
    const l1 = this.getRelativeLuminance(rgb1);
    const l2 = this.getRelativeLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private parseColor(color: string): { r: number; g: number; b: number } | null {
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    
    const computedColor = window.getComputedStyle(div).color;
    if (div.parentNode) div.remove();
    
    const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }
    
    return null;
  }

  private getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private checkKeyboardNavigation(): void {
    // Check for elements that should be focusable
    const clickableElements = document.querySelectorAll('div[onclick], span[onclick], a:not([href])');
    
    clickableElements.forEach(element => {
      if (!element.hasAttribute('tabindex') || element.getAttribute('tabindex') === '-1') {
        this.issues.push({
          type: 'keyboard',
          severity: 'high',
          element: element as HTMLElement,
          description: 'Interactive element is not keyboard accessible',
          recommendation: 'Add tabindex="0" and proper keyboard event handlers',
          wcagGuideline: 'WCAG 2.1 AA 2.1.1'
        });
      }
    });
    
    // Check for keyboard traps
    this.checkKeyboardTraps();
  }

  private checkKeyboardTraps(): void {
    // Simple check for potential keyboard traps
    const modals = document.querySelectorAll('[role="dialog"], .modal, .popup');
    
    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0 && !modal.querySelector('[data-focus-trap]')) {
        this.issues.push({
          type: 'keyboard',
          severity: 'medium',
          element: modal as HTMLElement,
          description: 'Modal may create keyboard trap',
          recommendation: 'Implement focus trap and proper keyboard navigation',
          wcagGuideline: 'WCAG 2.1 AA 2.4.3'
        });
      }
    });
  }

  private checkSemanticHTML(): void {
    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        this.issues.push({
          type: 'semantic',
          severity: 'medium',
          element: heading as HTMLElement,
          description: 'First heading should be h1',
          recommendation: 'Use h1 as the first heading on the page',
          wcagGuideline: 'WCAG 2.1 AA 1.3.1'
        });
      }
      
      if (level - previousLevel > 1 && previousLevel > 0) {
        this.issues.push({
          type: 'semantic',
          severity: 'low',
          element: heading as HTMLElement,
          description: `Heading level skipped: h${previousLevel} to h${level}`,
          recommendation: 'Maintain proper heading hierarchy',
          wcagGuideline: 'WCAG 2.1 AA 1.3.1'
        });
      }
      
      previousLevel = level;
    });
    
    // Check for lists without proper structure
    const lists = document.querySelectorAll('ul, ol');
    lists.forEach(list => {
      const directChildren = Array.from(list.children).filter(child => 
        child.tagName !== 'LI' && child.tagName !== 'SCRIPT'
      );
      
      if (directChildren.length > 0) {
        this.issues.push({
          type: 'semantic',
          severity: 'medium',
          element: list as HTMLElement,
          description: 'List contains non-list-item children',
          recommendation: 'Only li elements should be direct children of ul/ol',
          wcagGuideline: 'WCAG 2.1 AA 1.3.1'
        });
      }
    });
  }

  private checkARIAImplementation(): void {
    // Check for ARIA labels on interactive elements
    const interactiveElements = document.querySelectorAll(
      'button, a[href], input, select, textarea'
    );
    
    interactiveElements.forEach(element => {
      const hasLabel = element.hasAttribute('aria-label') || 
                      element.hasAttribute('aria-labelledby') ||
                      element.closest('label') !== null;
      
      if (!hasLabel && !element.textContent?.trim()) {
        this.issues.push({
          type: 'aria',
          severity: 'high',
          element: element as HTMLElement,
          description: 'Interactive element lacks accessible name',
          recommendation: 'Add aria-label, aria-labelledby, or wrap in label element',
          wcagGuideline: 'WCAG 2.1 AA 4.1.2'
        });
      }
    });
    
    // Check for duplicate ARIA IDs
    const ariaIds = document.querySelectorAll('[id]');
    const idCounts = new Map<string, number>();
    
    ariaIds.forEach(element => {
      const id = element.id;
      if (id) {
        idCounts.set(id, (idCounts.get(id) || 0) + 1);
      }
    });
    
    idCounts.forEach((count, id) => {
      if (count > 1) {
        const elements = document.querySelectorAll(`#${id}`);
        elements.forEach(element => {
          this.issues.push({
            type: 'aria',
            severity: 'high',
            element: element as HTMLElement,
            description: `Duplicate ID: ${id}`,
            recommendation: 'Ensure all IDs are unique',
            wcagGuideline: 'WCAG 2.1 AA 4.1.1'
          });
        });
      }
    });
  }

  private checkFormAccessibility(): void {
    // Check for form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      const id = input.id;
      const hasLabel = id ? document.querySelector(`label[for="${id}"]`) : false;
      const isWrappedInLabel = input.closest('label') !== null;
      const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
      
      if (!hasLabel && !isWrappedInLabel && !hasAriaLabel) {
        this.issues.push({
          type: 'aria',
          severity: 'high',
          element: input as HTMLElement,
          description: 'Form input lacks accessible label',
          recommendation: 'Associate label with input using for/id or wrap in label element',
          wcagGuideline: 'WCAG 2.1 AA 3.3.2'
        });
      }
    });
    
    // Check for required field indicators
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      const hasIndicator = field.hasAttribute('aria-required') ||
                          field.closest('label')?.textContent?.includes('*') ||
                          document.querySelector('.required-indicator');
      
      if (!hasIndicator) {
        this.issues.push({
          type: 'semantic',
          severity: 'medium',
          element: field as HTMLElement,
          description: 'Required field lacks visual indicator',
          recommendation: 'Add aria-required="true" or visual indicator',
          wcagGuideline: 'WCAG 2.1 AA 3.3.2'
        });
      }
    });
  }

  private checkImageAltText(): void {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const alt = img.getAttribute('alt');
      const role = img.getAttribute('role');
      
      if (role !== 'presentation' && !alt) {
        this.issues.push({
          type: 'screen-reader',
          severity: 'high',
          element: img as HTMLElement,
          description: 'Image lacks alt text',
          recommendation: 'Add descriptive alt text or role="presentation" for decorative images',
          wcagGuideline: 'WCAG 2.1 AA 1.1.1'
        });
      }
      
      if (alt === '') {
        this.issues.push({
          type: 'screen-reader',
          severity: 'low',
          element: img as HTMLElement,
          description: 'Image has empty alt text',
          recommendation: 'Ensure empty alt text is intentional for decorative images',
          wcagGuideline: 'WCAG 2.1 AA 1.1.1'
        });
      }
    });
  }

  private checkFormLabels(): void {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      const id = input.id;
      const hasLabel = id ? document.querySelector(`label[for="${id}"]`) !== null : false;
      const isInLabel = input.closest('label') !== null;
      const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
      
      if (!hasLabel && !isInLabel && !hasAriaLabel) {
        this.issues.push({
          type: 'screen-reader',
          severity: 'high',
          element: input as HTMLElement,
          description: 'Form input lacks accessible label',
          recommendation: 'Associate label with input or add aria-label',
          wcagGuideline: 'WCAG 2.1 AA 3.3.2'
        });
      }
    });
  }

  private checkARIAAttributes(): void {
    // Check for proper ARIA usage
    const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
    
    elementsWithAria.forEach(element => {
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      const ariaDescribedBy = element.getAttribute('aria-describedby');
      
      if (ariaLabelledBy) {
        const labelElement = document.getElementById(ariaLabelledBy);
        if (!labelElement) {
          this.issues.push({
            type: 'aria',
            severity: 'high',
            element: element as HTMLElement,
            description: `aria-labelledby references non-existent element: ${ariaLabelledBy}`,
            recommendation: 'Ensure referenced element exists',
            wcagGuideline: 'WCAG 2.1 AA 4.1.2'
          });
        }
      }
      
      if (ariaDescribedBy) {
        const descriptionElement = document.getElementById(ariaDescribedBy);
        if (!descriptionElement) {
          this.issues.push({
            type: 'aria',
            severity: 'medium',
            element: element as HTMLElement,
            description: `aria-describedby references non-existent element: ${ariaDescribedBy}`,
            recommendation: 'Ensure referenced element exists',
            wcagGuideline: 'WCAG 2.1 AA 4.1.2'
          });
        }
      }
    });
  }

  private checkHeadingStructure(): void {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        this.issues.push({
          type: 'semantic',
          severity: 'medium',
          element: heading as HTMLElement,
          description: 'First heading should be h1',
          recommendation: 'Start with h1 for main page title',
          wcagGuideline: 'WCAG 2.1 AA 1.3.1'
        });
      }
      
      if (level - previousLevel > 1 && previousLevel > 0) {
        this.issues.push({
          type: 'semantic',
          severity: 'low',
          element: heading as HTMLElement,
          description: `Heading level skipped: h${previousLevel} to h${level}`,
          recommendation: 'Maintain proper heading hierarchy',
          wcagGuideline: 'WCAG 2.1 AA 1.3.1'
        });
      }
      
      previousLevel = level;
    });
  }

  private checkMediaAccessibility(): void {
    // Check for video captions
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
      const hasCaptions = video.querySelector('track[kind="captions"]') !== null;
      
      if (!hasCaptions) {
        this.issues.push({
          type: 'screen-reader',
          severity: 'high',
          element: video as HTMLElement,
          description: 'Video lacks captions',
          recommendation: 'Add caption track for video content',
          wcagGuideline: 'WCAG 2.1 AA 1.2.2'
        });
      }
    });
  }

  private monitorUserInteractions(): void {
    // Track keyboard usage
    let tabCount = 0;
    let mouseCount = 0;
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        tabCount++;
        if (tabCount === 1) {
          trackEvent('accessibility', 'keyboard_navigation_started');
        }
      }
    });
    
    document.addEventListener('click', () => {
      mouseCount++;
      if (mouseCount === 1) {
        trackEvent('accessibility', 'mouse_navigation_started');
      }
    });
    
    // Track screen reader usage
    if ('speechSynthesis' in window) {
      trackEvent('accessibility', 'screen_reader_available');
    }
  }

  private focusMainContent(): void {
    const main = document.querySelector('main, [role="main"]');
    if (main) {
      (main as HTMLElement).focus();
      this.announceToScreenReader('Main content focused');
    }
  }

  private focusNavigation(): void {
    const nav = document.querySelector('nav, [role="navigation"]');
    if (nav) {
      (nav as HTMLElement).focus();
      this.announceToScreenReader('Navigation focused');
    }
  }

  private focusSearch(): void {
    const search = document.querySelector('input[type="search"], [role="search"] input');
    if (search) {
      (search as HTMLElement).focus();
      this.announceToScreenReader('Search input focused');
    }
  }

  private generateReport(): AccessibilityReport {
    const criticalIssues = this.issues.filter(i => i.severity === 'critical').length;
    const highIssues = this.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = this.issues.filter(i => i.severity === 'medium').length;
    const lowIssues = this.issues.filter(i => i.severity === 'low').length;
    
    const totalIssues = this.issues.length;
    const score = Math.max(0, 100 - (criticalIssues * 20 + highIssues * 10 + mediumIssues * 5 + lowIssues * 2));
    
    const report: AccessibilityReport = {
      score,
      issues: this.issues,
      warnings: this.generateWarnings(),
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
    
    // Track accessibility score
    trackEvent('accessibility', 'audit_completed', {
      score,
      totalIssues,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
    });
    
    return report;
  }

  private generateWarnings(): string[] {
    const warnings: string[] = [];
    
    if (this.issues.some(i => i.severity === 'critical')) {
      warnings.push('Critical accessibility issues found that may prevent users from accessing content');
    }
    
    if (this.issues.some(i => i.severity === 'high')) {
      warnings.push('High-severity issues found that significantly impact user experience');
    }
    
    if (this.issues.filter(i => i.type === 'contrast').length > 5) {
      warnings.push('Multiple color contrast issues detected across the page');
    }
    
    return warnings;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.issues.some(i => i.type === 'contrast')) {
      recommendations.push('Review and improve color contrast ratios throughout the site');
    }
    
    if (this.issues.some(i => i.type === 'keyboard')) {
      recommendations.push('Ensure all interactive elements are keyboard accessible');
    }
    
    if (this.issues.some(i => i.type === 'aria')) {
      recommendations.push('Review ARIA implementation for proper usage');
    }
    
    if (this.issues.some(i => i.type === 'screen-reader')) {
      recommendations.push('Improve screen reader support with proper labels and descriptions');
    }
    
    recommendations.push('Conduct regular accessibility audits and user testing');
    
    return recommendations;
  }

  getReport(): AccessibilityReport {
    return this.generateReport();
  }

  getIssues(): AccessibilityIssue[] {
    return [...this.issues];
  }

  getScore(): number {
    return this.generateReport().score;
  }
}

// Export singleton instance
export const accessibilityMonitor = new AccessibilityMonitor();

// Convenience functions
export const announceToScreenReader = (message: string): void => {
  accessibilityMonitor.announceToScreenReader(message);
};

export const checkAccessibility = (): AccessibilityReport => {
  return accessibilityMonitor.getReport();
};

export const getAccessibilityScore = (): number => {
  return accessibilityMonitor.getScore();
};

// Add CSS for accessibility features
const accessibilityStyles = `
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 10000;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}

.keyboard-navigation *:focus {
  outline: 3px solid #3b82f6 !important;
  outline-offset: 2px !important;
}

.high-contrast {
  filter: contrast(1.5);
}

.reduce-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = accessibilityStyles;
document.head.appendChild(styleSheet);
