import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useLocation } from "wouter";
import { formatINR } from "@/data/pricing";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateWorkspaceCaseCaches } from "@/lib/workspace-cache";

interface ServiceCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceTitle: string;
  category: string;
  priceAmount: number;
}

export function ServiceCheckoutModal({
  isOpen,
  onClose,
  serviceId,
  serviceTitle,
  category,
  priceAmount
}: ServiceCheckoutModalProps) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Requirements fields for a generic service
  const [requirementData, setRequirementData] = useState({
    businessName: "",
    contactNumber: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setLocation("/auth/login?next=" + encodeURIComponent(window.location.pathname));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest("/api/user-services", {
        method: "POST",
        body: JSON.stringify({
          serviceId,
          serviceTitle,
          serviceCategory: category,
          paymentAmount: priceAmount,
          metadata: {
            ...requirementData,
            source: "service_checkout",
            formId: "service-checkout-modal",
            serviceIntent: serviceId,
            requestedAt: new Date().toISOString(),
            requestDescription: `Service checkout request for ${serviceTitle}`,
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create service request");
      }

      setSuccess(true);
      await invalidateWorkspaceCaseCaches(queryClient, data?.id);
      setTimeout(() => {
        onClose();
        setLocation(data.id ? `/dashboard/services/${data.id}` : "/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Request Created</h2>
            <p className="text-slate-500 mb-6 max-w-[280px]">
              Your {serviceTitle} workspace is ready. Redirecting you to the case page...
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Start Service Request</DialogTitle>
              <DialogDescription>
                Complete the details below to create your <span className="font-semibold text-slate-900">{serviceTitle}</span> case. Payment is handled from the case workspace once the team confirms the scope.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start gap-2 text-sm mt-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business / Individual Name</Label>
                <Input
                  id="businessName"
                  required
                  placeholder="Enter name"
                  value={requirementData.businessName}
                  onChange={(e) => setRequirementData({ ...requirementData, businessName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  required
                  placeholder="Enter phone number"
                  value={requirementData.contactNumber}
                  onChange={(e) => setRequirementData({ ...requirementData, contactNumber: e.target.value })}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mt-4">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-slate-500">Estimated Service Fee</span>
                  <span className="font-medium text-slate-900">{formatINR(priceAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-4 pb-4 border-b border-slate-200">
                  <span className="text-slate-500">GST (18%)</span>
                  <span className="font-medium text-slate-900">{formatINR(Math.round(priceAmount * 0.18))}</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900">Estimated Total</span>
                  <span className="text-indigo-600 text-lg">{formatINR(Math.round(priceAmount * 1.18))}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {isAuthenticated ? "Create Service Request" : "Login to Continue"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
