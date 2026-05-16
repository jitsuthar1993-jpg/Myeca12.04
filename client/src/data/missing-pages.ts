export interface RelatedLink {
  label: string;
  href: string;
}

export interface GeneratedServicePageData {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  priceAmount: number;
  priceLabel: string;
  timeline: string;
  icon: string;
  highlights: string[];
  documents: string[];
  process: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedLinks: RelatedLink[];
}

export interface GeneratedInfoPageData {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  highlights: string[];
  inputs: string[];
  outputs: string[];
  limitations: string[];
  relatedLinks: RelatedLink[];
}

export interface GeneratedStartupPageData {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  highlights: string[];
  deliverables: string[];
  process: string[];
  relatedLinks: RelatedLink[];
}

const standardServiceProcess = [
  "Share your basic details and current requirement.",
  "A MyeCA expert reviews scope, documents, and applicability.",
  "We prepare the application, filing, reply, or advisory notes.",
  "You receive status updates, final documents, and next-step guidance.",
];

const standardServiceFaqs = (serviceName: string) => [
  {
    question: `Can MyeCA handle ${serviceName} online?`,
    answer:
      "Yes. Most of the intake, document review, filing support, and follow-up can be coordinated online with expert assistance.",
  },
  {
    question: "Will I get a clear document checklist before paying?",
    answer:
      "Yes. The service page collects basic intent first, and the expert team confirms the exact document list and scope before execution.",
  },
  {
    question: "Is this suitable for individuals and businesses?",
    answer:
      "Where the service applies to both, the expert team checks your case type first and guides you through the right workflow.",
  },
];

export const generatedServicePages: GeneratedServicePageData[] = [
  {
    slug: "advisory",
    title: "Financial & Tax Advisory",
    subtitle: "Expert advisory",
    description:
      "Get structured guidance for tax, loan, investment, and compliance decisions before you commit money or file paperwork.",
    category: "Advisory",
    priceAmount: 1999,
    priceLabel: "Starting ₹1,999 excluding GST",
    timeline: "1-2 working days",
    icon: "Lightbulb",
    highlights: ["CA-led review", "Written action points", "Decision support", "Follow-up guidance"],
    documents: ["PAN or business details", "Current issue summary", "Relevant notices or statements", "Previous filings if available"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("financial and tax advisory"),
    relatedLinks: [
      { label: "Expert consultation", href: "/expert-consultation?service=advisory" },
      { label: "Tax planning", href: "/services/tax-planning" },
    ],
  },
  {
    slug: "audit",
    title: "Tax Audit Assistance",
    subtitle: "Audit support",
    description:
      "Prepare for tax audit requirements with organized books, document checks, and expert filing coordination.",
    category: "Audit & Assurance",
    priceAmount: 4999,
    priceLabel: "Starting ₹4,999 excluding GST",
    timeline: "3-7 working days",
    icon: "ShieldCheck",
    highlights: ["Books review", "Audit checklist", "CA coordination", "Compliance notes"],
    documents: ["Books of accounts", "Bank statements", "Sales and purchase records", "Previous return details"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("tax audit assistance"),
    relatedLinks: [
      { label: "Audit services", href: "/services/audit-services" },
      { label: "Compliance management", href: "/services/compliance-management" },
    ],
  },
  {
    slug: "business-advisory",
    title: "Business Advisory",
    subtitle: "Growth decisions",
    description:
      "Practical advisory for business structure, finance workflows, registrations, and recurring compliance priorities.",
    category: "Business Advisory",
    priceAmount: 2999,
    priceLabel: "Starting ₹2,999 excluding GST",
    timeline: "2-3 working days",
    icon: "Briefcase",
    highlights: ["Business model review", "Compliance roadmap", "Cash-flow inputs", "Registration guidance"],
    documents: ["Business profile", "Revenue details", "Current registrations", "Key questions or plans"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("business advisory"),
    relatedLinks: [
      { label: "Startup services", href: "/startup-services" },
      { label: "Virtual CFO", href: "/business/virtual-cfo" },
    ],
  },
  {
    slug: "director-identification",
    title: "Director Identification Number Support",
    subtitle: "DIN guidance",
    description:
      "Get help with DIN-related documentation, director KYC readiness, and company director compliance workflows.",
    category: "Corporate Compliance",
    priceAmount: 1499,
    priceLabel: "Starting ₹1,499 excluding GST",
    timeline: "2-5 working days",
    icon: "IdCard",
    highlights: ["Director KYC support", "Document readiness", "Corporate workflow guidance", "Status tracking"],
    documents: ["PAN", "Aadhaar", "Address proof", "Company details if available"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("DIN support"),
    relatedLinks: [
      { label: "Company registration", href: "/services/company-registration" },
      { label: "Compliance management", href: "/services/compliance-management" },
    ],
  },
  {
    slug: "dsc",
    title: "Digital Signature Certificate",
    subtitle: "DSC support",
    description:
      "Assistance for DSC requirements used in company filings, GST, income tax, tendering, and professional compliance.",
    category: "Digital Compliance",
    priceAmount: 1999,
    priceLabel: "Starting ₹1,999 excluding GST",
    timeline: "1-3 working days",
    icon: "KeyRound",
    highlights: ["DSC requirement check", "Identity document review", "Filing use-case guidance", "Renewal support"],
    documents: ["PAN", "Aadhaar", "Photo", "Email and mobile details"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("digital signature certificate support"),
    relatedLinks: [
      { label: "Company registration", href: "/services/company-registration" },
      { label: "GST registration", href: "/services/gst-registration" },
    ],
  },
  {
    slug: "esi-registration",
    title: "ESI Registration Support",
    subtitle: "Payroll compliance",
    description:
      "Plan and manage ESI registration readiness with payroll data checks, employee details, and compliance guidance.",
    category: "Payroll Services",
    priceAmount: 2999,
    priceLabel: "Starting ₹2,999 excluding GST",
    timeline: "3-7 working days",
    icon: "Users",
    highlights: ["Applicability review", "Employee data checklist", "Registration workflow", "Monthly compliance guidance"],
    documents: ["Employer details", "Employee list", "Salary details", "Business address proof"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("ESI registration support"),
    relatedLinks: [
      { label: "Labour law compliance", href: "/services/labour-law-compliance" },
      { label: "TDS filing", href: "/services/tds-filing" },
    ],
  },
  {
    slug: "foreign-remittance",
    title: "Foreign Remittance Compliance",
    subtitle: "Form 15CA/CB guidance",
    description:
      "Get expert support for remittance documentation, taxability checks, and CA certificate coordination where applicable.",
    category: "International Tax",
    priceAmount: 3499,
    priceLabel: "Starting ₹3,499 excluding GST",
    timeline: "2-5 working days",
    icon: "Globe2",
    highlights: ["Remittance purpose review", "Taxability check", "Document checklist", "CA certificate coordination"],
    documents: ["Invoice or agreement", "Recipient details", "Bank advice if available", "PAN and residency details"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("foreign remittance compliance"),
    relatedLinks: [
      { label: "Tax consultation", href: "/services/tax-consultation" },
      { label: "Expert consultation", href: "/expert-consultation?service=foreign-remittance" },
    ],
  },
  {
    slug: "gst-return",
    title: "GST Return Filing",
    subtitle: "GST compliance",
    description:
      "Monthly, quarterly, and annual GST return support with invoice checks, ITC review, and filing coordination.",
    category: "GST Services",
    priceAmount: 999,
    priceLabel: "Starting ₹999 excluding GST",
    timeline: "Before due dates",
    icon: "Receipt",
    highlights: ["GSTR-1 and 3B support", "ITC reconciliation", "Invoice checks", "Compliance reminders"],
    documents: ["Sales invoices", "Purchase invoices", "GST login access or data", "Bank summary if needed"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("GST return filing"),
    relatedLinks: [
      { label: "GST returns", href: "/services/gst-returns" },
      { label: "GST registration", href: "/services/gst-registration" },
    ],
  },
  {
    slug: "home-loan",
    title: "Home Loan Advisory",
    subtitle: "Loan planning",
    description:
      "Understand affordability, tax implications, repayment planning, and document readiness before applying for a home loan.",
    category: "Loan Advisory",
    priceAmount: 1999,
    priceLabel: "Starting ₹1,999 excluding GST",
    timeline: "1-2 working days",
    icon: "Home",
    highlights: ["EMI review", "Tax benefit guidance", "Document checklist", "Prepayment planning"],
    documents: ["Income proof", "Loan offer if available", "Property details", "Existing obligations"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("home loan advisory"),
    relatedLinks: [
      { label: "Home loan calculator", href: "/calculators/home-loan" },
      { label: "Tax consultation", href: "/services/tax-consultation" },
    ],
  },
  {
    slug: "investment-advisory",
    title: "Investment Advisory",
    subtitle: "Goal planning",
    description:
      "Create a practical investment plan aligned with tax goals, risk comfort, cash flow, and long-term milestones.",
    category: "Investment Advisory",
    priceAmount: 2499,
    priceLabel: "Starting ₹2,499 excluding GST",
    timeline: "2-3 working days",
    icon: "TrendingUp",
    highlights: ["Goal mapping", "Risk profile review", "Tax-aware planning", "Portfolio action list"],
    documents: ["Income details", "Current investments", "Insurance summary", "Financial goals"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("investment advisory"),
    relatedLinks: [
      { label: "SIP calculator", href: "/calculators/sip" },
      { label: "ELSS comparator", href: "/elss-comparator" },
    ],
  },
  {
    slug: "itr-filing",
    title: "ITR Filing Service",
    subtitle: "CA-assisted filing",
    description:
      "File your income tax return with expert review, deduction checks, AIS/Form 26AS review, and post-filing guidance.",
    category: "Individual Tax Services",
    priceAmount: 999,
    priceLabel: "Starting ₹999 excluding GST",
    timeline: "After document review",
    icon: "FileText",
    highlights: ["CA-assisted filing", "AIS review", "Deduction checks", "Refund support"],
    documents: ["PAN", "Form 16", "AIS/Form 26AS", "Investment and income proofs"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("ITR filing"),
    relatedLinks: [
      { label: "Start ITR filing", href: "/itr/form-selector" },
      { label: "ITR for salaried", href: "/services/itr-for-salaried" },
    ],
  },
  {
    slug: "msme-registration",
    title: "MSME Registration",
    subtitle: "Udyam support",
    description:
      "Get guided support for MSME/Udyam registration readiness and business benefit documentation.",
    category: "Business Registration",
    priceAmount: 999,
    priceLabel: "Starting ₹999 excluding GST",
    timeline: "1-3 working days",
    icon: "Award",
    highlights: ["Udyam workflow", "Business detail review", "Certificate guidance", "Benefit checklist"],
    documents: ["Aadhaar", "PAN", "Business details", "Bank details"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("MSME registration"),
    relatedLinks: [
      { label: "MSME Udyam registration", href: "/services/msme-udyam-registration" },
      { label: "Startup India", href: "/services/startup-india-registration" },
    ],
  },
  {
    slug: "pan-card",
    title: "PAN Card Assistance",
    subtitle: "Identity tax support",
    description:
      "Assistance for PAN application, correction readiness, business PAN needs, and tax identity documentation.",
    category: "Identity Services",
    priceAmount: 499,
    priceLabel: "Starting ₹499 excluding GST",
    timeline: "2-7 working days",
    icon: "BadgeCheck",
    highlights: ["Application guidance", "Correction checklist", "Business PAN support", "Status guidance"],
    documents: ["Identity proof", "Address proof", "Date of birth proof", "Business proof if applicable"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("PAN card assistance"),
    relatedLinks: [
      { label: "TAN registration", href: "/services/tan-registration" },
      { label: "Expert consultation", href: "/expert-consultation?service=pan-card" },
    ],
  },
  {
    slug: "professional-tax",
    title: "Professional Tax Compliance",
    subtitle: "State compliance",
    description:
      "Manage professional tax applicability, registration readiness, payroll deductions, and state-wise compliance support.",
    category: "Payroll Services",
    priceAmount: 1999,
    priceLabel: "Starting ₹1,999 excluding GST",
    timeline: "3-7 working days",
    icon: "Landmark",
    highlights: ["Applicability review", "Registration support", "Payroll deduction guidance", "Return checklist"],
    documents: ["Employer details", "Employee salary list", "Business address proof", "Existing registration if any"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("professional tax compliance"),
    relatedLinks: [
      { label: "Labour law compliance", href: "/services/labour-law-compliance" },
      { label: "Compliance calendar", href: "/compliance-calendar" },
    ],
  },
  {
    slug: "document-storage",
    title: "Reliable Document Storage",
    subtitle: "Secure records",
    description:
      "Organize important tax, business, and compliance documents in a structured workflow for future filings and audits.",
    category: "Document Services",
    priceAmount: 999,
    priceLabel: "Starting ₹999 excluding GST",
    timeline: "Account-based setup",
    icon: "Archive",
    highlights: ["Document organization", "Filing-ready folders", "Compliance reminders", "Secure access workflow"],
    documents: ["Tax documents", "Business certificates", "Bank records", "Compliance proofs"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("document storage support"),
    relatedLinks: [
      { label: "Document vault", href: "/services/document-vault" },
      { label: "Documents", href: "/documents" },
    ],
  },
  {
    slug: "startup-india",
    title: "Startup India Support",
    subtitle: "DPIIT guidance",
    description:
      "Understand Startup India eligibility, documentation, recognition workflow, and benefits with expert business support.",
    category: "Startup Services",
    priceAmount: 4999,
    priceLabel: "Starting ₹4,999 excluding GST",
    timeline: "7-15 working days",
    icon: "Rocket",
    highlights: ["Eligibility review", "DPIIT document checklist", "Benefits guidance", "Application support"],
    documents: ["Entity documents", "Founder details", "Innovation note", "Business profile"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("Startup India support"),
    relatedLinks: [
      { label: "Startup India registration", href: "/services/startup-india-registration" },
      { label: "Startup services", href: "/startup-services" },
    ],
  },
  {
    slug: "tan-registration",
    title: "TAN Registration",
    subtitle: "TDS compliance",
    description:
      "Get support for TAN requirements, TDS deduction readiness, and employer or business tax compliance setup.",
    category: "Tax Compliance",
    priceAmount: 999,
    priceLabel: "Starting ₹999 excluding GST",
    timeline: "2-5 working days",
    icon: "Hash",
    highlights: ["TAN applicability review", "Document checklist", "TDS workflow guidance", "Status support"],
    documents: ["PAN", "Identity proof", "Address proof", "Business details"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("TAN registration"),
    relatedLinks: [
      { label: "TDS filing", href: "/services/tds-filing" },
      { label: "TDS calculator", href: "/calculators/tds" },
    ],
  },
  {
    slug: "tax-consultation",
    title: "Tax Consultation",
    subtitle: "Ask an expert",
    description:
      "Discuss salary, business, capital gains, GST, notices, or filing questions with a tax professional before acting.",
    category: "Tax Advisory",
    priceAmount: 1499,
    priceLabel: "Starting ₹1,499 excluding GST",
    timeline: "Available slots",
    icon: "MessagesSquare",
    highlights: ["Case-specific advice", "Written next steps", "Tax position review", "Filing or notice guidance"],
    documents: ["Question summary", "Income details", "Relevant notices", "Previous returns if available"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("tax consultation"),
    relatedLinks: [
      { label: "Expert consultation", href: "/expert-consultation?service=tax-consultation" },
      { label: "Tax planning", href: "/services/tax-planning" },
    ],
  },
  {
    slug: "wealth-management",
    title: "Wealth Management Advisory",
    subtitle: "Long-term planning",
    description:
      "Coordinate tax-aware wealth planning, goal setting, portfolio review, and family finance documentation with expert support.",
    category: "Investment Advisory",
    priceAmount: 4999,
    priceLabel: "Starting ₹4,999 excluding GST",
    timeline: "3-5 working days",
    icon: "LineChart",
    highlights: ["Portfolio review", "Tax-aware planning", "Goal tracking", "Family finance coordination"],
    documents: ["Investment statements", "Income details", "Insurance summary", "Goals and liabilities"],
    process: standardServiceProcess,
    faqs: standardServiceFaqs("wealth management advisory"),
    relatedLinks: [
      { label: "Investment advisory", href: "/services/investment-advisory" },
      { label: "Withdrawal planner", href: "/calculators/withdrawal-planner" },
    ],
  },
];

export const generatedCalculatorPages: GeneratedInfoPageData[] = [
  {
    slug: "deductions",
    title: "Tax Deduction Planner",
    subtitle: "Deduction guide",
    description:
      "Plan common deduction categories before ITR filing with a structured checklist and expert review path.",
    icon: "ListChecks",
    highlights: ["Section-wise checklist", "Document readiness", "Regime comparison prompt", "ITR filing handoff"],
    inputs: ["Income type", "Investment proofs", "Insurance and loan details", "Donation or eligible expense records"],
    outputs: ["Deduction checklist", "Missing document list", "Related ITR filing action", "Expert review recommendation"],
    limitations: ["This page is an informational guide.", "Final eligibility depends on facts and applicable law.", "Use expert review for complex claims."],
    relatedLinks: [
      { label: "Income tax calculator", href: "/calculators/income-tax" },
      { label: "Start ITR filing", href: "/itr/form-selector" },
    ],
  },
  {
    slug: "elss",
    title: "ELSS Tax Saving Guide",
    subtitle: "Investment guide",
    description:
      "Understand ELSS planning, lock-in considerations, tax-saving fit, and when to compare funds before investing.",
    icon: "PiggyBank",
    highlights: ["Tax-saving overview", "Risk checklist", "Lock-in reminder", "Comparison handoff"],
    inputs: ["Investment horizon", "Risk comfort", "Existing 80C usage", "Monthly savings capacity"],
    outputs: ["Planning checklist", "80C usage notes", "Next-step comparison links", "Expert consultation path"],
    limitations: ["This is not investment advice by itself.", "Market returns are not guaranteed.", "Review suitability before investing."],
    relatedLinks: [
      { label: "ELSS comparator", href: "/elss-comparator" },
      { label: "SIP calculator", href: "/calculators/sip" },
    ],
  },
  {
    slug: "epf",
    title: "EPF Planning Guide",
    subtitle: "Payroll benefit guide",
    description:
      "Review EPF basics, employee contribution planning, retirement documentation, and payroll compliance handoffs.",
    icon: "WalletCards",
    highlights: ["Contribution checklist", "Payroll record review", "Retirement planning handoff", "Compliance links"],
    inputs: ["Basic salary", "Employer contribution details", "UAN records", "Withdrawal or transfer need"],
    outputs: ["EPF document checklist", "Planning notes", "Payroll compliance route", "Consultation recommendation"],
    limitations: ["This page is a planning guide.", "Exact balances and claims must be checked on official records.", "Employer-specific rules may apply."],
    relatedLinks: [
      { label: "Labour law compliance", href: "/services/labour-law-compliance" },
      { label: "Tax consultation", href: "/services/tax-consultation" },
    ],
  },
  {
    slug: "gratuity",
    title: "Gratuity Planning Guide",
    subtitle: "Employee benefit guide",
    description:
      "Understand gratuity documentation, eligibility discussion points, and tax planning considerations before exit or retirement.",
    icon: "BadgeIndianRupee",
    highlights: ["Eligibility checklist", "Salary component review", "Exit document readiness", "Tax planning handoff"],
    inputs: ["Joining and exit dates", "Salary components", "Employment type", "Employer gratuity policy"],
    outputs: ["Document checklist", "Questions for employer or advisor", "Tax filing notes", "Consultation route"],
    limitations: ["This page does not calculate statutory entitlement.", "Final numbers depend on official payroll facts.", "Use expert review for disputes."],
    relatedLinks: [
      { label: "Tax consultation", href: "/services/tax-consultation" },
      { label: "ITR filing", href: "/itr/form-selector" },
    ],
  },
  {
    slug: "vda-tax",
    title: "VDA & Crypto Tax Guide",
    subtitle: "Crypto tax guide",
    description:
      "Organize virtual digital asset transaction records, tax questions, and filing handoffs for expert review.",
    icon: "Coins",
    highlights: ["Transaction checklist", "Exchange statement readiness", "TDS review prompt", "ITR filing handoff"],
    inputs: ["Exchange reports", "Wallet transaction records", "Buy and sell history", "TDS statements"],
    outputs: ["Record checklist", "Missing data notes", "Capital gains handoff", "Expert review route"],
    limitations: ["This is an informational guide, not tax computation.", "Crypto tax positions can be fact-sensitive.", "Use expert review before filing."],
    relatedLinks: [
      { label: "Capital gains calculator", href: "/calculators/capital-gains" },
      { label: "ITR filing", href: "/itr/form-selector" },
    ],
  },
];

export const generatedStartupPages: GeneratedStartupPageData[] = [
  {
    slug: "accounting",
    title: "Startup Accounting Setup",
    subtitle: "Finance operations",
    description:
      "Set up clean books, reporting cadence, invoice workflows, and compliance-ready accounting for a growing startup.",
    icon: "BookOpenCheck",
    highlights: ["Chart of accounts setup", "Monthly bookkeeping workflow", "MIS reporting", "Tax-ready records"],
    deliverables: ["Accounting setup checklist", "Monthly close workflow", "Document storage structure", "Compliance calendar"],
    process: ["Review business model", "Map revenue and expense flows", "Set up bookkeeping cadence", "Prepare monthly reporting routine"],
    relatedLinks: [
      { label: "Startup services", href: "/startup-services" },
      { label: "Virtual CFO", href: "/business/virtual-cfo" },
    ],
  },
  {
    slug: "growth",
    title: "Startup Growth Strategy",
    subtitle: "Scale planning",
    description:
      "Build a practical growth roadmap with finance hygiene, funding readiness, compliance planning, and measurable milestones.",
    icon: "TrendingUp",
    highlights: ["Growth roadmap", "Unit economics review", "Funding readiness", "Compliance scaling plan"],
    deliverables: ["Priority roadmap", "Metrics checklist", "Financial reporting suggestions", "Founder action plan"],
    process: ["Assess current stage", "Review revenue and cost drivers", "Identify compliance gaps", "Create the next 90-day plan"],
    relatedLinks: [
      { label: "Startup services", href: "/startup-services" },
      { label: "Funding assistance", href: "/services/funding-assistance" },
    ],
  },
  {
    slug: "planning",
    title: "Startup Business Planning",
    subtitle: "Founder roadmap",
    description:
      "Convert an idea or early-stage business into a clearer operating plan with structure, registrations, finance, and compliance milestones.",
    icon: "Map",
    highlights: ["Entity planning", "Registration roadmap", "Budget outline", "Compliance priorities"],
    deliverables: ["Business plan checklist", "Registration sequence", "Initial compliance map", "Expert action notes"],
    process: ["Clarify business model", "Choose suitable structure", "Map required registrations", "Plan first finance workflows"],
    relatedLinks: [
      { label: "Company registration", href: "/services/company-registration" },
      { label: "Expert consultation", href: "/expert-consultation?service=startup-planning" },
    ],
  },
];

export function findGeneratedServicePage(slug: string) {
  return generatedServicePages.find((page) => page.slug === slug);
}

export function findGeneratedCalculatorPage(slug: string) {
  return generatedCalculatorPages.find((page) => page.slug === slug);
}

export function findGeneratedStartupPage(slug: string) {
  return generatedStartupPages.find((page) => page.slug === slug);
}
