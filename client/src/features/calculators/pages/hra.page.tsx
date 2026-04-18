import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { calculateHRA } from "@/lib/tax-calculations";
import { 
  Home, 
  IndianRupee, 
  Building2, 
  Info, 
  Calculator, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  TrendingDown,
  ArrowRight,
  Zap,
  HelpCircle,
  Percent,
  ChevronDown
} from "lucide-react";
import { CalculatorExport } from "@/components/ui/calculator-export";
import MetaSEO from "@/components/seo/MetaSEO";
import { getSEOConfig } from "@/config/seo.config";
import Breadcrumb from "@/components/Breadcrumb";

const COLORS = ["#2563eb", "#e2e8f0"];

export default function HRACalculator() {
  const seo = getSEOConfig('/calculators/hra');
  const [salary, setSalary] = useState<number>(1200000);
  const [hra, setHra] = useState<number>(400000);
  const [rent, setRent] = useState<number>(300000);
  const [city, setCity] = useState<'metro' | 'non-metro'>('metro');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const result = calculateHRA(salary, hra, rent, city);

  const chartData = [
    { name: "Exempt HRA", value: result.exemption },
    { name: "Taxable HRA", value: result.taxableHRA }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <>
      <MetaSEO
        title={seo?.title || "HRA Calculator 2025 | Calculate Tax Exemption | MyeCA.in"}
        description={seo?.description || "Maximize your tax savings with our premium HRA calculator. Interactive visualization for Section 10(13A) exemptions."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <div className="min-h-screen bg-[#f8faff] text-slate-900 selection:bg-blue-600/10 selection:text-blue-700 font-sans antialiased overflow-x-hidden">
        {/* Background Ambient Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="bg-white/50 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
          <Breadcrumb items={[{ name: "Calculators", href: "/calculators" }, { name: "HRA Calculator" }]} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Hero Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12"
          >
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 border border-emerald-600/20 text-emerald-700 text-[11px] font-black tracking-widest uppercase">
                <Home className="w-3.5 h-3.5" />
                Tax Optimization
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.1]">
                Maximize your <span className="text-blue-600">HRA Savings</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                Calculate your tax-free House Rent Allowance under Section 10(13A) and optimize your salary structure for maximum benefits.
              </p>
            </div>
            
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
               <button className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/20">HRA Calculator</button>
               <Link href="/calculators/income-tax">
                 <button className="px-6 py-2.5 rounded-xl text-slate-600 font-bold text-sm transition-all hover:text-blue-600 hover:bg-blue-50">Tax Regime</button>
               </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Inputs */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-5 space-y-6"
            >
              {/* Input Card: Annual Basic Salary */}
              <motion.div variants={itemVariants} className="group p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-blue-900/5 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.02] blur-3xl group-hover:bg-blue-500/[0.05] transition-colors pointer-events-none" />
                
                <div className="flex justify-between items-center mb-8">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Basic Salary (Annual)
                  </label>
                  <div className="relative group/input">
                    <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 group-focus-within/input:border-blue-500 group-focus-within/input:bg-white transition-all">
                      <span className="text-blue-600 font-black mr-1.5 text-lg">₹</span>
                      <input 
                        type="text"
                        value={salary.toLocaleString('en-IN')}
                        onChange={(e) => setSalary(Number(e.target.value.replace(/[^0-9]/g, '')))}
                        className="bg-transparent border-none text-right font-black text-2xl text-slate-900 w-32 focus:outline-none focus:ring-0 p-0 tabular-nums"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <Slider 
                    value={[salary]} 
                    onValueChange={(v) => setSalary(v[0])} 
                    max={5000000} 
                    min={100000} 
                    step={10000} 
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-[0.1em] uppercase">
                    <span>Min ₹1L</span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">Annual Component</span>
                    <span>Max ₹50L</span>
                  </div>
                </div>
              </motion.div>

              {/* Input Card: Annual HRA Received */}
              <motion.div variants={itemVariants} className="group p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-blue-900/5 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] blur-3xl group-hover:bg-indigo-500/[0.05] transition-colors pointer-events-none" />
                
                <div className="flex justify-between items-center mb-8">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                    <IndianRupee className="w-4 h-4 text-indigo-600" />
                    HRA Received (Annual)
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 transition-all">
                    <span className="text-indigo-600 font-black mr-1.5 text-lg">₹</span>
                    <input 
                      type="text"
                      value={hra.toLocaleString('en-IN')}
                      onChange={(e) => setHra(Number(e.target.value.replace(/[^0-9]/g, '')))}
                      className="bg-transparent border-none text-right font-black text-2xl text-slate-900 w-32 focus:outline-none focus:ring-0 p-0 tabular-nums"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <Slider 
                    value={[hra]} 
                    onValueChange={(v) => setHra(v[0])} 
                    max={2000000} 
                    min={0} 
                    step={5000} 
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-[0.1em] uppercase">
                    <span>₹0</span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">Actual HRA</span>
                    <span>Max ₹20L</span>
                  </div>
                </div>
              </motion.div>

              {/* Input Card: Annual Rent Paid */}
              <motion.div variants={itemVariants} className="group p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-blue-900/5 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] blur-3xl group-hover:bg-emerald-500/[0.05] transition-colors pointer-events-none" />
                
                <div className="flex justify-between items-center mb-8">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                    <Percent className="w-4 h-4 text-emerald-600" />
                    Rent Paid (Annual)
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 transition-all">
                    <span className="text-emerald-600 font-black mr-1.5 text-lg">₹</span>
                    <input 
                      type="text"
                      value={rent.toLocaleString('en-IN')}
                      onChange={(e) => setRent(Number(e.target.value.replace(/[^0-9]/g, '')))}
                      className="bg-transparent border-none text-right font-black text-2xl text-slate-900 w-32 focus:outline-none focus:ring-0 p-0 tabular-nums"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <Slider 
                    value={[rent]} 
                    onValueChange={(v) => setRent(v[0])} 
                    max={2000000} 
                    min={0} 
                    step={5000} 
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-[0.1em] uppercase">
                    <span>₹0</span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">Total Rent</span>
                    <span>Max ₹20L</span>
                  </div>
                </div>
              </motion.div>

              {/* City Type Selector */}
              <motion.div variants={itemVariants} className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-blue-900/5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Location Type
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'metro', label: 'Metro', desc: '50% of Basic', sub: 'Mum, Del, Kol, Che' },
                    { id: 'non-metro', label: 'Non-Metro', desc: '40% of Basic', sub: 'Other Cities' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setCity(option.id as any)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${city === option.id ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-600/5' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-black uppercase tracking-wider ${city === option.id ? 'text-blue-700' : 'text-slate-600'}`}>{option.label}</span>
                        {city === option.id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <p className={`text-[10px] font-bold ${city === option.id ? 'text-blue-600' : 'text-slate-400'}`}>{option.desc}</p>
                      <p className="text-[9px] font-medium text-slate-400 mt-1">{option.sub}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Visualization & Results */}
            <div className="lg:col-span-7 space-y-8">
              {/* Main Result Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-1 rounded-[3rem] bg-white border border-slate-200 shadow-2xl shadow-blue-900/10 overflow-hidden"
              >
                <div className="bg-white rounded-[2.9rem] p-6 sm:p-10 relative">
                  <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Exempted HRA</p>
                      <AnimatePresence mode="wait">
                        <motion.p 
                          key={result.exemption}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tighter tabular-nums"
                        >
                          {formatCurrency(result.exemption)}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <CalculatorExport 
                      title="HRA Exemption Report"
                      data={{
                        "Annual Basic": salary,
                        "HRA Received": hra,
                        "Rent Paid": rent,
                        "City Type": city,
                        "Exempted HRA": result.exemption,
                        "Taxable HRA": result.taxableHRA,
                        "Potential Savings": result.exemption * 0.3
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-2xl">
                                    <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">{payload[0].name}</p>
                                    <p className="text-lg font-black text-slate-900">{formatCurrency(payload[0].value as number)}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Tax Savings Potential</p>
                        <p className="text-2xl font-black text-blue-700">{formatCurrency(result.exemption * 0.3)}</p>
                        <p className="text-[10px] font-bold text-blue-500 mt-1">*Assuming 30% tax bracket</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-500 flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            Exempt Portion
                          </span>
                          <span className="font-black text-slate-900">{formatCurrency(result.exemption)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-500 flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                            Taxable Portion
                          </span>
                          <span className="font-black text-slate-900">{formatCurrency(result.taxableHRA)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-10 border-t border-slate-100 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Actual HRA</p>
                      <p className="text-sm font-black text-slate-900">{formatCurrency(hra)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rent - 10% Sal</p>
                      <p className="text-sm font-black text-slate-900">{formatCurrency(result.breakdown.rentMinus10Percent)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{city === 'metro' ? '50%' : '40%'} Basic</p>
                      <p className="text-sm font-black text-slate-900">{formatCurrency(result.breakdown.cityAllowance)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-5">
                <Link href="/services/tax-filing" className="flex-1">
                  <button className="w-full group relative px-8 py-5 rounded-[2rem] bg-slate-950 text-white font-black text-lg transition-all hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-950/10">
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      File with Expert CA
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>
                </Link>
                <button className="flex-1 px-8 py-5 rounded-[2rem] bg-white border border-slate-200 text-slate-950 font-black text-lg transition-all hover:bg-slate-50 hover:border-blue-200 flex items-center justify-center gap-3 shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                  Audit Proofing
                </button>
              </div>
            </div>
          </div>

          {/* Deep Dive Section */}
          <div className="mt-32 space-y-24">
            {/* Features/Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 {
                   icon: <Zap className="w-6 h-6 text-blue-600" />,
                   title: "Section 10(13A)",
                   desc: "HRA exemption is calculated as the minimum of three limits defined under the Income Tax Act, 1961."
                 },
                 {
                   icon: <Building2 className="w-6 h-6 text-indigo-600" />,
                   title: "Metro vs Non-Metro",
                   desc: "Cities like Delhi, Mumbai, Kolkata, and Chennai qualify for a 50% basic salary limit, others are at 40%."
                 },
                 {
                   icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
                   title: "Document Ready",
                   desc: "Ensure you have rent receipts and the landlord's PAN (if rent > ₹1L) to claim the full benefit."
                 }
               ].map((feature, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                   className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-900/[0.03] transition-transform hover:-translate-y-1"
                 >
                   <div className="mb-8 p-4 rounded-2xl bg-slate-50 w-fit">{feature.icon}</div>
                   <h3 className="text-2xl font-black text-slate-950 mb-4 tracking-tight">{feature.title}</h3>
                   <p className="text-slate-600 leading-relaxed text-[15px] font-medium">{feature.desc}</p>
                 </motion.div>
               ))}
            </div>

            {/* The Math Section */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl font-black text-slate-950 tracking-tight leading-tight">
                  The HRA <br /><span className="text-blue-600">Exemption Rule</span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  The Income Tax department allows you to claim the **minimum** of the following three values as an exemption:
                </p>
                <div className="bg-slate-950 rounded-[2.5rem] p-10 border border-slate-800 font-mono text-sm relative overflow-hidden group shadow-2xl shadow-blue-900/20">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calculator className="w-16 h-16 text-white" />
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="pt-4 text-white font-bold text-lg">Min(HRA, Rent-10%Sal, 50%Sal)</div>
                    <div className="grid grid-cols-1 gap-y-4 text-slate-500 text-[13px] mt-6 border-t border-slate-800 pt-6">
                      <div className="flex gap-4"><span className="text-blue-400 font-black shrink-0">1.</span> Actual HRA received from employer</div>
                      <div className="flex gap-4"><span className="text-blue-400 font-black shrink-0">2.</span> Actual rent paid minus 10% of basic salary</div>
                      <div className="flex gap-4"><span className="text-blue-400 font-black shrink-0">3.</span> 50% (Metro) or 40% (Non-Metro) of basic salary</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-950 flex items-center gap-3 mb-4">
                  <HelpCircle className="w-7 h-7 text-blue-600" />
                  Expert Guide
                </h3>
                <div className="space-y-4">
                  {[
                    { q: "Is Landlord's PAN mandatory?", a: "Yes, if the total annual rent exceeds ₹1,00,000, providing the landlord's PAN is mandatory to claim HRA exemption." },
                    { q: "Can I pay rent to my parents?", a: "Yes, you can pay rent to your parents and claim HRA, but you must have a valid rent agreement and transfer the money through banking channels." },
                    { q: "What about the New Tax Regime?", a: "HRA exemption is NOT available under the New Tax Regime (Section 115BAC). It is only applicable in the Old Tax Regime." }
                  ].map((faq, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-default shadow-sm">
                      <h4 className="font-black text-slate-950 mb-3 text-lg tracking-tight">{faq.q}</h4>
                      <p className="text-[15px] font-medium text-slate-600 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategy Card */}
            <div className="bg-emerald-50 rounded-[2.5rem] p-12 border border-emerald-100">
                <div className="flex flex-col md:flex-row items-start gap-8">
                   <div className="w-16 h-16 rounded-3xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200">
                      <TrendingDown className="w-8 h-8" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Optimization Strategy: The Sweet Spot</h3>
                      <p className="text-lg text-slate-600 leading-relaxed mb-8 font-medium italic">
                         "To maximize your HRA benefit, your annual rent should ideally be equal to [Annual HRA + 10% of Basic Salary]. 
                         Any rent paid above this limit does not yield additional tax savings."
                      </p>
                      <div className="flex flex-wrap gap-4">
                         <Link href="/auth/register">
                           <Button className="bg-slate-950 text-white rounded-xl font-bold px-8 h-12 shadow-xl shadow-slate-900/10">Consult a Tax Planner</Button>
                         </Link>
                         <Link href="/calculators/income-tax">
                           <Button variant="ghost" className="text-emerald-700 font-bold">Compare Old vs New Regime →</Button>
                         </Link>
                      </div>
                   </div>
                </div>
              </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="border-t border-slate-200 bg-white py-16 px-4 text-center">
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-4xl mx-auto leading-loose">
             Disclaimer: HRA exemption is subject to conditions under Section 10(13A). Please ensure you maintain valid documentation including rent receipts and agreements. Past filings are not a guarantee of future exemptions. MyeCA.in provides tools for educational purposes only.
           </p>
        </div>
      </div>
    </>
  );
}
