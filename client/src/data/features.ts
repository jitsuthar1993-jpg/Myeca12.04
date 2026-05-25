export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const features: Feature[] = [
  {
    id: "security",
    title: "Secure Workflows",
    description: "Sensitive tax documents are handled through authenticated workflows, private storage, and scoped access controls.",
    icon: "Shield",
    color: "blue"
  },
  {
    id: "ai-assistant",
    title: "AI Tax Assistant",
    description: "Get quick answers to common tax questions and review important cases with an expert before filing.",
    icon: "Bot",
    color: "green"
  },
  {
    id: "support",
    title: "Expert Support",
    description: "Get guidance from credential-checked tax professionals where your selected workflow includes expert review.",
    icon: "UserCheck",
    color: "yellow"
  },
  {
    id: "speed",
    title: "Quick Filing",
    description: "Start your ITR with a structured workflow, document checklist, and review steps before submission.",
    icon: "Clock",
    color: "purple"
  },
  {
    id: "mobile",
    title: "Mobile Friendly",
    description: "Use the filing workflow on mobile or desktop with responsive screens for common tasks.",
    icon: "Smartphone",
    color: "red"
  },
  {
    id: "tracking",
    title: "Guided Status Tracking",
    description: "Use guided trackers and case updates to understand the next step; confirm final refund status on the official portal.",
    icon: "TrendingUp",
    color: "indigo"
  }
];
