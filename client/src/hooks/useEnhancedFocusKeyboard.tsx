// Enhanced Focus Management and Keyboard Shortcuts System
import React, { useEffect, useState, useCallback, useRef, useContext, createContext } from 'react';

// Focus Management Context
interface FocusManagementContextType {
  currentFocus: HTMLElement | null;
  focusHistory: HTMLElement[];
  saveFocus: () => void;
  restoreFocus: () => void;
  clearFocusHistory: () => void;
  trapFocus: (container: HTMLElement, options?: FocusTrapOptions) => () => void;
  getFocusableElements: (container?: HTMLElement) => HTMLElement[];
  setInitialFocus: (element: HTMLElement | string) => void;
}

interface FocusTrapOptions {
  returnFocus?: boolean;
  initialFocus?: HTMLElement | string;
  fallbackFocus?: HTMLElement | string;
  escapeDeactivates?: boolean;
  clickOutsideDeactivates?: boolean;
  allowOutsideClick?: boolean;
}

// Keyboard Shortcuts Context
interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string, modifiers?: string[]) => void;
  enableShortcuts: () => void;
  disableShortcuts: () => void;
  isEnabled: boolean;
  showHelp: () => void;
  hideHelp: () => void;
  isHelpVisible: boolean;
}

// Enhanced Keyboard Shortcut Interface
interface KeyboardShortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  description: string;
  action: (event: KeyboardEvent) => void;
  category: 'navigation' | 'action' | 'form' | 'media' | 'help' | 'system';
  global?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enabled?: boolean;
  priority?: number;
  scope?: string;
}

// Focus Management Context
const FocusManagementContext = createContext<FocusManagementContextType | null>(null);

// Keyboard Shortcuts Context
const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

// Default Keyboard Shortcuts
const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'Tab',
    description: 'Navigate to next focusable element',
    action: () => {}, // Handled by browser
    category: 'navigation',
    global: true,
    preventDefault: false,
    priority: 1
  },
  {
    key: 'Tab',
    modifiers: ['shift'],
    description: 'Navigate to previous focusable element',
    action: () => {}, // Handled by browser
    category: 'navigation',
    global: true,
    preventDefault: false,
    priority: 1
  },
  {
    key: 'Escape',
    description: 'Close modal or cancel action',
    action: (event) => handleEscape(event),
    category: 'system',
    global: true,
    preventDefault: true,
    priority: 2
  },
  {
    key: 'Enter',
    description: 'Activate focused element',
    action: (event) => handleEnter(event),
    category: 'action',
    global: false,
    preventDefault: false,
    priority: 1
  },
  {
    key: 'Space',
    description: 'Activate focused button or checkbox',
    action: (event) => handleSpace(event),
    category: 'action',
    global: false,
    preventDefault: false,
    priority: 1
  },
  {
    key: 'ArrowUp',
    description: 'Navigate up in lists or menus',
    action: (event) => handleArrowNavigation(event, 'up'),
    category: 'navigation',
    global: false,
    preventDefault: true,
    priority: 1
  },
  {
    key: 'ArrowDown',
    description: 'Navigate down in lists or menus',
    action: (event) => handleArrowNavigation(event, 'down'),
    category: 'navigation',
    global: false,
    preventDefault: true,
    priority: 1
  },
  {
    key: 'ArrowLeft',
    description: 'Navigate left in menus or tabs',
    action: (event) => handleArrowNavigation(event, 'left'),
    category: 'navigation',
    global: false,
    preventDefault: true,
    priority: 1
  },
  {
    key: 'ArrowRight',
    description: 'Navigate right in menus or tabs',
    action: (event) => handleArrowNavigation(event, 'right'),
    category: 'navigation',
    global: false,
    preventDefault: true,
    priority: 1
  },
  {
    key: 'Home',
    description: 'Go to beginning of content',
    action: (event) => handleHome(event),
    category: 'navigation',
    global: true,
    preventDefault: true,
    priority: 1
  },
  {
    key: 'End',
    description: 'Go to end of content',
    action: (event) => handleEnd(event),
    category: 'navigation',
    global: true,
    preventDefault: true,
    priority: 1
  },
  {
    key: 'PageUp',
    description: 'Scroll up one page',
    action: (event) => handlePageUp(event),
    category: 'navigation',
    global: true,
    preventDefault: true,
    priority: 1
  },
  {
    key: 'PageDown',
    description: 'Scroll down one page',
    action: (event) => handlePageDown(event),
    category: 'navigation',
    global: true,
    preventDefault: true,
    priority: 1
  },
  {
    key: 'h',
    modifiers: ['shift'],
    description: 'Show keyboard shortcuts help',
    action: () => showHelp(),
    category: 'help',
    global: true,
    preventDefault: true,
    priority: 2
  },
  {
    key: 'F1',
    description: 'Show help',
    action: () => showHelp(),
    category: 'help',
    global: true,
    preventDefault: true,
    priority: 2
  }
];

// Focus Management Hook
export const useFocusManagement = () => {
  const context = useContext(FocusManagementContext);
  if (!context) {
    throw new Error('useFocusManagement must be used within FocusManagementProvider');
  }
  return context;
};

// Keyboard Shortcuts Hook
export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
};

// Focus Management Provider
export const FocusManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFocus, setCurrentFocus] = useState<HTMLElement | null>(null);
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([]);
  const activeTrapRef = useRef<(() => void) | null>(null);

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      setCurrentFocus(activeElement);
      setFocusHistory(prev => [...prev, activeElement]);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    if (currentFocus && currentFocus.isConnected) {
      currentFocus.focus();
    } else if (focusHistory.length > 0) {
      const lastFocusable = focusHistory[focusHistory.length - 1];
      if (lastFocusable && lastFocusable.isConnected) {
        lastFocusable.focus();
      }
    }
  }, [currentFocus, focusHistory]);

  const clearFocusHistory = useCallback(() => {
    setFocusHistory([]);
    setCurrentFocus(null);
  }, []);

  const getFocusableElements = useCallback((container: HTMLElement = document.body): HTMLElement[] => {
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      '[contenteditable="true"]:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])',
      '[role="menuitem"]:not([disabled])',
      '[role="tab"]:not([disabled])',
      '[role="checkbox"]:not([disabled])',
      '[role="radio"]:not([disabled])',
      '[role="switch"]:not([disabled])',
      '[role="option"]:not([disabled])'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(focusableSelector));
  }, []);

  const trapFocus = useCallback((container: HTMLElement, options: FocusTrapOptions = {}): (() => void) => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    let currentFocusedIndex = 0;
    let isShiftPressed = false;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        isShiftPressed = event.shiftKey;
        
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
            currentFocusedIndex = focusableElements.length - 1;
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
            currentFocusedIndex = 0;
          }
        }
      }

      if (event.key === 'Escape' && options.escapeDeactivates !== false) {
        deactivate();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (options.clickOutsideDeactivates && !container.contains(event.target as Node)) {
        deactivate();
      }
    };

    const deactivate = () => {
      container.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
      
      if (options.returnFocus !== false) {
        restoreFocus();
      }
      
      activeTrapRef.current = null;
    };

    // Set up focus trap
    container.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    // Set initial focus
    if (options.initialFocus) {
      const initialElement = typeof options.initialFocus === 'string' 
        ? container.querySelector(options.initialFocus) as HTMLElement
        : options.initialFocus;
      
      if (initialElement && focusableElements.includes(initialElement)) {
        initialElement.focus();
      } else if (firstElement) {
        firstElement.focus();
      }
    } else if (firstElement) {
      firstElement.focus();
    }

    activeTrapRef.current = deactivate;
    return deactivate;
  }, [getFocusableElements, restoreFocus]);

  const setInitialFocus = useCallback((element: HTMLElement | string) => {
    const targetElement = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement
      : element;
    
    if (targetElement) {
      targetElement.focus();
      setCurrentFocus(targetElement);
    }
  }, []);

  return (
    <FocusManagementContext.Provider value={{
      currentFocus,
      focusHistory,
      saveFocus,
      restoreFocus,
      clearFocusHistory,
      trapFocus,
      getFocusableElements,
      setInitialFocus
    }}>
      {children}
    </FocusManagementContext.Provider>
  );
};

// Keyboard Shortcuts Provider
export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(DEFAULT_SHORTCUTS);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const activeScopeRef = useRef<string>('global');

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      const filtered = prev.filter(s => 
        !(s.key === shortcut.key && JSON.stringify(s.modifiers) === JSON.stringify(shortcut.modifiers))
      );
      return [...filtered, shortcut].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    });
  }, []);

  const unregisterShortcut = useCallback((key: string, modifiers?: string[]) => {
    setShortcuts(prev => prev.filter(s => 
      !(s.key === key && JSON.stringify(s.modifiers) === JSON.stringify(modifiers))
    ));
  }, []);

  const enableShortcuts = useCallback(() => setIsEnabled(true), []);
  const disableShortcuts = useCallback(() => setIsEnabled(false), []);
  const showHelp = useCallback(() => setIsHelpVisible(true), []);
  const hideHelp = useCallback(() => setIsHelpVisible(false), []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    const matchingShortcut = shortcuts.find(shortcut => {
      if (shortcut.scope && shortcut.scope !== activeScopeRef.current) return false;
      if (!shortcut.enabled && shortcut.enabled !== undefined) return false;

      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                      event.code.toLowerCase() === shortcut.key.toLowerCase();
      
      const modifierMatch = !shortcut.modifiers || 
                           shortcut.modifiers.every(mod => {
                             switch (mod) {
                               case 'ctrl': return event.ctrlKey;
                               case 'alt': return event.altKey;
                               case 'shift': return event.shiftKey;
                               case 'meta': return event.metaKey;
                               default: return false;
                             }
                           });
      
      return keyMatch && modifierMatch;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault) {
        event.preventDefault();
      }
      if (matchingShortcut.stopPropagation) {
        event.stopPropagation();
      }
      
      matchingShortcut.action(event);
    }
  }, [isEnabled, shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);

  return (
    <KeyboardShortcutsContext.Provider value={{
      shortcuts,
      registerShortcut,
      unregisterShortcut,
      enableShortcuts,
      disableShortcuts,
      isEnabled,
      showHelp,
      hideHelp,
      isHelpVisible
    }}>
      {children}
      <KeyboardShortcutsHelp />
    </KeyboardShortcutsContext.Provider>
  );
};

// Keyboard Shortcuts Help Component
const KeyboardShortcutsHelp: React.FC = () => {
  const { shortcuts, isHelpVisible, hideHelp } = useKeyboardShortcuts();
  const modalRef = useRef<HTMLDivElement>(null);
  const { trapFocus } = useFocusManagement();

  useEffect(() => {
    if (isHelpVisible && modalRef.current) {
      const cleanup = trapFocus(modalRef.current, {
        returnFocus: true,
        escapeDeactivates: true
      });
      
      return cleanup;
    }
  }, [isHelpVisible, trapFocus]);

  if (!isHelpVisible) return null;

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const parts = [];
    if (shortcut.modifiers) {
      parts.push(...shortcut.modifiers.map(mod => {
        switch (mod) {
          case 'ctrl': return 'Ctrl';
          case 'alt': return 'Alt';
          case 'shift': return 'Shift';
          case 'meta': return 'Cmd';
          default: return mod;
        }
      }));
    }
    parts.push(shortcut.key);
    return parts.join(' + ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={hideHelp}>
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="shortcuts-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="shortcuts-title" className="text-xl font-semibold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={hideHelp}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Close shortcuts help"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh]">
          <div className="p-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category} className="mb-8 last:mb-0">
                <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <kbd className="px-3 py-1 bg-gray-800 text-white text-sm font-mono rounded">
                          {formatShortcut(shortcut)}
                        </kbd>
                        <span className="text-gray-700">{shortcut.description}</span>
                      </div>
                      {shortcut.global && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Global
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Press <kbd className="px-2 py-1 bg-gray-200 text-gray-800 text-xs font-mono rounded">Esc</kbd> to close
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Global shortcuts work everywhere</span>
              <span>•</span>
              <span>Context-specific shortcuts work in focused areas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for keyboard event handlers
function handleEscape(event: KeyboardEvent) {
  // Handle escape key globally
  const modals = document.querySelectorAll('[role="dialog"], [aria-modal="true"]');
  if (modals.length > 0) {
    const lastModal = modals[modals.length - 1] as HTMLElement;
    const closeButton = lastModal.querySelector('[aria-label*="close"], button[type="button"]') as HTMLButtonElement;
    if (closeButton) {
      closeButton.click();
    }
  }
}

function handleEnter(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
    target.click();
  }
}

function handleSpace(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (target.tagName === 'BUTTON' || 
      target.getAttribute('role') === 'button' ||
      target.getAttribute('role') === 'checkbox' ||
      target.getAttribute('role') === 'switch') {
    event.preventDefault();
    target.click();
  }
}

function handleArrowNavigation(event: KeyboardEvent, direction: 'up' | 'down' | 'left' | 'right') {
  const target = event.target as HTMLElement;
  const container = target.closest('[role="listbox"], [role="menu"], [role="tablist"], [role="radiogroup"], [role="grid"]') as HTMLElement;
  
  if (!container) return;

  const items = container.querySelectorAll('[role="option"], [role="menuitem"], [role="tab"], [role="radio"], [role="gridcell"]');
  const currentIndex = Array.from(items).indexOf(target);
  
  let nextIndex = currentIndex;
  
  if (direction === 'up' || direction === 'left') {
    nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
  } else if (direction === 'down' || direction === 'right') {
    nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
  }
  
  (items[nextIndex] as HTMLElement)?.focus();
}

function handleHome(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  const container = target.closest('[role="listbox"], [role="menu"], [role="tablist"], [role="radiogroup"]') as HTMLElement;
  
  if (container) {
    const items = container.querySelectorAll('[role="option"], [role="menuitem"], [role="tab"], [role="radio"]');
    (items[0] as HTMLElement)?.focus();
  } else {
    const mainContent = document.getElementById('main-content') || document.querySelector('main');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function handleEnd(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  const container = target.closest('[role="listbox"], [role="menu"], [role="tablist"], [role="radiogroup"]') as HTMLElement;
  
  if (container) {
    const items = container.querySelectorAll('[role="option"], [role="menuitem"], [role="tab"], [role="radio"]');
    (items[items.length - 1] as HTMLElement)?.focus();
  } else {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function handlePageUp(event: KeyboardEvent) {
  window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
}

function handlePageDown(event: KeyboardEvent) {
  window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
}

function showHelp() {
  // This will be handled by the KeyboardShortcutsHelp component
}

// Enhanced Focus Hook
export const useEnhancedFocus = (options: {
  autoFocus?: boolean;
  focusOnMount?: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
  initialFocus?: boolean;
} = {}) => {
  const elementRef = useRef<HTMLElement>(null);
  const { saveFocus, restoreFocus, setInitialFocus, trapFocus } = useFocusManagement();

  useEffect(() => {
    if (options.autoFocus && elementRef.current) {
      setInitialFocus(elementRef.current);
    }
  }, [options.autoFocus, setInitialFocus]);

  const focus = useCallback(() => {
    if (elementRef.current) {
      saveFocus();
      elementRef.current.focus();
    }
  }, [saveFocus]);

  const blur = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.blur();
      if (options.restoreFocus) {
        restoreFocus();
      }
    }
  }, [options.restoreFocus, restoreFocus]);

  return {
    ref: elementRef,
    focus,
    blur,
    trapFocus: options.trapFocus ? trapFocus : undefined
  };
};

// Focus Ring Component
export const FocusRing: React.FC<{ 
  children: React.ReactNode; 
  color?: string; 
  width?: number; 
  offset?: number;
  inset?: boolean;
}> = ({ children, color = '#0066cc', width = 3, offset = 2, inset = false }) => {
  const styles = `
    .focus-ring:focus {
      outline: none;
      box-shadow: ${inset ? 'inset' : ''} 0 0 0 ${width}px ${color}, 0 0 0 ${width + offset}px ${color}40;
      border-radius: 4px;
    }
    
    .focus-ring:focus-visible {
      outline: none;
      box-shadow: ${inset ? 'inset' : ''} 0 0 0 ${width}px ${color}, 0 0 0 ${width + offset}px ${color}40;
      border-radius: 4px;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="focus-ring">
        {children}
      </div>
    </>
  );
};

export default {
  FocusManagementProvider,
  KeyboardShortcutsProvider,
  useFocusManagement,
  useKeyboardShortcuts,
  useEnhancedFocus,
  FocusRing
};
