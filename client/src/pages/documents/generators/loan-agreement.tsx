import { z } from "zod";
import { HandCoins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validationPatterns } from "@shared/security-validation";
import type { DocumentGeneratorConfig } from "./types";
import {
  INDIAN_STATES,
  escapeFinancialHtml,
  formatFinancialDate,
  formatIndianCurrency,
  indianAmountInWords,
  type FinancialDocumentDraft,
} from "../financial";

const partySchema = z.object({
  name: z.string().trim().min(2).max(160),
  fatherOrEntityName: z.string().trim().min(2).max(160),
  address: z.string().trim().min(5).max(700),
  pincode: z.string().trim().refine(
    (value) => !value || validationPatterns.PINCODE.test(value),
    "Invalid Indian pincode",
  ),
  pan: z.string().trim().transform((value) => value.toUpperCase()).refine(
    (value) => !value || validationPatterns.PAN.test(value),
    "Invalid PAN",
  ),
});

const schema = z.object({
  agreementType: z.enum(["Personal Loan Agreement", "Business Loan Agreement"]),
  agreementDate: z.string().min(1),
  executionStateCode: z.string().regex(/^[0-9]{2}$/, "Execution state is required"),
  lender: partySchema,
  borrower: partySchema,
  principal: z.number().positive("Principal must be greater than zero"),
  disbursementMethod: z.string().min(2).max(160),
  interestRate: z.number().min(0).max(50),
  repaymentFrequency: z.enum(["Monthly", "Quarterly", "Annually", "Single repayment"]),
  instalmentCount: z.number().int().min(1).max(360),
  firstInstalmentDate: z.string().min(1),
  prepaymentTerms: z.string().min(3).max(1000),
  defaultTerms: z.string().min(3).max(1500),
  securityDetails: z.string().max(1500).optional(),
  guarantorDetails: z.string().max(1500).optional(),
  jurisdiction: z.string().min(2).max(160),
  witnessOne: z.string().min(2).max(160),
  witnessTwo: z.string().min(2).max(160),
});

const today = new Date().toISOString().split("T")[0];
const defaultValues = {
  agreementType: "Personal Loan Agreement",
  agreementDate: today,
  executionStateCode: "27",
  lender: { name: "", fatherOrEntityName: "", address: "", pincode: "", pan: "" },
  borrower: { name: "", fatherOrEntityName: "", address: "", pincode: "", pan: "" },
  principal: 100000,
  disbursementMethod: "Bank transfer",
  interestRate: 10,
  repaymentFrequency: "Monthly",
  instalmentCount: 12,
  firstInstalmentDate: today,
  prepaymentTerms: "The borrower may prepay the outstanding amount without penalty after giving written notice.",
  defaultTerms: "A missed instalment remains payable with reasonable recovery costs, subject to applicable law and written notice.",
  securityDetails: "Unsecured",
  guarantorDetails: "",
  jurisdiction: "Mumbai, Maharashtra",
  witnessOne: "",
  witnessTwo: "",
};

function StateSelect({ register }: { register: any }) {
  return (
    <select {...register("executionStateCode")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
      {INDIAN_STATES.map(([code, state]) => <option key={code} value={code}>{code} - {state}</option>)}
    </select>
  );
}

function PartyForm({ register, prefix, label }: { register: any; prefix: string; label: string }) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <h3 className="font-bold">{label}</h3>
        <div><Label>Name</Label><Input {...register(`${prefix}.name`)} /></div>
        <div><Label>Father's Name / Entity Name</Label><Input {...register(`${prefix}.fatherOrEntityName`)} /></div>
        <div><Label>Address</Label><Textarea {...register(`${prefix}.address`)} rows={3} /></div>
        <div><Label>Pincode</Label><Input inputMode="numeric" {...register(`${prefix}.pincode`)} placeholder="400001" /></div>
        <div><Label>PAN, if relevant</Label><Input {...register(`${prefix}.pan`)} /></div>
      </CardContent>
    </Card>
  );
}

function calculateSchedule(data: any) {
  const principal = Number(data.principal) || 0;
  const count = Math.max(1, Number(data.instalmentCount) || 1);
  const annualRate = Math.max(0, Number(data.interestRate) || 0) / 100;
  const periodsPerYear =
    data.repaymentFrequency === "Monthly" ? 12 :
      data.repaymentFrequency === "Quarterly" ? 4 :
        data.repaymentFrequency === "Annually" ? 1 : 1;
  const periodRate = annualRate / periodsPerYear;
  const instalment =
    periodRate > 0
      ? (principal * periodRate * (1 + periodRate) ** count) / ((1 + periodRate) ** count - 1)
      : principal / count;
  let balance = principal;

  return Array.from({ length: count }, (_, index) => {
    const interest = balance * periodRate;
    const principalPaid = Math.min(balance, instalment - interest);
    balance = Math.max(0, balance - principalPaid);
    return {
      number: index + 1,
      instalment,
      principal: principalPaid,
      interest,
      balance,
    };
  });
}

const FormComponent = ({ register, watch }: any) => {
  const schedule = calculateSchedule(watch());
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
        Legal draft only. Stamp duty, registration, enforceability, security creation, and lender requirements vary by state and circumstances.
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Agreement Type</Label>
          <select {...register("agreementType")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option>Personal Loan Agreement</option><option>Business Loan Agreement</option>
          </select>
        </div>
        <div><Label>Agreement Date</Label><Input type="date" {...register("agreementDate")} /></div>
        <div><Label>Execution State / UT</Label><StateSelect register={register} /></div>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <PartyForm register={register} prefix="lender" label="Lender" />
        <PartyForm register={register} prefix="borrower" label="Borrower" />
      </div>
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <div><Label>Principal (INR)</Label><Input type="number" {...register("principal", { valueAsNumber: true })} /></div>
          <div><Label>Annual Interest (%)</Label><Input type="number" step="0.01" {...register("interestRate", { valueAsNumber: true })} /></div>
          <div>
            <Label>Repayment Frequency</Label>
            <select {...register("repaymentFrequency")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {["Monthly", "Quarterly", "Annually", "Single repayment"].map((value) => <option key={value}>{value}</option>)}
            </select>
          </div>
          <div><Label>Number of Instalments</Label><Input type="number" {...register("instalmentCount", { valueAsNumber: true })} /></div>
          <div><Label>First Instalment Date</Label><Input type="date" {...register("firstInstalmentDate")} /></div>
          <div><Label>Disbursement Method</Label><Input {...register("disbursementMethod")} /></div>
          <div className="sm:col-span-2 lg:col-span-3"><Label>Prepayment Terms</Label><Textarea {...register("prepaymentTerms")} rows={3} /></div>
          <div className="sm:col-span-2 lg:col-span-3"><Label>Default / Late Payment Terms</Label><Textarea {...register("defaultTerms")} rows={3} /></div>
          <div className="sm:col-span-2"><Label>Security Details</Label><Textarea {...register("securityDetails")} rows={3} /></div>
          <div><Label>Guarantor Details</Label><Textarea {...register("guarantorDetails")} rows={3} /></div>
          <div><Label>Jurisdiction</Label><Input {...register("jurisdiction")} /></div>
          <div><Label>Witness One</Label><Input {...register("witnessOne")} /></div>
          <div><Label>Witness Two</Label><Input {...register("witnessTwo")} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-3 font-bold">Indicative Repayment Schedule</h3>
          <p className="text-sm text-slate-600">
            {schedule.length} instalment(s), first instalment approximately {formatIndianCurrency(schedule[0]?.instalment || 0)}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const generateHTML = (data: any) => {
  const schedule = calculateSchedule(data);
  const state = INDIAN_STATES.find(([code]) => code === data.executionStateCode)?.[1] || data.executionStateCode;
  const scheduleRows = schedule.map((row) => `<tr><td style="border:1px solid #999;padding:5px;">${row.number}</td><td style="border:1px solid #999;padding:5px;text-align:right;">${formatIndianCurrency(row.instalment)}</td><td style="border:1px solid #999;padding:5px;text-align:right;">${formatIndianCurrency(row.principal)}</td><td style="border:1px solid #999;padding:5px;text-align:right;">${formatIndianCurrency(row.interest)}</td><td style="border:1px solid #999;padding:5px;text-align:right;">${formatIndianCurrency(row.balance)}</td></tr>`).join("");
  const party = (label: string, value: any) => `<p><strong>${label}:</strong> ${escapeFinancialHtml(value?.name)}, ${escapeFinancialHtml(value?.fatherOrEntityName)}, residing / situated at ${escapeFinancialHtml(value?.address)}${value?.pincode ? `, pincode ${escapeFinancialHtml(value.pincode)}` : ""}${value?.pan ? `, PAN ${escapeFinancialHtml(value.pan)}` : ""}.</p>`;

  return `<div style="max-width:800px;margin:0 auto;font-family:'Times New Roman',serif;font-size:15px;line-height:1.7;color:#111;">
    <h1 style="text-align:center;text-decoration:underline;">${escapeFinancialHtml(data.agreementType || "LOAN AGREEMENT")}</h1>
    <p style="border:1px solid #d97706;background:#fffbeb;padding:10px;font-family:Arial,sans-serif;font-size:12px;"><strong>Important:</strong> Legal draft only. Stamp duty, registration, enforceability, security creation, and lender-specific requirements vary by state and circumstances.</p>
    <p>This agreement is executed on ${formatFinancialDate(data.agreementDate)} in ${escapeFinancialHtml(state)}.</p>
    ${party("Lender", data.lender)}${party("Borrower", data.borrower)}
    <p>The lender agrees to advance <strong>${formatIndianCurrency(data.principal)}</strong> (${escapeFinancialHtml(indianAmountInWords(data.principal))}) by ${escapeFinancialHtml(data.disbursementMethod)} at an annual interest rate of <strong>${escapeFinancialHtml(data.interestRate)}%</strong>.</p>
    <p>The borrower shall repay the loan in ${escapeFinancialHtml(data.instalmentCount)} ${escapeFinancialHtml(data.repaymentFrequency)} instalment(s), beginning on ${formatFinancialDate(data.firstInstalmentDate)}.</p>
    <h3>Prepayment</h3><p>${escapeFinancialHtml(data.prepaymentTerms)}</p>
    <h3>Default and Late Payment</h3><p>${escapeFinancialHtml(data.defaultTerms)}</p>
    <h3>Security / Guarantor</h3><p>${escapeFinancialHtml(data.securityDetails || "Unsecured")}</p><p>${escapeFinancialHtml(data.guarantorDetails || "No guarantor stated")}</p>
    <h3>Indicative Repayment Schedule</h3>
    <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:11px;"><thead><tr><th style="border:1px solid #999;padding:5px;">#</th><th style="border:1px solid #999;padding:5px;">Instalment</th><th style="border:1px solid #999;padding:5px;">Principal</th><th style="border:1px solid #999;padding:5px;">Interest</th><th style="border:1px solid #999;padding:5px;">Balance</th></tr></thead><tbody>${scheduleRows}</tbody></table>
    <p>Courts at ${escapeFinancialHtml(data.jurisdiction)} shall have jurisdiction, subject to applicable law.</p>
    <div style="display:flex;justify-content:space-between;margin-top:60px;"><div>Lender Signature</div><div>Borrower Signature</div></div>
    <div style="display:flex;justify-content:space-between;margin-top:50px;"><div>Witness: ${escapeFinancialHtml(data.witnessOne)}</div><div>Witness: ${escapeFinancialHtml(data.witnessTwo)}</div></div>
  </div>`;
};

const buildFinancialDraft = (data: any, existingId?: string | null): FinancialDocumentDraft => {
  const now = new Date().toISOString();
  return {
    version: 1,
    id: existingId || crypto.randomUUID(),
    kind: "loan-agreement",
    sourceDocumentId: null,
    parties: {
      lender: { name: data.lender?.name, address: data.lender?.address, pincode: data.lender?.pincode, pan: data.lender?.pan },
      borrower: { name: data.borrower?.name, address: data.borrower?.address, pincode: data.borrower?.pincode, pan: data.borrower?.pan },
    },
    items: [],
    taxTreatment: {},
    content: data,
    createdAt: now,
    updatedAt: now,
  };
};

export const LoanAgreementGenerator: DocumentGeneratorConfig = {
  id: "loan-agreement",
  title: "Personal and Business Loan Agreement",
  description: "Prepare a personal or business loan agreement with an indicative repayment schedule.",
  icon: <HandCoins className="h-5 w-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown: (data) => `# ${data.agreementType || "Loan Agreement"}\n\nPrincipal: ${data.principal || 0}`,
  exportFormats: ["pdf", "html"],
  complianceNotice: "Legal draft only. State stamp duty, registration, enforceability, and lender requirements may apply.",
  relatedLinks: [{ href: "/documents/generator/promissory-note", label: "Prepare a Promissory Note" }],
  buildFinancialDraft,
  applyFinancialDraft: (draft) => ({ ...defaultValues, ...(draft.content || {}) }),
  seo: {
    keywords: ["loan agreement generator India", "personal loan agreement format", "business loan agreement"],
    requiredInputs: ["Lender and borrower details", "Principal and interest", "Repayment terms", "Execution state and witnesses"],
    limitations: ["Stamp duty and registration vary by state.", "This is not lender approval or legal advice."],
    faqs: [
      { question: "Does a loan agreement require stamp duty?", answer: "Requirements vary by state and transaction. Confirm the applicable duty and execution process before signing." },
    ],
  },
  FormComponent,
};
