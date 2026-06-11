import { useState, useEffect } from "react";
import {
  MessageCircle,
  X,
  HelpCircle,
  Mail,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { cn } from "@/lib/utils";

interface UnifiedFABProps {
  isChatbotOpen?: boolean;
}

export function UnifiedFAB({ isChatbotOpen = false }: UnifiedFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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
      {/* Backdrop when expanded */}
      <div
        className={cn(
          "fixed inset-0 z-40 hidden bg-blue-900/20 transition-opacity duration-200 md:block",
          isExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsExpanded(false)}
      />

      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-50 hidden flex-col items-end gap-3 md:flex">
        {/* Action Buttons - shown when expanded */}
        <div className={cn(
          "flex flex-col gap-2 transition-all duration-200",
          isExpanded
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          {/* Feedback Button */}
          <button
            onClick={handleFeedbackClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl",
              "bg-white text-slate-700 border border-slate-200",
              "shadow-lg hover:shadow-xl hover:scale-105 hover:border-slate-300",
              "transition-all duration-200"
            )}
          >
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <MessageCircle className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-left">
              <span className="font-medium text-sm">Feedback</span>
              <span className="text-slate-500 text-xs block">Share your thoughts</span>
            </div>
          </button>

          {/* Support Request Button */}
          <a
            href="/contact"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl",
              "bg-blue-600 text-white",
              "shadow-lg hover:shadow-xl hover:scale-105",
              "transition-all duration-200"
            )}
          >
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Mail className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-medium text-sm">Support request</span>
              <span className="text-blue-100 text-xs block">Scoped callback</span>
            </div>
          </a>

          <a
            href="/trust"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl",
              "bg-white text-slate-700 border border-slate-200",
              "shadow-lg hover:shadow-xl hover:scale-105 hover:border-blue-100",
              "transition-all duration-200"
            )}
          >
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left">
              <span className="font-medium text-sm">Trust & security</span>
              <span className="text-slate-500 text-xs block">Document handling</span>
            </div>
          </a>
        </div>

        {/* Main FAB Toggle */}
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg hover:shadow-xl",
            "transition-all duration-300",
            isExpanded
              ? "bg-blue-700 hover:bg-blue-800 rotate-0"
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
