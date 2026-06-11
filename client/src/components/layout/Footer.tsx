import { Link } from "wouter";
import { Mail, Phone, Shield, Award, Clock } from "lucide-react";
import BrandLockup from "@/components/ui/brand-lockup";
import { AppLink } from "@/components/ui/app-link";
import { useAuth } from "@/components/AuthProvider";
import { useRoutePreload } from '@/hooks/use-route-preload';
import {
  PUBLIC_FOOTER_BOTTOM_LINKS,
  PUBLIC_FOOTER_LEGAL_LINKS,
  PUBLIC_FOOTER_MOBILE_PRIMARY_LINKS,
} from "@/data/public-navigation-links";

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const { preloadOnHover } = useRoutePreload();

  // For authenticated users (dashboard view), show a compact footer
  if (isAuthenticated) {
    return (
      <footer className="w-full bg-slate-50 text-slate-600 border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <BrandLockup logoSize="sm" wordmarkSize="sm" compact />
              <span className="text-sm font-medium">&copy; 2026 MyeCA.in</span>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-300 pl-4">
                 <span>🇮🇳 Made in India</span>
                 <span className="mx-2">•</span>
                 <span>Secure document workflow</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium">
              <Link href="/legal/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy</Link>
              <Link href="/trust" className="hover:text-blue-600 transition-colors">Trust</Link>
              <Link href="/legal/terms-of-service" className="hover:text-blue-600 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">Support</Link>
              <Link href="/all-services" className="hover:text-blue-600 transition-colors">Services</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Full marketing footer for public pages
  return (
    <footer className="w-full bg-white text-slate-800 border-t border-slate-200 mt-auto">
      <div className="md:hidden px-4 py-5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="min-w-0 hover:opacity-80 transition-opacity">
            <BrandLockup logoSize="sm" wordmarkSize="sm" compact />
          </Link>
          <Link
            href="/contact"
            onMouseEnter={() => preloadOnHover("/contact")}
            aria-label="Contact support"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
          >
            <Mail className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ["Portal", "Filing workflow"],
            ["Privacy", "Document handling"],
            ["Scope", "Before payment"],
          ].map(([value, label]) => (
            <div key={value} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-3">
              <div className="text-base font-black tracking-tight text-slate-950">{value}</div>
              <div className="mt-0.5 type-meta font-semibold uppercase tracking-wide text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {PUBLIC_FOOTER_MOBILE_PRIMARY_LINKS.map(({ label, href }) => (
            <AppLink
              key={href}
              href={href}
              onMouseEnter={() => preloadOnHover(href)}
              className="flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-center text-sm font-semibold text-slate-700"
            >
              {label}
            </AppLink>
          ))}
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
            {PUBLIC_FOOTER_LEGAL_LINKS.map(({ label, href }) => (
              <AppLink key={href} href={href} onMouseEnter={() => preloadOnHover(href)} className="hover:text-slate-700">
                {label}
              </AppLink>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">&copy; 2026 MyeCA.in. Made in India.</p>
        </div>
      </div>

      <div className="hidden md:block">
      {/* Trust Banner - Compact */}
      <div className="bg-slate-100 text-slate-900 py-10 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-black tracking-tight">Portal</div>
              <div className="text-slate-500 type-meta font-bold uppercase tracking-wider mt-1">E-filing workflow</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-black tracking-tight">Privacy</div>
              <div className="text-slate-500 type-meta font-bold uppercase tracking-wider mt-1">Document handling</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-black tracking-tight">CA</div>
              <div className="text-slate-500 type-meta font-bold uppercase tracking-wider mt-1">Review option</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-black tracking-tight">Scope</div>
              <div className="text-slate-500 type-meta font-bold uppercase tracking-wider mt-1">Before payment</div>
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
              <Link href="/" className="mb-4 inline-block hover:opacity-80 transition-opacity cursor-pointer">
                <BrandLockup
                  logoSize="sm"
                  wordmarkSize="sm"
                  subtitle="Expert Tax Filing Platform"
                />
              </Link>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Practical tax filing and business compliance workflows for Indian taxpayers.
              </p>

              {/* Key Features */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-slate-600 font-medium">Secure Document Workflow</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Award className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-slate-600 font-medium">CA Review Option</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-3 w-3 text-orange-600" />
                  </div>
                  <span className="text-slate-600 font-medium">Scope & Timeline Clarity</span>
                </div>
              </div>

              {/* Trust shortcuts */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h4 className="text-xs font-semibold text-slate-800 mb-2">Before sharing documents</h4>
                <p className="text-xs leading-5 text-slate-600">
                  Review document handling, privacy, and scope expectations before uploading tax records.
                </p>
                <div className="mt-3 grid gap-2">
                  <Link href="/trust" onMouseEnter={() => preloadOnHover("/trust")} className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                    Trust & document handling
                  </Link>
                  <Link href="/legal/privacy-policy" onMouseEnter={() => preloadOnHover("/legal/privacy-policy")} className="text-xs font-semibold text-slate-700 hover:text-slate-900">
                    Privacy policy
                  </Link>
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
                <li><Link href="/itr/form-selector" onMouseEnter={() => preloadOnHover("/itr/form-selector")} className="text-slate-600 text-sm hover:text-blue-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-blue-600">→</span>ITR Filing (All Forms)</Link></li>
                <li><Link href="/itr-season-2026" onMouseEnter={() => preloadOnHover("/itr-season-2026")} className="text-slate-600 text-sm hover:text-blue-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-blue-600">→</span>AY 2026 ITR Season Hub</Link></li>
                <li><Link href="/services/gst-registration" onMouseEnter={() => preloadOnHover("/services/gst-registration")} className="text-slate-600 text-sm hover:text-blue-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-blue-600">→</span>GST Registration</Link></li>
                <li><Link href="/services/tds-filing" onMouseEnter={() => preloadOnHover("/services/tds-filing")} className="text-slate-600 text-sm hover:text-blue-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-blue-600">→</span>TDS Filing</Link></li>
                <li><Link href="/services/notice-compliance" onMouseEnter={() => preloadOnHover("/services/notice-compliance")} className="text-slate-600 text-sm hover:text-blue-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-blue-600">→</span>Tax Notice Handling</Link></li>
                <li><Link href="/calculators" onMouseEnter={() => preloadOnHover("/calculators")} className="text-slate-600 text-sm hover:text-blue-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-blue-600">→</span>Tax Calculators</Link></li>
                <li><Link href="/services" onMouseEnter={() => preloadOnHover("/services")} className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors mt-4 inline-block">View All Tax Services →</Link></li>
              </ul>
            </div>

            {/* Business Services */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-4 bg-emerald-600 rounded-full"></div>
                Business Services
              </h3>
              <ul className="space-y-2">
                <li><Link href="/services/company-registration" onMouseEnter={() => preloadOnHover("/services/company-registration")} className="text-slate-600 text-sm hover:text-emerald-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-emerald-600">→</span>Company Registration</Link></li>
                <li><Link href="/services/trademark-registration" onMouseEnter={() => preloadOnHover("/services/trademark-registration")} className="text-slate-600 text-sm hover:text-emerald-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-emerald-600">→</span>Trademark Registration</Link></li>
                <li><Link href="/services/iso-certification" onMouseEnter={() => preloadOnHover("/services/iso-certification")} className="text-slate-600 text-sm hover:text-emerald-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-emerald-600">→</span>ISO Certification</Link></li>
                <li><Link href="/startup-services" onMouseEnter={() => preloadOnHover("/startup-services")} className="text-slate-600 text-sm hover:text-emerald-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-emerald-600">→</span>Startup Services</Link></li>
                <li><Link href="/compliance-calendar" onMouseEnter={() => preloadOnHover("/compliance-calendar")} className="text-slate-600 text-sm hover:text-emerald-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-emerald-600">→</span>Compliance Calendar</Link></li>
                <li><Link href="/services" onMouseEnter={() => preloadOnHover("/services")} className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 transition-colors mt-4 inline-block">View All Business Services →</Link></li>
              </ul>
            </div>

            {/* Resources & Support */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-4 bg-orange-600 rounded-full"></div>
                Resources & Support
              </h3>
              <ul className="space-y-2 mb-4">
                <li><Link href="/about" onMouseEnter={() => preloadOnHover("/about")} className="text-slate-600 text-sm hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-orange-600">→</span>About MyeCA.in</Link></li>
                <li><Link href="/trust" onMouseEnter={() => preloadOnHover("/trust")} className="text-slate-600 text-sm hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-orange-600">→</span>Trust & Security</Link></li>
                <li><Link href="/blog" onMouseEnter={() => preloadOnHover("/blog")} className="text-slate-600 text-sm hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-orange-600">→</span>Tax Guides & Blog</Link></li>
                <li><Link href="/experts" onMouseEnter={() => preloadOnHover("/experts")} className="text-slate-600 text-sm hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-orange-600">→</span>Meet our Experts</Link></li>
                <li><Link href="/pricing" onMouseEnter={() => preloadOnHover("/pricing")} className="text-slate-600 text-sm hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-orange-600">→</span>Pricing & Plans</Link></li>
                <li><Link href="/help" onMouseEnter={() => preloadOnHover("/help")} className="text-slate-600 text-sm hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-orange-600">→</span>Help Center</Link></li>
                <li><Link href="/legal/privacy-policy" onMouseEnter={() => preloadOnHover("/legal/privacy-policy")} className="text-slate-600 text-sm hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-orange-600">→</span>Privacy Policy</Link></li>
                <li><Link href="/legal/terms-of-service" onMouseEnter={() => preloadOnHover("/legal/terms-of-service")} className="text-slate-600 text-sm hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 duration-200"><span className="text-orange-600">→</span>Terms of Service</Link></li>
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
                    <Link href="/expert-consultation" onMouseEnter={() => preloadOnHover("/expert-consultation")} className="text-slate-600 hover:text-blue-700">Request scoped callback</Link>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                      <Clock className="h-2.5 w-2.5 text-blue-600" />
                    </div>
                    <span className="text-slate-600">Mon-Sat business hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-8">
            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200 shadow-sm overflow-hidden relative group">

              <h3 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">Ready to File Your ITR?</h3>
              <p className="text-slate-500 mb-8 max-w-xl mx-auto text-base font-medium relative z-10">Start with a guided workflow and add CA review where your case needs it.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
                <Link href="/which-itr-form-to-file?source=footer_cta" onMouseEnter={() => preloadOnHover("/which-itr-form-to-file")}>
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-500 transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    Start Filing Now
                  </button>
                </Link>
                <Link href="/pricing" onMouseEnter={() => preloadOnHover("/pricing")}>
                  <button className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 font-semibold text-sm">
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
                <span className="text-slate-600 text-sm">&copy; 2026 MyeCA.in. All rights reserved.</span>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <span>🇮🇳</span>
                    <span className="font-normal">Made in India</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <span className="font-normal">Document privacy</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-slate-600 font-medium">Private</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Award className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-slate-600 font-medium">Scoped</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Links Row */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
                {PUBLIC_FOOTER_BOTTOM_LINKS.map(({ label, href }) => (
                  <AppLink
                    key={href}
                    href={href}
                    onMouseEnter={() => preloadOnHover(href)}
                    className="hover:text-slate-700 transition-colors font-medium"
                  >
                    {label}
                  </AppLink>
                ))}
                <span className="text-slate-400 font-medium">Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
