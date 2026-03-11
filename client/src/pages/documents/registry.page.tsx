import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
  ArrowRight,
  Eye,
  CheckCircle2,
  ChevronDown,
  CheckCircle,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

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
];

// Extended Generator Cards mapped to categories
const documentGenerators = [
  // LEGAL & PERSONAL (10 documents)
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
    features: ['Aadhaar/Passport App', 'Standard Legal Format', 'Instant Export'],
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

  // COMPLIANCE & TAX (6 documents)
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

  // CAREER & HR (5 documents)
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

export default function DocumentGeneratorRegistry() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Get category styling
  const getCategoryStyle = (catId: string) => {
    return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[1];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            MyeCA Forms
          </h2>
          <p className="text-xs text-gray-500 font-medium tracking-wide mt-1 uppercase">
            Indian Market Focused
          </p>
        </div>

        <nav className="space-y-1">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div
                className={`${activeCategory === category.id ? 'text-blue-600' : 'text-gray-400'}`}
              >
                {category.icon}
              </div>
              {category.name}
              {activeCategory === category.id && (
                <ChevronRight className="w-4 h-4 ml-auto text-blue-600" />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 md:p-8 lg:p-10">
        {/* Top Search & Filter Bar */}
        <div className="max-w-7xl mx-auto mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rent agreements, GST forms, NDA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="w-full md:w-auto flex shrink-0 items-center bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-500 mr-2 flex-shrink-0">Jurisdiction:</span>
              <select
                title="Select State"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="text-sm font-medium text-gray-900 bg-transparent outline-none focus:ring-0 appearance-none pr-6 cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundPosition: 'right center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.25rem',
                }}
              >
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Categories Header */}
        <div className="max-w-7xl mx-auto mb-8 flex items-baseline justify-between">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {CATEGORIES.find((c) => c.id === activeCategory)?.name}
            <span className="text-gray-400 font-normal ml-3 text-2xl">({filteredDocs.length})</span>
          </h1>
        </div>

        {/* Document Grid (Geometric Layout) */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDocs.map((doc, i) => {
              const catStyle = getCategoryStyle(doc.category);

              return (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="group relative bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 flex flex-col h-full overflow-hidden isolate"
                >
                  {/* Geometric Background Element */}
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-gray-50 group-hover:bg-blue-50/50 transition-colors -z-10 blur-xl"></div>

                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-xl ${catStyle.bg} ${catStyle.color} shadow-sm ring-1 ring-black/5`}
                    >
                      {doc.icon}
                    </div>
                    {doc.status === 'active' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700 tracking-wide uppercase">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-500 uppercase tracking-wide">
                        Soon
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 mb-4">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-700 transition-colors">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-3">
                      <Scale className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {doc.validity}
                      </span>
                    </div>
                  </div>

                  {/* Metadata / Features */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col min-h-[160px]">
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {doc.description}
                    </p>

                    <ul className="grid grid-cols-1 gap-1.5 mb-5 mt-auto">
                      {doc.features.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-xs text-gray-700 font-medium"
                        >
                          <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2 shrink-0 relative top-[1px]" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-auto">
                      {doc.status === 'active' ? (
                        <>
                          <Link
                            href={`/documents/generator/${doc.id}`}
                            className="flex-1 bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white font-semibold py-2.5 px-3 rounded-xl text-sm text-center transition-colors shadow-sm"
                          >
                            Create
                          </Link>
                        </>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-gray-50 border border-gray-200 text-gray-400 font-medium py-2.5 px-3 rounded-xl text-sm cursor-not-allowed"
                        >
                          In Development
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 mx-auto max-w-2xl mt-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No documents found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-6 text-blue-600 font-medium hover:text-blue-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
