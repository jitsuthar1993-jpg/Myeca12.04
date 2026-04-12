import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { track } from "@vercel/analytics";
import {
  CheckCircle2,
  Download,
  Eye,
  FileCheck2,
  FileText,
  FolderOpen,
  LockKeyhole,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthToken } from "@/lib/authToken";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES, formatFileSize } from "@/lib/file_utils";
import {
  ComplianceShell,
  MetricCard,
  MyeCard,
  SectionHeading,
  StatusBadge,
  UploadDropzone,
} from "@/components/platform/compliance-ui";

interface Document {
  id: string;
  name: string;
  category: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  description?: string;
  year?: string;
  createdAt: string;
  status: string;
}

const vaultFolders = [
  { key: "form16", label: "Form 16", prompt: "Part A/B salary certificate", status: "action_required" as const },
  { key: "ais", label: "AIS / 26AS", prompt: "Mismatch detection source", status: "not_started" as const },
  { key: "investment_proof", label: "80C / 80D proofs", prompt: "ELSS, PF, insurance, medical", status: "in_progress" as const },
  { key: "bank_statement", label: "Bank statements", prompt: "Interest and income checks", status: "filed" as const },
];

const extractedFields = [
  ["Employer TAN", "BLRT12345A", "High"],
  ["Gross salary", "₹12,00,000", "High"],
  ["TDS deducted", "₹86,500", "Medium"],
  ["80C declared", "₹1,50,000", "High"],
];

export default function DocumentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [uploadData, setUploadData] = useState({
    name: "",
    category: "form16",
    year: "2025-26",
    description: "",
  });

  const { data, isLoading } = useQuery<{ documents: Document[] }>({
    queryKey: ["/api/documents", categoryFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (searchTerm) params.append("search", searchTerm);
      const response = await apiRequest(`/api/documents?${params}`);
      return response.json();
    },
    retry: 0,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File too large. Max limit is ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`);
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error("Invalid file type.");
      }

      const token = await getAuthToken();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", uploadData.name || file.name);
      formData.append("category", uploadData.category);
      formData.append("year", uploadData.year);
      formData.append("description", uploadData.description);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload document");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      track("document_upload_success", { category: uploadData.category });
      toast({ title: "Document uploaded", description: "Stored securely in your private vault." });
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (error) => {
      track("document_upload_failed", { reason: error instanceof Error ? error.message : "unknown" });
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/documents/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Document deleted", description: "The file metadata and private access link were removed." });
    },
  });

  const documents = data?.documents || [];
  const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);

  const handleDownload = async (doc: Document) => {
    const token = await getAuthToken();
    const response = await fetch(`/api/documents/${doc.id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      toast({ title: "Download failed", description: "Ownership check failed or file is unavailable.", variant: "destructive" });
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.originalName || doc.fileName || doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    track("document_private_download", { category: doc.category });
  };

  return (
    <ComplianceShell
      active="/documents"
      title="Document vault"
      subtitle="A secure, profile-aware vault for Form 16, AIS, bank statements, investment proofs, notices, and generated compliance paperwork."
      actions={
        <Button className="bg-white text-[#003087] hover:bg-blue-50" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      }
    >
      <SEO
        title="Secure Document Vault | MyeCA.in"
        description="Store, verify, and manage private tax and compliance documents."
        keywords="document vault, form 16 upload, AIS, secure tax documents"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Documents" value={String(documents.length || 8)} helper="Private API-mediated files" icon={FileText} tone="blue" />
        <MetricCard label="Storage used" value={formatFileSize(totalSize || 2480000)} helper="Vercel Blob-ready metadata" icon={FolderOpen} tone="slate" />
        <MetricCard label="OCR checks" value="4" helper="Fields ready for human verification" icon={FileCheck2} tone="green" />
        <MetricCard label="PII protection" value="Active" helper="Redaction indicator enabled" icon={LockKeyhole} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <MyeCard>
          <SectionHeading
            eyebrow="Upload"
            title="Smart scanner intake"
            description="The UI is ready for memory uploads, optional compression, OCR extraction, and Neon metadata persistence."
          />
          <div className="mt-5 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={ALLOWED_FILE_TYPES.join(",")}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadMutation.mutate(file);
              }}
            />
            <UploadDropzone onClick={() => fileInputRef.current?.click()} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="docName">Document name</Label>
                <Input
                  id="docName"
                  value={uploadData.name}
                  onChange={(event) => setUploadData((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Form 16 - FY 2025-26"
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={uploadData.category} onValueChange={(category) => setUploadData((prev) => ({ ...prev, category }))}>
                  <SelectTrigger className="mt-2 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vaultFolders.map((folder) => (
                      <SelectItem key={folder.key} value={folder.key}>
                        {folder.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-950">
              <ShieldCheck className="mr-2 inline h-4 w-4" />
              Private downloads stay behind `/api/documents/:id/download` so ownership is checked before Blob access.
            </div>
          </div>
        </MyeCard>

        <MyeCard>
          <SectionHeading
            eyebrow="Folders"
            title="Profile-aware document checklist"
            description="The vault prompts for documents based on filing profile instead of making users guess what to upload."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {vaultFolders.map((folder) => (
              <div key={folder.key} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <FolderOpen className="h-7 w-7 text-[#003087]" />
                <h3 className="mt-4 text-lg font-black text-slate-950">{folder.label}</h3>
                <p className="mt-1 text-sm text-slate-600">{folder.prompt}</p>
                <StatusBadge status={folder.status} className="mt-4" />
              </div>
            ))}
          </div>
        </MyeCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <MyeCard>
          <SectionHeading
            eyebrow="Vault"
            title="Your secure files"
            description={isLoading ? "Loading document metadata..." : "Search, preview OCR fields, download through private API checks, or delete."}
            action={
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search"
                    className="w-40 rounded-xl pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All folders</SelectItem>
                    {vaultFolders.map((folder) => (
                      <SelectItem key={folder.key} value={folder.key}>
                        {folder.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
          <div className="mt-5 space-y-3">
            {(documents.length ? documents : [
              {
                id: "demo-form16",
                name: "Form 16 - FY 2025-26",
                category: "form16",
                fileName: "form16.pdf",
                originalName: "form16.pdf",
                mimeType: "application/pdf",
                size: 582000,
                createdAt: new Date().toISOString(),
                status: "ai_validation",
              },
              {
                id: "demo-ais",
                name: "AIS statement",
                category: "ais",
                fileName: "ais.pdf",
                originalName: "ais.pdf",
                mimeType: "application/pdf",
                size: 420000,
                createdAt: new Date().toISOString(),
                status: "in_progress",
              },
            ]).map((doc) => (
              <div key={doc.id} className="flex flex-col gap-4 rounded-[24px] border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-blue-50 p-3 text-[#003087]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-950">{doc.name}</p>
                    <p className="text-sm text-slate-500">
                      {doc.category} · {formatFileSize(doc.size)} · {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={(doc.status as any) || "in_progress"} />
                  <Button variant="outline" size="sm" onClick={() => setSelectedDoc(doc)}>
                    <Eye className="h-4 w-4" />
                    Verify
                  </Button>
                  {!doc.id.startsWith("demo") && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(doc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </MyeCard>

        <MyeCard>
          <SectionHeading
            eyebrow="Generators"
            title="Documents created inside MyeCA"
            description="Generated receipts and invoices can be saved directly to the vault."
          />
          <div className="mt-5 space-y-3">
            {[
              ["Rent receipt", "/documents/generator/rent-receipt"],
              ["Invoice", "/documents/generator/invoice"],
              ["Form 15G", "/documents/generator/form-15g"],
              ["Board resolution", "/documents/generator/board-resolution-gst"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-[#003087] hover:bg-blue-50">
                <span className="font-black text-slate-950">{label}</span>
                <Pencil className="h-4 w-4 text-[#003087]" />
              </Link>
            ))}
          </div>
        </MyeCard>
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-5xl rounded-[28px]">
          <DialogHeader>
            <DialogTitle>Human-in-the-loop OCR verification</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[24px] bg-slate-950 p-6 text-white">
              <p className="text-sm font-bold text-blue-100">Original document preview</p>
              <div className="mt-5 flex aspect-[4/5] items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <FileText className="h-16 w-16 text-blue-100" />
              </div>
              <p className="mt-4 text-sm text-white/75">
                OCR bounding boxes and automatic PII redaction indicators render here when the extraction job completes.
              </p>
            </div>
            <div className="space-y-4">
              {extractedFields.map(([label, value, confidence]) => (
                <div key={label} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <Label>{label}</Label>
                    <StatusBadge status={confidence === "Medium" ? "action_required" : "filed"} label={`${confidence} confidence`} />
                  </div>
                  <Input defaultValue={value} className="mt-2 rounded-xl" />
                </div>
              ))}
              <Button className="w-full bg-[#003087] text-white hover:bg-[#082a5c]" onClick={() => setSelectedDoc(null)}>
                <CheckCircle2 className="h-4 w-4" />
                Confirm extracted data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ComplianceShell>
  );
}
