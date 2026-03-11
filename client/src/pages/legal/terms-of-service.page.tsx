import { motion } from "framer-motion";
import { Scale, FileText, Users, Shield, AlertTriangle, CheckCircle, Phone, Mail } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b soft-border py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Scale className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Terms of Service</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Please read these terms carefully before using our platform and services.
            </p>
            <p className="text-sm text-gray-500 mt-4">Last updated: January 19, 2025</p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            {/* Agreement */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Agreement to Terms</h2>
              <p className="text-gray-600 mb-4">
                These Terms of Service ("Terms") constitute a legally binding agreement between you and 
                MyeCA Technologies Private Limited ("MyeCA", "we", "us", or "our"), governing your use 
                of the MyeCA.in platform and all related services.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Important Notice</h3>
                    <p className="text-blue-700 text-sm">
                      By accessing or using our platform, you agree to be bound by these Terms. 
                      If you do not agree to these Terms, please do not use our services.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Eligibility</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">You may use our services only if:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>You are at least 18 years of age</li>
                  <li>You are a resident of India or Non-Resident Indian (NRI)</li>
                  <li>You have the legal capacity to enter into binding contracts</li>
                  <li>You are not prohibited from using our services under applicable laws</li>
                  <li>You have not been previously suspended or banned from our platform</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  If you are using our services on behalf of an organization, you represent that 
                  you have the authority to bind that organization to these Terms.
                </p>
              </div>
            </div>

            {/* Services Description */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <FileText className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tax Services</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Income Tax Return (ITR) filing</li>
                    <li>• Tax planning and advisory</li>
                    <li>• Notice compliance and handling</li>
                    <li>• GST registration and returns</li>
                    <li>• TDS filing and compliance</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Services</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Company registration and incorporation</li>
                    <li>• License and permit applications</li>
                    <li>• Trademark and IP services</li>
                    <li>• Annual compliance management</li>
                    <li>• Audit and bookkeeping</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Tools</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Tax calculators and planners</li>
                    <li>• Investment calculators</li>
                    <li>• Loan EMI calculators</li>
                    <li>• Financial planning tools</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Expert Support</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• CA-assisted filing services</li>
                    <li>• 24/7 customer support</li>
                    <li>• Document review and verification</li>
                    <li>• Professional consultations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* User Responsibilities */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Responsibilities</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Security</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Maintain the confidentiality of your login credentials</li>
                    <li>Notify us immediately of any unauthorized access</li>
                    <li>Use strong passwords and enable two-factor authentication</li>
                    <li>Do not share your account with others</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Information Accuracy</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Provide accurate and complete information</li>
                    <li>Update your information when it changes</li>
                    <li>Ensure all tax-related data is correct and verifiable</li>
                    <li>Take responsibility for any errors in provided information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Prohibited Activities</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Using the platform for illegal or fraudulent activities</li>
                    <li>Attempting to hack, disrupt, or compromise our systems</li>
                    <li>Sharing false, misleading, or harmful content</li>
                    <li>Violating any applicable laws or regulations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Terms</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Pricing & Billing</h3>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• All prices are in Indian Rupees (INR)</li>
                      <li>• Prices include applicable taxes unless stated otherwise</li>
                      <li>• Payment is due at the time of service selection</li>
                      <li>• We accept UPI, cards, and net banking</li>
                      <li>• Service fees are non-refundable once work begins</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Government Fees</h3>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Government fees are separate from service charges</li>
                      <li>• These fees are paid directly to government portals</li>
                      <li>• Government fees are non-refundable</li>
                      <li>• Fee changes by government are passed to clients</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Limitations */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Service Limitations & Disclaimers</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-800 mb-2">No Guarantee of Outcomes</h3>
                      <p className="text-yellow-700 text-sm">
                        While we strive for accuracy, we cannot guarantee specific tax savings, 
                        refund amounts, or approval of applications by government authorities.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Availability</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Services may be temporarily unavailable due to maintenance</li>
                    <li>We may modify or discontinue services with reasonable notice</li>
                    <li>Third-party integrations may affect service availability</li>
                    <li>Force majeure events may disrupt service delivery</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Limitation of Liability</h3>
                  <p className="text-gray-600 mb-3">
                    Our liability is limited to the fees paid for the specific service. 
                    We are not liable for:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Indirect, consequential, or punitive damages</li>
                    <li>Loss of business, profits, or data</li>
                    <li>Actions or decisions of government authorities</li>
                    <li>Delays caused by third parties or technical issues</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                All content, features, and functionality on our platform, including but not limited to 
                text, graphics, logos, software, and trademarks, are owned by MyeCA or our licensors 
                and are protected by intellectual property laws.
              </p>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">You may not:</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Copy, modify, or distribute our proprietary content</li>
                  <li>• Reverse engineer our software or systems</li>
                  <li>• Use our trademarks without permission</li>
                  <li>• Create derivative works based on our platform</li>
                </ul>
              </div>
            </div>

            {/* Termination */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Termination</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">By You</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    You may terminate your account at any time by contacting customer support. 
                    Termination does not relieve you of payment obligations for completed services.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">By Us</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    We may suspend or terminate your account for violations of these Terms, 
                    illegal activities, or other reasons deemed necessary for platform security.
                  </p>
                </div>
              </div>
            </div>

            {/* Governing Law */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Governing Law & Dispute Resolution</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600 mb-4">
                  These Terms are governed by the laws of India. Any disputes arising from these Terms 
                  or your use of our services shall be subject to the exclusive jurisdiction of the 
                  courts in Bangalore, Karnataka, India.
                </p>
                <h3 className="font-semibold text-gray-900 mb-2">Dispute Resolution Process:</h3>
                <ol className="list-decimal list-inside text-gray-600 space-y-1 text-sm">
                  <li>First attempt resolution through customer support</li>
                  <li>Escalation to management if unresolved within 15 days</li>
                  <li>Arbitration as per Arbitration and Conciliation Act, 1996</li>
                  <li>Court proceedings only after exhausting above options</li>
                </ol>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
              <p className="text-gray-600 mb-6">
                For questions about these Terms or our services:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">legal@myeca.in</p>
                    <p className="text-gray-600">support@myeca.in</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Customer Support</h3>
                    <p className="text-gray-600">+91-9876543210</p>
                    <p className="text-gray-600 text-sm">Mon-Sat: 9 AM - 7 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Updates */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-600 mb-4">
                We may update these Terms from time to time to reflect changes in our services, 
                applicable laws, or business practices. We will notify you of material changes 
                through email or platform notifications.
              </p>
              <div className="flex items-start bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1" />
                <p className="text-green-700 text-sm">
                  Your continued use of our services after changes become effective constitutes 
                  acceptance of the updated Terms.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}