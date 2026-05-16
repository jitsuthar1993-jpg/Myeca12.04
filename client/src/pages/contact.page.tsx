import { m } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Clock, Mail, MessageSquare, Phone, Send } from "lucide-react";
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

        <section className="border-b bg-white py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl"
            >
              Get in Touch
            </m.h1>
            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600"
            >
              Share your tax filing or business service question. Our team reviews requests during business hours.
            </m.p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Contact Information</h2>
                <div className="grid gap-6">
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <Phone className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900">Callback Support</h3>
                        <p className="mb-1 text-gray-600">Available Mon-Sat, 9 AM - 7 PM</p>
                        <p className="text-sm text-gray-500">Use the callback form for structured routing.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <Mail className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900">Email Us</h3>
                        <p className="mb-1 text-gray-600">support@myeca.in</p>
                        <p className="text-sm text-gray-500">Reviewed during business hours.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100">
                        <Clock className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900">Response Time</h3>
                        <p className="text-gray-600">Email queries are reviewed during business hours.</p>
                        <p className="mt-1 text-sm text-gray-500">Complex CA reviews depend on case scope and document readiness.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-8">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Common Questions
                </h3>
                <div className="space-y-4">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-700">
                      How long does ITR filing take?
                      <span className="transition group-open:rotate-180">v</span>
                    </summary>
                    <p className="mt-2 border-l-2 border-blue-200 pl-4 text-sm text-gray-600">
                      Assisted filing timelines depend on case complexity and document readiness. Simple cases move faster when all required documents are complete.
                    </p>
                  </details>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-700">
                      Do you support notice handling?
                      <span className="transition group-open:rotate-180">v</span>
                    </summary>
                    <p className="mt-2 border-l-2 border-blue-200 pl-4 text-sm text-gray-600">
                      Yes. Notice support starts with reviewing the notice, deadline, documents, and response scope before any paid work starts.
                    </p>
                  </details>
                </div>
              </div>
            </m.div>

            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-t-4 border-t-blue-600 shadow-lg">
                <CardContent className="p-8">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Send us a Message</h2>
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
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={formData.name} onChange={(event) => handleInputChange("name", event.target.value)} placeholder="Your name" aria-invalid={Boolean(errors.name)} />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" value={formData.phone} onChange={(event) => handleInputChange("phone", event.target.value)} placeholder="Mobile number" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(event) => handleInputChange("email", event.target.value)} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" value={formData.subject} onChange={(event) => handleInputChange("subject", event.target.value)} placeholder="Regarding ITR filing..." aria-invalid={Boolean(errors.subject)} />
                      {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" value={formData.message} onChange={(event) => handleInputChange("message", event.target.value)} placeholder="Tell us how we can help you..." className="min-h-[150px]" aria-invalid={Boolean(errors.message)} />
                      {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700">
                      <Send className="mr-2 h-5 w-5" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
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
