import { useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';

export function useRoutePreload() {
  const { isAuthenticated } = useAuth();

  const preloadOnHover = useCallback((path: string) => {
    void import("@/routes/route-preload")
      .then(({ preloadRouteModule }) => preloadRouteModule(path, isAuthenticated))
      .catch(() => {
        // Speculative preloading may fail; normal route navigation remains available.
      });
  }, [isAuthenticated]);

  return { preloadOnHover };
}

export default useRoutePreload;
