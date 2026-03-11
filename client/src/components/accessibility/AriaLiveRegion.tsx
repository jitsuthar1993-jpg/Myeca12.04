import { useEffect, useState } from "react";

interface AriaLiveRegionProps {
  message?: string;
  priority?: "polite" | "assertive" | "off";
  clearAfter?: number;
}

export default function AriaLiveRegion({ 
  message = "", 
  priority = "polite",
  clearAfter = 5000 
}: AriaLiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      
      if (clearAfter > 0) {
        const timeout = setTimeout(() => {
          setCurrentMessage("");
        }, clearAfter);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  );
}

// Hook to use aria live regions
export function useAriaLive() {
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"polite" | "assertive" | "off">("polite");

  const announce = (text: string, announcePriority: "polite" | "assertive" = "polite") => {
    setMessage(text);
    setPriority(announcePriority);
  };

  const clear = () => {
    setMessage("");
  };

  return {
    message,
    priority,
    announce,
    clear
  };
}