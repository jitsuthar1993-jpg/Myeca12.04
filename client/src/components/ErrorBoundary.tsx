import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isOffline: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isOffline: !navigator.onLine,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service (e.g., Sentry)
    this.reportError(error, errorInfo);
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ isOffline: false });
  };

  handleOffline = () => {
    this.setState({ isOffline: true });
  };

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Only report in production when endpoint exists
      if (process.env.NODE_ENV === 'production') {
        // Send error to backend for logging
        await fetch('/api/errors/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {
          // Silently fail if error reporting fails
        });
      }
    } catch {
      // Ignore error reporting failures
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo, isOffline } = this.state;
    const { children, fallback, showDetails = process.env.NODE_ENV === 'development' } = this.props;

    // Offline state
    if (isOffline) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <WifiOff className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">You're Offline</CardTitle>
              <CardDescription>
                Please check your internet connection and try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Don't worry! Your calculator data is saved locally. 
                You can still use basic calculators offline.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center gap-3">
              <Button onClick={this.handleReload} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    // Error state
    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Try refreshing the page or go back to the home page. 
                  If the problem persists, please contact support.
                </p>

                {showDetails && error && (
                  <details className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
                    <summary className="cursor-pointer font-medium text-gray-700 flex items-center gap-2">
                      <Bug className="h-4 w-4" />
                      Technical Details
                    </summary>
                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="font-medium text-gray-700">Error:</p>
                        <p className="text-red-600 font-mono text-xs break-all">
                          {error.message}
                        </p>
                      </div>
                      {error.stack && (
                        <div>
                          <p className="font-medium text-gray-700">Stack trace:</p>
                          <pre className="text-xs text-gray-600 overflow-auto max-h-40 bg-gray-200 p-2 rounded mt-1">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      {errorInfo?.componentStack && (
                        <div>
                          <p className="font-medium text-gray-700">Component stack:</p>
                          <pre className="text-xs text-gray-600 overflow-auto max-h-40 bg-gray-200 p-2 rounded mt-1">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-3">
              <Button onClick={this.handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleGoHome}>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

// ============================================
// Specialized Error Boundaries
// ============================================

// Calculator-specific error boundary
export function CalculatorErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <Card className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Calculator Error</h3>
          <p className="text-gray-600 mb-4">
            There was an error loading this calculator. Please try refreshing.
          </p>
          <Button onClick={() => window.location.reload()} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Form-specific error boundary
export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Form Error</span>
          </div>
          <p className="text-sm text-red-700">
            There was an error with this form. Please refresh and try again.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
