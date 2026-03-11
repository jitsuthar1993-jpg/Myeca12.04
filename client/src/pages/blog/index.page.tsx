import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Calendar, User, ArrowRight, Clock, Tag, TrendingUp, FileText, Calculator, BookOpen, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

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
    title: "New Tax Regime vs Old Tax Regime: Complete Comparison for AY 2025-26",
    content: "Detailed comparison of tax regimes...",
    excerpt: "Learn which tax regime works best for your income level and investment pattern. Get detailed comparisons with real examples.",
    author: "CA Priya Sharma",
    publishedAt: "2025-01-10",
    status: "published",
    tags: ["Tax Planning", "ITR Filing", "New Tax Regime"],
    readTime: 8,
    category: "Tax Planning"
  },
  {
    id: 2,
    title: "Step-by-Step Guide to Filing ITR-1 Online in 2025",
    content: "Complete guide for ITR-1 filing...",
    excerpt: "Master the art of filing ITR-1 with our comprehensive guide. Avoid common mistakes and maximize your refunds.",
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
    excerpt: "Discover the best investment options under Section 80C to save up to \u20B946,800 in taxes while building wealth.",
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

  // In a real app, this would fetch from the API
  const { data: blogPosts = sampleBlogPosts, isLoading } = useQuery({
    queryKey: ['/api/blog', searchTerm, selectedCategory],
    queryFn: async () => {
      // Simulate API call - replace with actual API call
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
  const regularPosts = blogPosts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 py-8 mobile-safe-bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/">
            <Button variant="ghost" className="hover:bg-blue-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tax Knowledge Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest tax news, filing guides, and expert insights from our certified Chartered Accountants
          </p>
        </motion.div>

        {/* Search and Categories */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search articles, guides, tax tips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg"
              />
            </div>
          </div>

          {/* Featured Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {featuredCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card 
                  key={category.name}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === category.name ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${category.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count} articles</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedCategory) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {searchTerm && (
                <Badge variant="secondary" className="px-3 py-1">
                  Search: "{searchTerm}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-0"
                    onClick={() => setSearchTerm("")}
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="px-3 py-1">
                  Category: {selectedCategory}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-0"
                    onClick={() => setSelectedCategory(null)}
                  >
                    ×
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </motion.div>

        {/* Featured Article */}
        {featuredPost && !searchTerm && !selectedCategory && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Article</h2>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                <div className="md:w-2/3 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Featured</Badge>
                    <Badge variant="outline">{featuredPost.category}</Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {featuredPost.title}
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {featuredPost.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(featuredPost.publishedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {featuredPost.readTime} min read
                      </div>
                    </div>
                    <Link href={`/blog/${featuredPost.id}`}>
                      <Button className="group">
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="md:w-1/3 bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-blue-800 font-medium">Latest Tax Insights</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchTerm || selectedCategory ? 'Search Results' : 'Latest Articles'}
            </h2>
            <p className="text-gray-500">
              {blogPosts.length} article{blogPosts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : blogPosts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search terms or browse our categories
                </p>
                <Button onClick={() => { setSearchTerm(""); setSelectedCategory(null); }}>
                  View All Articles
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(searchTerm || selectedCategory ? blogPosts : regularPosts).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow group">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {post.readTime} min
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Separator className="mb-4" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <Link href={`/blog/${post.id}`} className="mt-4">
                        <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:border-blue-200">
                          Read More
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Newsletter Subscription */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated with Tax News</h3>
              <p className="mb-6 text-blue-100">
                Get the latest tax updates, filing deadlines, and expert tips delivered to your inbox
              </p>
              <div className="max-w-md mx-auto flex gap-4">
                <Input 
                  placeholder="Enter your email" 
                  className="bg-white text-gray-900"
                />
                <Button variant="secondary" className="whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}