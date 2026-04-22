import { m } from "framer-motion";
import { Mail, Phone, Clock, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import Breadcrumb from "@/components/Breadcrumb";

export default function ContactPage() {
  const seo = getSEOConfig('/contact');
  return (
    <>
      <MetaSEO 
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        type={seo?.type}
        breadcrumbs={seo?.breadcrumbs}
      />
      <div className="min-h-screen bg-white">
        <Breadcrumb items={[{ name: 'Contact Us' }]} />
        
        {/* Header */}
        <section className="py-16 bg-white border-b soft-border">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <m.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              Get in Touch
            </m.h1>
            <m.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600"
            >
              Have questions about tax filing or business services? Our team of experts is here to help you.
            </m.p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <m.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="grid gap-6">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <Phone className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Call or WhatsApp</h3>
                        <p className="text-gray-600 mb-1">Available Mon–Sat, 9 AM – 7 PM</p>
                        <p className="text-sm text-gray-500">Use the chat widget for fastest response</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <Mail className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                        <p className="text-gray-600 mb-1">support@myeca.in</p>
                        <p className="text-sm text-gray-500">24/7 Response Time</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
                        <p className="text-gray-600">Email queries answered within 4 business hours.</p>
                        <p className="text-sm text-gray-500 mt-1">Complex CA reviews: 24–48 hours</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* FAQ Teaser */}
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Common Questions
                </h3>
                <div className="space-y-4">
                  <details className="group">
                    <summary className="font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">
                      How long does ITR filing take?
                      <span className="transition group-open:rotate-180">▼</span>
                    </summary>
                    <p className="text-gray-600 mt-2 text-sm pl-4 border-l-2 border-blue-200">
                      Our Assisted Filing usually takes 24-48 hours depending on the complexity of your documents.
                    </p>
                  </details>
                  <details className="group">
                    <summary className="font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">
                      Do you support notice handling?
                      <span className="transition group-open:rotate-180">▼</span>
                    </summary>
                    <p className="text-gray-600 mt-2 text-sm pl-4 border-l-2 border-blue-200">
                      Yes, our expert CAs specialize in handling Income Tax notices and drafting appropriate responses.
                    </p>
                  </details>
                </div>
              </div>
            </m.div>

            {/* Contact Form */}
            <m.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-t-4 border-t-blue-600 shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="+91 XXXXX XXXXX" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john@example.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="Regarding ITR Filing..." />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Tell us how we can help you..." 
                        className="min-h-[150px]"
                      />
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </m.div>
          </div>
        </div>
      </div>
    </>
  );
}
