export type ChatbotPageKind =
  | "assistant"
  | "blog-index"
  | "blog-article"
  | "calculator"
  | "service"
  | "default";

export interface ChatbotPageContext {
  kind: ChatbotPageKind;
  path: string;
  title: string;
  subtitle: string;
  greeting: string;
  placeholder: string;
  suggestedQuestions: string[];
}

function cleanPageTitle(value: string | undefined) {
  return (value ?? "")
    .replace(/\s*\|\s*MyeCA\.in.*$/i, "")
    .replace(/\s*\|\s*MyeCA.*$/i, "")
    .trim();
}

export function getChatbotPageContext(path: string, rawTitle?: string): ChatbotPageContext {
  const title = cleanPageTitle(rawTitle);

  if (path === "/tax-assistant") {
    return {
      kind: "assistant",
      path,
      title: "Tax Assistant",
      subtitle: "Workspace mode",
      greeting:
        "Welcome to the MyeCA Tax Assistant. Choose a workflow prompt or ask directly about ITR filing, tax planning, documents, notices, calculators, or CA review.",
      placeholder: "Ask a tax question or choose a workflow prompt...",
      suggestedQuestions: [
        "Compare old and new tax regime for my salary",
        "What documents do I need before ITR filing?",
        "Explain a tax notice in simple terms",
      ],
    };
  }

  if (path === "/blog") {
    return {
      kind: "blog-index",
      path,
      title: "Knowledge Hub",
      subtitle: "Finding the right tax guide",
      greeting:
        "Hi, I can help you choose the right MyeCA guide for ITR filing, GST, refunds, notices, capital gains, or tax planning. Tell me what you are trying to solve.",
      placeholder: "Ask which guide fits your tax question...",
      suggestedQuestions: [
        "Which guide should I read before filing ITR?",
        "Help me choose the right ITR form",
        "What should I prepare before filing?",
      ],
    };
  }

  if (path.startsWith("/blog/")) {
    const articleTitle = title || "this article";
    return {
      kind: "blog-article",
      path,
      title: articleTitle,
      subtitle: "Article-aware tax help",
      greeting: `I can help you use this guide: "${articleTitle}". Ask me to summarize it, explain the documents needed, or decide when a CA review is sensible.`,
      placeholder: "Ask about this article...",
      suggestedQuestions: [
        "Summarize this article",
        "Which documents do I need?",
        "When should I consult a CA?",
      ],
    };
  }

  if (path.startsWith("/calculators")) {
    return {
      kind: "calculator",
      path,
      title: title || "Tax calculator",
      subtitle: "Calculator guidance",
      greeting:
        "I can help you understand which calculator to use, what inputs matter, and how to interpret the result before filing or planning tax.",
      placeholder: "Ask about calculator inputs or results...",
      suggestedQuestions: [
        "Which calculator should I use?",
        "How do I compare old and new regime?",
        "What inputs should I keep ready?",
      ],
    };
  }

  if (path.startsWith("/services") || path.startsWith("/itr")) {
    return {
      kind: "service",
      path,
      title: title || "MyeCA service",
      subtitle: "Service guidance",
      greeting:
        "I can help you understand the service, documents required, next steps, and whether a self-help tool or assisted workflow fits the case.",
      placeholder: "Ask about service steps or documents...",
      suggestedQuestions: [
        "Which service is right for me?",
        "What documents are required?",
        "Can a CA review my case?",
      ],
    };
  }

  return {
    kind: "default",
    path,
    title: title || "MyeCA Tax Assistant",
    subtitle: "Ask me anything about taxes",
    greeting:
      "Hello, I'm your AI Tax Assistant. I can help with income tax calculations, ITR filing, tax regime comparison, deductions, refunds, and compliance questions.",
    placeholder: "Ask about taxes, deductions, ITR filing...",
    suggestedQuestions: [
      "Which tax regime is better for me?",
      "What are the ITR filing deadlines?",
      "How can I save tax under 80C?",
    ],
  };
}
