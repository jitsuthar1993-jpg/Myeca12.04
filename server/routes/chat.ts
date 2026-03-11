import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Message schema
const messageSchema = z.object({
  userId: z.number(),
  message: z.string().min(1).max(1000),
  type: z.enum(["text", "system", "agent"]).default("text"),
  metadata: z.record(z.any()).optional()
});

// Mock chat sessions storage
const chatSessions = new Map<number, any[]>();
const activeSessions = new Map<number, any>();

// Get or create chat session
router.get("/session", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  if (!activeSessions.has(userId)) {
    activeSessions.set(userId, {
      id: `session_${userId}_${Date.now()}`,
      userId,
      status: "active",
      createdAt: new Date(),
      agent: null
    });
  }
  
  const session = activeSessions.get(userId);
  const messages = chatSessions.get(userId) || [];
  
  res.json({
    success: true,
    session,
    messages
  });
});

// Send message
router.post("/message", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    // Get or create message history
    if (!chatSessions.has(userId)) {
      chatSessions.set(userId, []);
    }
    
    const messages = chatSessions.get(userId)!;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      userId,
      message,
      type: "text",
      timestamp: new Date(),
      sender: "user"
    };
    
    messages.push(userMessage);
    
    // Simulate agent response after a delay
    setTimeout(() => {
      const agentResponse = generateAgentResponse(message);
      messages.push({
        id: messages.length + 1,
        userId,
        message: agentResponse,
        type: "agent",
        timestamp: new Date(),
        sender: "agent"
      });
    }, 1000);
    
    res.json({
      success: true,
      message: userMessage
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get chat history
router.get("/history", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const messages = chatSessions.get(userId) || [];
  
  res.json({
    success: true,
    messages,
    total: messages.length
  });
});

// End chat session
router.post("/end", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  if (activeSessions.has(userId)) {
    const session = activeSessions.get(userId);
    session.status = "ended";
    session.endedAt = new Date();
  }
  
  res.json({
    success: true,
    message: "Chat session ended"
  });
});

// Generate automated responses
function generateAgentResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("itr") || lowerMessage.includes("income tax return")) {
    return "I can help you with ITR filing! We offer expert CA-assisted filing starting at ₹1,499. Our CAs ensure maximum refunds and handle all complexities. Would you like to start filing your ITR?";
  }
  
  if (lowerMessage.includes("refund")) {
    return "Tax refunds typically take 4-8 weeks after e-verification. We help track your refund status and ensure all deductions are claimed for maximum refunds. Our success rate is 99.8%!";
  }
  
  if (lowerMessage.includes("deadline")) {
    return "The ITR filing deadline for AY 2025-26 is July 31, 2025. Don't wait until the last minute! We can help you file quickly and accurately with our expert CA team.";
  }
  
  if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
    return "Our ITR filing services start at ₹1,499 for CA-assisted filing. This includes expert review, maximum refund optimization, and e-filing support. We also offer self-filing options starting at ₹299.";
  }
  
  if (lowerMessage.includes("documents")) {
    return "For ITR filing, you'll need: Form 16 (from employer), bank statements, investment proofs, home loan statements (if applicable), and PAN/Aadhaar. Our platform guides you through uploading each document.";
  }
  
  if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
    return "I'm here to help! You can ask me about ITR filing, tax calculations, document requirements, deadlines, or any tax-related queries. For complex issues, our CA experts are available for consultation.";
  }
  
  return "Thanks for your message! I can help you with ITR filing, tax planning, refund tracking, and more. What specific tax-related assistance do you need today?";
}

export default router;