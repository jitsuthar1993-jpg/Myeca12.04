import { useState, useEffect, useCallback, useRef } from 'react';

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_THRESHOLD = 2 * 60 * 1000; // 2 minutes before logout
const SYNC_CHANNEL = 'session_sync_channel';

interface SessionTimeoutOptions {
  onLogout: () => void;
  isAuthenticated: boolean;
}

export function useSessionTimeout({ onLogout, isAuthenticated }: SessionTimeoutOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WARNING_THRESHOLD / 1000);
  
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearAllTimers = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  const handleLogout = useCallback(() => {
    clearAllTimers();
    onLogout();
    channelRef.current?.postMessage('LOGOUT');
  }, [onLogout, clearAllTimers]);

  const startTimers = useCallback(() => {
    clearAllTimers();
    if (!isAuthenticated) return;

    // Timer to show warning
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(WARNING_THRESHOLD / 1000);
      
      // Start countdown interval
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, SESSION_TIMEOUT - WARNING_THRESHOLD);

    // Final logout timer (backup for safety)
    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT);
  }, [isAuthenticated, handleLogout, clearAllTimers]);

  const resetSession = useCallback((broadcast = true) => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    startTimers();
    
    if (broadcast) {
      channelRef.current?.postMessage('RESET');
    }
  }, [startTimers]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    // Initialize BroadcastChannel
    channelRef.current = new BroadcastChannel(SYNC_CHANNEL);
    channelRef.current.onmessage = (event) => {
      if (event.data === 'RESET') {
        resetSession(false);
      } else if (event.data === 'LOGOUT') {
        onLogout();
      }
    };

    // Activity listeners — only mousedown and keydown (fewer events, lower overhead)
    const events = ['mousedown', 'keydown'] as const;

    const throttledReset = () => {
      const now = Date.now();
      // Throttle activity resets to once every 10 seconds
      if (now - lastActivityRef.current > 10000) {
        resetSession();
      }
    };

    events.forEach(event => window.addEventListener(event, throttledReset, { passive: true }));

    // Initial start
    startTimers();

    return () => {
      events.forEach(event => window.removeEventListener(event, throttledReset));
      clearAllTimers();
      channelRef.current?.close();
    };
  }, [isAuthenticated, resetSession, startTimers, onLogout, clearAllTimers]);

  return { showWarning, timeLeft, resetSession, handleLogout };
}
