import {
  Calculator,
  FileText,
  Building2,
  Shield,
  Award,
  Users,
  Zap,
  Rocket,
  User,
  Search,
  CheckCircle2,
  Clock,
  Building,
  AlertTriangle
} from 'lucide-react';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  originalPrice?: string;
  tat: string;
  features: string[];
  popular?: boolean;
  urgent?: boolean;
  rating?: number;
  reviews?: number;
  documents: string[];
  color?: 'blue' | 'emerald' | 'violet' | 'amber' | 'cyan' | 'rose' | 'orange' | 'teal' | 'purple' | 'red';
  hasDetailedPage?: boolean;
  detailedPagePath?: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  icon: any;
  description: string;
  color: string;
  textColor: string;
  bgColor: string;
  services: Service[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'individual',
    title: 'Individual Services',
    icon: User,
    description: 'Personal tax and compliance solutions',
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    services: [
      {
        id: 'itr-filing',
        title: 'Income Tax Return',
        category: 'Individual',
        description: 'Expert filing for salaried, professional, and business income.',
        price: '₹999 excluding GST',
        tat: 'Business-hours review',
        features: ['Precision Review', 'Tax Optimization', 'Business-hours Expert Support'],
        popular: true,
        color: 'blue',
        documents: [
          'Form 16 from Employer',
          'Form 26AS (Tax Credit Statement)',
          'Bank Statements (All accounts)',
          'Interest Certificates',
          'Investment Proofs (80C, 80D)',
          'Aadhaar Card'
        ]
      }
    ]
  },
  {
    id: 'business',
    title: 'Business Setup',
    icon: Building2,
    description: 'Launch and register your business',
    color: 'from-emerald-500 to-emerald-600',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    services: [
      {
        id: 'gst-reg',
        title: 'GST Registration',
        category: 'Business',
        description: 'Get your GSTIN quickly with complete documentation.',
        price: '₹1,499 excluding GST',
        tat: '3-5 Days',
        features: ['ARN Generation', 'Certificate Download', 'Expert Consulting'],
        popular: true,
        color: 'emerald',
        documents: [
          'PAN Card of Business/Proprietor',
          'Aadhaar Card of Proprietor',
          'Business Registration Certificate',
          'Rent Agreement/Property Documents',
          'Electricity Bill of Premises'
        ]
      },
      {
        id: 'msme-reg',
        title: 'MSME Registration',
        category: 'Business',
        description: 'Prepare Udyam registration details and preserve the issued MSME record for later applications.',
        price: '₹499 excluding GST',
        tat: 'Business-hours review',
        features: ['Portal Certificate', 'Benefit Guidance', 'Priority Lending Documents'],
        color: 'cyan',
        documents: [
          'Aadhaar Card of Proprietor',
          'PAN Card of Business',
          'Bank Account Details (IFSC/Account No)',
          'Investment in Plant/Machinery Details'
        ]
      }
    ]
  },
  {
    id: 'tax-compliance',
    title: 'Tax & Compliance',
    icon: FileText,
    description: 'Ongoing tax filings and audit support',
    color: 'from-amber-500 to-amber-600',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    services: [
      {
        id: 'tds-filing',
        title: 'TDS Return Filing',
        category: 'Tax & Compliance',
        description: 'Quarterly compliance for salary and non-salary payments.',
        price: '₹1,999 excluding GST',
        tat: '1-2 business days',
        features: ['FVU Generation', '24Q/26Q Support', 'Validation Checks'],
        color: 'amber',
        documents: [
          'TDS Deduction Details',
          'Challan Payment Proofs',
          'Employee/Vendor Master Data',
          'Previous Quarterly Acknowledgement'
        ]
      }
    ]
  },
  {
    id: 'startup',
    title: 'Startup Hub',
    icon: Rocket,
    description: 'Company incorporation and brand protection',
    color: 'from-violet-500 to-violet-600',
    textColor: 'text-violet-600',
    bgColor: 'bg-violet-50',
    services: [
      {
        id: 'company-incorp',
        title: 'Company Incorporation',
        category: 'Startup',
        description: 'Incorporation support for a Private Limited Company, LLP, or One Person Company, with entity-specific document and filing checks.',
        price: '₹5,999 excluding GST',
        tat: '15-20 Days',
        features: ['DIN & DSC Included', 'MOA/AOA Drafting', 'PAN/TAN Support'],
        popular: true,
        color: 'violet',
        documents: [
          'PAN Card of All Directors',
          'Aadhaar Card of All Directors',
          'Voter ID/Passport/DL of Directors',
          'Proof of Registered Office Address',
          'Electricity Bill/NOC from Owner'
        ]
      },
      {
        id: 'trademark-reg',
        title: 'Trademark Filing',
        category: 'Startup',
        description: 'Protect your brand name, logo, and identity legally.',
        price: '₹2,499 excluding GST',
        tat: '12-18 Months',
        features: ['Brand Protection', 'Search Report', 'Expert Drafting'],
        color: 'rose',
        documents: [
          'Trademark Logo (JPEG/PNG)',
          'ID Proof of Applicant',
          'Business Registration Certificate',
          'Power of Attorney (Drafted by us)'
        ]
      }
    ]
  }
];

export const allServices = serviceCategories.flatMap(cat => cat.services);

export const getServiceById = (id: string) => allServices.find(s => s.id === id);
