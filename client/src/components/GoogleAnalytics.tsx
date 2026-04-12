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

    // Defer GA + Clarity loading until browser is idle to avoid blocking render
    const initGA = () => {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.defer = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script1);

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

      // Microsoft Clarity — deferred alongside GA
      const clarityId = 'vyw4w3qe7p';
      (window as any).clarity = (window as any).clarity || function(...args: any[]) {
        ((window as any).clarity.q = (window as any).clarity.q || []).push(args);
      };
      const clarityScript = document.createElement('script');
      clarityScript.async = true;
      clarityScript.src = `https://www.clarity.ms/tag/${clarityId}`;
      document.head.appendChild(clarityScript);
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(initGA, { timeout: 3000 });
    } else {
      setTimeout(initGA, 2000);
    }
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