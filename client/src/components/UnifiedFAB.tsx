import { useState, useEffect } from "react";
import { 
  MessageCircle, 
  Bot, 
  X, 
  HelpCircle,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { cn } from "@/lib/utils";

interface UnifiedFABProps {
  onChatbotOpen?: () => void;
  isChatbotOpen?: boolean;
}

export function UnifiedFAB({ onChatbotOpen, isChatbotOpen = false }: UnifiedFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Track scroll position for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChatbotClick = () => {
    setIsExpanded(false);
    onChatbotOpen?.();
  };

  const handleFeedbackClick = () => {
    setIsExpanded(false);
    setIsFeedbackOpen(true);
  };

  // Close expanded menu when chatbot opens
  useEffect(() => {
    if (isChatbotOpen) {
      setIsExpanded(false);
    }
  }, [isChatbotOpen]);

  // Don't show FAB when chatbot is open
  if (isChatbotOpen) return null;

  return (
    <>
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed z-40 p-3 rounded-full bg-white border border-gray-200 shadow-lg",
          "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
          "transition-all duration-300 ease-out",
          "bottom-24 right-6 md:bottom-28 md:right-6",
          showScrollTop 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Backdrop when expanded */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 z-40 transition-opacity duration-200",
          isExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsExpanded(false)}
      />

      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 md:bottom-6">
        {/* Action Buttons - shown when expanded */}
        <div className={cn(
          "flex flex-col gap-2 transition-all duration-200",
          isExpanded 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          {/* Tax Assistant Button */}
          <button
            onClick={handleChatbotClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl",
              "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
              "shadow-lg hover:shadow-xl hover:scale-105",
              "transition-all duration-200"
            )}
          >
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Bot className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-medium text-sm">Tax Assistant</span>
              <span className="text-purple-200 text-xs block">AI-powered help</span>
            </div>
          </button>

          {/* Feedback Button */}
          <button
            onClick={handleFeedbackClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl",
              "bg-white text-gray-700 border border-gray-200",
              "shadow-lg hover:shadow-xl hover:scale-105 hover:border-gray-300",
              "transition-all duration-200"
            )}
          >
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <MessageCircle className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <span className="font-medium text-sm">Feedback</span>
              <span className="text-gray-500 text-xs block">Share your thoughts</span>
            </div>
          </button>
        </div>

        {/* Main FAB Toggle */}
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg hover:shadow-xl",
            "transition-all duration-300",
            isExpanded 
              ? "bg-gray-800 hover:bg-gray-900 rotate-0" 
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          )}
        >
          {isExpanded ? (
            <X className="h-6 w-6 transition-transform duration-200" />
          ) : (
            <HelpCircle className="h-6 w-6 transition-transform duration-200" />
          )}
          <span className="sr-only">{isExpanded ? 'Close menu' : 'Open help menu'}</span>
        </Button>

        {/* Online indicator dot */}
        {!isExpanded && (
          <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </div>

      {/* Feedback Dialog */}
      <FeedbackDialog 
        open={isFeedbackOpen} 
        onOpenChange={setIsFeedbackOpen}
      />
    </>
  );
}

export default UnifiedFAB;



