import {
  BriefcaseBusiness,
  Building2,
  FileText,
  Landmark,
  ReceiptText,
  Shield,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

export type PricingDisplayMode = "plan-grid" | "service-package" | "compact-card" | "fee-breakdown";
export type PricingQualifier = "free" | "fixed" | "starting" | "monthly" | "yearly" | "custom";
export type GstTreatment = "excluding" | "including" | "not_applicable";

export interface PricingAmount {
  qualifier: PricingQualifier;
  amount?: number;
  originalAmount?: number;
  unit?: string;
  gstTreatment?: GstTreatment;
}

export interface PricingCta {
  label: string;
  href?: string;
  checkout?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  audience: string;
  description?: string;
  pricing: PricingAmount;
  icon: LucideIcon;
  badge?: string;
  featured?: boolean;
  included: string[];
  exclusions: string[];
  documents?: string[];
  caTouchpoints: string;
  sla: string;
  cta: PricingCta;
  consultationCta?: PricingCta;
}

export interface FeeBreakdownItem {
  label: string;
  amount: number;
  note?: string;
}

export interface ServicePricing {
  id: string;
  name: string;
  category: string;
  audience: string;
  pricing: PricingAmount;
  icon?: LucideIcon;
  badge?: string;
  featured?: boolean;
  included: string[];
  exclusions: string[];
  documents: string[];
  timeline: string;
  caTouchpoints: string;
  primaryCta: PricingCta;
  consultationCta: PricingCta;
  feeBreakdown?: {
    government?: FeeBreakdownItem[];
    professional?: FeeBreakdownItem[];
  };
}

export interface PricingSectionProps {
  mode?: PricingDisplayMode;
  title?: string;
  description?: string;
  plans?: PricingPlan[];
  service?: ServicePricing;
}

export const formatINR = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const getGstNote = (pricing: PricingAmount) => {
  switch (pricing.gstTreatment) {
    case "including":
      return "Includes GST";
    case "not_applicable":
      return "GST not applicable";
    case "excluding":
    default:
      return "Excluding GST";
  }
};

export const formatPricingLabel = (pricing: PricingAmount) => {
  if (pricing.qualifier === "free") return "Free";
  if (pricing.qualifier === "custom") return "Custom Quote";
  const amount = pricing.amount ? formatINR(pricing.amount) : "Custom Quote";

  switch (pricing.qualifier) {
    case "starting":
      return `Starting from ${amount}`;
    case "monthly":
      return `${amount}/month`;
    case "yearly":
      return `${amount}/year`;
    case "fixed":
    default:
      return amount;
  }
};

export const getCheckoutAmount = (pricing: PricingAmount) => {
  if (pricing.qualifier === "free" || pricing.qualifier === "custom") return undefined;
  return pricing.amount;
};

export const taxFilingPlans: PricingPlan[] = [
  {
    id: "salary",
    name: "Salary",
    audience: "Single employer, salary and interest income",
    description: "For simple ITR-1 cases with guided filing and checklist support.",
    pricing: { qualifier: "fixed", amount: 499, gstTreatment: "excluding" },
    icon: FileText,
    badge: "Starter",
    included: ["ITR-1 guidance", "Regime comparison", "Form 16 checklist", "Basic document vault"],
    exclusions: ["Capital gains", "Business income", "Foreign assets"],
    caTouchpoints: "Optional CA review add-on",
    sla: "After complete document review",
    cta: { label: "Start Salary ITR - Rs 499", href: "/itr/start?plan=salary&source=pricing_plan_card" },
    consultationCta: { label: "Talk to Expert", href: "/expert-consultation?service=salary-itr" },
  },
  {
    id: "expert-assisted",
    name: "Expert Assisted",
    audience: "Most salaried users and multiple Form 16 cases",
    description: "Named CA review with AIS/26AS checks before filing.",
    pricing: { qualifier: "fixed", amount: 999, originalAmount: 1499, gstTreatment: "excluding" },
    icon: UserCheck,
    badge: "Recommended",
    featured: true,
    included: ["Named CA review", "AIS/26AS checks", "HRA/rent support", "Refund and notice risk notes"],
    exclusions: ["F&O audit", "Foreign tax credit", "GST books"],
    caTouchpoints: "Named CA review plus one clarification loop",
    sla: "After complete document review",
    cta: { label: "Start CA-Assisted ITR - Rs 999", href: "/itr/start?plan=expert-assisted&source=pricing_plan_card" },
    consultationCta: { label: "Talk to Expert", href: "/expert-consultation?service=expert-assisted-itr" },
  },
  {
    id: "capital-gains",
    name: "Capital Gains",
    audience: "Stocks, mutual funds, property, crypto/VDA",
    description: "Investor return support with gain classification and set-off review.",
    pricing: { qualifier: "starting", amount: 1499, gstTreatment: "excluding" },
    icon: TrendingUp,
    badge: "Investor",
    included: ["Broker P&L upload workflow", "STCG/LTCG review", "Tax-loss harvesting notes", "Schedule CG/VDA checklist"],
    exclusions: ["Tax audit", "Foreign broker statements", "Unlisted share valuation"],
    caTouchpoints: "CA review for gain classification and set-off",
    sla: "2-3 business days",
    cta: { label: "Get Scope Review", href: "/itr/start?profile=capital-gains&source=pricing_plan_card" },
    consultationCta: { label: "Talk to Expert", href: "/expert-consultation?service=capital-gains" },
  },
  {
    id: "freelancer-44ada",
    name: "Freelancer / 44ADA",
    audience: "Consultants, creators, professionals and contractors",
    description: "Business-income support for presumptive taxation and expense readiness.",
    pricing: { qualifier: "starting", amount: 2499, gstTreatment: "excluding" },
    icon: BriefcaseBusiness,
    badge: "Business income",
    included: ["44ADA/44AD decision support", "Advance tax notes", "Expense checklist", "GST threshold flag"],
    exclusions: ["Statutory audit", "Monthly GST filing", "Bookkeeping cleanup"],
    caTouchpoints: "CA review for business income, deductions and compliance risk",
    sla: "3-5 business days",
    cta: { label: "Get Scope Review", href: "/itr/start?profile=business-freelance&source=pricing_plan_card" },
    consultationCta: { label: "Talk to Expert", href: "/expert-consultation?service=freelancer-tax" },
  },
  {
    id: "nri-foreign-assets",
    name: "NRI / Foreign Assets",
    audience: "NRI, foreign income, DTAA, Form 67 and Schedule FA",
    description: "Specialist review for cross-border income and India tax disclosure.",
    pricing: { qualifier: "starting", amount: 4999, gstTreatment: "excluding" },
    icon: Landmark,
    badge: "Specialist",
    included: ["Residential status check", "DTAA checklist", "Schedule FA review", "Form 67 guidance"],
    exclusions: ["Overseas tax filing", "FEMA advisory beyond India tax", "Transfer pricing"],
    caTouchpoints: "Specialist CA review with written risk notes",
    sla: "5-7 business days",
    cta: { label: "Get Scope Review", href: "/itr/start?profile=nri-foreign&source=pricing_plan_card" },
    consultationCta: { label: "Talk to Expert", href: "/expert-consultation?service=nri-tax" },
  },
  {
    id: "business-gst",
    name: "Business / GST",
    audience: "GST, TDS, company compliance and vCFO work",
    description: "Milestone-based compliance support for business workflows.",
    pricing: { qualifier: "custom", gstTreatment: "excluding" },
    icon: Building2,
    badge: "Compliance OS",
    included: ["Service milestones", "Mandatory vs optional cost list", "Compliance calendar", "Founder dashboard"],
    exclusions: ["Government fees unless stated", "Stamp duty unless stated", "Out-of-scope legal drafting"],
    caTouchpoints: "Dedicated owner for recurring compliance",
    sla: "Defined in written scope",
    cta: { label: "View Business Services", href: "/services" },
    consultationCta: { label: "Talk to Expert", href: "/expert-consultation?service=business-compliance" },
  },
];

export const servicePricingCatalog: ServicePricing[] = [
  {
    id: "itr-1-filing",
    name: "ITR-1 Filing",
    category: "Individual Tax Services",
    audience: "Salaried individuals with simple income",
    pricing: { qualifier: "fixed", amount: 499, originalAmount: 999, gstTreatment: "excluding" },
    icon: FileText,
    badge: "Starter",
    included: ["Form 16 review", "Regime comparison", "Basic deductions checklist", "ITR-V acknowledgement"],
    exclusions: ["Capital gains", "Foreign assets", "Business income"],
    documents: ["PAN", "Aadhaar", "Form 16", "Bank details"],
    timeline: "After document review",
    caTouchpoints: "Checklist-assisted filing with optional CA review",
    primaryCta: { label: "Check ITR plan", href: "/itr/start?plan=salary&source=service_pricing" },
    consultationCta: { label: "Consult expert", href: "/expert-consultation?service=itr-1-filing" },
  },
  {
    id: "itr-filing",
    name: "ITR Filing Service",
    category: "Individual Tax Services",
    audience: "Individuals who want CA-assisted return filing",
    pricing: { qualifier: "starting", amount: 999, gstTreatment: "excluding" },
    icon: FileText,
    badge: "CA assisted",
    included: ["AIS review", "Deduction checks", "CA-assisted filing", "Refund support"],
    exclusions: ["Tax audit", "Foreign asset disclosure beyond stated scope", "Notice reply drafting"],
    documents: ["PAN", "Form 16", "AIS/Form 26AS", "Investment and income proofs"],
    timeline: "After document review",
    caTouchpoints: "Named CA review with one clarification loop",
    primaryCta: { label: "Start service", checkout: true },
    consultationCta: { label: "Consult expert", href: "/expert-consultation?service=itr-filing" },
  },
  {
    id: "gst-registration",
    name: "GST Registration",
    category: "GST Services",
    audience: "Businesses registering for GSTIN",
    pricing: { qualifier: "starting", amount: 2999, originalAmount: 4999, gstTreatment: "excluding" },
    icon: ReceiptText,
    badge: "Business setup",
    featured: true,
    included: ["Document preparation", "GST REG-01 filing", "Query resolution", "Certificate download"],
    exclusions: ["Government portal issues outside filing", "Monthly GST returns unless selected", "Business registration fees"],
    documents: ["PAN", "Aadhaar", "Business address proof", "Bank statement"],
    timeline: "7-10 working days",
    caTouchpoints: "GST expert review before portal submission",
    primaryCta: { label: "Register now", checkout: true },
    consultationCta: { label: "Consult expert", href: "/expert-consultation?service=gst-registration" },
  },
  {
    id: "gst-return",
    name: "GST Return Filing",
    category: "GST Services",
    audience: "Monthly, quarterly, and annual GST return support",
    pricing: { qualifier: "starting", amount: 999, gstTreatment: "excluding" },
    icon: ReceiptText,
    included: ["GSTR-1 and 3B support", "ITC reconciliation", "Invoice checks", "Compliance reminders"],
    exclusions: ["Bookkeeping cleanup", "Tax payment funding", "Audit certification unless scoped"],
    documents: ["Sales invoices", "Purchase invoices", "GST login access or data", "Bank summary if needed"],
    timeline: "Before due dates",
    caTouchpoints: "GST expert checks return data before filing",
    primaryCta: { label: "Start service", checkout: true },
    consultationCta: { label: "Consult expert", href: "/expert-consultation?service=gst-return" },
  },
  {
    id: "gst-returns",
    name: "GST Return Filing",
    category: "GST Services",
    audience: "Businesses needing recurring GST compliance",
    pricing: { qualifier: "monthly", amount: 999, gstTreatment: "excluding" },
    icon: ReceiptText,
    included: ["GSTR-1 filing", "GSTR-3B filing", "ITC reconciliation", "Compliance tracker"],
    exclusions: ["GST annual audit", "Bookkeeping cleanup", "Officer hearing attendance"],
    documents: ["Sales invoices", "Purchase invoices", "Credit/debit notes", "GST credentials or data export"],
    timeline: "Monthly before due dates",
    caTouchpoints: "Recurring GST compliance owner",
    primaryCta: { label: "Start returns", checkout: true },
    consultationCta: { label: "Consult expert", href: "/expert-consultation?service=gst-returns" },
  },
  {
    id: "company-registration",
    name: "Company Registration",
    category: "Business Registration",
    audience: "Founders incorporating Pvt Ltd, OPC, LLP, or company structures",
    pricing: { qualifier: "starting", amount: 6999, originalAmount: 12999, gstTreatment: "excluding" },
    icon: Building2,
    badge: "Best value",
    featured: true,
    included: ["Name reservation", "Document preparation", "MCA filing", "PAN and TAN application", "First compliance checklist"],
    exclusions: ["State stamp duty unless stated", "Government fees beyond package", "Post-incorporation ROC compliance"],
    documents: ["Directors PAN and Aadhaar", "Address proof", "Registered office proof", "NOC from owner"],
    timeline: "10-15 working days",
    caTouchpoints: "Company registration expert reviews name, structure, and filing readiness",
    primaryCta: { label: "Register company", checkout: true },
    consultationCta: { label: "Consult expert", href: "/expert-consultation?service=company-registration" },
    feeBreakdown: {
      professional: [{ label: "MyeCA professional fee", amount: 6999, note: "Starting package for Pvt Ltd registration" }],
    },
  },
  {
    id: "pvt-ltd-registration",
    name: "Private Limited Company Registration",
    category: "Business Registration",
    audience: "Startups and SMEs seeking limited liability and funding readiness",
    pricing: { qualifier: "fixed", amount: 7999, originalAmount: 14999, gstTreatment: "excluding" },
    icon: Building2,
    badge: "Best value",
    included: ["Name availability check", "2 DSC + 2 DIN", "MOA and AOA drafting", "PAN and TAN application"],
    exclusions: ["State stamp duty unless stated", "Registered office rent/NOC cost", "Ongoing ROC compliance"],
    documents: ["Directors PAN", "Directors Aadhaar", "Address proof", "Passport photos"],
    timeline: "10-15 business days",
    caTouchpoints: "Expert review for incorporation readiness",
    primaryCta: { label: "Start registration", checkout: true },
    consultationCta: { label: "Consult expert", href: "/expert-consultation?service=pvt-ltd-registration" },
  },
  {
    id: "trademark-registration",
    name: "Trademark Registration",
    category: "Legal & IP",
    audience: "Brands protecting names, logos, and marks",
    pricing: { qualifier: "starting", amount: 12999, gstTreatment: "excluding" },
    icon: Shield,
    badge: "IP protection",
    included: ["Trademark search", "Class identification", "Application filing", "Objection response guidance", "Status tracking"],
    exclusions: ["Additional classes", "Opposition proceedings", "Litigation or infringement action"],
    documents: ["Logo or wordmark", "Applicant PAN", "Business registration proof", "Power of attorney"],
    timeline: "12-18 months",
    caTouchpoints: "IP filing expert review before application submission",
    primaryCta: { label: "Register trademark", checkout: true },
    consultationCta: { label: "Consult expert", href: "/expert-consultation?service=trademark-registration" },
    feeBreakdown: {
      government: [
        { label: "Government filing fee", amount: 4500, note: "Individual/startup/small enterprise" },
        { label: "Search and classification support", amount: 1500 },
      ],
      professional: [{ label: "MyeCA professional fee", amount: 6999 }],
    },
  },
  {
    id: "tax-consultation",
    name: "Tax Consultation",
    category: "Tax Advisory",
    audience: "Salary, business, capital gains, GST, notices, or filing questions",
    pricing: { qualifier: "starting", amount: 1499, gstTreatment: "excluding" },
    icon: UserCheck,
    included: ["Case-specific advice", "Written next steps", "Tax position review", "Filing or notice guidance"],
    exclusions: ["Return filing", "Notice drafting", "Representation before authorities"],
    documents: ["Question summary", "Income details", "Relevant notices", "Previous returns if available"],
    timeline: "Available slots",
    caTouchpoints: "Expert consultation with written next steps",
    primaryCta: { label: "Start service", checkout: true },
    consultationCta: { label: "Book consultation", href: "/expert-consultation?service=tax-consultation" },
  },
  {
    id: "tax-planning",
    name: "Tax Planning",
    category: "Tax Advisory",
    audience: "Individuals and business owners planning deductions and investments",
    pricing: { qualifier: "fixed", amount: 1999, gstTreatment: "excluding" },
    icon: TrendingUp,
    included: ["45-minute consultation", "Regime comparison", "Investment recommendations", "Written action plan"],
    exclusions: ["ITR filing", "Portfolio management", "Legal or FEMA advisory"],
    documents: ["Recent salary slips", "Current investments", "Previous ITR", "Tax questions"],
    timeline: "Scheduled booking",
    caTouchpoints: "CA-led planning call",
    primaryCta: { label: "Start planning", checkout: true },
    consultationCta: { label: "Consult expert", href: "/expert-consultation?service=tax-planning" },
  },
  {
    id: "notice-compliance",
    name: "Notice Compliance",
    category: "Tax Compliance",
    audience: "Individuals and businesses responding to tax/GST notices",
    pricing: { qualifier: "starting", amount: 2999, gstTreatment: "excluding" },
    icon: ShieldCheck,
    included: ["Notice review", "Document checklist", "Draft response guidance", "Risk notes"],
    exclusions: ["Hearing representation", "Appeals", "Penalty payment"],
    documents: ["Notice copy", "Previous filings", "Supporting documents", "Portal access or screenshots"],
    timeline: "2-5 working days",
    caTouchpoints: "Notice specialist review",
    primaryCta: { label: "Start notice review", checkout: true },
    consultationCta: { label: "Consult expert", href: "/expert-consultation?service=notice-compliance" },
  },
  {
    id: "tds-filing",
    name: "TDS Return Filing",
    category: "Tax Compliance",
    audience: "Businesses filing quarterly TDS returns",
    pricing: { qualifier: "starting", amount: 1499, unit: "per quarter", gstTreatment: "excluding" },
    icon: FileText,
    included: ["TDS computation", "Challan verification", "Return preparation", "Form 16/16A generation"],
    exclusions: ["TDS payment funding", "PAN correction requests", "Complex correction returns unless scoped"],
    documents: ["Payment records", "Deductee details", "Challans", "Previous returns"],
    timeline: "Before quarterly deadlines",
    caTouchpoints: "TDS expert validates return data",
    primaryCta: { label: "Start filing", checkout: true },
    consultationCta: { label: "Consult expert", href: "/expert-consultation?service=tds-filing" },
  },
];

export const getPricingByServiceId = (serviceId: string) =>
  servicePricingCatalog.find((service) => service.id === serviceId);

export const getTaxFilingPlans = () => taxFilingPlans;

export const getServicePriceForSchema = (serviceId: string, fallback?: string | number) => {
  const pricing = getPricingByServiceId(serviceId)?.pricing;
  const amount = pricing ? getCheckoutAmount(pricing) : undefined;
  return String(amount ?? fallback ?? "");
};
