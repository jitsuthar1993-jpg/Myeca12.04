import {
  Banknote,
  ClipboardCheck,
  FileBadge,
  FileCheck2,
  FileInput,
  ReceiptIndianRupee,
  ScrollText,
} from "lucide-react";
import { createTransactionGenerator } from "./transaction-generator-factory";

const commonLimitations = [
  "This tool prepares a draft from user-entered information.",
  "It does not file GST returns, generate an IRN, or generate an e-way bill.",
  "Confirm the applicable GST rate, HSN/SAC classification, and place of supply before use.",
];

const seo = (
  keywords: string[],
  requiredInputs: string[],
  limitations = commonLimitations,
) => ({
  keywords,
  requiredInputs,
  limitations,
  faqs: [
    {
      question: "Does this document complete GST filing or portal reporting?",
      answer: "No. The generator prepares a printable draft only. GST reporting and portal actions remain separate.",
    },
    {
      question: "Can I change the GST rate?",
      answer: "Yes. Common rates are suggested, but users must select the rate applicable to their actual supply.",
    },
  ],
});

export const GstQuotationGenerator = createTransactionGenerator({
  id: "gst-quotation",
  title: "GST Quotation / Estimate",
  description: "Prepare an Indian quotation or estimate with optional GST, discounts, validity, and terms.",
  documentTitle: "Quotation / Estimate",
  icon: FileBadge,
  numberLabel: "Quotation Number",
  numberPrefix: "QUO",
  firstPartyLabel: "Quoted By",
  secondPartyLabel: "Quoted To",
  complianceNotice: "Quotation / Estimate - Not a Tax Invoice.",
  showTaxes: true,
  showBankDetails: true,
  extraFields: [
    { name: "mode", label: "Document Mode", type: "select", options: ["Quotation", "Estimate"], defaultValue: "Quotation", required: true },
    { name: "validUntil", label: "Valid Until", type: "date", required: true },
    { name: "expectedDelivery", label: "Expected Delivery / Completion", type: "text", placeholder: "Example: Within 15 working days" },
  ],
  conversionTargets: [
    { kind: "proforma-invoice", label: "Convert to Proforma Invoice" },
    { kind: "invoice", label: "Convert to GST Tax Invoice" },
    { kind: "purchase-order", label: "Convert to Purchase Order" },
  ],
  seo: seo(
    ["quotation generator", "GST quotation format", "estimate generator India"],
    ["Seller and customer details", "Items or services", "Rates and discounts", "Validity and terms"],
  ),
});

export const ProformaInvoiceGenerator = createTransactionGenerator({
  id: "proforma-invoice",
  title: "Proforma Invoice",
  description: "Prepare a non-tax proforma invoice for approvals, advances, and expected supplies.",
  documentTitle: "Proforma Invoice",
  icon: FileInput,
  numberLabel: "Proforma Number",
  numberPrefix: "PI",
  firstPartyLabel: "Issued By",
  secondPartyLabel: "Issued To",
  complianceNotice: "Proforma Invoice - Not a Tax Invoice and does not create GST liability.",
  showTaxes: true,
  showBankDetails: true,
  extraFields: [
    { name: "validUntil", label: "Valid Until", type: "date", required: true },
    { name: "expectedSupplyDate", label: "Expected Supply Date", type: "date" },
    { name: "advanceInstructions", label: "Advance / Payment Instructions", type: "textarea" },
  ],
  conversionTargets: [{ kind: "invoice", label: "Convert to GST Tax Invoice" }],
  seo: seo(
    ["proforma invoice generator India", "GST proforma invoice format", "proforma invoice online"],
    ["Supplier and customer details", "Expected items", "Advance instructions", "Validity"],
  ),
});

export const PurchaseOrderGenerator = createTransactionGenerator({
  id: "purchase-order",
  title: "Purchase Order",
  description: "Create a buyer-issued purchase order for Indian vendors and supplies.",
  documentTitle: "Purchase Order",
  icon: ClipboardCheck,
  numberLabel: "Purchase Order Number",
  numberPrefix: "PO",
  firstPartyLabel: "Buyer / Bill To",
  secondPartyLabel: "Supplier / Vendor",
  complianceNotice: "Commercial Purchase Order - Not a Tax Invoice.",
  showTaxes: true,
  extraFields: [
    { name: "shipToAddress", label: "Ship-To Address", type: "textarea", required: true },
    { name: "expectedDeliveryDate", label: "Expected Delivery Date", type: "date", required: true },
    { name: "paymentTerms", label: "Payment Terms", type: "textarea" },
    { name: "inspectionTerms", label: "Inspection / Acceptance Terms", type: "textarea" },
    { name: "approvedBy", label: "Approved By", type: "text" },
  ],
  conversionTargets: [{ kind: "delivery-challan", label: "Convert to Delivery Challan" }],
  seo: seo(
    ["purchase order generator India", "PO format India", "free purchase order"],
    ["Buyer and vendor details", "Ship-to address", "Items and expected taxes", "Delivery and payment terms"],
  ),
});

export const DeliveryChallanGenerator = createTransactionGenerator({
  id: "delivery-challan",
  title: "GST Delivery Challan",
  description: "Prepare a delivery challan for goods transported without a tax invoice.",
  documentTitle: "Delivery Challan",
  icon: FileCheck2,
  numberLabel: "Challan Number",
  numberPrefix: "DC",
  firstPartyLabel: "Consignor",
  secondPartyLabel: "Consignee",
  complianceNotice: "GST delivery challan draft. This tool does not generate an e-way bill.",
  showTaxes: true,
  copies: ["ORIGINAL FOR CONSIGNEE", "DUPLICATE FOR TRANSPORTER", "TRIPLICATE FOR CONSIGNOR"],
  extraFields: [
    {
      name: "reason",
      label: "Reason for Transportation Without Invoice",
      type: "select",
      options: ["Job work", "Goods on approval", "Stock transfer", "Transport without supply", "Unknown quantity", "Other"],
      defaultValue: "Job work",
      required: true,
    },
    { name: "vehicleNumber", label: "Vehicle / Transport Reference", type: "text" },
    { name: "otherReason", label: "Other Reason", type: "textarea" },
  ],
  conversionTargets: [{ kind: "invoice", label: "Convert to GST Tax Invoice" }],
  seo: seo(
    ["delivery challan generator", "GST delivery challan format", "delivery challan online India"],
    ["Consignor and consignee", "Reason for movement", "Goods and provisional quantity", "Transport reference"],
  ),
});

export const PaymentReceiptGenerator = createTransactionGenerator({
  id: "payment-receipt",
  title: "Payment Receipt / GST Receipt Voucher",
  description: "Prepare a general payment receipt or GST advance receipt voucher.",
  documentTitle: "Payment Receipt / Receipt Voucher",
  icon: Banknote,
  numberLabel: "Receipt Number",
  numberPrefix: "REC",
  firstPartyLabel: "Received By",
  secondPartyLabel: "Received From",
  complianceNotice: "Select the correct mode: a general receipt is not a tax invoice; a GST advance receipt voucher requires applicable GST particulars.",
  itemsOptional: true,
  showTaxes: true,
  extraFields: [
    { name: "mode", label: "Receipt Mode", type: "select", options: ["General payment receipt", "GST advance receipt voucher"], defaultValue: "General payment receipt", required: true },
    { name: "amountReceived", label: "Amount Received (INR)", type: "number", defaultValue: 0, required: true },
    { name: "paymentMode", label: "Payment Mode", type: "select", options: ["Cash", "UPI", "Bank transfer", "Cheque", "Card", "Other"], defaultValue: "Bank transfer", required: true },
    { name: "paymentReference", label: "Payment Reference", type: "text" },
    { name: "purpose", label: "Purpose / Against", type: "textarea", required: true },
    { name: "invoiceReference", label: "Invoice / Document Reference", type: "text" },
  ],
  seo: seo(
    ["payment receipt generator India", "cash receipt format", "GST receipt voucher generator"],
    ["Payer and recipient", "Amount and payment mode", "Purpose", "Invoice reference where applicable"],
  ),
});

export const GstCreditDebitNoteGenerator = createTransactionGenerator({
  id: "gst-credit-debit-note",
  title: "GST Credit Note / Debit Note",
  description: "Prepare a GST adjustment note linked to an original invoice.",
  documentTitle: "GST Credit Note / Debit Note",
  icon: ScrollText,
  numberLabel: "Note Number",
  numberPrefix: "CN-DN",
  firstPartyLabel: "Supplier",
  secondPartyLabel: "Recipient",
  complianceNotice: "Generating this note does not amend GST returns, file portal data, or generate an IRN.",
  showTaxes: true,
  extraFields: [
    { name: "noteType", label: "Note Type", type: "select", options: ["Credit Note", "Debit Note"], defaultValue: "Credit Note", required: true },
    { name: "originalInvoiceNumber", label: "Original Invoice Number", type: "text", required: true },
    { name: "originalInvoiceDate", label: "Original Invoice Date", type: "date", required: true },
    { name: "reason", label: "Reason for Adjustment", type: "textarea", required: true },
  ],
  seo: seo(
    ["GST credit note generator", "GST debit note format", "credit note online India"],
    ["Supplier and recipient GSTINs", "Original invoice reference", "Adjustment reason", "Adjusted values and taxes"],
  ),
});

export const ExpenseReimbursementGenerator = createTransactionGenerator({
  id: "expense-reimbursement",
  title: "Expense Reimbursement Voucher",
  description: "Prepare an internal employee or vendor expense reimbursement voucher with approval blocks.",
  documentTitle: "Expense Reimbursement Voucher",
  icon: ReceiptIndianRupee,
  numberLabel: "Voucher Number",
  numberPrefix: "ER",
  firstPartyLabel: "Business / Employer",
  secondPartyLabel: "Employee / Vendor",
  complianceNotice: "Internal reimbursement record - Not a Tax Invoice.",
  showTaxes: false,
  extraFields: [
    { name: "claimantType", label: "Claimant Type", type: "select", options: ["Employee", "Vendor"], defaultValue: "Employee", required: true },
    { name: "department", label: "Department", type: "text" },
    { name: "costCentre", label: "Cost Centre", type: "text" },
    { name: "businessPurpose", label: "Business Purpose", type: "textarea", required: true },
    { name: "expenseDates", label: "Expense Date(s)", type: "text", placeholder: "Example: 1-5 April 2026" },
    { name: "expenseCategories", label: "Expense Categories", type: "text", placeholder: "Travel, meals, lodging, supplies" },
    { name: "invoiceReferences", label: "Invoice / Bill References", type: "textarea" },
    { name: "paymentMode", label: "Reimbursement Payment Mode", type: "select", options: ["Bank transfer", "Cash", "Payroll", "Other"], defaultValue: "Bank transfer" },
    { name: "nonReimbursableDeductions", label: "Non-Reimbursable Deductions (INR)", type: "number", defaultValue: 0 },
    { name: "receiptsAttached", label: "Supporting Receipts", type: "select", options: ["Attached", "Not attached - declaration provided"], defaultValue: "Attached" },
    { name: "claimantDeclaration", label: "Employee / Vendor Declaration", type: "textarea", defaultValue: "I declare that the expenses were incurred for the stated business purpose and have not been claimed earlier." },
    { name: "managerApproval", label: "Manager Approval", type: "text" },
    { name: "accountsApproval", label: "Accounts Approval", type: "text" },
  ],
  seo: seo(
    ["expense reimbursement voucher India", "employee expense claim format", "expense voucher generator"],
    ["Business and claimant details", "Business purpose", "Expense line items", "Approvals and supporting receipts"],
    [
      "This is an internal reimbursement record and not a tax invoice.",
      "The organisation must verify supporting invoices, policy eligibility, and tax treatment.",
    ],
  ),
});

export const InvoiceGenerator = createTransactionGenerator({
  id: "invoice",
  title: "GST Compliant Tax Invoice",
  description: "Prepare an Indian GST tax invoice with explicit place of supply and tax breakup.",
  documentTitle: "Tax Invoice",
  icon: ReceiptIndianRupee,
  numberLabel: "Invoice Number",
  numberPrefix: "INV",
  firstPartyLabel: "Supplier / Billed By",
  secondPartyLabel: "Recipient / Billed To",
  complianceNotice: "GST tax invoice draft. This tool does not generate an IRN, QR code, e-way bill, or file GST returns.",
  showTaxes: true,
  showBankDetails: true,
  extraFields: [
    { name: "dueDate", label: "Due Date", type: "date" },
    { name: "reverseChargeDeclaration", label: "Reverse Charge Declaration", type: "textarea" },
  ],
  conversionTargets: [
    { kind: "payment-receipt", label: "Create Payment Receipt" },
    { kind: "gst-credit-debit-note", label: "Create Credit / Debit Note" },
  ],
  seo: seo(
    ["GST invoice generator India", "tax invoice format", "GST bill generator"],
    ["Supplier and recipient details", "Place of supply", "Items and HSN/SAC", "Tax rates and payment terms"],
  ),
});
