// Video Tutorials Data for Educational Content

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "5:30"
  category: VideoCategory;
  tags: string[];
  thumbnail: string;
  videoUrl: string; // YouTube embed URL
  youtubeId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  views: number;
  likes: number;
  publishedDate: string;
  instructor: string;
  relatedVideos: string[]; // IDs of related videos
}

export type VideoCategory = 
  | 'itr-filing'
  | 'tax-saving'
  | 'calculators'
  | 'gst'
  | 'investments'
  | 'business'
  | 'compliance';

export const VIDEO_CATEGORIES: { id: VideoCategory; name: string; icon: string; color: string }[] = [
  { id: 'itr-filing', name: 'ITR Filing', icon: 'FileText', color: 'blue' },
  { id: 'tax-saving', name: 'Tax Saving', icon: 'PiggyBank', color: 'green' },
  { id: 'calculators', name: 'Calculator Guides', icon: 'Calculator', color: 'purple' },
  { id: 'gst', name: 'GST', icon: 'Receipt', color: 'orange' },
  { id: 'investments', name: 'Investments', icon: 'TrendingUp', color: 'emerald' },
  { id: 'business', name: 'Business & Startup', icon: 'Building2', color: 'indigo' },
  { id: 'compliance', name: 'Compliance', icon: 'Shield', color: 'red' },
];

export const VIDEO_TUTORIALS: VideoTutorial[] = [
  // ITR Filing Videos
  {
    id: 'itr-basics',
    title: 'ITR Filing for Beginners - Complete Guide 2024',
    description: 'Learn the basics of Income Tax Return filing in India. This comprehensive guide covers who needs to file, which ITR form to choose, and step-by-step filing process.',
    duration: '15:30',
    category: 'itr-filing',
    tags: ['ITR', 'beginners', 'tax filing', 'income tax'],
    thumbnail: '/images/tutorials/itr-basics.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'beginner',
    views: 125000,
    likes: 8500,
    publishedDate: '2024-04-15',
    instructor: 'CA Rajesh Kumar',
    relatedVideos: ['itr-form-selection', 'form16-upload'],
  },
  {
    id: 'itr-form-selection',
    title: 'How to Choose the Right ITR Form',
    description: 'Confused about ITR-1, ITR-2, ITR-3, or ITR-4? This video explains which form is right for your income sources - salary, business, capital gains, or multiple sources.',
    duration: '10:45',
    category: 'itr-filing',
    tags: ['ITR forms', 'ITR-1', 'ITR-2', 'ITR-3', 'form selection'],
    thumbnail: '/images/tutorials/itr-forms.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'beginner',
    views: 89000,
    likes: 6200,
    publishedDate: '2024-04-20',
    instructor: 'CA Priya Sharma',
    relatedVideos: ['itr-basics', 'salaried-itr'],
  },
  {
    id: 'salaried-itr',
    title: 'ITR Filing for Salaried Employees - Step by Step',
    description: 'Complete walkthrough of filing ITR-1 for salaried individuals. Learn how to fill salary details, claim deductions, and submit your return successfully.',
    duration: '20:15',
    category: 'itr-filing',
    tags: ['salaried', 'ITR-1', 'Form 16', 'salary income'],
    thumbnail: '/images/tutorials/salaried-itr.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'beginner',
    views: 156000,
    likes: 11200,
    publishedDate: '2024-05-01',
    instructor: 'CA Rajesh Kumar',
    relatedVideos: ['form16-upload', 'hra-claim'],
  },
  {
    id: 'form16-upload',
    title: 'How to Upload Form 16 and Auto-Fill ITR',
    description: 'Save time by uploading your Form 16 PDF. Learn how our OCR technology extracts data and auto-fills your ITR form accurately.',
    duration: '8:20',
    category: 'itr-filing',
    tags: ['Form 16', 'OCR', 'auto-fill', 'PDF upload'],
    thumbnail: '/images/tutorials/form16.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'beginner',
    views: 67000,
    likes: 4800,
    publishedDate: '2024-05-10',
    instructor: 'Tech Team',
    relatedVideos: ['salaried-itr', 'ais-verification'],
  },

  // Tax Saving Videos
  {
    id: 'tax-saving-80c',
    title: "Section 80C Deductions Explained - Save Up to \u20B946,800",
    description: "Complete guide to Section 80C deductions including PPF, ELSS, LIC, EPF, home loan principal, and more. Learn how to maximize your \u20B91.5 lakh limit.",
    duration: '18:45',
    category: 'tax-saving',
    tags: ['80C', 'deductions', 'tax saving', 'PPF', 'ELSS'],
    thumbnail: '/images/tutorials/80c.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'beginner',
    views: 234000,
    likes: 18500,
    publishedDate: '2024-03-15',
    instructor: 'CA Priya Sharma',
    relatedVideos: ['nps-benefits', 'health-insurance-80d'],
  },
  {
    id: 'nps-benefits',
    title: "NPS Tax Benefits - Extra \u20B950,000 Deduction Under 80CCD(1B)",
    description: 'Discover the exclusive tax benefits of National Pension System. Learn about 80CCD(1), 80CCD(1B), and 80CCD(2) deductions.',
    duration: '14:30',
    category: 'tax-saving',
    tags: ['NPS', '80CCD', 'pension', 'retirement', 'tax saving'],
    thumbnail: '/images/tutorials/nps.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'intermediate',
    views: 98000,
    likes: 7600,
    publishedDate: '2024-03-20',
    instructor: 'CA Rajesh Kumar',
    relatedVideos: ['tax-saving-80c', 'retirement-planning'],
  },
  {
    id: 'health-insurance-80d',
    title: 'Section 80D - Health Insurance Tax Benefits',
    description: 'Learn how to claim deductions for health insurance premiums under Section 80D. Covers self, family, and senior citizen benefits.',
    duration: '12:15',
    category: 'tax-saving',
    tags: ['80D', 'health insurance', 'mediclaim', 'deductions'],
    thumbnail: '/images/tutorials/80d.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'beginner',
    views: 76000,
    likes: 5400,
    publishedDate: '2024-03-25',
    instructor: 'CA Priya Sharma',
    relatedVideos: ['tax-saving-80c', 'home-loan-tax'],
  },
  {
    id: 'hra-claim',
    title: 'HRA Exemption - Calculate and Claim Correctly',
    description: 'Understand HRA exemption rules, calculation methods, and documentation required. Learn the difference between metro and non-metro rates.',
    duration: '11:00',
    category: 'tax-saving',
    tags: ['HRA', 'house rent', 'exemption', 'rent receipt'],
    thumbnail: '/images/tutorials/hra.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'beginner',
    views: 112000,
    likes: 8200,
    publishedDate: '2024-04-01',
    instructor: 'CA Rajesh Kumar',
    relatedVideos: ['salaried-itr', 'tax-saving-80c'],
  },

  // Calculator Guide Videos
  {
    id: 'income-tax-calc',
    title: 'How to Use Income Tax Calculator - Old vs New Regime',
    description: 'Step-by-step guide to using our income tax calculator. Compare old and new tax regimes and find which one saves you more tax.',
    duration: '9:30',
    category: 'calculators',
    tags: ['calculator', 'income tax', 'tax regime', 'comparison'],
    thumbnail: '/images/tutorials/calc-tax.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'beginner',
    views: 89000,
    likes: 6100,
    publishedDate: '2024-04-05',
    instructor: 'Tech Team',
    relatedVideos: ['regime-comparison', 'sip-calc-guide'],
  },
  {
    id: 'sip-calc-guide',
    title: 'SIP Calculator Tutorial - Plan Your Wealth Creation',
    description: 'Learn how to use the SIP calculator to plan your mutual fund investments. Understand compounding and wealth projection.',
    duration: '8:15',
    category: 'calculators',
    tags: ['SIP', 'calculator', 'mutual funds', 'investment'],
    thumbnail: '/images/tutorials/calc-sip.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'beginner',
    views: 67000,
    likes: 4900,
    publishedDate: '2024-04-10',
    instructor: 'Tech Team',
    relatedVideos: ['income-tax-calc', 'elss-comparison'],
  },

  // Investment Videos
  {
    id: 'elss-comparison',
    title: 'Best ELSS Funds 2024 - Tax Saving Mutual Funds Compared',
    description: 'Comprehensive comparison of top ELSS funds. Learn about returns, expense ratios, and how to choose the best tax-saving mutual fund.',
    duration: '16:45',
    category: 'investments',
    tags: ['ELSS', 'mutual funds', 'tax saving', 'comparison'],
    thumbnail: '/images/tutorials/elss.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'intermediate',
    views: 145000,
    likes: 11800,
    publishedDate: '2024-02-20',
    instructor: 'CA Priya Sharma',
    relatedVideos: ['tax-saving-80c', 'sip-calc-guide'],
  },
  {
    id: 'capital-gains-tax',
    title: 'Capital Gains Tax Explained - STCG vs LTCG',
    description: 'Understand the difference between short-term and long-term capital gains. Learn about tax rates for equity, property, and gold.',
    duration: '19:30',
    category: 'investments',
    tags: ['capital gains', 'STCG', 'LTCG', 'equity', 'property'],
    thumbnail: '/images/tutorials/capital-gains.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'intermediate',
    views: 178000,
    likes: 14200,
    publishedDate: '2024-02-25',
    instructor: 'CA Rajesh Kumar',
    relatedVideos: ['tax-loss-harvesting', 'portfolio-tax'],
  },
  {
    id: 'tax-loss-harvesting',
    title: 'Tax Loss Harvesting Strategy - Reduce Your Tax Bill',
    description: 'Learn how to strategically sell losing investments to offset capital gains and reduce your tax liability legally.',
    duration: '13:20',
    category: 'investments',
    tags: ['tax loss harvesting', 'capital gains', 'strategy'],
    thumbnail: '/images/tutorials/harvesting.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'advanced',
    views: 56000,
    likes: 4200,
    publishedDate: '2024-03-01',
    instructor: 'CA Priya Sharma',
    relatedVideos: ['capital-gains-tax', 'portfolio-tax'],
  },

  // GST Videos
  {
    id: 'gst-basics',
    title: 'GST for Beginners - Complete Overview',
    description: 'Understand the basics of Goods and Services Tax in India. Learn about CGST, SGST, IGST, and when you need GST registration.',
    duration: '17:00',
    category: 'gst',
    tags: ['GST', 'basics', 'registration', 'CGST', 'SGST'],
    thumbnail: '/images/tutorials/gst-basics.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'beginner',
    views: 234000,
    likes: 18900,
    publishedDate: '2024-01-15',
    instructor: 'CA Rajesh Kumar',
    relatedVideos: ['gst-registration', 'gst-returns'],
  },
  {
    id: 'gst-registration',
    title: 'GST Registration Process - Step by Step Guide',
    description: 'Complete walkthrough of GST registration on the GST portal. Learn about required documents, application process, and common mistakes to avoid.',
    duration: '14:30',
    category: 'gst',
    tags: ['GST registration', 'GST portal', 'documents'],
    thumbnail: '/images/tutorials/gst-reg.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'beginner',
    views: 189000,
    likes: 15400,
    publishedDate: '2024-01-20',
    instructor: 'CA Priya Sharma',
    relatedVideos: ['gst-basics', 'gst-returns'],
  },

  // Business Videos
  {
    id: 'startup-tax',
    title: 'Tax Planning for Startups - Complete Guide',
    description: 'Essential tax planning strategies for startups. Learn about Section 80-IAC benefits, angel tax exemption, and compliance requirements.',
    duration: '22:00',
    category: 'business',
    tags: ['startup', 'tax planning', '80-IAC', 'angel tax'],
    thumbnail: '/images/tutorials/startup-tax.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'advanced',
    views: 78000,
    likes: 6100,
    publishedDate: '2024-02-01',
    instructor: 'CA Rajesh Kumar',
    relatedVideos: ['company-registration', 'gst-basics'],
  },

  // Compliance Videos
  {
    id: 'advance-tax',
    title: 'Advance Tax - Due Dates, Calculation & Payment',
    description: 'Learn when and how to pay advance tax. Understand the quarterly schedule, calculation method, and penalties for non-compliance.',
    duration: '15:45',
    category: 'compliance',
    tags: ['advance tax', 'due dates', 'quarterly', 'payment'],
    thumbnail: '/images/tutorials/advance-tax.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'intermediate',
    views: 112000,
    likes: 8900,
    publishedDate: '2024-03-10',
    instructor: 'CA Priya Sharma',
    relatedVideos: ['income-tax-calc', 'tds-basics'],
  },
  {
    id: 'tds-basics',
    title: 'TDS Explained - Rates, Sections & Compliance',
    description: 'Comprehensive guide to Tax Deducted at Source. Learn about different TDS sections, rates, and filing requirements.',
    duration: '18:30',
    category: 'compliance',
    tags: ['TDS', 'sections', 'rates', 'compliance'],
    thumbnail: '/images/tutorials/tds.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    difficulty: 'intermediate',
    views: 167000,
    likes: 13200,
    publishedDate: '2024-03-05',
    instructor: 'CA Rajesh Kumar',
    relatedVideos: ['advance-tax', 'salaried-itr'],
  },
];

// Helper functions
export function getVideosByCategory(category: VideoCategory): VideoTutorial[] {
  return VIDEO_TUTORIALS.filter(v => v.category === category);
}

export function getPopularVideos(limit: number = 5): VideoTutorial[] {
  return [...VIDEO_TUTORIALS].sort((a, b) => b.views - a.views).slice(0, limit);
}

export function getRecentVideos(limit: number = 5): VideoTutorial[] {
  return [...VIDEO_TUTORIALS]
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, limit);
}

export function searchVideos(query: string): VideoTutorial[] {
  const lowerQuery = query.toLowerCase();
  return VIDEO_TUTORIALS.filter(v => 
    v.title.toLowerCase().includes(lowerQuery) ||
    v.description.toLowerCase().includes(lowerQuery) ||
    v.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getRelatedVideos(videoId: string): VideoTutorial[] {
  const video = VIDEO_TUTORIALS.find(v => v.id === videoId);
  if (!video) return [];
  return VIDEO_TUTORIALS.filter(v => video.relatedVideos.includes(v.id));
}

