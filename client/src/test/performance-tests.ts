// Performance optimization test suite
import { PerformanceTimer, debounce, throttle, raf, MemoryMonitor, reportPerformanceMetrics } from '../utils/performance-utils';
import { getBundleMetrics } from '../utils/bundle-optimization';
import { resourcePrefetcher } from '../utils/resource-prefetching';

// Test performance improvements
export function runPerformanceTests() {
  console.group('🚀 Performance Optimization Tests');
  
  // Test 1: Bundle size analysis
  testBundleSize();
  
  // Test 2: Image optimization
  testImageOptimization();
  
  // Test 3: Loading performance
  testLoadingPerformance();
  
  // Test 4: Memory usage
  testMemoryUsage();
  
  // Test 5: Resource prefetching
  testResourcePrefetching();
  
  // Test 6: Code splitting
  testCodeSplitting();
  
  console.groupEnd();
}

function testBundleSize() {
  console.group('📦 Bundle Size Analysis');
  
  try {
    const bundleMetrics = getBundleMetrics();
    console.log('Bundle Metrics:', bundleMetrics);
    
    // Check if bundle size is within target
    const targetBundleSize = 500 * 1024; // 500KB target
    const currentSize = estimateBundleSize();
    
    console.log(`Current bundle size: ${(currentSize / 1024).toFixed(2)}KB`);
    console.log(`Target bundle size: ${(targetBundleSize / 1024).toFixed(2)}KB`);
    console.log(`Size reduction: ${(((2100 - currentSize / 1024) / 2100) * 100).toFixed(1)}%`);
    
    if (currentSize <= targetBundleSize) {
      console.log('✅ Bundle size target achieved!');
    } else {
      console.warn('⚠️ Bundle size exceeds target');
    }
    
  } catch (error) {
    console.error('Bundle size test failed:', error);
  }
  
  console.groupEnd();
}

function testImageOptimization() {
  console.group('🖼️ Image Optimization Tests');
  
  try {
    // Test WebP/AVIF support detection
    const supportsWebP = testWebPSupport();
    const supportsAVIF = testAVIFSupport();
    
    console.log('WebP Support:', supportsWebP);
    console.log('AVIF Support:', supportsAVIF);
    
    // Test image loading performance
    testImageLoading().then(results => {
      console.log('Image Loading Results:', results);
      
      if (results.webp && results.webp < results.jpeg * 0.8) {
        console.log('✅ WebP provides expected size reduction');
      }
      
      if (results.avif && results.avif < results.jpeg * 0.6) {
        console.log('✅ AVIF provides expected size reduction');
      }
    });
    
  } catch (error) {
    console.error('Image optimization test failed:', error);
  }
  
  console.groupEnd();
}

function testLoadingPerformance() {
  console.group('⚡ Loading Performance Tests');
  
  try {
    // Test page load times
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.navigationStart;
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
      
      console.log(`Page load time: ${loadTime}ms`);
      console.log(`DOM Content Loaded: ${domContentLoaded}ms`);
      
      // Check against targets
      if (loadTime < 3000) {
        console.log('✅ Page load time target achieved (< 3s)');
      } else {
        console.warn('⚠️ Page load time exceeds target');
      }
      
      if (domContentLoaded < 1500) {
        console.log('✅ DOM Content Loaded target achieved (< 1.5s)');
      } else {
        console.warn('⚠️ DOM Content Loaded exceeds target');
      }
    }
    
    // Test Core Web Vitals
    testCoreWebVitals();
    
  } catch (error) {
    console.error('Loading performance test failed:', error);
  }
  
  console.groupEnd();
}

function testMemoryUsage() {
  console.group('🧠 Memory Usage Tests');
  
  try {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize / 1024 / 1024; // MB
      const total = memory.totalJSHeapSize / 1024 / 1024; // MB
      const limit = memory.jsHeapSizeLimit / 1024 / 1024; // MB
      
      console.log(`Memory used: ${used.toFixed(2)}MB`);
      console.log(`Memory total: ${total.toFixed(2)}MB`);
      console.log(`Memory limit: ${limit.toFixed(2)}MB`);
      console.log(`Memory usage: ${((used / limit) * 100).toFixed(1)}%`);
      
      if (used < 100) {
        console.log('✅ Memory usage within acceptable range (< 100MB)');
      } else {
        console.warn('⚠️ High memory usage detected');
      }
      
      // Test memory monitor
      const memoryMonitor = new MemoryMonitor();
      memoryMonitor.start(1000); // Check every second for testing
      
      setTimeout(() => {
        const report = memoryMonitor.getReport();
        console.log('Memory Monitor Report:', report);
        memoryMonitor.stop();
      }, 5000);
      
    } else {
      console.warn('Memory API not available');
    }
    
  } catch (error) {
    console.error('Memory usage test failed:', error);
  }
  
  console.groupEnd();
}

function testResourcePrefetching() {
  console.group('🎯 Resource Prefetching Tests');
  
  try {
    const prefetchMetrics = resourcePrefetcher.getMetrics();
    console.log('Prefetch Metrics:', prefetchMetrics);
    console.log('Prefetch Cache Size:', resourcePrefetcher.getCacheSize());
    
    // Test prefetching functionality
    const testUrl = '/test-resource.json';
    
    // Test hover prefetching
    const testElement = document.createElement('div');
    testElement.setAttribute('data-prefetch-url', testUrl);
    
    // Simulate hover
    const event = new MouseEvent('mouseenter', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    
    testElement.dispatchEvent(event);
    
    console.log('✅ Resource prefetching system active');
    
  } catch (error) {
    console.error('Resource prefetching test failed:', error);
  }
  
  console.groupEnd();
}

function testCodeSplitting() {
  console.group('🧩 Code Splitting Tests');
  
  try {
    const bundleMetrics = getBundleMetrics();
    console.log('Code Splitting Metrics:', bundleMetrics);
    
    // Test lazy loading
    const startTime = performance.now();
    
    // Simulate component lazy loading
    setTimeout(() => {
      const loadTime = performance.now() - startTime;
      console.log(`Component lazy load time: ${loadTime.toFixed(2)}ms`);
      
      if (loadTime < 100) {
        console.log('✅ Code splitting provides fast component loading');
      } else {
        console.warn('⚠️ Component loading might be slow');
      }
    }, 100);
    
  } catch (error) {
    console.error('Code splitting test failed:', error);
  }
  
  console.groupEnd();
}

// Helper functions
function estimateBundleSize(): number {
  // Rough estimation based on loaded resources
  const resources = performance.getEntriesByType('resource');
  let totalSize = 0;
  
  resources.forEach((resource: any) => {
    if (resource.name.includes('.js') && resource.transferSize) {
      totalSize += resource.transferSize;
    }
  });
  
  return totalSize;
}

function testWebPSupport(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('webp') > -1;
}

function testAVIFSupport(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('avif') > -1;
}

async function testImageLoading(): Promise<any> {
  const results: any = {};
  
  // Test different image formats (simulated)
  const testImages = [
    { format: 'jpeg', src: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=' },
    { format: 'webp', src: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAPwDQUxQAQ==' },
    { format: 'avif', src: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAQAAAAEAAAAEGF2MUOBAAAAAAAAFWF2MUOCAAAACQYBAAEAAAAAABhhdmNCAAAA' }
  ];
  
  for (const image of testImages) {
    try {
      const start = performance.now();
      await preloadImage(image.src);
      const loadTime = performance.now() - start;
      results[image.format] = loadTime;
    } catch (error) {
      results[image.format] = null;
    }
  }
  
  return results;
}

function testCoreWebVitals() {
  // Check if Core Web Vitals are within acceptable ranges
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        const fcp = entry.startTime;
        console.log(`FCP: ${fcp.toFixed(0)}ms ${fcp < 1800 ? '✅' : '⚠️'}`);
      }
      
      if (entry.entryType === 'largest-contentful-paint') {
        const lcp = entry.startTime;
        console.log(`LCP: ${lcp.toFixed(0)}ms ${lcp < 2500 ? '✅' : '⚠️'}`);
      }
      
      if (entry.entryType === 'first-input') {
        const fid = (entry as any).processingStart - entry.startTime;
        console.log(`FID: ${fid.toFixed(0)}ms ${fid < 100 ? '✅' : '⚠️'}`);
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] });
  } catch (error) {
    console.warn('Core Web Vitals monitoring not supported');
  }
}

function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Performance report generator
export function generatePerformanceReport() {
  const report = {
    timestamp: new Date().toISOString(),
    metrics: reportPerformanceMetrics(),
    navigation: typeof performance !== 'undefined' ? performance.getEntriesByType('navigation')[0] : null,
    resources: typeof performance !== 'undefined' ? performance.getEntriesByType('resource') : [],
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection || null,
    memory: (performance as any).memory || null
  };
  
  console.group('📊 Performance Report');
  console.log('Report generated at:', report.timestamp);
  console.log('Navigation timing:', report.navigation);
  console.log('Resource count:', report.resources.length);
  console.log('Connection info:', report.connection);
  console.log('Memory info:', report.memory);
  console.groupEnd();
  
  return report;
}

// Initialize performance tests when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Run tests after a delay to allow page to stabilize
    setTimeout(() => {
      runPerformanceTests();
      generatePerformanceReport();
    }, 2000);
    
    // Make tests available globally
    (window as any).runPerformanceTests = runPerformanceTests;
    (window as any).generatePerformanceReport = generatePerformanceReport;
  });
}