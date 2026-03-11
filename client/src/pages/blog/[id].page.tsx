import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Clock, Share2, BookmarkPlus, ArrowLeft, ArrowRight, Tag, ThumbsUp, MessageCircle, Eye } from "lucide-react";
import { Link, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";

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
  views: number;
  likes: number;
  comments: number;
}

// Sample detailed blog content
const sampleBlogPosts: { [key: string]: BlogPost } = {
  "1": {
    id: 1,
    title: "New Tax Regime vs Old Tax Regime: Complete Comparison for AY 2025-26",
    content: `
# Understanding Tax Regimes in India

The Income Tax Department introduced the new tax regime as an alternative to the existing (old) tax regime. Both regimes have their own advantages and choosing the right one can significantly impact your tax liability.

## Old Tax Regime Features

The old tax regime allows taxpayers to claim various deductions and exemptions:

### Key Deductions Available:
- **Section 80C**: Up to \u20B91,50,000 for investments in ELSS, PPF, life insurance, etc.
- **Section 80D**: Up to \u20B925,000-\u20B950,000 for health insurance premiums
- **Section 24(b)**: Up to \u20B92,00,000 for home loan interest (self-occupied property)
- **HRA Exemption**: House Rent Allowance exemption for salaried employees
- **LTA**: Leave Travel Allowance exemption

### Tax Slabs (Old Regime):
- Up to \u20B92,50,000: Nil
- \u20B92,50,001 to \u20B95,00,000: 5%
- \u20B95,00,001 to \u20B910,00,000: 20%
- Above \u20B910,00,000: 30%

## New Tax Regime Features

The new tax regime offers lower tax rates but with limited deductions:

### Tax Slabs (New Regime):
- Up to \u20B93,00,000: Nil
- \u20B93,00,001 to \u20B96,00,000: 5%
- \u20B96,00,001 to \u20B99,00,000: 10%
- \u20B99,00,001 to \u20B912,00,000: 15%
- \u20B912,00,001 to \u20B915,00,000: 20%
- Above \u20B915,00,000: 30%

### Available Deductions:
- Standard deduction: \u20B950,000
- Employer's contribution to NPS: Up to \u20B97,50,000
- Interest on home loan (self-occupied): Up to \u20B92,00,000

## Which Regime Should You Choose?

### Choose Old Regime If:
1. Your total deductions exceed \u20B92,50,000 annually
2. You have a home loan with significant interest payments
3. You receive HRA and pay house rent
4. You make substantial investments in tax-saving instruments

### Choose New Regime If:
1. Your deductions are minimal (less than \u20B92,50,000)
2. You prefer simplicity in tax calculations
3. You're a young professional with limited investments
4. You want to benefit from higher basic exemption limit

## Calculation Example

Let's consider a salary of \u20B912,00,000:

### Old Regime Calculation:
- Gross Income: \u20B912,00,000
- Deductions (80C + 80D + HRA): \u20B93,00,000
- Taxable Income: \u20B99,00,000
- Tax Calculation:
  - First \u20B92,50,000: Nil
  - Next \u20B92,50,000 (2.5L to 5L): \u20B912,500
  - Next \u20B94,00,000 (5L to 9L): \u20B980,000
- Total Tax: \u20B992,500
- Cess (4%): \u20B93,700
- **Total Tax Liability: \u20B996,200**

### New Regime Calculation:
- Gross Income: \u20B912,00,000
- Standard Deduction: \u20B950,000
- Taxable Income: \u20B911,50,000
- Tax Calculation:
  - First \u20B93,00,000: Nil
  - Next \u20B93,00,000 (3L to 6L): \u20B915,000
  - Next \u20B93,00,000 (6L to 9L): \u20B930,000
  - Next \u20B92,50,000 (9L to 11.5L): \u20B937,500
- Total Tax: \u20B982,500
- Cess (4%): \u20B93,300
- **Total Tax Liability: \u20B985,800**

In this example, the new regime saves \u20B910,400 in taxes.

## Important Considerations

1. **One-time Choice**: You can switch between regimes every year when filing ITR
2. **Salary Earners**: Choice can be made at the beginning of financial year
3. **Business Income**: Choice is annual and can be changed
4. **Form 10-IE**: Required to opt for new regime if you're a salaried employee

## Recent Updates for AY 2025-26

The government has made several changes to make the new regime more attractive:
- Increased basic exemption limit to \u20B93,00,000
- Revised tax slabs for better tax efficiency
- Enhanced standard deduction benefits

## Conclusion

The choice between old and new tax regime depends on your individual financial situation. Use tax calculators and consult with tax professionals to make an informed decision. Remember, you can review and change your choice every year based on your circumstances.

**Key Takeaway**: If your total deductions are less than \u20B92.5 lakhs, the new regime is likely beneficial. For those with higher deductions, especially home loan borrowers, the old regime might be more advantageous.
    `,
    excerpt: "Learn which tax regime works best for your income level and investment pattern. Get detailed comparisons with real examples.",
    author: "CA Priya Sharma",
    publishedAt: "2025-01-10",
    status: "published",
    tags: ["Tax Planning", "ITR Filing", "New Tax Regime"],
    readTime: 8,
    category: "Tax Planning",
    views: 1247,
    likes: 89,
    comments: 23
  }
};

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  
  const post = id ? sampleBlogPosts[id] : null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Article link copied to clipboard",
      });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Bookmark Removed" : "Bookmarked",
      description: isBookmarked ? "Article removed from bookmarks" : "Article saved to bookmarks",
    });
  };

  const handleLike = () => {
    setHasLiked(!hasLiked);
    toast({
      title: hasLiked ? "Like Removed" : "Liked",
      description: hasLiked ? "Like removed from article" : "Thanks for liking this article!",
    });
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h2>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button>Back to Blog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert content to JSX (in a real app, you'd use a markdown parser)
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-8">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-gray-900 mb-3 mt-6">{line.substring(4)}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="text-gray-700 mb-2 ml-4">{line.substring(2)}</li>;
      } else if (line.includes('**') && line.includes(':')) {
        const parts = line.split('**');
        return (
          <p key={index} className="text-gray-700 mb-2">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </p>
        );
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="text-gray-700 mb-4 leading-relaxed">{line}</p>;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mobile-safe-bottom">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/blog">
            <Button variant="ghost" className="hover:bg-blue-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{post.category}</Badge>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views.toLocaleString()} views
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                {post.likes} likes
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {post.comments} comments
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="font-medium">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                className={hasLiked ? "bg-red-50 border-red-200 text-red-600" : ""}
              >
                <ThumbsUp className={`h-4 w-4 mr-2 ${hasLiked ? "fill-current" : ""}`} />
                {hasLiked ? "Liked" : "Like"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? "bg-blue-50 border-blue-200 text-blue-600" : ""}
              >
                <BookmarkPlus className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                {isBookmarked ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-sm">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="mb-8">
            <CardContent className="p-8 prose prose-lg max-w-none">
              {formatContent(post.content)}
            </CardContent>
          </Card>
        </motion.div>

        {/* Article Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-8"
        >
          {/* Author Bio */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Author</h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{post.author}</h4>
                  <p className="text-gray-600 mt-2">
                    Chartered Accountant with over 10 years of experience in tax planning and compliance. 
                    Specializes in helping individuals and businesses optimize their tax strategies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          <Card>
            <CardHeader>
              <CardTitle>Related Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/blog/2" className="group">
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                      Step-by-Step Guide to Filing ITR-1 Online in 2025
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Master the art of filing ITR-1 with our comprehensive guide...
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      12 min read
                    </div>
                  </div>
                </Link>
                <Link href="/blog/3" className="group">
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                      Budget 2025: Key Changes in Income Tax
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Understand the latest budget announcements and their impact...
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      10 min read
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Newsletter CTA */}
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Never Miss a Tax Update</h3>
              <p className="mb-6 text-blue-100">
                Subscribe to our newsletter and get the latest tax insights delivered to your inbox
              </p>
              <Button variant="secondary" size="lg">
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}