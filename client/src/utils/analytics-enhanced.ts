// Enhanced Analytics Tracking with Conversion and E-commerce Support

import { trackEvent, trackConversion } from './analytics';

// E-commerce tracking
export interface EcommerceItem {
  item_id: string;
  item_name: string;
  price: number;
  currency?: string;
  category?: string;
  quantity?: number;
}

export interface EcommerceTransaction {
  transaction_id: string;
  value: number;
  currency: string;
  items: EcommerceItem[];
  tax?: number;
  shipping?: number;
  coupon?: string;
}

// Enhanced event tracking
export function trackFormStart(formName: string, formType: string): void {
  trackEvent('form_start', 'Form Interaction', `${formName} - ${formType}`);
}

export function trackFormProgress(formName: string, step: number, totalSteps: number): void {
  const progressPercentage = Math.round((step / totalSteps) * 100);
  trackEvent('form_progress', 'Form Interaction', `${formName} - Step ${step}/${totalSteps}`, progressPercentage);
}

export function trackFormSubmit(formName: string, formType: string, success: boolean): void {
  trackEvent(
    success ? 'form_submit_success' : 'form_submit_error',
    'Form Interaction',
    `${formName} - ${formType}`,
    success ? 1 : 0
  );

  if (success && ['itr_filing', 'service_purchase', 'consultation_booking'].includes(formType)) {
    trackConversion(formType, 0);
  }
}

export function trackFormFieldError(formName: string, fieldName: string, errorType: string): void {
  trackEvent('form_field_error', 'Form Validation', `${formName} - ${fieldName} - ${errorType}`);
}

// Calculator tracking
export function trackCalculatorUse(calculatorName: string, inputValues: Record<string, any>, result: number): void {
  trackEvent('calculator_use', 'Calculator', calculatorName, Math.round(result));
}

// Service interaction tracking
export function trackServiceView(serviceName: string, serviceId: string, price: number): void {
  trackEvent('service_view', 'Service Interaction', `${serviceName} (${serviceId})`, price);
}

export function trackServiceClick(serviceName: string, serviceId: string, action: 'learn_more' | 'buy_now' | 'get_quote'): void {
  trackEvent('service_click', 'Service Interaction', `${serviceName} - ${action}`);
}

// E-commerce tracking functions
export function trackViewItem(item: EcommerceItem): void {
  if (!window.gtag) return;

  window.gtag('event', 'view_item', {
    currency: item.currency || 'INR',
    value: item.price,
    items: [item]
  });
}

export function trackAddToCart(item: EcommerceItem): void {
  if (!window.gtag) return;

  window.gtag('event', 'add_to_cart', {
    currency: item.currency || 'INR',
    value: item.price,
    items: [item]
  });

  trackEvent('add_to_cart', 'E-commerce', item.item_name, item.price);
}

export function trackBeginCheckout(items: EcommerceItem[], totalValue: number): void {
  if (!window.gtag) return;

  window.gtag('event', 'begin_checkout', {
    currency: 'INR',
    value: totalValue,
    items: items
  });

  trackEvent('begin_checkout', 'E-commerce', `${items.length} items`, totalValue);
}

export function trackPurchase(transaction: EcommerceTransaction): void {
  if (!window.gtag) return;

  window.gtag('event', 'purchase', {
    transaction_id: transaction.transaction_id,
    value: transaction.value,
    tax: transaction.tax || 0,
    shipping: transaction.shipping || 0,
    currency: transaction.currency,
    coupon: transaction.coupon,
    items: transaction.items
  });

  trackConversion('purchase', transaction.value);

  trackEvent('purchase_complete', 'E-commerce', transaction.transaction_id, transaction.value);
}

// User engagement tracking
export function trackScrollDepth(percentage: number): void {
  // Track at 25%, 50%, 75%, and 100%
  const milestones = [25, 50, 75, 100];
  const milestone = milestones.find(m => percentage >= m && percentage < m + 25);
  
  if (milestone) {
    trackEvent('scroll_depth', 'User Engagement', `${milestone}%`, milestone);
  }
}

export function trackTimeOnPage(seconds: number, pageName: string): void {
  // Track at 30s, 60s, 120s, 300s intervals
  const milestones = [30, 60, 120, 300];
  const milestone = milestones.find(m => seconds >= m && seconds < m * 2);
  
  if (milestone) {
    trackEvent('time_on_page', 'User Engagement', pageName, milestone);
  }
}

export function trackVideoEngagement(videoName: string, action: 'play' | 'pause' | 'complete', percentage?: number): void {
  trackEvent(`video_${action}`, 'Video Engagement', videoName, percentage);
}

// A/B Testing support
export function trackExperiment(experimentName: string, variant: string): void {
  trackEvent('experiment_view', 'A/B Testing', `${experimentName} - ${variant}`);
}

// Error tracking
export function trackError(errorType: string, errorMessage: string, errorLocation?: string): void {
  trackEvent('error_occurred', 'Error Tracking', `${errorType}: ${errorMessage} at ${errorLocation || 'unknown'}`);
}

// Search tracking
export function trackSiteSearch(searchTerm: string, resultsCount: number, searchType?: string): void {
  if (!window.gtag) return;

  window.gtag('event', 'search', {
    search_term: searchTerm
  });

  trackEvent('site_search', 'Search', searchTerm, resultsCount);
}

// Social sharing tracking
export function trackSocialShare(platform: string, contentType: string, contentId?: string): void {
  if (!window.gtag) return;

  window.gtag('event', 'share', {
    method: platform,
    content_type: contentType,
    item_id: contentId
  });

  trackEvent('social_share', 'Social Engagement', `${platform} - ${contentType}`);
}

// Exit intent tracking
export function trackExitIntent(currentPage: string, timeOnPage: number): void {
  trackEvent('exit_intent', 'User Behavior', currentPage, timeOnPage);
}

// User preferences tracking
export function trackUserPreference(preferenceName: string, preferenceValue: string): void {
  trackEvent('preference_set', 'User Preferences', `${preferenceName}: ${preferenceValue}`);
}

// Feature usage tracking
export function trackFeatureUse(featureName: string, featureAction: string, featureValue?: any): void {
  trackEvent('feature_use', 'Feature Usage', `${featureName} - ${featureAction}`, typeof featureValue === 'number' ? featureValue : undefined);
}

// Initialize enhanced analytics - optimized for performance
export function initializeEnhancedAnalytics(): void {
  // Track scroll depth with debouncing
  let maxScroll = 0;
  let scrollTimeout: number;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = window.setTimeout(() => {
      const scrollPercentage = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercentage > maxScroll + 10) {
        maxScroll = scrollPercentage;
        trackScrollDepth(scrollPercentage);
      }
    }, 500);
  }, { passive: true });

  // Track time on page on unload instead of intervals
  const startTime = Date.now();
  
  window.addEventListener('beforeunload', () => {
    const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
    trackTimeOnPage(timeOnPage, window.location.pathname);
  });

  // Track exit intent
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0) {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
      trackExitIntent(window.location.pathname, timeOnPage);
    }
  });

  // Track errors
  window.addEventListener('error', (event) => {
    trackError('JavaScript Error', event.message, `${event.filename}:${event.lineno}:${event.colno}`);
  });

  window.addEventListener('unhandledrejection', (event) => {
    trackError('Unhandled Promise Rejection', event.reason?.toString() || 'Unknown error');
  });
}