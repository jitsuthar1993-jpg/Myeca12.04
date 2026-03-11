import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/AuthProvider';
import { trackPageView, trackUserBehavior } from '@/utils/analytics';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
}

export default function AnalyticsWrapper({ children }: AnalyticsWrapperProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  // Track page views on route change
  useEffect(() => {
    trackPageView(location);
  }, [location]);

  // Track user session start
  useEffect(() => {
    if (user) {
      trackUserBehavior('session_start', {
        user_id: user.id,
        user_type: user.role
      });
    }
  }, [user]);

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      if (timeOnPage > 5) { // Only track if user spent more than 5 seconds
        trackUserBehavior('time_on_page', {
          page: location,
          duration: timeOnPage
        });
      }
    };
  }, [location]);

  return <>{children}</>;
}