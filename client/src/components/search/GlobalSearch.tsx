import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { 
  Search, FileText, Calculator, HelpCircle, 
  Building2, TrendingUp, Clock, ArrowRight,
  X, Loader2, Filter, History, Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { searchItems, highlightText, SearchHistory, popularSearches, SearchResult } from "@/lib/search-utils";

// Search data - In production, this would come from API
const searchableContent = [
  // Services
  { id: 1, title: "ITR Filing", type: "service", url: "/services/itr-filing", description: "File your income tax return with expert CA assistance", keywords: ["income tax", "return", "filing", "itr"] },
  { id: 2, title: "GST Registration", type: "service", url: "/services/gst-registration", description: "Register for GST and start your business compliance", keywords: ["gst", "registration", "business", "tax"] },
  { id: 3, title: "Company Registration", type: "service", url: "/services/company-registration", description: "Register your company with complete legal compliance", keywords: ["company", "registration", "incorporation", "business"] },
  { id: 4, title: "GST Returns", type: "service", url: "/services/gst-returns", description: "File monthly and quarterly GST returns on time", keywords: ["gst", "returns", "filing", "compliance"] },
  { id: 5, title: "TDS Filing", type: "service", url: "/services/tds-filing", description: "File TDS returns for all quarters accurately", keywords: ["tds", "filing", "tax", "deduction"] },
  { id: 6, title: "Notice Compliance", type: "service", url: "/services/notice-compliance", description: "Expert help for income tax notices", keywords: ["notice", "compliance", "tax", "scrutiny"] },
  
  // Calculators
  { id: 7, title: "Income Tax Calculator", type: "calculator", url: "/calculators/income-tax", description: "Calculate your income tax for FY 2024-25", keywords: ["income", "tax", "calculator", "salary"] },
  { id: 8, title: "HRA Calculator", type: "calculator", url: "/calculators/hra", description: "Calculate HRA exemption and tax savings", keywords: ["hra", "calculator", "rent", "exemption"] },
  { id: 9, title: "SIP Calculator", type: "calculator", url: "/calculators/sip", description: "Calculate SIP returns and wealth creation", keywords: ["sip", "calculator", "investment", "mutual fund"] },
  { id: 10, title: "EMI Calculator", type: "calculator", url: "/calculators/emi", description: "Calculate EMI for loans", keywords: ["emi", "calculator", "loan", "interest"] },
  { id: 11, title: "PPF Calculator", type: "calculator", url: "/calculators/ppf", description: "Calculate PPF maturity amount", keywords: ["ppf", "calculator", "investment", "tax saving"] },
  
  // Help & Resources
  { id: 12, title: "How to File ITR", type: "help", url: "/help/user-guide", description: "Step-by-step guide to file income tax return", keywords: ["how to", "file", "itr", "guide"] },
  { id: 13, title: "Tax Saving Tips", type: "help", url: "/help/knowledge-base", description: "Expert tips to save maximum tax", keywords: ["tax", "saving", "tips", "deduction"] },
  { id: 14, title: "GST Compliance Guide", type: "help", url: "/help/knowledge-base", description: "Complete guide for GST compliance", keywords: ["gst", "compliance", "guide", "business"] },
  { id: 15, title: "Document Checklist", type: "help", url: "/help/faq", description: "Required documents for tax filing", keywords: ["documents", "checklist", "required", "filing"] },
  
  // Pages
  { id: 16, title: "Pricing Plans", type: "page", url: "/pricing", description: "View our affordable pricing plans", keywords: ["pricing", "plans", "cost", "fees"] },
  { id: 17, title: "About MyeCA", type: "page", url: "/about", description: "Learn about our mission and team", keywords: ["about", "company", "team", "mission"] },
  { id: 18, title: "Contact Us", type: "page", url: "/expert-consultation", description: "Get in touch with our support team", keywords: ["contact", "support", "help", "email"] },
  { id: 19, title: "Blog", type: "page", url: "/blog", description: "Latest tax news and updates", keywords: ["blog", "news", "updates", "articles"] },
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [, setLocation] = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(SearchHistory.getHistory());
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      setShowHistory(true);
    }
  }, [isOpen]);

  // Handle search with fuzzy matching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSelectedIndex(0);
      setShowHistory(true);
      return;
    }

    setShowHistory(false);
    setIsSearching(true);
    
    // Simulate API delay for smoother UX
    const timer = setTimeout(() => {
      // Filter by type if selected
      let itemsToSearch = searchableContent;
      if (selectedType !== "all") {
        itemsToSearch = searchableContent.filter(item => item.type === selectedType);
      }
      
      // Perform fuzzy search
      const results = searchItems(searchQuery, itemsToSearch, ['title', 'description', 'keywords']);
      
      setSearchResults(results);
      setIsSearching(false);
      setSelectedIndex(0);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedType]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchResults.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % searchResults.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
        break;
      case "Enter":
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleResultClick(searchResults[selectedIndex]);
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    SearchHistory.addToHistory(searchQuery);
    setLocation(result.item.url);
    onClose();
    setSearchQuery("");
    setSearchHistory(SearchHistory.getHistory());
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "service":
        return <Building2 className="h-4 w-4" />;
      case "calculator":
        return <Calculator className="h-4 w-4" />;
      case "help":
        return <HelpCircle className="h-4 w-4" />;
      case "page":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "service":
        return "bg-blue-100 text-blue-700";
      case "calculator":
        return "bg-green-100 text-green-700";
      case "help":
        return "bg-purple-100 text-purple-700";
      case "page":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleSearchItemClick = (item: typeof searchableContent[0]) => {
    SearchHistory.addToHistory(searchQuery || item.title);
    setLocation(item.url);
    onClose();
    setSearchQuery("");
    setSearchHistory(SearchHistory.getHistory());
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    setShowHistory(false);
  };

  const handleClearHistory = () => {
    SearchHistory.clearHistory();
    setSearchHistory([]);
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    const type = result.item.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-3xl bg-white rounded-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="p-4 border-b bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search services, calculators, help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-10 h-12 text-lg border-2 focus:border-blue-500"
              />
              {isSearching && (
                <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 animate-spin" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-gray-200"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Type Filters */}
            <div className="mt-3">
              <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="service">Services</TabsTrigger>
                  <TabsTrigger value="calculator">Calculators</TabsTrigger>
                  <TabsTrigger value="help">Help</TabsTrigger>
                  <TabsTrigger value="page">Pages</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100" onClick={() => setSearchQuery("tax calculator")}>
                <Calculator className="h-3 w-3 mr-1" />
                Tax Calculators
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-green-100" onClick={() => setSearchQuery("gst")}>
                <FileText className="h-3 w-3 mr-1" />
                GST Services
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-purple-100" onClick={() => setSearchQuery("filing")}>
                <Building2 className="h-3 w-3 mr-1" />
                Filing Services
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-orange-100" onClick={() => setSearchQuery("help")}>
                <HelpCircle className="h-3 w-3 mr-1" />
                Help Articles
              </Badge>
            </div>
          </div>

          {/* Search Results */}
          <ScrollArea className="h-[450px]">
            {searchQuery && !isSearching && searchResults.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">No results found for "{searchQuery}"</p>
                <p className="text-sm mt-2">Try different keywords or browse popular items below</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </p>
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Sorted by relevance
                  </Badge>
                </div>
                
                {Object.entries(groupedResults).map(([type, results]) => (
                  <div key={type} className="mb-6">
                    <h3 
                      className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center cursor-pointer hover:text-blue-600 transition-colors group"
                      onClick={() => {
                        const typeRoutes: Record<string, string> = {
                          'service': '/services',
                          'calculator': '/calculators',
                          'help': '/help',
                          'page': '/pricing' // Default to pricing for pages
                        };
                        const route = typeRoutes[type] || '/';
                        setLocation(route);
                        onClose();
                      }}
                    >
                      {getTypeIcon(type)}
                      <span className="ml-2 group-hover:underline">{type.charAt(0).toUpperCase() + type.slice(1)}s</span>
                      <span className="ml-2 text-xs font-normal">({results.length})</span>
                      <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <div className="space-y-2">
                      {results.map((result, index) => {
                        const globalIndex = searchResults.findIndex(r => r === result);
                        const isSelected = globalIndex === selectedIndex;
                        
                        return (
                          <motion.div
                            key={result.item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card
                              className={cn(
                                "p-3 cursor-pointer transition-all hover:shadow-md border-2",
                                isSelected && "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                              )}
                              onClick={() => handleResultClick(result)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn("p-2 rounded-lg", getTypeBadgeColor(result.item.type))}>
                                  {getTypeIcon(result.item.type)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {result.matches.find(m => m.field === 'title') 
                                      ? highlightText(result.item.title, result.matches.find(m => m.field === 'title')!.indices)
                                      : result.item.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {result.matches.find(m => m.field === 'description')
                                      ? highlightText(result.item.description, result.matches.find(m => m.field === 'description')!.indices)
                                      : result.item.description}
                                  </p>
                                  <div className="flex items-center mt-2 text-xs text-gray-500">
                                    <Badge variant="outline" className="text-xs mr-2">
                                      Score: {result.score}
                                    </Badge>
                                    {result.item.keywords.slice(0, 3).map((keyword: string, i: number) => (
                                      <span key={i} className="mr-2">#{keyword}</span>
                                    ))}
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!searchQuery && showHistory && (
              <div className="p-4">
                {/* Search History */}
                {searchHistory.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center">
                        <History className="h-4 w-4 mr-2" />
                        Recent Searches
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearHistory}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-1 mb-6">
                      {searchHistory.slice(0, 5).map((search, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer group"
                          onClick={() => handleHistoryClick(search)}
                        >
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700 flex-1">{search}</span>
                          <ArrowRight className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Popular Searches */}
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Popular Searches
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {popularSearches.map((search, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100 justify-start py-2"
                      onClick={() => setSearchQuery(search)}
                    >
                      <Search className="h-3 w-3 mr-2" />
                      {search}
                    </Badge>
                  ))}
                </div>

                {/* Popular Services */}
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Popular Services
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {searchableContent.slice(0, 6).map((item) => (
                    <Card
                      key={item.id}
                      className="p-3 cursor-pointer hover:shadow-md transition-all"
                      onClick={() => handleSearchItemClick(item)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded", getTypeBadgeColor(item.type))}>
                          {getTypeIcon(item.type)}
                        </div>
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="p-3 border-t bg-gray-50 text-center">
            <p className="text-xs text-gray-500">
              Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">↑</kbd> <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">↓</kbd> to navigate, 
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs ml-1">Enter</kbd> to select, 
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs ml-1">Esc</kbd> to close
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}