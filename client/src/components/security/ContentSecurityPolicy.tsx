import { useEffect } from 'react';

interface ContentSecurityPolicyProps {
  nonce?: string;
}

export function ContentSecurityPolicy({ nonce }: ContentSecurityPolicyProps) {
  useEffect(() => {
    // Set security headers via meta tags
    const metaTags = [
      {
        name: 'Content-Security-Policy',
        content: [
          `default-src 'self'`,
          `script-src 'self' ${nonce ? `'nonce-${nonce}'` : ''} 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com`,
          `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
          `font-src 'self' https://fonts.gstatic.com`,
          `img-src 'self' data: https: blob:`,
          `connect-src 'self' https://www.google-analytics.com https://analytics.google.com`,
          `frame-ancestors 'none'`,
          `form-action 'self'`,
          `base-uri 'self'`,
          `object-src 'none'`,
        ].join('; '),
      },
      {
        httpEquiv: 'X-Content-Type-Options',
        content: 'nosniff',
      },
      {
        httpEquiv: 'X-Frame-Options',
        content: 'DENY',
      },
      {
        httpEquiv: 'X-XSS-Protection',
        content: '1; mode=block',
      },
      {
        name: 'Referrer-Policy',
        content: 'strict-origin-when-cross-origin',
      },
      {
        name: 'Permissions-Policy',
        content: 'camera=(), microphone=(), geolocation=(self), payment=()',
      },
    ];

    // Add meta tags to document head
    metaTags.forEach((tag) => {
      const meta = document.createElement('meta');
      if (tag.name) {
        meta.name = tag.name;
      }
      if (tag.httpEquiv) {
        meta.httpEquiv = tag.httpEquiv;
      }
      meta.content = tag.content;
      document.head.appendChild(meta);
    });

    // Cleanup on unmount
    return () => {
      metaTags.forEach((tag) => {
        const selector = tag.name 
          ? `meta[name="${tag.name}"]` 
          : `meta[http-equiv="${tag.httpEquiv}"]`;
        const meta = document.querySelector(selector);
        if (meta) {
          meta.remove();
        }
      });
    };
  }, [nonce]);

  return null;
}