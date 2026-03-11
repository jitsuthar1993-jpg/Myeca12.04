import { createContext, useContext, useEffect, useRef, ReactNode } from "react";

interface AccessibilityContextType {
  announceMessage: (message: string, priority?: "polite" | "assertive") => void;
  setPageTitle: (title: string) => void;
  focusElement: (selector: string) => void;
  trapFocus: (containerSelector: string) => void;
  releaseFocusTrap: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const announcer = useRef<HTMLDivElement>(null);
  const focusTrapCleanup = useRef<(() => void) | null>(null);

  // Announce messages to screen readers
  const announceMessage = (message: string, priority: "polite" | "assertive" = "polite") => {
    if (announcer.current) {
      announcer.current.setAttribute("aria-live", priority);
      announcer.current.textContent = message;
      
      // Clear the message after announcement
      setTimeout(() => {
        if (announcer.current) {
          announcer.current.textContent = "";
        }
      }, 1000);
    }
  };

  // Set page title and announce it
  const setPageTitle = (title: string) => {
    document.title = `${title} - MyeCA.in`;
    announceMessage(`Page changed to ${title}`);
  };

  // Focus a specific element
  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Trap focus within a container
  const trapFocus = (containerSelector: string) => {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstFocusable?.focus();

    focusTrapCleanup.current = () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  };

  // Release focus trap
  const releaseFocusTrap = () => {
    if (focusTrapCleanup.current) {
      focusTrapCleanup.current();
      focusTrapCleanup.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseFocusTrap();
    };
  }, []);

  return (
    <AccessibilityContext.Provider value={{
      announceMessage,
      setPageTitle,
      focusElement,
      trapFocus,
      releaseFocusTrap
    }}>
      {children}
      {/* Screen reader announcement area */}
      <div
        ref={announcer}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      />
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}