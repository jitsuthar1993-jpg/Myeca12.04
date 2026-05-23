import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
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
  Plus,
  ChevronRight
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
import { ALLOWED_FILE_TYPES, formatFileSize, prepareDocumentForUpload } from "@/lib/file_utils";
import { Layout } from "@/components/admin/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const extractedFields: Array<[string, string, string]> = [];

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
    <Layout>
      <SEO
        title="Secure Document Vault | MyeCA.in"
        description="Store, verify, and manage private tax and compliance documents."
        keywords="document vault, form 16 upload, AIS, secure tax documents"
      />

      <div className="flex flex-col lg:flex-row gap-12 items-start bg-slate-50/50 rounded-[48px] p-2">
        {/* Sticky Left Summary Section */}
        <div className="lg:w-96 shrink-0 w-full space-y-6 lg:sticky lg:top-[112px]">
          <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-100/50">
             <div className="h-28 bg-gradient-to-br from-blue-500 to-indigo-500 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
             </div>
             <CardContent className="relative px-6 pb-8">
                <div className="flex flex-col items-center -mt-14">
                   <div className="w-28 h-28 rounded-[40px] bg-white p-2 shadow-2xl">
                      <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-4xl font-black text-blue-600 border border-blue-100">
                         <FolderOpen className="h-10 w-10" />
                      </div>
                   </div>
                   <div className="mt-5 text-center">
                      <h2 className="type-card-title font-black text-slate-900 tracking-tight">Security Vault</h2>
                      <Badge variant="outline" className="mt-2 bg-emerald-50 text-emerald-700 border-none font-black type-meta uppercase tracking-widest px-2.5 py-0.5">
                         Encryption Active
                      </Badge>
                   </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3">
                   {[
                     { label: "Storage", value: formatFileSize(totalSize), icon: LockKeyhole, color: "blue" },
                     { label: "Files", value: documents.length, icon: FileText, color: "indigo" },
                     { label: "OCR Checks", value: "Preview", icon: FileCheck2, color: "emerald" },
                     { label: "Vaults", value: vaultFolders.length, icon: FolderOpen, color: "purple" }
                   ].map((stat, i) => (
                     <div key={i} className="p-4 rounded-3xl bg-slate-50 border border-slate-100/50 flex flex-col items-center text-center">
                        <stat.icon className={cn("h-4 w-4 mb-2", `text-${stat.color}-600`)} />
                        <span className="type-meta font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                        <span className="type-support font-black text-slate-900 leading-none">{stat.value}</span>
                     </div>
                   ))}
                </div>

                <div className="mt-10 space-y-3">
                   <p className="type-meta font-black text-slate-400 uppercase tracking-widest ml-1">Private Folders</p>
                   {vaultFolders.map((folder) => (
                      <div key={folder.key} className="flex items-center justify-between p-4 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                               <FolderOpen className="h-4 w-4" />
                            </div>
                            <span className="type-meta font-black text-slate-700 group-hover:text-blue-600 transition-colors">{folder.label}</span>
                         </div>
                         <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-blue-600" />
                      </div>
                   ))}
                </div>
             </CardContent>
          </Card>

          <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100/50 relative overflow-hidden group cursor-pointer shadow-xl shadow-blue-50">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 transition-all group-hover:scale-150" />
             <ShieldCheck className="h-8 w-8 text-blue-500 mb-6" />
             <h3 className="type-card-title font-black mb-3 text-slate-900">AI Verification</h3>
             <p className="text-slate-500 type-support font-medium mb-6">OCR extraction will appear only after a real document scan is available for a file.</p>
             <Button disabled className="w-full bg-slate-100 text-slate-400 font-black type-meta uppercase tracking-widest h-11 rounded-2xl border-none">Scan Preview</Button>
          </div>

          <Card className="border-none shadow-sm rounded-[32px] bg-white">
            <CardHeader className="p-6 border-b border-slate-50">
              <CardTitle className="type-card-title font-black uppercase tracking-widest">Filing readiness</CardTitle>
              <CardDescription className="type-support">What the CA can verify from this vault.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {vaultChecklist.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <div>
                      <p className="type-support font-black text-slate-800">{item.label}</p>
                      <p className="mt-1 type-support font-medium text-slate-500">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area - Full Page Scroll */}
        <div className="flex-1 min-w-0 w-full lg:max-w-7xl space-y-10 pb-20">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-12 rounded-[48px] shadow-sm border border-slate-100/50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                 <span className="type-meta font-black uppercase tracking-[0.2em] text-blue-600">Secure Storage</span>
              </div>
              <h1 className="type-page-title font-black text-slate-900">Document Vault</h1>
              <p className="text-slate-500 max-w-2xl type-body font-medium">
                Profile-aware, encrypted storage for your financial and compliance paperwork.
              </p>
            </div>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="h-16 px-10 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-100 hover:-translate-y-1"
            >
              <Plus className="h-5 w-5 mr-3" />
              Upload Document
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            {/* Main Vault Table */}
            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Authenticated Files</CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-500">Search and manage your private compliance documents.</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500" />
                    <Input 
                      placeholder="Search vault..." 
                      className="h-9 w-40 rounded-xl bg-slate-50 border-none pl-9 text-xs font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="px-8 py-4 type-meta font-bold text-slate-400 uppercase tracking-widest">Document</th>
                        <th className="px-8 py-4 type-meta font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 type-meta font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="type-support font-bold text-slate-900">{doc.name}</p>
                                <p className="type-meta font-medium text-slate-500 uppercase tracking-tight">
                                  {doc.category} · {formatFileSize(doc.size)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                             <Badge className="bg-slate-50 text-slate-600 border-none font-bold type-meta uppercase tracking-widest px-2.5 py-1">
                                {doc.status}
                             </Badge>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => setSelectedDoc(doc)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleDownload(doc)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate(doc.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {documents.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-8 py-12 text-center">
                            <FolderOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                            <p className="type-support font-bold text-slate-900">No documents uploaded yet</p>
                            <p className="mt-1 type-support font-medium text-slate-500">
                              Upload Form 16, AIS, bank statements, or investment proofs to build your private vault.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Right Column: Upload & Generators */}
            <div className="space-y-8">
              <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50">
                  <CardTitle className="type-card-title font-bold">Quick Upload</CardTitle>
                  <CardDescription className="type-support font-medium text-slate-500">Securely ingest new compliance documents.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
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
                  <div 
                    className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 p-10 text-center transition hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="p-4 rounded-2xl bg-white shadow-sm mb-4 text-blue-600 transition group-hover:-translate-y-1">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="type-support font-bold text-slate-900">Drop files here</p>
                    <p className="type-support text-slate-400 mt-1 font-medium">PDF, image, Word or Excel (compressed when possible)</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="type-meta font-bold uppercase tracking-widest text-slate-400 ml-1">Document Name</Label>
                      <Input 
                        value={uploadData.name}
                        onChange={(e) => setUploadData(p => ({...p, name: e.target.value}))}
                        placeholder="e.g. Form 16"
                        className="h-10 rounded-xl bg-slate-50 border-none text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="type-meta font-bold uppercase tracking-widest text-slate-400 ml-1">Category</Label>
                      <Select value={uploadData.category} onValueChange={(category) => setUploadData(p => ({...p, category}))}>
                        <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none text-sm font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {vaultFolders.map(f => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="type-meta font-bold uppercase tracking-widest text-slate-400 ml-1">Taxpayer Profile</Label>
                      <Select value={uploadData.profileId} onValueChange={(profileId) => setUploadData(p => ({...p, profileId}))}>
                        <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none text-sm font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Current user</SelectItem>
                          {profiles.map((profile: any) => (
                            <SelectItem key={profile.id} value={String(profile.id)}>{profile.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="type-support font-medium text-slate-400">Use this when the document belongs to a saved taxpayer or family profile.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="type-meta font-bold uppercase tracking-widest text-slate-400 ml-1">Linked Service</Label>
                      <Select value={uploadData.userServiceId} onValueChange={(userServiceId) => setUploadData(p => ({...p, userServiceId}))}>
                        <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none text-sm font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Keep in vault only</SelectItem>
                          {userServices.map((service: any) => (
                            <SelectItem key={service.id} value={String(service.id)}>
                              {service.serviceTitle || service.serviceId || "Service"} · {String(service.status || "pending").replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="type-support font-medium text-slate-400">
                        {userServices.length
                          ? "Attach this file to an active case so it appears in that service workspace."
                          : "No service cases yet. Start a service first if this file should move a case forward."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50">
                  <CardTitle className="type-card-title font-bold">Internal Generators</CardTitle>
                  <CardDescription className="type-support font-medium text-slate-500">Documents created within MyeCA.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      ["Rent Receipt", "/documents/generator/rent-receipt"],
                      ["Invoice", "/documents/generator/invoice"],
                      ["Form 15G", "/documents/generator/form-15g"],
                      ["Board Resolution", "/documents/generator/board-resolution-gst"],
                    ].map(([label, href]) => (
                      <Link key={href} href={href}>
                        <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                          <span className="text-sm font-bold text-slate-700">{label}</span>
                          <Pencil className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-blue-700 text-white">
            <CardHeader className="p-8 border-b border-white/10">
              <CardTitle className="text-xl font-black">Case workflow preview</CardTitle>
              <CardDescription className="text-slate-400">
                When a file is linked to a service, it appears on that case workspace and helps the team move the case forward.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4">
              {caseTimelineStages.map((stage, index) => (
                <div key={stage} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="type-meta font-black uppercase tracking-widest text-blue-300">Stage {index + 1}</p>
                  <p className="mt-2 type-support font-bold text-white">{stage}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="bg-blue-700 p-8 flex flex-col justify-center items-center text-center">
               <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                  <FileText className="h-10 w-10 text-blue-400" />
               </div>
               <h3 className="type-card-title font-bold text-white mb-2">Document Preview</h3>
               <p className="text-slate-400 type-support max-w-xs font-medium">Verified extraction fields will appear here after OCR metadata is available.</p>
            </div>
            <div className="p-8 space-y-6">
               <div>
                  <h2 className="type-card-title font-bold text-slate-900">Extraction Status</h2>
                  <p className="type-support font-medium text-slate-500">This file is stored securely. OCR verification is not available for this document yet.</p>
               </div>
               
               {extractedFields.length ? (
                <div className="space-y-4">
                  {extractedFields.map(([label, value, confidence]) => (
                    <div key={label} className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <Label className="type-meta font-bold uppercase tracking-widest text-slate-400">{label}</Label>
                        <Badge variant="outline" className={cn("type-meta font-black uppercase px-1.5 py-0 border-none", confidence === "High" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                          {confidence} Match
                        </Badge>
                      </div>
                      <Input defaultValue={value} className="h-10 rounded-xl bg-slate-50 border-none text-sm font-semibold" />
                    </div>
                  ))}
                </div>
               ) : (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="type-support font-black text-slate-900">{selectedDoc?.name}</p>
                  <p className="mt-2 type-support font-medium text-slate-500">
                    Download the original file or wait for OCR metadata to be generated before confirming extracted values.
                  </p>
                </div>
               )}

               <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-lg shadow-blue-100 transition-all mt-4" onClick={() => setSelectedDoc(null)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Close Preview
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
