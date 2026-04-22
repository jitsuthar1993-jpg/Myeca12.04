export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  avatar: string;
  verified?: boolean;
  platform?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Arjun M., Mumbai",
    role: "ITR-2 (Dual Salaries)",
    content: "Switched jobs twice this year and had two Form 16s. MyeCA's CA handled both automatically — I didn't upload a single document. Got my ₹42,000 refund in just 9 days.",
    rating: 5,
    avatar: "AM"
  },
  {
    id: "2",
    name: "Priya K., Bangalore",
    role: "Capital Gains Filing",
    content: "My Zerodha P&L was auto-imported and the CA calculated my capital gains to the rupee. Saved ₹22,000 on taxes compared to filing alone. Genuinely impressed.",
    rating: 5,
    avatar: "PK"
  },
  {
    id: "3",
    name: "Rajesh I., Dubai/Chennai",
    role: "NRI Tax Advisory",
    content: "Filed my Indian return sitting in Dubai. The CA called me on WhatsApp to clarify my DTAA claim. Never expected this level of personal attention. Saved ₹1.2L in overseas tax credits.",
    rating: 5,
    avatar: "RI"
  },
  {
    id: "4",
    name: "Sneha A., Delhi",
    role: "First-time ITR-1",
    content: "I was scared of filing taxes. MyeCA walked me through everything — the AI assistant answered all my questions, and the CA filed it in under a day. Got ₹11,200 refund!",
    rating: 5,
    avatar: "SA"
  },
  {
    id: "5",
    name: "Vikram G., Pune",
    role: "F&O & Business Audit",
    content: "F&O filing is complicated and most CAs charge a fortune. MyeCA's team understood my speculative losses immediately and filed everything correctly. Saved ₹35k in penalty fees.",
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
