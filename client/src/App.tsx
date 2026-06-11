import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { SafeAuthProvider, useAuth } from '@/components/AuthProvider';
import Routes from './Routes';
import { LazyMotion, domAnimation } from 'framer-motion';
import { lazyWithRetry } from '@/utils/lazy-with-retry';
import { shouldLoadProductionTelemetry } from '@/utils/runtime-env';
import { useRouteScrollManager } from '@/hooks/use-route-scroll-manager';
import { shouldMaskTelemetryRoute } from '@/telemetry/privacy';
import { hasBrowserTelemetryConfig } from '@/telemetry/config';

const Header = lazyWithRetry(() => import('@/components/layout/Header'));
const Footer = lazyWithRetry(() => import('@/components/layout/Footer'));
const UnifiedFAB = lazyWithRetry(() =>
  import('@/components/UnifiedFAB').then((m) => ({ default: m.UnifiedFAB }))
);
const GlobalSearch = lazyWithRetry(() => import('@/components/search/GlobalSearch'));
const KeyboardShortcutsModal = lazyWithRetry(() => import('@/components/keyboard/KeyboardShortcutsModal'));
const ProdOnlyComponents = lazyWithRetry(() => import('@/components/ProdOnlyComponents'));
const Toaster = lazyWithRetry(() =>
  import('@/components/ui/toaster').then((m) => ({ default: m.Toaster }))
);
const PwaInstallBanner = lazyWithRetry(() =>
  import('@/components/pwa/PwaInstallBanner').then((m) => ({ default: m.PwaInstallBanner }))
);
const PublicMobileConversionBar = lazyWithRetry(() => import('@/components/conversion/PublicMobileConversionBar'));

const AppLoading = () => <PageSkeleton />;
const HeaderLoadingShell = () => (
  <header
    aria-hidden="true"
    className="fixed left-0 right-0 top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-lg"
  >
    <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-4 sm:px-6 md:h-[74px] lg:px-8">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-slate-100" />
        <div className="space-y-1.5">
          <div className="h-4 w-24 rounded bg-slate-100" />
          <div className="hidden h-2 w-28 rounded bg-slate-100 md:block" />
        </div>
      </div>
      <div className="hidden items-center gap-4 lg:flex">
        <div className="h-9 w-24 rounded-full bg-slate-100" />
        <div className="h-9 w-28 rounded-full bg-slate-100" />
        <div className="h-9 w-24 rounded-full bg-slate-100" />
        <div className="h-9 w-10 rounded-lg bg-slate-100" />
      </div>
      <div className="flex items-center gap-2 lg:hidden">
        <div className="h-10 w-10 rounded-lg bg-slate-100" />
        <div className="h-10 w-10 rounded-lg bg-slate-100" />
      </div>
    </div>
  </header>
);
const authLayoutRoutes = ['/login', '/register', '/forgot-password'];
const adaptiveWorkspacePaths = ['/expert-consultation', '/consultation'];

function isAuthLayoutPath(path: string) {
  return path.startsWith('/auth/') || authLayoutRoutes.includes(path);
}

function useDeferredGlobalChrome(timeout = 800) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isReady) return;

    const timeoutId = globalThis.setTimeout(() => setIsReady(true), timeout);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [isReady, timeout]);

  return isReady;
}

function Router() {
  const [currentPath] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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
    '/account',
    '/settings',
    '/documents',
    '/payments',
    '/itr/filing',
    '/reports',
    '/workflows',
    '/teams',
    '/referrals',
    '/export'
  ];

  const isDocumentGeneratorPath =
    currentPath === '/documents/generator_page' ||
    currentPath === '/documents/generator' ||
    currentPath.startsWith('/documents/generator/');
  const isDashboardPath = dashboardPaths.some(path =>
    currentPath === path || currentPath.startsWith(`${path}/`)
  ) && !(isDocumentGeneratorPath && !isAuthenticated);

  const isAdaptiveWorkspacePath = adaptiveWorkspacePaths.includes(currentPath);
  const usesAdaptiveWorkspaceChrome = isAdaptiveWorkspacePath && (isAuthenticated || authLoading);
  const showLayoutComponents = !isAuthLayoutPath(currentPath) && !isDashboardPath && !usesAdaptiveWorkspaceChrome;
  const hideFooter = currentPath === '/tax-assistant';
  const showMobileConversionBar = showLayoutComponents && !hideFooter && !currentPath.startsWith('/which-itr-form-to-file');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {showLayoutComponents && (
        <Suspense fallback={<HeaderLoadingShell />}>
          <Header />
        </Suspense>
      )}
      {showLayoutComponents && <div className="h-[60px] md:h-[74px]"></div>}
      <main
        className={`flex-1 bg-white ${showMobileConversionBar ? 'pb-20 md:pb-0' : ''}`}
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
      {showMobileConversionBar && (
        <Suspense fallback={null}>
          <PublicMobileConversionBar currentPath={currentPath} />
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
  const loadProductionTelemetry = hasBrowserTelemetryConfig && shouldLoadProductionTelemetry();
  const showDeferredGlobalChrome = useDeferredGlobalChrome();

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
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
      {showDeferredGlobalChrome && (
        <Suspense fallback={null}>
          <PwaInstallBanner currentPath={location} />
        </Suspense>
      )}
      {loadProductionTelemetry && showDeferredGlobalChrome && (
        <Suspense fallback={null}>
          <ProdOnlyComponents />
        </Suspense>
      )}
      {!isAuthScreen && (showDeferredGlobalChrome || isSearchOpen) && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          </Suspense>
        </ErrorBoundary>
      )}

      {!isAuthScreen && !isTaxAssistantPage && showDeferredGlobalChrome && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <UnifiedFAB />
          </Suspense>
        </ErrorBoundary>
      )}

      {(showDeferredGlobalChrome || isShortcutsOpen) && <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <KeyboardShortcutsModal
            isOpen={isShortcutsOpen}
            onClose={() => setIsShortcutsOpen(false)}
          />
        </Suspense>
      </ErrorBoundary>}
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
