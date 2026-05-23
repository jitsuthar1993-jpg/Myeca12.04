import { m } from "framer-motion";
import { useState, type FormEvent } from "react";
import { BadgeCheck, Clock, FileText, Mail, MessageSquare, Phone, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Breadcrumb from "@/components/Breadcrumb";
import MetaSEO from "@/components/seo/MetaSEO";
import { getSEOConfig } from "@/config/seo.config";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const seo = getSEOConfig("/contact");
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialForm, string>>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatusMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof typeof initialForm, string>> = {};
    if (!formData.name.trim()) nextErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!formData.subject.trim()) nextErrors.subject = "Subject is required.";
    if (formData.message.trim().length < 10) nextErrors.message = "Message must be at least 10 characters.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatusMessage({ type: "error", text: "Please complete the required fields before sending." });
      toast({
        title: "Complete the required fields",
        description: "Name, email, subject, and message are needed so the team can respond.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("/api/consultation-requests", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          service: formData.subject.trim(),
          preferredTime: "Business hours",
          message: formData.message.trim(),
          source: "contact_page",
        }),
      });
      toast({
        title: "Message sent",
        description: "We will review your request during Mon-Sat business hours.",
      });
      setStatusMessage({ type: "success", text: "Message received. We will review your request during Mon-Sat business hours." });
      setFormData(initialForm);
    } catch {
      toast({
        title: "Could not send message",
        description: "Please try again or email support@myeca.in.",
        variant: "destructive",
      });
      setStatusMessage({ type: "error", text: "Message failed. Please try again or email support@myeca.in." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MetaSEO
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        type={seo?.type}
        breadcrumbs={seo?.breadcrumbs}
      />
      <div className="min-h-screen bg-white">
        <Breadcrumb items={[{ name: "Contact Us" }]} />

        <section className="border-b border-slate-200 bg-slate-50 py-14 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="type-meta mx-auto mb-4 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 py-1 font-normal uppercase text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Scope-first support
            </div>
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="type-hero-title mb-5 font-normal text-slate-950"
            >
              Contact MyeCA support and tax experts.
            </m.h1>
            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto max-w-2xl text-base leading-7 text-slate-600 sm:text-lg"
            >
              Share the situation, not sensitive documents. We review requests during business hours, confirm the scope, and then guide you to the right filing or consultation path.
            </m.p>
            <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
              {[
                { icon: BadgeCheck, label: "Scope before quote" },
                { icon: FileText, label: "Document checklist after review" },
                { icon: ShieldCheck, label: "No payment on this page" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <Icon className="h-4 w-4 shrink-0 text-blue-600" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="mb-4 text-2xl font-normal text-slate-950">Contact information</h2>
                <div className="grid gap-4">
                  <Card className="rounded-lg border-slate-200 shadow-none">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-normal text-slate-950">Callback support</h3>
                        <p className="mb-1 text-sm text-slate-600">Requests are reviewed Mon-Sat during business hours.</p>
                        <p className="text-sm text-slate-500">Use the form so tax, GST, notice, and business cases reach the right queue.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-lg border-slate-200 shadow-none">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                        <Mail className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-normal text-slate-950">Email support</h3>
                        <p className="mb-1 text-sm text-slate-700">support@myeca.in</p>
                        <p className="text-sm text-slate-500">Best for account access, payment receipts, and follow-up context.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-lg border-slate-200 shadow-none">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                        <Clock className="h-5 w-5 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-normal text-slate-950">Case timelines</h3>
                        <p className="text-sm text-slate-600">Complex CA reviews depend on scope, deadlines, and document readiness.</p>
                        <p className="mt-1 text-sm text-slate-500">We confirm next steps before asking you to move sensitive records.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-normal text-slate-950">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Before you send
                </h3>
                <div className="space-y-4">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-normal text-slate-800">
                      Should I paste PAN, passwords, or tax documents here?
                      <span className="transition group-open:rotate-180">v</span>
                    </summary>
                    <p className="mt-2 border-l-2 border-blue-200 pl-4 text-sm leading-6 text-slate-600">
                      No. Use this form for a summary only. The team will tell you what to share after the case scope is clear.
                    </p>
                  </details>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-normal text-slate-800">
                      What happens after I submit?
                      <span className="transition group-open:rotate-180">v</span>
                    </summary>
                    <p className="mt-2 border-l-2 border-blue-200 pl-4 text-sm leading-6 text-slate-600">
                      We route the request, identify whether it needs ITR, GST, notice, or business-tax support, and share the next step or document checklist.
                    </p>
                  </details>
                </div>
                <a href="/trust" className="mt-5 inline-flex items-center gap-2 text-sm font-normal text-blue-700 hover:text-blue-800">
                  Review trust and document handling
                  <ShieldCheck className="h-4 w-4" />
                </a>
              </div>
            </m.div>

            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full rounded-lg border-slate-200 shadow-lg shadow-slate-950/5">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-normal text-slate-950">Send a scoped request</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">A short summary is enough. We will ask for documents only after the right service path is clear.</p>
                  </div>
                  {statusMessage && (
                    <div
                      className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                        statusMessage.type === "success"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                      role="status"
                    >
                      {statusMessage.text}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input id="name" value={formData.name} onChange={(event) => handleInputChange("name", event.target.value)} placeholder="Your name" aria-invalid={Boolean(errors.name)} />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Mobile number</Label>
                        <Input id="phone" value={formData.phone} onChange={(event) => handleInputChange("phone", event.target.value)} placeholder="Mobile number" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(event) => handleInputChange("email", event.target.value)} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" value={formData.subject} onChange={(event) => handleInputChange("subject", event.target.value)} placeholder="ITR filing, GST, notice, business tax..." aria-invalid={Boolean(errors.subject)} />
                      {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" value={formData.message} onChange={(event) => handleInputChange("message", event.target.value)} placeholder="Tell us the filing year, deadline, service type, and what is unclear. Do not paste passwords or full document data here." className="min-h-[150px]" aria-invalid={Boolean(errors.message)} />
                      {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-blue-600 py-6 text-base font-normal hover:bg-blue-700">
                      <Send className="mr-2 h-5 w-5" />
                      {isSubmitting ? "Sending..." : "Send Request"}
                    </Button>
                    <p className="text-center text-xs leading-5 text-slate-500">
                      No payment is collected here. We review the request before quoting or asking for documents.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </m.div>
          </div>
        </div>
      </div>
    </>
  );
}
