import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trackEvent, trackPageView, trackEcommerce, trackUserBehavior } from '@/utils/analytics';

// Custom hook for automatic page tracking
export const usePageTracking = () => {
  const [location] = useLocation();

  useEffect(() => {
    trackPageView(location);
  }, [location]);
};

// Custom hook for tracking form submissions
export const useFormTracking = (formName: string) => {
  const trackFormStart = () => {
    trackEvent('Form Interaction', 'Form Started', formName);
  };

  const trackFormComplete = (data?: any) => {
    trackEvent('Form Interaction', 'Form Completed', formName);
    if (data?.value) {
      trackEcommerce('form_submission', {
        form_name: formName,
        value: data.value
      });
    }
  };

  const trackFormError = (error: string) => {
    trackEvent('Form Interaction', 'Form Error', `${formName}: ${error}`);
  };

  const trackFieldInteraction = (fieldName: string) => {
    trackEvent('Form Interaction', 'Field Focused', `${formName}: ${fieldName}`);
  };

  return {
    trackFormStart,
    trackFormComplete,
    trackFormError,
    trackFieldInteraction
  };
};

// Custom hook for tracking calculator usage
export const useCalculatorTracking = (calculatorName: string) => {
  const trackCalculatorUse = (inputData: any) => {
    trackEvent('Calculator', 'Calculation Performed', calculatorName);
    trackUserBehavior('calculator_usage', {
      calculator: calculatorName,
      ...inputData
    });
  };

  const trackCalculatorResult = (result: any) => {
    trackEvent('Calculator', 'Result Viewed', calculatorName, result.value);
  };

  return {
    trackCalculatorUse,
    trackCalculatorResult
  };
};

// Custom hook for tracking service interactions
export const useServiceTracking = () => {
  const trackServiceView = (serviceName: string, serviceId: string) => {
    trackEvent('Service', 'Service Viewed', serviceName);
    trackEcommerce('view_item', {
      item_id: serviceId,
      item_name: serviceName
    });
  };

  const trackServicePurchase = (serviceName: string, serviceId: string, price: number) => {
    trackEvent('Service', 'Service Purchased', serviceName, price);
    trackEcommerce('purchase', {
      transaction_id: `txn_${Date.now()}`,
      value: price,
      currency: 'INR',
      items: [{
        item_id: serviceId,
        item_name: serviceName,
        price: price,
        quantity: 1
      }]
    });
  };

  const trackServiceInquiry = (serviceName: string) => {
    trackEvent('Service', 'Inquiry Submitted', serviceName);
  };

  return {
    trackServiceView,
    trackServicePurchase,
    trackServiceInquiry
  };
};

// Custom hook for tracking authentication events
export const useAuthTracking = () => {
  const trackLogin = (method: string) => {
    trackEvent('Authentication', 'User Login', method);
    trackUserBehavior('login', { method });
  };

  const trackSignup = (method: string) => {
    trackEvent('Authentication', 'User Signup', method);
    trackUserBehavior('sign_up', { method });
  };

  const trackLogout = () => {
    trackEvent('Authentication', 'User Logout');
  };

  return {
    trackLogin,
    trackSignup,
    trackLogout
  };
};

// Custom hook for tracking help/support interactions
export const useHelpTracking = () => {
  const trackHelpArticleView = (articleTitle: string, category: string) => {
    trackEvent('Help Center', 'Article Viewed', articleTitle);
    trackUserBehavior('help_article_view', {
      article: articleTitle,
      category
    });
  };

  const trackFAQInteraction = (question: string, category: string) => {
    trackEvent('Help Center', 'FAQ Clicked', question);
    trackUserBehavior('faq_interaction', {
      question,
      category
    });
  };

  const trackSupportContact = (method: string) => {
    trackEvent('Help Center', 'Support Contacted', method);
  };

  return {
    trackHelpArticleView,
    trackFAQInteraction,
    trackSupportContact
  };
};

// Custom hook for tracking content interactions
export const useContentTracking = () => {
  const trackContentSearch = (data: { query: string }) => {
    trackEvent('Content', 'Search', data.query);
    trackUserBehavior('search', { search_term: data.query });
  };

  const trackContentEngagement = (data: { content_type: string; content_id: string; content_title: string }) => {
    trackEvent('Content', 'Engagement', data.content_type);
    trackUserBehavior('content_engagement', data);
  };

  const trackContentView = (data: { content_type: string; content_id: string }) => {
    trackEvent('Content', 'View', data.content_type);
    trackUserBehavior('content_view', data);
  };

  return {
    trackContentSearch,
    trackContentEngagement,
    trackContentView
  };
};

// Custom hook for tracking navigation interactions
export const useNavigationTracking = () => {
  const trackNavClick = (item: string, section: string) => {
    trackEvent('Navigation', 'Nav Item Clicked', `${section}: ${item}`);
  };

  const trackDropdownOpen = (dropdown: string) => {
    trackEvent('Navigation', 'Dropdown Opened', dropdown);
  };

  const trackMobileMenuToggle = (action: 'open' | 'close') => {
    trackEvent('Navigation', 'Mobile Menu', action);
  };

  return {
    trackNavClick,
    trackDropdownOpen,
    trackMobileMenuToggle
  };
};

// Custom hook for tracking CTA interactions
export const useCTATracking = () => {
  const trackCTAClick = (ctaName: string, location: string) => {
    trackEvent('CTA', 'Button Clicked', `${ctaName} - ${location}`);
    trackUserBehavior('cta_click', {
      cta_name: ctaName,
      location
    });
  };

  const trackCTAView = (ctaName: string, location: string) => {
    trackEvent('CTA', 'Button Viewed', `${ctaName} - ${location}`);
  };

  return {
    trackCTAClick,
    trackCTAView
  };
};

// Custom hook for tracking engagement metrics
export const useEngagementTracking = (pageName: string) => {
  useEffect(() => {
    const startTime = Date.now();
    
    // Track page engagement start
    trackUserBehavior('page_engagement_start', { page: pageName });
    
    // Track exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        trackUserBehavior('exit_intent', { 
          page: pageName,
          time_spent: Math.round((Date.now() - startTime) / 1000)
        });
      }
    };
    
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackUserBehavior('page_engagement_end', { 
        page: pageName, 
        time_spent: timeSpent 
      });
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [pageName]);
};

// Custom hook for initialization
export const useAnalyticsInitialization = () => {
  useEffect(() => {
    // Set initial user properties
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      const screenSize = `${window.screen.width}x${window.screen.height}`;
      
      // Initialize analytics
      console.log('Analytics initialized', { userAgent, screenSize });
    }
  }, []);
};

// Master analytics hook that combines all tracking
export const useAnalytics = () => {
  usePageTracking();

  return {
    form: useFormTracking,
    calculator: useCalculatorTracking,
    service: useServiceTracking(),
    auth: useAuthTracking(),
    help: useHelpTracking(),
    navigation: useNavigationTracking(),
    cta: useCTATracking(),
    // Direct access to tracking functions
    trackEvent,
    trackPageView,
    trackEcommerce,
    trackUserBehavior
  };
};
