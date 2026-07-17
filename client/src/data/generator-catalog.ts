import generatorRegistry from "./generator-registry.json";
import type {
  DocumentExportFormat,
  DocumentGeneratorSEO,
} from "@/pages/documents/generators/types";
import type { FinancialDocumentKind } from "@/pages/documents/financial";

export type GeneratorComplianceClass =
  | "statutory-gst"
  | "commercial-non-tax"
  | "legal-draft"
  | "internal-record"
  | "uncertified-financial-statement"
  | "general-document";

export interface GeneratorCatalogueEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  status: "active" | "soon";
  validity: string;
  features: string[];
  complianceClass: GeneratorComplianceClass;
  exportFormats: DocumentExportFormat[];
  conversionTargets: FinancialDocumentKind[];
  seo?: Pick<DocumentGeneratorSEO, "keywords" | "limitations">;
}

const financialMetadata: Record<string, Partial<GeneratorCatalogueEntry>> = {
  "gst-quotation": {
    complianceClass: "commercial-non-tax",
    validity: "Commercial Draft",
    features: ["GST estimate", "Validity and terms", "Convert to invoice"],
    conversionTargets: ["proforma-invoice", "invoice", "purchase-order"],
    seo: {
      keywords: ["quotation generator", "GST quotation format", "estimate generator India"],
      limitations: ["Not a tax invoice"],
    },
  },
  "proforma-invoice": {
    complianceClass: "commercial-non-tax",
    validity: "Commercial Draft",
    features: ["Advance instructions", "Expected supply", "Convert to invoice"],
    conversionTargets: ["invoice"],
  },
  "purchase-order": {
    complianceClass: "commercial-non-tax",
    validity: "Commercial Draft",
    features: ["Ship-to details", "Vendor terms", "Convert to challan"],
    conversionTargets: ["delivery-challan"],
  },
  "delivery-challan": {
    complianceClass: "statutory-gst",
    validity: "GST Rule 55 Draft",
    features: ["Three-copy format", "Movement reason", "No e-way bill generation"],
    conversionTargets: ["invoice"],
  },
  "payment-receipt": {
    complianceClass: "statutory-gst",
    validity: "General / GST Receipt Draft",
    features: ["General receipt", "Advance receipt voucher", "Payment reference"],
  },
  "gst-credit-debit-note": {
    complianceClass: "statutory-gst",
    validity: "GST Note Draft",
    features: ["Invoice reference", "Tax adjustment", "Credit / debit modes"],
  },
  "loan-agreement": {
    complianceClass: "legal-draft",
    validity: "State Specific",
    features: ["Repayment schedule", "Security terms", "Witness blocks"],
  },
  "expense-reimbursement": {
    complianceClass: "internal-record",
    validity: "Internal Business Record",
    features: ["Expense lines", "Receipt declaration", "Approvals"],
  },
  "msme-cash-flow": {
    complianceClass: "uncertified-financial-statement",
    validity: "Self-Prepared Draft",
    features: ["Current plus 3 projections", "Cash surplus", "Indicative DSCR"],
    conversionTargets: ["projected-balance-sheet"],
  },
  "projected-balance-sheet": {
    complianceClass: "uncertified-financial-statement",
    validity: "Self-Prepared Draft",
    features: ["Three projections", "Bank ratios", "Balance validation"],
  },
  "net-worth-statement": {
    complianceClass: "uncertified-financial-statement",
    validity: "Not CA Certified",
    features: ["Gross assets", "Liabilities", "Liquid net worth"],
  },
  invoice: {
    complianceClass: "statutory-gst",
    validity: "GST Tax Invoice Draft",
    features: ["Explicit place of supply", "GST breakup", "No IRN generation"],
    conversionTargets: ["payment-receipt", "gst-credit-debit-note"],
  },
};

function inferComplianceClass(category: string): GeneratorComplianceClass {
  if (category === "legal" || category === "real-estate") return "legal-draft";
  return "general-document";
}

export const GENERATOR_CATALOGUE: GeneratorCatalogueEntry[] = generatorRegistry.generators
  .map((entry) => {
    const financial = financialMetadata[entry.id] || {};
    return {
      id: entry.id,
      title: entry.name,
      description: entry.description,
      category: entry.category,
      priority: entry.priority,
      status: entry.status === "available" ? "active" : "soon",
      validity: "All India",
      features: ["Guided fields", "Live preview", "Printable export"],
      complianceClass: inferComplianceClass(entry.category),
      exportFormats: ["pdf", "html"],
      conversionTargets: [],
      ...financial,
    } as GeneratorCatalogueEntry;
  })
  .sort((left, right) => left.priority - right.priority);

export const GENERATOR_CATALOGUE_BY_ID = new Map(
  GENERATOR_CATALOGUE.map((entry) => [entry.id, entry]),
);

export const FINANCIAL_GENERATOR_CATALOGUE = GENERATOR_CATALOGUE.filter((entry) =>
  Object.prototype.hasOwnProperty.call(financialMetadata, entry.id),
);
