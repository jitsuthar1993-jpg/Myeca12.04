import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileCheck2,
  FileText,
  IndianRupee,
  Loader2,
  MessageCircle,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MyeCard,
  SectionHeading,
  StatusBadge,
  formatInr,
} from "@/components/platform/compliance-ui";
import { Layout } from "@/components/admin/Layout";
import {
  ChoiceButton,
  FilingSummaryStrip,
  GuidedStepNav,
  IssueList,
  TextInput,
  ToggleRow,
} from "@/features/itr/components/filing/guided-filing-ui";
import { CaAssistStrip } from "@/features/itr/components/CaAssistStrip";
import { CollapsibleFlags } from "@/features/itr/components/filing/CollapsibleFlags";
import { CurrencyInput } from "@/features/itr/components/filing/CurrencyInput";
import { DocumentCaptureCard, type DocumentCaptureStatus } from "@/features/itr/components/filing/DocumentCaptureCard";
import { FilingProgressHeader } from "@/features/itr/components/filing/FilingProgressHeader";
import { AadhaarInput, IfscInput, PanInput } from "@/features/itr/components/filing/identity-inputs";
import { LiabilityChip, LiabilitySheet } from "@/features/itr/components/filing/LiabilityChip";
import { PaneRenderer } from "@/features/itr/components/filing/PaneRenderer";
import { getPanesForStep, type FilingStepId } from "@/features/itr/components/filing/panes";
import { RegimeComparator } from "@/features/itr/components/filing/RegimeComparator";
import { useFilingAutosave } from "@/features/itr/hooks/use-filing-autosave";
import { useMobileKeyboard } from "@/features/itr/hooks/use-mobile-keyboard";
import {
  clearItrStartHandoff,
  readItrStartHandoff,
  type ItrStartHandoffPayload,
} from "@/features/itr/lib/start-selector";
import { captureItrFilingEvent } from "@/features/itr/lib/filing-telemetry";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAuthToken } from "@/lib/authToken";
import { prepareDocumentForUpload } from "@/lib/file_utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { CampaignAttribution } from "@shared/campaign-attribution";
import {
  ITR_REVIEW_STATUSES,
  buildItrReviewPacket,
  buildItrVerificationReport,
  calculateItrTotalDeductions,
  calculateItrTotalIncome,
  calculateItrTotalTaxPaid,
  computeItrTaxLiability,
  getItrDocumentChecklist,
  normalizeItrDraft,
  recommendItrForm,
  validateItrIdentity,
  validateItrPane,
  type ItrFilingDraft,
  type ItrFormRecommendation,
  type ItrIncomeType,
  type ItrReviewPacket,
  type ItrVerificationIssue,
} from "@shared/itr-filing";

export const ITR_FILING_STEPS = [
  {
    id: "identity",
    title: "Identity",
    description: "Capture PAN format, Aadhaar, and refund-bank details.",
  },
  {
    id: "income",
    title: "Income",
    description: "Select income types and enter figures.",
  },
  {
    id: "documents",
    title: "Documents",
    description: "Link required documents.",
  },
  {
    id: "verify",
    title: "Verify",
    description: "Review rule checks, blockers, and missing evidence.",
  },
  {
    id: "compute",
    title: "Compute",
    description: "Compare old/new regime liability and refund or payable.",
  },
  {
    id: "review",
    title: "Review",
    description: "Prepare for CA review.",
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

type CreateDraftInput = {
  draft?: ItrFilingDraft;
  attribution?: CampaignAttribution;
  clearHandoff?: boolean;
};

type DocumentUploadState = {
  status: DocumentCaptureStatus;
  error?: string;
  file?: File;
  documentId?: string;
};

type WhatsAppCaseLink = {
  id: string;
  code: string;
  waLink?: string | null;
  expiresAt?: string;
};

const FILING_HISTORY_KEY = "myecaItrPane";
const FILING_RETURN_PATH_PATTERN = /^\/itr\/filing\/([^/?#]+)\/?$/;

function readFilingHistoryPosition() {
  if (typeof window === "undefined" || !window.location.pathname.startsWith("/itr/filing")) return { step: 0, pane: 0 };
  const marker = window.history.state?.[FILING_HISTORY_KEY] as { step?: number; pane?: number } | undefined;
  return {
    step: typeof marker?.step === "number" ? Math.max(0, Math.min(marker.step, ITR_FILING_STEPS.length - 1)) : 0,
    pane: typeof marker?.pane === "number" ? Math.max(0, marker.pane) : 0,
  };
}

function readReturnIdFromPath() {
  if (typeof window === "undefined") return null;
  const match = window.location.pathname.match(FILING_RETURN_PATH_PATTERN);
  if (!match || match[1] === "new") return null;
  return decodeURIComponent(match[1]);
}

const STARTER_DRAFT = normalizeItrDraft({
  assessmentYear: "2026-27",
  filingOwner: { mode: "self" },
  taxpayer: {
    type: "individual",
    residentialStatus: "resident",
  },
});

const INCOME_TOGGLES = [
  {
    key: "salary",
    title: "Salary or pension",
    description: "Form 16, pension certificate, employer TDS.",
  },
  {
    key: "otherSources",
    title: "Other sources",
    description: "Interest, dividend, family pension, small receipts.",
  },
  {
    key: "houseProperty",
    title: "House property",
    description: "Rent, interest, and property count.",
  },
  {
    key: "capitalGains",
    title: "Capital gains",
    description: "Shares, mutual funds, property, ESOP, VDA.",
  },
  {
    key: "business",
    title: "Business or profession",
    description: "Freelance, consulting, business, presumptive income.",
  },
  {
    key: "foreign",
    title: "Foreign / NRI facts",
    description: "Foreign income, assets, signing authority, Form 67.",
  },
] as const;

const RISK_FLAGS: Array<{
  key: keyof ItrFilingDraft["flags"];
  label: string;
  helper: string;
}> = [
  { key: "directorInCompany", label: "Director in company", helper: "Usually moves the case beyond simple forms." },
  { key: "heldUnlistedEquity", label: "Unlisted equity held", helper: "Needs enhanced disclosure review." },
  { key: "hasForeignAssets", label: "Foreign assets", helper: "Triggers Schedule FA review." },
  { key: "hasForeignSigningAuthority", label: "Foreign signing authority", helper: "Requires foreign disclosure checks." },
  { key: "hasDeferredEsopTax", label: "Deferred ESOP tax", helper: "Needs CA review and schedule mapping." },
  { key: "hasBroughtForwardLoss", label: "Brought-forward loss", helper: "Moves into detailed set-off review." },
  { key: "hasCarryForwardLoss", label: "Carry-forward loss", helper: "Needs loss schedule handling." },
  { key: "section194NCashWithdrawal", label: "Section 194N TDS", helper: "Blocks simple forms." },
  { key: "governedByPortugueseCivilCode", label: "Portuguese Civil Code", helper: "Needs separate review path." },
];

function recommendationStatus(recommendation: ItrFormRecommendation) {
  if (recommendation.form === "CA_SCOPE_REVIEW") return "action_required";
  if (recommendation.blockers.length > 0) return "ca_review";
  return "filed";
}

function documentCountLabel(count: number) {
  return count === 1 ? "1 required document" : `${count} required documents`;
}

function maskDigits(value: string, visible = 4) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "Not entered";
  if (digits.length <= visible) return "X".repeat(digits.length);
  return `${"X".repeat(digits.length - visible)}${digits.slice(-visible)}`;
}

function incomeToggleSelected(draft: ItrFilingDraft, key: (typeof INCOME_TOGGLES)[number]["key"]) {
  return draft.income.selectedTypes.includes(key);
}

function maskPan(value: string) {
  const pan = String(value ?? "").trim().toUpperCase();
  if (pan.length !== 10) return "Not entered";
  return `${pan.slice(0, 5)}\u2022\u2022\u2022\u2022${pan.slice(-1)}`;
}

function maskAadhaar(value: string) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length !== 12) return "Not entered";
  return `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${digits.slice(-4)}`;
}

function maskAccount(value: string) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "Not entered";
  return `${"\u2022".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

function currentLocalDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function incomeTypeHasValues(draft: ItrFilingDraft, key: ItrIncomeType) {
  const hasValue = (...values: number[]) => values.some((value) => value !== 0);
  if (key === "salary") return hasValue(draft.income.salary, draft.income.pension);
  if (key === "otherSources") {
    return hasValue(draft.income.otherSources, draft.income.agriculturalIncome, draft.income.winningsOrSpecialRateIncome);
  }
  if (key === "houseProperty") return draft.income.houseProperties > 0 || hasValue(draft.income.housePropertyIncome);
  if (key === "capitalGains") {
    return hasValue(draft.income.shortTermCapitalGains, draft.income.section112aLtcg, draft.income.otherCapitalGains);
  }
  if (key === "business") {
    return hasValue(draft.income.businessIncome, draft.income.professionalIncome) || draft.income.presumptiveScheme !== "none";
  }
  return hasValue(draft.income.foreignIncome) || draft.flags.hasForeignAssets || draft.flags.hasForeignSigningAuthority;
}

function apiErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return "Please try again. If it still fails, contact support.";
}

export default function ITRFilingPage() {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(() => readFilingHistoryPosition().step);
  const [currentPane, setCurrentPane] = useState(() => readFilingHistoryPosition().pane);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([0]);
  const [activeReturnId, setActiveReturnId] = useState<string | null>(() => readReturnIdFromPath());
  const [draft, setDraft] = useState<ItrFilingDraft>(STARTER_DRAFT);
  const [selectorHandoff, setSelectorHandoff] = useState<ItrStartHandoffPayload | null>(null);
  const [handoffChecked, setHandoffChecked] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [liabilityOpen, setLiabilityOpen] = useState(false);
  const [documentUploadStates, setDocumentUploadStates] = useState<Record<string, DocumentUploadState>>({});
  const [displayedPaneIssues, setDisplayedPaneIssues] = useState<ItrVerificationIssue[]>([]);
  const [whatsappCaseLink, setWhatsappCaseLink] = useState<WhatsAppCaseLink | null>(null);
  const autoCreateHandoffRef = useRef<string | null>(null);
  const restoringPaneBackRef = useRef<number | null>(null);
  const filingStartedAtRef = useRef(typeof performance === "undefined" ? Date.now() : performance.now());
  const paneStartedAtRef = useRef(filingStartedAtRef.current);
  const keyboardOpen = useMobileKeyboard(isMobile);

  const taxReturnsQuery = useQuery<TaxReturnsResponse>({
    queryKey: ["/api/tax-returns"],
    queryFn: async () => {
      const response = await apiRequest("/api/tax-returns");
      return response.json();
    },
  });

  const taxReturns = taxReturnsQuery.data?.taxReturns ?? [];
  const activeReturn = taxReturns.find((item) => item.id === activeReturnId) ?? taxReturns[0] ?? null;
  const reviewSubmitted = activeReturn?.status === "ready_for_review";
  const filingOwnerName = draft.filingOwner.mode === "other"
    ? (draft.filingOwner.displayName || "Family member")
    : "Self";
  const saveDraft = useCallback(async (draftToSave: ItrFilingDraft, { keepalive }: { keepalive: boolean }) => {
    if (!activeReturnId) throw new Error("Save a draft before updating it.");
    try {
      await apiRequest(`/api/tax-returns/${activeReturnId}`, {
        method: "PATCH",
        body: JSON.stringify({ draft: draftToSave }),
        keepalive,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
    } catch (error) {
      throw error;
    }
  }, [activeReturnId, currentStep]);
  const {
    pendingSave,
    saveState,
    saveError,
    lastSavedAt,
    online,
    resetDraft: resetAutosaveDraft,
    markChanged: markAutosaveChanged,
    persistLatestDraft,
    flushLatestDraft,
  } = useFilingAutosave({
    returnId: activeReturnId,
    initialDraft: draft,
    saveDraft,
  });

  const documentsQuery = useQuery<DocumentsResponse>({
    queryKey: ["/api/documents"],
    enabled: Boolean(activeReturn) && currentStep >= 2,
    queryFn: async () => {
      const response = await apiRequest("/api/documents");
      return response.json();
    },
  });

  const vaultDocuments = documentsQuery.data?.documents ?? [];
  const recommendation = useMemo(() => recommendItrForm(draft), [draft]);
  const documentChecklist = useMemo(() => getItrDocumentChecklist(draft), [draft]);
  const verificationReport = useMemo(() => buildItrVerificationReport(draft), [draft]);
  const identityValidation = useMemo(() => validateItrIdentity(draft), [draft]);
  const taxLiability = useMemo(() => computeItrTaxLiability(draft), [draft]);
  const reviewPacket = useMemo(
    () => buildItrReviewPacket(draft, activeReturn?.id ?? "unsaved-draft"),
    [draft, activeReturn?.id],
  );
  const currentStepId = ITR_FILING_STEPS[currentStep].id;
  const currentPanes = useMemo(
    () => getPanesForStep(currentStepId as FilingStepId, draft, documentChecklist),
    [currentStepId, documentChecklist, draft],
  );
  const activePane = currentPanes[Math.min(currentPane, Math.max(currentPanes.length - 1, 0))];
  const activePaneIssues = activePane ? validateItrPane(draft, activePane.id) : [];
  const visiblePaneIssues = activePane
    ? displayedPaneIssues.filter((issue) => issue.paneId === activePane.id)
    : [];
  const fieldErrors = visiblePaneIssues.reduce<Record<string, string>>((errors, issue) => {
    if (!issue.fieldId || errors[issue.fieldId]) return errors;
    return { ...errors, [issue.fieldId]: issue.title };
  }, {});
  const requiredDocumentCount = documentChecklist.filter((item) => item.required).length;
  const openIssueCount = verificationReport.summary.critical + verificationReport.summary.warning;
  const paneVisible = (paneId: string) => !isMobile || activePane?.id === paneId;

  useEffect(() => {
    if (taxReturnsQuery.isLoading) return;
    if (activeReturnId && taxReturns.some((item) => item.id === activeReturnId)) return;
    if (taxReturns[0]?.id) {
      setActiveReturnId(taxReturns[0].id);
    }
  }, [activeReturnId, taxReturns, taxReturnsQuery.isLoading]);

  useEffect(() => {
    if (taxReturnsQuery.isLoading || handoffChecked) return;
    setSelectorHandoff(readItrStartHandoff());
    setHandoffChecked(true);
  }, [handoffChecked, taxReturnsQuery.isLoading]);

  useEffect(() => {
    if (!activeReturn) return;
    const normalized = normalizeItrDraft(activeReturn.formData);
    setDraft(normalized);
    resetAutosaveDraft(normalized);
  }, [activeReturn?.id, resetAutosaveDraft]);

  useEffect(() => {
    setWhatsappCaseLink(null);
  }, [activeReturnId]);

  useEffect(() => {
    setCurrentPane((pane) => Math.min(pane, Math.max(currentPanes.length - 1, 0)));
  }, [currentPanes.length]);

  useEffect(() => {
    setShowSensitive(false);
  }, [activePane?.id]);

  useEffect(() => {
    setVisitedSteps((steps) => steps.includes(currentStep) ? steps : [...steps, currentStep]);
    paneStartedAtRef.current = typeof performance === "undefined" ? Date.now() : performance.now();
    captureItrFilingEvent("itr_filing_pane_viewed", {
      step: currentStepId,
      pane: activePane?.id ?? currentStepId,
      viewport: isMobile ? "mobile" : "desktop",
    });
  }, [activePane?.id, currentStep, currentStepId, isMobile]);

  useEffect(() => {
    if (!isMobile || typeof window === "undefined") return;
    const state = { ...(window.history.state ?? {}), [FILING_HISTORY_KEY]: { step: currentStep, pane: currentPane } };
    window.History.prototype.replaceState.call(window.history, state, "", window.location.href);

    const onPopState = (event: PopStateEvent) => {
      const marker = event.state?.[FILING_HISTORY_KEY] as { step?: number; pane?: number } | undefined;
      if (!marker || typeof marker.step !== "number" || typeof marker.pane !== "number") return;
      if (restoringPaneBackRef.current != null) {
        const pane = restoringPaneBackRef.current;
        restoringPaneBackRef.current = null;
        setCurrentPane(pane);
        window.History.prototype.replaceState.call(
          window.history,
          { ...(window.history.state ?? {}), [FILING_HISTORY_KEY]: { step: currentStep, pane } },
          "",
          window.location.href,
        );
        return;
      }
      if (marker.step !== currentStep && currentPane > 0) {
        restoringPaneBackRef.current = currentPane - 1;
        window.history.forward();
        return;
      }
      setCurrentStep(Math.max(0, Math.min(marker.step, ITR_FILING_STEPS.length - 1)));
      setCurrentPane(Math.max(0, marker.pane));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [currentPane, currentStep, isMobile]);

  const createDraftMutation = useMutation({
    mutationFn: async (input?: CreateDraftInput) => {
      const draftToCreate = input?.draft ? normalizeItrDraft(input.draft) : STARTER_DRAFT;
      const response = await apiRequest("/api/tax-returns", {
        method: "POST",
        body: JSON.stringify({
          assessmentYear: draftToCreate.assessmentYear,
          draft: draftToCreate,
          attribution: input?.attribution,
        }),
      });
      return response.json() as Promise<{ taxReturn: TaxReturnRecord }>;
    },
    onSuccess: (data, input) => {
      setActiveReturnId(data.taxReturn.id);
      setDraft(normalizeItrDraft(data.taxReturn.formData));
      if (input?.clearHandoff) {
        clearItrStartHandoff();
        setSelectorHandoff(null);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
    },
  });

  const applyHandoffMutation = useMutation({
    mutationFn: async () => {
      if (!activeReturn?.id || !selectorHandoff) throw new Error("No saved selector handoff to apply.");
      const response = await apiRequest(`/api/tax-returns/${activeReturn.id}`, {
        method: "PATCH",
        body: JSON.stringify({ draft: selectorHandoff.draft, attribution: selectorHandoff.attribution }),
      });
      return response.json() as Promise<{ taxReturn: TaxReturnRecord }>;
    },
    onSuccess: (data) => {
      setDraft(normalizeItrDraft(data.taxReturn.formData));
      clearItrStartHandoff();
      setSelectorHandoff(null);
      queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
    },
  });

  useEffect(() => {
    if (!handoffChecked || !selectorHandoff || taxReturnsQuery.isLoading || taxReturns.length > 0 || createDraftMutation.isPending) {
      return;
    }

    if (autoCreateHandoffRef.current === selectorHandoff.flowId) return;
    autoCreateHandoffRef.current = selectorHandoff.flowId;
    createDraftMutation.mutate({
      draft: selectorHandoff.draft,
      attribution: selectorHandoff.attribution,
      clearHandoff: true,
    });
  }, [
    createDraftMutation,
    handoffChecked,
    selectorHandoff,
    taxReturns.length,
    taxReturnsQuery.isLoading,
  ]);

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!activeReturnId) throw new Error("Save a draft before submitting for review.");
      if (!(await flushLatestDraft())) {
        throw new Error("Save the latest changes before submitting for CA review.");
      }
      const response = await apiRequest(`/api/tax-returns/${activeReturnId}/submit-review`, {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      const now = typeof performance === "undefined" ? Date.now() : performance.now();
      captureItrFilingEvent("itr_filing_review_submitted", {
        stepsVisited: visitedSteps.length,
        totalMs: Math.max(0, Math.round(now - filingStartedAtRef.current)),
        viewport: isMobile ? "mobile" : "desktop",
      });
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
    onSuccess: (data, variables) => {
      setDraft(normalizeItrDraft(data.taxReturn.formData));
      setDocumentUploadStates((states) => {
        const { [variables.checklistItemId]: _cleared, ...remainingStates } = states;
        return remainingStates;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: (error, variables) => {
      setDocumentUploadStates((states) => ({
        ...states,
        [variables.checklistItemId]: {
          ...states[variables.checklistItemId],
          status: "error",
          documentId: variables.documentId,
          error: `Could not link document. ${apiErrorMessage(error)}`,
        },
      }));
    },
  });

  const linkUploadedDocument = async (checklistItemId: string, documentId: string) => {
    try {
      await linkDocumentMutation.mutateAsync({ checklistItemId, documentId });
      setDocumentUploadStates((states) => ({
        ...states,
        [checklistItemId]: { status: "uploaded", documentId },
      }));
    } catch (error) {
      setDocumentUploadStates((states) => ({
        ...states,
        [checklistItemId]: {
          ...states[checklistItemId],
          status: "error",
          documentId,
          error: `Uploaded to your vault, but linking failed. ${apiErrorMessage(error)}`,
        },
      }));
    }
  };

  const uploadDocument = async (checklistItemId: string, file: File) => {
    if (!activeReturnId) return;
    setDocumentUploadStates((states) => ({
      ...states,
      [checklistItemId]: { status: "uploading", file },
    }));

    try {
      const preparedFile = await prepareDocumentForUpload(file);
      const token = await getAuthToken();
      const formData = new FormData();
      formData.append("file", preparedFile);
      formData.append("name", preparedFile.name);
      formData.append("category", checklistItemId);
      formData.append("year", draft.assessmentYear);
      formData.append("taxReturnId", activeReturnId);
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.document?.id) {
        throw new Error(data.error || data.message || "Failed to upload document.");
      }
      setDocumentUploadStates((states) => ({
        ...states,
        [checklistItemId]: { status: "uploading", file, documentId: data.document.id },
      }));
      await linkUploadedDocument(checklistItemId, data.document.id);
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    } catch (error) {
      setDocumentUploadStates((states) => ({
        ...states,
        [checklistItemId]: {
          ...states[checklistItemId],
          status: "error",
          file,
          error: apiErrorMessage(error),
        },
      }));
    }
  };

  const whatsappLinkMutation = useMutation({
    mutationFn: async () => {
      if (!activeReturnId) throw new Error("Save a draft before connecting WhatsApp.");
      const response = await apiRequest("/api/whatsapp/client/case-links", {
        method: "POST",
        body: JSON.stringify({ taxReturnId: activeReturnId }),
      });
      return response.json() as Promise<{ success: boolean; link: WhatsAppCaseLink }>;
    },
    onSuccess: (response) => {
      setWhatsappCaseLink(response.link);
      captureItrFilingEvent("itr_filing_whatsapp_case_link_created", {
        returnId: activeReturnId,
        viewport: isMobile ? "mobile" : "desktop",
      });
    },
  });

  const copyWhatsAppCode = async () => {
    if (!whatsappCaseLink?.code || typeof navigator === "undefined") return;
    await navigator.clipboard?.writeText(whatsappCaseLink.code);
  };

  const updateDraft = (updater: (current: ItrFilingDraft) => ItrFilingDraft) => {
    setDraft((current) => {
      const next = normalizeItrDraft(updater(current));
      markAutosaveChanged(next);
      return next;
    });
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
      documentDeferrals: value.trim()
        ? Object.fromEntries(
            Object.entries(current.documentDeferrals).filter(([documentId]) => documentId !== id),
          )
        : current.documentDeferrals,
    }));
  };

  const deferDocument = (id: string) => {
    updateDraft((current) => ({
      ...current,
      documentDeferrals: {
        ...current.documentDeferrals,
        [id]: true,
      },
    }));
    nextStep();
  };

  const toggleIncomeType = (key: (typeof INCOME_TOGGLES)[number]["key"], selected: boolean) => {
    if (!selected && incomeTypeHasValues(draft, key)) {
      const confirmed = window.confirm("Removing this income type will clear the amounts entered for it. Continue?");
      if (!confirmed) return;
    }

    updateDraft((current) => {
      const selectedTypes = selected
        ? Array.from(new Set([...current.income.selectedTypes, key]))
        : current.income.selectedTypes.filter((item) => item !== key);
      const income = { ...current.income, selectedTypes, noIncomeConfirmed: selected ? false : current.income.noIncomeConfirmed };
      const flags = { ...current.flags };

      if (!selected && key === "salary") Object.assign(income, { salary: 0, pension: 0 });
      if (!selected && key === "otherSources") {
        Object.assign(income, { otherSources: 0, agriculturalIncome: 0, winningsOrSpecialRateIncome: 0 });
      }
      if (!selected && key === "houseProperty") Object.assign(income, { houseProperties: 0, housePropertyIncome: 0 });
      if (!selected && key === "capitalGains") {
        Object.assign(income, { shortTermCapitalGains: 0, section112aLtcg: 0, otherCapitalGains: 0 });
      }
      if (!selected && key === "business") {
        Object.assign(income, { businessIncome: 0, professionalIncome: 0, presumptiveScheme: "none" });
      }
      if (!selected && key === "foreign") {
        income.foreignIncome = 0;
        flags.hasForeignAssets = false;
        flags.hasForeignSigningAuthority = false;
      }

      return { ...current, income, flags };
    });
  };

  const linkedVaultDocument = (checklistItemId: string) =>
    vaultDocuments.find((document) => document.id === draft.documents[checklistItemId]) ?? null;

  const dismissHandoff = () => {
    clearItrStartHandoff();
    setSelectorHandoff(null);
  };

  const navigateTo = (step: number, pane = 0, pushHistory = true) => {
    const nextStep = Math.max(0, Math.min(step, ITR_FILING_STEPS.length - 1));
    const nextPane = Math.max(0, pane);
    setCurrentStep(nextStep);
    setCurrentPane(nextPane);
    setDisplayedPaneIssues([]);
    setVisitedSteps((steps) => steps.includes(nextStep) ? steps : [...steps, nextStep]);
    if (isMobile && pushHistory && typeof window !== "undefined") {
      const nextState = { ...(window.history.state ?? {}), [FILING_HISTORY_KEY]: { step: nextStep, pane: nextPane } };
      if (nextStep !== currentStep) {
        window.History.prototype.replaceState.call(
          window.history,
          { ...(window.history.state ?? {}), [FILING_HISTORY_KEY]: { step: currentStep, pane: currentPane } },
          "",
          window.location.href,
        );
        window.History.prototype.pushState.call(window.history, nextState, "", window.location.href);
      } else {
        window.History.prototype.replaceState.call(window.history, nextState, "", window.location.href);
      }
    }
  };

  const previousStep = () => {
    if (isMobile && currentPane > 0) {
      navigateTo(currentStep, currentPane - 1);
      return;
    }
    const previousStepIndex = Math.max(currentStep - 1, 0);
    const previousPanes = getPanesForStep(
      ITR_FILING_STEPS[previousStepIndex].id as FilingStepId,
      draft,
      documentChecklist,
    );
    navigateTo(previousStepIndex, isMobile ? Math.max(previousPanes.length - 1, 0) : 0);
  };

  const nextStep = () => {
    const criticalIssues = activePaneIssues.filter((issue) => issue.severity === "critical");
    if (isMobile && activePane && criticalIssues.length > 0) {
      setDisplayedPaneIssues(criticalIssues);
      captureItrFilingEvent("itr_filing_validation_blocked", {
        step: currentStepId,
        pane: activePane.id,
        rule: criticalIssues[0].id,
      });
      return;
    }
    const now = typeof performance === "undefined" ? Date.now() : performance.now();
    captureItrFilingEvent("itr_filing_pane_completed", {
      step: currentStepId,
      pane: activePane?.id ?? currentStepId,
      msOnPane: Math.max(0, Math.round(now - paneStartedAtRef.current)),
    });
    if (isMobile && currentPane < currentPanes.length - 1) {
      navigateTo(currentStep, currentPane + 1);
      return;
    }
    navigateTo(Math.min(currentStep + 1, ITR_FILING_STEPS.length - 1), 0);
  };

  const navigateToIssue = (issue: ItrVerificationIssue) => {
    if (!issue.paneId) return;
    const step = ITR_FILING_STEPS.findIndex((item) =>
      getPanesForStep(item.id as FilingStepId, draft, documentChecklist).some((pane) => pane.id === issue.paneId)
    );
    if (step < 0) return;
    const panes = getPanesForStep(ITR_FILING_STEPS[step].id as FilingStepId, draft, documentChecklist);
    navigateTo(step, Math.max(0, panes.findIndex((pane) => pane.id === issue.paneId)));
  };

  if (taxReturnsQuery.isLoading) {
    return (
      <Layout title="MY ITR">
        <MyeCard className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </MyeCard>
      </Layout>
    );
  }

  if (taxReturnsQuery.isError) {
    return (
      <Layout title="MY ITR">
        <MyeCard className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">MY ITR</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">We couldn't load your ITR drafts</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                {apiErrorMessage(taxReturnsQuery.error)}
              </p>
              <Button
                type="button"
                onClick={() => void taxReturnsQuery.refetch()}
                disabled={taxReturnsQuery.isFetching}
                className="mt-5 bg-blue-600 text-white hover:bg-blue-700"
              >
                {taxReturnsQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Retry
              </Button>
            </div>
          </div>
        </MyeCard>
      </Layout>
    );
  }

  if (!activeReturn) {
    return (
      <Layout title="MY ITR">
        <MyeCard className="p-6">
          <SectionHeading
            eyebrow="MY ITR"
            title="Start a new AY 2026-27 filing draft"
            description="Prepare an ITR draft, then submit it for CA review."
          />
          {createDraftMutation.isError ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-black text-red-900">We couldn't start your ITR draft</p>
                  <p className="mt-1 leading-6">{apiErrorMessage(createDraftMutation.error)}</p>
                </div>
              </div>
            </div>
          ) : null}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link href="/itr/filing/new">
              <Button type="button" className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">
                <UserRound className="h-4 w-4" />
                Choose who you're filing for
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-blue-100 bg-blue-50 font-black text-blue-700 hover:bg-blue-100"
              onClick={() => {
                createDraftMutation.reset();
                createDraftMutation.mutate({});
              }}
              disabled={createDraftMutation.isPending}
            >
              {createDraftMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Start from scratch
            </Button>
          </div>
        </MyeCard>
      </Layout>
    );
  }

  return (
    <Layout title="MY ITR">
      {isMobile ? <FilingProgressHeader
        steps={ITR_FILING_STEPS}
        currentStep={currentStep}
        currentPane={currentPane}
        paneCount={currentPanes.length}
        saveState={saveState}
        recommendation={recommendation.form.replace(/_/g, " ")}
        ownerLabel={filingOwnerName}
        visitedSteps={visitedSteps}
        onStepChange={(step) => navigateTo(step, 0)}
      /> : null}
      <div className="space-y-5 pb-28 md:pb-6">
        {!isMobile ? <MyeCard className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">MY ITR</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Self-prep with CA review</h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
                AY 2026-27 filing workspace.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-800">
                  <UserRound className="h-3.5 w-3.5" />
                  Filing for {filingOwnerName}
                </span>
                <Link href="/itr/filing/new" className="text-xs font-black text-blue-700 underline-offset-2 hover:underline">
                  Change
                </Link>
                <CaAssistStrip variant="pill" />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
              <StatusBadge status={recommendationStatus(recommendation) as any} label={recommendation.form.replace(/_/g, " ")} />
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                <Save className="mr-2 inline h-4 w-4" />
                {!online ? "Changes not saved" : saveError ? "Save failed" : pendingSave ? "Saving..." : lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString()}` : "Saved draft"}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                {documentCountLabel(requiredDocumentCount)}
              </div>
            </div>
          </div>
        </MyeCard> : null}

        {saveError ? (
          <MyeCard className="border-red-200 bg-red-50 p-4 shadow-none">
            <div className="flex items-start gap-3 text-sm font-semibold text-red-800" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-black text-red-900">We couldn't save your latest draft changes</p>
                <p className="mt-1 leading-6">{apiErrorMessage(saveError)}</p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void persistLatestDraft()}
                  className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Retry save
                </Button>
              </div>
            </div>
          </MyeCard>
        ) : null}

        {!online ? (
          <MyeCard className="border-amber-200 bg-amber-50 p-4 shadow-none">
            <div className="flex items-start gap-3 text-sm font-semibold text-amber-900" role="status">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Offline. Keep this page open; changes will save after reconnecting.</p>
            </div>
          </MyeCard>
        ) : null}

        {selectorHandoff && activeReturn ? (
          <MyeCard className="border-blue-200 bg-blue-50 p-5 shadow-none">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Saved selector answers</p>
                <h2 className="mt-2 text-xl font-black text-slate-950">Resume your ITR plan</h2>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-700">
                  Apply the saved answers from {selectorHandoff.source.replace(/_/g, " ")} to this draft.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                <Button
                  type="button"
                  onClick={() => applyHandoffMutation.mutate()}
                  disabled={applyHandoffMutation.isPending}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {applyHandoffMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
                  Apply plan
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={dismissHandoff}
                  disabled={applyHandoffMutation.isPending}
                  className="border-blue-200 bg-white text-blue-700 hover:bg-blue-100"
                >
                  Dismiss plan
                </Button>
              </div>
            </div>
          </MyeCard>
        ) : null}

        {!isMobile ? <div>
          <GuidedStepNav
            steps={ITR_FILING_STEPS}
            currentStep={currentStep}
            onStepChange={(step) => navigateTo(step, 0)}
          />
        </div> : null}

        <MyeCard className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Step {currentStep + 1} of {ITR_FILING_STEPS.length}</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                <span className="md:hidden">{activePane?.title ?? ITR_FILING_STEPS[currentStep].title}</span>
                <span className="hidden md:inline">{ITR_FILING_STEPS[currentStep].title}</span>
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                <span className="md:hidden">{activePane?.description ?? ITR_FILING_STEPS[currentStep].description}</span>
                <span className="hidden md:inline">{ITR_FILING_STEPS[currentStep].description}</span>
              </p>
            </div>
            <StatusBadge
              status={verificationReport.status === "blocked" ? "action_required" : verificationReport.status === "review" ? "ca_review" : "filed"}
              label={verificationReport.status === "ready" ? "Checks clear" : `${openIssueCount} checks open`}
            />
          </div>

          <PaneRenderer
            panes={currentPanes}
            activePaneId={activePane?.id}
            isMobile={isMobile}
            onPaneDone={nextStep}
          >
          <div className="mt-5">
            {visiblePaneIssues.some((issue) => !issue.fieldId) ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">
                {visiblePaneIssues.filter((issue) => !issue.fieldId).map((issue) => (
                  <p key={issue.id}>{issue.title}</p>
                ))}
              </div>
            ) : null}
            {currentStepId === "identity" && (
              <div className="space-y-6">
                <PaneSection visible={paneVisible("identity-name")} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <TextInput label="First name" value={draft.taxpayer.firstName} autoComplete="given-name" autoCapitalize="words" enterKeyHint="next" maxLength={80} onChange={(value) => updateTaxpayer({ firstName: value })} />
                  <TextInput label="Last name" value={draft.taxpayer.lastName} autoComplete="family-name" autoCapitalize="words" enterKeyHint="next" maxLength={80} onChange={(value) => updateTaxpayer({ lastName: value })} />
                  <TextInput label="Date of birth" type="date" value={draft.taxpayer.dateOfBirth} autoComplete="bday" enterKeyHint="done" max={currentLocalDate()} onChange={(value) => updateTaxpayer({ dateOfBirth: value })} />
                </PaneSection>
                <PaneSection visible={paneVisible("identity-pan-aadhaar")} className="grid gap-4 md:grid-cols-2">
                  <PanInput value={draft.taxpayer.pan} enterKeyHint="next" onChange={(value) => updateTaxpayer({ pan: value })} error={fieldErrors.pan} />
                  <AadhaarInput value={draft.taxpayer.aadhaar} enterKeyHint="done" onChange={(value) => updateTaxpayer({ aadhaar: value })} helper={`Stored securely. Preview: ${maskDigits(draft.taxpayer.aadhaar)}`} error={fieldErrors.aadhaar} />
                </PaneSection>
                <PaneSection visible={paneVisible("identity-contact")} className="grid gap-4 md:grid-cols-2">
                  <TextInput label="Mobile" value={draft.taxpayer.mobile} type="tel" inputMode="tel" autoComplete="tel-national" enterKeyHint="next" maxLength={10} onChange={(value) => updateTaxpayer({ mobile: value.replace(/\D/g, "").slice(0, 10) })} helper="Enter the 10-digit mobile number used for filing updates." />
                  <TextInput label="Email" value={draft.taxpayer.email} type="email" inputMode="email" autoComplete="email" enterKeyHint="done" maxLength={254} onChange={(value) => updateTaxpayer({ email: value })} />
                </PaneSection>

                <PaneSection visible={paneVisible("identity-bank")} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-blue-700" />
                    <h3 className="text-lg font-black text-slate-950">Refund bank</h3>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <TextInput label="Account holder" value={draft.taxpayer.bankAccountHolder} autoComplete="name" autoCapitalize="words" maxLength={120} onChange={(value) => updateTaxpayer({ bankAccountHolder: value })} />
                    <TextInput label="Bank name" value={draft.taxpayer.bankName} autoCapitalize="words" maxLength={120} onChange={(value) => updateTaxpayer({ bankName: value })} />
                    <IfscInput value={draft.taxpayer.ifsc} enterKeyHint="done" onChange={(value) => updateTaxpayer({ ifsc: value })} error={fieldErrors.ifsc} />
                  </div>
                </PaneSection>
                <PaneSection visible={paneVisible("identity-account")} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <TextInput label="Account number" type={showSensitive ? "text" : "password"} inputMode="numeric" autoComplete="off" maxLength={18} value={draft.taxpayer.bankAccount} onChange={(value) => updateTaxpayer({ bankAccount: value.replace(/\D/g, "").slice(0, 18) })} helper={`Preview: ${maskDigits(draft.taxpayer.bankAccount)}`} />
                    <TextInput label="Confirm account number" type={showSensitive ? "text" : "password"} inputMode="numeric" autoComplete="off" enterKeyHint="done" maxLength={18} value={draft.taxpayer.bankAccountConfirm} onChange={(value) => updateTaxpayer({ bankAccountConfirm: value.replace(/\D/g, "").slice(0, 18) })} helper={identityValidation.bankAccountConfirmed ? "Account numbers match" : "Enter the same account number again"} error={fieldErrors.bankAccountConfirm} />
                    <div>
                      <Label>Account type</Label>
                      <Select value={draft.taxpayer.bankAccountType} onValueChange={(value) => updateTaxpayer({ bankAccountType: value as any })}>
                        <SelectTrigger className="mt-2 h-11 rounded-lg"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="current">Current</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <ToggleRow
                      title={showSensitive ? "Hide account numbers" : "Show account numbers"}
                      description="Use only while confirming the refund account."
                      checked={showSensitive}
                      onCheckedChange={setShowSensitive}
                    />
                  </div>
                </PaneSection>
              </div>
            )}

            {currentStepId === "income" && (
              <div className="space-y-6">
                <PaneSection visible={paneVisible("income-types")} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {INCOME_TOGGLES.map((item) => {
                    const selected = incomeToggleSelected(draft, item.key);
                    return (
                      <ChoiceButton
                        key={item.key}
                        selected={selected}
                        title={item.title}
                        description={item.description}
                        onClick={() => toggleIncomeType(item.key, !selected)}
                      />
                    );
                  })}
                  {draft.income.selectedTypes.length === 0 ? (
                    <ChoiceButton
                      selected={draft.income.noIncomeConfirmed}
                      title="No income to report"
                      description="Explicitly confirm this only when none of the income types apply."
                      onClick={() => updateIncome({ noIncomeConfirmed: !draft.income.noIncomeConfirmed })}
                    />
                  ) : null}
                </PaneSection>
                <PaneSection visible={draft.income.selectedTypes.includes("salary") && paneVisible("income-salary")} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <CurrencyInput label="Salary" value={draft.income.salary} onChange={(value) => updateIncome({ salary: value })} />
                  <CurrencyInput label="Pension" value={draft.income.pension} onChange={(value) => updateIncome({ pension: value })} />
                </PaneSection>
                <PaneSection visible={draft.income.selectedTypes.includes("otherSources") && paneVisible("income-other-sources")} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <CurrencyInput label="Other sources" value={draft.income.otherSources} onChange={(value) => updateIncome({ otherSources: value })} />
                </PaneSection>
                <PaneSection visible={draft.income.selectedTypes.includes("houseProperty") && paneVisible("income-house-property")} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <TextInput label="House properties" value={String(draft.income.houseProperties || "")} inputMode="numeric" maxLength={2} onChange={(value) => updateIncome({ houseProperties: Math.max(0, Number.parseInt(value.replace(/\D/g, ""), 10) || 0) })} />
                  <CurrencyInput label="House property income" value={draft.income.housePropertyIncome} allowNegative onChange={(value) => updateIncome({ housePropertyIncome: value })} />
                </PaneSection>
                <PaneSection visible={draft.income.selectedTypes.includes("capitalGains") && paneVisible("income-capital-gains")} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <CurrencyInput label="Section 112A LTCG" value={draft.income.section112aLtcg} onChange={(value) => updateIncome({ section112aLtcg: value })} />
                  <CurrencyInput label="Short-term capital gains" value={draft.income.shortTermCapitalGains} allowNegative onChange={(value) => updateIncome({ shortTermCapitalGains: value })} />
                  <CurrencyInput label="Other capital gains" value={draft.income.otherCapitalGains} allowNegative onChange={(value) => updateIncome({ otherCapitalGains: value })} />
                  <CurrencyInput label="Crypto / VDA gains" value={draft.income.vdaIncome} onChange={(value) => updateIncome({ vdaIncome: value })} helper="Taxed at a flat 30% with no loss set-off (Section 115BBH)." />
                </PaneSection>
                <PaneSection visible={draft.income.selectedTypes.includes("business") && paneVisible("income-business")} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <CurrencyInput label={draft.income.presumptiveScheme === "44AD" ? "Business turnover" : "Business income"} value={draft.income.businessIncome} onChange={(value) => updateIncome({ businessIncome: value })} />
                    <CurrencyInput label={draft.income.presumptiveScheme === "44ADA" ? "Professional receipts" : "Professional income"} value={draft.income.professionalIncome} onChange={(value) => updateIncome({ professionalIncome: value })} />
                    <div>
                      <Label>Presumptive scheme</Label>
                      <Select value={draft.income.presumptiveScheme} onValueChange={(value) => updateIncome({ presumptiveScheme: value as "none" | "44AD" | "44ADA" | "44AE" })}>
                        <SelectTrigger className="mt-2 h-11 rounded-lg"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not presumptive</SelectItem>
                          <SelectItem value="44AD">44AD — business (6%/8%)</SelectItem>
                          <SelectItem value="44ADA">44ADA — profession (50%)</SelectItem>
                          <SelectItem value="44AE">44AE — goods carriage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {draft.income.presumptiveScheme === "44AD" ? (
                    <ToggleRow
                      title="Cash receipts within 5%"
                      description="Applies the 6% presumptive rate on digitally received turnover instead of 8%."
                      checked={draft.income.cashReceiptsWithinFivePercent}
                      onCheckedChange={(checked) => updateIncome({ cashReceiptsWithinFivePercent: checked })}
                    />
                  ) : null}
                </PaneSection>
                <PaneSection visible={draft.income.selectedTypes.includes("foreign") && paneVisible("income-foreign")} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <CurrencyInput label="Foreign income" value={draft.income.foreignIncome} onChange={(value) => updateIncome({ foreignIncome: value })} />
                </PaneSection>
                <PaneSection visible={paneVisible("income-deductions")} className="grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2 lg:grid-cols-3">
                  <CurrencyInput label="80C" value={draft.deductions.section80C} onChange={(value) => updateDeductions({ section80C: value })} />
                  <CurrencyInput label="80D" value={draft.deductions.section80D} onChange={(value) => updateDeductions({ section80D: value })} />
                </PaneSection>
                <PaneSection visible={paneVisible("income-taxes-paid")} className="grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2 lg:grid-cols-3">
                  <CurrencyInput label="TDS" value={draft.taxPaid.tds} onChange={(value) => updateTaxPaid({ tds: value })} />
                  <CurrencyInput label="TCS" value={draft.taxPaid.tcs} onChange={(value) => updateTaxPaid({ tcs: value })} />
                  <CurrencyInput label="Advance tax" value={draft.taxPaid.advanceTax} onChange={(value) => updateTaxPaid({ advanceTax: value })} />
                </PaneSection>
                <PaneSection visible={paneVisible("income-preferences")} className="space-y-3">
                  <ToggleRow
                    title="Old regime requested"
                    description="Stores the preference for computation and CA review."
                    checked={draft.filing.wantsOldRegime}
                    onCheckedChange={(checked) => updateFiling({ wantsOldRegime: checked })}
                  />
                  <div className="md:hidden">
                    <CollapsibleFlags flags={RISK_FLAGS.map((flag) => ({
                      id: flag.key,
                      title: flag.label,
                      description: flag.helper,
                      checked: Boolean(draft.flags[flag.key]),
                      onCheckedChange: (checked: boolean) => updateFlag(flag.key, checked),
                    }))} />
                  </div>
                  <div className="hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-3">
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
                </PaneSection>
              </div>
            )}

            {currentStepId === "documents" && (
              <div className="space-y-5">
                <PaneSection visible={paneVisible("documents-overview")} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Metric label="Required" value={String(requiredDocumentCount)} />
                    <Metric label="Linked" value={String(documentChecklist.filter((document) => Boolean(draft.documents[document.id])).length)} />
                    <Metric label="Provide later" value={String(documentChecklist.filter((document) => draft.documentDeferrals[document.id]).length)} />
                  </div>
                  <CaAssistStrip variant="inline" />
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-emerald-700" />
                          <p className="text-sm font-black text-emerald-950">WhatsApp document intake</p>
                        </div>
                        <p className="mt-1 text-sm font-semibold leading-6 text-emerald-800">
                          Connect this return before sending PDF or image files on WhatsApp.
                        </p>
                        {whatsappCaseLink ? (
                          <p className="mt-2 text-lg font-black tracking-widest text-emerald-950">{whatsappCaseLink.code}</p>
                        ) : null}
                        {whatsappLinkMutation.isError ? (
                          <p className="mt-2 text-sm font-semibold text-red-700">{apiErrorMessage(whatsappLinkMutation.error)}</p>
                        ) : null}
                      </div>
                      <div className="grid gap-2 sm:min-w-48">
                        <Button
                          type="button"
                          disabled={!activeReturnId || whatsappLinkMutation.isPending}
                          onClick={() => whatsappLinkMutation.mutate()}
                          className="h-10 rounded-lg bg-emerald-700 px-4 text-white hover:bg-emerald-800"
                        >
                          {whatsappLinkMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
                          Connect WhatsApp
                        </Button>
                        {whatsappCaseLink ? (
                          <Button type="button" variant="outline" onClick={copyWhatsAppCode} className="h-10 rounded-lg border-emerald-200 bg-white text-emerald-800">
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Code
                          </Button>
                        ) : null}
                        {whatsappCaseLink?.waLink ? (
                          <a href={whatsappCaseLink.waLink} target="_blank" rel="noreferrer" className="text-center text-xs font-black uppercase tracking-widest text-emerald-800 underline underline-offset-4">
                            Open WhatsApp
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </PaneSection>
                <div className="grid gap-4 lg:grid-cols-2">
                  {documentChecklist.map((document) => {
                    const linkedDocument = linkedVaultDocument(document.id);
                    const complete = Boolean(draft.documents[document.id]);
                    const uploadState = documentUploadStates[document.id];
                    const status: DocumentCaptureStatus = complete
                      ? "uploaded"
                      : uploadState?.status ?? (draft.documentDeferrals[document.id] ? "deferred" : "idle");
                    const helper = document.id === "form16"
                      ? { href: "/form16-parser", label: "Open Form 16 parser" }
                      : document.id === "ais"
                        ? { href: "/ais-viewer", label: "Open AIS viewer" }
                        : document.id === "capital-gains"
                          ? { href: "/capital-gains-import", label: "Open capital gains import" }
                          : { href: "/documents", label: "Open document vault" };
                    if (!paneVisible(`document-${document.id}`)) return null;

                    return (
                      <div key={document.id}>
                        <DocumentCaptureCard
                          item={document}
                          status={status}
                          linkedDocumentName={linkedDocument?.name || linkedDocument?.originalName || (complete ? draft.documents[document.id] : undefined)}
                          manualReference={linkedDocument ? "" : draft.documents[document.id] ?? ""}
                          error={uploadState?.error}
                          onUpload={(file) => void uploadDocument(document.id, file)}
                          onRetry={uploadState?.documentId
                            ? () => void linkUploadedDocument(document.id, uploadState.documentId!)
                            : uploadState?.file
                              ? () => void uploadDocument(document.id, uploadState.file!)
                              : undefined}
                          onDefer={isMobile ? () => deferDocument(document.id) : undefined}
                          onManualReferenceChange={(value) => updateDocument(document.id, value)}
                          helperHref={helper.href}
                          helperLabel={helper.label}
                        />
                        <Select
                          value={linkedDocument?.id ?? "manual"}
                          onValueChange={(value) => {
                            if (value !== "manual") {
                              linkDocumentMutation.mutate({ checklistItemId: document.id, documentId: value });
                            }
                          }}
                          disabled={!vaultDocuments.length || linkDocumentMutation.isPending}
                        >
                          <SelectTrigger className="mt-3 h-11 rounded-lg bg-white">
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
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStepId === "verify" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <ShieldCheck className="h-6 w-6 text-blue-700" />
                  <h3 className="mt-3 text-lg font-black text-slate-950">Rule checks</h3>
                  <div className="mt-4 grid gap-3">
                    <CheckLine label="PAN format valid" checked={identityValidation.panFormatValid} />
                    <CheckLine label="Aadhaar format valid" checked={identityValidation.aadhaarFormatValid} />
                    <CheckLine label="Refund bank confirmed" checked={identityValidation.bankAccountConfirmed} />
                    <CheckLine label="IFSC format valid" checked={identityValidation.ifscFormatValid} />
                    <CheckLine label="Computation details available" checked={taxLiability.status === "computed"} />
                  </div>
                </div>
                <IssueList issues={verificationReport.issues} onIssueNavigate={navigateToIssue} />
              </div>
            )}

            {currentStepId === "compute" && (
              <div className="space-y-5">
                <PaneSection visible={paneVisible("compute-regimes")}>
                  <RegimeComparator
                    liability={taxLiability}
                    selectedRegime={draft.filing.wantsOldRegime ? "old" : "new"}
                    onRegimeChange={(regime) => updateFiling({ wantsOldRegime: regime === "old" })}
                  />
                </PaneSection>
                <PaneSection visible={paneVisible("compute-liability")} className="rounded-lg border border-blue-100 bg-blue-50 p-5">
                  <IndianRupee className="h-6 w-6 text-blue-700" />
                  <h3 className="mt-3 text-lg font-black text-blue-950">Tax liability</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <Metric label="Gross tax liability" value={formatInr(taxLiability.grossTaxLiability)} />
                    <Metric label="Tax paid" value={formatInr(taxLiability.totalTaxPaid)} />
                    <Metric label="Payable" value={formatInr(taxLiability.taxPayable)} />
                    <Metric label="Refund" value={formatInr(taxLiability.refundDue)} />
                  </div>
                  {taxLiability.unsupportedReasons.length ? (
                    <p className="mt-4 text-sm font-semibold leading-6 text-amber-800">
                      {taxLiability.unsupportedReasons.join(" ")}
                    </p>
                  ) : null}
                </PaneSection>
              </div>
            )}

            {currentStepId === "review" && (
              <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <ClipboardCheck className="h-6 w-6 text-emerald-700" />
                  <h3 className="mt-3 text-lg font-black text-slate-950">Review packet</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    Includes checks, documents, and tax computation.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <StatusBadge status="in_progress" label={`${reviewPacket.documentChecklist.length} document checks`} />
                    <StatusBadge status={taxLiability.status === "computed" ? "filed" : "ca_review"} label={taxLiability.status === "computed" ? "Computation ready" : "Computation gated"} />
                    <StatusBadge status={recommendation.caReviewRequired ? "ca_review" : "filed"} label={recommendation.caReviewRequired ? "CA review needed" : "Simple path"} />
                    <StatusBadge status={reviewSubmitted ? "filed" : "not_started"} label={reviewSubmitted ? "Submitted" : "Not submitted"} />
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <UserRound className="h-6 w-6 text-blue-700" />
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.14em] text-slate-500">Packet summary</p>
                  <div className="mt-4 space-y-2">
                    <SummaryLine label="Total income" value={formatInr(calculateItrTotalIncome(draft))} />
                    <SummaryLine label="Deductions" value={formatInr(calculateItrTotalDeductions(draft))} />
                    <SummaryLine label="Tax paid" value={formatInr(calculateItrTotalTaxPaid(draft))} />
                    <SummaryLine label="Recommended form" value={recommendation.form.replace(/_/g, " ")} />
                    <SummaryLine label="PAN" value={maskPan(draft.taxpayer.pan)} />
                    <SummaryLine label="Aadhaar" value={maskAadhaar(draft.taxpayer.aadhaar)} />
                    <SummaryLine label="Refund account" value={maskAccount(draft.taxpayer.bankAccount)} />
                  </div>
                    <Button
                      type="button"
                      onClick={() => submitReviewMutation.mutate()}
                      disabled={submitReviewMutation.isPending || reviewSubmitted || verificationReport.summary.critical > 0}
                      className="mt-5 w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {submitReviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                      {reviewSubmitted ? "Submitted for CA review" : "Submit for CA review"}
                    </Button>
                    {verificationReport.summary.critical > 0 ? (
                      <p className="mt-2 text-sm font-semibold text-red-700">
                        Resolve {verificationReport.summary.critical} critical {verificationReport.summary.critical === 1 ? "issue" : "issues"} before submitting.
                      </p>
                    ) : null}
                    {submitReviewMutation.isError ? (
                      <p className="mt-2 text-sm font-semibold text-red-700" role="alert">
                        {apiErrorMessage(submitReviewMutation.error)}
                      </p>
                    ) : null}
                </div>
              </div>
            )}
          </div>
          </PaneRenderer>

          <div className="mt-6 hidden md:block">
            <FilingSummaryStrip
              recommendation={recommendation.form.replace(/_/g, " ")}
              requiredDocuments={requiredDocumentCount}
              issueCount={openIssueCount}
              liability={taxLiability}
            />
          </div>
        </MyeCard>

        {currentStep >= 1 ? (
          <div className="fixed inset-x-4 bottom-[calc(10.1rem+env(safe-area-inset-bottom))] z-[59] md:hidden">
            <LiabilityChip liability={taxLiability} onClick={() => setLiabilityOpen(true)} />
          </div>
        ) : null}
        <LiabilitySheet
          open={liabilityOpen}
          onOpenChange={setLiabilityOpen}
          liability={taxLiability}
          recommendation={recommendation.form.replace(/_/g, " ")}
          requiredDocuments={requiredDocumentCount}
          issueCount={openIssueCount}
        />

        <div className={cn(
          "fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[60] flex items-center justify-between rounded-lg border border-slate-200 bg-white/95 p-3 shadow-[0_16px_50px_-35px_rgba(15,23,42,0.6)] backdrop-blur md:sticky md:bottom-4",
          keyboardOpen && "hidden md:flex",
        )}>
          <Button
            type="button"
            variant="outline"
            aria-label="Previous pane"
            onClick={previousStep}
            disabled={currentStep === 0 && currentPane === 0}
            className="h-11 w-11 shrink-0 border-slate-200 bg-white px-0 font-black text-slate-700 md:w-auto md:px-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only md:not-sr-only">Previous</span>
          </Button>
          <div className="flex flex-1 gap-2 md:flex-none">
            {!isMobile ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void persistLatestDraft()}
                disabled={!activeReturnId || !online}
                className="h-10 border-blue-100 bg-blue-50 font-black text-blue-700 hover:bg-blue-100"
              >
                <Save className="h-4 w-4" />
                Save draft
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={nextStep}
              disabled={currentStep === ITR_FILING_STEPS.length - 1 && (!isMobile || currentPane === currentPanes.length - 1)}
              className="h-11 flex-1 bg-blue-600 font-black text-white hover:bg-blue-700 md:flex-none"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function CheckLine({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      {checked ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <FileText className="h-5 w-5 text-amber-600" />}
    </div>
  );
}

function PaneSection({ visible, className, children }: { visible: boolean; className?: string; children: ReactNode }) {
  if (!visible) return null;
  return <div className={className}>{children}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className="text-sm font-black text-slate-950">{value}</span>
    </div>
  );
}
