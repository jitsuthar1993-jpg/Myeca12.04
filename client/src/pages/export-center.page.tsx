import { useState } from "react";
import { m } from "framer-motion";
import { 
  Download, FileText, Table, FileSpreadsheet, File, 
  Calendar, Filter, Check, AlertCircle, Loader2,
  TrendingUp, Users, Receipt, BarChart3, Clock, Shield
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
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { addDays, format } from "date-fns";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";

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
    <Layout>
      <SEO
        title="Export Center - Data Sovereignty | MyeCA.in"
        description="Export your tax returns, transactions, and reports in multiple formats. Download data in PDF, Excel, or CSV format."
        keywords="export data, download reports, tax return export, transaction export, data download"
      />

      <div className="flex flex-col lg:flex-row gap-12 items-start h-[calc(100vh-200px)] lg:h-[calc(100vh-240px)] overflow-hidden bg-slate-50/50 rounded-[48px] p-2">
        {/* Fixed Left Sidebar */}
        <div className="lg:w-96 h-full overflow-y-auto pr-2 shrink-0 w-full scrollbar-none pb-10 space-y-6">
          <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-100/50">
             <div className="h-28 bg-gradient-to-br from-indigo-500 to-purple-500 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
             </div>
             <CardContent className="relative px-6 pb-8">
                <div className="flex flex-col items-center -mt-14">
                   <div className="w-28 h-28 rounded-[40px] bg-white p-2 shadow-2xl">
                      <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-4xl font-black text-indigo-600 border border-indigo-100">
                         <Download className="h-10 w-10" />
                      </div>
                   </div>
                   <div className="mt-5 text-center">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Data Vault</h2>
                      <Badge variant="outline" className="mt-2 bg-indigo-50 text-indigo-700 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5">
                         Live Sync Enabled
                      </Badge>
                   </div>
                </div>

                <div className="mt-10 space-y-3">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Export Categories</Label>
                   {Object.entries(exportTypes).map(([key, type]) => {
                     const Icon = type.icon;
                     return (
                       <button
                         key={key}
                         onClick={() => setSelectedType(key)}
                         className={cn(
                           "w-full group p-4 rounded-3xl border-none transition-all flex items-center gap-4 text-left",
                           selectedType === key 
                             ? 'bg-indigo-600 shadow-lg shadow-indigo-100' 
                             : 'hover:bg-slate-50'
                         )}
                       >
                         <div className={cn(
                           "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                           selectedType === key ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-white'
                         )}>
                           <Icon className={cn("h-5 w-5", selectedType === key ? 'text-white' : 'text-slate-400')} />
                         </div>
                         <div className="flex-1">
                           <p className={cn("text-xs font-black uppercase tracking-wider", selectedType === key ? 'text-white' : 'text-slate-900')}>{type.name}</p>
                           <p className={cn("text-[10px] font-medium", selectedType === key ? 'text-indigo-100' : 'text-slate-400')}>
                             {type.formats.join(" • ")}
                           </p>
                         </div>
                       </button>
                     );
                   })}
                </div>
             </CardContent>
          </Card>

          {/* Recent Exports */}
          <Card className="border-none shadow-sm rounded-[40px] bg-white p-8 border border-slate-100/50">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Recent Activity</h3>
                <TrendingUp className="h-4 w-4 text-slate-300" />
             </div>
             <div className="space-y-6">
                {[
                  { name: "Tax Returns 24-25", time: "2D AGO", format: "PDF", icon: FileText },
                  { name: "Transactions Q3", time: "5D AGO", format: "XLS", icon: Table },
                  { name: "Client Master", time: "1W AGO", format: "CSV", icon: Users }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <item.icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{item.name}</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{item.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-slate-100 text-[8px] font-black text-slate-400">{item.format}</Badge>
                  </div>
                ))}
             </div>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 w-full lg:max-w-7xl h-full overflow-y-auto pr-4 pb-20 scroll-smooth custom-scrollbar space-y-10">
          <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100/50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Configuration Panel</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Custom Export Center</h1>
              <p className="text-slate-500 max-w-2xl text-base font-medium leading-relaxed">
                Configure your data extraction parameters. Select specific fields, timeframes, and formats for {currentExportType.name}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
             <div className="xl:col-span-3 space-y-10">
                <Card className="border-none shadow-sm rounded-[48px] bg-white p-10 border border-slate-100/50">
                   <div className="space-y-12">
                      {/* Format Selection */}
                      <div className="space-y-6">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Output Format</Label>
                        <RadioGroup value={selectedFormat} onValueChange={setSelectedFormat} className="grid grid-cols-3 gap-4">
                          {currentExportType.formats.map(format => (
                            <div key={format}>
                              <RadioGroupItem value={format} id={format} className="peer sr-only" />
                              <Label 
                                htmlFor={format} 
                                className="flex flex-col items-center justify-center p-6 rounded-[32px] border-2 border-slate-50 bg-slate-50/50 hover:bg-white hover:border-indigo-100 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50/50 transition-all cursor-pointer group"
                              >
                                {format === "PDF" && <FileText className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />}
                                {format === "Excel" && <FileSpreadsheet className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />}
                                {format === "CSV" && <Table className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />}
                                <span className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-600">{format}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Filters */}
                      <div className="space-y-6">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Constraints</Label>
                        <div className="grid md:grid-cols-2 gap-6">
                          {currentExportType.filters.includes("Date Range") && (
                            <div className="col-span-full space-y-3">
                              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Timeline</Label>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                  <Input 
                                    type="date" 
                                    value={format(dateRange.from, 'yyyy-MM-dd')}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                                    className="h-14 pl-12 rounded-2xl bg-slate-50 border-none text-[11px] font-black uppercase tracking-widest"
                                  />
                                </div>
                                <div className="relative">
                                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                  <Input 
                                    type="date" 
                                    value={format(dateRange.to, 'yyyy-MM-dd')}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                                    className="h-14 pl-12 rounded-2xl bg-slate-50 border-none text-[11px] font-black uppercase tracking-widest"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {currentExportType.filters.includes("Year") && (
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assessment Year</Label>
                              <Select defaultValue="2024-25">
                                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none text-[11px] font-black uppercase tracking-widest">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2024-25" className="text-[10px] font-black uppercase tracking-widest">2024-25</SelectItem>
                                  <SelectItem value="2023-24" className="text-[10px] font-black uppercase tracking-widest">2023-24</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {currentExportType.filters.includes("Status") && (
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">State Filter</Label>
                              <Select defaultValue="all">
                                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none text-[11px] font-black uppercase tracking-widest">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">All Records</SelectItem>
                                  <SelectItem value="filed" className="text-[10px] font-black uppercase tracking-widest">Filed Only</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Field Selection */}
                      <div className="space-y-6">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Schema Definition</Label>
                        <div className="grid md:grid-cols-2 gap-4">
                          {currentExportType.fields.map(field => (
                            <div key={field.id} className="flex items-center space-x-4 p-4 rounded-3xl bg-slate-50 group hover:bg-indigo-50/50 transition-colors">
                              <Checkbox 
                                id={field.id}
                                checked={selectedFields[field.id]}
                                onCheckedChange={() => handleFieldToggle(field.id)}
                                className="w-5 h-5 rounded-lg border-slate-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-none"
                              />
                              <Label 
                                htmlFor={field.id} 
                                className="flex-1 cursor-pointer text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-indigo-900"
                              >
                                {field.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>
                </Card>

                {/* Export Action */}
                <div className="bg-indigo-600 p-12 rounded-[48px] shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2" />
                   <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                      <div className="text-center md:text-left">
                         <h3 className="text-2xl font-black text-white tracking-tight mb-2">Initialize Data Pipeline</h3>
                         <p className="text-indigo-100 text-[11px] font-medium uppercase tracking-widest">Preparing {Object.values(selectedFields).filter(Boolean).length} Data Fields for {selectedFormat} Output</p>
                      </div>
                      <Button 
                        size="lg"
                        onClick={handleExport}
                        disabled={isExporting}
                        className="h-20 px-12 rounded-[32px] bg-white text-indigo-600 hover:bg-indigo-50 font-black text-sm uppercase tracking-widest border-none shadow-xl"
                      >
                        {isExporting ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            {exportProgress}%
                          </>
                        ) : (
                          <>
                            <Download className="mr-3 h-5 w-5" />
                            Generate Export
                          </>
                        )}
                      </Button>
                   </div>
                   {isExporting && (
                     <div className="mt-10 h-1.5 w-full bg-indigo-700/50 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-white transition-all duration-300" 
                           style={{ width: `${exportProgress}%` }}
                        />
                     </div>
                   )}
                </div>
             </div>

             <div className="xl:col-span-2 space-y-10">
                <Card className="border-none shadow-sm rounded-[48px] bg-white p-10 border border-slate-100/50">
                   <div className="flex items-center gap-4 mb-10">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                         <Check className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h4 className="font-black text-slate-900 tracking-tight text-xl uppercase tracking-tighter">Best Practices</h4>
                   </div>
                   <div className="space-y-8">
                      {[
                        { title: "Archival Policy", desc: "Official PDFs are immutable and ideal for audit trails and statutory submissions.", icon: Shield },
                        { title: "Analysis Ready", desc: "Excel and CSV formats enable granular pivot table analysis and fiscal modeling.", icon: Table },
                        { title: "Batch Sync", desc: "Large exports are processed in background workers to ensure UI responsiveness.", icon: Clock }
                      ].map((tip, i) => (
                        <div key={i} className="flex gap-6 group">
                           <div className="w-12 h-12 rounded-[20px] bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                              <tip.icon className="h-5 w-5 text-slate-300 group-hover:text-indigo-600" />
                           </div>
                           <div>
                              <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1.5">{tip.title}</h5>
                              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{tip.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </Card>

                <div className="bg-slate-900 p-10 rounded-[48px] text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
                   <div className="flex items-center gap-3 mb-6">
                      <AlertCircle className="h-5 w-5 text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Security Notice</span>
                   </div>
                   <p className="text-xs font-medium leading-relaxed text-slate-400">
                      Exports contain PII (Personally Identifiable Information). Ensure downloads are stored in encrypted environments.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}