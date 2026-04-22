import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

interface ITRServiceCardProps {
  status: string;
  progress: number;
  assessmentYear: string;
  dueDate: string;
}

export function ITRServiceCard({ status, progress, assessmentYear, dueDate }: ITRServiceCardProps) {
  const isCompleted = status === 'completed';

  return (
    <m.div
      whileHover={{ y: -5, scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="group relative overflow-hidden bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[28px]">
        {/* Animated Accent Background */}
        <div className={cn(
          "absolute top-0 left-0 w-full h-1.5 transition-all duration-500 group-hover:h-2",
          isCompleted ? "bg-emerald-500" : "bg-[#315efb]"
        )} />
        
        <CardHeader className="pt-8 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm",
                isCompleted ? "bg-emerald-500/10 text-emerald-600" : "bg-[#EEF4FF] text-[#315efb]"
              )}>
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                  ITR Filing <span className="text-slate-400 font-medium">AY {assessmentYear}</span>
                </CardTitle>
                <CardDescription className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  Tax Compliance
                  {isCompleted && <Sparkles className="h-3 w-3 text-emerald-500" />}
                </CardDescription>
              </div>
            </div>
            
            <Badge className={cn(
              "rounded-full px-3 py-1 h-7 border-0 font-bold text-[10px] uppercase tracking-wider",
              isCompleted 
                ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                : "bg-[#EEF4FF] text-[#315efb]"
            )}>
              <Clock className="h-3 w-3 mr-1" />
              {status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filing Progress</span>
              <span className={cn(
                "text-lg font-black tracking-tight",
                isCompleted ? "text-emerald-600" : "text-[#315efb]"
              )}>{progress}%</span>
            </div>
            
            {/* Custom Magic Line Progress */}
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
              <m.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className={cn(
                  "h-full rounded-full relative transition-all duration-500",
                  isCompleted ? "bg-emerald-500" : "bg-[#315efb]"
                )}
              >
                {!isCompleted && (
                  <m.div 
                    animate={{ opacity: [0.4, 1, 0.4], x: ["-100%", "300%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 h-full w-20 bg-white/30 blur-md shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                  />
                )}
              </m.div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100/50 dark:border-amber-800/30">
            <Calendar className="h-5 w-5 text-amber-600/70" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">Due Date</span>
              <span className="text-sm font-bold text-amber-900 dark:text-amber-200">{dueDate}</span>
            </div>
          </div>
          
          <div className="pt-4">
            <Link href="/itr/form-selector">
              <Button className={cn(
                "w-full h-12 rounded-xl font-bold transition-all duration-300 gap-2",
                isCompleted 
                  ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900" 
                  : "bg-white text-slate-900 border-2 border-slate-100 hover:border-indigo-200 hover:bg-slate-50 shadow-sm"
              )}>
                {progress === 100 ? "View Acknowledgement" : "Continue Filing"}
                <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", !isCompleted && "text-indigo-600")} />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
}
