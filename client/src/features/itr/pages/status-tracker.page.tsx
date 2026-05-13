import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle,
  CreditCard,
  ExternalLink,
  FileText,
  Info,
  Mail,
  RefreshCw,
  Search,
  Shield,
  Smartphone,
} from "lucide-react";
import EnhancedSEO from "@/components/EnhancedSEO";

interface ValidatedLookup {
  pan: string;
  acknowledgementNo?: string;
}

const STATUS_STEPS = [
  {
    id: "login",
    label: "Open e-Filing portal",
    icon: Shield,
    description: "Sign in to the official Income Tax e-Filing portal.",
  },
  {
    id: "filed",
    label: "View filed returns",
    icon: FileText,
    description: "Use e-File > Income Tax Returns > View Filed Returns.",
  },
  {
    id: "verified",
    label: "Check e-verification",
    icon: CheckCircle,
    description: "Confirm that ITR-V or electronic verification is completed.",
  },
  {
    id: "processed",
    label: "Review intimation or refund",
    icon: CreditCard,
    description: "Check processing, demand, refund, and bank validation status.",
  },
];

const VERIFICATION_METHODS = [
  {
    icon: Smartphone,
    title: "Aadhaar OTP",
    desc: "Instant verification using Aadhaar-linked mobile",
    recommended: true,
  },
  {
    icon: Building2,
    title: "Net Banking",
    desc: "Login through your bank's net banking",
  },
  {
    icon: CreditCard,
    title: "Demat Account",
    desc: "Use CDSL/NSDL demat account verification",
  },
  {
    icon: Mail,
    title: "Send ITR-V to CPC",
    desc: "Send the signed physical copy to CPC Bengaluru",
  },
];

const OFFICIAL_DOCUMENTS = [
  {
    title: "ITR acknowledgement",
    description: "Use View Filed Returns to download ITR-V after submission.",
  },
  {
    title: "Intimation order",
    description: "Download section 143(1) intimation after CPC processing, if issued.",
  },
  {
    title: "Refund status",
    description: "Confirm bank validation and refund status from the portal dashboard.",
  },
  {
    title: "Computation copy",
    description: "Keep your MyeCA or filed-return computation with supporting documents.",
  },
];

export default function ITRStatusTrackerPage() {
  const [pan, setPan] = useState("");
  const [ackNumber, setAckNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [validatedLookup, setValidatedLookup] = useState<ValidatedLookup | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const normalizedPan = pan.trim().toUpperCase();
    const normalizedAck = ackNumber.trim();

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalizedPan)) {
      setError("Please enter a valid PAN in the format ABCDE1234F");
      setValidatedLookup(null);
      return;
    }

    if (normalizedAck && !/^[0-9]{15}$/.test(normalizedAck)) {
      setError("Acknowledgement number must be a 15-digit number");
      setValidatedLookup(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 350));

    setValidatedLookup({
      pan: normalizedPan,
      acknowledgementNo: normalizedAck || undefined,
    });

    setIsSearching(false);
  };

  return (
    <>
      <EnhancedSEO
        title="ITR Filing Status Guide - Check Your Return Safely | MyeCA"
        description="Learn how to verify Income Tax Return filing, e-verification, processing, and refund status using the official income tax e-filing portal and your MyeCA dashboard."
        keywords={["itr status", "income tax return status", "check itr status", "itr processing status", "tax refund status", "e-verification status"]}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-4">
              <Search className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Official portal reference
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              ITR Filing Status Guide
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Validate your details and follow the official steps to check ITR filing, e-verification, and refund status
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Prepare Your Status Check
              </CardTitle>
              <CardDescription>
                Validate your PAN and acknowledgement number before checking the official e-filing portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>PAN Number *</Label>
                  <Input
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Acknowledgement Number (Optional)</Label>
                  <Input
                    value={ackNumber}
                    onChange={(e) => setAckNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="15-digit number"
                    maxLength={15}
                    inputMode="numeric"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSearch}
                className="w-full mt-4"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Preparing Steps...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Show Official Steps
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {validatedLookup && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Details Ready for Official Check
                    </CardTitle>
                    <Badge className="w-fit bg-blue-600">Not connected to portal</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">PAN</p>
                      <p className="font-semibold">{validatedLookup.pan}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Acknowledgement Number</p>
                      <p className="font-semibold">
                        {validatedLookup.acknowledgementNo || "Use portal login if unavailable"}
                      </p>
                    </div>
                  </div>
                  <Alert className="mt-4 border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      MyeCA does not display live Income Tax Department status on this page. Use these validated details on the official e-filing portal or your MyeCA filing dashboard.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Official Status Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {STATUS_STEPS.map((step, index) => {
                      const Icon = step.icon;

                      return (
                        <div key={step.id} className="flex items-start mb-8 last:mb-0">
                          {index < STATUS_STEPS.length - 1 && (
                            <div className="absolute left-5 mt-10 w-0.5 h-16 bg-gray-200" style={{ marginLeft: "-1px" }} />
                          )}

                          <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="ml-4 flex-1">
                            <h4 className="font-semibold text-gray-900">{step.label}</h4>
                            <p className="text-sm text-gray-500">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    e-Verification Methods
                  </CardTitle>
                  <CardDescription>Choose one of the official verification methods inside the e-filing portal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {VERIFICATION_METHODS.map((method) => (
                      <div
                        key={method.title}
                        className={`p-4 border rounded-lg ${
                          method.recommended ? "border-green-300 bg-green-50" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${method.recommended ? "bg-green-100" : "bg-gray-100"}`}>
                            <method.icon className={`h-5 w-5 ${method.recommended ? "text-green-600" : "text-gray-600"}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{method.title}</h4>
                              {method.recommended && (
                                <Badge className="bg-green-500 text-xs">Recommended</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{method.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" asChild>
                    <a href="https://eportal.incometax.gov.in" target="_blank" rel="noopener noreferrer">
                      Open Official e-Filing Portal
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Documents to Download From the Portal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                    {OFFICIAL_DOCUMENTS.map((document) => (
                      <div key={document.title} className="rounded-lg border border-gray-200 p-4">
                        <p className="font-medium text-gray-900">{document.title}</p>
                        <p className="mt-1 text-gray-600">{document.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Typical Processing Timeline</h4>
                      <ul className="mt-2 space-y-1 text-sm text-blue-800">
                        <li>- ITR-1 and ITR-4: often 15-45 days after e-verification</li>
                        <li>- ITR-2 and ITR-3: often 30-60 days after e-verification</li>
                        <li>- Refunds depend on processing, bank validation, and mismatch resolution</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!validatedLookup && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Where to find Acknowledgement Number?</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Downloaded ITR-V PDF after filing
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        Email confirmation from Income Tax Department
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        e-Filing portal under View Filed Returns
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Need Help?</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Call Income Tax Helpline: <strong>1800-103-0025</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Email: ask@incometax.gov.in</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>CPC Helpline: 1800-4250-0025</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
