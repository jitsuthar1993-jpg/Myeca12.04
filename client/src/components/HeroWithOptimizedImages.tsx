import { m } from "framer-motion";
import { ArrowRight, Shield, Clock, Award, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import OptimizedImage from "@/components/OptimizedImage";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { preloadImage } from "@/utils/image-utils";
import { useEffect } from "react";

const assessmentYears = ["2025-26", "2024-25", "2023-24"];

export default function HeroWithOptimizedImages() {
  // Preload critical hero images
  useEffect(() => {
    // Preload hero background image if you have one
    preloadImage('/assets/hero-bg.webp', { type: 'image/webp' });
    preloadImage('/assets/hero-bg.jpg');
  }, []);

  return (
    <>
      <SEO 
        title="Expert Income Tax Filing & ITR e-Filing Services India 2025-26"
        description="File ITR online with MyeCA.in. Every return reviewed by a licensed CA. ITR filing starts at ₹499. File AY 2025-26 returns now."
        keywords="ITR filing, income tax return, tax filing India, e-filing, AY 2025-26, tax consultant, CA services"
      />
      
      <StructuredData
        type="Service"
        data={{
          name: "Expert ITR Filing Service",
          description: "Professional income tax return filing service with CA assistance",
          provider: {
            "@type": "Organization",
            name: "MyeCA.in"
          },
          areaServed: "India",
          serviceType: "Tax Filing Service",
          offers: {
            "@type": "Offer",
            price: "499",
            priceCurrency: "INR"
          }
        }}
      />

      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 lg:py-12 overflow-hidden">
        {/* Background decoration with optimized image */}
        <div className="absolute inset-0 overflow-hidden">
          <OptimizedImage
            src="/assets/patterns/hero-pattern.svg"
            alt=""
            className="absolute top-0 right-0 w-1/2 h-full opacity-5"
            priority
            aria-hidden="true"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Assessment Year Selector */}
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
                <span className="text-sm text-gray-600">Assessment Year:</span>
                <select className="bg-transparent text-sm font-semibold text-blue-600 focus:outline-none cursor-pointer">
                  {assessmentYears.map((year) => (
                    <option key={year} value={year}>
                      AY {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-blue-600" />
              </div>

              {/* Main Heading */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  Expert Income Tax Filing <br />
                  <span className="text-[#315efb]">with a Licensed CA on Every Return</span>
                </h1>
                <p className="mt-4 text-base lg:text-lg text-gray-600">
                  A real Chartered Accountant reviews your ITR before it's filed — not an algorithm, not a checklist.
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">100% Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Quick Filing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-700">Expert CAs</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/login">
                  <m.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                  >
                    Login & Start Filing
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </m.button>
                </Link>
                <Link href="/pricing">
                  <m.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    View Pricing
                  </m.button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">950+</div>
                  <div className="text-sm text-gray-600">Returns Filed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">24 hrs</div>
                  <div className="text-sm text-gray-600">Avg. Turnaround</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">CA-Reviewed</div>
                </div>
              </div>
            </m.div>

            {/* Right Content - Hero Image */}
            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <OptimizedImage
                src="/assets/images/hero-tax-filing.webp"
                fallbackSrc="/assets/images/hero-tax-filing.jpg"
                alt="Professional tax filing service illustration"
                className="w-full h-auto rounded-2xl shadow-2xl"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
              />
              
              {/* Floating Card */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Website Launch Offer</div>
                  <div className="text-sm text-gray-600">Save up to {"₹"}500 on filing</div>
                </div>
              </m.div>
            </m.div>
          </div>

          {/* Process Steps */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 lg:mt-16"
          >
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              File ITR in 4 Simple Steps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: 1, title: "Upload Documents", desc: "Form 16, bank statements", icon: "📄" },
                { step: 2, title: "Fill Details", desc: "Our experts guide you", icon: "✍️" },
                { step: 3, title: "Let CA check your returns", desc: "Expert review for maximum refund", icon: "👨‍💼" },
                { step: 4, title: "File ITR", desc: "E-verify and relax", icon: "✅" }
              ].map((item) => (
                <m.div
                  key={item.step}
                  whileHover={{ y: -5 }}
                  className="relative"
                >
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <div className="text-sm text-blue-600 font-semibold mb-1">Step {item.step}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                  {item.step < 4 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </m.div>
              ))}
            </div>
          </m.div>
        </div>
      </section>
    </>
  );
}