import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { Calendar, User, ArrowLeft, Tag, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import ShareButtons from "@/components/ShareButtons";
import { Loader2 } from "lucide-react";

export default function BlogPostPage() {
  const { slug } = useParams();

  const { data: postData, isLoading, error } = useQuery({
    queryKey: ["public-blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/public/blogs/${slug}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch blog post");
      }
      const data = await res.json() as { post: any };
      return data.post;
    },
  });

  const post = postData;

  // For related posts, we can either fetch them from another endpoint or just reuse the general posts list
  const { data: allPostsData } = useQuery({
    queryKey: ["public-blogs"],
    queryFn: async () => {
      const res = await fetch("/api/public/blogs");
      if (!res.ok) return { posts: [] };
      return await res.json() as { posts: any[] };
    },
    enabled: !!post,
  });

  const relatedPosts = allPostsData?.posts
    ? allPostsData.posts
      .filter((p: any) => p.id !== post?.id && p.category === post?.category)
      .slice(0, 3)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Link href="/blog">
              <Button variant="ghost" className="text-white hover:bg-white/10 mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                {post.category}
              </span>
              <span className="text-6xl animate-float">{post.featuredImage || "📄"}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-up">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>{post.author?.firstName || "Admin"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8"
          >
            {/* Share Buttons */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b">
              <div className="flex flex-wrap gap-2">
                {(JSON.parse(post.tags || "[]")).map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
              <ShareButtons 
                url={`https://myeca.in/blog/${post.slug}`}
                title={post.title}
                description={post.excerpt}
              />
            </div>
            
            {/* Article Content */}
            <article 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Author Info */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.author?.firstName || "Admin"}</h3>
                  <p className="text-gray-600">Chartered Accountant | Tax Expert</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl">{relatedPost.featuredImage || "📄"}</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {relatedPost.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{relatedPost.excerpt}</p>
                        <div className="mt-4 text-sm text-gray-500">
                          {relatedPost.readTime}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}