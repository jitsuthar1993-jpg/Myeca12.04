import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { Timer, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionWarningModalProps {
  isOpen: boolean;
  timeLeft: number;
  onContinue: () => void;
  onLogout: () => void;
}

export function SessionWarningModal({ isOpen, timeLeft, onContinue, onLogout }: SessionWarningModalProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Progress calculation for an optional visual ring
  const progress = (timeLeft / 120) * 100; // Assuming 2 minute (120s) warning

  return (
    <AnimatePresence>
      <AlertDialog open={isOpen}>
        <AlertDialogContent className="max-w-md p-0 overflow-hidden border-0 bg-white  rounded-[32px] shadow-2xl">
          <div className="relative p-8">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center animate-pulse">
                  <Timer className="h-10 w-10 text-amber-600" />
                </div>
                {/* Simple SVG progress circle maybe? Skipping for now for simplicity, using text. */}
              </div>

              <div className="space-y-2">
                <AlertDialogTitle className="text-2xl font-black text-slate-900  tracking-tight">
                  Session Expiring Soon
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500  font-medium leading-relaxed">
                  For your security, you will be automatically logged out due to inactivity in:
                </AlertDialogDescription>
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-black text-blue-600 tracking-tighter tabular-nums">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>

              <div className="w-full pt-4">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={onContinue}
                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg transition-all shadow-lg shadow-blue-500/25 group"
                  >
                    Keep Me Logged In
                    <m.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="w-full h-12 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 font-bold transition-all gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout Now
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100  flex items-center justify-center gap-2 type-meta text-slate-400 font-bold uppercase tracking-widest">
              <ShieldAlert className="h-3 w-3" />
              Secure Session Management
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
}
