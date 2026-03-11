import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Lock, 
  Search, 
  Clock, 
  ArrowRight, 
  FileText, 
  Zap,
  CheckCircle2,
  Shield,
  Rocket,
  Download,
  Play,
  FileSearch,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";

export default function DocumentVaultServicePage() {
  const { isAuthenticated } = useAuth();
  const [demoStep, setDemoStep] = useState(0);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const features = [
    {
      icon: <Lock className="w-7 h-7 text-[#4f46e5]" />,
      title: "Bank-Grade Encryption",
      description: "Every file is encrypted at rest and in transit using industry-standard AES-256 protocols.",
      bgColor: "bg-[#eef2ff]"
    },
    {
      icon: <Zap className="w-7 h-7 text-[#15803d]" />,
      title: "Instant Access",
      description: "Access your PAN, Aadhaar, and ITR documents from any device, anywhere in the world.",
      bgColor: "bg-[#dcfce7]"
    },
    {
      icon: <Search className="w-7 h-7 text-purple-600" />,
      title: "Smart Organization",
      description: "Auto-categorization of documents by tax year, category, and importance.",
      bgColor: "bg-purple-50"
    },
    {
      icon: <Clock className="w-7 h-7 text-[#c2410c]" />,
      title: "Expiry Alerts",
      description: "Get notified before your documents expire, so you're always compliant.",
      bgColor: "bg-[#ffedd5]"
    }
  ];

  const runDemo = () => {
    setIsDemoRunning(true);
    setDemoStep(1);
    const intervals = [2000, 4000, 6000, 8000];
    intervals.forEach((ms, index) => {
      setTimeout(() => {
        setDemoStep(index + 2);
        if (index === intervals.length - 1) setIsDemoRunning(false);
      }, ms);
    });
  };

  const VaultButton = ({ className }: { className?: string }) => (
    <Link href={isAuthenticated ? "/documents" : "/login"}>
      <Button size="lg" className={className}>
        <Rocket className="w-4 h-4 mr-2" />
        {isAuthenticated ? "Access Your Vault" : "Login to Access Vault"}
      </Button>
    </Link>
  );

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title="Secure Document Vault | MyEca" 
        description="Store and manage your sensitive tax and identity documents with bank-grade encryption."
        keywords="document vault, secure storage, tax documents, identity proof, encryption"
      />

      {/* Hero Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white text-[var(--color-primary-700)] px-4 py-2 rounded-full text-sm font-medium shadow-sm border border-[var(--color-primary-100)]"
            >
              <Shield className="w-4 h-4 text-[var(--color-accent-600)]" />
              <span>CA Assisted Secure Storage</span>
              <span className="text-[var(--color-primary-400)]">•</span>
              <span className="text-[var(--color-success-600)] font-semibold">ISO Certified Vault</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl lg:text-5xl font-bold text-[var(--color-primary-900)] leading-tight"
            >
              Your Personal <span className="text-[var(--color-accent-600)]">Secure Vault</span>
              <br className="hidden sm:block" />
              for Tax & Legal Documents
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              The most secure way to store, organize, and share your critical tax and legal documents. Bank-grade security meets effortless organization.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <VaultButton className="w-full sm:w-auto px-8 rounded-xl h-12 text-[15px] font-semibold bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] shadow-sm shadow-[var(--color-accent-600)]/20 transition-all" />
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 rounded-xl h-12 text-[15px] font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 transition-all">
                    Learn Security Protocols
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                       <ShieldCheck className="text-emerald-600 w-6 h-6" />
                       Our Security Protocols
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                      Standard operating procedures for maximum data protection.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {[
                      { title: "AES-256 Bit Encryption", desc: "Military grade encryption for all files at rest." },
                      { title: "Zero Knowledge Architecture", desc: "Only you can access your private keys." },
                      { title: "Regular Security Audits", desc: "Bi-annual audits by independent security firms." },
                      { title: "Data Locality", desc: "Your data stays within your sovereign region." }
                    ].map((p, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-200 shadow-sm">{i+1}</div>
                        <div>
                          <h4 className="font-bold text-slate-900">{p.title}</h4>
                          <p className="text-sm text-slate-600">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="p-8 h-full rounded-[24px] bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/60 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex flex-col items-start gap-5">
                    <div className={`${feature.bgColor} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 text-current`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-[20px] font-bold text-slate-900 tracking-tight">{feature.title}</h3>
                      <p className="text-[15px] text-slate-500 mt-2 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-slate-50/50 border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16 max-w-6xl mx-auto">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
                Security Protocol
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                Safety isn't a feature.<br className="hidden sm:block" />
                It's our <span className="text-blue-600">foundation</span>.
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                {[
                  "256-bit AES Encryption",
                  "TLS 1.3 Secure Tunnels",
                  "Multi-Factor Auth",
                  "Zero-Trust Access",
                  "Regional Data Residency",
                  "Automated Audit Trails"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-slate-600 font-semibold text-[15px]">{item}</span>
                  </div>
                ))}
              </div>

               <div className="pt-4 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                 <Dialog>
                   <DialogTrigger asChild>
                     <Button className="rounded-xl h-12 px-8 text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all shadow-sm">
                       Read Security Whitepaper
                     </Button>
                   </DialogTrigger>
                   <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                           <FileSearch className="text-blue-600 w-6 h-6" />
                           Technical Whitepaper: MyEca Vault Architecture
                        </DialogTitle>
                        <DialogDescription>
                          A deep dive into our multi-layered encryption approach.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="prose prose-slate mt-4 max-w-none border-t pt-6 space-y-6">
                         <section>
                            <h3 className="font-bold text-lg text-slate-900">1. Architectural Overview</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                              MyEca uses a decentralized storage pattern where file metadata is stored in ACID-compliant databases while actual binary data is fragmented and encrypted before reaching the object store. This ensures that even in the case of a primary database breach, no readable documents are exposed.
                            </p>
                         </section>
                         <section>
                            <h3 className="font-bold text-lg text-slate-900">2. Key Management Strategy</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                              We employ AWS KMS (Key Management Service) integrated with local hardware security modules (HSMs). Each user receives a unique Master Key (MK) which is used to generate session-based Data Keys (DKs) for high-performance encryption/decryption cycles.
                            </p>
                         </section>
                         <div className="flex justify-center py-6">
                            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                               <Download className="w-4 h-4" />
                               Download Full PDF (820 KB)
                            </Button>
                         </div>
                      </div>
                   </DialogContent>
                 </Dialog>

                 <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />
                       ))}
                    </div>
                    10k+ Secure Uploads Daily
                 </div>
               </div>
            </div>

            <div className="flex-[1.2] relative">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-2 rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] border border-slate-200/80 relative z-10 w-full"
              >
                <div className="bg-slate-50 rounded-[24px] overflow-hidden">
                  <div className="bg-slate-100/50 px-8 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400/40" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/40" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400/40" />
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 tracking-[3px] uppercase">Safe Storage Vault</div>
                    <div className="w-10" />
                  </div>
                  <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-5">
                      {[1,2,3,4].map(i => (
                        <div 
                          key={i} 
                          className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4"
                        >
                          <div className="p-2.5 bg-blue-50 rounded-xl">
                            <FileText className="w-6 h-6 text-blue-500/70" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <div className="h-2.5 w-full bg-slate-100 rounded-full" />
                            <div className="h-2 w-2/3 bg-slate-50 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div 
                      className="p-8 bg-emerald-50/50 rounded-[24px] border border-emerald-100 flex items-center justify-between relative overflow-hidden"
                    >
                       <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                             <div className="h-3 w-40 bg-emerald-200/40 rounded-full" />
                             <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                          </div>
                          <div className="h-2.5 w-24 bg-emerald-100/40 rounded-full" />
                       </div>
                       <ShieldCheck className="w-12 h-12 text-emerald-500 drop-shadow-sm" />
                    </div>
                  </div>
                </div>
              </motion.div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100/50 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto p-12 md:p-16 rounded-[32px] bg-white shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-200/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Secure your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Compliance Files</span> today
              </h2>

              <p className="text-[19px] text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who trust MyEca for bank-grade document storage.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <VaultButton className="px-8 w-full sm:w-auto rounded-[14px] h-14 text-[16px] font-semibold bg-[#2563eb] hover:bg-blue-700 shadow-lg shadow-blue-500/25 text-white transition-all hover:-translate-y-0.5" />
                
                <Dialog onOpenChange={(open) => !open && setDemoStep(0)}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="px-8 w-full sm:w-auto rounded-[14px] h-14 text-[16px] font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all hover:-translate-y-0.5">
                      View Security Demo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg bg-white overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Interactive Security Demo</DialogTitle>
                      <DialogDescription>
                        Witness our real-time encryption and integrity check in action.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-8 text-center space-y-6">
                       {demoStep === 0 ? (
                         <div className="space-y-6">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto border border-blue-100">
                               <Play className="w-8 h-8 text-blue-600 ml-1" />
                            </div>
                            <Button onClick={runDemo} className="bg-blue-600">Start Simulation</Button>
                         </div>
                       ) : (
                         <div className="space-y-8 px-4">
                            <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
                               <span>Security Status</span>
                               <span className={demoStep === 5 ? "text-emerald-600" : "text-blue-600"}>
                                 {demoStep === 1 && "Initializing..."}
                                 {demoStep === 2 && "Syncing Keys..."}
                                 {demoStep === 3 && "Verifying Certificates..."}
                                 {demoStep === 4 && "Finalizing Vault..."}
                                 {demoStep === 5 && "SECURE"}
                               </span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(demoStep / 5) * 100}%` }}
                                 className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                               />
                            </div>
                            <div className="space-y-4">
                               {[
                                 "Encryption Tunnel (TLS 1.3)",
                                 "AES-256 Key Handshake",
                                 "ISO Compliance Check",
                                 "Zero-Knowledge Handshake"
                               ].map((text, i) => (
                                 <motion.div 
                                   key={i}
                                   initial={{ opacity: 0, x: -10 }}
                                   animate={{ opacity: demoStep > i + 1 ? 1 : 0.3, x: 0 }}
                                   className="flex items-center gap-3 text-[13px] font-medium"
                                 >
                                   <div className={`w-5 h-5 rounded-full flex items-center justify-center ${demoStep > i + 1 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                                      {demoStep > i + 1 ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                   </div>
                                   {text}
                                 </motion.div>
                               ))}
                            </div>
                            {demoStep === 5 && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                 <VaultButton className="w-full bg-emerald-600 hover:bg-emerald-700" />
                              </motion.div>
                            )}
                         </div>
                       )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
