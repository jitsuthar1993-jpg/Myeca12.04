import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  FileText, Download, TrendingUp, Users, Shield, 
  DollarSign, Calendar as CalendarIcon, Filter,
  BarChart, PieChart, Activity, Loader2
} from "lucide-react";
import SEO from "@/components/SEO";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface ReportHistory {
  id: string;
  type: string;
  name: string;
  generatedAt: string;
  size: string;
  format: string;
}

const iconMap: Record<string, any> = {
  FileText,
  DollarSign,
  Shield,
  TrendingUp,
  Users
};

export default function ReportsPage() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [exportFormat, setExportFormat] = useState<string>("pdf");

  // Fetch report templates
  const { data: templatesData, isLoading: templatesLoading } = useQuery<{ templates: ReportTemplate[] }>({
    queryKey: ["/api/reports/templates"]
  });

  // Fetch report history
  const { data: historyData, isLoading: historyLoading } = useQuery<{ reports: ReportHistory[] }>({
    queryKey: ["/api/reports/history"]
  });

  // Generate report mutation
  const generateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/reports/generate", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: (data) => {
      toast({
        title: "Report generated successfully",
        description: "Your report is ready for download."
      });
    },
    onError: () => {
      toast({
        title: "Failed to generate report",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleGenerateReport = () => {
    if (!selectedTemplate) {
      toast({
        title: "Please select a report type",
        variant: "destructive"
      });
      return;
    }

    generateMutation.mutate({
      type: selectedTemplate,
      startDate: dateRange.from?.toISOString(),
      endDate: dateRange.to?.toISOString(),
      format: exportFormat
    });
  };

  const templates = templatesData?.templates || [];
  const history = historyData?.reports || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <SEO
        title="Reports & Analytics | MyeCA.in"
        description="Generate comprehensive tax and business reports"
        keywords="tax reports, business analytics, compliance reports"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Reports & Analytics</h1>
          <p className="text-xl text-gray-600">Generate detailed reports for tax, compliance, and business insights</p>
        </motion.div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList>
            <TabsTrigger value="generate">Generate Report</TabsTrigger>
            <TabsTrigger value="history">Report History</TabsTrigger>
            <TabsTrigger value="insights">Quick Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Report Templates */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Select Report Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templatesLoading ? (
                  <div className="col-span-full flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  (templates || []).map((template: ReportTemplate) => {
                    const Icon = iconMap[template.icon] || FileText;
                    const isSelected = selectedTemplate === template.id;
                    
                    return (
                      <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={cn(
                            "cursor-pointer transition-all",
                            isSelected && "ring-2 ring-blue-600"
                          )}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className={`p-2 bg-${template.color}-100 rounded-lg`}>
                                <Icon className={`h-6 w-6 text-${template.color}-600`} />
                              </div>
                              {isSelected && (
                                <Badge className="bg-blue-600">Selected</Badge>
                              )}
                            </div>
                            <CardTitle className="mt-4">{template.name}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                          </CardHeader>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Report Configuration */}
            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle>Configure Report</CardTitle>
                  <CardDescription>Set parameters for your report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date Range</label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.from ? format(dateRange.from, "PPP") : "From date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateRange.from}
                              onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                            />
                          </PopoverContent>
                        </Popover>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.to ? format(dateRange.to, "PPP") : "To date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateRange.to}
                              onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Format */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Export Format</label>
                      <Select value={exportFormat} onValueChange={setExportFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                          <SelectItem value="csv">CSV File</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleGenerateReport}
                    disabled={generateMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Download previously generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No reports generated yet</p>
                ) : (
                  <div className="space-y-4">
                    {(history || []).map((report: ReportHistory) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{report.name}</h4>
                            <p className="text-sm text-gray-500">
                              Generated on {new Date(report.generatedAt).toLocaleDateString()} • {report.size}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download {report.format.toUpperCase()}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Tax Saved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div>
                      <span className="text-2xl font-bold">\u20B92.5L</span>
                      <p className="text-xs text-gray-500">This year</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Compliance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <div>
                      <span className="text-2xl font-bold">92%</span>
                      <p className="text-xs text-gray-500">Excellent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div>
                      <span className="text-2xl font-bold">120</span>
                      <p className="text-xs text-gray-500">+15% growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Revenue Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div>
                      <span className="text-2xl font-bold">+24%</span>
                      <p className="text-xs text-gray-500">YoY</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Filing Trends</CardTitle>
                  <CardDescription>Monthly filing statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <BarChart className="h-12 w-12 text-gray-400" />
                    <p className="ml-4 text-gray-500">Chart visualization here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>Usage across different services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <PieChart className="h-12 w-12 text-gray-400" />
                    <p className="ml-4 text-gray-500">Chart visualization here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}