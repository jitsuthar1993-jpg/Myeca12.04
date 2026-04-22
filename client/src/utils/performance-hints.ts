// Performance hints for critical resources
export const performanceHints = {
  // Preconnect to external domains
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://clerk.myeca.in'
  ],

  // DNS prefetch for potential external resources
  dnsPrefetch: [
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
    'https://clerk.myeca.in'
  ],

  // Critical fonts to preload
  fonts: [
    'https://fonts.gstatic.com/s/plusjakartasans/v8/L0xPDFytS3pcFbqBMpKwYia7W67XHd_jOnd_kG0.woff2'
  ],

  // Critical images to preload
  images: [
    '/favicon.svg'
  ]
};

// Add performance hints to document head
export function addPerformanceHints() {
  const head = document.head;

  // Add preconnect hints
  performanceHints.preconnect.forEach(url => {
    if (document.querySelector(`link[rel="preconnect"][href="${url}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    if (url.includes('gstatic')) {
      link.crossOrigin = 'anonymous';
    }
    head.appendChild(link);
  });

  // Add DNS prefetch hints
  performanceHints.dnsPrefetch.forEach(url => {
    if (document.querySelector(`link[rel="dns-prefetch"][href="${url}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    head.appendChild(link);
  });

  // Add font preloads
  performanceHints.fonts.forEach(url => {
    if (document.querySelector(`link[rel="preload"][href="${url}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = url;
    link.crossOrigin = 'anonymous';
    head.appendChild(link);
  });

  // Add image preloads for LCP candidates
  performanceHints.images.forEach(url => {
    if (document.querySelector(`link[rel="preload"][href="${url}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    head.appendChild(link);
  });
}

// Resource hints for lazy-loaded components
export function addResourceHint(url: string, type: 'prefetch' | 'preload' = 'prefetch') {
  const link = document.createElement('link');
  link.rel = type;
  link.href = url;
  
  if (url.endsWith('.js') || url.endsWith('.mjs')) {
    link.as = 'script';
  } else if (url.endsWith('.css')) {
    link.as = 'style';
  } else if (url.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)) {
    link.as = 'image';
  }
  
  document.head.appendChild(link);
}

// Lazy load scripts with performance monitoring
export function lazyLoadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.body.appendChild(script);
  });
}