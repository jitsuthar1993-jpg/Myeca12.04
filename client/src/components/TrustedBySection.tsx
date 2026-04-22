import { m } from "framer-motion";
import { 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Users2,
  Building2,
  Lock,
  Globe,
  Sparkles,
  Star,
  FileCheck
} from "lucide-react";
import { LazyImage } from "@/components/performance/LazyImage";
import { cn } from "@/lib/utils";

// Authentic company logos using verified assets
const companyLogos = [
  { name: "Reliance Industries", logoPath: "/assets/logos/reliance.png" },
  { name: "Infosys", logoPath: "/assets/logos/infosys.svg" },
  { name: "HDFC Bank", logoPath: "/assets/logos/hdfc.png" },
  { name: "ICICI Bank", logoPath: "/assets/logos/icici.svg" },
  { name: "SBI", logoPath: "/assets/logos/sbi.png" },
  { name: "LIC", logoPath: "/assets/logos/lic.png" },
  { name: "ITC", logoPath: "/assets/logos/itc.svg" },
  { name: "Wipro", logoPath: "/assets/logos/wipro.svg" },
  { name: "Asian Paints", logoPath: "/assets/logos/asian_paints.png" },
  { name: "Paytm", logoPath: "/assets/logos/paytm.png" },
  { name: "Zomato", logoPath: "/assets/logos/zomato.png" },
  { name: "DLF", logoPath: "/assets/logos/dlf.png" },
  { name: "PhonePe", logoPath: "/assets/logos/phonepe.svg" },
];

const stats = [
  { 
    label: "Total Filings", 
    val: "10,000+", 
    sub: "Successful ITR Filings",
    icon: FileCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  { 
    label: "Accuracy", 
    val: "100%", 
    sub: "CA-Reviewed Returns",
    icon: ShieldCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  { 
    label: "Data Security", 
    val: "ISO 27001", 
    sub: "Certified Protection",
    icon: Lock,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  { 
    label: "User Trust", 
    val: "4.8/5", 
    sub: "Customer Satisfaction",
    icon: Star,
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  }
];

export default function TrustedBySection() {
  return (
    <section id="trusted-by" className="py-20 bg-[#F8FAFC] border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <m.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Enterprise Trust</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Trusted by Professionals from <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              India's Largest Entities
            </span>
          </h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
            MyeCA power users come from the highest echelons of Indian business. 
            Experience the standard of excellence they trust.
          </p>
        </m.div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/40 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-500/10 group-hover:-translate-y-1" />
              <div className="relative p-8 h-full flex flex-col items-center text-center">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                  stat.bgColor
                )}>
                  <stat.icon className={cn("w-7 h-7", stat.color)} />
                </div>
                <div className="text-3xl font-black text-slate-900 mb-2">{stat.val}</div>
                <div className="text-slate-900 text-xs font-black tracking-[0.2em] uppercase mb-1">{stat.label}</div>
                <div className="text-slate-400 text-xs font-bold">{stat.sub}</div>
              </div>
            </m.div>
          ))}
        </div>

        {/* Marquee Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
           <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
                 <Building2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">Corporate Ecosystem</h3>
                 <p className="text-[11px] text-blue-600 font-black uppercase tracking-[0.15em]">Filed by users of Top 4 & Global Firms</p>
              </div>
           </div>
           <div className="flex items-center gap-4 bg-white/50 py-2 px-4 rounded-2xl border border-slate-100">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden grayscale opacity-40">
                    <Users2 className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white z-10 shadow-lg">
                   +10k
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200 mx-1" />
              <div className="text-left">
                 <div className="text-xs font-black text-slate-900 leading-none">Power Users</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified Employees</div>
              </div>
           </div>
        </div>

        {/* Company Logos - Marquee */}
        <div className="relative py-10 rounded-[3rem] bg-white border border-slate-200/60 shadow-inner-lg overflow-hidden group/marquee">
          {/* Gradient Masks */}
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none" />
          
          <m.div
            className="flex items-center"
            animate={{ x: [0, "-50%"] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
            style={{ width: "fit-content" }}
          >
            {[0, 1].map((setIndex) => (
              <div key={`set-${setIndex}`} className="flex items-center">
                {companyLogos.map((company, index) => (
                  <div
                    key={`${company.name}-${setIndex}-${index}`}
                    className="flex items-center justify-center w-52 h-24 flex-shrink-0 mx-4 transition-all duration-500 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:scale-110"
                  >
                    <LazyImage 
                      src={company.logoPath} 
                      alt={`${company.name} logo`}
                      priority={true}
                      className="w-full h-full p-2"
                      imgClassName="max-w-full max-h-20 object-contain"
                    />
                  </div>
                ))}
              </div>
            ))}
          </m.div>
        </div>

        {/* Bottom CTA or Badge */}
        <div className="mt-12 flex flex-col items-center justify-center">
           <div className="flex items-center gap-8 py-4 px-8 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2">
                 <Lock className="w-4 h-4 text-emerald-500" />
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Bank-Grade 256-bit SSL Encryption</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-blue-500" />
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">100% Data Privacy Guaranteed</span>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}

