import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from 'react-helmet-async';
import { useAnalyticsInitialization, usePageTracking } from '@/hooks/use-analytics';
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { Suspense, lazy } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useRoutePreload } from '@/hooks/use-route-preload';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import Routes from "./Routes";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { SessionWarningModal } from "@/components/auth/SessionWarningModal";
import { LazyMotion, domAnimation } from "framer-motion";

const UnifiedFAB = lazy(() => import("@/components/UnifiedFAB").then(m => ({ default: m.UnifiedFAB })));
const GlobalSearch = lazy(() => import("@/components/search/GlobalSearch"));
const KeyboardShortcutsModal = lazy(() => import("@/components/keyboard/KeyboardShortcutsModal"));
const TaxChatbotWidget = lazy(() => import("@/components/chat/TaxChatbot").then(m => ({ default: m.TaxChatbot })));
const ProdOnlyComponents = lazy(() => import("@/components/ProdOnlyComponents"));

const AppLoading = () => <PageSkeleton />;

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll to top on location change, unless there's a hash (anchor link)
    if (!window.location.hash) {
      const scroll = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        // Fallback for document.documentElement just in case
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      };

      // Execute immediately and then after a small delay to handle content popping in
      scroll();
      const timer = setTimeout(scroll, 50);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return null;
}

function Router() {
  const currentPath = window.location.pathname;
  const showLayoutComponents = !currentPath.startsWith('/auth/') && !currentPath.startsWith('/admin');
  
  useRoutePreload();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ScrollToTop />
      {showLayoutComponents && <Header />}
      {showLayoutComponents && <div className="h-[74px]"></div>}
      <main className="flex-1 bg-white">
        <Routes />
      </main>
      {showLayoutComponents && <Footer />}
    </div>
  );
}

function AppContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const { logout, isAuthenticated } = useAuth();
  const { showWarning, timeLeft, resetSession, handleLogout } = useSessionTimeout({
    onLogout: logout,
    isAuthenticated
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { addPerformanceHints } = await import('@/utils/performance-hints');
      addPerformanceHints();
      if (import.meta.env.PROD) {
        const { registerServiceWorker } = await import('@/utils/service-worker-registration');
        registerServiceWorker();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useAnalyticsInitialization();
  usePageTracking();

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
            window.location.href = '/';
            break;
          case 's':
            e.preventDefault();
            window.location.href = '/services';
            break;
          case 'c':
            e.preventDefault();
            window.location.href = '/calculators';
            break;
          case 'a':
            e.preventDefault();
            window.location.href = '/analytics-dashboard';
            break;
          case 'p':
            e.preventDefault();
            window.location.href = '/pricing';
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
      <Router />
      {import.meta.env.PROD && (
        <Suspense fallback={null}>
          <ProdOnlyComponents />
        </Suspense>
      )}
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <UnifiedFAB
            onChatbotOpen={() => setIsChatbotOpen(true)}
            isChatbotOpen={isChatbotOpen}
          />
        </Suspense>
      </ErrorBoundary>

      {isChatbotOpen && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <TaxChatbotWidget isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
          </Suspense>
        </ErrorBoundary>
      )}

      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
        </Suspense>
      </ErrorBoundary>

      <SessionWarningModal
        isOpen={showWarning}
        timeLeft={timeLeft}
        onContinue={resetSession}
        onLogout={handleLogout}
      />
    </LazyMotion>
  );
}

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <TooltipProvider>
                <AppContent />
              </TooltipProvider>
            </AuthProvider>
          </QueryClientProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
