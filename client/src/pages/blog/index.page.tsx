import { useState } from "react";
import { m } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Calendar, User, ArrowRight, Clock, Tag, TrendingUp, FileText, Calculator, BookOpen, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  status: 'draft' | 'published';
  tags: string[];
  readTime: number;
  category: string;
}

const featuredCategories = [
  { name: "Tax Planning", icon: Calculator, count: 12, color: "bg-blue-50 text-blue-700 border-blue-200" },
  { name: "ITR Filing", icon: FileText, count: 8, color: "bg-green-50 text-green-700 border-green-200" },
  { name: "Investment", icon: TrendingUp, count: 15, color: "bg-purple-50 text-purple-700 border-purple-200" },
  { name: "Tax Updates", icon: BookOpen, count: 6, color: "bg-orange-50 text-orange-700 border-orange-200" }
];

const sampleBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Archived: New Tax Regime vs Old Tax Regime for AY 2025-26",
    content: "Detailed comparison of tax regimes...",
    excerpt: "Historical AY 2025-26 comparison retained for archive reference. Use current calculators for AY 2026-27 filing decisions.",
    author: "CA Priya Sharma",
    publishedAt: "2025-01-10",
    status: "published",
    tags: ["Tax Planning", "ITR Filing", "New Tax Regime"],
    readTime: 8,
    category: "Tax Planning"
  },
  {
    id: 2,
    title: "Archived: Step-by-Step Guide to Filing ITR-1 Online in 2025",
    content: "Complete guide for ITR-1 filing...",
    excerpt: "Archived ITR-1 process note. Check current AY 2026-27 workflows and portal notices before filing.",
    author: "CA Rajesh Kumar",
    publishedAt: "2025-01-08",
    status: "published",
    tags: ["ITR Filing", "Online Filing", "Tax Refund"],
    readTime: 12,
    category: "ITR Filing"
  },
  {
    id: 3,
    title: "Budget 2025: Key Changes in Income Tax That Affect You",
    content: "Analysis of budget changes...",
    excerpt: "Understand the latest budget announcements and how they impact your tax planning strategy for the current financial year.",
    author: "CA Anita Mehta",
    publishedAt: "2025-01-05",
    status: "published",
    tags: ["Budget 2025", "Tax Updates", "Policy Changes"],
    readTime: 10,
    category: "Tax Updates"
  },
  {
    id: 4,
    title: "Maximizing Section 80C Deductions: Smart Investment Strategies",
    content: "Investment strategies for tax saving...",
    excerpt: "Discover the best investment options under Section 80C to save up to ₹46,800 in taxes while building wealth.",
    author: "CA Vikram Singh",
    publishedAt: "2025-01-03",
    status: "published",
    tags: ["Section 80C", "Investment", "Tax Saving"],
    readTime: 15,
    category: "Investment"
  },
  {
    id: 5,
    title: "HRA Exemption Calculator: How to Claim Maximum Benefits",
    content: "HRA calculation and optimization...",
    excerpt: "Learn how to calculate and claim HRA exemption effectively. Includes examples for metro and non-metro cities.",
    author: "CA Sunita Reddy",
    publishedAt: "2025-01-01",
    status: "published",
    tags: ["HRA", "Tax Exemption", "Salary"],
    readTime: 6,
    category: "Tax Planning"
  },
  {
    id: 6,
    title: "Capital Gains Tax: Understanding LTCG and STCG for Investors",
    content: "Capital gains taxation guide...",
    excerpt: "Complete guide to capital gains taxation on stocks, mutual funds, and property. Learn about exemptions and planning strategies.",
    author: "CA Amit Jain",
    publishedAt: "2024-12-28",
    status: "published",
    tags: ["Capital Gains", "Investment", "Tax Planning"],
    readTime: 14,
    category: "Investment"
  }
];

export default function BlogIndexPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: blogPosts = sampleBlogPosts, isLoading } = useQuery({
    queryKey: ['/api/blog', searchTerm, selectedCategory],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = sampleBlogPosts;
      
      if (searchTerm) {
        filtered = filtered.filter(post => 
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      if (selectedCategory) {
        filtered = filtered.filter(post => post.category === selectedCategory);
      }
      
      return filtered;
    }
  });

  const featuredPost = blogPosts[0];

  return (
    <div className="min-h-screen bg-white pb-20">
      <MetaSEO
        title="Knowledge Hub | Expert Tax Guides & Finance Insights MyeCA.in"
        description="Master your finances with expert-led tax guides, ITR filing tips, and real-time regulatory updates."
        keywords={["tax regime comparison", "ITR filing 2025", "income tax guide", "GST updates India"]}
      />

      {/* Simplistic Hero Section */}
      <section className="pt-24 pb-20 border-b border-slate-50 bg-slate-50/30">
        <div className="container mx-auto px-4 text-center">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              Knowledge Hub
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-12 font-medium">
              Simplifying Indian taxation and financial laws for everyone.
            </p>

            <div className="max-w-xl mx-auto relative">
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-600/10 focus-within:border-blue-600 transition-all">
                <Search className="ml-4 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="What are you looking for?"
                  className="bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-base focus-visible:ring-0 h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </m.div>
        </div>
      </section>

      {/* Main Hub Layout */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* Main Feed */}
          <div className="lg:col-span-8">
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-12">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  !selectedCategory 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" 
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}
              >
                All Guides
              </button>
              {featuredCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                    selectedCategory === cat.name 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10" 
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="space-y-12">
              {/* Featured / Results Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest text-[13px]">
                  {searchTerm || selectedCategory ? "Results Found" : "Latest Articles"}
                </h2>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {blogPosts.length} Items Available
                </span>
              </div>

              {/* Minimalist Cards Feed */}
              <div className="grid gap-10">
                {blogPosts.map((post, index) => (
                  <m.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Link href={`/blog/${post.id}`}>
                      <div className="group cursor-pointer">
                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                          {/* Minimal Date/Category Block */}
                          <div className="md:w-32 shrink-0">
                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
                              {post.category}
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                              {post.title}
                            </h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-4 line-clamp-2">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {post.author}</span>
                              <span className="w-1 h-1 bg-slate-200 rounded-full" />
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime} min read</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-8 h-px bg-slate-50 w-full group-last:hidden" />
                      </div>
                    </Link>
                  </m.div>
                ))}
              </div>

              {blogPosts.length === 0 && (
                <div className="py-20 text-center">
                  <BookOpen className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">No results found for your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Simplistic Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-12">
              
              {/* Newsletter Block */}
              <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Stay Compliant</h4>
                <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">Join 5,000+ professionals receiving weekly tax insights.</p>
                <div className="space-y-3">
                  <Input 
                    placeholder="Email Address" 
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 focus-visible:ring-blue-600/10"
                  />
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]">
                    Join Newsletter
                  </Button>
                </div>
              </div>

              {/* Quick Services Link */}
              <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 group">
                <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-3">Professional Help?</h4>
                <p className="text-blue-700/70 text-sm font-medium mb-6">Schedule a 1-on-1 consultation with our senior CA team.</p>
                <Button variant="ghost" className="p-0 h-auto text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-transparent hover:text-blue-700 flex items-center gap-2 group-hover:gap-3 transition-all">
                  Book Consultation <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
