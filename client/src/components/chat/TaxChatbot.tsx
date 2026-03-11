import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Calculator,
  FileText,
  HelpCircle,
  X,
  Minimize2,
  Maximize2,
  Lightbulb,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { 
  ChatMessage, 
  generateResponse, 
  SUGGESTED_QUESTIONS,
  TAX_TIPS 
} from "@/lib/chatbot-responses";

interface TaxChatbotProps {
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
}

export function TaxChatbot({ isOpen = true, onClose, embedded = false }: TaxChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Send initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = generateResponse("hello");
      setMessages([{
        id: '0',
        type: 'bot',
        content: greeting.response,
        timestamp: new Date(),
        quickActions: greeting.quickActions,
      }]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const response = generateResponse(inputValue);
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: response.response,
      timestamp: new Date(),
      quickActions: response.quickActions,
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMessage]);
  };

  const handleReset = () => {
    setMessages([]);
    const greeting = generateResponse("hello");
    setMessages([{
      id: '0',
      type: 'bot',
      content: greeting.response,
      timestamp: new Date(),
      quickActions: greeting.quickActions,
    }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => handleSend(), 100);
  };

  const handleQuickAction = (action: { label: string; action: string; href?: string }) => {
    if (action.href) {
      // Navigation handled by Link
      return;
    }
    // Handle non-navigation actions
    setInputValue(action.label);
    setTimeout(() => handleSend(), 100);
  };

  // Random tip
  const randomTip = TAX_TIPS[Math.floor(Math.random() * TAX_TIPS.length)];

  if (!isOpen) return null;

  const chatContent = (
    <>
      {/* Messages Area */}
      <ScrollArea 
        ref={scrollAreaRef}
        className={`flex-1 p-4 ${embedded ? 'h-[500px]' : 'h-[400px]'}`}
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`p-2 rounded-full flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-[var(--color-primary-900)] text-white' 
                    : 'bg-gradient-accent text-white'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-[var(--color-primary-900)] text-white rounded-br-sm'
                    : 'bg-[var(--color-primary-100)] text-[var(--color-primary-900)] rounded-bl-sm'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  
                  {/* Quick Actions */}
                  {message.quickActions && message.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.quickActions.map((action, index) => (
                        action.href ? (
                          <Link key={index} href={action.href}>
                            <Button 
                              size="sm" 
                              variant={message.type === 'user' ? 'secondary' : 'outline'}
                              className="text-xs h-7"
                            >
                              {action.label}
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            key={index}
                            size="sm"
                            variant={message.type === 'user' ? 'secondary' : 'outline'}
                            className="text-xs h-7"
                            onClick={() => handleQuickAction(action)}
                          >
                            {action.label}
                          </Button>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="p-2 rounded-full bg-gradient-accent text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-[var(--color-primary-100)] rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[var(--color-primary-400)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[var(--color-primary-400)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[var(--color-primary-400)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Questions (show only if few messages) */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-[var(--color-primary-500)] mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.slice(0, 3).map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7 border-[var(--color-primary-200)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)]"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about taxes, deductions, ITR filing..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSend} 
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-accent shadow-sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[11px] text-[var(--color-primary-500)] mt-2 text-center bg-[var(--color-warning-50)] py-1 rounded-md border border-[var(--color-warning-200)]/50">
          ⚠️ AI for guidance only. Verify facts with a CA.
        </p>
      </div>
    </>
  );

  // Embedded mode (full page)
  if (embedded) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="bg-gradient-accent text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Tax Assistant
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-white hover:bg-white/20 h-8">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {chatContent}
        </CardContent>
      </Card>
    );
  }

  // Floating widget mode
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-20 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)]"
      >
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-accent text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Tax Assistant</h3>
                  <p className="text-xs text-purple-200">Ask me anything about taxes</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={handleReset}
                    title="Reset Conversation"
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

          {/* Content */}
          {!isMinimized && chatContent}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Floating chat button to trigger chatbot
export function ChatbotTrigger({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-24 right-6 z-50 p-4 bg-gradient-accent text-white rounded-full shadow-2xl hover:shadow-primary transition-shadow md:bottom-8"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
    </motion.button>
  );
}

export default TaxChatbot;

