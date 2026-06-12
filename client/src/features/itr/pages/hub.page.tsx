import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Download,
  FileJson,
  FilePlus2,
  FileText,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MyeCard, StatusBadge, formatInr, type ComplianceStatus } from "@/components/platform/compliance-ui";
import { Layout } from "@/components/admin/Layout";
import { useAuth } from "@/components/AuthProvider";
import { CaAssistStrip } from "@/features/itr/components/CaAssistStrip";
import {
  groupReturnsByYear,
  isOpenDraft,
  ownerLabel,
  reviewStatusBadge,
  taxpayerLabel,
  type HubTaxReturn,
} from "@/features/itr/lib/hub-selectors";
import { readItrStartHandoff } from "@/features/itr/lib/start-selector";
import { getAuthToken } from "@/lib/authToken";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { captureTelemetryEvent } from "@/telemetry/browser";
import { cn } from "@/lib/utils";

type TaxReturnsResponse = { taxReturns: HubTaxReturn[] };

type VaultDocument = {
  id: string;
  name: string;
  originalName?: string | null;
  fileName?: string | null;
  category?: string | null;
  taxReturnId?: string | null;
};

type DocumentsResponse = { documents: VaultDocument[] };

function formatUpdatedAt(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ITRHubPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const previousSectionRef = useRef<HTMLDivElement | null>(null);
  const [handoffPresent] = useState(() => Boolean(readItrStartHandoff()));
  const viewTrackedRef = useRef(false);

  const taxReturnsQuery = useQuery<TaxReturnsResponse>({
    queryKey: ["/api/tax-returns"],
    queryFn: async () => {
      const response = await apiRequest("/api/tax-returns");
      return response.json();
    },
  });

  const documentsQuery = useQuery<DocumentsResponse>({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await apiRequest("/api/documents");
      return response.json();
    },
  });

  const taxReturns = taxReturnsQuery.data?.taxReturns ?? [];
  const documents = documentsQuery.data?.documents ?? [];
  const openDrafts = taxReturns.filter((record) => isOpenDraft(record.status));
  const submittedReturns = taxReturns.filter((record) => !isOpenDraft(record.status));
  const yearGroups = useMemo(() => groupReturnsByYear(taxReturns), [taxReturns]);
  const documentsByReturn = useMemo(() => {
    const map = new Map<string, VaultDocument[]>();
    for (const document of documents) {
      if (!document.taxReturnId) continue;
      map.set(document.taxReturnId, [...(map.get(document.taxReturnId) ?? []), document]);
    }
    return map;
  }, [documents]);
  const linkedDocumentCount = useMemo(
    () => Array.from(documentsByReturn.values()).reduce((total, items) => total + items.length, 0),
    [documentsByReturn],
  );

  useEffect(() => {
    if (viewTrackedRef.current || taxReturnsQuery.isLoading) return;
    viewTrackedRef.current = true;
    captureTelemetryEvent("itr_hub_viewed", {
      openDrafts: openDrafts.length,
      previousReturns: submittedReturns.length,
    });
  }, [openDrafts.length, submittedReturns.length, taxReturnsQuery.isLoading]);

  const openPreviousSection = () => {
    captureTelemetryEvent("itr_hub_previous_docs_opened", { returns: taxReturns.length });
    previousSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const downloadDocument = async (vaultDocument: VaultDocument) => {
    const token = await getAuthToken();
    const response = await fetch(`/api/documents/${vaultDocument.id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      toast({
        title: "Download failed",
        description: "Ownership check failed or the file is unavailable.",
        variant: "destructive",
      });
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = vaultDocument.originalName || vaultDocument.fileName || vaultDocument.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadReturnJson = async (returnId: string) => {
    const token = await getAuthToken();
    const response = await fetch(`/api/tax-returns/${returnId}/export-json`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      toast({
        title: "Export unavailable",
        description: "This draft cannot be exported yet.",
        variant: "destructive",
      });
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `itr-draft-${returnId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              <h2 className="mt-2 text-2xl font-black text-slate-950">We couldn't load your ITR workspace</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                Please retry. If it still fails, contact support.
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

  return (
    <Layout title="MY ITR">
      <div className="space-y-5 pb-10">
        <MyeCard className="p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">MY ITR</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Income tax filing</h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">AY 2026-27 &middot; FY 2025-26</p>
          <CaAssistStrip className="mt-4" assignedCaName={user?.assignedCaName} />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/itr/filing/new"
              onClick={() => captureTelemetryEvent("itr_hub_new_filing_clicked", {})}
              className="group flex min-h-[96px] items-start gap-3 rounded-lg bg-blue-600 p-4 text-left text-white transition hover:bg-blue-700"
            >
              <FilePlus2 className="mt-0.5 h-6 w-6 shrink-0" />
              <span>
                <span className="block text-base font-black">New filing</span>
                <span className="mt-1 block text-sm font-semibold leading-5 text-blue-100">
                  Start AY 2026-27 for yourself or a family member.
                </span>
              </span>
            </Link>
            <button
              type="button"
              onClick={openPreviousSection}
              className="group flex min-h-[96px] items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-slate-50"
            >
              <FolderOpen className="mt-0.5 h-6 w-6 shrink-0 text-blue-700" />
              <span>
                <span className="block text-base font-black text-slate-950">Previous ITR documents</span>
                <span className="mt-1 block text-sm font-semibold leading-5 text-slate-600">
                  {taxReturns.length
                    ? `${taxReturns.length} ${taxReturns.length === 1 ? "return" : "returns"} · ${linkedDocumentCount} linked ${linkedDocumentCount === 1 ? "document" : "documents"}`
                    : "Filed returns and acknowledgments appear here."}
                </span>
              </span>
            </button>
          </div>
        </MyeCard>

        {handoffPresent ? (
          <MyeCard className="border-blue-200 bg-blue-50 p-4 shadow-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-950">Your ITR plan is saved</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                  Continue with the answers from the form selector.
                </p>
              </div>
              <Link href="/itr/filing/new">
                <Button type="button" className="bg-blue-600 text-white hover:bg-blue-700">
                  Continue plan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </MyeCard>
        ) : null}

        {openDrafts.length ? (
          <MyeCard className="p-5">
            <h2 className="text-lg font-black text-slate-950">Continue filing</h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {openDrafts.map((draft) => {
                const badge = reviewStatusBadge(draft.status);
                const updated = formatUpdatedAt(draft.updatedAt);
                return (
                  <div key={draft.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">{taxpayerLabel(draft)}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-600">
                        {ownerLabel(draft)} &middot; AY {draft.assessmentYear}
                        {draft.itrType ? <> &middot; {draft.itrType.replace(/_/g, " ")}</> : null}
                        {updated ? <> &middot; saved {updated}</> : null}
                      </p>
                      <StatusBadge className="mt-2" status={badge.tone as ComplianceStatus} label={badge.label} />
                    </div>
                    <Link href={`/itr/filing/${draft.id}`}>
                      <Button type="button" className="shrink-0 bg-blue-600 text-white hover:bg-blue-700">
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </MyeCard>
        ) : null}

        <div ref={previousSectionRef}>
          <MyeCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-950">Previous ITR documents</h2>
              <Link href="/documents" className="text-sm font-black text-blue-700 hover:text-blue-800">
                Document vault
              </Link>
            </div>

            {taxReturns.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 text-sm font-black text-slate-900">No ITR records yet</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                  Filed returns, acknowledgments, and linked documents appear here after the first filing.
                </p>
                <Link href="/itr/filing/new">
                  <Button type="button" className="mt-4 bg-blue-600 text-white hover:bg-blue-700">
                    <FilePlus2 className="h-4 w-4" />
                    Start a new filing
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-5">
                {yearGroups.map((group) => (
                  <div key={group.assessmentYear}>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                      AY {group.assessmentYear}
                    </p>
                    <div className="mt-2 space-y-3">
                      {group.returns.map((record) => {
                        const badge = reviewStatusBadge(record.status);
                        const linkedDocuments = documentsByReturn.get(record.id) ?? [];
                        return (
                          <Collapsible key={record.id}>
                            <div className="rounded-lg border border-slate-200 bg-white p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-black text-slate-950">{taxpayerLabel(record)}</p>
                                  <p className="mt-1 text-xs font-semibold text-slate-600">
                                    {ownerLabel(record)}
                                    {record.itrType ? <> &middot; {record.itrType.replace(/_/g, " ")}</> : null}
                                    {record.acknowledgmentNumber ? <> &middot; Ack {record.acknowledgmentNumber}</> : null}
                                    {typeof record.refundAmount === "number" && record.refundAmount > 0
                                      ? <> &middot; Refund {formatInr(record.refundAmount)}</>
                                      : null}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <StatusBadge status={badge.tone as ComplianceStatus} label={badge.label} />
                                  {isOpenDraft(record.status) ? (
                                    <Link href={`/itr/filing/${record.id}`}>
                                      <Button type="button" size="sm" variant="outline" className="border-blue-200 bg-blue-50 font-black text-blue-700 hover:bg-blue-100">
                                        Continue
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Link href={`/itr/filing/${record.id}`}>
                                      <Button type="button" size="sm" variant="outline" className="font-black text-slate-700">
                                        View status
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </div>

                              <CollapsibleTrigger asChild>
                                <button
                                  type="button"
                                  className="mt-3 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
                                >
                                  <span>
                                    {linkedDocuments.length
                                      ? `${linkedDocuments.length} linked ${linkedDocuments.length === 1 ? "document" : "documents"}`
                                      : "Documents and export"}
                                  </span>
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="mt-2 space-y-2">
                                  {linkedDocuments.map((vaultDocument) => (
                                    <div
                                      key={vaultDocument.id}
                                      className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                                    >
                                      <span className="min-w-0 truncate text-sm font-semibold text-slate-700">
                                        {vaultDocument.name || vaultDocument.originalName || vaultDocument.id}
                                      </span>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="shrink-0 font-black text-blue-700 hover:bg-blue-50"
                                        onClick={() => void downloadDocument(vaultDocument)}
                                      >
                                        <Download className="h-4 w-4" />
                                        Download
                                      </Button>
                                    </div>
                                  ))}
                                  {linkedDocuments.length === 0 ? (
                                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500">
                                      No documents linked to this return yet.
                                    </p>
                                  ) : null}
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className={cn("font-black text-slate-700 hover:bg-slate-100")}
                                    onClick={() => void downloadReturnJson(record.id)}
                                  >
                                    <FileJson className="h-4 w-4" />
                                    Export draft JSON
                                  </Button>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </MyeCard>
        </div>
      </div>
    </Layout>
  );
}
