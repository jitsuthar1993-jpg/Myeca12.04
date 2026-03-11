import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  User, 
  MessageCircle, 
  Plus,
  Clock,
  Sparkles,
  FileText,
  Calculator,
  TrendingUp,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import type { ChatSession, ChatMessage } from "@shared/schema";

interface ChatResponse {
  sessionId: number;
  response: string;
  title: string;
}

const quickQuestions = [
  {
    icon: Calculator,
    text: "How much tax will I pay this year?",
    category: "Tax Calculation"
  },
  {
    icon: FileText,
    text: "What documents do I need for ITR filing?",
    category: "Documentation"
  },
  {
    icon: TrendingUp,
    text: "How can I save more tax legally?",
    category: "Tax Planning"
  },
  {
    icon: Shield,
    text: "Should I choose old or new tax regime?",
    category: "Tax Regime"
  }
];

export default function AIAssistantPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch chat sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ["chat", "sessions"],
    queryFn: async () => {
      const response = await apiRequest("/api/chat/sessions");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch messages for current session
  const { data: messages = [] } = useQuery({
    queryKey: ["chat", "messages", currentSessionId],
    queryFn: async () => {
      const response = await apiRequest(`/api/chat/sessions/${currentSessionId}/messages`);
      return response.json();
    },
    enabled: !!currentSessionId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; sessionId?: number }) => {
      const response = await apiRequest("/api/chat/ask", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.sessionId);
      queryClient.invalidateQueries({ queryKey: ["chat", "sessions"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", data.sessionId] });
      setMessage("");
      setIsTyping(false);
    },
    onError: (error: any) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    setIsTyping(true);
    sendMessageMutation.mutate({
      message: messageText,
      sessionId: currentSessionId || undefined,
    });
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
    handleSendMessage(question);
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessage("");
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Bot className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <CardTitle>AI Tax Assistant</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in to access the AI Tax Assistant and get personalized tax guidance.
            </p>
            <Button asChild className="w-full">
              <a href="/auth/login">Login to Continue</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-2rem)]">
          
          {/* Chat Sessions Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">AI Assistant</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={startNewChat}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {sessions.map((session: ChatSession) => (
                      <motion.div
                        key={session.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={currentSessionId === session.id ? "default" : "ghost"}
                          className="w-full justify-start text-left p-3 h-auto"
                          onClick={() => setCurrentSessionId(session.id)}
                        >
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4" />
                              <span className="font-medium text-sm truncate max-w-40">
                                {session.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {format(new Date(session.updatedAt), "MMM d, HH:mm")}
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                    
                    {sessions.length === 0 && (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No chat sessions yet.</p>
                        <p className="text-xs">Start a conversation to get tax advice!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="col-span-12 lg:col-span-9">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Tax Assistant</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get instant answers to your tax questions
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col pt-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 mb-4 pr-4">
                  <div className="space-y-4">
                    {messages.length === 0 && !currentSessionId && (
                      <div className="text-center py-12">
                        <Bot className="w-16 h-16 text-blue-600 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold mb-4">Welcome to AI Tax Assistant</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                          Ask me anything about Indian income tax, ITR filing, deductions, or tax planning. 
                          I'm here to help you navigate complex tax situations.
                        </p>
                        
                        {/* Quick Questions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                          {quickQuestions.map((question, index) => (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="outline"
                                className="w-full p-4 h-auto text-left"
                                onClick={() => handleQuickQuestion(question.text)}
                                disabled={sendMessageMutation.isPending}
                              >
                                <div className="flex items-start gap-3">
                                  <question.icon className="w-5 h-5 text-blue-600 mt-1" />
                                  <div>
                                    <p className="font-medium text-sm">{question.text}</p>
                                    <Badge variant="secondary" className="mt-2 text-xs">
                                      {question.category}
                                    </Badge>
                                  </div>
                                </div>
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    <AnimatePresence>
                      {messages.map((msg: ChatMessage) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                          
                          <div
                            className={`max-w-[80%] p-4 rounded-lg ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white ml-auto'
                                : 'bg-white dark:bg-gray-800 border shadow-sm'
                            }`}
                          >
                            <div className="prose prose-sm max-w-none">
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            <div className="text-xs mt-2 opacity-70">
                              {format(new Date(msg.createdAt), "MMM d, HH:mm")}
                            </div>
                          </div>
                          
                          {msg.role === 'user' && (
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 border p-4 rounded-lg shadow-sm">
                          <div className="flex items-center gap-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span className="text-sm text-gray-500 ml-2">Thinking...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me about tax deductions, ITR filing, or any tax question..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !sendMessageMutation.isPending) {
                        handleSendMessage(message);
                      }
                    }}
                    disabled={sendMessageMutation.isPending}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleSendMessage(message)}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}