import {
  GENERATOR_CATALOGUE,
  GENERATOR_CATALOGUE_BY_ID,
  type GeneratorComplianceClass,
} from "./generator-catalog";

export type DocumentLegalReviewStatus = "draft-only" | "statutory-sensitive" | "issuer-controlled";

export interface DocumentLegalProfile {
  generatorId: string;
  documentClass: GeneratorComplianceClass;
  jurisdiction: string;
  statutorySources: string[];
  versionDate: string;
  requiredFields: string[];
  executionRequirements: string[];
  limitations: string[];
  reviewStatus: DocumentLegalReviewStatus;
  reviewer: string;
}

const PROFILE_VERSION_DATE = "2026-07-18";
const REVIEWER = "MyeCA document review queue";

const CLASS_DEFAULTS: Record<GeneratorComplianceClass, Omit<DocumentLegalProfile, "generatorId" | "documentClass">> = {
  "statutory-gst": {
    jurisdiction: "India; confirm current state, tax-period, and authority rules",
    statutorySources: ["CGST Rules, including Rule 46 where a tax invoice is intended"],
    versionDate: PROFILE_VERSION_DATE,
    requiredFields: ["supplier and recipient identity", "document number and date", "tax treatment and totals"],
    executionRequirements: ["verify against the GST portal and current notified rules before issue"],
    limitations: ["draft output only", "does not file returns, generate an IRN, or create an e-way bill unless separately stated"],
    reviewStatus: "statutory-sensitive",
    reviewer: REVIEWER,
  },
  "statutory-income-tax": {
    jurisdiction: "India; current notified income-tax form, tax year, and eligibility rules apply",
    statutorySources: [
      "Income Tax Department forms and instructions: https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-forms",
      "Income-tax Act transition guidance: https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/objective-and-scope-new-act-faq",
    ],
    versionDate: PROFILE_VERSION_DATE,
    requiredFields: ["declarant identity and PAN", "applicable tax or financial year", "eligibility facts, income, and declaration details"],
    executionRequirements: ["use the currently notified form and instructions", "confirm eligibility and submit to the correct deductor or employer"],
    limitations: ["draft preparation only", "does not submit the declaration or confirm eligibility, acceptance, or non-deduction"],
    reviewStatus: "statutory-sensitive",
    reviewer: REVIEWER,
  },
  "commercial-non-tax": {
    jurisdiction: "India; commercial terms and state requirements may apply",
    statutorySources: [],
    versionDate: PROFILE_VERSION_DATE,
    requiredFields: ["parties", "items or services", "commercial terms and dates"],
    executionRequirements: ["obtain authorised signatory approval and retain supporting records"],
    limitations: ["commercial draft only", "not a tax invoice or proof of statutory filing"],
    reviewStatus: "draft-only",
    reviewer: REVIEWER,
  },
  "legal-draft": {
    jurisdiction: "India; state stamp, registration, tenancy, and execution rules may apply",
    statutorySources: [],
    versionDate: PROFILE_VERSION_DATE,
    requiredFields: ["party identity and capacity", "subject matter", "dates, obligations, and signatures"],
    executionRequirements: ["confirm stamp duty, registration, witnesses, notarisation, and professional review as applicable"],
    limitations: ["legal draft only", "does not guarantee enforceability, registration, or authority acceptance"],
    reviewStatus: "draft-only",
    reviewer: REVIEWER,
  },
  "internal-record": {
    jurisdiction: "India; issuer and organisation policy controlled",
    statutorySources: [],
    versionDate: PROFILE_VERSION_DATE,
    requiredFields: ["issuer identity", "record date and reference", "amounts or approvals where applicable"],
    executionRequirements: ["retain source records and obtain the responsible issuer's approval"],
    limitations: ["internal record draft", "not an authority-issued certificate or tax filing"],
    reviewStatus: "issuer-controlled",
    reviewer: REVIEWER,
  },
  "uncertified-financial-statement": {
    jurisdiction: "India; accounting basis and intended recipient must be confirmed",
    statutorySources: [],
    versionDate: PROFILE_VERSION_DATE,
    requiredFields: ["entity identity", "reporting period and accounting basis", "assumptions and preparer identity"],
    executionRequirements: ["reconcile figures to source records and obtain authorised signatory approval"],
    limitations: ["self-prepared and unaudited", "not CA-certified, lender-approved, or a substitute for professional assurance"],
    reviewStatus: "issuer-controlled",
    reviewer: REVIEWER,
  },
  "general-document": {
    jurisdiction: "India; receiving authority or institution requirements may apply",
    statutorySources: [],
    versionDate: PROFILE_VERSION_DATE,
    requiredFields: ["document purpose", "issuer or applicant identity", "date and contact details"],
    executionRequirements: ["confirm receiving-authority format, signature, seal, and enclosure requirements"],
    limitations: ["general draft only", "does not represent an authority-issued record or guaranteed acceptance"],
    reviewStatus: "issuer-controlled",
    reviewer: REVIEWER,
  },
};

const GENERATOR_LEGAL_OVERRIDES: Record<string, Pick<DocumentLegalProfile, "statutorySources" | "limitations">> = {
  "form-15g": {
    statutorySources: [
      "Income Tax Department transition FAQ: https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-forms?mobile-app=1",
      "Income Tax Department Form 121 manual: https://www.incometax.gov.in/iec/foportal/newformpage/forms/from121-um",
    ],
    limitations: [
      "legacy Form 15G applies only to the old statutory framework through 31 March 2026",
      "use current Form 121 for a tax year beginning on or after 1 April 2026",
    ],
  },
  "form-15h": {
    statutorySources: [
      "Income Tax Department transition FAQ: https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-forms?mobile-app=1",
      "Income Tax Department Form 121 manual: https://www.incometax.gov.in/iec/foportal/newformpage/forms/from121-um",
    ],
    limitations: [
      "legacy Form 15H applies only to the old statutory framework through 31 March 2026",
      "use current Form 121 for a tax year beginning on or after 1 April 2026",
    ],
  },
  "form-12bb": {
    statutorySources: [
      "Income Tax Department AY 2026-27 salaried guidance: https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1",
      "Income Tax Rules 2026 Form 124: https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-03/En-Notified-IT-Rules-2026-20-03-2026.pdf",
    ],
    limitations: [
      "legacy Form 12BB applies to FY 2025-26 under the Income-tax Act 1961 framework",
      "use current Form 124 for Tax Year 2026-27 under the Income-tax Rules 2026",
    ],
  },
};
export const DOCUMENT_LEGAL_PROFILES: Record<string, DocumentLegalProfile> = Object.fromEntries(
  GENERATOR_CATALOGUE.map((entry) => [
    entry.id,
    {
      generatorId: entry.id,
      documentClass: entry.complianceClass,
      ...CLASS_DEFAULTS[entry.complianceClass],
      ...(GENERATOR_LEGAL_OVERRIDES[entry.id] ?? {}),
      statutorySources: Array.from(new Set([
        ...CLASS_DEFAULTS[entry.complianceClass].statutorySources,
        ...(GENERATOR_LEGAL_OVERRIDES[entry.id]?.statutorySources ?? []),
      ])),
      limitations: Array.from(new Set([
        ...CLASS_DEFAULTS[entry.complianceClass].limitations,
        ...(entry.seo?.limitations ?? []),
        ...(GENERATOR_LEGAL_OVERRIDES[entry.id]?.limitations ?? []),
      ])),
    },
  ]),
);

export function getDocumentLegalProfile(generatorId: string): DocumentLegalProfile | null {
  if (!GENERATOR_CATALOGUE_BY_ID.has(generatorId)) return null;
  return DOCUMENT_LEGAL_PROFILES[generatorId] ?? null;
}
