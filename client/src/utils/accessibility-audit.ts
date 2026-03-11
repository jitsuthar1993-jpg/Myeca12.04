// Comprehensive Accessibility Audit and Fixing Utilities
import { useEffect, useState, useCallback } from 'react';

// Accessibility Issue Interface
interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  category: 'aria' | 'color-contrast' | 'keyboard' | 'semantics' | 'media' | 'forms' | 'navigation' | 'timing' | 'language';
  element: string;
  description: string;
  wcagGuideline: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  remediation: string;
  automatedFix?: () => void;
  manualFixRequired?: boolean;
}

// WCAG 2.1 Guidelines Reference
const WCAG_GUIDELINES = {
  '1.1.1': {
    level: 'A',
    title: 'Non-text Content',
    description: 'All non-text content that is presented to the user has a text alternative that serves the equivalent purpose'
  },
  '1.2.1': {
    level: 'A',
    title: 'Audio-only and Video-only (Prerecorded)',
    description: 'For prerecorded audio-only and prerecorded video-only media'
  },
  '1.3.1': {
    level: 'A',
    title: 'Info and Relationships',
    description: 'Information, structure, and relationships conveyed through presentation'
  },
  '1.4.1': {
    level: 'A',
    title: 'Use of Color',
    description: 'Color is not used as the only visual means of conveying information'
  },
  '1.4.3': {
    level: 'AA',
    title: 'Contrast (Minimum)',
    description: 'The visual presentation of text and images of text has a contrast ratio of at least 4.5:1'
  },
  '2.1.1': {
    level: 'A',
    title: 'Keyboard',
    description: 'All functionality of the content is operable through a keyboard interface'
  },
  '2.1.2': {
    level: 'A',
    title: 'No Keyboard Trap',
    description: 'If keyboard focus can be moved to a component of the page'
  },
  '2.4.1': {
    level: 'A',
    title: 'Bypass Blocks',
    description: 'A mechanism is available to bypass blocks of content'
  },
  '2.4.2': {
    level: 'A',
    title: 'Page Titled',
    description: 'Web pages have titles that describe topic or purpose'
  },
  '2.4.3': {
    level: 'A',
    title: 'Focus Order',
    description: 'If a Web page can be navigated sequentially'
  },
  '2.4.4': {
    level: 'A',
    title: 'Link Purpose (In Context)',
    description: 'The purpose of each link can be determined from the link text alone'
  },
  '2.4.7': {
    level: 'AA',
    title: 'Focus Visible',
    description: 'Any keyboard operable user interface has a mode of operation'
  },
  '3.1.1': {
    level: 'A',
    title: 'Language of Page',
    description: 'The default human language of each Web page can be programmatically determined'
  },
  '3.2.1': {
    level: 'A',
    title: 'On Focus',
    description: 'When any user interface component receives focus'
  },
  '3.2.2': {
    level: 'A',
    title: 'On Input',
    description: 'Changing the setting of any user interface component does not automatically cause a change of context'
  },
  '3.3.1': {
    level: 'A',
    title: 'Error Identification',
    description: 'If an input error is automatically detected'
  },
  '3.3.2': {
    level: 'A',
    title: 'Labels or Instructions',
    description: 'Labels or instructions are provided when content requires user input'
  },
  '4.1.1': {
    level: 'A',
    title: 'Parsing',
    description: 'In content implemented using markup languages, elements have complete start and end tags'
  },
  '4.1.2': {
    level: 'A',
    title: 'Name, Role, Value',
    description: 'For all user interface components, the name and role can be programmatically determined'
  }
};

// Accessibility Audit Service
class AccessibilityAuditService {
  private issues: AccessibilityIssue[] = [];
  private auditResults: Map<string, AccessibilityIssue[]> = new Map();

  // Comprehensive accessibility audit
  async performFullAudit(container: HTMLElement = document.body): Promise<AccessibilityIssue[]> {
    this.issues = [];

    // Run all audit checks
    this.checkImages(container);
    this.checkForms(container);
    this.checkLinks(container);
    this.checkHeadings(container);
    this.checkColorContrast(container);
    this.checkKeyboardNavigation(container);
    this.checkARIA(container);
    this.checkLandmarks(container);
    this.checkLanguage(container);
    this.checkFocus(container);
    this.checkMedia(container);
    this.checkTables(container);
    this.checkTiming(container);
    this.checkSemantics(container);

    return this.issues;
  }

  // Image accessibility checks
  private checkImages(container: HTMLElement): void {
    const images = container.querySelectorAll('img');
    
    images.forEach((img, index) => {
      // Check for alt text
      if (!img.hasAttribute('alt')) {
        this.addIssue({
          id: `img-alt-${index}`,
          type: 'error',
          severity: 'critical',
          category: 'media',
          element: 'img',
          description: 'Image missing alt attribute',
          wcagGuideline: '1.1.1',
          wcagLevel: 'A',
          remediation: 'Add meaningful alt text to describe the image',
          automatedFix: () => {
            img.setAttribute('alt', this.generateAltText(img));
          }
        });
      }

      // Check for empty alt text on decorative images
      if (img.getAttribute('alt') === '' && !this.isDecorativeImage(img)) {
        this.addIssue({
          id: `img-empty-alt-${index}`,
          type: 'warning',
          severity: 'moderate',
          category: 'media',
          element: 'img',
          description: 'Image has empty alt text but appears to be informative',
          wcagGuideline: '1.1.1',
          wcagLevel: 'A',
          remediation: 'Provide meaningful alt text or mark image as decorative',
          automatedFix: () => {
            img.setAttribute('alt', this.generateAltText(img));
          }
        });
      }

      // Check for longdesc on complex images
      if (img.clientWidth > 300 || img.clientHeight > 300) {
        if (!img.hasAttribute('longdesc') && !img.hasAttribute('aria-describedby')) {
          this.addIssue({
            id: `img-complex-${index}`,
            type: 'info',
            severity: 'minor',
            category: 'media',
            element: 'img',
            description: 'Large/complex image may need additional description',
            wcagGuideline: '1.1.1',
            wcagLevel: 'A',
            remediation: 'Consider adding longdesc or detailed description',
            manualFixRequired: true
          });
        }
      }
    });
  }

  // Form accessibility checks
  private checkForms(container: HTMLElement): void {
    const forms = container.querySelectorAll('form');
    const inputs = container.querySelectorAll('input, select, textarea');

    // Check form labels
    inputs.forEach((input, index) => {
      const inputId = input.id || `input-${index}`;
      
      if (!input.id) {
        input.id = inputId;
      }

      // Check for associated label
      const label = container.querySelector(`label[for="${inputId}"]`) || 
                   input.closest('label');
      
      if (!label && !input.hasAttribute('aria-label') && !input.hasAttribute('aria-labelledby')) {
        this.addIssue({
          id: `input-label-${index}`,
          type: 'error',
          severity: 'critical',
          category: 'forms',
          element: input.tagName.toLowerCase(),
          description: 'Form input missing accessible label',
          wcagGuideline: '3.3.2',
          wcagLevel: 'A',
          remediation: 'Add associated label or aria-label',
          automatedFix: () => {
            const label = document.createElement('label');
            label.htmlFor = inputId;
            label.textContent = this.generateLabelText(input);
            input.parentNode?.insertBefore(label, input);
          }
        });
      }

      // Check for required field indicators
      if (input.hasAttribute('required') && !label?.textContent?.includes('*')) {
        this.addIssue({
          id: `input-required-${index}`,
          type: 'warning',
          severity: 'moderate',
          category: 'forms',
          element: input.tagName.toLowerCase(),
          description: 'Required field not visually indicated',
          wcagGuideline: '3.3.2',
          wcagLevel: 'A',
          remediation: 'Add visual indicator for required fields',
          automatedFix: () => {
            if (label && !label.textContent?.includes('*')) {
              label.innerHTML = label.innerHTML + ' <span aria-hidden="true">*</span>';
              label.setAttribute('aria-label', label.textContent?.replace('*', 'required') || '');
            }
          }
        });
      }

      // Check for fieldset/legend on grouped inputs
      if (input.type === 'radio' || input.type === 'checkbox') {
        const fieldset = input.closest('fieldset');
        if (!fieldset || !fieldset.querySelector('legend')) {
          this.addIssue({
            id: `input-group-${index}`,
            type: 'warning',
            severity: 'moderate',
            category: 'forms',
            element: input.tagName.toLowerCase(),
            description: 'Grouped form inputs missing fieldset/legend',
            wcagGuideline: '3.3.2',
            wcagLevel: 'A',
            remediation: 'Use fieldset and legend for grouped inputs',
            manualFixRequired: true
          });
        }
      }
    });

    // Check form submission
    forms.forEach((form, index) => {
      if (!form.hasAttribute('novalidate') && !form.querySelector('[type="submit"]')) {
        this.addIssue({
          id: `form-submit-${index}`,
          type: 'warning',
          severity: 'moderate',
          category: 'forms',
          element: 'form',
          description: 'Form missing submit button',
          wcagGuideline: '3.3.2',
          wcagLevel: 'A',
          remediation: 'Add submit button or handle form submission',
          manualFixRequired: true
        });
      }
    });
  }

  // Link accessibility checks
  private checkLinks(container: HTMLElement): void {
    const links = container.querySelectorAll('a[href]');
    
    links.forEach((link, index) => {
      const text = link.textContent?.trim() || '';
      const href = link.getAttribute('href') || '';

      // Check for link text
      if (!text && !link.hasAttribute('aria-label') && !link.querySelector('img[alt]')) {
        this.addIssue({
          id: `link-text-${index}`,
          type: 'error',
          severity: 'serious',
          category: 'navigation',
          element: 'a',
          description: 'Link missing accessible text',
          wcagGuideline: '2.4.4',
          wcagLevel: 'A',
          remediation: 'Add meaningful link text or aria-label',
          automatedFix: () => {
            link.setAttribute('aria-label', this.generateLinkText(link));
          }
        });
      }

      // Check for generic link text
      const genericTexts = ['click here', 'read more', 'more', 'link', 'here'];
      if (genericTexts.some(generic => text.toLowerCase().includes(generic))) {
        this.addIssue({
          id: `link-generic-${index}`,
          type: 'warning',
          severity: 'moderate',
          category: 'navigation',
          element: 'a',
          description: 'Link uses generic text',
          wcagGuideline: '2.4.4',
          wcagLevel: 'A',
          remediation: 'Use descriptive link text that indicates purpose',
          manualFixRequired: true
        });
      }

      // Check for empty href
      if (!href || href === '#') {
        this.addIssue({
          id: `link-href-${index}`,
          type: 'error',
          severity: 'serious',
          category: 'navigation',
          element: 'a',
          description: 'Link has empty or placeholder href',
          wcagGuideline: '2.4.4',
          wcagLevel: 'A',
          remediation: 'Provide valid href or use button element',
          manualFixRequired: true
        });
      }

      // Check for new window links
      if (link.hasAttribute('target') && link.getAttribute('target') === '_blank') {
        if (!link.hasAttribute('aria-label') || !link.textContent?.includes('opens in new window')) {
          this.addIssue({
            id: `link-new-window-${index}`,
            type: 'warning',
            severity: 'moderate',
            category: 'navigation',
            element: 'a',
            description: 'Link opens in new window without warning',
            wcagGuideline: '3.2.5',
            wcagLevel: 'AAA',
            remediation: 'Inform users when links open in new windows',
            automatedFix: () => {
              const currentLabel = link.getAttribute('aria-label') || link.textContent || '';
              link.setAttribute('aria-label', `${currentLabel} (opens in new window)`);
            }
          });
        }
      }
    });
  }

  // Heading accessibility checks
  private checkHeadings(container: HTMLElement): void {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));

    // Check for empty headings
    headings.forEach((heading, index) => {
      if (!heading.textContent?.trim()) {
        this.addIssue({
          id: `heading-empty-${index}`,
          type: 'error',
          severity: 'serious',
          category: 'semantics',
          element: heading.tagName.toLowerCase(),
          description: 'Heading element is empty',
          wcagGuideline: '1.3.1',
          wcagLevel: 'A',
          remediation: 'Add meaningful heading text',
          manualFixRequired: true
        });
      }
    });

    // Check heading hierarchy
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i - 1] + 1) {
        this.addIssue({
          id: `heading-hierarchy-${i}`,
          type: 'warning',
          severity: 'moderate',
          category: 'semantics',
          element: 'heading',
          description: 'Heading hierarchy skipped',
          wcagGuideline: '1.3.1',
          wcagLevel: 'A',
          remediation: 'Use sequential heading levels (h1, h2, h3, etc.)',
          manualFixRequired: true
        });
      }
    }

    // Check for multiple h1 elements
    const h1Elements = container.querySelectorAll('h1');
    if (h1Elements.length > 1) {
      this.addIssue({
        id: 'heading-multiple-h1',
        type: 'warning',
        severity: 'moderate',
        category: 'semantics',
        element: 'h1',
        description: 'Multiple h1 elements found',
        wcagGuideline: '1.3.1',
        wcagLevel: 'A',
        remediation: 'Use only one h1 element per page',
        manualFixRequired: true
      });
    }
  }

  // Color contrast checks
  private checkColorContrast(container: HTMLElement): void {
    const textElements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, span, a, button, input, select, textarea');
    
    textElements.forEach((element, index) => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      
      if (color && backgroundColor && color !== backgroundColor) {
        const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
        
        if (contrastRatio < 4.5) {
          this.addIssue({
            id: `contrast-${index}`,
            type: 'error',
            severity: 'serious',
            category: 'color-contrast',
            element: element.tagName.toLowerCase(),
            description: `Color contrast ratio ${contrastRatio.toFixed(2)} is below WCAG AA standard (4.5:1)`,
            wcagGuideline: '1.4.3',
            wcagLevel: 'AA',
            remediation: 'Increase color contrast to at least 4.5:1',
            manualFixRequired: true
          });
        }
      }
    });
  }

  // Keyboard navigation checks
  private checkKeyboardNavigation(container: HTMLElement): void {
    const interactiveElements = container.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    const focusableElements = Array.from(interactiveElements).filter(el => {
      const tabindex = el.getAttribute('tabindex');
      return !el.hasAttribute('disabled') && (el.tagName === 'A' || el.tagName === 'BUTTON' || 
             el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || 
             (tabindex && parseInt(tabindex) >= 0));
    });

    // Check for missing focus indicators
    focusableElements.forEach((element, index) => {
      const computedStyle = window.getComputedStyle(element, ':focus');
      const outline = computedStyle.outline;
      
      if (outline === 'none' || outline === '0px') {
        this.addIssue({
          id: `focus-indicator-${index}`,
          type: 'warning',
          severity: 'serious',
          category: 'keyboard',
          element: element.tagName.toLowerCase(),
          description: 'Interactive element missing focus indicator',
          wcagGuideline: '2.4.7',
          wcagLevel: 'AA',
          remediation: 'Add visible focus indicator to interactive elements',
          automatedFix: () => {
            element.style.outline = '2px solid #0066cc';
            element.style.outlineOffset = '2px';
          }
        });
      }
    });

    // Check for keyboard traps
    const modalElements = container.querySelectorAll('[role="dialog"], .modal, [aria-modal="true"]');
    modalElements.forEach((modal, index) => {
      if (!modal.hasAttribute('aria-modal')) {
        this.addIssue({
          id: `modal-trap-${index}`,
          type: 'warning',
          severity: 'serious',
          category: 'keyboard',
          element: 'modal',
          description: 'Modal dialog may create keyboard trap',
          wcagGuideline: '2.1.2',
          wcagLevel: 'A',
          remediation: 'Implement proper focus management for modals',
          manualFixRequired: true
        });
      }
    });
  }

  // ARIA checks
  private checkARIA(container: HTMLElement): void {
    const ariaElements = container.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby]');
    
    ariaElements.forEach((element, index) => {
      const role = element.getAttribute('role');
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledby = element.getAttribute('aria-labelledby');
      const ariaDescribedby = element.getAttribute('aria-describedby');

      // Check for valid ARIA roles
      if (role && !this.isValidRole(role)) {
        this.addIssue({
          id: `aria-invalid-role-${index}`,
          type: 'error',
          severity: 'serious',
          category: 'aria',
          element: element.tagName.toLowerCase(),
          description: `Invalid ARIA role: ${role}`,
          wcagGuideline: '4.1.2',
          wcagLevel: 'A',
          remediation: 'Use valid ARIA role',
          manualFixRequired: true
        });
      }

      // Check for orphaned ARIA references
      if (ariaLabelledby) {
        const referencedElement = document.getElementById(ariaLabelledby);
        if (!referencedElement) {
          this.addIssue({
            id: `aria-orphaned-${index}`,
            type: 'error',
            severity: 'serious',
            category: 'aria',
            element: element.tagName.toLowerCase(),
            description: `ARIA reference points to non-existent element: ${ariaLabelledby}`,
            wcagGuideline: '4.1.2',
            wcagLevel: 'A',
            remediation: 'Ensure referenced element exists',
            manualFixRequired: true
          });
        }
      }

      // Check for redundant ARIA
      if (this.isSemanticElement(element) && (ariaLabel || role)) {
        this.addIssue({
          id: `aria-redundant-${index}`,
          type: 'info',
          severity: 'minor',
          category: 'aria',
          element: element.tagName.toLowerCase(),
          description: 'ARIA attributes may be redundant on semantic element',
          wcagGuideline: '4.1.2',
          wcagLevel: 'A',
          remediation: 'Consider if ARIA is necessary on semantic element',
          manualFixRequired: true
        });
      }
    });
  }

  // Landmarks checks
  private checkLandmarks(container: HTMLElement): void {
    const landmarks = container.querySelectorAll('main, nav, aside, header, footer, [role="main"], [role="navigation"], [role="complementary"], [role="banner"], [role="contentinfo"]');
    
    if (landmarks.length === 0) {
      this.addIssue({
        id: 'landmarks-missing',
        type: 'warning',
        severity: 'moderate',
        category: 'semantics',
        element: 'page',
        description: 'No landmarks found on page',
        wcagGuideline: '2.4.1',
        wcagLevel: 'A',
        remediation: 'Use semantic HTML5 elements or ARIA landmarks',
        manualFixRequired: true
      });
    }

    // Check for multiple main landmarks
    const mainElements = container.querySelectorAll('main, [role="main"]');
    if (mainElements.length > 1) {
      this.addIssue({
        id: 'landmarks-multiple-main',
        type: 'error',
        severity: 'serious',
        category: 'semantics',
        element: 'main',
        description: 'Multiple main landmarks found',
        wcagGuideline: '2.4.1',
        wcagLevel: 'A',
        remediation: 'Use only one main landmark per page',
        manualFixRequired: true
      });
    }
  }

  // Language checks
  private checkLanguage(container: HTMLElement): void {
    // Check page language
    const htmlElement = document.documentElement;
    if (!htmlElement.hasAttribute('lang')) {
      this.addIssue({
        id: 'language-missing',
        type: 'error',
        severity: 'serious',
        category: 'language',
        element: 'html',
        description: 'Page language not specified',
        wcagGuideline: '3.1.1',
        wcagLevel: 'A',
        remediation: 'Add lang attribute to html element',
        automatedFix: () => {
          htmlElement.setAttribute('lang', 'en');
        }
      });
    }

    // Check for language changes
    const langElements = container.querySelectorAll('[lang]');
    langElements.forEach((element, index) => {
      if (!element.hasAttribute('lang')) {
        this.addIssue({
          id: `language-change-${index}`,
          type: 'warning',
          severity: 'moderate',
          category: 'language',
          element: element.tagName.toLowerCase(),
          description: 'Language change may not be programmatically determined',
          wcagGuideline: '3.1.2',
          wcagLevel: 'AA',
          remediation: 'Use lang attribute for language changes',
          manualFixRequired: true
        });
      }
    });
  }

  // Focus management checks
  private checkFocus(container: HTMLElement): void {
    const focusableElements = container.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach((element, index) => {
      const tabindex = element.getAttribute('tabindex');
      
      if (tabindex && parseInt(tabindex) < 0) {
        this.addIssue({
          id: `focus-negative-${index}`,
          type: 'info',
          severity: 'minor',
          category: 'keyboard',
          element: element.tagName.toLowerCase(),
          description: 'Element has negative tabindex',
          wcagGuideline: '2.1.1',
          wcagLevel: 'A',
          remediation: 'Ensure element is reachable via keyboard',
          manualFixRequired: true
        });
      }
    });
  }

  // Media accessibility checks
  private checkMedia(container: HTMLElement): void {
    const videos = container.querySelectorAll('video');
    const audio = container.querySelectorAll('audio');

    videos.forEach((video, index) => {
      if (!video.querySelector('track[kind="captions"]')) {
        this.addIssue({
          id: `video-captions-${index}`,
          type: 'warning',
          severity: 'moderate',
          category: 'media',
          element: 'video',
          description: 'Video missing captions',
          wcagGuideline: '1.2.2',
          wcagLevel: 'A',
          remediation: 'Add captions track to video',
          manualFixRequired: true
        });
      }

      if (!video.hasAttribute('controls')) {
        this.addIssue({
          id: `video-controls-${index}`,
          type: 'warning',
          severity: 'moderate',
          category: 'media',
          element: 'video',
          description: 'Video missing controls',
          wcagGuideline: '2.1.1',
          wcagLevel: 'A',
          remediation: 'Add controls to video',
          automatedFix: () => {
            video.setAttribute('controls', '');
          }
        });
      }
    });

    audio.forEach((audio, index) => {
      if (!audio.querySelector('track[kind="captions"]')) {
        this.addIssue({
          id: `audio-transcript-${index}`,
          type: 'warning',
          severity: 'moderate',
          category: 'media',
          element: 'audio',
          description: 'Audio may need transcript',
          wcagGuideline: '1.2.1',
          wcagLevel: 'A',
          remediation: 'Provide transcript for audio content',
          manualFixRequired: true
        });
      }
    });
  }

  // Table accessibility checks
  private checkTables(container: HTMLElement): void {
    const tables = container.querySelectorAll('table');
    
    tables.forEach((table, index) => {
      if (!table.querySelector('caption')) {
        this.addIssue({
          id: `table-caption-${index}`,
          type: 'warning',
          severity: 'moderate',
          category: 'semantics',
          element: 'table',
          description: 'Table missing caption',
          wcagGuideline: '1.3.1',
          wcagLevel: 'A',
          remediation: 'Add caption to table',
          manualFixRequired: true
        });
      }

      if (!table.querySelector('th')) {
        this.addIssue({
          id: `table-headers-${index}`,
          type: 'error',
          severity: 'serious',
          category: 'semantics',
          element: 'table',
          description: 'Table missing header cells',
          wcagGuideline: '1.3.1',
          wcagLevel: 'A',
          remediation: 'Use th elements for table headers',
          manualFixRequired: true
        });
      }

      const headers = table.querySelectorAll('th');
      headers.forEach((header, headerIndex) => {
        if (!header.hasAttribute('scope')) {
          this.addIssue({
            id: `table-header-scope-${index}-${headerIndex}`,
            type: 'info',
            severity: 'minor',
            category: 'semantics',
            element: 'th',
            description: 'Table header missing scope attribute',
            wcagGuideline: '1.3.1',
            wcagLevel: 'A',
            remediation: 'Add scope attribute to header cells',
            automatedFix: () => {
              header.setAttribute('scope', headerIndex === 0 ? 'row' : 'col');
            }
          });
        }
      });
    });
  }

  // Timing checks
  private checkTiming(container: HTMLElement): void {
    const autoRefreshElements = container.querySelectorAll('[http-equiv="refresh"]');
    const autoRedirectElements = container.querySelectorAll('meta[http-equiv="refresh"]');
    
    autoRefreshElements.forEach((element, index) => {
      this.addIssue({
        id: `timing-refresh-${index}`,
        type: 'warning',
        severity: 'moderate',
        category: 'timing',
        element: 'meta',
        description: 'Page has automatic refresh',
        wcagGuideline: '2.2.1',
        wcagLevel: 'A',
        remediation: 'Provide user control over timing',
        manualFixRequired: true
      });
    });
  }

  // Semantic HTML checks
  private checkSemantics(container: HTMLElement): void {
    // Check for presentational elements
    const presentationalElements = container.querySelectorAll('b, i, u, font, center');
    
    presentationalElements.forEach((element, index) => {
      this.addIssue({
        id: `semantics-presentational-${index}`,
        type: 'info',
        severity: 'minor',
        category: 'semantics',
        element: element.tagName.toLowerCase(),
        description: 'Presentational element used',
        wcagGuideline: '1.3.1',
        wcagLevel: 'A',
        remediation: 'Use semantic HTML instead of presentational elements',
        manualFixRequired: true
      });
    });

    // Check for div/span soup
    const divs = container.querySelectorAll('div');
    const spans = container.querySelectorAll('span');
    
    if (divs.length > 50 || spans.length > 100) {
      this.addIssue({
        id: 'semantics-div-span-soup',
        type: 'info',
        severity: 'minor',
        category: 'semantics',
        element: 'div/span',
        description: 'Excessive use of div/span elements',
        wcagGuideline: '1.3.1',
        wcagLevel: 'A',
        remediation: 'Use semantic HTML5 elements where appropriate',
        manualFixRequired: true
      });
    }
  }

  // Helper methods
  private addIssue(issue: AccessibilityIssue): void {
    this.issues.push(issue);
  }

  private generateAltText(img: HTMLImageElement): string {
    const src = img.getAttribute('src') || '';
    const filename = src.split('/').pop() || 'image';
    return `Image: ${filename.replace(/\.[^/.]+$/, '')}`;
  }

  private generateLabelText(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
    const type = input.getAttribute('type') || input.tagName.toLowerCase();
    const name = input.getAttribute('name') || input.getAttribute('id') || 'input';
    return `${type} field: ${name}`;
  }

  private generateLinkText(link: HTMLAnchorElement): string {
    const href = link.getAttribute('href') || '';
    return `Link to ${href}`;
  }

  private isDecorativeImage(img: HTMLImageElement): boolean {
    const src = img.getAttribute('src') || '';
    return src.includes('decoration') || src.includes('spacer') || src.includes('blank');
  }

  private isValidRole(role: string): boolean {
    const validRoles = [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox',
      'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog',
      'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group',
      'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee',
      'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation',
      'none', 'note', 'option', 'presentation', 'progressbar', 'radio', 'radiogroup',
      'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox',
      'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist',
      'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
    ];
    return validRoles.includes(role);
  }

  private isSemanticElement(element: Element): boolean {
    const semanticTags = [
      'article', 'aside', 'details', 'figcaption', 'figure', 'footer', 'header',
      'main', 'mark', 'nav', 'section', 'summary', 'time'
    ];
    return semanticTags.includes(element.tagName.toLowerCase());
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast ratio calculation
    // In production, use proper color parsing and luminance calculation
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    if (!rgb1 || !rgb2) return 1;
    
    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private parseColor(color: string): { r: number; g: number; b: number } | null {
    // Simplified color parsing
    // In production, use proper color parsing library
    if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        return {
          r: parseInt(matches[0]),
          g: parseInt(matches[1]),
          b: parseInt(matches[2])
        };
      }
    }
    return null;
  }

  private getLuminance(rgb: { r: number; g: number; b: number }): number {
    const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  // Get audit results
  getAuditResults(): Map<string, AccessibilityIssue[]> {
    return this.auditResults;
  }

  // Get issues by category
  getIssuesByCategory(category: string): AccessibilityIssue[] {
    return this.issues.filter(issue => issue.category === category);
  }

  // Get issues by severity
  getIssuesBySeverity(severity: string): AccessibilityIssue[] {
    return this.issues.filter(issue => issue.severity === severity);
  }

  // Get fixable issues
  getFixableIssues(): AccessibilityIssue[] {
    return this.issues.filter(issue => issue.automatedFix && !issue.manualFixRequired);
  }

  // Apply automated fixes
  applyAutomatedFixes(): number {
    let fixesApplied = 0;
    this.getFixableIssues().forEach(issue => {
      if (issue.automatedFix) {
        try {
          issue.automatedFix();
          fixesApplied++;
        } catch (error) {
          console.error(`Failed to apply fix for issue ${issue.id}:`, error);
        }
      }
    });
    return fixesApplied;
  }

  // Generate audit report
  generateReport(): {
    totalIssues: number;
    issuesByCategory: Record<string, number>;
    issuesBySeverity: Record<string, number>;
    issuesByType: Record<string, number>;
    fixableIssues: number;
    manualFixesRequired: number;
    wcagCompliance: {
      levelA: number;
      levelAA: number;
      levelAAA: number;
    };
    recommendations: string[];
  } {
    const report = {
      totalIssues: this.issues.length,
      issuesByCategory: {} as Record<string, number>,
      issuesBySeverity: {} as Record<string, number>,
      issuesByType: {} as Record<string, number>,
      fixableIssues: this.getFixableIssues().length,
      manualFixesRequired: this.issues.filter(issue => issue.manualFixRequired).length,
      wcagCompliance: {
        levelA: this.issues.filter(issue => issue.wcagLevel === 'A').length,
        levelAA: this.issues.filter(issue => issue.wcagLevel === 'AA').length,
        levelAAA: this.issues.filter(issue => issue.wcagLevel === 'AAA').length
      },
      recommendations: this.generateRecommendations()
    };

    // Count issues by category
    this.issues.forEach(issue => {
      report.issuesByCategory[issue.category] = (report.issuesByCategory[issue.category] || 0) + 1;
      report.issuesBySeverity[issue.severity] = (report.issuesBySeverity[issue.severity] || 0) + 1;
      report.issuesByType[issue.type] = (report.issuesByType[issue.type] || 0) + 1;
    });

    return report;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const criticalIssues = this.issues.filter(issue => issue.severity === 'critical');
    const seriousIssues = this.issues.filter(issue => issue.severity === 'serious');
    
    if (criticalIssues.length > 0) {
      recommendations.push(`Address ${criticalIssues.length} critical accessibility issues immediately`);
    }
    
    if (seriousIssues.length > 0) {
      recommendations.push(`Fix ${seriousIssues.length} serious accessibility issues as soon as possible`);
    }
    
    const ariaIssues = this.issues.filter(issue => issue.category === 'aria');
    if (ariaIssues.length > 5) {
      recommendations.push('Review and fix ARIA implementation issues');
    }
    
    const colorContrastIssues = this.issues.filter(issue => issue.category === 'color-contrast');
    if (colorContrastIssues.length > 0) {
      recommendations.push('Improve color contrast ratios to meet WCAG standards');
    }
    
    const keyboardIssues = this.issues.filter(issue => issue.category === 'keyboard');
    if (keyboardIssues.length > 0) {
      recommendations.push('Enhance keyboard navigation and focus management');
    }
    
    return recommendations;
  }
}

// Accessibility Fixer Service
class AccessibilityFixerService {
  private auditService: AccessibilityAuditService;

  constructor(auditService: AccessibilityAuditService) {
    this.auditService = auditService;
  }

  // Apply all automated fixes
  async applyAllFixes(container: HTMLElement = document.body): Promise<{
    fixesApplied: number;
    issuesRemaining: number;
    report: any;
  }> {
    await this.auditService.performFullAudit(container);
    const fixesApplied = this.auditService.applyAutomatedFixes();
    const report = this.auditService.generateReport();
    
    return {
      fixesApplied,
      issuesRemaining: report.totalIssues - fixesApplied,
      report
    };
  }

  // Apply specific category fixes
  async applyCategoryFixes(category: string, container: HTMLElement = document.body): Promise<number> {
    await this.auditService.performFullAudit(container);
    const categoryIssues = this.auditService.getIssuesByCategory(category);
    const fixableIssues = categoryIssues.filter(issue => issue.automatedFix && !issue.manualFixRequired);
    
    let fixesApplied = 0;
    fixableIssues.forEach(issue => {
      if (issue.automatedFix) {
        try {
          issue.automatedFix();
          fixesApplied++;
        } catch (error) {
          console.error(`Failed to apply fix for issue ${issue.id}:`, error);
        }
      }
    });
    
    return fixesApplied;
  }

  // Generate accessibility statement
  generateAccessibilityStatement(): string {
    const report = this.auditService.generateReport();
    
    return `
      Accessibility Statement
      
      This website is committed to ensuring digital accessibility for people with disabilities.
      We are continually improving the user experience for everyone and applying the relevant
      accessibility standards.
      
      Current Status:
      - Total Issues Found: ${report.totalIssues}
      - Critical Issues: ${report.issuesBySeverity.critical || 0}
      - Serious Issues: ${report.issuesBySeverity.serious || 0}
      - Moderate Issues: ${report.issuesBySeverity.moderate || 0}
      - Minor Issues: ${report.issuesBySeverity.minor || 0}
      
      WCAG Compliance:
      - Level A Issues: ${report.wcagCompliance.levelA}
      - Level AA Issues: ${report.wcagCompliance.levelAA}
      - Level AAA Issues: ${report.wcagCompliance.levelAAA}
      
      Feedback:
      We welcome your feedback on the accessibility of this website. Please let us know if you
      encounter accessibility barriers.
    `;
  }
}

// React Hook for Accessibility
export const useAccessibility = (options: {
  autoFix?: boolean;
  auditOnMount?: boolean;
  continuousMonitoring?: boolean;
  reportInterval?: number;
} = {}) => {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [lastAudit, setLastAudit] = useState<Date | null>(null);
  const [fixesApplied, setFixesApplied] = useState(0);

  const auditService = new AccessibilityAuditService();
  const fixerService = new AccessibilityFixerService(auditService);

  const performAudit = useCallback(async (container?: HTMLElement) => {
    setIsAuditing(true);
    try {
      const auditIssues = await auditService.performFullAudit(container);
      setIssues(auditIssues);
      setLastAudit(new Date());
      
      if (options.autoFix) {
        const applied = auditService.applyAutomatedFixes();
        setFixesApplied(applied);
      }
      
      return auditIssues;
    } catch (error) {
      console.error('Accessibility audit failed:', error);
      return [];
    } finally {
      setIsAuditing(false);
    }
  }, [options.autoFix]);

  const applyFixes = useCallback(() => {
    const applied = auditService.applyAutomatedFixes();
    setFixesApplied(applied);
    return applied;
  }, []);

  const getReport = useCallback(() => {
    return auditService.generateReport();
  }, []);

  const getIssuesByCategory = useCallback((category: string) => {
    return auditService.getIssuesByCategory(category);
  }, []);

  const getIssuesBySeverity = useCallback((severity: string) => {
    return auditService.getIssuesBySeverity(severity);
  }, []);

  useEffect(() => {
    if (options.auditOnMount) {
      performAudit();
    }

    if (options.continuousMonitoring) {
      const interval = setInterval(() => {
        performAudit();
      }, options.reportInterval || 30000);

      return () => clearInterval(interval);
    }
  }, [options.auditOnMount, options.continuousMonitoring, options.reportInterval, performAudit]);

  return {
    issues,
    isAuditing,
    lastAudit,
    fixesApplied,
    performAudit,
    applyFixes,
    getReport,
    getIssuesByCategory,
    getIssuesBySeverity,
    auditService,
    fixerService
  };
};

// Accessibility Utilities
export const accessibilityUtils = {
  // Check if element is focusable
  isFocusable: (element: HTMLElement): boolean => {
    if (element.hasAttribute('disabled')) return false;
    
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];
    
    return focusableSelectors.some(selector => element.matches(selector));
  },

  // Get all focusable elements
  getFocusableElements: (container: HTMLElement = document.body): HTMLElement[] => {
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      '[contenteditable="true"]:not([disabled])'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(focusableSelector));
  },

  // Trap focus within element
  trapFocus: (element: HTMLElement): (() => void) => {
    const focusableElements = accessibilityUtils.getFocusableElements(element);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  },

  // Announce to screen readers
  announceToScreenReader: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.remove();
      }
    }, 1000);
  },

  // Skip link implementation
  createSkipLink: (targetId: string, text: string = 'Skip to main content'): HTMLElement => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
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
      z-index: 1000;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    return skipLink;
  }
};

export { AccessibilityAuditService, AccessibilityFixerService };
