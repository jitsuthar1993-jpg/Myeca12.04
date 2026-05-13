import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  FileDown,
  Lock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LeadMagnetProps {
  title?: string;
  resourceName: string;
}

export const LeadMagnet: React.FC<LeadMagnetProps> = ({
  title = "Unlock the 2025 Compliance Checklist",
  resourceName
}) => {
  const [step, setStep] = useState<"initial" | "checklist">("initial");

  const checklistItems = [
    "Confirm PAN, Aadhaar, address, and ownership details before filing.",
    "Collect identity, address, registered office, and bank proof in one folder.",
    "Check registrations, statutory due dates, and professional tax or GST needs.",
    "Review common penalty triggers before submitting forms or returns.",
    "List open questions for a CA so the consultation stays focused."
  ];

  return (
    <Card className="overflow-hidden border-2 border-dashed border-blue-200 bg-blue-50/30">
      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          {step === "initial" && (
            <m.div
              key="initial"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileDown className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto font-medium">
                Get the exclusive 20-point checklist for {resourceName} curated by our Senior CAs.
                Use it to prepare documents, timelines, and risk checks before filing.
              </p>
              <Button
                onClick={() => setStep("checklist")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg flex items-center gap-2 mx-auto"
              >
                <Lock className="w-4 h-4" />
                View Free Checklist
              </Button>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                No email required
              </div>
            </m.div>
          )}

          {step === "checklist" && (
            <m.div
              key="checklist"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Checklist ready</h3>
                <p className="text-sm text-slate-500">Use this starter checklist before you speak with an expert.</p>
              </div>

              <div className="space-y-3 max-w-md mx-auto mb-6">
                {checklistItems.map((item) => (
                  <div key={item} className="flex gap-3 text-left text-sm font-medium text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  window.location.href = "/expert-consultation";
                }}
                className="w-full max-w-sm mx-auto bg-blue-600 text-white font-black h-14 rounded-xl shadow-xl shadow-blue-500/20 group flex"
              >
                Talk to an expert
                <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="link"
                onClick={() => setStep("initial")}
                className="w-full mt-4 text-slate-400 text-xs font-bold"
              >
                Go Back
              </Button>
            </m.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default LeadMagnet;
