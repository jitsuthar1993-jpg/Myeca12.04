import React from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpen, GraduationCap, Lightbulb, Star } from "lucide-react";
import { m } from "framer-motion";

const resources = [
  {
    title: "The Founder's Guide to Registration",
    description: "Everything you need to know about starting a fundable venture in 2025.",
    link: "/services/company-registration",
    icon: GraduationCap,
    color: "bg-blue-50 text-blue-600",
    tag: "Business"
  },
  {
    title: "Mastering GST Compliance",
    description: "Expert strategies to optimize input tax credit and stay notice-free.",
    link: "/services/gst-registration",
    icon: BookOpen,
    color: "bg-emerald-50 text-emerald-600",
    tag: "Taxation"
  },
  {
    title: "2025 MSME Power Play",
    description: "Unlock priority sector lending and government tender benefits.",
    link: "/services/msme-udyam-registration",
    icon: Star,
    color: "bg-orange-50 text-orange-600",
    tag: "Government"
  },
  {
    title: "Food Safety Compliance Guide",
    description: "Navigating FSSAI regulations for restaurants and cloud kitchens.",
    link: "/services/fssai-registration",
    icon: Lightbulb,
    color: "bg-rose-50 text-rose-600",
    tag: "Food Tech"
  }
];

export default function FeaturedResources() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Expert <span className="text-blue-600 italic">Knowledge Hub</span>
          </h2>
          <p className="text-lg text-slate-600">
            Deep-dive guides authored by our expert CAs to help you scale your business safely.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {resources.map((resource, index) => (
            <m.div
              key={resource.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={resource.link}>
                <div className="group h-full p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-50 transition-all cursor-pointer">
                  <div className={`w-14 h-14 ${resource.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <resource.icon className="w-7 h-7" />
                  </div>
                  
                  <span className="type-meta font-black uppercase tracking-widest text-slate-400 mb-2 block">
                    {resource.tag}
                  </span>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {resource.title}
                  </h3>
                  
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center text-blue-600 text-sm font-bold">
                    Read Ultimate Guide
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
