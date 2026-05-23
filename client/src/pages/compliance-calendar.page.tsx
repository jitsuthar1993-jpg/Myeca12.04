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

const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const REG_STYLES: Record<string, { bg: string; text: string; border: string; dot: string; lightBg: string; darkBg: string }> = {
  GST: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", dot: "bg-blue-600", lightBg: "bg-blue-50", darkBg: "bg-blue-600" },
  IT: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", dot: "bg-emerald-600", lightBg: "bg-emerald-50", darkBg: "bg-emerald-600" },
  MCA: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100", dot: "bg-violet-600", lightBg: "bg-violet-50", darkBg: "bg-violet-600" },
  "PF/ESI": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100", dot: "bg-orange-600", lightBg: "bg-orange-50", darkBg: "bg-orange-600" },
  RBI: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", dot: "bg-rose-600", lightBg: "bg-rose-50", darkBg: "bg-rose-600" },
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
            a: "Yes. Signed-in users can manage deadline reminder preferences from account settings and use this calendar to review upcoming statutory dates."
          },
          {
            q: "Is this calendar relevant for Private Limited Companies?",
            a: "Yes, it specifically includes MCA (Ministry of Corporate Affairs) compliance dates like AOC-4, MGT-7, and Director KYC (DIR-3), which are critical for Private Limited Companies and LLPs in India."
          }
        ]}
      >
        <div className="space-y-12">
          {/* Main Two Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Timeline Browser */}
            <div className="lg:col-span-5">
              <Card className="rounded-[32px] border-slate-100 shadow-sm flex flex-col overflow-hidden bg-white">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      <h2 className="text-xl font-normal text-slate-900 tracking-tight">Timeline Browser</h2>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-slate-200 text-slate-500 font-normal text-xs h-9 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                      onClick={() => {
                        const today = new Date();
                        setSelectedDate(today);
                        setCurrentMonth(today);
                      }}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Today
                    </Button>
                  </div>
                  <p className="text-slate-500 text-sm font-normal">FY 2026-27 Compliance Stream</p>
                </div>

                <div className="p-8">
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
                      caption_label: "text-sm font-normal text-slate-900",
                      nav: "flex items-center gap-1",
                      nav_button: cn(
                        "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity rounded-xl border border-slate-100 flex items-center justify-center hover:bg-slate-50"
                      ),
                      nav_button_previous: "relative",
                      nav_button_next: "relative",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full mb-4",
                      head_cell: "text-slate-400 w-full font-normal text-xs uppercase tracking-wider",
                      row: "flex w-full mt-2",
                      cell: cn(
                        "relative h-11 w-full text-center text-sm p-0 focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent",
                        "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                      ),
                      day: cn(
                        "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-50 rounded-full transition-all mx-auto flex items-center justify-center"
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
                            "relative w-full h-full flex items-center justify-center rounded-full transition-all font-normal",
                            isSelected && !isSolid && "text-white font-medium scale-110",
                            isSolid && "bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-white"
                          )}>
                            {day}
                            {hasDot && !isSolid && !isSelected && (
                              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full ring-2 ring-white" />
                            )}
                            {isUnderlined && !isSolid && !isSelected && (
                              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-[1.5px] bg-blue-700 rounded-full" />
                            )}
                          </div>
                        );
                      }
                    }}
                  />
                </div>

                <div className="mt-auto p-8 bg-slate-50/50 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-white p-0.5 border border-slate-100 shadow-sm">
                            <div className={cn(
                              "w-full h-full rounded-full",
                              i === 0 ? "bg-blue-600" : i === 1 ? "bg-emerald-400" : "bg-violet-400"
                            )} />
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-normal text-slate-900">Global Sync</span>
                        <span className="type-meta font-normal text-slate-500">250+ Firms Verified</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      <span className="type-meta font-normal text-slate-600">LIVE FY 26-27</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Compliance Details */}
            <div className="lg:col-span-7 space-y-8">
              <Card className="rounded-[32px] border-slate-100 shadow-sm bg-white overflow-hidden">
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
                          <div className="w-14 h-14 rounded-[20px] bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-inner">
                            <CalendarDays className="w-7 h-7 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="type-section-title font-normal text-slate-900 tracking-tight">
                              {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select a date'}
                            </h3>
                            <p className="text-slate-500 text-sm font-normal mt-1">Active Compliance Requirements</p>
                          </div>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-indigo-50 bg-white flex flex-col items-center justify-center shadow-sm">
                          <span className="text-2xl font-normal text-indigo-600 leading-none">{getComplianceForDate(selectedDate).length}</span>
                          <span className="type-meta font-normal text-indigo-400 mt-1">Due</span>
                        </div>
                      </div>

                      {getComplianceForDate(selectedDate).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {getComplianceForDate(selectedDate).map((item, i) => (
                            <m.div
                              key={i}
                              whileHover={{ scale: 1.02, x: 4 }}
                              className="group p-6 rounded-3xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-12 h-12 rounded-[16px] flex items-center justify-center text-xs font-normal shadow-sm ring-4 ring-white transition-transform group-hover:rotate-6",
                                    REG_STYLES[item.reg as keyof typeof REG_STYLES]?.bg || "bg-slate-500",
                                    REG_STYLES[item.reg as keyof typeof REG_STYLES]?.text || "text-white"
                                  )}>
                                    {item.reg}
                                  </div>
                                  <div>
                                    <p className="font-normal text-slate-900 text-base">{item.activity}</p>
                                    <div className="text-xs font-normal text-slate-500 flex items-center gap-2 mt-1">
                                      <div className={cn("w-1.5 h-1.5 rounded-full", REG_STYLES[item.reg as keyof typeof REG_STYLES]?.dot || "bg-slate-400")} />
                                      {item.reg} Compliance
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                              </div>
                            </m.div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-16 flex flex-col items-center justify-center text-center bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-slate-400" />
                          </div>
                          <p className="text-slate-600 font-normal text-lg">No statutory deadlines for this date</p>
                          <p className="text-slate-500 text-sm mt-2 font-normal">Enjoy your compliance-free day!</p>
                        </div>
                      )}
                    </m.div>
                  </AnimatePresence>
                </div>
              </Card>

              {/* Upcoming Section inside the same column but outside the selection card */}
              <div className="bg-white rounded-[32px] p-8 space-y-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-indigo-50 flex items-center justify-center border border-indigo-100">
                      <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h4 className="text-lg font-normal text-slate-900">Next 60 Days</h4>
                  </div>
                  <Link href="/calculators" className="text-sm font-normal text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                    Full Schedule <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                        className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-white border border-slate-100 shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all duration-300 shadow-sm">
                          <span className="text-xl font-normal text-slate-900 group-hover:text-indigo-700 leading-none">{item.date.getDate().toString().padStart(2, '0')}</span>
                          <span className="type-meta font-normal text-slate-500 group-hover:text-indigo-600 mt-1">{item.date.toLocaleDateString('en-US', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-normal text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{item.activity}</h5>
                          <div className={cn("inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full type-meta font-normal", s.bg, s.text)}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
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
              <div className="h-full p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-[16px] bg-indigo-50 flex items-center justify-center border border-indigo-100">
                      <Filter className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-normal text-slate-900 tracking-tight">Category Legend</h3>
                      <p className="text-slate-500 text-sm font-normal mt-1">Classification by authority</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(REG_STYLES).map(([reg, style]) => (
                      <div key={reg} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:border-slate-200 hover:bg-white transition-colors group">
                        <div className={cn("w-10 h-10 rounded-[14px] flex items-center justify-center text-xs font-normal shrink-0 shadow-sm text-white", style.darkBg)}>
                          {reg}
                        </div>
                        <div className="min-w-0 flex flex-col gap-0.5">
                          <p className="text-sm font-normal text-slate-900 truncate leading-none m-0">{reg}</p>
                          <p className="type-meta font-normal text-slate-500 truncate leading-none m-0">
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
              <Card className="h-full p-8 rounded-[32px] bg-indigo-50 border-indigo-100 relative overflow-hidden group shadow-none">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-[16px] bg-indigo-600 flex items-center justify-center shadow-md">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-normal text-slate-900 tracking-tight leading-none">Deadline Alerts</h3>
                      <p className="text-sm font-normal text-indigo-700 mt-2">Smart statutory reminders</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm font-normal leading-relaxed mb-8 max-w-[280px]">
                    Review upcoming statutory dates and manage in-app deadline reminders from your account settings.
                  </p>
                  <Link href="/settings">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 font-normal text-base shadow-md transition-all flex items-center justify-center gap-2">
                      <BellRing className="w-5 h-5" />
                      Manage Reminder Settings
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-normal text-slate-500">Available for signed-in accounts</span>
                  </div>
                </div>
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
              </Card>
            </div>
          </div>

          {/* Penalty Calculator Section */}
          <Card className="rounded-[32px] border-amber-100 shadow-sm overflow-hidden bg-amber-50 relative group">
            <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[20px] bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200 shrink-0">
                  <ShieldAlert className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-normal text-slate-900 tracking-tight">Missed a Statutory Deadline?</h3>
                  <p className="text-sm font-normal text-amber-700 mt-2 max-w-lg">
                    Don't guess your late fees. Use our Penalty Calculator to estimate late fees, interest, and statutory penalties for GST, IT, and MCA.
                  </p>
                </div>
              </div>
              <div className="shrink-0 w-full md:w-auto flex flex-col items-center md:items-end">
                <Link href="/calculators/penalty">
                  <Button className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white rounded-2xl h-14 px-8 font-normal text-base shadow-md transition-all flex items-center justify-center gap-2">
                    <Search className="w-5 h-5" />
                    Calculate Penalty Now
                  </Button>
                </Link>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-normal text-slate-500">Uses current rule inputs and review notes</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/5 rounded-full group-hover:scale-110 transition-transform duration-700" />
          </Card>

          {/* Recent Compliance Activity Section */}
          <Card className="rounded-[32px] border-slate-100 shadow-sm overflow-hidden bg-white">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[20px] bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  <ClipboardList className="w-7 h-7 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-normal text-slate-900 tracking-tight">Recent Compliance Activity</h3>
                  <p className="text-sm font-normal text-slate-500 mt-1">Audit log of recent statutory filings</p>
                </div>
              </div>
              <Link href="/services/compliance-management" className="text-indigo-600 hover:text-indigo-700 font-normal text-sm flex items-center gap-2 group transition-colors">
                Explore compliance support <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-left text-xs font-normal text-slate-500">Regulatory Body</th>
                    <th className="px-8 py-5 text-left text-xs font-normal text-slate-500">Compliance Activity</th>
                    <th className="px-8 py-5 text-left text-xs font-normal text-slate-500">Due Date</th>
                    <th className="px-8 py-5 text-left text-xs font-normal text-slate-500">Status</th>
                    <th className="px-8 py-5 text-right text-xs font-normal text-slate-500">Action</th>
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
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center type-meta font-normal text-white shadow-sm", REG_STYLES[item.reg as keyof typeof REG_STYLES]?.darkBg || "bg-slate-600")}>
                            {item.reg}
                          </div>
                          <span className="text-sm font-normal text-slate-800">{item.reg}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-normal text-slate-900">{item.activity}</p>
                        <p className="text-xs font-normal text-slate-500 mt-1">Statutory Filing Protocol</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-normal text-slate-600">{item.date}</span>
                      </td>
                      <td className="px-8 py-5">
                        <Badge className={cn(
                          "rounded-full px-4 py-1.5 type-meta font-normal",
                          item.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                            item.status === 'Pending' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-white hover:shadow-sm transition-all">
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-50/30 border-t border-slate-50 text-center">
              <Link href="/services/compliance-management" className="text-indigo-600 hover:text-indigo-700 font-normal text-sm flex items-center justify-center gap-2 group transition-all">
                Plan compliance support <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Card>

          {/* Footer Note */}
          <div className="flex items-center justify-center gap-2 pt-8 text-slate-400">
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            <p className="text-sm font-normal">Secure. Reliable. Compliant.</p>
          </div>
        </div>
      </CalcLayout>
    </>
  );
}
