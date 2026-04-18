import { m } from "framer-motion";
import { Calendar, FileText, Download, Bell, Filter, Search, ChevronRight, Clock, AlertCircle, CalendarDays, CheckCircle2, Info, AlertTriangle, IndianRupee, Users, Building2, Shield, Activity, ArrowRight, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import PenaltyCalculator from "@/components/PenaltyCalculator";
import { Layout } from "@/components/admin/Layout";
import SEO from "@/components/SEO";
import { cn } from "@/lib/utils";

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
    { date: "25-Aug", reg: "GST", activity: "PMT-06 (Jul)" },
    { date: "31-Aug", reg: "MCA", activity: "DIR-3 KYC" }
  ],
  september: [
    { date: "05-Sep", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07-Sep", reg: "FEMA", activity: "ECB 2 Return" },
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
    <Layout>
      <SEO
        title="Smart Compliance Calendar | MyeCA.in"
        description="Stay ahead of regulatory deadlines for FY 2025-26. Automated tracking for GST, IT, and MCA."
        keywords="compliance calendar, tax deadlines, GST due dates, ITR filing dates"
      />

      <div className="flex flex-col lg:flex-row gap-12 items-start bg-slate-50/50 rounded-[48px] p-2">
        {/* Sticky Left Summary Section */}
        <div className="lg:w-96 shrink-0 w-full space-y-6 lg:sticky lg:top-[112px]">
          <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-100/50">
             <div className="h-28 bg-gradient-to-br from-blue-500 to-cyan-500 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
             </div>
             <CardContent className="relative px-6 pb-8">
                <div className="flex flex-col items-center -mt-14">
                   <div className="w-28 h-28 rounded-[40px] bg-white p-2 shadow-2xl">
                      <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center text-4xl font-black text-blue-600 border border-blue-100">
                         <Calendar className="h-10 w-10" />
                      </div>
                   </div>
                   <div className="mt-5 text-center">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Compliance Ops</h2>
                      <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5">
                         {getUpcomingCount()} Upcoming Tasks
                      </Badge>
                   </div>
                </div>

                <div className="mt-10 space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Regulatory Filter</Label>
                      <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                         <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none text-xs font-black uppercase tracking-widest">
                            <SelectValue placeholder="Regulation" />
                         </SelectTrigger>
                         <SelectContent>
                            {regulatoryCategories.map(cat => (
                               <SelectItem key={cat.value} value={cat.value} className="text-[10px] font-black uppercase tracking-widest">{cat.label}</SelectItem>
                            ))}
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Context Search</Label>
                      <div className="relative group">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                         <Input 
                            placeholder="Find activity..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12 pl-11 rounded-2xl bg-slate-50 border-none text-xs font-black uppercase tracking-widest placeholder:text-slate-300"
                         />
                      </div>
                   </div>

                   <div className="pt-4 grid grid-cols-2 gap-3">
                      {[
                        { label: "GST Units", value: "08", color: "blue" },
                        { label: "Income Tax", value: "04", color: "emerald" },
                        { label: "MCA/ROC", value: "02", color: "purple" },
                        { label: "Other Ops", value: "03", color: "orange" }
                      ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-3xl bg-slate-50 border border-slate-100/50 flex flex-col items-center text-center">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                           <span className={cn("text-sm font-black leading-none", `text-${stat.color}-600`)}>{stat.value}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </CardContent>
          </Card>

          <div className="p-8 rounded-[40px] bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100/50 relative overflow-hidden group cursor-pointer shadow-xl shadow-blue-50">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2" />
             <Bell className="h-8 w-8 text-blue-500 mb-6" />
             <h3 className="font-black text-xl leading-tight mb-3 text-slate-900">Alert Center</h3>
             <p className="text-slate-500 text-[10px] font-medium leading-relaxed mb-6">Synchronize your local calendar with the central compliance engine.</p>
             <Button onClick={() => setShowReminderModal(true)} className="w-full bg-blue-600 text-white hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest h-11 rounded-2xl shadow-lg shadow-blue-100 border-none">Set Smart Reminders</Button>
          </div>
        </div>

        {/* Main Content Area - Full Page Scroll */}
        <div className="flex-1 min-w-0 w-full lg:max-w-7xl space-y-10 pb-20">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-12 rounded-[48px] shadow-sm border border-slate-100/50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Regulatory Timeline</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Compliance Calendar</h1>
              <p className="text-slate-500 max-w-2xl text-base font-medium leading-relaxed">
                Stay synchronized with the latest statutory deadlines for GST, Income Tax, MCA, and FEMA for the fiscal cycle 2025-26.
              </p>
            </div>
            <div className="flex gap-4">
               <Button variant="outline" className="h-16 px-8 rounded-3xl border-slate-100 font-black text-xs uppercase tracking-widest hover:bg-slate-50">
                  <Download className="w-5 h-5 mr-3 text-blue-600" />
                  Export PDF
               </Button>
            </div>
          </div>

          <Tabs value={selectedMonth} onValueChange={setSelectedMonth} className="space-y-10">
            <TabsList className="h-16 p-2 bg-white rounded-[24px] shadow-sm border border-slate-100/50 overflow-x-auto no-scrollbar justify-start sm:justify-center">
               {monthKeys.map((key) => (
                 <TabsTrigger 
                   key={key} 
                   value={key} 
                   className="rounded-2xl px-6 h-full font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                 >
                   {key.slice(0, 3)}
                 </TabsTrigger>
               ))}
            </TabsList>

            <TabsContent value={selectedMonth} className="outline-none">
              {filteredData.length === 0 ? (
                <div className="py-40 text-center bg-white rounded-[48px] border border-dashed border-slate-100">
                  <Search className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                  <p className="text-lg font-black text-slate-300 uppercase tracking-widest">No matching activities found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Object.entries(groupedByDate).sort().map(([date, items]: any) => {
                    const status = getDateStatus(date);
                    const daysLeft = getDaysRemaining(date);
                    
                    return (
                      <Card key={date} className={cn("border-none shadow-sm rounded-[32px] overflow-hidden bg-white group transition-all hover:shadow-xl", status === 'today' ? 'ring-2 ring-blue-500' : 'border border-slate-100/50')}>
                        <div className={cn("p-6 flex items-center justify-between", status === 'today' ? 'bg-blue-50/50' : status === 'past' ? 'bg-slate-50/50' : 'bg-white')}>
                           <div className="flex items-center gap-4">
                              <div className={cn("w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black", status === 'today' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-900 border border-slate-100')}>
                                 <span className="text-lg leading-none">{date.split('-')[0]}</span>
                                 <span className="text-[9px] uppercase tracking-tighter">{date.split('-')[1]}</span>
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-slate-900 leading-none">{date}</h4>
                                 <div className="mt-2">
                                    {status === 'today' ? (
                                      <Badge className="bg-red-500 text-white font-black text-[8px] py-0 h-4 uppercase border-none">Active Today</Badge>
                                    ) : status === 'past' ? (
                                      <Badge className="bg-slate-200 text-slate-500 font-black text-[8px] py-0 h-4 uppercase border-none">Historical</Badge>
                                    ) : (
                                      <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[8px] py-0 h-4 uppercase">{daysLeft} Days to go</Badge>
                                    )}
                                 </div>
                              </div>
                           </div>
                           <CalendarDays className={cn("w-6 h-6", status === 'today' ? 'text-blue-600' : 'text-slate-100')} />
                        </div>
                        <div className="divide-y divide-slate-50">
                          {items.map((item: any, idx: number) => (
                            <div key={idx} className="p-6 hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Badge className={cn("h-5 text-[8px] font-black px-2 tracking-widest border-none", getRegulationColor(item.reg))}>
                                      {item.reg}
                                    </Badge>
                                    {item.activity.toLowerCase().includes('annual') && (
                                      <Badge variant="outline" className="h-5 text-[8px] text-purple-600 border-purple-100 font-black tracking-widest bg-purple-50">ANNUAL</Badge>
                                    )}
                                  </div>
                                  <h4 className="text-slate-700 font-black text-xs leading-relaxed uppercase tracking-tight">
                                    {item.activity}
                                  </h4>
                                </div>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-200 hover:text-blue-600 hover:bg-blue-50">
                                  <Bell className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="pt-10">
             <PenaltyCalculator />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-10 rounded-[48px] border border-slate-100/50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-3xl rounded-full" />
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                      <Info className="w-6 h-6 text-blue-600" />
                   </div>
                   <h4 className="font-black text-slate-900 tracking-tight text-xl">Filing Advisory</h4>
                </div>
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black text-slate-400">01</div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Portal due dates can fluctuate; always cross-reference with the latest CBDT or GSTN notifications before final submission.</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black text-slate-400">02</div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Nil GST returns are high-impact and low-effort. File them immediately to maintain a perfect compliance score.</p>
                   </div>
                </div>
             </div>

             <div className="bg-white p-10 rounded-[48px] border border-slate-100/50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 blur-3xl rounded-full" />
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                      <Shield className="w-6 h-6 text-indigo-600" />
                   </div>
                   <h4 className="font-black text-slate-900 tracking-tight text-xl">Security Check</h4>
                </div>
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black text-slate-400">01</div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Initiate tax filings at least 48 hours before the deadline to accommodate potential government portal slowdowns or downtime.</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black text-slate-400">02</div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">TDS interest calculation follows the full-month rule. Even a single day of delay can trigger interest for the entire period.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

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