// Comprehensive Services Catalog for CA Platform

export interface Service {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: ServiceCategory;
  subCategory?: string;
  pricing: {
    type: 'fixed' | 'starting' | 'monthly' | 'yearly' | 'custom';
    amount: number;
    originalAmount?: number;
    unit?: string;
  };
  features: string[];
  deliverables: string[];
  timeline: string;
  documents: string[];
  popular?: boolean;
  badge?: string;
  icon: string;
}

export type ServiceCategory = 
  | 'individual'
  | 'business-registration'
  | 'tax-compliance'
  | 'gst-services'
  | 'startup'
  | 'legal'
  | 'accounting'
  | 'payroll';

export const SERVICE_CATEGORIES: { id: ServiceCategory; name: string; icon: string; description: string }[] = [
  { id: 'individual', name: 'Individual Tax Services', icon: 'User', description: 'ITR filing, tax planning, and advisory for individuals' },
  { id: 'business-registration', name: 'Business Registration', icon: 'Building2', description: 'Company, LLP, OPC, and partnership registration' },
  { id: 'tax-compliance', name: 'Tax Compliance', icon: 'FileText', description: 'TDS, advance tax, and income tax compliance' },
  { id: 'gst-services', name: 'GST Services', icon: 'Receipt', description: 'GST registration, returns, and compliance' },
  { id: 'startup', name: 'Startup Services', icon: 'Rocket', description: 'Startup India, funding docs, and ESOP management' },
  { id: 'legal', name: 'Legal & Secretarial', icon: 'Scale', description: 'Agreements, trademarks, and ROC compliance' },
  { id: 'accounting', name: 'Accounting & CFO', icon: 'Calculator', description: 'Bookkeeping, MIS reports, and virtual CFO' },
  { id: 'payroll', name: 'Payroll Services', icon: 'Users', description: 'Salary processing, PF, ESI compliance' },
];

export const SERVICES: Service[] = [
  // Individual Tax Services
  {
    id: 'itr-1-filing',
    name: 'ITR-1 Filing (Sahaj)',
    shortDescription: 'For salaried individuals with income up to \u20B950 lakhs',
    description: 'Complete ITR-1 filing service for salaried employees. Includes Form 16 analysis, deduction optimization, and e-verification assistance.',
    category: 'individual',
    subCategory: 'ITR Filing',
    pricing: { type: 'fixed', amount: 499, originalAmount: 999 },
    features: [
      'Form 16 analysis',
      'HRA & 80C optimization',
      'E-verification support',
      'Tax saving recommendations',
      'CA assisted filing'
    ],
    deliverables: ['ITR-V acknowledgment', 'Computation sheet', 'Tax summary report'],
    timeline: '24-48 hours',
    documents: ['Form 16', 'PAN Card', 'Aadhaar', 'Bank statements'],
    popular: true,
    badge: 'Most Popular',
    icon: 'FileText'
  },
  {
    id: 'itr-2-filing',
    name: 'ITR-2 Filing',
    shortDescription: 'For individuals with capital gains or multiple income sources',
    description: 'Expert ITR-2 filing for individuals with salary, capital gains, house property income, or foreign income.',
    category: 'individual',
    subCategory: 'ITR Filing',
    pricing: { type: 'fixed', amount: 1499, originalAmount: 2499 },
    features: [
      'Capital gains computation',
      'Multiple income sources',
      'Foreign income reporting',
      'Schedule FA compliance',
      'Tax loss harvesting advice'
    ],
    deliverables: ['ITR-V acknowledgment', 'Capital gains statement', 'Tax computation'],
    timeline: '2-3 business days',
    documents: ['Form 16', 'Capital gains statements', 'Property documents', 'Foreign income proofs'],
    popular: true,
    icon: 'TrendingUp'
  },
  {
    id: 'itr-3-filing',
    name: 'ITR-3 Filing',
    shortDescription: 'For business owners and professionals',
    description: 'Comprehensive ITR-3 filing for individuals with business or professional income, including presumptive taxation.',
    category: 'individual',
    subCategory: 'ITR Filing',
    pricing: { type: 'starting', amount: 2999 },
    features: [
      'Business income computation',
      'Presumptive taxation (44AD/44ADA)',
      'Expense optimization',
      'Advance tax planning',
      'Balance sheet preparation'
    ],
    deliverables: ['ITR-V acknowledgment', 'P&L statement', 'Balance sheet', 'Tax computation'],
    timeline: '3-5 business days',
    documents: ['Bank statements', 'Invoice records', 'Expense proofs', 'Previous ITRs'],
    icon: 'Briefcase'
  },
  {
    id: 'tax-planning',
    name: 'Tax Planning Consultation',
    shortDescription: 'Personalized tax saving strategy session',
    description: 'One-on-one consultation with a CA to create a personalized tax saving strategy based on your income and goals.',
    category: 'individual',
    subCategory: 'Advisory',
    pricing: { type: 'fixed', amount: 1999 },
    features: [
      '45-minute video call',
      'Current tax analysis',
      'Investment recommendations',
      'Regime comparison',
      'Written action plan'
    ],
    deliverables: ['Tax planning report', 'Investment checklist', 'Monthly action items'],
    timeline: 'Same day booking',
    documents: ['Recent salary slips', 'Current investments', 'Previous ITR'],
    icon: 'Lightbulb'
  },
  {
    id: 'nri-tax-filing',
    name: 'NRI Tax Filing',
    shortDescription: 'Complete India tax compliance for NRIs',
    description: 'Specialized tax filing service for NRIs covering Indian income, DTAA benefits, and FEMA compliance.',
    category: 'individual',
    subCategory: 'NRI Services',
    pricing: { type: 'starting', amount: 4999 },
    features: [
      'DTAA benefit analysis',
      'TDS refund assistance',
      'FEMA compliance check',
      'Foreign asset reporting',
      'Repatriation guidance'
    ],
    deliverables: ['ITR filing', 'DTAA certificate', 'Compliance report'],
    timeline: '5-7 business days',
    documents: ['Passport', 'Foreign income proofs', 'India income proofs', 'Bank statements'],
    icon: 'Globe'
  },

  // Business Registration
  {
    id: 'pvt-ltd-registration',
    name: 'Private Limited Company Registration',
    shortDescription: 'Complete Pvt Ltd company incorporation',
    description: 'End-to-end private limited company registration including name approval, DSC, DIN, MOA/AOA drafting, and incorporation certificate.',
    category: 'business-registration',
    pricing: { type: 'fixed', amount: 7999, originalAmount: 14999 },
    features: [
      'Name availability check',
      '2 DSC + 2 DIN',
      'MOA & AOA drafting',
      'PAN & TAN application',
      'Incorporation certificate',
      'First board resolution'
    ],
    deliverables: ['COI', 'MOA', 'AOA', 'PAN', 'TAN', 'DSC tokens'],
    timeline: '10-15 business days',
    documents: ['Directors PAN', 'Directors Aadhaar', 'Address proof', 'Passport photos'],
    popular: true,
    badge: 'Best Value',
    icon: 'Building'
  },
  {
    id: 'llp-registration',
    name: 'LLP Registration',
    shortDescription: 'Limited Liability Partnership registration',
    description: 'Complete LLP registration with DPIN, DSC, name approval, and LLP agreement drafting.',
    category: 'business-registration',
    pricing: { type: 'fixed', amount: 5999, originalAmount: 9999 },
    features: [
      '2 DPIN + 2 DSC',
      'Name reservation',
      'LLP Agreement drafting',
      'PAN & TAN application',
      'Incorporation certificate'
    ],
    deliverables: ['LLP Certificate', 'LLP Agreement', 'PAN', 'TAN'],
    timeline: '7-12 business days',
    documents: ['Partners PAN', 'Partners Aadhaar', 'Address proof'],
    icon: 'Users'
  },
  {
    id: 'opc-registration',
    name: 'One Person Company (OPC)',
    shortDescription: 'Single member company registration',
    description: 'OPC registration for solo entrepreneurs who want limited liability protection with single ownership.',
    category: 'business-registration',
    pricing: { type: 'fixed', amount: 6999 },
    features: [
      'DSC + DIN',
      'Name approval',
      'MOA & AOA drafting',
      'Nominee appointment',
      'PAN & TAN'
    ],
    deliverables: ['COI', 'MOA', 'AOA', 'PAN', 'TAN'],
    timeline: '10-15 business days',
    documents: ['Director PAN', 'Nominee PAN', 'Address proofs'],
    icon: 'User'
  },

  // GST Services
  {
    id: 'gst-registration',
    name: 'GST Registration',
    shortDescription: 'New GSTIN registration for your business',
    description: 'Complete GST registration assistance including documentation, application filing, and GSTIN activation.',
    category: 'gst-services',
    pricing: { type: 'fixed', amount: 1499 },
    features: [
      'Document preparation',
      'Application filing',
      'Query resolution',
      'Certificate download',
      'Post-registration guidance'
    ],
    deliverables: ['GST Registration Certificate', 'GSTIN'],
    timeline: '3-7 business days',
    documents: ['PAN', 'Aadhaar', 'Business address proof', 'Bank statement'],
    popular: true,
    icon: 'Receipt'
  },
  {
    id: 'gst-return-monthly',
    name: 'GST Return Filing (Monthly)',
    shortDescription: 'GSTR-1 and GSTR-3B monthly filing',
    description: 'Monthly GST return filing including GSTR-1, GSTR-3B, input credit reconciliation, and compliance tracking.',
    category: 'gst-services',
    pricing: { type: 'monthly', amount: 999 },
    features: [
      'GSTR-1 filing',
      'GSTR-3B filing',
      'ITC reconciliation',
      'Error resolution',
      'Compliance calendar'
    ],
    deliverables: ['Filed returns', 'ITC report', 'Compliance status'],
    timeline: 'Before due dates',
    documents: ['Sales invoices', 'Purchase invoices', 'Bank statements'],
    icon: 'Calendar'
  },
  {
    id: 'gst-annual-return',
    name: 'GST Annual Return (GSTR-9)',
    shortDescription: 'Annual GST reconciliation and filing',
    description: 'Comprehensive annual GST return filing with reconciliation of all monthly returns and audit (if applicable).',
    category: 'gst-services',
    pricing: { type: 'starting', amount: 4999 },
    features: [
      'Annual reconciliation',
      'GSTR-9 preparation',
      'GSTR-9C audit (if needed)',
      'ITC verification',
      'Discrepancy resolution'
    ],
    deliverables: ['GSTR-9', 'GSTR-9C', 'Reconciliation report'],
    timeline: '5-10 business days',
    documents: ['All monthly returns', 'Books of accounts', 'Bank statements'],
    icon: 'FileCheck'
  },

  // Tax Compliance
  {
    id: 'tds-return-filing',
    name: 'TDS Return Filing',
    shortDescription: 'Quarterly TDS return preparation and filing',
    description: 'Complete TDS return filing including Form 24Q, 26Q, 27Q preparation, challan verification, and Form 16/16A generation.',
    category: 'tax-compliance',
    pricing: { type: 'starting', amount: 1499, unit: 'per quarter' },
    features: [
      'TDS computation',
      'Challan verification',
      'Return preparation',
      'Form 16/16A generation',
      'Correction returns'
    ],
    deliverables: ['TDS returns', 'Form 16/16A', 'Challan summary'],
    timeline: 'Before quarterly deadlines',
    documents: ['Payment records', 'Deductee details', 'Challans'],
    icon: 'FileText'
  },
  {
    id: 'advance-tax-planning',
    name: 'Advance Tax Planning & Payment',
    shortDescription: 'Quarterly advance tax computation and assistance',
    description: 'Advance tax estimation, quarterly payment reminders, and challan preparation to avoid interest penalties.',
    category: 'tax-compliance',
    pricing: { type: 'yearly', amount: 2999 },
    features: [
      'Quarterly tax estimation',
      'Payment reminders',
      'Challan preparation',
      'Interest calculation',
      'Year-end reconciliation'
    ],
    deliverables: ['Tax estimates', 'Payment challans', 'Annual summary'],
    timeline: 'Before quarterly due dates',
    documents: ['Income projections', 'TDS certificates', 'Previous returns'],
    icon: 'Clock'
  },

  // Startup Services
  {
    id: 'startup-india-registration',
    name: 'Startup India Registration',
    shortDescription: 'DPIIT recognition and benefits',
    description: 'Complete Startup India registration including DPIIT recognition, self-certification, and access to government benefits.',
    category: 'startup',
    pricing: { type: 'fixed', amount: 4999 },
    features: [
      'Eligibility assessment',
      'Application preparation',
      'Self-certification',
      'DPIIT certificate',
      'Benefits guidance'
    ],
    deliverables: ['DPIIT Certificate', 'Recognition letter', 'Benefits guide'],
    timeline: '7-15 business days',
    documents: ['COI', 'Brief about innovation', 'Founder details'],
    popular: true,
    badge: 'For Startups',
    icon: 'Rocket'
  },
  {
    id: 'esop-management',
    name: 'ESOP Setup & Management',
    shortDescription: 'Employee stock option plan design and compliance',
    description: 'Complete ESOP scheme design, documentation, valuation, and ongoing compliance management.',
    category: 'startup',
    pricing: { type: 'starting', amount: 24999 },
    features: [
      'ESOP scheme design',
      'Trust deed drafting',
      'Valuation report',
      'Grant letters',
      'Annual compliance'
    ],
    deliverables: ['ESOP Scheme', 'Trust Deed', 'Valuation Report', 'Templates'],
    timeline: '15-20 business days',
    documents: ['Company financials', 'Employee list', 'Cap table'],
    icon: 'Gift'
  },
  {
    id: 'funding-documentation',
    name: 'Funding Documentation',
    shortDescription: 'Investment documents for fundraising',
    description: 'Prepare all legal and financial documents required for seed/Series funding including term sheets, SHA, and due diligence.',
    category: 'startup',
    pricing: { type: 'starting', amount: 49999 },
    features: [
      'Term sheet review',
      'SHA drafting',
      'Due diligence support',
      'Valuation assistance',
      'Cap table management'
    ],
    deliverables: ['SHA', 'SSA', 'Board resolutions', 'Compliance certificates'],
    timeline: '10-20 business days',
    documents: ['Financials', 'Cap table', 'Business plan'],
    icon: 'Banknote'
  },

  // Accounting & Virtual CFO
  {
    id: 'bookkeeping-basic',
    name: 'Monthly Bookkeeping - Starter',
    shortDescription: 'Basic accounting for small businesses',
    description: 'Monthly bookkeeping service including transaction recording, bank reconciliation, and basic financial statements.',
    category: 'accounting',
    pricing: { type: 'monthly', amount: 4999, unit: 'up to 100 transactions' },
    features: [
      'Transaction recording',
      'Bank reconciliation',
      'Basic P&L',
      'Balance sheet',
      'Monthly reports'
    ],
    deliverables: ['Monthly P&L', 'Balance Sheet', 'Bank reconciliation'],
    timeline: 'Monthly',
    documents: ['Bank statements', 'Invoices', 'Expense receipts'],
    icon: 'BookOpen'
  },
  {
    id: 'virtual-cfo-growth',
    name: 'Virtual CFO - Growth',
    shortDescription: 'Complete financial management for growing businesses',
    description: 'Comprehensive virtual CFO service including bookkeeping, MIS reports, cash flow management, and strategic financial planning.',
    category: 'accounting',
    pricing: { type: 'monthly', amount: 19999 },
    features: [
      'Complete bookkeeping',
      'MIS reports',
      'Cash flow management',
      'Budget vs actual',
      'Investor reporting',
      'Monthly CFO call'
    ],
    deliverables: ['Monthly financials', 'MIS dashboard', 'Board deck', 'Runway analysis'],
    timeline: 'Ongoing',
    documents: ['All financial records'],
    popular: true,
    badge: 'Recommended',
    icon: 'LineChart'
  },

  // Legal & Secretarial
  {
    id: 'trademark-registration',
    name: 'Trademark Registration',
    shortDescription: 'Protect your brand with trademark',
    description: 'Complete trademark registration including search, application filing, and response to examination reports.',
    category: 'legal',
    pricing: { type: 'fixed', amount: 6999 },
    features: [
      'Trademark search',
      'Class identification',
      'Application filing',
      'Examination response',
      'Registration certificate'
    ],
    deliverables: ['TM Application', 'Registration Certificate'],
    timeline: '8-12 months',
    documents: ['Logo', 'Brand name', 'Business details'],
    icon: 'Award'
  },
  {
    id: 'annual-compliance',
    name: 'Annual ROC Compliance',
    shortDescription: 'Complete yearly company compliance',
    description: 'Annual compliance package including AGM, annual returns, financial statement filing, and director KYC.',
    category: 'legal',
    pricing: { type: 'yearly', amount: 14999 },
    features: [
      'AGM coordination',
      'AOC-4 filing',
      'MGT-7 filing',
      'Director KYC',
      'Minutes drafting'
    ],
    deliverables: ['Filed forms', 'Minutes', 'Compliance certificate'],
    timeline: 'Before due dates',
    documents: ['Financials', 'Board resolutions', 'Director details'],
    icon: 'Shield'
  },

  // Payroll
  {
    id: 'payroll-processing',
    name: 'Payroll Processing',
    shortDescription: 'Monthly salary processing and compliance',
    description: 'Complete payroll management including salary computation, TDS, PF/ESI compliance, and payslip generation.',
    category: 'payroll',
    pricing: { type: 'monthly', amount: 49, unit: 'per employee (min \u20B92,999)' },
    features: [
      'Salary computation',
      'TDS calculation',
      'PF/ESI compliance',
      'Payslip generation',
      'Leave management'
    ],
    deliverables: ['Payslips', 'TDS reports', 'PF/ESI challans'],
    timeline: 'Monthly',
    documents: ['Employee details', 'Salary structure', 'Attendance'],
    icon: 'Users'
  },
];

// Helper functions
export function getServicesByCategory(category: ServiceCategory): Service[] {
  return SERVICES.filter(s => s.category === category);
}

export function getPopularServices(): Service[] {
  return SERVICES.filter(s => s.popular);
}

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find(s => s.id === id);
}

export function searchServices(query: string): Service[] {
  const lowerQuery = query.toLowerCase();
  return SERVICES.filter(s =>
    s.name.toLowerCase().includes(lowerQuery) ||
    s.shortDescription.toLowerCase().includes(lowerQuery) ||
    s.category.includes(lowerQuery)
  );
}

export function formatPrice(pricing: Service['pricing']): string {
  const amount = `\u20B9${pricing.amount.toLocaleString('en-IN')}`;
  switch (pricing.type) {
    case 'fixed':
      return amount;
    case 'starting':
      return `Starting ${amount}`;
    case 'monthly':
      return `${amount}/month`;
    case 'yearly':
      return `${amount}/year`;
    case 'custom':
      return 'Custom Quote';
    default:
      return amount;
  }
}

