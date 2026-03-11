import { trackEvent } from './analytics';

interface PerformanceMetrics {
  FCP: number | null;
  LCP: number | null;
  FID: number | null;
  CLS: number | null;
  TTFB: number | null;
  TTI: number | null;
  bundleSize: number | null;
  domContentLoaded: number | null;
  loadComplete: number | null;
}

interface PerformanceThresholds {
  FCP: { good: number; needsImprovement: number };
  LCP: { good: number; needsImprovement: number };
  FID: { good: number; needsImprovement: number };
  CLS: { good: number; needsImprovement: number };
  TTFB: { good: number; needsImprovement: number };
}

const THRESHOLDS: PerformanceThresholds = {
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    FCP: null,
    LCP: null,
    FID: null,
    CLS: null,
    TTFB: null,
    TTI: null,
    bundleSize: null,
    domContentLoaded: null,
    loadComplete: null,
  };

  private performanceObserver: PerformanceObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private isMonitoring = false;

  startMonitoring(): void {
    if (this.isMonitoring || typeof window === 'undefined') return;

    this.isMonitoring = true;
    this.initializeCoreWebVitals();
    this.measureNavigationTiming();
    this.measureResourceTiming();
    this.setupCLSMonitoring();
    this.measureBundleSize();
    this.setupPerformanceObserver();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    this.performanceObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }

  private initializeCoreWebVitals(): void {
    // First Contentful Paint (FCP)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.FCP = entry.startTime;
          this.analyzeMetric('FCP', entry.startTime);
          break;
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.LCP = lastEntry.startTime;
      this.analyzeMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.processingStart && entry.startTime) {
          const fid = entry.processingStart - entry.startTime;
          this.metrics.FID = fid;
          this.analyzeMetric('FID', fid);
          break;
        }
      }
    }).observe({ entryTypes: ['first-input'] });
  }

  private setupCLSMonitoring(): void {
    let clsValue = 0;
    let clsEntries: any[] = [];

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          clsEntries.push(entry);
        }
      }
      this.metrics.CLS = clsValue;
      this.analyzeMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private measureNavigationTiming(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.metrics.TTFB = navigation.responseStart - navigation.requestStart;
          this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
          this.metrics.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
          
          this.analyzeMetric('TTFB', this.metrics.TTFB);
          this.analyzeMetric('DOMContentLoaded', this.metrics.domContentLoaded);
          this.analyzeMetric('LoadComplete', this.metrics.loadComplete);
        }
      }, 0);
    });
  }

  private measureResourceTiming(): void {
    // Monitor resource loading performance
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.entryType === 'resource') {
          // Track slow resources
          if (entry.duration > 1000) {
            trackEvent('performance', 'slow_resource', {
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize,
            });
          }
        }
      }
    }).observe({ entryTypes: ['resource'] });
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Monitor long tasks
          if (entry.entryType === 'longtask') {
            trackEvent('performance', 'long_task', {
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        }
      });
      
      try {
        this.performanceObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long Task API not supported');
      }
    }
  }

  private measureBundleSize(): void {
    // Estimate bundle size from resource timing
    setTimeout(() => {
      const resources = performance.getEntriesByType('resource');
      let totalSize = 0;
      
      resources.forEach((resource: any) => {
        if (resource.transferSize) {
          totalSize += resource.transferSize;
        }
      });
      
      this.metrics.bundleSize = totalSize;
      this.analyzeBundleSize(totalSize);
    }, 3000);
  }

  private analyzeMetric(metricName: keyof PerformanceMetrics, value: number): void {
    const threshold = THRESHOLDS[metricName as keyof PerformanceThresholds];
    if (!threshold) return;

    let rating: 'good' | 'needs-improvement' | 'poor';
    if (value <= threshold.good) {
      rating = 'good';
    } else if (value <= threshold.needsImprovement) {
      rating = 'needs-improvement';
    } else {
      rating = 'poor';
    }

    trackEvent('performance', `${metricName.toLowerCase()}_rating`, {
      value,
      rating,
      threshold: threshold.good,
    });

    // Alert for poor performance
    if (rating === 'poor') {
      console.warn(`Poor ${metricName} performance: ${value}ms`);
      trackEvent('performance', 'poor_metric', {
        metric: metricName,
        value,
        url: window.location.href,
      });
    }
  }

  private analyzeBundleSize(size: number): void {
    const sizeInMB = size / (1024 * 1024);
    let rating: 'good' | 'needs-improvement' | 'poor';
    
    if (sizeInMB < 1) {
      rating = 'good';
    } else if (sizeInMB < 2) {
      rating = 'needs-improvement';
    } else {
      rating = 'poor';
    }

    trackEvent('performance', 'bundle_size', {
      size: sizeInMB,
      rating,
      url: window.location.href,
    });
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getPerformanceReport(): string {
    const metrics = this.getMetrics();
    const report = [
      '=== Performance Report ===',
      `URL: ${window.location.href}`,
      `FCP: ${metrics.FCP}ms (${this.getRating('FCP', metrics.FCP)})`,
      `LCP: ${metrics.LCP}ms (${this.getRating('LCP', metrics.LCP)})`,
      `FID: ${metrics.FID}ms (${this.getRating('FID', metrics.FID)})`,
      `CLS: ${metrics.CLS} (${this.getRating('CLS', metrics.CLS)})`,
      `TTFB: ${metrics.TTFB}ms (${this.getRating('TTFB', metrics.TTFB)})`,
      `Bundle Size: ${metrics.bundleSize ? (metrics.bundleSize / 1024 / 1024).toFixed(2) : 'N/A'}MB`,
      `DOM Content Loaded: ${metrics.domContentLoaded}ms`,
      `Load Complete: ${metrics.loadComplete}ms`,
      '========================='
    ];
    
    return report.join('\n');
  }

  private getRating(metric: string, value: number | null): string {
    if (value === null) return 'N/A';
    
    const threshold = THRESHOLDS[metric as keyof PerformanceThresholds];
    if (!threshold) return 'N/A';
    
    if (value <= threshold.good) return 'Good ✅';
    if (value <= threshold.needsImprovement) return 'Needs Improvement ⚠️';
    return 'Poor ❌';
  }

  // Optimize critical rendering path
  optimizeCriticalPath(): void {
    // Preload critical resources
    const criticalResources = [
      '/fonts/inter.woff2',
      '/css/critical.css',
      '/js/critical.js',
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.includes('.woff2')) {
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
      } else if (resource.includes('.css')) {
        link.as = 'style';
      } else if (resource.includes('.js')) {
        link.as = 'script';
      }
      
      document.head.appendChild(link);
    });
  }

  // Lazy load non-critical resources
  lazyLoadResources(): void {
    const lazyResources = document.querySelectorAll('[data-lazy]');
    
    if ('IntersectionObserver' in window) {
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const src = element.dataset.src;
            
            if (src) {
              if (element.tagName === 'IMG') {
                (element as HTMLImageElement).src = src;
              } else if (element.tagName === 'SCRIPT') {
                const script = document.createElement('script');
                script.src = src;
                document.body.appendChild(script);
              }
              
              element.removeAttribute('data-lazy');
              lazyObserver.unobserve(element);
            }
          }
        });
      });
      
      lazyResources.forEach((resource) => {
        lazyObserver.observe(resource);
      });
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper functions for common performance tasks
export const measureFunction = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    trackEvent('performance', 'function_timing', {
      function: name,
      duration: end - start,
    });
    
    return result;
  }) as T;
};

export const measureAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T => {
  return (async (...args: Parameters<T>) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    
    trackEvent('performance', 'async_function_timing', {
      function: name,
      duration: end - start,
    });
    
    return result;
  }) as T;
};

// Memory usage monitoring
export const monitorMemoryUsage = (): void => {
  if ('memory' in performance) {
    const memoryInfo = (performance as any).memory;
    const usedMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
    const totalMB = memoryInfo.totalJSHeapSize / (1024 * 1024);
    const limitMB = memoryInfo.jsHeapSizeLimit / (1024 * 1024);
    
    trackEvent('performance', 'memory_usage', {
      used: usedMB,
      total: totalMB,
      limit: limitMB,
      usage: (usedMB / totalMB) * 100,
    });
    
    // Alert if memory usage is high
    if ((usedMB / totalMB) > 0.9) {
      console.warn('High memory usage detected:', {
        used: `${usedMB.toFixed(2)}MB`,
        total: `${totalMB.toFixed(2)}MB`,
        usage: `${((usedMB / totalMB) * 100).toFixed(1)}%`,
      });
    }
  }
};

// Initialize monitoring on client side - only in production to avoid HMR issues
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  performanceMonitor.startMonitoring();
  
  // Monitor memory usage periodically
  setInterval(monitorMemoryUsage, 30000); // Every 30 seconds
  
  // Log performance report after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log(performanceMonitor.getPerformanceReport());
    }, 1000);
  });
}