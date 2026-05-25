import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  FileSearch,
  FileText,
  FolderCheck,
  Landmark,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  UserCheck,
} from "lucide-react";

export const competitiveProofPoints = [
  "CA-assisted review where applicable",
  "AIS, 26AS and Form 16 mismatch checklist",
  "Written scope before payment",
  "Private document workflow with case history",
];

export const caseTimelineStages = [
  "Intake started",
  "Documents pending",
  "CA assigned",
  "Computation review",
  "User approval",
  "Filed or submitted",
  "Acknowledgment uploaded",
  "Post-filing support",
];

export const pricingPlans = [
  {
    name: "Salary",
    price: "₹499 excluding GST",
    audience: "Single employer, salary and interest income",
    icon: FileText,
    badge: "Starter",
    included: ["ITR-1 guidance", "Regime comparison", "Form 16 checklist", "Basic vault"],
    caTouchpoints: "Optional CA review add-on",
    sla: "After document review",
    exclusions: ["Capital gains", "Business income", "Foreign assets"],
    cta: "/itr/form-selector",
  },
  {
    name: "Expert Assisted",
    price: "₹999 excluding GST",
    audience: "Most salaried users and multiple Form 16 cases",
    icon: UserCheck,
    badge: "Recommended",
    included: ["CA review scope", "AIS/26AS checks", "HRA/rent support", "Refund and notice notes"],
    caTouchpoints: "CA review plus one clarification loop",
    sla: "After complete document review",
    exclusions: ["F&O audit", "Foreign tax credit", "GST books"],
    cta: "/itr/form-selector",
    featured: true,
  },
  {
    name: "Capital Gains",
    price: "₹1,499 excluding GST",
    audience: "Stocks, mutual funds, property, crypto/VDA",
    icon: TrendingUp,
    badge: "Investor",
    included: ["Broker P&L upload workflow", "STCG/LTCG review", "Tax-loss harvesting notes", "Schedule CG/VDA checklist"],
    caTouchpoints: "CA review for gain classification and set-off",
    sla: "2-3 business days",
    exclusions: ["Tax audit", "Foreign broker statements", "Unlisted share valuation"],
    cta: "/capital-gains-import",
  },
  {
    name: "Freelancer / 44ADA",
    price: "₹2,499 excluding GST",
    audience: "Consultants, creators, professionals and contractors",
    icon: BriefcaseBusiness,
    badge: "Business income",
    included: ["44ADA/44AD decision support", "Advance tax notes", "Expense checklist", "GST threshold flag"],
    caTouchpoints: "CA review for business income, deductions and compliance risk",
    sla: "3-5 business days",
    exclusions: ["Statutory audit", "Monthly GST filing", "Bookkeeping cleanup"],
    cta: "/services/tax-planning",
  },
  {
    name: "NRI / Foreign Assets",
    price: "₹4,999 excluding GST",
    audience: "NRI, foreign income, DTAA, Form 67 and Schedule FA",
    icon: Landmark,
    badge: "Specialist",
    included: ["Residential status check", "DTAA checklist", "Schedule FA review", "Form 67 guidance"],
    caTouchpoints: "Specialist CA review with written risk notes",
    sla: "5-7 business days",
    exclusions: ["Overseas tax filing", "FEMA advisory beyond India tax", "Transfer pricing"],
    cta: "/expert-consultation",
  },
  {
    name: "Business / GST",
    price: "Custom",
    audience: "GST, TDS, company compliance and vCFO work",
    icon: Building2,
    badge: "Compliance OS",
    included: ["Service milestones", "Mandatory vs optional cost list", "Compliance calendar", "Founder dashboard"],
    caTouchpoints: "Assigned workflow owner for recurring compliance",
    sla: "Defined in written scope",
    exclusions: ["Government fees unless stated", "Stamp duty unless stated", "Out-of-scope legal drafting"],
    cta: "/services",
  },
];

export const competitorPages = [
  {
    slug: "cleartax-alternative",
    competitor: "ClearTax",
    title: "ClearTax Alternative for CA-Reviewed ITR Filing",
    description:
      "Compare MyeCA with ClearTax if you want CA-assisted review where applicable, visible AIS/26AS checks, document history and transparent scope before payment.",
    goodPoints: ["Large brand recall", "Deep tax guides and calculators", "DIY and CA-assisted filing", "Security and trust messaging"],
    myeCAEdge: ["Scoped expert visibility", "Pay-after-review messaging", "Case timeline with issue log", "Document workflow tied to filing cases"],
    primaryCta: "/pricing",
    source: "https://cleartax.in/s/pricing",
  },
  {
    slug: "taxbuddy-alternative",
    competitor: "TaxBuddy",
    title: "TaxBuddy Alternative with Case Tracking",
    description:
      "Use MyeCA when you want assisted filing plus self-serve document status, clear plan scope and post-filing support visibility.",
    goodPoints: ["Strong assisted filing pitch", "AI-powered positioning", "Notice and compliance services", "Affordable entry plans"],
    myeCAEdge: ["Customer-visible case stages", "Document viewer with extraction review", "Visible scope notes", "Review comments attached to files"],
    primaryCta: "/services/document-vault",
    source: "https://www.taxbuddy.com/pricing-itr-app",
  },
  {
    slug: "quicko-capital-gains-alternative",
    competitor: "Quicko",
    title: "Quicko Alternative for Capital Gains with CA Review",
    description:
      "MyeCA matches investor tooling with broker upload workflows and adds CA-assisted review, issue flags and a reusable tax document workflow.",
    goodPoints: ["Investor-first product", "Low-cost paid plans", "App connections", "Tax-loss harvesting and capital gains focus"],
    myeCAEdge: ["CA-reviewed capital gains", "F&O audit flagging", "Crypto/VDA checklist", "AIS mismatch review before filing"],
    primaryCta: "/capital-gains-import",
    source: "https://quicko.com/pricing",
  },
  {
    slug: "indiafilings-alternative",
    competitor: "IndiaFilings",
    title: "IndiaFilings Alternative for Transparent Startup Compliance",
    description:
      "MyeCA packages GST, company registration and compliance with milestone tracking, mandatory-vs-optional cost clarity and renewal reminders.",
    goodPoints: ["Very broad service catalog", "Startup and business setup focus", "GST, MCA, payroll and trademark coverage", "Strong business positioning"],
    myeCAEdge: ["Transparent add-on policy", "Founder compliance dashboard", "Service milestone tracker", "Document checklist before payment"],
    primaryCta: "/startup-services",
    source: "https://www.indiafilings.com/",
  },
  {
    slug: "best-ca-assisted-itr-filing",
    competitor: "Online filing portals",
    title: "CA-Assisted ITR Filing Comparison for Complex Indian Taxpayers",
    description:
      "A factual guide for choosing MyeCA when your return needs CA review, document reconciliation, capital gains, NRI checks, GST or notice support.",
    goodPoints: ["Many portals work well for simple returns", "Low-cost assisted filing options exist", "Large brands have broad content", "Local CAs offer personal trust"],
    myeCAEdge: ["Expert-led digital workflow", "Written scope and visible exclusions", "Secure vault and case history", "Tax plus compliance upgrade path"],
    primaryCta: "/pricing",
    source: "https://myeca.in/pricing",
  },
];

export const vaultChecklist = [
  { label: "Form 16 uploaded", detail: "Salary, TDS and employer TAN are readable", icon: FileText },
  { label: "AIS and 26AS checked", detail: "Mismatch queue is visible before CA review", icon: FileSearch },
  { label: "Supporting proofs tagged", detail: "HRA, 80C, 80D and home-loan proofs are linked", icon: FolderCheck },
  { label: "CA comments recorded", detail: "Clarifications stay attached to the case history", icon: BadgeCheck },
  { label: "Access review ready", detail: "Downloads and review actions can be checked where logging is enabled", icon: ShieldCheck },
];

export const businessWorkflowCards = [
  {
    title: "GST Registration",
    href: "/services/gst-registration",
    detail: "Documents, application, officer query response and certificate download.",
    priceNote: "Government portal is free; MyeCA fee covers preparation and expert handling.",
    icon: ReceiptText,
  },
  {
    title: "Company Registration",
    href: "/services/company-registration",
    detail: "Name, DSC/DIN, incorporation, PAN/TAN and first compliance checklist.",
    priceNote: "State stamp duty and government fees are shown separately before payment.",
    icon: Building2,
  },
  {
    title: "Founder Compliance",
    href: "/startup-services",
    detail: "ROC, GST, TDS, payroll, trademark and virtual CFO milestones in one dashboard.",
    priceNote: "Mandatory, optional and recurring costs are clearly separated.",
    icon: BriefcaseBusiness,
  },
];
