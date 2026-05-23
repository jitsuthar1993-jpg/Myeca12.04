import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Calendar, FileText, Home, Receipt } from "lucide-react";

export default function ITRSuccessPage() {
  const [acknowledgmentNumber, setAcknowledgmentNumber] = useState("");
  const isDemoMode = import.meta.env.DEV;

  useEffect(() => {
    if (!isDemoMode) return;

    // Development-only generated reference for local flow testing.
    const generateAckNumber = () => {
      const timestamp = Date.now().toString();
      const bytes = new Uint8Array(4);
      window.crypto.getRandomValues(bytes);
      const suffix = Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("").slice(0, 6).toUpperCase();
      return `ITR${timestamp.slice(-6)}${suffix}`;
    };
    
    setAcknowledgmentNumber(generateAckNumber());
  }, [isDemoMode]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="type-page-title text-gray-900 mb-2">
            {isDemoMode ? "ITR Review Request Prepared" : "ITR Review Request Received"}
          </h1>
          <p className="type-body text-gray-600">
            {isDemoMode
              ? "Your local development flow has prepared a review reference. It is not an Income Tax portal filing acknowledgment."
              : "Your details are ready for CA review. A valid filing acknowledgment is issued only after portal filing is completed."}
          </p>
        </div>

        {/* Acknowledgment Details */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="type-card-title flex items-center text-green-900">
              <Receipt className="h-5 w-5 mr-2" />
              {isDemoMode ? "Development Review Reference" : "Filing Reference"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="type-meta text-green-600">
                  {isDemoMode ? "Development Reference" : "Acknowledgment Status"}
                </p>
                <p className="type-card-title font-bold text-green-900 font-mono">
                  {isDemoMode ? acknowledgmentNumber : "Issued after Income Tax portal filing"}
                </p>
              </div>
              <div>
                <p className="type-meta text-green-600">
                  {isDemoMode ? "Submission Date" : "Request Date"}
                </p>
                <p className="type-card-title font-semibold text-green-900">
                  {new Date().toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="type-meta text-green-600">Assessment Year</p>
                <p className="type-card-title font-semibold text-green-900">To be confirmed in review</p>
              </div>
              <div>
                <p className="type-meta text-green-600">ITR Form</p>
                <p className="type-card-title font-semibold text-green-900">To be confirmed in review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="type-card-title">Next Steps</CardTitle>
          <CardDescription className="type-support">
            {isDemoMode
              ? "What you need to do next to complete your tax filing"
              : "What happens next before your return is filed"}
          </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="type-meta font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    CA Review
                  </h4>
                  <p className="type-support text-gray-600">
                    {isDemoMode
                      ? "Use this local reference to test the post-submit journey. A tax expert review is still required before any real filing."
                      : "A tax expert will verify your income, AIS/26AS, deductions, and filing eligibility before submission."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="type-meta font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Confirm Filing
                  </h4>
                  <p className="type-support text-gray-600">
                    {isDemoMode
                      ? "In production, the reviewed return should be confirmed before submission through the official workflow."
                      : "You will be asked to confirm the reviewed return before it is filed through the official workflow."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="type-meta font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Receive Valid Acknowledgment
                  </h4>
                  <p className="type-support text-gray-600">
                    {isDemoMode
                      ? "The official acknowledgment is available only after a real Income Tax portal filing succeeds."
                      : "After successful filing, the official acknowledgment details will be attached to your account."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="type-card-title text-orange-900">Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isDemoMode ? (
              <ul className="list-disc list-inside space-y-1 type-support text-orange-800">
                <li>This is a local development review reference for testing purposes only</li>
                <li>It is not a filing acknowledgment and should not be shown as proof of submission</li>
                <li>For actual filing, users receive a valid acknowledgment from the Income Tax Department after portal submission</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-1 type-support text-orange-800">
                <li>This page confirms that the review request was received, not that the return has already been filed</li>
                <li>A valid acknowledgment is available only after successful filing on the Income Tax portal</li>
                <li>Keep supporting documents ready until review and filing are complete</li>
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
          <Button variant="outline" size="lg" className="w-full sm:w-auto" disabled>
            <Download className="h-4 w-4 mr-2" />
            Official Acknowledgment After Filing
          </Button>
          
          <Button variant="outline" size="lg" className="w-full sm:w-auto" disabled>
            <FileText className="h-4 w-4 mr-2" />
            ITR Copy After Filing
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
            <CardTitle className="type-card-title">Filing Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {isDemoMode ? "Review Reference Prepared" : "Review Request Received"}
                    </span>
                    <Badge variant="default">Completed</Badge>
                  </div>
                  <p className="type-support text-gray-600">
                    {new Date().toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      CA Review
                    </span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <p className="type-support text-gray-600">
                    Pending expert verification
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      Official Filing Complete
                    </span>
                    <Badge variant="outline">Awaiting</Badge>
                  </div>
                  <p className="type-support text-gray-600">
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
