import { useEffect, useRef } from 'react';

const SCROLL_RETRY_DELAYS_MS = [0, 80, 180, 350] as const;

type ScheduledScroll = {
  animationFrameId: number | null;
  timeoutIds: number[];
};

function scrollPageToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function findHashTarget(hash: string) {
  const rawId = hash.startsWith('#') ? hash.slice(1) : hash;

  if (!rawId) {
    return null;
  }

  try {
    const decodedId = decodeURIComponent(rawId);
    return document.getElementById(decodedId) ?? document.getElementsByName(decodedId)[0] ?? null;
  } catch {
    return document.getElementById(rawId) ?? document.getElementsByName(rawId)[0] ?? null;
  }
}

function scrollToRouteTarget(hash: string) {
  const target = findHashTarget(hash);

  if (target) {
    target.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' });
    return;
  }

  scrollPageToTop();
}

function scheduleRouteScroll(hash: string): () => void {
  const scheduled: ScheduledScroll = {
    animationFrameId: null,
    timeoutIds: [],
  };
  const scroll = () => scrollToRouteTarget(hash);

  scroll();

  if (typeof window.requestAnimationFrame === 'function') {
    scheduled.animationFrameId = window.requestAnimationFrame(scroll);
  }

  scheduled.timeoutIds = SCROLL_RETRY_DELAYS_MS.map((delay) => window.setTimeout(scroll, delay));

  return () => {
    if (scheduled.animationFrameId !== null && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(scheduled.animationFrameId);
    }

    scheduled.timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
  };
}

function getSamePageHash(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute('href');

  if (!href) {
    return '';
  }

  if (href.startsWith('#')) {
    return href;
  }

  const targetUrl = new URL(anchor.href);

  if (
    targetUrl.origin !== window.location.origin ||
    targetUrl.pathname !== window.location.pathname ||
    targetUrl.search !== window.location.search
  ) {
    return '';
  }

  return targetUrl.hash;
}

export function useRouteScrollManager(location: string) {
  const cancelScheduledScrollRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    let hashClickTimeoutId: number | null = null;

    const runScheduledScroll = (hash = window.location.hash) => {
      cancelScheduledScrollRef.current?.();
      cancelScheduledScrollRef.current = scheduleRouteScroll(hash);
    };
    const handleHashChange = () => runScheduledScroll();

    const handleHashLinkClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
      const hash = anchor ? getSamePageHash(anchor) : '';

      if (!hash) {
        return;
      }

      if (hashClickTimeoutId !== null) {
        window.clearTimeout(hashClickTimeoutId);
      }

      hashClickTimeoutId = window.setTimeout(() => runScheduledScroll(hash), 0);
    };

    runScheduledScroll();
    window.addEventListener('hashchange', handleHashChange);
    document.addEventListener('click', handleHashLinkClick);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('click', handleHashLinkClick);
      if (hashClickTimeoutId !== null) {
        window.clearTimeout(hashClickTimeoutId);
      }
      cancelScheduledScrollRef.current?.();
      cancelScheduledScrollRef.current = null;
    };
  }, [location]);
}
