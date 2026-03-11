import { motion } from "framer-motion";
import { Calendar, FileText, Download, Bell, Filter, Search, ChevronRight, Clock, AlertCircle, CalendarDays, CheckCircle2, Info, AlertTriangle, IndianRupee, Users, Building2, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import PenaltyCalculator from "@/components/PenaltyCalculator";

// Compliance data based on the PDF
const complianceData = {
  january: [
    { date: "05-Jan", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07-Jan", reg: "FEMA", activity: "ECB 2 Return" },
    { date: "07-Jan", reg: "IT", activity: "TDS/ TCS Deposit (Dec)" },
    { date: "10-Jan", reg: "GST", activity: "GSTR – 7 (TDS) & GSTR-8 (TCS)" },
    { date: "11-Jan", reg: "GST", activity: "GSTR - 1 (Monthly)" },
    { date: "13-Jan", reg: "GST", activity: "GSTR - 1 QRMP (Oct-Dec)" },
    { date: "15-Jan", reg: "IT", activity: "Form 15G/15H (Oct-Dec)" },
    { date: "20-Jan", reg: "GST", activity: "GSTR – 3B (Monthly)" },
    { date: "25-Jan", reg: "GST", activity: "GSTR – 3B QRMP (Oct-Dec)" },
    { date: "31-Jan", reg: "IT", activity: "TDS Return (Oct-Dec)" }
  ],
  february: [
    { date: "05-Feb", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07-Feb", reg: "IT", activity: "TDS/ TCS Deposit (Jan)" },
    { date: "10-Feb", reg: "GST", activity: "GSTR – 7 (TDS) & GSTR-8 (TCS)" },
    { date: "11-Feb", reg: "GST", activity: "GSTR - 1 (Monthly)" },
    { date: "13-Feb", reg: "GST", activity: "QRMP IFF (Jan)" },
    { date: "20-Feb", reg: "GST", activity: "GSTR – 3B (Monthly)" },
    { date: "25-Feb", reg: "GST", activity: "PMT-06 (Jan)" }
  ],
  march: [
    { date: "05-Mar", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07-Mar", reg: "FEMA", activity: "ECB 2 Return" },
    { date: "07-Mar", reg: "IT", activity: "TDS/ TCS Deposit (Feb)" },
    { date: "10-Mar", reg: "GST", activity: "GSTR – 7 (TDS) & GSTR-8 (TCS)" },
    { date: "11-Mar", reg: "GST", activity: "GSTR - 1 (Monthly)" },
    { date: "13-Mar", reg: "GST", activity: "QRMP IFF (Feb)" },
    { date: "15-Mar", reg: "IT", activity: "Advance Tax (Final Installment)" },
    { date: "20-Mar", reg: "GST", activity: "GSTR – 3B (Monthly)" },
    { date: "25-Mar", reg: "GST", activity: "PMT-06 (Feb)" },
    { date: "31-Mar", reg: "IT", activity: "Last date for Tax Saving Investments" },
    { date: "31-Mar", reg: "MCA", activity: "CSR-2 Filing" }
  ],
  april: [
    { date: "01-Apr", reg: "MCA", activity: "Declaration from Director - Form MBP-1 and Form DIR-8" },
    { date: "05-Apr", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07-Apr", reg: "IT", activity: "TCS Deposit (Mar)" },
    { date: "10-Apr", reg: "GST", activity: "GSTR – 7 (TDS) & GSTR-8 (TCS)" },
    { date: "11-Apr", reg: "GST", activity: "GSTR - 1 (Mar)" },
    { date: "13-Apr", reg: "GST", activity: "GSTR - 1 QRMP (Jan-Mar)" },
    { date: "18-Apr", reg: "GST", activity: "GST CMP-08 (Composite)" },
    { date: "20-Apr", reg: "GST", activity: "GSTR – 3B (Mar)" },
    { date: "30-Apr", reg: "IT", activity: "TDS Deposit (Mar)" },
    { date: "30-Apr", reg: "MCA", activity: "MSME-1 Return" }
  ],
  may: [
    { date: "05-May", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07-May", reg: "IT", activity: "TDS/ TCS Deposit (Apr)" },
    { date: "10-May", reg: "GST", activity: "GSTR – 7 (TDS) & GSTR-8 (TCS)" },
    { date: "11-May", reg: "GST", activity: "GSTR 1 (Apr)" },
    { date: "13-May", reg: "GST", activity: "QRMP IFF (Apr)" },
    { date: "15-May", reg: "IT", activity: "TCS Return (Jan-Mar)" },
    { date: "20-May", reg: "GST", activity: "GSTR – 3B (Apr)" },
    { date: "31-May", reg: "IT", activity: "TDS Return (Jan-Mar)" }
  ],
  june: [
    { date: "05-Jun", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07-Jun", reg: "IT", activity: "TDS/ TCS Deposit (May)" },
    { date: "10-Jun", reg: "GST", activity: "GSTR – 7 (TDS) & GSTR-8 (TCS)" },
    { date: "11-Jun", reg: "GST", activity: "GSTR 1 (May)" },
    { date: "15-Jun", reg: "IT", activity: "Advance tax Q1" },
    { date: "20-Jun", reg: "GST", activity: "GSTR – 3B (May)" },
    { date: "30-Jun", reg: "MCA", activity: "Form DPT-3" }
  ],
  july: [
    { date: "05-Jul", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07-Jul", reg: "IT", activity: "TDS/ TCS Deposit (Jun)" },
    { date: "10-Jul", reg: "GST", activity: "GSTR – 7 (TDS) & GSTR-8 (TCS)" },
    { date: "11-Jul", reg: "GST", activity: "GSTR – 1 (Jun)" },
    { date: "13-Jul", reg: "GST", activity: "GSTR - 1 QRMP (Apr-Jun)" },
    { date: "20-Jul", reg: "GST", activity: "GSTR – 3B (Jun)" },
    { date: "31-Jul", reg: "IT", activity: "ITR Filing (Non-Audit Cases)" },
    { date: "31-Jul", reg: "IT", activity: "TDS Return (Apr-Jun)" }
  ],
  august: [
    { date: "05-Aug", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07-Aug", reg: "IT", activity: "TDS/ TCS Deposit (Jul)" },
    { date: "10-Aug", reg: "GST", activity: "GSTR – 7 (TDS) & GSTR-8 (TCS)" },
    { date: "11-Aug", reg: "GST", activity: "GSTR – 1 (Jul)" },
    { date: "13-Aug", reg: "GST", activity: "QRMP IFF (Jul)" },
    { date: "20-Aug", reg: "GST", activity: "GSTR – 3B (Jul)" },
    { date: "31-Aug", reg: "MCA", activity: "DIR-3 KYC" }
  ],
  september: [
    { date: "05-Sep", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07-Sep", reg: "IT", activity: "TDS/ TCS Deposit (Aug)" },
    { date: "10-Sep", reg: "GST", activity: "GSTR – 7 (TDS) & GSTR-8 (TCS)" },
    { date: "11-Sep", reg: "GST", activity: "GSTR – 1 (Aug)" },
    { date: "15-Sep", reg: "IT", activity: "Advance Tax Q2" },
    { date: "20-Sep", reg: "GST", activity: "GSTR – 3B (Aug)" },
    { date: "30-Sep", reg: "IT", activity: "Tax Audit Report Filing" },
    { date: "30-Sep", reg: "MCA", activity: "Holding of AGM" }
  ],
  october: [
    { date: "05-Oct", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07-Oct", reg: "IT", activity: "TDS/ TCS Deposit (Sep)" },
    { date: "11-Oct", reg: "GST", activity: "GSTR – 1 (Sep)" },
    { date: "13-Oct", reg: "GST", activity: "GSTR - 1 QRMP (Jul-Sep)" },
    { date: "15-Oct", reg: "MCA", activity: "Form ADT-01 (Auditor Appt)" },
    { date: "20-Oct", reg: "GST", activity: "GSTR – 3B (Sep)" },
    { date: "31-Oct", reg: "IT", activity: "ITR Filing (Audit Cases)" },
    { date: "31-Oct", reg: "IT", activity: "TDS Return (Jul-Sep)" }
  ],
  november: [
    { date: "05-Nov", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07-Nov", reg: "IT", activity: "TDS/ TCS Deposit (Oct)" },
    { date: "11-Nov", reg: "GST", activity: "GSTR – 1 (Oct)" },
    { date: "13-Nov", reg: "GST", activity: "QRMP IFF (Oct)" },
    { date: "20-Nov", reg: "GST", activity: "GSTR – 3B (Oct)" },
    { date: "30-Nov", reg: "MCA", activity: "Form AOC-4 (Financials)" }
  ],
  december: [
    { date: "05-Dec", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07-Dec", reg: "IT", activity: "TDS/ TCS Deposit (Nov)" },
    { date: "11-Dec", reg: "GST", activity: "GSTR – 1 (Nov)" },
    { date: "15-Dec", reg: "IT", activity: "Advance Tax Q3" },
    { date: "20-Dec", reg: "GST", activity: "GSTR – 3B (Nov)" },
    { date: "31-Dec", reg: "GST", activity: "GSTR-9 & GSTR-9C (Annual)" },
    { date: "31-Dec", reg: "MCA", activity: "Form MGT-7 (Annual Return)" }
  ]
};

const monthKeys = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

const regulatoryCategories = [
  { value: "all", label: "All Regulations" },
  { value: "GST", label: "GST" },
  { value: "IT", label: "Income Tax" },
  { value: "MCA", label: "MCA/ROC" },
  { value: "FEMA", label: "FEMA/RBI" },
  { value: "SEZ", label: "SEZ/STPI" }
];

export default function ComplianceCalendarPage() {
  const today = new Date();
  const currentMonthKey = monthKeys[today.getMonth()];
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [selectedRegulation, setSelectedRegulation] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminders, setReminders] = useState<string[]>([]);

  // Filtering Logic
  const filteredData = (complianceData[selectedMonth as keyof typeof complianceData] || []).filter(item => {
    const matchesRegulation = selectedRegulation === "all" || item.reg === selectedRegulation;
    const matchesSearch = item.activity.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.reg.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRegulation && matchesSearch;
  });

  const groupedByDate = filteredData.reduce((acc: any, item) => {
    const date = item.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const getRegulationColor = (reg: string) => {
    const colors: Record<string, string> = {
      GST: "bg-blue-600 text-white",
      IT: "bg-emerald-600 text-white",
      MCA: "bg-purple-600 text-white",
      FEMA: "bg-orange-600 text-white",
      SEZ: "bg-pink-600 text-white"
    };
    return colors[reg] || "bg-slate-600 text-white";
  };

  const getUpcomingCount = () => {
    let count = 0;
    const now = new Date();
    Object.entries(complianceData).forEach(([month, items]) => {
      items.forEach(item => {
        const [day] = item.date.split('-');
        const itemDate = new Date(now.getFullYear(), monthKeys.indexOf(month), parseInt(day));
        if (itemDate >= now) count++;
      });
    });
    return count;
  };

  const getDateStatus = (dateStr: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const [day] = dateStr.split('-');
    const itemDate = new Date(now.getFullYear(), monthKeys.indexOf(selectedMonth), parseInt(day));
    itemDate.setHours(0, 0, 0, 0);

    if (itemDate.getTime() === now.getTime()) return "today";
    if (itemDate < now) return "past";
    return "upcoming";
  };

  const getDaysRemaining = (dateStr: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const [day] = dateStr.split('-');
    const itemDate = new Date(now.getFullYear(), monthKeys.indexOf(selectedMonth), parseInt(day));
    itemDate.setHours(0, 0, 0, 0);
    
    const diffTime = itemDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Compact Hero Section */}
      <section className="relative bg-white pt-20 pb-12 border-b border-slate-100">
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Real-time Tracker
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">
            Smart <span className="text-blue-600">Compliance</span> Calendar
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mb-6">
            Stay ahead of regulatory deadlines for FY 2025-26. 
            Automated tracking for GST, IT, and MCA.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="sm" onClick={() => setShowReminderModal(true)} className="h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-blue-200">
              <Bell className="w-4 h-4 mr-2" />
              Set Alerts
            </Button>
            <Button size="sm" variant="outline" className="h-11 border-slate-200 rounded-xl px-6 font-bold text-slate-600">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </section>

      {/* Integrated Filter Bar - More Compact */}
      <section className="sticky top-16 lg:top-[56px] z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input 
                placeholder="Find a deadline..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-sm"
              />
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                <SelectTrigger className="flex-1 md:w-[150px] h-10 rounded-xl bg-slate-50 text-sm">
                  <SelectValue placeholder="Regulation" />
                </SelectTrigger>
                <SelectContent>
                  {regulatoryCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="hidden sm:flex items-center gap-2 px-3 bg-slate-50 border border-slate-200 rounded-xl h-10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-black text-slate-600 uppercase">{filteredData.length} Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Calendar Content - Grid Improvements */}
      <section className="py-8 bg-slate-50/20 min-h-screen">
        <div className="container mx-auto px-4">
          <Tabs value={selectedMonth} onValueChange={setSelectedMonth} className="mb-8">
            <TabsList className="w-full bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-hide flex justify-start sm:justify-center h-12">
              {monthKeys.map((key) => (
                <TabsTrigger 
                  key={key} 
                  value={key} 
                  className="flex-shrink-0 min-w-[70px] sm:flex-1 rounded-lg py-1.5 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all transition-duration-300"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1, 3)}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedMonth} className="mt-6">
              {filteredData.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                  <Search className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-400">No matching deadlines.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Object.entries(groupedByDate).sort().map(([date, items]: any) => {
                    const status = getDateStatus(date);
                    const daysLeft = getDaysRemaining(date);
                    
                    return (
                      <Card key={date} className={`border border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden ${status === 'today' ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
                        <CardHeader className={`${status === 'today' ? 'bg-blue-50/50' : status === 'past' ? 'bg-slate-50' : 'bg-white'} py-4 px-4 border-b border-slate-100`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-black ${status === 'today' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-900 border border-slate-200'}`}>
                                <span className="text-sm leading-none">{date.split('-')[0]}</span>
                                <span className="text-[8px] uppercase">{date.split('-')[1]}</span>
                              </div>
                              <div>
                                <CardTitle className="text-sm text-slate-900 font-bold">{date}</CardTitle>
                                <div className="mt-0.5">
                                  {status === 'today' ? (
                                    <Badge className="bg-red-500 text-white font-black text-[8px] py-0 h-4 uppercase">Today</Badge>
                                  ) : status === 'past' ? (
                                    <Badge className="bg-slate-100 text-slate-400 font-bold text-[8px] py-0 h-4 uppercase border-0">Ended</Badge>
                                  ) : (
                                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold text-[8px] py-0 h-4">{daysLeft}D Left</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <CalendarDays className={`w-4 h-4 ${status === 'today' ? 'text-blue-600' : 'text-slate-300'}`} />
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-slate-100">
                            {items.map((item: any, idx: number) => (
                              <div key={idx} className="p-4 hover:bg-slate-50/50 transition-colors group">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <Badge className={`${getRegulationColor(item.reg)} h-4 text-[8px] font-black px-1.5 tracking-tighter`}>
                                        {item.reg}
                                      </Badge>
                                      {item.activity.toLowerCase().includes('annual') && (
                                        <Badge variant="outline" className="h-4 text-[8px] text-purple-600 border-purple-200 font-black">ANNUAL</Badge>
                                      )}
                                    </div>
                                    <h4 className="text-slate-700 font-bold text-xs leading-snug">
                                      {item.activity}
                                    </h4>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-blue-600">
                                    <Bell className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* New Penalty Section - More Compact & Light Tinted */}
          <div className="mt-16 mb-20">
            <PenaltyCalculator />
          </div>

          <div className="mt-12 max-w-4xl mx-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-blue-50/50 border-blue-100 rounded-2xl p-6">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                         <Info className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Filing Advisory</h4>
                   </div>
                   <ul className="space-y-3">
                      <li className="flex gap-3 text-xs text-slate-600 font-medium leading-relaxed">
                         <div className="w-4 h-4 bg-white border border-blue-200 rounded-full flex items-center justify-center shrink-0">1</div>
                         Always verify the actual portal due dates as extensions are common.
                      </li>
                      <li className="flex gap-3 text-xs text-slate-600 font-medium leading-relaxed">
                         <div className="w-4 h-4 bg-white border border-blue-200 rounded-full flex items-center justify-center shrink-0">2</div>
                         Nil GST returns take 2 minutes - file them today to avoid any late fees.
                      </li>
                   </ul>
                </Card>

                <Card className="bg-indigo-50/50 border-indigo-100 rounded-2xl p-6">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                         <Shield className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Security Check</h4>
                   </div>
                   <ul className="space-y-3">
                      <li className="flex gap-3 text-xs text-slate-600 font-medium leading-relaxed">
                         <div className="w-4 h-4 bg-white border border-indigo-200 rounded-full flex items-center justify-center shrink-0">1</div>
                         Plan filings 48 hours in advance to handle portal downtime/slowdowns.
                      </li>
                      <li className="flex gap-3 text-xs text-slate-600 font-medium leading-relaxed">
                         <div className="w-4 h-4 bg-white border border-indigo-200 rounded-full flex items-center justify-center shrink-0">2</div>
                         TDS interest is charged for the full month even for a 1-day delay.
                      </li>
                   </ul>
                </Card>
             </div>
          </div>
        </div>
      </section>

      {/* Reminder Setting Mock Modal */}
      <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
        <DialogContent className="sm:max-w-[400px] rounded-[1.5rem] border-slate-200 p-0 overflow-hidden">
          <div className="bg-blue-600 p-6 text-white text-center">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-80" />
              <DialogTitle className="text-xl font-bold">Email Alerts</DialogTitle>
              <p className="text-xs text-blue-100 mt-1">Get weekly summaries of your upcoming tasks.</p>
          </div>
          <div className="p-6 space-y-3">
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
               <span className="font-bold text-slate-800 text-xs">7 Days Warning</span>
               <Checkbox defaultChecked />
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
               <span className="font-bold text-slate-800 text-xs">Final Day Alert</span>
               <Checkbox defaultChecked />
             </div>
             <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 rounded-xl font-bold text-xs mt-4" onClick={() => setShowReminderModal(false)}>
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}