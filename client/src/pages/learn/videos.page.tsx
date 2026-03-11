import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import {
  Play,
  Search,
  Clock,
  Eye,
  ThumbsUp,
  BookOpen,
  TrendingUp,
  Calculator,
  Receipt,
  Shield,
  Building2,
  PiggyBank,
  FileText,
  Filter,
  ChevronRight,
  Star,
  User
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  VIDEO_TUTORIALS,
  VIDEO_CATEGORIES,
  VideoTutorial,
  VideoCategory,
  getVideosByCategory,
  getPopularVideos,
  getRecentVideos,
  searchVideos,
  getRelatedVideos,
} from "@/data/video-tutorials";

const CATEGORY_ICONS: Record<VideoCategory, React.ReactNode> = {
  'itr-filing': <FileText className="h-5 w-5" />,
  'tax-saving': <PiggyBank className="h-5 w-5" />,
  'calculators': <Calculator className="h-5 w-5" />,
  'gst': <Receipt className="h-5 w-5" />,
  'investments': <TrendingUp className="h-5 w-5" />,
  'business': <Building2 className="h-5 w-5" />,
  'compliance': <Shield className="h-5 w-5" />,
};

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function VideoTutorialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | 'all'>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<string[]>(() => {
    const saved = localStorage.getItem('watchedVideos');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter videos
  const filteredVideos = useMemo(() => {
    let videos = VIDEO_TUTORIALS;
    
    if (searchQuery) {
      videos = searchVideos(searchQuery);
    }
    
    if (selectedCategory !== 'all') {
      videos = videos.filter(v => v.category === selectedCategory);
    }
    
    return videos;
  }, [searchQuery, selectedCategory]);

  const popularVideos = useMemo(() => getPopularVideos(4), []);
  const recentVideos = useMemo(() => getRecentVideos(4), []);

  // Mark video as watched
  const markAsWatched = (videoId: string) => {
    if (!watchedVideos.includes(videoId)) {
      const updated = [...watchedVideos, videoId];
      setWatchedVideos(updated);
      localStorage.setItem('watchedVideos', JSON.stringify(updated));
    }
  };

  // Format views
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return views.toString();
  };

  // Video card component
  const VideoCard = ({ video, size = 'normal' }: { video: VideoTutorial; size?: 'normal' | 'small' }) => {
    const isWatched = watchedVideos.includes(video.id);
    const category = VIDEO_CATEGORIES.find(c => c.id === video.category);
    
    return (
      <Card 
        className={`group cursor-pointer hover:shadow-lg transition-all duration-300 ${isWatched ? 'opacity-75' : ''} ${size === 'small' ? '' : ''}`}
        onClick={() => {
          setSelectedVideo(video);
          markAsWatched(video.id);
        }}
      >
        <div className="relative">
          {/* Thumbnail placeholder */}
          <div className={`bg-gradient-to-br from-slate-700 to-slate-900 ${size === 'small' ? 'h-32' : 'h-40'} rounded-t-lg flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <Play className="h-12 w-12 text-white/80 group-hover:text-white group-hover:scale-110 transition-all" />
            {/* Duration badge */}
            <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-xs">
              {video.duration}
            </Badge>
            {isWatched && (
              <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">
                Watched
              </Badge>
            )}
          </div>
        </div>
        <CardContent className={`${size === 'small' ? 'p-3' : 'p-4'}`}>
          <div className="flex items-start gap-2 mb-2">
            <Badge variant="outline" className={`text-xs ${category ? `border-${category.color}-300 text-${category.color}-700` : ''}`}>
              {category?.name}
            </Badge>
            <Badge className={`text-xs ${DIFFICULTY_COLORS[video.difficulty]}`}>
              {video.difficulty}
            </Badge>
          </div>
          <h3 className={`font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors ${size === 'small' ? 'text-sm' : ''}`}>
            {video.title}
          </h3>
          {size !== 'small' && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{video.description}</p>
          )}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatViews(video.views)}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {formatViews(video.likes)}
              </span>
            </div>
            <span>{video.instructor}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-red-200 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-red-300" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/learn" className="text-red-200 hover:text-white">Learn</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-red-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Video Tutorials</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Play className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Video Tutorials</h1>
              <p className="text-red-200 mt-1">
                Learn tax filing, savings strategies, and more with expert-led videos
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-md">
            <div className="text-center">
              <p className="text-2xl font-bold">{VIDEO_TUTORIALS.length}</p>
              <p className="text-sm text-red-200">Videos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{VIDEO_CATEGORIES.length}</p>
              <p className="text-sm text-red-200">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{watchedVideos.length}</p>
              <p className="text-sm text-red-200">Watched</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Videos
          </Button>
          {VIDEO_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-1"
            >
              {CATEGORY_ICONS[category.id]}
              {category.name}
            </Button>
          ))}
        </div>

        {searchQuery || selectedCategory !== 'all' ? (
          /* Filtered Results */
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} found
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No videos found</h3>
                <p className="text-gray-500">Try a different search term or category</p>
              </div>
            )}
          </div>
        ) : (
          /* Default View with Sections */
          <div className="space-y-12">
            {/* Popular Videos */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Most Popular
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="#all">View All <ChevronRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </section>

            {/* Recent Videos */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Recently Added
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </section>

            {/* Videos by Category */}
            {VIDEO_CATEGORIES.map((category) => {
              const categoryVideos = getVideosByCategory(category.id);
              if (categoryVideos.length === 0) return null;
              
              return (
                <section key={category.id}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      {CATEGORY_ICONS[category.id]}
                      {category.name}
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      View All ({categoryVideos.length}) <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoryVideos.slice(0, 4).map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedVideo && (
            <>
              <div className="aspect-video bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-t-lg"
                />
              </div>
              <div className="p-6">
                <div className="flex items-start gap-2 mb-2">
                  <Badge variant="outline">
                    {VIDEO_CATEGORIES.find(c => c.id === selectedVideo.category)?.name}
                  </Badge>
                  <Badge className={DIFFICULTY_COLORS[selectedVideo.difficulty]}>
                    {selectedVideo.difficulty}
                  </Badge>
                </div>
                <h2 className="text-xl font-bold mb-2">{selectedVideo.title}</h2>
                <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {selectedVideo.instructor}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedVideo.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {formatViews(selectedVideo.views)} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {formatViews(selectedVideo.likes)}
                    </span>
                  </div>
                </div>

                {/* Related Videos */}
                {selectedVideo.relatedVideos.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Related Videos</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {getRelatedVideos(selectedVideo.id).slice(0, 2).map((video) => (
                        <Card 
                          key={video.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            setSelectedVideo(video);
                            markAsWatched(video.id);
                          }}
                        >
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className="w-16 h-12 bg-slate-700 rounded flex items-center justify-center flex-shrink-0">
                              <Play className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm line-clamp-2">{video.title}</p>
                              <p className="text-xs text-gray-500">{video.duration}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

