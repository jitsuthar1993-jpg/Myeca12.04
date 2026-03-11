import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Filter,
  Search,
  PiggyBank,
  Wallet,
  Building2,
  Banknote,
  FileSpreadsheet,
  RefreshCcw,
  Info,
  Eye
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
import { motion, AnimatePresence } from "framer-motion";
import {
  Transaction,
  TransactionCategory,
  ParsedStatement,
  parseCSV,
  generateSummary,
  exportForITR,
} from "@/lib/bank-statement-parser";

export default function BankAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedStatement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | "all">("all");
  const [taxRelevanceFilter, setTaxRelevanceFilter] = useState<Transaction["taxRelevance"] | "all">("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

  // Handle file upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setError(null);
    setIsLoading(true);

    try {
      const text = await uploadedFile.text();
      const transactions = parseCSV(text);

      if (transactions.length === 0) {
        throw new Error("No transactions found. Please check the file format.");
      }

      const summary = generateSummary(transactions);
      setParsedData(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
      setParsedData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv"))) {
      const input = document.createElement("input");
      input.type = "file";
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      input.files = dataTransfer.files;
      handleFileUpload({ target: input } as any);
    } else {
      setError("Please upload a CSV file");
    }
  }, [handleFileUpload]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    if (!parsedData) return [];

    let filtered = parsedData.transactions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Tax relevance filter
    if (taxRelevanceFilter !== "all") {
      filtered = filtered.filter(t => t.taxRelevance === taxRelevanceFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal instanceof Date && bVal instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return filtered;
  }, [parsedData, searchQuery, categoryFilter, taxRelevanceFilter, sortConfig]);

  // Export to text
  const handleExport = () => {
    if (!parsedData) return;

    const content = exportForITR(parsedData);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bank-statement-tax-analysis.txt";
    document.body.appendChild(a);
    a.click();
    if (a.parentNode) a.remove();
    URL.revokeObjectURL(url);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-teal-200 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-teal-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Bank Statement Analyzer</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Bank Statement Analyzer</h1>
              <p className="text-teal-200 mt-1">
                Upload your bank statement to identify tax-relevant transactions automatically
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        {!parsedData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Bank Statement</CardTitle>
              <CardDescription>
                Upload your bank statement in CSV format to analyze transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  isLoading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {isLoading ? (
                  <div className="space-y-4">
                    <RefreshCcw className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
                    <p className="text-gray-600">Analyzing your statement...</p>
                    <Progress value={66} className="w-48 mx-auto" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        Drag and drop your CSV file here
                      </p>
                      <p className="text-gray-500 mt-1">or click to browse</p>
                    </div>
                    <Label htmlFor="file-upload">
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button variant="outline" className="mt-2" asChild>
                        <span>Select CSV File</span>
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

              {/* Supported Formats */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Supported Formats
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Most Indian bank CSV exports (HDFC, ICICI, SBI, Axis, Kotak, etc.)</li>
                  <li>• Required columns: Date, Description/Narration, Debit, Credit</li>
                  <li>• Download statement from your bank's net banking portal</li>
                </ul>
              </div>
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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-100">Total Credits</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.summary.totalCredits)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-100">Total Debits</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.summary.totalDebits)}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100">Income Identified</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.taxRelevantSummary.totalIncome)}</p>
                    </div>
                    <Banknote className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-100">Deductions Found</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.taxRelevantSummary.totalDeductions)}</p>
                    </div>
                    <PiggyBank className="h-8 w-8 text-purple-200" />
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
            </div>

            {/* Tabs */}
            <Tabs defaultValue="summary" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="summary">Tax Summary</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>

              {/* Tax Summary Tab */}
              <TabsContent value="summary">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Income Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <TrendingUp className="h-5 w-5" />
                        Income Sources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">Salary</span>
                        <span className="text-green-700 font-semibold">
                          {formatCurrency(parsedData.taxRelevantSummary.salaryIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium">Interest Income</span>
                        <span className="text-blue-700 font-semibold">
                          {formatCurrency(parsedData.taxRelevantSummary.interestIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="font-medium">Rental Income</span>
                        <span className="text-purple-700 font-semibold">
                          {formatCurrency(parsedData.taxRelevantSummary.rentReceived)}
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Total Taxable Income</span>
                          <span className="text-xl font-bold text-green-700">
                            {formatCurrency(parsedData.taxRelevantSummary.totalIncome)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deductions Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-700">
                        <PiggyBank className="h-5 w-5" />
                        Potential Deductions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <div>
                          <span className="font-medium">Rent Paid</span>
                          <Badge variant="outline" className="ml-2 text-xs">HRA</Badge>
                        </div>
                        <span className="text-orange-700 font-semibold">
                          {formatCurrency(parsedData.taxRelevantSummary.rentPaid)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <div>
                          <span className="font-medium">Insurance</span>
                          <Badge variant="outline" className="ml-2 text-xs">80C/80D</Badge>
                        </div>
                        <span className="text-purple-700 font-semibold">
                          {formatCurrency(parsedData.taxRelevantSummary.insurancePremiums)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                        <div>
                          <span className="font-medium">Medical</span>
                          <Badge variant="outline" className="ml-2 text-xs">80D</Badge>
                        </div>
                        <span className="text-teal-700 font-semibold">
                          {formatCurrency(parsedData.taxRelevantSummary.medicalExpenses)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-rose-50 rounded-lg">
                        <div>
                          <span className="font-medium">Donations</span>
                          <Badge variant="outline" className="ml-2 text-xs">80G</Badge>
                        </div>
                        <span className="text-rose-700 font-semibold">
                          {formatCurrency(parsedData.taxRelevantSummary.donations)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                        <div>
                          <span className="font-medium">Investments</span>
                          <Badge variant="outline" className="ml-2 text-xs">80C/80CCD</Badge>
                        </div>
                        <span className="text-indigo-700 font-semibold">
                          {formatCurrency(parsedData.taxRelevantSummary.investmentAmount)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tax Tips */}
                <Alert className="mt-6 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Tax Planning Tips</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Based on your statement analysis:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {parsedData.taxRelevantSummary.interestIncome > 40000 && (
                        <li>Your interest income exceeds \u20B940,000 - TDS may be deducted by the bank</li>
                      )}
                      {parsedData.taxRelevantSummary.investmentAmount < 150000 && (
                        <li>You have scope to invest more under Section 80C (limit: \u20B91.5 lakh)</li>
                      )}
                      {parsedData.taxRelevantSummary.rentPaid > 0 && (
                        <li>Ensure you have rent receipts for HRA exemption claims</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Categories Tab */}
              <TabsContent value="categories">
                <Card>
                  <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {parsedData.categorySummary.map((cat) => (
                        <div key={cat.category} className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${cat.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                            {cat.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{cat.label}</span>
                              <div className="text-right">
                                {cat.totalCredit > 0 && (
                                  <span className="text-green-600 mr-2">+{formatCurrency(cat.totalCredit)}</span>
                                )}
                                {cat.totalDebit > 0 && (
                                  <span className="text-red-600">-{formatCurrency(cat.totalDebit)}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={((cat.totalCredit + cat.totalDebit) / (parsedData.summary.totalCredits + parsedData.summary.totalDebits)) * 100}
                                className="h-2 flex-1"
                              />
                              <span className="text-xs text-gray-500">{cat.count} txns</span>
                              {cat.taxRelevance !== 'none' && (
                                <Badge variant="secondary" className="text-xs">
                                  Tax: {cat.taxRelevance}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <CardTitle>All Transactions ({filteredTransactions.length})</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {parsedData.categorySummary.map((cat) => (
                              <SelectItem key={cat.category} value={cat.category}>
                                {cat.icon} {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={taxRelevanceFilter} onValueChange={(v) => setTaxRelevanceFilter(v as any)}>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Tax Relevance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="deduction">Deduction</SelectItem>
                            <SelectItem value="investment">Investment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => setSortConfig({ key: 'date', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                            >
                              Date <ArrowUpDown className="inline h-4 w-4 ml-1" />
                            </TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead>Tax</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.map((txn) => (
                            <TableRow key={txn.id}>
                              <TableCell className="whitespace-nowrap">
                                {txn.date.toLocaleDateString('en-IN')}
                              </TableCell>
                              <TableCell className="max-w-[250px] truncate" title={txn.description}>
                                {txn.description}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {parsedData.categorySummary.find(c => c.category === txn.category)?.icon}{' '}
                                  {parsedData.categorySummary.find(c => c.category === txn.category)?.label || txn.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-green-600 font-medium">
                                {txn.credit > 0 ? formatCurrency(txn.credit) : '-'}
                              </TableCell>
                              <TableCell className="text-right text-red-600 font-medium">
                                {txn.debit > 0 ? formatCurrency(txn.debit) : '-'}
                              </TableCell>
                              <TableCell>
                                {txn.taxRelevance !== 'none' && (
                                  <Badge
                                    variant={txn.taxRelevance === 'income' ? 'default' : 'secondary'}
                                    className={`text-xs ${
                                      txn.taxRelevance === 'income' ? 'bg-green-100 text-green-700' :
                                      txn.taxRelevance === 'deduction' ? 'bg-purple-100 text-purple-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    {txn.taxRelevance}
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
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
}

