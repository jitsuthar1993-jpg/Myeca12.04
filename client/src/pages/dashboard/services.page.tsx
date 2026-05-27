import { useState, useMemo } from 'react';
import { Layout } from '@/components/admin/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronRight, 
  Star, 
  Clock, 
  ShieldCheck, 
  Zap, 
  FileText, 
  Building2, 
  TrendingUp, 
  CreditCard,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { allServices, Service } from '@/data/all-services';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { buildDashboardServiceRequestPayload } from '@/lib/service-workflow';

const iconMap: Record<string, any> = {
  FileText,
  Receipt: FileText,
  PiggyBank: TrendingUp,
  Shield: ShieldCheck,
  CreditCard,
  AlertTriangle: ShieldCheck,
  Building2,
  Award: Star,
  Calculator: FileText,
  Home: Building2,
  TrendingUp,
  Grid: Sparkles,
  BarChart3: TrendingUp,
  Users: MessageSquare,
  HelpCircle: MessageSquare,
  BookOpen: FileText,
  Bot: Zap,
  MessageCircle: MessageSquare,
};

export default function DashboardServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [requestDescription, setRequestDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const categories = useMemo(() => {
    const cats = Array.from(new Set(allServices.map(s => s.category)));
    return ["all", ...cats];
  }, []);

  const filteredServices = useMemo(() => {
    return allServices.filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "all" || service.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const requestMutation = useMutation({
    mutationFn: async () => {
      if (!selectedServiceId) throw new Error('Choose a service first.');
      const service = allServices.find(s => s.id === selectedServiceId);
      const response = await apiRequest('/api/user-services', {
        method: 'POST',
        body: JSON.stringify(buildDashboardServiceRequestPayload(selectedServiceId, service, requestDescription)),
      });
      return response.json();
    },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/user/dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/user-services'] }),
      ]);
      toast({
        title: 'Request created',
        description: 'Your service case is ready. Continue from the case workspace.',
      });
      setIsRequestModalOpen(false);
      setSelectedServiceId(null);
      setRequestDescription('');
      if (data?.id) {
        setLocation(`/dashboard/services/${data.id}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Could not create request',
        description: error?.message || 'Please try again in a moment.',
        variant: 'destructive',
      });
    },
  });

  const handleRaiseRequest = () => {
    if (!selectedServiceId) return;
    requestMutation.mutate();
  };

  const renderServiceCard = (service: Service) => {
    const IconComponent = iconMap[service.icon] || FileText;
    
    return (
      <m.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        key={service.id}
      >
        <Card className="group relative h-full rounded-lg border border-slate-100 bg-white shadow-none transition-all duration-300 hover:border-blue-600/30 hover:shadow-xl hover:shadow-blue-500/5 md:rounded-[32px]">
          <CardContent className="p-4 md:p-8">
            <div className="mb-4 flex items-center justify-between md:mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-blue-50 group-hover:text-blue-600 md:h-12 md:w-12 md:rounded-2xl">
                <IconComponent className="h-6 w-6" />
              </div>
              {service.popular && (
                <Badge className="bg-amber-50 text-amber-600 border-none type-meta font-black uppercase tracking-wider h-6 px-2">
                  Popular
                </Badge>
              )}
            </div>

            <div className="mb-5 space-y-2 md:mb-6">
              <h3 className="type-card-title text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{service.title}</h3>
              <p className="type-support text-slate-500 line-clamp-2 font-medium">
                {service.description}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-50 pt-4 md:pt-6">
               <div className="flex flex-col">
                  <span className="type-meta font-black text-slate-400 uppercase tracking-widest mb-1">Fee Starts From</span>
                  <span className="type-body font-bold text-slate-900">{service.price || "Free"}</span>
               </div>
               <Button 
                onClick={() => {
                  setSelectedServiceId(service.id);
                  setIsRequestModalOpen(true);
                }}
                variant="outline"
                size="sm" 
                className="h-10 rounded-lg border-slate-200 px-4 type-meta font-black uppercase tracking-widest text-slate-600 transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white md:rounded-xl md:px-5"
               >
                 Enroll
               </Button>
            </div>
          </CardContent>
        </Card>
      </m.div>
    );
  };

  return (
    <Layout title="Service Catalog">
      <div className="flex flex-col items-start gap-5 bg-slate-50/50 p-0 lg:flex-row lg:gap-12 lg:rounded-[48px] lg:p-2">
        {/* Sticky Left Category Section */}
        <div className="hidden w-full shrink-0 space-y-6 lg:sticky lg:top-[112px] lg:block lg:w-80">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <div className="mb-10">
                <h2 className="type-section-title font-black text-slate-900 tracking-tight mb-2">Marketplace</h2>
                <p className="type-meta font-black text-slate-400 uppercase tracking-widest">Filter by category</p>
             </div>

             <div className="space-y-1.5">
                {categories.map((cat) => (
                   <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                         "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 text-left group",
                         activeCategory === cat
                            ? "bg-blue-700 text-white shadow-lg shadow-slate-200"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                   >
                      <div className={cn(
                         "h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
                         activeCategory === cat ? "bg-white/10 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-900"
                      )}>
                         {cat === 'all' ? <Sparkles className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                      </div>
                      <span className="font-bold text-sm tracking-tight capitalize">{cat === 'all' ? 'All Services' : cat}</span>
                   </button>
                ))}
             </div>
          </div>

          <div className="p-10 rounded-[48px] bg-blue-50 border border-blue-100 relative overflow-hidden group cursor-pointer">
             <div className="relative z-10">
                <h3 className="type-section-title font-black mb-3 text-slate-900">Custom Help?</h3>
                <p className="text-slate-500 type-support font-medium mb-8">Can't find a specific service? Our CAs can handle bespoke requests.</p>
                <Button 
                  onClick={() => {
                    setSelectedServiceId("custom");
                    setIsRequestModalOpen(true);
                  }}
                  className="w-full bg-white text-slate-900 hover:bg-blue-700 hover:text-white border border-slate-200 font-black type-meta uppercase tracking-widest h-14 rounded-2xl shadow-sm transition-all">
                  Request Custom Service
                </Button>
             </div>
          </div>
        </div>

        {/* Main Content Area - Full Page Scroll */}
        <div className="min-w-0 flex-1 w-full space-y-5 pb-20 lg:max-w-7xl lg:space-y-8">
          {/* Page Header */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="type-page-title font-black text-slate-900">Service Catalog</h1>
              <p className="text-slate-500 max-w-2xl type-body font-medium">
                Professional tax and business solutions at your fingertips.
              </p>
            </div>
            <Button 
              onClick={() => {
                setSelectedServiceId("custom");
                setIsRequestModalOpen(true);
              }}
              className="h-11 w-full rounded-lg bg-blue-700 px-5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-blue-600 md:h-14 md:w-auto md:rounded-2xl md:px-8"
            >
              <Plus className="h-4 w-4 mr-3" />
              Custom Request
            </Button>
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "min-h-[40px] shrink-0 rounded-lg border px-3 text-xs font-black capitalize",
                  activeCategory === cat
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-slate-200 bg-white text-slate-600",
                )}
              >
                {cat === 'all' ? 'All Services' : cat}
              </button>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-100 bg-white px-4 py-4 md:gap-8 md:rounded-[32px] md:px-8 md:py-6">
            <div className="flex min-w-0 flex-1 items-center gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input 
                  placeholder="Search for ITR, GST, Trademark, Audit..." 
                  className="h-12 rounded-lg border-slate-100 bg-slate-50/30 pl-12 text-sm font-medium transition-all focus-visible:ring-blue-100 md:h-14 md:rounded-2xl md:pl-14 md:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredServices.map(renderServiceCard)}
            </AnimatePresence>
          </div>

          {/* No Results */}
          {filteredServices.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100/50 bg-white px-4 py-20 shadow-sm md:rounded-[48px] md:py-32">
               <div className="h-24 w-24 rounded-[32px] bg-slate-50 flex items-center justify-center mb-8">
                  <Search className="h-12 w-12 text-slate-300" />
               </div>
               <h3 className="type-section-title font-black text-slate-900 mb-3 tracking-tight">Search Spectrum Empty</h3>
               <p className="text-slate-500 text-center max-w-md mb-10 type-body font-medium">
                 We couldn't find any services matching your query. Let our experts assist you with a custom solution.
               </p>
               <Button 
                variant="outline" 
                className="h-14 px-10 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest"
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("all");
                }}
               >
                 Reset All Search Filters
               </Button>
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border-none p-5 shadow-2xl sm:max-w-[550px] sm:rounded-[48px] sm:p-10">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <DialogHeader className="mb-8">
            <DialogTitle className="type-section-title font-black text-slate-900 tracking-tight">Service Enrollment</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium type-body pt-3">
              {selectedServiceId === "custom" 
                ? "Provide details about your specific legal or financial requirement for expert evaluation."
                : `You are initiating a high-priority request for ${allServices.find(s => s.id === selectedServiceId)?.title}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="service" className="type-meta font-black uppercase tracking-widest text-slate-400 ml-1">Service Identifier</Label>
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-inner">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm transition-transform hover:scale-105">
                       {selectedServiceId === "custom" ? <Sparkles className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                    </div>
                    <div>
                       <p className="type-body font-black text-slate-900 mb-1.5">
                         {selectedServiceId === "custom" ? "Bespoke Consultation" : allServices.find(s => s.id === selectedServiceId)?.title}
                       </p>
                       <p className="type-meta font-black text-blue-600 uppercase tracking-[0.1em]">
                          {selectedServiceId === "custom" ? "EXPERT ANALYSIS" : "PREMIUM FILING"}
                       </p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="type-meta font-black uppercase tracking-widest text-slate-400 ml-1">Engagement Brief</Label>
              <Textarea 
                id="description" 
                placeholder="Describe your current situation, business nature or specific goals..." 
                className="min-h-[160px] rounded-[32px] border-slate-100 bg-slate-50/50 focus-visible:ring-blue-100 p-6 text-sm font-medium shadow-inner"
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
              />
            </div>

            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100/50 flex items-start gap-4">
               <div className="mt-1">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
               </div>
               <div>
                  <p className="type-meta font-black text-emerald-800 uppercase tracking-widest mb-1">Expert Availability</p>
                  <p className="type-meta text-emerald-700 font-semibold">Verified CA experts are active. Anticipated response window: 120 minutes.</p>
               </div>
            </div>
          </div>

          <DialogFooter className="mt-8 gap-3 sm:mt-10 sm:justify-between">
            <Button variant="ghost" onClick={() => setIsRequestModalOpen(false)} className="h-12 w-full rounded-lg px-6 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 sm:h-14 sm:w-auto sm:rounded-2xl sm:px-8">
              Discard
            </Button>
            <Button 
              onClick={handleRaiseRequest}
              disabled={requestMutation.isPending}
              className="h-12 w-full rounded-lg bg-blue-600 px-6 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 hover:bg-blue-700 sm:h-14 sm:w-auto sm:rounded-2xl sm:px-12"
            >
              {requestMutation.isPending ? 'Creating Case...' : 'Submit Engagement Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
