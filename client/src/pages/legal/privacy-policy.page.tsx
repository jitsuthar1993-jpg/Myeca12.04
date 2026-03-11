import { motion } from "framer-motion";
import { Shield, Lock, Eye, UserCheck, FileText, AlertCircle, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicyPage() {
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
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your privacy is our priority. Learn how we protect and handle your personal information.
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
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Policy</h2>
              <p className="text-gray-600 mb-4">
                This Privacy Policy applies to MyeCA.in, operated by MyeCA Technologies Private Limited, 
                having its office at Bangalore, Karnataka, India. We are committed to protecting and 
                respecting your privacy in accordance with the Information Technology Act, 2000 and the 
                Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
              </p>
              <p className="text-gray-600">
                By using our Platform or availing our Services, you agree to this Policy. This Policy should be read in conjunction with our Terms of Service.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Eye className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Name, father's name, mother's name, date of birth, gender</li>
                    <li>Email address, phone number, residential address</li>
                    <li>PAN (Permanent Account Number), Aadhaar details for KYC</li>
                    <li>Bank account details, IFSC code, payment information</li>
                    <li>Professional details, business information, GSTIN (if applicable)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tax Return Information</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Income details, salary information, business income</li>
                    <li>Investment details, deductions claimed, tax paid</li>
                    <li>Form 16, Form 16A, Form 26AS, bank statements</li>
                    <li>Property details, capital gains information</li>
                    <li>Vouchers, receipts, and supporting documents</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Information</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>IP address, browser type and version, device information</li>
                    <li>Usage data, page views, time spent on platform</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Location data (with your consent)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <UserCheck className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tax Services</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Prepare and file your income tax returns</li>
                    <li>• Provide tax planning and advisory services</li>
                    <li>• Handle tax notices and compliance matters</li>
                    <li>• Calculate tax liabilities and refunds</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Operations</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Manage your account and provide customer support</li>
                    <li>• Process payments and maintain transaction records</li>
                    <li>• Send important updates and communications</li>
                    <li>• Improve our services and user experience</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Compliance</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Comply with legal and regulatory requirements</li>
                    <li>• Prevent fraud and ensure platform security</li>
                    <li>• Conduct KYC verification as required by law</li>
                    <li>• Maintain records as per statutory requirements</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Marketing</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Send newsletters and service updates</li>
                    <li>• Provide information about new features</li>
                    <li>• Conduct surveys and gather feedback</li>
                    <li>• Customize content based on preferences</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Lock className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">We Never Sell Your Data</h3>
                    <p className="text-yellow-700 text-sm">
                      We do not sell, rent, or trade your personal information to third parties for commercial purposes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">We may share information with:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li><strong>Government Agencies:</strong> Income Tax Department, GSTN, regulatory authorities</li>
                    <li><strong>Service Providers:</strong> Payment gateways, KYC agencies, cloud storage providers</li>
                    <li><strong>Legal Requirements:</strong> Court orders, law enforcement agencies</li>
                    <li><strong>Business Partners:</strong> Authorized CAs, tax consultants (with your consent)</li>
                    <li><strong>Group Companies:</strong> Our affiliates for providing integrated services</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">256-bit SSL Encryption</h3>
                  <p className="text-gray-600 text-sm">All data transmission is protected with bank-grade encryption.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">ISO 27001 Certified</h3>
                  <p className="text-gray-600 text-sm">Our security practices meet international standards.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Access Controls</h3>
                  <p className="text-gray-600 text-sm">Strict employee access controls and monitoring.</p>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <FileText className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">You have the right to:</h3>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Access your personal information</li>
                      <li>• Correct inaccurate data</li>
                      <li>• Request data deletion (subject to legal requirements)</li>
                      <li>• Withdraw consent for marketing communications</li>
                      <li>• Port your data to another service provider</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Data retention:</h3>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Tax returns: 7 years (as per IT Act)</li>
                      <li>• KYC documents: As per regulatory requirements</li>
                      <li>• Communication records: 3 years</li>
                      <li>• Technical logs: 1 year</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookies Policy</h2>
              <p className="text-gray-600 mb-4">
                We use cookies and similar technologies to improve your experience on our platform. 
                This includes essential cookies for platform functionality, analytics cookies to understand 
                usage patterns, and preference cookies to remember your settings.
              </p>
              <p className="text-gray-600">
                You can control cookie settings through your browser, but disabling certain cookies 
                may affect platform functionality.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
              <p className="text-gray-600 mb-6">
                For privacy-related queries, data access requests, or to report any concerns:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">privacy@myeca.in</p>
                    <p className="text-gray-600">support@myeca.in</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">+91-9876543210</p>
                    <p className="text-gray-600 text-sm">Mon-Sat: 9 AM - 7 PM IST</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">
                      MyeCA Technologies Pvt Ltd<br />
                      Bangalore, Karnataka<br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Updates */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Updates</h2>
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons. We will notify you of any material 
                changes through email or platform notifications.
              </p>
              <p className="text-gray-600">
                Your continued use of our services after such changes constitutes your acceptance 
                of the updated policy.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}