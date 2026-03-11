// Screen Reader Optimization Components
import React, { useEffect, useState, useRef, useCallback } from 'react';

// Screen Reader Announcement Component
interface ScreenReaderAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive' | 'off';
  clearAfter?: number;
  id?: string;
}

export const ScreenReaderAnnouncement: React.FC<ScreenReaderAnnouncementProps> = ({
  message,
  priority = 'polite',
  clearAfter = 3000,
  id = 'sr-announcement'
}) => {
  const [currentMessage, setCurrentMessage] = useState(message);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update the message
    setCurrentMessage(message);

    // Clear the message after the specified time
    if (clearAfter > 0) {
      timeoutRef.current = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  if (priority === 'off') return null;

  return (
    <div
      id={id}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
      }}
    >
      {currentMessage}
    </div>
  );
};

// Visually Hidden Component for Screen Reader Content
interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  focusable?: boolean;
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as: Component = 'span',
  className = '',
  focusable = false
}) => {
  const baseStyles = {
    position: 'absolute',
    left: '-10000px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0'
  } as const;

  const focusableStyles = focusable ? {
    ':focus': {
      position: 'static',
      width: 'auto',
      height: 'auto',
      overflow: 'visible',
      clip: 'auto',
      whiteSpace: 'normal'
    }
  } : {};

  return (
    <Component
      className={`visually-hidden ${className}`}
      style={{ ...baseStyles, ...focusableStyles }}
      {...(focusable && { tabIndex: 0 })}
    >
      {children}
    </Component>
  );
};

// Skip Link Component
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className = '',
  onClick
}) => {
  return (
    <a
      href={href}
      className={`skip-link ${className}`}
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '-40px',
        left: '6px',
        background: '#000',
        color: '#fff',
        padding: '8px 12px',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: 'var(--text-sm)',
        fontWeight: 'bold',
        zIndex: 1000,
        transition: 'top 0.3s ease',
        ':focus': {
          top: '6px'
        }
      }}
    >
      {children}
    </a>
  );
};

// Screen Reader Only Component
interface SROnlyProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const SROnly: React.FC<SROnlyProps> = ({
  children,
  id,
  className = ''
}) => {
  return (
    <span
      id={id}
      className={`sr-only ${className}`}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
      }}
    >
      {children}
    </span>
  );
};

// ARIA Live Region Component
interface AriaLiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  id?: string;
  className?: string;
}

export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  children,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions text',
  id = 'live-region',
  className = ''
}) => {
  return (
    <div
      id={id}
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={`aria-live-region ${className}`}
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
      }}
    >
      {children}
    </div>
  );
};

// Screen Reader Text Component for Dynamic Content
interface ScreenReaderTextProps {
  text: string;
  priority?: 'polite' | 'assertive';
  delay?: number;
  id?: string;
}

export const ScreenReaderText: React.FC<ScreenReaderTextProps> = ({
  text,
  priority = 'polite',
  delay = 0,
  id = 'sr-text'
}) => {
  const [announcement, setAnnouncement] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setAnnouncement(text);
      }, delay);
    } else {
      setAnnouncement(text);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, delay]);

  return (
    <ScreenReaderAnnouncement
      message={announcement}
      priority={priority}
      id={id}
      clearAfter={text ? 3000 : 0}
    />
  );
};

// Descriptive Text Component for Complex Images
interface DescriptiveTextProps {
  description: string;
  id?: string;
  className?: string;
}

export const DescriptiveText: React.FC<DescriptiveTextProps> = ({
  description,
  id = 'descriptive-text',
  className = ''
}) => {
  return (
    <div
      id={id}
      className={`descriptive-text ${className}`}
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
      }}
    >
      {description}
    </div>
  );
};

// Role-Based Component for Screen Reader Context
interface RoleBasedComponentProps {
  role: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  role,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  children,
  className = '',
  id
}) => {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      className={className}
      id={id}
    >
      {children}
    </div>
  );
};

// Screen Reader Status Component
interface ScreenReaderStatusProps {
  status: 'loading' | 'success' | 'error' | 'warning' | 'info';
  message: string;
  id?: string;
  priority?: 'polite' | 'assertive';
}

export const ScreenReaderStatus: React.FC<ScreenReaderStatusProps> = ({
  status,
  message,
  id = 'sr-status',
  priority = 'polite'
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setCurrentMessage(message);

    // Clear status after 5 seconds for non-loading states
    if (status !== 'loading') {
      timeoutRef.current = setTimeout(() => {
        setCurrentMessage('');
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, status]);

  return (
    <div
      id={id}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-status"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
      }}
    >
      {currentMessage}
    </div>
  );
};

// Screen Reader Navigation Component
interface ScreenReaderNavigationProps {
  sections: {
    id: string;
    title: string;
    description?: string;
  }[];
  currentSection?: string;
  onSectionChange?: (sectionId: string) => void;
}

export const ScreenReaderNavigation: React.FC<ScreenReaderNavigationProps> = ({
  sections,
  currentSection,
  onSectionChange
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (currentSection) {
      const section = sections.find(s => s.id === currentSection);
      if (section) {
        setAnnouncement(`Navigated to ${section.title} section${section.description ? `: ${section.description}` : ''}`);
      }
    }
  }, [currentSection, sections]);

  return (
    <>
      <nav role="navigation" aria-label="Screen reader navigation">
        <h2 className="sr-only">Section Navigation</h2>
        <ul role="list" className="sr-navigation-list">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={currentSection === section.id ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onSectionChange?.(section.id);
                  document.getElementById(section.id)?.focus();
                }}
              >
                {section.title}
                {section.description && (
                  <span className="sr-only">: {section.description}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      <ScreenReaderAnnouncement
        message={announcement}
        priority="polite"
        clearAfter={2000}
      />
    </>
  );
};

// Screen Reader Form Helper
interface ScreenReaderFormHelperProps {
  formId: string;
  instructions?: string;
  errors?: Record<string, string>;
  successMessage?: string;
  isSubmitting?: boolean;
}

export const ScreenReaderFormHelper: React.FC<ScreenReaderFormHelperProps> = ({
  formId,
  instructions,
  errors = {},
  successMessage,
  isSubmitting = false
}) => {
  const [announcement, setAnnouncement] = useState('');
  const errorCount = Object.keys(errors).length;

  useEffect(() => {
    if (isSubmitting) {
      setAnnouncement('Form is being submitted. Please wait.');
    } else if (successMessage) {
      setAnnouncement(successMessage);
    } else if (errorCount > 0) {
      setAnnouncement(`Form has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please review and correct.`);
    } else if (instructions) {
      setAnnouncement(instructions);
    }
  }, [instructions, errors, successMessage, isSubmitting, errorCount]);

  return (
    <>
      <div id={`${formId}-instructions`} className="sr-only">
        {instructions}
      </div>
      
      {Object.entries(errors).map(([field, error]) => (
        <div
          key={field}
          id={`${formId}-${field}-error`}
          role="alert"
          aria-live="assertive"
          className="sr-only"
        >
          {error}
        </div>
      ))}
      
      <ScreenReaderAnnouncement
        message={announcement}
        priority={errorCount > 0 ? 'assertive' : 'polite'}
        clearAfter={errorCount > 0 ? 0 : 3000}
      />
    </>
  );
};

// Screen Reader Table Helper
interface ScreenReaderTableHelperProps {
  tableId: string;
  caption: string;
  summary?: string;
  rowCount: number;
  columnCount: number;
  hasHeaders: boolean;
}

export const ScreenReaderTableHelper: React.FC<ScreenReaderTableHelperProps> = ({
  tableId,
  caption,
  summary,
  rowCount,
  columnCount,
  hasHeaders
}) => {
  const tableInfo = `Table: ${caption}. ${rowCount} rows, ${columnCount} columns. ${hasHeaders ? 'Has headers.' : 'No headers.'} ${summary || ''}`;

  return (
    <caption id={`${tableId}-caption`} className="sr-only">
      {tableInfo}
    </caption>
  );
};

// Screen Reader Loading Component
interface ScreenReaderLoadingProps {
  isLoading: boolean;
  loadingText?: string;
  loadedText?: string;
  id?: string;
}

export const ScreenReaderLoading: React.FC<ScreenReaderLoadingProps> = ({
  isLoading,
  loadingText = 'Loading content...',
  loadedText = 'Content loaded successfully',
  id = 'sr-loading'
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (isLoading) {
      setAnnouncement(loadingText);
    } else {
      setAnnouncement(loadedText);
    }
  }, [isLoading, loadingText, loadedText]);

  return (
    <ScreenReaderAnnouncement
      message={announcement}
      priority="polite"
      id={id}
      clearAfter={isLoading ? 0 : 2000}
    />
  );
};

// Screen Reader Error Boundary
interface ScreenReaderErrorBoundaryProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ScreenReaderErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ScreenReaderErrorBoundary extends React.Component<
  ScreenReaderErrorBoundaryProps,
  ScreenReaderErrorBoundaryState
> {
  constructor(props: ScreenReaderErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ScreenReaderErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Screen Reader Error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <ScreenReaderAnnouncement
            message={this.props.fallbackMessage || 'An error occurred. Please refresh the page.'}
            priority="assertive"
          />
          <div role="alert" className="sr-only">
            Error: {this.state.error?.message}
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

// Screen Reader Utilities
export const screenReaderUtils = {
  // Announce to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.remove();
      }
    }, 1000);
  },

  // Create live region
  createLiveRegion: (id: string, priority: 'polite' | 'assertive' = 'polite'): HTMLElement => {
    const region = document.createElement('div');
    region.id = id;
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
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
  },

  // Remove live region
  removeLiveRegion: (element: HTMLElement): void => {
    if (element && element.parentNode) {
      element.remove();
    }
  },

  // Check if screen reader is likely active
  isScreenReaderLikelyActive: (): boolean => {
    // Check for common screen reader indicators
    return (
      'ontouchstart' in window || // Touch device
      navigator.maxTouchPoints > 0 || // Touch capability
      window.matchMedia('(prefers-reduced-motion: reduce)').matches || // Reduced motion
      document.documentElement.getAttribute('data-screen-reader') === 'true'
    );
  },

  // Get screen reader friendly text
  getScreenReaderText: (text: string, context?: string): string => {
    // Convert common abbreviations and symbols
    const replacements: Record<string, string> = {
      '&': 'and',
      '@': 'at',
      '#': 'number',
      '$': 'dollar',
      '%': 'percent',
      '+': 'plus',
      '=': 'equals',
      '→': 'right arrow',
      '←': 'left arrow',
      '↑': 'up arrow',
      '↓': 'down arrow'
    };

    let result = text;
    Object.entries(replacements).forEach(([symbol, replacement]) => {
      result = result.replace(new RegExp(`\\${symbol}`, 'g'), replacement);
    });

    return context ? `${context}: ${result}` : result;
  }
};

export default {
  ScreenReaderAnnouncement,
  VisuallyHidden,
  SkipLink,
  SROnly,
  AriaLiveRegion,
  ScreenReaderText,
  DescriptiveText,
  RoleBasedComponent,
  ScreenReaderStatus,
  ScreenReaderNavigation,
  ScreenReaderFormHelper,
  ScreenReaderTableHelper,
  ScreenReaderLoading,
  ScreenReaderErrorBoundary,
  screenReaderUtils
};
