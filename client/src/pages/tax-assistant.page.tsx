import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  ClipboardList,
  FileText,
  PiggyBank,
  ReceiptText,
  Scale,
  Sparkles,
} from "lucide-react";
import SEO from "@/components/SEO";
import { TaxChatbot } from "@/components/chat/TaxChatbot";
import { getChatbotPageContext } from "@/lib/chatbot-context";

const starterCards = [
  {
    title: "Choose ITR form",
    description: "Match salary, business, capital gains, and foreign asset details to the right return.",
    prompt: "Help me choose the correct ITR form for my income sources",
    icon: FileText,
    testId: "starter-choose-itr-form",
  },
  {
    title: "Compare regimes",
    description: "Review old vs new regime tradeoffs before filing or planning deductions.",
    prompt: "Compare old and new tax regime for my salary and deductions",
    icon: Scale,
    testId: "starter-compare-regimes",
  },
  {
    title: "Explain notice",
    description: "Understand demand notices, AIS mismatches, and response next steps.",
    prompt: "Explain a tax notice in simple terms and tell me what to check first",
    icon: ReceiptText,
    testId: "starter-explain-notice",
  },
  {
    title: "Prepare documents",
    description: "Build a clean filing checklist for Form 16, bank, investment, and proof documents.",
    prompt: "Create a document checklist for my ITR filing",
    icon: ClipboardList,
    testId: "starter-prepare-documents",
  },
];

const quickTools = [
  { title: "Income Tax", href: "/calculators/income-tax", icon: Calculator },
  { title: "Regime Compare", href: "/calculators/regime-comparator", icon: PiggyBank },
  { title: "ITR Filing", href: "/itr/start?source=tax_assistant_quick_link", icon: FileText },
  { title: "Document Vault", href: "/documents", icon: ClipboardList },
  { title: "Blog Guides", href: "/blog", icon: BookOpen },
];

const trackProductionEvent = (
  eventName: string,
  properties?: Record<string, string | number | boolean | null>,
) => {
  if (!import.meta.env.PROD) return;

  void import("@vercel/analytics")
    .then(({ track }) => track(eventName, properties))
    .catch(() => undefined);
};

export default function TaxAssistantPage() {
  const [externalPrompt, setExternalPrompt] = useState<{ id: number; text: string }>();
  const [showStarters, setShowStarters] = useState(true);
  const assistantContext = useMemo(
    () => getChatbotPageContext("/tax-assistant", "AI Tax Assistant"),
    []
  );

  const sendPrompt = (prompt: string) => {
    trackProductionEvent("tax_assistant_prompt_click", { prompt });
    setShowStarters(false);
    setExternalPrompt({ id: Date.now(), text: prompt });
  };

  return (
    <div className="min-h-[calc(100vh-74px)] overflow-x-hidden bg-slate-50" data-testid="tax-assistant-single-page">
      <SEO
        title="AI Tax Assistant | MyeCA.in"
        description="Use the MyeCA Tax Assistant for ITR filing, tax planning, document preparation, notices, and calculator guidance."
      />

      <section className="mx-auto flex min-h-[calc(100vh-74px)] w-full max-w-[1040px] flex-col px-4 pb-28 sm:px-6">
        <div className="flex min-h-0 flex-1 flex-col">
          {showStarters && (
            <div className="mx-auto w-full max-w-[860px] pb-5 pt-6 text-center sm:pb-7 sm:pt-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-blue-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Tax Assistant
              </div>
              <h1 className="type-page-title text-slate-950">
                How can I help with your taxes?
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Ask about ITR forms, deductions, tax notices, filing documents, calculators, or the
                next step before you submit.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                {starterCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.title}
                      type="button"
                      data-testid={card.testId}
                      onClick={() => sendPrompt(card.prompt)}
                      className="group flex min-h-[112px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-[128px] sm:p-4"
                    >
                      <span className="flex items-start justify-between gap-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Icon className="h-5 w-5" />
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
                      </span>
                      <span>
                        <span className="block text-sm font-black text-slate-950 sm:text-base">{card.title}</span>
                        <span className="mt-1 hidden text-sm leading-5 text-slate-600 sm:block">{card.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <nav
                aria-label="Tax assistant quick tools"
                className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:justify-center [&::-webkit-scrollbar]:hidden"
              >
                {quickTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.href} href={tool.href}>
                      <span className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                        <Icon className="h-4 w-4" />
                        {tool.title}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {!showStarters && (
            <div className="mx-auto flex w-full max-w-[860px] items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">AI Tax Assistant</p>
                <p className="truncate text-xs font-semibold text-slate-500">{assistantContext.subtitle}</p>
              </div>
              <div className="hidden gap-2 overflow-x-auto sm:flex">
                {quickTools.slice(0, 3).map((tool) => (
                  <Link key={tool.href} href={tool.href}>
                    <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:border-blue-200 hover:text-blue-700">
                      {tool.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <main className="min-h-[420px] min-w-0 flex-1">
            <TaxChatbot
              mode="singlePage"
              context={assistantContext}
              externalPrompt={externalPrompt}
              onConversationStateChange={(hasUserMessages) => setShowStarters(!hasUserMessages)}
            />
          </main>
        </div>
      </section>
    </div>
  );
}
