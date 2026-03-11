// Enhanced Mobile Performance Optimization
// This file implements critical mobile performance improvements

export class MobilePerformanceOptimizer {
  private static instance: MobilePerformanceOptimizer;
  private performanceMetrics: Map<string, number> = new Map();
  private optimizationEnabled: boolean = true;

  static getInstance(): MobilePerformanceOptimizer {
    if (!MobilePerformanceOptimizer.instance) {
      MobilePerformanceOptimizer.instance = new MobilePerformanceOptimizer();
    }
    return MobilePerformanceOptimizer.instance;
  }

  constructor() {
    this.initializePerformanceMonitoring();
    this.implementCriticalOptimizations();
  }

  private initializePerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.monitorNetworkConditions();
  }

  private observeLCP(): void {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.performanceMetrics.set('LCP', entry.startTime);
        
        // Optimize if LCP is poor on mobile
        if (this.isMobile() && entry.startTime > 2500) {
          this.optimizeForPoorLCP();
        }
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }

  private observeFID(): void {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.performanceMetrics.set('FID', entry.processingStart - entry.startTime);
        
        // Optimize if FID is poor on mobile
        if (this.isMobile() && (entry.processingStart - entry.startTime) > 100) {
          this.optimizeForPoorFID();
        }
      }
    }).observe({ entryTypes: ['first-input'] });
  }

  private observeCLS(): void {
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.performanceMetrics.set('CLS', clsValue);
          
          // Optimize if CLS is poor on mobile
          if (this.isMobile() && clsValue > 0.1) {
            this.optimizeForPoorCLS();
          }
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private monitorNetworkConditions(): void {
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', () => {
        this.optimizeForNetworkCondition(connection.effectiveType);
      });
      
      // Initial optimization based on connection
      this.optimizeForNetworkCondition(connection.effectiveType);
    }
  }

  private optimizeForPoorLCP(): void {
    console.log('Optimizing for poor LCP on mobile');
    
    // Implement critical optimizations
    this.deferNonCriticalImages();
    this.optimizeFontLoading();
    this.preloadCriticalResources();
  }

  private optimizeForPoorFID(): void {
    console.log('Optimizing for poor FID on mobile');
    
    // Optimize input handling
    this.optimizeInputHandling();
    this.reduceLongTasks();
  }

  private optimizeForPoorCLS(): void {
    console.log('Optimizing for poor CLS on mobile');
    
    // Reserve space for dynamic content
    this.reserveSpaceForImages();
    this.stabilizeLayout();
  }

  private optimizeForNetworkCondition(networkType: string): void {
    console.log(`Optimizing for network condition: ${networkType}`);
    
    switch (networkType) {
      case 'slow-2g':
      case '2g':
        this.enableAggressiveOptimizations();
        break;
      case '3g':
        this.enableModerateOptimizations();
        break;
      case '4g':
      default:
        this.enableStandardOptimizations();
        break;
    }
  }

  private implementCriticalOptimizations(): void {
    if (this.isMobile()) {
      this.enableMobileSpecificOptimizations();
      this.optimizeMemoryUsage();
      this.implementBatteryOptimizations();
    }
  }

  private enableMobileSpecificOptimizations(): void {
    // Reduce animation complexity on mobile
    this.reduceAnimationComplexity();
    
    // Optimize touch handling
    this.optimizeTouchHandling();
    
    // Implement viewport optimizations
    this.optimizeViewport();
  }

  private reduceAnimationComplexity(): void {
    // Add mobile-specific CSS for reduced animations
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .complex-animation {
          animation-duration: 0.2s !important;
          transition-duration: 0.2s !important;
        }
        
        .optional-animation {
          animation: none !important;
          transition: opacity 0.2s ease-out !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private optimizeTouchHandling(): void {
    // Optimize touch events for better performance
    document.addEventListener('touchstart', (e) => {
      // Prevent default for better scrolling performance
      if (e.target instanceof Element && 
          (e.target.tagName === 'BUTTON' || 
           e.target.tagName === 'A' ||
           e.target.getAttribute('role') === 'button')) {
        // Fast tap response for buttons
        e.target.classList.add('touch-active');
        setTimeout(() => {
          e.target?.classList.remove('touch-active');
        }, 150);
      }
    }, { passive: true });
  }

  private optimizeViewport(): void {
    // Ensure viewport is optimized for mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport && this.isMobile()) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no');
    }
  }

  private optimizeMemoryUsage(): void {
    // Implement memory-conscious image loading
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              img.src = img.dataset.src || '';
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          });
        });
        
        imageObserver.observe(img);
      }
    });
  }

  private implementBatteryOptimizations(): void {
    // Respect battery saver mode
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (battery.level < 0.2 || battery.saveMode) {
          this.enableBatterySaverMode();
        }
        
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2) {
            this.enableBatterySaverMode();
          }
        });
        
        battery.addEventListener('chargingchange', () => {
          if (!battery.charging && battery.level < 0.3) {
            this.enableBatterySaverMode();
          }
        });
      });
    }
  }

  private enableBatterySaverMode(): void {
    console.log('Enabling battery saver mode');
    
    // Reduce animation intensity
    document.documentElement.classList.add('battery-saver');
    
    // Disable non-essential features
    this.disableNonEssentialFeatures();
    
    // Reduce update frequency
    this.reduceUpdateFrequency();
  }

  private disableNonEssentialFeatures(): void {
    // Disable background animations
    const animatedElements = document.querySelectorAll('.background-animation');
    animatedElements.forEach(el => {
      (el as HTMLElement).style.animationPlayState = 'paused';
    });
  }

  private reduceUpdateFrequency(): void {
    // Reduce real-time update frequency
    if (window.realTimeUpdates) {
      window.realTimeUpdates.setUpdateInterval(5000); // 5 seconds instead of 1 second
    }
  }

  // Optimization methods
  private deferNonCriticalImages(): void {
    const images = document.querySelectorAll('img:not([loading="eager"])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    });
  }

  private optimizeFontLoading(): void {
    // Implement font-display: swap
    const fonts = document.querySelectorAll('link[rel="stylesheet"]');
    fonts.forEach(font => {
      if (font.getAttribute('href')?.includes('fonts.googleapis')) {
        font.setAttribute('media', 'print');
        font.onload = () => {
          font.setAttribute('media', 'all');
        };
      }
    });
  }

  private preloadCriticalResources(): void {
    // Preload critical CSS and JS
    const criticalResources = [
      '/css/critical.css',
      '/js/critical.js'
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 'script';
      document.head.appendChild(link);
    });
  }

  private optimizeInputHandling(): void {
    // Fast input response
    document.addEventListener('input', (e) => {
      if (e.target instanceof HTMLInputElement) {
        // Immediate visual feedback
        e.target.classList.add('input-active');
        
        // Debounce actual processing
        clearTimeout((e.target as any).inputTimeout);
        (e.target as any).inputTimeout = setTimeout(() => {
          e.target?.classList.remove('input-active');
          // Process input here
        }, 300);
      }
    }, { passive: true });
  }

  private reduceLongTasks(): void {
    // Break up long tasks
    if ('scheduler' in window) {
      // Use scheduler API if available
      (window as any).scheduler.postTask(() => {
        this.processHeavyCalculations();
      }, { priority: 'background' });
    } else {
      // Fallback to setTimeout
      setTimeout(() => {
        this.processHeavyCalculations();
      }, 0);
    }
  }

  private processHeavyCalculations(): void {
    // Process calculations in chunks
    const chunkSize = 100;
    let index = 0;
    
    const processChunk = () => {
      const end = Math.min(index + chunkSize, this.calculations.length);
      
      for (let i = index; i < end; i++) {
        // Process calculation
        this.processCalculation(this.calculations[i]);
      }
      
      index = end;
      
      if (index < this.calculations.length) {
        setTimeout(processChunk, 0);
      }
    };
    
    processChunk();
  }

  private reserveSpaceForImages(): void {
    // Reserve space for images to prevent layout shift
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.height && img.dataset.aspectRatio) {
        const [width, height] = img.dataset.aspectRatio.split(':');
        const aspectRatio = parseInt(height) / parseInt(width);
        
        img.style.height = `${img.clientWidth * aspectRatio}px`;
      }
    });
  }

  private stabilizeLayout(): void {
    // Stabilize layout for dynamic content
    const dynamicContainers = document.querySelectorAll('.dynamic-content');
    dynamicContainers.forEach(container => {
      const minHeight = container.getAttribute('data-min-height');
      if (minHeight) {
        (container as HTMLElement).style.minHeight = minHeight;
      }
    });
  }

  private enableAggressiveOptimizations(): void {
    console.log('Enabling aggressive optimizations for slow network');
    
    // Disable images
    document.documentElement.classList.add('no-images');
    
    // Reduce quality
    document.documentElement.classList.add('low-quality');
    
    // Disable non-critical JavaScript
    this.disableNonCriticalJavaScript();
  }

  private enableModerateOptimizations(): void {
    console.log('Enabling moderate optimizations for 3G network');
    
    // Lazy load images
    document.documentElement.classList.add('lazy-images');
    
    // Optimize images
    document.documentElement.classList.add('optimized-images');
  }

  private enableStandardOptimizations(): void {
    console.log('Enabling standard optimizations for good network');
    
    // Standard optimizations are already in place
    this.optimizationEnabled = true;
  }

  private disableNonCriticalJavaScript(): void {
    // Disable non-critical features
    if (window.nonCriticalFeatures) {
      window.nonCriticalFeatures.forEach((feature: any) => {
        if (feature.disable) {
          feature.disable();
        }
      });
    }
  }

  // Utility methods
  private isMobile(): boolean {
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private get calculations(): any[] {
    return window.calculations || [];
  }

  private processCalculation(calculation: any): void {
    // Process individual calculation
    console.log('Processing calculation:', calculation);
  }

  // Public API
  public getMetrics(): Map<string, number> {
    return new Map(this.performanceMetrics);
  }

  public enableOptimization(): void {
    this.optimizationEnabled = true;
    this.implementCriticalOptimizations();
  }

  public disableOptimization(): void {
    this.optimizationEnabled = false;
    document.documentElement.classList.remove('battery-saver', 'no-images', 'low-quality');
  }

  public optimizeForMobile(): void {
    if (this.isMobile()) {
      this.enableMobileSpecificOptimizations();
    }
  }
}

// Global interface extensions
declare global {
  interface Window {
    performanceOptimizer: MobilePerformanceOptimizer;
    realTimeUpdates: any;
    nonCriticalFeatures: any[];
    calculations: any[];
  }
}

// Initialize and export
export const performanceOptimizer = MobilePerformanceOptimizer.getInstance();
window.performanceOptimizer = performanceOptimizer;

// Auto-initialize on mobile
if (performanceOptimizer.isMobile()) {
  performanceOptimizer.optimizeForMobile();
}