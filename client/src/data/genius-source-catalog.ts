import sourceSummary from "./genius-source-catalog-summary.json";

export type GeniusLawReviewStatus =
  | "blocked-superseded"
  | "pending-current-law-confirmation"
  | "pending-state-law-review"
  | "pending-professional-review"
  | "verified-current";

export interface GeniusSourcePolicy {
  lawReviewStatus: GeniusLawReviewStatus;
  reviewReason: string;
  officialSources: Array<{ label: string; url: string }>;
}

const INDIA_CODE_SOURCE = { label: "India Code", url: "https://www.indiacode.nic.in/" };
const GENERIC_LEGAL_POLICY: GeniusSourcePolicy = {
  lawReviewStatus: "pending-state-law-review",
  reviewReason: "Confirm the current central law plus applicable state stamp, registration, execution, and court requirements before publication.",
  officialSources: [INDIA_CODE_SOURCE],
};

export const GENIUS_SOURCE_POLICIES: Record<string, GeniusSourcePolicy> = {
  "COMPANY LAW": {
    lawReviewStatus: "blocked-superseded",
    reviewReason: "The source list identifies Companies Act, 1956 forms. Map each item to its Companies Act, 2013 or MCA V3 equivalent before implementation.",
    officialSources: [
      { label: "MCA 1956-to-2013 e-form mapping", url: "https://www.mca.gov.in/Ministry/pdf/eformsMapping.pdf" },
      { label: "MCA V3 forms FAQ", url: "https://www.mca.gov.in/Ministry/pdf/3-Forms-FAQs-19Jul2024.pdf" },
    ],
  },
  SERVICETAX: {
    lawReviewStatus: "blocked-superseded",
    reviewReason: "Service tax was subsumed into GST from 1 July 2017. Keep legacy forms as historical references unless an official current workflow still requires one.",
    officialSources: [
      { label: "CBIC GST migration guidance", url: "https://cbic-gst.gov.in/migration.html" },
      { label: "CBIC legacy ACES utilities", url: "https://cbic-gst.gov.in/aces/aces.html" },
    ],
  },
  WEALTHTAX: {
    lawReviewStatus: "blocked-superseded",
    reviewReason: "No wealth tax is levied from AY 2016-17 onwards. Legacy forms must not be presented as current filing forms.",
    officialSources: [
      { label: "Income Tax Department Form BB FAQ", url: "https://www.incometax.gov.in/iec/foportal/help/upload-form-bb-faq" },
    ],
  },
  "CENTRAL EXCISE": {
    lawReviewStatus: "pending-current-law-confirmation",
    reviewReason: "Confirm whether the taxpayer and goods remain within the current central-excise regime and use the latest official utility or schema.",
    officialSources: [{ label: "CBIC ACES utilities", url: "https://cbic-gst.gov.in/aces/aces.html" }],
  },
  INCOMETAX: {
    lawReviewStatus: "pending-current-law-confirmation",
    reviewReason: "Confirm the applicable tax year, current form version, schema, notification, and the Income-tax Act in force before publication.",
    officialSources: [
      { label: "Income Tax Department forms", url: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-forms" },
      { label: "Income-tax Act, 2025 transition FAQ", url: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/objective-and-scope-new-act-faq" },
    ],
  },
  FEMA: {
    lawReviewStatus: "pending-current-law-confirmation",
    reviewReason: "Confirm the latest RBI master direction, return, portal workflow, reporting entity, and effective date before publication.",
    officialSources: [{ label: "Reserve Bank of India", url: "https://www.rbi.org.in/" }],
  },
  "TAX AND AUDIT REPORTS": {
    lawReviewStatus: "pending-professional-review",
    reviewReason: "Confirm the current tax-audit form/version and applicable ICAI reporting standards before exposing a report template.",
    officialSources: [
      { label: "Income Tax Department", url: "https://www.incometax.gov.in/" },
      { label: "ICAI", url: "https://www.icai.org/" },
    ],
  },
  "COMPANY AND AUDIT HTML": {
    lawReviewStatus: "pending-professional-review",
    reviewReason: "Confirm the current Companies Act, MCA filing workflow, and applicable audit standards before publication.",
    officialSources: [
      { label: "Ministry of Corporate Affairs", url: "https://www.mca.gov.in/" },
      { label: "ICAI", url: "https://www.icai.org/" },
    ],
  },
};

export interface ImportedSourceEntry {
  id: string;
  title: string;
  sourceCategory: string;
  sourceFormat: "encrypted" | "rtf" | "html";
  sourceOriginalFormat: "doc" | "rtf" | "html";
  sourceReadable: boolean;
  policyKey: string;
}

export interface GeniusSourceForm extends ImportedSourceEntry {
  sourceApproval: "approved-for-migration";
  publicationStatus: "review_required";
  lawReviewStatus: GeniusLawReviewStatus;
  reviewReason: string;
  officialSources: GeniusSourcePolicy["officialSources"];
}

export function enrichGeniusSourceCatalog(entries: readonly ImportedSourceEntry[]): GeniusSourceForm[] {
  return entries.map((entry) => {
    const policy = GENIUS_SOURCE_POLICIES[entry.policyKey] || GENERIC_LEGAL_POLICY;
    return {
      ...entry,
      sourceApproval: "approved-for-migration",
      publicationStatus: "review_required",
      lawReviewStatus: policy.lawReviewStatus,
      reviewReason: entry.sourceReadable
        ? policy.reviewReason
        : `The proprietary source body is encrypted and must be recovered from an authorised readable export. ${policy.reviewReason}`,
      officialSources: policy.officialSources,
    };
  });
}

export const GENIUS_SOURCE_INVENTORY = Object.freeze({
  total: sourceSummary.total,
  encrypted: sourceSummary.encrypted,
  rtf: sourceSummary.rtf,
  html: sourceSummary.html,
});

const PUBLIC_CATALOG_URL = "/api/public/forms/source-catalog";
let sourceCatalogPromise: Promise<GeniusSourceForm[]> | null = null;

export function parseImportedSourceCatalog(value: unknown): ImportedSourceEntry[] {
  if (!Array.isArray(value)) {
    throw new Error("The source review catalogue is incomplete.");
  }

  const valid = value.every((candidate) => {
    if (!candidate || typeof candidate !== "object") return false;
    const entry = candidate as Record<string, unknown>;
    return (
      typeof entry.id === "string" &&
      typeof entry.title === "string" &&
      typeof entry.sourceCategory === "string" &&
      typeof entry.policyKey === "string" &&
      typeof entry.sourceReadable === "boolean" &&
      ["encrypted", "rtf", "html"].includes(String(entry.sourceFormat)) &&
      ["doc", "rtf", "html"].includes(String(entry.sourceOriginalFormat))
    );
  });

  if (!valid) throw new Error("The source review catalogue contains an invalid record.");
  return value as ImportedSourceEntry[];
}

async function fetchPublicSourceCatalog(): Promise<GeniusSourceForm[]> {
  const response = await fetch(PUBLIC_CATALOG_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("The source review catalogue could not be loaded.");

  const payload = await response.json() as unknown;
  if (!payload || typeof payload !== "object") {
    throw new Error("The source review catalogue response is invalid.");
  }

  const record = payload as Record<string, unknown>;
  if (record.success !== true) throw new Error("The source review catalogue response was unsuccessful.");
  return enrichGeniusSourceCatalog(parseImportedSourceCatalog(record.forms));
}

export function loadGeniusSourceCatalog(): Promise<GeniusSourceForm[]> {
  if (!sourceCatalogPromise) {
    sourceCatalogPromise = fetchPublicSourceCatalog().catch((error) => {
      sourceCatalogPromise = null;
      throw error;
    });
  }
  return sourceCatalogPromise;
}
