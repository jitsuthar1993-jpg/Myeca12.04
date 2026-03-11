import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
  timestamp: Date;
}

const predefinedResponses: Record<string, string> = {
  "hello": "Hello! Welcome to MyeCA.in. How can I help you with your tax filing today?",
  "hi": "Hi there! I'm here to help with your tax queries. What would you like to know?",
  "itr": "I can help you file your ITR! We offer expert CA assistance starting at \u20B91,499. Would you like to know more about our ITR filing services?",
  "price": "Our ITR filing starts at \u20B91,499 with CA expert assistance. We also have a FREE DIY option. Which one interests you?",
  "refund": "Tax refunds typically process within 30-45 days after ITR verification. We help maximize your refund through expert deduction planning!",
  "documents": "For ITR filing, you'll need: Form 16/16A, bank statements, investment proofs, and PAN card. Need a detailed checklist?",
  "deadline": "The ITR filing deadline for AY 2025-26 is July 31, 2025. Don't wait - file early to avoid penalties!",
  "help": "I can help with: ITR filing, tax calculations, document requirements, deadlines, and our services. What do you need?",
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      text: "Hello! I'm your MyeCA tax assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { announceMessage, trapFocus, releaseFocusTrap } = useAccessibility();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      trapFocus(".chat-widget-container");
    } else {
      releaseFocusTrap();
    }
    
    return () => releaseFocusTrap();
  }, [isOpen, trapFocus, releaseFocusTrap]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    announceMessage("Message sent", "polite");

    // Simulate bot response
    setTimeout(() => {
      const lowerInput = inputValue.toLowerCase();
      let botResponse = "I'm not sure about that. Could you please rephrase or ask about ITR filing, pricing, documents, or deadlines?";
      
      // Check for keywords
      for (const [keyword, response] of Object.entries(predefinedResponses)) {
        if (lowerInput.includes(keyword)) {
          botResponse = response;
          break;
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      announceMessage("New message from assistant", "polite");
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <>
      {/* Chat button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <Button
              onClick={() => {
                setIsOpen(true);
                announceMessage("Chat opened", "polite");
              }}
              className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
              aria-label="Open chat support"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 chat-widget-container"
          >
            <Card className="w-[380px] h-[600px] flex flex-col shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">MyeCA Tax Assistant</h3>
                    <p className="text-sm text-blue-100">Online - Here to help!</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsOpen(false);
                    announceMessage("Chat closed", "polite");
                  }}
                  className="text-white hover:bg-white/20"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${
                        message.type === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.type === "bot" && (
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.type === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.type === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                      {message.type === "user" && (
                        <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Quick actions */}
              <div className="p-3 border-t bg-gray-50">
                <div className="flex gap-2 flex-wrap">
                  {["File ITR", "Check Pricing", "Documents Needed", "Deadline"].map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputValue(action);
                        handleSendMessage();
                      }}
                      className="text-xs"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    aria-label="Chat message input"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputValue.trim() || isTyping}
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}