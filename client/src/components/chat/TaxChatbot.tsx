import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Link } from "wouter";
import {
  Bot,
  CheckCircle2,
  Maximize2,
  MessageCircle,
  Minimize2,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, generateResponse, TAX_TIPS } from "@/lib/chatbot-responses";
import { getChatbotPageContext, type ChatbotPageContext } from "@/lib/chatbot-context";
import { cn } from "@/lib/utils";

export type TaxChatbotMode = "floating" | "embedded" | "fullscreen" | "singlePage";

interface ExternalPrompt {
  id: number;
  text: string;
}

interface TaxChatbotProps {
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
  mode?: TaxChatbotMode;
  context?: ChatbotPageContext;
  externalPrompt?: ExternalPrompt;
  onConversationStateChange?: (hasUserMessages: boolean) => void;
}

function renderInlineFormatting(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={`${part}-${index}`} className="font-black text-inherit">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
}

function ChatMessageContent({ content, formatted }: { content: string; formatted: boolean }) {
  if (!formatted) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  return (
    <div className="space-y-1.5">
      {content.split("\n").map((line, index) =>
        line.trim() ? (
          <p key={`${line}-${index}`} className="m-0">
            {renderInlineFormatting(line)}
          </p>
        ) : (
          <div key={`blank-${index}`} className="h-1.5" aria-hidden="true" />
        )
      )}
    </div>
  );
}

export function TaxChatbot({
  isOpen = true,
  onClose,
  embedded = false,
  mode,
  context,
  externalPrompt,
  onConversationStateChange,
}: TaxChatbotProps) {
  const resolvedMode: TaxChatbotMode = mode ?? (embedded ? "embedded" : "floating");
  const isFullscreen = resolvedMode === "fullscreen";
  const isSinglePage = resolvedMode === "singlePage";
  const isEmbedded = resolvedMode === "embedded";
  const isFloating = resolvedMode === "floating";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastExternalPromptId = useRef<number | null>(null);
  const pageContext = useMemo(
    () => context ?? getChatbotPageContext("/tax-assistant", "AI Tax Assistant"),
    [context]
  );
  const contextKey = `${pageContext.kind}:${pageContext.path}:${pageContext.title}`;
  const dailyTip = useMemo(() => {
    const dayIndex = Math.floor(Date.now() / 86_400_000);
    return TAX_TIPS[dayIndex % TAX_TIPS.length];
  }, []);
  const hasUserMessages = useMemo(() => messages.some((message) => message.type === "user"), [messages]);

  useEffect(() => {
    setMessages([
      {
        id: `greeting-${contextKey}`,
        type: "bot",
        content: pageContext.greeting,
        timestamp: new Date(),
      },
    ]);
    setInputValue("");
    setIsTyping(false);
    lastExternalPromptId.current = null;
  }, [contextKey, pageContext.greeting]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    onConversationStateChange?.(hasUserMessages);
  }, [hasUserMessages, onConversationStateChange]);

  const sendMessage = useCallback(async (messageText: string) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: trimmedMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    const response = generateResponse(trimmedMessage);
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: response.response,
      timestamp: new Date(),
      quickActions: response.quickActions,
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, botMessage]);
  }, []);

  useEffect(() => {
    if (!externalPrompt || externalPrompt.id === lastExternalPromptId.current) return;
    lastExternalPromptId.current = externalPrompt.id;
    void sendMessage(externalPrompt.text);
  }, [externalPrompt, sendMessage]);

  const handleReset = () => {
    setMessages([
      {
        id: `greeting-${Date.now()}`,
        type: "bot",
        content: pageContext.greeting,
        timestamp: new Date(),
      },
    ]);
    setInputValue("");
    setIsTyping(false);
  };

  const handleSend = async () => {
    await sendMessage(inputValue);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleQuickAction = (action: { label: string; action: string; href?: string }) => {
    if (action.href) return;
    void sendMessage(action.label);
  };

  if (!isOpen) return null;

  const chatContent = (
    <div className={cn("flex min-h-0 flex-1 flex-col", (isFullscreen || isSinglePage) && "h-full")}>
      <ScrollArea
        ref={scrollAreaRef}
        className={cn(
          "min-h-0 flex-1",
          isSinglePage
            ? "h-full px-1 pb-28 pt-4 sm:px-0"
            : isFullscreen
              ? "h-full px-4 py-5 sm:px-6"
              : isEmbedded
                ? "h-[500px] p-4"
                : "h-[400px] p-4"
        )}
      >
        <div className={cn("space-y-4", isFullscreen && "mx-auto max-w-3xl", isSinglePage && "mx-auto max-w-[860px]")}>
          {messages.map((message) => (
            <m.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", message.type === "user" ? "justify-end" : "justify-start")}
            >
              <div
                  className={cn(
                    "flex max-w-[88%] items-start gap-2",
                    isFullscreen && "max-w-[84%]",
                    isSinglePage && "max-w-[90%]",
                    message.type === "user" && "flex-row-reverse"
                  )}
                >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    message.type === "user"
                      ? "bg-blue-700 text-white"
                      : "border border-blue-100 bg-blue-50 text-blue-600"
                  )}
                >
                  {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
                    isSinglePage && "shadow-none",
                    message.type === "user"
                      ? "rounded-br-md bg-blue-700 text-white"
                      : cn(
                          "rounded-bl-md border border-slate-200 bg-white text-slate-700",
                          isSinglePage && "border-transparent bg-transparent px-2"
                        )
                  )}
                >
                  <ChatMessageContent content={message.content} formatted={message.type === "bot"} />

                  {message.quickActions && message.quickActions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.quickActions.map((action, index) =>
                        action.href ? (
                          <Link key={`${action.label}-${index}`} href={action.href}>
                            <Button size="sm" variant="outline" className="h-7 rounded-lg text-xs">
                              {action.label}
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            key={`${action.label}-${index}`}
                            size="sm"
                            variant="outline"
                            className="h-7 rounded-lg text-xs"
                            onClick={() => handleQuickAction(action)}
                          >
                            {action.label}
                          </Button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </m.div>
          ))}

          {isTyping && (
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 [animation-delay:300ms]" />
                </div>
              </div>
            </m.div>
          )}
        </div>
      </ScrollArea>

      {!isSinglePage && messages.length <= 2 && (
        <div className={cn("border-t border-slate-100 px-4 py-3", isFullscreen && "bg-white/80 px-6")}>
          <div className="mx-auto flex max-w-3xl flex-wrap gap-2">
            {pageContext.suggestedQuestions.slice(0, 3).map((question) => (
              <Button
                key={question}
                variant="outline"
                size="sm"
                className="h-auto rounded-full border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                onClick={() => void sendMessage(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div
        className={cn(
          "border-t border-slate-100 bg-white p-4",
          isFullscreen && "px-4 py-4 sm:px-6",
          isSinglePage && "fixed bottom-0 left-0 right-0 z-40 border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur"
        )}
      >
        <div className={cn("mx-auto max-w-3xl", isSinglePage && "max-w-[860px] px-1 sm:px-0")}>
          <div
            className={cn(
              "flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-300 focus-within:bg-white",
              isSinglePage && "rounded-3xl bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
            )}
          >
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={pageContext.placeholder}
              className="h-11 flex-1 border-none bg-transparent px-3 shadow-none focus-visible:ring-0"
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="h-11 rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-700"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center type-meta font-medium text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            AI guidance only. Verify facts with a CA before filing.
          </p>
        </div>
      </div>
    </div>
  );

  if (isSinglePage) {
    return (
      <div className="flex h-full min-h-0 flex-col" data-testid="tax-chatbot-single-page">
        {hasUserMessages && (
          <div className="mx-auto flex w-full max-w-[860px] justify-end px-1 pb-2 sm:px-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 gap-2 rounded-full text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-950"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        )}
        {chatContent}
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-black text-slate-950">MyeCA Tax Assistant</h2>
              <p className="truncate text-xs font-semibold text-slate-500">{pageContext.subtitle}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-9 gap-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
        {chatContent}
      </div>
    );
  }

  if (isEmbedded) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="rounded-t-lg bg-blue-600 text-white">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Tax Assistant
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-white hover:bg-white/20">
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">{chatContent}</CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      {isFloating && (
        <m.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-20 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)]"
        >
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="bg-blue-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="rounded-lg bg-white/15 p-1.5">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold">Tax Assistant</h3>
                    <p className="truncate text-xs text-blue-100">{pageContext.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={handleReset}
                    title="Reset conversation"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  {onClose && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={onClose}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {!isMinimized && (
              <>
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 type-meta font-semibold text-slate-500">
                  {dailyTip}
                </div>
                {chatContent}
              </>
            )}
          </Card>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export function ChatbotTrigger({ onClick }: { onClick: () => void }) {
  return (
    <m.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-24 right-6 z-50 rounded-full bg-blue-600 p-4 text-white shadow-2xl transition-shadow hover:shadow-blue-200 md:bottom-8"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
    </m.button>
  );
}

export default TaxChatbot;
