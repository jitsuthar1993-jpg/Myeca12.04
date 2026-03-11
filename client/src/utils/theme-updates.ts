// Modern Professional Theme System

export const themeClasses = {
  // Hero Sections
  heroSection: "section-padding gradient-hero",
  heroContainer: "container-custom",
  heroWrapper: "container-narrow text-center space-content",
  heroBadge: "badge-primary animate-fade-in",
  heroTitle: "text-display-lg text-primary-900 animate-slide-up",
  heroSubtitle: "text-body-lg text-primary-600 animate-slide-up",
  
  // Modern Button System
  buttonPrimary: "btn-primary btn-lg hover:-translate-y-1 active:translate-y-0",
  buttonSecondary: "btn-secondary btn-md",
  buttonOutline: "btn-outline btn-lg",
  buttonWhatsApp: "btn-outline btn-lg hover:border-green-500 hover:text-green-600 hover:bg-green-50",
  
  // Modern Card System
  cardBase: "card-modern p-8 space-elements",
  cardElevated: "card-elevated p-8 space-elements",
  cardInteractive: "card-interactive p-8 space-elements",
  cardHeader: "text-heading-lg text-primary-900",
  cardDescription: "text-body-md text-primary-600",
  
  // Section Layouts
  sectionWhite: "section-padding bg-surface",
  sectionGray: "section-padding bg-surface-elevated",
  sectionBlue: "section-padding bg-gradient-to-br from-blue-50 to-indigo-50",
  sectionPremium: "section-padding gradient-premium text-white",
  
  // Enhanced Typography
  pageTitle: "text-display-md text-primary-900 animate-slide-up",
  pageSubtitle: "text-body-lg text-primary-600 container-narrow animate-fade-in",
  sectionTitle: "text-display-sm text-primary-900 text-center",
  sectionSubtitle: "text-body-lg text-primary-600 text-center container-narrow",
  
  // Modern Forms
  formInput: "input-modern",
  formInputError: "input-modern input-error",
  formLabel: "label-modern",
  formGroup: "space-tight",
  
  // Enhanced Pricing
  priceTag: "text-display-sm text-primary-900 font-bold",
  pricePeriod: "text-body-md text-primary-500",
  priceOriginal: "text-body-md text-primary-400 line-through",
  priceCard: "card-elevated p-8 text-center space-content hover:scale-105 transition-transform",
  
  // Modern Badge System
  badgePopular: "badge-primary shadow-soft",
  badgeNew: "badge-success shadow-soft",
  badgePremium: "badge-modern bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-soft",
  
  // Enhanced Interactive States
  focusRing: "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none transition-all",
  hoverLift: "hover:-translate-y-1 transition-transform duration-300",
  hoverScale: "hover:scale-105 transition-transform duration-300",
  
  // Modern Layout Utilities
  gridResponsive: "responsive-grid",
  flexResponsive: "responsive-flex",
  containerMain: "container-custom",
  containerNarrow: "container-narrow",
  spacingSection: "space-section",
  spacingContent: "space-content",
  spacingElements: "space-elements",
  
  // Status and Feedback
  statusSuccess: "status-success badge-modern",
  statusWarning: "status-warning badge-modern",
  statusError: "status-error badge-modern",
  statusInfo: "status-info badge-modern",
  
  // Modern Visual Effects
  glassEffect: "glass-effect rounded-2xl p-6",
  shadowSoft: "shadow-soft",
  shadowMedium: "shadow-medium",
  shadowStrong: "shadow-strong",
  
  // Animation Classes
  animateFadeIn: "animate-fade-in",
  animateSlideUp: "animate-slide-up",
  animateScaleIn: "animate-scale-in"
};

// Animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export const fadeInUpDelay = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay: 0.1 }
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};