import { trackEvent } from './analytics';

export interface ErrorInfo {
  message: string;
  stack?: string;
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'api' | 'ui' | 'validation' | 'network' | 'security' | 'unknown';
  context?: Record<string, any>;
}

export class AppError extends Error {
  public severity: ErrorInfo['severity'];
  public category: ErrorInfo['category'];
  public context?: Record<string, any>;
  public component?: string;
  public action?: string;

  constructor(
    message: string,
    category: ErrorInfo['category'] = 'unknown',
    severity: ErrorInfo['severity'] = 'medium',
    context?: Record<string, any>,
    component?: string,
    action?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.category = category;
    this.severity = severity;
    this.context = context;
    this.component = component;
    this.action = action;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

class ErrorHandler {
  private errorQueue: ErrorInfo[] = [];
  private isReporting = false;
  private readonly MAX_QUEUE_SIZE = 50;
  private readonly BATCH_SIZE = 10;
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000;

  constructor() {
    this.setupGlobalErrorHandlers();
    this.setupUnhandledRejectionHandlers();
    this.startErrorReporting();
  }

  private setupGlobalErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event: ErrorEvent) => {
      this.handleError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'high',
        category: 'ui',
        context: {
          lineNumber: event.lineno,
          columnNumber: event.colno,
          target: event.target?.toString(),
        },
      });
    });

    // Global unhandled rejection handler
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const errorInfo: ErrorInfo = {
        message: reason?.message || 'Unhandled Promise Rejection',
        stack: reason?.stack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'medium',
        category: 'ui',
        context: {
          reason: reason?.toString(),
          type: reason?.constructor?.name,
        },
      };

      this.handleError(errorInfo);
    });
  }

  private setupUnhandledRejectionHandlers(): void {
    // Handle Vue.js errors
    if ((window as any).Vue) {
      (window as any).Vue.config.errorHandler = (error: Error, vm: any, info: string) => {
        this.handleError({
          message: error.message,
          stack: error.stack,
          component: vm?.$options?.name,
          action: info,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          severity: 'medium',
          category: 'ui',
          context: {
            componentInstance: vm?.$options?.name,
            lifecycleHook: info,
          },
        });
      };
    }

    // Handle React errors (if using ErrorBoundary)
    if ((window as any).React) {
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        originalConsoleError.apply(console, args);
        
        // Detect React errors
        if (args.some(arg => 
          arg?.toString().includes('React') || 
          arg?.toString().includes('Warning')
        )) {
          this.handleError({
            message: args.join(' '),
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            severity: 'low',
            category: 'ui',
            context: {
              consoleArgs: args,
            },
          });
        }
      };
    }
  }

  handleError(error: Error | ErrorInfo | string): void {
    let errorInfo: ErrorInfo;

    if (typeof error === 'string') {
      errorInfo = {
        message: error,
        timestamp: new Date().toISOString(),
        severity: 'low',
        category: 'unknown',
      };
    } else if (error instanceof AppError) {
      errorInfo = {
        message: error.message,
        stack: error.stack,
        component: error.component,
        action: error.action,
        userId: this.getUserId(),
        sessionId: this.getSessionId(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: error.severity,
        category: error.category,
        context: error.context,
      };
    } else if (error instanceof Error) {
      errorInfo = {
        message: error.message,
        stack: error.stack,
        userId: this.getUserId(),
        sessionId: this.getSessionId(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'medium',
        category: 'unknown',
      };
    } else {
      errorInfo = {
        ...error,
        timestamp: error.timestamp || new Date().toISOString(),
        userId: error.userId || this.getUserId(),
        sessionId: error.sessionId || this.getSessionId(),
        url: error.url || window.location.href,
        userAgent: error.userAgent || navigator.userAgent,
      };
    }

    // Add to queue for batch reporting
    this.errorQueue.push(errorInfo);

    // Keep queue size manageable
    if (this.errorQueue.length > this.MAX_QUEUE_SIZE) {
      this.errorQueue = this.errorQueue.slice(-this.MAX_QUEUE_SIZE);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('App Error:', errorInfo);
    }

    // Track in analytics
    trackEvent('error', errorInfo.category, {
      severity: errorInfo.severity,
      component: errorInfo.component,
      action: errorInfo.action,
      message: errorInfo.message.substring(0, 100), // Truncate for analytics
    });

    // Show user-friendly error notification based on severity
    this.notifyUser(errorInfo);
  }

  private notifyUser(errorInfo: ErrorInfo): void {
    // Only show notifications for medium severity and above
    if (errorInfo.severity === 'low') return;

    // Use a toast notification system or custom notification
    const notification = this.createNotification(errorInfo);
    
    if (notification) {
      document.body.appendChild(notification);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) notification.remove();
      }, 5000);
    }
  }

  private createNotification(errorInfo: ErrorInfo): HTMLElement | null {
    const notification = document.createElement('div');
    notification.className = `error-notification error-${errorInfo.severity}`;
    notification.innerHTML = `
      <div class="error-notification-content">
        <div class="error-notification-icon">
          ${this.getIconForSeverity(errorInfo.severity)}
        </div>
        <div class="error-notification-text">
          <div class="error-notification-title">${this.getTitleForSeverity(errorInfo.severity)}</div>
          <div class="error-notification-message">${this.getUserFriendlyMessage(errorInfo)}</div>
        </div>
        <button class="error-notification-close" onclick="if(this.parentElement && this.parentElement.parentElement) this.parentElement.parentElement.remove()">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>
    `;
    
    return notification;
  }

  private getIconForSeverity(severity: ErrorInfo['severity']): string {
    const icons = {
      low: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>',
      medium: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
      high: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
      critical: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
    };
    
    return icons[severity];
  }

  private getTitleForSeverity(severity: ErrorInfo['severity']): string {
    const titles = {
      low: 'Information',
      medium: 'Warning',
      high: 'Error',
      critical: 'Critical Error',
    };
    
    return titles[severity];
  }

  private getUserFriendlyMessage(errorInfo: ErrorInfo): string {
    // Map technical errors to user-friendly messages
    const errorMessages: Record<string, string> = {
      'network': 'Please check your internet connection and try again.',
      'validation': 'Please check your input and try again.',
      'authentication': 'Please log in again to continue.',
      'authorization': 'You don\'t have permission to perform this action.',
      'server': 'Something went wrong on our end. Please try again later.',
      'database': 'We\'re experiencing technical difficulties. Please try again later.',
    };
    
    // Try to match error message patterns
    for (const [pattern, message] of Object.entries(errorMessages)) {
      if (errorInfo.message.toLowerCase().includes(pattern)) {
        return message;
      }
    }
    
    // Default message based on severity
    const defaultMessages = {
      low: errorInfo.message,
      medium: 'Something went wrong. Please try again.',
      high: 'An error occurred. Please refresh the page and try again.',
      critical: 'A critical error occurred. Please contact support if the issue persists.',
    };
    
    return defaultMessages[errorInfo.severity];
  }

  private getUserId(): string | undefined {
    // Get user ID from auth context or localStorage
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.id || userData.userId;
      }
    } catch (error) {
      // Ignore JSON parse errors
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    // Get session ID from sessionStorage or generate one
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private startErrorReporting(): void {
    // Report errors in batches every 30 seconds
    setInterval(() => {
      if (this.errorQueue.length > 0 && !this.isReporting) {
        this.reportErrors();
      }
    }, 30000);
    
    // Report errors on page unload
    window.addEventListener('beforeunload', () => {
      if (this.errorQueue.length > 0) {
        this.reportErrors(true); // Force sync reporting
      }
    });
  }

  private async reportErrors(forceSync = false): Promise<void> {
    if (this.errorQueue.length === 0) return;
    
    this.isReporting = true;
    const errorsToReport = this.errorQueue.splice(0, this.BATCH_SIZE);
    
    try {
      if (forceSync) {
        // Use sendBeacon for synchronous reporting on page unload
        if (navigator.sendBeacon) {
          const data = JSON.stringify({ errors: errorsToReport });
          navigator.sendBeacon('/api/errors', data);
        }
      } else {
        // Use fetch for normal reporting
        await fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ errors: errorsToReport }),
        });
      }
    } catch (error) {
      // If reporting fails, add errors back to queue
      this.errorQueue.unshift(...errorsToReport);
      
      // Limit retry attempts
      if (this.errorQueue.length > this.MAX_QUEUE_SIZE * 2) {
        this.errorQueue = this.errorQueue.slice(-this.MAX_QUEUE_SIZE);
      }
    } finally {
      this.isReporting = false;
    }
  }

  // Public methods for manual error handling
  logError(error: Error | string, context?: Record<string, any>): void {
    this.handleError(error instanceof Error ? error : new Error(error));
  }

  logWarning(message: string, context?: Record<string, any>): void {
    const warning = new AppError(message, 'ui', 'low', context);
    this.handleError(warning);
  }

  logInfo(message: string, context?: Record<string, any>): void {
    console.info('Info:', message, context);
    // Info messages are not sent to error reporting
  }

  getErrorQueueSize(): number {
    return this.errorQueue.length;
  }

  clearErrorQueue(): void {
    this.errorQueue = [];
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Convenience functions
export const logError = (error: Error | string, context?: Record<string, any>): void => {
  errorHandler.logError(error, context);
};

export const logWarning = (message: string, context?: Record<string, any>): void => {
  errorHandler.logWarning(message, context);
};

export const logInfo = (message: string, context?: Record<string, any>): void => {
  errorHandler.logInfo(message, context);
};

// Error boundary helper for React
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> => {
  return class extends React.Component<P> {
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      errorHandler.handleError(new AppError(
        error.message,
        'ui',
        'high',
        { errorInfo: errorInfo.componentStack },
        componentName,
        'componentDidCatch'
      ));
    }

    render() {
      return React.createElement(Component, this.props);
    }
  };
};

// Async error wrapper
export const withAsyncErrorHandling = async <T>(
  promise: Promise<T>,
  context?: Record<string, any>
): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    errorHandler.handleError(error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
};

// API error handler
export const handleApiError = (error: any, endpoint: string, context?: Record<string, any>): AppError => {
  let message = 'An error occurred while processing your request.';
  let severity: ErrorInfo['severity'] = 'medium';
  let category: ErrorInfo['category'] = 'api';

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        message = data.message || 'Invalid request. Please check your input.';
        severity = 'low';
        category = 'validation';
        break;
      case 401:
        message = 'Authentication required. Please log in again.';
        severity = 'medium';
        category = 'authentication';
        break;
      case 403:
        message = 'You don\'t have permission to perform this action.';
        severity = 'medium';
        category = 'authorization';
        break;
      case 404:
        message = 'The requested resource was not found.';
        severity = 'low';
        break;
      case 429:
        message = 'Too many requests. Please try again later.';
        severity = 'low';
        break;
      case 500:
      case 502:
      case 503:
        message = 'Server error. Please try again later.';
        severity = 'high';
        category = 'server';
        break;
      default:
        message = data.message || 'An unexpected error occurred.';
        severity = 'medium';
    }
  } else if (error.request) {
    // Request made but no response received
    message = 'Network error. Please check your connection.';
    severity = 'high';
    category = 'network';
  } else {
    // Something else happened
    message = error.message || 'An unexpected error occurred.';
    severity = 'medium';
  }

  return new AppError(message, category, severity, {
    ...context,
    endpoint,
    originalError: error.message,
    stack: error.stack,
  });
};

// Add CSS for error notifications
const errorNotificationStyles = `
.error-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  animation: slideInRight 0.3s ease-out;
}

.error-notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-notification-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
}

.error-notification-text {
  flex: 1;
}

.error-notification-title {
  font-weight: 600;
  font-size: var(--text-sm);
  margin-bottom: 4px;
  color: #1f2937;
}

.error-notification-message {
  font-size: var(--text-xs);
  color: #6b7280;
  line-height: 1.4;
}

.error-notification-close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #9ca3af;
  border-radius: 4px;
  transition: color 0.2s;
}

.error-notification-close:hover {
  color: #6b7280;
}

.error-low {
  border-left: 4px solid #3b82f6;
}

.error-medium {
  border-left: 4px solid #f59e0b;
}

.error-high {
  border-left: 4px solid #ef4444;
}

.error-critical {
  border-left: 4px solid #dc2626;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = errorNotificationStyles;
document.head.appendChild(styleSheet);
