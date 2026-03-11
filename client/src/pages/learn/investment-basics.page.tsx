import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, BookOpen, Clock, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { Link } from "wouter";

const articles = [
  {
    id: 1,
    title: "Stock Market Basics for Beginners",
    description: "Understand how the stock market works, what shares are, and how to start investing safely.",
    category: "Beginner",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 2,
    title: "Understanding Mutual Funds & SIPs",
    description: "Learn about the power of compounding with Systematic Investment Plans (SIPs) in mutual funds.",
    category: "Intermediate",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 3,
    title: "Tax Harvesting: Save on Capital Gains",
    description: "A comprehensive guide to tax-loss harvesting and how it can increase your post-tax returns.",
    category: "Advanced",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=60"
  }
];

const videos = [
  {
    id: 1,
    title: "How to Read a Balance Sheet",
    duration: "12:30",
    category: "Fundamental Analysis"
  },
  {
    id: 2,
    title: "Technical Analysis 101: Candlesticks",
    duration: "15:45",
    category: "Technical Analysis"
  },
  {
    id: 3,
    title: "Building a Diversified Portfolio",
    duration: "08:20",
    category: "Portfolio Management"
  }
];

export default function InvestmentEducationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title="Investment Learning Center - MyeCA"
        description="Master the art of investing with our curated guides, videos, and tutorials."
      />

      <div className="text-center mb-12">
        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1">Learning Center</Badge>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Master Your Money</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Whether you're a beginner or an experienced trader, our educational resources will help you make smarter investment decisions.
        </p>
      </div>

      <Tabs defaultValue="guides" className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="guides">Articles & Guides</TabsTrigger>
            <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="guides">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center text-xs text-slate-500">
                      <Clock className="w-3 h-3 mr-1" /> {article.readTime}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-slate-600 text-sm line-clamp-3">
                    {article.description}
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full justify-between text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <Card key={video.id} className="cursor-pointer group">
                <div className="relative bg-slate-900 aspect-video rounded-t-lg flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </span>
                </div>
                <CardHeader>
                  <div className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wider">
                    {video.category}
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* CTA Section */}
      <div className="mt-16 bg-slate-900 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start investing?</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Take our quick risk assessment to find the perfect investment strategy tailored to your goals.
          </p>
          <Link href="/investment/risk-assessment">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              Take Risk Assessment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
