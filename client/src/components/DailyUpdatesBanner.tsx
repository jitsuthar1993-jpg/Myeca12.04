import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, X, Sparkles, Zap, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

  const isCritical = activeUpdate.priority === "CRITICAL" || activeUpdate.priority === "HIGH";

  return (
    <AnimatePresence>
      <m.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-20 left-0 right-0 z-[100] px-4 pointer-events-none"
      >
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <m.div 
            whileHover={{ scale: 1.01 }}
            className={cn(
              "relative overflow-hidden p-1 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-2xl transition-all duration-500",
              isCritical 
                ? "bg-gradient-to-r from-red-600 to-orange-600 shadow-red-500/20" 
                : "bg-white/10 border border-white/10 bg-blue-700 shadow-blue-500/10"
            )}
          >
            {/* Animated Glow for Critical Updates */}
            {isCritical && (
              <m.div 
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 blur-xl opacity-20"
              />
            )}

            <div className="relative flex items-center justify-between gap-4 py-2 px-6">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
                  isCritical ? "bg-white text-red-600" : "bg-blue-600 text-white"
                )}>
                  {isCritical ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <Zap className="w-5 h-5" />}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] mb-0.5",
                    isCritical ? "text-red-100" : "text-blue-400"
                  )}>
                    {activeUpdate.priority} Intelligence Update
                  </span>
                  <p className={cn(
                    "font-bold truncate text-sm",
                    isCritical ? "text-white" : "text-slate-100"
                  )}>
                    {activeUpdate.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/blog">
                  <m.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "hidden sm:flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                      isCritical 
                        ? "bg-white text-red-600 hover:bg-red-50" 
                        : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
                    )}
                  >
                    View Insight
                    <ArrowRight className="w-4 h-4" />
                  </m.button>
                </Link>

                <m.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  onClick={handleDismiss}
                  className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </m.button>
              </div>
            </div>
          </m.div>
        </div>
      </m.div>
    </AnimatePresence>
  );
}
