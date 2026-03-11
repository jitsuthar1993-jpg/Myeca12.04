// Advanced bundle optimization utilities
import { lazy, Suspense, ComponentType } from 'react';

// Lazy loading with fast retry mechanism
export const lazyWithRetry = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  maxRetries = 2,
  retryDelay = 100
) => {
  return lazy(async () => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const module = await importFunc();
        return module;
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    throw lastError!;
  });
};

// Bundle size tracking
interface BundleMetrics {
  size: number;
  loadTime: number;
  cacheHit: boolean;
}

const bundleMetrics = new Map<string, BundleMetrics>();

// Performance observer for bundle loading - lightweight version
export const trackBundleLoad = (componentName: string, startTime: number) => {
  // Disabled verbose logging to improve performance
};

// Advanced lazy loading with optional preloading (disabled by default for performance)
export const lazyWithPreload = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  componentName: string
) => {
  const LazyComponent = lazy(factory);
  
  // Manual preload function - only called explicitly, not automatically
  const preload = () => {
    factory();
  };

  return Object.assign(LazyComponent, { preload });
};

// Priority-based code splitting
export const createPriorityLoader = () => {
  const loaders = new Map<string, () => Promise<any>>();
  
  return {
    register: (name: string, loader: () => Promise<any>) => {
      loaders.set(name, loader);
    },
    
    load: async (name: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
      const loader = loaders.get(name);
      if (!loader) {
        console.warn(`Loader not found: ${name}`);
        return null;
      }

      const startTime = performance.now();
      
      // High priority: load immediately
      if (priority === 'high') {
        const result = await loader();
        trackBundleLoad(name, startTime);
        return result;
      }
      
      // Medium priority: load on idle
      if (priority === 'medium' && typeof requestIdleCallback !== 'undefined') {
        return new Promise((resolve) => {
          requestIdleCallback(async () => {
            const result = await loader();
            trackBundleLoad(name, startTime);
            resolve(result);
          }, { timeout: 3000 });
        });
      }
      
      // Low priority: load with delay
      if (priority === 'low') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const result = await loader();
        trackBundleLoad(name, startTime);
        return result;
      }
      
      const result = await loader();
      trackBundleLoad(name, startTime);
      return result;
    }
  };
};

// Route-based code splitting
export const routeComponents = {
  // Auth routes
  Login: lazyWithPreload(() => import('@/pages/auth/login.page'), 'LoginPage'),
  Register: lazyWithPreload(() => import('@/pages/auth/register.page'), 'RegisterPage'),
  AdminLogin: lazyWithPreload(() => import('@/pages/auth/admin-login.page'), 'AdminLoginPage'),
  
  // Main app routes
  Dashboard: lazyWithPreload(() => import('@/pages/user-dashboard.page'), 'DashboardPage'),
  TaxCalculator: lazyWithPreload(() => import('@/pages/calculators/income-tax.page'), 'TaxCalculatorPage'),
  Reports: lazyWithPreload(() => import('@/pages/reports.page'), 'ReportsPage'),
  Settings: lazyWithPreload(() => import('@/pages/settings.page'), 'SettingsPage'),
  
  // Feature routes
  Profile: lazyWithPreload(() => import('@/pages/profiles.page'), 'ProfilePage'),
  Documents: lazyWithPreload(() => import('@/pages/documents.page'), 'DocumentsPage'),
  Analytics: lazyWithPreload(() => import('@/pages/analytics.page'), 'AnalyticsPage'),
  
  // Admin routes (lower priority)
  AdminDashboard: lazy(() => import('@/pages/admin/index.page')),
  AdminUsers: lazy(() => import('@/pages/admin/users.page')),
  AdminSettings: lazy(() => import('@/pages/admin/settings.page')),
};

// Component-based code splitting for heavy components - simplified for performance
export const heavyComponents = {};

// Utility functions
export const preloadComponent = (componentName: keyof typeof routeComponents | keyof typeof heavyComponents) => {
  const component = routeComponents[componentName as keyof typeof routeComponents] || 
                   heavyComponents[componentName as keyof typeof heavyComponents];
  
  if (component && typeof (component as any).preload === 'function') {
    (component as any).preload();
  }
};

// Bundle size analyzer
export const analyzeBundleSize = async () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  try {
    // Check if webpack bundle analyzer is available
    const stats = await fetch('/stats.json');
    if (stats.ok) {
      const data = await stats.json();
      console.log('Bundle analysis available:', data);
    }
  } catch (error) {
    console.warn('Bundle analyzer not available');
  }
};

// Memory usage tracking
export const trackMemoryUsage = () => {
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
    };
  }
  return null;
};

// Export metrics for debugging
export const getBundleMetrics = () => {
  return {
    components: Object.fromEntries(bundleMetrics),
    memory: trackMemoryUsage(),
  };
};

// Initialize bundle optimization - lightweight version
export const initializeBundleOptimization = () => {
  // Only preload on explicit user action, not automatically
};