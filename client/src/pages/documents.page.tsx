import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/authToken";
import { ALLOWED_FILE_TYPES, formatFileSize, prepareDocumentForUpload } from "@/lib/file_utils";
import { apiRequest } from "@/lib/queryClient";
import { Layout } from "@/components/admin/Layout";
import { shouldLoadProductionTelemetry } from "@/utils/runtime-env";
import { invalidateDocumentCaches } from "@/lib/workspace-cache";

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

const documentCategories = [
  { key: "form16", label: "Form 16", prompt: "Salary certificate" },
  { key: "ais", label: "AIS / 26AS", prompt: "Tax statement" },
  { key: "investment_proof", label: "Investment proofs", prompt: "80C / 80D proofs" },
  { key: "bank_statement", label: "Bank statements", prompt: "Interest and income checks" },
];

async function trackDocumentEvent(name: string, properties: Record<string, string>) {
  if (!shouldLoadProductionTelemetry()) return;
  const { track } = await import("@vercel/analytics");
  track(name, properties);
}

function formatDocumentDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusLabel(value?: string | null) {
  return (value || "active").replace(/_/g, " ");
}

export default function DocumentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [uploadData, setUploadData] = useState({
    name: "",
    category: "form16",
    year: "2025-26",
    description: "",
  });

  const { data, isLoading } = useQuery<{ documents: Document[] }>({
    queryKey: ["/api/documents", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      const queryString = params.toString();
      const response = await apiRequest(queryString ? `/api/documents?${queryString}` : "/api/documents");
      return response.json();
    },
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
    onSuccess: async () => {
      await invalidateDocumentCaches(queryClient);
      void trackDocumentEvent("document_upload_success", { category: uploadData.category });
      toast({ title: "Document uploaded", description: "Stored securely in your private vault." });
      setUploadData((current) => ({ ...current, name: "", description: "" }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (error) => {
      void trackDocumentEvent("document_upload_failed", {
        reason: error instanceof Error ? error.message : "unknown",
      });
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/documents/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await invalidateDocumentCaches(queryClient);
      toast({ title: "Document deleted", description: "The file metadata and private access link were removed." });
    },
  });

  const documents = data?.documents || [];
  const uploadedCategories = new Set(documents.map((doc) => doc.category));
  const pendingUploadItems = documentCategories.filter((item) => !uploadedCategories.has(item.key));

  const handleDownload = async (doc: Document) => {
    const token = await getAuthToken();
    const response = await fetch(`/api/documents/${doc.id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      toast({
        title: "Download failed",
        description: "Ownership check failed or file is unavailable.",
        variant: "destructive",
      });
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

      <div className="space-y-6 pb-16">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="type-meta font-black uppercase tracking-[0.16em] text-blue-700">Documents</p>
          <h1 className="mt-2 type-page-title font-black text-slate-950">Document Vault</h1>
          <p className="mt-2 max-w-2xl type-body text-slate-600">
            Keep uploaded documents, new uploads, and pending document needs in one simple workspace.
          </p>
        </section>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="min-w-0 overflow-hidden rounded-lg border-slate-200 shadow-sm">
            <CardHeader className="gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="[&>p]:mb-0">
                <CardTitle className="type-card-title font-black text-slate-950">My Documents</CardTitle>
                <CardDescription className="type-support text-slate-500">
                  Uploaded files connected to your account.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search documents"
                  className="h-10 rounded-lg border-slate-200 bg-white pl-10 text-sm"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 type-meta font-black uppercase tracking-[0.12em] text-slate-500">Document</th>
                      <th className="px-5 py-3 type-meta font-black uppercase tracking-[0.12em] text-slate-500">Category</th>
                      <th className="px-5 py-3 type-meta font-black uppercase tracking-[0.12em] text-slate-500">Uploaded</th>
                      <th className="px-5 py-3 type-meta font-black uppercase tracking-[0.12em] text-slate-500">Status</th>
                      <th className="px-5 py-3 text-right type-meta font-black uppercase tracking-[0.12em] text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading && (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center type-support font-semibold text-slate-500">
                          Loading documents...
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50">
                          <td className="px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 [&>p]:mb-0">
                                <p className="truncate type-support font-black text-slate-950">{doc.name}</p>
                                <p className="mt-0.5 type-meta font-semibold text-slate-500">
                                  {formatFileSize(doc.size)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 type-support font-semibold text-slate-700">{doc.category}</td>
                          <td className="px-5 py-4 type-support font-semibold text-slate-700">
                            {formatDocumentDate(doc.createdAt)}
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant="outline" className="border-slate-200 bg-slate-50 type-meta font-black uppercase tracking-[0.1em] text-slate-600">
                              {statusLabel(doc.status)}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                                onClick={() => setSelectedDoc(doc)}
                                aria-label={`Preview ${doc.name}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                                onClick={() => handleDownload(doc)}
                                aria-label={`Download ${doc.name}`}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => deleteMutation.mutate(doc.id)}
                                aria-label={`Delete ${doc.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {!isLoading && documents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-14 text-center">
                          <FolderOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                          <p className="type-support font-black text-slate-950">No documents uploaded yet</p>
                          <p className="mt-1 type-support text-slate-500">Your uploaded files will appear here.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 p-5">
                <CardTitle className="type-card-title font-black text-slate-950">Upload Documents</CardTitle>
                <CardDescription className="type-support text-slate-500">
                  Add a file to your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
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

                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="mt-3 type-support font-black text-slate-950">Select file</p>
                  <p className="mt-1 type-support text-slate-500">PDF, image, Word or Excel</p>
                  <Button
                    className="mt-4 h-10 rounded-lg bg-blue-700 px-4 text-sm font-black text-white hover:bg-blue-600"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Choose File"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="type-meta font-black uppercase tracking-[0.12em] text-slate-500">Document Name</Label>
                  <Input
                    value={uploadData.name}
                    onChange={(event) => setUploadData((current) => ({ ...current, name: event.target.value }))}
                    placeholder="e.g. Form 16"
                    className="h-10 rounded-lg border-slate-200 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="type-meta font-black uppercase tracking-[0.12em] text-slate-500">Category</Label>
                  <Select
                    value={uploadData.category}
                    onValueChange={(category) => setUploadData((current) => ({ ...current, category }))}
                  >
                    <SelectTrigger className="h-10 rounded-lg border-slate-200 text-sm font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories.map((category) => (
                        <SelectItem key={category.key} value={category.key}>
                          {category.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 p-5">
                <CardTitle className="type-card-title font-black text-slate-950">Pending Upload</CardTitle>
                <CardDescription className="type-support text-slate-500">
                  Common files still missing from this vault.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {pendingUploadItems.length ? (
                  pendingUploadItems.map((item) => (
                    <div key={item.key} className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="min-w-0 flex-1 [&>p]:mb-0">
                        <p className="type-support font-black text-slate-950">{item.label}</p>
                        <p className="mt-1 type-support text-slate-500">{item.prompt}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                    <p className="type-support font-black text-emerald-800">All common uploads are present.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-xl rounded-lg border-slate-200 p-0">
          <DialogHeader className="border-b border-slate-100 p-6">
            <DialogTitle className="type-card-title font-black text-slate-950">Document Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 p-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <p className="type-support font-black text-slate-950">{selectedDoc?.name}</p>
              <p className="mt-2 type-support text-slate-500">
                {selectedDoc?.category} - {selectedDoc ? formatFileSize(selectedDoc.size) : ""}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-11 flex-1 rounded-lg bg-blue-700 font-black text-white hover:bg-blue-600"
                onClick={() => selectedDoc && handleDownload(selectedDoc)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-lg border-slate-200 font-black"
                onClick={() => setSelectedDoc(null)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
