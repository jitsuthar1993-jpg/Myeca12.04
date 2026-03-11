import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/AuthProvider";
import { HelmetProvider } from 'react-helmet-async';
import { useAnalyticsInitialization, usePageTracking } from '@/hooks/use-analytics';
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { Suspense, lazy } from 'react';
import { useRoutePreload } from '@/hooks/use-route-preload';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { ClerkProvider } from '@clerk/clerk-react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Routes from "./Routes";

const UnifiedFAB = lazy(() => import("@/components/UnifiedFAB").then(m => ({ default: m.UnifiedFAB })));
const GlobalSearch = lazy(() => import("@/components/search/GlobalSearch"));
const KeyboardShortcutsModal = lazy(() => import("@/components/keyboard/KeyboardShortcutsModal"));
const TaxChatbotWidget = lazy(() => import("@/components/chat/TaxChatbot").then(m => ({ default: m.TaxChatbot })));
const ProdOnlyComponents = lazy(() => import("@/components/ProdOnlyComponents"));

const AppLoading = () => <PageSkeleton />;

function Router() {
  const currentPath = window.location.pathname;
  const showLayoutComponents = !currentPath.startsWith('/auth/') && !currentPath.startsWith('/admin');
  const [location] = useLocation();
  
  useRoutePreload();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {showLayoutComponents && <Header />}
      {showLayoutComponents && <div className="h-16 lg:h-[56px]"></div>}
      <main className="flex-1 bg-white">
        <Routes />
      </main>
      {showLayoutComponents && <Footer />}
    </div>
  );
}

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

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
    <HelmetProvider>
      <LanguageProvider>
          <AccessibilityProvider>
            <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ""}>
              <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <TooltipProvider>
                  <Toaster />
                  <Router />
                  {import.meta.env.PROD && (
                    <Suspense fallback={null}>
                      <ProdOnlyComponents />
                    </Suspense>
                  )}
                  <Suspense fallback={null}>
                    <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
                  </Suspense>

                  <Suspense fallback={null}>
                    <UnifiedFAB
                      onChatbotOpen={() => setIsChatbotOpen(true)}
                      isChatbotOpen={isChatbotOpen}
                    />
                  </Suspense>

                  {isChatbotOpen && (
                    <Suspense fallback={null}>
                      <TaxChatbotWidget isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
                    </Suspense>
                  )}

                  <Suspense fallback={null}>
                    <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
                  </Suspense>
                </TooltipProvider>
              </AuthProvider>
            </QueryClientProvider>
            </ClerkProvider>
          </AccessibilityProvider>
        </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
