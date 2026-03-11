import { useEffect, useState, useRef } from 'react';
import { trackEvent } from '@/utils/analytics';
import { getBundleMetrics } from '@/utils/bundle-optimization';
import { resourcePrefetcher } from '@/utils/resource-prefetching';

interface PerformanceMetrics {
  // Core Web Vitals
  FCP: number | null; // First Contentful Paint
  LCP: number | null; // Largest Contentful Paint
  FID: number | null; // First Input Delay
  CLS: number | null; // Cumulative Layout Shift
  TTFB: number | null; // Time to First Byte
  
  // Advanced metrics
  TTI: number | null; // Time to Interactive
  TBT: number | null; // Total Blocking Time
  FMP: number | null; // First Meaningful Paint
  SI: number | null; // Speed Index
  EIL: number | null; // Estimated Input Latency
  
  // User experience metrics
  pageLoadTime: number | null;
  domContentLoaded: number | null;
  loadComplete: number | null;
  
  // Memory and resource usage
  memoryUsage: {
    used: number;
    total: number;
    limit: number;
  } | null;
  
  // Bundle and resource metrics
  bundleMetrics: ReturnType<typeof getBundleMetrics> | null;
  prefetchMetrics: ReturnType<typeof resourcePrefetcher.getMetrics> | null;
  
  // Network quality
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    // Core Web Vitals
    FCP: null,
    LCP: null,
    FID: null,
    CLS: null,
    TTFB: null,
    
    // Advanced metrics
    TTI: null,
    TBT: null,
    FMP: null,
    SI: null,
    EIL: null,
    
    // User experience metrics
    pageLoadTime: null,
    domContentLoaded: null,
    loadComplete: null,
    
    // Memory and resource usage
    memoryUsage: null,
    
    // Bundle and resource metrics
    bundleMetrics: null,
    prefetchMetrics: null,
    
    // Network quality
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
  });
  
  const observerRef = useRef<PerformanceObserver | null>(null);
  const longTaskObserverRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    // Only run in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !window.location.search.includes('perf=true')) return;

    // Network information
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      setMetrics(prev => ({
        ...prev,
        connectionType: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || null,
        rtt: connection.rtt || null,
      }));
    }

    // Core Web Vitals observer
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // First Contentful Paint
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, FCP: entry.startTime }));
          trackEvent('performance', 'FCP', entry.startTime.toFixed(2));
        }

        // Largest Contentful Paint
        if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({ ...prev, LCP: entry.startTime }));
          trackEvent('performance', 'LCP', entry.startTime.toFixed(2));
          
          // Log LCP element for debugging
          if (process.env.NODE_ENV === 'development') {
            console.log('LCP element:', (entry as any).element);
          }
        }

        // First Input Delay
        if (entry.entryType === 'first-input') {
          const fid = (entry as any).processingStart - entry.startTime;
          setMetrics(prev => ({ ...prev, FID: fid }));
          trackEvent('performance', 'FID', fid.toFixed(2));
        }

        // Cumulative Layout Shift
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          setMetrics(prev => ({
            ...prev,
            CLS: (prev.CLS || 0) + (entry as any).value
          }));
        }
      }
    });

    // Long Tasks observer for TBT and TTI calculation
    let longTasks = 0;
    let totalBlockingTime = 0;
    
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'longtask') {
          longTasks++;
          // Tasks over 50ms contribute to TBT
          if (entry.duration > 50) {
            totalBlockingTime += entry.duration - 50;
          }
        }
      }
    });

    // Observe different performance metrics
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      
      observerRef.current = observer;
      longTaskObserverRef.current = longTaskObserver;
    } catch (e) {
      console.error('Performance monitoring not supported:', e);
    }

    // Navigation timing
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      const domContentLoaded = navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart;
      const loadComplete = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
      const pageLoadTime = navigationEntry.loadEventEnd - navigationEntry.navigationStart;
      
      setMetrics(prev => ({ 
        ...prev, 
        TTFB: ttfb,
        domContentLoaded,
        loadComplete,
        pageLoadTime
      }));
      
      trackEvent('performance', 'TTFB', ttfb.toFixed(2));
      trackEvent('performance', 'PageLoadTime', pageLoadTime.toFixed(2));
    }

    // Memory usage tracking
    const updateMemoryUsage = () => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
          }
        }));
      }
    };

    // Update memory usage periodically
    updateMemoryUsage();
    const memoryInterval = setInterval(updateMemoryUsage, 10000);

    // Bundle and resource metrics
    const updateResourceMetrics = () => {
      setMetrics(prev => ({
        ...prev,
        bundleMetrics: getBundleMetrics(),
        prefetchMetrics: resourcePrefetcher.getMetrics()
      }));
    };

    updateResourceMetrics();
    const resourceInterval = setInterval(updateResourceMetrics, 30000);

    // Send metrics when page is hidden
    const sendMetrics = () => {
      if (metrics.CLS !== null) {
        trackEvent('performance', 'CLS', metrics.CLS.toFixed(4));
      }
      
      // Send comprehensive performance report
      trackEvent('performance', 'Complete', {
        FCP: metrics.FCP,
        LCP: metrics.LCP,
        FID: metrics.FID,
        CLS: metrics.CLS,
        TTFB: metrics.TTFB,
        pageLoadTime: metrics.pageLoadTime,
        memoryUsage: metrics.memoryUsage,
        connectionType: metrics.connectionType,
        effectiveType: metrics.effectiveType
      });
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendMetrics();
      }
    });

    return () => {
      observer.disconnect();
      longTaskObserver.disconnect();
      clearInterval(memoryInterval);
      clearInterval(resourceInterval);
    };
  }, []);

  // Advanced performance analysis
  useEffect(() => {
    if (!metrics.FCP || !metrics.LCP) return;

    // Calculate advanced metrics
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationEntry) {
      // Time to Interactive (TTI) - simplified calculation
      const tti = navigationEntry.domInteractive - navigationEntry.fetchStart;
      setMetrics(prev => ({ ...prev, TTI: tti }));
      
      // First Meaningful Paint (FMP) - approximation
      const fmp = metrics.FCP * 1.2; // Rough approximation
      setMetrics(prev => ({ ...prev, FMP: fmp }));
      
      // Speed Index (SI) - simplified calculation
      const si = (metrics.FCP + metrics.LCP) / 2;
      setMetrics(prev => ({ ...prev, SI: si }));
      
      // Estimated Input Latency (EIL)
      const eil = metrics.FID || 16; // Default to 16ms if FID not available
      setMetrics(prev => ({ ...prev, EIL: eil }));
    }

    // Performance warnings with detailed analysis
    const warnings = [];
    
    if (metrics.LCP && metrics.LCP > 2500) {
      warnings.push(`Poor LCP: ${metrics.LCP.toFixed(0)}ms (should be < 2500ms)`);
    }
    
    if (metrics.FID && metrics.FID > 100) {
      warnings.push(`Poor FID: ${metrics.FID.toFixed(0)}ms (should be < 100ms)`);
    }
    
    if (metrics.CLS && metrics.CLS > 0.1) {
      warnings.push(`Poor CLS: ${metrics.CLS.toFixed(3)} (should be < 0.1)`);
    }
    
    if (metrics.pageLoadTime && metrics.pageLoadTime > 3000) {
      warnings.push(`Slow page load: ${metrics.pageLoadTime.toFixed(0)}ms (should be < 3000ms)`);
    }
    
    if (metrics.memoryUsage && metrics.memoryUsage.used > 100) {
      warnings.push(`High memory usage: ${metrics.memoryUsage.used}MB`);
    }

    if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
      console.group('Performance Warnings');
      warnings.forEach(warning => console.warn(warning));
      console.groupEnd();
    }

    // Send warnings to analytics
    if (warnings.length > 0 && (window as any).gtag) {
      (window as any).gtag('event', 'performance_warning', {
        warnings: warnings.length,
        details: warnings
      });
    }
  }, [metrics]);

  return null; // This component doesn't render anything
}