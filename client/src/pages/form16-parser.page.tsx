import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clipboard,
  Copy,
  Download,
  FileImage,
  FileText,
  Info,
  RefreshCcw,
  Scan,
  Shield,
  Upload,
  Wallet,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { MobilePageHeader } from "@/components/mobile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Form16Data,
  exportForm16ForITR,
  parseForm16Text,
  validateForm16Data,
} from "@/lib/form16-ocr";

const SAMPLE_FORM16_TEXT = `Assessment Year: 2026-27
Financial Year: 2025-26
Employer Name: MyeCA Digital Services Private Limited
TAN: DELM12345A
Employee Name: AARAV SHARMA
Employee PAN: ABCDE1234F
Gross Salary: Rs. 12,50,000
House Rent Allowance: Rs. 1,20,000
Standard Deduction: Rs. 75,000
Professional Tax: Rs. 2,400
Section 80C: Rs. 1,50,000
Section 80D: Rs. 25,000
Total Taxable Income: Rs. 8,77,600
Tax on Total Income: Rs. 62,020
Health and Education Cess: Rs. 2,481
Net Tax Payable: Rs. 64,501
Total TDS Deducted: Rs. 70,000`;

type ValidationState = { isValid: boolean; errors: string[] };
type InputMode = "upload" | "text";

const formatCurrency = (amount: number) => `Rs. ${Math.round(amount || 0).toLocaleString("en-IN")}`;

function DetailRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-sm leading-5 text-slate-600">{label}</span>
      <span className={cn("text-right text-sm leading-5 text-slate-900", strong && "font-bold")}>{value}</span>
    </div>
  );
}

export default function Form16ParserPage() {
  const [fileName, setFileName] = useState("");
  const [parsedData, setParsedData] = useState<Form16Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [validationResult, setValidationResult] = useState<ValidationState | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runParse = useCallback((text: string, sourceName?: string) => {
    const cleanText = text.trim();
    if (!cleanText) {
      setError("Paste Form 16 text or upload a readable image/text file first.");
      return;
    }

    setError(null);
    setCopied(false);
    setIsLoading(true);

    try {
      const data = parseForm16Text(cleanText);
      const validation = validateForm16Data(data);

      setRawText(cleanText);
      setParsedData(data);
      setValidationResult(validation);
      if (sourceName) setFileName(sourceName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse this Form 16 text.");
    } finally {
      setIsLoading(false);
      setOcrProgress(100);
    }
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFileName(uploadedFile.name);
    setError(null);
    setCopied(false);
    setParsedData(null);
    setValidationResult(null);
    setIsLoading(true);
    setOcrProgress(10);

    try {
      const isImage = uploadedFile.type.startsWith("image/");
      const isText =
        uploadedFile.type.startsWith("text/") ||
        uploadedFile.name.toLowerCase().endsWith(".txt");
      const isPDF = uploadedFile.type === "application/pdf" || uploadedFile.name.toLowerCase().endsWith(".pdf");

      if (isImage) {
        setOcrProgress(20);
        const Tesseract = await import("tesseract.js");
        const result = await Tesseract.recognize(uploadedFile, "eng", {
          logger: (info) => {
            if (info.status === "recognizing text") {
              setOcrProgress(25 + info.progress * 65);
            }
          },
        });

        runParse(result.data.text, uploadedFile.name);
        return;
      }

      if (isText) {
        const text = await uploadedFile.text();
        runParse(text, uploadedFile.name);
        return;
      }

      if (isPDF) {
        setError("For PDF Form 16 files, open the PDF, select/copy the text, and paste it here. You can also upload a clear screenshot image for OCR.");
        return;
      }

      setError("Unsupported file type. Use JPG, PNG, WEBP, or TXT.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process the file. Try the paste text option.");
    } finally {
      setIsLoading(false);
    }
  }, [runParse]);

  const handleTextSubmit = () => runParse(rawText, "Pasted Form 16 text");

  const handleSample = () => {
    setInputMode("text");
    runParse(SAMPLE_FORM16_TEXT, "Sample Form 16");
  };

  const handleExport = () => {
    if (!parsedData) return;
    const content = exportForm16ForITR(parsedData);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "form16-extracted-data.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!parsedData) return;
    await navigator.clipboard.writeText(exportForm16ForITR(parsedData));
    setCopied(true);
  };

  const handleReset = () => {
    setFileName("");
    setParsedData(null);
    setRawText("");
    setError(null);
    setValidationResult(null);
    setCopied(false);
    setOcrProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const summaryCards = useMemo(() => {
    if (!parsedData) return [];
    return [
      { label: "Gross salary", value: formatCurrency(parsedData.partB.grossSalary), tone: "bg-blue-50 text-blue-700 border-blue-100" },
      { label: "Taxable income", value: formatCurrency(parsedData.partB.totalTaxableIncome), tone: "bg-slate-50 text-slate-900 border-slate-200" },
      { label: "TDS deducted", value: formatCurrency(parsedData.partA.totalTDSDeducted), tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
      { label: "Net tax payable", value: formatCurrency(parsedData.partB.netTaxPayable), tone: "bg-amber-50 text-amber-700 border-amber-100" },
    ];
  }, [parsedData]);

  const confidenceTone =
    !parsedData || parsedData.extractionConfidence >= 70
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : parsedData.extractionConfidence >= 45
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-red-50 text-red-700 border-red-100";

  return (
    <>
      <MetaSEO
        title="Free Form 16 Parser Online | Extract Salary & TDS | MyeCA.in"
        description="Paste Form 16 text or upload a readable image to extract salary, TDS, deductions, and taxable income before ITR filing."
        keywords={["form 16 parser", "form 16 OCR", "salary TDS extractor", "ITR prefill"]}
        type="calculator"
      />

      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10 lg:px-8">
            <MobilePageHeader
              eyebrow="Form 16 utility"
              icon={<Scan className="h-4 w-4" />}
              title="Extract salary and TDS before filing."
              description="Paste Form 16 text or upload a readable image. Review every value before using it for tax calculation or ITR filing."
              action={
                <div className="grid gap-2 sm:grid-cols-2 md:flex">
                  <Button onClick={handleSample} className="h-11 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    Try sample parser
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Link href="/itr/start?source=form16_parser_header">
                    <Button variant="outline" className="h-11 w-full rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 md:w-auto">
                      Start ITR after review
                    </Button>
                  </Link>
                </div>
              }
            />

            <div className="mt-5 grid grid-cols-3 gap-2 text-center md:max-w-xl">
              {[
                ["OCR", "Image/text"],
                ["Review", "Editable source"],
                ["Export", "ITR notes"],
              ].map(([value, label]) => (
                <div key={value} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-3">
                  <p className="text-sm font-black text-slate-950">{value}</p>
                  <p className="mt-0.5 type-meta font-bold uppercase tracking-wide text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6 md:grid-cols-[0.95fr_1.05fr] md:py-8 lg:px-8">
          <div className="space-y-4">
            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardHeader className="p-4 pb-2 md:p-6 md:pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-950">Add Form 16 data</CardTitle>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Fastest path: copy all text from the PDF and paste it here.</p>
                  </div>
                  <Badge className="shrink-0 border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-50">No login</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 md:pt-2">
                <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as InputMode)}>
                  <TabsList className="grid h-11 w-full grid-cols-2 rounded-lg bg-slate-100 p-1">
                    <TabsTrigger value="text" className="rounded-md text-sm">
                      <Clipboard className="mr-2 h-4 w-4" />
                      Paste text
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="rounded-md text-sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="mt-4 space-y-3">
                    <Textarea
                      value={rawText}
                      onChange={(event) => setRawText(event.target.value)}
                      placeholder={`Paste Form 16 text here...\n\nExample:\nAssessment Year: 2026-27\nGross Salary: Rs. 12,50,000\nTotal TDS Deducted: Rs. 70,000`}
                      className="min-h-[240px] resize-y rounded-lg border-slate-200 bg-white font-mono text-sm leading-6"
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button onClick={handleTextSubmit} disabled={!rawText.trim() || isLoading} className="h-11 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                        {isLoading ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Scan className="mr-2 h-4 w-4" />}
                        Parse text
                      </Button>
                      <Button type="button" variant="outline" onClick={handleSample} className="h-11 rounded-lg border-slate-200">
                        Use sample data
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="mt-4 space-y-3">
                    <Label
                      htmlFor="form16-upload"
                      className={cn(
                        "flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 text-center transition-colors",
                        isLoading ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-blue-50"
                      )}
                    >
                      {isLoading ? (
                        <div className="w-full max-w-xs space-y-4">
                          <Scan className="mx-auto h-9 w-9 animate-pulse text-blue-600" />
                          <div>
                            <p className="text-sm font-bold text-slate-950">Reading Form 16 image</p>
                            <p className="mt-1 text-xs text-slate-500">{fileName || "OCR in progress"}</p>
                          </div>
                          <Progress value={ocrProgress} className="h-2" />
                        </div>
                      ) : (
                        <>
                          <FileImage className="h-10 w-10 text-blue-600" />
                          <p className="mt-3 text-sm font-bold text-slate-950">Upload screenshot or text file</p>
                          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">JPG, PNG, WEBP, or TXT. For PDF, copy text from the PDF and paste it.</p>
                        </>
                      )}
                    </Label>
                    <Input ref={fileInputRef} id="form16-upload" type="file" accept="image/*,.txt,.pdf" className="hidden" onChange={handleFileUpload} />
                    <Alert className="border-blue-100 bg-blue-50 text-blue-900">
                      <Shield className="h-4 w-4 text-blue-700" />
                      <AlertDescription className="text-sm leading-6">
                        Image OCR runs in the browser tool. Review extracted figures against Form 16, AIS, and Form 26AS before filing.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Action needed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-950">What this tool can extract</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                      {["PAN/TAN", "Gross salary", "TDS", "80C/80D", "Taxable income", "Cess/tax payable"].map((item) => (
                        <span key={item} className="rounded-md bg-slate-50 px-2 py-2">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {!parsedData ? (
              <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5 md:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-950">Your extracted result appears here.</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Run the sample, paste Form 16 text, or upload a screenshot to see salary, deductions, TDS, and review warnings.
                  </p>
                  <div className="mt-5 grid gap-2">
                    {["Check employer TAN and employee PAN", "Compare TDS with AIS/Form 26AS", "Review old vs new regime before filing"].map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                        <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="type-meta font-bold uppercase tracking-[0.14em] text-blue-700">Parsed result</p>
                        <h2 className="mt-1 text-xl font-black text-slate-950">Review before filing</h2>
                      </div>
                      <Badge className={cn("border hover:bg-current/0", confidenceTone)}>
                        {parsedData.extractionConfidence}% confidence
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {summaryCards.map((card) => (
                        <div key={card.label} className={cn("rounded-lg border p-3", card.tone)}>
                          <p className="type-meta font-bold uppercase tracking-wide opacity-80">{card.label}</p>
                          <p className="mt-2 text-base font-black leading-tight">{card.value}</p>
                        </div>
                      ))}
                    </div>

                    {validationResult && !validationResult.isValid && (
                      <Alert className="mt-4 border-amber-200 bg-amber-50 text-amber-900">
                        <AlertCircle className="h-4 w-4 text-amber-700" />
                        <AlertTitle>Manual review needed</AlertTitle>
                        <AlertDescription>
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                            {validationResult.errors.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {parsedData.warnings.length > 0 && (
                      <Alert className="mt-4 border-slate-200 bg-slate-50 text-slate-800">
                        <Info className="h-4 w-4 text-slate-600" />
                        <AlertDescription>
                          <ul className="list-disc space-y-1 pl-4 text-sm">
                            {parsedData.warnings.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                  <CardHeader className="p-4 pb-1 md:p-5 md:pb-1">
                    <CardTitle className="text-base font-bold text-slate-950">Extracted fields</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 md:p-5 md:pt-2">
                    <DetailRow label="Employer" value={parsedData.employer.name || "Not found"} />
                    <DetailRow label="Employer TAN" value={parsedData.employer.tan || "Not found"} />
                    <DetailRow label="Employee" value={parsedData.employee.name || "Not found"} />
                    <DetailRow label="Employee PAN" value={parsedData.employee.pan || "Not found"} />
                    <DetailRow label="Assessment year" value={parsedData.assessmentYear || "Not found"} />
                    <DetailRow label="80C deduction" value={formatCurrency(parsedData.partB.deductions.section80C)} />
                    <DetailRow label="80D deduction" value={formatCurrency(parsedData.partB.deductions.section80D)} />
                    <DetailRow label="Total deductions" value={formatCurrency(parsedData.partB.deductions.totalDeductions)} strong />
                  </CardContent>
                </Card>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button onClick={handleExport} className="h-11 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    <Download className="mr-2 h-4 w-4" />
                    Export notes
                  </Button>
                  <Button variant="outline" onClick={handleCopy} className="h-11 rounded-lg border-slate-200 bg-white">
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? "Copied" : "Copy data"}
                  </Button>
                  <Link href="/calculators/income-tax">
                    <Button variant="outline" className="h-11 w-full rounded-lg border-slate-200 bg-white">
                      <Wallet className="mr-2 h-4 w-4" />
                      Calculate tax
                    </Button>
                  </Link>
                  <Link href="/itr/start?source=form16_parser_results">
                    <Button className="h-11 w-full rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                      Start ITR filing
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <Button variant="ghost" onClick={handleReset} className="h-11 w-full rounded-lg text-slate-600">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Parse another Form 16
                </Button>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
