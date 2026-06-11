// Analytics utility functions
import { captureTelemetryEvent, trackTelemetryPageView } from "@/telemetry/browser";

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

  captureTelemetryEvent(action, {
    event_category: category,
    event_label: label,
    value,
  });
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
  const normalizedType = type.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  const eventName = normalizedType.includes('checkout')
    ? 'checkout_started'
    : normalizedType.includes('payment')
      ? 'payment_link_requested'
      : normalizedType.includes('service')
        ? 'service_activation_requested'
        : 'lead_submit';

  captureTelemetryEvent(eventName, {
    event_category: 'Conversion',
    conversion_type: type,
    value,
  });
};

export const trackSignup = (method: string = 'email') => {
  trackEvent('signup', 'User', method);
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

  trackTelemetryPageView(page);
};

// Track ecommerce events
export const trackEcommerce = (action: string, params: any) => {
  // Only track in production
  if (import.meta.env.MODE !== 'production') {
    console.log('Analytics Ecommerce (dev):', action, params);
    return;
  }

  captureTelemetryEvent(action, params);
};

// Track user behavior events
export const trackUserBehavior = (action: string, params: any) => {
  // Only track in production
  if (import.meta.env.MODE !== 'production') {
    console.log('Analytics User Behavior (dev):', action, params);
    return;
  }

  captureTelemetryEvent(action, {
    event_category: 'User Behavior',
    ...params,
  });
};
