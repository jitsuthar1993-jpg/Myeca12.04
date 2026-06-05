export type ServiceCtaLabel = "Start ITR" | "Request scope review" | "Open calculator" | "View service";

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  section: string;
  icon: string;
  path?: string;
  price?: string;
  turnaround: string;
  documents: string[];
  checks: string[];
  ctaLabel: ServiceCtaLabel;
  popular?: boolean;
}

export const allServices: Service[] = [
  {
    id: "itr-filing",
    title: "ITR filing with document checklist",
    description: "Start with the right ITR form, upload salary, AIS, capital gains, or business papers, and choose CA-assisted review when the facts need it.",
    category: "Income tax filing",
    section: "Services",
    icon: "FileText",
    path: "/itr/start?source=all_services_itr_filing",
    price: "₹499 - ₹2,999 excluding GST",
    popular: true
  },
  {
    id: "capital-gains-filing",
    title: "Capital gains ITR review",
    description: "For equity, mutual fund, ESOP, crypto, or property sale cases where broker statements and AIS details need reconciliation before filing.",
    category: "Income tax filing",
    section: "Services",
    icon: "TrendingUp",
    path: "/capital-gains-import",
    price: "Scoped after document review",
    turnaround: "Usually 2-4 business days after usable broker reports are available",
    documents: ["Broker capital gains report", "AIS capital gains entries", "Purchase and sale details"],
    checks: ["Short-term and long-term classification", "AIS vs broker report differences", "Carry-forward loss treatment"],
    ctaLabel: "Request scope review",
    popular: true,
  },
  {
    id: "notice-compliance",
    title: "Income-tax notice response",
    description: "Share the notice summary first, then prepare the response path with the notice PDF, return copy, and supporting documents.",
    category: "Notice and compliance",
    section: "Services",
    icon: "AlertTriangle",
    path: "/services/notice-compliance",
    price: "Starts at Rs 1,999 excluding GST",
    turnaround: "Timeline depends on notice date, portal access, and document readiness",
    documents: ["Notice PDF or DIN", "Filed ITR and computation", "Evidence for the disputed item"],
    checks: ["Response deadline", "Mismatch or demand reason", "Documents needed before portal reply"],
    ctaLabel: "Request scope review",
    popular: true,
  },
  {
    id: "gst-registration",
    title: "GST registration",
    description: "Set up GST registration with promoter, address, bank, and business activity details reviewed before the application is filed.",
    category: "GST and business tax",
    section: "Services",
    icon: "Receipt",
    path: "/services/gst-registration",
    price: "Starts at Rs 999 excluding GST",
    turnaround: "Usually 3-7 business days after Aadhaar, address, and business proofs are ready",
    documents: ["PAN and Aadhaar details", "Business address proof", "Bank proof or cancelled cheque"],
    checks: ["Business constitution fit", "Place of business proof", "HSN/SAC and activity description"],
    ctaLabel: "View service",
  },
  {
    id: "gst-returns",
    title: "GST return review and filing",
    description: "Monthly or quarterly GST return support for businesses that need sales, purchase, ITC, and liability checks before filing.",
    category: "GST and business tax",
    section: "Services",
    icon: "Receipt",
    path: "/services/gst-returns",
    price: "Scoped by filing frequency and volume",
    turnaround: "Usually 2-5 business days after sales and purchase data is complete",
    documents: ["Sales register", "Purchase register", "GST portal summary"],
    checks: ["Output tax and ITC summary", "Missing invoice patterns", "Return period and due date readiness"],
    ctaLabel: "Request scope review",
  },
  {
    id: "tds-filing",
    title: "TDS return filing",
    description: "Quarterly TDS filing support for salary, contractor, rent, professional fee, or interest deductions with challan matching.",
    category: "GST and business tax",
    section: "Services",
    icon: "PiggyBank",
    path: "/services/tds-filing",
    price: "Starts at Rs 799 excluding GST",
    turnaround: "Usually 2-4 business days after challans and deductee data are complete",
    documents: ["Deductee PAN list", "TDS challan details", "Salary or payment register"],
    checks: ["Challan and quarter mapping", "Section and rate reasonableness", "PAN format and deductee completeness"],
    ctaLabel: "View service",
  },
  {
    id: "tax-audit",
    title: "Tax audit and business ITR scope review",
    description: "For businesses, professionals, F&O, or turnover-linked cases where audit applicability and filing work should be clarified first.",
    category: "Business compliance",
    section: "Services",
    icon: "Shield",
    path: "/services/audit-services",
    price: "Quoted after books and turnover review",
    turnaround: "Timeline depends on books status, turnover, and audit applicability",
    documents: ["Books or trial balance", "Bank statements", "Sales and purchase summaries"],
    checks: ["Audit applicability", "Books readiness", "Tax audit and ITR dependency"],
    ctaLabel: "Request scope review",
  },
  {
    id: "company-registration",
    title: "Private limited company registration",
    description: "Incorporation support with name, director, address, shareholding, and basic compliance requirements reviewed before filing.",
    category: "Business setup",
    section: "Startup",
    icon: "Building2",
    path: "/services/company-registration",
    price: "Starts at Rs 6,999 excluding GST and government fees",
    turnaround: "Usually 7-12 business days after documents and name approval inputs are ready",
    documents: ["Director PAN and Aadhaar", "Registered office proof", "Proposed name and shareholding details"],
    checks: ["Name availability inputs", "Director KYC readiness", "Post-incorporation compliance needs"],
    ctaLabel: "View service",
    popular: true,
  },
  {
    id: "startup-india",
    title: "Startup India recognition",
    description: "Support for DPIIT recognition readiness, including business activity summary, incorporation records, and founder details.",
    category: "Business setup",
    section: "Startup",
    icon: "Award",
    path: "/services/startup-india-registration",
    price: "Scoped after eligibility review",
    turnaround: "Usually 3-7 business days after incorporation and business details are ready",
    documents: ["Incorporation certificate", "Business activity note", "Founder and entity details"],
    checks: ["Entity eligibility", "Activity description clarity", "Application document completeness"],
    ctaLabel: "Request scope review",
  },
  {
    id: "msme-registration",
    title: "MSME / Udyam registration",
    description: "Udyam registration support for proprietors, firms, and companies with activity, investment, and turnover details checked first.",
    category: "Business setup",
    section: "Startup",
    icon: "Award",
    path: "/services/msme-udyam-registration",
    price: "Starts at Rs 999 excluding GST",
    turnaround: "Usually 1-2 business days after entity and activity details are complete",
    documents: ["PAN and Aadhaar details", "Business activity details", "Investment and turnover inputs"],
    checks: ["Entity and owner mapping", "NIC/activity selection", "Registration detail accuracy"],
    ctaLabel: "View service",
  },
  {
    id: "partnership-deed",
    title: "Partnership Deed",
    description: "Legal partnership agreement",
    category: "Business Services",
    section: "Services",
    icon: "FileText",
    path: "/services/activate/partnership-deed",
    price: "₹2,999 excluding GST"
  },
  {
    id: "annual-compliance",
    title: "Annual Compliance",
    description: "Complete ROC compliance",
    category: "Business Services",
    section: "Services", 
    icon: "Shield",
    path: "/services/compliance-management",
    price: "₹8,999 excluding GST"
  },

  // SERVICES SECTION - Tools & Calculators
  {
    id: "income-tax-calculator",
    title: "Income Tax Calculator",
    description: "Calculate your income tax",
    category: "Tools & Calculators",
    section: "Services",
    icon: "Calculator",
    path: "/calculators/income-tax"
  },
  {
    id: "hra-calculator", 
    title: "HRA Calculator",
    description: "House rent allowance calculator",
    category: "Tools & Calculators",
    section: "Services",
    icon: "Home",
    path: "/calculators/hra"
  },
  {
    id: "sip-calculator",
    title: "SIP Calculator",
    description: "Systematic investment planning",
    category: "Tools & Calculators", 
    section: "Services",
    icon: "TrendingUp",
    path: "/calculators/sip"
  },
  {
    id: "all-calculators",
    title: "All Calculators",
    description: "Complete financial toolkit",
    category: "Tools & Calculators",
    section: "Services",
    icon: "Grid",
    path: "/calculators"
  },

  // ITR FILING SECTION - ITR Filing Services
  {
    id: "start-itr-filing",
    title: "Start ITR Filing",
    description: "Quick & accurate filing",
    category: "ITR Filing Services",
    section: "ITR Filing",
    icon: "FileText",
    path: "/itr/start?source=all_services_start_itr",
    popular: true
  },
  {
    id: "tax-dashboard",
    title: "Tax Dashboard",
    description: "View your progress",
    category: "ITR Filing Services", 
    section: "ITR Filing",
    icon: "BarChart3",
    path: "/services/itr-filing"
  },
  {
    id: "document-vault",
    title: "Document Vault", 
    description: "Manage documents securely",
    category: "ITR Filing Services",
    section: "ITR Filing",
    icon: "FileText",
    path: "/services/document-vault"
  },
  {
    id: "manage-profiles",
    title: "Manage Profiles",
    description: "Family tax filing made easy",
    category: "ITR Filing Services",
    section: "ITR Filing", 
    icon: "Users",
    path: "/itr/start?source=all_services_manage_profiles"
  },

  // ITR FILING SECTION - Support & Resources
  {
    id: "expert-help",
    title: "Expert Help",
    description: "Professional CA assistance",
    category: "Support & Resources",
    section: "ITR Filing",
    icon: "HelpCircle",
    path: "/pricing"
  },
  {
    id: "tax-guides",
    title: "Tax Guides",
    description: "Learn tax rules and regulations",
    category: "Support & Resources",
    section: "ITR Filing",
    icon: "BookOpen",
    path: "/blog"
  },
  {
    id: "ai-tax-assistant",
    title: "AI Tax Assistant", 
    description: "Smart tax guidance",
    category: "Support & Resources",
    section: "ITR Filing",
    icon: "Bot", 
    path: "/advanced-features"
  },
  {
    id: "tax-analytics",
    title: "Tax Analytics",
    description: "Insights and trends",
    category: "Support & Resources", 
    section: "ITR Filing",
    icon: "BarChart3",
    path: "/analytics"
  },

  // STARTUP SECTION - Business Setup
  {
    id: "startup-company-registration",
    title: "Company Registration",
    description: "Start your business journey",
    category: "Business Setup",
    section: "Startup",
    icon: "Building2", 
    path: "/services/company-registration",
    price: "₹6,999 excluding GST",
    popular: true
  },
  {
    id: "legal-documentation",
    title: "Legal Documentation",
    description: "Complete paperwork assistance",
    category: "Business Setup",
    section: "Startup",
    icon: "FileText",
    path: "/services/activate/legal-documentation",
    price: "₹2,999 excluding GST"
  },
  {
    id: "compliance-setup",
    title: "Compliance Setup", 
    description: "Stay legally compliant",
    category: "Business Setup",
    section: "Startup",
    icon: "Shield",
    path: "/services/compliance-management",
    price: "₹4,999 excluding GST"
  },

  // STARTUP SECTION - Financial Services
  {
    id: "accounting-setup",
    title: "Accounting Setup",
    description: "Financial management system",
    category: "Financial Services",
    section: "Startup",
    icon: "Calculator",
    path: "/startup/accounting",
    price: "₹3,999 excluding GST"
  },
  {
    id: "banking-solutions",
    title: "Banking Solutions",
    description: "Business account opening",
    category: "Financial Services",
    section: "Startup", 
    icon: "CreditCard",
    path: "/services/activate/banking-solutions",
    price: "₹1,999 excluding GST"
  },
  {
    id: "investment-guidance",
    title: "Investment Guidance",
    description: "Grow your startup capital",
    category: "Financial Services",
    section: "Startup",
    icon: "TrendingUp",
    path: "/services/activate/investment-guidance",
    price: "₹5,999 excluding GST"
  },

  // STARTUP SECTION - Support & Growth
  {
    id: "expert-consultation",
    title: "Expert Consultation",
    description: "Strategic business guidance",
    category: "Support & Growth",
    section: "Startup",
    icon: "MessageCircle",
    path: "/expert-consultation",
    price: "₹2,999 excluding GST"
  },
  {
    id: "business-planning",
    title: "Business Planning",
    description: "Blueprint for success",
    category: "Support & Growth", 
    section: "Startup",
    icon: "BookOpen",
    path: "/startup/planning",
    price: "₹4,999 excluding GST"
  },
  {
    id: "growth-strategies",
    title: "Growth Strategies",
    description: "Scale your business effectively", 
    category: "Support & Growth",
    section: "Startup",
    icon: "Award",
    path: "/services/trademark-registration",
    price: "Starts at Rs 3,999 excluding GST and government fees",
    turnaround: "Usually 3-5 business days after class and applicant details are clear",
    documents: ["Logo or wordmark", "Applicant identity details", "Goods or services description"],
    checks: ["Class selection", "Applicant type and fee category", "Basic filing readiness"],
    ctaLabel: "View service",
  },
  {
    id: "compliance-management",
    title: "Company compliance calendar",
    description: "Plan ROC, income-tax, GST, TDS, and recurring filings so business owners know what is due before deadlines arrive.",
    category: "Business compliance",
    section: "Startup",
    icon: "Shield",
    path: "/services/compliance-management",
    price: "Quoted by entity type and filing volume",
    turnaround: "Initial calendar usually 2-4 business days after entity details are shared",
    documents: ["Entity registration details", "Last filed returns", "GST/TDS registration status"],
    checks: ["Recurring due dates", "Missed filing exposure", "Owner and document responsibilities"],
    ctaLabel: "Request scope review",
  },
  {
    id: "income-tax-calculator",
    title: "Income tax calculator",
    description: "Estimate tax under the current slabs using salary, deductions, regime choice, and basic income inputs before choosing a filing path.",
    category: "Tax calculators",
    section: "Calculators",
    icon: "Calculator",
    path: "/calculators/income-tax",
    turnaround: "Instant estimate in the browser",
    documents: ["Salary or income estimate", "Deduction details", "Regime preference if known"],
    checks: ["Old vs new regime inputs", "Basic deduction impact", "Estimated tax liability"],
    ctaLabel: "Open calculator",
  },
  {
    id: "tax-regime-calculator",
    title: "Old vs new regime comparison",
    description: "Compare tax under both regimes using income, exemptions, deductions, and employer inputs before final filing decisions.",
    category: "Tax calculators",
    section: "Calculators",
    icon: "Calculator",
    path: "/calculators/tax-regime",
    turnaround: "Instant estimate in the browser",
    documents: ["Annual salary breakup", "Eligible deduction amounts", "HRA or exemption details"],
    checks: ["Regime difference", "Deduction sensitivity", "Data gaps before filing"],
    ctaLabel: "Open calculator",
  },
  {
    id: "hra-calculator",
    title: "HRA calculator",
    description: "Estimate eligible HRA exemption using salary, rent paid, city type, and employer HRA details.",
    category: "Tax calculators",
    section: "Calculators",
    icon: "Home",
    path: "/calculators/hra",
    turnaround: "Instant estimate in the browser",
    documents: ["Basic salary and DA", "Rent paid details", "HRA received from employer"],
    checks: ["Metro or non-metro treatment", "Rent vs salary limits", "Employer declaration readiness"],
    ctaLabel: "Open calculator",
  },
  {
    id: "capital-gains-calculator",
    title: "Capital gains calculator",
    description: "Estimate STCG or LTCG on investments before uploading broker reports for filing or review.",
    category: "Tax calculators",
    section: "Calculators",
    icon: "TrendingUp",
    path: "/calculators/capital-gains",
    turnaround: "Instant estimate in the browser",
    documents: ["Purchase and sale dates", "Cost and sale value", "Asset type"],
    checks: ["Holding period", "STCG or LTCG classification", "Indicative tax treatment"],
    ctaLabel: "Open calculator",
  },
  {
    id: "tds-calculator",
    title: "TDS calculator",
    description: "Estimate TDS for common payment types and identify whether the deduction section or rate needs professional review.",
    category: "Tax calculators",
    section: "Calculators",
    icon: "PiggyBank",
    path: "/calculators/tds",
    turnaround: "Instant estimate in the browser",
    documents: ["Payment amount", "Deductee type", "Applicable payment section"],
    checks: ["Basic section fit", "Indicative TDS amount", "PAN and rate dependency"],
    ctaLabel: "Open calculator",
  },
  {
    id: "emi-calculator",
    title: "EMI calculator",
    description: "Estimate loan EMI and repayment pressure before planning deductions, cash flow, or business finance decisions.",
    category: "Finance calculators",
    section: "Calculators",
    icon: "CreditCard",
    path: "/calculators/emi",
    turnaround: "Instant estimate in the browser",
    documents: ["Loan amount", "Interest rate", "Tenure"],
    checks: ["Monthly EMI", "Interest outgo", "Repayment sensitivity"],
    ctaLabel: "Open calculator",
  },
  {
    id: "form16-parser",
    title: "Form 16 parser",
    description: "Extract key salary filing fields from Form 16 so you can spot missing values before starting the ITR checklist.",
    category: "ITR preparation tools",
    section: "ITR Filing",
    icon: "FileText",
    path: "/form16-parser",
    turnaround: "Instant extraction after upload",
    documents: ["Form 16 Part A", "Form 16 Part B", "Salary breakup if extraction looks incomplete"],
    checks: ["Employer and TDS fields", "Salary and deduction values", "Missing or unreadable fields"],
    ctaLabel: "Start ITR",
  },
  {
    id: "itr-status-tracker",
    title: "ITR status tracker",
    description: "Check the public status path after filing and keep acknowledgment details ready for follow-up.",
    category: "ITR preparation tools",
    section: "ITR Filing",
    icon: "FileText",
    path: "/itr/status-tracker",
    turnaround: "Instant status guidance",
    documents: ["Acknowledgment number", "Assessment year", "Registered mobile or email context"],
    checks: ["Filed return status", "Possible next step", "Refund or processing follow-up need"],
    ctaLabel: "View service",
  },
  {
    id: "expert-consultation",
    title: "Complex tax consultation",
    description: "Use this when your facts include NRI status, foreign assets, business income, notices, crypto, ESOPs, or multiple open questions.",
    category: "Advisory",
    section: "ITR Filing",
    icon: "MessageCircle",
    path: "/expert-consultation",
    price: "Scoped after summary review",
    turnaround: "Callback or next step usually during business hours",
    documents: ["Short case summary", "Filing year and deadline", "List of income or notice issues"],
    checks: ["Correct service route", "Documents needed next", "Whether CA-assisted review is suitable"],
    ctaLabel: "Request scope review",
    popular: true,
  },
];

export const getServicesBySection = (section: string) =>
  allServices.filter((service) => service.section === section);

export const getServicesByCategory = (category: string) =>
  allServices.filter((service) => service.category === category);

export const getPopularServices = () =>
  allServices.filter((service) => service.popular);

export const getPaidServices = () =>
  allServices.filter((service) => service.price);

export const getFreeServices = () =>
  allServices.filter((service) => !service.price);

export const serviceCounts = {
  services: getServicesBySection("Services").length,
  itrFiling: getServicesBySection("ITR Filing").length,
  startup: getServicesBySection("Startup").length,
  calculators: getServicesBySection("Calculators").length,
  total: allServices.length,
};

export const categoryBreakdown = allServices.reduce((acc, service) => {
  acc[service.category] = (acc[service.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

export default allServices;
