import { useState, useMemo } from "react";
import { Link } from "wouter";
import { m, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Bell, Search, Download, ArrowRight, BellRing,
  ShieldCheck, ShieldAlert, CheckCircle2, Clock, Filter,
  Info, AlertCircle, Calendar as CalendarIcon, ChevronRight, ClipboardList
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

const REG_STYLES: Record<string, { bg: string; text: string; border: string; dot: string; lightBg: string; darkBg: string }> = {
  GST:  { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-100",   dot: "bg-blue-600", lightBg: "bg-blue-50", darkBg: "bg-blue-600" },
  IT:   { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-100",dot: "bg-emerald-600", lightBg: "bg-emerald-50", darkBg: "bg-emerald-600" },
  MCA:  { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100", dot: "bg-violet-600", lightBg: "bg-violet-50", darkBg: "bg-violet-600" },
  "PF/ESI": { bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-100", dot: "bg-orange-600", lightBg: "bg-orange-50", darkBg: "bg-orange-600" },
  RBI:  { bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-100",   dot: "bg-rose-600", lightBg: "bg-rose-50", darkBg: "bg-rose-600" },
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

  // Highlight days with events in the calendar based on the reference image
  const modifiers = {
    hasDot: [new Date(2026, 3, 7)],
    isSolid: [new Date(2026, 3, 11)],
    isUnderlined: [new Date(2026, 3, 13), new Date(2026, 3, 20), new Date(2026, 3, 30)],
  };

  const modifiersStyles = {
    isSolid: { backgroundColor: '#2563eb', color: 'white', borderRadius: '50%' },
    hasDot: { position: 'relative' as const },
    isUnderlined: { position: 'relative' as const },
  };

  return (
    <>
      <MetaSEO 
        title="Statutory Compliance Calendar 2026-27 | GST & Tax Due Dates | MyeCA.in" 
        description="Stay ahead of GST, Income Tax, and MCA deadlines with our interactive compliance calendar. Tracks all statutory due dates for FY 2026-27." 
        keywords={[
          "compliance calendar 2026", "tax due dates India", "GST return deadlines", 
          "income tax dates", "MCA filing calendar", "TDS deposit dates", 
          "statutory compliance schedule", "CA assisted compliance"
        ]}
        faqPageData={[
          {
            question: "What is a Statutory Compliance Calendar?",
            answer: "A statutory compliance calendar is a comprehensive schedule of all the legal deadlines and filing dates prescribed by various governing bodies like the Income Tax Department, GSTN, and MCA."
          },
          {
            question: "Are these dates applicable for the Assessment Year 2027-28?",
            answer: "Yes, our calendar is fully updated for Financial Year 2026-27 and the subsequent Assessment Year 2027-28."
          }
        ]}
      />

      <CalcHero 
        title="Compliance Calendar"
        description="Never miss a regulatory deadline. Interactive timeline for GST, Income Tax, and MCA filings for FY 2026-27."
        icon={<CalendarDays className="w-6 h-6 text-blue-600" />}
        variant="blue"
        hideBreadcrumbs={true}
      />

      <CalcLayout 
        variant="indigo"
        complianceFacts={[
          {
            title: "GST Filing Deadlines",
            content: "Standard GSTR-1 is due by 11th and GSTR-3B by 20th of the following month. For QRMP users, IFF is due by 13th of the month following the first two months of a quarter."
          },
          {
            title: "Income Tax & TDS",
            content: "TDS deposit is mandatory by the 7th of every month. Quarterly TDS returns are due by the 31st of the month following the quarter (July, Oct, Jan, and May for Q4)."
          },
          {
            title: "Advance Tax Cycle",
            content: "Advance tax installments are payable in four parts: 15% by June 15, 45% by Sept 15, 75% by Dec 15, and 100% by March 15 of the financial year."
          },
          {
            title: "MCA Annual Filings",
            content: "Companies must hold an AGM within 6 months of the end of FY. Financial statements (AOC-4) must be filed within 30 days and Annual Returns (MGT-7) within 60 days of the AGM."
          }
        ]}
        faqs={[
          {
            q: "What is a Statutory Compliance Calendar?",
            a: "A statutory compliance calendar is a comprehensive schedule of all the legal deadlines and filing dates prescribed by various governing bodies like the Income Tax Department, GSTN, and MCA. It helps businesses and individuals stay compliant and avoid late fees or interest penalties."
          },
          {
            q: "Are these dates applicable for the Assessment Year 2027-28?",
            a: "Yes, our calendar is fully updated for Financial Year 2026-27 and the subsequent Assessment Year 2027-28. It includes all regular filing dates and special extensions announced by the government."
          },
          {
            q: "What are the common penalties for missing these deadlines?",
            a: "Penalties vary by regulation. For GST, late fees are generally ₹50 per day (₹20 for NIL returns). For Income Tax, late filing fees under Section 234F can go up to ₹5,000, plus interest at 1% per month under Section 234A/B/C."
          },
          {
            q: "Can I get notifications for these due dates?",
            a: "Absolutely! You can use our 'Deadline Alerts' feature to subscribe to automated reminders via Email or WhatsApp. We send alerts 7 days and 2 days before the actual deadline to ensure you have enough time to prepare."
          },
          {
            q: "Is this calendar relevant for Private Limited Companies?",
            a: "Yes, it specifically includes MCA (Ministry of Corporate Affairs) compliance dates like AOC-4, MGT-7, and Director KYC (DIR-3), which are critical for Private Limited Companies and LLPs in India."
          }
        ]}
      >
        <div className="space-y-16">
          {/* Main Two Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Timeline Browser */}
            <div className="lg:col-span-5">
              <Card className="rounded-[2.5rem] border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col overflow-hidden bg-white group/timeline">
                <div className="p-7 border-b border-slate-50 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Timeline Browser</h2>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl border-slate-200 text-slate-500 font-black text-[10px] h-8 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                      onClick={() => {
                        const today = new Date();
                        setSelectedDate(today);
                        setCurrentMonth(today);
                      }}
                    >
                      <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                      TODAY
                    </Button>
                  </div>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">FY 2026-27 COMPLIANCE STREAM</p>
                </div>

                <div className="p-7">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="rounded-2xl border-none p-0 w-full"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-6 w-full",
                      caption: "flex justify-between items-center px-2 pt-1 relative",
                      caption_label: "text-sm font-black text-slate-900 uppercase tracking-[0.2em]",
                      nav: "flex items-center gap-1",
                      nav_button: cn(
                        "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity rounded-xl border border-slate-100 flex items-center justify-center hover:bg-slate-50"
                      ),
                      nav_button_previous: "relative",
                      nav_button_next: "relative",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full mb-4",
                      head_cell: "text-slate-400 w-full font-black text-[10px] uppercase tracking-widest",
                      row: "flex w-full mt-2",
                      cell: cn(
                        "relative h-11 w-full text-center text-sm p-0 focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent",
                        "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                      ),
                      day: cn(
                        "h-10 w-10 p-0 font-bold aria-selected:opacity-100 hover:bg-slate-50 rounded-full transition-all mx-auto flex items-center justify-center"
                      ),
                      day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white shadow-lg shadow-blue-200",
                      day_today: "bg-slate-100 text-slate-900",
                      day_outside: "text-slate-300 opacity-50",
                      day_disabled: "text-slate-300 opacity-50",
                      day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
                      day_hidden: "invisible",
                    }}
                    modifiers={modifiers}
                    components={{
                      DayContent: ({ date }) => {
                        const day = date.getDate();
                        const isSelected = selectedDate && isSameDay(date, selectedDate);
                        const hasDot = modifiers.hasDot.some(d => isSameDay(d, date));
                        const isUnderlined = modifiers.isUnderlined.some(d => isSameDay(d, date));
                        const isSolid = modifiers.isSolid.some(d => isSameDay(d, date));

                        return (
                          <div className={cn(
                            "relative w-full h-full flex items-center justify-center rounded-full transition-all",
                            isSelected && !isSolid && "text-blue-600 font-black scale-110",
                            isSolid && "bg-blue-600 text-white font-black shadow-lg shadow-blue-200 ring-2 ring-white"
                          )}>
                            {day}
                            {hasDot && !isSolid && !isSelected && (
                              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full ring-2 ring-white" />
                            )}
                            {isUnderlined && !isSolid && !isSelected && (
                              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-[1.5px] bg-slate-900 rounded-full" />
                            )}
                          </div>
                        );
                      }
                    }}
                  />
                </div>

                <div className="mt-auto p-7 bg-slate-50/50 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="w-7 h-7 rounded-full bg-white p-0.5 border border-slate-100 shadow-sm">
                            <div className={cn(
                              "w-full h-full rounded-full",
                              i === 0 ? "bg-blue-600" : i === 1 ? "bg-emerald-400" : "bg-violet-400"
                            )} />
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Global Sync</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">250+ Firms Verified</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">LIVE FY 26-27</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Compliance Details */}
            <div className="lg:col-span-7 space-y-8">
              <Card className="rounded-[2.5rem] border-slate-100 shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
                <div className="p-8">
                  <AnimatePresence mode="wait">
                    <m.div
                      key={selectedDate?.toISOString()}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-50">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50 shadow-inner">
                            <CalendarDays className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                              {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select a date'}
                            </h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Active Compliance Requirements</p>
                          </div>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-indigo-50 bg-white flex flex-col items-center justify-center shadow-lg shadow-indigo-100">
                          <span className="text-2xl font-black text-indigo-600 leading-none">{getComplianceForDate(selectedDate).length}</span>
                          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1">Due</span>
                        </div>
                      </div>

                      {getComplianceForDate(selectedDate).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getComplianceForDate(selectedDate).map((item, i) => (
                            <m.div 
                              key={i}
                              whileHover={{ scale: 1.02, x: 4 }}
                              className="group p-5 rounded-[2rem] bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm ring-4 ring-white transition-transform group-hover:rotate-6",
                                    REG_STYLES[item.reg as keyof typeof REG_STYLES]?.bg || "bg-slate-500",
                                    REG_STYLES[item.reg as keyof typeof REG_STYLES]?.text || "text-white"
                                  )}>
                                    {item.reg}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 text-sm">{item.activity}</p>
                                    <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                                      <div className={cn("w-1.5 h-1.5 rounded-full", REG_STYLES[item.reg as keyof typeof REG_STYLES]?.dot || "bg-slate-400")} />
                                      {item.reg} Compliance Protocol
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                              </div>
                            </m.div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/30 rounded-[2.5rem] border border-dashed border-slate-200">
                          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-slate-400 font-bold text-sm">No statutory deadlines for this date</p>
                          <p className="text-slate-300 text-xs mt-1">Enjoy your compliance-free day!</p>
                        </div>
                      )}
                    </m.div>
                  </AnimatePresence>
                </div>
              </Card>

              {/* Upcoming Section inside the same column but outside the selection card */}
              <div className="bg-slate-50/50 rounded-[3rem] p-8 space-y-6 border border-slate-100">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Next 60 Days</h4>
                  </div>
                  <Link href="/calculators" className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-1 group">
                    Full Schedule <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingItems.slice(0, 4).map((item, idx) => {
                    const s = REG_STYLES[item.reg] || REG_STYLES.GST;
                    return (
                      <div
                        key={idx}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedDate(item.date)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedDate(item.date)}
                        className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer group"
                      >
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 shrink-0 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-300">
                          <span className="text-sm font-black text-slate-900 group-hover:text-white leading-none">{item.date.getDate().toString().padStart(2, '0')}</span>
                          <span className="text-[8px] font-bold text-slate-400 group-hover:text-white/70 uppercase mt-1">{item.date.toLocaleDateString('en-US', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{item.activity}</h5>
                          <div className={cn("inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider", s.bg, s.text)}>
                            <div className={cn("w-1 h-1 rounded-full", s.dot)} />
                            {item.reg}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* LOWER SECTION: Legend and Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Category Legend - Horizontal */}
            <div className="lg:col-span-7">
              <div className="h-full p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                      <Filter className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Category Legend</h3>
                      <p className="text-slate-500 text-[11px] font-medium">Classification by authority</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(REG_STYLES).map(([reg, style]) => (
                      <div key={reg} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:border-slate-200 transition-colors group">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm text-white", style.darkBg)}>
                          {reg}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-900 truncate">{reg}</p>
                          <p className="text-[9px] font-medium text-slate-500 truncate">
                            {reg === 'GST' ? 'GST Compliance' : 
                             reg === 'IT' ? 'Income Tax' : 
                             reg === 'MCA' ? 'Corporate Affairs' : 
                             reg === 'PF/ESI' ? 'Regulatory' : 
                             reg === 'RBI' ? 'Regulatory' : 'Statutory'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Deadline Alerts */}
            <div className="lg:col-span-5">
              <Card className="h-full p-8 rounded-[2.5rem] bg-blue-50/50 border-blue-100/50 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Deadline Alerts</h3>
                      <p className="text-[11px] font-bold text-blue-600/80 mt-1">Smart statutory reminders</p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-8 max-w-[280px]">
                    Never miss a statutory filing again. Get real-time notifications via WhatsApp and Email.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2">
                    <BellRing className="w-4 h-4" />
                    Activate Alerts
                  </Button>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Free for all active users</span>
                  </div>
                </div>
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
              </Card>
            </div>
          </div>

          {/* Recent Compliance Activity Section */}
          <Card className="rounded-[2.5rem] border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden bg-white">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Compliance Activity</h3>
                  <p className="text-[11px] font-medium text-slate-400 italic">Audit log of latest statutory filings</p>
                </div>
              </div>
              <Link href="#" className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-2 group transition-colors">
                View all activity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Regulatory Body</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Activity</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { reg: 'GST', activity: 'GSTR-1 Monthly Filing', date: 'Apr 11, 2026', status: 'Completed' },
                    { reg: 'IT', activity: 'TDS Payment Deposit', date: 'Apr 07, 2026', status: 'Completed' },
                    { reg: 'GST', activity: 'GSTR-3B Monthly Filing', date: 'Apr 20, 2026', status: 'Upcoming' },
                    { reg: 'MCA', activity: 'Form DPT-3 Filing', date: 'Jun 30, 2026', status: 'Upcoming' },
                    { reg: 'PF/ESI', activity: 'Monthly ECR Filing', date: 'Apr 15, 2026', status: 'Pending' },
                  ].map((item, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[8px] font-black text-white shadow-sm", REG_STYLES[item.reg as keyof typeof REG_STYLES]?.darkBg || "bg-slate-600")}>
                            {item.reg}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{item.reg}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-xs font-bold text-slate-900">{item.activity}</p>
                        <p className="text-[10px] font-medium text-slate-400">Statutory Filing Protocol</p>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs font-medium text-slate-600">{item.date}</span>
                      </td>
                      <td className="px-8 py-4">
                        <Badge className={cn(
                          "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider",
                          item.status === 'Completed' ? "bg-blue-600 text-white" : 
                          item.status === 'Pending' ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"
                        )}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-white hover:shadow-md transition-all">
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50/30 border-t border-slate-50 text-center">
              <Link href="#" className="text-blue-600 hover:text-blue-700 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group transition-all">
                View all compliance activity <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Card>

          {/* Footer Note */}
          <div className="flex items-center justify-center gap-2 pt-8 text-slate-400">
            <ShieldCheck className="w-5 h-5 text-slate-300" />
            <p className="text-[11px] font-black uppercase tracking-widest">Secure. Reliable. Compliant.</p>
          </div>
        </div>
      </CalcLayout>
    </>
  );
}