import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import {
  Search,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  User,
  Building2,
  FileText,
  Receipt,
  Rocket,
  Scale,
  Calculator,
  Users,
  IndianRupee,
  Phone,
  Mail,
  Sparkles,
  Shield,
  Award,
  TrendingUp,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
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
    
    if (searchQuery) {
      services = searchServices(searchQuery);
    }
    
    if (selectedCategory !== 'all') {
      services = services.filter(s => s.category === selectedCategory);
    }
    
    return services;
  }, [searchQuery, selectedCategory]);

  const popularServices = useMemo(() => getPopularServices(), []);

  // Service card component
  const ServiceCard = ({ service }: { service: Service }) => {
    const hasDiscount = service.pricing.originalAmount && service.pricing.originalAmount > service.pricing.amount;
    const discount = hasDiscount 
      ? Math.round((1 - service.pricing.amount / service.pricing.originalAmount!) * 100)
      : 0;

    return (
      <Card className="h-full group hover:shadow-xl transition-all duration-300 hover:border-blue-300 relative overflow-hidden">
        {service.badge && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
              {service.badge}
            </Badge>
          </div>
        )}
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              {CATEGORY_ICONS[service.category]}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {service.name}
              </CardTitle>
              <CardDescription className="mt-1">{service.shortDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Features preview */}
          <ul className="space-y-1">
            {service.features.slice(0, 3).map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
            {service.features.length > 3 && (
              <li className="text-sm text-blue-600">+{service.features.length - 3} more features</li>
            )}
          </ul>

          {/* Timeline */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {service.timeline}
          </div>

          {/* Pricing */}
          <div className="pt-4 border-t">
            <div className="flex items-end justify-between">
              <div>
                {hasDiscount && (
                  <p className="text-sm text-gray-400 line-through">
                    {"\u20B9"}{service.pricing.originalAmount?.toLocaleString('en-IN')}
                  </p>
                )}
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(service.pricing)}
                </p>
                {service.pricing.unit && (
                  <p className="text-xs text-gray-500">{service.pricing.unit}</p>
                )}
              </div>
              {hasDiscount && (
                <Badge className="bg-green-100 text-green-700">
                  {discount}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => {
                setSelectedService(service);
                setIsInquiryOpen(true);
              }}
            >
              Get Started
            </Button>
            <Button 
              variant="outline"
              onClick={() => setSelectedService(service)}
            >
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-white border-b soft-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Breadcrumb className="mb-4">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/" className="text-gray-500 hover:text-gray-900">Home</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Services Marketplace</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center soft-shadow">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  CA Services Marketplace
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                Professional tax, accounting, and compliance services at transparent prices
              </p>
            </div>
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Find and compare services faster</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Search className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Use search to locate services by name or category.
                  </li>
                  <li className="flex items-start">
                    <Star className="w-4 h-4 mr-2 text-yellow-600 mt-0.5" />
                    Check Popular Services for top picks.
                  </li>
                  <li className="flex items-start">
                    <IndianRupee className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Compare pricing and discounts before starting.
                  </li>
                  <li className="flex items-start">
                    <Phone className="w-4 h-4 mr-2 text-indigo-600 mt-0.5" />
                    Request consultation for tailored recommendations.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="max-w-xl mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Services
          </Button>
          {SERVICE_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              {CATEGORY_ICONS[category.id]}
              {category.name}
            </Button>
          ))}
        </div>

        {/* Popular Services (when no filter) */}
        {!searchQuery && selectedCategory === 'all' && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              Popular Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </section>
        )}

        {/* All Services or Filtered */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {searchQuery || selectedCategory !== 'all' 
              ? `${filteredServices.length} Services Found`
              : 'All Services'}
          </h2>
          
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No services found</h3>
              <p className="text-gray-500">Try a different search term or category</p>
            </div>
          )}
        </section>

        {/* Category Sections (when no filter) */}
        {!searchQuery && selectedCategory === 'all' && (
          <div className="mt-12 space-y-12">
            {SERVICE_CATEGORIES.map((category) => {
              const categoryServices = getServicesByCategory(category.id);
              if (categoryServices.length === 0) return null;
              
              return (
                <section key={category.id}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        {CATEGORY_ICONS[category.id]}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{category.name}</h2>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      View All ({categoryServices.length}) <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryServices.slice(0, 3).map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Trust Badges */}
        <section className="mt-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold mb-6 text-center">Why Choose Us?</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">100% Secure</h3>
                  <p className="text-sm text-gray-600">Bank-grade encryption</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Expert CAs</h3>
                  <p className="text-sm text-gray-600">Certified professionals</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">On-Time Delivery</h3>
                  <p className="text-sm text-gray-600">Never miss deadlines</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold">Best Prices</h3>
                  <p className="text-sm text-gray-600">Transparent pricing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Service Detail Modal */}
      <Dialog open={!!selectedService && !isInquiryOpen} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedService && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">
                    {SERVICE_CATEGORIES.find(c => c.id === selectedService.category)?.name}
                  </Badge>
                  {selectedService.badge && (
                    <Badge className="bg-orange-100 text-orange-700">{selectedService.badge}</Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl">{selectedService.name}</DialogTitle>
                <DialogDescription>{selectedService.description}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Pricing */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="text-3xl font-bold text-green-600">
                        {formatPrice(selectedService.pricing)}
                      </p>
                      {selectedService.pricing.unit && (
                        <p className="text-sm text-gray-500">{selectedService.pricing.unit}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Timeline</p>
                      <p className="font-semibold">{selectedService.timeline}</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold mb-3">What's Included</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {selectedService.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deliverables */}
                <div>
                  <h4 className="font-semibold mb-3">Deliverables</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.deliverables.map((item, i) => (
                      <Badge key={i} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>

                {/* Required Documents */}
                <div>
                  <h4 className="font-semibold mb-3">Documents Required</h4>
                  <ul className="space-y-1">
                    {selectedService.documents.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4 text-gray-400" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedService(null)}>
                  Close
                </Button>
                <Button onClick={() => setIsInquiryOpen(true)}>
                  Get Started <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Inquiry Form Modal */}
      <Dialog open={isInquiryOpen} onOpenChange={setIsInquiryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Service</DialogTitle>
            <DialogDescription>
              {selectedService?.name} - {formatPrice(selectedService?.pricing || { type: 'custom', amount: 0 })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                value={inquiryData.name}
                onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                value={inquiryData.email}
                onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone"
                value={inquiryData.phone}
                onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="message">Additional Details (Optional)</Label>
              <Textarea 
                id="message"
                value={inquiryData.message}
                onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})}
                placeholder="Any specific requirements or questions..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInquiryOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

