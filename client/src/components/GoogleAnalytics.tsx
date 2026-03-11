import { useEffect } from 'react';
import { useLocation } from 'wouter';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export default function GoogleAnalytics() {
  const [location] = useLocation();

  useEffect(() => {
    // Only load GA in production
    if (import.meta.env.MODE !== 'production') {
      console.log('Google Analytics disabled in development');
      return;
    }

    // Load GA script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    // Initialize GA
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
      page_path: location
    });
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (typeof window.gtag !== 'undefined' && import.meta.env.MODE === 'production') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location,
      });
    }
  }, [location]);

  return null;
}