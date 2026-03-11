import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCcw,
  Info,
  Building2,
  User,
  Wallet,
  PiggyBank,
  Calendar,
  Edit,
  Copy,
  Eye,
  FileImage,
  Scan,
  AlertTriangle
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { motion } from "framer-motion";
import {
  Form16Data,
  parseForm16Text,
  validateForm16Data,
  exportForm16ForITR,
} from "@/lib/form16-ocr";

export default function Form16ParserPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Form16Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload with OCR
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setError(null);
    setIsLoading(true);
    setOcrProgress(10);

    try {
      // Check if it's an image file that needs OCR
      const isImage = uploadedFile.type.startsWith('image/');
      const isPDF = uploadedFile.type === 'application/pdf';

      if (isImage) {
        // Dynamic import of Tesseract.js for OCR
        setOcrProgress(20);
        const Tesseract = await import('tesseract.js');
        
        setOcrProgress(30);
        const result = await Tesseract.recognize(
          uploadedFile,
          'eng',
          {
            logger: (info) => {
              if (info.status === 'recognizing text') {
                setOcrProgress(30 + (info.progress * 60));
              }
            },
          }
        );

        setOcrProgress(95);
        const text = result.data.text;
        setRawText(text);
        
        const data = parseForm16Text(text);
        const validation = validateForm16Data(data);
        
        setParsedData(data);
        setValidationResult(validation);
      } else if (isPDF) {
        // For PDF, we need to inform user to convert to image first
        // or use a different library (pdf.js + tesseract)
        setError("PDF files require conversion. Please take a screenshot of your Form 16 and upload as an image (JPG/PNG).");
      } else {
        // Try to read as text file
        const text = await uploadedFile.text();
        setRawText(text);
        
        const data = parseForm16Text(text);
        const validation = validateForm16Data(data);
        
        setParsedData(data);
        setValidationResult(validation);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError(err instanceof Error ? err.message : "Failed to process file. Please try the manual text input option.");
    } finally {
      setIsLoading(false);
      setOcrProgress(100);
    }
  }, []);

  // Handle manual text input
  const handleTextSubmit = () => {
    if (!rawText.trim()) {
      setError("Please paste the Form 16 text");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const data = parseForm16Text(rawText);
      const validation = validateForm16Data(data);
      
      setParsedData(data);
      setValidationResult(validation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse text");
    } finally {
      setIsLoading(false);
    }
  };

  // Export data
  const handleExport = () => {
    if (!parsedData) return;

    const content = exportForm16ForITR(parsedData);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form16-extracted-data.txt";
    document.body.appendChild(a);
    a.click();
    if (a.parentNode) a.remove();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!parsedData) return;
    const content = exportForm16ForITR(parsedData);
    await navigator.clipboard.writeText(content);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `\u20B9${amount.toLocaleString('en-IN')}`;
  };

  // Reset
  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setRawText("");
    setError(null);
    setValidationResult(null);
    setOcrProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-emerald-200 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-emerald-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Form 16 Parser</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Scan className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Form 16 Parser
                <Badge variant="secondary" className="bg-white/20 text-white">AI-Powered</Badge>
              </h1>
              <p className="text-emerald-200 mt-1">
                Extract salary and TDS details from your Form 16 automatically
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        {!parsedData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload or Paste Form 16</CardTitle>
              <CardDescription>
                Upload an image of your Form 16 or paste the text content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'upload' | 'text')} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    Upload Image
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Paste Text
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                      isLoading ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50'
                    }`}
                  >
                    {isLoading ? (
                      <div className="space-y-4">
                        <Scan className="h-12 w-12 mx-auto text-emerald-500 animate-pulse" />
                        <p className="text-gray-600">Processing your Form 16...</p>
                        <div className="w-64 mx-auto">
                          <Progress value={ocrProgress} className="h-2" />
                          <p className="text-sm text-gray-500 mt-2">
                            {ocrProgress < 30 ? 'Loading OCR engine...' :
                             ocrProgress < 90 ? 'Extracting text...' :
                             'Parsing data...'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-gray-400" />
                        <div>
                          <p className="text-lg font-medium text-gray-700">
                            Upload Form 16 Image
                          </p>
                          <p className="text-gray-500 mt-1">JPG, PNG, or screenshot</p>
                        </div>
                        <Label htmlFor="form16-upload">
                          <Input
                            ref={fileInputRef}
                            id="form16-upload"
                            type="file"
                            accept="image/*,.txt"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                          <Button variant="outline" className="mt-2" asChild>
                            <span>Select Image</span>
                          </Button>
                        </Label>
                      </div>
                    )}
                  </div>

                  <Alert className="mt-4 bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      For best results, take a clear screenshot of your Form 16. Make sure all text is readable.
                      Both Part A and Part B are supported.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="text">
                  <div className="space-y-4">
                    <Textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="Paste your Form 16 text content here...

Example content:
Assessment Year: 2025-26
Employer: ABC Company Ltd
TAN: DELA12345B
Employee PAN: ABCDE1234F
Gross Salary: 10,00,000
Standard Deduction: 75,000
..."
                      className="min-h-[300px] font-mono text-sm"
                    />
                    <Button 
                      onClick={handleTextSubmit} 
                      disabled={!rawText.trim() || isLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Scan className="mr-2 h-4 w-4" />
                          Parse Form 16
                        </>
                      )}
                    </Button>
                  </div>

                  <Alert className="mt-4 bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      Copy all text from your Form 16 PDF/document. You can use Ctrl+A to select all, then Ctrl+C to copy.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {parsedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Confidence & Validation */}
            <div className="flex flex-wrap gap-4 items-center">
              <Badge 
                variant={parsedData.extractionConfidence >= 70 ? 'default' : parsedData.extractionConfidence >= 50 ? 'secondary' : 'destructive'}
                className={`text-sm py-1 px-3 ${
                  parsedData.extractionConfidence >= 70 ? 'bg-green-500' : 
                  parsedData.extractionConfidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              >
                Extraction Confidence: {parsedData.extractionConfidence}%
              </Badge>
              
              {validationResult && (
                validationResult.isValid ? (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Validation Passed
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validationResult.errors.length} Issues Found
                  </Badge>
                )
              )}
            </div>

            {/* Warnings */}
            {parsedData.warnings.length > 0 && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Review Required</AlertTitle>
                <AlertDescription className="text-amber-700">
                  <ul className="list-disc list-inside mt-2">
                    {parsedData.warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Gross Salary</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.partB.grossSalary)}</p>
                    </div>
                    <Wallet className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">TDS Deducted</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.partA.totalTDSDeducted)}</p>
                    </div>
                    <PiggyBank className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Total Deductions</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.partB.deductions.totalDeductions)}</p>
                    </div>
                    <FileText className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Taxable Income</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.partB.totalTaxableIncome)}</p>
                    </div>
                    <Calendar className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
                <Download className="mr-2 h-4 w-4" />
                Export for ITR
              </Button>
              <Button variant="outline" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Data
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Parse Another
              </Button>
              <Link href="/calculators/income-tax">
                <Button variant="outline">
                  <Wallet className="mr-2 h-4 w-4" />
                  Calculate Tax
                </Button>
              </Link>
            </div>

            {/* Detailed Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employer & Employee Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Employer & Employee Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Employer</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-blue-600">Name:</span> {parsedData.employer.name}</p>
                      <p><span className="text-blue-600">TAN:</span> {parsedData.employer.tan || 'Not Found'}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Employee</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-green-600">Name:</span> {parsedData.employee.name}</p>
                      <p><span className="text-green-600">PAN:</span> {parsedData.employee.pan || 'Not Found'}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Assessment Period</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-purple-600">Financial Year:</span> {parsedData.financialYear}</p>
                      <p><span className="text-purple-600">Assessment Year:</span> {parsedData.assessmentYear}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Salary Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-green-600" />
                    Salary Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span>Gross Salary</span>
                    <span className="font-medium">{formatCurrency(parsedData.partB.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b text-green-600">
                    <span>(-) HRA Exemption</span>
                    <span>{formatCurrency(parsedData.partB.exemptAllowances.hra)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b text-green-600">
                    <span>(-) LTA</span>
                    <span>{formatCurrency(parsedData.partB.exemptAllowances.lta)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b text-green-600">
                    <span>(-) Standard Deduction</span>
                    <span>{formatCurrency(parsedData.partB.standardDeduction)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b text-green-600">
                    <span>(-) Professional Tax</span>
                    <span>{formatCurrency(parsedData.partB.professionalTax)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-medium">
                    <span>Income from Salaries</span>
                    <span>{formatCurrency(parsedData.partB.incomeChargeableSalaries)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Deductions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-purple-600" />
                    Chapter VI-A Deductions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {parsedData.partB.deductions.section80C > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span>Section 80C</span>
                      <span className="font-medium text-purple-600">{formatCurrency(parsedData.partB.deductions.section80C)}</span>
                    </div>
                  )}
                  {parsedData.partB.deductions.section80D > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span>Section 80D (Health Insurance)</span>
                      <span className="font-medium text-purple-600">{formatCurrency(parsedData.partB.deductions.section80D)}</span>
                    </div>
                  )}
                  {parsedData.partB.deductions.section80CCD1B > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span>Section 80CCD(1B) NPS</span>
                      <span className="font-medium text-purple-600">{formatCurrency(parsedData.partB.deductions.section80CCD1B)}</span>
                    </div>
                  )}
                  {parsedData.partB.deductions.section80E > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span>Section 80E (Education Loan)</span>
                      <span className="font-medium text-purple-600">{formatCurrency(parsedData.partB.deductions.section80E)}</span>
                    </div>
                  )}
                  {parsedData.partB.deductions.section80G > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span>Section 80G (Donations)</span>
                      <span className="font-medium text-purple-600">{formatCurrency(parsedData.partB.deductions.section80G)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 font-bold text-purple-700">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(parsedData.partB.deductions.totalDeductions)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Computation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    Tax Computation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span>Total Taxable Income</span>
                    <span className="font-medium">{formatCurrency(parsedData.partB.totalTaxableIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Tax on Total Income</span>
                    <span>{formatCurrency(parsedData.partB.taxOnTotalIncome)}</span>
                  </div>
                  {parsedData.partB.rebate87A > 0 && (
                    <div className="flex justify-between py-2 border-b text-green-600">
                      <span>(-) Rebate u/s 87A</span>
                      <span>{formatCurrency(parsedData.partB.rebate87A)}</span>
                    </div>
                  )}
                  {parsedData.partB.surcharge > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span>(+) Surcharge</span>
                      <span>{formatCurrency(parsedData.partB.surcharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span>(+) Health & Education Cess</span>
                    <span>{formatCurrency(parsedData.partB.healthEducationCess)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-orange-700">
                    <span>Net Tax Payable</span>
                    <span>{formatCurrency(parsedData.partB.netTaxPayable)}</span>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg mt-4">
                    <div className="flex justify-between text-green-800">
                      <span className="font-medium">TDS Deducted by Employer</span>
                      <span className="font-bold">{formatCurrency(parsedData.partA.totalTDSDeducted)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Use in Tax Calculator CTA */}
            <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Ready to File Your ITR?</h3>
                  <p className="text-emerald-200">Use the extracted data in our tax calculator or start filing</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/calculators/income-tax">
                    <Button variant="secondary">
                      <Wallet className="mr-2 h-4 w-4" />
                      Tax Calculator
                    </Button>
                  </Link>
                  <Link href="/itr/form-selector">
                    <Button variant="outline" className="border-white text-white hover:bg-white/10">
                      Start Filing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

