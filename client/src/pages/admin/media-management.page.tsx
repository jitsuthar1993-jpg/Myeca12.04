import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/admin/Layout";
import { Image as ImageIcon, Trash2, Copy, Search, ExternalLink, CheckSquare, Square, Download, MoreVertical, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MediaManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "size-asc" | "size-desc" | "name">("newest");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const res = await apiRequest("/api/cms/media");
      return res.json();
    },
  });

  const files = response?.files || [];

  const deleteMediaMutation = useMutation({
    mutationFn: async (filename: string) => {
       const res = await apiRequest(`/api/cms/media/${filename}`, {
         method: "DELETE",
       });
       return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      setSelectedFiles(prev => prev.filter(f => f !== f)); // Clear if it was selected
      toast({ title: "Success", description: "Media file deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete file", variant: "destructive" });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (filenames: string[]) => {
      const res = await apiRequest("/api/cms/media/bulk-delete", {
        method: "POST",
        body: JSON.stringify({ filenames }),
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      setSelectedFiles([]);
      const deletedCount = data.results?.deleted?.length || 0;
      const failedCount = data.results?.failed?.length || 0;
      toast({ 
        title: "Bulk Actions Complete", 
        description: `Deleted ${deletedCount} files.${failedCount > 0 ? ` Failed to delete ${failedCount} files.` : ''}` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Bulk delete failed", variant: "destructive" });
    },
  });

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    toast({ title: "Copied!", description: "Image URL copied to clipboard" });
  };

  const toggleSelect = (filename: string) => {
    setSelectedFiles(prev => 
      prev.includes(filename) 
        ? prev.filter(f => f !== filename) 
        : [...prev, filename]
    );
  };

  const selectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map((f: any) => f.name));
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/cms/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      toast({ title: "Success", description: "Image uploaded to library" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedFiles.length} files permanently?`)) {
      bulkDeleteMutation.mutate(selectedFiles);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredFiles = files
    .filter((f: any) => {
      const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || f.name.toLowerCase().endsWith(typeFilter);
      return matchesSearch && matchesType;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "oldest": return new Date(a.mtime || a.atime).getTime() - new Date(b.mtime || b.atime).getTime();
        case "size-asc": return (a.size || 0) - (b.size || 0);
        case "size-desc": return (b.size || 0) - (a.size || 0);
        case "name": return a.name.localeCompare(b.name);
        case "newest":
        default: return new Date(b.mtime || b.atime).getTime() - new Date(a.mtime || a.atime).getTime();
      }
    });

  return (
    <Layout title="Media Library">
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-600">Browse and manage all uploaded blog images</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <Button variant="primary" asChild disabled={uploadMutation.isPending}>
                <div className="flex items-center gap-2">
                  <Upload className={`w-4 h-4 ${uploadMutation.isPending ? 'animate-bounce' : ''}`} />
                  <span>{uploadMutation.isPending ? 'Uploading...' : 'Upload New'}</span>
                </div>
              </Button>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleUpload}
                disabled={uploadMutation.isPending}
              />
            </label>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
               <SelectTrigger className="w-32 bg-white">
                  <SelectValue placeholder="All types" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value=".jpg">JPG</SelectItem>
                  <SelectItem value=".png">PNG</SelectItem>
                  <SelectItem value=".webp">WEBP</SelectItem>
                  <SelectItem value=".gif">GIF</SelectItem>
               </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
               <SelectTrigger className="w-40 bg-white">
                  <SelectValue placeholder="Sort by" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="size-desc">Largest size</SelectItem>
                  <SelectItem value="size-asc">Smallest size</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
               </SelectContent>
            </Select>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search files..." 
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedFiles.length > 0 && selectedFiles.length === filteredFiles.length} 
                onCheckedChange={selectAll}
                disabled={filteredFiles.length === 0}
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedFiles.length > 0 ? `${selectedFiles.length} selected` : 'Select All'}
              </span>
            </div>

            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-2 border-l pl-4">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                {/* Future: Bulk Download */}
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredFiles.length} items
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
           <p className="mt-4 text-gray-500 font-medium">Loading media assets...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No media files found</h3>
          <p className="text-gray-500">Upload images from the Blog Post editor to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6">
          {filteredFiles.map((file: any) => (
            <div key={file.name} className="relative group">
              <Card 
                className={`overflow-hidden transition-all duration-200 ${
                  selectedFiles.includes(file.name) 
                    ? "ring-2 ring-primary border-primary shadow-lg" 
                    : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                }`}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) toggleSelect(file.name);
                }}
              >
                <div className="aspect-square relative overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img 
                    src={file.thumbnailUrl || file.url} 
                    alt={file.name} 
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                       selectedFiles.includes(file.name) ? "scale-105" : "group-hover:scale-110"
                    }`}
                  />
                  
                  {/* Overlay Controls */}
                  <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 flex items-center justify-center gap-2 ${
                    selectedFiles.includes(file.name) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(file.url); }} 
                      title="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                      <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/20 hover:bg-white text-white hover:text-gray-900 border-none" title="View Full Image">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button size="icon" variant="secondary" className="h-8 w-8" title="More Options">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => copyToClipboard(file.url)}>
                            <Copy className="w-4 h-4 mr-2" /> Copy URL
                         </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                            <a href={file.url} download={file.name}>
                               <Download className="w-4 h-4 mr-2" /> Download
                            </a>
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => {
                               if(confirm("Delete this image forever?")) deleteMediaMutation.mutate(file.name);
                            }}
                         >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Instance
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Checkbox Overlay */}
                  <div className={`absolute top-2 left-2 transition-opacity duration-200 ${
                    selectedFiles.includes(file.name) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}>
                     <Checkbox 
                        checked={selectedFiles.includes(file.name)} 
                        onCheckedChange={() => toggleSelect(file.name)}
                        className="bg-white"
                     />
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-[12px] font-semibold text-gray-800 truncate leading-tight" title={file.name}>{file.name}</p>
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-50">
                    <span className="text-[10px] text-gray-400 font-medium">{formatSize(file.size || 0)}</span>
                    <span className="text-[10px] text-gray-400">{new Date(file.mtime || file.atime).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
