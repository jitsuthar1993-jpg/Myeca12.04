import { motion } from "framer-motion";
import { Link } from "wouter";
import { Calendar, User, ArrowRight, Search, Tag, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ShareButtons from "@/components/ShareButtons";
import { SectionHeader } from "@/components/ui/section-header";
import { Loader2 } from "lucide-react";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: postsData, isLoading: isLoadingPosts, error: postsError } = useQuery({
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
  const dbCategories = ["All", ...(categoriesData?.categories?.map((c: any) => c.name) || [])];

  const filteredPosts = dbPosts.filter((post: any) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-24 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-overlay animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl mix-blend-overlay animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeader
                title="Tax Insights & Resources"
                highlight="Expert Knowledge"
                subtitle="Stay ahead with the latest tax updates, filing guides, and financial planning strategies."
                align="center"
                className="mb-10"
              />
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search articles, topics, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 pr-6 py-7 text-lg rounded-full text-gray-900 bg-white/95 backdrop-blur-sm shadow-xl border-0 focus-visible:ring-2 focus-visible:ring-blue-400 placeholder:text-gray-400"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 py-4 overflow-x-auto no-scrollbar">
            {dbCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${selectedCategory === category
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200"
                  : "bg-gray-100/80 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {isLoadingPosts ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading interesting articles for you...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-block p-6 rounded-full bg-blue-50 mb-4">
              <Search className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any articles matching your search. Try using different keywords or clear the filters.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
            >
              Clear all filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group h-full"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative cursor-pointer">
                    {/* Card Header / Image Area */}
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors duration-500">
                      <div className="absolute top-0 right-0 p-4 z-10">
                        <span className="bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-blue-100">
                          {post.category}
                        </span>
                      </div>
                      <div className="text-6xl transform group-hover:scale-110 transition-transform duration-500 drop-shadow-lg filter">
                        {post.image}
                      </div>
                      {/* Decorative circles */}
                      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-200/20 rounded-full blur-xl" />
                      <div className="absolute top-4 right-1/4 w-16 h-16 bg-purple-200/20 rounded-full blur-lg" />
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      {/* Meta Info Top */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 font-medium">
                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        {post.readTime && (
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                            <Clock className="h-3 w-3" />
                            {post.readTime}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-grow">
                        {post.excerpt}
                      </p>

                       {/* Tags */}
                       <div className="flex flex-wrap gap-2 mb-6">
                        {(JSON.parse(post.tags) || []).slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-sm border border-gray-100"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                       {/* Footer / Author */}
                       <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-white shadow-sm">
                            {(post.author?.firstName || "A").charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-gray-700">{post.author?.firstName || "Admin"}</span>
                        </div>
                        <span className="text-blue-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-24 relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>

          <div className="relative z-10 p-10 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Stay Ahead of the Curve</h2>
            <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Join 50,000+ subscribers getting the latest tax updates, money-saving tips, and financial insights delivered straight to their inbox.
            </p>

            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/70 h-12 rounded-xl focus-visible:ring-white/50"
              />
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold h-12 px-8 rounded-xl shadow-lg transition-transform hover:scale-105">
                Subscribe Now
              </Button>
            </div>
            <p className="mt-4 text-xs text-blue-200/80">
              No spam, ever. Unsubscribe at any time.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}