import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { companyTestimonials } from "@/data/testimonials";
import { LazyImage } from "@/components/performance/LazyImage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Authentic company logos using uploaded SVG files
const companyLogos = [
  { name: "TCS", logoPath: "/assets/logos/Tata_Consultancy_Services_old_logo.svg" },
  { name: "Wipro", logoPath: "/assets/logos/Wipro_Primary_Logo_Color_RGB.svg" },
  { name: "ITC", logoPath: "/assets/logos/ITC_Limited_Logo.svg" },
  { name: "Hindustan Unilever", logoPath: "/assets/logos/hindustan-unilever.svg" },
  { name: "Airtel", logoPath: "/assets/logos/airtel.svg" },
  { name: "Asian Paints", logoPath: "/assets/logos/Asian_Paints_Logo.svg" },
  { name: "Paytm", logoPath: "/assets/logos/Paytm_Logo.svg" },
  { name: "Zomato", logoPath: "/assets/logos/Zomato_Logo.svg" },
  { name: "DLF", logoPath: "/assets/logos/DLF_logo.svg" },
  { name: "Godrej", logoPath: "/assets/logos/Godrej_Logo.svg" },
  { name: "Bajaj Finserv", logoPath: "/assets/logos/bajaj-finserv.svg" },
  { name: "TATA Steel", logoPath: "/assets/logos/Tata_Steel_Logo.svg" },
  { name: "Tanishq", logoPath: "/assets/logos/Tanishq_Logo.svg" },
  { name: "Raymond", logoPath: "/assets/logos/Raymond_logo.svg" },
  { name: "Hero", logoPath: "/assets/logos/hero.svg" },
  { name: "Ola", logoPath: "/assets/logos/Ola_Cabs_logo.svg" },
  { name: "Dunzo", logoPath: "/assets/logos/dunzo.svg" },
  { name: "Justdial", logoPath: "/assets/logos/Justdial_Logo.svg" },
  { name: "T-Series", logoPath: "/assets/logos/T-series-logo.svg" },
  { name: "TATA 1mg", logoPath: "/assets/logos/TATA_1mg_Logo.svg" },
  { name: "PhonePe", logoPath: "/assets/logos/phonepe.svg" },
  { name: "Adani Green Energy", logoPath: "/assets/logos/Adani_Green_Energy_logo.svg" },
  { name: "Balaji Wafers", logoPath: "/assets/logos/BalajiWafersLogo.svg" },
  { name: "Indiabulls", logoPath: "/assets/logos/Indiabulls_Home_Loans_Logo.svg" },
  { name: "Snapdeal", logoPath: "/assets/logos/Snapdeal_branding_logo.svg" },
  { name: "TATA", logoPath: "/assets/logos/tata.svg" },
  { name: "Videocon", logoPath: "/assets/logos/Videocon_logo.svg" },
  { name: "ZOHO", logoPath: "/assets/logos/ZOHO.svg" }
];

export default function TrustedBySection() {
  return (
    <section id="trusted-by" className="py-12 bg-white border-y border-gray-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Employees from India's Leading Companies
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real CAs. Real accuracy. Filed directly via the official Income Tax Portal.
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">ISO</div>
            <div className="text-gray-600 text-sm font-medium">27001 Certified Security</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">ERI</div>
            <div className="text-gray-600 text-sm font-medium">Govt. Registered Intermediary</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-gray-600 text-sm font-medium">CA-Reviewed Returns</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">4.8⭐</div>
            <div className="text-gray-600 text-sm font-medium">User Rating</div>
          </div>
        </motion.div>

        {/* Company Logos - Rotating */}
        <div className="overflow-hidden mb-16 relative">
          <motion.div
            className="flex items-center space-x-4"
            animate={{ x: [0, "-50%"] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 60,
                ease: "linear",
              },
            }}
            style={{ width: "200%" }}
          >
            {/* Create two sets for seamless loop */}
            {[...Array(2)].map((_, setIndex) => 
              companyLogos.map((company, index) => (
                <motion.div
                  key={`${company.name}-${setIndex}-${index}`}
                  className="flex items-center justify-center h-20 w-44 transition-all duration-300 cursor-pointer flex-shrink-0 group relative px-6 py-4"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 1 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Hover background effect */}
                  <div className="absolute inset-0 bg-gray-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 w-full h-8 md:h-10 flex items-center justify-center">
                    <LazyImage 
                      src={company.logoPath} 
                      alt={`${company.name} logo`}
                      className="max-w-full max-h-full object-contain transition-all duration-300 group-hover:scale-110 grayscale hover:grayscale-0 opacity-70 group-hover:opacity-100"
                    />
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
