import { motion } from "framer-motion";
import { RefreshCw, Coins, Clock, AlertTriangle, CheckCircle, XCircle, Phone, Mail } from "lucide-react";

export default function RefundPolicyPage() {
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
                <RefreshCw className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Refund Policy</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent refund terms for our tax and business services.
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
            {/* Overview */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Policy Overview</h2>
              <p className="text-gray-600 mb-4">
                At MyeCA.in, we are committed to providing high-quality tax and business services. 
                This refund policy outlines the terms and conditions under which refunds may be 
                processed for different types of services.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">Our Commitment</h3>
                    <p className="text-green-700 text-sm">
                      We stand behind our work and offer refunds in accordance with the terms 
                      outlined below, ensuring customer satisfaction while maintaining service quality.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Categories */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Coins className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Refund Eligibility by Service Type</h2>
              </div>
              
              <div className="space-y-6">
                {/* Tax Filing Services */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Tax Filing Services (ITR, GST, TDS)</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">✓ Full Refund Available</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Before work commences (within 24 hours)</li>
                        <li>• If we fail to file within promised timeline</li>
                        <li>• If return is rejected due to our error</li>
                        <li>• If service is not delivered as promised</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">✗ No Refund</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• After successful filing with government</li>
                        <li>• Rejection due to incorrect client information</li>
                        <li>• Changes requested after completion</li>
                        <li>• Government processing delays</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Business Registration */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Business Registration & Incorporation</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">✓ Partial/Full Refund</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Before application submission (full refund)</li>
                        <li>• If application is rejected due to our error</li>
                        <li>• Service fee refund (excl. govt. fees)</li>
                        <li>• Cancellation within 48 hours of order</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">✗ No Refund</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Government fees are non-refundable</li>
                        <li>• Rejection due to incorrect documents</li>
                        <li>• After successful registration</li>
                        <li>• Regulatory authority delays</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Compliance Services */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Compliance & Annual Services</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">✓ Refund Conditions</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Before service commencement</li>
                        <li>• If we miss statutory deadlines</li>
                        <li>• Non-delivery of promised reports</li>
                        <li>• Service quality issues with proof</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">✗ Non-Refundable</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• After compliance filing completion</li>
                        <li>• Late penalties due to client delays</li>
                        <li>• Changes in regulatory requirements</li>
                        <li>• Partial work completed as per scope</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Timeline */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Clock className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Refund Processing Timeline</h2>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Request Submission</h3>
                    <p className="text-gray-600 text-sm">Submit refund request with details and supporting documents</p>
                    <p className="text-blue-600 text-sm font-medium mt-1">Within 7 days</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Review & Approval</h3>
                    <p className="text-gray-600 text-sm">Our team reviews your request and determines eligibility</p>
                    <p className="text-green-600 text-sm font-medium mt-1">3-5 business days</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Refund Processing</h3>
                    <p className="text-gray-600 text-sm">Amount credited to your original payment method</p>
                    <p className="text-purple-600 text-sm font-medium mt-1">5-7 business days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Circumstances */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Special Circumstances</h2>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-800 mb-2">Government Fee Refunds</h3>
                      <p className="text-yellow-700 text-sm">
                        Government fees (stamp duty, registration fees, license fees) paid to regulatory 
                        authorities are non-refundable as they are processed directly by government portals. 
                        Only MyeCA service charges may be eligible for refund based on applicable conditions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-2">Service Guarantee</h3>
                      <p className="text-blue-700 text-sm mb-2">
                        We offer a service guarantee for certain services:
                      </p>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• 100% refund if we fail to file ITR within promised timeline</li>
                        <li>• Full refund if business registration is not processed due to our error</li>
                        <li>• Rework at no cost for any errors in our service delivery</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How to Request Refund */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Request a Refund</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Required Information for Refund Request:</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Account Details</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• Order ID or Service Reference Number</li>
                      <li>• Registered email address</li>
                      <li>• Phone number associated with account</li>
                      <li>• Service type and date of purchase</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Supporting Documents</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• Detailed reason for refund request</li>
                      <li>• Screenshots or evidence (if applicable)</li>
                      <li>• Communication records with our team</li>
                      <li>• Bank details for refund processing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Methods */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Methods</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <Coins className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Original Payment Method</h3>
                  <p className="text-gray-600 text-sm">
                    Refund credited to the same card/UPI/bank account used for payment
                  </p>
                </div>
                
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Bank Transfer</h3>
                  <p className="text-gray-600 text-sm">
                    Direct bank transfer for cases where original method is unavailable
                  </p>
                </div>
                
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Service Credit</h3>
                  <p className="text-gray-600 text-sm">
                    MyeCA wallet credit for future services (optional, with bonus value)
                  </p>
                </div>
              </div>
            </div>

            {/* Contact for Refunds */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact for Refund Requests</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Support</h3>
                    <p className="text-gray-600">refunds@myeca.in</p>
                    <p className="text-gray-600">support@myeca.in</p>
                    <p className="text-gray-600 text-sm mt-1">Response within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone Support</h3>
                    <p className="text-gray-600">+91-9876543210</p>
                    <p className="text-gray-600 text-sm">Mon-Sat: 9 AM - 7 PM IST</p>
                    <p className="text-gray-600 text-sm">Refund Specialist Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Notes</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <XCircle className="w-5 h-5 text-red-500 mr-3 mt-1" />
                  <p className="text-gray-600 text-sm">
                    Refund requests must be submitted within 7 days of service completion or issue occurrence.
                  </p>
                </div>
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-1" />
                  <p className="text-gray-600 text-sm">
                    Government fees, statutory charges, and third-party service costs are non-refundable.
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                  <p className="text-gray-600 text-sm">
                    We reserve the right to modify this refund policy with 30 days notice to customers.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}