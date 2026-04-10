import { m } from "framer-motion";
import { Link } from "wouter";
import { Calendar, User, ArrowRight, Search, Tag, Clock, Rocket, Sparkles, TrendingUp, Filter, ChevronRight, BookOpen, Landmark, Receipt, Building2, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import ShareButtons from "@/components/ShareButtons";
import { SectionHeader } from "@/components/ui/section-header";
import { Loader2 } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = 12;

  const { data: postsData, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["public-blogs", page, selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(POSTS_PER_PAGE),
      });
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/public/blogs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch blogs");
      return await res.json() as { posts: any[]; total: number; page: number; hasMore: boolean };
    },
    placeholderData: (prev) => prev,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const res = await fetch("/api/public/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return await res.json() as { categories: any[] };
    },
  });

  const filteredPosts = postsData?.posts || [];
  const hasMore = postsData?.hasMore ?? false;
  const dbCategories = ["All", "Direct Tax", "GST", "New", "Updates", "Others"];

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-white pb-32">
      <MetaSEO
        title="Knowledge Hub | Expert Tax Guides & Finance Insights MyeCA.in"
        description="Daily tax insights, compliance deep-dives, and financial growth hacks curated by India's top experts."
        keywords={[
          "tax blog India", "income tax updates", "ITR filing guide", "tax planning tips", 
          "GST news", "investment advice India"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Knowledge Hub", url: "/blog" }
        ]}
      />

      {/* ─── Compact Hero Section (Light Grey) ─── */}
      <section className="relative pt-16 pb-12 bg-slate-50 overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] -ml-24 -mb-24" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <m.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-black text-slate-900 mb-6 uppercase tracking-wider"
          >
            Master Your <span className="text-blue-600">Financial Destiny</span>
          </m.h1>
          
          <m.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto relative group"
          >
            <div className="relative group flex items-center bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-500">
              <Search className="ml-5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                className="bg-transparent border-none text-slate-900 text-base h-12 focus-visible:ring-0 placeholder:text-slate-400 px-4 font-medium"
                placeholder="Search financial intelligence..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              />
              <Button
                onClick={() => {
                  handleSearch();
                  document.getElementById('blog-content')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Search
              </Button>
            </div>
          </m.div>
        </div>
      </section>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Latest <span className="text-blue-600">Blogs</span></h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Daily insights, compliance deep-dives, and financial updates.</p>
          </div>
          
          <div className="flex items-center gap-2">
            {dbCategories.map((category) => (
              <m.button
                key={category}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryChange(category)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border whitespace-nowrap",
                  selectedCategory === category
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600"
                )}
              >
                {category}
              </m.button>
            ))}
          </div>
        </div>

        {isLoadingPosts ? (
          <div className="flex flex-col items-center justify-center py-20">
            <m.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"
            />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Loading...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100"
          >
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Insights Found</h3>
            <Button 
              variant="outline" 
              onClick={() => { setSearchQuery(""); setSearchInput(""); setSelectedCategory("All"); setPage(1); }}
              className="mt-4 h-10 rounded-xl"
            >
              Reset Filters
            </Button>
          </m.div>
        ) : (
          <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPosts.map((post: any) => (
              <div key={post.id} className="group">
                <Link href={`/blog/${post.slug}`}>
                  <Card className="h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-500 cursor-pointer flex flex-col">
                    <div className="h-44 relative overflow-hidden bg-slate-50">
                      <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-40 group-hover:scale-110 transition-transform duration-500">
                        {post.featuredImage || post.image || "📄"}
                      </div>
                      <div className="absolute top-4 right-4 z-10">
                        <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[8px] font-black px-3 py-1 rounded-lg border border-slate-200 uppercase tracking-wider">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-5 flex-grow flex flex-col">
                      <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-blue-500" />
                          {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-black text-[8px] border border-slate-200">
                              {post.author?.firstName?.charAt(0) || "A"}
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">{post.author?.firstName || "Admin"}</span>
                         </div>
                         <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest"
            >
              Previous
            </Button>
            <span className="text-sm font-bold text-slate-500">Page {page}</span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
              className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest"
            >
              Next
            </Button>
          </div>
          </>
        )}
      </div>

        {/* ─── CTA: The Vault (Light Grey) ─── */}
        <m.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="relative p-10 md:p-16 rounded-[2.5rem] bg-slate-100 overflow-hidden text-center group border border-slate-200">
            <div className="absolute inset-0 opacity-40">
               <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] -ml-24 -mt-24 animate-pulse" />
               <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] -mr-24 -mb-24" />
            </div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-8 border border-slate-200 shadow-sm">
                <Rocket className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
                Secure Your <span className="text-blue-600 italic">Financial Sovereignty</span>
              </h2>
              <p className="text-lg text-slate-500 mb-10 font-medium leading-relaxed max-w-xl mx-auto">
                Join 50k+ elite taxpayers who receive high-signal intelligence and 
                wealth preservation strategies directly from our senior CAs.
              </p>
              
              <div className="max-w-xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <Input 
                    className="bg-transparent border-none text-slate-900 text-base h-12 rounded-xl px-6 focus-visible:ring-0 placeholder:text-slate-400 flex-1"
                    placeholder="Email Address"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl px-10 font-black text-[10px] uppercase tracking-widest transition-all">
                    Subscribe
                  </Button>
                </div>
              </div>
              <p className="mt-8 text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                Zero Noise · Peerless Accuracy · Absolute Privacy
              </p>
            </div>
          </div>
        </m.div>
    </div>
  );
}