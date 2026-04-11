import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, X, CheckCircle, AlertCircle, Eye, Loader2 } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { compressImage, getFilePreview, formatFileSize, ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/file_utils";
import { logAuditEvent, logDocumentAccess } from "@/lib/audit";
import { getAuthToken } from "@/lib/authToken";

interface ServiceUploaderProps {
  serviceId: string;
  serviceType: string;
  expectedDocs: { id: string; name: string; required: boolean }[];
}

export function ServiceUploader({ serviceType, expectedDocs }: ServiceUploaderProps) {
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File | null>>({});
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleFileChange = async (docId: string, file: File | null) => {
    if (!file) {
      setUploadedDocs((prev) => ({ ...prev, [docId]: null }));
      if (previews[docId]) URL.revokeObjectURL(previews[docId]);
      setPreviews((prev) => ({ ...prev, [docId]: "" }));
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`,
        variant: "destructive",
      });
      logAuditEvent({
        action: 'file_size_violation',
        category: 'security',
        metadata: { fileName: file.name, fileSize: file.size },
        status: 'warning'
      });
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only PDF, JPG, PNG, and WebP files are allowed.",
        variant: "destructive",
      });
      logAuditEvent({
        action: 'file_type_violation',
        category: 'security',
        metadata: { fileName: file.name, fileType: file.type },
        status: 'warning'
      });
      return;
    }

    try {
      setIsUploading((prev) => ({ ...prev, [docId]: true }));
      const compressed = await compressImage(file);
      setUploadedDocs((prev) => ({ ...prev, [docId]: compressed }));
      
      const preview = getFilePreview(compressed);
      setPreviews((prev) => ({ ...prev, [docId]: preview }));
    } catch (err) {
      console.error("Compression failed:", err);
      setUploadedDocs((prev) => ({ ...prev, [docId]: file }));
    } finally {
      setIsUploading((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const removeFile = (docId: string) => {
    setUploadedDocs((prev) => ({ ...prev, [docId]: null }));
    if (previews[docId]) URL.revokeObjectURL(previews[docId]);
    setPreviews((prev) => {
      const updated = { ...prev };
      delete updated[docId];
      return updated;
    });
  };

  const handleSubmit = async () => {
    const filesToUpload = Object.entries(uploadedDocs).filter(([_, file]) => file !== null);
    if (filesToUpload.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document to upload.",
        variant: "destructive"
      });
      return;
    }

    // Verify required docs
    const missingDocs = expectedDocs.filter(d => d.required && !uploadedDocs[d.id]);
    if (missingDocs.length > 0) {
      toast({
        title: "Required documents missing",
        description: `Please upload: ${missingDocs.map(d => d.name).join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading({ "global": true });

    try {
      for (const [docId, file] of filesToUpload) {
        if (!file) continue;
        
        const docName = expectedDocs.find(d => d.id === docId)?.name || docId;
        const token = await getAuthToken();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", docName);
        formData.append("category", serviceType);
        formData.append("tags", JSON.stringify([docId]));

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `Failed to upload ${docName}`);
        }

        await logDocumentAccess(docId, `uploaded_${docName}`);
      }

      toast({
        title: "Documents Uploaded Successfully",
        description: "All selected documents have been uploaded and are being reviewed."
      });
      
      // Invalidate queries or redirect if needed
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Upload Failed",
        description: (err as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsUploading({});
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          Required Documents for {serviceType}
        </CardTitle>
        <CardDescription>Upload clear copies of the following documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {expectedDocs.map((doc) => (
          <div key={doc.id} className="relative">
            <div className={`p-4 rounded-xl border-2 border-dashed transition-all ${
              uploadedDocs[doc.id] 
                ? "border-green-500 bg-green-50/50 dark:bg-green-900/10" 
                : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${uploadedDocs[doc.id] ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500 dark:bg-gray-700"}`}>
                    <File className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {doc.name}
                      {doc.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {uploadedDocs[doc.id] ? (uploadedDocs[doc.id] as File).name : "PDF, JPG or PNG (Max 10MB)"}
                    </p>
                  </div>
                </div>

                {uploadedDocs[doc.id] ? (
                  <div className="flex items-center gap-2">
                    {previews[doc.id] && (
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        {uploadedDocs[doc.id]?.type.startsWith('image/') ? (
                          <img src={previews[doc.id]} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <File className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => removeFile(doc.id)} className="h-8 w-8 text-gray-500 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                      disabled={isUploading[doc.id]}
                    />
                    <Button variant="outline" size="sm" asChild disabled={isUploading[doc.id]}>
                      <span>
                        {isUploading[doc.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
                      </span>
                    </Button>
                  </label>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-2">
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
            onClick={handleSubmit}
            disabled={isUploading["global"]}
          >
            {isUploading["global"] ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : "Submit Documents"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
