// ARIA Labels and Semantic HTML Fixer Utility
import React, { useEffect, useState, useCallback } from 'react';

// ARIA Label Fixer Interface
interface ARIAFixResult {
  element: Element;
  issue: string;
  fix: string;
  applied: boolean;
  wcagGuideline: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

// Semantic HTML Fixer Interface
interface SemanticFixResult {
  element: Element;
  issue: string;
  recommendation: string;
  wcagGuideline: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

// ARIA Labels and Roles Reference
const VALID_ARIA_ROLES = [
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

const VALID_ARIA_PROPERTIES = [
  'aria-activedescendant', 'aria-atomic', 'aria-autocomplete', 'aria-busy', 'aria-checked',
  'aria-colcount', 'aria-colindex', 'aria-colspan', 'aria-controls', 'aria-current',
  'aria-describedby', 'aria-details', 'aria-disabled', 'aria-dropeffect', 'aria-errormessage',
  'aria-expanded', 'aria-flowto', 'aria-grabbed', 'aria-haspopup', 'aria-hidden', 'aria-invalid',
  'aria-keyshortcuts', 'aria-label', 'aria-labelledby', 'aria-level', 'aria-live', 'aria-modal',
  'aria-multiline', 'aria-multiselectable', 'aria-orientation', 'aria-owns', 'aria-placeholder',
  'aria-posinset', 'aria-pressed', 'aria-readonly', 'aria-relevant', 'aria-required',
  'aria-roledescription', 'aria-rowcount', 'aria-rowindex', 'aria-rowspan', 'aria-selected',
  'aria-setsize', 'aria-sort', 'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext'
];

// ARIA Labels and Semantic HTML Fixer Class
export class ARIASemanticFixer {
  private fixes: ARIAFixResult[] = [];
  private semanticIssues: SemanticFixResult[] = [];

  // Comprehensive ARIA audit
  performARIAAudit(container: HTMLElement = document.body): ARIAFixResult[] {
    this.fixes = [];

    // Check for missing ARIA labels
    this.checkMissingARIALabels(container);

    // Check for invalid ARIA roles
    this.checkInvalidARIARoles(container);

    // Check for orphaned ARIA references
    this.checkOrphanedARIAReferences(container);

    // Check for redundant ARIA
    this.checkRedundantARIA(container);

    // Check for missing ARIA states
    this.checkMissingARIAStates(container);

    // Check for incorrect ARIA usage
    this.checkIncorrectARIAUsage(container);

    // Check for ARIA live regions
    this.checkARIALiveRegions(container);

    // Check for ARIA landmarks
    this.checkARIALandmarks(container);

    return this.fixes;
  }

  // Check for missing ARIA labels
  private checkMissingARIALabels(container: HTMLElement): void {
    const interactiveElements = container.querySelectorAll(
      'button:not([aria-label]):not([aria-labelledby]), ' +
      'a[href]:not([aria-label]):not([aria-labelledby]), ' +
      'input:not([aria-label]):not([aria-labelledby]):not([id]), ' +
      'select:not([aria-label]):not([aria-labelledby]):not([id]), ' +
      'textarea:not([aria-label]):not([aria-labelledby]):not([id]), ' +
      '[role="button"]:not([aria-label]):not([aria-labelledby]), ' +
      '[role="link"]:not([aria-label]):not([aria-labelledby])'
    );

    interactiveElements.forEach((element, index) => {
      this.addARIAFix({
        element,
        issue: 'Interactive element missing accessible label',
        fix: 'Add aria-label or aria-labelledby attribute',
        applied: false,
        wcagGuideline: '4.1.2',
        wcagLevel: 'A'
      });
    });
  }

  // Check for invalid ARIA roles
  private checkInvalidARIARoles(container: HTMLElement): void {
    const elementsWithRole = container.querySelectorAll('[role]');
    
    elementsWithRole.forEach((element) => {
      const role = element.getAttribute('role');
      if (role && !VALID_ARIA_ROLES.includes(role)) {
        this.addARIAFix({
          element,
          issue: `Invalid ARIA role: ${role}`,
          fix: 'Use a valid ARIA role',
          applied: false,
          wcagGuideline: '4.1.2',
          wcagLevel: 'A'
        });
      }
    });
  }

  // Check for orphaned ARIA references
  private checkOrphanedARIAReferences(container: HTMLElement): void {
    const elementsWithRefs = container.querySelectorAll('[aria-describedby], [aria-labelledby], [aria-controls], [aria-owns]');
    
    elementsWithRefs.forEach((element) => {
      const describedBy = element.getAttribute('aria-describedby');
      const labelledBy = element.getAttribute('aria-labelledby');
      const controls = element.getAttribute('aria-controls');
      const owns = element.getAttribute('aria-owns');

      if (describedBy && !document.getElementById(describedBy)) {
        this.addARIAFix({
          element,
          issue: `Orphaned aria-describedby reference: ${describedBy}`,
          fix: 'Ensure referenced element exists or remove the reference',
          applied: false,
          wcagGuideline: '4.1.2',
          wcagLevel: 'A'
        });
      }

      if (labelledBy && !document.getElementById(labelledBy)) {
        this.addARIAFix({
          element,
          issue: `Orphaned aria-labelledby reference: ${labelledBy}`,
          fix: 'Ensure referenced element exists or remove the reference',
          applied: false,
          wcagGuideline: '4.1.2',
          wcagLevel: 'A'
        });
      }

      if (controls && !document.getElementById(controls)) {
        this.addARIAFix({
          element,
          issue: `Orphaned aria-controls reference: ${controls}`,
          fix: 'Ensure referenced element exists or remove the reference',
          applied: false,
          wcagGuideline: '4.1.2',
          wcagLevel: 'A'
        });
      }

      if (owns && !document.getElementById(owns)) {
        this.addARIAFix({
          element,
          issue: `Orphaned aria-owns reference: ${owns}`,
          fix: 'Ensure referenced element exists or remove the reference',
          applied: false,
          wcagGuideline: '4.1.2',
          wcagLevel: 'A'
        });
      }
    });
  }

  // Check for redundant ARIA
  private checkRedundantARIA(container: HTMLElement): void {
    const semanticElements = container.querySelectorAll('nav, main, header, footer, aside, section, article');
    
    semanticElements.forEach((element) => {
      const role = element.getAttribute('role');
      const tagName = element.tagName.toLowerCase();
      
      if (role && this.isRedundantRole(tagName, role)) {
        this.addARIAFix({
          element,
          issue: `Redundant ARIA role on semantic element: ${role} on <${tagName}>`,
          fix: 'Remove redundant ARIA role or use semantic HTML',
          applied: false,
          wcagGuideline: '4.1.2',
          wcagLevel: 'A'
        });
      }
    });
  }

  // Check for missing ARIA states
  private checkMissingARIAStates(container: HTMLElement): void {
    const elementsWithStates = container.querySelectorAll('[aria-expanded], [aria-selected], [aria-checked], [aria-pressed]');
    
    elementsWithStates.forEach((element) => {
      const expanded = element.getAttribute('aria-expanded');
      const selected = element.getAttribute('aria-selected');
      const checked = element.getAttribute('aria-checked');
      const pressed = element.getAttribute('aria-pressed');

      if (expanded && !['true', 'false'].includes(expanded)) {
        this.addARIAFix({
          element,
          issue: 'Invalid aria-expanded value',
          fix: 'Use "true" or "false" for aria-expanded',
          applied: false,
          wcagGuideline: '4.1.2',
          wcagLevel: 'A'
        });
      }

      if (selected && !['true', 'false'].includes(selected)) {
        this.addARIAFix({
          element,
          issue: 'Invalid aria-selected value',
          fix: 'Use "true" or "false" for aria-selected',
          applied: false,
          wcagGuideline: '4.1.2',
          wcagLevel: 'A'
        });
      }

      if (checked && !['true', 'false', 'mixed'].includes(checked)) {
        this.addARIAFix({
          element,
          issue: 'Invalid aria-checked value',
          fix: 'Use "true", "false", or "mixed" for aria-checked',
          applied: false,
          wcagGuideline: '4.1.2',
          wcagLevel: 'A'
        });
      }

      if (pressed && !['true', 'false', 'mixed'].includes(pressed)) {
        this.addARIAFix({
          element,
          issue: 'Invalid aria-pressed value',
          fix: 'Use "true", "false", or "mixed" for aria-pressed',
          applied: false,
          wcagGuideline: '4.1.2',
          wcagLevel: 'A'
        });
      }
    });
  }

  // Check for incorrect ARIA usage
  private checkIncorrectARIAUsage(container: HTMLElement): void {
    // Check for aria-hidden on focusable elements
    const focusableWithHidden = container.querySelectorAll(
      'a[href][aria-hidden="true"], ' +
      'button:not([disabled])[aria-hidden="true"], ' +
      'input:not([disabled])[aria-hidden="true"], ' +
      'select:not([disabled])[aria-hidden="true"], ' +
      'textarea:not([disabled])[aria-hidden="true"], ' +
      '[tabindex]:not([tabindex="-1"])[aria-hidden="true"]'
    );

    focusableWithHidden.forEach((element) => {
      this.addARIAFix({
        element,
        issue: 'Focusable element with aria-hidden="true"',
        fix: 'Remove aria-hidden or make element non-focusable',
        applied: false,
        wcagGuideline: '4.1.2',
        wcagLevel: 'A'
      });
    });

    // Check for missing required ARIA attributes
    const elementsWithRequiredARIA = container.querySelectorAll(
      '[role="slider"]:not([aria-valuemin]), ' +
      '[role="slider"]:not([aria-valuemax]), ' +
      '[role="slider"]:not([aria-valuenow]), ' +
      '[role="progressbar"]:not([aria-valuenow]), ' +
      '[role="spinbutton"]:not([aria-valuemin]), ' +
      '[role="spinbutton"]:not([aria-valuemax])'
    );

    elementsWithRequiredARIA.forEach((element) => {
      const role = element.getAttribute('role');
      this.addARIAFix({
        element,
        issue: `Missing required ARIA attributes for role: ${role}`,
        fix: 'Add required ARIA attributes for the specified role',
        applied: false,
        wcagGuideline: '4.1.2',
        wcagLevel: 'A'
      });
    });
  }

  // Check for ARIA live regions
  private checkARIALiveRegions(container: HTMLElement): void {
    const liveRegions = container.querySelectorAll('[aria-live]');
    
    liveRegions.forEach((element) => {
      const live = element.getAttribute('aria-live');
      const atomic = element.getAttribute('aria-atomic');
      
      if (!['polite', 'assertive', 'off'].includes(live || '')) {
        this.addARIAFix({
          element,
          issue: `Invalid aria-live value: ${live}`,
          fix: 'Use "polite", "assertive", or "off" for aria-live',
          applied: false,
          wcagGuideline: '4.1.2',
          wcagLevel: 'A'
        });
      }

      if (atomic && !['true', 'false'].includes(atomic)) {
        this.addARIAFix({
          element,
          issue: `Invalid aria-atomic value: ${atomic}`,
          fix: 'Use "true" or "false" for aria-atomic',
          applied: false,
          wcagGuideline: '4.1.2',
          wcagLevel: 'A'
        });
      }
    });
  }

  // Check for ARIA landmarks
  private checkARIALandmarks(container: HTMLElement): void {
    const landmarks = container.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]');
    
    if (landmarks.length === 0) {
      // Check for semantic HTML landmarks
      const semanticLandmarks = container.querySelectorAll('header, nav, main, aside, footer');
      
      if (semanticLandmarks.length === 0) {
        this.addARIAFix({
          element: container,
          issue: 'No ARIA landmarks or semantic HTML landmarks found',
          fix: 'Add ARIA landmarks or use semantic HTML elements',
          applied: false,
          wcagGuideline: '2.4.1',
          wcagLevel: 'A'
        });
      }
    }

    // Check for duplicate landmarks
    const landmarkTypes = new Set<string>();
    landmarks.forEach((element) => {
      const role = element.getAttribute('role');
      if (role && landmarkTypes.has(role) && ['main', 'banner', 'contentinfo'].includes(role)) {
        this.addARIAFix({
          element,
          issue: `Duplicate ${role} landmark found`,
          fix: 'Use only one main, banner, or contentinfo landmark per page',
          applied: false,
          wcagGuideline: '2.4.1',
          wcagLevel: 'A'
        });
      }
      landmarkTypes.add(role || '');
    });
  }

  // Semantic HTML audit
  performSemanticHTMLAudit(container: HTMLElement = document.body): SemanticFixResult[] {
    this.semanticIssues = [];

    // Check heading structure
    this.checkHeadingStructure(container);

    // Check for proper semantic elements
    this.checkSemanticElements(container);

    // Check for presentational elements
    this.checkPresentationalElements(container);

    // Check for definition lists
    this.checkDefinitionLists(container);

    // Check for figure and figcaption
    this.checkFigureElements(container);

    // Check for time elements
    this.checkTimeElements(container);

    // Check for quote elements
    this.checkQuoteElements(container);

    // Check for emphasis elements
    this.checkEmphasisElements(container);

    return this.semanticIssues;
  }

  // Check heading structure
  private checkHeadingStructure(container: HTMLElement): void {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const h1Count = container.querySelectorAll('h1').length;

    if (h1Count === 0) {
      this.addSemanticIssue({
        element: container,
        issue: 'No h1 heading found',
        recommendation: 'Add an h1 heading for the main page title',
        wcagGuideline: '1.3.1',
        wcagLevel: 'A'
      });
    }

    if (h1Count > 1) {
      this.addSemanticIssue({
        element: container,
        issue: 'Multiple h1 headings found',
        recommendation: 'Use only one h1 heading per page',
        wcagGuideline: '1.3.1',
        wcagLevel: 'A'
      });
    }

    // Check for skipped heading levels
    const levels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) {
        this.addSemanticIssue({
          element: headings[i],
          issue: 'Heading level skipped',
          recommendation: 'Use sequential heading levels (h1, h2, h3, etc.)',
          wcagGuideline: '1.3.1',
          wcagLevel: 'A'
        });
      }
    }
  }

  // Check for proper semantic elements
  private checkSemanticElements(container: HTMLElement): void {
    // Check for navigation without nav element
    const navLinks = container.querySelectorAll('div > a[href]');
    if (navLinks.length > 3) {
      const parent = navLinks[0].parentElement;
      if (parent && parent.tagName.toLowerCase() === 'div' && !parent.querySelector('nav')) {
        this.addSemanticIssue({
          element: parent,
          issue: 'Navigation links not in semantic nav element',
          recommendation: 'Use nav element for navigation links',
          wcagGuideline: '1.3.1',
          wcagLevel: 'A'
        });
      }
    }

    // Check for main content without main element
    const mainContentSelectors = ['#main', '#content', '.main', '.content'];
    const hasMainElement = container.querySelector('main');
    
    if (!hasMainElement) {
      const hasMainContent = mainContentSelectors.some(selector => container.querySelector(selector));
      if (hasMainContent) {
        this.addSemanticIssue({
          element: container,
          issue: 'Main content not in semantic main element',
          recommendation: 'Use main element for main content',
          wcagGuideline: '1.3.1',
          wcagLevel: 'A'
        });
      }
    }
  }

  // Check for presentational elements
  private checkPresentationalElements(container: HTMLElement): void {
    const presentationalElements = container.querySelectorAll('b, i, u, font, center, big, small');
    
    presentationalElements.forEach((element) => {
      this.addSemanticIssue({
        element,
        issue: `Presentational element used: <${element.tagName.toLowerCase()}>`,
        recommendation: 'Use semantic HTML or CSS instead of presentational elements',
        wcagGuideline: '1.3.1',
        wcagLevel: 'A'
      });
    });
  }

  // Check definition lists
  private checkDefinitionLists(container: HTMLElement): void {
    const definitionLists = container.querySelectorAll('dl');
    
    definitionLists.forEach((dl) => {
      const hasDt = dl.querySelector('dt');
      const hasDd = dl.querySelector('dd');
      
      if (!hasDt || !hasDd) {
        this.addSemanticIssue({
          element: dl,
          issue: 'Definition list missing dt or dd elements',
          recommendation: 'Use both dt and dd elements in definition lists',
          wcagGuideline: '1.3.1',
          wcagLevel: 'A'
        });
      }
    });
  }

  // Check figure elements
  private checkFigureElements(container: HTMLElement): void {
    const figures = container.querySelectorAll('figure');
    
    figures.forEach((figure) => {
      const hasImage = figure.querySelector('img, svg, canvas, video, audio');
      const hasFigcaption = figure.querySelector('figcaption');
      
      if (hasImage && !hasFigcaption) {
        this.addSemanticIssue({
          element: figure,
          issue: 'Figure element missing figcaption',
          recommendation: 'Add figcaption to provide caption for the figure',
          wcagGuideline: '1.1.1',
          wcagLevel: 'A'
        });
      }
    });
  }

  // Check time elements
  private checkTimeElements(container: HTMLElement): void {
    const timeElements = container.querySelectorAll('time:not([datetime])');
    
    timeElements.forEach((element) => {
      this.addSemanticIssue({
        element,
        issue: 'Time element missing datetime attribute',
        recommendation: 'Add datetime attribute to time elements',
        wcagGuideline: '1.3.1',
        wcagLevel: 'A'
      });
    });
  }

  // Check quote elements
  private checkQuoteElements(container: HTMLElement): void {
    const blockquotes = container.querySelectorAll('blockquote:not([cite])');
    
    blockquotes.forEach((element) => {
      this.addSemanticIssue({
        element,
        issue: 'Blockquote missing cite attribute',
        recommendation: 'Add cite attribute to blockquote elements when appropriate',
        wcagGuideline: '1.3.1',
        wcagLevel: 'A'
      });
    });
  }

  // Check emphasis elements
  private checkEmphasisElements(container: HTMLElement): void {
    const strongElements = container.querySelectorAll('strong');
    const emElements = container.querySelectorAll('em');
    
    strongElements.forEach((element) => {
      if (!element.textContent?.trim()) {
        this.addSemanticIssue({
          element,
          issue: 'Empty strong element',
          recommendation: 'Ensure strong elements contain meaningful content',
          wcagGuideline: '1.3.1',
          wcagLevel: 'A'
        });
      }
    });

    emElements.forEach((element) => {
      if (!element.textContent?.trim()) {
        this.addSemanticIssue({
          element,
          issue: 'Empty em element',
          recommendation: 'Ensure em elements contain meaningful content',
          wcagGuideline: '1.3.1',
          wcagLevel: 'A'
        });
      }
    });
  }

  // Helper methods
  private addARIAFix(fix: ARIAFixResult): void {
    this.fixes.push(fix);
  }

  private addSemanticIssue(issue: SemanticFixResult): void {
    this.semanticIssues.push(issue);
  }

  private isRedundantRole(tagName: string, role: string): boolean {
    const redundantMappings: Record<string, string[]> = {
      'nav': ['navigation'],
      'main': ['main'],
      'header': ['banner'],
      'footer': ['contentinfo'],
      'aside': ['complementary'],
      'section': ['region'],
      'article': ['article'],
      'button': ['button'],
      'a': ['link'],
      'img': ['img'],
      'input': ['textbox', 'checkbox', 'radio', 'button'],
      'select': ['listbox'],
      'textarea': ['textbox'],
      'ul': ['list'],
      'ol': ['list'],
      'li': ['listitem'],
      'table': ['table'],
      'thead': ['rowgroup'],
      'tbody': ['rowgroup'],
      'tfoot': ['rowgroup'],
      'tr': ['row'],
      'td': ['cell'],
      'th': ['columnheader', 'rowheader'],
      'h1': ['heading'],
      'h2': ['heading'],
      'h3': ['heading'],
      'h4': ['heading'],
      'h5': ['heading'],
      'h6': ['heading']
    };

    return redundantMappings[tagName]?.includes(role) || false;
  }

  // Apply automated ARIA fixes
  applyAutomatedARIAFixes(): number {
    let fixesApplied = 0;
    
    this.fixes.forEach((fix) => {
      if (fix.applied) return;
      
      try {
        this.applyARIAFix(fix);
        fix.applied = true;
        fixesApplied++;
      } catch (error) {
        console.error(`Failed to apply ARIA fix: ${fix.issue}`, error);
      }
    });
    
    return fixesApplied;
  }

  private applyARIAFix(fix: ARIAFixResult): void {
    const element = fix.element as HTMLElement;
    
    switch (fix.issue) {
      case 'Interactive element missing accessible label':
        // Generate appropriate label based on element type
        const label = this.generateAppropriateLabel(element);
        element.setAttribute('aria-label', label);
        break;
        
      case 'Invalid ARIA role':
        // Remove invalid role
        element.removeAttribute('role');
        break;
        
      case 'Focusable element with aria-hidden="true"':
        // Remove aria-hidden or make element non-focusable
        element.removeAttribute('aria-hidden');
        break;
        
      case 'Invalid aria-expanded value':
      case 'Invalid aria-selected value':
      case 'Invalid aria-checked value':
      case 'Invalid aria-pressed value':
        // Fix invalid boolean values
        const attrName = fix.issue.split(' ')[1];
        const currentValue = element.getAttribute(attrName);
        if (currentValue && !['true', 'false', 'mixed'].includes(currentValue)) {
          element.setAttribute(attrName, 'false');
        }
        break;
        
      case 'Missing required ARIA attributes for role':
        // Add missing required attributes
        this.addRequiredARIAAttributes(element);
        break;
        
      case 'Invalid aria-live value':
        element.setAttribute('aria-live', 'polite');
        break;
        
      case 'Invalid aria-atomic value':
        element.setAttribute('aria-atomic', 'false');
        break;
    }
  }

  private generateAppropriateLabel(element: Element): string {
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim() || '';
    const title = element.getAttribute('title') || '';
    
    if (textContent) {
      return textContent;
    }
    
    if (title) {
      return title;
    }
    
    switch (tagName) {
      case 'button':
        return 'Button';
      case 'a':
        const href = element.getAttribute('href');
        return href ? `Link to ${href}` : 'Link';
      case 'input':
        const type = element.getAttribute('type') || 'text';
        const name = element.getAttribute('name') || 'input';
        return `${type} input: ${name}`;
      case 'select':
        const selectName = element.getAttribute('name') || 'select';
        return `Select: ${selectName}`;
      case 'textarea':
        const textareaName = element.getAttribute('name') || 'textarea';
        return `Textarea: ${textareaName}`;
      default:
        return `${tagName} element`;
    }
  }

  private addRequiredARIAAttributes(element: Element): void {
    const role = element.getAttribute('role');
    
    switch (role) {
      case 'slider':
        element.setAttribute('aria-valuemin', '0');
        element.setAttribute('aria-valuemax', '100');
        element.setAttribute('aria-valuenow', '50');
        break;
      case 'progressbar':
        element.setAttribute('aria-valuenow', '0');
        break;
      case 'spinbutton':
        element.setAttribute('aria-valuemin', '0');
        element.setAttribute('aria-valuemax', '100');
        break;
    }
  }

  // Generate ARIA fixes report
  generateARIAReport(): {
    totalIssues: number;
    issuesByCategory: Record<string, number>;
    issuesByLevel: Record<string, number>;
    fixableIssues: number;
    recommendations: string[];
  } {
    const report = {
      totalIssues: this.fixes.length,
      issuesByCategory: {} as Record<string, number>,
      issuesByLevel: {} as Record<string, number>,
      fixableIssues: this.fixes.filter(f => !f.applied).length,
      recommendations: [] as string[]
    };

    // Count issues by category
    this.fixes.forEach(fix => {
      const category = this.categorizeARIAIssue(fix.issue);
      report.issuesByCategory[category] = (report.issuesByCategory[category] || 0) + 1;
      report.issuesByLevel[fix.wcagLevel] = (report.issuesByLevel[fix.wcagLevel] || 0) + 1;
    });

    // Generate recommendations
    const criticalIssues = this.fixes.filter(f => f.wcagLevel === 'A');
    const seriousIssues = this.fixes.filter(f => f.wcagLevel === 'AA');
    
    if (criticalIssues.length > 0) {
      report.recommendations.push(`Address ${criticalIssues.length} critical (Level A) ARIA issues immediately`);
    }
    
    if (seriousIssues.length > 0) {
      report.recommendations.push(`Fix ${seriousIssues.length} serious (Level AA) ARIA issues`);
    }

    if (report.fixableIssues > 0) {
      report.recommendations.push(`Apply automated fixes for ${report.fixableIssues} issues`);
    }

    return report;
  }

  private categorizeARIAIssue(issue: string): string {
    if (issue.includes('label')) return 'labels';
    if (issue.includes('role')) return 'roles';
    if (issue.includes('reference')) return 'references';
    if (issue.includes('state')) return 'states';
    if (issue.includes('live')) return 'live-regions';
    if (issue.includes('landmark')) return 'landmarks';
    return 'other';
  }
}

// React Hook for ARIA and Semantic HTML Fixes
export const useARIAFixer = (container?: HTMLElement) => {
  const [ariaIssues, setARIAIssues] = useState<ARIAFixResult[]>([]);
  const [semanticIssues, setSemanticIssues] = useState<SemanticFixResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fixesApplied, setFixesApplied] = useState(0);

  const fixer = new ARIASemanticFixer();

  const analyzeARIA = useCallback(async (targetContainer?: HTMLElement) => {
    setIsAnalyzing(true);
    try {
      const target = targetContainer || container || document.body;
      const ariaResults = fixer.performARIAAudit(target);
      const semanticResults = fixer.performSemanticHTMLAudit(target);
      
      setARIAIssues(ariaResults);
      setSemanticIssues(semanticResults);
      
      return { ariaIssues: ariaResults, semanticIssues: semanticResults };
    } catch (error) {
      console.error('ARIA analysis failed:', error);
      return { ariaIssues: [], semanticIssues: [] };
    } finally {
      setIsAnalyzing(false);
    }
  }, [container, fixer]);

  const applyARIAFixes = useCallback(() => {
    const applied = fixer.applyAutomatedARIAFixes();
    setFixesApplied(applied);
    return applied;
  }, [fixer]);

  const getARIAReport = useCallback(() => {
    return fixer.generateARIAReport();
  }, [fixer]);

  return {
    ariaIssues,
    semanticIssues,
    isAnalyzing,
    fixesApplied,
    analyzeARIA,
    applyARIAFixes,
    getARIAReport
  };
};

// ARIA Utilities
export const ariaUtils = {
  // Check if ARIA role is valid
  isValidRole: (role: string): boolean => {
    return VALID_ARIA_ROLES.includes(role);
  },

  // Check if ARIA property is valid
  isValidProperty: (property: string): boolean => {
    return VALID_ARIA_PROPERTIES.includes(property);
  },

  // Generate appropriate ARIA label
  generateARIALabel: (element: Element, context?: string): string => {
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim() || '';
    const title = element.getAttribute('title') || '';
    
    if (context) {
      return `${context}: ${textContent || title || tagName}`;
    }
    
    return textContent || title || `${tagName} element`;
  },

  // Get required ARIA attributes for role
  getRequiredARIAAttributes: (role: string): string[] => {
    const requiredAttributes: Record<string, string[]> = {
      'slider': ['aria-valuemin', 'aria-valuemax', 'aria-valuenow'],
      'progressbar': ['aria-valuenow'],
      'spinbutton': ['aria-valuemin', 'aria-valuemax'],
      'checkbox': ['aria-checked'],
      'radio': ['aria-checked'],
      'switch': ['aria-checked'],
      'button': [],
      'link': [],
      'textbox': [],
      'listbox': [],
      'option': ['aria-selected'],
      'menuitem': [],
      'menuitemcheckbox': ['aria-checked'],
      'menuitemradio': ['aria-checked'],
      'tab': ['aria-selected'],
      'gridcell': ['aria-selected'],
      'columnheader': [],
      'rowheader': []
    };
    
    return requiredAttributes[role] || [];
  },

  // Check if element needs ARIA label
  needsARIALabel: (element: Element): boolean => {
    const tagName = element.tagName.toLowerCase();
    const hasLabel = element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby');
    
    if (hasLabel) return false;
    
    const interactiveElements = ['button', 'a', 'input', 'select', 'textarea'];
    const rolesNeedingLabels = ['button', 'link', 'textbox', 'checkbox', 'radio', 'switch'];
    
    const role = element.getAttribute('role');
    
    return interactiveElements.includes(tagName) || 
           (role && rolesNeedingLabels.includes(role));
  },

  // Create ARIA live region
  createARIALiveRegion: (id: string, politeness: 'polite' | 'assertive' | 'off' = 'polite'): HTMLElement => {
    const region = document.createElement('div');
    region.id = id;
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    
    document.body.appendChild(region);
    return region;
  }
};

export default {
  ARIASemanticFixer,
  useARIAFixer,
  ariaUtils,
  VALID_ARIA_ROLES,
  VALID_ARIA_PROPERTIES
};

export type { ARIAFixResult, SemanticFixResult };