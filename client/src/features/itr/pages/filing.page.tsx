import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Home,
  IndianRupee,
  ReceiptText,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  MyeCard,
  SectionHeading,
  StatusBadge,
  formatInr,
} from "@/components/platform/compliance-ui";
import { Layout } from "@/components/admin/Layout";
import { cn } from "@/lib/utils";

export const ITR_FILING_STEPS = [
  {
    id: "sources",
    title: "Income Sources",
    description: "Select salary, capital gains, business, property, other, and foreign income so MY ITR can choose the right path.",
  },
  {
    id: "profile",
    title: "Profile & Bank",
    description: "Confirm PAN, Aadhaar-link status, contact details, and refund bank account.",
  },
  {
    id: "documents",
    title: "Documents",
    description: "Upload or mark Form 16, AIS, 26AS, bank statements, and deduction proofs before return preparation.",
  },
  {
    id: "income",
    title: "Income Details",
    description: "Fill salary, interest, capital gains, business/profession, rental, and other income details.",
  },
  {
    id: "deductions",
    title: "Deductions & Regime",
    description: "Capture 80C, 80D, HRA, home loan, rent receipts, and compare old vs new regime.",
  },
  {
    id: "tax-paid",
    title: "AIS, 26AS & Tax Paid",
    description: "Match TDS/TCS, advance tax, self-assessment tax, and mismatch flags.",
  },
  {
    id: "review",
    title: "Review & CA Handoff",
    description: "Review the draft, request expert assistance, pay if needed, and submit for filing support.",
  },
  {
    id: "e-verify",
    title: "E-Verify & Track",
    description: "After filing, complete e-verification within 30 days and track acknowledgement or refund status.",
  },
] as const;

export const ITR_DOCUMENT_CHECKLIST = [
  {
    id: "form16",
    title: "Form 16 Part A/B",
    description: "Salary and employer TDS certificate. If unavailable, keep salary slips and employer tax computation ready.",
    required: true,
  },
  {
    id: "ais",
    title: "AIS / TIS statement",
    description: "Annual information statement for interest, dividends, securities, foreign remittances, and reported transactions.",
    required: true,
  },
  {
    id: "form26as",
    title: "Form 26AS",
    description: "TDS, TCS, advance tax, and self-assessment tax credits to reconcile before submission.",
    required: true,
  },
  {
    id: "bank",
    title: "Bank statements",
    description: "Salary credits, interest income, refunds, rent receipts, and tax payment proofs.",
    required: true,
  },
  {
    id: "deductions",
    title: "Deduction proofs",
    description: "80C, 80D, NPS, donations, education loan, home loan, HRA, and rent documents.",
    required: false,
  },
  {
    id: "capital-gains",
    title: "Capital gains reports",
    description: "Broker P&L, mutual fund statements, property sale deed, purchase deed, and expense proofs where applicable.",
    required: false,
  },
] as const;

export type ITRFormId = "ITR-1" | "ITR-2" | "ITR-3" | "ITR-4";

type FilingGuideItem = {
  id: string;
  title: string;
  description: string;
  forms?: readonly ITRFormId[];
  appliesWhen?: string;
};

type ITRRecommendationInput = {
  sourceSelections: Record<string, boolean>;
  totalIncome: number;
  capitalGainsIncome?: number;
  isPresumptiveBusiness?: boolean;
  hasMoreThanTwoHouseProperties?: boolean;
  hasDirectorStatus?: boolean;
  hasUnlistedShares?: boolean;
  hasBroughtForwardLoss?: boolean;
  hasDeferredEsop?: boolean;
};

export type ITRRecommendation = {
  recommendedForm: ITRFormId;
  reasons: string[];
  blockedForms: Array<{ form: ITRFormId; reason: string }>;
  requiredDocuments: FilingGuideItem[];
  compulsorySections: FilingGuideItem[];
  nextSteps: string[];
};

export const AY_2026_27_ITR_GUIDE = {
  assessmentYear: "2026-27",
  financialYear: "2025-26",
  commonDocuments: [
    {
      id: "profile-pan",
      title: "PAN, name, address, and contact details",
      description: "Confirm PAN, legal name, permanent address, email, and mobile exactly as they should appear in the return.",
    },
    {
      id: "aadhaar-status",
      title: "Aadhaar link and OTP readiness",
      description: "Keep Aadhaar-link status and the mobile used for OTP/e-verification ready.",
    },
    {
      id: "bank-refund",
      title: "Validated refund bank account",
      description: "Use an active bank account, IFSC, and refund preference that can be validated before filing.",
    },
    {
      id: "form16-form16a",
      title: "Form 16 / Form 16A",
      description: "Use Form 16 for salary TDS and Form 16A for non-salary TDS such as bank interest or professional receipts.",
    },
    {
      id: "ais-tis",
      title: "AIS / TIS",
      description: "Review income, securities, dividends, interest, SFT, refund, and other reported information before final numbers.",
    },
    {
      id: "form26as",
      title: "Form 26AS",
      description: "Match TDS, TCS, advance tax, and self-assessment tax credits with the return.",
    },
    {
      id: "bank-statements",
      title: "Bank statements and interest certificates",
      description: "Reconcile salary credits, savings/FD interest, refunds, rent, and tax payments.",
    },
    {
      id: "tax-challans",
      title: "Advance tax / self-assessment tax challans",
      description: "Keep BSR code, challan serial number, date, and amount for taxes paid outside TDS/TCS.",
    },
  ],
  conditionalDocuments: [
    {
      id: "deduction-proofs",
      title: "Old-regime deduction proofs",
      description: "80C, 80D, NPS, donations, education loan, disability, and other Chapter VIA support.",
      appliesWhen: "Required when claiming deductions under the old regime.",
    },
    {
      id: "hra-rent",
      title: "HRA, rent, and landlord details",
      description: "Rent receipts, rental agreement, landlord PAN where applicable, and salary structure.",
      appliesWhen: "Required when claiming HRA or rent-related benefits.",
    },
    {
      id: "home-loan-interest",
      title: "Home-loan interest certificate",
      description: "Loan account, lender details, sanction date, outstanding balance, and interest on borrowed capital.",
      appliesWhen: "Required for house-property interest claims.",
    },
    {
      id: "capital-gains-reports",
      title: "Capital-gains reports",
      description: "Broker P&L, mutual fund capital-gains statements, property sale/purchase deeds, VDA/crypto records, and cost proofs.",
      forms: ["ITR-2", "ITR-3"],
      appliesWhen: "Required when shares, mutual funds, property, VDA, or other capital assets were sold.",
    },
    {
      id: "business-books",
      title: "Business/profession books and summaries",
      description: "Profit and loss, balance sheet, receipts, expenses, GST/TDS records, depreciation, and audit notes where applicable.",
      forms: ["ITR-3"],
      appliesWhen: "Required for non-presumptive business or profession income.",
    },
    {
      id: "presumptive-turnover",
      title: "Presumptive turnover and receipt split",
      description: "44AD/44ADA/44AE turnover, digital/cash receipt split, vehicle details if relevant, and Form 10-IEA status if opting out of the default regime.",
      forms: ["ITR-4"],
      appliesWhen: "Required when using the presumptive ITR-4 path.",
    },
    {
      id: "foreign-assets-ftc",
      title: "Foreign assets, foreign income, and FTC support",
      description: "Foreign account/assets, income outside India, tax paid outside India, DTAA support, and Form 67 where foreign tax credit is claimed.",
      forms: ["ITR-2", "ITR-3"],
      appliesWhen: "Required for foreign assets, signing authority, foreign income, or foreign tax credit.",
    },
  ],
  compulsorySections: [
    {
      id: "personal-info",
      title: "Personal information",
      description: "PAN, Aadhaar-link status, address, contact details, employer category, and residential status.",
    },
    {
      id: "filing-status",
      title: "Filing status and reason",
      description: "Original/revised/belated/updated context, return filing section, regime selection, and due-date notes.",
    },
    {
      id: "income-details",
      title: "Income details",
      description: "Report salary, house property, other sources, capital gains, business/profession, and foreign income as applicable.",
    },
    {
      id: "deductions-regime",
      title: "Deductions and tax regime",
      description: "Compare old vs new regime and enable only eligible exemptions/deductions for the selected regime.",
    },
    {
      id: "taxes-paid",
      title: "Taxes paid and AIS/Form 26AS reconciliation",
      description: "Verify TDS, TCS, advance tax, self-assessment tax, and mismatches before submission.",
    },
    {
      id: "bank-refund",
      title: "Bank account and refund",
      description: "Confirm validated bank accounts and the account selected for refund credit.",
    },
    {
      id: "verification",
      title: "Verification and e-verification",
      description: "Confirm the declaration, submit for filing support, and complete e-verification within the allowed timeline.",
    },
  ],
  conditionalSections: [
    {
      id: "schedule-salary",
      title: "Schedule Salary",
      description: "Employer details, allowances, perquisites, standard deduction, professional tax, and salary TDS.",
      forms: ["ITR-1", "ITR-2", "ITR-3", "ITR-4"],
      appliesWhen: "Applies when salary or pension is selected.",
    },
    {
      id: "schedule-house-property",
      title: "Schedule House Property",
      description: "Ownership, rent, municipal tax, unrealized rent, interest on borrowed capital, and property-wise income/loss.",
      forms: ["ITR-1", "ITR-2", "ITR-3", "ITR-4"],
      appliesWhen: "Applies when house-property income or interest is selected.",
    },
    {
      id: "schedule-other-sources",
      title: "Schedule Other Sources",
      description: "Interest, dividend, family pension, gifts, winnings, and any special-rate other-source income where applicable.",
      forms: ["ITR-1", "ITR-2", "ITR-3", "ITR-4"],
      appliesWhen: "Applies when other-source income is selected or appears in AIS.",
    },
    {
      id: "schedule-capital-gains",
      title: "Schedule Capital Gains",
      description: "STCG/LTCG, 112A, property, securities, mutual funds, VDA, loss set-off, and capital-loss carry-forward.",
      forms: ["ITR-2", "ITR-3"],
      appliesWhen: "Applies when capital gains or losses exist.",
    },
    {
      id: "schedule-business",
      title: "Schedule Business/Profession",
      description: "Profit and loss, balance sheet, depreciation, ICDS, audit linkage, and business/profession income computation.",
      forms: ["ITR-3"],
      appliesWhen: "Applies to non-presumptive business/profession income.",
    },
    {
      id: "schedule-presumptive",
      title: "Presumptive business/profession schedule",
      description: "44AD/44ADA/44AE gross receipts, presumptive income, receipt mode, asset/liability summary, and Form 10-IEA status.",
      forms: ["ITR-4"],
      appliesWhen: "Applies when eligible presumptive taxation is selected.",
    },
    {
      id: "schedule-foreign",
      title: "Foreign income/assets and tax relief schedules",
      description: "Schedule FA, FSI, TR, foreign tax credit, and foreign asset/signing authority disclosures.",
      forms: ["ITR-2", "ITR-3"],
      appliesWhen: "Applies when foreign assets, foreign income, or foreign tax credit are present.",
    },
    {
      id: "schedule-deductions",
      title: "Deduction-specific schedules",
      description: "80C, 80D, 80G, 80GG, 80DD, 80U, NPS PRAN, Form 10IA, and Form 10BA details where relevant.",
      forms: ["ITR-1", "ITR-2", "ITR-3", "ITR-4"],
      appliesWhen: "Applies when old-regime deductions or special deduction claims are used.",
    },
  ],
} as const;

export const ITR_FILING_LAYOUT = {
  usesDedicatedLeftRail: false,
  usesAuthenticatedWorkspaceShell: true,
  tone: "professional",
} as const;

const INCOME_SOURCE_OPTIONS = [
  { id: "salary", label: "Salary / Pension", helper: "Form 16, salary slips, employer TDS" },
  { id: "capitalGains", label: "Capital Gains / Losses", helper: "Shares, mutual funds, F&O, property, crypto" },
  { id: "business", label: "Business / Profession", helper: "Books, presumptive income, invoices" },
  { id: "houseProperty", label: "House Property", helper: "Home loan, rent received, municipal tax" },
  { id: "otherSources", label: "Other Sources", helper: "Interest, dividends, gifts, winnings" },
  { id: "foreignIncome", label: "Foreign Income", helper: "Foreign assets, RSUs, NRI/RNOR details" },
] as const;

type FilingFactsState = {
  isPresumptiveBusiness: boolean;
  hasMoreThanTwoHouseProperties: boolean;
  hasDirectorStatus: boolean;
  hasUnlistedShares: boolean;
  hasBroughtForwardLoss: boolean;
  hasDeferredEsop: boolean;
};

const RETURN_FACT_OPTIONS: Array<{
  id: keyof FilingFactsState;
  label: string;
  helper: string;
  visibleWhen?: (sources: Record<string, boolean>) => boolean;
}> = [
  {
    id: "isPresumptiveBusiness",
    label: "Eligible presumptive business/profession",
    helper: "Use Yes only for eligible 44AD/44ADA/44AE income that may fit ITR-4.",
    visibleWhen: (sources) => Boolean(sources.business),
  },
  {
    id: "hasMoreThanTwoHouseProperties",
    label: "More than two house properties",
    helper: "This usually moves the return away from the simple ITR-1/ITR-4 path.",
    visibleWhen: (sources) => Boolean(sources.houseProperty),
  },
  {
    id: "hasDirectorStatus",
    label: "Director in a company",
    helper: "Director status is an ITR-1/ITR-4 exclusion and needs wider review.",
  },
  {
    id: "hasUnlistedShares",
    label: "Held unlisted equity shares",
    helper: "Unlisted shareholding requires additional disclosure checks.",
  },
  {
    id: "hasBroughtForwardLoss",
    label: "Brought-forward or carry-forward loss",
    helper: "Loss schedules and due-date rules should be reviewed before filing.",
  },
  {
    id: "hasDeferredEsop",
    label: "Deferred ESOP tax",
    helper: "Deferred ESOP tax can block simple return forms.",
  },
];

const newRegimeSlabs = [
  "Rs 0-4L: Nil",
  "Rs 4-8L: 5%",
  "Rs 8-12L: 10%",
  "Rs 12-16L: 15%",
  "Rs 16-20L: 20%",
  "Rs 20-24L: 25%",
  "Above Rs 24L: 30%",
];

const trackProductionEvent = (
  eventName: string,
  properties?: Record<string, string | number | boolean | null>,
) => {
  if (!import.meta.env.PROD) return;

  void import("@vercel/analytics")
    .then(({ track }) => track(eventName, properties))
    .catch(() => undefined);
};

function estimateNewRegimeTax(income: number) {
  const slabs = [
    [400000, 0],
    [400000, 0.05],
    [400000, 0.1],
    [400000, 0.15],
    [400000, 0.2],
    [400000, 0.25],
  ];
  let remaining = income;
  let tax = 0;
  for (const [amount, rate] of slabs) {
    const taxable = Math.min(Math.max(remaining, 0), amount);
    tax += taxable * rate;
    remaining -= amount;
  }
  if (remaining > 0) tax += remaining * 0.3;
  if (income <= 700000) return 0;
  return Math.round(tax * 1.04);
}

function estimateOldRegimeTax(income: number, deductions: number) {
  const taxable = Math.max(0, income - deductions - 50000);
  let tax = 0;
  if (taxable > 1000000) tax += (taxable - 1000000) * 0.3 + 112500;
  else if (taxable > 500000) tax += (taxable - 500000) * 0.2 + 12500;
  else if (taxable > 250000) tax += (taxable - 250000) * 0.05;
  if (taxable <= 500000) return 0;
  return Math.round(tax * 1.04);
}

function toGuideItems(items: readonly FilingGuideItem[]) {
  return items.map((item) => ({ ...item }));
}

function getConditionalDocument(id: string) {
  return AY_2026_27_ITR_GUIDE.conditionalDocuments.find((document) => document.id === id);
}

function getConditionalSection(id: string) {
  return AY_2026_27_ITR_GUIDE.conditionalSections.find((section) => section.id === id);
}

function addUniqueGuideItem(items: FilingGuideItem[], item?: FilingGuideItem) {
  if (!item || items.some((existing) => existing.id === item.id)) return;
  items.push({ ...item });
}

export function recommendITRForAY2026(input: ITRRecommendationInput): ITRRecommendation {
  const selected = input.sourceSelections;
  const hasSalary = Boolean(selected.salary);
  const hasHouseProperty = Boolean(selected.houseProperty);
  const hasOtherSources = Boolean(selected.otherSources);
  const hasBusiness = Boolean(selected.business);
  const hasCapitalGains = Boolean(selected.capitalGains) || Boolean(input.capitalGainsIncome && input.capitalGainsIncome > 0);
  const hasForeignFacts = Boolean(selected.foreignIncome);
  const hasITR1Blocker = Boolean(
    hasBusiness ||
      hasCapitalGains ||
      hasForeignFacts ||
      input.hasMoreThanTwoHouseProperties ||
      input.hasDirectorStatus ||
      input.hasUnlistedShares ||
      input.hasBroughtForwardLoss ||
      input.hasDeferredEsop ||
      input.totalIncome > 5_000_000,
  );
  const hasITR4Blocker = Boolean(
    !hasBusiness ||
      !input.isPresumptiveBusiness ||
      hasCapitalGains ||
      hasForeignFacts ||
      input.hasDirectorStatus ||
      input.hasUnlistedShares ||
      input.hasBroughtForwardLoss ||
      input.hasDeferredEsop ||
      input.totalIncome > 5_000_000,
  );

  let recommendedForm: ITRFormId = "ITR-1";
  const reasons: string[] = [];

  if (hasBusiness) {
    if (!hasITR4Blocker) {
      recommendedForm = "ITR-4";
      reasons.push("Eligible presumptive business/profession income can use the simplified ITR-4 path, subject to CA review.");
    } else {
      recommendedForm = "ITR-3";
      reasons.push("Business or profession income that does not fit the presumptive ITR-4 path generally needs ITR-3.");
    }
  } else if (hasITR1Blocker) {
    recommendedForm = "ITR-2";
    reasons.push("Capital gains, foreign facts, total income above Rs 50 lakh, or other ITR-1 blockers need the wider ITR-2 path.");
  } else {
    recommendedForm = "ITR-1";
    reasons.push("This looks like a simple salary, house-property, and/or other-source profile within the Rs 50 lakh ITR-1 boundary.");
  }

  if (hasCapitalGains) reasons.push("Capital-gains entries should be reconciled with broker or AMC reports and AIS.");
  if (hasForeignFacts) reasons.push("Foreign assets, signing authority, income, or FTC facts require foreign disclosure schedules.");
  if (input.isPresumptiveBusiness && hasBusiness) reasons.push("Presumptive turnover and receipt-mode details should be checked before final filing.");

  const blockedForms: ITRRecommendation["blockedForms"] = [];
  if (recommendedForm !== "ITR-1" && hasITR1Blocker) {
    const blockers = [
      hasBusiness ? "business/profession income" : "",
      hasCapitalGains ? "capital gains" : "",
      hasForeignFacts ? "foreign assets or income" : "",
      input.totalIncome > 5_000_000 ? "total income above Rs 50 lakh" : "",
      input.hasMoreThanTwoHouseProperties ? "more than two house properties" : "",
      input.hasDirectorStatus ? "director status" : "",
      input.hasUnlistedShares ? "unlisted equity shareholding" : "",
      input.hasBroughtForwardLoss ? "brought-forward or carry-forward loss" : "",
      input.hasDeferredEsop ? "deferred ESOP tax" : "",
    ].filter(Boolean);
    blockedForms.push({ form: "ITR-1", reason: `Not suitable because of ${blockers.join(", ")}.` });
  }
  if (recommendedForm !== "ITR-2" && hasBusiness) {
    blockedForms.push({ form: "ITR-2", reason: "ITR-2 is for non-business/profession cases." });
  }
  if (recommendedForm !== "ITR-3" && !hasBusiness) {
    blockedForms.push({ form: "ITR-3", reason: "No non-presumptive business/profession income has been selected." });
  }
  if (recommendedForm !== "ITR-4" && hasITR4Blocker) {
    blockedForms.push({
      form: "ITR-4",
      reason: hasBusiness
        ? "The presumptive ITR-4 path is blocked by non-presumptive selection, capital/foreign facts, Rs 50 lakh limit, or other exclusions."
        : "ITR-4 is only relevant when eligible presumptive business/profession income is selected.",
    });
  }

  const requiredDocuments = toGuideItems(AY_2026_27_ITR_GUIDE.commonDocuments);
  if (hasCapitalGains) addUniqueGuideItem(requiredDocuments, getConditionalDocument("capital-gains-reports"));
  if (hasBusiness && recommendedForm === "ITR-3") addUniqueGuideItem(requiredDocuments, getConditionalDocument("business-books"));
  if (hasBusiness && recommendedForm === "ITR-4") addUniqueGuideItem(requiredDocuments, getConditionalDocument("presumptive-turnover"));
  if (hasForeignFacts) addUniqueGuideItem(requiredDocuments, getConditionalDocument("foreign-assets-ftc"));
  if (hasHouseProperty) addUniqueGuideItem(requiredDocuments, getConditionalDocument("home-loan-interest"));

  const compulsorySections = toGuideItems(AY_2026_27_ITR_GUIDE.compulsorySections);
  if (hasSalary) addUniqueGuideItem(compulsorySections, getConditionalSection("schedule-salary"));
  if (hasHouseProperty) addUniqueGuideItem(compulsorySections, getConditionalSection("schedule-house-property"));
  if (hasOtherSources) addUniqueGuideItem(compulsorySections, getConditionalSection("schedule-other-sources"));
  if (hasCapitalGains) addUniqueGuideItem(compulsorySections, getConditionalSection("schedule-capital-gains"));
  if (recommendedForm === "ITR-3") addUniqueGuideItem(compulsorySections, getConditionalSection("schedule-business"));
  if (recommendedForm === "ITR-4") addUniqueGuideItem(compulsorySections, getConditionalSection("schedule-presumptive"));
  if (hasForeignFacts) addUniqueGuideItem(compulsorySections, getConditionalSection("schedule-foreign"));
  addUniqueGuideItem(compulsorySections, getConditionalSection("schedule-deductions"));

  const nextStepsByForm: Record<ITRFormId, string[]> = {
    "ITR-1": [
      "Confirm pre-filled personal details, employment nature, bank account, AIS/TIS, and Form 26AS.",
      "Review salary, house property, other-source income, deductions, and regime choice.",
      "Submit for CA review, pay any self-assessment tax if needed, then e-verify after filing.",
    ],
    "ITR-2": [
      "Reconcile salary/other income with AIS and prepare capital gains, foreign, or high-complexity schedules.",
      "Confirm loss set-off, special-rate income, deduction schedules, bank/refund, and tax-paid details.",
      "Submit the draft for CA review before filing because ITR-2 disclosures are more schedule-heavy.",
    ],
    "ITR-3": [
      "Complete business/profession income, books, depreciation, audit, tax-paid, and other selected schedules.",
      "Check regime/Form 10-IEA status, brought-forward losses, and GST/TDS records before review.",
      "Send the business return file for CA review before any filing handoff.",
    ],
    "ITR-4": [
      "Confirm presumptive business/profession eligibility, turnover, receipt mode, and 44AD/44ADA/44AE details.",
      "Review salary/house/other-source additions, tax-paid credits, deductions, and Form 10-IEA status if opting out of the default regime.",
      "Submit for CA review, then complete filing and e-verification once the final computation is approved.",
    ],
  };

  return {
    recommendedForm,
    reasons,
    blockedForms,
    requiredDocuments,
    compulsorySections,
    nextSteps: nextStepsByForm[recommendedForm],
  };
}

export default function ITRFilingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [sourceSelections, setSourceSelections] = useState<Record<string, boolean>>({
    salary: true,
    capitalGains: false,
    business: false,
    houseProperty: false,
    otherSources: true,
    foreignIncome: false,
  });
  const [filingFacts, setFilingFacts] = useState<FilingFactsState>({
    isPresumptiveBusiness: false,
    hasMoreThanTwoHouseProperties: false,
    hasDirectorStatus: false,
    hasUnlistedShares: false,
    hasBroughtForwardLoss: false,
    hasDeferredEsop: false,
  });
  const [profileDraft, setProfileDraft] = useState({
    pan: "",
    aadhaarStatus: "Linked",
    mobile: "",
    bankAccount: "",
    ifsc: "",
  });
  const [documentFiles, setDocumentFiles] = useState<Record<string, string>>({});
  const [salaryIncome, setSalaryIncome] = useState(1200000);
  const [interestIncome, setInterestIncome] = useState(25000);
  const [capitalGainsIncome, setCapitalGainsIncome] = useState(0);
  const [deductions, setDeductions] = useState(250000);
  const [rentAmount, setRentAmount] = useState(300000);
  const [tdsPaid, setTdsPaid] = useState(95000);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const progress = ((currentStep + 1) / ITR_FILING_STEPS.length) * 100;

  const totalIncome = salaryIncome + interestIncome + capitalGainsIncome;
  const selectedSourceCount = Object.values(sourceSelections).filter(Boolean).length;
  const selectedIncomeProfile = INCOME_SOURCE_OPTIONS.filter((source) => sourceSelections[source.id]);

  const itrRecommendation = useMemo(
    () =>
      recommendITRForAY2026({
        sourceSelections,
        totalIncome,
        capitalGainsIncome,
        ...filingFacts,
      }),
    [capitalGainsIncome, filingFacts, sourceSelections, totalIncome],
  );

  const readyDocumentCount = itrRecommendation.requiredDocuments.filter((document) => documentFiles[document.id]).length;
  const missingRequiredDocuments = itrRecommendation.requiredDocuments.filter((document) => !documentFiles[document.id]);
  const requiredDocumentsReady = missingRequiredDocuments.length === 0;

  const regime = useMemo(() => {
    const newTax = estimateNewRegimeTax(totalIncome);
    const oldTax = estimateOldRegimeTax(totalIncome, deductions);
    return {
      newTax,
      oldTax,
      better: newTax <= oldTax ? "New Regime" : "Old Regime",
      savings: Math.abs(newTax - oldTax),
      estimatedPayable: Math.max(0, Math.min(newTax, oldTax) - tdsPaid),
    };
  }, [totalIncome, deductions, tdsPaid]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(
        "mye_itr_draft",
        JSON.stringify({
          currentStep,
          sourceSelections,
          filingFacts,
          profileDraft,
          documentFiles,
          salaryIncome,
          interestIncome,
          capitalGainsIncome,
          deductions,
          rentAmount,
          tdsPaid,
          assessmentYear: "2026-27",
          recommendedForm: itrRecommendation.recommendedForm,
          updatedAt: new Date().toISOString(),
        }),
      );
      setLastSavedAt(new Date());
      trackProductionEvent("itr_draft_autosaved", { step: ITR_FILING_STEPS[currentStep].id });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [
    currentStep,
    sourceSelections,
    filingFacts,
    profileDraft,
    documentFiles,
    salaryIncome,
    interestIncome,
    capitalGainsIncome,
    deductions,
    rentAmount,
    tdsPaid,
    itrRecommendation.recommendedForm,
  ]);

  const nextStep = () => {
    if (currentStep < ITR_FILING_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      trackProductionEvent("itr_wizard_step_next", { step: ITR_FILING_STEPS[next].id });
    }
  };

  const previousStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const submitForReview = () => {
    trackProductionEvent("itr_review_payment_start", { method: "assisted_handoff", regime: regime.better });
    window.location.href = "/itr/success";
  };

  const currentStepId = ITR_FILING_STEPS[currentStep].id;

  return (
    <Layout title="MY ITR">
      <div className="space-y-6 pb-28 md:pb-0">
        <MyeCard className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="type-meta font-black uppercase text-[#0050b5]">
                MyeCA filing workspace
              </p>
              <h1 className="type-page-title mt-2 font-black text-slate-950">MY ITR filing workspace</h1>
              <p className="type-body mt-3 max-w-3xl text-slate-600">
                A signed-in AY 2026-27 flow for source selection, document collection, return preparation, CA review, filing handoff, and e-verification tracking.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:min-w-[360px] md:grid-cols-1">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="type-meta font-black uppercase text-blue-700">Likely return</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{itrRecommendation.recommendedForm}</p>
                <p className="mt-1 type-support text-blue-900">Auto-selected from your current income profile.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 type-support text-slate-700">
                <Save className="mr-2 inline h-4 w-4" />
                {lastSavedAt ? `Autosaved ${lastSavedAt.toLocaleTimeString()}` : "Autosave ready"}
              </div>
            </div>
          </div>
        </MyeCard>

        <MyeCard className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="type-meta font-black uppercase text-[#0050b5]">
                MY ITR progress
              </p>
              <h2 className="mt-2 type-section-title font-black text-slate-950">
                Step {currentStep + 1} of {ITR_FILING_STEPS.length}
              </h2>
            </div>
            <StatusBadge status="in_progress" label={ITR_FILING_STEPS[currentStep].title} />
          </div>
          <Progress value={progress} className="mt-4 h-2" />
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {ITR_FILING_STEPS.map((step, index) => (
              <button
                key={step.id}
                type="button"
                aria-current={index === currentStep ? "step" : undefined}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition",
                  index === currentStep && "border-blue-200 bg-blue-50 text-slate-950 shadow-sm",
                  index < currentStep && "border-emerald-200 bg-emerald-50 text-emerald-900",
                  index > currentStep && "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-[#315efb]">
                  {index < currentStep ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </span>
                <span>
                  <span className="block font-black">{step.title}</span>
                  <span className="mt-1 hidden type-meta opacity-80 lg:block">{step.description}</span>
                </span>
              </button>
            ))}
          </div>
        </MyeCard>

        <MyeCard>
            <SectionHeading
              eyebrow="Current step"
              title={ITR_FILING_STEPS[currentStep].title}
              description={ITR_FILING_STEPS[currentStep].description}
            />

            {currentStepId === "sources" && (
              <div className="mt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {INCOME_SOURCE_OPTIONS.map((source) => {
                    const selected = Boolean(sourceSelections[source.id]);
                    return (
                      <div
                        key={source.id}
                        className={cn(
                          "rounded-2xl border p-5",
                          selected ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50",
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-black text-slate-950">{source.label}</p>
                            <p className="mt-1 type-support text-slate-600">{source.helper}</p>
                          </div>
                          <StatusBadge status={selected ? "in_progress" : "not_started"} label={selected ? "Yes" : "No"} />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            className={cn(
                              "h-10 rounded-lg border px-4 text-sm font-bold transition",
                              selected
                                ? "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
                            )}
                            onClick={() => setSourceSelections((prev) => ({ ...prev, [source.id]: true }))}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            className={cn(
                              "h-10 rounded-lg border px-4 text-sm font-bold transition",
                              !selected
                                ? "border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
                            )}
                            onClick={() => setSourceSelections((prev) => ({ ...prev, [source.id]: false }))}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="type-meta font-black uppercase text-[#0050b5]">Return selection checks</p>
                      <h3 className="mt-1 type-card-title font-black text-slate-950">Help MY ITR choose the right form</h3>
                      <p className="mt-1 type-support text-slate-600">
                        These facts affect whether the final path remains ITR-1/ITR-4 or moves to ITR-2/ITR-3 for detailed schedules.
                      </p>
                    </div>
                    <StatusBadge status="ai_validation" label={itrRecommendation.recommendedForm} />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {RETURN_FACT_OPTIONS.filter((fact) => !fact.visibleWhen || fact.visibleWhen(sourceSelections)).map((fact) => {
                      const selected = filingFacts[fact.id];
                      return (
                        <div key={fact.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-black text-slate-950">{fact.label}</p>
                              <p className="mt-1 type-support text-slate-600">{fact.helper}</p>
                            </div>
                            <StatusBadge status={selected ? "action_required" : "not_started"} label={selected ? "Yes" : "No"} />
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              className={cn(
                                "h-10 rounded-lg border px-4 text-sm font-bold transition",
                                selected
                                  ? "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
                              )}
                              onClick={() => setFilingFacts((prev) => ({ ...prev, [fact.id]: true }))}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              className={cn(
                                "h-10 rounded-lg border px-4 text-sm font-bold transition",
                                !selected
                                  ? "border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
                              )}
                              onClick={() => setFilingFacts((prev) => ({ ...prev, [fact.id]: false }))}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <BadgeCheck className="h-7 w-7 text-emerald-800" />
                  <p className="mt-3 font-black text-emerald-950">
                    {selectedSourceCount} source{selectedSourceCount === 1 ? "" : "s"} selected
                  </p>
                  <p className="mt-1 type-support text-emerald-900">
                    Current recommendation: {itrRecommendation.recommendedForm}. This remains CA-reviewed before any filing handoff.
                  </p>
                </div>
              </div>
            )}

            {currentStepId === "profile" && (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="pan">PAN</Label>
                  <Input
                    id="pan"
                    placeholder="ABCDE1234F"
                    value={profileDraft.pan}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, pan: event.target.value.toUpperCase() }))}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="aadhaarStatus">Aadhaar link status</Label>
                  <Input
                    id="aadhaarStatus"
                    value={profileDraft.aadhaarStatus}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, aadhaarStatus: event.target.value }))}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile for OTP updates</Label>
                  <Input
                    id="mobile"
                    placeholder="9876543210"
                    value={profileDraft.mobile}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, mobile: event.target.value }))}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccount">Refund bank account</Label>
                  <Input
                    id="bankAccount"
                    placeholder="Bank account number"
                    value={profileDraft.bankAccount}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, bankAccount: event.target.value }))}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="ifsc">IFSC code</Label>
                  <Input
                    id="ifsc"
                    placeholder="ABCD0123456"
                    value={profileDraft.ifsc}
                    onChange={(event) => setProfileDraft((prev) => ({ ...prev, ifsc: event.target.value.toUpperCase() }))}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
              </div>
            )}

            {currentStepId === "documents" && (
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                  <p className="font-black text-cyan-950">AY 2026-27 document plan for {itrRecommendation.recommendedForm}</p>
                  <p className="mt-1 type-support text-cyan-900">
                    ITR forms are prepared from supporting records. Keep proofs ready for review and future queries even when no document is attached with the return.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {itrRecommendation.requiredDocuments.map((document) => {
                    const uploaded = documentFiles[document.id];
                    return (
                      <div key={document.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <FileText className="h-6 w-6 text-[#315efb]" />
                            <p className="mt-3 font-black text-slate-950">{document.title}</p>
                            <p className="mt-1 type-support text-slate-600">{document.description}</p>
                            {document.appliesWhen && (
                              <p className="mt-2 type-meta font-bold uppercase text-slate-500">{document.appliesWhen}</p>
                            )}
                          </div>
                          <StatusBadge
                            status={uploaded ? "filed" : "action_required"}
                            label={uploaded ? "Ready" : "Needed"}
                          />
                        </div>
                        <Input
                          type="file"
                          className="mt-4 h-11 rounded-lg bg-white"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            setDocumentFiles((prev) => {
                              const next = { ...prev };
                              if (file) next[document.id] = file.name;
                              else delete next[document.id];
                              return next;
                            });
                          }}
                        />
                        {uploaded && <p className="mt-2 type-meta font-semibold text-emerald-700">{uploaded}</p>}
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <p className="font-black text-blue-950">
                    {readyDocumentCount} of {itrRecommendation.requiredDocuments.length} document groups ready
                  </p>
                  <p className="mt-1 type-support text-blue-900">
                    {requiredDocumentsReady
                      ? "The selected-return document plan is marked ready. Extra proofs can still be added before review."
                      : `Complete ${missingRequiredDocuments.length} pending group${missingRequiredDocuments.length === 1 ? "" : "s"} before review.`}
                  </p>
                  <Link href="/documents">
                    <Button variant="outline" className="mt-4 border-blue-200 bg-white text-blue-700 hover:bg-blue-100">
                      Open Document Vault
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {currentStepId === "income" && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="salaryIncome">Salary / pension income</Label>
                    <Input
                      id="salaryIncome"
                      type="number"
                      value={salaryIncome}
                      onChange={(event) => setSalaryIncome(Number(event.target.value))}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="interestIncome">Interest / other income</Label>
                    <Input
                      id="interestIncome"
                      type="number"
                      value={interestIncome}
                      onChange={(event) => setInterestIncome(Number(event.target.value))}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capitalGainsIncome">Capital gains estimate</Label>
                    <Input
                      id="capitalGainsIncome"
                      type="number"
                      value={capitalGainsIncome}
                      onChange={(event) => setCapitalGainsIncome(Number(event.target.value))}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
                  <p className="type-support font-semibold text-slate-500">Total income captured so far</p>
                  <p className="mt-2 text-4xl font-black text-slate-950">{formatInr(totalIncome)}</p>
                  <p className="mt-2 type-support text-slate-600">
                    Add business, house property, or foreign income in the selected-source path before CA review if those apply.
                  </p>
                </div>
              </div>
            )}

            {currentStepId === "deductions" && (
              <div className="mt-6 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="font-black text-slate-950">Regime check before deductions</p>
                  <p className="mt-1 type-support text-slate-600">
                    The new tax regime is the default. Old-regime deductions and exemptions should be claimed only when the return is explicitly prepared under the old-regime path; business/profession taxpayers may need Form 10-IEA checks.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="deductions">Old regime deductions</Label>
                    <Input
                      id="deductions"
                      type="number"
                      value={deductions}
                      onChange={(event) => setDeductions(Number(event.target.value))}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rentAmount">Annual rent paid</Label>
                    <Input
                      id="rentAmount"
                      type="number"
                      value={rentAmount}
                      onChange={(event) => setRentAmount(Number(event.target.value))}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-6">
                    <p className="font-black text-[#315efb]">New Regime tax</p>
                    <p className="mt-3 text-4xl font-black text-slate-950">{formatInr(regime.newTax)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {newRegimeSlabs.map((slab) => (
                        <span key={slab} className="rounded-full bg-white px-3 py-1 type-meta font-bold text-slate-700">
                          {slab}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6">
                    <p className="font-black text-emerald-900">Old Regime tax</p>
                    <p className="mt-3 text-4xl font-black text-slate-950">{formatInr(regime.oldTax)}</p>
                    <p className="mt-4 type-support text-emerald-900">
                      Includes standard deduction and your declared Chapter VIA/HRA estimate.
                    </p>
                  </div>
                </div>
                <div className="rounded-[24px] border border-blue-200 bg-white p-6">
                  <BadgeCheck className="h-8 w-8 text-emerald-700" />
                  <p className="mt-3 type-section-title font-black text-slate-950">{regime.better} currently looks better</p>
                  <p className="mt-2 text-slate-600">
                    Estimated advantage: {formatInr(regime.savings)}. Final selection remains CA-reviewed.
                  </p>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                  <Home className="h-8 w-8 text-emerald-800" />
                  <p className="mt-4 type-section-title font-black text-slate-950">HRA receipt generator</p>
                  <p className="mt-2 text-slate-600">
                    Generate rent receipts from the filing flow and save them directly into the document vault.
                  </p>
                  <Link href="/documents/generator/rent-receipt">
                    <Button variant="outline" className="mt-5 border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
                      Open Generator
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {currentStepId === "tax-paid" && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    ["AIS import", "Compare reported salary, interest, dividends, securities, and foreign remittance values.", "ai_validation"],
                    ["Form 26AS", "Match TDS/TCS and tax payments against your declared income.", "in_progress"],
                    ["Advance tax", "Add challans for advance tax and self-assessment tax paid manually.", "not_started"],
                  ].map(([title, description, status]) => (
                    <div key={title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <CalendarCheck className="h-7 w-7 text-[#315efb]" />
                      <p className="mt-4 type-card-title font-black text-slate-950">{title}</p>
                      <p className="mt-2 type-support text-slate-600">{description}</p>
                      <StatusBadge status={status as any} className="mt-4" />
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="tdsPaid">TDS / tax paid visible in AIS or 26AS</Label>
                  <Input
                    id="tdsPaid"
                    type="number"
                    value={tdsPaid}
                    onChange={(event) => setTdsPaid(Number(event.target.value))}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
              </div>
            )}

            {currentStepId === "review" && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
                  <div className="rounded-[28px] border border-blue-200 bg-blue-50 p-6">
                    <ShieldCheck className="h-8 w-8 text-blue-800" />
                    <h3 className="mt-4 type-section-title font-black text-slate-950">
                      Likely {itrRecommendation.recommendedForm} for AY 2026-27
                    </h3>
                    <p className="mt-2 text-slate-600">
                      MY ITR selected this return type from your income sources, return-selection checks, total income, and current document plan. A CA review still confirms the final filing position.
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <StatusBadge status={selectedSourceCount ? "in_progress" : "action_required"} label={`${selectedSourceCount} income sources`} />
                      <StatusBadge status={requiredDocumentsReady ? "filed" : "action_required"} label={requiredDocumentsReady ? "Documents ready" : "Documents pending"} />
                      <StatusBadge status="ai_validation" label={`${itrRecommendation.compulsorySections.length} sections`} />
                      <StatusBadge status="ca_review" label="CA review next" />
                    </div>
                  </div>
                  <div className="rounded-[28px] border border-slate-200 bg-white p-6">
                    <IndianRupee className="h-8 w-8 text-emerald-700" />
                    <p className="mt-4 type-support font-black uppercase text-slate-500">
                      Estimated tax payable
                    </p>
                    <p className="mt-2 text-4xl font-black text-slate-950">{formatInr(regime.estimatedPayable)}</p>
                    <p className="mt-2 text-slate-600">
                      {regime.better} currently looks better by {formatInr(regime.savings)}. Final liability and filing status must be checked before submission.
                    </p>
                    <button
                      type="button"
                      onClick={submitForReview}
                      className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                    >
                      Submit for CA Review
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <p className="type-meta font-black uppercase text-slate-500">Selected income profile</p>
                    <div className="mt-4 grid gap-2">
                      {selectedIncomeProfile.length ? selectedIncomeProfile.map((source) => (
                        <div key={source.id} className="rounded-xl bg-white p-3">
                          <p className="font-black text-slate-950">{source.label}</p>
                          <p className="mt-1 type-support text-slate-600">{source.helper}</p>
                        </div>
                      )) : (
                        <p className="type-support text-slate-600">Select at least one income source before final review.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <p className="type-meta font-black uppercase text-slate-500">Why this return</p>
                    <div className="mt-4 grid gap-2">
                      {itrRecommendation.reasons.map((reason) => (
                        <div key={reason} className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-950">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                          <p className="type-support font-semibold">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <p className="type-meta font-black uppercase text-slate-500">Forms ruled out</p>
                    <div className="mt-4 grid gap-2">
                      {itrRecommendation.blockedForms.length ? itrRecommendation.blockedForms.map((blocked) => (
                        <div key={blocked.form} className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                          <p className="font-black text-amber-950">{blocked.form}</p>
                          <p className="mt-1 type-support text-amber-900">{blocked.reason}</p>
                        </div>
                      )) : (
                        <p className="type-support text-slate-600">No exclusions detected from the current answers.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <p className="type-meta font-black uppercase text-slate-500">Pending documents</p>
                    <div className="mt-4 grid gap-2">
                      {missingRequiredDocuments.length ? missingRequiredDocuments.map((document) => (
                        <div key={document.id} className="rounded-xl bg-white p-3">
                          <p className="font-black text-slate-950">{document.title}</p>
                          <p className="mt-1 type-support text-slate-600">{document.description}</p>
                        </div>
                      )) : (
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-950">
                          <p className="font-black">All recommended document groups are marked ready.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <p className="type-meta font-black uppercase text-slate-500">Compulsory sections</p>
                    <div className="mt-4 grid gap-2">
                      {itrRecommendation.compulsorySections.map((section) => (
                        <div key={section.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <p className="font-black text-slate-950">{section.title}</p>
                          <p className="mt-1 type-support text-slate-600">{section.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6">
                  <p className="type-meta font-black uppercase text-emerald-700">
                    Step-by-step guide for {itrRecommendation.recommendedForm}
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {itrRecommendation.nextSteps.map((step, index) => (
                      <div key={step} className="rounded-2xl bg-white p-4">
                        <p className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800">
                          {index + 1}
                        </p>
                        <p className="mt-3 type-support font-semibold text-slate-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStepId === "e-verify" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                  <CheckCircle2 className="h-8 w-8 text-emerald-800" />
                  <h3 className="mt-4 type-section-title font-black text-slate-950">After filing, e-verify within 30 days</h3>
                  <p className="mt-2 text-slate-600">
                    Complete e-verification through Aadhaar OTP, net banking, bank account EVC, demat EVC, DSC, or ITR-V where applicable. An unverified return may be treated as not filed.
                  </p>
                  <div className="mt-5 grid gap-3">
                    {["Aadhaar OTP", "Net banking", "Bank account EVC", "Demat account EVC", "DSC / ITR-V if applicable"].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-4">
                        <ReceiptText className="h-5 w-5 text-[#315efb]" />
                        <span className="font-semibold text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-white p-6">
                  <FileText className="h-8 w-8 text-[#315efb]" />
                  <p className="mt-4 type-section-title font-black text-slate-950">Track acknowledgement and refund</p>
                  <p className="mt-2 text-slate-600">
                    Keep acknowledgement number, e-verification status, and refund status visible from the ITR tracker.
                  </p>
                  <Link href="/itr/status-tracker">
                    <Button variant="outline" className="mt-6 w-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                      Open ITR Tracker
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </MyeCard>

          <div className="fixed inset-x-4 bottom-20 z-40 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_16px_50px_-35px_rgba(15,23,42,0.6)] backdrop-blur md:sticky md:inset-x-auto md:z-20 md:pr-48 lg:bottom-4">
            <button
              type="button"
              onClick={previousStep}
              disabled={currentStep === 0}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            {currentStep < ITR_FILING_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link href="/itr/status-tracker">
                <button type="button" className="flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100">
                  Track ITR
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </Link>
            )}
          </div>
      </div>
    </Layout>
  );
}
