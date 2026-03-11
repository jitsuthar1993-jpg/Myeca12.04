import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Briefcase, 
  Home, 
  TrendingUp, 
  Calculator,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Save,
  Eye,
  Send,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PersonalInfo {
  pan: string;
  aadhaar: string;
  name: string;
  dob: string;
  mobile: string;
  email: string;
  address: string;
  pincode: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

interface IncomeDetails {
  salary: string;
  houseProperty: string;
  business: string;
  capitalGains: string;
  otherSources: string;
  tdsOnSalary: string;
  tdsOther: string;
  advanceTax: string;
  selfAssessmentTax: string;
  tcs: string;
}

interface Deductions {
  section80C: string;
  section80CCD: string;
  section80D: string;
  section80G: string;
  section80DD: string;
  homeLoanInterest: string;
  section80CDetails: {
    policyNumber?: string;
    pranNumber?: string;
  };
}

export default function ITRStepByStepGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [filingType, setFilingType] = useState<"original" | "revised" | "belated">("original");
  const [taxRegime, setTaxRegime] = useState<"new" | "old">("new");
  const [itrForm, setItrForm] = useState<string>("ITR-1");
  const [assessmentYear, setAssessmentYear] = useState("2024-25");
  const [selectedIncomeTypes, setSelectedIncomeTypes] = useState<string[]>([]);
  const [taxComputed, setTaxComputed] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<{category: string, message: string}[]>([]);
  const [eVerificationMethod, setEVerificationMethod] = useState<string>("");
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    pan: "",
    aadhaar: "",
    name: "",
    dob: "",
    mobile: "",
    email: "",
    address: "",
    pincode: "",
    bankName: "",
    accountNumber: "",
    ifscCode: ""
  });
  const [incomeDetails, setIncomeDetails] = useState<IncomeDetails>({
    salary: "",
    houseProperty: "",
    business: "",
    capitalGains: "",
    otherSources: "",
    tdsOnSalary: "",
    tdsOther: "",
    advanceTax: "",
    selfAssessmentTax: "",
    tcs: ""
  });
  const [deductions, setDeductions] = useState<Deductions>({
    section80C: "",
    section80CCD: "",
    section80D: "",
    section80G: "",
    section80DD: "",
    homeLoanInterest: "",
    section80CDetails: {}
  });

  const steps = [
    { id: 0, title: "Filing Type", icon: FileText },
    { id: 1, title: "ITR Form", icon: FileText },
    { id: 2, title: "Tax Regime", icon: Calculator },
    { id: 3, title: "Personal & Bank", icon: Users },
    { id: 4, title: "Income Details", icon: Briefcase },
    { id: 5, title: "Deductions", icon: FileText },
    { id: 6, title: "Tax Computation", icon: TrendingUp },
    { id: 7, title: "Payment", icon: Calculator },
    { id: 8, title: "Preview & Validate", icon: Eye },
    { id: 9, title: "Submit & E-Verify", icon: CheckCircle }
  ];

  // Calculate progress percentage
  const calculateProgress = () => {
    return Math.round((currentStep / (steps.length - 1)) * 100);
  };

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled) {
      const saveInterval = setInterval(() => {
        // Save form data to localStorage
        const formData = {
          filingType,
          taxRegime,
          itrForm,
          assessmentYear,
          selectedIncomeTypes,
          personalInfo,
          incomeDetails,
          deductions,
          currentStep,
          lastSaved: new Date()
        };
        localStorage.setItem('itr-draft', JSON.stringify(formData));
        setLastSaved(new Date());
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(saveInterval);
    }
  }, [filingType, taxRegime, itrForm, assessmentYear, selectedIncomeTypes, personalInfo, incomeDetails, deductions, currentStep, autoSaveEnabled]);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('itr-draft');
    if (savedDraft) {
      const data = JSON.parse(savedDraft);
      setFilingType(data.filingType || "original");
      setTaxRegime(data.taxRegime || "new");
      setItrForm(data.itrForm || "ITR-1");
      setAssessmentYear(data.assessmentYear || "2024-25");
      setSelectedIncomeTypes(data.selectedIncomeTypes || []);
      setPersonalInfo(data.personalInfo || personalInfo);
      setIncomeDetails(data.incomeDetails || incomeDetails);
      setDeductions(data.deductions || deductions);
      setCurrentStep(data.currentStep || 0);
      setLastSaved(data.lastSaved ? new Date(data.lastSaved) : null);
    }
  }, []);

  const incomeTypes = [
    { id: "salary", label: "Salary Income", icon: Briefcase, description: "Income from employment" },
    { id: "houseProperty", label: "House Property", icon: Home, description: "Rental income or self-occupied" },
    { id: "business", label: "Business/Profession", icon: Briefcase, description: "Income from business or profession" },
    { id: "capitalGains", label: "Capital Gains", icon: TrendingUp, description: "Profit from sale of assets" },
    { id: "otherSources", label: "Other Sources", icon: FileText, description: "Interest, dividends, etc." }
  ];

  const calculateTax = () => {
    // Calculate total income (excluding tax paid fields)
    const totalIncome = (parseFloat(incomeDetails.salary) || 0) + 
      (parseFloat(incomeDetails.houseProperty) || 0) + 
      (parseFloat(incomeDetails.business) || 0) + 
      (parseFloat(incomeDetails.capitalGains) || 0) + 
      (parseFloat(incomeDetails.otherSources) || 0);
    
    // Calculate total deductions
    const totalDeductions = (parseFloat(deductions.section80C) || 0) + 
      (parseFloat(deductions.section80CCD) || 0) + 
      (parseFloat(deductions.section80D) || 0) + 
      (parseFloat(deductions.section80G) || 0) + 
      (parseFloat(deductions.section80DD) || 0) + 
      (parseFloat(deductions.homeLoanInterest) || 0);
    
    const taxableIncome = Math.max(0, totalIncome - totalDeductions);
    
    let tax = 0;
    if (taxableIncome > 250000) {
      if (taxableIncome <= 500000) {
        tax = (taxableIncome - 250000) * 0.05;
      } else if (taxableIncome <= 1000000) {
        tax = 12500 + (taxableIncome - 500000) * 0.2;
      } else {
        tax = 112500 + (taxableIncome - 1000000) * 0.3;
      }
    }
    
    const cess = tax * 0.04;
    const totalTax = tax + cess;
    
    // Calculate taxes already paid
    const taxesPaid = (parseFloat(incomeDetails.tdsOnSalary) || 0) + 
      (parseFloat(incomeDetails.tdsOther) || 0) + 
      (parseFloat(incomeDetails.advanceTax) || 0) + 
      (parseFloat(incomeDetails.selfAssessmentTax) || 0) + 
      (parseFloat(incomeDetails.tcs) || 0);
    
    const refundDue = taxesPaid - totalTax;
    
    return { totalIncome, totalDeductions, taxableIncome, tax, cess, totalTax, taxesPaid, refundDue };
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ITR Filing Step-by-Step Guide
          </h1>
          <p className="text-xl text-gray-600">
            Complete your Income Tax Return filing in simple steps
          </p>
          {lastSaved && (
            <p className="text-sm text-gray-500 mt-2">
              <Save className="inline w-4 h-4 mr-1" />
              Auto-saved at {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={`flex flex-col items-center cursor-pointer ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  {React.createElement(steps[currentStep].icon, { className: "w-6 h-6" })}
                  {steps[currentStep].title}
                </CardTitle>
                <CardDescription>
                  Step {currentStep + 1} of {steps.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Step 0: Filing Type */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold mb-4 block">
                        Select Filing Type
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                          onClick={() => setFilingType("original")}
                          className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                            filingType === "original"
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <h4 className="font-medium text-lg mb-2">Original Return</h4>
                          <p className="text-sm text-gray-600">Filing for the first time for this assessment year</p>
                          {filingType === "original" && (
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-2" />
                          )}
                        </div>
                        
                        <div
                          onClick={() => setFilingType("revised")}
                          className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                            filingType === "revised"
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <h4 className="font-medium text-lg mb-2">Revised Return</h4>
                          <p className="text-sm text-gray-600">Correct a previously filed return</p>
                          {filingType === "revised" && (
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-2" />
                          )}
                        </div>
                        
                        <div
                          onClick={() => setFilingType("belated")}
                          className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                            filingType === "belated"
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <h4 className="font-medium text-lg mb-2">Belated Return</h4>
                          <p className="text-sm text-gray-600">Filing after the due date</p>
                          {filingType === "belated" && (
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-2" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {filingType === "revised" && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You can file a revised return within 3 years from the end of the assessment year or before completion of assessment, whichever is earlier.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {filingType === "belated" && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          Belated returns may attract penalty up to \u20B95,000. File immediately to minimize penalties.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Step 1: ITR Form Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold mb-4 block">
                        Choose ITR Form
                      </Label>
                      <div className="space-y-4">
                        <div
                          onClick={() => setItrForm("ITR-1")}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            itrForm === "ITR-1"
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-lg">ITR-1 (Sahaj)</h4>
                              <p className="text-sm text-gray-600 mt-1">For salaried individuals with income up to \u20B950 lakh</p>
                              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                                <li>• Salary income</li>
                                <li>• One house property</li>
                                <li>• Interest income</li>
                              </ul>
                            </div>
                            {itrForm === "ITR-1" && <CheckCircle className="w-5 h-5 text-blue-600" />}
                          </div>
                        </div>
                        
                        <div
                          onClick={() => setItrForm("ITR-2")}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            itrForm === "ITR-2"
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-lg">ITR-2</h4>
                              <p className="text-sm text-gray-600 mt-1">For individuals with capital gains or foreign income</p>
                              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                                <li>• Capital gains</li>
                                <li>• Multiple properties</li>
                                <li>• Foreign assets/income</li>
                              </ul>
                            </div>
                            {itrForm === "ITR-2" && <CheckCircle className="w-5 h-5 text-blue-600" />}
                          </div>
                        </div>
                        
                        <div
                          onClick={() => setItrForm("ITR-3")}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            itrForm === "ITR-3"
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-lg">ITR-3</h4>
                              <p className="text-sm text-gray-600 mt-1">For individuals with business/professional income</p>
                              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                                <li>• Business income</li>
                                <li>• Professional income</li>
                                <li>• Presumptive taxation</li>
                              </ul>
                            </div>
                            {itrForm === "ITR-3" && <CheckCircle className="w-5 h-5 text-blue-600" />}
                          </div>
                        </div>
                        
                        <div
                          onClick={() => setItrForm("ITR-4")}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            itrForm === "ITR-4"
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-lg">ITR-4 (Sugam)</h4>
                              <p className="text-sm text-gray-600 mt-1">For presumptive income from business/profession</p>
                              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                                <li>• Presumptive income only</li>
                                <li>• Turnover up to \u20B92 crore</li>
                                <li>• Simplified filing</li>
                              </ul>
                            </div>
                            {itrForm === "ITR-4" && <CheckCircle className="w-5 h-5 text-blue-600" />}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Based on your income sources, we recommend {itrForm || "ITR-1"}. You can change this selection if needed.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Step 2: Tax Regime */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold mb-4 block">
                        Select Tax Regime
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                          onClick={() => setTaxRegime("new")}
                          className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                            taxRegime === "new"
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-lg">New Tax Regime</h4>
                            {taxRegime === "new" && <CheckCircle className="w-5 h-5 text-blue-600" />}
                          </div>
                          <Badge className="mb-3 bg-green-100 text-green-800">Default & Recommended</Badge>
                          <div className="space-y-2 text-sm">
                            <p className="font-medium">Tax Slabs (AY 2024-25):</p>
                            <ul className="space-y-1 text-gray-600">
                              <li>• Up to \u20B93 lakh: Nil</li>
                              <li>• \u20B93-6 lakh: 5%</li>
                              <li>• \u20B96-9 lakh: 10%</li>
                              <li>• \u20B99-12 lakh: 15%</li>
                              <li>• \u20B912-15 lakh: 20%</li>
                              <li>• Above \u20B915 lakh: 30%</li>
                            </ul>
                            <p className="text-green-600 font-medium mt-3">✓ Standard deduction \u20B950,000</p>
                            <p className="text-red-600">✗ No Section 80C/80D deductions</p>
                          </div>
                        </div>
                        
                        <div
                          onClick={() => setTaxRegime("old")}
                          className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                            taxRegime === "old"
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-lg">Old Tax Regime</h4>
                            {taxRegime === "old" && <CheckCircle className="w-5 h-5 text-blue-600" />}
                          </div>
                          <Badge className="mb-3 bg-gray-100 text-gray-800">Optional</Badge>
                          <div className="space-y-2 text-sm">
                            <p className="font-medium">Tax Slabs:</p>
                            <ul className="space-y-1 text-gray-600">
                              <li>• Up to \u20B92.5 lakh: Nil</li>
                              <li>• \u20B92.5-5 lakh: 5%</li>
                              <li>• \u20B95-10 lakh: 20%</li>
                              <li>• Above \u20B910 lakh: 30%</li>
                            </ul>
                            <p className="text-green-600 font-medium mt-3">✓ All deductions available</p>
                            <p className="text-green-600">✓ Section 80C, 80D, HRA, etc.</p>
                            <p className="text-gray-500 mt-2">Better if deductions exceed \u20B91.5 lakh</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Alert className="bg-blue-50 border-blue-200">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        Based on initial calculation, the {taxRegime === "new" ? "New" : "Old"} Tax Regime appears more beneficial for you. 
                        Final calculation will be shown after entering all details.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Step 3: Personal & Bank Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">Personal & Bank Information</div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor="pan" className="text-xs text-gray-600">PAN *</Label>
                          <Input
                            id="pan"
                            type="text"
                            placeholder="ABCDE1234F"
                            value={personalInfo.pan}
                            onChange={(e) => setPersonalInfo({...personalInfo, pan: e.target.value.toUpperCase()})}
                            maxLength={10}
                            required
                            className="h-9 text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="aadhaar" className="text-xs text-gray-600">Aadhaar *</Label>
                          <Input
                            id="aadhaar"
                            type="text"
                            placeholder="123456789012"
                            value={personalInfo.aadhaar}
                            onChange={(e) => setPersonalInfo({...personalInfo, aadhaar: e.target.value})}
                            maxLength={12}
                            required
                            className="h-9 text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="name" className="text-xs text-gray-600">Full Name *</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="As per PAN"
                            value={personalInfo.name}
                            onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                            required
                            className="h-9 text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="dob" className="text-xs text-gray-600">DOB *</Label>
                          <Input
                            id="dob"
                            type="date"
                            value={personalInfo.dob}
                            onChange={(e) => setPersonalInfo({...personalInfo, dob: e.target.value})}
                            required
                            className="h-9 text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="mobile" className="text-xs text-gray-600">Mobile *</Label>
                          <Input
                            id="mobile"
                            type="tel"
                            placeholder="9876543210"
                            value={personalInfo.mobile}
                            onChange={(e) => setPersonalInfo({...personalInfo, mobile: e.target.value})}
                            maxLength={10}
                            required
                            className="h-9 text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email" className="text-xs text-gray-600">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            value={personalInfo.email}
                            onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                            required
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t">
                        <div className="text-xs font-medium text-gray-600 mb-2">Bank Details for Refund</div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <Label htmlFor="bankName" className="text-xs text-gray-600">Bank Name *</Label>
                            <Input
                              id="bankName"
                              type="text"
                              placeholder="SBI"
                              value={personalInfo.bankName}
                              onChange={(e) => setPersonalInfo({...personalInfo, bankName: e.target.value})}
                              required
                              className="h-9 text-sm"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="accountNumber" className="text-xs text-gray-600">Account No *</Label>
                            <Input
                              id="accountNumber"
                              type="text"
                              placeholder="1234567890"
                              value={personalInfo.accountNumber}
                              onChange={(e) => setPersonalInfo({...personalInfo, accountNumber: e.target.value})}
                              required
                              className="h-9 text-sm"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="ifscCode" className="text-xs text-gray-600">IFSC *</Label>
                            <Input
                              id="ifscCode"
                              type="text"
                              placeholder="SBIN0001234"
                              value={personalInfo.ifscCode}
                              onChange={(e) => setPersonalInfo({...personalInfo, ifscCode: e.target.value.toUpperCase()})}
                              required
                              className="h-9 text-sm"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="pincode" className="text-xs text-gray-600">Pincode *</Label>
                            <Input
                              id="pincode"
                              type="text"
                              placeholder="400001"
                              value={personalInfo.pincode}
                              onChange={(e) => setPersonalInfo({...personalInfo, pincode: e.target.value})}
                              maxLength={6}
                              required
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Label htmlFor="address" className="text-xs text-gray-600">Address *</Label>
                          <Input
                            id="address"
                            type="text"
                            placeholder="Complete residential address"
                            value={personalInfo.address}
                            onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                            required
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Ensure your Aadhaar is linked to PAN and bank account is pre-validated for smooth refund processing.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Step 4: Income Details */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-gray-700 mb-3">Select Income Sources</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {incomeTypes.map((type) => (
                        <div
                          key={type.id}
                          onClick={() => {
                            setSelectedIncomeTypes(prev =>
                              prev.includes(type.id)
                                ? prev.filter(id => id !== type.id)
                                : [...prev, type.id]
                            );
                          }}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedIncomeTypes.includes(type.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <type.icon className={`w-4 h-4 ${
                              selectedIncomeTypes.includes(type.id) ? 'text-blue-600' : 'text-gray-500'
                            }`} />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{type.label}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                            </div>
                            {selectedIncomeTypes.includes(type.id) && (
                              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Income Details */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold mb-4 block">
                        Enter income details
                      </Label>
                      <div className="space-y-4">
                        {selectedIncomeTypes.includes("salary") && (
                          <div>
                            <Label htmlFor="salary">Salary Income (Annual)</Label>
                            <Input
                              id="salary"
                              type="number"
                              placeholder="Enter annual salary"
                              value={incomeDetails.salary}
                              onChange={(e) => setIncomeDetails({...incomeDetails, salary: e.target.value})}
                            />
                          </div>
                        )}
                        {selectedIncomeTypes.includes("houseProperty") && (
                          <div>
                            <Label htmlFor="houseProperty">House Property Income</Label>
                            <Input
                              id="houseProperty"
                              type="number"
                              placeholder="Enter rental income"
                              value={incomeDetails.houseProperty}
                              onChange={(e) => setIncomeDetails({...incomeDetails, houseProperty: e.target.value})}
                            />
                          </div>
                        )}
                        {selectedIncomeTypes.includes("business") && (
                          <div>
                            <Label htmlFor="business">Business/Professional Income</Label>
                            <Input
                              id="business"
                              type="number"
                              placeholder="Enter business income"
                              value={incomeDetails.business}
                              onChange={(e) => setIncomeDetails({...incomeDetails, business: e.target.value})}
                            />
                          </div>
                        )}
                        {selectedIncomeTypes.includes("capitalGains") && (
                          <div>
                            <Label htmlFor="capitalGains">Capital Gains</Label>
                            <Input
                              id="capitalGains"
                              type="number"
                              placeholder="Enter capital gains"
                              value={incomeDetails.capitalGains}
                              onChange={(e) => setIncomeDetails({...incomeDetails, capitalGains: e.target.value})}
                            />
                          </div>
                        )}
                        {selectedIncomeTypes.includes("otherSources") && (
                          <div>
                            <Label htmlFor="otherSources">Income from Other Sources</Label>
                            <Input
                              id="otherSources"
                              type="number"
                              placeholder="Interest, dividends, etc."
                              value={incomeDetails.otherSources}
                              onChange={(e) => setIncomeDetails({...incomeDetails, otherSources: e.target.value})}
                            />
                          </div>
                        )}
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <h3 className="font-semibold text-lg mb-4">Tax Details (Mandatory)</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="tdsOnSalary">TDS on Salary (From Form 16) *</Label>
                          <Input
                            id="tdsOnSalary"
                            type="number"
                            placeholder="Enter TDS deducted on salary"
                            value={incomeDetails.tdsOnSalary}
                            onChange={(e) => setIncomeDetails({...incomeDetails, tdsOnSalary: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="tdsOther">TDS on Other Income *</Label>
                          <Input
                            id="tdsOther"
                            type="number"
                            placeholder="TDS on interest, rent etc."
                            value={incomeDetails.tdsOther}
                            onChange={(e) => setIncomeDetails({...incomeDetails, tdsOther: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="advanceTax">Advance Tax Paid</Label>
                          <Input
                            id="advanceTax"
                            type="number"
                            placeholder="If any advance tax paid"
                            value={incomeDetails.advanceTax}
                            onChange={(e) => setIncomeDetails({...incomeDetails, advanceTax: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="selfAssessmentTax">Self Assessment Tax</Label>
                          <Input
                            id="selfAssessmentTax"
                            type="number"
                            placeholder="If any self assessment tax paid"
                            value={incomeDetails.selfAssessmentTax}
                            onChange={(e) => setIncomeDetails({...incomeDetails, selfAssessmentTax: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="tcs">TCS (Tax Collected at Source)</Label>
                          <Input
                            id="tcs"
                            type="number"
                            placeholder="If any TCS collected"
                            value={incomeDetails.tcs}
                            onChange={(e) => setIncomeDetails({...incomeDetails, tcs: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Gross Income:</span>
                          <span className="text-xl font-bold text-blue-600">
                            \u20B9{(parseFloat(incomeDetails.salary) || 0) + 
                              (parseFloat(incomeDetails.houseProperty) || 0) + 
                              (parseFloat(incomeDetails.business) || 0) + 
                              (parseFloat(incomeDetails.capitalGains) || 0) + 
                              (parseFloat(incomeDetails.otherSources) || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Tax Paid:</span>
                          <span className="text-xl font-bold text-green-600">
                            \u20B9{(parseFloat(incomeDetails.tdsOnSalary) || 0) + 
                              (parseFloat(incomeDetails.tdsOther) || 0) + 
                              (parseFloat(incomeDetails.advanceTax) || 0) + 
                              (parseFloat(incomeDetails.selfAssessmentTax) || 0) + 
                              (parseFloat(incomeDetails.tcs) || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Deductions */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-gray-700 mb-3">Claim Your Deductions</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="80C" className="text-xs text-gray-600">Section 80C (Max \u20B91.5L)</Label>
                        <Input
                          id="80C"
                          type="number"
                          placeholder="PF, PPF, ELSS, LIC"
                          value={deductions.section80C}
                          onChange={(e) => setDeductions({...deductions, section80C: e.target.value})}
                          max="150000"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="80CCD" className="text-xs text-gray-600">Section 80CCD-NPS (Max \u20B950K)</Label>
                        <Input
                          id="80CCD"
                          type="number"
                          placeholder="National Pension Scheme"
                          value={deductions.section80CCD}
                          onChange={(e) => setDeductions({...deductions, section80CCD: e.target.value})}
                          max="50000"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="80D" className="text-xs text-gray-600">Section 80D (Medical)</Label>
                        <Input
                          id="80D"
                          type="number"
                          placeholder="Health insurance"
                          value={deductions.section80D}
                          onChange={(e) => setDeductions({...deductions, section80D: e.target.value})}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="80G" className="text-xs text-gray-600">Section 80G (Donations)</Label>
                        <Input
                          id="80G"
                          type="number"
                          placeholder="Charitable donations"
                          value={deductions.section80G}
                          onChange={(e) => setDeductions({...deductions, section80G: e.target.value})}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="homeLoan" className="text-xs text-gray-600">Home Loan (Max \u20B92L)</Label>
                        <Input
                          id="homeLoan"
                          type="number"
                          placeholder="Interest paid"
                          value={deductions.homeLoanInterest}
                          onChange={(e) => setDeductions({...deductions, homeLoanInterest: e.target.value})}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="80DD" className="text-xs text-gray-600">Section 80DD</Label>
                        <Input
                          id="80DD"
                          type="number"
                          placeholder="Disability deduction"
                          value={deductions.section80DD}
                          onChange={(e) => setDeductions({...deductions, section80DD: e.target.value})}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Deductions Claimed:</span>
                        <span className="text-2xl font-bold text-green-600">
                          \u20B9{((parseFloat(deductions.section80C) || 0) + 
                            (parseFloat(deductions.section80CCD) || 0) + 
                            (parseFloat(deductions.section80D) || 0) + 
                            (parseFloat(deductions.section80G) || 0) + 
                            (parseFloat(deductions.section80DD) || 0) + 
                            (parseFloat(deductions.homeLoanInterest) || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Tax Computation */}
                {currentStep === 6 && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-gray-700 mb-3">Tax Computation Summary</div>
                    
                    {!taxComputed ? (
                      <div className="text-center py-4">
                        <Button 
                          size="sm" 
                          onClick={() => setTaxComputed(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Calculator className="h-4 w-4 mr-1" />
                          Calculate Tax
                        </Button>
                      </div>
                    ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          {(() => {
                            const taxData = calculateTax();
                            return (
                              <>
                                <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                                  <div className="flex justify-between">
                                    <span>Gross Total Income:</span>
                                    <span className="font-medium">\u20B9{taxData.totalIncome.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Less: Deductions:</span>
                                    <span className="font-medium text-red-600">-\u20B9{taxData.totalDeductions.toLocaleString()}</span>
                                  </div>
                                  <Separator />
                                  <div className="flex justify-between text-lg font-semibold">
                                    <span>Net Taxable Income:</span>
                                    <span>\u20B9{taxData.taxableIncome.toLocaleString()}</span>
                                  </div>
                                </div>

                                <div className="bg-blue-50 p-6 rounded-lg space-y-3">
                                  <div className="flex justify-between">
                                    <span>Income Tax:</span>
                                    <span className="font-medium">\u20B9{taxData.tax.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Health & Education Cess (4%):</span>
                                    <span className="font-medium">\u20B9{taxData.cess.toLocaleString()}</span>
                                  </div>
                                  <Separator />
                                  <div className="flex justify-between text-xl font-bold">
                                    <span>Total Tax Payable:</span>
                                    <span className="text-blue-600">\u20B9{taxData.totalTax.toLocaleString()}</span>
                                  </div>
                                </div>

                                <div className="bg-purple-50 p-6 rounded-lg space-y-3">
                                  <div className="flex justify-between">
                                    <span>Total Tax Payable:</span>
                                    <span className="font-medium">\u20B9{taxData.totalTax.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Less: Taxes Already Paid:</span>
                                    <span className="font-medium text-purple-600">-\u20B9{taxData.taxesPaid.toLocaleString()}</span>
                                  </div>
                                  <Separator />
                                  <div className="flex justify-between text-xl font-bold">
                                    <span>{taxData.refundDue >= 0 ? 'Refund Due:' : 'Tax Payable:'}</span>
                                    <span className={taxData.refundDue >= 0 ? 'text-green-600' : 'text-red-600'}>
                                      \u20B9{Math.abs(taxData.refundDue).toLocaleString()}
                                    </span>
                                  </div>
                                </div>

                                <Alert className={taxData.refundDue >= 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
                                  <CheckCircle className={`h-4 w-4 ${taxData.refundDue >= 0 ? 'text-green-600' : 'text-yellow-600'}`} />
                                  <AlertDescription className={taxData.refundDue >= 0 ? 'text-green-800' : 'text-yellow-800'}>
                                    {taxData.refundDue >= 0 
                                      ? `Good news! You are eligible for a refund of \u20B9${taxData.refundDue.toLocaleString()}. Ensure your bank details are correct.`
                                      : `You need to pay additional tax of \u20B9${Math.abs(taxData.refundDue).toLocaleString()} before filing.`
                                    }
                                  </AlertDescription>
                                </Alert>
                              </>
                            );
                          })()}
                        </motion.div>
                    )}
                  </div>
                )}

                {/* Step 7: Payment */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold mb-4 block">
                        Tax Payment Details
                      </Label>
                      
                      {(() => {
                        const taxData = calculateTax();
                        return (
                          <>
                            {taxData.refundDue < 0 ? (
                              <div className="space-y-4">
                                <Alert className="bg-red-50 border-red-200">
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                  <AlertDescription className="text-red-800">
                                    You have tax payable of \u20B9{Math.abs(taxData.refundDue).toLocaleString()}. 
                                    Please pay before filing your return.
                                  </AlertDescription>
                                </Alert>
                                
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Payment Options</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Button variant="outline" className="h-auto p-4 justify-start">
                                        <div className="text-left">
                                          <div className="font-medium">Pay Online</div>
                                          <div className="text-sm text-gray-500">Using Net Banking/UPI/Cards</div>
                                        </div>
                                      </Button>
                                      <Button variant="outline" className="h-auto p-4 justify-start">
                                        <div className="text-left">
                                          <div className="font-medium">Generate Challan</div>
                                          <div className="text-sm text-gray-500">Pay at bank branch</div>
                                        </div>
                                      </Button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="challan">Challan Number (After Payment)</Label>
                                      <Input 
                                        id="challan"
                                        placeholder="Enter challan number"
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <Alert className="bg-green-50 border-green-200">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <AlertDescription className="text-green-800">
                                    Great! You have a refund of \u20B9{taxData.refundDue.toLocaleString()} due. 
                                    No payment required.
                                  </AlertDescription>
                                </Alert>
                                
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Refund Details</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm text-gray-600 mb-4">
                                      Your refund will be processed to your bank account after verification.
                                    </p>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>Bank Account:</span>
                                        <span className="font-medium">{personalInfo.accountNumber}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>IFSC Code:</span>
                                        <span className="font-medium">{personalInfo.ifscCode}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Step 8: Preview & Validate */}
                {currentStep === 8 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold mb-4 block">
                        Preview & Validate Your Return
                      </Label>
                      
                      <Tabs defaultValue="review" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="review">Review</TabsTrigger>
                          <TabsTrigger value="documents">Documents</TabsTrigger>
                          <TabsTrigger value="file">File ITR</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="review" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Summary for AY {assessmentYear}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {(() => {
                                const taxData = calculateTax();
                                return (
                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                      <span>Assessment Year:</span>
                                      <span className="font-medium">{assessmentYear}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Total Income:</span>
                                      <span className="font-medium">\u20B9{taxData.totalIncome.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Total Deductions:</span>
                                      <span className="font-medium">\u20B9{taxData.totalDeductions.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Tax Payable:</span>
                                      <span className="font-medium text-blue-600">\u20B9{taxData.totalTax.toLocaleString()}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </CardContent>
                          </Card>
                        </TabsContent>
                        
                        <TabsContent value="documents" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Required Documents</CardTitle>
                              <CardDescription>Upload these documents for filing</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-gray-500" />
                                  <span>Form 16 (If salaried)</span>
                                </div>
                                <Button size="sm" variant="outline">
                                  <Upload className="h-4 w-4 mr-1" />
                                  Upload
                                </Button>
                              </div>
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-gray-500" />
                                  <span>Bank Statements</span>
                                </div>
                                <Button size="sm" variant="outline">
                                  <Upload className="h-4 w-4 mr-1" />
                                  Upload
                                </Button>
                              </div>
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-gray-500" />
                                  <span>Investment Proofs</span>
                                </div>
                                <Button size="sm" variant="outline">
                                  <Upload className="h-4 w-4 mr-1" />
                                  Upload
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                        
                        <TabsContent value="file" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Ready to File</CardTitle>
                              <CardDescription>Complete your ITR filing</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-start space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                  <p className="font-medium">All details verified</p>
                                  <p className="text-sm text-gray-600">Your tax computation is complete and accurate</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                  <p className="font-medium">Documents ready</p>
                                  <p className="text-sm text-gray-600">All required documents are available</p>
                                </div>
                              </div>
                              
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-800 mb-3">
                                  By filing your return, you confirm that all information provided is true and correct.
                                </p>
                                <div className="flex gap-3">
                                  <Button variant="outline" className="flex-1">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Draft
                                  </Button>
                                  <Button variant="outline" className="flex-1">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview
                                  </Button>
                                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                    <Send className="mr-2 h-4 w-4" />
                                    File ITR
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                )}

                {/* Step 9: Submit & E-Verify */}
                {currentStep === 9 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold mb-4 block">
                        Submit & E-Verify Your Return
                      </Label>
                      
                      <div className="space-y-6">
                        {/* Submission Status */}
                        <Card>
                          <CardHeader>
                            <CardTitle>ITR Submission Status</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                                <div>
                                  <p className="font-medium">ITR Successfully Submitted!</p>
                                  <p className="text-sm text-gray-600">Acknowledgment Number: <span className="font-mono">ITR-{Date.now()}</span></p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                            
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Your ITR has been submitted successfully. Now complete the e-verification within 30 days to finalize your filing.
                              </AlertDescription>
                            </Alert>
                          </CardContent>
                        </Card>

                        {/* E-Verification Options */}
                        <Card>
                          <CardHeader>
                            <CardTitle>E-Verification Methods</CardTitle>
                            <CardDescription>Choose any method to verify your return</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4">
                              <Button variant="outline" className="h-auto p-4 justify-start text-left">
                                <div className="flex-1">
                                  <div className="font-medium mb-1">Aadhaar OTP</div>
                                  <div className="text-sm text-gray-500">Instant verification using Aadhaar linked mobile</div>
                                </div>
                                <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                              </Button>
                              
                              <Button variant="outline" className="h-auto p-4 justify-start text-left">
                                <div className="flex-1">
                                  <div className="font-medium mb-1">Net Banking</div>
                                  <div className="text-sm text-gray-500">Login to your bank account for verification</div>
                                </div>
                              </Button>
                              
                              <Button variant="outline" className="h-auto p-4 justify-start text-left">
                                <div className="flex-1">
                                  <div className="font-medium mb-1">Bank ATM</div>
                                  <div className="text-sm text-gray-500">Generate EVC at ATM using debit card</div>
                                </div>
                              </Button>
                              
                              <Button variant="outline" className="h-auto p-4 justify-start text-left">
                                <div className="flex-1">
                                  <div className="font-medium mb-1">DSC (Digital Signature)</div>
                                  <div className="text-sm text-gray-500">Use your digital signature certificate</div>
                                </div>
                              </Button>
                              
                              <Button variant="outline" className="h-auto p-4 justify-start text-left">
                                <div className="flex-1">
                                  <div className="font-medium mb-1">EVC through Bank Account</div>
                                  <div className="text-sm text-gray-500">Pre-validate bank account and generate EVC</div>
                                </div>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Success Message */}
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-6">
                            <div className="text-center space-y-4">
                              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-blue-900">Congratulations!</h3>
                                <p className="text-blue-700 mt-2">
                                  Your Income Tax Return for AY {assessmentYear} has been successfully filed.
                                </p>
                                <p className="text-sm text-blue-600 mt-3">
                                  Please complete e-verification to finalize the process.
                                </p>
                              </div>
                              <div className="flex gap-3 justify-center">
                                <Button variant="outline">
                                  <Home className="h-4 w-4 mr-1" />
                                  Go to Dashboard
                                </Button>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                  <FileText className="h-4 w-4 mr-1" />
                                  File Another Return
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const React = { createElement: (component: any, props: any) => {
  const Comp = component;
  return <Comp {...props} />;
}};