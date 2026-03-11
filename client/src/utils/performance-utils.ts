// Comprehensive performance utilities and optimization helpers
import { initializeBundleOptimization, getBundleMetrics } from './bundle-optimization';
import { resourcePrefetcher, prefetchCriticalResources, initializePredictivePrefetching } from './resource-prefetching';

// Performance measurement utilities
export class PerformanceTimer {
  private marks = new Map<string, number>();
  private measures = new Map<string, number>();

  mark(name: string) {
    if (typeof performance !== 'undefined') {
      this.marks.set(name, performance.now());
      performance.mark(name);
    }
  }

  measure(name: string, startMark: string, endMark?: string) {
    if (typeof performance !== 'undefined') {
      const start = this.marks.get(startMark);
      const end = endMark ? this.marks.get(endMark) : performance.now();
      
      if (start && end) {
        const duration = end - start;
        this.measures.set(name, duration);
        performance.measure(name, startMark, endMark);
        return duration;
      }
    }
    return 0;
  }

  getMeasures() {
    return Object.fromEntries(this.measures);
  }

  clear() {
    this.marks.clear();
    this.measures.clear();
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate = false
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };

    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(this, args);
  } as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T & { cancel: () => void } {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;

  const throttled = function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func.apply(lastThis, lastArgs);
          lastArgs = null;
          lastThis = null;
        }
      }, limit);
    } else {
      lastArgs = args;
      lastThis = this;
    }
  } as T & { cancel: () => void };

  throttled.cancel = () => {
    inThrottle = false;
    lastArgs = null;
    lastThis = null;
  };

  return throttled;
}

// Request animation frame optimization
export const raf = {
  id: 0,
  
  throttle<T extends (...args: any[]) => void>(func: T): T & { cancel: () => void } {
    let ticking = false;
    let lastArgs: Parameters<T> | null = null;
    let lastThis: any = null;

    const throttled = function (this: any, ...args: Parameters<T>) {
      lastArgs = args;
      lastThis = this;
      
      if (!ticking) {
        requestAnimationFrame(() => {
          ticking = false;
          if (lastArgs) {
            func.apply(lastThis, lastArgs);
            lastArgs = null;
            lastThis = null;
          }
        });
        ticking = true;
      }
    } as T & { cancel: () => void };

    throttled.cancel = () => {
      if (ticking) {
        cancelAnimationFrame(this.id);
        ticking = false;
      }
      lastArgs = null;
      lastThis = null;
    };

    return throttled;
  }
};

// Image preloading utility
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Batch DOM operations
export function batchDOMUpdates(updates: () => void) {
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(updates);
  } else {
    updates();
  }
}

// Virtual scrolling calculation
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  buffer = 5
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const end = Math.min(
    totalItems,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
  );
  
  return { start, end };
}

// Memory leak detection
export class MemoryMonitor {
  private snapshots: number[] = [];
  private interval: NodeJS.Timeout | null = null;

  start(intervalMs = 10000) {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      console.warn('Memory monitoring not supported in this environment');
      return;
    }

    this.interval = setInterval(() => {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      this.snapshots.push(used);

      // Keep only last 50 snapshots
      if (this.snapshots.length > 50) {
        this.snapshots.shift();
      }

      this.analyzeTrends();
    }, intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private analyzeTrends() {
    if (this.snapshots.length < 10) return;

    const recent = this.snapshots.slice(-10);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const max = Math.max(...recent);
    const growth = (recent[recent.length - 1] - recent[0]) / recent[0];

    // Alert if memory is growing rapidly
    if (growth > 0.5) {
      console.warn(`Memory usage increased by ${(growth * 100).toFixed(1)}% in the last 10 measurements`);
    }

    // Alert if memory usage is very high
    if (avg > 100 * 1024 * 1024) { // 100MB
      console.warn(`High memory usage detected: ${(avg / 1024 / 1024).toFixed(1)}MB`);
    }
  }

  getReport() {
    if (this.snapshots.length === 0) return null;

    const latest = this.snapshots[this.snapshots.length - 1];
    const avg = this.snapshots.reduce((a, b) => a + b, 0) / this.snapshots.length;
    const max = Math.max(...this.snapshots);
    const min = Math.min(...this.snapshots);

    return {
      current: latest,
      average: avg,
      maximum: max,
      minimum: min,
      samples: this.snapshots.length
    };
  }
}

// Performance optimization strategies
export const optimizationStrategies = {
  // Lazy load images
  lazyLoadImages: () => {
    if (typeof IntersectionObserver !== 'undefined') {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  },

  // Optimize font loading
  optimizeFonts: () => {
    // Add font-display: swap to critical fonts
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'CriticalFont';
        font-display: swap;
        src: url('/fonts/critical.woff2') format('woff2');
      }
    `;
    document.head.appendChild(style);
  },

  // Preload critical resources
  preloadCriticalResources: () => {
    const criticalResources = [
      '/css/critical.css',
      '/js/vendor.js',
      '/fonts/main.woff2'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.endsWith('.css')) link.as = 'style';
      if (resource.endsWith('.js')) link.as = 'script';
      if (resource.endsWith('.woff2')) link.as = 'font';
      
      document.head.appendChild(link);
    });
  },

  // Optimize third-party scripts
  optimizeThirdPartyScripts: () => {
    // Defer non-critical third-party scripts
    const scripts = document.querySelectorAll('script[src*="google-analytics.com"], script[src*="googletagmanager.com"]');
    scripts.forEach(script => {
      if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
        script.setAttribute('defer', '');
      }
    });
  }
};

// Initialize performance optimizations
export const initializePerformanceOptimizations = () => {
  // Initialize bundle optimization
  initializeBundleOptimization();
  
  // Initialize resource prefetching
  prefetchCriticalResources();
  initializePredictivePrefetching();
  
  // Apply optimization strategies
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizationStrategies.lazyLoadImages();
      optimizationStrategies.optimizeFonts();
      optimizationStrategies.preloadCriticalResources();
      optimizationStrategies.optimizeThirdPartyScripts();
    });
  }
  
  // Start memory monitoring in development
  if (process.env.NODE_ENV === 'development') {
    const memoryMonitor = new MemoryMonitor();
    memoryMonitor.start();
    
    // Expose for debugging
    (window as any).memoryMonitor = memoryMonitor;
  }
  
  console.log('Performance optimizations initialized');
};

// Performance metrics reporting
export const reportPerformanceMetrics = () => {
  const metrics = {
    bundle: getBundleMetrics(),
    prefetch: resourcePrefetcher.getMetrics(),
    memory: typeof performance !== 'undefined' && (performance as any).memory ? {
      used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
    } : null,
    timing: typeof performance !== 'undefined' ? {
      navigation: performance.timing,
      now: performance.now()
    } : null
  };
  
  return metrics;
};

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).performanceUtils = {
    timer: new PerformanceTimer(),
    debounce,
    throttle,
    raf,
    preloadImage,
    batchDOMUpdates,
    calculateVisibleRange,
    MemoryMonitor,
    optimizationStrategies,
    reportPerformanceMetrics
  };
}