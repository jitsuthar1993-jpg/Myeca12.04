// Conversion tracking component for key actions

import { useEffect } from 'react';
import { trackConversion, trackEvent } from '@/utils/analytics';
import { trackPurchase, trackAddToCart, trackBeginCheckout, trackViewItem } from '@/utils/analytics-enhanced';

interface ConversionTrackerProps {
  conversionType: 'signup' | 'login' | 'itr_filing' | 'service_purchase' | 'calculator_use' | 'form_submit';
  conversionValue?: number;
  metadata?: Record<string, any>;
}

export default function ConversionTracker({ conversionType, conversionValue, metadata }: ConversionTrackerProps) {
  useEffect(() => {
    // Track the conversion
    trackConversion(conversionType, conversionValue);

    // Additional tracking based on conversion type
    switch (conversionType) {
      case 'service_purchase':
        if (metadata?.transaction) {
          trackPurchase(metadata.transaction);
        }
        break;
      
      case 'itr_filing':
        trackEvent('complete_registration', 'Conversion', 'ITR Filing Started', conversionValue);
        break;
      
      case 'calculator_use':
        trackEvent('generate_lead', 'Conversion', 'Calculator Used', 1);
        break;
    }

    // Log conversion in development
    if (import.meta.env.MODE !== 'production') {
      console.log('Conversion tracked:', {
        type: conversionType,
        value: conversionValue,
        metadata
      });
    }
  }, [conversionType, conversionValue, metadata]);

  return null; // This component doesn't render anything
}

// Hook for tracking e-commerce events
export function useEcommerceTracking() {
  const trackProductView = (item: any) => {
    trackViewItem(item);
  };

  const trackAddToCartAction = (item: any) => {
    trackAddToCart(item);
  };

  const trackCheckoutStart = (items: any[], totalValue: number) => {
    trackBeginCheckout(items, totalValue);
  };

  const trackPurchaseComplete = (transaction: any) => {
    trackPurchase(transaction);
  };

  return {
    trackProductView,
    trackAddToCart: trackAddToCartAction,
    trackCheckoutStart,
    trackPurchaseComplete
  };
}
