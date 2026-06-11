import { ArrowRight, FileText, Loader2, RotateCcw, Upload } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/platform/compliance-ui";
import type { ItrDocumentChecklistItem } from "@shared/itr-filing";

export type DocumentCaptureStatus = "idle" | "uploading" | "uploaded" | "error" | "deferred";

function documentStatus(status: DocumentCaptureStatus, required: boolean) {
  if (status === "uploaded") return { status: "filed" as const, label: "Linked" };
  if (status === "uploading") return { status: "in_progress" as const, label: "Uploading" };
  if (status === "error") return { status: "failed" as const, label: "Upload failed" };
  if (status === "deferred") return { status: "not_started" as const, label: "Provide later" };
  return required
    ? { status: "action_required" as const, label: "Required" }
    : { status: "not_started" as const, label: "Optional" };
}

export function DocumentCaptureCard({
  item,
  status,
  linkedDocumentName,
  manualReference = "",
  error,
  onUpload,
  onRetry,
  onDefer,
  onVaultPick,
  onManualReferenceChange,
  helperHref,
  helperLabel,
}: {
  item: ItrDocumentChecklistItem;
  status: DocumentCaptureStatus;
  linkedDocumentName?: string;
  manualReference?: string;
  error?: string;
  onUpload: (file: File) => void;
  onRetry?: () => void;
  onDefer?: () => void;
  onVaultPick?: () => void;
  onManualReferenceChange?: (value: string) => void;
  helperHref?: string;
  helperLabel?: string;
}) {
  const presentation = documentStatus(status, item.required);
  const uploading = status === "uploading";

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <FileText className="h-5 w-5 text-blue-700" />
          <h3 className="mt-2 text-sm font-black text-slate-950">{item.title}</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{item.reason}</p>
        </div>
        <StatusBadge status={presentation.status} label={presentation.label} />
      </div>

      {linkedDocumentName ? <p className="mt-3 text-sm font-black text-emerald-800">{linkedDocumentName}</p> : null}
      {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-button bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading" : "Camera or file"}
          <input
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            disabled={uploading}
            aria-label={`Upload ${item.title}`}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </label>
        {onVaultPick ? (
          <Button type="button" variant="outline" onClick={onVaultPick} className="h-11 border-slate-200 bg-white">
            Select from vault
          </Button>
        ) : null}
      </div>

      {onManualReferenceChange ? (
        <Input
          value={manualReference}
          onChange={(event) => onManualReferenceChange(event.target.value)}
          placeholder="Document name or vault reference"
          aria-label={`${item.title} manual reference`}
          className="mt-3 h-11 rounded-lg bg-white"
        />
      ) : null}

      {helperHref && helperLabel ? (
        <Link href={helperHref} className="mt-3 inline-flex items-center gap-1 text-sm font-black text-blue-700 hover:underline">
          {helperLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {status === "error" && onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry} className="h-10 border-red-200 bg-red-50 text-red-700">
            <RotateCcw className="h-4 w-4" />
            Retry upload
          </Button>
        ) : null}
        {onDefer ? (
          <Button type="button" variant="ghost" onClick={onDefer} className="h-10 text-slate-600">
            Provide later
          </Button>
        ) : null}
      </div>
    </section>
  );
}
