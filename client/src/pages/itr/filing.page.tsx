import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Calculator, Save, Send, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { queryClient, apiRequest } from "@/lib/queryClient";
import PersonalDetailsForm from "@/components/itr/PersonalDetailsForm";
import IncomeDetailsForm from "@/components/itr/IncomeDetailsForm";
import DeductionsForm from "@/components/itr/DeductionsForm";
import TaxCalculationForm from "@/components/itr/TaxCalculationForm";
import ReviewAndSubmit from "@/components/itr/ReviewAndSubmit";
import CapitalGainsForm from "@/components/itr/CapitalGainsForm";
import BusinessIncomeForm from "@/components/itr/BusinessIncomeForm";

const ITR_STEPS = {
  'ITR-1': [
    { id: 'personal', title: 'Personal Details', description: 'Basic information and PAN details' },
    { id: 'income', title: 'Income Details', description: 'Salary, interest, and other income' },
    { id: 'deductions', title: 'Deductions', description: 'Section 80C, 80D, and other deductions' },
    { id: 'calculation', title: 'Tax Calculation', description: 'Review calculated tax liability' },
    { id: 'review', title: 'Review & Submit', description: 'Final review and submission' }
  ],
  'ITR-2': [
    { id: 'personal', title: 'Personal Details', description: 'Basic information and PAN details' },
    { id: 'income', title: 'Income Details', description: 'Salary, interest, and other income' },
    { id: 'capital-gains', title: 'Capital Gains', description: 'Gains from sale of assets' },
    { id: 'deductions', title: 'Deductions', description: 'Section 80C, 80D, and other deductions' },
    { id: 'calculation', title: 'Tax Calculation', description: 'Review calculated tax liability' },
    { id: 'review', title: 'Review & Submit', description: 'Final review and submission' }
  ],
  'ITR-3': [
    { id: 'personal', title: 'Personal Details', description: 'Basic information and PAN details' },
    { id: 'business', title: 'Business Income', description: 'Business/professional income details' },
    { id: 'income', title: 'Other Income', description: 'Salary, interest, and other income' },
    { id: 'capital-gains', title: 'Capital Gains', description: 'Gains from sale of assets' },
    { id: 'deductions', title: 'Deductions', description: 'Section 80C, 80D, and other deductions' },
    { id: 'calculation', title: 'Tax Calculation', description: 'Review calculated tax liability' },
    { id: 'review', title: 'Review & Submit', description: 'Final review and submission' }
  ]
};

export default function ITRFilingPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    assessmentYear: '2024-25',
    itrType: 'ITR-1',
    personalDetails: {},
    incomeDetails: {},
    businessIncome: {},
    capitalGains: {},
    deductions: {},
    taxCalculation: {},
    profileId: null
  });

  // Get URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const formType = urlParams.get('form') || 'ITR-1';
    const assessmentYear = urlParams.get('ay') || '2024-25';
    
    setFormData(prev => ({
      ...prev,
      itrType: formType,
      assessmentYear: assessmentYear
    }));
  }, []);

  const currentSteps = ITR_STEPS[formData.itrType as keyof typeof ITR_STEPS] || ITR_STEPS['ITR-1'];

  // Fetch user profiles
  const { data: profiles = [] } = useQuery({
    queryKey: ['/api/profiles'],
    enabled: !!user
  });

  // Fetch existing tax returns
  const { data: existingReturns = [] } = useQuery({
    queryKey: ['/api/tax-returns'],
    enabled: !!user
  });

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/tax-returns', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          status: 'draft'
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tax-returns'] });
    }
  });

  // Submit return mutation
  const submitReturnMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/tax-returns', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          status: 'filed'
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tax-returns'] });
    }
  });

  const currentStepData = currentSteps[currentStep];
  const progressPercentage = ((currentStep + 1) / currentSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < currentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    saveDraftMutation.mutate(formData);
  };

  const handleSubmit = () => {
    submitReturnMutation.mutate(formData, {
      onSuccess: () => {
        // Navigate to success page
        window.location.href = '/itr/success';
      }
    });
  };

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {formData.itrType} Filing - Assessment Year {formData.assessmentYear}
          </h1>
          <p className="text-gray-600">Complete your income tax return step by step</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filing Progress</h3>
              <Badge variant="outline">{currentStep + 1} of {currentSteps.length}</Badge>
            </div>
            <Progress value={progressPercentage} className="mb-4" />
            <div className="flex justify-between text-sm">
              {currentSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`text-center ${index <= currentStep ? 'text-primary' : 'text-gray-400'}`}
                >
                  <div className="font-medium">{step.title}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {currentStepData.title}
            </CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Step Content */}
            {currentStepData.id === 'personal' && (
              <PersonalDetailsForm
                data={formData.personalDetails}
                profiles={profiles as any[]}
                onChange={(data) => updateFormData('personalDetails', data)}
                onProfileSelect={(profileId) => updateFormData('profileId', profileId)}
              />
            )}
            
            {currentStepData.id === 'business' && (
              <BusinessIncomeForm
                data={formData.businessIncome}
                onChange={(data) => updateFormData('businessIncome', data)}
              />
            )}
            
            {currentStepData.id === 'income' && (
              <IncomeDetailsForm
                data={formData.incomeDetails}
                onChange={(data) => updateFormData('incomeDetails', data)}
              />
            )}
            
            {currentStepData.id === 'capital-gains' && (
              <CapitalGainsForm
                data={formData.capitalGains}
                onChange={(data) => updateFormData('capitalGains', data)}
              />
            )}
            
            {currentStepData.id === 'deductions' && (
              <DeductionsForm
                data={formData.deductions}
                onChange={(data) => updateFormData('deductions', data)}
              />
            )}
            
            {currentStepData.id === 'calculation' && (
              <TaxCalculationForm
                formData={formData}
                onChange={(data) => updateFormData('taxCalculation', data)}
              />
            )}
            
            {currentStepData.id === 'review' && (
              <ReviewAndSubmit
                formData={formData}
                onSubmit={handleSubmit}
                isSubmitting={submitReturnMutation.isPending}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <div>
                {currentStep > 0 && (
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={saveDraftMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                
                {currentStep < currentSteps.length - 1 ? (
                  <Button onClick={handleNext} className="shadow-primary hover:scale-105 transition-all duration-300">
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={submitReturnMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 shadow-success hover:scale-105 transition-all duration-300"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Return
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Returns */}
        {Array.isArray(existingReturns) && existingReturns.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your Previous Returns</CardTitle>
              <CardDescription>Access your saved and filed returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(existingReturns as any[]).map((taxReturn: any) => (
                  <div key={taxReturn.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{taxReturn.itrType} - {taxReturn.assessmentYear}</p>
                      <p className="text-sm text-gray-500">
                        {taxReturn.status === 'draft' ? 'Draft saved' : 'Filed'} • 
                        {new Date(taxReturn.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={taxReturn.status === 'filed' ? 'default' : 'secondary'}>
                        {taxReturn.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {taxReturn.status === 'draft' ? 'Continue' : 'View'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}