import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import EnhancedSEO from "@/components/EnhancedSEO";

const OFFICIAL_STEPS = [
  {
    icon: ShieldCheck,
    title: "Confirm e-verification",
    description: "Refund processing normally starts after the return is successfully e-verified.",
  },
  {
    icon: FileText,
    title: "Review processing status",
    description: "Open View Filed Returns and check whether CPC processing or intimation has been completed.",
  },
  {
    icon: Building2,
    title: "Check bank validation",
    description: "Make sure the refund bank account is pre-validated and linked with the same PAN.",
  },
  {
    icon: Banknote,
    title: "Track refund or re-issue",
    description: "Use Refund Status or Refund Re-issue Request on the e-filing portal if the refund failed.",
  },
];

const COMMON_ISSUES = [
  {
    icon: Building2,
    title: "Incorrect Bank Details",
    description: "Bank account or IFSC code mismatch",
    solution: "Update your bank details on the e-Filing portal under My Profile > My Bank Account.",
  },
  {
    icon: AlertTriangle,
    title: "PAN-Bank Account Mismatch",
    description: "Bank account is not pre-validated or does not match the return PAN",
    solution: "Pre-validate your bank account on the e-Filing portal for faster refunds.",
  },
  {
    icon: FileText,
    title: "Pending e-Verification",
    description: "ITR has not been verified after filing",
    solution: "Complete e-verification immediately using Aadhaar OTP, net banking, or another official method.",
  },
  {
    icon: XCircle,
    title: "Outstanding Demand",
    description: "Previous tax demands may be pending",
    solution: "Check Pending Actions, clear valid demands, or file a response where required.",
  },
];

const REFUND_DOCUMENTS = [
  "ITR acknowledgement number",
  "Latest e-verification status",
  "Bank account validation status",
  "Section 143(1) intimation, if issued",
];

export default function TDSRefundTrackerPage() {
  const [pan, setPan] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [validatedPan, setValidatedPan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const normalizedPan = pan.trim().toUpperCase();

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalizedPan)) {
      setError("Please enter a valid PAN in the format ABCDE1234F");
      setValidatedPan(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 350));

    setValidatedPan(normalizedPan);
    setIsSearching(false);
  };

  return (
    <>
      <EnhancedSEO
        title="TDS Refund Status Guide - Check Refund Readiness | MyeCA"
        description="Use MyeCA's refund guidance to validate PAN format, understand common refund delays, and verify final refund status on the official income tax e-filing portal."
        keywords={["tds refund status", "income tax refund", "check refund status", "refund tracker", "tds refund not received", "refund failure"]}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-4">
              <Banknote className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Refund guidance</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              TDS Refund Status Guide
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Check refund readiness, common failure reasons, and the official steps to verify your income tax refund status.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Prepare Refund Status Check
              </CardTitle>
              <CardDescription>
                Validate PAN format before opening the official refund status flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <Label className="sr-only">PAN Number</Label>
                  <Input
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="Enter PAN (e.g., ABCDE1234F)"
                    maxLength={10}
                    className="uppercase"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Show Official Steps
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {validatedPan && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      PAN Ready for Official Check
                    </CardTitle>
                    <Badge className="w-fit bg-blue-600">No live portal data shown</Badge>
                  </div>
                  <CardDescription>
                    Use this PAN on the official portal or your MyeCA filing dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500">Validated PAN</p>
                  <p className="font-semibold text-slate-900">{validatedPan}</p>
                  <Alert className="mt-4 border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      MyeCA does not display live refund amounts, bank accounts, or credited dates here. Final refund status must be confirmed from the official Income Tax e-filing portal.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-4 gap-4">
                {OFFICIAL_STEPS.map((step) => (
                  <Card key={step.title}>
                    <CardContent className="pt-6">
                      <step.icon className="h-7 w-7 text-blue-600" />
                      <h3 className="mt-3 font-semibold text-slate-900">{step.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Typical Refund Timeline</h4>
                      <ul className="mt-2 space-y-1 text-sm text-blue-800">
                        <li>- Refunds usually move after CPC processing and bank validation.</li>
                        <li>- Failed refunds normally require a Refund Re-issue Request.</li>
                        <li>- Delays can happen when AIS, TDS, bank, or demand records need review.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-orange-600" />
                Common Refund Issues and Fixes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {COMMON_ISSUES.map((issue) => (
                  <div
                    key={issue.title}
                    className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <issue.icon className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{issue.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{issue.description}</p>
                        <div className="mt-2 flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-green-700">{issue.solution}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Keep These Details Ready
              </CardTitle>
              <CardDescription>
                These records make refund checks and re-issue requests faster.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {REFUND_DOCUMENTS.map((document) => (
                  <div key={document} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{document}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                Request Refund Re-issue
              </CardTitle>
              <CardDescription>
                Use this flow if the portal shows that your refund failed or returned.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex-shrink-0">1</span>
                  <span>Login to the e-Filing portal.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex-shrink-0">2</span>
                  <span>Go to Services &gt; Refund Re-issue Request.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex-shrink-0">3</span>
                  <span>Select the failed refund and choose a pre-validated bank account.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex-shrink-0">4</span>
                  <span>Submit the request and track the updated status from the portal.</span>
                </li>
              </ol>
              <Button className="w-full mt-4" variant="outline" asChild>
                <a href="https://eportal.incometax.gov.in" target="_blank" rel="noopener noreferrer">
                  Open Official e-Filing Portal
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
