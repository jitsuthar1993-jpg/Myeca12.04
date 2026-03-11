import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  FileText, 
  Calculator, 
  Receipt, 
  PiggyBank, 
  Shield, 
  CreditCard, 
  Award, 
  Home, 
  TrendingUp, 
  Grid,
  BarChart3,
  Users,
  HelpCircle,
  BookOpen,
  Bot,
  MessageCircle,
  Search,
  Filter,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { allServices, serviceCounts, categoryBreakdown, Service } from "@/data/all-services";

const iconMap = {
  Building2, FileText, Calculator, Receipt, PiggyBank, Shield, 
  CreditCard, Award, Home, TrendingUp, Grid, BarChart3, Users,
  HelpCircle, BookOpen, Bot, MessageCircle, AlertTriangle
};

export default function AllServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = selectedSection === "all" || service.section === selectedSection;
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    
    return matchesSearch && matchesSection && matchesCategory;
  });

  const sections = ["all", "Services", "ITR Filing", "Startup", "Calculators"];
  const categories = ["all", ...Object.keys(categoryBreakdown)];

  const renderServiceCard = (service: Service) => {
    const IconComponent = iconMap[service.icon as keyof typeof iconMap];
    
    return (
      <motion.div
        key={service.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  {IconComponent && <IconComponent className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {service.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs mt-1">
                    {service.section}
                  </Badge>
                </div>
              </div>
              {service.popular && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
                  Popular
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-600 mb-3">
              {service.description}
            </CardDescription>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {service.category}
              </Badge>
              {service.price && (
                <span className="text-sm font-medium text-emerald-600">
                  {service.price}
                </span>
              )}
            </div>
            {service.path && (
              <Button 
                className="w-full mt-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                size="sm"
              >
                Learn More
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-emerald-50 py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              All Services
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Comprehensive business and tax services to help you succeed
            </p>
            
            {/* Service Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/60 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{serviceCounts.total}</div>
                <div className="text-sm text-gray-600">Total Services</div>
              </div>
              <div className="bg-white/60 rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-600">{serviceCounts.services}</div>
                <div className="text-sm text-gray-600">Business Services</div>
              </div>
              <div className="bg-white/60 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{serviceCounts.startup}</div>
                <div className="text-sm text-gray-600">Startup Services</div>
              </div>
              <div className="bg-white/60 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">{serviceCounts.calculators}</div>
                <div className="text-sm text-gray-600">Calculators</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sections.map(section => (
                <option key={section} value={section}>
                  {section === "all" ? "All Sections" : section}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">
              Showing {filteredServices.length} of {allServices.length} services
            </span>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Filtered by: {selectedSection !== "all" ? selectedSection : "All"}
                {selectedCategory !== "all" && ` • ${selectedCategory}`}
              </span>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <Tabs value={selectedSection} onValueChange={setSelectedSection} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger value="Services">Services</TabsTrigger>
            <TabsTrigger value="ITR Filing">ITR Filing</TabsTrigger>
            <TabsTrigger value="Startup">🚀 Startup</TabsTrigger>
            <TabsTrigger value="Calculators">Calculators</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedSection}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map(renderServiceCard)}
            </div>
          </TabsContent>
        </Tabs>

        {/* No Results */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedSection("all");
                setSelectedCategory("all");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Service Categories Overview */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Service Categories</h2>
            <p className="text-gray-600">Explore our services by category</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <Card 
                key={category}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <CardDescription>
                    {count} service{count !== 1 ? 's' : ''} available
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}