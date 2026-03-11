import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  FileText,
  BarChart3,
  Briefcase,
  ArrowRight,
  Check
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const services = [
  {
    title: "Services Marketplace",
    description: "Browse all CA services with transparent pricing. ITR filing, GST registration, company formation & more.",
    icon: Briefcase,
    href: "/services/marketplace",
    color: "blue",
    badge: "30+ Services",
    features: ["Transparent Pricing", "Expert CAs", "Quick Turnaround"]
  },
  {
    title: "Document Generator",
    description: "Generate rent receipts, salary slips, invoices and more - completely free!",
    icon: FileText,
    href: "/documents/generator",
    color: "teal",
    badge: "Free",
    features: ["Rent Receipts", "Salary Slips", "GST Invoices"]
  },
  {
    title: "Business Dashboard",
    description: "Track all compliance deadlines, filings, and documents in one central dashboard.",
    icon: Building2,
    href: "/business/dashboard",
    color: "slate",
    badge: "For Businesses",
    features: ["Compliance Tracker", "Document Vault", "Due Date Alerts"]
  },
  {
    title: "Virtual CFO",
    description: "Get complete financial management with P&L reports, cash flow analysis, and runway tracking.",
    icon: BarChart3,
    href: "/business/virtual-cfo",
    color: "emerald",
    badge: "Premium",
    features: ["Financial Reports", "Budget Analysis", "Investor Ready"]
  }
];

const colorClasses: Record<string, { bg: string; icon: string; badgeBg: string; badgeText: string }> = {
  blue: { bg: "bg-[#eef2ff]", icon: "text-[#4f46e5]", badgeBg: "bg-[#eef2ff]", badgeText: "text-[#4f46e5]" },
  teal: { bg: "bg-[#ccfbf1]", icon: "text-[#0d9488]", badgeBg: "bg-[#ccfbf1]", badgeText: "text-[#0d9488]" },
  slate: { bg: "bg-[#f1f5f9]", icon: "text-[#475569]", badgeBg: "bg-[#f1f5f9]", badgeText: "text-[#475569]" },
  emerald: { bg: "bg-[#dcfce7]", icon: "text-[#15803d]", badgeBg: "bg-[#dcfce7]", badgeText: "text-[#15803d]" },
};

export default function ProfessionalServicesSection() {
  return (
    <section id="professional-services" className="py-24 bg-[#fcfcfd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Services Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8"
        >
          {services.map((service) => {
            const colors = colorClasses[service.color];
            return (
              <motion.div key={service.title} variants={itemVariants} className="h-full">
                <Card className="flex flex-col h-full bg-white rounded-[24px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/60 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  <CardContent className="p-8 flex flex-col flex-grow h-full">
                    
                    <div className="flex items-start justify-between mb-8">
                      <div className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center ${colors.bg} group-hover:scale-110 transition-transform duration-500`}>
                        <service.icon className={`h-6 w-6 ${colors.icon}`} strokeWidth={2} />
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[13px] font-semibold tracking-wide ${colors.badgeBg} ${colors.badgeText}`}>
                        {service.badge}
                      </span>
                    </div>

                    <h3 className="text-[22px] font-bold text-slate-900 mb-3 tracking-tight">
                      {service.title}
                    </h3>

                    <p className="text-slate-500 text-[15px] leading-relaxed mb-8 flex-grow">
                      {service.description}
                    </p>

                    <ul className="space-y-4 mb-8">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-[15px] text-slate-600 font-medium">
                          <div className="w-[22px] h-[22px] rounded-full border-[1.5px] border-[#22c55e] flex items-center justify-center bg-green-50/30 flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-[#22c55e]" strokeWidth={3.5} />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link href={service.href} className="inline-block mt-auto">
                      <Button className="w-32 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl h-11 text-[15px] font-semibold shadow-sm shadow-blue-500/20 group">
                        Explore
                        <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>

                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

