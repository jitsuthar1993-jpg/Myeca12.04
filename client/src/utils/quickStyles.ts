// Quick Styles Utility for Consistent Animations and Visibility

export const quickStyles = {
  // Button styles ensuring visibility
  button: {
    primary: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 opacity-100 visible animate-fade-in",
    secondary: "bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 opacity-100 visible animate-fade-in",
    outline: "border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 px-6 py-3 rounded-lg font-medium bg-white transition-all duration-300 opacity-100 visible animate-fade-in",
    whatsapp: "bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center opacity-100 visible animate-fade-in"
  },
  
  // Animation variants
  animation: {
    fadeIn: "animate-fade-in",
    slideUp: "animate-slide-up",
    slideDown: "animate-slide-down",
    slideLeft: "animate-slide-left",
    slideRight: "animate-slide-right",
    scaleIn: "animate-scale-in",
    bounceIn: "animate-bounce-in",
    float: "animate-float",
    pulseSoft: "animate-pulse-soft",
    wiggle: "animate-wiggle",
    spinSlow: "animate-spin-slow",
    gradientX: "animate-gradient-x",
    gradientY: "animate-gradient-y",
    textShimmer: "animate-text-shimmer"
  },
  
  // Stagger animation classes
  stagger: {
    container: "stagger-children",
    delay: (index: number) => `animation-delay-${index * 100}`
  },
  
  // Card styles with animations
  card: {
    base: "bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 h-full border border-gray-200 hover:-translate-y-1 animate-fade-in",
    feature: "bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 h-full border border-gray-200 hover:-translate-y-1 animate-scale-in",
    pricing: "bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 p-8 h-full border-2 hover:-translate-y-2 animate-slide-up"
  },
  
  // Section styles
  section: {
    hero: "bg-gradient-to-br from-blue-50 to-white py-20 lg:py-32",
    white: "bg-white py-16 lg:py-20",
    gray: "bg-gray-50 py-16 lg:py-20",
    blue: "bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 lg:py-20 rounded-2xl"
  },
  
  // Text styles with animations
  text: {
    heading: "text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 animate-slide-up",
    subheading: "text-lg md:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in",
    gradientPrimary: "bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent",
    gradientSecondary: "bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent"
  },
  
  // Icon styles
  icon: {
    primary: "w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center animate-bounce-in",
    secondary: "w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center animate-bounce-in",
    accent: "w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center animate-bounce-in"
  },
  
  // Form elements
  form: {
    input: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 animate-fade-in",
    select: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white animate-fade-in",
    label: "block text-sm font-medium text-gray-700 mb-2 animate-fade-in"
  },
  
  // Badge styles
  badge: {
    popular: "bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium animate-scale-in",
    new: "bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-medium animate-scale-in",
    limited: "bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium animate-scale-in"
  },
  
  // Hover effects
  hover: {
    lift: "hover:-translate-y-1 transition-transform duration-300",
    glow: "hover:shadow-2xl transition-shadow duration-300",
    scale: "hover:scale-105 transition-transform duration-300",
    brightness: "hover:brightness-110 transition-all duration-300"
  }
};

// Animation delay utility
export const getAnimationDelay = (index: number, baseDelay: number = 0.1) => ({
  animationDelay: `${index * baseDelay}s`
});

// Stagger children animation utility
export const staggerChildren = (delayIncrement: number = 0.1) => ({
  container: "stagger-children",
  child: (index: number) => ({
    style: { animationDelay: `${index * delayIncrement}s` }
  })
});

// Scroll animation observer
export const observeScrollAnimations = () => {
  if (typeof window === 'undefined') return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    },
    { threshold: 0.1 }
  );
  
  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
  });
  
  return () => observer.disconnect();
};