import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollToTopProps {
  className?: string;
  threshold?: number;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  className,
  threshold = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className={cn(
            'fixed bottom-8 right-8 z-50 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 backdrop-blur-sm border border-white/10',
            className
          )}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
          
          {/* Pulse ring effect */}
          <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20"></div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
