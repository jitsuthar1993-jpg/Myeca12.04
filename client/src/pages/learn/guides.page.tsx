import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import {
  BookOpen,
  Search,
  Clock,
  ChevronRight,
  CheckCircle,
  Briefcase,
  Building2,
  TrendingUp,
  Globe,
  PiggyBank,
  Shield,
  Star,
  ArrowRight
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  TAX_GUIDES,
  GUIDE_CATEGORIES,
  TaxGuide,
  GuideCategory,
  getGuidesByCategory,
  searchGuides,
} from "@/data/tax-guides";

const CATEGORY_ICONS: Record<GuideCategory, React.ReactNode> = {
  'salaried': <Briefcase className="h-5 w-5" />,
  'business': <Building2 className="h-5 w-5" />,
  'capital-gains': <TrendingUp className="h-5 w-5" />,
  'nri': <Globe className="h-5 w-5" />,
  'deductions': <PiggyBank className="h-5 w-5" />,
  'compliance': <Shield className="h-5 w-5" />,
};

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GuideCategory | 'all'>('all');
  
  // Get progress from localStorage
  const [guideProgress, setGuideProgress] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('guideProgress');
    return saved ? JSON.parse(saved) : {};
  });

  // Filter guides
  const filteredGuides = useMemo(() => {
    let guides = TAX_GUIDES;
    
    if (searchQuery) {
      guides = searchGuides(searchQuery);
    }
    
    if (selectedCategory !== 'all') {
      guides = guides.filter(g => g.category === selectedCategory);
    }
    
    return guides;
  }, [searchQuery, selectedCategory]);

  // Calculate guide progress
  const getGuideProgressPercent = (guide: TaxGuide) => {
    const completed = guideProgress[guide.id] || [];
    return Math.round((completed.length / guide.steps.length) * 100);
  };

  // Guide card component
  const GuideCard = ({ guide }: { guide: TaxGuide }) => {
    const progress = getGuideProgressPercent(guide);
    const category = GUIDE_CATEGORIES.find(c => c.id === guide.category);
    
    return (
      <Link href={`/learn/guide/${guide.slug}`}>
        <Card className="h-full group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-blue-300">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg bg-${category?.color}-100`}>
                {CATEGORY_ICONS[guide.category]}
              </div>
              {progress > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {progress}% done
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors mt-3">
              {guide.title}
            </CardTitle>
            <CardDescription className="line-clamp-2">{guide.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Progress bar */}
              {progress > 0 && (
                <Progress value={progress} className="h-1.5" />
              )}
              
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{category?.name}</Badge>
                <Badge className={DIFFICULTY_COLORS[guide.difficulty]}>
                  {guide.difficulty}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {guide.estimatedTime}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {guide.steps.length} steps
                </span>
              </div>
              
              <Button variant="ghost" className="w-full group-hover:bg-blue-50 group-hover:text-blue-600">
                Start Guide <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-emerald-200 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-emerald-300" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/learn" className="text-emerald-200 hover:text-white">Learn</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-emerald-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Tax Guides</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Interactive Tax Guides</h1>
              <p className="text-emerald-200 mt-1">
                Step-by-step guides with checklists to master tax concepts
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-md">
            <div className="text-center">
              <p className="text-2xl font-bold">{TAX_GUIDES.length}</p>
              <p className="text-sm text-emerald-200">Guides</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{GUIDE_CATEGORIES.length}</p>
              <p className="text-sm text-emerald-200">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {Object.keys(guideProgress).length}
              </p>
              <p className="text-sm text-emerald-200">In Progress</p>
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
            All Guides
          </Button>
          {GUIDE_CATEGORIES.map((category) => (
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

        {/* Featured/Popular Guides */}
        {!searchQuery && selectedCategory === 'all' && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Popular Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TAX_GUIDES.slice(0, 3).map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          </section>
        )}

        {/* All Guides or Filtered Results */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {searchQuery || selectedCategory !== 'all' 
              ? `${filteredGuides.length} guides found`
              : 'All Guides'}
          </h2>
          
          {filteredGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No guides found</h3>
              <p className="text-gray-500">Try a different search term or category</p>
            </div>
          )}
        </section>

        {/* Category Sections (when no filter) */}
        {!searchQuery && selectedCategory === 'all' && (
          <div className="mt-12 space-y-12">
            {GUIDE_CATEGORIES.map((category) => {
              const categoryGuides = getGuidesByCategory(category.id);
              if (categoryGuides.length <= 3) return null; // Already shown in "all"
              
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
                      View All ({categoryGuides.length}) <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryGuides.slice(0, 3).map((guide) => (
                      <GuideCard key={guide.id} guide={guide} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

