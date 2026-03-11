import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Search, Check, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MediaPickerProps {
  onSelect: (url: string) => void;
  trigger?: React.ReactNode;
}

export function MediaPicker({ onSelect, trigger }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const res = await apiRequest("/api/cms/media");
      return res.json();
    },
    enabled: isOpen,
  });

  const formatSize = (bytes: number) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const files = response?.files || [];
  const filteredFiles = files.filter((f: any) => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (url: string) => {
    onSelect(url);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" type="button">
            <ImageIcon className="w-4 h-4 mr-2" />
            Pick from Library
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search images..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
             <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading media...</div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-2" />
              <p>No media found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
              {filteredFiles.map((file: any) => (
                <div 
                  key={file.name} 
                  className="group relative aspect-square rounded-lg border overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelect(file.url)}
                >
                  <img 
                    src={file.thumbnailUrl || file.url} 
                    alt={file.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm" variant="secondary" className="h-8">
                       Select
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 flex justify-between items-center px-2">
                     <p className="text-[9px] text-white truncate max-w-[60%]">{file.name}</p>
                     <span className="text-[8px] text-gray-300">{formatSize(file.size)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="mt-4 flex justify-end">
           <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
