import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface SwipeableTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export function SwipeableTabs({ 
  tabs, 
  defaultTab, 
  onTabChange,
  className 
}: SwipeableTabsProps) {
  const [activeIndex, setActiveIndex] = useState(() => {
    if (defaultTab) {
      const index = tabs.findIndex(t => t.id === defaultTab);
      return index >= 0 ? index : 0;
    }
    return 0;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const containerWidth = useRef(0);

  useEffect(() => {
    if (containerRef.current) {
      containerWidth.current = containerRef.current.offsetWidth;
    }
  }, []);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const threshold = containerWidth.current / 4;
    const velocity = info.velocity.x;
    
    let newIndex = activeIndex;
    
    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      if (info.offset.x > 0 && activeIndex > 0) {
        newIndex = activeIndex - 1;
      } else if (info.offset.x < 0 && activeIndex < tabs.length - 1) {
        newIndex = activeIndex + 1;
      }
    }
    
    setActiveIndex(newIndex);
    onTabChange?.(tabs[newIndex].id);
    
    // Animate to new position
    animate(x, -newIndex * containerWidth.current, {
      type: "spring",
      stiffness: 300,
      damping: 30,
    });
  }, [activeIndex, tabs, onTabChange, x]);

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
    onTabChange?.(tabs[index].id);
    animate(x, -index * containerWidth.current, {
      type: "spring",
      stiffness: 300,
      damping: 30,
    });
  };

  // Update position when activeIndex changes
  useEffect(() => {
    if (containerWidth.current) {
      x.set(-activeIndex * containerWidth.current);
    }
  }, [activeIndex, x]);

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(index)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all duration-200",
              "touch-manipulation min-h-[48px]", // Larger touch target
              activeIndex === index
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab indicator */}
      <div className="relative h-0.5 bg-gray-200 dark:bg-gray-700">
        <motion.div
          className="absolute h-full bg-blue-600 dark:bg-blue-400"
          style={{
            width: `${100 / tabs.length}%`,
            x: useTransform(x, 
              tabs.map((_, i) => -i * containerWidth.current),
              tabs.map((_, i) => i * (100 / tabs.length))
            )
          }}
        />
      </div>

      {/* Swipeable Content */}
      <div 
        ref={containerRef}
        className="overflow-hidden touch-pan-y"
      >
        <motion.div
          className="flex"
          style={{ x }}
          drag="x"
          dragConstraints={{
            left: -(tabs.length - 1) * containerWidth.current,
            right: 0,
          }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="flex-shrink-0 w-full"
              style={{ width: "100%" }}
            >
              {tab.content}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Pull to Refresh Hook
interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export function usePullToRefresh({ onRefresh, threshold = 80 }: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance * 0.5, threshold * 1.5));
      e.preventDefault();
    }
  }, [isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isRefreshing,
    pullDistance,
    progress: Math.min(pullDistance / threshold, 1),
  };
}

// Pull to Refresh Indicator Component
export function PullToRefreshIndicator({ 
  progress, 
  isRefreshing 
}: { 
  progress: number; 
  isRefreshing: boolean;
}) {
  if (progress === 0 && !isRefreshing) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
      style={{ 
        transform: `translateY(${Math.min(progress * 60, 60)}px)`,
        opacity: Math.min(progress, 1)
      }}
    >
      <div className={cn(
        "w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center",
        isRefreshing && "animate-spin"
      )}>
        <svg 
          className="w-5 h-5 text-blue-600 dark:text-blue-400" 
          viewBox="0 0 24 24" 
          fill="none"
          style={{ transform: `rotate(${progress * 360}deg)` }}
        >
          <path
            d="M12 4V2M12 4C7.58172 4 4 7.58172 4 12M12 4C16.4183 4 20 7.58172 20 12M4 12C4 16.4183 7.58172 20 12 20M4 12H2M20 12C20 16.4183 16.4183 20 12 20M20 12H22M12 20V22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export default SwipeableTabs;

