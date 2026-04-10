import { useState, useRef } from "react";
import { m } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, Upload, Download, Trash2, Edit, Search,
  Calendar, Tag, Folder, FileCheck, AlertCircle, Loader2, Eye, X
} from "lucide-react";
import SEO from "@/components/SEO";
import { logAuditEvent, logDocumentAccess } from "@/lib/audit";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES, sanitizeFilename, formatFileSize } from "@/lib/file_utils";
import { getAuthToken } from "@/lib/authToken";
import { storage, auth } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Document {
  id: number;
  name: string;
  category: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  tags?: string;
  description?: string;
  year?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  status: string;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  form16: { label: "Form 16", color: "blue" },
  pan: { label: "PAN Card", color: "green" },
  aadhaar: { label: "Aadhaar", color: "purple" },
  bank_statement: { label: "Bank Statement", color: "orange" },
  investment_proof: { label: "Investment Proof", color: "yellow" },
  other: { label: "Other", color: "gray" }
};

export default function DocumentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [uploadData, setUploadData] = useState({
    name: "",
    category: "other",
    year: new Date().getFullYear().toString(),
    description: ""
  });
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<Document | null>(null);

  // Fetch documents
  const { data, isLoading } = useQuery({
    queryKey: ["/api/documents", categoryFilter, yearFilter, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (yearFilter !== "all") params.append("year", yearFilter);
      if (searchTerm) params.append("search", searchTerm);
      return apiRequest(`/api/documents?${params}`);
    }
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ["/api/documents/stats/summary"],
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!auth.currentUser) throw new Error("Not authenticated");

      // Security check
      if (file.size > MAX_FILE_SIZE_BYTES) {
        logAuditEvent({
          action: 'file_size_violation',
          category: 'security',
          metadata: { fileName: file.name, fileSize: file.size, context: 'documents_page' },
          status: 'warning'
        });
        throw new Error(`File too large. Max limit is ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`);
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        logAuditEvent({
          action: 'file_type_violation',
          category: 'security',
          metadata: { fileName: file.name, fileType: file.type, context: 'documents_page' },
          status: 'warning'
        });
        throw new Error("Invalid file type.");
      }

      const sanitizedName = sanitizeFilename(`${Date.now()}-${file.name}`);
      const storageRef = ref(storage, `user_documents/${auth.currentUser.uid}/${sanitizedName}`);
      
      const uploadResult = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          category: uploadData.category,
          year: uploadData.year
        }
      });
      
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      const token = await getAuthToken();
      
      const response = await fetch("/api/documents/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: uploadData.name || file.name,
          url: downloadUrl,
          category: uploadData.category,
          year: uploadData.year,
          description: uploadData.description,
          storagePath: uploadResult.ref.fullPath,
          size: file.size,
          mimeType: file.type
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to register document on server");
      }

      await logDocumentAccess(file.name, 'uploaded_document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/stats/summary"] });
      toast({
        title: "Document uploaded successfully",
        description: "Your document has been securely stored."
      });
      setUploadData({
        name: "",
        category: "other",
        year: new Date().getFullYear().toString(),
        description: ""
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/documents/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/stats/summary"] });
      toast({
        title: "Document deleted",
        description: "The document has been removed."
      });
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const documents = data?.documents || [];
  const stats = statsData?.stats || { total: 0, byCategory: {}, byYear: {}, totalSize: 0 };

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <SEO
        title="Document Management | MyeCA.in"
        description="Securely store and manage your tax documents"
        keywords="document management, tax documents, secure storage"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Document Management</h1>
          <p className="text-xl text-gray-600">Securely store and organize your tax documents</p>
        </m.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Storage Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Folder className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Tag className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Years</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold">{Object.keys(stats.byYear).length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList>
            <TabsTrigger value="documents">My Documents</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(categoryLabels).map(([value, { label }]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {[2025, 2024, 2023, 2022, 2021].map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Documents List */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : documents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">No documents found</p>
                  <Button variant="outline" className="mt-4" onClick={() => {}}>
                    Upload your first document
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {documents.map((doc: Document) => {
                  const category = categoryLabels[doc.category] || categoryLabels.other;
                  
                  return (
                    <m.div
                      key={doc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="bg-blue-100 p-3 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  {doc.originalName} • {formatFileSize(doc.size)}
                                </p>
                                {doc.description && (
                                  <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-3">
                                  <Badge variant="secondary" className={`bg-${category.color}-100 text-${category.color}-700`}>
                                    {category.label}
                                  </Badge>
                                  {doc.year && (
                                    <Badge variant="outline">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {doc.year}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Preview"
                                onClick={() => setSelectedDocForPreview(doc)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Download">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Delete"
                                onClick={() => {
                                  if(confirm("Are you sure you want to delete this document?")) {
                                    deleteMutation.mutate(doc.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </m.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Document</CardTitle>
                <CardDescription>
                  Securely upload your tax-related documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Document Name</Label>
                    <Input
                      id="name"
                      value={uploadData.name}
                      onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Form 16 for FY 2024-25"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={uploadData.category} 
                        onValueChange={(value) => setUploadData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger id="category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([value, { label }]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Select 
                        value={uploadData.year} 
                        onValueChange={(value) => setUploadData(prev => ({ ...prev, year: value }))}
                      >
                        <SelectTrigger id="year">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2025, 2024, 2023, 2022, 2021].map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={uploadData.description}
                      onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Add any notes about this document"
                    />
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Drag and drop your file here, or click to browse
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Select File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  />
                  <p className="text-xs text-gray-500 mt-4">
                    Supported formats: PDF, JPG, PNG, WebP, Word, Excel (Max {formatFileSize(MAX_FILE_SIZE_BYTES)})
                  </p>
                </div>

                {uploadMutation.isPending && (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
