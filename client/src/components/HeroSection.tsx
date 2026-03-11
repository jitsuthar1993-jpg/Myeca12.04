import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative gradient-hero py-10 overflow-hidden">
      {/* Enhanced background elements with blue-to-indigo gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/30 to-indigo-600/30 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-indigo-600/25 to-blue-600/25 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-blue-600/30 to-indigo-500/30 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              India's First <span className="text-gradient">AI-Powered Tax Assistant</span>
            </motion.h1>
            
            <motion.p
              className="text-xl text-gray-700 font-semibold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              File ITR in <span className="text-gradient font-bold">3 Minutes</span> with MyeCA.in
            </motion.p>
            
            <motion.p
              className="text-lg text-gray-600 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              India's smartest tax platform with AI-powered assistance. File accurate ITR returns with maximum refunds guaranteed. Our intelligent system auto-fills your tax data and ensures error-free filing in minutes.
            </motion.p>
            
            {/* Rating */}
            <motion.div
              className="flex items-center justify-center lg:justify-start space-x-2 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-gray-600 font-medium">4.7 | 22,500+ Reviews</span>
            </motion.div>

            {/* Assessment Year Selector */}
            <motion.div
              className="flex items-center justify-center lg:justify-start space-x-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <label className="text-gray-700 font-medium">Assessment Year:</label>
              <Select defaultValue="2024-25">
                <SelectTrigger className="w-40 border-2 border-primary/20 focus:border-primary rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-25">AY 2024-25</SelectItem>
                  <SelectItem value="2023-24">AY 2023-24</SelectItem>
                  <SelectItem value="2022-23">AY 2022-23</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button
                size="lg"
                className="btn-primary px-8 py-4 rounded-xl font-semibold"
                asChild
              >
                <Link href="/itr/form-selector">
                  Start Filing Now
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary text-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
              >
                View Pricing
              </Button>
            </motion.div>
          </div>

          {/* Right Content - ITR Filing Process */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/50 hover-lift"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <h3 className="text-xl font-bold text-center mb-6 text-gray-800">ITR Filing Made Easy</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">Upload Your Documents</h4>
                <p className="text-gray-600 text-xs">Form 16, Bank statements, Investment proofs</p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">Pre-Filled ITR Form</h4>
                <p className="text-gray-600 text-xs">Our system auto-fills your ITR form</p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">CA Review</h4>
                <p className="text-gray-600 text-xs">Expert CA checks your return for accuracy</p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">File & Submit</h4>
                <p className="text-gray-600 text-xs">Review, e-sign and submit to income tax department</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex justify-center items-center space-x-6 mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-lg font-bold bg-gradient-to-r from-brand-teal to-brand-orange bg-clip-text text-transparent">15 Min</div>
                <div className="text-xs text-gray-600">Filing Time</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold bg-gradient-to-r from-brand-orange to-brand-teal bg-clip-text text-transparent">DIY</div>
                <div className="text-xs text-gray-600">Coming Soon</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold bg-gradient-to-r from-brand-teal to-brand-orange bg-clip-text text-transparent">100+</div>
                <div className="text-xs text-gray-600">Companies</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
