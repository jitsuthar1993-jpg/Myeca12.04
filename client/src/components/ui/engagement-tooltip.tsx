import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Lightbulb, Target, Coins, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TooltipData {
  id: string;
  title: string;
  message: string;
  icon: React.ComponentType<any>;
  actionText: string;
  actionUrl?: string;
  position: { x: number; y: number };
  delay: number;
  color: string;
}

interface EngagementTooltipProps {
  tooltips: TooltipData[];
  onComplete?: () => void;
}

export function EngagementTooltip({ tooltips, onComplete }: EngagementTooltipProps) {
  const [currentTooltip, setCurrentTooltip] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, tooltips[currentTooltip]?.delay || 1000);

    return () => clearTimeout(timer);
  }, [currentTooltip, hasStarted, tooltips]);

  useEffect(() => {
    // Auto-start after page load
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, 2000);

    return () => clearTimeout(startTimer);
  }, []);

  const handleNext = () => {
    setIsVisible(false);
    
    setTimeout(() => {
      if (currentTooltip < tooltips.length - 1) {
        setCurrentTooltip(currentTooltip + 1);
      } else {
        onComplete?.();
      }
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete?.();
  };

  const handleAction = () => {
    const tooltip = tooltips[currentTooltip];
    if (tooltip.actionUrl) {
      window.location.href = tooltip.actionUrl;
    } else {
      handleNext();
    }
  };

  if (!hasStarted || !tooltips[currentTooltip]) return null;

  const tooltip = tooltips[currentTooltip];
  const IconComponent = tooltip.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm"
            onClick={handleSkip}
          />
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed z-50"
            style={{
              left: `${tooltip.position.x}px`,
              top: `${tooltip.position.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <Card className="w-80 shadow-2xl border-2 border-blue-200 bg-white">
              <CardContent className="p-0">
                {/* Header */}
                <div className={`px-6 py-4 bg-gradient-to-r ${tooltip.color} text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/20"></div>
                    <div className="absolute -bottom-2 -left-2 w-16 h-16 rounded-full bg-white/10"></div>
                  </div>
                  
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{tooltip.title}</h3>
                        <span className="text-xs opacity-80">
                          Tip {currentTooltip + 1} of {tooltips.length}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSkip}
                      className="text-white hover:bg-white/20 p-1 h-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {tooltip.message}
                  </p>
                  
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(((currentTooltip + 1) / tooltips.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${tooltip.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentTooltip + 1) / tooltips.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAction}
                      className={`flex-1 bg-gradient-to-r ${tooltip.color} hover:opacity-90 text-white shadow-lg`}
                    >
                      {tooltip.actionText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    
                    {currentTooltip < tooltips.length - 1 && (
                      <Button
                        variant="outline"
                        onClick={handleNext}
                        className="px-4"
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pointer */}
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white`}></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for managing tooltip state
export function useEngagementTooltips() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if user has seen tooltips before
    const hasSeenTooltips = localStorage.getItem('startup-tooltips-seen');
    if (hasSeenTooltips) {
      setHasShown(true);
      setIsCompleted(true);
    }
  }, []);

  const markCompleted = () => {
    setIsCompleted(true);
    setHasShown(true);
    localStorage.setItem('startup-tooltips-seen', 'true');
  };

  const resetTooltips = () => {
    setIsCompleted(false);
    setHasShown(false);
    localStorage.removeItem('startup-tooltips-seen');
  };

  return {
    isCompleted,
    hasShown,
    markCompleted,
    resetTooltips
  };
}

// Predefined tooltip configurations for startup services
export const startupTooltips: TooltipData[] = [
  {
    id: "welcome",
    title: "Welcome to Startup Services!",
    message: "Discover how our expert CA team can help you leverage Indian government schemes like Startup India, SISFS, and PMMY for maximum benefits.",
    icon: Lightbulb,
    actionText: "Get Started",
    position: { x: 400, y: 200 },
    delay: 1000,
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "schemes",
    title: "Government Schemes",
    message: "Access up to \u20B950L funding through SISFS, BIG, CGSS & PMMY schemes. Our experts guide you through the entire application process.",
    icon: Coins,
    actionText: "View Funding Services",
    actionUrl: "#funding-services",
    position: { x: 600, y: 300 },
    delay: 500,
    color: "from-emerald-500 to-emerald-600"
  },
  {
    id: "benefits",
    title: "Tax Benefits & Savings",
    message: "Get 3-year tax holiday under Section 80-IAC through Startup India registration. Maximize your tax savings with expert guidance.",
    icon: Target,
    actionText: "Learn More",
    actionUrl: "#tax-benefits",
    position: { x: 300, y: 400 },
    delay: 500,
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "success",
    title: "Join 2,500+ Successful Startups",
    message: "Our clients have successfully raised \u20B9850+ crores through government schemes. Let us help you achieve similar success.",
    icon: CheckCircle,
    actionText: "Start Your Journey",
    actionUrl: "#get-started",
    position: { x: 500, y: 500 },
    delay: 500,
    color: "from-orange-500 to-orange-600"
  }
];