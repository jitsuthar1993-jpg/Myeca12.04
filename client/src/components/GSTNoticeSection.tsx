import { motion } from "framer-motion";
import { FileText, AlertCircle, Building, Calendar, TrendingUp, Shield, CheckCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function GSTNoticeSection() {
  const gstNoticeTypes = [
    {
      title: "GST Registration",
      description: "Complete GST registration support with documentation",
      icon: Building,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "GST Returns Filing",
      description: "Monthly/Quarterly GSTR-1, GSTR-3B filing assistance", 
      icon: FileText,
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      title: "GST Scrutiny Notice",
      description: "Expert handling of GST scrutiny and assessment notices",
      icon: AlertCircle,
      color: "bg-pink-100 text-pink-600"
    },
    {
      title: "GST Refunds",
      description: "Quick processing of GST refund applications",
      icon: TrendingUp,
      color: "bg-teal-100 text-teal-600"
    }
  ];

  const gstServices = [
    {
      step: "1",
      title: "GST Analysis",
      description: "Expert review of your GST compliance status"
    },
    {
      step: "2", 
      title: "Return Preparation",
      description: "Accurate preparation of all GST returns"
    },
    {
      step: "3",
      title: "Notice Response",
      description: "Professional response to GST notices"
    },
    {
      step: "4",
      title: "Compliance Support",
      description: "Ongoing GST compliance assistance"
    }
  ];

  return (
    <section id="gst-notices" className="py-12 bg-gradient-to-br from-purple-50 to-indigo-50 scroll-mt-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FileText className="w-4 h-4 mr-2" />
            GST Compliance Service
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            GST Compliance Made <span className="text-purple-600">Simple!</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete GST solutions - from registration to returns filing and notice handling by expert CAs
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">10K+</div>
            <div className="text-sm text-gray-600">GST Returns Filed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">48hr</div>
            <div className="text-sm text-gray-600">Registration Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">99%</div>
            <div className="text-sm text-gray-600">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-gray-600">Expert Support</div>
          </div>
        </motion.div>

        {/* GST Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Comprehensive GST Services
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gstNoticeTypes.map((service, index) => (
              <Card key={index} className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${service.color}`}>
                    <service.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-center text-sm">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-6 text-center shadow-lg"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <Building className="w-7 h-7 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-900">Need GST Assistance?</h3>
              <p className="text-gray-600">Get expert help for all GST matters!</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
            <Link href="/services/gst-registration">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
              >
                Get GST Help
                <FileText className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="tel:+919876543210">
              <Button 
                variant="outline" 
                size="lg"
                className="border-purple-600 text-purple-600 hover:bg-purple-50 px-6 py-3"
              >
                Call GST Expert
                <Phone className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="mt-5 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                <span>Quick Filing</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                <span>100% Accurate</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                <span>Expert CAs</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}