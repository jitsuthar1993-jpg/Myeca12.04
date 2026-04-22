import { m } from "framer-motion";
import { CardPremium } from "@/components/ui/card";
import { Shield, Bot, UserCheck, Clock, Smartphone, TrendingUp, Sparkles } from "lucide-react";
import { ComparisonTable } from "./ComparisonTable";

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
        <m.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4 border border-blue-100">
            <Sparkles className="w-4 h-4" />
            ERI-Registered · CA-Reviewed Returns
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Why MyeCA.in <span className="text-[#315efb]">Outperforms Self-Filing</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every return is reviewed by a licensed CA before submission — so errors get caught before the IT department does.
          </p>
        </m.div>

        <div className="max-w-5xl mx-auto">
          <ComparisonTable />
        </div>
      </div>
    </section>
  );
}
