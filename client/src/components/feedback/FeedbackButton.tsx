import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { cn } from "@/lib/utils";

interface FeedbackButtonProps {
  className?: string;
}

export function FeedbackButton({ className }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "h-14 w-14 rounded-full shadow-lg hover:shadow-xl",
          "bg-gradient-to-r from-blue-600 to-indigo-600",
          "hover:from-blue-700 hover:to-indigo-700",
          "transition-all duration-200 hover:scale-105",
          className
        )}
      >
        <MessageSquare className="h-6 w-6" />
        <span className="sr-only">Send Feedback</span>
      </Button>

      <FeedbackDialog 
        open={isOpen} 
        onOpenChange={setIsOpen}
      />
    </>
  );
}
