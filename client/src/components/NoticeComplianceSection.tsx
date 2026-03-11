import { motion } from "framer-motion";
import { AlertTriangle, Shield, Clock, CheckCircle, Phone, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function NoticeComplianceSection() {
  const noticeTypes = [
    {
      title: "Scrutiny Assessment",
      description: "Expert handling of scrutiny notices with complete documentation",
      icon: FileText,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Mismatch Notices",
      description: "Resolve Form 26AS and AIS data mismatches efficiently", 
      icon: AlertTriangle,
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Default Assessment",
      description: "Professional response to default assessment orders",
      icon: Shield,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Penalty Notices",
      description: "Expert assistance for penalty and interest notices",
      icon: Clock,
      color: "bg-red-100 text-red-600"
    }
  ];

  const complianceProcess = [
    {
      step: "1",
      title: "Notice Analysis",
      description: "Our CA experts analyze your notice within 24 hours"
    },
    {
      step: "2", 
      title: "Documentation Review",
      description: "Complete review of documents and tax filing history"
    },
    {
      step: "3",
      title: "Response Preparation",
      description: "Professional response drafted with supporting documents"
    },
    {
      step: "4",
      title: "Follow-up Support",
      description: "Continuous support until notice is resolved completely"
    }
  ];

  return (
    <section id="notices" className="py-12 bg-gradient-to-br from-red-50 to-orange-50 scroll-mt-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Notice Compliance Service
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Income Tax Notice? <span className="text-red-600">Don't Panic!</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert CA assistance for all types of income tax notices. Professional response 
            preparation for quick notice resolution.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">24hr</div>
            <div className="text-sm text-gray-600">Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">100+</div>
            <div className="text-sm text-gray-600">Notices Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">Expert</div>
            <div className="text-sm text-gray-600">CA Support</div>
          </div>
        </motion.div>

        {/* Notice Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            We Handle All Types of Income Tax Notices
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {noticeTypes.map((notice, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${notice.color}`}>
                    <notice.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold">{notice.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-center">
                    {notice.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Our 4-Step Notice Resolution Process
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceProcess.map((process, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {process.step}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{process.title}</h4>
                <p className="text-sm text-gray-600">{process.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 text-center shadow-lg"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <Phone className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold text-gray-900">Got an Income Tax Notice?</h3>
              <p className="text-gray-600">Don't wait - Get expert help now!</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link href="/services/notice-compliance">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4"
              >
                Get Notice Help Now
                <AlertTriangle className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="tel:+919876543210">
              <Button 
                variant="outline" 
                size="lg"
                className="border-red-600 text-red-600 hover:bg-red-50 px-8 py-4"
              >
                Call Expert Now
                <Phone className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                <span>Expert CA Team</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                <span>Guaranteed Response</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}