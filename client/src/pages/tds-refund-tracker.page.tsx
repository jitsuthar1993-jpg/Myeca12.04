import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  IndianRupee, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Building2,
  RefreshCw,
  Calendar,
  ArrowRight,
  Info,
  CreditCard,
  Banknote,
  FileText,
  HelpCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import EnhancedSEO from "@/components/EnhancedSEO";

interface RefundRecord {
  assessmentYear: string;
  refundAmount: number;
  status: 'pending' | 'processed' | 'sent' | 'credited' | 'failed';
  statusDate: string;
  bankAccount?: string;
  failureReason?: string;
  interestAmount?: number;
  processingDate?: string;
  creditDate?: string;
}

// Mock data for demonstration
const mockRefunds: RefundRecord[] = [
  {
    assessmentYear: "2024-25",
    refundAmount: 45000,
    status: 'sent',
    statusDate: "2024-11-15",
    bankAccount: "HDFC Bank ****4567",
    interestAmount: 2340,
    processingDate: "2024-11-10",
  },
  {
    assessmentYear: "2023-24",
    refundAmount: 32500,
    status: 'credited',
    statusDate: "2023-12-20",
    bankAccount: "SBI ****1234",
    interestAmount: 1890,
    processingDate: "2023-12-01",
    creditDate: "2023-12-20",
  },
  {
    assessmentYear: "2022-23",
    refundAmount: 28000,
    status: 'credited',
    statusDate: "2022-11-28",
    bankAccount: "ICICI Bank ****8901",
    interestAmount: 1456,
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status: RefundRecord['status']) => {
  switch (status) {
    case 'credited': return 'bg-green-500';
    case 'sent': return 'bg-blue-500';
    case 'processed': return 'bg-yellow-500';
    case 'pending': return 'bg-gray-500';
    case 'failed': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getStatusLabel = (status: RefundRecord['status']) => {
  switch (status) {
    case 'credited': return 'Credited to Bank';
    case 'sent': return 'Sent to Bank';
    case 'processed': return 'Refund Processed';
    case 'pending': return 'Under Processing';
    case 'failed': return 'Failed';
    default: return status;
  }
};

const COMMON_ISSUES = [
  {
    icon: Building2,
    title: "Incorrect Bank Details",
    description: "Bank account or IFSC code mismatch",
    solution: "Update your bank details on the e-Filing portal under 'My Profile > My Bank Account'"
  },
  {
    icon: AlertTriangle,
    title: "PAN-Bank Account Mismatch",
    description: "Bank account is not pre-validated",
    solution: "Pre-validate your bank account on the e-Filing portal for faster refunds"
  },
  {
    icon: FileText,
    title: "Pending e-Verification",
    description: "ITR not verified within 30 days",
    solution: "Complete e-verification immediately using Aadhaar OTP or net banking"
  },
  {
    icon: XCircle,
    title: "Outstanding Demand",
    description: "Previous tax demands pending",
    solution: "Clear outstanding demands or file response under 'Pending Actions'"
  },
];

export default function TDSRefundTrackerPage() {
  const [pan, setPan] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [refunds, setRefunds] = useState<RefundRecord[] | null>(null);
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
    
    // For demo, show mock refunds
    setRefunds(mockRefunds);
    setIsSearching(false);
  };

  const totalRefunds = refunds?.reduce((sum, r) => sum + r.refundAmount + (r.interestAmount || 0), 0) || 0;
  const pendingRefunds = refunds?.filter(r => r.status !== 'credited' && r.status !== 'failed') || [];
  const creditedRefunds = refunds?.filter(r => r.status === 'credited') || [];

  return (
    <>
      <EnhancedSEO
        title="TDS Refund Tracker - Check Your Refund Status | MyeCA"
        description="Track your TDS refund status online. Check refund processing status, expected credit date, and resolve refund failures. Get real-time updates on your tax refund."
        keywords={["tds refund status", "income tax refund", "check refund status", "refund tracker", "tds refund not received", "refund failure"]}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-4">
              <Banknote className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Refund Tracking</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              TDS Refund Tracker
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Track your income tax refund status and get updates on when it will be credited to your bank account
            </p>
          </div>

          {/* Search Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Check Refund Status
              </CardTitle>
              <CardDescription>
                Enter your PAN to view refund history and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
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
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Track Refund
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

          {/* Results */}
          {refunds && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Total Refunds</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalRefunds)}</p>
                      </div>
                      <IndianRupee className="h-8 w-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">In Progress</p>
                        <p className="text-2xl font-bold">{pendingRefunds.length}</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Credited</p>
                        <p className="text-2xl font-bold">{creditedRefunds.length}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Refund History */}
              <Card>
                <CardHeader>
                  <CardTitle>Refund History</CardTitle>
                  <CardDescription>Your refunds for the last 3 assessment years</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {refunds.map((refund, index) => (
                      <motion.div
                        key={refund.assessmentYear}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border rounded-xl hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                              refund.status === 'credited' ? 'bg-green-100' :
                              refund.status === 'failed' ? 'bg-red-100' :
                              'bg-blue-100'
                            }`}>
                              {refund.status === 'credited' ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              ) : refund.status === 'failed' ? (
                                <XCircle className="h-6 w-6 text-red-600" />
                              ) : (
                                <Clock className="h-6 w-6 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">AY {refund.assessmentYear}</h4>
                                <Badge className={getStatusColor(refund.status)}>
                                  {getStatusLabel(refund.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {refund.bankAccount && `Account: ${refund.bankAccount}`}
                              </p>
                              {refund.failureReason && (
                                <p className="text-sm text-red-600 mt-1">
                                  Reason: {refund.failureReason}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(refund.refundAmount)}
                            </p>
                            {refund.interestAmount && refund.interestAmount > 0 && (
                              <p className="text-sm text-green-600">
                                + {formatCurrency(refund.interestAmount)} interest
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {refund.status === 'credited' ? 'Credited on' : 'Updated'}: {refund.statusDate}
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress for pending refunds */}
                        {refund.status !== 'credited' && refund.status !== 'failed' && (
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Processed</span>
                              <span>Sent to Bank</span>
                              <span>Credited</span>
                            </div>
                            <Progress 
                              value={
                                refund.status === 'pending' ? 25 :
                                refund.status === 'processed' ? 50 :
                                refund.status === 'sent' ? 75 : 0
                              } 
                              className="h-2"
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Expected Timeline */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Expected Refund Timeline</h4>
                      <ul className="mt-2 space-y-1 text-sm text-blue-800">
                        <li>• After ITR Processing: 1-2 weeks for refund processing</li>
                        <li>• Refund to Bank: 4-5 business days after processing</li>
                        <li>• Total Time: Usually 4-6 weeks from e-verification</li>
                        <li>• Interest: 0.5% per month if delayed beyond due date</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Common Issues Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-orange-600" />
                Common Refund Issues & Solutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {COMMON_ISSUES.map((issue, index) => (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <issue.icon className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
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

          {/* Refund Re-issue */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                Request Refund Re-issue
              </CardTitle>
              <CardDescription>
                If your refund failed or was sent to wrong account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex-shrink-0">1</span>
                  <span>Login to e-Filing portal (incometax.gov.in)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex-shrink-0">2</span>
                  <span>Go to Services → Refund Re-issue Request</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex-shrink-0">3</span>
                  <span>Select the failed refund and update bank details</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex-shrink-0">4</span>
                  <span>Submit request and track status</span>
                </li>
              </ol>
              <Button className="w-full mt-4" variant="outline" asChild>
                <a href="https://eportal.incometax.gov.in" target="_blank" rel="noopener noreferrer">
                  Go to e-Filing Portal
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

