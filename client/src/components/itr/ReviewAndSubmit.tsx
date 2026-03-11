import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, FileText, Send, Download } from "lucide-react";

interface ReviewAndSubmitProps {
  formData: any;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function ReviewAndSubmit({ formData, onSubmit, isSubmitting }: ReviewAndSubmitProps) {
  const { personalDetails, incomeDetails, deductions, taxCalculation } = formData;

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? "0" : num.toLocaleString('en-IN');
  };

  const getTotalIncome = () => {
    if (!incomeDetails) return 0;
    return (
      parseFloat(incomeDetails.salaryIncome || "0") +
      parseFloat(incomeDetails.bonusIncome || "0") +
      parseFloat(incomeDetails.interestIncome || "0") +
      parseFloat(incomeDetails.dividendIncome || "0") +
      parseFloat(incomeDetails.otherIncome || "0")
    );
  };

  const getTotalDeductions = () => {
    if (!deductions) return 0;
    return (
      parseFloat(deductions.section80C || "0") +
      parseFloat(deductions.section80D || "0") +
      parseFloat(deductions.section80G || "0") +
      parseFloat(deductions.section80E || "0") +
      parseFloat(deductions.section24 || "0") +
      parseFloat(deductions.standardDeduction || "50000") +
      parseFloat(deductions.professionalTax || "0") +
      parseFloat(deductions.nps || "0") +
      parseFloat(deductions.otherDeductions || "0")
    );
  };

  const isFormComplete = () => {
    return !!(
      personalDetails?.pan &&
      personalDetails?.firstName &&
      personalDetails?.lastName &&
      incomeDetails?.salaryIncome &&
      taxCalculation?.calculation
    );
  };

  return (
    <div className="space-y-6">
      {/* Form Completion Status */}
      <Card className={isFormComplete() ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            {isFormComplete() ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            <span className={`font-medium ${isFormComplete() ? 'text-green-900' : 'text-yellow-900'}`}>
              {isFormComplete() 
                ? "Form completed and ready for submission" 
                : "Please complete all required fields before submitting"
              }
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Details Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">
                {personalDetails?.firstName} {personalDetails?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">PAN</p>
              <p className="font-medium">{personalDetails?.pan || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{personalDetails?.email || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mobile</p>
              <p className="font-medium">{personalDetails?.mobile || "Not provided"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Income Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Salary Income</p>
              <p className="text-lg font-semibold text-blue-900">
                \u20B9{formatCurrency(incomeDetails?.salaryIncome || "0")}
              </p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Interest Income</p>
              <p className="text-lg font-semibold text-blue-900">
                \u20B9{formatCurrency(incomeDetails?.interestIncome || "0")}
              </p>
            </div>
            <div className="text-center p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-700">Total Income</p>
              <p className="text-xl font-bold text-blue-900">
                \u20B9{formatCurrency(getTotalIncome())}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deductions Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Deductions Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Section 80C</p>
              <p className="text-lg font-semibold text-green-900">
                \u20B9{formatCurrency(deductions?.section80C || "0")}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Section 80D</p>
              <p className="text-lg font-semibold text-green-900">
                \u20B9{formatCurrency(deductions?.section80D || "0")}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Standard Deduction</p>
              <p className="text-lg font-semibold text-green-900">
                \u20B9{formatCurrency(deductions?.standardDeduction || "50000")}
              </p>
            </div>
            <div className="text-center p-3 bg-green-100 rounded-lg">
              <p className="text-sm text-green-700">Total Deductions</p>
              <p className="text-xl font-bold text-green-900">
                \u20B9{formatCurrency(getTotalDeductions())}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Calculation Summary */}
      {taxCalculation?.calculation && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Calculation Summary</CardTitle>
            <CardDescription>
              Calculated using {taxCalculation.regime?.charAt(0).toUpperCase() + taxCalculation.regime?.slice(1)} Tax Regime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Taxable Income</p>
                  <p className="text-xl font-semibold text-gray-900">
                    \u20B9{formatCurrency(taxCalculation.calculation.taxableIncome)}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">Tax Payable</p>
                  <p className="text-xl font-bold text-red-900">
                    \u20B9{formatCurrency(taxCalculation.calculation.taxPayable)}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Net Income</p>
                  <p className="text-xl font-bold text-green-900">
                    \u20B9{formatCurrency(taxCalculation.calculation.netIncome)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ITR Details */}
      <Card>
        <CardHeader>
          <CardTitle>ITR Filing Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">ITR Form</p>
              <p className="font-medium">{formData.itrType || "ITR-1"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Assessment Year</p>
              <p className="font-medium">{formData.assessmentYear || "2024-25"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Filing Status</p>
              <Badge variant="secondary">Ready to File</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notices */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-900">Important Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="list-disc list-inside space-y-1 text-orange-800">
            <li>This is a demo submission. In production, this would generate actual ITR files.</li>
            <li>Please ensure all information is accurate before submitting.</li>
            <li>You can save this as a draft and return later to make changes.</li>
            <li>After submission, you'll receive a mock acknowledgment number.</li>
            <li>For actual filing, you would need to upload the generated JSON/XML file to the Income Tax portal.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6">
        <Button
          variant="outline"
          size="lg"
          disabled={!isFormComplete()}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Draft
        </Button>
        
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={!isFormComplete() || isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Submitting..." : "Submit ITR"}
        </Button>
      </div>

      {/* Submission Result */}
      {isSubmitting && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-900">
                Processing your ITR submission... Please wait.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}