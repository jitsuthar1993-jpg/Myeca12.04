import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
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
        <m.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className={cn(
            'fixed bottom-8 right-8 z-50 p-3 bg-[#315efb] text-white rounded-full shadow-lg hover:shadow-xl hover:bg-[#2040d8] transition-all duration-300',
            className
          )}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </m.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
