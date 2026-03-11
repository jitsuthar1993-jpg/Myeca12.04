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
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  PiggyBank,
  Wallet,
  RefreshCcw,
  Info,
  BarChart3,
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  ChevronRight
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
import {
  ParsedCapitalGains,
  parseCapitalGainsStatement,
  exportForITR,
} from "@/lib/capital-gains-parser";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b'];

export default function CapitalGainsImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCapitalGains | null>(null);
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
      const data = parseCapitalGainsStatement(text);

      if (data.transactions.length === 0) {
        throw new Error("No transactions found. Please check the file format.");
      }

      setParsedData(data);
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
    if (droppedFile) {
      const input = document.createElement("input");
      input.type = "file";
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      input.files = dataTransfer.files;
      handleFileUpload({ target: input } as any);
    }
  }, [handleFileUpload]);

  // Export
  const handleExport = () => {
    if (!parsedData) return;

    const content = exportForITR(parsedData);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "capital-gains-itr-report.txt";
    document.body.appendChild(a);
    a.click();
    if (a.parentNode) a.remove();
    URL.revokeObjectURL(url);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    return `${isNegative ? '-' : ''}\u20B9${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  // Prepare chart data
  const assetTypeData = parsedData ? [
    { name: 'Equity', value: parsedData.byAssetType.equity.stcg + parsedData.byAssetType.equity.ltcg, count: parsedData.byAssetType.equity.count },
    { name: 'Debt', value: parsedData.byAssetType.debt.stcg + parsedData.byAssetType.debt.ltcg, count: parsedData.byAssetType.debt.count },
    { name: 'F&O', value: parsedData.byAssetType.fno.stcg, count: parsedData.byAssetType.fno.count },
    { name: 'Intraday', value: parsedData.byAssetType.intraday.gain, count: parsedData.byAssetType.intraday.count },
  ].filter(d => d.count > 0) : [];

  const gainTypeData = parsedData ? [
    { name: 'STCG', gain: parsedData.summary.totalSTCG },
    { name: 'LTCG', gain: parsedData.summary.totalLTCG },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-indigo-200 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-indigo-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Capital Gains Import</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Capital Gains Import</h1>
              <p className="text-indigo-200 mt-1">
                Upload your broker's capital gains statement to calculate taxes automatically
              </p>
            </div>
          </div>

          {/* Supported Brokers */}
          <div className="flex flex-wrap gap-2 mt-6">
            <Badge variant="secondary" className="bg-white/20 text-white">Zerodha</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Groww</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">ICICI Direct</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">HDFC Securities</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Generic CSV</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        {!parsedData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Upload Capital Gains Statement</CardTitle>
                <CardDescription>
                  Upload your broker's tax P&L report or capital gains statement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                    isLoading ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {isLoading ? (
                    <div className="space-y-4">
                      <RefreshCcw className="h-12 w-12 mx-auto text-indigo-500 animate-spin" />
                      <p className="text-gray-600">Analyzing your statement...</p>
                      <Progress value={66} className="w-48 mx-auto" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          Drag and drop your file here
                        </p>
                        <p className="text-gray-500 mt-1">CSV or Excel format</p>
                      </div>
                      <Label htmlFor="cg-file-upload">
                        <Input
                          id="cg-file-upload"
                          type="file"
                          accept=".csv,.xlsx,.xls"
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

            {/* How to Get Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  How to Download
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm">Zerodha</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Console → Tax P&L → Download CSV
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm">Groww</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Reports → Capital Gains → Export
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm">ICICI Direct</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Reports → Tax Reports → Capital Gains
                    </p>
                  </div>
                </div>

                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-xs">
                    Download statement for the full financial year (April to March)
                  </AlertDescription>
                </Alert>
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
            {/* Broker Info */}
            {parsedData.brokerInfo && (
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">
                  Statement Detected: {parsedData.brokerInfo.name}
                </AlertTitle>
                <AlertDescription className="text-blue-700">
                  {parsedData.transactions.length} transactions found and analyzed
                </AlertDescription>
              </Alert>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className={`${parsedData.summary.netGain >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'} text-white`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Net Gain/Loss</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.summary.netGain)}</p>
                    </div>
                    {parsedData.summary.netGain >= 0 ? (
                      <TrendingUp className="h-8 w-8 opacity-80" />
                    ) : (
                      <TrendingDown className="h-8 w-8 opacity-80" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">STCG</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.summary.totalSTCG)}</p>
                    </div>
                    <Clock className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">LTCG</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.summary.totalLTCG)}</p>
                    </div>
                    <Calendar className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Estimated Tax</p>
                      <p className="text-2xl font-bold">{formatCurrency(parsedData.summary.totalTax)}</p>
                    </div>
                    <Wallet className="h-8 w-8 opacity-80" />
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
              <Link href="/tax-loss-harvesting">
                <Button variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Tax Loss Harvesting
                </Button>
              </Link>
              <Link href="/calculators/capital-gains">
                <Button variant="outline">
                  <PiggyBank className="mr-2 h-4 w-4" />
                  Capital Gains Calculator
                </Button>
              </Link>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="summary" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="summary">Tax Summary</TabsTrigger>
                <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>

              {/* Tax Summary Tab */}
              <TabsContent value="summary">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tax Calculation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-indigo-600" />
                        Tax Calculation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                        <h4 className="font-medium text-blue-800">Short Term Capital Gains (STCG)</h4>
                        <div className="flex justify-between text-sm">
                          <span>Equity STCG (20%)</span>
                          <span>{formatCurrency(parsedData.byAssetType.equity.stcg)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>F&O Gains (30%)</span>
                          <span>{formatCurrency(parsedData.byAssetType.fno.stcg)}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t border-blue-200">
                          <span>STCG Tax</span>
                          <span className="text-blue-700">{formatCurrency(parsedData.summary.stcgTax)}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg space-y-3">
                        <h4 className="font-medium text-purple-800">Long Term Capital Gains (LTCG)</h4>
                        <div className="flex justify-between text-sm">
                          <span>Total LTCG</span>
                          <span>{formatCurrency(parsedData.summary.totalLTCG)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-700">
                          <span>Exemption (\u20B91.25L)</span>
                          <span>- {formatCurrency(Math.min(parsedData.summary.totalLTCG, parsedData.summary.ltcgExemption))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Taxable LTCG</span>
                          <span>{formatCurrency(parsedData.summary.totalLTCGAboveExemption)}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t border-purple-200">
                          <span>LTCG Tax (12.5%)</span>
                          <span className="text-purple-700">{formatCurrency(parsedData.summary.ltcgTax)}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Tax Liability</span>
                          <span className="text-2xl font-bold">{formatCurrency(parsedData.summary.totalTax)}</span>
                        </div>
                        <p className="text-xs mt-2 opacity-80">+ 4% Health & Education Cess</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Charts */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Gains by Asset Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={assetTypeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                            >
                              {assetTypeData.map((_, index) => (
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

                  {/* Carry Forward Loss */}
                  {parsedData.summary.carryForwardLoss > 0 && (
                    <Card className="lg:col-span-2 bg-amber-50 border-amber-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-800">
                          <AlertTriangle className="h-5 w-5" />
                          Carry Forward Loss
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-amber-900">
                          You have a net capital loss of <strong>{formatCurrency(parsedData.summary.carryForwardLoss)}</strong> this year.
                          This can be carried forward for up to 8 years to set off against future capital gains.
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <Link href="/tax-loss-harvesting">
                            <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                              View Tax Loss Harvesting Tips
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Breakdown Tab */}
              <TabsContent value="breakdown">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* STCG vs LTCG */}
                  <Card>
                    <CardHeader>
                      <CardTitle>STCG vs LTCG Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={gainTypeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(v) => `\u20B9${(v/1000).toFixed(0)}K`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Bar dataKey="gain" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                              {gainTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.gain >= 0 ? '#22c55e' : '#ef4444'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Asset Type Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>By Asset Type</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {parsedData.byAssetType.equity.count > 0 && (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">Equity</span>
                            <Badge className="bg-green-500">{parsedData.byAssetType.equity.count} trades</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-green-700">STCG:</span>
                              <span className="ml-2 font-medium">{formatCurrency(parsedData.byAssetType.equity.stcg)}</span>
                            </div>
                            <div>
                              <span className="text-green-700">LTCG:</span>
                              <span className="ml-2 font-medium">{formatCurrency(parsedData.byAssetType.equity.ltcg)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {parsedData.byAssetType.fno.count > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-blue-800">F&O (Futures & Options)</span>
                            <Badge className="bg-blue-500">{parsedData.byAssetType.fno.count} trades</Badge>
                          </div>
                          <div className="text-sm">
                            <span className="text-blue-700">Net Gain/Loss:</span>
                            <span className="ml-2 font-medium">{formatCurrency(parsedData.byAssetType.fno.stcg)}</span>
                          </div>
                        </div>
                      )}

                      {parsedData.byAssetType.intraday.count > 0 && (
                        <div className="p-4 bg-amber-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-amber-800">Intraday</span>
                            <Badge className="bg-amber-500">{parsedData.byAssetType.intraday.count} trades</Badge>
                          </div>
                          <div className="text-sm">
                            <span className="text-amber-700">Net Gain/Loss:</span>
                            <span className="ml-2 font-medium">{formatCurrency(parsedData.byAssetType.intraday.gain)}</span>
                          </div>
                        </div>
                      )}

                      {parsedData.byAssetType.debt.count > 0 && (
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-purple-800">Debt/Bonds</span>
                            <Badge className="bg-purple-500">{parsedData.byAssetType.debt.count} trades</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-purple-700">STCG:</span>
                              <span className="ml-2 font-medium">{formatCurrency(parsedData.byAssetType.debt.stcg)}</span>
                            </div>
                            <div>
                              <span className="text-purple-700">LTCG:</span>
                              <span className="ml-2 font-medium">{formatCurrency(parsedData.byAssetType.debt.ltcg)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <CardTitle>All Transactions ({parsedData.transactions.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Buy Date</TableHead>
                            <TableHead>Sell Date</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Buy Value</TableHead>
                            <TableHead className="text-right">Sell Value</TableHead>
                            <TableHead className="text-right">Gain/Loss</TableHead>
                            <TableHead>Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedData.transactions.map((txn) => (
                            <TableRow key={txn.id}>
                              <TableCell className="font-medium">{txn.symbol}</TableCell>
                              <TableCell>{txn.buyDate.toLocaleDateString('en-IN')}</TableCell>
                              <TableCell>{txn.sellDate.toLocaleDateString('en-IN')}</TableCell>
                              <TableCell className="text-right">{txn.sellQuantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(txn.buyValue)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(txn.sellValue)}</TableCell>
                              <TableCell className={`text-right font-medium ${txn.netGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(txn.netGain)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={txn.gainType === 'LTCG' ? 'border-purple-500 text-purple-700' : 'border-blue-500 text-blue-700'}
                                >
                                  {txn.gainType}
                                </Badge>
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

