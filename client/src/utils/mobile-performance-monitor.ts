// @ts-nocheck
/**
 * Mobile Performance Monitoring Utility
 * 
 * Tracks and reports mobile-specific performance metrics including:
 * - Touch response times
 * - Memory usage
 * - Battery consumption
 * - Network performance
 * - Loading times
 * - User interaction metrics
 */

export interface MobilePerformanceMetrics {
  deviceInfo: DeviceInfo;
  performanceMetrics: PerformanceMetrics;
  userInteractionMetrics: UserInteractionMetrics;
  networkMetrics: NetworkMetrics;
  batteryMetrics: BatteryMetrics;
  timestamp: number;
}

export interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  isMobile: boolean;
  isTablet: boolean;
  orientation: 'portrait' | 'landscape';
  connectionType: string;
  memoryInfo?: MemoryInfo;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export interface UserInteractionMetrics {
  touchResponseTime: number;
  averageTouchDelay: number;
  scrollPerformance: number;
  animationFrameRate: number;
  inputLatency: number;
}

export interface NetworkMetrics {
  effectiveConnectionType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  apiResponseTimes: Record<string, number>;
}

export interface BatteryMetrics {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  batteryDrainRate: number;
}

export class MobilePerformanceMonitor {
  private metrics: MobilePerformanceMetrics;
  private listeners: Map<string, Function[]> = new Map();
  private isMonitoring: boolean = false;
  private performanceObserver?: PerformanceObserver;
  private batteryManager?: BatteryManager;
  private connection?: NetworkInformation;
  private touchStartTime: number = 0;
  private touchMetrics: { start: number; end: number; element: string }[] = [];

  constructor() {
    this.metrics = this.initializeMetrics();
    this.setupEventListeners();
    this.setupPerformanceObserver();
    this.setupBatteryMonitoring();
  }

  /**
   * Initialize baseline metrics
   */
  private initializeMetrics(): MobilePerformanceMetrics {
    return {
      deviceInfo: this.getDeviceInfo(),
      performanceMetrics: this.getPerformanceMetrics(),
      userInteractionMetrics: this.getUserInteractionMetrics(),
      networkMetrics: this.getNetworkMetrics(),
      batteryMetrics: this.getBatteryMetrics(),
      timestamp: Date.now(),
    };
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): DeviceInfo {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const isMobile = screenWidth <= 768;
    const isTablet = screenWidth > 600 && screenWidth <= 1024;
    const orientation = screenWidth < screenHeight ? 'portrait' : 'landscape';

    // Get connection information
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection ? connection.effectiveType || 'unknown' : 'unknown';

    // Get memory information if available
    const memoryInfo = (performance as any).memory ? {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
    } : undefined;

    return {
      userAgent: navigator.userAgent,
      screenWidth,
      screenHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      isMobile,
      isTablet,
      orientation,
      connectionType,
      memoryInfo,
    };
  }

  /**
   * Get performance metrics using Performance API
   */
  private getPerformanceMetrics(): PerformanceMetrics {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');

    return {
      pageLoadTime: navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.loadEventStart : 0,
      firstContentfulPaint: fcpEntry ? fcpEntry.startTime : 0,
      largestContentfulPaint: this.getLargestContentfulPaint(),
      firstInputDelay: this.getFirstInputDelay(),
      cumulativeLayoutShift: this.getCumulativeLayoutShift(),
      timeToInteractive: this.getTimeToInteractive(),
    };
  }

  /**
   * Get Largest Contentful Paint
   */
  private getLargestContentfulPaint(): number {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    return lcpEntries.length > 0 ? (lcpEntries[lcpEntries.length - 1] as any).startTime : 0;
  }

  /**
   * Get First Input Delay
   */
  private getFirstInputDelay(): number {
    const fidEntries = performance.getEntriesByType('first-input');
    return fidEntries.length > 0 ? (fidEntries[0] as any).processingStart - (fidEntries[0] as any).startTime : 0;
  }

  /**
   * Get Cumulative Layout Shift
   */
  private getCumulativeLayoutShift(): number {
    // This would need to be tracked over time
    // For now, return a placeholder
    return 0;
  }

  /**
   * Get Time to Interactive
   */
  private getTimeToInteractive(): number {
    // Simplified TTI calculation
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigationEntry ? navigationEntry.domInteractive - navigationEntry.fetchStart : 0;
  }

  /**
   * Get user interaction metrics
   */
  private getUserInteractionMetrics(): UserInteractionMetrics {
    const avgTouchDelay = this.touchMetrics.length > 0
      ? this.touchMetrics.reduce((sum, metric) => sum + (metric.end - metric.start), 0) / this.touchMetrics.length
      : 0;

    return {
      touchResponseTime: this.touchMetrics.length > 0 ? Math.min(...this.touchMetrics.map(m => m.end - m.start)) : 0,
      averageTouchDelay: avgTouchDelay,
      scrollPerformance: this.getScrollPerformance(),
      animationFrameRate: this.getAnimationFrameRate(),
      inputLatency: this.getInputLatency(),
    };
  }

  /**
   * Get scroll performance
   */
  private getScrollPerformance(): number {
    // Measure scroll performance
    let scrollPerformance = 0;
    let frameCount = 0;
    let lastFrameTime = performance.now();

    const measureScroll = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;
      scrollPerformance += frameTime;
      frameCount++;
      lastFrameTime = currentTime;

      if (frameCount < 60) {
        requestAnimationFrame(measureScroll);
      }
    };

    // Start measurement on scroll
    window.addEventListener('scroll', () => {
      if (frameCount === 0) {
        requestAnimationFrame(measureScroll);
      }
    }, { once: true });

    return scrollPerformance / Math.max(frameCount, 1);
  }

  /**
   * Get animation frame rate
   */
  private getAnimationFrameRate(): number {
    let frameCount = 0;
    let lastTime = performance.now();

    const countFrames = () => {
      frameCount++;
      if (frameCount < 60) {
        requestAnimationFrame(countFrames);
      }
    };

    requestAnimationFrame(countFrames);

    return frameCount;
  }

  /**
   * Get input latency
   */
  private getInputLatency(): number {
    // Measure input event latency
    let inputLatency = 0;
    let inputCount = 0;

    const measureInput = (event: Event) => {
      const latency = performance.now() - (event as any).timeStamp;
      inputLatency += latency;
      inputCount++;
    };

    window.addEventListener('click', measureInput, { once: true });
    window.addEventListener('touchstart', measureInput, { once: true });

    return inputCount > 0 ? inputLatency / inputCount : 0;
  }

  /**
   * Get network metrics
   */
  private getNetworkMetrics(): NetworkMetrics {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    return {
      effectiveConnectionType: connection ? connection.effectiveType || 'unknown' : 'unknown',
      downlink: connection ? connection.downlink || 0 : 0,
      rtt: connection ? connection.rtt || 0 : 0,
      saveData: connection ? connection.saveData || false : false,
      apiResponseTimes: this.getApiResponseTimes(),
    };
  }

  /**
   * Get API response times
   */
  private getApiResponseTimes(): Record<string, number> {
    // This would track actual API calls
    // For now, return empty object
    return {};
  }

  /**
   * Get battery metrics
   */
  private getBatteryMetrics(): BatteryMetrics {
    return {
      level: 1, // Placeholder
      charging: false, // Placeholder
      chargingTime: 0, // Placeholder
      dischargingTime: 0, // Placeholder
      batteryDrainRate: 0, // Placeholder
    };
  }

  /**
   * Setup event listeners for touch and interaction tracking
   */
  private setupEventListeners(): void {
    // Touch event tracking
    document.addEventListener('touchstart', (event) => {
      this.touchStartTime = performance.now();
      const target = (event.target as HTMLElement).tagName;
      this.touchMetrics.push({
        start: this.touchStartTime,
        end: 0,
        element: target,
      });
    }, { passive: true });

    document.addEventListener('touchend', (event) => {
      const touchEndTime = performance.now();
      if (this.touchMetrics.length > 0) {
        const lastMetric = this.touchMetrics[this.touchMetrics.length - 1];
        if (lastMetric.end === 0) {
          lastMetric.end = touchEndTime;
        }
      }
    }, { passive: true });

    // Keep only last 100 touch metrics to prevent memory issues
    if (this.touchMetrics.length > 100) {
      this.touchMetrics = this.touchMetrics.slice(-50);
    }
  }

  /**
   * Setup Performance Observer for real-time metrics
   */
  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.metrics.performanceMetrics.largestContentfulPaint = (entry as any).startTime;
          } else if (entry.entryType === 'first-input') {
            this.metrics.performanceMetrics.firstInputDelay = (entry as any).processingStart - (entry as any).startTime;
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    }
  }

  /**
   * Setup battery monitoring
   */
  private async setupBatteryMonitoring(): Promise<void> {
    if ('getBattery' in navigator) {
      try {
        this.batteryManager = await (navigator as any).getBattery();
        this.updateBatteryMetrics();

        this.batteryManager.addEventListener('levelchange', () => this.updateBatteryMetrics());
        this.batteryManager.addEventListener('chargingchange', () => this.updateBatteryMetrics());
      } catch (error) {
        console.warn('Battery API not available:', error);
      }
    }
  }

  /**
   * Update battery metrics
   */
  private updateBatteryMetrics(): void {
    if (this.batteryManager) {
      this.metrics.batteryMetrics = {
        level: this.batteryManager.level,
        charging: this.batteryManager.charging,
        chargingTime: this.batteryManager.chargingTime,
        dischargingTime: this.batteryManager.dischargingTime,
        batteryDrainRate: this.calculateBatteryDrainRate(),
      };
    }
  }

  /**
   * Calculate battery drain rate
   */
  private calculateBatteryDrainRate(): number {
    // Simplified battery drain calculation
    // In a real implementation, you would track battery level over time
    return 0;
  }

  /**
   * Start monitoring performance
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.metrics.timestamp = Date.now();
    
    // Update metrics every 30 seconds
    setInterval(() => {
      this.updateMetrics();
    }, 30000);
  }

  /**
   * Stop monitoring performance
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }

  /**
   * Update all metrics
   */
  private updateMetrics(): void {
    this.metrics = {
      deviceInfo: this.getDeviceInfo(),
      performanceMetrics: this.getPerformanceMetrics(),
      userInteractionMetrics: this.getUserInteractionMetrics(),
      networkMetrics: this.getNetworkMetrics(),
      batteryMetrics: this.getBatteryMetrics(),
      timestamp: Date.now(),
    };

    this.emit('metricsUpdated', this.metrics);
  }

  /**
   * Get current metrics
   */
  public getMetrics(): MobilePerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): Record<string, string> {
    const metrics = this.getMetrics();
    
    return {
      deviceType: metrics.deviceInfo.isMobile ? 'Mobile' : metrics.deviceInfo.isTablet ? 'Tablet' : 'Desktop',
      screenSize: `${metrics.deviceInfo.screenWidth}x${metrics.deviceInfo.screenHeight}`,
      orientation: metrics.deviceInfo.orientation,
      connectionType: metrics.networkMetrics.effectiveConnectionType,
      pageLoadTime: `${metrics.performanceMetrics.pageLoadTime.toFixed(2)}ms`,
      firstContentfulPaint: `${metrics.performanceMetrics.firstContentfulPaint.toFixed(2)}ms`,
      averageTouchDelay: `${metrics.userInteractionMetrics.averageTouchDelay.toFixed(2)}ms`,
      batteryLevel: `${(metrics.batteryMetrics.level * 100).toFixed(0)}%`,
      memoryUsage: metrics.deviceInfo.memoryInfo 
        ? `${(metrics.deviceInfo.memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`
        : 'N/A',
    };
  }

  /**
   * Check if performance is optimal
   */
  public isPerformanceOptimal(): boolean {
    const metrics = this.getMetrics();
    
    // Define optimal performance thresholds
    const thresholds = {
      pageLoadTime: 3000, // 3 seconds
      firstContentfulPaint: 1500, // 1.5 seconds
      averageTouchDelay: 100, // 100ms
      memoryUsage: 50 * 1024 * 1024, // 50MB
    };

    const isOptimal = 
      metrics.performanceMetrics.pageLoadTime < thresholds.pageLoadTime &&
      metrics.performanceMetrics.firstContentfulPaint < thresholds.firstContentfulPaint &&
      metrics.userInteractionMetrics.averageTouchDelay < thresholds.averageTouchDelay &&
      (!metrics.deviceInfo.memoryInfo || metrics.deviceInfo.memoryInfo.usedJSHeapSize < thresholds.memoryUsage);

    return isOptimal;
  }

  /**
   * Get performance recommendations
   */
  public getPerformanceRecommendations(): string[] {
    const metrics = this.getMetrics();
    const recommendations: string[] = [];

    if (metrics.performanceMetrics.pageLoadTime > 3000) {
      recommendations.push('Consider optimizing page load time - currently above 3 seconds');
    }

    if (metrics.performanceMetrics.firstContentfulPaint > 1500) {
      recommendations.push('First Contentful Paint is slow - consider optimizing critical rendering path');
    }

    if (metrics.userInteractionMetrics.averageTouchDelay > 100) {
      recommendations.push('Touch response time is slow - consider optimizing touch event handlers');
    }

    if (metrics.deviceInfo.memoryInfo && metrics.deviceInfo.memoryInfo.usedJSHeapSize > 50 * 1024 * 1024) {
      recommendations.push('High memory usage detected - consider optimizing memory usage');
    }

    if (metrics.networkMetrics.effectiveConnectionType === '2g' || metrics.networkMetrics.effectiveConnectionType === 'slow-2g') {
      recommendations.push('Slow network connection detected - consider implementing offline support');
    }

    if (metrics.batteryMetrics.level < 0.2) {
      recommendations.push('Low battery detected - consider reducing background activity');
    }

    return recommendations;
  }

  /**
   * Event emitter functionality
   */
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data));
    }
  }

  /**
   * Report metrics to analytics
   */
  public reportToAnalytics(): void {
    const metrics = this.getMetrics();
    const summary = this.getPerformanceSummary();
    const isOptimal = this.isPerformanceOptimal();
    const recommendations = this.getPerformanceRecommendations();

    // Send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mobile_performance', {
        device_type: summary.deviceType,
        page_load_time: metrics.performanceMetrics.pageLoadTime,
        first_contentful_paint: metrics.performanceMetrics.firstContentfulPaint,
        average_touch_delay: metrics.userInteractionMetrics.averageTouchDelay,
        is_optimal: isOptimal,
        recommendation_count: recommendations.length,
      });
    }

    // Send to custom analytics endpoint
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        metrics,
        summary,
        isOptimal,
        recommendations,
        timestamp: Date.now(),
      });

      navigator.sendBeacon('/api/analytics/mobile-performance', data);
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopMonitoring();
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    // Remove event listeners
    document.removeEventListener('touchstart', this.setupEventListeners as any);
    document.removeEventListener('touchend', this.setupEventListeners as any);
    window.removeEventListener('scroll', this.setupEventListeners as any);
    window.removeEventListener('click', this.setupEventListeners as any);
    window.removeEventListener('touchstart', this.setupEventListeners as any);
  }
}

/**
 * React Hook for mobile performance monitoring
 */
export const useMobilePerformanceMonitor = () => {
  const [monitor, setMonitor] = useState<MobilePerformanceMonitor | null>(null);
  const [metrics, setMetrics] = useState<MobilePerformanceMetrics | null>(null);
  const [isOptimal, setIsOptimal] = useState<boolean>(true);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const performanceMonitor = new MobilePerformanceMonitor();
    setMonitor(performanceMonitor);

    const handleMetricsUpdate = (newMetrics: MobilePerformanceMetrics) => {
      setMetrics(newMetrics);
      setIsOptimal(performanceMonitor.isPerformanceOptimal());
      setRecommendations(performanceMonitor.getPerformanceRecommendations());
    };

    performanceMonitor.on('metricsUpdated', handleMetricsUpdate);
    performanceMonitor.startMonitoring();

    return () => {
      performanceMonitor.off('metricsUpdated', handleMetricsUpdate);
      performanceMonitor.destroy();
    };
  }, []);

  return {
    monitor,
    metrics,
    isOptimal,
    recommendations,
    startMonitoring: () => monitor?.startMonitoring(),
    stopMonitoring: () => monitor?.stopMonitoring(),
    getMetrics: () => monitor?.getMetrics(),
    getPerformanceSummary: () => monitor?.getPerformanceSummary(),
    reportToAnalytics: () => monitor?.reportToAnalytics(),
  };
};

/**
 * Utility function to check if device is mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

/**
 * Utility function to check if device is tablet
 */
export const isTabletDevice = (): boolean => {
  return /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent) ||
         (window.innerWidth > 600 && window.innerWidth <= 1024);
};

/**
 * Utility function to get device orientation
 */
export const getDeviceOrientation = (): 'portrait' | 'landscape' => {
  return window.innerWidth < window.innerHeight ? 'portrait' : 'landscape';
};

/**
 * Utility function to get effective connection type
 */
export const getEffectiveConnectionType = (): string => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return connection ? connection.effectiveType || 'unknown' : 'unknown';
};

export default MobilePerformanceMonitor;
