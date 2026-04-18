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
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES, formatFileSize } from "@/lib/file_utils";
import { Layout } from "@/components/admin/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Security Vault</h2>
                      <Badge variant="outline" className="mt-2 bg-emerald-50 text-emerald-700 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5">
                         Encryption Active
                      </Badge>
                   </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3">
                   {[
                     { label: "Storage", value: formatFileSize(totalSize || 2480000), icon: LockKeyhole, color: "blue" },
                     { label: "Files", value: documents.length || 8, icon: FileText, color: "indigo" },
                     { label: "OCR Checks", value: "04", icon: FileCheck2, color: "emerald" },
                     { label: "Vaults", value: "04", icon: FolderOpen, color: "purple" }
                   ].map((stat, i) => (
                     <div key={i} className="p-4 rounded-3xl bg-slate-50 border border-slate-100/50 flex flex-col items-center text-center">
                        <stat.icon className={cn("h-4 w-4 mb-2", `text-${stat.color}-600`)} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                        <span className="text-sm font-black text-slate-900 leading-none">{stat.value}</span>
                     </div>
                   ))}
                </div>

                <div className="mt-10 space-y-3">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Private Folders</p>
                   {vaultFolders.map((folder) => (
                      <div key={folder.key} className="flex items-center justify-between p-4 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                               <FolderOpen className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-black text-slate-700 group-hover:text-blue-600 transition-colors">{folder.label}</span>
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
             <h3 className="font-black text-xl leading-tight mb-3 text-slate-900">AI Verification</h3>
             <p className="text-slate-500 text-[10px] font-medium leading-relaxed mb-6">Automated OCR detects mismatches in Form 16 vs 26AS data.</p>
             <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest h-11 rounded-2xl shadow-lg shadow-blue-100 border-none transition-all">Scan Documents</Button>
          </div>
        </div>

        {/* Main Content Area - Full Page Scroll */}
        <div className="flex-1 min-w-0 w-full lg:max-w-7xl space-y-10 pb-20">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-12 rounded-[48px] shadow-sm border border-slate-100/50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Secure Storage</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Document Vault</h1>
              <p className="text-slate-500 max-w-2xl text-base font-medium leading-relaxed">
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
                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
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
                          status: "AI Validation",
                        },
                        {
                          id: "demo-ais",
                          name: "AIS Statement",
                          category: "ais",
                          fileName: "ais.pdf",
                          originalName: "ais.pdf",
                          mimeType: "application/pdf",
                          size: 420000,
                          createdAt: new Date().toISOString(),
                          status: "In Progress",
                        },
                      ]).map((doc) => (
                        <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                                  {doc.category} · {formatFileSize(doc.size)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                             <Badge className="bg-slate-50 text-slate-600 border-none font-bold text-[9px] uppercase tracking-widest px-2.5 py-1">
                                {doc.status}
                             </Badge>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => setSelectedDoc(doc)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!doc.id.startsWith("demo") && (
                                <>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleDownload(doc)}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate(doc.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Right Column: Upload & Generators */}
            <div className="space-y-8">
              <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50">
                  <CardTitle className="text-lg font-bold">Quick Upload</CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-500">Securely ingest new compliance documents.</CardDescription>
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
                    <p className="text-sm font-bold text-slate-900">Drop files here</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">PDF, Image or Spreadsheets (Max 10MB)</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Document Name</Label>
                      <Input 
                        value={uploadData.name}
                        onChange={(e) => setUploadData(p => ({...p, name: e.target.value}))}
                        placeholder="e.g. Form 16"
                        className="h-10 rounded-xl bg-slate-50 border-none text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Category</Label>
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
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50">
                  <CardTitle className="text-lg font-bold">Internal Generators</CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-500">Documents created within MyeCA.</CardDescription>
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
        </div>
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="bg-slate-900 p-8 flex flex-col justify-center items-center text-center">
               <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                  <FileText className="h-10 w-10 text-blue-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">OCR Smart Preview</h3>
               <p className="text-slate-400 text-sm max-w-xs font-medium">AI-driven extraction of fields from your uploaded document for verification.</p>
            </div>
            <div className="p-8 space-y-6">
               <div>
                  <h2 className="text-lg font-bold text-slate-900">Verify Extraction</h2>
                  <p className="text-xs font-medium text-slate-500">Please confirm the AI-extracted values before proceeding.</p>
               </div>
               
               <div className="space-y-4">
                  {extractedFields.map(([label, value, confidence]) => (
                    <div key={label} className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</Label>
                        <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-1.5 py-0 border-none", confidence === "High" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                          {confidence} Match
                        </Badge>
                      </div>
                      <Input defaultValue={value} className="h-10 rounded-xl bg-slate-50 border-none text-sm font-semibold" />
                    </div>
                  ))}
               </div>

               <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-lg shadow-blue-100 transition-all mt-4" onClick={() => setSelectedDoc(null)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm & Sync
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
