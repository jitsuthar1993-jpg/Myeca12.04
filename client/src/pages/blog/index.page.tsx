import { useState } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, ArrowRight, Clock, BookOpen, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: number | string;
  slug?: string;
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
  { name: "Tax Planning" },
  { name: "ITR Filing" },
  { name: "Investment" },
  { name: "Tax Updates" }
];

function mapPublicBlogPost(post: any): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: "",
    excerpt: post.excerpt || "",
    author: post.authorName || "MyeCA Editorial",
    publishedAt: post.publishedAt || post.updatedAt || new Date().toISOString(),
    status: "published",
    tags: Array.isArray(post.tags) ? post.tags : [],
    readTime: post.readingTimeMinutes || 5,
    category: post.category?.name || "Tax Guides",
  };
}

export default function BlogIndexPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: blogPosts = [],
    error,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/api/public/blogs', searchTerm, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "24" });
      if (searchTerm) params.set("search", searchTerm);
      if (selectedCategory) params.set("category", selectedCategory);

      const response = await fetch(`/api/public/blogs?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch published blog posts");
      }

      const payload = await response.json();
      return Array.isArray(payload.posts) ? payload.posts.map(mapPublicBlogPost) : [];
    },
  });

  return (
    <div className="min-h-screen bg-white pb-20">
      <MetaSEO
        title="Knowledge Hub | Expert Tax Guides & Finance Insights MyeCA.in"
        description="Master your finances with expert-led tax guides, ITR filing tips, and practical regulatory explainers."
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
                    ? "bg-blue-700 text-white shadow-lg shadow-slate-900/10"
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

              {isLoading ? (
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 py-14 text-sm font-black uppercase tracking-widest text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  Loading articles
                </div>
              ) : isError ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-rose-600" />
                      <div>
                        <h3 className="text-base font-black text-rose-950">Articles could not be loaded</h3>
                        <p className="mt-2 text-sm font-semibold leading-6 text-rose-800">
                          {error instanceof Error ? error.message : "Please try again in a moment."}
                        </p>
                      </div>
                    </div>
                    <Button type="button" variant="outline" onClick={() => refetch()} className="border-rose-200 bg-white text-rose-800 hover:bg-rose-100">
                      Retry
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-10">
                  {blogPosts.map((post, index) => (
                    <m.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <Link href={`/blog/${post.slug || post.id}`}>
                        <div className="group cursor-pointer">
                          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
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
              )}

              {!isLoading && !isError && blogPosts.length === 0 && (
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
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Stay Current</h4>
                <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
                  Browse practical tax guides, then use MyeCA tools when a filing decision needs review.
                </p>
                <div className="space-y-3">
                  <Link href="/learn">
                    <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-xl h-11 font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]">
                      Browse Guides
                    </Button>
                  </Link>
                  <Link href="/calculators">
                    <Button variant="outline" className="w-full rounded-xl h-11 font-black text-xs uppercase tracking-widest">
                      Open Calculators
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Quick Services Link */}
              <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 group">
                <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-3">Professional Help?</h4>
                <p className="text-blue-700/70 text-sm font-medium mb-6">Schedule a 1-on-1 consultation with our senior CA team.</p>
                <Link href="/expert-consultation">
                  <Button variant="ghost" className="p-0 h-auto text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-transparent hover:text-blue-700 flex items-center gap-2 group-hover:gap-3 transition-all">
                    Book Consultation <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
