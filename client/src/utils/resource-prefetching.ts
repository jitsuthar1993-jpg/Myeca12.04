// Advanced resource prefetching system for faster navigation
import { getBundleMetrics, trackBundleLoad } from './bundle-optimization';

interface PrefetchConfig {
  urls: string[];
  priority: 'high' | 'medium' | 'low';
  timeout?: number;
  as?: 'script' | 'style' | 'image' | 'font' | 'document';
}

interface PrefetchMetrics {
  url: string;
  loadTime: number;
  cached: boolean;
  size: number;
  error?: string;
}

class ResourcePrefetcher {
  private cache = new Map<string, PrefetchMetrics>();
  private prefetchQueue: PrefetchConfig[] = [];
  private isProcessing = false;
  private observer?: IntersectionObserver;
  private metrics: PrefetchMetrics[] = [];

  constructor() {
    this.initializeIntersectionObserver();
    this.startProcessingQueue();
  }

  private initializeIntersectionObserver() {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const url = entry.target.getAttribute('data-prefetch-url');
          const priority = entry.target.getAttribute('data-prefetch-priority') as 'high' | 'medium' | 'low' || 'medium';
          
          if (url) {
            this.prefetchResource({ urls: [url], priority });
            this.observer?.unobserve(entry.target);
          }
        }
      });
    }, {
      rootMargin: '50px', // Start prefetching 50px before element is visible
      threshold: 0.1
    });
  }

  private startProcessingQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const processNext = async () => {
      while (this.prefetchQueue.length > 0) {
        const config = this.prefetchQueue.shift();
        if (config) {
          await this.processPrefetch(config);
        }
      }
      this.isProcessing = false;
    };

    // Use requestIdleCallback for non-blocking prefetching
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(processNext, { timeout: 5000 });
    } else {
      setTimeout(processNext, 100);
    }
  }

  private async processPrefetch(config: PrefetchConfig) {
    const startTime = performance.now();
    
    for (const url of config.urls) {
      try {
        // Skip if already cached
        if (this.cache.has(url)) {
          continue;
        }

        // Determine prefetch method based on resource type
        if (config.as === 'image') {
          await this.prefetchImage(url, config.priority);
        } else if (config.as === 'font') {
          await this.prefetchFont(url, config.priority);
        } else {
          await this.prefetchGeneric(url, config.priority, config.as);
        }

        const loadTime = performance.now() - startTime;
        this.cache.set(url, {
          url,
          loadTime,
          cached: false,
          size: 0 // Size estimation would require additional logic
        });

      } catch (error) {
        console.warn(`Failed to prefetch ${url}:`, error);
        this.cache.set(url, {
          url,
          loadTime: performance.now() - startTime,
          cached: false,
          size: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async prefetchImage(url: string, priority: 'high' | 'medium' | 'low') {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        trackBundleLoad(`image-${url}`, performance.now());
        resolve();
      };
      
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      
      // Set fetch priority
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = priority === 'high' ? 'high' : 'low';
      }
      
      img.src = url;
    });
  }

  private async prefetchFont(url: string, priority: 'high' | 'medium' | 'low') {
    if ('fonts' in document) {
      try {
        const font = new FontFace('PrefetchedFont', `url(${url})`);
        const loadedFont = await font.load();
        (document as any).fonts.add(loadedFont);
      } catch (error) {
        throw new Error(`Failed to prefetch font: ${url}`);
      }
    } else {
      // Fallback for older browsers
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = url;
      link.crossOrigin = 'anonymous';
      
      return new Promise<void>((resolve, reject) => {
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to preload font: ${url}`));
        document.head.appendChild(link);
      });
    }
  }

  private async prefetchGeneric(url: string, priority: 'high' | 'medium' | 'low', as?: 'script' | 'style' | 'image' | 'font' | 'document') {
    return new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      
      if (as) {
        link.as = as;
      }
      
      // Set fetch priority for supported browsers
      if ('fetchPriority' in link) {
        (link as any).fetchPriority = priority;
      }
      
      link.onload = () => {
        trackBundleLoad(`resource-${url}`, performance.now());
        resolve();
      };
      
      link.onerror = () => reject(new Error(`Failed to prefetch: ${url}`));
      
      document.head.appendChild(link);
    });
  }

  // Public API methods
  public prefetchResource(config: PrefetchConfig) {
    this.prefetchQueue.push(config);
    if (!this.isProcessing) {
      this.startProcessingQueue();
    }
  }

  public prefetchOnHover(element: HTMLElement, urls: string[], priority: 'high' | 'medium' | 'low' = 'high') {
    let prefetchTimeout: NodeJS.Timeout;
    
    element.addEventListener('mouseenter', () => {
      // Start prefetching after 100ms hover
      prefetchTimeout = setTimeout(() => {
        this.prefetchResource({ urls, priority });
      }, 100);
    });
    
    element.addEventListener('mouseleave', () => {
      clearTimeout(prefetchTimeout);
    });
  }

  public prefetchOnVisible(element: HTMLElement, url: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    if (!this.observer) return;
    
    element.setAttribute('data-prefetch-url', url);
    element.setAttribute('data-prefetch-priority', priority);
    this.observer.observe(element);
  }

  public prefetchCriticalResources() {
    // Disabled - assets don't exist and cause console warnings
    // Only prefetch resources that actually exist in the project
  }

  public prefetchRouteResources(routeName: string) {
    const routeResources = {
      'dashboard': [
        '/api/user/dashboard',
        '/images/dashboard-illustration.svg'
      ],
      'calculator': [
        '/api/tax/calculations',
        '/images/calculator-illustration.svg'
      ],
      'reports': [
        '/api/reports/summary',
        '/images/reports-illustration.svg'
      ]
    };

    const resources = routeResources[routeName as keyof typeof routeResources];
    if (resources) {
      this.prefetchResource({
        urls: resources,
        priority: 'medium'
      });
    }
  }

  public getMetrics(): PrefetchMetrics[] {
    return Array.from(this.cache.values());
  }

  public clearCache() {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const resourcePrefetcher = new ResourcePrefetcher();

// Convenience functions
export const prefetchResource = (urls: string[], priority: 'high' | 'medium' | 'low' = 'medium', as?: 'script' | 'style' | 'image' | 'font' | 'document') => {
  resourcePrefetcher.prefetchResource({ urls, priority, as });
};

export const prefetchOnHover = (element: HTMLElement, urls: string[], priority?: 'high' | 'medium' | 'low') => {
  resourcePrefetcher.prefetchOnHover(element, urls, priority);
};

export const prefetchOnVisible = (element: HTMLElement, url: string, priority?: 'high' | 'medium' | 'low') => {
  resourcePrefetcher.prefetchOnVisible(element, url, priority);
};

export const prefetchCriticalResources = () => {
  resourcePrefetcher.prefetchCriticalResources();
};

export const prefetchRouteResources = (routeName: string) => {
  resourcePrefetcher.prefetchRouteResources(routeName);
};

// Predictive prefetching based on user behavior
export const initializePredictivePrefetching = () => {
  // Analyze navigation patterns
  const navigationHistory = JSON.parse(localStorage.getItem('navigation_history') || '[]');
  
  if (navigationHistory.length > 0) {
    // Predict next likely route
    const lastRoute = navigationHistory[navigationHistory.length - 1];
    const likelyNextRoutes = {
      '/': ['dashboard', 'calculator'],
      '/dashboard': ['calculator', 'reports'],
      '/calculator': ['dashboard', 'reports'],
      '/reports': ['dashboard', 'settings']
    };

    const nextRoutes = likelyNextRoutes[lastRoute as keyof typeof likelyNextRoutes];
    if (nextRoutes) {
      nextRoutes.forEach(route => {
        resourcePrefetcher.prefetchRouteResources(route);
      });
    }
  }

  // Track navigation for future predictions
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    const url = args[2];
    if (url) {
      const navigationHistory = JSON.parse(localStorage.getItem('navigation_history') || '[]');
      navigationHistory.push(url);
      
      // Keep only last 10 entries
      if (navigationHistory.length > 10) {
        navigationHistory.shift();
      }
      
      localStorage.setItem('navigation_history', JSON.stringify(navigationHistory));
    }
    return originalPushState.apply(this, args);
  };
};

// Initialize on page load - disabled aggressive prefetching for better performance
// Critical resources should be loaded on-demand, not upfront