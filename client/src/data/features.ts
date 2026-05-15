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
    description: "Get instant answers to tax queries and personalized guidance throughout your filing process with our intelligent AI assistant.",
    icon: "Bot",
    color: "green"
  },
  {
    id: "support",
    title: "Expert Support",
    description: "Get guidance from certified Chartered Accountants and tax experts throughout your filing process.",
    icon: "UserCheck",
    color: "yellow"
  },
  {
    id: "speed",
    title: "Quick Filing",
    description: "File your ITR in under 10 minutes with our streamlined process and auto-fill technology.",
    icon: "Clock",
    color: "purple"
  },
  {
    id: "mobile",
    title: "Mobile Friendly",
    description: "File taxes anywhere, anytime with our responsive design optimized for all devices.",
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
