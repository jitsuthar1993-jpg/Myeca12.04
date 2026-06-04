import '@testing-library/jest-dom';
import * as React from 'react';

(globalThis as unknown as { React: typeof React }).React = React;

// Server-side and shared tests opt into the node environment via the
// // @vitest-environment node pragma. They don't have a `window` global, so guard
// the browser-only polyfills below to keep this setup file node-safe.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: class IntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  });

  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: () => {},
  });
}
