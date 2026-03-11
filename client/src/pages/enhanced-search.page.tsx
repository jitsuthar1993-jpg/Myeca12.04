import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Calculator, FileText, BookOpen, Lightbulb, TrendingUp, ChevronRight, Clock, Star, ArrowRight, Bot, Zap } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const searchCategories = [
  {
    id: "calculators",
    title: "Tax Calculators",
    description: "Calculate taxes, deductions, and savings",
    icon: Calculator,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    items: [
      { name: "Income Tax Calculator", path: "/calculators/income-tax", description: "Calculate your tax liability for both regimes", keywords: ["income", "tax", "salary", "regime", "calculation"] },
      { name: "HRA Calculator", path: "/calculators/hra", description: "Calculate House Rent Allowance exemption", keywords: ["hra", "house", "rent", "allowance", "exemption"] },
      { name: "Capital Gains Calculator", path: "/calculators/capital-gains", description: "Calculate STCG and LTCG on investments", keywords: ["capital", "gains", "stcg", "ltcg", "investment", "shares", "property"] },
      { name: "SIP Calculator", path: "/calculators/sip", description: "Calculate SIP returns and investment growth", keywords: ["sip", "mutual", "fund", "investment", "returns"] },
      { name: "EMI Calculator", path: "/calculators/emi", description: "Calculate loan EMI and amortization", keywords: ["emi", "loan", "home", "car", "personal"] },
      { name: "TDS Calculator", path: "/calculators/tds", description: "Calculate TDS on salary and other income", keywords: ["tds", "deduction", "source", "salary", "freelance"] },
    ]
  },
  {
    id: "resources",
    title: "Tax Resources",
    description: "Guides, articles, and FAQs",
    icon: BookOpen,
    color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    items: [
      { name: "ITR Filing Guide", path: "/blog", description: "Step-by-step guide to filing your ITR", keywords: ["itr", "filing", "guide", "step", "process"] },
      { name: "Tax Deductions List", path: "/blog", description: "Complete list of available deductions", keywords: ["deductions", "80c", "80d", "savings", "exemption"] },
      { name: "New Tax Regime Guide", path: "/blog", description: "Understanding the new tax regime", keywords: ["new", "regime", "comparison", "benefits", "old"] },
      { name: "Blog Articles", path: "/blog", description: "Latest tax news and insights", keywords: ["blog", "articles", "news", "updates", "insights"] },
    ]
  },
  {
    id: "forms",
    title: "Tax Forms & Filing",
    description: "ITR forms and filing assistance",
    icon: FileText,
    color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    items: [
      { name: "ITR-1 Filing", path: "/itr/form-selector", description: "File ITR-1 for salaried individuals", keywords: ["itr1", "salary", "sahaj", "filing"] },
      { name: "ITR-2 Filing", path: "/itr/form-selector", description: "File ITR-2 for capital gains income", keywords: ["itr2", "capital", "gains", "house", "property"] },
      { name: "ITR-3 Filing", path: "/itr/form-selector", description: "File ITR-3 for business income", keywords: ["itr3", "business", "professional", "presumptive"] },
      { name: "Document Upload", path: "/documents", description: "Upload and manage tax documents", keywords: ["documents", "upload", "form16", "bank", "statement"] },
      { name: "Profile Management", path: "/profiles", description: "Manage family member profiles", keywords: ["profile", "family", "pan", "aadhaar", "details"] },
    ]
  },
  {
    id: "ai",
    title: "AI Assistant",
    description: "Get personalized tax guidance",
    icon: Bot,
    color: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    items: [
      { name: "Tax Chat Assistant", path: "/advanced-features", description: "Ask questions about tax laws and filing", keywords: ["ai", "assistant", "chat", "questions", "help", "guidance"] },
      { name: "Document Analysis", path: "/advanced-features", description: "AI-powered document insights", keywords: ["document", "analysis", "ai", "form16", "insights"] },
      { name: "Tax Planning", path: "/advanced-features", description: "Personalized tax optimization tips", keywords: ["planning", "optimization", "savings", "tips", "strategy"] },
    ]
  },
];

const quickTips = [
  { tip: "Save up to \u20B946,800 by choosing the right tax regime", category: "Tax Planning", path: "/calculators/tax-regime" },
  { tip: "Upload Form 16 early to auto-fill ITR details", category: "ITR Filing", path: "/documents" },
  { tip: "Claim HRA exemption even with home loan", category: "Deductions", path: "/calculators/hra" },
  { tip: "LTCG over \u20B91 lakh is taxable at 12.5%", category: "Capital Gains", path: "/calculators/capital-gains" },
  { tip: "Use AI Assistant for instant tax guidance", category: "AI Help", path: "/advanced-features" },
  { tip: "Standard deduction is \u20B950,000 for FY 2024-25", category: "Deductions", path: "/calculators/income-tax" },
];

const trendingSearches = [
  "How to file ITR-1",
  "Capital gains tax rate 2024",
  "HRA calculation with examples",
  "80C deductions list",
  "New vs old tax regime comparison",
  "AI tax assistant help",
];

export default function EnhancedSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentQueries(JSON.parse(saved));
    }
  }, []);

  const saveSearch = (query: string) => {
    if (query.trim()) {
      const updated = [query, ...recentQueries.filter(q => q !== query)].slice(0, 5);
      setRecentQueries(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }
  };

  const filteredCategories = searchCategories.filter(category => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      category.title.toLowerCase().includes(searchLower) ||
      category.description.toLowerCase().includes(searchLower) ||
      category.items.some(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.keywords?.some(keyword => keyword.includes(searchLower))
      )
    );
  });

  // Get all matching items across categories for search results
  const allMatchingItems = searchTerm ? searchCategories.flatMap(category => 
    category.items.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.keywords?.some(keyword => keyword.includes(searchLower))
      );
    }).map(item => ({ ...item, categoryTitle: category.title, categoryColor: category.color }))
  ) : [];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setShowSuggestions(false);
    saveSearch(term);
  };

  const handleQuickSearch = (query: string) => {
    setSearchTerm(query);
    saveSearch(query);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Smart Tax Search
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find calculators, guides, and tax resources instantly. Get personalized help with our AI assistant.
          </p>
        </motion.div>

        {/* Enhanced Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 relative"
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardContent className="p-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  placeholder="Search for tax calculators, ITR filing guides, deductions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchTerm);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 pr-20 h-14 text-lg border-0 bg-transparent focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <Button 
                    onClick={() => handleSearch(searchTerm)}
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Search Suggestions */}
              <AnimatePresence>
                {showSuggestions && (recentQueries.length > 0 || trendingSearches.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border rounded-lg shadow-xl z-50 mt-2"
                  >
                    {recentQueries.length > 0 && (
                      <div className="p-4 border-b dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Recent Searches
                        </h4>
                        <div className="space-y-1">
                          {recentQueries.map((query, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuickSearch(query)}
                              className="block text-left w-full px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            >
                              {query}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Trending Searches
                      </h4>
                      <div className="space-y-1">
                        {trendingSearches.map((query, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickSearch(query)}
                            className="block text-left w-full px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          >
                            {query}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {searchTerm ? (
          /* Search Results */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Search Results for "{searchTerm}"
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Found {allMatchingItems.length} results
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {allMatchingItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Link href={item.path}>
                    <Card className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {item.name}
                          </h3>
                          <Badge className={item.categoryColor}>
                            {item.categoryTitle}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {item.description}
                        </p>
                        <div className="flex items-center text-blue-600 font-medium">
                          Open
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {allMatchingItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try searching for calculators, ITR filing, or tax deductions
                </p>
                <Link href="/advanced-features">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Bot className="h-4 w-4 mr-2" />
                    Ask AI Assistant
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Browse Categories */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Quick Tips */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Quick Tax Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickTips.map((tip, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href={tip.path}>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                          <Badge variant="secondary" className="mb-2">
                            {tip.category}
                          </Badge>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {tip.tip}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <category.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-semibold">{category.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                            {category.description}
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.items.slice(0, 3).map((item, itemIndex) => (
                          <motion.div
                            key={itemIndex}
                            whileHover={{ x: 5 }}
                          >
                            <Link href={item.path}>
                              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group">
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {item.name}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {item.description}
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                        {category.items.length > 3 && (
                          <button
                            onClick={() => setSelectedCategory(category.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View all {category.items.length} items →
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}