import { z } from "zod";
import { FileText, Plus, Trash2, type LucideIcon } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validationPatterns } from "@shared/security-validation";
import type { DocumentGeneratorConfig, DocumentGeneratorSEO } from "./types";
import {
  COMMON_GST_RATES,
  INDIAN_STATES,
  calculateIndianDocumentTotals,
  escapeFinancialHtml,
  finiteNumber,
  formatFinancialDate,
  formatIndianCurrency,
  indianAmountInWords,
  type FinancialDocumentDraft,
  type FinancialDocumentKind,
} from "../financial";

type ExtraField = {
  name: string;
  label: string;
  type?: "text" | "date" | "number" | "textarea" | "select";
  placeholder?: string;
  options?: readonly string[];
  defaultValue?: string | number;
  required?: boolean;
};

export interface TransactionGeneratorDefinition {
  id: FinancialDocumentKind;
  title: string;
  description: string;
  documentTitle: string;
  icon?: LucideIcon;
  numberLabel: string;
  numberPrefix: string;
  firstPartyLabel: string;
  secondPartyLabel: string;
  complianceNotice: string;
  extraFields?: ExtraField[];
  conversionTargets?: Array<{ kind: FinancialDocumentKind; label: string }>;
  copies?: readonly string[];
  itemsOptional?: boolean;
  showBankDetails?: boolean;
  showTaxes?: boolean;
  seo: DocumentGeneratorSEO;
}

const optionalIdentifier = (pattern: RegExp, message: string) =>
  z.string().trim().transform((value) => value.toUpperCase()).refine(
    (value) => !value || pattern.test(value),
    message,
  );

const partySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(160),
  address: z.string().trim().min(5, "Address is required").max(700),
  stateCode: z.string().refine(
    (value) => INDIAN_STATES.some(([code]) => code === value),
    "Select an Indian state",
  ),
  gstin: optionalIdentifier(
    validationPatterns.GSTIN,
    "Invalid GSTIN format",
  ),
  pan: optionalIdentifier(validationPatterns.PAN, "Invalid PAN format"),
  pincode: z.string().trim().refine(
    (value) => !value || validationPatterns.PINCODE.test(value),
    "Invalid Indian pincode",
  ),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().trim().refine(
    (value) => {
      const normalized = value.replace(/[\s-]/g, "").replace(/^\+91/, "");
      return !value || validationPatterns.MOBILE.test(normalized);
    },
    "Invalid Indian mobile number",
  ),
});

const itemSchema = z.object({
  description: z.string().trim().min(2, "Description is required").max(500),
  hsnSac: z.string().trim().max(20).optional(),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unit: z.string().trim().min(1).max(30),
  rate: z.number().min(0, "Rate cannot be negative"),
  discountType: z.enum(["percentage", "amount"]),
  discountValue: z.number().min(0, "Discount cannot be negative"),
  taxTreatment: z.enum(["taxable", "exempt", "nil-rated", "non-gst", "reverse-charge"]),
  gstRate: z.number().min(0).max(100),
  cessRate: z.number().min(0).max(100),
});

const emptyParty = {
  name: "",
  address: "",
  stateCode: "27",
  gstin: "",
  pan: "",
  pincode: "",
  email: "",
  phone: "",
};

const emptyItem = {
  description: "",
  hsnSac: "",
  quantity: 1,
  unit: "Nos",
  rate: 0,
  discountType: "percentage",
  discountValue: 0,
  taxTreatment: "taxable",
  gstRate: 18,
  cessRate: 0,
};

function StateSelect({ register, name }: { register: any; name: string }) {
  return (
    <select
      {...register(name)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
    >
      {INDIAN_STATES.map(([code, state]) => (
        <option key={code} value={code}>{code} - {state}</option>
      ))}
    </select>
  );
}

function PartyFields({
  register,
  prefix,
  label,
}: {
  register: any;
  prefix: string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <h3 className="font-bold text-slate-900">{label}</h3>
        <div>
          <Label>Name / Business Name</Label>
          <Input {...register(`${prefix}.name`)} placeholder="As per supporting records" />
        </div>
        <div>
          <Label>Complete Address</Label>
          <Textarea {...register(`${prefix}.address`)} rows={3} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>State / UT Code</Label>
            <StateSelect register={register} name={`${prefix}.stateCode`} />
          </div>
          <div>
            <Label>GSTIN, if registered</Label>
            <Input {...register(`${prefix}.gstin`)} placeholder="27ABCDE1234F1Z5" />
          </div>
          <div>
            <Label>PAN, if relevant</Label>
            <Input {...register(`${prefix}.pan`)} placeholder="ABCDE1234F" />
          </div>
          <div>
            <Label>Pincode</Label>
            <Input inputMode="numeric" {...register(`${prefix}.pincode`)} placeholder="400001" />
          </div>
          <div>
            <Label>Indian Mobile</Label>
            <Input {...register(`${prefix}.phone`)} placeholder="9876543210" />
          </div>
          <div className="sm:col-span-2">
            <Label>Email</Label>
            <Input type="email" {...register(`${prefix}.email`)} placeholder="accounts@example.in" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExtraFieldControl({ field, register }: { field: ExtraField; register: any }) {
  const registration =
    field.type === "number"
      ? register(`details.${field.name}`, { valueAsNumber: true })
      : register(`details.${field.name}`);

  if (field.type === "textarea") {
    return <Textarea {...registration} rows={3} placeholder={field.placeholder} />;
  }
  if (field.type === "select") {
    return (
      <select
        {...registration}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        {(field.options || []).map((option) => <option key={option}>{option}</option>)}
      </select>
    );
  }
  return <Input {...registration} type={field.type || "text"} placeholder={field.placeholder} />;
}

function createTransactionSchema(definition: TransactionGeneratorDefinition) {
  const detailShape = Object.fromEntries(
    (definition.extraFields || []).map((field) => [
      field.name,
      field.type === "number"
        ? z.number().min(0)
        : field.required
          ? z.string().trim().min(1, `${field.label} is required`)
          : z.string().optional(),
    ]),
  );

  return z.object({
    documentNumber: z.string().trim().min(1, `${definition.numberLabel} is required`).max(80),
    documentDate: z.string().min(1, "Document date is required"),
    placeOfSupplyStateCode: z.string().regex(/^[0-9]{2}$/),
    firstParty: partySchema,
    secondParty: partySchema,
    items: definition.itemsOptional
      ? z.array(itemSchema)
      : z.array(itemSchema).min(1, "Add at least one line item"),
    freight: z.number().min(0),
    roundOff: z.boolean(),
    terms: z.string().max(3000).optional(),
    notes: z.string().max(3000).optional(),
    bankDetails: z.object({
      accountName: z.string().max(160).optional(),
      accountNumber: z.string().refine(
        (value) => !value || validationPatterns.ACCOUNT_NUMBER.test(value),
        "Invalid account number",
      ),
      ifsc: optionalIdentifier(validationPatterns.IFSC, "Invalid IFSC"),
      bankName: z.string().max(160).optional(),
    }),
    details: z.object(detailShape),
  });
}

function createDefaultValues(definition: TransactionGeneratorDefinition) {
  const today = new Date().toISOString().split("T")[0];
  return {
    documentNumber: `${definition.numberPrefix}-001`,
    documentDate: today,
    placeOfSupplyStateCode: "27",
    firstParty: { ...emptyParty },
    secondParty: { ...emptyParty },
    items: definition.itemsOptional ? [] : [{ ...emptyItem }],
    freight: 0,
    roundOff: true,
    terms: "",
    notes: "",
    bankDetails: { accountName: "", accountNumber: "", ifsc: "", bankName: "" },
    details: Object.fromEntries(
      (definition.extraFields || []).map((field) => [field.name, field.defaultValue ?? ""]),
    ),
  };
}

function renderParty(label: string, party: any) {
  const state = INDIAN_STATES.find(([code]) => code === party?.stateCode)?.[1] || party?.stateCode || "";
  return `
    <div style="width: 48%;">
      <div style="font-size: 11px; color: #475569; text-transform: uppercase; font-weight: 700;">${escapeFinancialHtml(label)}</div>
      <div style="font-size: 16px; font-weight: 700; margin-top: 4px;">${escapeFinancialHtml(party?.name || "____________")}</div>
      <div style="white-space: pre-line; margin-top: 4px;">${escapeFinancialHtml(party?.address || "")}</div>
      ${state ? `<div><strong>State:</strong> ${escapeFinancialHtml(state)} (${escapeFinancialHtml(party?.stateCode)})</div>` : ""}
      ${party?.gstin ? `<div><strong>GSTIN:</strong> ${escapeFinancialHtml(party.gstin)}</div>` : ""}
      ${party?.pan ? `<div><strong>PAN:</strong> ${escapeFinancialHtml(party.pan)}</div>` : ""}
      ${party?.pincode ? `<div><strong>Pincode:</strong> ${escapeFinancialHtml(party.pincode)}</div>` : ""}
      ${party?.phone ? `<div><strong>Phone:</strong> ${escapeFinancialHtml(party.phone)}</div>` : ""}
      ${party?.email ? `<div><strong>Email:</strong> ${escapeFinancialHtml(party.email)}</div>` : ""}
    </div>`;
}

function getCalculatedItems(definition: TransactionGeneratorDefinition, items: any[]) {
  if (definition.showTaxes !== false) return items;
  return items.map((item) => ({
    ...item,
    taxTreatment: "non-gst" as const,
    gstRate: 0,
    cessRate: 0,
  }));
}

function getDisplayTotal(
  definition: TransactionGeneratorDefinition,
  data: any,
  calculatedGrandTotal: number,
) {
  if (definition.id === "payment-receipt") {
    const amountReceived = finiteNumber(data.details?.amountReceived);
    return {
      label: "Amount received",
      adjustmentLabel: null,
      adjustmentValue: 0,
      value: amountReceived > 0 ? amountReceived : calculatedGrandTotal,
    };
  }

  if (definition.id === "expense-reimbursement") {
    const deductions = Math.max(0, finiteNumber(data.details?.nonReimbursableDeductions));
    return {
      label: "Reimbursable total",
      adjustmentLabel: "Non-reimbursable deductions",
      adjustmentValue: -deductions,
      value: Math.max(0, calculatedGrandTotal - deductions),
    };
  }

  return {
    label: "Grand total",
    adjustmentLabel: null,
    adjustmentValue: 0,
    value: calculatedGrandTotal,
  };
}

export function createTransactionGenerator(
  definition: TransactionGeneratorDefinition,
): DocumentGeneratorConfig {
  const schema = createTransactionSchema(definition);
  const defaultValues = createDefaultValues(definition);
  const Icon = definition.icon || FileText;

  const FormComponent = ({ register, control, watch }: any) => {
    const { fields, append, remove } = useFieldArray({ control, name: "items" });
    const watched = watch();
    const totals = calculateIndianDocumentTotals({
      supplierStateCode: watched.firstParty?.stateCode,
      placeOfSupplyStateCode: watched.placeOfSupplyStateCode,
      roundOff: watched.roundOff,
      freight: watched.freight,
      items: getCalculatedItems(definition, watched.items || []),
    });
    const displayTotal = getDisplayTotal(definition, watched, totals.grandTotal);

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          {definition.complianceNotice}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>{definition.numberLabel}</Label>
            <Input {...register("documentNumber")} />
          </div>
          <div>
            <Label>Document Date</Label>
            <Input type="date" {...register("documentDate")} />
          </div>
          <div>
            <Label>Place of Supply</Label>
            <StateSelect register={register} name="placeOfSupplyStateCode" />
          </div>
        </div>

        {(definition.extraFields || []).length > 0 && (
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              {(definition.extraFields || []).map((field) => (
                <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <Label>{field.label}</Label>
                  <ExtraFieldControl field={field} register={register} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-5 xl:grid-cols-2">
          <PartyFields register={register} prefix="firstParty" label={definition.firstPartyLabel} />
          <PartyFields register={register} prefix="secondParty" label={definition.secondPartyLabel} />
        </div>

        <div>
          <h3 className="mb-3 text-lg font-bold">Line Items</h3>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="relative">
                <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 xl:grid-cols-6">
                  <div className="sm:col-span-2 xl:col-span-2">
                    <Label>Description</Label>
                    <Input {...register(`items.${index}.description`)} />
                  </div>
                  <div>
                    <Label>HSN / SAC</Label>
                    <Input {...register(`items.${index}.hsnSac`)} />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input type="number" step="0.001" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input {...register(`items.${index}.unit`)} />
                  </div>
                  <div>
                    <Label>Rate (INR)</Label>
                    <Input type="number" step="0.01" {...register(`items.${index}.rate`, { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label>Discount Type</Label>
                    <select {...register(`items.${index}.discountType`)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="percentage">Percentage</option>
                      <option value="amount">Amount</option>
                    </select>
                  </div>
                  <div>
                    <Label>Discount</Label>
                    <Input type="number" step="0.01" {...register(`items.${index}.discountValue`, { valueAsNumber: true })} />
                  </div>
                  {definition.showTaxes !== false && (
                    <>
                      <div>
                        <Label>Tax Treatment</Label>
                        <select {...register(`items.${index}.taxTreatment`)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                          <option value="taxable">Taxable</option>
                          <option value="exempt">Exempt</option>
                          <option value="nil-rated">Nil-rated</option>
                          <option value="non-gst">Non-GST</option>
                          <option value="reverse-charge">Reverse charge</option>
                        </select>
                      </div>
                      <div>
                        <Label>GST Rate (%)</Label>
                        <Input list={`gst-rates-${definition.id}`} type="number" step="0.01" {...register(`items.${index}.gstRate`, { valueAsNumber: true })} />
                        <datalist id={`gst-rates-${definition.id}`}>
                          {COMMON_GST_RATES.map((rate) => <option key={rate} value={rate} />)}
                        </datalist>
                      </div>
                      <div>
                        <Label>Cess (%)</Label>
                        <Input type="number" step="0.01" {...register(`items.${index}.cessRate`, { valueAsNumber: true })} />
                      </div>
                    </>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="absolute right-2 top-2 text-red-600"
                    aria-label={`Remove item ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => append({ ...emptyItem })}>
            <Plus className="mr-2 h-4 w-4" /> Add line item
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label>Freight / Other Charge</Label>
                <Input type="number" step="0.01" {...register("freight", { valueAsNumber: true })} />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" {...register("roundOff")} /> Round final total to nearest rupee
              </label>
              <div>
                <Label>Notes</Label>
                <Textarea {...register("notes")} rows={3} />
              </div>
              <div>
                <Label>Terms</Label>
                <Textarea {...register("terms")} rows={3} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 pt-6 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><strong>{formatIndianCurrency(totals.subtotal)}</strong></div>
              <div className="flex justify-between"><span>Discount</span><strong>{formatIndianCurrency(totals.discountTotal)}</strong></div>
              <div className="flex justify-between"><span>Taxable value</span><strong>{formatIndianCurrency(totals.taxableValue)}</strong></div>
              {definition.showTaxes !== false && (
                <>
                  <div className="flex justify-between"><span>CGST</span><strong>{formatIndianCurrency(totals.cgst)}</strong></div>
                  <div className="flex justify-between"><span>SGST / UTGST</span><strong>{formatIndianCurrency(totals.sgst)}</strong></div>
                  <div className="flex justify-between"><span>IGST</span><strong>{formatIndianCurrency(totals.igst)}</strong></div>
                  <div className="flex justify-between"><span>Cess</span><strong>{formatIndianCurrency(totals.cess)}</strong></div>
                </>
              )}
              {displayTotal.adjustmentLabel && (
                <div className="flex justify-between"><span>{displayTotal.adjustmentLabel}</span><strong>{formatIndianCurrency(displayTotal.adjustmentValue)}</strong></div>
              )}
              <div className="flex justify-between border-t pt-2 text-base"><span>{displayTotal.label}</span><strong>{formatIndianCurrency(displayTotal.value)}</strong></div>
            </CardContent>
          </Card>
        </div>

        {definition.showBankDetails && (
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <div><Label>Account Holder</Label><Input {...register("bankDetails.accountName")} /></div>
              <div><Label>Account Number</Label><Input {...register("bankDetails.accountNumber")} /></div>
              <div><Label>IFSC</Label><Input {...register("bankDetails.ifsc")} /></div>
              <div><Label>Bank and Branch</Label><Input {...register("bankDetails.bankName")} /></div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const generateHTML = (data: any) => {
    const items = Array.isArray(data.items) ? data.items : [];
    const totals = calculateIndianDocumentTotals({
      supplierStateCode: data.firstParty?.stateCode,
      placeOfSupplyStateCode: data.placeOfSupplyStateCode,
      roundOff: data.roundOff,
      freight: data.freight,
      items: getCalculatedItems(definition, items),
    });
    const displayTotal = getDisplayTotal(definition, data, totals.grandTotal);
    const rows = items.map((item: any, index: number) => {
      const line = totals.lines[index];
      return `<tr>
        <td style="border:1px solid #cbd5e1;padding:7px;">${index + 1}</td>
        <td style="border:1px solid #cbd5e1;padding:7px;">${escapeFinancialHtml(item.description)}</td>
        <td style="border:1px solid #cbd5e1;padding:7px;">${escapeFinancialHtml(item.hsnSac || "-")}</td>
        <td style="border:1px solid #cbd5e1;padding:7px;text-align:right;">${escapeFinancialHtml(item.quantity)} ${escapeFinancialHtml(item.unit)}</td>
        <td style="border:1px solid #cbd5e1;padding:7px;text-align:right;">${formatIndianCurrency(item.rate)}</td>
        ${definition.showTaxes !== false ? `<td style="border:1px solid #cbd5e1;padding:7px;text-align:right;">${escapeFinancialHtml(item.taxTreatment)} / ${escapeFinancialHtml(item.gstRate)}%</td>` : ""}
        <td style="border:1px solid #cbd5e1;padding:7px;text-align:right;">${formatIndianCurrency(line?.total)}</td>
      </tr>`;
    }).join("");
    const details = (definition.extraFields || []).map((field) => {
      const value = data.details?.[field.name];
      return value === "" || value === undefined
        ? ""
        : `<div><strong>${escapeFinancialHtml(field.label)}:</strong> ${field.type === "date" ? formatFinancialDate(value) : escapeFinancialHtml(value)}</div>`;
    }).join("");
    const copies = (definition.copies || []).map((copy) => `<div style="page-break-after:always;">${renderDocument(copy)}</div>`).join("");

    function renderDocument(copy?: string) {
      return `
        <div class="mye-ca-document" style="font-family:Arial,sans-serif;color:#0f172a;max-width:900px;margin:0 auto;font-size:12px;line-height:1.5;">
          <div style="border:2px solid #0f4c81;padding:16px;">
            <div style="display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #0f4c81;padding-bottom:12px;">
              <div>
                <h1 style="font-size:24px;margin:0;color:#0f4c81;">${escapeFinancialHtml(definition.documentTitle)}</h1>
                <div style="margin-top:5px;color:#9a3412;font-weight:700;">${escapeFinancialHtml(definition.complianceNotice)}</div>
                ${copy ? `<div style="margin-top:5px;font-weight:700;">${escapeFinancialHtml(copy)}</div>` : ""}
              </div>
              <div style="text-align:right;">
                <div><strong>${escapeFinancialHtml(definition.numberLabel)}:</strong> ${escapeFinancialHtml(data.documentNumber)}</div>
                <div><strong>Date:</strong> ${formatFinancialDate(data.documentDate)}</div>
                ${details}
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;gap:20px;margin:18px 0;">
              ${renderParty(definition.firstPartyLabel, data.firstParty)}
              ${renderParty(definition.secondPartyLabel, data.secondParty)}
            </div>
            <div style="margin-bottom:12px;"><strong>Place of Supply:</strong> ${escapeFinancialHtml(data.placeOfSupplyStateCode || "")}</div>
            <table style="width:100%;border-collapse:collapse;">
              <thead><tr style="background:#e2e8f0;">
                <th style="border:1px solid #cbd5e1;padding:7px;">#</th>
                <th style="border:1px solid #cbd5e1;padding:7px;text-align:left;">Description</th>
                <th style="border:1px solid #cbd5e1;padding:7px;">HSN/SAC</th>
                <th style="border:1px solid #cbd5e1;padding:7px;">Qty</th>
                <th style="border:1px solid #cbd5e1;padding:7px;">Rate</th>
                ${definition.showTaxes !== false ? `<th style="border:1px solid #cbd5e1;padding:7px;">Tax</th>` : ""}
                <th style="border:1px solid #cbd5e1;padding:7px;">Total</th>
              </tr></thead>
              <tbody>${rows || `<tr><td colspan="${definition.showTaxes !== false ? 7 : 6}" style="border:1px solid #cbd5e1;padding:18px;text-align:center;">No line items</td></tr>`}</tbody>
            </table>
            <div style="display:flex;justify-content:space-between;gap:28px;margin-top:18px;">
              <div style="width:55%;">
                <div><strong>Amount in words:</strong> ${escapeFinancialHtml(indianAmountInWords(displayTotal.value))}</div>
                ${data.notes ? `<p><strong>Notes:</strong><br>${escapeFinancialHtml(data.notes)}</p>` : ""}
                ${data.terms ? `<p><strong>Terms:</strong><br>${escapeFinancialHtml(data.terms)}</p>` : ""}
                ${definition.showBankDetails && data.bankDetails?.accountNumber ? `<p><strong>Payment details:</strong><br>${escapeFinancialHtml(data.bankDetails.accountName)}<br>${escapeFinancialHtml(data.bankDetails.bankName)}<br>A/c: ${escapeFinancialHtml(data.bankDetails.accountNumber)} | IFSC: ${escapeFinancialHtml(data.bankDetails.ifsc)}</p>` : ""}
              </div>
              <table style="width:40%;border-collapse:collapse;">
                ${[
                  ["Subtotal", totals.subtotal],
                  ["Discount", -totals.discountTotal],
                  ["Taxable value", totals.taxableValue],
                  ...(definition.showTaxes !== false ? [
                    ["CGST", totals.cgst],
                    ["SGST / UTGST", totals.sgst],
                    ["IGST", totals.igst],
                    ["Cess", totals.cess],
                  ] : []),
                  ["Freight", totals.freight],
                  ["Round off", totals.roundOff],
                  ...(displayTotal.adjustmentLabel ? [[displayTotal.adjustmentLabel, displayTotal.adjustmentValue]] : []),
                  [displayTotal.label, displayTotal.value],
                ].map(([label, value]) => `<tr><td style="border:1px solid #cbd5e1;padding:6px;"><strong>${label}</strong></td><td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">${formatIndianCurrency(value)}</td></tr>`).join("")}
              </table>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:50px;">
              <div>Recipient acknowledgement</div>
              <div style="text-align:center;"><div style="height:35px;"></div><strong>Authorised Signatory</strong></div>
            </div>
          </div>
        </div>`;
    }

    return definition.copies?.length ? copies : renderDocument();
  };

  const generateMarkdown = (data: any) =>
    `# ${definition.documentTitle}\n\n${definition.complianceNotice}\n\n${definition.numberLabel}: ${data.documentNumber || ""}\n\nGenerated via MyeCA.in.`;

  const buildFinancialDraft = (data: any, existingId?: string | null): FinancialDocumentDraft => {
    const now = new Date().toISOString();
    return {
      version: 1,
      id: existingId || crypto.randomUUID(),
      kind: definition.id,
      sourceDocumentId: data.sourceDocumentId || null,
      parties: { supplier: data.firstParty, customer: data.secondParty },
      items: data.items || [],
      taxTreatment: {
        placeOfSupplyStateCode: data.placeOfSupplyStateCode,
        roundOff: data.roundOff,
      },
      terms: data.terms,
      content: {
        documentNumber: data.documentNumber,
        documentDate: data.documentDate,
        freight: data.freight,
        notes: data.notes,
        details: data.details,
        bankDetails: data.bankDetails,
      },
      createdAt: now,
      updatedAt: now,
    };
  };

  const applyFinancialDraft = (draft: FinancialDocumentDraft) => ({
    ...defaultValues,
    sourceDocumentId: draft.sourceDocumentId,
    firstParty: draft.parties.supplier || defaultValues.firstParty,
    secondParty: draft.parties.customer || defaultValues.secondParty,
    items: draft.items,
    placeOfSupplyStateCode:
      draft.taxTreatment.placeOfSupplyStateCode || defaultValues.placeOfSupplyStateCode,
    roundOff: draft.taxTreatment.roundOff ?? defaultValues.roundOff,
    terms: draft.terms || "",
    ...(draft.content || {}),
  });

  return {
    id: definition.id,
    title: definition.title,
    description: definition.description,
    icon: <Icon className="h-5 w-5" />,
    schema,
    defaultValues,
    generateHTML,
    generateMarkdown,
    exportFormats: ["pdf", "html"],
    complianceNotice: definition.complianceNotice,
    conversionTargets: definition.conversionTargets,
    buildFinancialDraft,
    applyFinancialDraft,
    seo: definition.seo,
    FormComponent,
  };
}
