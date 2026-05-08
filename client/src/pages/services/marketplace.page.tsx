import { useState, useMemo } from "react";
import { m } from "framer-motion";
import {
  Search, Star, Clock, CheckCircle, ArrowRight, User, Building2,
  FileText, Receipt, Rocket, Scale, Calculator, Users, IndianRupee,
  Phone, Mail, Sparkles, Shield, Award, TrendingUp, ChevronRight,
  AlertCircle, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { StandardPricingCompactCard } from "@/components/pricing/StandardPricingSection";
import {
  SERVICES,
  SERVICE_CATEGORIES,
  Service,
  ServiceCategory,
  getServicesByCategory,
  getPopularServices,
  searchServices,
  formatPrice,
} from "@/data/services-catalog";
import { formatPricingLabel, getPricingByServiceId } from "@/data/pricing";

const CATEGORY_ICONS: Record<ServiceCategory, React.ReactNode> = {
  'individual': <User className="h-5 w-5" />,
  'business-registration': <Building2 className="h-5 w-5" />,
  'tax-compliance': <FileText className="h-5 w-5" />,
  'gst-services': <Receipt className="h-5 w-5" />,
  'startup': <Rocket className="h-5 w-5" />,
  'legal': <Scale className="h-5 w-5" />,
  'accounting': <Calculator className="h-5 w-5" />,
  'payroll': <Users className="h-5 w-5" />,
};

export default function ServicesMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Filter services
  const filteredServices = useMemo(() => {
    let services = SERVICES;
    if (searchQuery) services = searchServices(searchQuery);
    if (selectedCategory !== 'all') services = services.filter(s => s.category === selectedCategory);
    return services;
  }, [searchQuery, selectedCategory]);

  const isFiltering = searchQuery !== "" || selectedCategory !== 'all';
  const popularServices = useMemo(() => getPopularServices(), []);

  // Service card component
  const ServiceCard = ({ service, index }: { service: Service; index: number }) => {
    const standardPricing = getPricingByServiceId(service.id);
    const hasDiscount = service.pricing.originalAmount && service.pricing.originalAmount > service.pricing.amount;
    const discount = hasDiscount 
      ? Math.round((1 - service.pricing.amount / service.pricing.originalAmount!) * 100)
      : 0;

    return (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: (index % 3) * 0.1 }}
      >
        <div className="group relative flex flex-col h-full bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/80 p-7 hover:border-white hover:bg-white/90 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 cursor-pointer overflow-hidden">
          {service.badge && (
            <div className="mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-xl bg-orange-400/10 text-orange-600 border border-orange-400/20 backdrop-blur-sm">
                {service.badge}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm",
              "bg-gradient-to-br from-blue-50 to-white border border-blue-100/50"
            )}>
              <span className="text-blue-600">
                {CATEGORY_ICONS[service.category]}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                {service.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {SERVICE_CATEGORIES.find(c => c.id === service.category)?.name}
              </p>
            </div>
          </div>

          <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
            {service.shortDescription}
          </p>

          <div className="space-y-2 mb-6 flex-1">
            {service.features.slice(0, 3).map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {feature}
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100/50">
            {standardPricing ? (
              <div className="mb-6">
                <StandardPricingCompactCard service={standardPricing} />
              </div>
            ) : (
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <Clock className="h-3 w-3 text-slate-400" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{service.timeline}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {formatPrice(service.pricing)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-slate-400 line-through">
                      {"₹"}{service.pricing.originalAmount?.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
              {hasDiscount && (
                <div className="px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-[10px] font-black border border-green-100">
                  {discount}% OFF
                </div>
              )}
            </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="rounded-2xl h-11 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setSelectedService(service);
                  setIsInquiryOpen(true);
                }}
              >
                Get Started
              </Button>
              <Button 
                variant="outline"
                className="rounded-2xl h-11 border-slate-100 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest text-slate-500"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setSelectedService(service);
                }}
              >
                Details
              </Button>
            </div>
          </div>
        </div>
      </m.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-slate-100/30 border-b border-slate-200/60 transition-all duration-500">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-100/40 blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100/30 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:text-left text-center">
            {/* Left Side: Content */}
            <div className="flex-1 max-w-3xl">
              <m.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6"
              >
                <Rocket className="w-3.5 h-3.5 text-blue-500" />
                Service Directory
              </m.div>

              <m.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-5"
              >
                CA Services <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Marketplace</span>
              </m.h1>

              <m.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-500 max-w-xl lg:mx-0 mx-auto mb-10 font-medium opacity-80"
              >
                Professional tax, accounting, and compliance services at transparent, flat-rate prices. CA-verified and quality assured.
              </m.p>

              {/* search + filter integrated */}
              <m.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl"
              >
                <div className="flex flex-col md:flex-row gap-3 p-2 bg-white rounded-[2rem] border border-slate-200/60 shadow-2xl shadow-slate-200/50">
                  <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search services..."
                      className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-slate-700 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                    />
                  </div>
                  <div className="flex gap-1 p-1 bg-slate-50 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                        selectedCategory === 'all'
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-300"
                          : "text-slate-400 hover:text-slate-700 hover:bg-white"
                      )}
                    >
                      All
                    </button>
                    {SERVICE_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2",
                          selectedCategory === category.id
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-300"
                            : "text-slate-400 hover:text-slate-700 hover:bg-white"
                        )}
                      >
                        {category.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </m.div>
            </div>

            {/* Right Side: Quick Tips Card */}
            <div className="w-full lg:w-[400px] shrink-0">
              <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 100 }}
              >
                 <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white p-8 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                      <Sparkles className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-800 leading-none">Quick Tips</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Marketplace Guide</p>
                        </div>
                      </div>
                      <ul className="space-y-4">
                        {[
                          { icon: Search, color: "text-blue-500", text: "Search to locate services by name." },
                          { icon: Star, color: "text-amber-500", text: "Check Popular Services for top picks." },
                          { icon: IndianRupee, color: "text-emerald-500", text: "Transparent pricing & no hidden costs." },
                          { icon: Phone, color: "text-indigo-500", text: "Request consultation for tailored advice." }
                        ].map((tip, i) => (
                          <li key={i} className="flex items-start gap-4">
                            <div className={cn("w-6 h-6 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0", tip.color)}>
                              <tip.icon className="w-3 h-3" />
                            </div>
                            <span className="text-sm font-semibold text-slate-600 leading-tight">{tip.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                 </div>
              </m.div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Popular Services */}
        {!searchQuery && selectedCategory === 'all' && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
                    <Star className="h-6 w-6 fill-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Popular Services</h2>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Our most requested solutions</p>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularServices.map((service, idx) => (
                <ServiceCard key={service.id} service={service} index={idx} />
              ))}
            </div>
          </section>
        )}

        {/* Results */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {searchQuery || selectedCategory !== 'all' 
                ? `${filteredServices.length} Services Found`
                : 'All Services'}
            </h2>
            <div className="flex-1 h-px bg-slate-200/60" />
            {isFiltering && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {setSearchQuery(""); setSelectedCategory("all");}}
                className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50"
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service, idx) => (
                <ServiceCard key={service.id} service={service} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <Search className="h-16 w-16 mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold text-lg">No services found for "{searchQuery}"</p>
            </div>
          )}
        </section>

        {/* Categorized Sections */}
        {!searchQuery && selectedCategory === 'all' && (
          <div className="mt-20 space-y-20">
            {SERVICE_CATEGORIES.map((category) => {
              const categoryServices = getServicesByCategory(category.id);
              if (categoryServices.length === 0) return null;
              
              return (
                <section key={category.id}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[1.25rem] bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                        {CATEGORY_ICONS[category.id]}
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">{category.name}</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{category.description}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost"
                      className="font-black text-[10px] uppercase tracking-widest text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      Explore All ({categoryServices.length}) <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryServices.slice(0, 3).map((service, idx) => (
                      <ServiceCard key={service.id} service={service} index={idx} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Trust Section */}
        <section className="mt-24 pt-24 border-t border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { icon: Shield,  label: "100% Secure",   sub: "Bank-grade encryption" },
              { icon: Award,   label: "Expert CAs",    sub: "Certified professionals" },
              { icon: Clock,   label: "Quick Delivery", sub: "Never miss deadlines" },
              { icon: TrendingUp, label: "Best Prices",   sub: "Transparent pricing" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-black text-slate-800 tracking-tight">{label}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Service Detail Modal */}
      <Dialog open={!!selectedService && !isInquiryOpen} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 border-none shadow-2xl">
          {selectedService && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    {SERVICE_CATEGORIES.find(c => c.id === selectedService.category)?.name}
                  </span>
                  {selectedService.badge && (
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                      {selectedService.badge}
                    </span>
                  )}
                </div>
                <DialogTitle className="text-3xl font-black text-slate-900 leading-tight">
                  {selectedService.name}
                </DialogTitle>
                <DialogDescription className="text-lg font-medium text-slate-500 mt-2">
                  {selectedService.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-8 py-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tight">
                      {getPricingByServiceId(selectedService.id)
                        ? formatPricingLabel(getPricingByServiceId(selectedService.id)!.pricing)
                        : formatPrice(selectedService.pricing)}
                    </p>
                    {selectedService.pricing.unit && (
                      <p className="text-xs font-bold text-slate-400 mt-1">{selectedService.pricing.unit}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expected Timeline</p>
                    <div className="flex items-center gap-2 justify-end text-slate-900 font-black">
                       <Clock className="w-4 h-4 text-blue-600" />
                       {selectedService.timeline}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">What's Included</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedService.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Documents Required</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.documents.map((doc, i) => (
                      <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none px-4 py-2 rounded-xl text-xs font-bold">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-3 sm:gap-0">
                <Button 
                  variant="outline" 
                  className="rounded-2xl h-14 border-slate-200 text-slate-500 font-bold px-8 shadow-sm"
                  onClick={() => setSelectedService(null)}
                >
                  Close
                </Button>
                <Button 
                  className="rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white font-black px-10 shadow-xl shadow-blue-200"
                  onClick={() => setIsInquiryOpen(true)}
                >
                  Get Started <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Inquiry Form Modal */}
      <Dialog open={isInquiryOpen} onOpenChange={setIsInquiryOpen}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-lg border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Request Service</DialogTitle>
            <DialogDescription className="font-bold text-blue-600 text-sm mt-1">
              {selectedService?.name} — {selectedService && getPricingByServiceId(selectedService.id)
                ? formatPricingLabel(getPricingByServiceId(selectedService.id)!.pricing)
                : formatPrice(selectedService?.pricing || { type: 'custom', amount: 0 })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
              <Input 
                id="name"
                value={inquiryData.name}
                onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})}
                placeholder="Ex: Rahul Sharma"
                className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:ring-blue-500/20 font-bold"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
              <Input 
                id="email"
                type="email"
                value={inquiryData.email}
                onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})}
                placeholder="rahul@example.com"
                className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:ring-blue-500/20 font-bold"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</Label>
              <Input 
                id="phone"
                value={inquiryData.phone}
                onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})}
                placeholder="+91 98765 43210"
                className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:ring-blue-500/20 font-bold"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Message (Optional)</Label>
              <Textarea 
                id="message"
                value={inquiryData.message}
                onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})}
                placeholder="Any specific details..."
                className="rounded-2xl bg-slate-50 border-slate-100 focus:ring-blue-500/20 font-bold min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="rounded-2xl h-12 border-slate-200 text-slate-500 font-bold px-6 order-2 sm:order-1"
              onClick={() => setIsInquiryOpen(false)}
            >
              Cancel
            </Button>
            <Button className="rounded-2xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 shadow-lg shadow-emerald-100 order-1 sm:order-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
