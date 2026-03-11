import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Mail, 
  User, 
  Building, 
  FileText, 
  CheckCircle, 
  Clock, 
  Star,
  Users,
  Award,
  Shield,
  Calendar,
  MessageCircle,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExpertConsultationPage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    priority: "medium",
    message: "",
    preferredTime: "",
    budget: ""
  });

  // Service mapping from URL parameters
  const serviceMapping = {
    'labour-law-compliance': 'Labour Law Compliance',
    'company-incorporation': 'Company Incorporation',
    'iso-certification': 'ISO Certification',
    'trade-license': 'Trade License',
    'gst-returns': 'GST Returns Filing',
    'startup-india-registration': 'Startup India Registration',
    'gst-registration': 'GST Registration',
    'company-registration': 'Company Registration',
    'tds-filing': 'TDS Filing',
    'trademark-registration': 'Trademark Registration',
    'fssai-registration': 'FSSAI Registration',
    'msme-udyam-registration': 'MSME Udyam Registration',
    'notice-compliance': 'Income Tax Notice Handling',
    'itr-filing': 'ITR Filing',
    'tax-consultation': 'Tax Consultation',
    'general': 'General Consultation'
  };

  // Extract service from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service');
    
    if (service && serviceMapping[service as keyof typeof serviceMapping]) {
      setFormData(prev => ({
        ...prev,
        service: serviceMapping[service as keyof typeof serviceMapping]
      }));
    }
  }, [location]);

  const services = [
    'ITR Filing',
    'GST Registration',
    'GST Returns Filing',
    'Company Incorporation',
    'Company Registration',
    'TDS Filing',
    'Trademark Registration',
    'ISO Certification',
    'Labour Law Compliance',
    'FSSAI Registration',
    'MSME Udyam Registration',
    'Startup India Registration',
    'Trade License',
    'Income Tax Notice Handling',
    'Tax Consultation',
    'General Consultation'
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'gray' },
    { value: 'medium', label: 'Medium Priority', color: 'blue' },
    { value: 'high', label: 'High Priority', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  const timeSlots = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    'Evening (6:00 PM - 8:00 PM)'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Consultation Request Submitted!",
        description: "Our expert will contact you within 2 hours during business hours.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        service: formData.service, // Keep service selected
        priority: "medium",
        message: "",
        preferredTime: "",
        budget: ""
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit consultation request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Expert Consultation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get personalized guidance from our certified professionals. Whether you need tax advice, 
            compliance support, or business registration help, our experts are here for you.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-gray-700 font-medium">4.9/5 Expert Rating</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-gray-700 font-medium">2-Hour Response</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-gray-700 font-medium">100% Confidential</span>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-white rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Schedule Your Consultation
                </CardTitle>
                <CardDescription>
                  Fill out the form below and our expert will contact you within 2 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company/Organization</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Your company name (optional)"
                      />
                    </div>
                  </div>

                  {/* Service Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="service">Service Required *</Label>
                    <Select value={formData.service} onValueChange={(value) => handleInputChange('service', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the service you need help with" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority and Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority Level</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <div className="flex items-center">
                                <Badge variant="outline" className={`mr-2 text-${priority.color}-600`}>
                                  {priority.label}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Expected Budget Range</Label>
                      <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-5k">Under {"\u20B9"}5,000</SelectItem>
                          <SelectItem value="5k-25k">{"\u20B9"}5,000 - {"\u20B9"}25,000</SelectItem>
                          <SelectItem value="25k-50k">{"\u20B9"}25,000 - {"\u20B9"}50,000</SelectItem>
                          <SelectItem value="50k-1l">{"\u20B9"}50,000 - {"\u20B9"}1,00,000</SelectItem>
                          <SelectItem value="above-1l">Above {"\u20B9"}1,00,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Preferred Time */}
                  <div className="space-y-2">
                    <Label htmlFor="preferredTime">Preferred Call Time</Label>
                    <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="When would you prefer to receive our call?" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Details</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please describe your specific requirements, questions, or concerns..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Schedule Expert Consultation
                      </>
                    )}
                  </Button>

                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Free Consultation:</strong> The initial consultation call is completely free. 
                      You only pay if you decide to proceed with our services.
                    </AlertDescription>
                  </Alert>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Contact Information */}
            <Card className="bg-white rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Need Immediate Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">Call Us Now</p>
                    <p className="text-blue-600">+91-9876543210</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium">WhatsApp Support</p>
                    <p className="text-green-600">+91-9876543210</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium">Email Us</p>
                    <p className="text-purple-600">support@myeca.in</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expert Team */}
            <Card className="bg-white rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Our Expert Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-gold-600 mr-3" />
                  <span className="text-sm">50+ Certified CAs & CSs</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm">15L+ Clients Served</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm">Available 6 Days/Week</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-sm">100% Confidential</span>
                </div>
              </CardContent>
            </Card>

            {/* Success Stats */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold mb-4">Why Choose Our Experts?</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold">99.8%</p>
                    <p className="text-sm text-blue-100">Success Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{"\u20B9"}50Cr+</p>
                    <p className="text-sm text-blue-100">Refunds Processed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-sm text-blue-100">Expert Support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}