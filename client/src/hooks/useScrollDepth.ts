import { useEffect, useRef } from 'react';
import { trackUserBehavior } from '@/utils/analytics';

export function useScrollDepth(pageName?: string) {
  const tracked = useRef(new Set<number>());

  useEffect(() => {
    const thresholds = [25, 50, 75, 90, 100];
    let lastScrollY = 0;
    let ticking = false;

    const updateScrollProgress = () => {
      const scrolled = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercent = Math.round((scrolled + viewportHeight) / documentHeight * 100);

      // Only track scrolling down
      if (scrolled > lastScrollY) {
        thresholds.forEach(threshold => {
          if (scrollPercent >= threshold && !tracked.current.has(threshold)) {
            tracked.current.add(threshold);
            trackUserBehavior('scroll_depth', {
              page: pageName || window.location.pathname,
              depth: threshold,
              percentage: `${threshold}%`
            });
          }
        });
      }

      lastScrollY = scrolled;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    const handleScroll = () => {
      requestTick();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pageName]);
}