// AI-powered features demonstration service
// This service provides demo data and functionality for advanced features

export const demoNotifications = [
  {
    id: 1,
    title: "Welcome to MyeCA.in!",
    message: "Your account has been created successfully. Start filing your taxes today!",
    type: "success" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    isRead: false,
  },
  {
    id: 2,
    title: "Tax Filing Deadline Approaching",
    message: "Don't forget to file your ITR by July 31st to avoid penalties.",
    type: "warning" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: false,
  },
  {
    id: 3,
    title: "New Feature: AI Tax Optimizer",
    message: "Try our new AI-powered tax optimization tool to maximize your refunds.",
    type: "info" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    actionUrl: "/advanced-features",
    actionLabel: "Learn More",
  },
  {
    id: 4,
    title: "Your tax return has been filed",
    message: "ITR for AY 2024-25 has been successfully filed. Acknowledgment number: 123456789012345",
    type: "success" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    isRead: true,
  },
  {
    id: 5,
    title: "Refund Status Update",
    message: "Your tax refund of ₹25,000 has been processed and will be credited within 5-7 days.",
    type: "info" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    isRead: false,
  },
];

export const advancedFeatureStats = {
  twoFactorAuth: {
    enabled: true,
    users: 15000,
    securityScore: 99.9,
  },
  emailService: {
    sent: 450000,
    templates: 15,
    deliveryRate: 98.5,
  },
  aiOptimizer: {
    usageCount: 25000,
    averageSavings: 45000,
    recommendations: 150000,
  },
  multiLanguage: {
    languages: 5,
    activeUsers: 75000,
    translationAccuracy: 99.2,
  },
  notifications: {
    sent: 1250000,
    readRate: 85,
    engagementRate: 72,
  },
};

export const performanceMetrics = {
  loadTime: {
    before: 2.2,
    after: 1.2,
    improvement: 45,
  },
  userReach: {
    before: 100000,
    after: 500000,
    multiplier: 5,
  },
  security: {
    before: 85,
    after: 99.9,
    features: ["2FA", "JWT", "Encryption", "CSRF"],
  },
  platformScore: {
    before: 6.2,
    after: 9.0,
    increase: 45,
  },
};

export function generateDemoOTP(): string {
  // Generate a random 6-digit OTP for demo purposes
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function simulateEmailSend(template: string, to: string): boolean {
  // Simulate email sending for demo
  console.log(`Simulating email send: ${template} to ${to}`);
  return Math.random() > 0.02; // 98% success rate
}

export function generateTaxSavingTips(income: number): string[] {
  const tips = [];
  
  if (income > 500000) {
    tips.push("Invest up to ₹1.5L in Section 80C (ELSS, PPF, etc.) to save ₹46,800");
  }
  
  if (income > 750000) {
    tips.push("Consider NPS investment for additional ₹50,000 deduction under 80CCD(1B)");
  }
  
  tips.push("Claim HRA exemption if you're paying rent");
  tips.push("Don't forget medical insurance premium deduction under Section 80D");
  
  if (income > 1000000) {
    tips.push("Optimize your tax regime choice - New vs Old based on your deductions");
  }
  
  return tips;
}