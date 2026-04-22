import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList, 
  CommandSeparator 
} from "@/components/ui/command";
import { Calculator, FileText, Search, ArrowRight, Building2, Landmark, Clock, Home, TrendingUp, Rocket, Receipt, Scale, Gem } from "lucide-react";
import { SearchHistory } from "@/lib/search-utils";
import { useQuery } from "@tanstack/react-query";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATIC_LINKS = [
  // Calculators
  { title: "Income Tax Calculator", href: "/calculators/income-tax", icon: Calculator, category: "Calculators" },
  { title: "Tax Regime Compare", href: "/calculators/tax-regime", icon: Scale, category: "Calculators" },
  { title: "HRA Exemption Calculator", href: "/calculators/hra", icon: Home, category: "Calculators" },
  { title: "TDS Calculator", href: "/calculators/tds", icon: Receipt, category: "Calculators" },
  { title: "Capital Gains", href: "/calculators/capital-gains", icon: TrendingUp, category: "Calculators" },
  { title: "SIP Calculator", href: "/calculators/sip", icon: TrendingUp, category: "Calculators" },
  { title: "NPS Calculator", href: "/calculators/nps", icon: Landmark, category: "Calculators" },
  { title: "PPF Calculator", href: "/calculators/ppf", icon: Landmark, category: "Calculators" },
  { title: "EMI Calculator", href: "/calculators/emi", icon: Calculator, category: "Calculators" },
  { title: "Home Loan Calculator", href: "/calculators/home-loan", icon: Home, category: "Calculators" },
  
  // Services
  { title: "TDS Filing", href: "/services/tds-filing", icon: Receipt, category: "Services" },
  { title: "GST Returns", href: "/services/gst-returns", icon: Calculator, category: "Services" },
  { title: "Notice Management", href: "/services/notice-compliance", icon: FileText, category: "Services" },
  { title: "Company Registration", href: "/services/company-registration", icon: Building2, category: "Services" },
  { title: "Trademark Registration", href: "/services/trademark-registration", icon: Scale, category: "Services" },
  { title: "Virtual CFO", href: "/business/virtual-cfo", icon: TrendingUp, category: "Services" },
  
  // Startup
  { title: "Startup Hub", href: "/startup-services", icon: Rocket, category: "Startup" },
  { title: "Startup India Registration", href: "/services/startup-india-registration", icon: Rocket, category: "Startup" },
  { title: "MSME Udyam Registration", href: "/services/msme-udyam-registration", icon: Building2, category: "Startup" },
  { title: "GST Registration", href: "/services/gst-registration", icon: Receipt, category: "Startup" },
  { title: "ISO Certification", href: "/services/iso-certification", icon: Gem, category: "Startup" },
];

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [, setLocation] = useLocation();
  const [history, setHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Reload history when modal opens
  useEffect(() => {
    if (open) {
      setHistory(SearchHistory.getHistory());
      setSearchQuery("");
    }
  }, [open]);

  // Global Keyboard Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const { data: blogPosts = [] } = useQuery<any[]>({
    queryKey: ['/api/blog'],
    enabled: open,
  });

  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  const handleSelect = (href: string, query: string) => {
    SearchHistory.addToHistory(query);
    runCommand(() => setLocation(href));
  };

  const handleSearchSubmit = (val: string) => {
    if (!val) return;
    SearchHistory.addToHistory(val);
    runCommand(() => setLocation(`/search?q=${encodeURIComponent(val)}`));
  };

  const filteredLinks = STATIC_LINKS.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredBlogs = blogPosts.filter((post: any) => post.title?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Type a command or search tools, services, guides..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="py-8 text-center text-sm text-slate-500">
            <Search className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="mb-2">No direct results found for "{searchQuery}".</p>
            <button 
              onClick={() => handleSearchSubmit(searchQuery)}
              className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
            >
              Search Knowledge Hub <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </CommandEmpty>
        
        {!searchQuery && history.length > 0 && (
          <CommandGroup heading="Recent Searches">
            {history.map((term) => (
              <CommandItem 
                key={`hist-${term}`} 
                onSelect={() => handleSearchSubmit(term)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-700">{term}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!searchQuery && (
          <CommandGroup heading="Popular Tools">
            {STATIC_LINKS.slice(0, 5).map((link) => (
              <CommandItem 
                key={link.href} 
                onSelect={() => handleSelect(link.href, link.title)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <link.icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                </div>
                <span className="font-medium text-slate-700">{link.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {searchQuery && (
          <>
            {filteredLinks.length > 0 && (
              <CommandGroup heading="Tools & Services">
                {filteredLinks.map((link) => (
                  <CommandItem 
                    key={link.href} 
                    onSelect={() => handleSelect(link.href, link.title)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <link.icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-700">{link.title}</span>
                    <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest">{link.category}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {filteredBlogs.length > 0 && (
              <CommandGroup heading="Knowledge Hub">
                {filteredBlogs.map((post: any) => (
                  <CommandItem 
                    key={`blog-${post.id}`} 
                    onSelect={() => handleSelect(`/blog/${post.id}`, post.title)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <FileText className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-700 truncate">{post.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {(filteredLinks.length > 0 || filteredBlogs.length > 0) && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem 
                    onSelect={() => handleSearchSubmit(searchQuery)} 
                    className="flex items-center gap-2 justify-center text-blue-600 font-bold py-3 cursor-pointer hover:bg-blue-50"
                  >
                    <Search className="w-4 h-4" />
                    See all results for "{searchQuery}"
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
