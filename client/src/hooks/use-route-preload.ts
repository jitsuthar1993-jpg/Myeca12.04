import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

const ROUTE_RELATIONSHIPS: Record<string, string[]> = {
  '/': ['/calculators', '/services', '/auth/login'],
  '/calculators': ['/calculators/income-tax', '/calculators/sip', '/calculators/hra', '/calculators/emi'],
  '/services': ['/services/gst-registration', '/services/company-registration', '/services/itr-filing'],
  '/auth/login': ['/auth/register', '/dashboard'],
  '/auth/register': ['/auth/login', '/dashboard'],
  '/dashboard': ['/profiles', '/documents', '/settings'],
  '/itr': ['/itr/filing', '/itr/status-tracker'],
};

const preloadedRoutes = new Set<string>();

const preloadRoute = (path: string) => {
  if (preloadedRoutes.has(path)) return;
  
  const importMap: Record<string, () => Promise<unknown>> = {
    '/calculators': () => import('@/pages/calculators.page'),
    '/calculators/income-tax': () => import('@/pages/calculators/income-tax.page'),
    '/calculators/sip': () => import('@/pages/calculators/sip.page'),
    '/calculators/hra': () => import('@/pages/calculators/hra.page'),
    '/calculators/emi': () => import('@/pages/calculators/emi.page'),
    '/services': () => import('@/pages/services.page'),
    '/services/gst-registration': () => import('@/pages/services/gst-registration.page'),
    '/services/company-registration': () => import('@/pages/services/company-registration.page'),
    '/auth/login': () => import('@/pages/auth/login.page'),
    '/auth/register': () => import('@/pages/auth/register.page'),
    '/dashboard': () => import('@/pages/user-dashboard.page'),
    '/profiles': () => import('@/pages/profiles.page'),
    '/documents': () => import('@/pages/documents.page'),
    '/settings': () => import('@/pages/settings.page'),
    '/itr': () => import('@/pages/itr/filing.page'),
    '/itr/filing': () => import('@/pages/itr/filing.page'),
    '/itr/status-tracker': () => import('@/pages/itr/status-tracker.page'),
  };

  const loader = importMap[path];
  if (loader) {
    preloadedRoutes.add(path);
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loader(), { timeout: 5000 });
    } else {
      setTimeout(() => loader(), 100);
    }
  }
};

export function useRoutePreload() {
  const [location] = useLocation();

  useEffect(() => {
    const relatedRoutes = ROUTE_RELATIONSHIPS[location] || [];
    
    const timer = setTimeout(() => {
      relatedRoutes.forEach(route => preloadRoute(route));
    }, 1000);

    return () => clearTimeout(timer);
  }, [location]);

  const preloadOnHover = useCallback((path: string) => {
    preloadRoute(path);
  }, []);

  return { preloadOnHover };
}

export default useRoutePreload;
