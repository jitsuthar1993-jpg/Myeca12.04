import { m } from "framer-motion";
import { Link } from "wouter";
import { Calendar, User, ArrowRight, Search, Clock, Rocket, Sparkles, TrendingUp, ChevronRight, BookOpen, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: postsData, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["public-blogs"],
    queryFn: async () => {
      const res = await fetch("/api/public/blogs");
      if (!res.ok) throw new Error("Failed to fetch blogs");
      return await res.json() as { posts: any[] };
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const res = await fetch("/api/public/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return await res.json() as { categories: any[] };
    },
  });

  const dbPosts = postsData?.posts || [];
  const dbCategories = ["All", "Direct Tax", "GST", "New", "Updates", "Others"];

  const filteredPosts = useMemo(() => {
    return dbPosts.filter((post: any) => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [dbPosts, searchQuery, selectedCategory]);

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  const formatDate = (dateObj: any) => {
    try {
      let date: Date;
      if (dateObj?._seconds) date = new Date(dateObj._seconds * 1000);
      else if (dateObj?.toDate) date = dateObj.toDate();
      else date = new Date(dateObj);
      return isNaN(date.getTime()) ? "Recent" : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return "Recent"; }
  };

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

      {/* Compact Split Banner */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #59A1FF 0%, #1572ED 100%)" }}
      >
        <div className="max-w-[1200px] mx-auto px-[30px] py-8 md:py-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left — Title */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="shrink-0"
            >
              <h1 className="text-[24px] md:text-[34px] font-bold text-white leading-[1.2] mb-1">
                Expert Tax & Finance Knowledge Hub
              </h1>
              <p className="text-white/75 text-[14px] md:text-[16px] font-medium max-w-md">
                Guides & compliance updates by India's top CAs.
              </p>
            </m.div>

            {/* Right — Search + Stats */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col gap-3 md:items-end"
            >
              <div className="flex items-center bg-white rounded px-4 h-[44px] w-full md:w-[360px]">
                <Search className="w-[16px] h-[16px] text-[#929FB0] mr-3 shrink-0" />
                <input
                  className="bg-transparent border-none outline-none text-[#314259] text-[14px] font-medium w-full placeholder:text-[#929FB0]"
                  placeholder="Search articles, guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-5 text-white/70 text-[12px] font-semibold">
                <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {dbPosts.length} Articles</span>
                <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Updated Weekly</span>
              </div>
            </m.div>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="max-w-[1200px] mx-auto px-[30px] py-3 border-b border-[#E5E5E5]">
        <nav className="flex items-center gap-1.5 text-[14px]">
          <Link href="/" className="text-[#1678FB] hover:underline font-medium">Home</Link>
          <span className="text-[#929FB0] mx-1">&gt;</span>
          <span className="text-[#314259] font-medium">Knowledge Hub</span>
        </nav>
      </div>

      <div id="blog-content" className="max-w-[1200px] mx-auto px-[30px] py-8">
        {/* Section Title & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 pb-6 border-b border-[#E5E5E5]">
          <div>
            <h2 className="text-[24px] font-bold text-[#314259] mb-1">Latest Articles</h2>
            <p className="text-[#929FB0] text-[14px] font-medium">Expert insights on tax planning, compliance, and financial growth.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {dbCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-[8px] rounded text-[14px] font-semibold transition-all border whitespace-nowrap",
                  selectedCategory === category
                    ? "bg-[#1572ED] text-white border-[#1572ED]"
                    : "bg-white text-[#314259] border-[#D5D5D5] hover:border-[#1572ED] hover:text-[#1572ED]"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {isLoadingPosts ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#1572ED] animate-spin mb-3" />
            <p className="text-[#929FB0] text-[14px] font-medium">Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-[#F3F8FF] rounded-[5px] border border-[#DFDFDF82]">
            <Search className="w-10 h-10 text-[#B7D5FE] mx-auto mb-4" />
            <h3 className="text-[20px] font-bold text-[#314259] mb-2">No Articles Found</h3>
            <p className="text-[#929FB0] text-[16px] mb-5">Try adjusting your search or filters.</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="bg-[#1678FB] hover:bg-[#0F5BB5] text-white rounded h-[40px] px-6 font-bold text-[14px] transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured Post — ClearTax grey-block style */}
            {featuredPost && (
              <m.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Link href={`/blog/${featuredPost.slug}`}>
                  <div className="group cursor-pointer rounded-[5px] border border-[#DFDFDF82] overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="grid md:grid-cols-5 gap-0">
                      <div className="md:col-span-2 h-[200px] md:h-auto relative overflow-hidden" style={{ backgroundColor: "#D0E4FE" }}>
                        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-40 group-hover:scale-105 transition-transform duration-500">
                          {featuredPost.featuredImage || featuredPost.image || "📄"}
                        </div>
                      </div>
                      <div className="md:col-span-3 p-[30px] flex flex-col justify-center bg-white">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[#1678FB] text-[14px] font-semibold">{featuredPost.category}</span>
                          <span className="text-[#929FB0] text-[14px]">·</span>
                          <span className="text-[#929FB0] text-[14px] flex items-center gap-1">
                            <Clock className="w-[14px] h-[14px]" /> {featuredPost.readTime || "5 min read"}
                          </span>
                        </div>
                        <h3 className="text-[24px] md:text-[28px] font-bold text-[#314259] mb-3 leading-[1.3] group-hover:text-[#1678FB] transition-colors">
                          {featuredPost.title}
                        </h3>
                        <p className="text-[#314259] text-[16px] font-medium leading-relaxed mb-5 line-clamp-3 opacity-80">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-[36px] h-[36px] rounded-full bg-[#1572ED] flex items-center justify-center text-white font-bold text-[14px]">
                              {featuredPost.author?.firstName?.charAt(0) || "A"}
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold text-[#314259]">{featuredPost.author?.firstName || "Admin"}</p>
                              <p className="text-[12px] text-[#929FB0]">{formatDate(featuredPost.createdAt)}</p>
                            </div>
                          </div>
                          <span className="text-[#1678FB] font-semibold text-[14px] flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read More <ArrowRight className="w-[16px] h-[16px]" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </m.div>
            )}

            {/* Article Grid — 3 columns */}
            <div className="grid gap-[20px] md:grid-cols-2 lg:grid-cols-3">
              {regularPosts.map((post: any) => (
                <m.div
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="h-full bg-white border border-[#DFDFDF82] rounded-[5px] overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer flex flex-col">
                      <div className="h-[180px] relative overflow-hidden" style={{ backgroundColor: "#F3F8FF" }}>
                        <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30 group-hover:scale-105 transition-transform duration-500">
                          {post.featuredImage || post.image || "📄"}
                        </div>
                        <div className="absolute top-[10px] left-[10px]">
                          <span className="bg-white text-[#1678FB] text-[12px] font-semibold px-[10px] py-[4px] rounded-[3px] border border-[#DFDFDF82]">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-[20px] flex-grow flex flex-col">
                        <div className="flex items-center gap-4 text-[13px] text-[#929FB0] mb-3 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-[13px] h-[13px]" />
                            {formatDate(post.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-[13px] h-[13px]" />
                            {post.readTime || "5 min"}
                          </span>
                        </div>

                        <h3 className="text-[18px] font-bold text-[#314259] mb-2 leading-[1.4] group-hover:text-[#1678FB] transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-[14px] text-[#314259] opacity-70 font-medium leading-[1.6] mb-4 line-clamp-2 flex-grow">
                          {post.excerpt}
                        </p>

                        <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-[28px] h-[28px] rounded-full bg-[#EBF4FF] flex items-center justify-center text-[#1572ED] font-bold text-[11px]">
                              {post.author?.firstName?.charAt(0) || "A"}
                            </div>
                            <span className="text-[13px] font-medium text-[#314259]">{post.author?.firstName || "Admin"}</span>
                          </div>
                          <ArrowRight className="w-[16px] h-[16px] text-[#929FB0] group-hover:text-[#1678FB] group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </m.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Newsletter CTA — ClearTax grey-block style */}
      <div className="max-w-[1200px] mx-auto px-[30px] mt-12">
        <div className="p-[30px] md:p-[50px] rounded-[5px] text-center" style={{ backgroundColor: "#D0E4FE" }}>
          <h2 className="text-[24px] md:text-[28px] font-bold text-[#314259] mb-3 leading-[1.3]">
            Get Expert Tax Tips in Your Inbox
          </h2>
          <p className="text-[#314259] opacity-70 text-[16px] font-medium mb-8 max-w-lg mx-auto leading-relaxed">
            Join 50,000+ taxpayers who receive weekly tax-saving strategies and compliance updates from our senior CAs.
          </p>

          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 bg-white border border-[#DFDFDF82] rounded h-[48px] px-[16px] text-[16px] text-[#314259] font-medium outline-none focus:border-[#1572ED] placeholder:text-[#929FB0] transition-colors"
              placeholder="Enter your email address"
            />
            <button className="bg-[#1678FB] hover:bg-[#0F5BB5] text-white rounded h-[48px] px-8 font-bold text-[16px] transition-all hover:scale-[1.02] whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="mt-5 text-[12px] text-[#314259] opacity-50 font-medium">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
