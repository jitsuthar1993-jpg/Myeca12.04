// Expert Profiles for Consultation Booking

export interface Expert {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  experience: number; // years
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
    id: 'tax-review-team',
    name: 'Tax Review Team',
    title: 'Credential-checked tax professionals',
    specializations: ['Income Tax', 'Tax Planning', 'ITR Filing', 'Capital Gains'],
    experience: 15,
    languages: ['English', 'Hindi'],
    image: '/images/experts/rajesh.jpg',
    bio: 'Credential-checked professionals review income tax planning and compliance cases using the documents shared for the consultation.',
    qualifications: ['FCA', 'B.Com (Hons)', 'DISA'],
    consultationFee: 999,
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      slots: ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
    },
    featured: true,
  },
  {
    id: 'gst-startup-team',
    name: 'GST And Startup Team',
    title: 'Business compliance professionals',
    specializations: ['GST', 'Business Tax', 'Startup Advisory', 'Compliance'],
    experience: 12,
    languages: ['English', 'Hindi', 'Gujarati'],
    image: '/images/experts/priya.jpg',
    bio: 'Business compliance professionals help with GST, startup taxation, and compliance questions based on your business profile.',
    qualifications: ['ACA', 'B.Com', 'CS (Executive)'],
    consultationFee: 1199,
    availability: {
      days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'],
    },
    featured: true,
  },
  {
    id: 'nri-tax-team',
    name: 'NRI Tax Team',
    title: 'NRI and international tax professionals',
    specializations: ['NRI Taxation', 'International Tax', 'FEMA', 'Transfer Pricing'],
    experience: 18,
    languages: ['English', 'Hindi'],
    image: '/images/experts/amit.jpg',
    bio: 'NRI tax professionals support India tax compliance and FEMA-related questions where specialist review is requested.',
    qualifications: ['FCA', 'MBA (Finance)', 'DISA'],
    consultationFee: 1499,
    availability: {
      days: ['Tuesday', 'Thursday', 'Saturday'],
      slots: ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'], // Evening slots for NRIs
    },
    featured: true,
  },
  {
    id: 'salary-tax-team',
    name: 'Salary Tax Team',
    title: 'Salary tax review professionals',
    specializations: ['Salary Tax', 'HRA Claims', 'Investment Planning', '80C Deductions'],
    experience: 8,
    languages: ['English', 'Hindi', 'Marathi'],
    image: '/images/experts/sneha.jpg',
    bio: 'Salary tax professionals help review HRA, deductions, Form 16, and investment proofs for eligible claims.',
    qualifications: ['ACA', 'B.Com (Hons)'],
    consultationFee: 799,
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      slots: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
    },
    featured: false,
  },
  {
    id: 'notice-response-team',
    name: 'Notice Response Team',
    title: 'Tax notice review professionals',
    specializations: ['Tax Notices', 'Assessments', 'Appeals', 'Scrutiny'],
    experience: 20,
    languages: ['English', 'Hindi', 'Punjabi'],
    image: '/images/experts/vikram.jpg',
    bio: 'Tax notice professionals help review notice sections, deadlines, documents, and draft response positions.',
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
