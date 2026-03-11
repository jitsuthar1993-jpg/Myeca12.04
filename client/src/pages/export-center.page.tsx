import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Download, FileText, Table, FileSpreadsheet, File, 
  Calendar, Filter, Check, AlertCircle, Loader2,
  TrendingUp, Users, Receipt, BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { addDays, format } from "date-fns";

// Export types
const exportTypes = {
  taxReturns: {
    name: "Tax Returns",
    icon: FileText,
    color: "blue",
    formats: ["PDF", "Excel", "CSV"],
    filters: ["Year", "Status", "Type"],
    fields: [
      { id: "basic", label: "Basic Information", checked: true },
      { id: "income", label: "Income Details", checked: true },
      { id: "deductions", label: "Deductions", checked: true },
      { id: "taxes", label: "Tax Computation", checked: true },
      { id: "refund", label: "Refund Details", checked: false },
      { id: "bank", label: "Bank Information", checked: false }
    ]
  },
  transactions: {
    name: "Transactions",
    icon: Receipt,
    color: "green",
    formats: ["Excel", "CSV", "PDF"],
    filters: ["Date Range", "Type", "Status"],
    fields: [
      { id: "date", label: "Transaction Date", checked: true },
      { id: "type", label: "Transaction Type", checked: true },
      { id: "amount", label: "Amount", checked: true },
      { id: "status", label: "Status", checked: true },
      { id: "invoice", label: "Invoice Number", checked: false },
      { id: "gst", label: "GST Details", checked: false }
    ]
  },
  clients: {
    name: "Client Data",
    icon: Users,
    color: "purple",
    formats: ["Excel", "CSV"],
    filters: ["Status", "Type", "Date Added"],
    fields: [
      { id: "name", label: "Client Name", checked: true },
      { id: "pan", label: "PAN Number", checked: true },
      { id: "email", label: "Email", checked: true },
      { id: "phone", label: "Phone", checked: true },
      { id: "returns", label: "Returns Filed", checked: false },
      { id: "services", label: "Services Used", checked: false }
    ]
  },
  reports: {
    name: "Analytics Reports",
    icon: BarChart3,
    color: "orange",
    formats: ["PDF", "Excel"],
    filters: ["Period", "Report Type"],
    fields: [
      { id: "summary", label: "Executive Summary", checked: true },
      { id: "revenue", label: "Revenue Analysis", checked: true },
      { id: "clients", label: "Client Analytics", checked: true },
      { id: "services", label: "Service Performance", checked: true },
      { id: "trends", label: "Trend Analysis", checked: false },
      { id: "projections", label: "Future Projections", checked: false }
    ]
  }
};

export default function ExportCenterPage() {
  const [selectedType, setSelectedType] = useState("taxReturns");
  const [selectedFormat, setSelectedFormat] = useState("PDF");
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    Object.values(exportTypes).forEach(type => {
      type.fields.forEach(field => {
        initial[field.id] = field.checked;
      });
    });
    return initial;
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();

  const currentExportType = exportTypes[selectedType as keyof typeof exportTypes];

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate export completion
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Export completed",
        description: `Your ${currentExportType.name} has been exported successfully.`,
      });
      
      // Simulate file download
      const blob = new Blob(['Export data'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentExportType.name.toLowerCase().replace(' ', '-')}-${format(new Date(), 'yyyy-MM-dd')}.${selectedFormat.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <SEO
        title="Export Center - Download Your Data | MyeCA.in"
        description="Export your tax returns, transactions, and reports in multiple formats. Download data in PDF, Excel, or CSV format."
        keywords="export data, download reports, tax return export, transaction export, data download"
      />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Download className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Export Center</h1>
              <p className="text-gray-600">Download your data in multiple formats</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Export Types */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Export Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(exportTypes).map(([key, type]) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedType(key)}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        selectedType === key 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${type.color}-100 rounded-lg`}>
                          <Icon className={`h-5 w-5 text-${type.color}-600`} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">{type.name}</p>
                          <p className="text-sm text-gray-600">
                            Available in {type.formats.join(", ")}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Exports */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Recent Exports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Tax Returns 2024-25</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  <Badge variant="outline">PDF</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Transaction Report</p>
                      <p className="text-xs text-gray-500">5 days ago</p>
                    </div>
                  </div>
                  <Badge variant="outline">Excel</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Client List</p>
                      <p className="text-xs text-gray-500">1 week ago</p>
                    </div>
                  </div>
                  <Badge variant="outline">CSV</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Configuration */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Configure Export</CardTitle>
                <CardDescription>
                  Customize your {currentExportType.name} export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Format Selection */}
                <div>
                  <Label className="text-base font-semibold mb-3">Export Format</Label>
                  <RadioGroup value={selectedFormat} onValueChange={setSelectedFormat}>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {currentExportType.formats.map(format => (
                        <div key={format} className="flex items-center">
                          <RadioGroupItem value={format} id={format} />
                          <Label 
                            htmlFor={format} 
                            className="ml-2 cursor-pointer flex items-center gap-2"
                          >
                            {format === "PDF" && <FileText className="h-4 w-4" />}
                            {format === "Excel" && <FileSpreadsheet className="h-4 w-4" />}
                            {format === "CSV" && <Table className="h-4 w-4" />}
                            {format}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Filters */}
                <div>
                  <Label className="text-base font-semibold mb-3">Filters</Label>
                  <div className="space-y-3 mt-2">
                    {currentExportType.filters.includes("Date Range") && (
                      <div>
                        <Label className="text-sm">Date Range</Label>
                        <div className="grid grid-cols-2 gap-3 mt-1">
                          <Input 
                            type="date" 
                            value={format(dateRange.from, 'yyyy-MM-dd')}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                          />
                          <Input 
                            type="date" 
                            value={format(dateRange.to, 'yyyy-MM-dd')}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                          />
                        </div>
                      </div>
                    )}

                    {currentExportType.filters.includes("Year") && (
                      <div>
                        <Label className="text-sm">Assessment Year</Label>
                        <Select defaultValue="2024-25">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2024-25">2024-25</SelectItem>
                            <SelectItem value="2023-24">2023-24</SelectItem>
                            <SelectItem value="2022-23">2022-23</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {currentExportType.filters.includes("Status") && (
                      <div>
                        <Label className="text-sm">Status</Label>
                        <Select defaultValue="all">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="filed">Filed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processed">Processed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Field Selection */}
                <div>
                  <Label className="text-base font-semibold mb-3">Select Fields to Export</Label>
                  <div className="space-y-2 mt-2">
                    {currentExportType.fields.map(field => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={field.id}
                          checked={selectedFields[field.id]}
                          onCheckedChange={() => handleFieldToggle(field.id)}
                        />
                        <Label 
                          htmlFor={field.id} 
                          className="cursor-pointer text-sm font-normal"
                        >
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Summary */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Export Summary:</strong> {currentExportType.name} in {selectedFormat} format
                    with {Object.values(selectedFields).filter(Boolean).length} fields selected.
                    {currentExportType.filters.includes("Date Range") && 
                      ` Data from ${format(dateRange.from, 'MMM dd, yyyy')} to ${format(dateRange.to, 'MMM dd, yyyy')}.`
                    }
                  </AlertDescription>
                </Alert>

                {/* Export Button */}
                <div className="flex justify-end">
                  <Button 
                    size="lg"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="min-w-[200px]"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting... {exportProgress}%
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export {currentExportType.name}
                      </>
                    )}
                  </Button>
                </div>

                {/* Progress Bar */}
                {isExporting && (
                  <Progress value={exportProgress} className="w-full" />
                )}
              </CardContent>
            </Card>

            {/* Export Tips */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Export Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>PDFs are best for sharing and archiving official documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Excel format allows for data analysis and custom calculations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>CSV files can be imported into most accounting software</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Large exports may take a few minutes to process</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}