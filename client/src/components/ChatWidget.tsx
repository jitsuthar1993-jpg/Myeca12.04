import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
// Simple auth check - replace with actual auth context if available
const useAuth = () => {
  const token = localStorage.getItem("auth_token");
  return { user: token ? { id: 1 } : null };
};
import { 
  MessageCircle, X, Send, Bot, User, 
  Loader2, HelpCircle, FileText, Calculator 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  message: string;
  type: "text" | "agent" | "system";
  sender: "user" | "agent";
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Load chat session when widget opens
  useEffect(() => {
    if (isOpen && user) {
      loadChatSession();
    }
  }, [isOpen, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatSession = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/chat/session");
      if (response.messages) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error("Failed to load chat session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage = {
      id: Date.now(),
      message: inputMessage,
      type: "text" as const,
      sender: "user" as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsSending(true);

    try {
      await apiRequest("/api/chat/message", {
        method: "POST",
        body: JSON.stringify({ message: inputMessage })
      });

      // Simulate receiving agent response after a delay
      setTimeout(async () => {
        const response = await apiRequest("/api/chat/history");
        if (response.messages) {
          setMessages(response.messages);
        }
      }, 1500);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const quickActions = [
    { icon: FileText, label: "ITR Filing", message: "I need help with ITR filing" },
    { icon: Calculator, label: "Tax Calculator", message: "How can I calculate my taxes?" },
    { icon: HelpCircle, label: "Documents", message: "What documents do I need?" }
  ];

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg bg-blue-600 hover:bg-blue-700"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="shadow-2xl">
              {/* Header */}
              <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Tax Assistant</h3>
                      <p className="text-xs text-blue-100">Online • Here to help</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea 
                ref={scrollAreaRef}
                className="h-96 p-4 bg-gray-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-3">
                        Hello! I'm your tax assistant. How can I help you today?
                      </p>
                      <div className="space-y-2">
                        {quickActions.map((action, index) => {
                          const Icon = action.icon;
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => {
                                setInputMessage(action.message);
                                sendMessage();
                              }}
                            >
                              <Icon className="h-4 w-4 mr-2" />
                              {action.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2",
                          msg.sender === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {msg.sender === "agent" && (
                          <div className="bg-blue-100 p-1.5 rounded-full h-8 w-8 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] p-3 rounded-lg",
                            msg.sender === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-white shadow-sm"
                          )}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={cn(
                            "text-xs mt-1",
                            msg.sender === "user" ? "text-blue-100" : "text-gray-400"
                          )}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {msg.sender === "user" && (
                          <div className="bg-gray-200 p-1.5 rounded-full h-8 w-8 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={!inputMessage.trim() || isSending}
                    size="icon"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
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