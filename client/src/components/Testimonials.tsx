import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-12 bg-white border-y border-gray-100 scroll-mt-20">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied users who have simplified their tax filing with MyeCA.in.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex space-x-6 pb-6"
            animate={{ x: [0, -1200] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
          >
            {/* Duplicate testimonials for seamless loop */}
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <Card
                key={`${testimonial.id}-${index}`}
                className="flex-none w-80 bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-sm ${
                    index % 4 === 0 ? 'bg-blue-500' :
                    index % 4 === 1 ? 'bg-green-500' :
                    index % 4 === 2 ? 'bg-purple-500' : 'bg-red-500'
                  }`}>
                    {testimonial.avatar}
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900 text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
