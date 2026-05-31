import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileText,
  IndianRupee,
  Loader2,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  MyeCard,
  SectionHeading,
  StatusBadge,
  formatInr,
} from "@/components/platform/compliance-ui";
import { Layout } from "@/components/admin/Layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import {
  ITR_REVIEW_STATUSES,
  buildItrReviewPacket,
  calculateItrTotalDeductions,
  calculateItrTotalIncome,
  calculateItrTotalTaxPaid,
  getItrDocumentChecklist,
  normalizeItrDraft,
  recommendItrForm,
  type ItrFilingDraft,
  type ItrFormRecommendation,
  type ItrReviewPacket,
} from "@shared/itr-filing";

export const ITR_FILING_STEPS = [
  {
    id: "profile",
    title: "Profile",
    description: "Confirm taxpayer type, residential status, PAN, return kind, and refund-bank basics.",
  },
  {
    id: "income-sources",
    title: "Income Sources",
    description: "Capture source flags that decide whether ITR-1, ITR-2, ITR-3, or ITR-4 applies.",
  },
  {
    id: "documents",
    title: "Documents",
    description: "Link Form 16, AIS, 26AS, bank, deduction, capital-gain, business, and foreign-asset records.",
  },
  {
    id: "income-details",
    title: "Income Details",
    description: "Enter salary, house property, other sources, capital gains, business, profession, and foreign income.",
  },
  {
    id: "deductions",
    title: "Deductions",
    description: "Capture old-regime deductions, Form 10-IEA state, and claims that need supporting proof.",
  },
  {
    id: "tax-paid",
    title: "AIS, 26AS & Tax Paid",
    description: "Match TDS, TCS, advance tax, self-assessment tax, and form-selection risk flags.",
  },
  {
    id: "form-selection",
    title: "Automatic Form Selection",
    description: "Review the form chosen by MyeCA, reasons, blockers, schedules, and JSON export availability.",
  },
  {
    id: "ca-review",
    title: "CA Review Packet",
    description: "Generate the CA handoff packet and submit the draft for expert review before filing.",
  },
  {
    id: "e-verify",
    title: "E-Verify & Track",
    description: "Record post-filing acknowledgement, e-verification, refund, demand, and tracking state.",
  },
] as const;

export const WORKSPACE_ITR_REVIEW_STATUSES = ITR_REVIEW_STATUSES;

export const ITR_FILING_LAYOUT = {
  usesDedicatedLeftRail: false,
  usesAuthenticatedWorkspaceShell: true,
  mobileActionBarOffset: "above-user-bottom-nav",
  tone: "professional",
} as const;

type TaxReturnRecord = {
  id: string;
  profileId: string | null;
  assessmentYear: string;
  itrType: string;
  status: string;
  reviewStatus: string;
  formData: ItrFilingDraft;
  recommendation?: ItrFormRecommendation;
  reviewPacket?: ItrReviewPacket | null;
  updatedAt?: string;
};

type TaxReturnsResponse = {
  taxReturns: TaxReturnRecord[];
};

type VaultDocument = {
  id: string;
  name: string;
  originalName?: string | null;
  category?: string | null;
  taxReturnId?: string | null;
};

type DocumentsResponse = {
  documents: VaultDocument[];
};

const STARTER_DRAFT = normalizeItrDraft({
  assessmentYear: "2026-27",
  taxpayer: {
    type: "individual",
    residentialStatus: "resident",
  },
});

const RISK_FLAGS: Array<{
  key: keyof ItrFilingDraft["flags"];
  label: string;
  helper: string;
}> = [
  { key: "directorInCompany", label: "Director in company", helper: "Usually moves the case beyond ITR-1/4." },
  { key: "heldUnlistedEquity", label: "Unlisted equity held", helper: "Needs enhanced disclosure review." },
  { key: "hasForeignAssets", label: "Foreign assets", helper: "Triggers Schedule FA review." },
  { key: "hasForeignSigningAuthority", label: "Foreign signing authority", helper: "Requires foreign disclosure checks." },
  { key: "hasDeferredEsopTax", label: "Deferred ESOP tax", helper: "Needs CA review and schedule mapping." },
  { key: "hasBroughtForwardLoss", label: "Brought-forward loss", helper: "Moves into detailed set-off review." },
  { key: "hasCarryForwardLoss", label: "Carry-forward loss", helper: "Needs loss schedule handling." },
  { key: "section194NCashWithdrawal", label: "Section 194N TDS", helper: "Blocks simple forms." },
  { key: "governedByPortugueseCivilCode", label: "Portuguese Civil Code", helper: "Needs separate review path." },
];

function numberValue(value: unknown) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function recommendationStatus(recommendation: ItrFormRecommendation) {
  if (recommendation.form === "CA_SCOPE_REVIEW") return "action_required";
  if (recommendation.blockers.length > 0) return "ca_review";
  return "filed";
}

export default function ITRFilingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeReturnId, setActiveReturnId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ItrFilingDraft>(STARTER_DRAFT);
  const [pendingSave, setPendingSave] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [exportPreview, setExportPreview] = useState<string>("");
  const progress = ((currentStep + 1) / ITR_FILING_STEPS.length) * 100;

  const taxReturnsQuery = useQuery<TaxReturnsResponse>({
    queryKey: ["/api/tax-returns"],
    queryFn: async () => {
      const response = await apiRequest("/api/tax-returns");
      return response.json();
    },
  });

  const taxReturns = taxReturnsQuery.data?.taxReturns ?? [];
  const activeReturn = taxReturns.find((item) => item.id === activeReturnId) ?? taxReturns[0] ?? null;
  const documentsQuery = useQuery<DocumentsResponse>({
    queryKey: ["/api/documents"],
    enabled: Boolean(activeReturn),
    queryFn: async () => {
      const response = await apiRequest("/api/documents");
      return response.json();
    },
  });
  const vaultDocuments = documentsQuery.data?.documents ?? [];
  const recommendation = useMemo(() => recommendItrForm(draft), [draft]);
  const documentChecklist = useMemo(() => getItrDocumentChecklist(draft), [draft]);
  const reviewPacket = useMemo(
    () => buildItrReviewPacket(draft, activeReturn?.id ?? "unsaved-draft"),
    [draft, activeReturn?.id],
  );
  const totalIncome = calculateItrTotalIncome(draft);
  const totalDeductions = calculateItrTotalDeductions(draft);
  const totalTaxPaid = calculateItrTotalTaxPaid(draft);
  const currentStepId = ITR_FILING_STEPS[currentStep].id;

  useEffect(() => {
    if (!activeReturnId && taxReturns[0]?.id) {
      setActiveReturnId(taxReturns[0].id);
    }
  }, [activeReturnId, taxReturns]);

  useEffect(() => {
    if (!activeReturn) return;
    setDraft(normalizeItrDraft(activeReturn.formData));
    setPendingSave(false);
    setExportPreview("");
  }, [activeReturn?.id]);

  useEffect(() => {
    if (!activeReturnId || !pendingSave) return;

    const timer = window.setTimeout(async () => {
      await apiRequest(`/api/tax-returns/${activeReturnId}`, {
        method: "PATCH",
        body: JSON.stringify({ draft }),
      });
      setLastSavedAt(new Date());
      setPendingSave(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [activeReturnId, draft, pendingSave]);

  const createDraftMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/tax-returns", {
        method: "POST",
        body: JSON.stringify({
          assessmentYear: STARTER_DRAFT.assessmentYear,
          draft: STARTER_DRAFT,
        }),
      });
      return response.json() as Promise<{ taxReturn: TaxReturnRecord }>;
    },
    onSuccess: (data) => {
      setActiveReturnId(data.taxReturn.id);
      queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!activeReturnId) throw new Error("Save a draft before submitting for review.");
      const response = await apiRequest(`/api/tax-returns/${activeReturnId}/submit-review`, {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
    },
  });

  const linkDocumentMutation = useMutation({
    mutationFn: async ({ checklistItemId, documentId }: { checklistItemId: string; documentId: string }) => {
      if (!activeReturnId) throw new Error("Save a draft before linking documents.");
      const response = await apiRequest(`/api/tax-returns/${activeReturnId}/documents`, {
        method: "POST",
        body: JSON.stringify({ checklistItemId, documentId }),
      });
      return response.json() as Promise<{ taxReturn: TaxReturnRecord }>;
    },
    onSuccess: (data) => {
      setDraft(normalizeItrDraft(data.taxReturn.formData));
      queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });

  const updateDraft = (updater: (current: ItrFilingDraft) => ItrFilingDraft) => {
    setDraft((current) => normalizeItrDraft(updater(current)));
    setPendingSave(Boolean(activeReturnId));
  };

  const updateTaxpayer = (patch: Partial<ItrFilingDraft["taxpayer"]>) => {
    updateDraft((current) => ({ ...current, taxpayer: { ...current.taxpayer, ...patch } }));
  };

  const updateFiling = (patch: Partial<ItrFilingDraft["filing"]>) => {
    updateDraft((current) => ({ ...current, filing: { ...current.filing, ...patch } }));
  };

  const updateIncome = (patch: Partial<ItrFilingDraft["income"]>) => {
    updateDraft((current) => ({ ...current, income: { ...current.income, ...patch } }));
  };

  const updateDeductions = (patch: Partial<ItrFilingDraft["deductions"]>) => {
    updateDraft((current) => ({ ...current, deductions: { ...current.deductions, ...patch } }));
  };

  const updateTaxPaid = (patch: Partial<ItrFilingDraft["taxPaid"]>) => {
    updateDraft((current) => ({ ...current, taxPaid: { ...current.taxPaid, ...patch } }));
  };

  const updateFlag = (key: keyof ItrFilingDraft["flags"], value: boolean) => {
    updateDraft((current) => ({ ...current, flags: { ...current.flags, [key]: value } }));
  };

  const updateDocument = (id: string, value: string) => {
    updateDraft((current) => ({
      ...current,
      documents: {
        ...current.documents,
        [id]: value,
      },
    }));
  };

  const runExportCheck = async () => {
    if (!activeReturnId) return;
    const response = await apiRequest(`/api/tax-returns/${activeReturnId}/export-json`);
    const json = await response.json();
    setExportPreview(JSON.stringify(json, null, 2));
  };

  const nextStep = () => setCurrentStep((step) => Math.min(step + 1, ITR_FILING_STEPS.length - 1));
  const previousStep = () => setCurrentStep((step) => Math.max(step - 1, 0));
  const linkedVaultDocument = (checklistItemId: string) =>
    vaultDocuments.find((document) => document.id === draft.documents[checklistItemId]) ?? null;

  if (taxReturnsQuery.isLoading) {
    return (
      <Layout title="MY ITR">
        <MyeCard className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </MyeCard>
      </Layout>
    );
  }

  if (!activeReturn) {
    return (
      <Layout title="MY ITR">
        <div className="space-y-6">
          <MyeCard className="p-6">
            <SectionHeading
              eyebrow="MY ITR"
              title="Start a new AY 2026-27 filing draft"
              description="Create a secure draft, answer the guided questions, and MyeCA will select the correct ITR form before CA handoff."
            />
            <Button
              className="mt-6 bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => createDraftMutation.mutate()}
              disabled={createDraftMutation.isPending}
            >
              {createDraftMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Start from scratch
            </Button>
          </MyeCard>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="MY ITR">
      <div className="space-y-6 pb-28 md:pb-0">
        <MyeCard className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="type-meta font-black uppercase text-[#0050b5]">Persisted filing workspace</p>
              <h1 className="type-page-title mt-2 font-black text-slate-950">Complete ITR filing draft</h1>
              <p className="type-body mt-3 max-w-3xl text-slate-600">
                AY 2026-27 draft-to-CA-review flow with automatic ITR-1, ITR-2, ITR-3, or ITR-4 selection.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 md:min-w-[360px]">
              <StatusBadge status={activeReturn.status === "draft" ? "in_progress" : "ca_review"} label={activeReturn.status.replace(/_/g, " ")} />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 type-support text-slate-700">
                <Save className="mr-2 inline h-4 w-4" />
                {pendingSave ? "Saving..." : lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString()}` : "Saved in tax_returns"}
              </div>
            </div>
          </div>
        </MyeCard>

        <div className="grid gap-4 xl:grid-cols-[0.72fr_0.28fr]">
          <MyeCard className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="type-meta font-black uppercase text-[#0050b5]">MY ITR progress</p>
                <h2 className="mt-2 type-section-title font-black text-slate-950">
                  Step {currentStep + 1} of {ITR_FILING_STEPS.length}
                </h2>
              </div>
              <StatusBadge status={recommendationStatus(recommendation) as any} label={recommendation.form.replace(/_/g, " ")} />
            </div>
            <Progress value={progress} className="mt-4 h-2" />
            <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:grid md:grid-cols-3 md:px-0">
              {ITR_FILING_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  aria-current={index === currentStep ? "step" : undefined}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "flex w-[220px] shrink-0 items-start gap-3 rounded-2xl border p-3 text-left transition md:w-full",
                    index === currentStep && "border-blue-200 bg-blue-50 text-slate-950 shadow-sm",
                    index < currentStep && "border-emerald-200 bg-emerald-50 text-emerald-900",
                    index > currentStep && "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-[#315efb]">
                    {index < currentStep ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </span>
                  <span>
                    <span className="block font-black">{step.title}</span>
                    <span className="mt-1 hidden type-meta opacity-80 lg:block">{step.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </MyeCard>

          <MyeCard className="p-5">
            <p className="type-meta font-black uppercase text-slate-500">Current recommendation</p>
            <div className="mt-3 flex items-center gap-3">
              <FileCheck2 className="h-8 w-8 text-blue-700" />
              <div>
                <p className="text-3xl font-black text-slate-950">{recommendation.form.replace(/_/g, " ")}</p>
                <p className="type-support text-slate-600">
                  {recommendation.exportAvailable ? "Draft JSON export available" : recommendation.exportStatus.reason}
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="type-meta text-slate-500">Income</p>
                <p className="font-black text-slate-950">{formatInr(totalIncome)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="type-meta text-slate-500">Deductions</p>
                <p className="font-black text-slate-950">{formatInr(totalDeductions)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="type-meta text-slate-500">Tax paid</p>
                <p className="font-black text-slate-950">{formatInr(totalTaxPaid)}</p>
              </div>
            </div>
          </MyeCard>
        </div>

        <MyeCard>
          <SectionHeading
            eyebrow="Current step"
            title={ITR_FILING_STEPS[currentStep].title}
            description={ITR_FILING_STEPS[currentStep].description}
          />

          {currentStepId === "profile" && (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <Label>Taxpayer type</Label>
                <Select value={draft.taxpayer.type} onValueChange={(value) => updateTaxpayer({ type: value as any })}>
                  <SelectTrigger className="mt-2 h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["individual", "huf", "firm", "llp", "company", "trust", "aop", "boi", "other"].map((type) => (
                      <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Residential status</Label>
                <Select value={draft.taxpayer.residentialStatus} onValueChange={(value) => updateTaxpayer({ residentialStatus: value as any })}>
                  <SelectTrigger className="mt-2 h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resident">Resident</SelectItem>
                    <SelectItem value="rnor">RNOR</SelectItem>
                    <SelectItem value="nri">NRI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <TextInput label="PAN" value={draft.taxpayer.pan} onChange={(value) => updateTaxpayer({ pan: value.toUpperCase() })} />
              <TextInput label="First name" value={draft.taxpayer.firstName} onChange={(value) => updateTaxpayer({ firstName: value })} />
              <TextInput label="Last name" value={draft.taxpayer.lastName} onChange={(value) => updateTaxpayer({ lastName: value })} />
              <TextInput label="IFSC" value={draft.taxpayer.ifsc} onChange={(value) => updateTaxpayer({ ifsc: value.toUpperCase() })} />
              <TextInput label="Refund bank account" value={draft.taxpayer.bankAccount} onChange={(value) => updateTaxpayer({ bankAccount: value })} />
              <div>
                <Label>Return kind</Label>
                <Select value={draft.filing.returnKind} onValueChange={(value) => updateFiling({ returnKind: value as any })}>
                  <SelectTrigger className="mt-2 h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original</SelectItem>
                    <SelectItem value="belated">Belated</SelectItem>
                    <SelectItem value="revised">Revised</SelectItem>
                    <SelectItem value="updated">Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStepId === "income-sources" && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["Salary / pension", draft.income.salary + draft.income.pension > 0, "Form 16, pension certificate, employer TAN"],
                ["Capital gains", draft.income.shortTermCapitalGains + draft.income.section112aLtcg + draft.income.otherCapitalGains > 0, "Shares, mutual funds, property, ESOP, VDA"],
                ["Business / profession", draft.income.businessIncome + draft.income.professionalIncome > 0, "Books, presumptive income, invoices"],
                ["Foreign / NRI", draft.income.foreignIncome > 0 || draft.flags.hasForeignAssets, "Schedule FA, FSI, TR, Form 67"],
              ].map(([label, selected, helper]) => (
                <div key={String(label)} className={cn("rounded-2xl border p-5", selected ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50")}>
                  <BadgeCheck className={cn("h-7 w-7", selected ? "text-blue-700" : "text-slate-500")} />
                  <p className="mt-3 font-black text-slate-950">{label}</p>
                  <p className="mt-1 type-support text-slate-600">{helper}</p>
                  <StatusBadge status={selected ? "in_progress" : "not_started"} label={selected ? "Detected" : "Not detected"} className="mt-4" />
                </div>
              ))}
            </div>
          )}

          {currentStepId === "documents" && (
            <div className="mt-6 space-y-5">
              <div className="grid gap-3 md:grid-cols-4">
                {[
                  { label: "Form 16 parser", href: "/form16-parser" },
                  { label: "AIS viewer", href: "/ais-viewer" },
                  { label: "Capital gains import", href: "/capital-gains-import" },
                  { label: "Bank analyzer", href: "/bank-analyzer" },
                ].map((helper) => (
                  <Link key={helper.href} href={helper.href}>
                    <Button variant="outline" className="w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                      {helper.label}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {documentChecklist.map((document) => {
                  const linkedDocument = linkedVaultDocument(document.id);

                  return (
                    <div key={document.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <FileText className="h-6 w-6 text-[#315efb]" />
                          <p className="mt-3 font-black text-slate-950">{document.title}</p>
                          <p className="mt-1 type-support text-slate-600">{document.reason}</p>
                        </div>
                        <StatusBadge
                          status={draft.documents[document.id] ? "filed" : document.required ? "action_required" : "not_started"}
                          label={draft.documents[document.id] ? "Linked" : document.required ? "Required" : "Optional"}
                        />
                      </div>
                      <Select
                        value={linkedDocument?.id ?? "manual"}
                        onValueChange={(value) => {
                          if (value !== "manual") {
                            linkDocumentMutation.mutate({ checklistItemId: document.id, documentId: value });
                          }
                        }}
                        disabled={!vaultDocuments.length || linkDocumentMutation.isPending}
                      >
                        <SelectTrigger className="mt-4 h-11 rounded-lg bg-white">
                          <SelectValue placeholder="Select from document vault" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual reference</SelectItem>
                          {vaultDocuments.map((vaultDocument) => (
                            <SelectItem key={vaultDocument.id} value={vaultDocument.id}>
                              {vaultDocument.name || vaultDocument.originalName || vaultDocument.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="mt-3 h-11 rounded-lg bg-white"
                        placeholder="Document name or vault reference"
                        value={linkedDocument ? linkedDocument.name : draft.documents[document.id] ?? ""}
                        readOnly={Boolean(linkedDocument)}
                        onChange={(event) => updateDocument(document.id, event.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
              <Link href="/documents">
                <Button variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                  Open Document Vault
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {currentStepId === "income-details" && (
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <MoneyInput label="Salary" value={draft.income.salary} onChange={(value) => updateIncome({ salary: value })} />
              <MoneyInput label="Pension" value={draft.income.pension} onChange={(value) => updateIncome({ pension: value })} />
              <MoneyInput label="Other sources" value={draft.income.otherSources} onChange={(value) => updateIncome({ otherSources: value })} />
              <NumberInput label="House properties" value={draft.income.houseProperties} onChange={(value) => updateIncome({ houseProperties: Math.max(0, Math.round(value)) })} />
              <MoneyInput label="House property income" value={draft.income.housePropertyIncome} onChange={(value) => updateIncome({ housePropertyIncome: value })} />
              <MoneyInput label="Agricultural income" value={draft.income.agriculturalIncome} onChange={(value) => updateIncome({ agriculturalIncome: value })} />
              <MoneyInput label="STCG" value={draft.income.shortTermCapitalGains} onChange={(value) => updateIncome({ shortTermCapitalGains: value })} />
              <MoneyInput label="Section 112A LTCG" value={draft.income.section112aLtcg} onChange={(value) => updateIncome({ section112aLtcg: value })} />
              <MoneyInput label="Other capital gains" value={draft.income.otherCapitalGains} onChange={(value) => updateIncome({ otherCapitalGains: value })} />
              <MoneyInput label="Business income" value={draft.income.businessIncome} onChange={(value) => updateIncome({ businessIncome: value })} />
              <MoneyInput label="Professional income" value={draft.income.professionalIncome} onChange={(value) => updateIncome({ professionalIncome: value })} />
              <MoneyInput label="Foreign income" value={draft.income.foreignIncome} onChange={(value) => updateIncome({ foreignIncome: value })} />
              <div>
                <Label>Presumptive scheme</Label>
                <Select value={draft.income.presumptiveScheme} onValueChange={(value) => updateIncome({ presumptiveScheme: value as any })}>
                  <SelectTrigger className="mt-2 h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="44AD">44AD</SelectItem>
                    <SelectItem value="44ADA">44ADA</SelectItem>
                    <SelectItem value="44AE">44AE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <MoneyInput label="Special-rate income" value={draft.income.winningsOrSpecialRateIncome} onChange={(value) => updateIncome({ winningsOrSpecialRateIncome: value })} />
            </div>
          )}

          {currentStepId === "deductions" && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-5 md:grid-cols-3">
                <MoneyInput label="Section 80C" value={draft.deductions.section80C} onChange={(value) => updateDeductions({ section80C: value })} />
                <MoneyInput label="Section 80D" value={draft.deductions.section80D} onChange={(value) => updateDeductions({ section80D: value })} />
                <MoneyInput label="Section 80G" value={draft.deductions.section80G} onChange={(value) => updateDeductions({ section80G: value })} />
                <MoneyInput label="Section 80E" value={draft.deductions.section80E} onChange={(value) => updateDeductions({ section80E: value })} />
                <MoneyInput label="NPS" value={draft.deductions.nps} onChange={(value) => updateDeductions({ nps: value })} />
                <MoneyInput label="Home loan interest" value={draft.deductions.homeLoanInterest} onChange={(value) => updateDeductions({ homeLoanInterest: value })} />
                <MoneyInput label="Other Chapter VIA" value={draft.deductions.otherChapterVia} onChange={(value) => updateDeductions({ otherChapterVia: value })} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ToggleRow
                  title="Old regime requested"
                  description="Stores the preference for CA review and Form 10-IEA checks."
                  checked={draft.filing.wantsOldRegime}
                  onCheckedChange={(checked) => updateFiling({ wantsOldRegime: checked })}
                />
                <ToggleRow
                  title="Form 10-IEA filed"
                  description="Required in applicable business/profession old-regime cases."
                  checked={draft.filing.filedForm10IEA}
                  onCheckedChange={(checked) => updateFiling({ filedForm10IEA: checked })}
                />
              </div>
            </div>
          )}

          {currentStepId === "tax-paid" && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-5 md:grid-cols-4">
                <MoneyInput label="TDS" value={draft.taxPaid.tds} onChange={(value) => updateTaxPaid({ tds: value })} />
                <MoneyInput label="TCS" value={draft.taxPaid.tcs} onChange={(value) => updateTaxPaid({ tcs: value })} />
                <MoneyInput label="Advance tax" value={draft.taxPaid.advanceTax} onChange={(value) => updateTaxPaid({ advanceTax: value })} />
                <MoneyInput label="Self-assessment tax" value={draft.taxPaid.selfAssessmentTax} onChange={(value) => updateTaxPaid({ selfAssessmentTax: value })} />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {RISK_FLAGS.map((flag) => (
                  <ToggleRow
                    key={flag.key}
                    title={flag.label}
                    description={flag.helper}
                    checked={Boolean(draft.flags[flag.key])}
                    onCheckedChange={(checked) => updateFlag(flag.key, checked)}
                  />
                ))}
              </div>
            </div>
          )}

          {currentStepId === "form-selection" && (
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[28px] border border-blue-200 bg-blue-50 p-6">
                <FileCheck2 className="h-9 w-9 text-blue-800" />
                <p className="mt-4 type-meta font-black uppercase tracking-widest text-blue-700">Recommended form</p>
                <h3 className="mt-2 text-5xl font-black text-slate-950">{recommendation.form.replace(/_/g, " ")}</h3>
                <p className="mt-3 type-support text-blue-950">{recommendation.exportStatus.reason}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {recommendation.requiredSchedules.map((schedule) => (
                    <span key={schedule} className="rounded-full bg-white px-3 py-1 type-meta font-bold text-slate-700">{schedule}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <ReasonList title="Reasons" items={recommendation.reasons.length ? recommendation.reasons : ["MyeCA needs more inputs to explain the recommendation."]} tone="emerald" />
                <ReasonList title="Blockers" items={recommendation.blockers.length ? recommendation.blockers : ["No blockers for the selected form based on current inputs."]} tone="amber" />
                <Button variant="outline" onClick={runExportCheck} className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                  <Download className="h-4 w-4" />
                  Check JSON Export
                </Button>
                {exportPreview && (
                  <Textarea value={exportPreview} readOnly className="min-h-[180px] font-mono text-xs" />
                )}
              </div>
            </div>
          )}

          {currentStepId === "ca-review" && (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <ShieldCheck className="h-8 w-8 text-emerald-800" />
                <h3 className="mt-4 type-section-title font-black text-slate-950">CA review packet</h3>
                <p className="mt-2 text-slate-600">
                  The packet stores the selected form, schedules, blockers, checklist, income summary, deductions, and tax-paid totals for expert review.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <StatusBadge status="in_progress" label={`${reviewPacket.documentChecklist.length} document checks`} />
                  <StatusBadge status={recommendation.exportAvailable ? "filed" : "action_required"} label={recommendation.exportAvailable ? "Export available" : "Packet fallback"} />
                  <StatusBadge status="ca_review" label="CA handoff" />
                  <StatusBadge status={activeReturn.status === "ready_for_review" ? "filed" : "not_started"} label={activeReturn.status === "ready_for_review" ? "Submitted" : "Not submitted"} />
                </div>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-white p-6">
                <IndianRupee className="h-8 w-8 text-emerald-700" />
                <p className="mt-4 type-support font-black uppercase tracking-widest text-slate-500">Packet summary</p>
                <div className="mt-4 space-y-3">
                  <SummaryLine label="Total income" value={formatInr(reviewPacket.summary.totalIncome)} />
                  <SummaryLine label="Deductions" value={formatInr(reviewPacket.summary.totalDeductions)} />
                  <SummaryLine label="Tax paid" value={formatInr(reviewPacket.summary.totalTaxPaid)} />
                  <SummaryLine label="Recommended form" value={reviewPacket.recommendation.form.replace(/_/g, " ")} />
                </div>
                <Button
                  type="button"
                  onClick={() => submitReviewMutation.mutate()}
                  disabled={submitReviewMutation.isPending}
                  className="mt-6 w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  {submitReviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
                  Submit for CA Review
                </Button>
              </div>
            </div>
          )}

          {currentStepId === "e-verify" && (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-800" />
                <h3 className="mt-4 type-section-title font-black text-slate-950">After official filing, e-verify within 30 days</h3>
                <p className="mt-2 text-slate-600">
                  The final acknowledgement is recorded only after Income Tax portal filing. E-verification remains a post-filing action.
                </p>
                <div className="mt-5 grid gap-3">
                  {["Aadhaar OTP", "Net banking", "Bank account EVC", "Demat account EVC", "DSC / ITR-V if applicable"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-4">
                      <CalendarCheck className="h-5 w-5 text-[#315efb]" />
                      <span className="font-semibold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-white p-6">
                <Banknote className="h-8 w-8 text-[#315efb]" />
                <p className="mt-4 type-section-title font-black text-slate-950">Track acknowledgement and refund</p>
                <p className="mt-2 text-slate-600">
                  Keep acknowledgement number, e-verification status, processing status, refund, demand, and intimation notes visible from the tracker.
                </p>
                <Link href="/itr/status-tracker">
                  <Button variant="outline" className="mt-6 w-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                    Open ITR Tracker
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </MyeCard>

        <div className="fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_16px_50px_-35px_rgba(15,23,42,0.6)] backdrop-blur md:sticky md:inset-x-auto md:bottom-auto md:z-20 md:pr-48 lg:bottom-4">
          <button
            type="button"
            onClick={previousStep}
            disabled={currentStep === 0}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            type="button"
            onClick={nextStep}
            disabled={currentStep === ITR_FILING_STEPS.length - 1}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Layout>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 rounded-xl" />
    </div>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(numberValue(event.target.value))}
        className="mt-2 h-12 rounded-xl"
      />
    </div>
  );
}

function MoneyInput(props: { label: string; value: number; onChange: (value: number) => void }) {
  return <NumberInput {...props} />;
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-h-[96px] items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="font-black text-slate-950">{title}</p>
        <p className="mt-1 type-support text-slate-600">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function ReasonList({ title, items, tone }: { title: string; items: string[]; tone: "emerald" | "amber" }) {
  const color = tone === "emerald"
    ? "border-emerald-200 bg-emerald-50 text-emerald-950"
    : "border-amber-200 bg-amber-50 text-amber-950";

  return (
    <div className={cn("rounded-2xl border p-5", color)}>
      <p className="font-black">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 rounded-xl bg-white/70 p-3 type-support">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="type-support font-semibold text-slate-600">{label}</span>
      <span className="font-black text-slate-950">{value}</span>
    </div>
  );
}
