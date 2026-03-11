import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Calendar, FileText, Home, Receipt } from "lucide-react";

export default function ITRSuccessPage() {
  const [acknowledgmentNumber, setAcknowledgmentNumber] = useState("");

  useEffect(() => {
    // Generate mock acknowledgment number
    const generateAckNumber = () => {
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `ITR${timestamp.slice(-6)}${random}`;
    };
    
    setAcknowledgmentNumber(generateAckNumber());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ITR Successfully Submitted!</h1>
          <p className="text-gray-600">Your Income Tax Return has been processed and submitted</p>
        </div>

        {/* Acknowledgment Details */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-900">
              <Receipt className="h-5 w-5 mr-2" />
              Acknowledgment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-green-600">Acknowledgment Number</p>
                <p className="text-lg font-bold text-green-900 font-mono">
                  {acknowledgmentNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-600">Submission Date</p>
                <p className="text-lg font-semibold text-green-900">
                  {new Date().toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-600">Assessment Year</p>
                <p className="text-lg font-semibold text-green-900">2024-25</p>
              </div>
              <div>
                <p className="text-sm text-green-600">ITR Form</p>
                <p className="text-lg font-semibold text-green-900">ITR-1 (Sahaj)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>What you need to do next to complete your tax filing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">E-Verification Required</h4>
                  <p className="text-gray-600 text-sm">
                    You need to e-verify your return within 120 days using Aadhaar OTP, net banking, or by sending a physical copy.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Keep Records</h4>
                  <p className="text-gray-600 text-sm">
                    Save your acknowledgment number and all supporting documents for your records.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Track Refund (if applicable)</h4>
                  <p className="text-gray-600 text-sm">
                    If you're eligible for a refund, you can track its status on the Income Tax portal.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-disc list-inside space-y-1 text-orange-800 text-sm">
              <li>This is a demo submission for testing purposes only</li>
              <li>In production, this would integrate with the Income Tax Department's e-filing portal</li>
              <li>The acknowledgment number shown is for demonstration only</li>
              <li>For actual filing, you would receive a valid acknowledgment from the IT Department</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Download Acknowledgment
          </Button>
          
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <FileText className="h-4 w-4 mr-2" />
            Download ITR Copy
          </Button>
          
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Filing Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">ITR Submitted</span>
                    <Badge variant="default">Completed</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">E-Verification</span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Complete within 120 days
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Processing Complete</span>
                    <Badge variant="outline">Awaiting</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    After e-verification
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}