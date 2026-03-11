import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { allServices, serviceCounts, categoryBreakdown } from '@/data/all-services';
import { Link } from 'wouter';
import { 
  Building2, 
  FileText, 
  Calculator, 
  Rocket, 
  TrendingUp,
  Users,
  ArrowRight
} from 'lucide-react';

export default function ServicesSummary() {
  const popularServices = allServices.filter(service => service.popular);
  const paidServices = allServices.filter(service => service.price);

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Complete Service Portfolio
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Comprehensive business and tax solutions across {serviceCounts.total} specialized services
        </p>
        
        <Link href="/all-services">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
            View All Services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </motion.div>

      {/* Service Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-blue-600">
              {serviceCounts.services}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Business Services</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {serviceCounts.itrFiling}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">ITR Filing Services</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Rocket className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-purple-600">
              {serviceCounts.startup}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Startup Services</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Calculator className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-orange-600">
              {serviceCounts.calculators}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Calculators & Tools</p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Services */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-emerald-600" />
          Popular Services
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularServices.map(service => (
            <Card key={service.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
                    Popular
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{service.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{service.category}</Badge>
                  {service.price && (
                    <span className="text-sm font-medium text-emerald-600">
                      {service.price}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Users className="h-6 w-6 mr-2 text-blue-600" />
          Service Categories
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryBreakdown).map(([category, count]) => (
            <div
              key={category}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{category}</span>
                <Badge variant="secondary">{count} services</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Service List */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          All Services at a Glance
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          {allServices.map(service => (
            <div key={service.id} className="flex items-center space-x-2 p-2 hover:bg-white rounded transition-colors">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-gray-700">{service.title}</span>
              {service.price && (
                <span className="text-emerald-600 font-medium">({service.price})</span>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/all-services">
            <Button variant="outline" size="lg">
              Explore All Services in Detail
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}