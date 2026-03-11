// Analytics utility functions

export const trackEvent = (
  action: string, 
  category: string, 
  label?: string, 
  value?: number
) => {
  // Only track in production
  if (import.meta.env.MODE !== 'production') {
    console.log('Analytics Event (dev):', { action, category, label, value });
    return;
  }

  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Predefined event trackers for common actions
export const trackCTA = (buttonName: string, location: string) => {
  trackEvent('click', 'CTA', `${buttonName} - ${location}`);
};

export const trackFormSubmit = (formName: string, success: boolean = true) => {
  trackEvent('form_submit', 'Lead', formName, success ? 1 : 0);
};

export const trackCalculatorUse = (calculatorName: string) => {
  trackEvent('calculator_use', 'Engagement', calculatorName);
};

export const trackServiceView = (serviceName: string) => {
  trackEvent('page_view', 'Service', serviceName);
};

export const trackConversion = (type: string, value?: number) => {
  trackEvent('conversion', 'Revenue', type, value);
};

export const trackSignup = (method: string = 'email') => {
  trackEvent('sign_up', 'User', method);
};

export const trackLogin = (method: string = 'email') => {
  trackEvent('login', 'User', method);
};

export const trackError = (errorMessage: string, location: string) => {
  trackEvent('error', 'Site Health', `${errorMessage} at ${location}`);
};

// Track page views
export const trackPageView = (page: string) => {
  // Only track in production
  if (import.meta.env.MODE !== 'production') {
    console.log('Analytics Page View (dev):', page);
    return;
  }

  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', 'page_view', {
      page_path: page,
    });
  }
};

// Track ecommerce events
export const trackEcommerce = (action: string, params: any) => {
  // Only track in production
  if (import.meta.env.MODE !== 'production') {
    console.log('Analytics Ecommerce (dev):', action, params);
    return;
  }

  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', action, params);
  }
};

// Track user behavior events
export const trackUserBehavior = (action: string, params: any) => {
  // Only track in production
  if (import.meta.env.MODE !== 'production') {
    console.log('Analytics User Behavior (dev):', action, params);
    return;
  }

  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', action, {
      event_category: 'User Behavior',
      ...params
    });
  }
};