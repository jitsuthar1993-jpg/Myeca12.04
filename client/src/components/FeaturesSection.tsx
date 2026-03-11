import { motion } from "framer-motion";
import { CardPremium } from "@/components/ui/card";
import { Shield, Bot, UserCheck, Clock, Smartphone, TrendingUp, Sparkles } from "lucide-react";
import { features } from "@/data/features";

const iconMap = {
  Shield,
  Bot,
  UserCheck,
  Clock,
  Smartphone,
  TrendingUp
};

const colorMap = {
  blue: "bg-indigo-100 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white",
  green: "bg-emerald-100 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white",
  yellow: "bg-amber-100 group-hover:bg-amber-600 text-amber-600 group-hover:text-white",
  purple: "bg-purple-100 group-hover:bg-purple-600 text-purple-600 group-hover:text-white",
  red: "bg-rose-100 group-hover:bg-rose-600 text-rose-600 group-hover:text-white",
  indigo: "bg-indigo-100 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white"
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-16 bg-white border-y border-gray-100 scroll-mt-20">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4 border border-blue-100">
            <Sparkles className="w-4 h-4" />
            Trusted by 15L+ Indians
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-blue-600">MyeCA.in</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience hassle-free tax filing with our advanced platform designed for accuracy, speed, and maximum refunds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CardPremium className="p-8 group h-full relative overflow-hidden bg-white border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md transition-all">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardPremium>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
