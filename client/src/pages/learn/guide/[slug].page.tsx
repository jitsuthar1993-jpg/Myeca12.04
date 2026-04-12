import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useParams } from "wouter";
import {
  BookOpen,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  ExternalLink,
  Download,
  Share2,
  ArrowLeft,
  Calculator,
  User,
  Calendar
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getGuideBySlug, GUIDE_CATEGORIES, TaxGuide } from "@/data/tax-guides";

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function GuidePage() {
  const params = useParams() as { slug?: string };
  const slug = params.slug as string;
  const guide = getGuideBySlug(slug);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedItems, setCompletedItems] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('guideProgress');
    const progress = saved ? JSON.parse(saved) : {};
    return progress[guide?.id || ''] ? { [guide?.id || '']: progress[guide?.id || ''] } : {};
  });

  // Save progress to localStorage
  useEffect(() => {
    if (guide) {
      const allProgress = JSON.parse(localStorage.getItem('guideProgress') || '{}');
      allProgress[guide.id] = completedItems[guide.id] || [];
      localStorage.setItem('guideProgress', JSON.stringify(allProgress));
    }
  }, [completedItems, guide]);

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Guide Not Found</h1>
          <p className="text-gray-500 mb-4">The guide you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/learn/guides">Back to Guides</Link>
          </Button>
        </div>
      </div>
    );
  }

  const category = GUIDE_CATEGORIES.find(c => c.id === guide.category);
  const currentStepData = guide.steps[currentStep];
  
  // Toggle checklist item
  const toggleItem = (stepId: string, item: string) => {
    setCompletedItems(prev => {
      const guideItems = prev[guide.id] || [];
      const itemKey = `${stepId}:${item}`;
      
      if (guideItems.includes(itemKey)) {
        return { ...prev, [guide.id]: guideItems.filter(i => i !== itemKey) };
      } else {
        return { ...prev, [guide.id]: [...guideItems, itemKey] };
      }
    });
  };

  const isItemCompleted = (stepId: string, item: string) => {
    const guideItems = completedItems[guide.id] || [];
    return guideItems.includes(`${stepId}:${item}`);
  };

  // Calculate progress
  const totalItems = guide.steps.reduce((sum, step) => sum + (step.checklist?.length || 0), 0);
  const completedCount = (completedItems[guide.id] || []).length;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Check if step is complete
  const isStepComplete = (stepIndex: number) => {
    const step = guide.steps[stepIndex];
    if (!step.checklist) return true;
    return step.checklist.every(item => isItemCompleted(step.id, item));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb className="mb-4">
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
                <BreadcrumbLink asChild>
                  <Link href="/learn/guides" className="text-emerald-200 hover:text-white">Guides</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-emerald-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">{guide.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className="bg-white/10 border-white/30 text-white">
              {category?.name}
            </Badge>
            <Badge className={DIFFICULTY_COLORS[guide.difficulty]}>
              {guide.difficulty}
            </Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-2">{guide.title}</h1>
          <p className="text-emerald-200 mb-4">{guide.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-emerald-200">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {guide.estimatedTime}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              {guide.steps.length} steps
            </span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {guide.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Updated {guide.lastUpdated}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Your Progress</span>
              <span>{progressPercent}% complete</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-white/20" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Steps Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Steps</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {guide.steps.map((step, index) => {
                    const stepComplete = isStepComplete(index);
                    return (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(index)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          currentStep === index 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          stepComplete 
                            ? 'bg-green-500 text-white' 
                            : currentStep === index
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {stepComplete ? <CheckCircle className="h-4 w-4" /> : index + 1}
                        </span>
                        <span className={`text-sm truncate ${stepComplete ? 'text-green-700' : ''}`}>
                          {step.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Step */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>Step {currentStep + 1} of {guide.steps.length}</span>
                </div>
                <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Checklist */}
                {currentStepData.checklist && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      Checklist
                    </h4>
                    <div className="space-y-2">
                      {currentStepData.checklist.map((item, index) => (
                        <div 
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleItem(currentStepData.id, item)}
                        >
                          <Checkbox 
                            checked={isItemCompleted(currentStepData.id, item)}
                            className="mt-0.5"
                          />
                          <span className={isItemCompleted(currentStepData.id, item) ? 'line-through text-gray-500' : ''}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {currentStepData.tips && currentStepData.tips.length > 0 && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <AlertDescription>
                      <h4 className="font-semibold text-yellow-800 mb-2">Pro Tips</h4>
                      <ul className="list-disc list-inside space-y-1 text-yellow-800">
                        {currentStepData.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Related Links */}
                {currentStepData.links && currentStepData.links.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-blue-600" />
                      Helpful Resources
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentStepData.links.map((link, index) => (
                        <Button key={index} variant="outline" size="sm" asChild>
                          <Link href={link.href}>
                            {link.label}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < guide.steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  disabled={progressPercent < 100}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {progressPercent === 100 ? 'Guide Complete!' : 'Complete All Steps'}
                </Button>
              )}
            </div>

            {/* Related Calculators */}
            {guide.relatedCalculators.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-purple-600" />
                    Related Calculators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guide.relatedCalculators.map((calc, index) => (
                      <Button key={index} variant="outline" size="sm" asChild>
                        <Link href={calc}>
                          {calc.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Link>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
