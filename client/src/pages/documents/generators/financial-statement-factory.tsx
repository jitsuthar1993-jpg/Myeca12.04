import { z } from "zod";
import { BarChart3, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validationPatterns } from "@shared/security-validation";
import type { DocumentGeneratorConfig, DocumentGeneratorSEO } from "./types";
import {
  calculateFinancialRatios,
  escapeFinancialHtml,
  formatFinancialDate,
  formatIndianCurrency,
  type FinancialDocumentDraft,
  type FinancialDocumentKind,
} from "../financial";

export interface FinancialStatementRow {
  id: string;
  label: string;
  group: string;
}

interface StatementSummary {
  label: string;
  values: number[];
  format?: "currency" | "ratio";
}

interface FinancialStatementDefinition {
  id: Extract<FinancialDocumentKind, "msme-cash-flow" | "projected-balance-sheet" | "net-worth-statement">;
  title: string;
  description: string;
  documentTitle: string;
  complianceNotice: string;
  icon?: LucideIcon;
  periods: string[];
  rows: FinancialStatementRow[];
  summary: (values: Record<string, number[]>) => StatementSummary[];
  conversionTargets?: Array<{ kind: FinancialDocumentKind; label: string }>;
  exportBlockReason?: (values: Record<string, number[]>) => string | null;
  seo: DocumentGeneratorSEO;
}

function valueAt(values: Record<string, number[]>, row: string, period: number) {
  const value = Number(values[row]?.[period]);
  return Number.isFinite(value) ? value : 0;
}

export function createFinancialStatementGenerator(
  definition: FinancialStatementDefinition,
): DocumentGeneratorConfig {
  const valuesSchema = z.object(
    Object.fromEntries(
      definition.rows.map((row) => [
        row.id,
        z.array(z.number().min(0, "Amounts cannot be negative")).length(definition.periods.length),
      ]),
    ),
  );
  const schema = z.object({
    entityName: z.string().trim().min(2, "Entity / applicant name is required").max(180),
    entityType: z.string().trim().min(2).max(80),
    pan: z.string().trim().transform((value) => value.toUpperCase()).refine(
      (value) => !value || validationPatterns.PAN.test(value),
      "Invalid PAN",
    ),
    gstin: z.string().trim().transform((value) => value.toUpperCase()).refine(
      (value) => !value || validationPatterns.GSTIN.test(value),
      "Invalid GSTIN",
    ),
    statementDate: z.string().min(1, "Statement date is required"),
    purpose: z.string().trim().min(3, "Purpose is required").max(500),
    assumptions: z.string().max(5000).optional(),
    periodLabels: z.array(z.string().trim().min(2, "Financial-year label is required")).length(definition.periods.length),
    values: valuesSchema,
  });
  const today = new Date().toISOString().split("T")[0];
  const defaultValues = {
    entityName: "",
    entityType: definition.id === "net-worth-statement" ? "Individual" : "MSME / Proprietorship",
    pan: "",
    gstin: "",
    statementDate: today,
    purpose: definition.id === "net-worth-statement" ? "Financial position statement" : "Bank finance planning",
    assumptions: "",
    periodLabels: [...definition.periods],
    values: Object.fromEntries(
      definition.rows.map((row) => [row.id, definition.periods.map(() => 0)]),
    ),
  };
  const Icon = definition.icon || BarChart3;
  const formatSummaryValue = (summary: StatementSummary, value: number) =>
    summary.format === "ratio" ? value.toFixed(2) : formatIndianCurrency(value);

  const FormComponent = ({ register, watch }: any) => {
    const values = watch("values") || defaultValues.values;
    const periodLabels = watch("periodLabels") || defaultValues.periodLabels;
    const summaries = definition.summary(values);
    const blocked = definition.exportBlockReason?.(values);
    let activeGroup = "";

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          {definition.complianceNotice}
        </div>
        <Card>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <div><Label>Entity / Applicant Name</Label><Input {...register("entityName")} /></div>
            <div>
              <Label>Entity Type</Label>
              <select {...register("entityType")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {["Individual", "Proprietorship", "Partnership Firm", "LLP", "Private Limited Company", "MSME / Other"].map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div><Label>PAN</Label><Input {...register("pan")} placeholder="ABCDE1234F" /></div>
            <div><Label>GSTIN, if applicable</Label><Input {...register("gstin")} placeholder="27ABCDE1234F1Z5" /></div>
            <div><Label>Statement / Valuation Date</Label><Input type="date" {...register("statementDate")} /></div>
            <div><Label>Purpose</Label><Input {...register("purpose")} /></div>
          </CardContent>
        </Card>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-[760px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border-b p-3 text-left">Particulars</th>
                {definition.periods.map((period, index) => (
                  <th key={period} className="border-b p-2 text-right">
                    <Input aria-label={`Period ${index + 1}`} {...register(`periodLabels.${index}`)} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {definition.rows.map((row) => {
                const showGroup = activeGroup !== row.group;
                activeGroup = row.group;
                return [
                  showGroup ? (
                    <tr key={`${row.group}-group`} className="bg-blue-50">
                      <th colSpan={definition.periods.length + 1} className="p-3 text-left text-blue-900">{row.group}</th>
                    </tr>
                  ) : null,
                  <tr key={row.id}>
                    <td className="border-t p-3 font-semibold text-slate-700">{row.label}</td>
                    {periodLabels.map((period: string, index: number) => (
                      <td key={period} className="border-t p-2">
                        <Input
                          aria-label={`${row.label} ${period}`}
                          className="text-right"
                          type="number"
                          step="0.01"
                          {...register(`values.${row.id}.${index}`, { valueAsNumber: true })}
                        />
                      </td>
                    ))}
                  </tr>,
                ];
              })}
            </tbody>
          </table>
        </div>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-bold">Calculated Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-[650px] w-full text-sm">
                <tbody>
                  {summaries.map((summary) => (
                    <tr key={summary.label}>
                      <td className="border-t py-2 font-semibold">{summary.label}</td>
                      {summary.values.map((value, index) => (
                        <td key={periodLabels[index]} className="border-t py-2 text-right">{formatSummaryValue(summary, value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {blocked && <p className="rounded-md border border-red-200 bg-red-50 p-3 font-semibold text-red-800">{blocked}</p>}
          </CardContent>
        </Card>

        <div>
          <Label>Assumptions / Valuation Basis / Supporting Documents</Label>
          <Textarea {...register("assumptions")} rows={5} />
        </div>
      </div>
    );
  };

  const generateHTML = (data: any) => {
    const values = data.values || defaultValues.values;
    const periodLabels = data.periodLabels || defaultValues.periodLabels;
    const summary = definition.summary(values);
    let currentGroup = "";
    const rows = definition.rows.map((row) => {
      const groupRow = currentGroup !== row.group
        ? `<tr style="background:#dbeafe;"><th colspan="${definition.periods.length + 1}" style="border:1px solid #94a3b8;padding:8px;text-align:left;">${escapeFinancialHtml(row.group)}</th></tr>`
        : "";
      currentGroup = row.group;
      return `${groupRow}<tr>
        <td style="border:1px solid #cbd5e1;padding:7px;">${escapeFinancialHtml(row.label)}</td>
        ${periodLabels.map((_: string, index: number) => `<td style="border:1px solid #cbd5e1;padding:7px;text-align:right;">${formatIndianCurrency(valueAt(values, row.id, index))}</td>`).join("")}
      </tr>`;
    }).join("");
    const summaryRows = summary.map((item) => `<tr style="font-weight:700;">
      <td style="border:1px solid #94a3b8;padding:7px;">${escapeFinancialHtml(item.label)}</td>
      ${item.values.map((value) => `<td style="border:1px solid #94a3b8;padding:7px;text-align:right;">${formatSummaryValue(item, value)}</td>`).join("")}
    </tr>`).join("");
    const blocked = definition.exportBlockReason?.(values);

    return `<div class="mye-ca-document" style="max-width:900px;margin:0 auto;font-family:Arial,sans-serif;color:#0f172a;font-size:12px;">
      <h1 style="text-align:center;color:#0f4c81;">${escapeFinancialHtml(definition.documentTitle)}</h1>
      <p style="text-align:center;color:#9a3412;font-weight:700;">${escapeFinancialHtml(definition.complianceNotice)}</p>
      <div style="display:flex;justify-content:space-between;border:1px solid #cbd5e1;padding:12px;margin:18px 0;">
        <div><strong>${escapeFinancialHtml(data.entityName || "____________")}</strong><br>${escapeFinancialHtml(data.entityType || "")}<br>PAN: ${escapeFinancialHtml(data.pan || "-")}<br>GSTIN: ${escapeFinancialHtml(data.gstin || "-")}</div>
        <div style="text-align:right;">As at: ${formatFinancialDate(data.statementDate)}<br>Purpose: ${escapeFinancialHtml(data.purpose || "")}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#e2e8f0;"><th style="border:1px solid #94a3b8;padding:8px;text-align:left;">Particulars</th>${periodLabels.map((period: string) => `<th style="border:1px solid #94a3b8;padding:8px;text-align:right;">${escapeFinancialHtml(period)}</th>`).join("")}</tr></thead>
        <tbody>${rows}${summaryRows}</tbody>
      </table>
      ${blocked ? `<p style="border:1px solid #ef4444;background:#fef2f2;color:#991b1b;padding:10px;font-weight:700;">${escapeFinancialHtml(blocked)}</p>` : ""}
      ${data.assumptions ? `<h3>Assumptions / Valuation Basis</h3><p style="white-space:pre-line;">${escapeFinancialHtml(data.assumptions)}</p>` : ""}
      <div style="display:flex;justify-content:space-between;margin-top:60px;"><span>Prepared from information provided by the user</span><span>Applicant / Authorised Signatory</span></div>
    </div>`;
  };

  const generateMarkdown = (data: any) => `# ${definition.documentTitle}\n\n${definition.complianceNotice}\n\nEntity: ${data.entityName || ""}`;
  const buildFinancialDraft = (data: any, existingId?: string | null): FinancialDocumentDraft => {
    const now = new Date().toISOString();
    const values = data.values || defaultValues.values;
    const summary = definition.summary(values);
    const closingCash = summary.find((item) => item.label === "Closing cash and bank balance")?.values;
    const totalDebt = values.totalDebt || values.loanDrawdowns;
    return {
      version: 1,
      id: existingId || crypto.randomUUID(),
      kind: definition.id,
      sourceDocumentId: data.sourceDocumentId || null,
      parties: {},
      items: [],
      taxTreatment: {},
      content: {
        ...data,
        closingCash,
        totalDebt,
      },
      createdAt: now,
      updatedAt: now,
    };
  };

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
    applyFinancialDraft: (draft) => {
      const imported = { ...defaultValues, ...(draft.content || {}), sourceDocumentId: draft.sourceDocumentId } as any;
      if (definition.id === "projected-balance-sheet") {
        const closingCash = Array.isArray(draft.content.closingCash) ? draft.content.closingCash.slice(-3) : null;
        const totalDebt = Array.isArray(draft.content.totalDebt) ? draft.content.totalDebt.slice(-3) : null;
        imported.values = {
          ...defaultValues.values,
          ...(imported.values || {}),
          ...(closingCash ? { cash: closingCash } : {}),
          ...(totalDebt ? { securedLoans: totalDebt } : {}),
        };
      }
      return imported;
    },
    exportBlockReason: (data) => definition.exportBlockReason?.(data.values || defaultValues.values) || null,
    seo: definition.seo,
    FormComponent,
  };
}

export const statementValueAt = valueAt;
export { calculateFinancialRatios };
