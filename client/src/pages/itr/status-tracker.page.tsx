import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Search, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  RefreshCw,
  ExternalLink,
  Shield,
  Calendar,
  ArrowRight,
  Info,
  Mail,
  Smartphone,
  Building2,
  CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import EnhancedSEO from "@/components/EnhancedSEO";

interface ITRStatus {
  pan: string;
  assessmentYear: string;
  itrType: string;
  filingDate: string;
  acknowledgementNo: string;
  status: 'filed' | 'verified' | 'processed' | 'refund_initiated' | 'refund_paid' | 'demand_raised';
  verificationStatus: 'pending' | 'completed';
  verificationMethod?: string;
  processingDate?: string;
  refundStatus?: {
    amount: number;
    status: 'initiated' | 'in_transit' | 'credited';
    bankAccount?: string;
    expectedDate?: string;
  };
}

// Mock data for demonstration
const mockStatus: ITRStatus = {
  pan: "ABCDE1234F",
  assessmentYear: "2025-26",
  itrType: "ITR-1",
  filingDate: "2024-07-15",
  acknowledgementNo: "123456789012345",
  status: 'verified',
  verificationStatus: 'completed',
  verificationMethod: 'Aadhaar OTP',
  processingDate: undefined,
  refundStatus: undefined,
};

const STATUS_STEPS = [
  { id: 'filed', label: 'ITR Filed', icon: FileText, description: 'Return successfully submitted' },
  { id: 'verified', label: 'e-Verified', icon: Shield, description: 'Identity verified successfully' },
  { id: 'processed', label: 'Processed', icon: CheckCircle, description: 'Return processed by CPC' },
  { id: 'refund_initiated', label: 'Refund Initiated', icon: CreditCard, description: 'Refund sent to bank' },
];

const getStatusIndex = (status: ITRStatus['status']) => {
  const statusMap: Record<string, number> = {
    'filed': 0,
    'verified': 1,
    'processed': 2,
    'refund_initiated': 3,
    'refund_paid': 3,
    'demand_raised': 2,
  };
  return statusMap[status] ?? 0;
};

export default function ITRStatusTrackerPage() {
  const [pan, setPan] = useState("");
  const [ackNumber, setAckNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState<ITRStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!pan || pan.length !== 10) {
      setError("Please enter a valid 10-character PAN");
      return;
    }

    setIsSearching(true);
    setError(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo, show mock status
    setStatus({
      ...mockStatus,
      pan: pan.toUpperCase(),
      acknowledgementNo: ackNumber || mockStatus.acknowledgementNo,
    });
    
    setIsSearching(false);
  };

  const currentStatusIndex = status ? getStatusIndex(status.status) : -1;

  return (
    <>
      <EnhancedSEO
        title="ITR Filing Status Tracker - Check Your Return Status | MyeCA"
        description="Track your Income Tax Return filing status online. Check ITR processing status, e-verification status, and refund status using PAN and acknowledgement number."
        keywords={["itr status", "income tax return status", "check itr status", "itr processing status", "tax refund status", "e-verification status"]}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-4">
              <Search className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Real-time Tracking</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              ITR Filing Status Tracker
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Check your Income Tax Return filing status, e-verification status, and refund status
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Track Your ITR Status
              </CardTitle>
              <CardDescription>
                Enter your PAN and acknowledgement number to check status
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
                    onChange={(e) => setAckNumber(e.target.value)}
                    placeholder="15-digit number"
                    maxLength={15}
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
                    Checking Status...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Check Status
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Status Results */}
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Basic Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      ITR Details
                    </CardTitle>
                    <Badge className={
                      status.status === 'processed' || status.status === 'refund_paid' 
                        ? 'bg-green-500' 
                        : status.status === 'demand_raised'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                    }>
                      {status.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">PAN</p>
                      <p className="font-semibold">{status.pan}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Assessment Year</p>
                      <p className="font-semibold">{status.assessmentYear}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ITR Type</p>
                      <p className="font-semibold">{status.itrType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Filing Date</p>
                      <p className="font-semibold">{status.filingDate}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Acknowledgement Number</p>
                    <p className="font-mono text-lg font-semibold">{status.acknowledgementNo}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Processing Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {STATUS_STEPS.map((step, index) => {
                      const isCompleted = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;
                      const Icon = step.icon;
                      
                      return (
                        <div key={step.id} className="flex items-start mb-8 last:mb-0">
                          {/* Connector Line */}
                          {index < STATUS_STEPS.length - 1 && (
                            <div className={`absolute left-5 mt-10 w-0.5 h-16 ${
                              index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                            }`} style={{ marginLeft: '-1px' }} />
                          )}
                          
                          {/* Icon */}
                          <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          {/* Content */}
                          <div className="ml-4 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                {step.label}
                              </h4>
                              {isCurrent && (
                                <Badge variant="outline" className="text-xs">Current</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{step.description}</p>
                            {isCompleted && step.id === 'verified' && status.verificationMethod && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ Verified via {status.verificationMethod}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* e-Verification Status */}
              {status.verificationStatus === 'pending' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800">e-Verification Pending</AlertTitle>
                  <AlertDescription className="text-orange-700">
                    Your ITR is not yet verified. Please complete e-verification within 30 days of filing.
                  </AlertDescription>
                </Alert>
              )}

              {/* e-Verification Options */}
              {status.verificationStatus === 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Complete e-Verification
                    </CardTitle>
                    <CardDescription>Choose any of the following methods</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { icon: Smartphone, title: "Aadhaar OTP", desc: "Instant verification using Aadhaar-linked mobile", recommended: true },
                        { icon: Building2, title: "Net Banking", desc: "Login through your bank's net banking" },
                        { icon: CreditCard, title: "Demat Account", desc: "Use CDSL/NSDL demat account" },
                        { icon: Mail, title: "Send ITR-V to CPC", desc: "Physical copy to CPC Bengaluru" },
                      ].map((method, index) => (
                        <div 
                          key={index}
                          className={`p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer ${
                            method.recommended ? 'border-green-300 bg-green-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${method.recommended ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <method.icon className={`h-5 w-5 ${method.recommended ? 'text-green-600' : 'text-gray-600'}`} />
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
                        Go to e-Filing Portal
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Downloads */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-blue-600" />
                    Download Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start h-auto py-3">
                      <FileText className="h-5 w-5 mr-3 text-blue-600" />
                      <div className="text-left">
                        <p className="font-medium">ITR Acknowledgement</p>
                        <p className="text-xs text-gray-500">ITR-V Form</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3">
                      <FileText className="h-5 w-5 mr-3 text-green-600" />
                      <div className="text-left">
                        <p className="font-medium">Tax Computation</p>
                        <p className="text-xs text-gray-500">Detailed tax calculation</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Processing Time Info */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Expected Processing Time</h4>
                      <ul className="mt-2 space-y-1 text-sm text-blue-800">
                        <li>• ITR-1 & ITR-4: 15-45 days after e-verification</li>
                        <li>• ITR-2 & ITR-3: 30-60 days after e-verification</li>
                        <li>• Refund (if applicable): 4-6 weeks after processing</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Help Section */}
          {!status && (
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
                        e-Filing portal under "View Filed Returns"
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

