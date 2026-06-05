import { m } from "framer-motion";
import { RouteSeo } from "@/components/seo/RouteSeo";
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
  const [previewStep, setPreviewStep] = useState(0);

  const features = [
    {
      icon: <Lock className="w-7 h-7 text-[#4f46e5]" />,
      title: "Private Storage Workflow",
      description: "Files are handled through authenticated access and the configured private storage provider.",
      bgColor: "bg-[#eef2ff]"
    },
    {
      icon: <Zap className="w-7 h-7 text-[#15803d]" />,
      title: "Anytime Access",
      description: "Access your PAN, Aadhaar, and ITR documents from any device, anywhere in the world.",
      bgColor: "bg-[#dcfce7]"
    },
    {
      icon: <Search className="w-7 h-7 text-purple-600" />,
      title: "Smart Organization",
      description: "Organize documents by tax year, category, and importance so filing details are easier to find.",
      bgColor: "bg-purple-50"
    },
    {
      icon: <Clock className="w-7 h-7 text-[#c2410c]" />,
      title: "Review Cues",
      description: "Keep document categories and case links clear so review needs are easier to spot.",
      bgColor: "bg-[#ffedd5]"
    }
  ];

  const runPreview = () => {
    setPreviewStep(1);
    const intervals = [2000, 4000, 6000, 8000];
    intervals.forEach((ms, index) => {
      setTimeout(() => {
        setPreviewStep(index + 2);
      }, ms);
    });
  };

  const VaultButton = ({ className }: { className?: string }) => (
    <Link href={isAuthenticated ? "/documents" : "/auth/login?next=/documents"}>
      <Button size="lg" className={className}>
        <Rocket className="w-4 h-4 mr-2" />
        {isAuthenticated ? "Access Your Vault" : "Login to Access Vault"}
      </Button>
    </Link>
  );

  return (
    <div className="bg-white min-h-screen">
      <RouteSeo path="/services/document-vault" />
      <SEO 
        title="Secure Document Vault | MyEca" 
        description="Store and manage your sensitive tax and identity documents with secure account-based access."
        keywords="document vault, private document access, tax documents, identity proof"
      />

      {/* Hero Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white text-[var(--color-primary-700)] px-4 py-2 rounded-full text-sm font-medium shadow-sm border border-[var(--color-primary-100)]"
            >
              <Shield className="w-4 h-4 text-[var(--color-accent-600)]" />
              <span>CA Assisted Document Workflow</span>
              <span className="text-[var(--color-primary-400)]">|</span>
              <span className="text-[var(--color-success-600)] font-semibold">Controlled Access</span>
            </m.div>

            <m.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="type-page-title font-bold text-[var(--color-primary-900)]"
            >
              Your Personal <span className="text-[var(--color-accent-600)]">Secure Vault</span>
              <br className="hidden sm:block" />
              for Tax & Legal Documents
            </m.h1>

            <m.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Store, organize, and share your critical tax and legal documents with clear access controls and guided document workflows.
            </m.p>

            <m.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <VaultButton className="h-12 w-full rounded-xl bg-[var(--color-accent-600)] px-8 text-sm font-semibold shadow-sm shadow-[var(--color-accent-600)]/20 transition-all hover:bg-[var(--color-accent-700)] sm:w-auto" />
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="h-12 w-full rounded-xl border-slate-200 px-8 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 sm:w-auto">
                    Review Security Practices
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                       <ShieldCheck className="text-emerald-600 w-6 h-6" />
                       Vault Security Practices
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                      Practical controls used to keep document access scoped and understandable.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {[
                      { title: "Secure Transport", desc: "Sensitive documents should be shared through authenticated upload and download workflows." },
                      { title: "Role-Based Access", desc: "Access can be scoped to the user, CA, or assigned team member." },
                      { title: "Audit Trail Ready", desc: "Operational activity can be reviewed where administrative logging is enabled." },
                      { title: "Data Handling Controls", desc: "Production storage and retention follow the configured deployment provider and policy." }
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
            </m.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
            {features.map((feature, idx) => (
              <m.div
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
                      <h3 className="type-card-title font-bold text-slate-900">{feature.title}</h3>
                      <p className="type-support mt-2 text-slate-500">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </m.div>
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
                Security Practices
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                Safety isn't a feature.<br className="hidden sm:block" />
                It's our <span className="text-blue-600">foundation</span>.
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                {[
                  "Authenticated vault access",
                  "Private document download flow",
                  "Role-aware document handling",
                  "Case-linked uploads",
                  "Operational audit readiness",
                  "Provider-backed storage controls"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="type-support font-semibold text-slate-600">{item}</span>
                  </div>
                ))}
              </div>

               <div className="pt-4 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                 <Dialog>
                   <DialogTrigger asChild>
                     <Button className="rounded-xl h-12 px-8 text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all shadow-sm">
                       Read Security Overview
                     </Button>
                   </DialogTrigger>
                   <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                           <FileSearch className="text-blue-600 w-6 h-6" />
                           MyEca Vault Security Overview
                        </DialogTitle>
                        <DialogDescription>
                          How document access, case links, and storage controls work together.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="prose prose-slate mt-4 max-w-none border-t pt-6 space-y-6">
                         <section>
                            <h3 className="font-bold text-lg text-slate-900">1. Access Model</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                              The vault is account-based. Signed-in users can upload, download, and manage their own files, and files can be linked to service cases so the relevant team can review them in context.
                            </p>
                         </section>
                         <section>
                            <h3 className="font-bold text-lg text-slate-900">2. Storage and Review</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                              Document files are handled through the configured private storage provider, while metadata such as category, year, profile, and service case links keeps the workflow organized.
                            </p>
                         </section>
                         <section>
                            <h3 className="font-bold text-lg text-slate-900">3. Operational Notes</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                              Any additional retention, region, encryption, or audit policy depends on the production environment configuration. The in-app copy avoids promising a specific unpublished compliance certificate or downloadable report.
                            </p>
                         </section>
                      </div>
                   </DialogContent>
                 </Dialog>

                 <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />
                       ))}
                    </div>
                    Secure Upload Workflow
                 </div>
               </div>
            </div>

            <div className="flex-[1.2] relative">
              <m.div
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
                    <div className="type-meta font-bold text-slate-400">Safe Storage Vault</div>
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
              </m.div>
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
              <h2 className="type-section-title mb-6 font-extrabold text-slate-900">
                Secure your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Compliance Files</span> today
              </h2>

              <p className="type-body mx-auto mb-10 max-w-2xl text-slate-500">
                Keep tax and compliance documents organized with a secure, account-based vault.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <VaultButton className="h-14 w-full rounded-[14px] bg-[#2563eb] px-8 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 sm:w-auto" />
                
                <Dialog onOpenChange={(open) => !open && setPreviewStep(0)}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="h-14 w-full rounded-[14px] border-slate-200 px-8 text-base font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 sm:w-auto">
                      Preview Security Flow
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg bg-white overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Security Flow Preview</DialogTitle>
                      <DialogDescription>
                        Review the checks a secure upload flow should complete before a file is accepted.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-8 text-center space-y-6">
                       {previewStep === 0 ? (
                         <div className="space-y-6">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto border border-blue-100">
                               <Play className="w-8 h-8 text-blue-600 ml-1" />
                            </div>
                            <Button onClick={runPreview} className="bg-blue-600">Start Preview</Button>
                         </div>
                       ) : (
                         <div className="space-y-8 px-4">
                            <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
                               <span>Security Status</span>
                               <span className={previewStep === 5 ? "text-emerald-600" : "text-blue-600"}>
                                 {previewStep === 1 && "Initializing..."}
                                 {previewStep === 2 && "Syncing Keys..."}
                                 {previewStep === 3 && "Verifying Certificates..."}
                                 {previewStep === 4 && "Finalizing Vault..."}
                                 {previewStep === 5 && "SECURE"}
                               </span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                               <m.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(previewStep / 5) * 100}%` }}
                                 className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                               />
                            </div>
                            <div className="space-y-4">
                               {[
                                 "Secure Transport Check",
                                 "Key Scope Check",
                                 "Access Policy Check",
                                 "Integrity Check"
                               ].map((text, i) => (
                                 <m.div 
                                   key={i}
                                   initial={{ opacity: 0, x: -10 }}
                                   animate={{ opacity: previewStep > i + 1 ? 1 : 0.3, x: 0 }}
                                   className="flex items-center gap-3 text-sm font-medium"
                                 >
                                   <div className={`w-5 h-5 rounded-full flex items-center justify-center ${previewStep > i + 1 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                                      {previewStep > i + 1 ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                   </div>
                                   {text}
                                 </m.div>
                               ))}
                            </div>
                            {previewStep === 5 && (
                              <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                 <VaultButton className="w-full bg-emerald-600 hover:bg-emerald-700" />
                              </m.div>
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
