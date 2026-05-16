import { m } from "framer-motion";
import {
  ShieldCheck,
  Users2,
  Building2,
  Lock,
  Sparkles,
  Star,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const supportedProfiles = [
  "Salaried professionals",
  "Freelancers",
  "Business owners",
  "Capital gains investors",
  "GST-registered businesses",
  "Startup founders",
  "Notice recipients",
  "NRI taxpayers",
];

const stats = [
  {
    label: "Filing Year",
    val: "AY 2026-27",
    sub: "FY 2025-26 support",
    icon: FileCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    label: "Review",
    val: "Optional",
    sub: "CA Assistance Available",
    icon: ShieldCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  {
    label: "Data Security",
    val: "Secure",
    sub: "Document Workflow",
    icon: Lock,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    label: "Pricing",
    val: "₹499",
    sub: "Simple Filing From",
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
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Filing workflow</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Built for Common Indian <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Tax Filing Profiles
            </span>
          </h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
            Use guided workflows for salary, business, GST, capital gains, notices, and startup compliance, with expert review available when facts need a closer look.
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
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">Supported Profiles</h3>
                 <p className="text-[11px] text-blue-600 font-black uppercase tracking-[0.15em]">Guided flows by income and compliance type</p>
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
                   AY
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200 mx-1" />
              <div className="text-left">
                 <div className="text-xs font-black text-slate-900 leading-none">AY 2026-27 Ready</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Review before filing</div>
              </div>
           </div>
        </div>

        {/* Profile chips - no unverifiable brand affiliation claims */}
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
                {supportedProfiles.map((profile, index) => (
                  <div
                    key={`${profile}-${setIndex}-${index}`}
                    className="flex items-center justify-center w-60 h-24 flex-shrink-0 mx-4 transition-all duration-500 opacity-80 hover:opacity-100 hover:scale-105"
                  >
                    <span className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-slate-600">
                      {profile}
                    </span>
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
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Secure Document Workflow</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-blue-500" />
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Privacy-Focused Handling</span>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
