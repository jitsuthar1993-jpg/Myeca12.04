import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
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
    return "I can help you with AY 2026-27 ITR filing. Packages start at ₹499 for simple filing guidance, with CA-assisted options from ₹999 depending on scope. Would you like to start the workflow?";
  }
  
  if (lowerMessage.includes("refund")) {
    return "Tax refunds typically depend on e-verification, CPC processing, and bank validation. We help review eligible deductions and track refund status, but final processing is controlled by the Income Tax Department.";
  }
  
  if (lowerMessage.includes("deadline")) {
    return "For AY 2026-27, use the due date notified for your taxpayer category. Common non-audit individual returns are usually due on July 31 unless the department extends the date.";
  }
  
  if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
    return "ITR packages start at ₹499 for simple workflows. CA-assisted filing starts at ₹999, while capital gains, NRI, business income, and notice-risk cases are priced separately.";
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
