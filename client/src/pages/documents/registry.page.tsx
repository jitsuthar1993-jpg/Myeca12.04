import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import MetaSEO from "@/components/seo/MetaSEO";
import { Layout } from '@/components/admin/Layout';
import {
  FileText,
  User,
  Briefcase,
  DollarSign,
  Shield,
  Award,
  Mail,
  BarChart3,
  IndianRupee,
  Scale,
  Building2,
  Home as HomeIcon,
  Search,
  CheckCircle2,
  CheckCircle,
  Download,
  ExternalLink,
  FileArchive,
  RefreshCw,
} from 'lucide-react';

import {
  incomeTaxFormDownloads,
  incomeTaxFormsAssessmentYear,
  incomeTaxFormsFinancialYearLabel,
  incomeTaxFormsLastSynced,
  incomeTaxFormsSourceUrl,
  type IncomeTaxFormDownload,
} from '@/data/income-tax-forms';

// Document Categories based on the new Indian Market Plan
const CATEGORIES = [
  { id: 'all', name: 'All Documents', icon: <FileText className="w-5 h-5" /> },
  {
    id: 'legal',
    name: 'Legal & Personal',
    icon: <Scale className="w-5 h-5" />,
    color: 'text-red-600',
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-800',
  },
  {
    id: 'corporate',
    name: 'Business & Corporate',
    icon: <Building2 className="w-5 h-5" />,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'tax',
    name: 'Compliance & Tax',
    icon: <DollarSign className="w-5 h-5" />,
    color: 'text-green-600',
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-800',
  },
  {
    id: 'income-tax-forms',
    name: 'Income Tax Forms',
    icon: <FileArchive className="w-5 h-5" />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: <HomeIcon className="w-5 h-5" />,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    badge: 'bg-orange-100 text-orange-800',
  },
  {
    id: 'career',
    name: 'Career & HR',
    icon: <User className="w-5 h-5" />,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'applications',
    name: 'Applications & Certificates',
    icon: <FileText className="w-5 h-5" />,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    badge: 'bg-teal-100 text-teal-800',
  },
];

// Extended Generator Cards mapped to categories
const documentGenerators = [
  // LEGAL & PERSONAL (11 documents)
  {
    id: 'rent-agreement-rc',
    title: 'Residential Rent Agreement',
    description:
      'Standard 11-month lease agreement for residential properties, drafted to protect both landlord and tenant rights.',
    category: 'legal',
    icon: <FileText className="w-5 h-5" />,
    status: 'active',
    validity: 'State Specific',
    features: ['11-Month Standard Draft', 'Eviction Clauses', 'E-Stamp Ready'],
  },
  {
    id: 'rent-agreement-comm',
    title: 'Commercial Lease Agreement',
    description:
      'Comprehensive lease for office spaces or shops with provisions for lock-in periods, maintenance, and GST billing.',
    category: 'legal',
    icon: <Building2 className="w-5 h-5" />,
    status: 'active',
    validity: 'State Specific',
    features: ['Lock-in Clauses', 'Maintenance Terms', 'Registered Draft Format'],
  },
  {
    id: 'affidavit-name',
    title: 'Name Change Affidavit',
    description:
      'Legally required document for publishing name change notifications in state and national gazettes.',
    category: 'legal',
    icon: <User className="w-5 h-5" />,
    status: 'active',
    validity: 'All India',
    features: ['Gazette Notification', 'Notary Format', 'Minor/Adult Versions'],
  },
  {
    id: 'affidavit-address',
    title: 'Address Proof Affidavit',
    description:
      'Self-declaration affidavit generally used for passport, banking, or vehicle registration when standard proof is missing.',
    category: 'legal',
    icon: <HomeIcon className="w-5 h-5" />,
    status: 'active',
    validity: 'All India',
    features: ['Aadhaar/Passport App', 'Standard Legal Format', 'Downloadable Export'],
  },
  {
    id: 'poa-general',
    title: 'General Power of Attorney',
    description:
      'Authorize an agent or family member to handle broad financial, legal, and operational activities on your behalf.',
    category: 'legal',
    icon: <Shield className="w-5 h-5" />,
    status: 'active',
    validity: 'State Specific',
    features: ['Asset Management', 'Revocation Clause', 'Sub-registrar Ready'],
  },
  {
    id: 'poa-special',
    title: 'Special Power of Attorney',
    description:
      'Grant limited powers to a representative for a specific task, such as property registration or tax filing.',
    category: 'legal',
    icon: <CheckCircle className="w-5 h-5" />,
    status: 'active',
    validity: 'State Specific',
    features: ['Task-Specific Scope', 'Auto-Termination', 'Bank/Property Layout'],
  },
  {
    id: 'will',
    title: 'Simple WILL (Testament)',
    description:
      'Clear and legally sound declaration of your intentions regarding the distribution of your assets after death.',
    category: 'legal',
    icon: <ScrollText className="w-5 h-5" />,
    status: 'active',
    validity: 'Succession Act',
    features: ['Executor Appointment', 'Beneficiary Allocation', 'Witness Blocks'],
  },
  {
    id: 'gift-deed',
    title: 'Gift Deed',
    description:
      'Legally transfer movable or immovable property to a family member or third party without monetary exchange.',
    category: 'legal',
    icon: <FileText className="w-5 h-5" />,
    status: 'active',
    validity: 'Property Act',
    features: ['Blood Relative Tax', 'Acceptance Clause', 'Registration Ready'],
  },
  {
    id: 'relinquishment-deed',
    title: 'Relinquishment Deed',
    description:
      'Document for legal heirs to transfer or give up their claim over inherited ancestral property to co-heirs.',
    category: 'legal',
    icon: <Users className="w-5 h-5" />,
    status: 'active',
    validity: 'State Specific',
    features: ['Co-owner Transfer', 'Consideration Detail', 'Hindu Succession'],
  },
  {
    id: 'promissory-note',
    title: 'Promissory Note',
    description:
      'A legally binding promise in writing to pay a specific sum of money to a specified person or bearer.',
    category: 'legal',
    icon: <DollarSign className="w-5 h-5" />,
    status: 'active',
    validity: 'Instruments Act',
    features: ['Demand / Fixed Date', 'Interest Clauses', 'Revenue Stamp Space'],
  },
  {
    id: 'noc',
    title: 'NOC Letter',
    description:
      'Flexible No Objection Certificate for employers, companies, institutions, and general authority submissions.',
    category: 'legal',
    icon: <Mail className="w-5 h-5" />,
    status: 'active',
    validity: 'All India',
    features: ['General NOC Format', 'Named Recipient Option', 'Authority Ready'],
  },

  // BUSINESS & CORPORATE (8 documents)
  {
    id: 'contract-service',
    title: 'Freelance & Service Agreement',
    description:
      'Clear contract defining deliverables, payment milestones, and intellectual property rights for contractors.',
    category: 'corporate',
    icon: <Briefcase className="w-5 h-5" />,
    status: 'active',
    validity: 'All India',
    features: ['Scope Matrix', 'IP Ownership', 'Payment Term Specs'],
  },
  {
    id: 'contract-nda',
    title: 'Non-Disclosure Agreement',
    description:
      'Protect sensitive business information and trade secrets before entering into negotiations or partnerships.',
    category: 'corporate',
    icon: <Shield className="w-5 h-5" />,
    status: 'active',
    validity: 'All India',
    features: ['Mutual NDA Config', 'Defines Secrets', 'Breach Penalties'],
  },
  {
    id: 'board-resolution-bank',
    title: 'Board Resolution (Bank A/c)',
    description:
      'Required corporate draft to authorize the opening and operation of a current bank account by directors.',
    category: 'corporate',
    icon: <Building2 className="w-5 h-5" />,
    status: 'active',
    validity: 'Companies Act',
    features: ['Authorized Signatories', 'Bank Format Compliant', 'CTC Stamping Layout'],
  },
  {
    id: 'board-resolution-gst',
    title: 'Board Resolution (GST User)',
    description:
      'Authorize an individual to file GST returns and represent the company before the tax authorities.',
    category: 'corporate',
    icon: <FileCheck className="w-5 h-5" />,
    status: 'active',
    validity: 'GST Act',
    features: ['Authorizes DSC Use', 'Department Format', 'DIN/PAN Integration'],
  },
  {
    id: 'llp-agreement',
    title: 'LLP Agreement Draft',
    description:
      'The primary document governing the mutual rights and duties of partners in a Limited Liability Partnership.',
    category: 'corporate',
    icon: <Users className="w-5 h-5" />,
    status: 'active',
    validity: 'LLP Act 2008',
    features: ['Capital Contribution', 'Remuneration Clauses', 'Admission Terms'],
  },
  {
    id: 'partnership-deed',
    title: 'Partnership Deed',
    description:
      'Formal agreement among partners outlining profit sharing, capital, and operational responsibilities.',
    category: 'corporate',
    icon: <Scale className="w-5 h-5" />,
    status: 'active',
    validity: 'Partnership Act',
    features: ['Profit Sharing Ratio', 'Interest on Capital', 'Dispute Resolution'],
  },
  {
    id: 'founder-agreement',
    title: 'Founders Agreement',
    description:
      'Crucial document for startups outlining equity distribution, vesting schedules, and co-founder roles.',
    category: 'corporate',
    icon: <Briefcase className="w-5 h-5" />,
    status: 'active',
    validity: 'All India',
    features: ['Cliff & Vesting', 'Roles Matrix', 'Exit/Termination Setup'],
  },
  {
    id: 'report',
    title: 'Business & Analytics Report',
    description:
      'Generate polished corporate reports with data visualizations, executive summaries, and structured layouts.',
    category: 'corporate',
    icon: <BarChart3 className="w-5 h-5" />,
    status: 'active',
    validity: 'Global Standard',
    features: ['Data visualization blocks', 'Multiple styling layouts', 'Export to PDF/DOCX'],
  },

  // COMPLIANCE & TAX (7 documents)
  {
    id: 'invoice',
    title: 'GST Compliant Tax Invoice',
    description:
      'Generate professional B2B/B2C invoices with correct HSN codes and automated CGST, SGST calculations.',
    category: 'tax',
    icon: <DollarSign className="w-5 h-5" />,
    status: 'active',
    validity: 'GST Portal',
    features: ['Auto CGST/SGST Computable', 'IRN/QR Code Layouts', 'E-Way Bill Details'],
  },
  {
    id: 'gst-auth',
    title: 'GST Authorization Letter',
    description:
      'Letter for authorizing a CA, Agent, or Employee to act as an authorized signatory on the GST portal.',
    category: 'tax',
    icon: <Mail className="w-5 h-5" />,
    status: 'active',
    validity: 'GST Department',
    features: ['Acceptance Format', 'Entity Authorization', 'DSC Linkage Ready'],
  },
  {
    id: 'msme-decl',
    title: 'MSME Declaration (Udyam)',
    description:
      'A formal letter confirming enterprise classification to claim MSME delayed payment benefits from vendors.',
    category: 'tax',
    icon: <CheckCircle className="w-5 h-5" />,
    status: 'active',
    validity: 'MSMED Act',
    features: ['Turnover/Inv Limits', 'Vendor Onboarding', 'URN Integration'],
  },
  {
    id: 'form-15g',
    title: 'Form 15G (Tax Exemption)',
    description:
      'Declare PF/FD interest tax exemption for individuals under 60 years of age with income below minimum limits.',
    category: 'tax',
    icon: <FileDigit className="w-5 h-5" />,
    status: 'active',
    validity: 'Income Tax Act',
    features: ['Income Math', 'Auto-Formatting', '1-Click PDF'],
  },
  {
    id: 'form-15h',
    title: 'Form 15H (Senior Exemption)',
    description:
      'Self-declaration for senior citizens aged 60+ to claim nil TDS deduction on interest income from banks/post offices.',
    category: 'tax',
    icon: <FileDigit className="w-5 h-5" />,
    status: 'active',
    validity: 'Income Tax Act',
    features: ['DOB Validation', 'Tax Exemption', 'Senior Citizen Scope'],
  },
  {
    id: 'form-12bb',
    title: 'Form 12BB',
    description:
      'Employee investment declaration for HRA, LTC, home loan interest, and Chapter VI-A deduction proofs under section 192.',
    category: 'tax',
    icon: <FileDigit className="w-5 h-5" />,
    status: 'active',
    validity: 'Income Tax Act',
    features: ['Rule 26C Format', 'Deduction Proofs', 'Employer Declaration'],
  },
  // REAL ESTATE (4 documents)
  {
    id: 'society-noc',
    title: 'Housing Society NOC',
    description:
      'No Objection Certificate templates required from RWAs for bank loans, renovations, or tenant approvals.',
    category: 'real-estate',
    icon: <Building2 className="w-5 h-5" />,
    status: 'active',
    validity: 'Local Society',
    features: ['Multiple Use-Cases', 'Secretary/Chair Sign', 'Standard Draft Format'],
  },
  {
    id: 'possession-letter',
    title: 'Possession/Handover Letter',
    description:
      'Official letter to document the transfer of physical possession of a property from builder to buyer.',
    category: 'real-estate',
    icon: <Key className="w-5 h-5" />,
    status: 'active',
    validity: 'Standard',
    features: ['Key Handover Clause', 'Meter Reading Capture', 'Defect Liability Period'],
  },
  {
    id: 'leave-license',
    title: 'Leave & License Agreement',
    description:
      'Specific to select states, securely transferring temporary operational rights without granting tenancy.',
    category: 'real-estate',
    icon: <FileText className="w-5 h-5" />,
    status: 'active',
    validity: 'State Specific',
    features: ['No Eviction Hassle', 'Clear License Period', 'E-Registration Format'],
  },
  {
    id: 'lease-deed',
    title: 'Long Term Lease Deed',
    description:
      'For leases spanning over 11 months, requiring mandatory registration with the sub-registrar office.',
    category: 'real-estate',
    icon: <ScrollText className="w-5 h-5" />,
    status: 'active',
    validity: 'Registration Act',
    features: ['Long Term Tenancy', 'Sub-lease clauses', 'Stamp Duty Structuring'],
  },
  {
    id: 'rent-receipt',
    title: 'HRA Rent Receipt Generator',
    description:
      'Generate monthly or annual rent receipts with landlord PAN provisions for submitting exact HRA proofs.',
    category: 'real-estate',
    icon: <IndianRupee className="w-5 h-5" />,
    status: 'active',
    validity: 'Income Tax Act',
    features: ['Landlord PAN Field', 'Multiple Receipts/Page', 'HRA Claim Ready'],
  },

  // APPLICATIONS & CERTIFICATES (12 documents)
  {
    id: 'legal-notice',
    title: 'Legal Notice',
    description:
      'Formal pre-action notice for recovery, contract, property, service, and general disputes.',
    category: 'applications',
    icon: <Scale className="w-5 h-5" />,
    status: 'active',
    validity: 'All India',
    features: ['Pre-action Draft', 'Demand Timeline', 'Review Reminder'],
  },
  {
    id: 'rti-application',
    title: 'RTI Application',
    description:
      'Right to Information request format for public records, government data, and department responses.',
    category: 'applications',
    icon: <FileText className="w-5 h-5" />,
    status: 'active',
    validity: 'RTI Act 2005',
    features: ['PIO Address Block', 'Fee Details', 'Section 6(3) Transfer'],
  },
  {
    id: 'consumer-complaint-letter',
    title: 'Consumer Complaint Letter',
    description:
      'Complaint letter for defective goods, delayed services, refunds, warranties, and support escalation.',
    category: 'applications',
    icon: <Mail className="w-5 h-5" />,
    status: 'active',
    validity: 'Consumer Law',
    features: ['Order Details', 'Relief Requested', 'Escalation Wording'],
  },
  {
    id: 'police-complaint-lost-document',
    title: 'Lost Document Police Complaint',
    description:
      'Police intimation draft for lost IDs, certificates, mark sheets, passports, and official papers.',
    category: 'applications',
    icon: <Shield className="w-5 h-5" />,
    status: 'active',
    validity: 'All India',
    features: ['Document Number', 'Loss Location', 'Acknowledgement Request'],
  },
  {
    id: 'general-affidavit',
    title: 'General Affidavit',
    description:
      'Flexible sworn statement format for common administrative, banking, and official submissions.',
    category: 'applications',
    icon: <FileText className="w-5 h-5" />,
    status: 'active',
    validity: 'Notary Format',
    features: ['Custom Statements', 'Verification Clause', 'Stamp Paper Note'],
  },
  {
    id: 'one-same-person-affidavit',
    title: 'One & Same Person Affidavit',
    description:
      'Declare that different name spellings across records refer to the same person.',
    category: 'applications',
    icon: <User className="w-5 h-5" />,
    status: 'active',
    validity: 'All India',
    features: ['Name Variations', 'Record List', 'Identity Declaration'],
  },
  {
    id: 'bonafide-certificate',
    title: 'Bonafide Certificate',
    description:
      'Certificate format for schools, colleges, institutions, and organizations to confirm association.',
    category: 'applications',
    icon: <Award className="w-5 h-5" />,
    status: 'active',
    validity: 'Institutional',
    features: ['Roll/ID Field', 'Course or Role', 'Purpose Statement'],
  },
  {
    id: 'transfer-certificate',
    title: 'Transfer Certificate',
    description:
      'School or college transfer certificate draft with admission, leaving, and conduct details.',
    category: 'applications',
    icon: <FileText className="w-5 h-5" />,
    status: 'active',
    validity: 'Institutional',
    features: ['Admission Number', 'Leaving Reason', 'Conduct Record'],
  },
  {
    id: 'student-fee-receipt',
    title: 'Student Fee Receipt',
    description:
      'Education fee receipt for schools, institutes, coaching centers, and training programs.',
    category: 'applications',
    icon: <IndianRupee className="w-5 h-5" />,
    status: 'active',
    validity: 'Institutional',
    features: ['Receipt Number', 'Payment Mode', 'Fee Period'],
  },
  {
    id: 'invitation-letter',
    title: 'Invitation Letter',
    description:
      'Invitation draft for visa, business visit, event, conference, and personal visit purposes.',
    category: 'applications',
    icon: <Mail className="w-5 h-5" />,
    status: 'active',
    validity: 'General Use',
    features: ['Visit Purpose', 'Venue Details', 'Support Statement'],
  },
  {
    id: 'marriage-biodata',
    title: 'Marriage Biodata',
    description:
      'Printable matrimonial profile with personal, education, profession, family, and contact details.',
    category: 'applications',
    icon: <User className="w-5 h-5" />,
    status: 'active',
    validity: 'Personal Use',
    features: ['Family Details', 'Preferences', 'Contact Block'],
  },
  {
    id: 'pension-request-application',
    title: 'Pension Request Application',
    description:
      'Application for pension start, correction, arrears, life certificate update, or related requests.',
    category: 'applications',
    icon: <Building2 className="w-5 h-5" />,
    status: 'active',
    validity: 'Department Use',
    features: ['PPO Details', 'Request Type', 'Attachment List'],
  },

  // CAREER & HR (6 documents)
  {
    id: 'resume',
    title: 'Professional Resume Builder',
    description:
      'Build ATS-optimized resumes using industry-standard templates for freshers and experienced professionals.',
    category: 'career',
    icon: <User className="w-5 h-5" />,
    status: 'active',
    validity: 'Global Standard',
    features: ['ATS-friendly format', 'Live Layout Preview', '1-Click PDF export'],
  },
  {
    id: 'offer-letter',
    title: 'Employment Offer Letter',
    description:
      'Draft comprehensive job offers detailing CTC, joining date, probation period, and standard policies.',
    category: 'career',
    icon: <Mail className="w-5 h-5" />,
    status: 'active',
    validity: 'All India',
    features: ['CTC Breakdown Math', 'Probation Terms', 'Acceptance Signature'],
  },
  {
    id: 'experience-letter',
    title: 'Experience / Relieving Cert.',
    description:
      'Provide exiting employees with official documentation of their tenure, designation, and conduct.',
    category: 'career',
    icon: <Award className="w-5 h-5" />,
    status: 'active',
    validity: 'Global Standard',
    features: ['Combined/Solo Format', 'Conduct Declaration', 'Full/Final Clearance'],
  },
  {
    id: 'salary-slip',
    title: 'Standard Salary Slip / Cert.',
    description:
      'Detailed monthly pay slips with automated basic pay, HRA calculations, and standard deductions.',
    category: 'career',
    icon: <IndianRupee className="w-5 h-5" />,
    status: 'active',
    validity: 'Company Policy',
    features: ['Earnings vs Deductions', 'Net Pay Calculation', 'Auto-Words format'],
  },
  {
    id: 'warning-letter',
    title: 'Employee Warning Notice',
    description:
      'Formal documentation for performance issues or conduct violations to establish HR compliance trails.',
    category: 'career',
    icon: <FileCheck className="w-5 h-5" />,
    status: 'active',
    validity: 'Company Policy',
    features: ['Performance Tracking', 'Incident Details', 'Disciplinary Action'],
  },
  {
    id: 'certificate',
    title: 'Award / Excellence Cert.',
    description:
      'Design beautiful, high-resolution certificates for employee appreciation or completion of training.',
    category: 'career',
    icon: <Award className="w-5 h-5" />,
    status: 'active',
    validity: 'Global Use',
    features: ['Custom Branding', 'Multiple Layout Styles', 'Print-Perfect Export'],
  },
];

// Fallback Icons
function ScrollText({ className }: { className?: string }) {
  return <FileText className={className} />;
}
function Users({ className }: { className?: string }) {
  return <User className={className} />;
}
function FileCheck({ className }: { className?: string }) {
  return <CheckCircle className={className} />;
}
function FileDigit({ className }: { className?: string }) {
  return <FileText className={className} />;
}
function Receipt({ className }: { className?: string }) {
  return <DollarSign className={className} />;
}
function Key({ className }: { className?: string }) {
  return <HomeIcon className={className} />;
}

const incomeTaxFileTypeStyles: Record<
  IncomeTaxFormDownload['fileType'],
  { label: string; className: string; icon: JSX.Element }
> = {
  pdf: {
    label: 'PDF',
    className: 'bg-red-50 text-red-700 border-red-100',
    icon: <FileText className="h-3.5 w-3.5" />,
  },
  utility: {
    label: 'Utility ZIP',
    className: 'bg-blue-50 text-blue-700 border-blue-100',
    icon: <FileArchive className="h-3.5 w-3.5" />,
  },
  schema: {
    label: 'Schema',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    icon: <FileArchive className="h-3.5 w-3.5" />,
  },
  zip: {
    label: 'ZIP',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <FileArchive className="h-3.5 w-3.5" />,
  },
  link: {
    label: 'Official Link',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    icon: <ExternalLink className="h-3.5 w-3.5" />,
  },
};

function formatSyncDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DocumentGeneratorRegistry() {
  const [activeView, setActiveView] = useState<'templates' | 'official'>('templates');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [incomeTaxSearchQuery, setIncomeTaxSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All States');

  const INDIAN_STATES = [
    'All States',
    'Maharashtra',
    'Delhi',
    'Karnataka',
    'Tamil Nadu',
    'Gujarat',
    'Uttar Pradesh',
    'Telangana',
    'West Bengal',
  ];

  const filteredDocs = useMemo(() => {
    return documentGenerators.filter((doc) => {
      const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || [
        doc.title,
        doc.description,
        doc.validity,
        ...doc.features,
      ].some((value) => value.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const filteredIncomeTaxForms = useMemo(() => {
    const query = incomeTaxSearchQuery.trim().toLowerCase();

    if (!query) return incomeTaxFormDownloads;

    const queryTerms = query.split(/\s+/).filter(Boolean);

    return incomeTaxFormDownloads.filter((form) => {
      const searchable = [
        form.title,
        form.fileType,
        form.act,
        ...form.tags,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return queryTerms.every((term) => searchable.includes(term));
    });
  }, [incomeTaxSearchQuery]);

  // Get category styling
  const getCategoryStyle = (catId: string) => {
    return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[1];
  };
  const templateCategories = CATEGORIES.filter((category) => category.id !== 'income-tax-forms');

  return (
    <Layout title="Document Generator">
      <MetaSEO 
        title="Legal Documents & Agreements Online India | MyeCA.in"
        description="Create, edit, and download 50+ legal and business documents including Rent Agreements, NDAs, Offer Letters, and Board Resolutions. CA-verified drafts for Indian market."
        keywords={[
          "legal documents online India", "business agreement drafts", "rent agreement online", 
          "NDA draft India", "employment contract template", "board resolution format"
        ]}
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Document Registry", url: "/documents/generator" }]}
      />
      <div className="space-y-6 pb-16">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="type-meta font-black uppercase tracking-[0.16em] text-blue-700">Document Generator</p>
              <h1 className="mt-2 type-page-title font-black text-slate-950">Create documents from ready templates</h1>
              <p className="mt-2 type-body text-slate-600">
                Choose a template, complete the guided fields, preview the result, and export the finished document.
              </p>
            </div>
            <Link
              href="/documents"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              Open Documents
            </Link>
          </div>

          <div className="mt-5 inline-flex w-full rounded-lg bg-slate-100 p-1 sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveView('templates')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-black sm:flex-none ${
                activeView === 'templates' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Document templates
            </button>
            <button
              type="button"
              onClick={() => setActiveView('official')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-black sm:flex-none ${
                activeView === 'official' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Official Forms
            </button>
          </div>
        </section>

        {activeView === 'templates' ? (
          <>
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                <label className="relative">
                  <span className="sr-only">Search document templates</span>
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search agreements, affidavits, invoices, letters..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm">
                  <span className="font-semibold text-slate-500">Jurisdiction</span>
                  <select
                    value={selectedState}
                    onChange={(event) => setSelectedState(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent font-black text-slate-800 outline-none"
                    title="Select State"
                  >
                    {INDIAN_STATES.map((state) => <option key={state}>{state}</option>)}
                  </select>
                </label>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {templateCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black ${
                      activeCategory === category.id
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {category.icon}
                    {category.name}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="type-card-title font-black text-slate-950">
                    {templateCategories.find((category) => category.id === activeCategory)?.name}
                  </h2>
                  <p className="mt-1 type-support text-slate-500">{filteredDocs.length} templates available</p>
                </div>
              </div>

              <div
                data-testid="document-template-gallery"
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                {filteredDocs.map((doc) => {
                  const categoryStyle = getCategoryStyle(doc.category);
                  return (
                    <article
                      key={doc.id}
                      className="flex min-h-[285px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${categoryStyle.bg} ${categoryStyle.color}`}>
                          {doc.icon}
                        </div>
                        <span className={`rounded-md px-2 py-1 type-meta font-black uppercase tracking-[0.08em] ${
                          doc.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {doc.status === 'active' ? 'Ready' : 'Soon'}
                        </span>
                      </div>
                      <h3 className="mt-4 type-card-title font-black text-slate-950">{doc.title}</h3>
                      <p className="mt-2 line-clamp-3 type-support leading-5 text-slate-600">{doc.description}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {doc.features.slice(0, 2).map((feature) => (
                          <span key={feature} className="rounded-md bg-slate-50 px-2 py-1 type-meta font-bold text-slate-600">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto border-t border-slate-100 pt-4">
                        {doc.status === 'active' ? (
                          <Link
                            href={`/documents/generator/${doc.id}`}
                            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-black text-white hover:bg-blue-800"
                          >
                            Create document
                          </Link>
                        ) : (
                          <button disabled className="h-10 w-full rounded-lg bg-slate-100 text-sm font-black text-slate-400">
                            In development
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredDocs.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white py-14 text-center">
                  <Search className="mx-auto h-9 w-9 text-slate-300" />
                  <h3 className="mt-3 type-card-title font-black text-slate-950">No templates found</h3>
                  <p className="mt-1 type-support text-slate-500">Try another search or category.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="mt-4 text-sm font-black text-blue-700"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-700">
                    <RefreshCw className="h-4 w-4" />
                    <span className="type-meta font-black uppercase tracking-[0.12em]">Synced {formatSyncDate(incomeTaxFormsLastSynced)}</span>
                  </div>
                  <h2 className="mt-2 type-card-title font-black text-slate-950">
                    Income Tax Forms for FY {incomeTaxFormsFinancialYearLabel}
                  </h2>
                  <p className="mt-1 type-support text-slate-500">Official utilities, schemas, and PDF downloads.</p>
                </div>
                <a
                  href={incomeTaxFormsSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 hover:bg-slate-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Official source
                </a>
              </div>
              <label className="relative mt-5 block max-w-xl">
                <span className="sr-only">Search official forms</span>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search ITR forms, utilities, schemas..."
                  value={incomeTaxSearchQuery}
                  onChange={(event) => setIncomeTaxSearchQuery(event.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              {filteredIncomeTaxForms.map((form) => {
                const typeStyle = incomeTaxFileTypeStyles[form.fileType];
                const downloadHref = form.downloadUrl || form.officialUrl;
                const isMirroredPdf = Boolean(form.downloadUrl);
                return (
                  <article key={form.id} className="flex flex-col rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="type-support font-black text-slate-950">{form.title}</h3>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 type-meta font-black ${typeStyle.className}`}>
                        {typeStyle.icon}
                        {typeStyle.label}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 type-support leading-5 text-slate-500">
                      {form.description || 'Official Income Tax Department form download.'}
                    </p>
                    <p className="mt-3 type-meta font-bold text-slate-500">
                      FY {incomeTaxFormsFinancialYearLabel} · AY {incomeTaxFormsAssessmentYear}
                    </p>
                    <div className="mt-auto grid gap-2 pt-4 sm:grid-cols-2">
                      <a
                        href={downloadHref}
                        target={isMirroredPdf ? undefined : '_blank'}
                        rel={isMirroredPdf ? undefined : 'noopener noreferrer'}
                        download={isMirroredPdf ? true : undefined}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-3 text-xs font-black text-white"
                      >
                        {isMirroredPdf ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                        {isMirroredPdf ? 'Download' : 'Open file'}
                      </a>
                      <a
                        href={form.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Source
                      </a>
                    </div>
                  </article>
                );
              })}
              {filteredIncomeTaxForms.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center sm:col-span-2">
                  <Search className="mx-auto h-9 w-9 text-slate-300" />
                  <h3 className="mt-3 type-card-title font-black text-slate-950">No official forms found</h3>
                  <p className="mt-1 type-support text-slate-500">Try another form number or keyword.</p>
                  <button
                    type="button"
                    onClick={() => setIncomeTaxSearchQuery('')}
                    className="mt-4 text-sm font-black text-blue-700"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
