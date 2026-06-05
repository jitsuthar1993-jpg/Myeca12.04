import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Info, Calculator, Briefcase, Landmark, Home, Globe } from 'lucide-react';
import { Link } from 'wouter';

const STEPS = [
  {
    id: 'income-sources',
    title: 'Income Sources',
    description: 'Select all sources of income you had during the financial year.',
    options: [
      { id: 'salary', label: 'Salary or Pension', icon: Briefcase },
      { id: 'house-property', label: 'House Property (Rental Income)', icon: Home },
      { id: 'business', label: 'Business or Profession', icon: Landmark },
      { id: 'capital-gains', label: 'Capital Gains (Shares, Property, etc.)', icon: Calculator },
      { id: 'other-sources', label: 'Other Sources (Interest, Dividends)', icon: Info },
      { id: 'foreign-income', label: 'Foreign Income or Assets', icon: Globe },
    ]
  },
  {
    id: 'details',
    title: 'Additional Details',
    description: 'Help us refine the result with a few more details.',
    questions: [
      {
        id: 'total-income',
        label: 'Is your total income more than ₹50 Lakhs?',
        type: 'radio',
        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
      },
      {
        id: 'multiple-houses',
        label: 'Do you own more than one house property?',
        type: 'radio',
        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
      },
      {
        id: 'presumptive',
        label: 'Do you want to opt for Presumptive Taxation (44AD/44ADA)?',
        type: 'radio',
        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
      }
    ]
  }
];

export default function ITRFormRecommenderPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, any>>({
    sources: [],
    details: {}
  });

  const handleSourceToggle = (sourceId: string) => {
    setSelections(prev => {
      const sources = prev.sources.includes(sourceId)
        ? prev.sources.filter((s: string) => s !== sourceId)
        : [...prev.sources, sourceId];
      return { ...prev, sources };
    });
  };

  const handleDetailChange = (id: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      details: { ...prev.details, [id]: value }
    }));
  };

  const getRecommendation = () => {
    const { sources, details } = selections;
    
    // ITR-3: Business/Profession (Non-presumptive)
    if (sources.includes('business') && details.presumptive === 'no') return 'ITR-3';
    
    // ITR-4: Business/Profession (Presumptive)
    if (sources.includes('business') && details.presumptive === 'yes') return 'ITR-4';
    
    // ITR-2: Capital Gains, Foreign Income, Multiple Houses, or Income > 50L
    if (sources.includes('capital-gains') || 
        sources.includes('foreign-income') || 
        details.multiple_houses === 'yes' || 
        details.total_income === 'yes') return 'ITR-2';
    
    // ITR-1: Simple cases
    return 'ITR-1';
  };

  const recommendedForm = getRecommendation();

  const isNextDisabled = () => {
    if (currentStep === 0) return selections.sources.length === 0;
    if (currentStep === 1) {
      return !selections.details['total-income'] || 
             (selections.sources.includes('house-property') && !selections.details['multiple-houses']) ||
             (selections.sources.includes('business') && !selections.details['presumptive']);
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="type-page-title text-slate-900 mb-2">Form Selection Assistant</h1>
          <p className="type-body text-slate-600">Answer a few questions to find the right ITR form for you.</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-10 flex items-center justify-between px-2">
          {[0, 1, 2].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                currentStep >= step ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step + 1}
              </div>
              {step < 2 && <div className={`h-1 w-16 md:w-32 rounded-full ${currentStep > step ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {currentStep < 2 ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50 p-6 md:p-8">
                  <CardTitle className="type-section-title text-slate-900">{STEPS[currentStep].title}</CardTitle>
                  <CardDescription className="type-support text-slate-500">{STEPS[currentStep].description}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-6">
                  {currentStep === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {STEPS[0].options?.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selections.sources.includes(option.id);
                        return (
                          <div
                            key={option.id}
                            onClick={() => handleSourceToggle(option.id)}
                            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all cursor-pointer group ${
                              isSelected 
                                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10' 
                                : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'
                            }`}
                          >
                            <div className={`p-3 rounded-lg mb-3 transition-colors ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 group-hover:text-slate-600 shadow-sm border border-slate-100'
                            }`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <span className={`type-support font-bold text-center ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                              {option.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {STEPS[1].questions
                        ?.filter(q => {
                          if (q.id === 'multiple-houses' && !selections.sources.includes('house-property')) return false;
                          if (q.id === 'presumptive' && !selections.sources.includes('business')) return false;
                          return true;
                        })
                        .map((q) => (
                        <div key={q.id} className="space-y-4">
                          <Label className="type-body font-bold text-slate-900">{q.label}</Label>
                          <RadioGroup 
                            value={selections.details[q.id]} 
                            onValueChange={(val) => handleDetailChange(q.id, val)}
                            className="flex flex-col gap-3"
                          >
                            {q.options?.map((opt) => (
                              <div 
                                key={opt.value}
                                onClick={() => handleDetailChange(q.id, opt.value)}
                                className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                  selections.details[q.id] === opt.value 
                                    ? 'border-indigo-600 bg-indigo-50/30' 
                                    : 'border-slate-100 bg-white hover:border-slate-200'
                                }`}
                              >
                                <RadioGroupItem value={opt.value} id={`${q.id}-${opt.value}`} className="border-slate-300" />
                                <Label htmlFor={`${q.id}-${opt.value}`} className="flex-1 font-medium text-slate-700 cursor-pointer">
                                  {opt.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    disabled={currentStep === 0}
                    className="text-slate-600 px-6"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={isNextDisabled()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 shadow-lg shadow-indigo-200"
                  >
                    {currentStep === 1 ? 'Get Recommendation' : 'Next'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="border-indigo-200 shadow-xl overflow-hidden">
                <div className="bg-indigo-600 py-10 px-6 text-white text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full mb-4 backdrop-blur-sm border border-white/20">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <h2 className="type-section-title font-black mb-2 italic uppercase tracking-wide">Recommended: {recommendedForm}</h2>
                  <p className="type-support text-indigo-100 max-w-md mx-auto">
                    Based on your inputs, this form is the suggested fit for your filing requirements.
                  </p>
                </div>
                <CardContent className="p-8 md:p-12 space-y-8 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                     <div className="space-y-4">
                        <h3 className="font-bold text-slate-900 flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2 text-indigo-600" />
                          Why this form?
                        </h3>
                        <ul className="space-y-3">
                          {recommendedForm === 'ITR-1' && (
                            <li className="type-support text-slate-600">• Simple salary/pension case</li>
                          )}
                          {recommendedForm === 'ITR-2' && (
                            <li className="type-support text-slate-600">• Capital gains or foreign assets</li>
                          )}
                          {recommendedForm === 'ITR-3' && (
                            <li className="type-support text-slate-600">• Complex business/profession income</li>
                          )}
                          {recommendedForm === 'ITR-4' && (
                            <li className="type-support text-slate-600">• Simplified presumptive taxation</li>
                          )}
                          <li className="type-support text-slate-600">• Matches your reported income sources</li>
                        </ul>
                     </div>
                     <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                        <p className="type-meta uppercase font-bold text-slate-400 tracking-widest mb-2 text-center">Next Steps</p>
                        <p className="type-support text-slate-600 text-center mb-6">Proceed to the filing section with your recommended form selected.</p>
                        <Link href={`/itr/form-selector?recommended=${recommendedForm}`}>
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 shadow-md">
                            Continue to Filing
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                     </div>
                  </div>
                  <div className="pt-6 border-t border-slate-100 text-center">
                    <button 
                      onClick={() => setCurrentStep(0)} 
                      className="type-support text-indigo-600 font-bold hover:underline"
                    >
                      Restart Assistant
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
