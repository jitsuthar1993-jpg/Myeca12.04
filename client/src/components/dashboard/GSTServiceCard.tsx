import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, Clock, ChevronRight, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

interface GSTServiceCardProps {
  status: string;
  gstin?: string;
}

export function GSTServiceCard({ status, gstin }: GSTServiceCardProps) {
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
          isCompleted ? "bg-emerald-500" : "bg-blue-500"
        )} />

        <CardHeader className="pt-8 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm",
                isCompleted ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"
              )}>
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-slate-900  mb-1">
                  GST Registration
                </CardTitle>
                <CardDescription className="text-sm font-bold uppercase tracking-widest text-slate-400  flex items-center gap-2">
                  Business Compliance
                  {isCompleted && <Sparkles className="h-3 w-3 text-emerald-500" />}
                </CardDescription>
              </div>
            </div>

            <Badge className={cn(
              "rounded-full px-3 py-1 h-7 border-0 font-bold type-meta uppercase tracking-wider",
              isCompleted
                ? "bg-emerald-500/15 text-emerald-700  "
                : "bg-blue-500/15 text-blue-700  "
            )}>
              {isCompleted ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
              {status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-8 space-y-6">
          {gstin ? (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-slate-50  rounded-2xl border border-slate-100  flex items-center justify-between group/id"
            >
              <div>
                <p className="type-meta text-slate-400 uppercase font-black tracking-widest mb-1">Your GSTIN</p>
                <p className="font-mono font-bold text-lg text-slate-900  tracking-wider">{gstin}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center opacity-0 group-hover/id:opacity-100 transition-opacity">
                <CheckCircle className="h-4 w-4" />
              </div>
            </m.div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-600  leading-relaxed">
                We are processing your application with the GST department.
                <span className="block mt-1 font-bold text-blue-600 ">ETA: 3-5 Business Days</span>
              </p>

              {/* Magic Line Progress */}
              <div className="space-y-2">
                <div className="flex justify-between type-meta font-black uppercase tracking-widest text-slate-400">
                  <span>Current Phase: Verification</span>
                  <span>50%</span>
                </div>
                <div className="h-2 w-full bg-slate-100  rounded-full overflow-hidden relative">
                  <m.div
                    initial={{ width: 0 }}
                    animate={{ width: "50%" }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full relative"
                  >
                    <m.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-0 right-0 h-full w-8 bg-white/40 blur-sm"
                    />
                  </m.div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Link href="/services/gst-registration">
              <Button className={cn(
                "w-full h-12 rounded-xl font-bold transition-all duration-300 gap-2",
                isCompleted
                  ? "bg-blue-700 text-white hover:bg-blue-800  "
                  : "bg-white text-slate-900 border-2 border-slate-100 hover:border-blue-200 hover:bg-slate-50"
              )}>
                {isCompleted ? "Download Certificate" : "Track Application"}
                <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", !isCompleted && "text-blue-600")} />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
}
