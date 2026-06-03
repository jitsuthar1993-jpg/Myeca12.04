import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileCheck2,
  FileText,
  FolderOpen,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Layout } from "@/components/admin/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthToken } from "@/lib/authToken";
import { ALLOWED_FILE_TYPES, formatFileSize, prepareDocumentForUpload } from "@/lib/file_utils";
import { cn } from "@/lib/utils";
import { caseTimelineStages, vaultChecklist } from "@/data/competitive-growth";
import { shouldLoadProductionTelemetry } from "@/utils/runtime-env";

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

const generatorLinks = [
  ["Rent Receipt", "/documents/generator/rent-receipt"],
  ["Invoice", "/documents/generator/invoice"],
  ["Form 15G", "/documents/generator/form-15g"],
  ["Board Resolution", "/documents/generator/board-resolution-gst"],
];

const extractedFields: Array<[string, string, string]> = [];

function formatStatus(status?: string) {
  return (status || "stored").replace(/_/g, " ");
}

async function trackDocumentEvent(name: string, properties: Record<string, string>) {
  if (!shouldLoadProductionTelemetry()) return;
  const { track } = await import("@vercel/analytics");
  track(name, properties);
}

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
    profileId: "none",
    userServiceId: "none",
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

  const { data: profiles = [] } = useQuery<any[]>({
    queryKey: ["/api/profiles"],
    retry: 0,
  });

  const { data: userServices = [] } = useQuery<any[]>({
    queryKey: ["/api/user-services"],
    retry: 0,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const preparedFile = await prepareDocumentForUpload(file);

      const token = await getAuthToken();
      const formData = new FormData();
      formData.append("file", preparedFile);
      formData.append("name", uploadData.name || preparedFile.name);
      formData.append("category", uploadData.category);
      formData.append("year", uploadData.year);
      formData.append("description", uploadData.description);
      if (uploadData.profileId !== "none") formData.append("profileId", uploadData.profileId);
      if (uploadData.userServiceId !== "none") formData.append("userServiceId", uploadData.userServiceId);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || "Failed to upload document");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      void trackDocumentEvent("document_upload_success", { category: uploadData.category });
      toast({ title: "Document uploaded", description: "Stored securely in your private vault." });
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (error) => {
      void trackDocumentEvent("document_upload_failed", { reason: error instanceof Error ? error.message : "unknown" });
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

  const stats = [
    { label: "Files", value: documents.length, icon: FileText, tone: "blue" },
    { label: "Storage", value: formatFileSize(totalSize), icon: FolderOpen, tone: "indigo" },
    { label: "Readiness", value: vaultChecklist.length, icon: ShieldCheck, tone: "emerald" },
    { label: "Generators", value: generatorLinks.length, icon: FileCheck2, tone: "amber" },
  ];

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
    void trackDocumentEvent("document_private_download", { category: doc.category });
  };

  return (
    <Layout title="Documents">
      <SEO
        title="Secure Document Vault | MyeCA.in"
        description="Store, verify, and manage private tax and compliance documents."
        keywords="document vault, form 16 upload, AIS, secure tax documents"
      />

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

      <div className="space-y-5 pb-12 md:space-y-6">
        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="space-y-2">
            <h1 className="type-page-title text-slate-900">Document Vault</h1>
            <p className="type-body max-w-2xl font-medium text-slate-500">
              Keep tax records, filing proofs, and service documents organized inside your private workspace.
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-full rounded-lg bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800 md:h-10 md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-lg border-slate-200 shadow-none">
              <CardContent className="flex min-h-[112px] flex-col items-start gap-3 p-4 sm:min-h-0 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    stat.tone === "blue" && "bg-blue-50 text-blue-600",
                    stat.tone === "indigo" && "bg-indigo-50 text-indigo-600",
                    stat.tone === "emerald" && "bg-emerald-50 text-emerald-600",
                    stat.tone === "amber" && "bg-amber-50 text-amber-600",
                  )}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="type-meta font-bold uppercase text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <Card className="overflow-hidden rounded-lg border-slate-200 shadow-none">
              <CardHeader className="border-b border-slate-100 p-4 md:p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="type-card-title text-slate-900">Authenticated Files</CardTitle>
                    <CardDescription className="type-support mt-1 font-medium text-slate-500">
                      Search, filter, preview, download, or remove documents from your vault.
                    </CardDescription>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px] md:w-[440px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search documents..."
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-10 text-sm font-medium focus-visible:ring-blue-100"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
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
              </CardHeader>

              <CardContent className="p-0">
                <div className="grid gap-3 p-4 md:hidden">
                  {isLoading ? (
                    <div className="rounded-lg border border-slate-200 bg-white px-5 py-12 text-center text-sm font-bold text-slate-400">
                      Loading documents...
                    </div>
                  ) : documents.length ? (
                    documents.map((doc) => (
                      <div key={doc.id} className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900">{doc.name}</p>
                            <p className="type-meta mt-1 font-bold uppercase text-slate-400">
                              {doc.category} - {formatFileSize(doc.size)}
                            </p>
                          </div>
                          <Badge variant="outline" className="type-meta border-slate-200 bg-slate-50 px-2.5 py-1 font-bold capitalize text-slate-600">
                            {formatStatus(doc.status)}
                          </Badge>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <Button variant="outline" className="h-10 rounded-lg text-xs font-bold" onClick={() => setSelectedDoc(doc)}>
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="outline" className="h-10 rounded-lg text-xs font-bold" onClick={() => handleDownload(doc)}>
                            <Download className="mr-1 h-4 w-4" />
                            Save
                          </Button>
                          <Button variant="outline" className="h-10 rounded-lg text-xs font-bold text-red-600" onClick={() => deleteMutation.mutate(doc.id)}>
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyDocumentsState onUpload={() => fileInputRef.current?.click()} />
                  )}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Document</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Category</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Status</th>
                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {isLoading ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-16 text-center text-sm font-bold text-slate-400">
                            Loading documents...
                          </td>
                        </tr>
                      ) : documents.length ? (
                        documents.map((doc) => (
                          <tr key={doc.id} className="group transition-colors hover:bg-blue-50/30">
                            <td className="px-5 py-5">
                              <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-slate-900">{doc.name}</p>
                                  <p className="type-meta mt-1 font-semibold text-slate-400">
                                    {formatFileSize(doc.size)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-5">
                              <p className="text-sm font-bold capitalize text-slate-700">{doc.category.replace(/_/g, " ")}</p>
                              <p className="type-meta mt-1 font-semibold text-slate-400">{doc.year || "Current year"}</p>
                            </td>
                            <td className="px-5 py-5">
                              <Badge variant="outline" className="type-meta border-slate-200 bg-slate-50 px-3 py-1 font-bold capitalize text-slate-600">
                                {formatStatus(doc.status)}
                              </Badge>
                            </td>
                            <td className="px-5 py-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-700" onClick={() => setSelectedDoc(doc)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-700" onClick={() => handleDownload(doc)}>
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => deleteMutation.mutate(doc.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-8 py-16">
                            <EmptyDocumentsState onUpload={() => fileInputRef.current?.click()} />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-200 shadow-none">
              <CardHeader className="border-b border-slate-100 p-4 md:p-5">
                <CardTitle className="type-card-title text-slate-900">Filing Readiness</CardTitle>
                <CardDescription className="type-support mt-1 font-medium text-slate-500">
                  What a CA can verify once documents are linked to a filing or service.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-4 md:grid-cols-2 md:p-5">
                {vaultChecklist.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.label}</p>
                        <p className="mt-1 type-support font-medium text-slate-500">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-200 shadow-none">
              <CardHeader className="border-b border-slate-100 p-4 md:p-5">
                <CardTitle className="type-card-title text-slate-900">Case Workflow</CardTitle>
                <CardDescription className="type-support mt-1 font-medium text-slate-500">
                  Linked files move with the related service workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 md:p-5">
                {caseTimelineStages.map((stage, index) => (
                  <div key={stage} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="type-meta font-bold uppercase tracking-[0.12em] text-slate-400">Stage {index + 1}</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{stage}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card className="rounded-lg border-slate-200 shadow-none">
              <CardHeader className="border-b border-slate-100 p-4 md:p-5">
                <CardTitle className="type-card-title text-slate-900">Quick Upload</CardTitle>
                <CardDescription className="type-support mt-1 font-medium text-slate-500">
                  Add a document and optionally connect it to a profile or case.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-4 md:p-5">
                <button
                  type="button"
                  className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-blue-300 hover:bg-blue-50/40"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-600">
                    <Upload className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {uploadMutation.isPending ? "Uploading..." : "Choose a file"}
                  </span>
                  <span className="mt-1 text-xs font-medium text-slate-500">PDF, image, Word or Excel</span>
                </button>

                <div className="space-y-4">
                  <FieldLabel label="Document Name">
                    <Input
                      value={uploadData.name}
                      onChange={(event) => setUploadData((previous) => ({ ...previous, name: event.target.value }))}
                      placeholder="e.g. Form 16"
                      className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold"
                    />
                  </FieldLabel>

                  <FieldLabel label="Category">
                    <Select value={uploadData.category} onValueChange={(category) => setUploadData((previous) => ({ ...previous, category }))}>
                      <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold">
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
                  </FieldLabel>

                  <FieldLabel label="Taxpayer Profile">
                    <Select value={uploadData.profileId} onValueChange={(profileId) => setUploadData((previous) => ({ ...previous, profileId }))}>
                      <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Current user</SelectItem>
                        {profiles.map((profile: any) => (
                          <SelectItem key={profile.id} value={String(profile.id)}>
                            {profile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="type-support font-medium text-slate-400">
                      Use this when a file belongs to a saved family or taxpayer profile.
                    </p>
                  </FieldLabel>

                  <FieldLabel label="Linked Service">
                    <Select value={uploadData.userServiceId} onValueChange={(userServiceId) => setUploadData((previous) => ({ ...previous, userServiceId }))}>
                      <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Keep in vault only</SelectItem>
                        {userServices.map((service: any) => (
                          <SelectItem key={service.id} value={String(service.id)}>
                            {service.serviceTitle || service.serviceId || "Service"} - {String(service.status || "pending").replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="type-support font-medium text-slate-400">
                      {userServices.length
                        ? "Attach this file to an active case so it appears in that workspace."
                        : "No service cases yet. Start a service first if this file should move a case forward."}
                    </p>
                  </FieldLabel>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-200 shadow-none">
              <CardHeader className="border-b border-slate-100 p-4 md:p-5">
                <CardTitle className="type-card-title text-slate-900">Document Generators</CardTitle>
                <CardDescription className="type-support mt-1 font-medium text-slate-500">
                  Create common documents inside MyeCA.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-4 md:p-5">
                {generatorLinks.map(([label, href]) => (
                  <Link key={href} href={href}>
                    <div className="flex min-h-[44px] items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-200 hover:bg-slate-50">
                      <span>{label}</span>
                      <Pencil className="h-4 w-4 text-slate-300" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="z-[60] max-h-[calc(100vh-2rem)] max-w-2xl overflow-y-auto rounded-lg border-slate-200 bg-white p-0 shadow-xl">
          <DialogHeader className="border-b border-slate-100 p-5">
            <DialogTitle className="flex items-center gap-3 text-lg font-bold text-slate-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                <FileText className="h-5 w-5" />
              </span>
              Document Preview
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 p-5">
            <div>
              <h2 className="type-card-title font-bold text-slate-900">Extraction Status</h2>
              <p className="type-support mt-1 font-medium text-slate-500">
                This file is stored securely. OCR verification is not available for this document yet.
              </p>
            </div>

            {extractedFields.length ? (
              <div className="space-y-4">
                {extractedFields.map(([label, value, confidence]) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="type-meta font-bold uppercase tracking-[0.12em] text-slate-400">{label}</Label>
                      <Badge
                        variant="outline"
                        className={cn(
                          "type-meta border-none px-2 py-0.5 font-bold uppercase",
                          confidence === "High" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {confidence} Match
                      </Badge>
                    </div>
                    <Input defaultValue={value} className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">{selectedDoc?.name}</p>
                <p className="mt-2 type-support font-medium text-slate-500">
                  Download the original file or wait for OCR metadata to be generated before confirming extracted values.
                </p>
              </div>
            )}

            <Button className="h-11 w-full rounded-lg bg-blue-700 font-bold text-white hover:bg-blue-800" onClick={() => setSelectedDoc(null)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="type-meta ml-1 font-bold uppercase tracking-[0.12em] text-slate-400">{label}</Label>
      {children}
    </div>
  );
}

function EmptyDocumentsState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-10 text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-300">
        <FolderOpen className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">No documents uploaded yet</h3>
      <p className="mt-2 text-sm font-medium text-slate-500">
        Upload Form 16, AIS, bank statements, or investment proofs to build your private vault.
      </p>
      <Button onClick={onUpload} className="mt-6 h-10 rounded-lg bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800">
        <Plus className="mr-2 h-4 w-4" />
        Upload Document
      </Button>
    </div>
  );
}
