import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="relative py-12 bg-gradient-to-br from-teal-600 via-teal-700 to-orange-600 text-white overflow-hidden">
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 to-orange-600/90"></div>
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-64 h-64 bg-white/10 rounded-full filter blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/5 rounded-full filter blur-3xl animate-float"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Ready to File Your ITR?
        </motion.h2>
        
        <motion.p
          className="text-xl text-white mb-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Join 15L+ Indians who trust MyeCA.in for hassle-free tax filing
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button size="lg">
            Start Filing Now
          </Button>
          <Button variant="outline" size="lg">
            Book Consultation
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
