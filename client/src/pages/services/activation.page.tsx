import { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useRoute, useLocation } from "wouter";
import { 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight, 
  Upload, 
  FileText, 
  ShieldCheck, 
  Zap, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Download,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getServiceById } from "@/data/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ActivationPage() {
  const [, params] = useRoute("/services/activate/:serviceId") as [boolean, { serviceId?: string } | null];
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const service = useMemo(() => {
    if (!params?.serviceId) return null;
    return getServiceById(params.serviceId);
  }, [params?.serviceId]);

  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service not found</h1>
          <Button onClick={() => setLocation("/services/selection")}>Back to selection</Button>
        </div>
      </div>
    );
  }

  const documents = service.documents || [];
  const totalSteps = documents.length + 2; // Overview + Docs + Success

  // Purchase/Activation mutation
  const activateMutation = useMutation({
    mutationFn: async () => {
      const priceNum = parseInt(service.price.replace(/[^0-9]/g, '')) || 0;
      const response = await apiRequest('/api/user-services', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: service.id,
          serviceTitle: service.title,
          serviceCategory: service.category,
          paymentAmount: priceNum,
          paymentStatus: 'paid', // Mocked as paid for now
          status: 'pending',
          metadata: {
            documentsUploaded: uploadedDocs,
            activationDate: new Date().toISOString()
          }
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-services'] });
      setCurrentStep(totalSteps - 1); // Go to success step
    },
    onError: (err: any) => {
      toast({
        title: "Activation Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleNext = () => {
    if (currentStep < totalSteps - 2) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === totalSteps - 2) {
      // Final submission step
      activateMutation.mutate();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      setLocation("/services/selection");
    }
  };

  const handleUpload = (docName: string) => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      if (!uploadedDocs.includes(docName)) {
        setUploadedDocs(prev => [...prev, docName]);
      }
      setIsUploading(false);
      handleNext();
    }, 1200);
  };

  const progress = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-500 pb-20">
      {/* Premium Header */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <m.div 
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "circOut" }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-12">
        {/* Navigation */}
        <m.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {currentStep === 0 ? "Return to Marketplace" : "Previous Step"}
        </m.button>

        <AnimatePresence mode="wait">
          {/* STEP 0: OVERVIEW */}
          {currentStep === 0 && (
            <m.div
              key="step-overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 px-3 py-1 font-black uppercase text-[10px] tracking-widest">
                  Service Activation Phase
                </Badge>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  Activate {service.title}
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                  {service.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl overflow-hidden group">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">What to expect?</h3>
                        <p className="text-sm text-slate-500 font-medium">Quick activation process</p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {service.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden text-slate-900 flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">Estimated Timeline</h3>
                        <p className="text-sm text-slate-500 font-medium">{service.tat}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Professional Fee</p>
                      <p className="text-4xl font-black tracking-tighter text-slate-900">{service.price}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    100% Secure Transaction & Data Privacy
                  </div>
                </Card>
              </div>

              <div className="p-8 rounded-[32px] bg-white border border-slate-200/60 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Required Documents Checklist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-600 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleNext}
                className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 gap-3 group"
              >
                Proceed to Document Upload
                <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Button>
            </m.div>
          )}

          {/* STEPS 1 to N: DOCUMENT UPLOADS */}
          {currentStep > 0 && currentStep <= documents.length && (
            <m.div
              key={`step-upload-${currentStep}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4 mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
                  Step {currentStep} of {documents.length}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Upload {documents[currentStep - 1]}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Please provide a clear scanned copy of your {documents[currentStep - 1].toLowerCase()}.
                </p>
              </div>

              <div 
                className={cn(
                  "relative p-12 md:p-20 rounded-[48px] border-4 border-dashed transition-all duration-500 flex flex-col items-center justify-center text-center bg-white group",
                  isUploading ? "border-blue-300 bg-blue-50/10" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 transition-all duration-500",
                  isUploading ? "bg-blue-600 scale-110 shadow-xl shadow-blue-500/30" : "bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600"
                )}>
                  {isUploading ? (
                    <m.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="text-white"
                    >
                      <Upload className="h-10 w-10" />
                    </m.div>
                  ) : (
                    <Upload className="h-10 w-10" />
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">
                    {isUploading ? "Uploading..." : `Drag & Drop your ${documents[currentStep - 1]}`}
                  </h3>
                  <p className="text-slate-500 font-medium">PNG, JPG or PDF up to 5MB</p>
                </div>

                {!isUploading && (
                  <Button 
                    variant="outline"
                    className="mt-10 h-14 px-8 rounded-2xl border-2 font-black transition-all hover:bg-white hover:border-blue-600 hover:text-blue-600"
                    onClick={() => handleUpload(documents[currentStep - 1])}
                  >
                    Browse Files
                  </Button>
                )}

                {/* Processing Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-[48px] z-10">
                    <div className="w-64 space-y-4">
                      <Progress value={80} className="h-2" />
                      <p className="text-sm font-black text-blue-600 uppercase tracking-widest text-center">Analysing Document Reliability...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4">
                    <Info className="h-5 w-5 text-amber-600" />
                  </div>
                  <h4 className="font-black text-slate-900 text-sm mb-1">Clear Copy</h4>
                  <p className="text-[11px] text-slate-600 font-bold leading-relaxed">Ensure all text and edges are clearly visible for faster verification.</p>
                </div>
                <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-black text-slate-900 text-sm mb-1">End-to-End Encrypted</h4>
                  <p className="text-[11px] text-slate-600 font-bold leading-relaxed">Your data is secured with enterprise-grade AES-256 encryption.</p>
                </div>
                <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4">
                    <HelpCircle className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h4 className="font-black text-slate-900 text-sm mb-1">Need help?</h4>
                  <p className="text-[11px] text-slate-600 font-bold leading-relaxed">Instantly connect with our support team using the chatbot below.</p>
                </div>
              </div>
            </m.div>
          )}

          {/* STEP SUCCESS: COMPLETED */}
          {currentStep === totalSteps - 1 && (
            <m.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-8"
            >
              <div className="relative mx-auto w-32 h-32 mb-12">
                <m.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                >
                  <CheckCircle2 className="h-16 w-16 text-white" />
                </m.div>
                <m.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute inset-0 bg-emerald-500 rounded-full -z-10" 
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Activation Successful!</h2>
                <p className="text-lg text-slate-500 font-medium max-w-sm mx-auto">
                  We've received all documents for **{service.title}**. Our experts are reviewing them right now.
                </p>
              </div>

              <div className="p-8 rounded-[40px] bg-white border border-slate-200/60 shadow-sm max-w-md mx-auto">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Service Summary</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-slate-500 font-bold">Service ID</span>
                    <span className="font-black text-slate-900">MyeCA-{Math.floor(Math.random() * 900000 + 100000)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-slate-500 font-bold">Documents</span>
                    <span className="font-black text-slate-900">{uploadedDocs.length} Uploaded</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Expected Verification</span>
                    <span className="font-black text-blue-600">Within 24 Hours</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <Button 
                   onClick={() => setLocation("/dashboard")}
                   className="h-16 rounded-[22px] bg-slate-900 hover:bg-black text-white font-black text-lg gap-3"
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button 
                   variant="outline"
                   className="h-16 rounded-[22px] border-2 font-black text-slate-600"
                   onClick={() => window.print()}
                >
                  <Download className="h-5 w-5 mr-3" />
                  Download Receipt
                </Button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
