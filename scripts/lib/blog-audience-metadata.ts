export type BlogAudienceMetadata = {
  slug?: string;
  categoryId?: string;
  primaryKeyword?: string;
};

export const BLOG_AUDIENCE_OVERRIDES: Record<string, string> = {
  "annual-roc-compliance-calendar-companies-llps":
    "Company and LLP founders, finance teams, and compliance owners planning annual ROC filings and record retention.",
  "ay-2026-27-return-under-1961-act-vs-tax-year-2026-27-under-2025-act":
    "Taxpayers comparing an AY 2026-27 return under the 1961 Act with the Tax Year 2026-27 framework under the 2025 Act.",
  "business-audit-assurance-readiness-checklist":
    "Founders, finance teams, and accountants preparing reconciled books and records for a business audit.",
  "company-registration-private-limited-llp-opc-checklist":
    "Founders choosing between a private limited company, LLP, or OPC and preparing incorporation records.",
  "complete-ay-2026-27-itr-filing-guide":
    "Individuals gathering income, tax-credit, and deduction records for an AY 2026-27 return.",
  "digital-signature-certificate-din-business-filings":
    "Directors and compliance teams arranging DSC and DIN records for MCA filings.",
  "esi-epfo-registration-employer-payroll-readiness-guide":
    "Employers and payroll teams checking ESI and EPFO registration and recurring payroll records.",
  "foreign-remittance-form-15ca-15cb-document-readiness":
    "Businesses and professionals preparing Form 15CA or 15CB records for an overseas remittance.",
  "form-10e-to-form-39-salary-arrears-relief-transition":
    "Employees reporting salary arrears and checking the applicable relief form for AY 2026-27.",
  "fssai-registration-state-central-license-food-businesses":
    "Food-business owners checking the FSSAI registration or licence route for their activity and premises.",
  "fssai-renewal-modification-annual-return-checklist":
    "Food-business owners planning an FSSAI renewal, modification, or annual-return check.",
  "funding-documentation-data-room-investor-readiness-guide":
    "Founders preparing a lender or investor data room with legal, financial, tax, and business records.",
  "government-schemes-msme-startup-eligibility-document-checklist":
    "MSME founders comparing government schemes and preparing a scheme-specific eligibility and document file.",
  "gst-registration-compliance-roadmap":
    "Founders and finance teams setting up GST registration, reconciliation, filing, and record-retention routines.",
  "gst-registration-query-reply-certificate-first-compliance":
    "Businesses applying for GST registration or responding to an officer query before certificate issuance.",
  "gst-turnover-vs-income-tax-turnover-ay-2026-27":
    "Business owners and accountants reconciling GST turnover with books and income-tax reporting.",
  "gstr-1-gstr-3b-filing-rhythm-small-businesses":
    "GST-registered small businesses and finance teams reconciling outward supplies, ITC, challans, and periodic returns.",
  "iso-certification-readiness-guide-small-businesses":
    "Small-business owners and process teams preparing scope, records, and ownership for an ISO certification review.",
  "itr-1-online-filing-enabled-ay-2026-27":
    "Salaried taxpayers checking whether their AY 2026-27 income and exclusions fit ITR-1.",
  "itr-filing-mistakes-to-avoid":
    "Individuals reviewing income, tax credits, bank details, and verification steps before filing an ITR.",
  "itr-form-changes-ay-2026-27":
    "Taxpayers checking whether AY 2026-27 form changes affect their return selection and disclosures.",
  "itr-form-selection-master-guide-ay-2026-27":
    "Individuals choosing an AY 2026-27 ITR form from their complete income and disclosure profile.",
  "labour-law-epfo-esic-compliance-starter-checklist":
    "Employers and payroll teams checking labour-law, EPFO, and ESIC obligations as hiring and wages change.",
  "msme-udyam-registration-subsidy-readiness-guide":
    "MSME owners using Udyam registration details to assess a specific subsidy or support application.",
  "pan-card-application-correction-business-pan-readiness":
    "Founders and finance teams applying for or correcting a PAN used across tax, banking, and business records.",
  "partnership-deed-founder-agreement-legal-document-checklist":
    "Partners and co-founders documenting ownership, contributions, decisions, intellectual property, and exit terms.",
  "professional-tax-registration-return-state-compliance-checklist":
    "Employers and professionals checking state-specific professional-tax registration, deductions, payments, and returns.",
  "representative-filing-deceased-taxpayer-itr-ay-2026-27":
    "Legal heirs and representatives preparing an AY 2026-27 return for a deceased taxpayer.",
  "self-assessment-tax-challan-2025-act-payment-guide":
    "Taxpayers preparing a self-assessment-tax payment and checking the year, tax type, amount, and challan details.",
  "startup-india-dpiit-recognition-benefits-documents-checklist":
    "Startup founders preparing DPIIT recognition records and checking the separate benefit routes.",
  "startup-india-seed-fund-scheme-application-readiness-guide":
    "Startup founders preparing a milestone-based funding file for an incubator or seed-fund application.",
  "startup-tax-benefits-80iac-angel-tax-incentive-readiness":
    "Startup founders reviewing DPIIT recognition, section 80-IAC eligibility, investment, and valuation records before taking a tax position.",
  "tan-registration-tds-deductor-readiness-checklist":
    "Businesses becoming TDS or TCS deductors and setting up TAN, payment, and quarterly return records.",
  "tds-return-filing-checklist-employers-vendors":
    "Employers and finance teams reconciling deductee PANs, section mapping, challans, and quarterly TDS returns.",
  "trade-license-registration-shops-restaurants-local-businesses":
    "Shop, restaurant, and local-business owners checking the authority, premises, and renewal requirements for a trade licence.",
  "trademark-registration-india-search-class-filing-objection":
    "Founders and brand owners preparing a trademark search, class choice, filing, and objection-response record.",
  "two-house-properties-itr-1-itr-4-ay-2026-27":
    "Individuals with two house properties checking whether their AY 2026-27 facts fit ITR-1 or ITR-4.",
  "two-self-occupied-house-property-finance-act-2025-guide":
    "Homeowners reviewing the tax and form-selection treatment of two self-occupied properties after the Finance Act 2025 change.",
  "when-will-itr-filing-start-ay-2026-27":
    "Individuals waiting to file an AY 2026-27 return and checking whether utilities, TDS data, and source records are ready.",
};

const categoryAudiencePrefix: Record<string, string> = {
  "business-compliance": "Founders and finance teams handling",
  "business-freelancers": "Freelancers and owner-managed businesses preparing",
  "capital-gains": "Investors and traders reviewing",
  "foreign-assets-nri-tax": "Residents, NRIs, and RNOR taxpayers reviewing",
  "government-schemes": "Applicants preparing for",
  "income-tax": "Individual taxpayers reviewing",
  "itr-filing": "Taxpayers preparing",
  "refunds-notices": "Taxpayers reviewing",
  "tax-planning": "Taxpayers comparing",
};

const legacyGeneratedTaskEndings = [
  "complete the relevant registration, filing, or recurring compliance work",
  "reconcile business income, expenses, tax credits, and the correct return",
  "calculate gains, classify transactions, and prepare the correct tax disclosure",
  "settle residence, disclosure, remittance, and foreign-tax-credit questions",
  "confirm eligibility, prepare accepted records, and preserve the application trail",
  "prepare a supportable AY 2026-27 return position",
  "choose the form, reconcile source records, and finish the filing process",
  "explain the records, choose the response route, and retain proof",
  "compare the available treatment and preserve evidence for the chosen position",
];

function normalizeClause(value: string) {
  return value
    .replace(/[.?!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sentenceCase(value: string) {
  const normalized = normalizeClause(value);
  return normalized ? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}` : "Applicants";
}

function buildGeneratedKeywordAudience(meta: BlogAudienceMetadata) {
  const primaryKeyword = normalizeClause(meta.primaryKeyword || "the article topic");
  const prefix = categoryAudiencePrefix[meta.categoryId || ""] ?? "Indian taxpayers and business owners reviewing";
  return `${prefix} ${primaryKeyword}.`;
}

export function buildCategoryTargetAudience(meta: BlogAudienceMetadata) {
  return BLOG_AUDIENCE_OVERRIDES[meta.slug || ""] ?? buildGeneratedKeywordAudience(meta);
}

export function isGeneratedKeywordAudience(meta: BlogAudienceMetadata, value: string) {
  return normalizeClause(value).toLowerCase() === normalizeClause(buildGeneratedKeywordAudience(meta)).toLowerCase();
}

export function hasMalformedTargetAudience(value: string) {
  return /\bwho need to\s+[A-Z]/.test(value);
}

export function indefiniteArticleFor(label: string): "a" | "an" {
  const firstToken = normalizeClause(label).match(/[A-Za-z][A-Za-z0-9-]*/)?.[0] ?? "";
  const lowerToken = firstToken.toLowerCase();

  if (/^(?:heir|honest|honou?r|hour)/.test(lowerToken)) return "an";
  if (/^(?:one|once|euro|ewe|uni(?:form|que|t|vers)|use|user|usual)/.test(lowerToken)) return "a";
  if (lowerToken === "mudra") return "a";
  if (["udyam", "umang"].includes(lowerToken)) return "an";

  const letters = firstToken.replace(/[^A-Za-z]/g, "");
  if (letters.length > 1 && letters === letters.toUpperCase()) {
    return /^[AEFHILMNORSX]/.test(letters) ? "an" : "a";
  }

  return /^[aeiou]/i.test(firstToken) ? "an" : "a";
}

export function buildSchemeTargetAudience(audience: string, scheme: string, documents: string[]) {
  const normalizedScheme = normalizeClause(scheme);
  const records = documents.slice(0, 3).map(normalizeClause).filter(Boolean).join(", ");
  return `${sentenceCase(audience)} preparing ${indefiniteArticleFor(normalizedScheme)} ${normalizedScheme} application and verifying ${records} before submission or follow-up.`;
}

export function repairAudienceArticle(value: string) {
  return value.replace(
    /\bpreparing\s+(a|an)\s+(.+?)\s+application\b/gi,
    (match, currentArticle: string, scheme: string) => {
      const expectedArticle = indefiniteArticleFor(scheme);
      if (currentArticle.toLowerCase() === expectedArticle) return match;
      return match.replace(/\b(?:a|an)\b/i, expectedArticle);
    },
  );
}

function hasGeneratedCategoryTemplate(value: string) {
  return value.includes(" working on ") && legacyGeneratedTaskEndings.some(
    (ending) => value.endsWith(` and preparing to ${ending}.`),
  );
}

export function repairTargetAudience(meta: BlogAudienceMetadata, value: string) {
  const repairedArticle = repairAudienceArticle(value.trim());
  if (
    hasMalformedTargetAudience(repairedArticle)
    || hasGeneratedCategoryTemplate(repairedArticle)
    || isGeneratedKeywordAudience(meta, repairedArticle)
  ) {
    return buildCategoryTargetAudience(meta);
  }
  return repairedArticle;
}
