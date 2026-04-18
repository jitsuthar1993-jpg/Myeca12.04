import { Link } from "wouter";
import { track } from "@vercel/analytics";
import {
  ArrowRight,
  Bot,
  Calculator,
  FileText,
  MessageCircle,
  PiggyBank,
  Quote,
  ShieldAlert,
  Sparkles,
  Upload,
  ChevronRight,
  Activity,
  Cpu,
  BrainCircuit,
  Zap,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaxChatbot } from "@/components/chat/TaxChatbot";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/admin/Layout";
import SEO from "@/components/SEO";
import { cn } from "@/lib/utils";
import { m } from "framer-motion";

const contextChips = [
  "Salary income detected",
  "FY 2025-26 regime rules",
  "Form 16 OCR-ready",
  "Capital gains check pending",
];

const citedAnswers = [
  {
    title: "Which regime should I choose?",
    source: "Income-tax slab logic for FY 2025-26",
    action: "Open Regime Analyzer",
    href: "/itr/filing",
  },
  {
    title: "Can I claim HRA without rent agreement?",
    source: "HRA calculation and rent receipt evidence workflow",
    action: "Generate Rent Receipt",
    href: "/documents/generator/rent-receipt",
  },
];

const goalPrompts = [
  "Find missed deductions from my documents",
  "Explain my tax notice in plain English",
  "Compare Old vs New Regime for my salary",
  "Prepare questions for my assigned CA",
];

export default function TaxAssistantPage() {
  return (
    <Layout>
      <SEO 
        title="AI Tax Assistant | MyeCA.in"
        description="Interact with our context-aware AI tax advisor for real-time guidance and source-backed answers."
      />

      <div className="flex flex-col lg:flex-row gap-12 items-start bg-slate-50/50 rounded-[48px] p-2">
        {/* Sticky Left Summary Section */}
        <div className="lg:w-96 shrink-0 w-full space-y-6 lg:sticky lg:top-[112px]">
          <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-100/50">
             <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <BrainCircuit className="h-6 w-6 text-white" />
                   </div>
                   <h2 className="text-white font-black tracking-tight">Neural Context</h2>
                </div>
             </div>
             
             <CardContent className="px-6 pb-8 relative">
                <div className="mt-8 space-y-8">
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contextual Chips</p>
                      <div className="flex flex-wrap gap-2">
                         {contextChips.map((chip, i) => (
                           <Badge key={i} className="bg-blue-50 text-blue-700 border-none font-black text-[9px] uppercase px-3 py-1.5 rounded-xl">
                              {chip}
                           </Badge>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Goal Templates</p>
                      <div className="space-y-2">
                         {goalPrompts.map((prompt, i) => (
                           <button
                              key={i}
                              onClick={() => track("ai_goal_prompt_click", { prompt })}
                              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                           >
                              <span className="text-xs font-black text-left leading-tight pr-4">{prompt}</span>
                              <MessageCircle className="h-3 w-3 text-slate-300 group-hover:text-blue-600" />
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="p-6 rounded-[32px] bg-amber-50 border border-amber-100">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                            <ShieldAlert className="h-5 w-5 text-amber-600" />
                         </div>
                         <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-none">AI Advisory Node</p>
                      </div>
                      <p className="text-[10px] font-medium text-amber-800 leading-relaxed">Guidance is assistive. All final filings must be routed through human CA validation.</p>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[40px] bg-white p-8 border border-slate-100/50 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Quote className="h-4 w-4 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Source Citations</span>
             </div>
             <div className="space-y-4">
                {citedAnswers.map((answer, i) => (
                  <div key={i} className="p-4 rounded-[24px] bg-slate-50 border border-slate-100/50">
                     <p className="text-xs font-black text-slate-900 leading-tight mb-2">{answer.title}</p>
                     <p className="text-[9px] text-slate-500 font-medium leading-relaxed mb-3">{answer.source}</p>
                     <Link href={answer.href}>
                        <Button variant="ghost" className="h-8 w-full justify-between px-3 bg-white hover:bg-blue-50 hover:text-blue-600 font-black text-[8px] uppercase tracking-widest rounded-xl transition-all">
                           {answer.action}
                           <ArrowRight className="h-2 w-2" />
                        </Button>
                     </Link>
                  </div>
                ))}
             </div>
          </Card>
        </div>

        {/* Main Content Area - Full Page Scroll */}
        <div className="flex-1 min-w-0 w-full lg:max-w-7xl space-y-10 pb-20">
          {/* Header */}
          <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100/50 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Cognitive Layer</span>
               </div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Tax Advisor</h1>
               <p className="text-slate-500 max-w-2xl text-base font-medium leading-relaxed">
                  A workflow-aware assistant that parses your documents, cross-references statutory rules, and provides verified tax guidance.
               </p>
            </div>
            <div className="flex gap-4">
               <Button className="rounded-2xl h-14 px-8 bg-blue-600 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20">
                  <Sparkles className="h-4 w-4 mr-3" />
                  Neural Search
               </Button>
            </div>
          </div>

          <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
             <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                      <Bot className="h-6 w-6" />
                   </div>
                   <div>
                      <h3 className="text-sm font-black text-slate-900 leading-none">MyeCA Assistant</h3>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Live Encryption Active</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white hover:bg-slate-50 shadow-sm border border-slate-100">
                      <RefreshCw className="h-4 w-4 text-slate-400" />
                   </Button>
                </div>
             </div>
             <div className="flex-1 p-0 relative">
                <TaxChatbot embedded />
             </div>
          </div>

          {/* Quick Action Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[
               { label: "Calc Tax", icon: Calculator, href: "/calculators/income-tax", color: "blue" },
               { label: "Upload Proof", icon: Upload, href: "/documents", color: "emerald" },
               { label: "Optimize", icon: PiggyBank, href: "/tax-optimizer", color: "amber" },
               { label: "File Now", icon: FileText, href: "/itr/filing", color: "indigo" }
             ].map((action, i) => (
               <Link key={i} href={action.href}>
                  <Card className="p-8 rounded-[40px] border-none shadow-sm bg-white hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer border border-slate-100/50">
                     <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", `bg-${action.color}-50 text-${action.color}-600`)}>
                        <action.icon className="h-6 w-6" />
                     </div>
                     <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{action.label}</p>
                     <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">Execute Action</p>
                  </Card>
               </Link>
             ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

