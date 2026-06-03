import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/AuthProvider';
import { preloadRouteModule } from '@/routes/route-preload';

const ROUTE_RELATIONSHIPS: Record<string, string[]> = {
  '/': ['/itr/start', '/calculators', '/services', '/experts'],
  '/calculators': ['/calculators/income-tax', '/calculators/sip', '/calculators/hra', '/calculators/emi', '/calculators/hsn-finder'],
  '/services': ['/services/gst-registration', '/services/company-registration', '/itr/start', '/experts'],
  '/blog': ['/blog/:slug'],
  '/auth/login': ['/auth/register'],
  '/auth/register': ['/auth/login'],
  '/dashboard': ['/profiles', '/documents', '/settings', '/itr/start'],
  '/itr': ['/itr/start', '/itr/form-selector', '/itr/status-tracker'],
  '/itr/start': ['/itr/form-selector', '/expert-consultation'],
  '/itr/form-selector': ['/itr/form-recommender', '/itr/filing'],
  '/experts': ['/experts/ca-rahul-sharma', '/experts/ca-priya-nair'],
};

type UseRoutePreloadOptions = {
  preloadRelated?: boolean;
};

export function useRoutePreload({ preloadRelated = false }: UseRoutePreloadOptions = {}) {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!preloadRelated) return;

    const relatedRoutes = ROUTE_RELATIONSHIPS[location] || [];
    
    const timer = setTimeout(() => {
      relatedRoutes.forEach(route => preloadRouteModule(route, isAuthenticated));
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, location, preloadRelated]);

  const preloadOnHover = useCallback((path: string) => {
    preloadRouteModule(path, isAuthenticated);
  }, [isAuthenticated]);

  return { preloadOnHover };
}

export default useRoutePreload;
