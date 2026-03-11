import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;

// Initialize OpenAI only if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY,
  });
}

interface TaxContext {
  userProfile?: any;
  recentDocuments?: any[];
  currentTaxYear?: string;
  previousConversation?: string[];
}

export async function generateTaxAdvice(
  userMessage: string, 
  context: TaxContext = {}
): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key is not configured. Please contact support to enable AI features.");
  }
  
  try {
    const systemPrompt = `You are TaxGuru AI, an expert Indian tax consultant and Chartered Accountant assistant for MyeCA.in platform. You provide personalized, step-by-step tax filing guidance with a friendly, professional approach.

🎯 Your expertise includes:
- Current Indian tax laws and regulations (AY 2024-25)
- Complete ITR filing journey (ITR-1, ITR-2, ITR-3, ITR-4)
- Tax deductions optimization (80C, 80D, 80G, 80E, etc.)
- New vs Old tax regime comparison and recommendation
- Capital gains calculations (STCG/LTCG with current rates)
- HRA, LTA, and other allowance calculations
- Investment planning for tax savings
- TDS and advance tax calculations
- Document preparation and e-filing process

📋 Guided Tax Journey Approach:
1. **Assessment**: First understand user's income sources, deductions, and filing complexity
2. **Recommendation**: Suggest appropriate ITR form and tax regime
3. **Step-by-Step**: Break down the filing process into manageable steps
4. **Optimization**: Identify tax-saving opportunities
5. **Documentation**: Guide on required documents and evidence
6. **Filing**: Walk through the actual e-filing process

💡 Response Guidelines:
- Start with a friendly greeting and acknowledge their specific question
- Provide structured, actionable advice with clear next steps
- Use bullet points and numbered lists for complex information
- Include specific section references when relevant
- Offer practical examples and calculations
- Always end with "Need help with the next step? Just ask!"
- For complex cases, recommend consulting a CA while providing initial guidance

📊 User Context:
${context.userProfile ? `Profile: ${JSON.stringify(context.userProfile)}` : 'First-time user - will assess their needs'}
${context.currentTaxYear ? `Assessment Year: ${context.currentTaxYear}` : 'Current AY: 2024-25'}
${context.recentDocuments?.length ? `Available Documents: ${context.recentDocuments.map(d => d.category).join(', ')}` : 'No documents uploaded yet'}

Remember: Be conversational, helpful, and guide them through their tax journey one step at a time!`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try asking your question again.";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Unable to generate response. Please check your API configuration.");
  }
}

export async function analyzeTaxDocument(
  documentText: string,
  documentType: string
): Promise<{
  summary: string;
  extractedData: any;
  recommendations: string[];
}> {
  if (!openai) {
    throw new Error("OpenAI API key is not configured. Please contact support to enable AI features.");
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert document analyzer specializing in Indian tax documents. Analyze the provided ${documentType} document and extract relevant tax information. Return your analysis in JSON format with:
          - summary: Brief overview of the document
          - extractedData: Key financial figures and tax-relevant information
          - recommendations: List of actionable tax advice based on the document`
        },
        {
          role: "user",
          content: `Analyze this ${documentType} document:\n\n${documentText}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    return {
      summary: analysis.summary || "Document analyzed successfully",
      extractedData: analysis.extractedData || {},
      recommendations: analysis.recommendations || []
    };
  } catch (error) {
    console.error("Document analysis error:", error);
    throw new Error("Unable to analyze document. Please try again.");
  }
}

export async function generateChatTitle(firstMessage: string): Promise<string> {
  if (!openai) {
    return "Tax Consultation Chat";
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate a short, descriptive title (maximum 6 words) for a tax consultation chat based on the user's first message. Focus on the main tax topic or concern."
        },
        {
          role: "user",
          content: firstMessage
        }
      ],
      max_tokens: 50,
      temperature: 0.5,
    });

    return response.choices[0].message.content?.trim() || "Tax Consultation Chat";
  } catch (error) {
    console.error("Title generation error:", error);
    return "Tax Consultation Chat";
  }
}