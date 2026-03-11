import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin, Shield, Award, Clock, Globe, Instagram, Youtube } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function Footer() {
  return (
    <footer className="w-full bg-white text-slate-800 border-t border-gray-200 mt-auto">
      {/* Trust Banner - Compact */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">ERI</div>
              <div className="text-slate-300 text-xs font-medium">Govt. Registered Intermediary</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">ISO</div>
              <div className="text-slate-300 text-xs font-medium">27001 Certified Security</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-slate-300 text-xs font-medium">CA-Reviewed Returns</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">4.8 ★</div>
              <div className="text-slate-300 text-xs font-medium">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Logo size="sm" />
                <div>
                  <div className="text-lg font-bold text-slate-800">MyeCA.in</div>
                  <div className="text-xs text-slate-600 font-medium">Expert Tax Filing Platform</div>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                India's most trusted platform for professional tax filing and business services.
              </p>
              
              {/* Key Features */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-slate-600 font-medium">ISO 27001 Certified</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Award className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-slate-600 font-medium">100% Accuracy Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-3 w-3 text-orange-600" />
                  </div>
                  <span className="text-slate-600 font-medium">File ITR in 15 Minutes</span>
                </div>
              </div>
              
              {/* Social Media */}
              <div>
                <h4 className="text-xs font-semibold text-slate-800 mb-3">Connect With Us</h4>
                <div className="flex gap-2">
                  <a href="https://facebook.com/myeca" target="_blank" rel="noopener noreferrer" 
                     className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transform hover:scale-105 transition-all duration-200 text-slate-600">
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a href="https://twitter.com/myeca" target="_blank" rel="noopener noreferrer"
                     className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-sky-500 hover:text-white transform hover:scale-105 transition-all duration-200 text-slate-600">
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a href="https://linkedin.com/company/myeca" target="_blank" rel="noopener noreferrer"
                     className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-blue-700 hover:text-white transform hover:scale-105 transition-all duration-200 text-slate-600">
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a href="https://instagram.com/myeca.in" target="_blank" rel="noopener noreferrer"
                     className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transform hover:scale-105 transition-all duration-200 text-slate-600">
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a href="https://youtube.com/@myeca" target="_blank" rel="noopener noreferrer"
                     className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transform hover:scale-105 transition-all duration-200 text-slate-600">
                    <Youtube className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Tax Services */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-4 bg-blue-600 rounded-full"></div>
                Tax & Filing Services
              </h3>
              <ul className="space-y-2">
                <li><Link href="/itr/form-selector" className="text-slate-600 text-sm hover:text-blue-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-blue-600">→</span>ITR Filing (All Forms)</Link></li>
                <li><Link href="/services/gst-registration" className="text-slate-600 text-sm hover:text-blue-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-blue-600">→</span>GST Registration</Link></li>
                <li><Link href="/services/tds-filing" className="text-slate-600 text-sm hover:text-blue-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-blue-600">→</span>TDS Filing</Link></li>
                <li><Link href="/services/notice-compliance" className="text-slate-600 text-sm hover:text-blue-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-blue-600">→</span>Tax Notice Handling</Link></li>
                <li><Link href="/calculators" className="text-slate-600 text-sm hover:text-blue-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-blue-600">→</span>Tax Calculators</Link></li>
                <li><Link href="/services" className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors mt-4 inline-block">View All Tax Services →</Link></li>
              </ul>
            </div>

            {/* Business Services */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-4 bg-emerald-600 rounded-full"></div>
                Business Services
              </h3>
              <ul className="space-y-2">
                <li><Link href="/services/company-registration" className="text-slate-600 text-sm hover:text-emerald-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-emerald-600">→</span>Company Registration</Link></li>
                <li><Link href="/services/trademark-registration" className="text-slate-600 text-sm hover:text-emerald-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-emerald-600">→</span>Trademark Registration</Link></li>
                <li><Link href="/services/iso-certification" className="text-slate-600 text-sm hover:text-emerald-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-emerald-600">→</span>ISO Certification</Link></li>
                <li><Link href="/startup-services" className="text-slate-600 text-sm hover:text-emerald-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-emerald-600">→</span>Startup Services</Link></li>
                <li><Link href="/compliance-calendar" className="text-slate-600 text-sm hover:text-emerald-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-emerald-600">→</span>Compliance Calendar</Link></li>
                <li><Link href="/services" className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 transition-colors mt-4 inline-block">View All Business Services →</Link></li>
              </ul>
            </div>

            {/* Resources & Support */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-4 bg-orange-600 rounded-full"></div>
                Resources & Support
              </h3>
              <ul className="space-y-2 mb-4">
                <li><Link href="/blog" className="text-slate-600 text-sm hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-orange-600">→</span>Tax Guides & Blog</Link></li>
                <li><Link href="/pricing" className="text-slate-600 text-sm hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-orange-600">→</span>Pricing & Plans</Link></li>
                <li><Link href="/search" className="text-slate-600 text-sm hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-orange-600">→</span>Help Center</Link></li>
                <li><Link href="/legal/privacy-policy" className="text-slate-600 text-sm hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-orange-600">→</span>Privacy Policy</Link></li>
                <li><Link href="/legal/terms-of-service" className="text-slate-600 text-sm hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-orange-600">→</span>Terms of Service</Link></li>
              </ul>
              
              {/* Contact Info */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-800 mb-2">Quick Contact</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center">
                      <Mail className="h-2.5 w-2.5 text-orange-600" />
                    </div>
                    <span className="text-slate-600">support@myeca.in</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                      <Phone className="h-2.5 w-2.5 text-green-600" />
                    </div>
                    <span className="text-slate-600">+91 9876543210</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                      <Clock className="h-2.5 w-2.5 text-blue-600" />
                    </div>
                    <span className="text-slate-600">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-6 text-white text-center">
              <h3 className="text-lg font-bold mb-2">Ready to File Your ITR?</h3>
              <p className="text-slate-300 mb-4 max-w-xl mx-auto text-sm">Start free. Your personal CA reviews every return before filing.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link href="/itr/form-selector">
                  <button className="bg-white text-slate-800 px-6 py-2.5 rounded-lg hover:bg-slate-100 transition-all duration-200 font-semibold text-sm">
                    Start Filing Now
                  </button>
                </Link>
                <Link href="/pricing">
                  <button className="border border-white text-white px-6 py-2.5 rounded-lg hover:bg-white hover:text-slate-800 transition-all duration-200 font-semibold text-sm">
                    View Pricing
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <span className="text-slate-600 text-sm">&copy; 2025 MyeCA.in. All rights reserved.</span>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <span>🇮🇳</span>
                    <span className="font-semibold">Made in India</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <span className="font-semibold">v2.0 Platform</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-slate-600 font-medium">Secure</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Award className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-slate-600 font-medium">Certified</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legal Links Row */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <Link href="/legal/privacy-policy" className="hover:text-slate-700 transition-colors font-medium">Privacy Policy</Link>
                <Link href="/legal/terms-of-service" className="hover:text-slate-700 transition-colors font-medium">Terms of Service</Link>
                <Link href="/legal/refund-policy" className="hover:text-slate-700 transition-colors font-medium">Refund Policy</Link>
                <Link href="/legal/disclaimer" className="hover:text-slate-700 transition-colors font-medium">Disclaimer</Link>
                <span className="text-slate-400 font-medium">Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}