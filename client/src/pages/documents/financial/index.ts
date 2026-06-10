export const FINANCIAL_DOCUMENT_KINDS = [
  "gst-quotation",
  "proforma-invoice",
  "purchase-order",
  "delivery-challan",
  "payment-receipt",
  "gst-credit-debit-note",
  "loan-agreement",
  "expense-reimbursement",
  "msme-cash-flow",
  "projected-balance-sheet",
  "net-worth-statement",
] as const;

export type FinancialDocumentKind = (typeof FINANCIAL_DOCUMENT_KINDS)[number] | "invoice";
export type TaxTreatment = "taxable" | "exempt" | "nil-rated" | "non-gst" | "reverse-charge";
export type DiscountType = "percentage" | "amount";

export interface IndianAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
}

export interface FinancialParty {
  name: string;
  address?: string;
  stateCode?: string;
  pincode?: string;
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
}

export interface FinancialLineItem {
  description: string;
  hsnSac?: string;
  quantity: number;
  unit?: string;
  rate: number;
  discountType?: DiscountType;
  discountValue?: number;
  taxTreatment: TaxTreatment;
  gstRate: number;
  cessRate?: number;
}

export interface FinancialDocumentDraft {
  version: 1;
  id: string;
  kind: FinancialDocumentKind;
  sourceDocumentId: string | null;
  parties: {
    supplier?: FinancialParty;
    customer?: FinancialParty;
    buyer?: FinancialParty;
    vendor?: FinancialParty;
    lender?: FinancialParty;
    borrower?: FinancialParty;
  };
  items: FinancialLineItem[];
  taxTreatment: {
    placeOfSupplyStateCode?: string;
    roundOff?: boolean;
  };
  terms?: string;
  content: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface IndianDocumentTotalsInput {
  supplierStateCode?: string;
  placeOfSupplyStateCode?: string;
  roundOff?: boolean;
  freight?: number;
  items: FinancialLineItem[];
}

export interface LineItemTotal {
  gross: number;
  discount: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  total: number;
}

export interface IndianDocumentTotals extends LineItemTotal {
  subtotal: number;
  discountTotal: number;
  exemptValue: number;
  freight: number;
  roundOff: number;
  grandTotal: number;
  lines: LineItemTotal[];
}

export const COMMON_GST_RATES = [0, 0.1, 0.25, 1.5, 3, 5, 6, 7.5, 12, 18, 28] as const;

export const INDIAN_STATES = [
  ["01", "Jammu and Kashmir"],
  ["02", "Himachal Pradesh"],
  ["03", "Punjab"],
  ["04", "Chandigarh"],
  ["05", "Uttarakhand"],
  ["06", "Haryana"],
  ["07", "Delhi"],
  ["08", "Rajasthan"],
  ["09", "Uttar Pradesh"],
  ["10", "Bihar"],
  ["11", "Sikkim"],
  ["12", "Arunachal Pradesh"],
  ["13", "Nagaland"],
  ["14", "Manipur"],
  ["15", "Mizoram"],
  ["16", "Tripura"],
  ["17", "Meghalaya"],
  ["18", "Assam"],
  ["19", "West Bengal"],
  ["20", "Jharkhand"],
  ["21", "Odisha"],
  ["22", "Chhattisgarh"],
  ["23", "Madhya Pradesh"],
  ["24", "Gujarat"],
  ["26", "Dadra and Nagar Haveli and Daman and Diu"],
  ["27", "Maharashtra"],
  ["29", "Karnataka"],
  ["30", "Goa"],
  ["31", "Lakshadweep"],
  ["32", "Kerala"],
  ["33", "Tamil Nadu"],
  ["34", "Puducherry"],
  ["35", "Andaman and Nicobar Islands"],
  ["36", "Telangana"],
  ["37", "Andhra Pradesh"],
  ["38", "Ladakh"],
  ["97", "Other Territory"],
] as const;

export function finiteNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function escapeFinancialHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatIndianCurrency(value: unknown) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(finiteNumber(value));
}

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
] as const;
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"] as const;

function belowThousand(value: number): string {
  if (value <= 0) return "";
  if (value < 20) return ONES[value];
  if (value < 100) return [TENS[Math.floor(value / 10)], ONES[value % 10]].filter(Boolean).join(" ");
  return [
    ONES[Math.floor(value / 100)],
    "Hundred",
    belowThousand(value % 100),
  ].filter(Boolean).join(" ");
}

function indianIntegerInWords(value: number): string {
  const normalized = Math.floor(Math.abs(value));
  if (normalized === 0) return "Zero";

  const groups = [
    [10_000_000, "Crore"],
    [100_000, "Lakh"],
    [1_000, "Thousand"],
  ] as const;
  let remaining = normalized;
  const words: string[] = [];

  for (const [divisor, label] of groups) {
    const groupValue = Math.floor(remaining / divisor);
    if (groupValue > 0) {
      words.push(indianIntegerInWords(groupValue), label);
      remaining %= divisor;
    }
  }

  if (remaining > 0) words.push(belowThousand(remaining));
  return words.join(" ");
}

export function indianAmountInWords(value: unknown) {
  const amount = Math.max(0, roundCurrency(finiteNumber(value)));
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  return `Rupees ${indianIntegerInWords(rupees)}${paise ? ` and ${indianIntegerInWords(paise)} Paise` : ""} Only`;
}

export function calculateIndianDocumentTotals(input: IndianDocumentTotalsInput): IndianDocumentTotals {
  const interstate = Boolean(
    input.supplierStateCode &&
      input.placeOfSupplyStateCode &&
      input.supplierStateCode !== input.placeOfSupplyStateCode,
  );
  let subtotal = 0;
  let discountTotal = 0;
  let taxableValue = 0;
  let exemptValue = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let cess = 0;

  const lines = input.items.map((item) => {
    const gross = roundCurrency(finiteNumber(item.quantity) * finiteNumber(item.rate));
    const requestedDiscount =
      item.discountType === "percentage"
        ? (gross * finiteNumber(item.discountValue)) / 100
        : finiteNumber(item.discountValue);
    const discount = roundCurrency(Math.min(gross, Math.max(0, requestedDiscount)));
    const net = roundCurrency(gross - discount);
    const isTaxable = item.taxTreatment === "taxable" || item.taxTreatment === "reverse-charge";
    const lineTaxableValue = isTaxable ? net : 0;
    const lineExemptValue = isTaxable ? 0 : net;
    const gst = roundCurrency((lineTaxableValue * finiteNumber(item.gstRate)) / 100);
    const lineCess = roundCurrency((lineTaxableValue * finiteNumber(item.cessRate)) / 100);
    const lineIgst = interstate ? gst : 0;
    const lineCgst = interstate ? 0 : roundCurrency(gst / 2);
    const lineSgst = interstate ? 0 : roundCurrency(gst - lineCgst);

    subtotal += gross;
    discountTotal += discount;
    taxableValue += lineTaxableValue;
    exemptValue += lineExemptValue;
    cgst += lineCgst;
    sgst += lineSgst;
    igst += lineIgst;
    cess += lineCess;

    return {
      gross,
      discount,
      taxableValue: lineTaxableValue,
      cgst: lineCgst,
      sgst: lineSgst,
      igst: lineIgst,
      cess: lineCess,
      total: roundCurrency(net + gst + lineCess),
    };
  });

  const freight = roundCurrency(finiteNumber(input.freight));
  const beforeRounding = roundCurrency(
    taxableValue + exemptValue + cgst + sgst + igst + cess + freight,
  );
  const grandTotal = input.roundOff ? Math.round(beforeRounding) : beforeRounding;

  return {
    gross: roundCurrency(subtotal),
    discount: roundCurrency(discountTotal),
    subtotal: roundCurrency(subtotal),
    discountTotal: roundCurrency(discountTotal),
    taxableValue: roundCurrency(taxableValue),
    exemptValue: roundCurrency(exemptValue),
    cgst: roundCurrency(cgst),
    sgst: roundCurrency(sgst),
    igst: roundCurrency(igst),
    cess: roundCurrency(cess),
    freight,
    total: grandTotal,
    roundOff: roundCurrency(grandTotal - beforeRounding),
    grandTotal,
    lines,
  };
}

const CONVERSION_TARGETS: Partial<Record<FinancialDocumentKind, readonly FinancialDocumentKind[]>> = {
  "gst-quotation": ["proforma-invoice", "invoice", "purchase-order"],
  "proforma-invoice": ["invoice"],
  "purchase-order": ["delivery-challan"],
  "delivery-challan": ["invoice"],
  invoice: ["payment-receipt", "gst-credit-debit-note"],
  "msme-cash-flow": ["projected-balance-sheet"],
};

export function canConvertFinancialDocument(source: FinancialDocumentKind, target: FinancialDocumentKind) {
  return Boolean(CONVERSION_TARGETS[source]?.includes(target));
}

export function convertFinancialDocument(
  source: FinancialDocumentDraft,
  target: FinancialDocumentKind,
): FinancialDocumentDraft {
  if (!canConvertFinancialDocument(source.kind, target)) {
    throw new Error(`Cannot convert ${source.kind} to ${target}.`);
  }

  const now = new Date().toISOString();
  const targetContent: Record<string, unknown> = {};
  if (source.kind === "msme-cash-flow" && target === "projected-balance-sheet") {
    targetContent.importedFromCashFlow = true;
    targetContent.closingCash = source.content.closingCash;
    targetContent.totalDebt = source.content.totalDebt;
  }

  return {
    version: 1,
    id: crypto.randomUUID(),
    kind: target,
    sourceDocumentId: source.id,
    parties: structuredClone(source.parties),
    items: structuredClone(source.items),
    taxTreatment: structuredClone(source.taxTreatment),
    terms: source.terms,
    content: targetContent,
    createdAt: now,
    updatedAt: now,
  };
}

export function calculateFinancialRatios(input: {
  currentAssets?: number;
  currentLiabilities?: number;
  totalDebt?: number;
  equity?: number;
  assets?: number;
  liabilitiesAndEquity?: number;
  cashAvailableForDebtService?: number;
  debtService?: number;
}) {
  const currentAssets = finiteNumber(input.currentAssets);
  const currentLiabilities = finiteNumber(input.currentLiabilities);
  const totalDebt = finiteNumber(input.totalDebt);
  const equity = finiteNumber(input.equity);
  const assets = finiteNumber(input.assets);
  const liabilitiesAndEquity = finiteNumber(input.liabilitiesAndEquity);
  const cashAvailableForDebtService = finiteNumber(input.cashAvailableForDebtService);
  const debtService = finiteNumber(input.debtService);

  return {
    workingCapital: roundCurrency(currentAssets - currentLiabilities),
    currentRatio: currentLiabilities ? roundCurrency(currentAssets / currentLiabilities) : 0,
    debtEquityRatio: equity ? roundCurrency(totalDebt / equity) : 0,
    balanceDifference: roundCurrency(assets - liabilitiesAndEquity),
    dscr: debtService ? roundCurrency(cashAvailableForDebtService / debtService) : 0,
  };
}

export function formatFinancialDate(value: unknown) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  const date = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? escapeFinancialHtml(normalized)
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
}
