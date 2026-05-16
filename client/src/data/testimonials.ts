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
    name: "Salaried user, Mumbai",
    role: "ITR-2 (Dual Salaries)",
    content: "I had two Form 16s after switching jobs. The checklist made it clear what to upload and what the CA would review before filing.",
    rating: 5,
    avatar: "SU",
    verified: false,
  },
  {
    id: "2",
    name: "Investor user, Bengaluru",
    role: "Capital Gains Filing",
    content: "The capital gains workflow helped me organize broker reports, AIS details, and questions for review before I chose an assisted plan.",
    rating: 5,
    avatar: "IU",
    verified: false,
  },
  {
    id: "3",
    name: "NRI user",
    role: "NRI Tax Advisory",
    content: "The consultation request captured my NRI tax questions and gave me a clearer document list before speaking with an expert.",
    rating: 5,
    avatar: "NU",
    verified: false,
  },
  {
    id: "4",
    name: "First-time filer, Delhi",
    role: "First-time ITR-1",
    content: "The guided filing flow helped me understand the difference between self-service filing and optional CA review.",
    rating: 5,
    avatar: "FF",
    verified: false,
  },
  {
    id: "5",
    name: "Business-income user, Pune",
    role: "F&O & Business Audit",
    content: "The service scope made it easier to separate ordinary filing work from items that needed specialist review.",
    rating: 5,
    avatar: "BU",
    verified: false,
  },
];

export const companyTestimonials: Testimonial[] = [
  {
    id: "c1",
    name: "Company HR user",
    role: "HR Director",
    company: "Private technology company",
    content: "The dashboard-style filing view makes it easier to understand employee document readiness and follow-up items.",
    rating: 5,
    avatar: "HR",
    verified: false,
  },
  {
    id: "c2",
    name: "Finance team user",
    role: "Finance Head",
    company: "Private services company",
    content: "The service scope and document checklist helped our finance team plan the filing work before committing to a paid workflow.",
    rating: 5,
    avatar: "FT",
    verified: false,
  },
];
