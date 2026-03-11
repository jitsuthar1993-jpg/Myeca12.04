import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================
// Types
// ============================================

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface Modal {
  id: string;
  component: string;
  props?: Record<string, any>;
}

interface UserPreferences {
  language: 'en' | 'hi' | 'ta' | 'te' | 'mr';
  currency: 'INR' | 'USD';
  compactMode: boolean;
  animationsEnabled: boolean;
  defaultRegime: 'old' | 'new';
  defaultAge: 'below60' | '60to80' | 'above80';
  showTips: boolean;
  soundEnabled: boolean;
}

interface OnboardingState {
  completed: boolean;
  currentStep: number;
  skippedAt?: string;
  completedSteps: string[];
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Modals
  activeModals: Modal[];
  
  // Toasts
  toasts: Toast[];
  
  // Global search
  searchOpen: boolean;
  searchQuery: string;
  recentSearches: string[];
  
  // Navigation
  breadcrumbs: { label: string; href: string }[];
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string;
  
  // User preferences (persisted)
  preferences: UserPreferences;
  
  // Onboarding
  onboarding: OnboardingState;
  
  // Calculator state
  lastCalculatorUsed: string | null;
  calculatorHistory: { id: string; timestamp: number; inputs: Record<string, any> }[];
  
  // Feature flags
  featureFlags: Record<string, boolean>;
}

interface UIActions {
  // Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  
  // Modals
  openModal: (modal: Modal) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Toasts
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Search
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  
  // Breadcrumbs
  setBreadcrumbs: (breadcrumbs: { label: string; href: string }[]) => void;
  
  // Loading
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  
  // Onboarding
  startOnboarding: () => void;
  completeOnboardingStep: (step: string) => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  
  // Calculator
  setLastCalculator: (id: string) => void;
  addCalculatorHistory: (id: string, inputs: Record<string, any>) => void;
  clearCalculatorHistory: () => void;
  
  // Feature flags
  setFeatureFlag: (flag: string, enabled: boolean) => void;
}

// ============================================
// Default Values
// ============================================

const defaultPreferences: UserPreferences = {
  language: 'en',
  currency: 'INR',
  compactMode: false,
  animationsEnabled: true,
  defaultRegime: 'new',
  defaultAge: 'below60',
  showTips: true,
  soundEnabled: false,
};

const defaultOnboarding: OnboardingState = {
  completed: false,
  currentStep: 0,
  completedSteps: [],
};

// ============================================
// Store
// ============================================

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: false,
      sidebarCollapsed: false,
      activeModals: [],
      toasts: [],
      searchOpen: false,
      searchQuery: '',
      recentSearches: [],
      breadcrumbs: [],
      globalLoading: false,
      loadingMessage: '',
      preferences: defaultPreferences,
      onboarding: defaultOnboarding,
      lastCalculatorUsed: null,
      calculatorHistory: [],
      featureFlags: {},

      // Sidebar actions
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapse: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Modal actions
      openModal: (modal) => set(state => ({
        activeModals: [...state.activeModals, modal]
      })),
      closeModal: (id) => set(state => ({
        activeModals: state.activeModals.filter(m => m.id !== id)
      })),
      closeAllModals: () => set({ activeModals: [] }),

      // Toast actions
      addToast: (toast) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newToast = { ...toast, id };
        
        set(state => ({ toasts: [...state.toasts, newToast] }));
        
        // Auto-remove after duration
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, duration);
        }
      },
      removeToast: (id) => set(state => ({
        toasts: state.toasts.filter(t => t.id !== id)
      })),
      clearToasts: () => set({ toasts: [] }),

      // Search actions
      toggleSearch: () => set(state => ({ searchOpen: !state.searchOpen })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      addRecentSearch: (query) => {
        if (!query.trim()) return;
        set(state => ({
          recentSearches: [
            query,
            ...state.recentSearches.filter(s => s !== query)
          ].slice(0, 10)
        }));
      },
      clearRecentSearches: () => set({ recentSearches: [] }),

      // Breadcrumb actions
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

      // Loading actions
      setGlobalLoading: (loading, message = '') => set({
        globalLoading: loading,
        loadingMessage: message
      }),

      // Preferences actions
      updatePreferences: (newPrefs) => set(state => ({
        preferences: { ...state.preferences, ...newPrefs }
      })),
      resetPreferences: () => set({ preferences: defaultPreferences }),

      // Onboarding actions
      startOnboarding: () => set({
        onboarding: { ...defaultOnboarding, currentStep: 1 }
      }),
      completeOnboardingStep: (step) => set(state => ({
        onboarding: {
          ...state.onboarding,
          currentStep: state.onboarding.currentStep + 1,
          completedSteps: [...state.onboarding.completedSteps, step]
        }
      })),
      skipOnboarding: () => set(state => ({
        onboarding: {
          ...state.onboarding,
          skippedAt: new Date().toISOString()
        }
      })),
      completeOnboarding: () => set(state => ({
        onboarding: {
          ...state.onboarding,
          completed: true,
          currentStep: 0
        }
      })),
      resetOnboarding: () => set({ onboarding: defaultOnboarding }),

      // Calculator actions
      setLastCalculator: (id) => set({ lastCalculatorUsed: id }),
      addCalculatorHistory: (id, inputs) => set(state => ({
        calculatorHistory: [
          { id, timestamp: Date.now(), inputs },
          ...state.calculatorHistory
        ].slice(0, 50) // Keep last 50 entries
      })),
      clearCalculatorHistory: () => set({ calculatorHistory: [] }),

      // Feature flags
      setFeatureFlag: (flag, enabled) => set(state => ({
        featureFlags: { ...state.featureFlags, [flag]: enabled }
      })),
    }),
    {
      name: 'myeca-ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        preferences: state.preferences,
        onboarding: state.onboarding,
        recentSearches: state.recentSearches,
        lastCalculatorUsed: state.lastCalculatorUsed,
        calculatorHistory: state.calculatorHistory,
        featureFlags: state.featureFlags,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// ============================================
// Selectors
// ============================================

export const useLanguage = () => useUIStore(state => state.preferences.language);
export const usePreferences = () => useUIStore(state => state.preferences);
export const useOnboarding = () => useUIStore(state => state.onboarding);
export const useToasts = () => useUIStore(state => state.toasts);
export const useGlobalLoading = () => useUIStore(state => ({
  isLoading: state.globalLoading,
  message: state.loadingMessage,
}));

// ============================================
// Utility Hooks
// ============================================

// Hook for showing toasts easily
export function useToast() {
  const addToast = useUIStore(state => state.addToast);
  
  return {
    success: (title: string, description?: string) => 
      addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) => 
      addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) => 
      addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) => 
      addToast({ type: 'info', title, description }),
  };
}

// Hook for feature flags
export function useFeatureFlag(flag: string, defaultValue = false): boolean {
  return useUIStore(state => state.featureFlags[flag] ?? defaultValue);
}

