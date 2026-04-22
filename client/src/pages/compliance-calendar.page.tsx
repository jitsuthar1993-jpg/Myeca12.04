import { useState, useMemo } from "react";
import { Link } from "wouter";
import { m, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Bell, Search, Download, ArrowRight,
  ShieldCheck, ShieldAlert, CheckCircle2, Clock, Filter,
  Info, AlertCircle, Calendar as CalendarIcon, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { isSameDay, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import MetaSEO from "@/components/seo/MetaSEO";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcLayout from "@/features/calculators/components/CalcLayout";

const complianceData: Record<string, { date: string; reg: string; activity: string }[]> = {
  january: [
    { date: "05", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07", reg: "FEMA", activity: "ECB 2 Return" },
    { date: "07", reg: "IT", activity: "TDS/TCS Deposit (Dec)" },
    { date: "10", reg: "GST", activity: "GSTR-7 (TDS) & GSTR-8 (TCS)" },
    { date: "11", reg: "GST", activity: "GSTR-1 (Monthly)" },
    { date: "13", reg: "GST", activity: "GSTR-1 QRMP (Oct-Dec)" },
    { date: "15", reg: "IT", activity: "Form 15G/15H (Oct-Dec)" },
    { date: "20", reg: "GST", activity: "GSTR-3B (Monthly)" },
    { date: "25", reg: "GST", activity: "GSTR-3B QRMP (Oct-Dec)" },
    { date: "31", reg: "IT", activity: "TDS Return (Oct-Dec)" },
  ],
  february: [
    { date: "05", reg: "SEZ", activity: "SEZ - MPR" },
    { date: "07", reg: "IT", activity: "TDS/TCS Deposit (Jan)" },
    { date: "10", reg: "GST", activity: "GSTR-7 & GSTR-8 (TCS)" },
    { date: "11", reg: "GST", activity: "GSTR-1 (Monthly)" },
    { date: "13", reg: "GST", activity: "QRMP IFF (Jan)" },
    { date: "20", reg: "GST", activity: "GSTR-3B (Monthly)" },
    { date: "25", reg: "GST", activity: "PMT-06 (Jan)" },
  ],
  march: [
    { date: "07", reg: "IT", activity: "TDS/TCS Deposit (Feb)" },
    { date: "11", reg: "GST", activity: "GSTR-1 (Monthly)" },
    { date: "15", reg: "IT", activity: "Advance Tax (Final Installment)" },
    { date: "20", reg: "GST", activity: "GSTR-3B (Monthly)" },
    { date: "31", reg: "IT", activity: "Last date for Tax Saving Investments" },
    { date: "31", reg: "MCA", activity: "CSR-2 Filing" },
  ],
  april: [
    { date: "07", reg: "IT", activity: "TCS Deposit (Mar)" },
    { date: "11", reg: "GST", activity: "GSTR-1 (Mar)" },
    { date: "13", reg: "GST", activity: "GSTR-1 QRMP (Jan-Mar)" },
    { date: "20", reg: "GST", activity: "GSTR-3B (Mar)" },
    { date: "30", reg: "IT", activity: "TDS Deposit (Mar)" },
    { date: "30", reg: "MCA", activity: "MSME-1 Return" },
  ],
  may: [
    { date: "07", reg: "IT", activity: "TDS/TCS Deposit (Apr)" },
    { date: "11", reg: "GST", activity: "GSTR-1 (Apr)" },
    { date: "13", reg: "GST", activity: "QRMP IFF (Apr)" },
    { date: "15", reg: "IT", activity: "TCS Return (Jan-Mar)" },
    { date: "20", reg: "GST", activity: "GSTR-3B (Apr)" },
    { date: "31", reg: "IT", activity: "TDS Return (Jan-Mar)" },
  ],
  june: [
    { date: "07", reg: "IT", activity: "TDS/TCS Deposit (May)" },
    { date: "11", reg: "GST", activity: "GSTR-1 (May)" },
    { date: "15", reg: "IT", activity: "Advance Tax Q1" },
    { date: "20", reg: "GST", activity: "GSTR-3B (May)" },
    { date: "30", reg: "MCA", activity: "Form DPT-3" },
  ],
  july: [
    { date: "07", reg: "IT", activity: "TDS/TCS Deposit (Jun)" },
    { date: "11", reg: "GST", activity: "GSTR-1 (Jun)" },
    { date: "13", reg: "GST", activity: "GSTR-1 QRMP (Apr-Jun)" },
    { date: "20", reg: "GST", activity: "GSTR-3B (Jun)" },
    { date: "31", reg: "IT", activity: "ITR Filing (Non-Audit Cases)" },
    { date: "31", reg: "IT", activity: "TDS Return (Apr-Jun)" },
  ],
  august: [
    { date: "07", reg: "IT", activity: "TDS/TCS Deposit (Jul)" },
    { date: "11", reg: "GST", activity: "GSTR-1 (Jul)" },
    { date: "13", reg: "GST", activity: "QRMP IFF (Jul)" },
    { date: "20", reg: "GST", activity: "GSTR-3B (Jul)" },
    { date: "31", reg: "MCA", activity: "DIR-3 KYC" },
  ],
  september: [
    { date: "07", reg: "IT", activity: "TDS/TCS Deposit (Aug)" },
    { date: "11", reg: "GST", activity: "GSTR-1 (Aug)" },
    { date: "15", reg: "IT", activity: "Advance Tax Q2" },
    { date: "20", reg: "GST", activity: "GSTR-3B (Aug)" },
    { date: "30", reg: "IT", activity: "Tax Audit Report Filing" },
    { date: "30", reg: "MCA", activity: "Holding of AGM" },
  ],
  october: [
    { date: "07", reg: "IT", activity: "TDS/TCS Deposit (Sep)" },
    { date: "11", reg: "GST", activity: "GSTR-1 (Sep)" },
    { date: "13", reg: "GST", activity: "GSTR-1 QRMP (Jul-Sep)" },
    { date: "20", reg: "GST", activity: "GSTR-3B (Sep)" },
    { date: "31", reg: "IT", activity: "ITR Filing (Audit Cases)" },
    { date: "31", reg: "IT", activity: "TDS Return (Jul-Sep)" },
  ],
  november: [
    { date: "07", reg: "IT", activity: "TDS/TCS Deposit (Oct)" },
    { date: "11", reg: "GST", activity: "GSTR-1 (Oct)" },
    { date: "13", reg: "GST", activity: "QRMP IFF (Oct)" },
    { date: "20", reg: "GST", activity: "GSTR-3B (Oct)" },
    { date: "30", reg: "MCA", activity: "Form AOC-4 (Financials)" },
  ],
  december: [
    { date: "07", reg: "IT", activity: "TDS/TCS Deposit (Nov)" },
    { date: "11", reg: "GST", activity: "GSTR-1 (Nov)" },
    { date: "15", reg: "IT", activity: "Advance Tax Q3" },
    { date: "20", reg: "GST", activity: "GSTR-3B (Nov)" },
    { date: "31", reg: "GST", activity: "GSTR-9 & GSTR-9C (Annual)" },
    { date: "31", reg: "MCA", activity: "Form MGT-7 (Annual Return)" },
  ],
};

const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];

const REG_STYLES: Record<string, { bg: string; text: string; border: string; dot: string; gradient: string }> = {
  GST:  { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-100",   dot: "bg-blue-500", gradient: "from-blue-500 to-indigo-600" },
  IT:   { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-100",dot: "bg-emerald-500", gradient: "from-emerald-500 to-teal-600" },
  MCA:  { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100", dot: "bg-violet-500", gradient: "from-violet-500 to-purple-600" },
  FEMA: { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-100",  dot: "bg-amber-500", gradient: "from-amber-500 to-orange-600" },
  SEZ:  { bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-100",   dot: "bg-pink-500", gradient: "from-pink-500 to-rose-600" },
};

export default function ComplianceCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const getComplianceForDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return [];
    const monthName = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    return (complianceData[monthName] || []).filter(item => item.date === day);
  };

  const selectedDayItems = useMemo(() => {
    return selectedDate ? getComplianceForDate(selectedDate) : [];
  }, [selectedDate]);

  const upcomingItems = useMemo(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return [];
    const items: { date: Date; activity: string; reg: string }[] = [];
    let checkDate = new Date(selectedDate);
    
    // Look ahead 60 days for upcoming
    for (let i = 0; i < 60; i++) {
      checkDate = addDays(checkDate, 1);
      if (isNaN(checkDate.getTime())) break;
      
      const dayItems = getComplianceForDate(checkDate);
      dayItems.forEach(item => {
        items.push({ ...item, date: new Date(checkDate) });
      });
      if (items.length >= 6) break;
    }
    return items;
  }, [selectedDate]);

  // Highlight days with events in the calendar
  const modifiers = useMemo(() => {
    if (!currentMonth || isNaN(currentMonth.getTime())) return { hasEvent: [] };
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      const eventDays = days.filter(d => getComplianceForDate(d).length > 0);
      return { hasEvent: eventDays };
    } catch (e) {
      console.error("Calendar calculation error:", e);
      return { hasEvent: [] };
    }
  }, [currentMonth]);

  const modifiersStyles = {
    hasEvent: { 
      fontWeight: "900",
      color: "var(--indigo-600)",
      textDecoration: "underline",
      textDecorationColor: "var(--indigo-200)",
      textUnderlineOffset: "4px"
    }
  };

  return (
    <>
      <MetaSEO 
        title="Statutory Compliance Calendar 2025-26 | MyeCA.in" 
        description="Stay ahead of GST, Income Tax, and MCA deadlines with our interactive compliance calendar." 
      />

      <CalcHero 
        title="Compliance Calendar"
        description="Never miss a regulatory deadline. Interactive timeline for GST, Income Tax, and MCA filings for FY 2025-26."
        category="Statutory Utility"
        icon={<CalendarDays className="w-6 h-6 text-indigo-600" />}
        variant="indigo"
        breadcrumbItems={[{ name: "Compliance Calendar" }]}
      />

      <CalcLayout
        variant="indigo"
        sidebar={
          <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden bg-white p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Legend</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(REG_STYLES).map(([reg, s]) => (
                    <div key={reg} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:border-indigo-100 group">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", s.dot)} />
                        <span className="text-xs font-bold text-slate-700">{reg}</span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 group-hover:text-indigo-500 transition-colors">
                        {reg === "GST" ? "Goods & Services Tax" : reg === "IT" ? "Income Tax" : reg === "MCA" ? "Corp. Affairs" : reg}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-100 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
              <Bell className="w-10 h-10 text-white/80 relative z-10" />
              <div className="relative z-10 space-y-2">
                <h3 className="text-xl font-bold leading-tight">Deadline Alerts</h3>
                <p className="text-indigo-100 text-xs font-medium leading-relaxed">
                  Get automated reminders 7 days before any statutory deadline.
                </p>
              </div>
              <Button className="w-full h-12 bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl font-black text-xs uppercase tracking-widest relative z-10">
                Notify Me
              </Button>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Calendar */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-[3rem] border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden bg-white p-6 sm:p-10">
              <div className="flex items-center justify-between mb-8 px-2">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Timeline Browser</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Select a date to view deadlines</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                  <CalendarIcon className="w-6 h-6" />
                </div>
              </div>

              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  onMonthChange={setCurrentMonth}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  className="rounded-3xl border-none shadow-none p-0 w-full max-w-sm"
                  classNames={{
                    months: "w-full",
                    month: "w-full space-y-6",
                    caption: "flex justify-between items-center mb-6 px-4",
                    caption_label: "text-lg font-black text-slate-900",
                    nav: "flex items-center gap-2",
                    nav_button: "h-9 w-9 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center",
                    table: "w-full border-collapse",
                    head_row: "flex w-full mb-4",
                    head_cell: "text-slate-400 w-full font-black text-[10px] uppercase tracking-widest text-center",
                    row: "flex w-full mt-1.5",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full",
                    day: "h-11 w-11 p-0 font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-all mx-auto flex items-center justify-center",
                    day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100",
                    day_today: "bg-slate-100 text-slate-900",
                    day_outside: "text-slate-200 opacity-50",
                  }}
                />
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interactive Dashboard v2.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-lg border-slate-100 text-slate-400 text-[10px] font-bold px-3 py-1">FY 2025-26</Badge>
                  <Badge variant="outline" className="rounded-lg border-slate-100 text-slate-400 text-[10px] font-bold px-3 py-1">Real-time Sync</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT: Details */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              <m.div
                key={selectedDate?.toISOString() || "empty"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Current Date Status */}
                <Card className="rounded-[2.5rem] border-slate-100 shadow-xl shadow-slate-100/30 overflow-hidden bg-white">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                          {selectedDate && !isNaN(selectedDate.getTime()) 
                            ? `${months[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` 
                            : "Select a Date"}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Due Dates for this day</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100">
                        <span className="text-lg font-black text-slate-900 leading-none">{selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate.getDate().toString().padStart(2, '0') : "--"}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">{selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate.toLocaleDateString('en-US', { month: 'short' }) : ""}</span>
                      </div>
                    </div>

                    {selectedDayItems.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDayItems.map((item, idx) => {
                          const s = REG_STYLES[item.reg] || REG_STYLES.GST;
                          return (
                            <div key={idx} className="group relative">
                              <div className={cn(
                                "p-5 rounded-3xl border transition-all duration-300 hover:shadow-md",
                                "bg-white border-slate-100 hover:border-indigo-100"
                              )}>
                                <div className="flex items-center gap-4">
                                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-sm ring-4 ring-white", `bg-gradient-to-br ${s.gradient}`)}>
                                    {item.reg}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">{item.activity}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{item.reg} Compliance</span>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-4">
                          <AlertCircle className="w-6 h-6 text-slate-300" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-600">No deadlines today</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">Relax! There are no statutory filings or deposits due on this date.</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Upcoming Section */}
                <div className="space-y-4 px-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Upcoming Deadlines</h4>
                    <Link href="/calculators" className="text-[10px] font-bold text-indigo-600 hover:underline">View All</Link>
                  </div>
                  
                  <div className="space-y-3">
                    {upcomingItems.map((item, idx) => {
                      const s = REG_STYLES[item.reg] || REG_STYLES.GST;
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedDate(item.date)}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all cursor-pointer group"
                        >
                          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                            <span className="text-xs font-black text-slate-900 leading-none">{item.date.getDate().toString().padStart(2, '0')}</span>
                            <span className="text-[7px] font-bold text-slate-400 uppercase">{item.date.toLocaleDateString('en-US', { month: 'short' })}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[11px] font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{item.activity}</h5>
                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{item.reg} Regulation</span>
                          </div>
                          <Badge className={cn("text-[8px] font-black px-2 py-0.5 rounded-md", s.bg, s.text)}>
                            {item.reg}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Action */}
                <Card className="rounded-[2rem] bg-indigo-50 border border-indigo-100 p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Need Help?</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Book a CA for compliance assistance.</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-white text-indigo-600 hover:bg-white/90 rounded-xl text-[10px] font-black h-8 px-4 shadow-sm">
                    Book Now
                  </Button>
                </Card>
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </CalcLayout>
    </>
  );
}