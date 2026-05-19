import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Users, Building, TrendingUp, AlertCircle, CheckCircle, ChevronRight, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ITR_FORMS = [
  {
    id: 'ITR-1',
    title: 'ITR-1 (Sahaj)',
    description: 'For salaried individuals with income up to ₹50 lakhs',
    features: [
      'Salary income',
      'House property income (one house)',
      'Other sources income',
      'Deductions under Chapter VI-A'
    ],
    complexity: 'Simple',
    estimatedTime: '15-20 minutes',
    icon: Users,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    available: true
  },
  {
    id: 'ITR-2',
    title: 'ITR-2',
    description: 'For individuals/HUFs having income from capital gains, foreign assets',
    features: [
      'All ITR-1 sources',
      'Capital gains',
      'Foreign income/assets',
      'Multiple house properties',
      'Director in companies'
    ],
    complexity: 'Moderate',
    estimatedTime: '30-45 minutes',
    icon: TrendingUp,
    color: 'bg-blue-50 text-blue-700 border-blue-100',
    available: true
  },
  {
    id: 'ITR-3',
    title: 'ITR-3',
    description: 'For individuals/HUFs having income from business or profession',
    features: [
      'Business/professional income',
      'Presumptive taxation',
      'Book profit',
      'Partnership firm partners',
      'All ITR-2 sources'
    ],
    complexity: 'Complex',
    estimatedTime: '45-60 minutes',
    icon: Building,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    available: true
  },
  {
    id: 'ITR-4',
    title: 'ITR-4 (Sugam)',
    description: 'For individuals/HUFs/firms with presumptive income',
    features: [
      'Presumptive business income',
      'Turnover up to ₹2 crores',
      'Section 44AD/44ADA',
      'Simple business returns'
    ],
    complexity: 'Simple',
    estimatedTime: '20-25 minutes',
    icon: FileText,
    color: 'bg-violet-50 text-violet-700 border-violet-100',
    available: true
  }
];

const ASSESSMENT_YEARS = [
  { value: '2026-27', label: 'AY 2026-27 (FY 2025-26)', period: '1st April 2025 to 31st March 2026' },
  { value: '2025-26', label: 'AY 2025-26 (FY 2024-25 - archive)', period: '1st April 2024 to 31st March 2025' },
  { value: '2024-25', label: 'AY 2024-25 (FY 2023-24 - archive)', period: '1st April 2023 to 31st March 2024' },
  { value: '2023-24', label: 'AY 2023-24 (FY 2022-23 - archive)', period: '1st April 2022 to 31st March 2023' },
  { value: '2022-23', label: 'AY 2022-23 (FY 2021-22 - archive)', period: '1st April 2021 to 31st March 2022' }
];

export default function ITRFormSelectorPage() {
  const [selectedForm, setSelectedForm] = useState('');
  const [assessmentYear, setAssessmentYear] = useState('2026-27');

  // Parse recommended form from URL if coming back from the assistant
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recommended = params.get('recommended');
    if (recommended) {
      setSelectedForm(recommended);
    }
  }, []);

  const getRecommendedForm = () => {
    // If we have a selection from the assistant, that's our recommendation
    const params = new URLSearchParams(window.location.search);
    const recommended = params.get('recommended');
    if (recommended) return recommended;
    return 'ITR-1';
  };

  const selectedYearData = ASSESSMENT_YEARS.find(y => y.value === assessmentYear);
  const selectedFormData = ITR_FORMS.find(form => form.id === selectedForm);

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-left md:mb-10 md:text-center"
        >
          <h1 className="text-2xl font-bold text-slate-900 mb-2 md:text-3xl">Income Tax Return Filing</h1>
          <p className="text-sm leading-6 text-slate-600 max-w-2xl md:mx-auto md:text-base">
            Choose the assessment year and ITR path that matches your income profile.
          </p>
        </motion.div>

        {/* Year Selection Section - Two Box Layout */}
        <div className="grid grid-cols-1 gap-3 mb-6 md:grid-cols-2 md:gap-6 md:mb-12">
          {/* Left Box: Assessment Year Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex flex-col justify-center md:rounded-2xl md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Assessment Year</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed md:mb-6">
              Select the assessment year for which you want to file your income tax returns.
            </p>
            <Select value={assessmentYear} onValueChange={setAssessmentYear}>
              <SelectTrigger className="w-full h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-medium">
                <SelectValue placeholder="Select Assessment Year" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                {ASSESSMENT_YEARS.map((year) => (
                  <SelectItem key={year.value} value={year.value} className="focus:bg-indigo-50 text-slate-900">
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-3 text-xs font-medium leading-5 text-slate-500 md:hidden">
              Financial year: <span className="font-bold text-indigo-700">{selectedYearData?.period}</span>
            </p>
          </motion.div>

          {/* Right Box: Document Period */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex-col justify-center relative overflow-hidden group md:flex"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <FileText className="h-24 w-24" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Document Period</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Income earned during this period will be reported in your ITR for {selectedYearData?.label}.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Financial Year Range</p>
                <p className="text-base font-bold text-indigo-700">{selectedYearData?.period}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mb-4 grid gap-2 md:hidden">
          <Link
            href="/calculators/income-tax"
            className="flex min-h-11 items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-blue-700"
          >
            <span>Estimate tax first</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/form16-parser"
            className="flex min-h-11 items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700"
          >
            <span>Parse Form 16 before choosing</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-8 grid gap-3 md:hidden">
          {ITR_FORMS.map((form) => {
            const IconComponent = form.icon;
            const isRecommended = form.id === getRecommendedForm();
            const isSelected = selectedForm === form.id;

            return (
              <div
                key={form.id}
                className={`rounded-lg border bg-white shadow-sm transition-colors ${
                  isSelected ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'
                }`}
              >
                <div className="flex gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => form.available && setSelectedForm(form.id)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${form.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-slate-950">{form.title}</span>
                        {isRecommended && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 text-[10px] py-0 px-2 h-5">
                            Recommended
                          </Badge>
                        )}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-slate-600">{form.description}</span>
                      <span className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">{form.complexity}</span>
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">{form.estimatedTime}</span>
                      </span>
                    </span>
                  </button>
                  <Link href={`/itr/filing?form=${form.id}&ay=${assessmentYear}`} className="shrink-0 self-center">
                    <Button size="sm" className="h-9 rounded-lg bg-indigo-600 px-3 text-xs font-bold text-white hover:bg-indigo-700">
                      Start
                    </Button>
                  </Link>
                </div>
                <details className="border-t border-slate-100 px-4 py-3">
                  <summary className="cursor-pointer text-sm font-bold text-indigo-700">View included cases</summary>
                  <ul className="mt-3 grid gap-2">
                    {form.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            );
          })}
        </div>

        {/* Form Selection Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {ITR_FORMS.map((form, index) => {
            const IconComponent = form.icon;
            const isRecommended = form.id === getRecommendedForm();
            const isSelected = selectedForm === form.id;
            
            return (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.3 }}
                onClick={() => form.available && setSelectedForm(form.id)}
                className={`cursor-pointer transition-all duration-300 ${
                  !form.available ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <Card className={`h-full border-slate-200 transition-all overflow-hidden ${
                  isSelected ? 'ring-2 ring-indigo-600 border-transparent shadow-md bg-white' : 'hover:border-slate-300 hover:shadow-sm bg-white'
                }`}>
                  <CardHeader className="pb-3 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-2">
                       <div className={`p-2 rounded-lg border ${form.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        {isRecommended && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 text-[10px] py-0 px-2 h-5">
                            Recommended
                          </Badge>
                        )}
                    </div>
                    <CardTitle className="text-base text-slate-900">{form.title}</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1 line-clamp-2 h-8">
                      {form.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5">Features</p>
                      <ul className="space-y-1.5 min-h-[100px]">
                        {form.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-[11px] text-slate-600 font-medium">
                            <CheckCircle className="h-3 w-3 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400">Complexity</p>
                        <p className={`text-[11px] font-bold ${
                          form.complexity === 'Simple' ? 'text-emerald-600' : 
                          form.complexity === 'Moderate' ? 'text-blue-600' : 'text-amber-600'
                        }`}>{form.complexity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Est. Time</p>
                        <p className="text-[11px] font-bold text-slate-700">{form.estimatedTime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Action Confirmation Banner */}
        <AnimatePresence mode="wait">
          {selectedFormData && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-10 hidden md:block"
            >
              <Card className="bg-indigo-600 border-none shadow-xl shadow-indigo-200">
                <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-5 md:p-8 md:gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold text-white mb-2">Proceed with {selectedFormData.title}?</h3>
                    <p className="text-indigo-100 text-sm max-w-md">
                      You've selected {selectedFormData.title} for AY {assessmentYear}. All data will be processed according to financial regulations.
                    </p>
                  </div>
                  
                  <Link href={`/itr/filing?form=${selectedFormData.id}&ay=${assessmentYear}`} className="w-full md:w-auto">
                    <Button size="lg" className="w-full bg-white text-indigo-700 hover:bg-slate-50 px-5 h-12 font-extrabold text-base shadow-lg group md:h-14 md:px-10 md:text-lg">
                      Start Filing Now
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Support Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <div className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 bg-slate-200/50 p-4 text-left md:inline-flex md:flex-row md:items-center md:rounded-full md:px-6 md:py-3">
            <HelpCircle className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-600 font-medium">Confused about which form to pick?</span>
            <Link href="/itr/form-recommender">
              <button className="text-sm text-indigo-600 font-bold hover:underline">Tell me which form to select</button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
