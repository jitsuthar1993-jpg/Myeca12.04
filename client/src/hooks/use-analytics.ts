// Analytics hooks for easy integration

import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import {
  trackFormStart,
  trackFormProgress,
  trackFormSubmit,
  trackServiceView,
  trackServiceClick,
  trackCalculatorUse,
  trackScrollDepth,
  trackTimeOnPage,
  trackExitIntent,
  trackFeatureUse,
  initializeEnhancedAnalytics
} from '@/utils/analytics-enhanced';

// Initialize enhanced analytics on app load
export function useAnalyticsInitialization() {
  useEffect(() => {
    initializeEnhancedAnalytics();
  }, []);
}

// Track page views
export function usePageTracking() {
  const [location] = useLocation();
  const previousLocation = useRef(location);

  useEffect(() => {
    if (location !== previousLocation.current) {
      // Track page view in Google Analytics
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
          page_path: location,
        });
      }

      // Track in our custom analytics
      trackFeatureUse('page_view', 'navigation', location);
      
      previousLocation.current = location;
    }
  }, [location]);
}

// Track form interactions
export function useFormTracking(formName: string, formType: string) {
  const hasStarted = useRef(false);
  const currentStep = useRef(0);

  const trackStart = () => {
    if (!hasStarted.current) {
      trackFormStart(formName, formType);
      hasStarted.current = true;
    }
  };

  const trackProgress = (step: number, totalSteps: number) => {
    if (step > currentStep.current) {
      trackFormProgress(formName, step, totalSteps);
      currentStep.current = step;
    }
  };

  const trackSubmit = (success: boolean) => {
    trackFormSubmit(formName, formType, success);
    // Reset for potential re-submission
    hasStarted.current = false;
    currentStep.current = 0;
  };

  return { trackStart, trackProgress, trackSubmit };
}

// Track service interactions
export function useServiceTracking(serviceName: string, serviceId: string, price: number) {
  const hasViewed = useRef(false);

  useEffect(() => {
    if (!hasViewed.current) {
      trackServiceView(serviceName, serviceId, price);
      hasViewed.current = true;
    }
  }, [serviceName, serviceId, price]);

  const trackClick = (action: 'learn_more' | 'buy_now' | 'get_quote') => {
    trackServiceClick(serviceName, serviceId, action);
  };

  return { trackClick };
}

// Track calculator usage
export function useCalculatorTracking(calculatorName: string) {
  const calculateAndTrack = (inputValues: Record<string, any>, result: number) => {
    trackCalculatorUse(calculatorName, inputValues, result);
    return result;
  };

  return { calculateAndTrack };
}

// Track element visibility (for lazy loading analytics)
export function useVisibilityTracking(elementName: string, threshold = 0.5) {
  const elementRef = useRef<HTMLElement>(null);
  const hasBeenVisible = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenVisible.current) {
            trackFeatureUse('element_visible', elementName);
            hasBeenVisible.current = true;
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementName, threshold]);

  return elementRef;
}

// Track user engagement time
export function useEngagementTracking(pageName: string) {
  const startTime = useRef(Date.now());
  const isEngaged = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isEngaged.current = false;
      } else {
        isEngaged.current = true;
        startTime.current = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      if (isEngaged.current) {
        const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
        trackTimeOnPage(timeSpent, pageName);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Track when component unmounts
    };
  }, [pageName]);
}

// Track click events
export function useClickTracking(elementName: string, category: string) {
  const trackClick = (label?: string, value?: number) => {
    trackFeatureUse(elementName, 'click', { label, value });
  };

  return trackClick;
}

// Track search interactions
export function useSearchTracking() {
  const trackSearch = (searchTerm: string, resultsCount: number, searchType?: string) => {
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'search', {
        search_term: searchTerm
      });
    }
    trackFeatureUse('search', searchType || 'general', { term: searchTerm, results: resultsCount });
  };

  return trackSearch;
}