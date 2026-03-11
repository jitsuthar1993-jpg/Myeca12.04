import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, User, Building, Wallet, Calculator, Save, Send, 
  Check, AlertCircle, Download, Home, TrendingUp, Briefcase, FileJson
} from "lucide-react";
import { ITRGenerator, CompactFormData } from "@/utils/itr-generator";

export function CompactFilingGuidePage() {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const assessmentYear = `${currentYear}-${(currentYear + 1).toString().slice(2)}`;
  
  // Form Data States
  const [filingType, setFilingType] = useState("original");
  const [itrForm, setItrForm] = useState("ITR-1");
  const [taxRegime, setTaxRegime] = useState("new");
  
  // Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    pan: "", aadhaar: "", name: "", dob: "", mobile: "", email: "",
    bankName: "", accountNumber: "", ifscCode: "", address: "", pincode: ""
  });
  
  // Income Details
  const [income, setIncome] = useState({
    salary: "", houseProperty: "", business: "", capitalGains: "", 
    otherSources: "", tdsOnSalary: "", tdsOther: "", advanceTax: ""
  });
  
  // Deductions
  const [deductions, setDeductions] = useState({
    section80C: "", section80CCD: "", section80D: "", section80G: "", 
    homeLoanInterest: "", section80DD: ""
  });

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      const formData = { filingType, itrForm, taxRegime, personalInfo, income, deductions };
      localStorage.setItem('itrDraft', JSON.stringify(formData));
      toast({
        title: "Auto-saved",
        description: "Your progress has been saved",
        duration: 1000,
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [filingType, itrForm, taxRegime, personalInfo, income, deductions]);

  // Load saved draft
  useEffect(() => {
    const savedData = localStorage.getItem('itrDraft');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFilingType(parsed.filingType || "original");
      setItrForm(parsed.itrForm || "ITR-1");
      setTaxRegime(parsed.taxRegime || "new");
      setPersonalInfo(parsed.personalInfo || personalInfo);
      setIncome(parsed.income || income);
      setDeductions(parsed.deductions || deductions);
    }
  }, []);

  // Tax Calculation
  const calculateTax = () => {
    const totalIncome = Object.values(income).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const taxableIncome = Math.max(0, totalIncome - totalDeductions);
    
    let tax = 0;
    if (taxRegime === "new") {
      if (taxableIncome > 300000) tax += (Math.min(taxableIncome, 700000) - 300000) * 0.05;
      if (taxableIncome > 700000) tax += (Math.min(taxableIncome, 1000000) - 700000) * 0.10;
      if (taxableIncome > 1000000) tax += (Math.min(taxableIncome, 1200000) - 1000000) * 0.15;
      if (taxableIncome > 1200000) tax += (Math.min(taxableIncome, 1500000) - 1200000) * 0.20;
      if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30;
    } else {
      if (taxableIncome > 250000) tax += (Math.min(taxableIncome, 500000) - 250000) * 0.05;
      if (taxableIncome > 500000) tax += (Math.min(taxableIncome, 1000000) - 500000) * 0.20;
      if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30;
    }
    
    const totalTaxPaid = (parseFloat(income.tdsOnSalary) || 0) + (parseFloat(income.tdsOther) || 0) + (parseFloat(income.advanceTax) || 0);
    const refundDue = totalTaxPaid - tax;
    
    return { totalIncome, totalDeductions, taxableIncome, tax, totalTaxPaid, refundDue };
  };

  const itrGenerator = new ITRGenerator();

  const handleGenerateITR = () => {
    // Validate required fields
    if (!personalInfo.pan || !personalInfo.aadhaar || !personalInfo.name || !personalInfo.dob) {
      toast({
        title: "Missing Required Information",
        description: "Please fill in all personal information fields",
        variant: "destructive",
      });
      return;
    }

    if (!personalInfo.bankName || !personalInfo.accountNumber || !personalInfo.ifscCode) {
      toast({
        title: "Missing Bank Details",
        description: "Please fill in all bank details for refund processing",
        variant: "destructive",
      });
      return;
    }

    // Create form data object
    const formData: CompactFormData = {
      filingType,
      itrForm,
      taxRegime,
      personalInfo,
      income,
      deductions,
    };

    try {
      // Generate ITR-1
      const itrData = itrGenerator.generateITR1(formData);
      
      // Validate ITR
      const validation = itrGenerator.validateITR(itrData);
      if (!validation.valid) {
        toast({
          title: "Validation Failed",
          description: validation.errors.join(", "),
          variant: "destructive",
        });
        return;
      }

      // Download ITR JSON
      const filename = `ITR1_${personalInfo.pan}_AY${assessmentYear.replace('-', '')}.json`;
      itrGenerator.downloadITRJSON(itrData, filename);
      
      toast({
        title: "ITR Generated Successfully!",
        description: `Your ITR-1 for AY ${assessmentYear} has been generated and downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Error Generating ITR",
        description: "An error occurred while generating your ITR. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = () => {
    // First generate the ITR
    handleGenerateITR();
    
    // Then show submission success
    setTimeout(() => {
      toast({
        title: "ITR Submitted Successfully!",
        description: `Your return for AY ${assessmentYear} has been filed. Acknowledgment: ITR-${Date.now()}`,
      });
    }, 1000);
  };

  const taxData = calculateTax();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold">ITR Filing Form - AY {assessmentYear}</h1>
          <p className="text-sm text-gray-600">Complete all sections below to file your return</p>
        </div>

        {/* Main Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Basic Info & Income */}
          <div className="space-y-4">
            {/* Filing Details */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Filing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select value={filingType} onValueChange={setFilingType}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Original</SelectItem>
                        <SelectItem value="revised">Revised</SelectItem>
                        <SelectItem value="belated">Belated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Form</Label>
                    <Select value={itrForm} onValueChange={setItrForm}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ITR-1">ITR-1</SelectItem>
                        <SelectItem value="ITR-2">ITR-2</SelectItem>
                        <SelectItem value="ITR-3">ITR-3</SelectItem>
                        <SelectItem value="ITR-4">ITR-4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Regime</Label>
                    <Select value={taxRegime} onValueChange={setTaxRegime}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="old">Old</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">PAN</Label>
                    <Input
                      value={personalInfo.pan}
                      onChange={(e) => setPersonalInfo({...personalInfo, pan: e.target.value.toUpperCase()})}
                      placeholder="ABCDE1234F"
                      className="h-8 text-xs"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Aadhaar</Label>
                    <Input
                      value={personalInfo.aadhaar}
                      onChange={(e) => setPersonalInfo({...personalInfo, aadhaar: e.target.value})}
                      placeholder="123456789012"
                      className="h-8 text-xs"
                      maxLength={12}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                      placeholder="As per PAN"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">DOB</Label>
                    <Input
                      type="date"
                      value={personalInfo.dob}
                      onChange={(e) => setPersonalInfo({...personalInfo, dob: e.target.value})}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Mobile</Label>
                    <Input
                      value={personalInfo.mobile}
                      onChange={(e) => setPersonalInfo({...personalInfo, mobile: e.target.value})}
                      placeholder="9876543210"
                      className="h-8 text-xs"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                      placeholder="email@example.com"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Income Details */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Income Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Salary</Label>
                    <Input
                      type="number"
                      value={income.salary}
                      onChange={(e) => setIncome({...income, salary: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">House Property</Label>
                    <Input
                      type="number"
                      value={income.houseProperty}
                      onChange={(e) => setIncome({...income, houseProperty: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Business</Label>
                    <Input
                      type="number"
                      value={income.business}
                      onChange={(e) => setIncome({...income, business: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Capital Gains</Label>
                    <Input
                      type="number"
                      value={income.capitalGains}
                      onChange={(e) => setIncome({...income, capitalGains: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Other Sources</Label>
                    <Input
                      type="number"
                      value={income.otherSources}
                      onChange={(e) => setIncome({...income, otherSources: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">TDS Deducted</Label>
                    <Input
                      type="number"
                      value={income.tdsOnSalary}
                      onChange={(e) => setIncome({...income, tdsOnSalary: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Bank & Deductions */}
          <div className="space-y-4">
            {/* Bank Details */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Bank Name</Label>
                    <Input
                      value={personalInfo.bankName}
                      onChange={(e) => setPersonalInfo({...personalInfo, bankName: e.target.value})}
                      placeholder="SBI"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Account No</Label>
                    <Input
                      value={personalInfo.accountNumber}
                      onChange={(e) => setPersonalInfo({...personalInfo, accountNumber: e.target.value})}
                      placeholder="1234567890"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">IFSC</Label>
                    <Input
                      value={personalInfo.ifscCode}
                      onChange={(e) => setPersonalInfo({...personalInfo, ifscCode: e.target.value.toUpperCase()})}
                      placeholder="SBIN0001234"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Pincode</Label>
                    <Input
                      value={personalInfo.pincode}
                      onChange={(e) => setPersonalInfo({...personalInfo, pincode: e.target.value})}
                      placeholder="400001"
                      className="h-8 text-xs"
                      maxLength={6}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Address</Label>
                  <Input
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                    placeholder="Complete address"
                    className="h-8 text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Deductions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">80C (Max 1.5L)</Label>
                    <Input
                      type="number"
                      value={deductions.section80C}
                      onChange={(e) => setDeductions({...deductions, section80C: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                      max="150000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">80CCD-NPS (Max 50K)</Label>
                    <Input
                      type="number"
                      value={deductions.section80CCD}
                      onChange={(e) => setDeductions({...deductions, section80CCD: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                      max="50000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">80D (Medical)</Label>
                    <Input
                      type="number"
                      value={deductions.section80D}
                      onChange={(e) => setDeductions({...deductions, section80D: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">80G (Donations)</Label>
                    <Input
                      type="number"
                      value={deductions.section80G}
                      onChange={(e) => setDeductions({...deductions, section80G: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Home Loan (24)</Label>
                    <Input
                      type="number"
                      value={deductions.homeLoanInterest}
                      onChange={(e) => setDeductions({...deductions, homeLoanInterest: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">80DD (Disability)</Label>
                    <Input
                      type="number"
                      value={deductions.section80DD}
                      onChange={(e) => setDeductions({...deductions, section80DD: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Details */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Tax Paid Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">TDS Other</Label>
                    <Input
                      type="number"
                      value={income.tdsOther}
                      onChange={(e) => setIncome({...income, tdsOther: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Advance Tax</Label>
                    <Input
                      type="number"
                      value={income.advanceTax}
                      onChange={(e) => setIncome({...income, advanceTax: e.target.value})}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-4">
            {/* Tax Computation Summary */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Tax Computation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Gross Income:</span>
                    <span className="font-medium">\u20B9{taxData.totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deductions:</span>
                    <span className="font-medium text-red-600">-\u20B9{taxData.totalDeductions.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Taxable Income:</span>
                    <span>\u20B9{taxData.taxableIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Liability:</span>
                    <span>\u20B9{taxData.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Paid:</span>
                    <span>\u20B9{taxData.totalTaxPaid.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>{taxData.refundDue >= 0 ? 'Refund Due:' : 'Tax Payable:'}</span>
                    <span className={taxData.refundDue >= 0 ? 'text-green-600' : 'text-red-600'}>
                      \u20B9{Math.abs(taxData.refundDue).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Alert */}
            {taxData.refundDue >= 0 ? (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-xs text-green-800">
                  Good news! You are eligible for a refund. Ensure bank details are correct.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-xs text-red-800">
                  You have tax payable. Pay before filing to avoid interest.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full h-8 text-xs" variant="outline">
                  <Save className="h-3 w-3 mr-1" />
                  Save Draft
                </Button>
                <Button 
                  className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleGenerateITR}
                >
                  <FileJson className="h-3 w-3 mr-1" />
                  Generate ITR JSON
                </Button>
                <Button className="w-full h-8 text-xs" variant="outline">
                  <FileText className="h-3 w-3 mr-1" />
                  Preview Return
                </Button>
                <Button 
                  className="w-full h-8 text-xs bg-green-600 hover:bg-green-700"
                  onClick={handleSubmit}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Submit ITR
                </Button>
                <Separator />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Download PDF
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                    <Home className="h-3 w-3 mr-1" />
                    Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Alert>
              <Briefcase className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Need help? Call our CA experts at 1800-123-4567 or use live chat.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}