import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Handshake,
  Landmark,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { REGISTRATION_ESTIMATES, TimingService, RegistrationType } from "@/services/timing.service";
import { trackEvent } from "@/utils/analytics";

type StepId = (typeof REGISTRATION_ESTIMATES)[RegistrationType]["steps"][number]["id"];

type Field = {
  id: string;
  label: string;
  stepId: StepId;
  type?: string;
  input?: "input" | "textarea";
  required?: boolean;
  placeholder?: string;
  pattern?: string;
  helpText?: string;
  autoComplete?: string;
};

type RegistrationWizardConfig = {
  label: string;
  shortLabel: string;
  description: string;
  intent: string;
  icon: LucideIcon;
  benefits: string[];
  documentStepId: StepId;
  documents: string[];
  fields: Field[];
};

const storageKey = (type: RegistrationType) => `startup_registration_${type}`;

const wizardConfig: Record<RegistrationType, RegistrationWizardConfig> = {
  sole: {
    label: "Sole Proprietorship",
    shortLabel: "Sole",
    description: "A fast path for individual founders, consultants, and traders starting under their own ownership.",
    intent: "Best when one owner wants a simple setup with low recurring compliance.",
    icon: Landmark,
    benefits: ["Simple setup", "Low compliance", "Quick approval"],
    documentStepId: "documents",
    documents: ["Business PAN card", "Owner identity proof", "Address proof", "Bank account details"],
    fields: [
      {
        id: "businessName",
        label: "Business Name",
        stepId: "details",
        required: true,
        placeholder: "e.g., Sharma Traders",
        autoComplete: "organization",
      },
      {
        id: "ownerName",
        label: "Owner Full Name",
        stepId: "details",
        required: true,
        autoComplete: "name",
      },
      {
        id: "pan",
        label: "PAN",
        stepId: "details",
        required: true,
        pattern: "^[A-Z]{5}[0-9]{4}[A-Z]$",
        placeholder: "ABCDE1234F",
        helpText: "Use the 10-character Indian PAN format.",
      },
      {
        id: "address",
        label: "Business Address",
        stepId: "documents",
        input: "textarea",
        required: true,
        placeholder: "Full business address with city and PIN code",
        autoComplete: "street-address",
      },
    ],
  },
  company: {
    label: "Company",
    shortLabel: "Company",
    description: "A structured route for startups that need limited liability, investor readiness, and MCA records.",
    intent: "Best for teams preparing for funding, formal governance, and scalable ownership.",
    icon: Building2,
    benefits: ["Limited liability", "Investor-ready", "Structured governance"],
    documentStepId: "documents",
    documents: ["Director PAN and Aadhaar", "Registered office proof", "DSC details", "MOA/AOA inputs"],
    fields: [
      {
        id: "companyName",
        label: "Proposed Company Name",
        stepId: "promoters",
        required: true,
        placeholder: "e.g., BrightPath Technologies Private Limited",
        autoComplete: "organization",
      },
      {
        id: "directors",
        label: "Directors / Promoters",
        stepId: "promoters",
        required: true,
        placeholder: "Comma-separated names",
      },
      {
        id: "cinDraft",
        label: "MCA Name Approval or CIN Reference",
        stepId: "capital",
        required: true,
        placeholder: "Name approval reference, draft CIN, or application note",
        helpText: "If incorporation is not started, write the proposed MCA filing reference.",
      },
      {
        id: "registeredAddress",
        label: "Registered Address",
        stepId: "documents",
        input: "textarea",
        required: true,
        placeholder: "Registered office address with city and PIN code",
        autoComplete: "street-address",
      },
    ],
  },
  partnership: {
    label: "Partnership",
    shortLabel: "Partnership",
    description: "A practical option for co-founders who want flexible terms before a heavier company structure.",
    intent: "Best for teams that want a formal deed with lower setup overhead.",
    icon: Handshake,
    benefits: ["Shared responsibility", "Flexible terms", "Low cost"],
    documentStepId: "documents",
    documents: ["Partner PAN cards", "Partnership deed", "Business address proof", "Bank account details"],
    fields: [
      {
        id: "firmName",
        label: "Firm Name",
        stepId: "partners",
        required: true,
        autoComplete: "organization",
      },
      {
        id: "partners",
        label: "Partners",
        stepId: "partners",
        required: true,
        placeholder: "Comma-separated names",
      },
      {
        id: "deedDate",
        label: "Partnership Deed Date",
        stepId: "partners",
        type: "date",
        required: true,
      },
    ],
  },
  llp: {
    label: "LLP",
    shortLabel: "LLP",
    description: "A flexible structure for professional or service teams that still need limited liability.",
    intent: "Best for founders who want partnership flexibility with a separate legal identity.",
    icon: Users,
    benefits: ["Limited liability", "Operational flexibility", "Separate legal entity"],
    documentStepId: "documents",
    documents: ["Partner PAN and Aadhaar", "LLP agreement", "Registered office proof", "DSC details"],
    fields: [
      {
        id: "llpName",
        label: "LLP Name",
        stepId: "designated",
        required: true,
        autoComplete: "organization",
      },
      {
        id: "designatedPartners",
        label: "Designated Partners",
        stepId: "designated",
        required: true,
        placeholder: "Comma-separated names",
      },
      {
        id: "agreementDate",
        label: "LLP Agreement Date",
        stepId: "agreement",
        type: "date",
        required: true,
      },
    ],
  },
};

function parseSavedDraft(value: string | null): Record<string, string> {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, string>
      : {};
  } catch {
    return {};
  }
}

function fieldValueSummary(value: string | undefined) {
  return value?.trim() ? value.trim() : "Not provided";
}

export default function StartupRegistrationPage() {
  const [type, setType] = useState<RegistrationType>("sole");
  const estimate = useMemo(() => REGISTRATION_ESTIMATES[type], [type]);
  const config = wizardConfig[type];
  const Icon = config.icon;
  const timingServiceRef = useRef<TimingService>(new TimingService(REGISTRATION_ESTIMATES.sole));
  const [snapshot, setSnapshot] = useState(timingServiceRef.current.getSnapshot());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [totalTimeTaken, setTotalTimeTaken] = useState("");

  const currentStep = estimate.steps[currentStepIndex];
  const currentFields = config.fields.filter((field) => field.stepId === currentStep.id);
  const isDocumentStep = currentStep.id === config.documentStepId;
  const isLastStep = currentStepIndex === estimate.steps.length - 1;
  const progress = Math.round(((currentStepIndex + 1) / estimate.steps.length) * 100);

  useEffect(() => {
    timingServiceRef.current = new TimingService(estimate);
    timingServiceRef.current.start();

    const firstStep = estimate.steps[0]?.id;
    if (firstStep) {
      timingServiceRef.current.startStep(firstStep);
    }

    const key = storageKey(type);
    setLoadedStorageKey(key);
    setForm(parseSavedDraft(sessionStorage.getItem(key)));
    setCurrentStepIndex(0);
    setCompleted(false);
    setTotalTimeTaken("");
    setErrors({});
    setSnapshot(timingServiceRef.current.getSnapshot());
    trackEvent("registration_start", "startup", type);
  }, [estimate, type]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSnapshot(timingServiceRef.current.getSnapshot());
    }, 500);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (completed) {
      window.scrollTo({ left: 0, top: 0 });
    }
  }, [completed]);

  useEffect(() => {
    const key = storageKey(type);
    if (loadedStorageKey === key) {
      sessionStorage.setItem(key, JSON.stringify(form));
    }
  }, [form, loadedStorageKey, type]);

  const onFieldChange = (id: string, value: string) => {
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const validateFields = (fields: Field[]): boolean => {
    const stepErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = form[field.id]?.trim() || "";

      if (field.required && !value) {
        stepErrors[field.id] = `${field.label} is required`;
      } else if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
        stepErrors[field.id] = `Invalid ${field.label}`;
      }
    });

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const startStepAtIndex = (stepIndex: number) => {
    const step = estimate.steps[stepIndex];
    if (step) {
      timingServiceRef.current.startStep(step.id);
    }
  };

  const nextStep = () => {
    if (!validateFields(currentFields)) return;

    const stepSnapshot = timingServiceRef.current.getSnapshot();
    timingServiceRef.current.endStep();
    const nextIndex = Math.min(currentStepIndex + 1, estimate.steps.length - 1);
    setCurrentStepIndex(nextIndex);
    startStepAtIndex(nextIndex);
    trackEvent("registration_step", "startup", `${type}:${estimate.steps[nextIndex]?.id}`, Math.round(stepSnapshot.stepElapsedMs));
  };

  const previousStep = () => {
    const previousIndex = Math.max(currentStepIndex - 1, 0);
    if (previousIndex === currentStepIndex) return;

    timingServiceRef.current.endStep();
    setErrors({});
    setCurrentStepIndex(previousIndex);
    startStepAtIndex(previousIndex);
  };

  const submit = () => {
    if (!validateFields(currentFields)) return;

    timingServiceRef.current.endStep();
    const finalSnapshot = timingServiceRef.current.getSnapshot();
    const total = TimingService.formatMs(finalSnapshot.elapsedMs);
    setTotalTimeTaken(total);
    setCompleted(true);
    trackEvent("registration_complete", "startup", type, Math.round(finalSnapshot.elapsedMs));
  };

  const startOver = () => {
    const key = storageKey(type);
    sessionStorage.removeItem(key);
    setForm({});
    setErrors({});
    setCompleted(false);
    setCurrentStepIndex(0);
    timingServiceRef.current = new TimingService(estimate);
    timingServiceRef.current.start();
    startStepAtIndex(0);
    setSnapshot(timingServiceRef.current.getSnapshot());
  };

  const renderField = (field: Field) => {
    const sharedProps = {
      id: field.id,
      value: form[field.id] || "",
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onFieldChange(field.id, event.target.value),
      "aria-label": field.label,
      "aria-required": Boolean(field.required),
      "aria-invalid": Boolean(errors[field.id]),
      "aria-describedby": errors[field.id]
        ? `${field.id}-error`
        : field.helpText
          ? `${field.id}-help`
          : undefined,
      placeholder: field.placeholder,
      autoComplete: field.autoComplete,
      className: "mt-2",
    };

    return (
      <div key={field.id}>
        <Label htmlFor={field.id} className="text-sm font-semibold text-slate-800">
          {field.label}
          {field.required && <span aria-hidden="true" className="text-red-600"> *</span>}
        </Label>
        {field.input === "textarea" ? (
          <Textarea {...sharedProps} rows={4} />
        ) : (
          <Input {...sharedProps} type={field.type || "text"} />
        )}
        {field.helpText && !errors[field.id] && (
          <p id={`${field.id}-help`} className="mt-1 text-xs text-slate-500">
            {field.helpText}
          </p>
        )}
        {errors[field.id] && (
          <p id={`${field.id}-error`} role="alert" className="mt-1 text-sm font-medium text-red-600">
            {errors[field.id]}
          </p>
        )}
      </div>
    );
  };

  if (completed) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <section className="mx-auto max-w-3xl rounded-lg border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                Frontend draft recorded
              </Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-normal text-slate-950">
                Registration Completed
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your {config.label} wizard timing has been recorded locally to improve future estimates.
              </p>
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-slate-500">Selected entity</dt>
                  <dd className="mt-1 text-lg font-bold text-slate-950">{config.label}</dd>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-slate-500">Total time taken</dt>
                  <dd className="mt-1 text-lg font-bold text-emerald-700" role="status">
                    {totalTimeTaken}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => setCompleted(false)} aria-label="Edit registration">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Edit registration
                </Button>
                <Button variant="outline" onClick={startOver} aria-label="Start over">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Start over
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50">
                Startup registration
              </Badge>
              <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                Startup Registration Desk
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Choose an entity, complete the guided steps, and review the details before submitting the local registration draft.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Estimate</p>
                <p className="text-xl font-bold text-slate-950">{estimate.estimatedMinutes} minutes</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Saved draft</p>
                <p className="text-xl font-bold text-slate-950">{Object.keys(form).length || 0} fields</p>
              </div>
            </div>
          </div>

          <Tabs value={type} onValueChange={(value) => setType(value as RegistrationType)} className="w-full">
            <TabsList
              role="tablist"
              aria-label="Registration types"
              className="!grid h-auto w-full grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1 sm:!flex sm:justify-start"
            >
              {(Object.keys(wizardConfig) as RegistrationType[]).map((registrationType) => {
                const entity = wizardConfig[registrationType];
                const EntityIcon = entity.icon;

                return (
                  <TabsTrigger
                    key={registrationType}
                    value={registrationType}
                    className="min-h-11 w-full gap-2 rounded-md px-3 text-sm data-[state=active]:bg-white data-[state=active]:text-blue-700 sm:w-auto sm:px-4"
                  >
                    <EntityIcon className="h-4 w-4" aria-hidden="true" />
                    {entity.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-28 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8 lg:py-6">
        <div className="min-w-0 space-y-6">
          <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-700">{config.shortLabel} setup</p>
                <h2 className="text-2xl font-bold tracking-normal text-slate-950">{config.label}</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{config.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="w-fit border-slate-300 bg-white text-slate-700">
              <Timer className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              {TimingService.formatMs(snapshot.remainingMs)} left
            </Badge>
          </div>

          <div className="grid gap-6 xl:grid-cols-[15rem_minmax(0,1fr)]">
            <nav aria-label="Registration progress" className="space-y-3">
              {estimate.steps.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isComplete = index < currentStepIndex;

                return (
                  <div
                    key={step.id}
                    className={`rounded-lg border p-3 ${
                      isActive
                        ? "border-blue-200 bg-blue-50"
                        : isComplete
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          isComplete
                            ? "bg-emerald-600 text-white"
                            : isActive
                              ? "bg-blue-600 text-white"
                              : "bg-white text-slate-500"
                        }`}
                      >
                        {isComplete ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-950">{step.label}</p>
                        <p className="text-xs text-slate-500">{step.estimatedMinutes} min step</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="min-w-0">
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-700">
                    Step {currentStepIndex + 1} of {estimate.steps.length}
                  </span>
                  <span className="text-slate-500">{progress}% ready</span>
                </div>
                <Progress value={progress} aria-label="Registration progress" className="h-2 bg-slate-100" />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-blue-700">Active step</p>
                    <h3 className="mt-1 text-2xl font-bold tracking-normal text-slate-950">{currentStep.label}</h3>
                  </div>
                  <Badge className="w-fit border-blue-200 bg-white text-blue-700 hover:bg-white">
                    {currentStep.estimatedMinutes} min estimate
                  </Badge>
                </div>

                {currentStep.id === "review" ? (
                  <div className="mt-5 space-y-5">
                    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      <AlertDescription>
                        Review the saved details. Submit only records this frontend draft and timing.
                      </AlertDescription>
                    </Alert>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {config.fields.map((field) => (
                        <div key={field.id} className="rounded-lg border border-slate-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase text-slate-500">{field.label}</p>
                          <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                            {fieldValueSummary(form[field.id])}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {isDocumentStep && (
                      <Alert className="border-blue-200 bg-white text-slate-800">
                        <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                        <AlertDescription>
                          Keep these records ready before the expert review step: {config.documents.join(", ")}.
                        </AlertDescription>
                      </Alert>
                    )}

                    {currentFields.length > 0 ? (
                      <div className="grid gap-4">{currentFields.map(renderField)}</div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-600">
                        No extra inputs are needed here. Confirm the checklist and continue to review.
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={previousStep}
                    aria-label="Previous step"
                    disabled={currentStepIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back
                  </Button>
                  {isLastStep ? (
                    <Button onClick={submit} aria-label="Submit registration">
                      Submit
                      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  ) : (
                    <Button onClick={nextStep} aria-label="Next step">
                      Next
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Registration guidance">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Timer className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950">Live estimate</p>
                <p className="text-xs text-slate-500">{estimate.estimatedMinutes} minutes total for {config.shortLabel}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Elapsed</p>
                <p className="mt-1 text-base font-bold text-slate-950">{TimingService.formatMs(snapshot.elapsedMs)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Remaining</p>
                <p className="mt-1 text-base font-bold text-blue-700">{TimingService.formatMs(snapshot.remainingMs)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950">Best fit</p>
                <p className="text-xs text-slate-500">{config.intent}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase text-slate-500">Benefits</h3>
            <ul className="mt-4 space-y-3">
              {config.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase text-slate-500">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Document readiness
            </h3>
            <ul className="mt-4 space-y-3">
              {config.documents.map((document) => (
                <li key={document} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {document}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
