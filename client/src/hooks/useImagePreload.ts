import { useEffect } from 'react';

interface PreloadOptions {
  priority?: 'high' | 'low';
  as?: 'image' | 'script' | 'style' | 'font';
}

export function useImagePreload(urls: string[], options: PreloadOptions = {}) {
  useEffect(() => {
    const { priority = 'low', as = 'image' } = options;

    urls.forEach(url => {
      // Create link element for preloading
      const link = document.createElement('link');
      link.rel = priority === 'high' ? 'preload' : 'prefetch';
      link.as = as;
      link.href = url;
      
      // Add crossorigin for images
      if (as === 'image') {
        link.crossOrigin = 'anonymous';
      }

      document.head.appendChild(link);

      // Also preload using Image object for immediate caching
      if (as === 'image') {
        const img = new Image();
        img.src = url;
      }
    });

    // Cleanup function
    return () => {
      // Remove preload links when component unmounts
      const links = document.querySelectorAll(`link[rel="preload"], link[rel="prefetch"]`);
      links.forEach(link => {
        if (urls.includes((link as HTMLLinkElement).href)) {
          if (link.parentNode) link.remove();
        }
      });
    };
  }, [urls, options.priority, options.as]);
}

// Utility function to preload critical images
export function preloadCriticalImages(imageUrls: string[]) {
  if (typeof window === 'undefined') return;

  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}