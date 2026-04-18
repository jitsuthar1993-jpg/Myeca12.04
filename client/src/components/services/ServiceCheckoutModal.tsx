import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useLocation } from "wouter";

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
      setLocation("/auth/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId,
          serviceTitle,
          serviceCategory: category,
          paymentAmount: priceAmount,
          paymentStatus: "paid", // Instantly activate for now based on rules
          status: "active",
          metadata: requirementData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to activate service");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setLocation("/admin/dashboard");
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Activated!</h2>
            <p className="text-slate-500 mb-6 max-w-[280px]">
              You have successfully subscribed to {serviceTitle}. Redirecting you to your dashboard...
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Activate Service</DialogTitle>
              <DialogDescription>
                Complete the details below to start your <span className="font-semibold text-slate-900">{serviceTitle}</span> subscription.
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
                  <span className="text-slate-500">Service Fee</span>
                  <span className="font-medium text-slate-900">₹{priceAmount}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-4 pb-4 border-b border-slate-200">
                  <span className="text-slate-500">GST (18%)</span>
                  <span className="font-medium text-slate-900">₹{Math.round(priceAmount * 0.18)}</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900">Total Payable</span>
                  <span className="text-indigo-600 text-lg">₹{(priceAmount * 1.18).toFixed(2)}</span>
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
                      {isAuthenticated ? `Pay ₹${(priceAmount * 1.18).toFixed(2)} & Activate` : "Login to Activate"}
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
