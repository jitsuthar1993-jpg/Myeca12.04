import { useEffect, useCallback } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  modifiers?: ("ctrl" | "alt" | "shift" | "meta")[];
  handler?: () => void;
  action?: () => void;
  description?: string;
  category?: string;
  enabled?: boolean;
}

interface UseKeyboardNavigationOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions | KeyboardShortcut[]) {
  const isOptions = !Array.isArray(options);
  const enabled = isOptions ? options.enabled !== false : true;
  const shortcuts = isOptions ? options.shortcuts : options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    for (const shortcut of shortcuts) {
      if (shortcut.enabled === false) continue;

      const ctrlReq = shortcut.ctrlKey || shortcut.modifiers?.includes("ctrl");
      const shiftReq = shortcut.shiftKey || shortcut.modifiers?.includes("shift");
      const altReq = shortcut.altKey || shortcut.modifiers?.includes("alt");
      const metaReq = shortcut.metaKey || shortcut.modifiers?.includes("meta");

      const matches = 
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        (ctrlReq === undefined || event.ctrlKey === !!ctrlReq) &&
        (shiftReq === undefined || event.shiftKey === !!shiftReq) &&
        (altReq === undefined || event.altKey === !!altReq) &&
        (metaReq === undefined || event.metaKey === !!metaReq);

      if (matches) {
        event.preventDefault();
        const handler = shortcut.handler || shortcut.action;
        handler?.();
        break;
      }
    }
  }, [enabled, shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts, enabled };
}


// Common keyboard shortcuts for the application
export const commonShortcuts: KeyboardShortcut[] = [
  {
    key: "/",
    handler: () => {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    },
    description: "Focus search"
  },
  {
    key: "h",
    altKey: true,
    handler: () => {
      window.location.href = "/";
    },
    description: "Go to home"
  },
  {
    key: "s",
    altKey: true,
    handler: () => {
      window.location.href = "/services";
    },
    description: "Go to services"
  },
  {
    key: "c",
    altKey: true,
    handler: () => {
      window.location.href = "/calculators";
    },
    description: "Go to calculators"
  },
  {
    key: "?",
    handler: () => {
      // Show keyboard shortcuts help
      const event = new CustomEvent("show-keyboard-help");
      window.dispatchEvent(event);
    },
    description: "Show keyboard shortcuts"
  },
  {
    key: "Escape",
    handler: () => {
      // Close any open modals or dropdowns
      const event = new CustomEvent("close-all-modals");
      window.dispatchEvent(event);
    },
    description: "Close modal/dropdown"
  }
];

// Hook to show keyboard shortcuts help
export function useKeyboardHelp() {
  useEffect(() => {
    const handleShowHelp = () => {
      // You can implement a modal or toast to show keyboard shortcuts
      console.log("Keyboard shortcuts:", commonShortcuts);
    };

    window.addEventListener("show-keyboard-help", handleShowHelp);
    return () => window.removeEventListener("show-keyboard-help", handleShowHelp);
  }, []);
}