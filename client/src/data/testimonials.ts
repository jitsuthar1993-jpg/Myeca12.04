export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  avatar: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Arjun Mehta",
    role: "Senior Developer, Wipro",
    content: "Switched jobs twice this year and had two Form 16s. MyeCA's CA handled both automatically — I didn't upload a single document. Got my refund in 9 days.",
    rating: 5,
    avatar: "AM"
  },
  {
    id: "2",
    name: "Priya Krishnan",
    role: "Crypto & Stock Trader",
    content: "My Zerodha P&L was auto-imported and the CA calculated my capital gains to the rupee. Saved \u20B922,000 compared to filing alone. Genuinely impressed.",
    rating: 5,
    avatar: "PK"
  },
  {
    id: "3",
    name: "Rajesh Iyer",
    role: "NRI based in Dubai",
    content: "Filed my Indian return sitting in Dubai. The CA called me on WhatsApp to clarify my DTAA claim. Never expected this level of personal attention from an online platform.",
    rating: 5,
    avatar: "RI"
  },
  {
    id: "4",
    name: "Sneha Agarwal",
    role: "First-time ITR Filer",
    content: "I was scared of filing taxes. MyeCA walked me through everything — the AI assistant answered all my questions, and the CA filed it in under a day. Got \u20B911,200 refund!",
    rating: 5,
    avatar: "SA"
  },
  {
    id: "5",
    name: "Vikram Gupta",
    role: "F&O Trader, Pune",
    content: "F&O filing is complicated and most CAs charge a fortune. MyeCA's team understood my speculative losses immediately and filed everything correctly. Highly recommend.",
    rating: 5,
    avatar: "VG"
  }
];

export const companyTestimonials: Testimonial[] = [
  {
    id: "c1",
    name: "Meera Singh",
    role: "HR Director",
    company: "TechCorp",
    content: "Our HR team loves how easy it is to track employee tax filings. The bulk upload feature saves us hours every filing season.",
    rating: 5,
    avatar: "MS"
  },
  {
    id: "c2",
    name: "Rajesh Jain",
    role: "Finance Head",
    company: "InnovateLabs",
    content: "MyeCA.in's corporate dashboard gives us complete visibility into our employees' filing status. Excellent tool for payroll planning.",
    rating: 5,
    avatar: "RJ"
  }
];
