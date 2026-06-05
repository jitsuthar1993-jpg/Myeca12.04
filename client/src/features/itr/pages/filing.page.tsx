import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  IndianRupee,
  Loader2,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MyeCard,
  SectionHeading,
  StatusBadge,
  formatInr,
} from "@/components/platform/compliance-ui";
import { Layout } from "@/components/admin/Layout";
import {
  ChoiceButton,
  FilingSummaryStrip,
  GuidedStepNav,
  IssueList,
  NumberInput,
  TextInput,
  ToggleRow,
} from "@/features/itr/components/filing/guided-filing-ui";
import {
  clearItrStartHandoff,
  readItrStartHandoff,
  type ItrStartHandoffPayload,
} from "@/features/itr/lib/start-selector";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import {
  ITR_REVIEW_STATUSES,
  buildItrReviewPacket,
  buildItrVerificationReport,
  calculateItrTotalDeductions,
  calculateItrTotalIncome,
  calculateItrTotalTaxPaid,
  computeItrTaxLiability,
  getItrDocumentChecklist,
  normalizeItrDraft,
  recommendItrForm,
  validateItrIdentity,
  type ItrFilingDraft,
  type ItrFormRecommendation,
  type ItrReviewPacket,
} from "@shared/itr-filing";

export const ITR_FILING_STEPS = [
  {
    id: "owner",
    title: "Owner",
    description: "Choose whether this is your own ITR or another person's draft.",
  },
  {
    id: "identity",
    title: "Identity",
    description: "Capture PAN format, Aadhaar, and refund-bank details.",
  },
  {
    id: "income",
    title: "Income",
    description: "Select income types and enter AY 2026-27 figures.",
  },
  {
    id: "documents",
    title: "Documents",
    description: "Link only the documents required by the selected facts.",
  },
  {
    id: "verify",
    title: "Verify",
    description: "Review rule checks, blockers, and missing evidence.",
  },
  {
    id: "compute",
    title: "Compute",
    description: "Compare old/new regime liability and refund or payable.",
  },
  {
    id: "review",
    title: "Review",
    description: "Prepare the self-prep packet for CA review.",
  },
] as const;

export const WORKSPACE_ITR_REVIEW_STATUSES = ITR_REVIEW_STATUSES;

export type ITRFormId = "ITR-1" | "ITR-2" | "ITR-3" | "ITR-4";

export type FilingGuideItem = {
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

const UPLOADABLE_ITR_DOCUMENT_IDS = new Set([
  "form16-form16a",
  "ais-tis",
  "form26as",
  "bank-statements",
  "tax-challans",
  "deduction-proofs",
  "hra-rent",
  "home-loan-interest",
  "capital-gains-reports",
  "business-books",
  "presumptive-turnover",
  "foreign-assets-ftc",
]);

export function getUploadableITRDocuments(
  documents: readonly FilingGuideItem[],
  _filingPath: ITRFilingPathId | null = null,
) {
  return documents.filter((document) => UPLOADABLE_ITR_DOCUMENT_IDS.has(document.id));
}

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
  mobileActionBarOffset: "above-user-bottom-nav",
  tone: "professional",
} as const;

type TaxReturnRecord = {
  id: string;
  profileId: string | null;
  assessmentYear: string;
  itrType: string;
  status: string;
  reviewStatus: string;
  formData: ItrFilingDraft;
  recommendation?: ItrFormRecommendation;
  reviewPacket?: ItrReviewPacket | null;
  updatedAt?: string;
};

type TaxReturnsResponse = {
  taxReturns: TaxReturnRecord[];
};

type VaultDocument = {
  id: string;
  name: string;
  originalName?: string | null;
  category?: string | null;
  taxReturnId?: string | null;
};

type DocumentsResponse = {
  documents: VaultDocument[];
};

type CreateDraftInput = {
  draft?: ItrFilingDraft;
  clearHandoff?: boolean;
};

const STARTER_DRAFT = normalizeItrDraft({
  assessmentYear: "2026-27",
  filingOwner: { mode: "self" },
  taxpayer: {
    type: "individual",
    residentialStatus: "resident",
  },
});

const INCOME_TOGGLES = [
  {
    key: "salary",
    title: "Salary or pension",
    description: "Form 16, pension certificate, employer TDS.",
  },
  {
    key: "otherSources",
    title: "Other sources",
    description: "Interest, dividend, family pension, small receipts.",
  },
  {
    key: "houseProperty",
    title: "House property",
    description: "Rent, interest, and property count.",
  },
  {
    key: "capitalGains",
    title: "Capital gains",
    description: "Shares, mutual funds, property, ESOP, VDA.",
  },
  {
    key: "business",
    title: "Business or profession",
    description: "Freelance, consulting, business, presumptive income.",
  },
  {
    key: "foreign",
    title: "Foreign / NRI facts",
    description: "Foreign income, assets, signing authority, Form 67.",
  },
] as const;

const RISK_FLAGS: Array<{
  key: keyof ItrFilingDraft["flags"];
  label: string;
  helper: string;
}> = [
  { key: "directorInCompany", label: "Director in company", helper: "Usually moves the case beyond simple forms." },
  { key: "heldUnlistedEquity", label: "Unlisted equity held", helper: "Needs enhanced disclosure review." },
  { key: "hasForeignAssets", label: "Foreign assets", helper: "Triggers Schedule FA review." },
  { key: "hasForeignSigningAuthority", label: "Foreign signing authority", helper: "Requires foreign disclosure checks." },
  { key: "hasDeferredEsopTax", label: "Deferred ESOP tax", helper: "Needs CA review and schedule mapping." },
  { key: "hasBroughtForwardLoss", label: "Brought-forward loss", helper: "Moves into detailed set-off review." },
  { key: "hasCarryForwardLoss", label: "Carry-forward loss", helper: "Needs loss schedule handling." },
  { key: "section194NCashWithdrawal", label: "Section 194N TDS", helper: "Blocks simple forms." },
  { key: "governedByPortugueseCivilCode", label: "Portuguese Civil Code", helper: "Needs separate review path." },
];

function recommendationStatus(recommendation: ItrFormRecommendation) {
  if (recommendation.form === "CA_SCOPE_REVIEW") return "action_required";
  if (recommendation.blockers.length > 0) return "ca_review";
  return "filed";
}

function documentCountLabel(count: number) {
  return count === 1 ? "1 required document" : `${count} required documents`;
}

function maskDigits(value: string, visible = 4) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "Not entered";
  if (digits.length <= visible) return "X".repeat(digits.length);
  return `${"X".repeat(digits.length - visible)}${digits.slice(-visible)}`;
}

function savedTaxpayerLabel(returnRecord: TaxReturnRecord) {
  const taxpayer = normalizeItrDraft(returnRecord.formData).taxpayer;
  const name = `${taxpayer.firstName} ${taxpayer.lastName}`.trim();
  return name || taxpayer.pan || `Draft ${returnRecord.id}`;
}

function incomeToggleSelected(draft: ItrFilingDraft, key: (typeof INCOME_TOGGLES)[number]["key"]) {
  if (key === "salary") return draft.income.salary + draft.income.pension > 0;
  if (key === "otherSources") return draft.income.otherSources > 0;
  if (key === "houseProperty") return draft.income.houseProperties > 0 || draft.income.housePropertyIncome > 0;
  if (key === "capitalGains") {
    return draft.income.shortTermCapitalGains + draft.income.section112aLtcg + draft.income.otherCapitalGains > 0;
  }
  if (key === "business") return draft.income.businessIncome + draft.income.professionalIncome > 0;
  return draft.income.foreignIncome > 0 || draft.flags.hasForeignAssets || draft.flags.hasForeignSigningAuthority;
}

function apiErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return "Please try again. If it still fails, contact support.";
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [activeReturnId, setActiveReturnId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ItrFilingDraft>(STARTER_DRAFT);
  const [selectorHandoff, setSelectorHandoff] = useState<ItrStartHandoffPayload | null>(null);
  const [handoffChecked, setHandoffChecked] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [showSensitive, setShowSensitive] = useState(false);
  const aadhaarInputId = useId();
  const aadhaarHelperId = `${aadhaarInputId}-helper`;
  const accountTypeId = useId();
  const autoCreateHandoffRef = useRef<string | null>(null);

  const taxReturnsQuery = useQuery<TaxReturnsResponse>({
    queryKey: ["/api/tax-returns"],
    queryFn: async () => {
      const response = await apiRequest("/api/tax-returns");
      return response.json();
    },
  });

  const taxReturns = taxReturnsQuery.data?.taxReturns ?? [];
  const activeReturn = taxReturns.find((item) => item.id === activeReturnId) ?? taxReturns[0] ?? null;
  const reviewSubmitted = activeReturn?.status === "ready_for_review";

  const documentsQuery = useQuery<DocumentsResponse>({
    queryKey: ["/api/documents"],
    enabled: Boolean(activeReturn),
    queryFn: async () => {
      const response = await apiRequest("/api/documents");
      return response.json();
    },
  });

  const vaultDocuments = documentsQuery.data?.documents ?? [];
  const recommendation = useMemo(() => recommendItrForm(draft), [draft]);
  const documentChecklist = useMemo(() => getItrDocumentChecklist(draft), [draft]);
  const verificationReport = useMemo(() => buildItrVerificationReport(draft), [draft]);
  const identityValidation = useMemo(() => validateItrIdentity(draft), [draft]);
  const taxLiability = useMemo(() => computeItrTaxLiability(draft), [draft]);
  const reviewPacket = useMemo(
    () => buildItrReviewPacket(draft, activeReturn?.id ?? "unsaved-draft"),
    [draft, activeReturn?.id],
  );
  const currentStepId = ITR_FILING_STEPS[currentStep].id;
  const requiredDocumentCount = documentChecklist.filter((item) => item.required).length;
  const openIssueCount = verificationReport.summary.critical + verificationReport.summary.warning;

  const draftWorkspaceInput = useMemo(
    () => ({
      currentStep,
      sourceSelections,
      filingFacts,
      profileDraft,
      documentFiles,
      updatedSections,
      selectedFilingPath,
      salaryIncome,
      interestIncome,
      capitalGainsIncome,
      deductions,
      rentAmount,
      tdsPaid,
    }),
    [
      currentStep,
      sourceSelections,
      filingFacts,
      profileDraft,
      documentFiles,
      updatedSections,
      selectedFilingPath,
      salaryIncome,
      interestIncome,
      capitalGainsIncome,
      deductions,
      rentAmount,
      tdsPaid,
    ],
  );

  const draftApiPayload = useMemo(
    () =>
      buildITRDraftApiPayload({
        ...draftWorkspaceInput,
        recommendation: itrRecommendation,
        totalIncome,
        regime,
        uploadableDocuments,
      }),
    [draftWorkspaceInput, itrRecommendation, regime, totalIncome, uploadableDocuments],
  );

  const draftQuery = useQuery({
    queryKey: ["/api/itr/draft"],
    queryFn: async () => {
      const response = await apiRequest("/api/itr/draft");
      return response.json();
    },
    retry: 0,
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (payload: ReturnType<typeof buildITRDraftApiPayload>) => {
      const response = await apiRequest("/api/itr/draft", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    onSuccess: async (data) => {
      if (data?.draft?.id) setDraftId(data.draft.id);
      if (data?.draft?.userServiceId) setUserServiceId(data.draft.userServiceId);
      await queryClient.invalidateQueries({ queryKey: ["/api/user/dashboard"] });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const reviewPayload = buildITRDraftApiPayload({
        ...draftWorkspaceInput,
        selectedFilingPath: "ca",
        recommendation: itrRecommendation,
        totalIncome,
        regime,
        uploadableDocuments,
      });
      await saveDraftMutation.mutateAsync(reviewPayload);
      const response = await apiRequest("/api/itr/submit-review", {
        method: "POST",
        body: JSON.stringify({ userNote: "Submitted from MY ITR workspace." }),
      });
      return response.json();
    },
    onSuccess: async (data) => {
      if (data?.taxReturn?.id) setDraftId(data.taxReturn.id);
      if (data?.service?.id) setUserServiceId(data.service.id);
      await invalidateWorkspaceCaseCaches(queryClient, data?.service?.id);
      await invalidateDocumentCaches(queryClient, data?.service?.id);
      localStorage.removeItem(ITR_DRAFT_STORAGE_KEY);
      toast({
        title: "Submitted for CA review",
        description: "Your MY ITR draft, uploads, and case details are now in the review queue.",
      });
      setLocation(data?.service?.id ? `/dashboard/services/${data.service.id}` : "/itr/success");
    },
    onError: (error: any) => {
      toast({
        title: "Could not submit for review",
        description: error?.message || "Please try again after saving the draft.",
        variant: "destructive",
      });
    },
  });

  const applyDraftSnapshot = (draft: Record<string, any>) => {
    const workspace = (draft.workspaceState || draft) as Record<string, any>;
    const savedStep = Number(workspace.currentStep);
    if (Number.isInteger(savedStep)) {
      setCurrentStep(Math.min(Math.max(savedStep, 0), ITR_FILING_STEPS.length - 1));
    }
    if (workspace.sourceSelections || draft.sourceSelections) {
      setSourceSelections((current) => ({ ...current, ...(workspace.sourceSelections || draft.sourceSelections) }));
    }
    if (workspace.filingFacts || draft.filingFacts) {
      setFilingFacts((current) => ({ ...current, ...(workspace.filingFacts || draft.filingFacts) }));
    }
    if (workspace.profileDraft || draft.profileDraft) {
      setProfileDraft((current) => ({ ...current, ...(workspace.profileDraft || draft.profileDraft) }));
    }
    if (workspace.documentFiles && typeof workspace.documentFiles === "object") {
      setDocumentFiles(workspace.documentFiles);
    }
    if (workspace.updatedSections && typeof workspace.updatedSections === "object") {
      setUpdatedSections(workspace.updatedSections);
    }
    const restoredPath = draft.filingPath || workspace.selectedFilingPath;
    if (restoredPath === "self" || restoredPath === "ca") {
      setSelectedFilingPath("ca");
    }
    if (typeof workspace.salaryIncome === "number") setSalaryIncome(workspace.salaryIncome);
    if (typeof workspace.interestIncome === "number") setInterestIncome(workspace.interestIncome);
    if (typeof workspace.capitalGainsIncome === "number") setCapitalGainsIncome(workspace.capitalGainsIncome);
    if (typeof workspace.deductions === "number") setDeductions(workspace.deductions);
    if (typeof workspace.rentAmount === "number") setRentAmount(workspace.rentAmount);
    if (typeof workspace.tdsPaid === "number") setTdsPaid(workspace.tdsPaid);
    if (typeof draft.id === "string") setDraftId(draft.id);
    if (typeof draft.userServiceId === "string") setUserServiceId(draft.userServiceId);
    if (draft.updatedAt || workspace.updatedAt) {
      const savedAt = new Date(draft.updatedAt || workspace.updatedAt);
      if (!Number.isNaN(savedAt.getTime())) setLastSavedAt(savedAt);
    }
  };

  useEffect(() => {
    const cached = parseCachedITRDraft(localStorage.getItem(ITR_DRAFT_STORAGE_KEY));
    if (cached) applyDraftSnapshot(cached);
  }, []);

  useEffect(() => {
    if (serverDraftApplied || draftQuery.isLoading) return;
    if (draftQuery.data?.draft) {
      applyDraftSnapshot(draftQuery.data.draft);
    }
    setServerDraftApplied(true);
  }, [draftQuery.data, draftQuery.isLoading, serverDraftApplied]);

  useEffect(() => {
    if (!activeReturnId && taxReturns[0]?.id) {
      setActiveReturnId(taxReturns[0].id);
    }
  }, [activeReturnId, taxReturns]);

  useEffect(() => {
    if (taxReturnsQuery.isLoading || handoffChecked) return;
    setSelectorHandoff(readItrStartHandoff());
    setHandoffChecked(true);
  }, [handoffChecked, taxReturnsQuery.isLoading]);

  useEffect(() => {
    if (!activeReturn) return;
    setDraft(normalizeItrDraft(activeReturn.formData));
    setPendingSave(false);
    setSaveError(null);
  }, [activeReturn?.id]);

  useEffect(() => {
    if (!activeReturnId || !pendingSave) return;

    const timer = window.setTimeout(async () => {
      try {
        await apiRequest(`/api/tax-returns/${activeReturnId}`, {
          method: "PATCH",
          body: JSON.stringify({ draft }),
        });
        setLastSavedAt(new Date());
        setSaveError(null);
        queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
      } catch (error) {
        setSaveError(error);
      } finally {
        setPendingSave(false);
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [activeReturnId, draft, pendingSave]);

  const createDraftMutation = useMutation({
    mutationFn: async (input?: CreateDraftInput) => {
      const draftToCreate = input?.draft ? normalizeItrDraft(input.draft) : STARTER_DRAFT;
      const response = await apiRequest("/api/tax-returns", {
        method: "POST",
        body: JSON.stringify({
          assessmentYear: draftToCreate.assessmentYear,
          draft: draftToCreate,
        }),
      });
      return response.json() as Promise<{ taxReturn: TaxReturnRecord }>;
    },
    onSuccess: (data, input) => {
      setActiveReturnId(data.taxReturn.id);
      setDraft(normalizeItrDraft(data.taxReturn.formData));
      setSaveError(null);
      if (input?.clearHandoff) {
        clearItrStartHandoff();
        setSelectorHandoff(null);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
    },
  });

  const applyHandoffMutation = useMutation({
    mutationFn: async () => {
      if (!activeReturn?.id || !selectorHandoff) throw new Error("No saved selector handoff to apply.");
      const response = await apiRequest(`/api/tax-returns/${activeReturn.id}`, {
        method: "PATCH",
        body: JSON.stringify({ draft: selectorHandoff.draft }),
      });
      return response.json() as Promise<{ taxReturn: TaxReturnRecord }>;
    },
    onSuccess: (data) => {
      setDraft(normalizeItrDraft(data.taxReturn.formData));
      clearItrStartHandoff();
      setSelectorHandoff(null);
      queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
    },
  });

  useEffect(() => {
    if (!handoffChecked || !selectorHandoff || taxReturnsQuery.isLoading || taxReturns.length > 0 || createDraftMutation.isPending) {
      return;
    }

    if (autoCreateHandoffRef.current === selectorHandoff.flowId) return;
    autoCreateHandoffRef.current = selectorHandoff.flowId;
    createDraftMutation.mutate({ draft: selectorHandoff.draft, clearHandoff: true });
  }, [
    createDraftMutation,
    handoffChecked,
    selectorHandoff,
    taxReturns.length,
    taxReturnsQuery.isLoading,
  ]);

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!activeReturnId) throw new Error("Save a draft before submitting for review.");
      const response = await apiRequest(`/api/tax-returns/${activeReturnId}/submit-review`, {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
    },
  });

  const linkDocumentMutation = useMutation({
    mutationFn: async ({ checklistItemId, documentId }: { checklistItemId: string; documentId: string }) => {
      if (!activeReturnId) throw new Error("Save a draft before linking documents.");
      const response = await apiRequest(`/api/tax-returns/${activeReturnId}/documents`, {
        method: "POST",
        body: JSON.stringify({ checklistItemId, documentId }),
      });
      return response.json() as Promise<{ taxReturn: TaxReturnRecord }>;
    },
    onSuccess: (data) => {
      setDraft(normalizeItrDraft(data.taxReturn.formData));
      queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });

  const updateDraft = (updater: (current: ItrFilingDraft) => ItrFilingDraft) => {
    setSaveError(null);
    setDraft((current) => normalizeItrDraft(updater(current)));
    setPendingSave(Boolean(activeReturnId));
  };

  const updateOwner = (patch: Partial<ItrFilingDraft["filingOwner"]>) => {
    updateDraft((current) => ({ ...current, filingOwner: { ...current.filingOwner, ...patch } }));
  };

  const updateTaxpayer = (patch: Partial<ItrFilingDraft["taxpayer"]>) => {
    updateDraft((current) => ({ ...current, taxpayer: { ...current.taxpayer, ...patch } }));
  };

  const updateFiling = (patch: Partial<ItrFilingDraft["filing"]>) => {
    updateDraft((current) => ({ ...current, filing: { ...current.filing, ...patch } }));
  };

  const updateIncome = (patch: Partial<ItrFilingDraft["income"]>) => {
    updateDraft((current) => ({ ...current, income: { ...current.income, ...patch } }));
  };

  const updateDeductions = (patch: Partial<ItrFilingDraft["deductions"]>) => {
    updateDraft((current) => ({ ...current, deductions: { ...current.deductions, ...patch } }));
  };

  const updateTaxPaid = (patch: Partial<ItrFilingDraft["taxPaid"]>) => {
    updateDraft((current) => ({ ...current, taxPaid: { ...current.taxPaid, ...patch } }));
  };

  const updateFlag = (key: keyof ItrFilingDraft["flags"], value: boolean) => {
    updateDraft((current) => ({ ...current, flags: { ...current.flags, [key]: value } }));
  };

  const updateDocument = (id: string, value: string) => {
    updateDraft((current) => ({
      ...current,
      documents: {
        ...current.documents,
        [id]: value,
      },
    }));
  };

  const toggleIncomeType = (key: (typeof INCOME_TOGGLES)[number]["key"], selected: boolean) => {
    if (key === "salary") updateIncome({ salary: selected ? 900000 : 0, pension: 0 });
    if (key === "otherSources") updateIncome({ otherSources: selected ? 40000 : 0 });
    if (key === "houseProperty") updateIncome({ houseProperties: selected ? 1 : 0, housePropertyIncome: selected ? 60000 : 0 });
    if (key === "capitalGains") updateIncome({ shortTermCapitalGains: selected ? 50000 : 0, section112aLtcg: 0, otherCapitalGains: 0 });
    if (key === "business") updateIncome({ professionalIncome: selected ? 900000 : 0, businessIncome: 0, presumptiveScheme: selected ? "44ADA" : "none" });
    if (key === "foreign") {
      updateDraft((current) => ({
        ...current,
        income: { ...current.income, foreignIncome: selected ? 25000 : 0 },
        flags: { ...current.flags, hasForeignAssets: selected },
      }));
    }
  };

  const linkedVaultDocument = (checklistItemId: string) =>
    vaultDocuments.find((document) => document.id === draft.documents[checklistItemId]) ?? null;

  const dismissHandoff = () => {
    clearItrStartHandoff();
    setSelectorHandoff(null);
  };

  const previousStep = () => setCurrentStep((step) => Math.max(step - 1, 0));
  const nextStep = () => setCurrentStep((step) => Math.min(step + 1, ITR_FILING_STEPS.length - 1));

  if (taxReturnsQuery.isLoading) {
    return (
      <Layout title="MY ITR">
        <MyeCard className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </MyeCard>
      </Layout>
    );
  }

  if (taxReturnsQuery.isError) {
    return (
      <Layout title="MY ITR">
        <MyeCard className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">MY ITR</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">We couldn't load your ITR drafts</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                {apiErrorMessage(taxReturnsQuery.error)}
              </p>
              <Button
                type="button"
                onClick={() => void taxReturnsQuery.refetch()}
                disabled={taxReturnsQuery.isFetching}
                className="mt-5 bg-blue-600 text-white hover:bg-blue-700"
              >
                {taxReturnsQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Retry
              </Button>
            </div>
          </div>
        </MyeCard>
      </Layout>
    );
  }

  if (!activeReturn) {
    return (
      <Layout title="MY ITR">
        <MyeCard className="p-6">
          <SectionHeading
            eyebrow="MY ITR"
            title="Start a new AY 2026-27 filing draft"
            description="Prepare your own ITR or another person's draft, then submit the self-prep packet for CA review."
          />
          {createDraftMutation.isError ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-black text-red-900">We couldn't start your ITR draft</p>
                  <p className="mt-1 leading-6">{apiErrorMessage(createDraftMutation.error)}</p>
                </div>
              </div>
            </div>
          ) : null}
          <Button
            className="mt-6 bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              createDraftMutation.reset();
              createDraftMutation.mutate({});
            }}
            disabled={createDraftMutation.isPending}
          >
            {createDraftMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Start from scratch
          </Button>
        </MyeCard>
      </Layout>
    );
  }

  return (
    <Layout title="MY ITR">
      <div className="space-y-5 pb-28 md:pb-6">
        <MyeCard className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">MY ITR</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Self-prep with CA review</h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
                AY 2026-27 guided filing workspace for owner details, identity, income, documents, verification, computation, and professional review.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
              <StatusBadge status={recommendationStatus(recommendation) as any} label={recommendation.form.replace(/_/g, " ")} />
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                <Save className="mr-2 inline h-4 w-4" />
                {saveError ? "Save failed" : pendingSave ? "Saving..." : lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString()}` : "Saved draft"}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                {documentCountLabel(requiredDocumentCount)}
              </div>
            </div>
          </div>
        </MyeCard>

        {saveError ? (
          <MyeCard className="border-red-200 bg-red-50 p-4 shadow-none">
            <div className="flex items-start gap-3 text-sm font-semibold text-red-800" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-black text-red-900">We couldn't save your latest draft changes</p>
                <p className="mt-1 leading-6">{apiErrorMessage(saveError)}</p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setPendingSave(Boolean(activeReturnId))}
                  className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Retry save
                </Button>
              </div>
            </div>
          </MyeCard>
        ) : null}

        {selectorHandoff && activeReturn ? (
          <MyeCard className="border-blue-200 bg-blue-50 p-5 shadow-none">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Saved selector answers</p>
                <h2 className="mt-2 text-xl font-black text-slate-950">Resume your ITR plan</h2>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-700">
                  We found the plan you started from {selectorHandoff.source.replace(/_/g, " ")}. Apply it to this draft to carry forward the recommended {selectorHandoff.recommendation.form.replace(/_/g, " ")} path.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                <Button
                  type="button"
                  onClick={() => applyHandoffMutation.mutate()}
                  disabled={applyHandoffMutation.isPending}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {applyHandoffMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
                  Apply plan
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={dismissHandoff}
                  disabled={applyHandoffMutation.isPending}
                  className="border-blue-200 bg-white text-blue-700 hover:bg-blue-100"
                >
                  Dismiss plan
                </Button>
              </div>
            </div>
          </MyeCard>
        ) : null}

        <GuidedStepNav
          steps={ITR_FILING_STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />

        <MyeCard className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Step {currentStep + 1} of {ITR_FILING_STEPS.length}</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{ITR_FILING_STEPS[currentStep].title}</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">{ITR_FILING_STEPS[currentStep].description}</p>
            </div>
            <StatusBadge
              status={verificationReport.status === "blocked" ? "action_required" : verificationReport.status === "review" ? "ca_review" : "filed"}
              label={verificationReport.status === "ready" ? "Checks clear" : `${openIssueCount} checks open`}
            />
          </div>

          <div className="mt-5">
            {currentStepId === "owner" && (
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <ChoiceButton
                    selected={draft.filingOwner.mode === "self"}
                    title="My own ITR"
                    description="Prepare the signed-in user's income-tax draft."
                    onClick={() => updateOwner({ mode: "self", personId: "", relationship: "", displayName: "" })}
                  />
                  <ChoiceButton
                    selected={draft.filingOwner.mode === "other"}
                    title="Another person"
                    description="Prepare an ITR draft for a family member, client, or saved taxpayer."
                    onClick={() => updateOwner({ mode: "other" })}
                  />
                </div>
                {draft.filingOwner.mode === "other" ? (
                  <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                    <div>
                      <Label>Previous list</Label>
                      <Select
                        value={draft.filingOwner.personId || "manual"}
                        onValueChange={(value) => {
                          if (value === "manual") {
                            updateOwner({ personId: "", displayName: "" });
                            return;
                          }

                          const selectedReturn = taxReturns.find((item) => item.id === value);
                          updateOwner({
                            personId: value,
                            displayName: selectedReturn ? savedTaxpayerLabel(selectedReturn) : "",
                          });
                        }}
                      >
                        <SelectTrigger className="mt-2 h-11 rounded-lg">
                          <SelectValue placeholder="Select saved taxpayer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Add new person</SelectItem>
                          {taxReturns.map((item) => (
                            <SelectItem key={item.id} value={item.id}>{savedTaxpayerLabel(item)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <TextInput
                      label="Person label"
                      value={draft.filingOwner.displayName}
                      onChange={(value) => updateOwner({ displayName: value })}
                      helper="Used only to identify this private draft."
                    />
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 border-blue-100 bg-blue-50 font-black text-blue-700 hover:bg-blue-100"
                        onClick={() => updateOwner({ personId: "", displayName: "", relationship: "" })}
                      >
                        <UsersRound className="h-4 w-4" />
                        Add new person
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {currentStepId === "identity" && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <TextInput label="First name" value={draft.taxpayer.firstName} onChange={(value) => updateTaxpayer({ firstName: value })} />
                  <TextInput label="Last name" value={draft.taxpayer.lastName} onChange={(value) => updateTaxpayer({ lastName: value })} />
                  <TextInput label="Date of birth" type="date" value={draft.taxpayer.dateOfBirth} onChange={(value) => updateTaxpayer({ dateOfBirth: value })} />
                  <TextInput
                    label="PAN"
                    value={draft.taxpayer.pan}
                    onChange={(value) => updateTaxpayer({ pan: value.toUpperCase() })}
                    helper={identityValidation.panFormatValid ? "PAN format valid" : "PAN format check only"}
                  />
                  <div>
                    <Label htmlFor={aadhaarInputId}>Aadhaar</Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id={aadhaarInputId}
                        type={showSensitive ? "text" : "password"}
                        value={draft.taxpayer.aadhaar}
                        aria-describedby={aadhaarHelperId}
                        onChange={(event) => updateTaxpayer({ aadhaar: event.target.value })}
                        className="h-11 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-11 shrink-0 border-slate-200 p-0"
                        onClick={() => setShowSensitive((current) => !current)}
                        aria-label={showSensitive ? "Hide Aadhaar" : "Show Aadhaar"}
                      >
                        {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p id={aadhaarHelperId} className="mt-1 text-xs font-semibold text-slate-500">
                      Stored securely. Preview: {maskDigits(draft.taxpayer.aadhaar)}
                    </p>
                  </div>
                  <TextInput label="Mobile" value={draft.taxpayer.mobile} onChange={(value) => updateTaxpayer({ mobile: value })} />
                  <TextInput label="Email" value={draft.taxpayer.email} onChange={(value) => updateTaxpayer({ email: value })} />
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-blue-700" />
                    <h3 className="text-lg font-black text-slate-950">Refund bank</h3>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <TextInput label="Account holder" value={draft.taxpayer.bankAccountHolder} onChange={(value) => updateTaxpayer({ bankAccountHolder: value })} />
                    <TextInput label="Bank name" value={draft.taxpayer.bankName} onChange={(value) => updateTaxpayer({ bankName: value })} />
                    <TextInput label="IFSC" value={draft.taxpayer.ifsc} onChange={(value) => updateTaxpayer({ ifsc: value.toUpperCase() })} helper={identityValidation.ifscFormatValid ? "Valid IFSC format" : "Enter valid IFSC format"} />
                    <TextInput label="Account number" type={showSensitive ? "text" : "password"} value={draft.taxpayer.bankAccount} onChange={(value) => updateTaxpayer({ bankAccount: value })} helper={`Preview: ${maskDigits(draft.taxpayer.bankAccount)}`} />
                    <TextInput label="Confirm account number" type={showSensitive ? "text" : "password"} value={draft.taxpayer.bankAccountConfirm} onChange={(value) => updateTaxpayer({ bankAccountConfirm: value })} helper={identityValidation.bankAccountConfirmed ? "Account numbers match" : "Enter the same account number again"} />
                    <div>
                      <Label htmlFor={accountTypeId}>Account type</Label>
                      <Select value={draft.taxpayer.bankAccountType} onValueChange={(value) => updateTaxpayer({ bankAccountType: value as any })}>
                        <SelectTrigger id={accountTypeId} className="mt-2 h-11 rounded-lg"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="current">Current</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStepId === "income" && (
              <div className="space-y-6">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {INCOME_TOGGLES.map((item) => {
                    const selected = incomeToggleSelected(draft, item.key);
                    return (
                      <ChoiceButton
                        key={item.key}
                        selected={selected}
                        title={item.title}
                        description={item.description}
                        onClick={() => toggleIncomeType(item.key, !selected)}
                      />
                    );
                  })}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <NumberInput label="Salary" value={draft.income.salary} onChange={(value) => updateIncome({ salary: value })} />
                  <NumberInput label="Pension" value={draft.income.pension} onChange={(value) => updateIncome({ pension: value })} />
                  <NumberInput label="Other sources" value={draft.income.otherSources} onChange={(value) => updateIncome({ otherSources: value })} />
                  <NumberInput label="House properties" value={draft.income.houseProperties} onChange={(value) => updateIncome({ houseProperties: Math.max(0, Math.round(value)) })} />
                  <NumberInput label="House property income" value={draft.income.housePropertyIncome} onChange={(value) => updateIncome({ housePropertyIncome: value })} />
                  <NumberInput label="Section 112A LTCG" value={draft.income.section112aLtcg} onChange={(value) => updateIncome({ section112aLtcg: value })} />
                  <NumberInput label="Short-term capital gains" value={draft.income.shortTermCapitalGains} onChange={(value) => updateIncome({ shortTermCapitalGains: value })} />
                  <NumberInput label="Business income" value={draft.income.businessIncome} onChange={(value) => updateIncome({ businessIncome: value })} />
                  <NumberInput label="Professional income" value={draft.income.professionalIncome} onChange={(value) => updateIncome({ professionalIncome: value })} />
                  <NumberInput label="Foreign income" value={draft.income.foreignIncome} onChange={(value) => updateIncome({ foreignIncome: value })} />
                  <NumberInput label="80C" value={draft.deductions.section80C} onChange={(value) => updateDeductions({ section80C: value })} />
                  <NumberInput label="80D" value={draft.deductions.section80D} onChange={(value) => updateDeductions({ section80D: value })} />
                  <NumberInput label="TDS" value={draft.taxPaid.tds} onChange={(value) => updateTaxPaid({ tds: value })} />
                  <NumberInput label="TCS" value={draft.taxPaid.tcs} onChange={(value) => updateTaxPaid({ tcs: value })} />
                  <NumberInput label="Advance tax" value={draft.taxPaid.advanceTax} onChange={(value) => updateTaxPaid({ advanceTax: value })} />
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <ToggleRow
                    title="Old regime requested"
                    description="Stores the preference for computation and CA review."
                    checked={draft.filing.wantsOldRegime}
                    onCheckedChange={(checked) => updateFiling({ wantsOldRegime: checked })}
                  />
                  {RISK_FLAGS.map((flag) => (
                    <ToggleRow
                      key={flag.key}
                      title={flag.label}
                      description={flag.helper}
                      checked={Boolean(draft.flags[flag.key])}
                      onCheckedChange={(checked) => updateFlag(flag.key, checked)}
                    />
                  ))}
                </div>
              </div>
            )}

            {currentStepId === "documents" && (
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    { label: "Form 16 parser", href: "/form16-parser" },
                    { label: "AIS viewer", href: "/ais-viewer" },
                    { label: "Capital gains import", href: "/capital-gains-import" },
                    { label: "Document vault", href: "/documents" },
                  ].map((helper) => (
                    <Link key={helper.href} href={helper.href}>
                      <Button variant="outline" className="h-11 w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                        {helper.label}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ))}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {documentChecklist.map((document) => {
                    const linkedDocument = linkedVaultDocument(document.id);
                    const complete = Boolean(draft.documents[document.id]);

                    return (
                      <div key={document.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <FileText className="h-5 w-5 text-blue-700" />
                            <p className="mt-2 text-sm font-black text-slate-950">{document.title}</p>
                            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{document.reason}</p>
                          </div>
                          <StatusBadge
                            status={complete ? "filed" : document.required ? "action_required" : "not_started"}
                            label={complete ? "Linked" : document.required ? "Required" : "Optional"}
                          />
                        </div>
                        <Select
                          value={linkedDocument?.id ?? "manual"}
                          onValueChange={(value) => {
                            if (value !== "manual") {
                              linkDocumentMutation.mutate({ checklistItemId: document.id, documentId: value });
                            }
                          }}
                          disabled={!vaultDocuments.length || linkDocumentMutation.isPending}
                        >
                          <SelectTrigger className="mt-4 h-11 rounded-lg bg-white">
                            <SelectValue placeholder="Select from document vault" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual reference</SelectItem>
                            {vaultDocuments.map((vaultDocument) => (
                              <SelectItem key={vaultDocument.id} value={vaultDocument.id}>
                                {vaultDocument.name || vaultDocument.originalName || vaultDocument.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="mt-3 h-11 rounded-lg bg-white"
                          placeholder="Document name or vault reference"
                          value={linkedDocument ? linkedDocument.name : draft.documents[document.id] ?? ""}
                          readOnly={Boolean(linkedDocument)}
                          onChange={(event) => updateDocument(document.id, event.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStepId === "verify" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <ShieldCheck className="h-6 w-6 text-blue-700" />
                  <h3 className="mt-3 text-lg font-black text-slate-950">Rule checks</h3>
                  <div className="mt-4 grid gap-3">
                    <CheckLine label="PAN format valid" checked={identityValidation.panFormatValid} />
                    <CheckLine label="Aadhaar format valid" checked={identityValidation.aadhaarFormatValid} />
                    <CheckLine label="Refund bank confirmed" checked={identityValidation.bankAccountConfirmed} />
                    <CheckLine label="IFSC format valid" checked={identityValidation.ifscFormatValid} />
                    <CheckLine label="Computation details available" checked={taxLiability.status === "computed"} />
                  </div>
                </div>
                <IssueList issues={verificationReport.issues} />
              </div>
            )}

            {currentStepId === "compute" && (
              <div className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  <RegimePanel title="New regime" selected={taxLiability.activeRegime === "new"} computation={taxLiability.newRegime} />
                  <RegimePanel title="Old regime" selected={taxLiability.activeRegime === "old"} computation={taxLiability.oldRegime} />
                </div>
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
                  <IndianRupee className="h-6 w-6 text-blue-700" />
                  <h3 className="mt-3 text-lg font-black text-blue-950">Tax liability</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <Metric label="Gross tax liability" value={formatInr(taxLiability.grossTaxLiability)} />
                    <Metric label="Tax paid" value={formatInr(taxLiability.totalTaxPaid)} />
                    <Metric label="Payable" value={formatInr(taxLiability.taxPayable)} />
                    <Metric label="Refund" value={formatInr(taxLiability.refundDue)} />
                  </div>
                  {taxLiability.unsupportedReasons.length ? (
                    <p className="mt-4 text-sm font-semibold leading-6 text-amber-800">
                      {taxLiability.unsupportedReasons.join(" ")}
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            {currentStepId === "review" && (
              <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <ClipboardCheck className="h-6 w-6 text-emerald-700" />
                  <h3 className="mt-3 text-lg font-black text-slate-950">Review packet</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    The packet includes owner context, identity checks, selected income types, required documents, rule issues, form recommendation, and computation details for CA review.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <StatusBadge status="in_progress" label={`${reviewPacket.documentChecklist.length} document checks`} />
                    <StatusBadge status={taxLiability.status === "computed" ? "filed" : "ca_review"} label={taxLiability.status === "computed" ? "Computation ready" : "Computation gated"} />
                    <StatusBadge status={recommendation.caReviewRequired ? "ca_review" : "filed"} label={recommendation.caReviewRequired ? "CA review needed" : "Simple path"} />
                    <StatusBadge status={reviewSubmitted ? "filed" : "not_started"} label={reviewSubmitted ? "Submitted" : "Not submitted"} />
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <UserRound className="h-6 w-6 text-blue-700" />
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.14em] text-slate-500">Packet summary</p>
                  <div className="mt-4 space-y-2">
                    <SummaryLine label="Total income" value={formatInr(calculateItrTotalIncome(draft))} />
                    <SummaryLine label="Deductions" value={formatInr(calculateItrTotalDeductions(draft))} />
                    <SummaryLine label="Tax paid" value={formatInr(calculateItrTotalTaxPaid(draft))} />
                    <SummaryLine label="Recommended form" value={recommendation.form.replace(/_/g, " ")} />
                  </div>
                    <Button
                      type="button"
                      onClick={() => submitReviewMutation.mutate()}
                      disabled={submitReviewMutation.isPending || reviewSubmitted}
                      className="mt-5 w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {submitReviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                      {reviewSubmitted ? "Submitted for CA review" : "Submit for CA review"}
                    </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <FilingSummaryStrip
              recommendation={recommendation.form.replace(/_/g, " ")}
              requiredDocuments={requiredDocumentCount}
              issueCount={openIssueCount}
              liability={taxLiability}
            />
          </div>
        </MyeCard>

        <div className="fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[60] flex items-center justify-between rounded-lg border border-slate-200 bg-white/95 p-3 shadow-[0_16px_50px_-35px_rgba(15,23,42,0.6)] backdrop-blur md:sticky md:bottom-4">
          <Button
            type="button"
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 0}
            className="h-10 w-10 shrink-0 border-slate-200 bg-white px-0 font-black text-slate-700 sm:w-auto sm:px-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Previous</span>
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingSave(Boolean(activeReturnId))}
              disabled={!activeReturnId || pendingSave}
              className="h-10 border-blue-100 bg-blue-50 font-black text-blue-700 hover:bg-blue-100"
            >
              <Save className="h-4 w-4" />
              Save draft
            </Button>
            <Button
              type="button"
              onClick={nextStep}
              disabled={currentStep === ITR_FILING_STEPS.length - 1}
              className="h-10 bg-blue-600 font-black text-white hover:bg-blue-700"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function CheckLine({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      {checked ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <FileText className="h-5 w-5 text-amber-600" />}
    </div>
  );
}

function RegimePanel({
  title,
  selected,
  computation,
}: {
  title: string;
  selected: boolean;
  computation: ReturnType<typeof computeItrTaxLiability>["newRegime"];
}) {
  return (
    <div className={cn("rounded-lg border p-5", selected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white")}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        {selected ? <StatusBadge status="filed" label="Active" /> : null}
      </div>
      <div className="mt-4 grid gap-2">
        <SummaryLine label="Gross income" value={formatInr(computation.grossIncome)} />
        <SummaryLine label="Standard deduction" value={formatInr(computation.standardDeduction)} />
        <SummaryLine label="Eligible deductions" value={formatInr(computation.eligibleDeductions)} />
        <SummaryLine label="Taxable income" value={formatInr(computation.taxableIncome)} />
        <SummaryLine label="Tax before cess" value={formatInr(computation.taxBeforeCess)} />
        <SummaryLine label="Cess" value={formatInr(computation.cess)} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className="text-sm font-black text-slate-950">{value}</span>
    </div>
  );
}
