import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  TrendingUp,
  TrendingDown,
  Building2,
  Wallet,
  PiggyBank,
  AlertTriangle,
  ExternalLink,
  FileJson,
  Eye,
  ArrowRight
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import {
  ParsedAIS,
  parseAIS,
  exportAISForITR,
  CATEGORY_INFO,
} from "@/lib/ais-parser";

const COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function AISViewerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedAIS | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setError(null);
    setIsLoading(true);

    try {
      const text = await uploadedFile.text();
      const data = parseAIS(text);

      if (data.aisEntries.length === 0) {
        throw new Error("No entries found. Please check the file format.");
      }

      setParsedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
      setParsedData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Export
  const handleExport = () => {
    if (!parsedData) return;

    const content = exportAISForITR(parsedData);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ais-26as-summary.txt";
    document.body.appendChild(a);
    a.click();
    if (a.parentNode) a.remove();
    URL.revokeObjectURL(url);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `\u20B9${amount.toLocaleString('en-IN')}`;
  };

  // Prepare chart data
  const incomeChartData = parsedData ? [
    { name: 'Salary', value: parsedData.incomeSummary.salary },
    { name: 'Interest', value: parsedData.incomeSummary.interestIncome },
    { name: 'Dividend', value: parsedData.incomeSummary.dividendIncome },
    { name: 'Capital Gains', value: parsedData.incomeSummary.capitalGains },
    { name: 'Rent', value: parsedData.incomeSummary.rentIncome },
    { name: 'Professional', value: parsedData.incomeSummary.professionalIncome },
    { name: 'Other', value: parsedData.incomeSummary.otherIncome },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-blue-200 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">AIS/26AS Viewer</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AIS / 26AS Viewer</h1>
              <p className="text-blue-200 mt-1">
                Analyze your Annual Information Statement and Form 26AS data
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        {!parsedData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Upload AIS/26AS Data</CardTitle>
                <CardDescription>
                  Upload the CSV or JSON file downloaded from the Income Tax portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                    isLoading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  {isLoading ? (
                    <div className="space-y-4">
                      <RefreshCcw className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
                      <p className="text-gray-600">Parsing your data...</p>
                      <Progress value={66} className="w-48 mx-auto" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FileJson className="h-12 w-12 mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          Drop your AIS/26AS file here
                        </p>
                        <p className="text-gray-500 mt-1">CSV or JSON format</p>
                      </div>
                      <Label htmlFor="ais-upload">
                        <Input
                          id="ais-upload"
                          type="file"
                          accept=".csv,.json"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <Button variant="outline" className="mt-2" asChild>
                          <span>Select File</span>
                        </Button>
                      </Label>
                    </div>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* How to Download */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  How to Download AIS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>Login to <a href="https://www.incometax.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">incometax.gov.in</a></li>
                  <li>Go to <strong>e-File → Income Tax Returns → AIS</strong></li>
                  <li>Select the Financial Year</li>
                  <li>Click on <strong>Download</strong> and select CSV format</li>
                </ol>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">For Form 26AS:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Go to <strong>e-File → View Form 26AS (Tax Credit)</strong></li>
                    <li>Select Assessment Year and format</li>
                    <li>Download the file</li>
                  </ol>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <a href="https://www.incometax.gov.in" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Go to IT Portal
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        {parsedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* PAN & Year Info */}
            <div className="flex flex-wrap gap-4 items-center">
              {parsedData.pan && (
                <Badge variant="outline" className="text-sm py-1 px-3">
                  PAN: {parsedData.pan}
                </Badge>
              )}
              {parsedData.financialYear && (
                <Badge variant="outline" className="text-sm py-1 px-3">
                  FY: {parsedData.financialYear}
                </Badge>
              )}
              <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                {parsedData.aisEntries.length} entries found
              </Badge>
            </div>

            {/* Discrepancy Warning */}
            {parsedData.discrepancies.count > 0 && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">
                  {parsedData.discrepancies.count} Discrepancies Found
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  There are mismatches between reported and modified values. 
                  Potential tax impact: {formatCurrency(parsedData.discrepancies.potentialTaxImpact)}
                </AlertDescription>
              </Alert>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Total Reported Income</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.incomeSummary.totalReportedIncome)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Total TDS Credit</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.tdsSummary.totalTDSCredit)}</p>
                    </div>
                    <PiggyBank className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Income Sources</p>
                      <p className="text-2xl font-bold">{incomeChartData.length}</p>
                    </div>
                    <Building2 className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Discrepancies</p>
                      <p className="text-2xl font-bold">{parsedData.discrepancies.count}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
                <Download className="mr-2 h-4 w-4" />
                Export Summary
              </Button>
              <Button variant="outline" onClick={() => { setParsedData(null); setFile(null); }}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Upload New File
              </Button>
              <Link href="/calculators/income-tax">
                <Button variant="outline">
                  <Wallet className="mr-2 h-4 w-4" />
                  Calculate Tax
                </Button>
              </Link>
              <Link href="/itr/form-selector">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  File ITR
                </Button>
              </Link>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="income" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 max-w-lg">
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="tds">TDS/TCS</TabsTrigger>
                <TabsTrigger value="entries">All Entries</TabsTrigger>
                <TabsTrigger value="discrepancies">Discrepancies</TabsTrigger>
              </TabsList>

              {/* Income Tab */}
              <TabsContent value="income">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Income Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Income Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between py-3 border-b">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-blue-500 rounded-full" />
                          Salary
                        </span>
                        <span className="font-medium">{formatCurrency(parsedData.incomeSummary.salary)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500 rounded-full" />
                          Interest
                        </span>
                        <span className="font-medium">{formatCurrency(parsedData.incomeSummary.interestIncome)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-purple-500 rounded-full" />
                          Dividend
                        </span>
                        <span className="font-medium">{formatCurrency(parsedData.incomeSummary.dividendIncome)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-indigo-500 rounded-full" />
                          Capital Gains
                        </span>
                        <span className="font-medium">{formatCurrency(parsedData.incomeSummary.capitalGains)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-orange-500 rounded-full" />
                          Rent
                        </span>
                        <span className="font-medium">{formatCurrency(parsedData.incomeSummary.rentIncome)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-teal-500 rounded-full" />
                          Professional
                        </span>
                        <span className="font-medium">{formatCurrency(parsedData.incomeSummary.professionalIncome)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-gray-500 rounded-full" />
                          Other
                        </span>
                        <span className="font-medium">{formatCurrency(parsedData.incomeSummary.otherIncome)}</span>
                      </div>
                      <div className="flex justify-between py-3 font-bold text-lg">
                        <span>Total</span>
                        <span className="text-blue-600">{formatCurrency(parsedData.incomeSummary.totalReportedIncome)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Income Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={incomeChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {incomeChartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* TDS Tab */}
              <TabsContent value="tds">
                <Card>
                  <CardHeader>
                    <CardTitle>TDS/TCS Credits</CardTitle>
                    <CardDescription>Tax credits available for claiming in your ITR</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800">TDS on Salary</h4>
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                          {formatCurrency(parsedData.tdsSummary.tdsOnSalary)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800">TDS on Other Income</h4>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                          {formatCurrency(parsedData.tdsSummary.tdsOnOtherIncome)}
                        </p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <h4 className="font-medium text-amber-800">TCS Collected</h4>
                        <p className="text-2xl font-bold text-amber-600 mt-2">
                          {formatCurrency(parsedData.tdsSummary.tcsCollected)}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total TDS/TCS Credit Available</span>
                        <span className="text-2xl font-bold">{formatCurrency(parsedData.tdsSummary.totalTDSCredit)}</span>
                      </div>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        Ensure all TDS credits match your Form 16, Form 16A, and other TDS certificates before filing ITR.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* All Entries Tab */}
              <TabsContent value="entries">
                <Card>
                  <CardHeader>
                    <CardTitle>All AIS Entries ({parsedData.aisEntries.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedData.aisEntries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${CATEGORY_INFO[entry.category]?.color || 'bg-gray-500'} text-white border-0`}
                                >
                                  {CATEGORY_INFO[entry.category]?.icon} {CATEGORY_INFO[entry.category]?.label || entry.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {entry.informationDescription}
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">
                                {entry.reportingEntity}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(entry.reportedValue)}
                              </TableCell>
                              <TableCell>
                                {entry.status === 'discrepancy' ? (
                                  <Badge variant="destructive" className="text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Mismatch
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    OK
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Discrepancies Tab */}
              <TabsContent value="discrepancies">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="h-5 w-5" />
                      Discrepancies ({parsedData.discrepancies.count})
                    </CardTitle>
                    <CardDescription>
                      These entries have mismatches between reported and modified values
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {parsedData.discrepancies.count === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                        <h3 className="text-lg font-medium">No Discrepancies Found</h3>
                        <p className="text-gray-500">All your AIS entries are consistent</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {parsedData.discrepancies.entries.map((entry) => (
                          <div key={entry.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-amber-900">{entry.informationDescription}</h4>
                                <p className="text-sm text-amber-700 mt-1">Source: {entry.reportingEntity}</p>
                              </div>
                              <Badge variant="destructive">Mismatch</Badge>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-500">Reported Value</p>
                                <p className="font-bold text-lg">{formatCurrency(entry.reportedValue)}</p>
                              </div>
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-500">Modified Value</p>
                                <p className="font-bold text-lg">{formatCurrency(entry.modifiedValue || 0)}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                        <Alert className="mt-6 bg-blue-50 border-blue-200">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertTitle className="text-blue-800">What to do?</AlertTitle>
                          <AlertDescription className="text-blue-700">
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Verify the correct amount from your records</li>
                              <li>Submit feedback on the IT portal if values are incorrect</li>
                              <li>Keep supporting documents ready for assessment</li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Ready to File Your ITR?</h3>
                  <p className="text-blue-200">Use your AIS data to complete your tax return</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/itr/form-selector">
                    <Button variant="secondary">
                      <FileText className="mr-2 h-4 w-4" />
                      Start Filing
                    </Button>
                  </Link>
                  <Link href="/tax-assistant">
                    <Button variant="outline" className="border-white text-white hover:bg-white/10">
                      Get Help
                      <ArrowRight className="ml-2 h-4 w-4" />
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

