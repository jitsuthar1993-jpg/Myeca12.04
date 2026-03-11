import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Users, Building, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

const ITR_FORMS = [
  {
    id: 'ITR-1',
    title: 'ITR-1 (Sahaj)',
    description: 'For salaried individuals with income up to \u20B950 lakhs',
    features: [
      'Salary income',
      'House property income (one house)',
      'Other sources income',
      'Deductions under Chapter VI-A'
    ],
    complexity: 'Simple',
    estimatedTime: '15-20 minutes',
    icon: Users,
    color: 'bg-green-100 text-green-800',
    available: true
  },
  {
    id: 'ITR-2',
    title: 'ITR-2',
    description: 'For individuals/HUFs having income from capital gains, foreign assets',
    features: [
      'All ITR-1 sources',
      'Capital gains',
      'Foreign income/assets',
      'Multiple house properties',
      'Director in companies'
    ],
    complexity: 'Moderate',
    estimatedTime: '30-45 minutes',
    icon: TrendingUp,
    color: 'bg-orange-100 text-orange-800',
    available: true
  },
  {
    id: 'ITR-3',
    title: 'ITR-3',
    description: 'For individuals/HUFs having income from business or profession',
    features: [
      'Business/professional income',
      'Presumptive taxation',
      'Book profit',
      'Partnership firm partners',
      'All ITR-2 sources'
    ],
    complexity: 'Complex',
    estimatedTime: '45-60 minutes',
    icon: Building,
    color: 'bg-blue-100 text-blue-800',
    available: true
  },
  {
    id: 'ITR-4',
    title: 'ITR-4 (Sugam)',
    description: 'For individuals/HUFs/firms with presumptive income',
    features: [
      'Presumptive business income',
      'Turnover up to \u20B92 crores',
      'Section 44AD/44ADA',
      'Simple business returns'
    ],
    complexity: 'Simple',
    estimatedTime: '20-25 minutes',
    icon: FileText,
    color: 'bg-purple-100 text-purple-800',
    available: false
  }
];

const ASSESSMENT_YEARS = [
  { value: '2024-25', label: 'AY 2024-25 (FY 2023-24)' },
  { value: '2023-24', label: 'AY 2023-24 (FY 2022-23)' },
  { value: '2022-23', label: 'AY 2022-23 (FY 2021-22)' }
];

export default function ITRFormSelectorPage() {
  const [selectedForm, setSelectedForm] = useState('');
  const [assessmentYear, setAssessmentYear] = useState('2024-25');

  const getRecommendedForm = () => {
    // Simple recommendation logic - in real app this would be more sophisticated
    return 'ITR-1';
  };

  const selectedFormData = ITR_FORMS.find(form => form.id === selectedForm);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select ITR Form</h1>
          <p className="text-gray-600">Choose the appropriate Income Tax Return form based on your income sources</p>
        </div>

        {/* Assessment Year Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Assessment Year</CardTitle>
            <CardDescription>Select the financial year for which you want to file ITR</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={assessmentYear} onValueChange={setAssessmentYear}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select assessment year" />
              </SelectTrigger>
              <SelectContent>
                {ASSESSMENT_YEARS.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Form Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {ITR_FORMS.map((form) => {
            const IconComponent = form.icon;
            const isRecommended = form.id === getRecommendedForm();
            
            return (
              <Card 
                key={form.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedForm === form.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                } ${!form.available ? 'opacity-60' : ''}`}
                onClick={() => form.available && setSelectedForm(form.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${form.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{form.title}</CardTitle>
                        <CardDescription>{form.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {isRecommended && (
                        <Badge variant="default" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                      {!form.available && (
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Applicable for:</h4>
                    <ul className="space-y-1">
                      {form.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Complexity</p>
                      <p className="font-medium">{form.complexity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Est. Time</p>
                      <p className="font-medium">{form.estimatedTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Form Details */}
        {selectedFormData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Selected Form: {selectedFormData.title}</CardTitle>
              <CardDescription>
                You've selected {selectedFormData.title} for Assessment Year {assessmentYear}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-blue-600">Form Type</p>
                  <p className="font-semibold text-blue-900">{selectedFormData.title}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Assessment Year</p>
                  <p className="font-semibold text-blue-900">{assessmentYear}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Estimated Time</p>
                  <p className="font-semibold text-blue-900">{selectedFormData.estimatedTime}</p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Link href={`/itr/filing?form=${selectedFormData.id}&ay=${assessmentYear}`}>
                  <Button size="lg" className="px-8">
                    <FileText className="h-4 w-4 mr-2" />
                    Start Filing {selectedFormData.title}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-900">
              <AlertCircle className="h-5 w-5 mr-2" />
              Need Help Choosing?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-yellow-800 text-sm space-y-2">
              <p><strong>Choose ITR-1</strong> if you have only salary, one house property, and other sources income.</p>
              <p><strong>Choose ITR-2</strong> if you have capital gains, foreign income, or multiple house properties.</p>
              <p><strong>Choose ITR-3</strong> if you have business or professional income.</p>
              <p><strong>Choose ITR-4</strong> if you opt for presumptive taxation scheme for business.</p>
            </div>
            <div className="pt-2">
              <Button variant="outline" size="sm">
                Take Form Recommendation Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}