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

  const handleRaiseRequest = () => {
    if (!selectedServiceId) return;
    
    const service = allServices.find(s => s.id === selectedServiceId);
    
    toast({
      title: "Request Raised Successfully",
      description: `Your request for ${service?.title} has been submitted. A CA will contact you shortly.`,
    });
    
    setIsRequestModalOpen(false);
    setSelectedServiceId(null);
    setRequestDescription("");
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
        <Card className="h-full border border-slate-100 shadow-none bg-white hover:border-blue-600/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 rounded-[32px] group relative">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                <IconComponent className="h-6 w-6" />
              </div>
              {service.popular && (
                <Badge className="bg-amber-50 text-amber-600 border-none text-[9px] font-black uppercase tracking-wider h-6 px-2">
                  Popular
                </Badge>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{service.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium">
                {service.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fee Starts From</span>
                  <span className="text-base font-bold text-slate-900">{service.price || "Free"}</span>
               </div>
               <Button 
                onClick={() => {
                  setSelectedServiceId(service.id);
                  setIsRequestModalOpen(true);
                }}
                variant="outline"
                size="sm" 
                className="h-10 px-5 rounded-xl border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-black text-[10px] uppercase tracking-widest"
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
      <div className="flex flex-col lg:flex-row gap-12 items-start bg-slate-50/50 rounded-[48px] p-2">
        {/* Sticky Left Category Section */}
        <div className="lg:w-80 shrink-0 w-full space-y-6 lg:sticky lg:top-[112px]">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Marketplace</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by category</p>
             </div>

             <div className="space-y-1.5">
                {categories.map((cat) => (
                   <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                         "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 text-left group",
                         activeCategory === cat 
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
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
                <h3 className="font-black text-2xl leading-tight mb-3 text-slate-900">Custom Help?</h3>
                <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-8">Can't find a specific service? Our CAs can handle bespoke requests.</p>
                <Button 
                  onClick={() => {
                    setSelectedServiceId("custom");
                    setIsRequestModalOpen(true);
                  }}
                  className="w-full bg-white text-slate-900 hover:bg-slate-900 hover:text-white border border-slate-200 font-black text-[11px] uppercase tracking-widest h-14 rounded-2xl shadow-sm transition-all">
                  Request Custom Service
                </Button>
             </div>
          </div>
        </div>

        {/* Main Content Area - Full Page Scroll */}
        <div className="flex-1 min-w-0 w-full lg:max-w-7xl space-y-8 pb-20">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Service Catalog</h1>
              <p className="text-slate-500 max-w-2xl text-base font-medium">
                Professional tax and business solutions at your fingertips.
              </p>
            </div>
            <Button 
              onClick={() => {
                setSelectedServiceId("custom");
                setIsRequestModalOpen(true);
              }}
              className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:-translate-y-1"
            >
              <Plus className="h-4 w-4 mr-3" />
              Custom Request
            </Button>
          </div>

          {/* Action Bar */}
          <div className="bg-white px-8 py-6 rounded-[32px] border border-slate-100 flex flex-wrap items-center justify-between gap-8">
            <div className="flex items-center gap-6 flex-1 min-w-[300px]">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input 
                  placeholder="Search for ITR, GST, Trademark, Audit..." 
                  className="pl-14 h-14 border-slate-100 focus-visible:ring-blue-100 rounded-2xl bg-slate-50/30 font-medium text-base transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredServices.map(renderServiceCard)}
            </AnimatePresence>
          </div>

          {/* No Results */}
          {filteredServices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 px-4 bg-white rounded-[48px] border border-slate-100/50 shadow-sm">
               <div className="h-24 w-24 rounded-[32px] bg-slate-50 flex items-center justify-center mb-8">
                  <Search className="h-12 w-12 text-slate-300" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Search Spectrum Empty</h3>
               <p className="text-slate-500 text-center max-w-md mb-10 text-base font-medium">
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
        <DialogContent className="sm:max-w-[550px] rounded-[48px] p-10 border-none shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Service Enrollment</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-base pt-3 leading-relaxed">
              {selectedServiceId === "custom" 
                ? "Provide details about your specific legal or financial requirement for expert evaluation."
                : `You are initiating a high-priority request for ${allServices.find(s => s.id === selectedServiceId)?.title}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="service" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Identifier</Label>
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-inner">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm transition-transform hover:scale-105">
                       {selectedServiceId === "custom" ? <Sparkles className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                    </div>
                    <div>
                       <p className="text-base font-black text-slate-900 leading-none mb-1.5">
                         {selectedServiceId === "custom" ? "Bespoke Consultation" : allServices.find(s => s.id === selectedServiceId)?.title}
                       </p>
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.1em]">
                          {selectedServiceId === "custom" ? "EXPERT ANALYSIS" : "PREMIUM FILING"}
                       </p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Engagement Brief</Label>
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
                  <p className="text-[11px] font-black text-emerald-800 uppercase tracking-widest mb-1">Expert Availability</p>
                  <p className="text-xs text-emerald-700 leading-relaxed font-semibold">Verified CA experts are active. Anticipated response window: 120 minutes.</p>
               </div>
            </div>
          </div>

          <DialogFooter className="mt-10 gap-4 sm:justify-between">
            <Button variant="ghost" onClick={() => setIsRequestModalOpen(false)} className="h-14 px-8 rounded-2xl text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest">
              Discard
            </Button>
            <Button 
              onClick={handleRaiseRequest}
              className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-100 hover:-translate-y-1"
            >
              Submit Engagement Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
