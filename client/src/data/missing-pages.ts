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
  audience: string;
  includedOutcome: string;
  excludedWork: string;
  delayRisk: string;
  escalationTrigger: string;
  nextStep: string;
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
  audience: string;
  includedOutcome: string;
  excludedWork: string;
  delayRisk: string;
  nextStep: string;
  relatedLinks: RelatedLink[];
}

export interface GeneratedRouteSEOConfig {
  title: string;
  description: string;
  keywords: string[];
  type: "website" | "calculator" | "service" | "article";
  calculatorData?: {
    type: string;
    features: string[];
    accuracy: string;
    updates: string;
  };
  serviceData?: {
    price: string;
    rating: string;
    reviews: string;
    availability: string;
  };
  breadcrumbs: { name: string; url: string }[];
  faqItems?: Array<{ q: string; a: string }>;
}

export interface GeneratedRouteContent {
  audience?: string[];
  highlights: string[];
  sections: Array<{ heading: string; body: string; items?: string[] }>;
  links: RelatedLink[];
  faqItems?: Array<{ question: string; answer: string }>;
}

type RawGeneratedServicePageData = Omit<
  GeneratedServicePageData,
  "process" | "faqs" | "audience" | "includedOutcome" | "excludedWork" | "delayRisk" | "escalationTrigger" | "nextStep"
>;

const rawGeneratedServicePages: RawGeneratedServicePageData[] = [
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
    highlights: ["Document-based professional review", "Written action points", "Decision support", "Follow-up guidance"],
    documents: ["PAN or business details", "Current issue summary", "Relevant notices or statements", "Previous filings if available"],
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
    relatedLinks: [
      { label: "Start ITR filing", href: "/itr/start?source=generated_itr_service" },
      { label: "ITR for salaried", href: "/services/itr-for-salaried" },
    ],
  },
  {
    slug: "msme-registration",
    title: "MSME Registration",
    subtitle: "Udyam support",
    description:
      "Get guided MSME/Udyam registration readiness support with business detail review, certificate workflow guidance, and benefit documentation checks.",
    category: "Business Registration",
    priceAmount: 999,
    priceLabel: "Starting ₹999 excluding GST",
    timeline: "1-3 working days",
    icon: "Award",
    highlights: ["Udyam workflow", "Business detail review", "Certificate guidance", "Benefit checklist"],
    documents: ["Aadhaar", "PAN", "Business details", "Bank details"],
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
    relatedLinks: [
      { label: "Document vault", href: "/services/document-vault" },
      { label: "Document scanner", href: "/features/document-scanner" },
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
    relatedLinks: [
      { label: "Investment advisory", href: "/services/investment-advisory" },
      { label: "Withdrawal planner", href: "/calculators/withdrawal-planner" },
    ],
  },
];

type ServiceOperationalProfile = Pick<
  GeneratedServicePageData,
  "audience" | "includedOutcome" | "excludedWork" | "delayRisk" | "escalationTrigger" | "nextStep"
>;

const serviceOperationalProfiles: Record<string, ServiceOperationalProfile> = {
  advisory: {
    audience: "Individuals or business owners deciding between tax, finance, loan, or investment options before committing money or filing documents.",
    includedOutcome: "A written options note that identifies the decision, assumptions, supporting records, risks, and recommended next action.",
    excludedWork: "Execution of a filing, investment transaction, loan application, or legal representation unless separately scoped.",
    delayRisk: "Advice may remain conditional when statements, notices, prior filings, or the amount and timing of the proposed transaction are missing.",
    escalationTrigger: "Escalate when the decision involves a disputed tax position, overseas assets, a live notice, regulated investment advice, or a material transaction.",
    nextStep: "Send the decision you need to make, the deadline, the amount involved, and the records supporting each available option.",
  },
  audit: {
    audience: "Businesses and professionals who may cross a tax-audit threshold or need to prepare books and evidence for an appointed auditor.",
    includedOutcome: "A readiness review of books, reconciliations, supporting schedules, and open items for tax-audit coordination.",
    excludedWork: "The statutory audit opinion, certification, or representation before an authority unless the appointed professional confirms that scope.",
    delayRisk: "Unclosed books, unexplained bank entries, missing invoices, or turnover differences between GST records and accounts can delay completion.",
    escalationTrigger: "Escalate when the audit threshold is uncertain, records conflict materially, a deadline is close, or a prior-year qualification remains unresolved.",
    nextStep: "Share the latest trial balance, ledgers, bank statements, GST returns, and the date by which the audit file must be ready.",
  },
  "business-advisory": {
    audience: "Founders and owner-managed businesses choosing a structure, finance workflow, registration path, or recurring compliance plan.",
    includedOutcome: "A prioritized roadmap covering the stated business decision, dependencies, registrations, finance controls, and immediate actions.",
    excludedWork: "Company secretarial filings, legal drafting, fundraising execution, bookkeeping, or tax returns unless separately agreed.",
    delayRisk: "Recommendations become unreliable when ownership, revenue model, customer location, funding plans, or current registrations are unclear.",
    escalationTrigger: "Escalate before adding investors, changing ownership, entering a regulated activity, or signing a high-value contract.",
    nextStep: "Describe the business model, owners, current revenue, planned change, and the decision deadline.",
  },
  "director-identification": {
    audience: "Proposed or existing company directors who need DIN-related document readiness, KYC support, or correction guidance.",
    includedOutcome: "A DIN/KYC readiness check, document-gap list, and the appropriate filing or correction route.",
    excludedWork: "Company incorporation, director appointment, resignation, or adjudication work unless separately scoped.",
    delayRisk: "Name, address, mobile, email, signature, or identity-proof mismatches can stop validation or require correction first.",
    escalationTrigger: "Escalate when a DIN is deactivated, duplicate, linked to disputed records, or connected with a compliance notice.",
    nextStep: "Share the director's identity and address proofs, existing DIN details if any, and the exact portal or company action required.",
  },
  "document-storage": {
    audience: "Taxpayers and businesses that need a structured, retrievable record set for filings, notices, renewals, or professional review.",
    includedOutcome: "An organized document index with agreed folders, missing-record flags, and a handoff list for the relevant workflow.",
    excludedWork: "Verification of authenticity, statutory record-retention advice, physical custody, or filing work unless separately scoped.",
    delayRisk: "Unreadable scans, inconsistent names, missing periods, and files without a clear source or purpose slow classification.",
    escalationTrigger: "Escalate when records contain sensitive third-party data, a notice deadline, suspected alteration, or unresolved ownership.",
    nextStep: "Identify the tax year or compliance workflow, then upload the available records using clear file names and dates.",
  },
  dsc: {
    audience: "Directors, authorized signatories, professionals, and business users who need a digital signature for a defined portal workflow.",
    includedOutcome: "A DSC document-readiness check, application coordination, and guidance for the intended portal use.",
    excludedWork: "Portal filings, token hardware replacement, or correction of unrelated identity records unless separately scoped.",
    delayRisk: "Identity mismatches, invalid address proof, unavailable video verification, or an incorrect applicant class can delay issuance.",
    escalationTrigger: "Escalate when an existing DSC is lost, compromised, mapped to the wrong person, or needed for an urgent statutory filing.",
    nextStep: "Confirm who needs the DSC, the portal where it will be used, and whether an existing certificate or token is involved.",
  },
  "esi-registration": {
    audience: "Employers assessing ESIC applicability or preparing employee and establishment details for registration.",
    includedOutcome: "An applicability check, establishment and employee document list, and registration-readiness file.",
    excludedWork: "Payroll processing, ongoing contribution filing, inspection representation, or dispute handling unless separately scoped.",
    delayRisk: "Incomplete employee records, wage data, establishment proof, or uncertainty about the applicability date can delay registration.",
    escalationTrigger: "Escalate when coverage should have started earlier, employee counts fluctuate around the threshold, or an ESIC notice exists.",
    nextStep: "Share the establishment location, activity, employee count, wage summary, and the date the threshold may have been crossed.",
  },
  "foreign-remittance": {
    audience: "Residents and businesses planning an overseas remittance that may require purpose-code, TCS, Form 15CA/15CB, or bank-document review.",
    includedOutcome: "A remittance-readiness note covering purpose, tax-document route, available evidence, and bank submission checklist.",
    excludedWork: "Bank approval, FEMA legal opinion, valuation, transfer execution, or certification unless separately scoped.",
    delayRisk: "An unclear remittance purpose, missing agreement or invoice, tax-residency gaps, or inconsistent beneficiary details can stop processing.",
    escalationTrigger: "Escalate for related-party payments, capital-account transactions, disputed withholding, sanctions concerns, or urgent high-value transfers.",
    nextStep: "Share the remittance purpose, amount, currency, beneficiary country, agreement or invoice, and bank's requested document list.",
  },
  "gst-return": {
    audience: "GST-registered businesses that need a return prepared from reconciled sales, purchase, tax-payment, and input-credit records.",
    includedOutcome: "Preparation support for the agreed GST return period, with mismatch flags and filing-status evidence.",
    excludedWork: "Bookkeeping reconstruction, registration amendments, refund claims, notice replies, or litigation unless separately scoped.",
    delayRisk: "Late sales data, missing invoices, GSTR-2B differences, incorrect tax classification, or insufficient cash-ledger balance can delay filing.",
    escalationTrigger: "Escalate when turnover differs materially from books, ITC is disputed, a prior return is missing, or a notice has been issued.",
    nextStep: "Confirm the GSTIN and return period, then share sales data, purchase records, GSTR-2B, amendments, and payment details.",
  },
  "home-loan": {
    audience: "Borrowers comparing a home-loan decision or checking the tax and cash-flow effect of an existing loan.",
    includedOutcome: "A documented comparison of repayment, interest, tax considerations, affordability assumptions, and questions for the lender.",
    excludedWork: "Loan sanction, property legal due diligence, valuation, credit repair, or investment recommendation unless separately scoped.",
    delayRisk: "Comparisons are incomplete without the sanction terms, rate type, repayment schedule, borrower income, and property-use details.",
    escalationTrigger: "Escalate before a balance transfer, co-borrower change, large prepayment, disputed interest certificate, or property-tax claim.",
    nextStep: "Share the loan offer or statement, repayment schedule, property use, borrower details, and the decision you are comparing.",
  },
  "investment-advisory": {
    audience: "Individuals and families organizing goals, risk constraints, tax considerations, and existing investments before making a decision.",
    includedOutcome: "A documented planning discussion covering goals, current holdings, constraints, tax questions, and agreed follow-up actions.",
    excludedWork: "Portfolio management, product distribution, guaranteed returns, trade execution, or regulated recommendations outside confirmed scope.",
    delayRisk: "A recommendation cannot be responsibly assessed without complete holdings, liabilities, time horizon, liquidity needs, and risk capacity.",
    escalationTrigger: "Escalate for concentrated holdings, borrowed-money investing, complex products, cross-border assets, or near-term liquidity pressure.",
    nextStep: "Share goals, dates, existing holdings, liabilities, monthly cash flow, and the specific decision that needs review.",
  },
  "itr-filing": {
    audience: "Individuals with salary, house property, investments, capital gains, foreign assets, or business income preparing an income-tax return.",
    includedOutcome: "Preparation and filing support for the confirmed return scope, including document review, computation, and acknowledgement handoff.",
    excludedWork: "Notice response, audit, valuation, bookkeeping reconstruction, or correction of unrelated prior-year filings unless separately scoped.",
    delayRisk: "Missing income records, AIS/Form 26AS mismatches, unclear capital gains, foreign disclosures, or unpaid self-assessment tax can delay filing.",
    escalationTrigger: "Escalate for foreign assets, trading or business losses, a large refund, conflicting records, a notice, or uncertainty about the ITR form.",
    nextStep: "Confirm the assessment year and income sources, then share Form 16, AIS, Form 26AS, statements, deduction proofs, and prior-return details.",
  },
  "msme-registration": {
    audience: "Eligible proprietors, firms, LLPs, and companies seeking Udyam registration or correction of an existing MSME record.",
    includedOutcome: "An eligibility and document-readiness check followed by support for the agreed Udyam registration or update.",
    excludedWork: "Loan approval, subsidy approval, tender eligibility, or correction of PAN/GST records unless separately scoped.",
    delayRisk: "PAN, Aadhaar, GST, activity, ownership, or turnover/investment inconsistencies can prevent or distort registration.",
    escalationTrigger: "Escalate when an existing Udyam record is incorrect, ownership changed, classification is disputed, or a benefit deadline depends on it.",
    nextStep: "Share the entity type, PAN, Aadhaar, GSTIN where applicable, activity details, and whether a Udyam number already exists.",
  },
  "pan-card": {
    audience: "Individuals or entities applying for a PAN or correcting identity, address, name, or status information on an existing record.",
    includedOutcome: "A PAN application or correction readiness check, document list, and submission-support path.",
    excludedWork: "Resolution of duplicate PAN penalties, complex legal-name disputes, or unrelated tax-return corrections unless separately scoped.",
    delayRisk: "Identity, date-of-birth, signature, address, or supporting-document mismatches can lead to rejection or further proof requests.",
    escalationTrigger: "Escalate for duplicate PANs, deceased holders, foreign applicants, disputed identity records, or an active tax notice.",
    nextStep: "State whether this is a new PAN or correction, then share the applicant type, identity proof, address proof, and existing PAN if any.",
  },
  "professional-tax": {
    audience: "Employers, professionals, and businesses checking state-specific professional-tax registration, enrolment, payment, or return obligations.",
    includedOutcome: "An applicability note and readiness checklist for the relevant state registration or recurring compliance action.",
    excludedWork: "Payroll processing, employee dispute handling, multi-state legal opinion, or notice representation unless separately scoped.",
    delayRisk: "The wrong state, entity type, employee count, salary data, or liability start date can lead to incorrect registration or arrears.",
    escalationTrigger: "Escalate when liability began in an earlier period, multiple states are involved, or an assessment or recovery notice exists.",
    nextStep: "Share the work location, entity type, employee and salary summary, current registrations, and the date operations began.",
  },
  "startup-india": {
    audience: "DPIIT-eligible startups preparing recognition documents or checking whether recognition supports a specific business objective.",
    includedOutcome: "An eligibility and evidence review plus support for the agreed Startup India recognition workflow.",
    excludedWork: "Guarantee of recognition, tax-exemption approval, funding, patent work, or incorporation unless separately scoped.",
    delayRisk: "Weak innovation evidence, unclear entity details, inconsistent incorporation records, or missing authorization can delay the application.",
    escalationTrigger: "Escalate when recognition is tied to a tender, tax benefit, funding deadline, ownership change, or earlier rejection.",
    nextStep: "Share the incorporation details, DPIIT objective, product or process note, website or evidence, and the target deadline.",
  },
  "tan-registration": {
    audience: "Businesses, employers, and other deductors that need a TAN before depositing or reporting tax deducted at source.",
    includedOutcome: "An applicability and document-readiness check followed by support for the agreed TAN application.",
    excludedWork: "TDS calculation, challan payment, return filing, correction statements, or notice response unless separately scoped.",
    delayRisk: "Entity-name, address, category, responsible-person, or PAN inconsistencies can cause application or downstream TDS problems.",
    escalationTrigger: "Escalate when deductions already occurred without a TAN, duplicate TANs exist, or a TDS default or notice is involved.",
    nextStep: "Share the deductor type, PAN, address, responsible-person details, and why or when TDS obligations begin.",
  },
  "tax-consultation": {
    audience: "Taxpayers who need a focused answer before filing, paying, correcting a return, or responding to a tax communication.",
    includedOutcome: "A written next-action note based on the question, records reviewed, assumptions, and material unresolved risks.",
    excludedWork: "Return filing, notice response, certification, valuation, or legal representation unless separately scoped.",
    delayRisk: "The answer may remain conditional when the assessment year, amounts, source records, deadlines, or exact communication are missing.",
    escalationTrigger: "Escalate for a live notice, foreign assets, disputed classification, high-value transaction, expiring deadline, or conflicting advice.",
    nextStep: "Send one clear question, the relevant assessment year, deadline, amounts, and the documents that created the uncertainty.",
  },
  "wealth-management": {
    audience: "Individuals and families coordinating long-term goals, investments, liabilities, protection needs, and tax records.",
    includedOutcome: "A planning summary that maps goals, current position, identified gaps, tax considerations, and agreed review actions.",
    excludedWork: "Discretionary portfolio management, guaranteed returns, legal estate documents, or product execution unless separately scoped.",
    delayRisk: "Planning remains incomplete without a full asset, liability, cash-flow, insurance, nominee, and goal-date picture.",
    escalationTrigger: "Escalate for cross-border assets, succession concerns, concentrated exposure, major liquidity events, or conflicting family ownership.",
    nextStep: "Share the family goals, target dates, assets, liabilities, insurance, cash flow, and the decision that needs priority.",
  },
};

function serviceSpecificProcess(page: RawGeneratedServicePageData, profile: ServiceOperationalProfile) {
  return [
    profile.nextStep,
    `${page.title}: confirm the agreed outcome and exclusions before work begins: ${profile.includedOutcome}`,
    `${page.title}: check the records most likely to change the route or timing, including ${page.documents.slice(0, 3).join(", ")}.`,
    `${page.title}: receive the agreed deliverable, unresolved-risk note, and next action; the indicative timeline is ${page.timeline}.`,
  ];
}

function serviceSpecificFaqs(page: RawGeneratedServicePageData, profile: ServiceOperationalProfile) {
  return [
    {
      question: `${page.subtitle}: what is included?`,
      answer: profile.includedOutcome,
    },
    {
      question: `${page.documents[0]}: what needs a separate scope?`,
      answer: profile.excludedWork,
    },
    {
      question: `${page.documents[1] ?? page.documents[0]}: what can affect timing?`,
      answer: `${profile.delayRisk} ${profile.escalationTrigger}`,
    },
  ];
}

export const generatedServicePages: GeneratedServicePageData[] = rawGeneratedServicePages.map((page) => {
  const profile = serviceOperationalProfiles[page.slug];
  if (!profile) throw new Error(`Missing operational content for generated service page: ${page.slug}`);
  return {
    ...page,
    ...profile,
    process: serviceSpecificProcess(page, profile),
    faqs: serviceSpecificFaqs(page, profile),
  };
});

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
      { label: "Start ITR filing", href: "/itr/start?source=generated_deductions_page" },
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
      { label: "ITR filing", href: "/itr/start?source=generated_gratuity_page" },
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
      { label: "ITR filing", href: "/itr/start?source=generated_vda_page" },
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
    audience: "Founders moving from informal spreadsheets or fragmented records to a repeatable accounting close.",
    includedOutcome: "a chart-of-accounts decision, document flow, closing calendar, and reporting responsibility map.",
    excludedWork: "historical bookkeeping cleanup, statutory audit, tax filing, and implementation inside a selected accounting platform unless separately agreed.",
    delayRisk: "The setup stalls when bank, invoice, payroll, expense, and founder-transaction records cannot be assigned to a period and owner.",
    nextStep: "Begin with one recent month, reconcile its bank and invoice trail, then confirm who closes and reviews the books.",
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
    audience: "Founders who have early traction and need to connect growth targets with cash, unit economics, reporting, and compliance capacity.",
    includedOutcome: "a prioritised 90-day roadmap with named metrics, finance checks, operating constraints, and founder actions.",
    excludedWork: "sales execution, fundraising guarantees, product delivery, and continuing finance or compliance operations unless separately agreed.",
    delayRisk: "A growth plan becomes unreliable when revenue quality, customer acquisition cost, gross margin, runway, or delivery capacity is not measured consistently.",
    nextStep: "Choose the single growth constraint to test first and assign its metric, owner, budget, and review date.",
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
    audience: "Idea-stage and early-stage founders deciding how the business will earn, operate, register, and fund its first milestones.",
    includedOutcome: "a founder decision record covering the business model, entity options, initial registrations, budget assumptions, and first compliance tasks.",
    excludedWork: "incorporation filings, licences, contracts, fundraising, and detailed financial projections unless separately scoped.",
    delayRisk: "Planning remains incomplete when founder ownership, target customer, revenue model, regulated activity, location, or starting budget is unresolved.",
    nextStep: "Document the first customer transaction from sale to collection and use it to test the proposed structure, registrations, and finance workflow.",
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

function generatedKeywordSet(values: Array<string | string[] | undefined>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

export function getGeneratedRouteSEOConfig(route: string): GeneratedRouteSEOConfig | undefined {
  const normalizedRoute = route === "/" ? "/" : `/${route.split("?")[0].split("#")[0].split("/").filter(Boolean).join("/")}`;

  if (normalizedRoute.startsWith("/services/")) {
    const slug = normalizedRoute.replace("/services/", "");
    const page = findGeneratedServicePage(slug);
    if (!page) return undefined;

    return {
      title: `${page.title} Online | ${page.category} | MyeCA.in`,
      description: page.description,
      keywords: generatedKeywordSet([
        page.title,
        page.subtitle,
        page.category,
        page.highlights,
        page.documents,
        "MyeCA services",
      ]),
      type: "service",
      serviceData: {
        price: String(page.priceAmount),
        rating: "Unrated",
        reviews: "0",
        availability: "InStock",
      },
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Services", url: "/services" },
        { name: page.title, url: normalizedRoute },
      ],
      faqItems: page.faqs.map((faq) => ({ q: faq.question, a: faq.answer })),
    };
  }

  if (normalizedRoute.startsWith("/calculators/")) {
    const slug = normalizedRoute.replace("/calculators/", "");
    const page = findGeneratedCalculatorPage(slug);
    if (!page) return undefined;

    return {
      title: `${page.title} | Checklist & Filing Handoff | MyeCA.in`,
      description: page.description,
      keywords: generatedKeywordSet([
        page.title,
        page.subtitle,
        page.highlights,
        page.inputs,
        page.outputs,
        "tax calculator India",
      ]),
      type: "calculator",
      calculatorData: {
        type: page.title,
        features: page.highlights,
        accuracy: "Informational planning guide",
        updates: "AY 2026-27 supported",
      },
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Calculators", url: "/calculators" },
        { name: page.title, url: normalizedRoute },
      ],
    };
  }

  if (normalizedRoute.startsWith("/startup/")) {
    const slug = normalizedRoute.replace("/startup/", "");
    const page = findGeneratedStartupPage(slug);
    if (!page) return undefined;

    return {
      title: `${page.title} Services India | MyeCA.in`,
      description: page.description,
      keywords: generatedKeywordSet([
        page.title,
        page.subtitle,
        page.highlights,
        page.deliverables,
        "startup compliance India",
      ]),
      type: "service",
      serviceData: {
        price: "0",
        rating: "Unrated",
        reviews: "0",
        availability: "InStock",
      },
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Startup Services", url: "/startup-services" },
        { name: page.title, url: normalizedRoute },
      ],
    };
  }

  return undefined;
}

export function getGeneratedRouteContent(route: string): GeneratedRouteContent | undefined {
  const normalizedRoute = route === "/" ? "/" : `/${route.split("?")[0].split("#")[0].split("/").filter(Boolean).join("/")}`;

  if (normalizedRoute.startsWith("/services/")) {
    const page = findGeneratedServicePage(normalizedRoute.replace("/services/", ""));
    if (!page) return undefined;
    return {
      audience: [page.audience],
      highlights: page.highlights,
      sections: [
        {
          heading: `Who this ${page.category.toLowerCase()} service is for`,
          body: page.audience,
          items: [`Category: ${page.category}`, `Indicative timeline: ${page.timeline}`, `Starting scope: ${page.priceLabel}`],
        },
        {
          heading: `${page.subtitle}: ${page.documents[0]} readiness`,
          body: `Start with ${page.documents[0]} and compare it with ${page.documents[1] ?? "the next listed record"}. ${page.delayRisk}`,
          items: page.documents,
        },
        {
          heading: `${page.subtitle}: scope, timing, and escalation`,
          body: `The included outcome is ${page.includedOutcome} Outside the initial scope is ${page.excludedWork}`,
          items: [...page.process, `Delay risk: ${page.delayRisk}`, `Escalation trigger: ${page.escalationTrigger}`],
        },
      ],
      links: page.relatedLinks,
      faqItems: page.faqs,
    };
  }

  if (normalizedRoute.startsWith("/calculators/")) {
    const page = findGeneratedCalculatorPage(normalizedRoute.replace("/calculators/", ""));
    if (!page) return undefined;
    return {
      highlights: page.highlights,
      sections: [
        {
          heading: `${page.title}: output and intended use`,
          body: `${page.description} The result is only as useful as the ${page.inputs.slice(0, 3).join(", ").toLowerCase()} entered, so keep those inputs with the estimate or checklist.`,
          items: page.outputs,
        },
        {
          heading: `${page.title}: inputs to verify`,
          body: `Verify ${page.inputs.join(", ").toLowerCase()}. Check the applicable dates, amounts, and period for ${page.outputs[0].toLowerCase()} because a changed assumption can alter the result.`,
          items: page.inputs,
        },
        {
          heading: `${page.title}: limitations before acting`,
          body: `The output covers ${page.outputs.slice(0, 3).join(", ").toLowerCase()}. It cannot resolve disputed facts or determine ${page.outputs[0].toLowerCase()} from incomplete records; use the listed limitations and related links before acting.`,
          items: page.limitations,
        },
      ],
      links: page.relatedLinks,
    };
  }

  if (normalizedRoute.startsWith("/startup/")) {
    const page = findGeneratedStartupPage(normalizedRoute.replace("/startup/", ""));
    if (!page) return undefined;
    return {
      highlights: page.highlights,
      sections: [
        {
          heading: `${page.title}: who it is for and what it should settle`,
          body: `${page.audience} ${page.description} The included planning outcome is ${page.includedOutcome}`,
          items: page.deliverables,
        },
        {
          heading: `${page.title}: records and working process`,
          body: `Work through ${page.process.join(", ").toLowerCase()}. ${page.delayRisk}`,
          items: page.process,
        },
        {
          heading: `${page.title}: exclusions and next decision`,
          body: `Outside the initial scope is ${page.excludedWork} ${page.nextStep}`,
          items: [`Included outcome: ${page.includedOutcome}`, `Next decision: ${page.nextStep}`],
        },
      ],
      links: page.relatedLinks,
    };
  }

  return undefined;
}

export function getGeneratedPublicRoutes() {
  return [
    ...generatedServicePages.map((page) => `/services/${page.slug}`),
    ...generatedCalculatorPages.map((page) => `/calculators/${page.slug}`),
    ...generatedStartupPages.map((page) => `/startup/${page.slug}`),
  ];
}
