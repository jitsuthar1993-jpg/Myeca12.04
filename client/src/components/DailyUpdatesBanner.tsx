import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export function DailyUpdatesBanner() {
  const [dismissed, setDismissed] = useState<number[]>([]);

  const { data: response, isLoading } = useQuery({
    queryKey: ["public-updates"],
    queryFn: async () => {
      const res = await fetch("/api/public/updates/active");
      if (!res.ok) throw new Error("Failed to fetch updates");
      return await res.json() as { updates: any[] };
    },
  });

  const updates = response?.updates || [];
  
  // Filter out dismissed updates and find the highest priority one that is active
  const visibleUpdates = updates.filter(u => !dismissed.includes(u.id));
  
  if (isLoading || visibleUpdates.length === 0) return null;

  // Grab the most recently created or highest priority update to show in the banner
  const activeUpdate = visibleUpdates[0];

  if (!activeUpdate) return null;

  const handleDismiss = () => {
    setDismissed(prev => [...prev, activeUpdate.id]);
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "bg-red-600 text-white";
      case "HIGH": return "bg-orange-500 text-white";
      case "LOW": return "bg-gray-800 text-gray-100";
      case "MEDIUM":
      default: return "bg-blue-600 text-white";
    }
  };

  return (
    <div className={`relative px-4 py-3 sm:px-6 lg:px-8 ${getPriorityStyle(activeUpdate.priority)}`}>
      <div className="flex items-center justify-between flex-wrap gap-2 max-w-7xl mx-auto">
        <div className="flex-1 flex items-center min-w-0">
          <span className="flex p-2 rounded-lg bg-white/20 mr-3">
            <AlertCircle className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <p className="font-medium truncate">
            <span className="md:hidden">{activeUpdate.title}</span>
            <span className="hidden md:inline">{activeUpdate.title} - {activeUpdate.description.substring(0, 100)}{activeUpdate.description.length > 100 ? '...' : ''}</span>
          </p>
        </div>
        
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* If you wanted to link to a dedicated updates page, you could use this */}
          {/* <Link href="/updates" className="flex items-center justify-center px-4 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium bg-white text-gray-900 hover:bg-gray-50">
            Read More
          </Link> */}
          <button
            type="button"
            className="flex p-1.5 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white transition"
            onClick={handleDismiss}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-5 w-5 text-white" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
