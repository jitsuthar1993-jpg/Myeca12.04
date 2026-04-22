import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { REGISTRATION_ESTIMATES, TimingService, RegistrationType } from "@/services/timing.service";
import { trackEvent } from "@/utils/analytics";

type Field = { id: string; label: string; type?: string; required?: boolean; placeholder?: string; pattern?: string };

const fieldsByType: Record<RegistrationType, Field[]> = {
  sole: [
    { id: "businessName", label: "Business Name", required: true, placeholder: "e.g., Sharma Traders" },
    { id: "ownerName", label: "Owner Full Name", required: true },
    { id: "pan", label: "PAN", required: true, pattern: "^[A-Z]{5}[0-9]{4}[A-Z]$" },
    { id: "address", label: "Business Address", required: true },
  ],
  company: [
    { id: "companyName", label: "Company Name", required: true },
    { id: "directors", label: "Directors (Comma-separated)", required: true },
    { id: "cinDraft", label: "Proposed CIN", required: true },
    { id: "registeredAddress", label: "Registered Address", required: true },
  ],
  partnership: [
    { id: "firmName", label: "Firm Name", required: true },
    { id: "partners", label: "Partners (Comma-separated)", required: true },
    { id: "deedDate", label: "Partnership Deed Date", type: "date", required: true },
  ],
  llp: [
    { id: "llpName", label: "LLP Name", required: true },
    { id: "designatedPartners", label: "Designated Partners (Comma-separated)", required: true },
    { id: "agreementDate", label: "LLP Agreement Date", type: "date", required: true },
  ],
};

const storageKey = (type: RegistrationType) => `startup_registration_${type}`;

export default function StartupRegistrationPage() {
  const [type, setType] = useState<RegistrationType>("sole");
  const estimate = useMemo(() => REGISTRATION_ESTIMATES[type], [type]);
  const timingServiceRef = useRef<TimingService>(new TimingService(estimate));
  const [snapshot, setSnapshot] = useState(timingServiceRef.current.getSnapshot());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [totalTimeTaken, setTotalTimeTaken] = useState<string>("");

  useEffect(() => {
    timingServiceRef.current = new TimingService(estimate);
    timingServiceRef.current.start();
    const firstStep = estimate.steps[0]?.id;
    if (firstStep) timingServiceRef.current.startStep(firstStep);
    const saved = sessionStorage.getItem(storageKey(type));
    setForm(saved ? JSON.parse(saved) : {});
    setCurrentStepIndex(0);
    setCompleted(false);
    setErrors({});
    trackEvent("registration_start", "startup", type);
  }, [estimate, type]);

  useEffect(() => {
    const id = setInterval(() => setSnapshot(timingServiceRef.current.getSnapshot()), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    sessionStorage.setItem(storageKey(type), JSON.stringify(form));
  }, [form, type]);

  const fields = fieldsByType[type];
  const currentStep = estimate.steps[currentStepIndex];

  const onFieldChange = (id: string, value: string) => {
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors: Record<string, string> = {};
    // Simple validation: all required fields present
    fields.forEach(f => {
      if (f.required && !form[f.id]) {
        stepErrors[f.id] = `${f.label} is required`;
      } else if (f.pattern && form[f.id] && !new RegExp(f.pattern).test(form[f.id])) {
        stepErrors[f.id] = `Invalid ${f.label}`;
      }
    });
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    timingServiceRef.current.endStep();
    const nextIndex = Math.min(currentStepIndex + 1, estimate.steps.length - 1);
    setCurrentStepIndex(nextIndex);
    const nextId = estimate.steps[nextIndex]?.id;
    if (nextId) {
      timingServiceRef.current.startStep(nextId);
      trackEvent("registration_step", "startup", `${type}:${nextId}`, Math.round(snapshot.stepElapsedMs));
    }
    if (nextIndex === estimate.steps.length - 1) {
      // Final step reached but not yet submitted
    }
  };

  const submit = () => {
    if (!validateCurrentStep()) return;
    const finalSnapshot = timingServiceRef.current.getSnapshot();
    const total = TimingService.formatMs(finalSnapshot.elapsedMs);
    setTotalTimeTaken(total);
    setCompleted(true);
    trackEvent("registration_complete", "startup", type, Math.round(finalSnapshot.elapsedMs));
  };

  const renderFeatureList = () => {
    const featureMaps: Record<RegistrationType, string[]> = {
      sole: ["Simple setup", "Low compliance", "Quick approval"],
      company: ["Limited liability", "Investor-ready", "Structured governance"],
      partnership: ["Shared responsibility", "Flexible terms", "Low cost"],
      llp: ["Limited liability", "Operational flexibility", "Separate legal entity"],
    };
    return (
      <ul className="space-y-2 text-sm text-gray-600">
        {featureMaps[type].map((feat) => (
          <li key={feat} className="flex items-center gap-2">
            <span aria-hidden="true">✓</span>
            <span>{feat}</span>
          </li>
        ))}
      </ul>
    );
  };



  if (completed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Registration Completed</CardTitle>
            <CardDescription>Total time taken</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-green-700" role="status">{totalTimeTaken}</p>
            <p className="text-sm text-gray-600 mt-2">We’ve recorded your timing to improve estimates for future users.</p>
            <Button className="mt-6" onClick={() => setCompleted(false)}>Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Startup Registration</CardTitle>
          <CardDescription>Select a registration type and complete the steps</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={type} onValueChange={(v) => setType(v as RegistrationType)} className="w-full">
            <TabsList role="tablist" aria-label="Registration types">
              <TabsTrigger value="sole">Sole Proprietorship</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="partnership">Partnership</TabsTrigger>
              <TabsTrigger value="llp">LLP</TabsTrigger>
            </TabsList>
            <TabsContent value={type} className="mt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-sm text-blue-700">Estimated completion</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {estimate.estimatedMinutes} minutes
                    </p>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Features & Benefits</h3>
                    {renderFeatureList()}
                  </div>

                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Required Information</h3>
                  <div className="space-y-4">
                    {fields.map((f) => (
                      <div key={f.id}>
                        <Label htmlFor={f.id}>{f.label}{f.required && <span aria-hidden="true" className="text-red-600"> *</span>}</Label>
                        <Input
                          id={f.id}
                          type={f.type || "text"}
                          value={form[f.id] || ""}
                          onChange={(e) => onFieldChange(f.id, e.target.value)}
                          aria-required={f.required ? "true" : "false"}
                          aria-invalid={errors[f.id] ? "true" : "false"}
                          aria-describedby={errors[f.id] ? `${f.id}-error` : undefined}
                          placeholder={f.placeholder}
                          className="mt-1"
                        />
                        {errors[f.id] && (
                          <p id={`${f.id}-error`} role="alert" className="text-sm text-red-600 mt-1">
                            {errors[f.id]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={nextStep} aria-label="Next step">Next</Button>
                    <Button onClick={submit} aria-label="Submit registration">Submit</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
