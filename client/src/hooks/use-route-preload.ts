import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/AuthProvider';
import {
  prefetchPublicBlogDetail,
  prefetchPublicBlogIndex,
} from '@/lib/public-blog-data';
import { queryClient } from '@/lib/queryClient';
import { recoverFromStaleChunk } from '@/utils/chunk-recovery';

const ROUTE_RELATIONSHIPS: Record<string, string[]> = {
  '/': ['/calculators', '/services', '/experts'],
  '/calculators': ['/calculators/income-tax', '/calculators/sip', '/calculators/hra', '/calculators/emi', '/calculators/hsn-finder'],
  '/services': ['/services/gst-registration', '/services/company-registration', '/itr/form-selector', '/experts'],
  '/blog': ['/blog/:slug'],
  '/auth/login': ['/auth/register'],
  '/auth/register': ['/auth/login'],
  '/dashboard': ['/profiles', '/documents', '/payments', '/settings', '/itr/filing'],
  '/itr': ['/itr/form-selector', '/itr/status-tracker'],
  '/itr/form-selector': ['/itr/form-recommender', '/itr/filing'],
  '/experts': ['/experts/ca-rahul-sharma', '/experts/ca-priya-nair'],
};

const preloadedRoutes = new Set<string>();
const PRIVATE_ROUTE_PREFIXES = ['/dashboard', '/profiles', '/documents', '/payments', '/settings', '/itr/filing', '/reports', '/workflows', '/teams', '/referrals', '/export'];

function isPrivatePreload(path: string) {
  return PRIVATE_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function getImportPath(path: string) {
  return /^\/blog\/[^/?#]+$/.test(path) ? '/blog/:slug' : path;
}

function getBlogSlug(path: string) {
  const match = /^\/blog\/([^/?#]+)$/.exec(path);
  if (!match || match[1].startsWith(':')) return null;
  return decodeURIComponent(match[1]);
}

function preloadRouteData(path: string) {
  if (path === '/blog') {
    void prefetchPublicBlogIndex(queryClient).catch(() => undefined);
    return;
  }

  const blogSlug = getBlogSlug(path);
  if (blogSlug) {
    void prefetchPublicBlogDetail(queryClient, blogSlug).catch(() => undefined);
  }
}

const preloadRoute = (path: string, canPreloadPrivate: boolean) => {
  if (isPrivatePreload(path) && !canPreloadPrivate) return;
  preloadRouteData(path);
  if (preloadedRoutes.has(path)) return;
  
  const importMap: Record<string, () => Promise<unknown>> = {
    '/blog': () => import('@/pages/blog.page'),
    '/blog/:slug': () => import('@/pages/blog/[slug].page'),
    '/calculators': () => import('@/features/calculators/pages/index.page'),
    '/calculators/income-tax': () => import('@/features/calculators/pages/income-tax.page'),
    '/calculators/sip': () => import('@/features/calculators/pages/sip.page'),
    '/calculators/hra': () => import('@/features/calculators/pages/hra.page'),
    '/calculators/emi': () => import('@/features/calculators/pages/emi.page'),
    '/services': () => import('@/pages/services.page'),
    '/services/gst-registration': () => import('@/pages/services/gst-registration.page'),
    '/services/company-registration': () => import('@/pages/services/company-registration.page'),
    '/auth/login': () => import('@/pages/auth/login.page'),
    '/auth/register': () => import('@/pages/auth/register.page'),
    '/dashboard': () => import('@/pages/user-dashboard.page'),
    '/profiles': () => import('@/pages/profiles.page'),
    '/documents': () => import('@/pages/documents.page'),
    '/payments': () => import('@/pages/payments.page'),
    '/settings': () => import('@/pages/settings.page'),
    '/itr': () => import('@/features/itr/pages/filing.page'),
    '/itr/filing': () => import('@/features/itr/pages/filing.page'),
    '/itr/status-tracker': () => import('@/features/itr/pages/status-tracker.page'),
    '/itr/form-selector': () => import('@/features/itr/pages/form-selector.page'),
    '/itr/form-recommender': () => import('@/features/itr/pages/form-recommender.page'),
    '/experts': () => import('@/pages/experts/index.page'),
    '/experts/ca-rahul-sharma': () => import('@/pages/experts/profile.page'),
    '/experts/ca-priya-nair': () => import('@/pages/experts/profile.page'),
    '/calculators/hsn-finder': () => import('@/features/calculators/pages/hsn-finder.page'),
  };

  const loader = importMap[getImportPath(path)];
  if (loader) {
    preloadedRoutes.add(path);
    const loadSafely = () => {
      loader().catch((error) => {
        void recoverFromStaleChunk(error);
        preloadedRoutes.delete(path);
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadSafely, { timeout: 5000 });
    } else {
      setTimeout(loadSafely, 100);
    }
  }
};

export function useRoutePreload() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const relatedRoutes = ROUTE_RELATIONSHIPS[location] || [];
    
    const timer = setTimeout(() => {
      relatedRoutes.forEach(route => preloadRoute(route, isAuthenticated));
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, location]);

  const preloadOnHover = useCallback((path: string) => {
    preloadRoute(path, isAuthenticated);
  }, [isAuthenticated]);

  return { preloadOnHover };
}

export default useRoutePreload;
