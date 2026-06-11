import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, ChevronRight, CheckCircle, Sparkles, Building2 } from "lucide-react";
import { Link } from "wouter";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

interface CompanyRegServiceCardProps {
  status: string;
  companyName?: string;
}

export function CompanyRegServiceCard({ status, companyName }: CompanyRegServiceCardProps) {
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
          isCompleted ? "bg-emerald-500" : "bg-violet-500"
        )} />

        <CardHeader className="pt-8 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm",
                isCompleted ? "bg-emerald-500/10 text-emerald-600" : "bg-violet-500/10 text-violet-600"
              )}>
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-slate-900  mb-1">
                  Company Incorporation
                </CardTitle>
                <CardDescription className="text-sm font-bold uppercase tracking-widest text-slate-400  flex items-center gap-2">
                  Startup Services
                  {isCompleted && <Sparkles className="h-3 w-3 text-emerald-500" />}
                </CardDescription>
              </div>
            </div>

            <Badge className={cn(
              "rounded-full px-3 py-1 h-7 border-0 font-bold type-meta uppercase tracking-wider",
              isCompleted
                ? "bg-emerald-500/15 text-emerald-700  "
                : "bg-violet-500/15 text-violet-700  "
            )}>
              {isCompleted ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
              {status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-8 space-y-6">
          <div className="p-4 bg-slate-50  rounded-2xl border border-slate-100  flex items-start gap-3">
            <Building2 className="h-5 w-5 text-slate-400 mt-1" />
            <div>
              <p className="type-meta text-slate-400 uppercase font-black tracking-widest mb-1">Proposed Name</p>
              <p className="font-bold text-base text-slate-900  leading-tight">
                {companyName || "Name Approval Pending"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-1">
            <m.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                "w-2 h-2 rounded-full",
                isCompleted ? "bg-emerald-500" : "bg-blue-500"
              )}
            />
            <span className="text-sm font-medium text-slate-600 ">
              {isCompleted ? "Company registered successfully" : "Verification of directors in progress"}
            </span>
          </div>

          <div className="pt-4">
            <Link href="/services/company-registration">
              <Button className={cn(
                "w-full h-12 rounded-xl font-bold transition-all duration-300 gap-2",
                isCompleted
                  ? "bg-blue-700 text-white hover:bg-blue-800  "
                  : "bg-white text-slate-900 border-2 border-slate-100 hover:border-violet-200 hover:bg-slate-50 shadow-sm"
              )}>
                {isCompleted ? "View Documents" : "Manage Application"}
                <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", !isCompleted && "text-violet-600")} />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
}
