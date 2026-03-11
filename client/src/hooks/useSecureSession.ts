import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface SecureSessionOptions {
  maxInactiveTime?: number; // Time in milliseconds before showing warning
  warningTime?: number; // Time to show warning before logout (in milliseconds)
  checkInterval?: number; // How often to check for activity (in milliseconds)
}

export function useSecureSession(options: SecureSessionOptions = {}) {
  const {
    maxInactiveTime = 15 * 60 * 1000, // 15 minutes default
    warningTime = 2 * 60 * 1000, // 2 minutes warning
    checkInterval = 10 * 1000, // Check every 10 seconds
  } = options;

  const { logout, user } = useAuth();
  const { toast } = useToast();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Update last activity time
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
    setTimeRemaining(null);
  }, []);

  // Extend session
  const extendSession = useCallback(() => {
    updateActivity();
    toast({
      title: "Session extended",
      description: "Your session has been extended for another 15 minutes.",
    });
  }, [updateActivity, toast]);

  // Check session timeout
  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeUntilLogout = maxInactiveTime - timeSinceActivity;

      if (timeUntilLogout <= 0) {
        // Session expired
        logout();
        toast({
          title: "Session expired",
          description: "You have been logged out due to inactivity.",
          variant: "destructive",
        });
      } else if (timeUntilLogout <= warningTime && !showWarning) {
        // Show warning
        setShowWarning(true);
        setTimeRemaining(Math.floor(timeUntilLogout / 1000)); // Convert to seconds
        toast({
          title: "Session expiring soon",
          description: `Your session will expire in ${Math.floor(timeUntilLogout / 1000)} seconds. Click anywhere to stay logged in.`,
          variant: "destructive",
        });
      } else if (showWarning && timeUntilLogout > warningTime) {
        // User became active again
        setShowWarning(false);
        setTimeRemaining(null);
      }

      // Update time remaining if warning is shown
      if (showWarning) {
        setTimeRemaining(Math.floor(timeUntilLogout / 1000));
      }
    };

    const interval = setInterval(checkSession, checkInterval);
    return () => clearInterval(interval);
  }, [user, lastActivity, showWarning, maxInactiveTime, warningTime, checkInterval, logout, toast]);

  // Listen for user activity
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, updateActivity]);

  return {
    showWarning,
    timeRemaining,
    extendSession,
    lastActivity,
  };
}