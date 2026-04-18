import { useState } from "react";
import { m } from "framer-motion";
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
import { Layout } from "@/components/admin/Layout";
import { Label } from "@/components/ui/label";

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
    <Layout>
      <SEO
        title="Reports & Analytics | MyeCA.in"
        description="Generate comprehensive tax and business reports"
        keywords="tax reports, business analytics, compliance reports"
      />

      <div className="flex flex-col lg:flex-row gap-12 items-start bg-slate-50/50 rounded-[48px] p-2">
        {/* Sticky Left Summary Section */}
        <div className="lg:w-96 shrink-0 w-full space-y-6 lg:sticky lg:top-[112px]">
          <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-100/50">
             <div className="h-28 bg-gradient-to-br from-blue-500 to-indigo-500 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
             </div>
             <CardContent className="relative px-6 pb-8">
                <div className="flex flex-col items-center -mt-14">
                   <div className="w-28 h-28 rounded-[40px] bg-white p-2 shadow-2xl">
                      <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-4xl font-black text-blue-600 border border-blue-100">
                         <BarChart className="h-10 w-10" />
                      </div>
                   </div>
                   <div className="mt-5 text-center">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Financial Intelligence</h2>
                      <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5">
                         Live Analytics
                      </Badge>
                   </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3">
                   {[
                     { label: "Tax Saved", value: "₹2.5L", icon: DollarSign, color: "emerald" },
                     { label: "Compliance", value: "92%", icon: Shield, color: "blue" },
                     { label: "Reports", value: history.length || 12, icon: FileText, color: "indigo" },
                     { label: "Growth", value: "+24%", icon: TrendingUp, color: "amber" }
                   ].map((stat, i) => (
                     <div key={i} className="p-4 rounded-3xl bg-slate-50 border border-slate-100/50 flex flex-col items-center text-center">
                        <stat.icon className={cn("h-4 w-4 mb-2", `text-${stat.color}-600`)} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                        <span className="text-sm font-black text-slate-900 leading-none">{stat.value}</span>
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>

          <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100/50 relative overflow-hidden group cursor-pointer shadow-xl shadow-blue-50">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 transition-all group-hover:scale-150" />
             <Activity className="h-8 w-8 text-blue-500 mb-6" />
             <h3 className="font-black text-xl leading-tight mb-3 text-slate-900">Health Check</h3>
             <p className="text-slate-500 text-[10px] font-medium leading-relaxed mb-6">Automated scan for audit risks and tax optimization gaps.</p>
             <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest h-11 rounded-2xl shadow-lg shadow-blue-100 border-none transition-all">Scan Health</Button>
          </div>
        </div>

        {/* Main Content Area - Full Page Scroll */}
        <div className="flex-1 min-w-0 w-full lg:max-w-7xl space-y-10 pb-20">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-12 rounded-[48px] shadow-sm border border-slate-100/50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Reporting Engine</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Reports & Analytics</h1>
              <p className="text-slate-500 max-w-2xl text-base font-medium leading-relaxed">
                Generate high-authority reports for filing, business health, and strategic tax planning.
              </p>
            </div>
          </div>

          <Tabs defaultValue="generate" className="space-y-10">
            <TabsList className="h-16 p-2 bg-white rounded-[24px] shadow-sm border border-slate-100/50">
              <TabsTrigger value="generate" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white">Generate Intelligence</TabsTrigger>
              <TabsTrigger value="history" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white">Archived Records</TabsTrigger>
              <TabsTrigger value="insights" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white">Trend Visualization</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-10 outline-none">
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight ml-2">Available Intelligence Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {templatesLoading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                      <p className="mt-4 text-sm font-black text-slate-400 uppercase tracking-widest">Loading Analytics Templates...</p>
                    </div>
                  ) : (
                    (templates || []).map((template: ReportTemplate) => {
                      const Icon = iconMap[template.icon] || FileText;
                      const isSelected = selectedTemplate === template.id;
                      
                      return (
                        <m.div
                          key={template.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className={cn(
                              "cursor-pointer transition-all border-none shadow-sm rounded-[40px] overflow-hidden group",
                              isSelected ? "ring-2 ring-blue-600 shadow-xl shadow-blue-50" : "bg-white hover:bg-blue-50/20"
                            )}
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <CardHeader className="p-8 pb-4">
                              <div className="flex items-center justify-between mb-4">
                                <div className={cn(
                                   "h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                                   isSelected ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                                )}>
                                  <Icon className="h-7 w-7" />
                                </div>
                                {isSelected && (
                                  <Badge className="bg-blue-600 text-white border-none font-black text-[8px] uppercase px-3 py-1 rounded-full">Primary Select</Badge>
                                )}
                              </div>
                              <CardTitle className="text-xl font-black text-slate-900">{template.name}</CardTitle>
                              <CardDescription className="text-xs font-medium text-slate-500 leading-relaxed mt-2">{template.description}</CardDescription>
                            </CardHeader>
                          </Card>
                        </m.div>
                      );
                    })
                  )}
                </div>
              </div>

              {selectedTemplate && (
                <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                   <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white border border-slate-100/50 p-12">
                     <CardHeader className="px-0 pt-0 pb-10">
                       <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Report Configuration</CardTitle>
                       <CardDescription className="text-base font-medium text-slate-500">Specify parameters for the generated data.</CardDescription>
                     </CardHeader>
                     <CardContent className="px-0 space-y-10">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         {/* Date Range */}
                         <div className="space-y-4">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Analysis Period</Label>
                           <div className="grid grid-cols-2 gap-4">
                             <Popover>
                               <PopoverTrigger asChild>
                                 <Button variant="outline" className="h-14 rounded-2xl bg-slate-50 border-none text-left font-black text-sm shadow-inner justify-start">
                                   <CalendarIcon className="mr-3 h-4 w-4 text-blue-600" />
                                   {dateRange.from ? format(dateRange.from, "PP") : "Start Date"}
                                 </Button>
                               </PopoverTrigger>
                               <PopoverContent className="w-auto p-0 rounded-[32px] overflow-hidden border-none shadow-2xl">
                                 <Calendar
                                   mode="single"
                                   selected={dateRange.from}
                                   onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                                 />
                               </PopoverContent>
                             </Popover>
                             
                             <Popover>
                               <PopoverTrigger asChild>
                                 <Button variant="outline" className="h-14 rounded-2xl bg-slate-50 border-none text-left font-black text-sm shadow-inner justify-start">
                                   <CalendarIcon className="mr-3 h-4 w-4 text-blue-600" />
                                   {dateRange.to ? format(dateRange.to, "PP") : "End Date"}
                                 </Button>
                               </PopoverTrigger>
                               <PopoverContent className="w-auto p-0 rounded-[32px] overflow-hidden border-none shadow-2xl">
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
                         <div className="space-y-4">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Export Architecture</Label>
                           <Select value={exportFormat} onValueChange={setExportFormat}>
                             <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none text-base font-black shadow-inner">
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="rounded-2xl">
                               <SelectItem value="pdf">Professional PDF</SelectItem>
                               <SelectItem value="excel">Business Excel (XLSX)</SelectItem>
                               <SelectItem value="csv">Standard Data (CSV)</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                       </div>

                       <div className="pt-6 border-t border-slate-50">
                          <Button 
                            onClick={handleGenerateReport}
                            disabled={generateMutation.isPending}
                            className="h-16 px-16 rounded-[32px] bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 transition-all hover:-translate-y-1"
                          >
                            {generateMutation.isPending ? (
                              <>
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                Processing Big Data...
                              </>
                            ) : (
                              <>
                                <FileText className="mr-3 h-5 w-5" />
                                Generate Final Report
                              </>
                            )}
                          </Button>
                       </div>
                     </CardContent>
                   </Card>
                </m.div>
              )}
            </TabsContent>

            <TabsContent value="history" className="outline-none">
              <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white border border-slate-100/50">
                <CardHeader className="p-12 border-b border-slate-50">
                  <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Analysis Archive</CardTitle>
                  <CardDescription className="text-base font-medium text-slate-500">Access and synchronize historical intelligence records.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {historyLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                      <p className="mt-4 text-sm font-black text-slate-400 uppercase tracking-widest">Retrieving Archive...</p>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-slate-50/20">
                       <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
                          <FileText className="h-10 w-10 text-slate-200" />
                       </div>
                       <p className="text-base font-black text-slate-400 uppercase tracking-widest">No intelligence records found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {(history || []).map((report: ReportHistory) => (
                        <div key={report.id} className="flex items-center justify-between p-10 hover:bg-blue-50/20 transition-colors group">
                          <div className="flex items-center gap-6">
                            <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                              <FileText className="h-7 w-7" />
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-slate-900 leading-none mb-2">{report.name}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Generated {format(new Date(report.generatedAt), "MMM dd, yyyy")} • {report.size}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600">
                            <Download className="h-4 w-4 mr-2" />
                            Download {report.format}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-10 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white border border-slate-100/50 p-12">
                  <CardHeader className="px-0 pt-0 pb-10">
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Tax Filing Trends</CardTitle>
                    <CardDescription className="text-base font-medium text-slate-500">Monthly lifecycle statistics.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="h-80 flex items-center justify-center bg-slate-50/50 rounded-[40px] border border-slate-100/50 shadow-inner">
                      <BarChart className="h-16 w-16 text-slate-200 animate-pulse" />
                      <p className="ml-4 text-sm font-black text-slate-400 uppercase tracking-widest">Trend Visualization Loading...</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white border border-slate-100/50 p-12">
                  <CardHeader className="px-0 pt-0 pb-10">
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Service Distribution</CardTitle>
                    <CardDescription className="text-base font-medium text-slate-500">Resource allocation across domains.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="h-80 flex items-center justify-center bg-slate-50/50 rounded-[40px] border border-slate-100/50 shadow-inner">
                      <PieChart className="h-16 w-16 text-slate-200 animate-pulse" />
                      <p className="ml-4 text-sm font-black text-slate-400 uppercase tracking-widest">Domain Distribution Loading...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}