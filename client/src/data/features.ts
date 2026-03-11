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
    title: "Bank-Level Security",
    description: "Your data is protected with 256-bit SSL encryption and secure cloud storage. We never store your banking credentials.",
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
    title: "Real-time Tracking",
    description: "Track your refund status in real-time and get notifications at every step of the process.",
    icon: "TrendingUp",
    color: "indigo"
  }
];
