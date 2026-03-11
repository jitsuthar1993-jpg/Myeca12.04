// Expert Profiles for Consultation Booking

export interface Expert {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  experience: number; // years
  rating: number;
  reviewCount: number;
  languages: string[];
  image: string;
  bio: string;
  qualifications: string[];
  consultationFee: number;
  availability: {
    days: string[];
    slots: string[];
  };
  featured: boolean;
}

export interface ConsultationType {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  icon: string;
}

export const CONSULTATION_TYPES: ConsultationType[] = [
  {
    id: 'quick-query',
    name: 'Quick Tax Query',
    description: 'Get answers to simple tax questions',
    duration: 15,
    price: 299,
    icon: 'MessageSquare',
  },
  {
    id: 'itr-review',
    name: 'ITR Review & Filing',
    description: 'Expert review and assistance with ITR filing',
    duration: 30,
    price: 999,
    icon: 'FileText',
  },
  {
    id: 'tax-planning',
    name: 'Tax Planning Session',
    description: 'Comprehensive tax planning and optimization',
    duration: 45,
    price: 1499,
    icon: 'TrendingUp',
  },
  {
    id: 'business-consultation',
    name: 'Business Tax Consultation',
    description: 'GST, TDS, and business compliance guidance',
    duration: 60,
    price: 2499,
    icon: 'Building2',
  },
  {
    id: 'notice-handling',
    name: 'Tax Notice Handling',
    description: 'Expert help with income tax notices',
    duration: 45,
    price: 1999,
    icon: 'AlertTriangle',
  },
];

export const EXPERTS: Expert[] = [
  {
    id: 'ca-rajesh-kumar',
    name: 'CA Rajesh Kumar',
    title: 'Chartered Accountant',
    specializations: ['Income Tax', 'Tax Planning', 'ITR Filing', 'Capital Gains'],
    experience: 15,
    rating: 4.9,
    reviewCount: 523,
    languages: ['English', 'Hindi'],
    image: '/images/experts/rajesh.jpg',
    bio: 'CA Rajesh Kumar is a seasoned tax professional with over 15 years of experience in income tax planning and compliance. He has helped over 5000+ clients optimize their taxes and has expertise in complex ITR filings including capital gains.',
    qualifications: ['FCA', 'B.Com (Hons)', 'DISA'],
    consultationFee: 999,
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      slots: ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
    },
    featured: true,
  },
  {
    id: 'ca-priya-sharma',
    name: 'CA Priya Sharma',
    title: 'Chartered Accountant',
    specializations: ['GST', 'Business Tax', 'Startup Advisory', 'Compliance'],
    experience: 12,
    rating: 4.8,
    reviewCount: 412,
    languages: ['English', 'Hindi', 'Gujarati'],
    image: '/images/experts/priya.jpg',
    bio: 'CA Priya Sharma specializes in GST compliance and startup taxation. She has advised numerous startups on tax-efficient structures and has deep expertise in business tax planning.',
    qualifications: ['ACA', 'B.Com', 'CS (Executive)'],
    consultationFee: 1199,
    availability: {
      days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'],
    },
    featured: true,
  },
  {
    id: 'ca-amit-jain',
    name: 'CA Amit Jain',
    title: 'Chartered Accountant',
    specializations: ['NRI Taxation', 'International Tax', 'FEMA', 'Transfer Pricing'],
    experience: 18,
    rating: 4.9,
    reviewCount: 287,
    languages: ['English', 'Hindi'],
    image: '/images/experts/amit.jpg',
    bio: 'CA Amit Jain is an expert in NRI taxation and international tax matters. He has helped hundreds of NRIs with their India tax compliance and FEMA regulations.',
    qualifications: ['FCA', 'MBA (Finance)', 'DISA'],
    consultationFee: 1499,
    availability: {
      days: ['Tuesday', 'Thursday', 'Saturday'],
      slots: ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'], // Evening slots for NRIs
    },
    featured: true,
  },
  {
    id: 'ca-sneha-patel',
    name: 'CA Sneha Patel',
    title: 'Chartered Accountant',
    specializations: ['Salary Tax', 'HRA Claims', 'Investment Planning', '80C Deductions'],
    experience: 8,
    rating: 4.7,
    reviewCount: 356,
    languages: ['English', 'Hindi', 'Marathi'],
    image: '/images/experts/sneha.jpg',
    bio: 'CA Sneha Patel focuses on salaried individuals and helps them maximize tax savings through smart investment planning and proper claim documentation.',
    qualifications: ['ACA', 'B.Com (Hons)'],
    consultationFee: 799,
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      slots: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
    },
    featured: false,
  },
  {
    id: 'ca-vikram-singh',
    name: 'CA Vikram Singh',
    title: 'Chartered Accountant',
    specializations: ['Tax Notices', 'Assessments', 'Appeals', 'Scrutiny'],
    experience: 20,
    rating: 4.9,
    reviewCount: 189,
    languages: ['English', 'Hindi', 'Punjabi'],
    image: '/images/experts/vikram.jpg',
    bio: 'CA Vikram Singh has 20 years of experience handling income tax notices, assessments, and appeals. He has successfully represented clients in numerous scrutiny cases.',
    qualifications: ['FCA', 'LLB', 'DISA'],
    consultationFee: 1999,
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      slots: ['10:00 AM', '11:00 AM', '3:00 PM', '4:00 PM'],
    },
    featured: false,
  },
];

// Helper functions
export function getFeaturedExperts(): Expert[] {
  return EXPERTS.filter(e => e.featured);
}

export function getExpertsBySpecialization(specialization: string): Expert[] {
  return EXPERTS.filter(e => 
    e.specializations.some(s => s.toLowerCase().includes(specialization.toLowerCase()))
  );
}

export function getExpertById(id: string): Expert | undefined {
  return EXPERTS.find(e => e.id === id);
}

export function getAvailableSlots(expertId: string, date: Date): string[] {
  const expert = getExpertById(expertId);
  if (!expert) return [];
  
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  if (!expert.availability.days.includes(dayName)) return [];
  
  return expert.availability.slots;
}

