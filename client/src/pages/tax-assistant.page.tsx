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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaxChatbot } from "@/components/chat/TaxChatbot";
import {
  ComplianceShell,
  MyeCard,
  SectionHeading,
  StatusBadge,
} from "@/components/platform/compliance-ui";

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
  {
    title: "Why does AIS differ from Form 16?",
    source: "AIS/26AS reconciliation guidance",
    action: "Upload AIS",
    href: "/documents",
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
    <ComplianceShell
      active="/tax-assistant"
      title="AI tax assistant"
      subtitle="A workflow-aware tax advisor that answers with context, cites sources, and turns advice into filing actions."
      actions={
        <Link href="/itr/filing">
          <Button className="bg-white text-[#003087] hover:bg-blue-50" onClick={() => track("ai_cta_click", { cta: "start_itr" })}>
            Start ITR with AI
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      }
    >
      <MyeCard className="mb-6 border-amber-200 bg-amber-50">
        <div className="flex gap-3 text-amber-950">
          <ShieldAlert className="mt-1 h-5 w-5 shrink-0" />
          <div>
            <p className="font-black">AI guidance is assistive, not final tax advice.</p>
            <p className="mt-1 text-sm">
              MyeCA should show citations, preserve context, and route final filing decisions through CA review.
            </p>
          </div>
        </div>
      </MyeCard>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.75fr]">
        <MyeCard className="min-h-[720px]">
          <SectionHeading
            eyebrow="Conversation"
            title="Ask, verify, then act"
            description="The embedded assistant remains available, now surrounded by context chips, source patterns, and direct task handoffs."
          />
          <div className="mt-5 flex flex-wrap gap-2">
            {contextChips.map((chip) => (
              <span key={chip} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-[#003087]">
                {chip}
              </span>
            ))}
          </div>
          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
            <TaxChatbot embedded />
          </div>
        </MyeCard>

        <div className="space-y-6">
          <MyeCard>
            <SectionHeading eyebrow="Goal prompts" title="Skip prompt engineering" />
            <div className="mt-5 space-y-3">
              {goalPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 text-left font-bold text-slate-800 transition hover:border-[#003087] hover:bg-blue-50"
                  onClick={() => track("ai_goal_prompt_click", { prompt })}
                >
                  <span>{prompt}</span>
                  <MessageCircle className="h-4 w-4 text-[#003087]" />
                </button>
              ))}
            </div>
          </MyeCard>

          <MyeCard>
            <SectionHeading eyebrow="Source-backed answers" title="Citations and next actions" />
            <div className="mt-5 space-y-4">
              {citedAnswers.map((answer) => (
                <div key={answer.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <Quote className="h-5 w-5 text-[#003087]" />
                  <h3 className="mt-3 font-black text-slate-950">{answer.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{answer.source}</p>
                  <StatusBadge status="submitted" label="Citation required" className="mt-3" />
                  <Link href={answer.href}>
                    <Button
                      variant="outline"
                      className="mt-4 w-full justify-between"
                      onClick={() => track("ai_cta_click", { cta: answer.action })}
                    >
                      {answer.action}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </MyeCard>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          ["Calculate tax", Calculator, "/calculators/income-tax"],
          ["Upload proof", Upload, "/documents"],
          ["Optimize deductions", PiggyBank, "/tax-optimizer"],
          ["File return", FileText, "/itr/filing"],
        ].map(([label, Icon, href]) => {
          const TypedIcon = Icon as typeof Bot;
          return (
            <Link
              key={String(label)}
              href={String(href)}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#003087]"
              onClick={() => track("ai_action_tile_click", { action: String(label) })}
            >
              <TypedIcon className="h-7 w-7 text-[#003087]" />
              <p className="mt-4 font-black text-slate-950">{String(label)}</p>
              <p className="mt-1 text-sm text-slate-500">Open the related MyeCA module.</p>
            </Link>
          );
        })}
      </div>
    </ComplianceShell>
  );
}
