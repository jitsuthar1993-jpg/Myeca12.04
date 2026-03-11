// Performance optimization utilities

/**
 * Debounce function to limit the rate at which a function can fire
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Throttle function to ensure a function is called at most once in a specified period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoize function results for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  } as T;
}

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback =
  window.requestIdleCallback ||
  function (cb: IdleRequestCallback) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      } as IdleDeadline);
    }, 1);
  };

/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id: number) {
    clearTimeout(id);
  };

/**
 * Defer non-critical work to idle time
 */
export function deferToIdle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  return function (...args: Parameters<T>) {
    requestIdleCallback(() => {
      func(...args);
    });
  };
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImages(selector: string = 'img[data-src]') {
  const images = document.querySelectorAll<HTMLImageElement>(selector);
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });
    
    images.forEach((img) => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach((img) => {
      const src = img.dataset.src;
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
      }
    });
  }
}

/**
 * Preload critical resources
 */
export function preloadResource(url: string, type: 'script' | 'style' | 'font' | 'image') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  
  switch (type) {
    case 'script':
      link.as = 'script';
      break;
    case 'style':
      link.as = 'style';
      break;
    case 'font':
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      break;
    case 'image':
      link.as = 'image';
      break;
  }
  
  document.head.appendChild(link);
}

/**
 * Measure performance of a function
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  func: T,
  name: string
): T {
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const start = performance.now();
    const result = func.apply(this, args);
    const end = performance.now();
    
    console.log(`${name} took ${end - start}ms`);
    
    return result;
  } as T;
}

/**
 * Virtual scrolling helper for large lists
 */
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  buffer?: number;
}

export function calculateVisibleItems<T>(
  items: T[],
  scrollTop: number,
  options: VirtualScrollOptions
): { items: T[]; startIndex: number; endIndex: number } {
  const { itemHeight, containerHeight, buffer = 5 } = options;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
  );
  
  return {
    items: items.slice(startIndex, endIndex + 1),
    startIndex,
    endIndex,
  };
}

/**
 * Connection speed detection
 */
export function getConnectionSpeed(): 'slow' | 'medium' | 'fast' | 'unknown' {
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  if (!connection) {
    return 'unknown';
  }
  
  const effectiveType = connection.effectiveType;
  
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'slow';
    case '3g':
      return 'medium';
    case '4g':
    default:
      return 'fast';
  }
}

/**
 * Adaptive loading based on connection speed
 */
export function shouldLoadHighQuality(): boolean {
  const speed = getConnectionSpeed();
  return speed === 'fast' || speed === 'unknown';
}

/**
 * Browser memory usage monitoring
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} | null {
  const nav = navigator as any;
  const perf = performance as any;
  
  if (!nav.deviceMemory || !perf.memory) {
    return null;
  }
  
  const used = perf.memory.usedJSHeapSize;
  const total = perf.memory.jsHeapSizeLimit;
  const percentage = (used / total) * 100;
  
  return { used, total, percentage };
}

/**
 * Request animation frame throttle
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  
  const throttled = function (this: any, ...args: Parameters<T>) {
    lastArgs = args;
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(this, lastArgs!);
        rafId = null;
      });
    }
  };
  
  (throttled as any).cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  
  return throttled;
}