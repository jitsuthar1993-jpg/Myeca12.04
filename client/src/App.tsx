import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useRoutePreload } from '@/hooks/use-route-preload';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { SafeAuthProvider } from '@/components/AuthProvider';
import Routes from './Routes';
import { LazyMotion, domAnimation } from 'framer-motion';
import { lazyWithRetry } from '@/utils/lazy-with-retry';
import { shouldLoadProductionTelemetry } from '@/utils/runtime-env';
import { useRouteScrollManager } from '@/hooks/use-route-scroll-manager';
import { shouldMaskTelemetryRoute } from '@/telemetry/privacy';

const Header = lazyWithRetry(() => import('@/components/layout/Header'));
const Footer = lazyWithRetry(() => import('@/components/layout/Footer'));
const UnifiedFAB = lazyWithRetry(() =>
  import('@/components/UnifiedFAB').then((m) => ({ default: m.UnifiedFAB }))
);
const GlobalSearch = lazyWithRetry(() => import('@/components/search/GlobalSearch'));
const KeyboardShortcutsModal = lazyWithRetry(() => import('@/components/keyboard/KeyboardShortcutsModal'));
const ProdOnlyComponents = lazyWithRetry(() => import('@/components/ProdOnlyComponents'));

const AppLoading = () => <PageSkeleton />;
const authLayoutRoutes = ['/login', '/register', '/forgot-password'];

function isAuthLayoutPath(path: string) {
  return path.startsWith('/auth/') || authLayoutRoutes.includes(path);
}

function Router() {
  const [currentPath] = useLocation();
  useRouteScrollManager(currentPath);
  
  // Define paths that should NOT show the global site header and footer
  // These are typically dashboard, admin, and account-related pages
  const dashboardPaths = [
    '/admin',
    '/dashboard',
    '/user',
    '/team',
    '/ca',
    '/profile',
    '/settings',
    '/documents',
    '/reports',
    '/workflows',
    '/teams',
    '/referrals',
    '/export'
  ];

  const isDashboardPath = dashboardPaths.some(path => 
    currentPath === path || currentPath.startsWith(`${path}/`)
  );

  const showLayoutComponents = !isAuthLayoutPath(currentPath) && !isDashboardPath;
  const hideFooter = currentPath === '/tax-assistant';

  useRoutePreload();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {showLayoutComponents && (
        <Suspense fallback={null}>
          <Header />
        </Suspense>
      )}
      {showLayoutComponents && <div className="h-[60px] md:h-[74px]"></div>}
      <main
        className="flex-1 bg-white"
        data-clarity-mask={shouldMaskTelemetryRoute(currentPath) ? "true" : undefined}
        data-telemetry-sensitive={shouldMaskTelemetryRoute(currentPath) ? "true" : undefined}
      >
        <Routes />
      </main>
      {showLayoutComponents && !hideFooter && (
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      )}
    </div>
  );
}

function AppContent() {
  const [location, navigate] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const isAuthScreen = isAuthLayoutPath(location);
  const isTaxAssistantPage = location === '/tax-assistant';
  const loadProductionTelemetry = shouldLoadProductionTelemetry();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }

      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }

      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault();
            navigate('/');
            break;
          case 's':
            e.preventDefault();
            navigate('/services');
            break;
          case 'c':
            e.preventDefault();
            navigate('/calculators');
            break;
          case 'a':
            e.preventDefault();
            navigate('/analytics-dashboard');
            break;
          case 'p':
            e.preventDefault();
            navigate('/pricing');
            break;
        }
      }
    };

    const handleOpenSearch = () => {
      setIsSearchOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('openGlobalSearch', handleOpenSearch);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('openGlobalSearch', handleOpenSearch);
    };
  }, []);

  return (
    <LazyMotion features={domAnimation} strict={false}>
      <Toaster />
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
      {loadProductionTelemetry && (
        <Suspense fallback={null}>
          <ProdOnlyComponents />
        </Suspense>
      )}
      {!isAuthScreen && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          </Suspense>
        </ErrorBoundary>
      )}

      {!isAuthScreen && !isTaxAssistantPage && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <UnifiedFAB />
          </Suspense>
        </ErrorBoundary>
      )}

      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <KeyboardShortcutsModal
            isOpen={isShortcutsOpen}
            onClose={() => setIsShortcutsOpen(false)}
          />
        </Suspense>
      </ErrorBoundary>
    </LazyMotion>
  );
}

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          <QueryClientProvider client={queryClient}>
            <SafeAuthProvider>
              <TooltipProvider>
                <AppContent />
              </TooltipProvider>
            </SafeAuthProvider>
          </QueryClientProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
