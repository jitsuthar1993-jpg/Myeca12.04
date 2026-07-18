import {
  GENERATOR_CATALOGUE,
  type GeneratorCatalogueEntry,
  type GeneratorComplianceClass,
} from "./generator-catalog";

export type FormPublicationStatus = "published" | "review_required";
export type FormLegalStatus = "draft-template" | "statutory-review" | "not-statutory";

export interface FormCatalogueEntry {
  id: string;
  title: string;
  description: string;
  category: "legal" | "business" | "tax" | "personal";
  generatorId: string;
  publicationStatus: FormPublicationStatus;
  legalStatus: FormLegalStatus;
  verificationNote: string;
  tags: string[];
}

const legalStatusByComplianceClass: Record<GeneratorComplianceClass, FormLegalStatus> = {
  "statutory-gst": "statutory-review",
  "statutory-income-tax": "statutory-review",
  "commercial-non-tax": "draft-template",
  "legal-draft": "draft-template",
  "internal-record": "not-statutory",
  "uncertified-financial-statement": "not-statutory",
  "general-document": "not-statutory",
};

const verificationNoteByComplianceClass: Record<GeneratorComplianceClass, string> = {
  "statutory-gst": "Statutory-sensitive draft; confirm current GST rules, portal requirements, tax period, and document facts before issue.",
  "statutory-income-tax": "Statutory declaration draft; confirm the current notified form, tax year, eligibility, and official instructions before use.",
  "commercial-non-tax": "Commercial draft; not a tax invoice, authority filing, or proof of statutory compliance.",
  "legal-draft": "Legal draft; state stamp, registration, witness, notarisation, and professional-review requirements may apply.",
  "internal-record": "Internal record draft; source records and approval by the responsible issuer remain required.",
  "uncertified-financial-statement": "Self-prepared and unaudited; not a CA-certified statement or substitute for professional assurance.",
  "general-document": "General draft; confirm the receiving authority's current format, signature, seal, and enclosure requirements.",
};

function formCategory(entry: GeneratorCatalogueEntry): FormCatalogueEntry["category"] {
  if (entry.category === "tax") return "tax";
  if (entry.category === "corporate") return "business";
  if (entry.category === "career") return "personal";
  return "legal";
}

/** Every implemented generator is listed, with statutory-sensitive outputs clearly marked for review. */
export const FORM_CATALOGUE: FormCatalogueEntry[] = GENERATOR_CATALOGUE.map((entry) => ({
  id: entry.id,
  title: entry.title,
  description: entry.description,
  category: formCategory(entry),
  generatorId: entry.id,
  publicationStatus: entry.status === "active" ? "published" : "review_required",
  legalStatus: legalStatusByComplianceClass[entry.complianceClass],
  verificationNote: entry.complianceClass === "statutory-income-tax"
    ? `${entry.validity}. ${verificationNoteByComplianceClass[entry.complianceClass]}`
    : verificationNoteByComplianceClass[entry.complianceClass],
  tags: Array.from(new Set([
    entry.category,
    entry.validity,
    ...entry.features,
    ...(entry.seo?.keywords ?? []),
  ])),
}));

export const PUBLIC_FORM_CATALOGUE = FORM_CATALOGUE.filter((entry) => entry.publicationStatus === "published");