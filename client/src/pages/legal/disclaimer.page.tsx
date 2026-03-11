import { motion } from "framer-motion";
import { AlertTriangle, Info, Shield, Scale, FileText, ExternalLink } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Disclaimer</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Important notices and limitations regarding our services and information.
            </p>
            <p className="text-sm text-blue-200 mt-4">Last updated: January 19, 2025</p>
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
            {/* General Disclaimer */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Info className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">General Disclaimer</h2>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Important Notice</h3>
                    <p className="text-yellow-700 text-sm">
                      The information provided on MyeCA.in is for general informational purposes only. 
                      While we strive to keep the information accurate and updated, we make no representations 
                      or warranties of any kind about the completeness, accuracy, reliability, or suitability 
                      of the information for any particular purpose.
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                MyeCA Technologies Private Limited ("MyeCA", "we", "us", or "our") provides tax and 
                business services through qualified professionals. This disclaimer applies to all users 
                of our platform and services.
              </p>
            </div>

            {/* Service-Specific Disclaimers */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Service-Specific Disclaimers</h2>
              
              <div className="space-y-6">
                {/* Tax Services */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Tax Filing & Advisory Services</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">No Guarantee of Outcomes</h4>
                      <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                        <li>We do not guarantee specific tax savings, refund amounts, or processing timelines</li>
                        <li>Tax implications depend on individual circumstances and applicable laws</li>
                        <li>Government authorities may reject applications for reasons beyond our control</li>
                        <li>Changes in tax laws may affect previously provided advice</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Client Responsibility</h4>
                      <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                        <li>Accuracy of information and documents provided by clients</li>
                        <li>Disclosure of all relevant financial information</li>
                        <li>Compliance with tax laws and regulatory requirements</li>
                        <li>Final review and approval of returns before submission</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Business Registration */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Scale className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Business Registration & Compliance</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Regulatory Approvals</h4>
                      <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                        <li>Approval depends on regulatory authority discretion and eligibility criteria</li>
                        <li>Processing timelines are estimates and subject to government office efficiency</li>
                        <li>Additional documentation may be required by authorities during processing</li>
                        <li>Rejection of applications may occur due to factors beyond our control</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Ongoing Compliance</h4>
                      <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                        <li>Post-registration compliance is client responsibility unless specifically contracted</li>
                        <li>Changes in laws may affect compliance requirements</li>
                        <li>Annual renewals and filings require separate service agreements</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Calculators & Tools */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Shield className="w-6 h-6 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Financial Calculators & Tools</h3>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800 text-sm mb-2 font-medium">Estimation Purpose Only</p>
                    <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
                      <li>Calculators provide estimates based on current rates and standard assumptions</li>
                      <li>Actual calculations may vary based on individual circumstances</li>
                      <li>Interest rates, tax slabs, and exemption limits are subject to change</li>
                      <li>Professional consultation recommended for important financial decisions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Advice Disclaimer */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Advice Limitations</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Not a Substitute for Professional Consultation</h3>
                    <p className="text-gray-600 text-sm">
                      While our team includes qualified Chartered Accountants and tax professionals, 
                      the information and services provided should not be considered as personalized 
                      professional advice until a formal engagement is established.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Individual Circumstances</h3>
                    <p className="text-gray-600 text-sm">
                      Tax and business decisions depend heavily on individual circumstances. 
                      What works for one person or business may not be suitable for another. 
                      Always consider your specific situation before making decisions.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Legal and Regulatory Changes</h3>
                    <p className="text-gray-600 text-sm">
                      Tax laws, business regulations, and government policies change frequently. 
                      Information provided is based on current laws and may become outdated. 
                      Always verify current regulations before making decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Third-Party Services */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Services & Links</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <ExternalLink className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">External Links</h3>
                    <p className="text-gray-600 text-sm">
                      Our platform may contain links to external websites or services. 
                      We are not responsible for the content, privacy policies, or practices 
                      of these external sites.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-green-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Payment Gateways</h3>
                    <p className="text-gray-600 text-sm">
                      We use third-party payment processors for transaction security. 
                      While we ensure PCI compliance, we are not responsible for 
                      payment gateway technical issues or processing delays.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-purple-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Government Portals</h3>
                    <p className="text-gray-600 text-sm">
                      Filing and registration services depend on government portal availability. 
                      We are not responsible for government website downtime, technical issues, 
                      or changes in their processes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-3">Maximum Liability Limit</h3>
                    <p className="text-red-700 text-sm mb-3">
                      MyeCA's maximum liability for any claim arising from our services is limited 
                      to the amount paid for that specific service, not exceeding \u20B950,000 in any case.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-800">We are not liable for:</h4>
                      <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                        <li>Indirect, consequential, or punitive damages</li>
                        <li>Loss of business, profits, reputation, or data</li>
                        <li>Penalties imposed by government authorities due to late filing</li>
                        <li>Decisions made based on general information from our platform</li>
                        <li>Technical issues, system downtime, or data loss</li>
                        <li>Actions or inactions of government authorities</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Acknowledgment */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">User Acknowledgment</h2>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-blue-800 font-medium mb-3">By using MyeCA.in services, you acknowledge that:</p>
                <ul className="text-blue-700 text-sm space-y-2 list-disc list-inside">
                  <li>You have read, understood, and agree to this disclaimer</li>
                  <li>You understand the limitations and risks associated with our services</li>
                  <li>You will not hold MyeCA liable beyond the specified limits</li>
                  <li>You will seek professional consultation for complex matters</li>
                  <li>You are responsible for the accuracy of information provided</li>
                  <li>You understand that laws and regulations may change</li>
                </ul>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions About This Disclaimer</h2>
              <p className="text-gray-600 mb-4">
                If you have questions about this disclaimer or need clarification about 
                the scope of our services, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                    <p className="text-gray-600 text-sm">legal@myeca.in</p>
                    <p className="text-gray-600 text-sm">support@myeca.in</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                    <p className="text-gray-600 text-sm">+91-9876543210</p>
                    <p className="text-gray-600 text-sm">Mon-Sat: 9 AM - 7 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Updates */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Disclaimer</h2>
              <p className="text-gray-600">
                We may update this disclaimer from time to time to reflect changes in our services, 
                legal requirements, or business practices. Material changes will be notified through 
                email or platform notifications. Your continued use of our services after such 
                changes constitutes acceptance of the updated disclaimer.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}